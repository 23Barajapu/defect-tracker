import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ success: true, count: 0, data: [] });
  }

  try {
    const items = await query(
      `SELECT n.*, d.ticket_number 
       FROM notifications n 
       JOIN defects d ON n.defect_id = d.id 
       WHERE n.user_id = ? AND n.is_read = 0 
       ORDER BY n.id DESC LIMIT 10`,
      [session.id]
    );

    return NextResponse.json({
      success: true,
      count: Array.isArray(items) ? items.length : 0,
      data: items,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [session.id]);
    return NextResponse.json({ success: true, message: 'Marked all as read' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
