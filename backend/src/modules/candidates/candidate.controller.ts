import { Request, Response, NextFunction } from "express";
import { db } from "../../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface UserPayload {
  id: number;
  role: string;
  username: string; 
}

interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const addCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
  const authReq = req as AuthenticatedRequest;

  const {
    first_name, last_name, phone, email, qualification, passing_year, profile, 
    experience_level, current_company, current_designation, current_ctc, 
    expected_ctc, current_location, preferred_location, ready_to_relocate, 
    notice_period, available_from, source, resume_url, remark
  } = req.body;

  const created_by = authReq.user?.id; 

  if (!created_by) {
    res.status(401).json({ error: "Unauthorized: User ID missing" });
    return;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check for duplicate phone number
    const [existing] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM candidates WHERE phone = ?",
      [phone]
    );

    if (existing.length > 0) {
      await connection.rollback();
      res.status(400).json({ error: "A candidate with this phone number already exists." });
      return;
    }

    const parsedCurrentCtc = current_ctc ? parseFloat(current_ctc) : null;
    const parsedExpectedCtc = expected_ctc ? parseFloat(expected_ctc) : null;
    const parsedPassingYear = passing_year ? parseInt(passing_year, 10) : null;
    const parsedAvailableFrom = available_from ? available_from : null;

    const [candidateResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO candidates 
      (first_name, last_name, phone, email, qualification, passing_year, profile, experience_level, 
       current_company, current_designation, current_ctc, expected_ctc, current_location, 
       preferred_location, ready_to_relocate, notice_period, available_from, source, 
       resume_url, remark, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, phone, email || null, qualification || null, parsedPassingYear,
        profile || null, experience_level || 'Fresher', current_company || null,
        current_designation || null, parsedCurrentCtc, parsedExpectedCtc, current_location || null,
        preferred_location || null, ready_to_relocate || 'Yes', notice_period || 'Immediate',
        parsedAvailableFrom, source || 'Work India', resume_url || null, remark || null, created_by
      ]
    );

    const newCandidateId = candidateResult.insertId;

    // Calculate tomorrow's date for the default follow-up
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    await connection.execute<ResultSetHeader>(
      `INSERT INTO lead_status_history 
      (candidate_id, status_id, remarks, follow_up_date, updated_by) 
      VALUES (?, ?, ?, ?, ?)`,
      [newCandidateId, 1, "System: Lead Created", tomorrowFormatted, created_by]
    );

    await connection.commit();
    res.status(201).json({ message: "Candidate added successfully", candidateId: newCandidateId });

  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding candidate:", error);
    res.status(500).json({ error: "Internal server error while adding candidate." });
  } finally {
    connection.release();
  }
};

