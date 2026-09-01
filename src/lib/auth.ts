import { cookies } from 'next/headers';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: 'QC' | 'DEVELOPER' | 'LEAD' | 'PM';
  phone?: string;
  avatar?: string;
}

const SESSION_COOKIE = 'sp_defect_session';

export function getSession(): UserSession | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
      // Default fallback demo session if none set (QC Rina)
      return {
        id: 1,
        name: 'Rina Marlina (QC Tester)',
        email: 'qc@pactindo.com',
        role: 'QC',
      };
    }
    return JSON.parse(decodeURIComponent(sessionCookie.value)) as UserSession;
  } catch {
    return {
      id: 1,
      name: 'Rina Marlina (QC Tester)',
      email: 'qc@pactindo.com',
      role: 'QC',
    };
  }
}

export function hasRole(session: UserSession | null, roles: string | string[]): boolean {
  if (!session) return false;
  if (Array.isArray(roles)) {
    return roles.includes(session.role);
  }
  return session.role === roles;
}
