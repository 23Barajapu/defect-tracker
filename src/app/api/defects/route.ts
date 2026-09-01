import { NextResponse } from 'next/server';
import { query, getDb } from '@/lib/db';
import { Security } from '@/lib/security';
import { getSession, hasRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('client_id');
  const status = searchParams.get('status');
  const severity = searchParams.get('severity');
  const search = searchParams.get('search');

  try {
    let sql = `
      SELECT d.*, 
             m.module_name, 
             p.name as project_name, p.platform, 
             c.id as client_id, c.client_name, c.client_code,
             u_qc.name as qc_name,
             u_dev.name as dev_name
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
    if (status) {
      sql += ' AND d.status = ?';
      params.push(status);
    }
    if (severity) {
      sql += ' AND d.severity = ?';
      params.push(severity);
    }
    if (search) {
      sql += ' AND (d.ticket_number LIKE ? OR d.title LIKE ? OR d.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY d.id DESC';

    const defects = await query(sql, params);
    return NextResponse.json({ success: true, data: defects });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session || !hasRole(session, ['QC', 'LEAD', 'PM'])) {
    return NextResponse.json({ success: false, message: 'Hanya QC atau Lead/PM yang dapat membuat tiket defect' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      module_id,
      title,
      description,
      severity = 'Medium',
      environment = 'SIT',
      steps_to_reproduce,
      expected_result,
      actual_result,
      payload_log,
      dev_id,
    } = body;

    if (!module_id || !title || !description) {
      return NextResponse.json({ success: false, message: 'Modul, judul, dan deskripsi wajib diisi' }, { status: 400 });
    }

    // Masking data sensitif otomatis (PCI-DSS PAN, PIN, CVV)
    const maskedPayload = Security.maskSensitiveData(payload_log);

    const pool = getDb();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Dapatkan kode bank klien
      const [modRows]: any = await connection.execute(
        `SELECT c.client_code 
         FROM modules m 
         JOIN projects p ON m.project_id = p.id 
         JOIN clients c ON p.client_id = c.id 
         WHERE m.id = ?`,
        [module_id]
      );
      const clientCode = modRows[0]?.client_code || 'DEF';

      // Hitung sequence nomor tiket
      const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
      const [countRows]: any = await connection.execute('SELECT COUNT(*) as total FROM defects');
      const seq = String(countRows[0].total + 1).padStart(3, '0');
      const ticketNumber = `DEF-${clientCode}-${yearMonth}-${seq}`;

      // Insert defect
      const [defectRes]: any = await connection.execute(
        `INSERT INTO defects 
         (ticket_number, module_id, title, description, severity, environment, steps_to_reproduce, expected_result, actual_result, payload_log, status, dev_id, qc_id, reopen_count, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, 0, NOW(), NOW())`,
        [
          ticketNumber,
          module_id,
          title,
          description,
          severity,
          environment,
          steps_to_reproduce || null,
          expected_result || null,
          actual_result || null,
          maskedPayload || null,
          dev_id || null,
          session.id,
        ]
      );
      const defectId = defectRes.insertId;

      // Insert Initial Activity
      await connection.execute(
        `INSERT INTO defect_activities (defect_id, user_id, from_status, to_status, notes, created_at) 
         VALUES (?, ?, NULL, 'Open', ?, NOW())`,
        [defectId, session.id, `Defect baru dilaporkan dengan severity ${severity}`]
      );

      // Notifikasi ke Developer jika ditugaskan
      if (dev_id) {
        await connection.execute(
          `INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) 
           VALUES (?, ?, 'Defect Baru Ditugaskan', ?, 'new_defect', 0, NOW())`,
          [dev_id, defectId, `${session.name} menugaskan tiket ${ticketNumber} (${severity}): ${title}`]
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true, defectId, ticketNumber });
    } catch (dbErr) {
      await connection.rollback();
      throw dbErr;
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
