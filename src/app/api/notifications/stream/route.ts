import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.id;
  let lastChecked = new Date(Date.now() - 5000);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Initial ping
      const unread: any = await query('SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = 0', [userId]);
      const initialCount = unread[0]?.total || 0;
      controller.enqueue(encoder.encode(`event: ping\ndata: ${JSON.stringify({ unread_count: initialCount })}\n\n`));

      const interval = setInterval(async () => {
        try {
          const items: any = await query(
            `SELECT n.*, d.ticket_number 
             FROM notifications n 
             JOIN defects d ON n.defect_id = d.id 
             WHERE n.user_id = ? AND n.created_at >= ? AND n.is_read = 0 
             ORDER BY n.id DESC`,
            [userId, lastChecked]
          );

          if (items && items.length > 0) {
            controller.enqueue(encoder.encode(`event: notification\ndata: ${JSON.stringify(items)}\n\n`));
            lastChecked = new Date();
          }
        } catch {
          // Silent DB error in stream
        }
      }, 1500);

      // Clean up on close
      setTimeout(() => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      }, 30000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