export const getMyLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const created_by = authReq.user?.id;

  if (!created_by) {
    res.status(401).json({ error: "Unauthorized: User ID missing" });
    return;
  }

  // Extract query parameters with defaults
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const tab = (req.query.tab as string) || 'action_required';
  const statusFilter = (req.query.status as string) || '';
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch Global KPIs (Stats) natively in SQL
    const statsQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id, follow_up_date, created_at as last_update_time,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT 
        CAST(SUM(CASE WHEN sm.is_final_stage = 0 THEN 1 ELSE 0 END) AS SIGNED) as totalActive,
        CAST(SUM(CASE WHEN sm.is_final_stage = 0 AND ls.follow_up_date < CURDATE() THEN 1 ELSE 0 END) AS SIGNED) as overdue,
        CAST(SUM(CASE WHEN sm.is_final_stage = 0 AND ls.follow_up_date = CURDATE() THEN 1 ELSE 0 END) AS SIGNED) as todayCalls,
        CAST(SUM(CASE WHEN sm.is_final_stage = 0 AND ls.follow_up_date > CURDATE() THEN 1 ELSE 0 END) AS SIGNED) as upcoming,
        CAST(SUM(CASE WHEN sm.is_final_stage = 1 THEN 1 ELSE 0 END) AS SIGNED) as closedTotal,
        CAST(SUM(CASE WHEN sm.status_name LIKE '%Joined%' THEN 1 ELSE 0 END) AS SIGNED) as selected
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      WHERE c.created_by = ?
    `;
    const [statsRows] = await db.execute<RowDataPacket[]>(statsQuery, [created_by]);
    const stats = statsRows[0];

    // 2. Build Dynamic WHERE Clause for the paginated table
    let whereClause = "WHERE c.created_by = ?";
    const queryParams: any[] = [created_by];

    if (tab === 'action_required') {
      whereClause += " AND sm.is_final_stage = 0 AND ls.follow_up_date <= CURDATE()";
    } else if (tab === 'upcoming') {
      whereClause += " AND sm.is_final_stage = 0 AND ls.follow_up_date > CURDATE()";
    } else if (tab === 'closed') {
      whereClause += " AND sm.is_final_stage = 1";
    }

    if (tab === 'action_required') {
      whereClause += " AND sm.is_final_stage = 0 AND ls.follow_up_date <= CURDATE()";
    } else if (tab === 'upcoming') {
      whereClause += " AND sm.is_final_stage = 0 AND ls.follow_up_date > CURDATE()";
    } else if (tab === 'closed') {
      whereClause += " AND sm.is_final_stage = 1";
    }

    if (statusFilter) {
      whereClause += " AND sm.status_name = ?";
      queryParams.push(statusFilter);
    }

    if (search) {
      whereClause += " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone LIKE ?)";
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam);
    }

    // 3. Get Total Records Count (for determining total pages)
    const countQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id, follow_up_date, created_at as last_update_time,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT COUNT(*) as total
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      ${whereClause}
    `;
    const [countRows] = await db.execute<RowDataPacket[]>(countQuery, queryParams);
    const totalRecords = countRows[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // 4. Fetch the specific slice of Data
    const dataQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id, follow_up_date, created_at as last_update_time,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT 
        c.id, c.first_name, c.last_name, c.phone, 
        sm.status_name, sm.is_final_stage, 
        ls.follow_up_date, ls.last_update_time
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      ${whereClause}
      ORDER BY ls.last_update_time DESC
      LIMIT ? OFFSET ?
    `;
    
    // Using db.query instead of db.execute because prepared statements sometimes reject LIMIT/OFFSET as strings
    queryParams.push(limit, offset);
    const [leadsRows] = await db.query<RowDataPacket[]>(dataQuery, queryParams);

    res.status(200).json({ 
      stats,
      pagination: { totalRecords, totalPages, currentPage: page, limit },
      leads: leadsRows 
    });

  } catch (error: any) {
    console.error("Error fetching my leads:", error);
    res.status(500).json({ error: "Internal server error while fetching leads." });
  }
};

export const getStatuses = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.execute(
      "SELECT id, status_name, stage_order, is_final_stage FROM status_master WHERE is_active = 1 ORDER BY stage_order ASC"
    );
    res.status(200).json({ statuses: rows });
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ error: "Internal server error while fetching statuses." });
  }
};

export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.id;
  const authReq = req as AuthenticatedRequest;
  const hrId = authReq.user?.id;

  if (!hrId) {
    res.status(401).json({ error: "Unauthorized: User ID missing" });
    return;
  }

  try {
    const [candidateRows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM candidates WHERE id = ? AND created_by = ?",
      [candidateId, hrId]
    );

    if (candidateRows.length === 0) {
      res.status(404).json({ error: "Candidate not found or unauthorized access." });
      return;
    }

    const [historyRows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        h.id, h.remarks, h.follow_up_date, h.created_at,
        s.status_name, s.is_final_stage, s.stage_order
      FROM lead_status_history h
      JOIN status_master s ON h.status_id = s.id
      WHERE h.candidate_id = ?
      ORDER BY h.created_at DESC`,
      [candidateId]
    );

    res.status(200).json({
      candidate: candidateRows[0],
      timeline: historyRows
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const appendCandidateStatus = async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.id;
  const { status_id, remarks, follow_up_date } = req.body;
  const authReq = req as AuthenticatedRequest;
  const updated_by = authReq.user?.id;

  if (!status_id || !remarks) {
    res.status(400).json({ error: "Status and remarks are strictly required." });
    return;
  }

  try {
    // INDUSTRY STANDARD FIX: Prevent backend bypass. 
    // Check if the candidate's CURRENT status is already a terminal stage.
    const [currentStatus] = await db.execute<RowDataPacket[]>(
      `SELECT s.is_final_stage 
       FROM lead_status_history h
       JOIN status_master s ON h.status_id = s.id
       WHERE h.candidate_id = ?
       ORDER BY h.created_at DESC LIMIT 1`,
      [candidateId]
    );

    if (currentStatus.length > 0 && currentStatus[0].is_final_stage === 1) {
      res.status(403).json({ error: "Action Denied: This candidate profile is locked in a final stage." });
      return;
    }

    // If safe, append the new status logic directly into history
    await db.execute<ResultSetHeader>(
      `INSERT INTO lead_status_history 
      (candidate_id, status_id, remarks, follow_up_date, updated_by) 
      VALUES (?, ?, ?, ?, ?)`,
      [candidateId, status_id, remarks, follow_up_date || null, updated_by]
    );

    res.status(201).json({ message: "Timeline updated successfully." });
  } catch (error) {
    console.error("Error appending candidate status:", error);
    res.status(500).json({ error: "Internal server error while updating status." });
  }
};

// --- CALL LOGGING CONTROLLERS ---

export const logCall = async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.id;
  const { call_result, call_duration, notes } = req.body;
  const authReq = req as AuthenticatedRequest;
  const hr_id = authReq.user?.id;

  if (!hr_id) {
    res.status(401).json({ error: "Unauthorized: User ID missing" });
    return;
  }

  // Strict validation against your DB ENUM to prevent bad data
  const validCallResults = ['Connected', 'Not Connected', 'Switched Off', 'Ringing', 'Busy'];
  if (!call_result || !validCallResults.includes(call_result)) {
    res.status(400).json({ error: "Invalid or missing call result." });
    return;
  }

  try {
    await db.execute<ResultSetHeader>(
      `INSERT INTO call_logs 
      (hr_id, candidate_id, call_result, call_duration, notes) 
      VALUES (?, ?, ?, ?, ?)`,
      [hr_id, candidateId, call_result, call_duration || null, notes || null]
    );

    res.status(201).json({ message: "Call logged successfully." });
  } catch (error) {
    console.error("Error logging call:", error);
    res.status(500).json({ error: "Internal server error while logging call." });
  }
};

