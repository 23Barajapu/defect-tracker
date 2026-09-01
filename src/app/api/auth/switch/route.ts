import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
  }

  try {
    const users = await query<any[]>('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?', [userId]);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar || '',
    };

    const res = NextResponse.json({ success: true, user: sessionData });
    res.cookies.set('sp_defect_session', encodeURIComponent(JSON.stringify(sessionData)), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
