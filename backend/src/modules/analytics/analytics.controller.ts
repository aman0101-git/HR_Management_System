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
  const isAgent = role === 'HR';
  const candidateScope = isAgent ? `AND c.created_by = ${db.escape(userId)}` : "";
  const callScopeAgent = isAgent ? `AND cl.hr_id = ${db.escape(userId)}` : "";

  // 2. Extract Frontend Query Params
  const filter = (req.query.filter as string) || 'this_month';
  const start = req.query.start as string;
  const end = req.query.end as string;

  // 3. Dynamic SQL Date Filter Generator
  // This helper builds the exact WHERE clause snippet based on the selected timeframe
  const getDateCondition = (columnName: string): string => {
    switch (filter) {
      case 'today':
        return `DATE(${columnName}) = CURDATE()`;
      case 'yesterday':
        return `DATE(${columnName}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
      case 'this_week':
        // The ', 1' argument strictly enforces Monday as the first day of the week
        return `YEARWEEK(${columnName}, 1) = YEARWEEK(CURDATE(), 1)`;
      case 'this_month':
        return `YEAR(${columnName}) = YEAR(CURDATE()) AND MONTH(${columnName}) = MONTH(CURDATE())`;
      case 'custom':
        if (start && end) {
          // Prevent SQL injection by escaping the user-provided dates
          return `DATE(${columnName}) BETWEEN ${db.escape(start)} AND ${db.escape(end)}`;
        }
        return "1=1"; // Fallback if dates are missing
      default:
        return `YEAR(${columnName}) = YEAR(CURDATE()) AND MONTH(${columnName}) = MONTH(CURDATE())`;
    }
  };

  try {
    // 4. Define our Highly-Optimized SQL Queries

    // KPI 1: Active Leads (Always a live snapshot) & Hires (Filtered by date)
    const kpiQuery = `
      WITH LatestStatus AS (
        SELECT candidate_id, status_id, created_at,
        ROW_NUMBER() OVER(PARTITION BY candidate_id ORDER BY created_at DESC) as rn
        FROM lead_status_history
      )
      SELECT 
        CAST(SUM(CASE WHEN sm.is_final_stage = 0 THEN 1 ELSE 0 END) AS SIGNED) as total_active_leads,
        CAST(SUM(CASE WHEN sm.status_name = 'Selected-Joined' AND ${getDateCondition('ls.created_at')} THEN 1 ELSE 0 END) AS SIGNED) as hires_mtd
      FROM candidates c
      INNER JOIN LatestStatus ls ON c.id = ls.candidate_id AND ls.rn = 1
      INNER JOIN status_master sm ON ls.status_id = sm.id
      WHERE 1=1 ${candidateScope}
    `;

    // KPI 2: Call Stats (Filtered by Date)
    const callStatsQuery = `
      SELECT 
        COUNT(*) as total_calls_today,
        CAST(SUM(CASE WHEN call_result = 'Connected' THEN 1 ELSE 0 END) AS SIGNED) as connected_calls_today
      FROM call_logs cl
      WHERE ${getDateCondition('cl.call_time')} ${callScopeAgent}
    `;

    // Chart 1: Pipeline Funnel 
    // Note: Business logic dictates the funnel should show the CURRENT live pipeline, 
    // not historical stages, so we don't apply the date filter here.
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
      WHERE sm.is_final_stage = 0 ${candidateScope}
      GROUP BY sm.id, sm.status_name
      ORDER BY sm.stage_order ASC
    `;

    // Chart 2: Call Outcomes (Filtered by Date)
    const callOutcomesQuery = `
      SELECT call_result, COUNT(*) as count
      FROM call_logs cl
      WHERE ${getDateCondition('cl.call_time')} ${callScopeAgent}
      GROUP BY call_result
    `;

    // Chart 3: Source ROI (Filtered by Candidate Creation Date)
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
      WHERE ${getDateCondition('c.created_at')} ${candidateScope}
      GROUP BY c.source
      ORDER BY total_leads DESC
    `;

    // 5. Execute all queries CONCURRENTLY
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

    // 6. Construct the structured JSON response
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