import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const clientId = searchParams.get('client_id');

  try {
    // 1. Ringkasan Metrik Harian
    const today = new Date().toISOString().slice(0, 10);
    const newOpenTodayRes: any = await query('SELECT COUNT(*) as total FROM defects WHERE DATE(created_at) = ?', [today]);
    const readyForRetestRes: any = await query('SELECT COUNT(*) as total FROM defects WHERE status = "Retesting"');
    const reopenedTodayRes: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Re-open" AND DATE(created_at) = ?', [today]);
    const closedTodayRes: any = await query('SELECT COUNT(*) as total FROM defect_activities WHERE to_status = "Close" AND DATE(created_at) = ?', [today]);
    const totalOutstandingRes: any = await query('SELECT COUNT(*) as total FROM defects WHERE status IN ("Open", "Retesting", "Re-open")');

    // 2. Status Counts Total
    const statusRows: any = await query('SELECT status, COUNT(*) as total FROM defects GROUP BY status');
    const statusCounts: Record<string, number> = { Open: 0, Retesting: 0, 'Re-open': 0, Close: 0 };
    statusRows.forEach((r: any) => {
      statusCounts[r.status] = Number(r.total);
    });

    // 3. Severity Counts Total
    const severityRows: any = await query('SELECT severity, COUNT(*) as total FROM defects WHERE status != "Close" GROUP BY severity');
    const severityCounts: Record<string, number> = { Blocker: 0, High: 0, Medium: 0, Low: 0 };
    severityRows.forEach((r: any) => {
      severityCounts[r.severity] = Number(r.total);
    });

    // 4. Multi-Bank Stats
    const clientStats: any = await query(`
      SELECT c.id, c.client_name, c.client_code,
             SUM(CASE WHEN d.status = 'Open' THEN 1 ELSE 0 END) as count_open,
             SUM(CASE WHEN d.status = 'Retesting' THEN 1 ELSE 0 END) as count_retesting,
             SUM(CASE WHEN d.status = 'Re-open' THEN 1 ELSE 0 END) as count_reopen,
             SUM(CASE WHEN d.status = 'Close' THEN 1 ELSE 0 END) as count_close,
             COUNT(d.id) as total_defects
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id
      LEFT JOIN modules m ON p.id = m.project_id
      LEFT JOIN defects d ON m.id = d.module_id
      GROUP BY c.id, c.client_name, c.client_code
      ORDER BY total_defects DESC
    `);

    // 5. Recent Activities
    const recentActivities: any = await query(`
      SELECT a.*, d.ticket_number, d.title as defect_title, u.name as user_name, u.role as user_role
      FROM defect_activities a
      JOIN defects d ON a.defect_id = d.id
      JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC LIMIT 8
    `);

    // 6. Selected Date Defects for Report Cutoff
    let reportSql = `
      SELECT d.*, m.module_name, p.name as project_name, p.platform, c.client_name, c.client_code,
             u_qc.name as qc_name, u_dev.name as dev_name
      FROM defects d
      JOIN modules m ON d.module_id = m.id
      JOIN projects p ON m.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      JOIN users u_qc ON d.qc_id = u_qc.id
      LEFT JOIN users u_dev ON d.dev_id = u_dev.id
      WHERE (DATE(d.created_at) = ? OR DATE(d.updated_at) = ?)
    `;
    const reportParams: any[] = [date, date];

    if (clientId) {
      reportSql += ' AND c.id = ?';
      reportParams.push(clientId);
    }
    reportSql += ' ORDER BY c.client_name ASC, d.id DESC';

    const reportDefects = await query(reportSql, reportParams);

    return NextResponse.json({
      success: true,
      metrics: {
        newOpenToday: Number(newOpenTodayRes[0]?.total || 0),
        readyForRetest: Number(readyForRetestRes[0]?.total || 0),
        reopenedToday: Number(reopenedTodayRes[0]?.total || 0),
        closedToday: Number(closedTodayRes[0]?.total || 0),
        totalOutstanding: Number(totalOutstandingRes[0]?.total || 0),
      },
      statusCounts,
      severityCounts,
      clientStats,
      recentActivities,
      reportDefects,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
