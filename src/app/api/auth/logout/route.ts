import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.delete('sp_defect_session');
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL('/login', 'http://localhost:3000'));
  res.cookies.delete('sp_defect_session');
  return res;
}
