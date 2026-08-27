import { useState } from 'react';
import { FileSpreadsheet, Copy, Check, ExternalLink, RefreshCw, Send, CheckCircle2, AlertCircle, X, Sparkles, Download } from 'lucide-react';
import { Participant, SyncConfig } from '../types';
import { exportToExcel, exportToCSV, syncToGoogleSheetWebhook, GOOGLE_APPS_SCRIPT_TEMPLATE } from '../utils/googleSheets';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  syncConfig: SyncConfig;
  onSaveSyncConfig: (config: SyncConfig) => void;
}

export function GoogleSheetSyncModal({
  isOpen,
  onClose,
  participants,
  syncConfig,
  onSaveSyncConfig
}: GoogleSheetSyncModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(syncConfig.webhookUrl || '');
  const [autoSync, setAutoSync] = useState(syncConfig.autoSync || false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveConfig = () => {
    onSaveSyncConfig({
      webhookUrl: webhookUrl.trim(),
      autoSync,
      lastSyncedAt: syncConfig.lastSyncedAt
    });
  };

  const handleTestSyncNow = async () => {
    if (!webhookUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await syncToGoogleSheetWebhook(participants, {
      webhookUrl: webhookUrl.trim(),
      autoSync
    });

    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      onSaveSyncConfig({
        webhookUrl: webhookUrl.trim(),
        autoSync,
        lastSyncedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Sinkronisasi Data Google Sheet & Export</h3>
              <p className="text-xs text-emerald-100">
                Otomatisasi data peserta, presensi check-in/out, dan feedback ke Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Quick Direct Download Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  1. Unduh File Spreadsheet Langsung (Instant)
                </h4>
                <p className="text-xs text-slate-500">
                  Unduh seluruh data peserta, status kehadiran, dan respon feedback dalam format Excel (.xlsx) atau CSV
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                {participants.length} Peserta
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => exportToExcel(participants)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Data Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => exportToCSV(participants)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh File CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Real-time Google Sheet Webhook Sync Integration */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  2. Hubungkan ke Live Google Sheet (Real-Time Webhook)
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Data akan otomatis dikirim dan diperbarui langsung ke spreadsheet Google Drive Anda tanpa perlu login OAuth berulang.
              </p>
            </div>

            {/* Step by step guide */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900">Cara Menghubungkan ke Google Sheet Anda (3 Menit):</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>
                  Buka Google Sheet baru di{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    sheets.new <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Salin kode script di bawah ini, lalu paste ke halaman editor Apps Script tersebut:</li>
              </ol>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kode Script Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode Google Apps Script</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Lalu klik <strong>Deploy &gt; New deployment &gt; Web app</strong>, pilih <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>, lalu klik <strong>Deploy</strong> dan salin URL Web App yang dihasilkan.
              </p>
            </div>

            {/* Webhook URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                URL Google Apps Script Web App:
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Checkbox auto sync */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Sinkronisasi otomatis setiap ada presensi check-in / feedback baru</span>
            </label>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestSyncNow}
                disabled={isTesting}
                className="flex items-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim Data...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim & Sinkronkan ke Google Sheet Sekarang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
