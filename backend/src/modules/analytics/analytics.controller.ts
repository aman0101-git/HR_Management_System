import { Request, Response, NextFunction } from "express";
import { db } from "../../config/db.js";
import { RowDataPacket } from "mysql2/promise";

interface UserPayload {
  id: number;
  role: string;
  username: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const getDashboardAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;
  const role = authReq.user?.role;

  if (!userId || !role) {
    res.status(401).json({ error: "Unauthorized: User data missing" });
    return;
  }

  // 1. Role-Based Scoping
  // If the user is an HR, they only see their own data. Admins/Supervisors see everything.
  const isAgent = role === 'HR';
  
  // Scopes for queries
  const candidateScope = isAgent ? `WHERE c.created_by = ${db.escape(userId)}` : "";
  const callScope = isAgent ? `WHERE cl.hr_id = ${db.escape(userId)}` : "";
  const callScopeWithDate = isAgent 
    ? `WHERE cl.hr_id = ${db.escape(userId)} AND DATE(cl.call_time) = CURDATE()` 
    : `WHERE DATE(cl.call_time) = CURDATE()`;

  try {
    // 2. Define our Highly-Optimized SQL Queries
    
    // KPI 1: Active Leads & Hires MTD
    const kpiQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id, created_at,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT 
        CAST(SUM(CASE WHEN sm.is_final_stage = 0 THEN 1 ELSE 0 END) AS SIGNED) as total_active_leads,
        CAST(SUM(CASE WHEN sm.status_name = 'Selected-Joined' AND MONTH(ls.created_at) = MONTH(CURDATE()) AND YEAR(ls.created_at) = YEAR(CURDATE()) THEN 1 ELSE 0 END) AS SIGNED) as hires_mtd
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      ${candidateScope}
    `;

    // KPI 2: Call Stats for Today
    const callStatsQuery = `
      SELECT 
        COUNT(*) as total_calls_today,
        CAST(SUM(CASE WHEN call_result = 'Connected' THEN 1 ELSE 0 END) AS SIGNED) as connected_calls_today
      FROM call_logs cl
      ${callScopeWithDate}
    `;

    // Chart 1: Pipeline Funnel (Count by Active Stage)
    const pipelineFunnelQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT sm.status_name, COUNT(c.id) as count
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      WHERE sm.is_final_stage = 0 
      ${isAgent ? `AND c.created_by = ${db.escape(userId)}` : ""}
      GROUP BY sm.id, sm.status_name
      ORDER BY sm.stage_order ASC
    `;

    // Chart 2: Call Outcomes (Last 30 Days)
    const callOutcomesQuery = `
      SELECT call_result, COUNT(*) as count
      FROM call_logs cl
      WHERE cl.call_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ${isAgent ? `AND cl.hr_id = ${db.escape(userId)}` : ""}
      GROUP BY call_result
    `;

    // Chart 3: Source ROI (Where are the best candidates coming from?)
    const sourceRoiQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT 
        c.source, 
        COUNT(c.id) as total_leads,
        CAST(SUM(CASE WHEN sm.status_name = 'Selected-Joined' THEN 1 ELSE 0 END) AS SIGNED) as total_hired
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      ${candidateScope}
      GROUP BY c.source
      ORDER BY total_leads DESC
    `;

    // 3. Execute all queries CONCURRENTLY using Promise.all
    // This ensures the API responds in milliseconds, not seconds.
    const [
      [kpiRows],
      [callStatsRows],
      [pipelineRows],
      [callOutcomesRows],
      [sourceRows]
    ] = await Promise.all([
      db.execute<RowDataPacket[]>(kpiQuery),
      db.execute<RowDataPacket[]>(callStatsQuery),
      db.execute<RowDataPacket[]>(pipelineFunnelQuery),
      db.execute<RowDataPacket[]>(callOutcomesQuery),
      db.execute<RowDataPacket[]>(sourceRoiQuery)
    ]);

    // 4. Construct the structured JSON response
    res.status(200).json({
      kpis: {
        totalActiveLeads: kpiRows[0]?.total_active_leads || 0,
        hiresMtd: kpiRows[0]?.hires_mtd || 0,
        totalCallsToday: callStatsRows[0]?.total_calls_today || 0,
        connectedCallsToday: callStatsRows[0]?.connected_calls_today || 0,
      },
      charts: {
        pipelineFunnel: pipelineRows,
        callOutcomes: callOutcomesRows,
        sourceRoi: sourceRows
      }
    });

  } catch (error: any) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({ error: "Internal server error while fetching analytics." });
  }
};