export const getCandidateCallLogs = async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.id;

  try {
    // Joining with users table so the UI can display which agent made the call
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        c.id, c.call_result, c.call_duration, c.notes, c.call_time, 
        u.first_name, u.last_name 
       FROM call_logs c
       JOIN users u ON c.hr_id = u.id
       WHERE c.candidate_id = ?
       ORDER BY c.call_time DESC`,
      [candidateId]
    );

    res.status(200).json({ callLogs: rows });
  } catch (error) {
    console.error("Error fetching call logs:", error);
    res.status(500).json({ error: "Internal server error while fetching call logs." });
  }
};

export const logInteraction = async (req: Request, res: Response): Promise<void> => {
  const candidateId = req.params.id;
  
  const { 
    status_id, 
    remarks, 
    follow_up_date, 
    log_call,      
    call_result   
  } = req.body;

  const authReq = req as AuthenticatedRequest;
  const hrId = authReq.user?.id;

  if (!hrId) {
    res.status(401).json({ error: "Unauthorized: User ID missing" });
    return;
  }

  // LOGIC: It is a pipeline update IF they didn't make a call OR if the call connected.
  const isPipelineUpdate = !log_call || (log_call && call_result === 'Connected');

  // 1. Strict Validation
  if (isPipelineUpdate && !remarks) {
    res.status(400).json({ error: "Remarks/Notes are strictly required for connected calls and pipeline updates." });
    return;
  }

  if (isPipelineUpdate && !status_id) {
    res.status(400).json({ error: "Pipeline status is required for connected calls." });
    return;
  }

  if (log_call) {
    const validCallResults = ['Connected', 'Not Connected', 'Switched Off', 'Ringing', 'Busy'];
    if (!call_result || !validCallResults.includes(call_result)) {
      res.status(400).json({ error: "Invalid or missing call result." });
      return;
    }
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 2. Process Pipeline Update (Only if Connected or manual update)
    if (isPipelineUpdate) {
      const [currentStatus] = await connection.execute<RowDataPacket[]>(
        `SELECT s.is_final_stage 
         FROM lead_status_history h
         JOIN status_master s ON h.status_id = s.id
         WHERE h.candidate_id = ?
         ORDER BY h.created_at DESC LIMIT 1`,
        [candidateId]
      );

      if (currentStatus.length > 0 && currentStatus[0].is_final_stage === 1) {
        await connection.rollback();
        res.status(403).json({ error: "Action Denied: This candidate profile is locked." });
        return;
      }

      await connection.execute<ResultSetHeader>(
        `INSERT INTO lead_status_history 
        (candidate_id, status_id, remarks, follow_up_date, updated_by) 
        VALUES (?, ?, ?, ?, ?)`,
        [candidateId, status_id, remarks, follow_up_date || null, hrId]
      );
    }

    // 3. Process Call Log
    if (log_call) {
      await connection.execute<ResultSetHeader>(
        `INSERT INTO call_logs 
        (hr_id, candidate_id, call_result, call_duration, notes) 
        VALUES (?, ?, ?, NULL, ?)`, 
        [hrId, candidateId, call_result, remarks || null] 
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Interaction logged successfully." });

  } catch (error: any) {
    await connection.rollback();
    console.error("Error logging interaction:", error);
    res.status(500).json({ error: "Internal server error while logging interaction." });
  } finally {
    connection.release();
  }
};