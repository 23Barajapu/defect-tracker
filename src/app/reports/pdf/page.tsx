import React from 'react';
import { query } from '@/lib/db';
import { PrintButton } from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PdfReportPage({
  searchParams,
}: {
  searchParams: { date?: string; client_id?: string };
}) {
  const selectedDate = searchParams.date || new Date().toISOString().slice(0, 10);
  const clientId = searchParams.client_id;

  let reportSql = `
    SELECT d.*, m.module_name, p.name as project_name, p.platform, c.client_name, c.client_code,
           u_qc.name as qc_name, u_dev.name as dev_name
    FROM defects d
    JOIN modules m ON d.module_id = m.id
    JOIN projects p ON m.project_id = p.id
    JOIN clients c ON p.client_id = c.id
    JOIN users u_qc ON d.qc_id = u_qc.id
    LEFT JOIN users u_dev ON d.dev_id = u_dev.id
    WHERE (DATE(d.created_at) = ? OR DATE(d.updated_at) = ?)
  `;
  const reportParams: any[] = [selectedDate, selectedDate];
  if (clientId) {
    reportSql += ' AND c.id = ?';
    reportParams.push(clientId);
  }
  reportSql += ' ORDER BY c.client_name ASC, d.id DESC';

  const defects: any = await query(reportSql, reportParams);

  // Status Metrics
  const statusSummary = { Open: 0, Retesting: 0, 'Re-open': 0, Close: 0 };
  defects.forEach((d: any) => {
    if (statusSummary[d.status as keyof typeof statusSummary] !== undefined) {
      statusSummary[d.status as keyof typeof statusSummary]++;
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 py-6 px-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Top Action Bar (hidden in print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 print:hidden">
        <span className="text-xs text-slate-400 font-mono">
          Pratinjau Dokumen Resmi PT Sarana Pactindo
        </span>
        <PrintButton />
      </div>

      {/* Printable Sheet A4 */}
      <div className="w-full max-w-4xl bg-white p-10 rounded-xl shadow-2xl print:shadow-none print:p-0 print:rounded-none print:w-full">
        {/* Kop Surat PT Sarana Pactindo */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center">
              SP
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-slate-900 leading-tight">
                PT SARANA PACTINDO
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                Software Engineering & Quality Assurance Division &bull; Banking Solutions
              </p>
              <p className="text-[10px] text-slate-500">
                Gedung Cyber 2, Lt. 18, Jl. H.R. Rasuna Said, Jakarta Selatan
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-900">DOC-QA-DAILY-09</div>
            <div className="text-[10px] text-slate-500">ISO 9001:2015 &amp; PCI-DSS Ready</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center my-6">
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900 underline">
            Laporan Harian Pengujian Kualitas Perangkat Lunak (Daily QA Report)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Tanggal Cutoff: <strong>{new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
          </p>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-4 gap-3 my-6 text-center">
          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <div className="text-[10px] text-slate-500 font-bold uppercase">New Open</div>
            <div className="text-xl font-black text-blue-700 mt-1">{statusSummary.Open}</div>
          </div>
          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Ready for Retest</div>
            <div className="text-xl font-black text-purple-700 mt-1">{statusSummary.Retesting}</div>
          </div>
          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Re-opened</div>
            <div className="text-xl font-black text-red-700 mt-1">{statusSummary['Re-open']}</div>
          </div>
          <div className="p-3 border border-slate-300 rounded bg-slate-50">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Closed Today</div>
            <div className="text-xl font-black text-emerald-700 mt-1">{statusSummary.Close}</div>
          </div>
        </div>

        {/* Defect Table */}
        <div className="my-6">
          <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">Rincian Tiket Defect</h3>
          <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                <th className="p-2 border-r border-slate-300">No. Tiket</th>
                <th className="p-2 border-r border-slate-300">Bank Klien</th>
                <th className="p-2 border-r border-slate-300">Modul</th>
                <th className="p-2 border-r border-slate-300">Deskripsi Cacat</th>
                <th className="p-2 border-r border-slate-300">Severity</th>
                <th className="p-2 border-r border-slate-300">Status</th>
                <th className="p-2">PIC Dev</th>
              </tr>
            </thead>
            <tbody>
              {defects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
                    Tidak ada aktivitas defect yang tercatat pada tanggal cutoff ini.
                  </td>
                </tr>
              ) : (
                defects.map((d: any) => (
                  <tr key={d.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">{d.ticket_number}</td>
                    <td className="p-2 border-r border-slate-200">{d.client_name}</td>
                    <td className="p-2 border-r border-slate-200">{d.module_name}</td>
                    <td className="p-2 border-r border-slate-200 max-w-xs">{d.title}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{d.severity}</td>
                    <td className="p-2 border-r border-slate-200 font-bold">{d.status}</td>
                    <td className="p-2">{d.dev_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Approval Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="text-[11px] text-slate-500 font-semibold mb-16">Disiapkan oleh:</div>
            <div className="font-bold text-slate-900 underline">Rina Marlina</div>
            <div className="text-[10px] text-slate-500">Quality Control Lead</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold mb-16">Ditinjau oleh:</div>
            <div className="font-bold text-slate-900 underline">Agus Pratama</div>
            <div className="text-[10px] text-slate-500">Technical Lead</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold mb-16">Disetujui oleh:</div>
            <div className="font-bold text-slate-900 underline">Siti Nurhaliza</div>
            <div className="text-[10px] text-slate-500">Project Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}
