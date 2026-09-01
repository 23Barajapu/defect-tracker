import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('client_id');

  try {
    let projects;
    if (clientId) {
      projects = await query('SELECT id, client_id, name, platform FROM projects WHERE client_id = ? ORDER BY name ASC', [clientId]);
    } else {
      projects = await query('SELECT id, client_id, name, platform FROM projects ORDER BY name ASC');
    }
    return NextResponse.json({ success: true, data: projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
