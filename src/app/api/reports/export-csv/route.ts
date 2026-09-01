import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('client_id');

  try {
    let sql = `
      SELECT d.ticket_number, c.client_name, p.name as project_name, m.module_name,
             d.title, d.severity, d.environment, d.status, d.reopen_count,
             u_qc.name as qc_name, u_dev.name as dev_name, d.created_at, d.updated_at
      FROM defects d
      JOIN modules m ON d.module_id = m.id
      JOIN projects p ON m.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      JOIN users u_qc ON d.qc_id = u_qc.id
      LEFT JOIN users u_dev ON d.dev_id = u_dev.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (clientId) {
      sql += ' AND c.id = ?';
      params.push(clientId);
    }
    sql += ' ORDER BY d.id DESC';

    const rows: any = await query(sql, params);

    const headers = ['Ticket Number', 'Bank Klien', 'Project', 'Module', 'Judul Defect', 'Severity', 'Environment', 'Status', 'Reopen Count', 'QC Reporter', 'Dev PIC', 'Created At', 'Updated At'];
    const csvLines = [headers.join(',')];

    rows.forEach((r: any) => {
      const line = [
        `"${r.ticket_number}"`,
        `"${r.client_name}"`,
        `"${r.project_name}"`,
        `"${r.module_name}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${r.severity}"`,
        `"${r.environment}"`,
        `"${r.status}"`,
        r.reopen_count,
        `"${r.qc_name}"`,
        `"${r.dev_name || '-'}"`,
        `"${new Date(r.created_at).toISOString()}"`,
        `"${new Date(r.updated_at).toISOString()}"`,
      ];
      csvLines.push(line.join(','));
    });

    const csvContent = '\uFEFF' + csvLines.join('\n'); // UTF-8 BOM

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Defect_Report_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return new Response('Error exporting CSV: ' + err.message, { status: 500 });
  }
}
