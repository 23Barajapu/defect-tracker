import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('project_id');

  try {
    let modules;
    if (projectId) {
      modules = await query('SELECT id, project_id, module_name FROM modules WHERE project_id = ? ORDER BY module_name ASC', [projectId]);
    } else {
      modules = await query('SELECT id, project_id, module_name FROM modules ORDER BY module_name ASC');
    }
    return NextResponse.json({ success: true, data: modules });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
