import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const clients = await query('SELECT id, client_name, client_code, status FROM clients ORDER BY client_name ASC');
    return NextResponse.json({ success: true, data: clients });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
