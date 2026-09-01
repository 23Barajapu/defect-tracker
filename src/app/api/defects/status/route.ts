import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      defect_id,
      to_status,
      notes = '',
      build_number = '',
      commit_hash = '',
      reassign_dev_id,
    } = body;

    if (!defect_id || !to_status) {
      return NextResponse.json({ success: false, message: 'Defect ID dan status tujuan wajib disertakan' }, { status: 400 });
    }

    const pool = getDb();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Ambil data defect saat ini
      const [defectRows]: any = await connection.execute('SELECT * FROM defects WHERE id = ? FOR UPDATE', [defect_id]);
      const defect = defectRows[0];

      if (!defect) {
        await connection.rollback();
        return NextResponse.json({ success: false, message: 'Tiket defect tidak ditemukan' }, { status: 404 });
      }

      const currentStatus = defect.status;
      const userRole = session.role;
      let isValidTransition = false;
      let isReopen = false;

      // ATURAN STATE MACHINE & RBAC (PRD Bagian 4 & 5)
      if (hasRole(session, ['LEAD', 'PM'])) {
        isValidTransition = ['Open', 'Retesting', 'Re-open', 'Close'].includes(to_status);
        if (to_status === 'Re-open' && currentStatus !== 'Re-open') isReopen = true;
      } else if (userRole === 'DEVELOPER') {
        if (['Open', 'Re-open'].includes(currentStatus) && to_status === 'Retesting') {
          isValidTransition = true;
          if (!notes.trim()) {
            await connection.rollback();
            return NextResponse.json({ success: false, message: 'Developer wajib mengisi Catatan Perbaikan (Fixing Note)' }, { status: 400 });
          }
        } else {
          await connection.rollback();
          return NextResponse.json({ success: false, message: 'Developer tidak memiliki izin melakukan transisi ini (dilarang langsung Close)' }, { status: 403 });
        }
      } else if (userRole === 'QC') {
        if (currentStatus === 'Retesting' && ['Close', 'Re-open'].includes(to_status)) {
          isValidTransition = true;
          if (to_status === 'Re-open') {
            isReopen = true;
            if (!notes.trim()) {
              await connection.rollback();
              return NextResponse.json({ success: false, message: 'QC wajib mengisi Catatan Alasan Kegagalan saat Re-open' }, { status: 400 });
            }
          }
        } else {
          await connection.rollback();
          return NextResponse.json({ success: false, message: 'QC hanya dapat memverifikasi tiket Retesting (Close / Re-open)' }, { status: 403 });
        }
      }

      if (!isValidTransition) {
        await connection.rollback();
        return NextResponse.json({ success: false, message: `Transisi dari ${currentStatus} ke ${to_status} tidak valid` }, { status: 400 });
      }

      const targetDevId = reassign_dev_id || defect.dev_id;
      const reopenInc = isReopen ? 1 : 0;

      // Update Defect
      await connection.execute(
        `UPDATE defects SET 
         status = ?, 
         dev_id = ?, 
         reopen_count = reopen_count + ?, 
         updated_at = NOW() 
         WHERE id = ?`,
        [to_status, targetDevId, reopenInc, defect_id]
      );

      // Record Activity Log
      await connection.execute(
        `INSERT INTO defect_activities 
         (defect_id, user_id, from_status, to_status, notes, build_number, commit_hash, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          defect_id,
          session.id,
          currentStatus,
          to_status,
          notes || null,
          build_number || null,
          commit_hash || null,
        ]
      );

      // Create Real-time Notifications
      if (to_status === 'Retesting') {
        await connection.execute(
          `INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) 
           VALUES (?, ?, 'Tiket Siap Retest', ?, 'ready_retest', 0, NOW())`,
          [defect.qc_id, defect_id, `Developer ${session.name} menandai ${defect.ticket_number} siap di-retest (Build: ${build_number || '-'})`]
        );
      } else if (to_status === 'Re-open' && targetDevId) {
        await connection.execute(
          `INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) 
           VALUES (?, ?, 'Defect Gagal Retest (Re-opened)', ?, 'reopened', 0, NOW())`,
          [targetDevId, defect_id, `QC ${session.name} membuka kembali tiket ${defect.ticket_number}. Alasan: ${notes}`]
        );
      } else if (to_status === 'Close' && targetDevId) {
        await connection.execute(
          `INSERT INTO notifications (user_id, defect_id, title, message, type, is_read, created_at) 
           VALUES (?, ?, 'Defect Telah Ditutup (Closed)', ?, 'closed', 0, NOW())`,
          [targetDevId, defect_id, `QC ${session.name} telah memverifikasi dan menutup tiket ${defect.ticket_number}`]
        );
      }

      await connection.commit();
      return NextResponse.json({ success: true, message: `Status tiket ${defect.ticket_number} berhasil diperbarui menjadi ${to_status}` });
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
