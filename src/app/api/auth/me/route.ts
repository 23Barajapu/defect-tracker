import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = getSession();
  return NextResponse.json({ success: true, user: session });
}
