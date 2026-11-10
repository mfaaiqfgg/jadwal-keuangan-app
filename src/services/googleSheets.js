/**
 * Google Sheets Service
 * Menyimpan data jadwal dan keuangan di Google Spreadsheet milik user
 * Menggunakan Google Sheets API v4 langsung dengan access token dari Firebase Auth
 */

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

// Key untuk menyimpan spreadsheet ID di localStorage per user
const getStorageKey = (uid) => `mylife_spreadsheet_${uid}`;

/**
 * Mendapatkan access token dari Firebase Auth (Google provider)
 */
const getAccessToken = async (user) => {
  if (!user) throw new Error('User belum login');
  // Ambil credential dari provider Google
  const token = await user.getIdToken(true);
  // Untuk Google Sheets API, kita perlu OAuth access token, bukan Firebase ID token
  // Access token disimpan saat login via Google
  const accessToken = sessionStorage.getItem('google_access_token');
  if (!accessToken) throw new Error('Token Google tidak tersedia. Silakan login ulang.');
  return accessToken;
};

/**
 * Buat spreadsheet baru di Google Drive user
 */
const createSpreadsheet = async (accessToken) => {
  const response = await fetch(SHEETS_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'MyLife Manager - Data',
        locale: 'id_ID',
      },
      sheets: [
        {
          properties: { title: 'Jadwal', index: 0 },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'ID' } },
                { userEnteredValue: { stringValue: 'Nama Agenda' } },
                { userEnteredValue: { stringValue: 'Tanggal' } },
                { userEnteredValue: { stringValue: 'Jam' } },
                { userEnteredValue: { stringValue: 'Tipe Pengulangan' } },
                { userEnteredValue: { stringValue: 'Hari' } },
                { userEnteredValue: { stringValue: 'Dibuat Pada' } },
                { userEnteredValue: { stringValue: 'Status' } },
              ]
            }]
          }]
        },
        {
          properties: { title: 'Keuangan', index: 1 },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'ID' } },
                { userEnteredValue: { stringValue: 'Tipe' } },
                { userEnteredValue: { stringValue: 'Nominal' } },
                { userEnteredValue: { stringValue: 'Keterangan' } },
                { userEnteredValue: { stringValue: 'Tanggal' } },
                { userEnteredValue: { stringValue: 'Jam' } },
              ]
            }]
          }]
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gagal membuat spreadsheet: ${err.error?.message || 'Unknown error'}`);
  }

  return await response.json();
};

/**
 * Cek apakah spreadsheet masih ada / accessible
 */
const checkSpreadsheet = async (accessToken, spreadsheetId) => {
  try {
    const response = await fetch(`${SHEETS_API}/${spreadsheetId}?fields=spreadsheetId`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Inisialisasi / dapatkan spreadsheet ID
 */
export const initSpreadsheet = async (user) => {
  const accessToken = await getAccessToken(user);
  const storageKey = getStorageKey(user.uid);
  
  // Cek localStorage dulu
  let spreadsheetId = localStorage.getItem(storageKey);
  
  if (spreadsheetId) {
    // Verify masih valid
    const exists = await checkSpreadsheet(accessToken, spreadsheetId);
    if (exists) return spreadsheetId;
  }
  
  // Buat baru
  const result = await createSpreadsheet(accessToken);
  spreadsheetId = result.spreadsheetId;
  localStorage.setItem(storageKey, spreadsheetId);
  
  return spreadsheetId;
};

/**
 * Tambah data jadwal ke sheet "Jadwal"
 */
export const addJadwal = async (user, jadwalData) => {
  const accessToken = await getAccessToken(user);
  const spreadsheetId = await initSpreadsheet(user);
  
  const now = new Date();
  const id = `J${now.getTime()}`;
  
  const values = [[
    id,
    jadwalData.nama,
    jadwalData.tanggal,
    jadwalData.jam,
    jadwalData.tipePengulangan, // 'setiap_hari', 'hari_tertentu', 'sekali'
    jadwalData.hari || '',
    now.toLocaleString('id-ID'),
    'aktif'
  ]];

  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Jadwal!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values })
    }
  );

  if (!response.ok) throw new Error('Gagal menyimpan jadwal');
  return { id, ...jadwalData };
};

/**
 * Ambil semua jadwal dari sheet "Jadwal"
 */
export const getJadwalList = async (user) => {
  const accessToken = await getAccessToken(user);
  const spreadsheetId = await initSpreadsheet(user);
  
  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Jadwal!A2:H?majorDimension=ROWS`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) return [];
  const data = await response.json();
  
  if (!data.values || data.values.length === 0) return [];
  
  return data.values.map(row => ({
    id: row[0] || '',
    nama: row[1] || '',
    tanggal: row[2] || '',
    jam: row[3] || '',
    tipePengulangan: row[4] || 'sekali',
    hari: row[5] || '',
    dibuatPada: row[6] || '',
    status: row[7] || 'aktif',
  }));
};

