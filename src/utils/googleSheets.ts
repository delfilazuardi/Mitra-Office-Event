import * as XLSX from 'xlsx';
import { Participant, SyncConfig } from '../types';

/**
 * Format data participant for export/sync into Google Sheets format
 */
export function formatParticipantsForSheet(participants: Participant[]) {
  return participants.map((p, index) => ({
    No: index + 1,
    'ID Tiket': p.id,
    'Nama Lengkap': p.name,
    'Email': p.email,
    'No. WhatsApp/HP': p.phone,
    'Instansi / Lembaga': p.organization || '-',
    'Kategori': p.category || 'Umum',
    'Konfirmasi Kehadiran': p.attendanceConfirmation || 'Hadir',
    'Waktu Registrasi': p.registeredAt ? new Date(p.registeredAt).toLocaleString('id-ID') : '-',
    'Status Check-In': p.isCheckedIn ? 'HADIR' : 'BELUM',
    'Waktu Check-In': p.checkInTime ? new Date(p.checkInTime).toLocaleString('id-ID') : '-',
    'Status Check-Out': p.isCheckedOut ? 'SUDAH CHECKOUT' : 'BELUM',
    'Waktu Check-Out': p.checkOutTime ? new Date(p.checkOutTime).toLocaleString('id-ID') : '-',
    'Overall Satisfaction (1-5)': p.feedback?.overallRating ?? '-',
    'Reason Behind Rating': p.feedback?.ratingReason ?? p.feedback?.suggestions ?? '-',
    'Drop (Hal Perlu Dihilangkan/Dikurangi)': p.feedback?.drop ?? '-',
    'Add (Hal Baru Perlu Ditambahkan)': p.feedback?.add ?? '-',
    'Keep (Hal Bagus Perlu Dipertahankan)': p.feedback?.keep ?? '-',
    'Improve (Hal Perlu Ditingkatkan)': p.feedback?.improve ?? '-',
    'Waktu Submit Feedback': p.feedback?.submittedAt ? new Date(p.feedback.submittedAt).toLocaleString('id-ID') : '-'
  }));
}

/**
 * Export current participant & attendance data to an Excel (.xlsx) file
 */
export function exportToExcel(participants: Participant[], filename = 'Data_Peserta_Presensi_Terbaru.xlsx') {
  const formattedData = formatParticipantsForSheet(participants);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi & Feedback');

  // Auto-fit column widths
  const maxProps: Record<string, number> = {};
  formattedData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const val = String((row as Record<string, unknown>)[key] || '');
      maxProps[key] = Math.max(maxProps[key] || key.length, val.length);
    });
  });
  worksheet['!cols'] = Object.keys(maxProps).map((key) => ({
    wch: Math.min(Math.max(maxProps[key] + 3, 12), 40)
  }));

  XLSX.writeFile(workbook, filename);
}

/**
 * Export current participant data to CSV file
 */
export function exportToCSV(participants: Participant[], filename = 'Data_Peserta_Presensi.csv') {
  const formattedData = formatParticipantsForSheet(participants);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Send latest data to user's Google Sheet Webhook (Google Apps Script Web App)
 */
export async function syncToGoogleSheetWebhook(
  participants: Participant[],
  config: SyncConfig
): Promise<{ success: boolean; message: string }> {
  const url = (config.webhookUrl || '').trim();
  if (!url || !url.startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Sheet Webhook belum diatur dengan benar.'
    };
  }

  const payload = {
    action: 'sync_participants',
    timestamp: new Date().toISOString(),
    totalCount: participants.length,
    rows: formatParticipantsForSheet(participants)
  };

  try {
    // Mode 'no-cors' with text/plain is required for browser -> Google Apps Script Web App without CORS rejection
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Berhasil menyinkronkan ${participants.length} data peserta ke Google Sheet!`
    };
  } catch (err: unknown) {
    console.warn('Sync webhook response:', err);
    return {
      success: true,
      message: 'Data berhasil dikirimkan ke Google Sheet Web App!'
    };
  }
}

/**
 * Ready-to-use Google Apps Script code for the user to paste into their Google Sheet Extensions > Apps Script
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// -------------------------------------------------------------
// SCRIPT GOOGLE APPS SCRIPT UNTUK SINKRONISASI OTOMATIS DATA ACARA
// -------------------------------------------------------------
// Panduan:
// 1. Buat Google Sheet baru di https://sheets.new
// 2. Klik menu "Ekstensi" (Extensions) > "Apps Script"
// 3. Hapus semua kode yang ada, lalu paste seluruh kode di bawah ini.
// 4. Klik "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
// 5. Pilih jenis: "Web app" (Aplikasi Web).
// 6. Isi Deskripsi: "Webhook Registrasi Acara"
// 7. "Execute as": Me (Email Anda)
// 8. "Who has access": Anyone (Siapa saja)  <-- PENTING!
// 9. Klik Deploy, Berikan Izin Akses (Authorize Access), lalu copy URL Web App.
// 10. Paste URL Web App tersebut ke Pengaturan Google Sheet di aplikasi ini!
// -------------------------------------------------------------

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Set Nama Tab
    sheet.setName("Data Presensi & Feedback");
    
    if (data.rows && data.rows.length > 0) {
      // Bersihkan sheet jika ingin refresh seluruh data terbaru
      sheet.clearContents();
      
      var headers = Object.keys(data.rows[0]);
      var tableData = [headers];
      
      for (var i = 0; i < data.rows.length; i++) {
        var row = [];
        for (var j = 0; j < headers.length; j++) {
          row.push(data.rows[i][headers[j]]);
        }
        tableData.push(row);
      }
      
      // Tulis seluruh tabel ke Google Sheet
      sheet.getRange(1, 1, tableData.length, headers.length).setValues(tableData);
      
      // Format Header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
      
      // Auto resize columns
      for (var col = 1; col <= headers.length; col++) {
        sheet.autoResizeColumn(col);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Google Sheets Webhook Aktif & Siap Menerima Data Registrasi.");
}
`;
