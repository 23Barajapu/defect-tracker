import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const defectId = params.id;

  try {
    const defects = await query<any[]>(
      `SELECT d.*, 
              m.module_name, 
              p.name as project_name, p.platform, 
              c.id as client_id, c.client_name, c.client_code,
              u_qc.name as qc_name, u_qc.email as qc_email,
              u_dev.name as dev_name, u_dev.email as dev_email
       FROM defects d
       JOIN modules m ON d.module_id = m.id
       JOIN projects p ON m.project_id = p.id
       JOIN clients c ON p.client_id = c.id
       JOIN users u_qc ON d.qc_id = u_qc.id
       LEFT JOIN users u_dev ON d.dev_id = u_dev.id
       WHERE d.id = ?`,
      [defectId]
    );

    if (!defects || defects.length === 0) {
      return NextResponse.json({ success: false, message: 'Defect tidak ditemukan' }, { status: 404 });
    }

    // Ambil riwayat audit
    const activities = await query(
      `SELECT a.*, u.name as user_name, u.role as user_role 
       FROM defect_activities a
       JOIN users u ON a.user_id = u.id
       WHERE a.defect_id = ?
       ORDER BY a.id ASC`,
      [defectId]
    );

    // Ambil daftar developer untuk reassign
    const developers = await query('SELECT id, name, email FROM users WHERE role = "DEVELOPER" ORDER BY name ASC');

    return NextResponse.json({
      success: true,
      data: {
        ...defects[0],
        activities,
        developers,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