/**
 * Hapus jadwal (set status = 'dihapus')
 */
export const deleteJadwal = async (user, jadwalId) => {
  const accessToken = await getAccessToken(user);
  const spreadsheetId = await initSpreadsheet(user);
  
  // Get all data to find row
  const allData = await getJadwalList(user);
  const rowIndex = allData.findIndex(j => j.id === jadwalId);
  if (rowIndex === -1) throw new Error('Jadwal tidak ditemukan');
  
  // Update status column (H) - row is rowIndex + 2 (1-indexed + header)
  const range = `Jadwal!H${rowIndex + 2}`;
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [['dihapus']] })
    }
  );
};

/**
 * Tambah data keuangan ke sheet "Keuangan"
 */
export const addKeuangan = async (user, keuanganData) => {
  const accessToken = await getAccessToken(user);
  const spreadsheetId = await initSpreadsheet(user);
  
  const now = new Date();
  const id = `K${now.getTime()}`;
  
  const values = [[
    id,
    keuanganData.tipe, // 'income' atau 'pengeluaran'
    keuanganData.nominal,
    keuanganData.keterangan,
    now.toLocaleDateString('id-ID'),
    now.toLocaleTimeString('id-ID'),
  ]];

  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Keuangan!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values })
    }
  );

  if (!response.ok) throw new Error('Gagal menyimpan data keuangan');
  return { id, ...keuanganData };
};

/**
 * Ambil semua data keuangan dari sheet "Keuangan"
 */
export const getKeuanganList = async (user) => {
  const accessToken = await getAccessToken(user);
  const spreadsheetId = await initSpreadsheet(user);
  
  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Keuangan!A2:F?majorDimension=ROWS`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) return [];
  const data = await response.json();
  
  if (!data.values || data.values.length === 0) return [];
  
  return data.values.map(row => ({
    id: row[0] || '',
    tipe: row[1] || '',
    nominal: parseFloat(row[2]) || 0,
    keterangan: row[3] || '',
    tanggal: row[4] || '',
    jam: row[5] || '',
  }));
};

/**
 * Hapus data keuangan (delete row content)
 */
export const deleteKeuangan = async (user, keuanganId) => {
  const accessToken = await getAccessToken(user);
  const spreadsheetId = await initSpreadsheet(user);
  
  const allData = await getKeuanganList(user);
  const rowIndex = allData.findIndex(k => k.id === keuanganId);
  if (rowIndex === -1) throw new Error('Data keuangan tidak ditemukan');
  
  // Clear the entire row
  const range = `Keuangan!A${rowIndex + 2}:F${rowIndex + 2}`;
  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${range}:clear`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

/**
 * Dapatkan ringkasan keuangan
 */
export const getKeuanganSummary = async (user) => {
  const list = await getKeuanganList(user);
  const activeList = list.filter(k => k.id); // filter empty rows
  
  const totalIncome = activeList
    .filter(k => k.tipe === 'income')
    .reduce((sum, k) => sum + k.nominal, 0);
  
  const totalPengeluaran = activeList
    .filter(k => k.tipe === 'pengeluaran')
    .reduce((sum, k) => sum + k.nominal, 0);
  
  return {
    totalIncome,
    totalPengeluaran,
    saldo: totalIncome - totalPengeluaran,
    totalTransaksi: activeList.length,
    list: activeList,
  };
};
