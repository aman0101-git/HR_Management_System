import { Request, Response } from "express";
import { db } from "../../config/db.js";
import { ResultSetHeader } from "mysql2/promise";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string; username: string };
}

export const logCall = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const hr_id = authReq.user?.id;
  const { candidate_id, call_result, call_duration, notes } = req.body;

  if (!hr_id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // 1. Insert into call_logs
    await db.execute<ResultSetHeader>(
      `INSERT INTO call_logs (hr_id, candidate_id, call_result, call_duration, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [hr_id, candidate_id, call_result, call_duration || null, notes || null]
    );

    // 2. We can automatically append a status note to the timeline to reflect the call attempt
    await db.execute<ResultSetHeader>(
      `INSERT INTO lead_status_history (candidate_id, status_id, remarks, updated_by) 
       VALUES (?, (SELECT status_id FROM lead_status_history WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 1), ?, ?)`,
      [candidate_id, candidate_id, `Call Logged: ${call_result} - ${notes || 'No notes'}`, hr_id]
    );

    res.status(201).json({ message: "Call logged successfully." });
  } catch (error: any) {
    console.error("Error logging call:", error);
    res.status(500).json({ error: "Internal server error while logging call." });
  }
};