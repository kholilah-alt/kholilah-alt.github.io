// Database Dinamis dari JSON
let dbUsers = [];//untuk menyimpan data pengguna (users) yang diambil dari database atau file JSON.
let dbQuestions = { allQuestions: [], examQuestions: [] };
let dbFaq = [];//Membuat array kosong untuk menyimpan data FAQ (Frequently Asked Questions).
let dbLkpd = [];

// Fallback data if JSON fetch fails
const defaultUsers = [
  { "username": "admin", "password": "1234", "role": "admin", "name": "Administrator" },
  { "username": "siswa1", "password": "123", "role": "siswa", "name": "M. Syamsuddiya'" },
  { "username": "siswa2", "password": "456", "role": "siswa", "name": "Siti Kholilah" },
  { "username": "guru", "password": "987", "role": "guru", "name": "Ibu Rahma, S.Pd." }
];//Menyimpan data pengguna bawaan (default) jika file database gagal dimuat.

const defaultLkpd = [
  {
    "id": "lkpd-1",
    "title": "LKPD Interaktif 1: Konsep & Ordo Matriks",
    "instructions": "Perhatikan matriks di bawah ini, isi jumlah baris, kolom, ordo, dan tentukan nilai elemen matriks yang ditanyakan.",
    "type": "concept",
    "matrix": [[2, -1, 5], [0, 4, 3]],
    "questions": [
      {
        "q": "Berapakah jumlah baris matriks di atas?",
        "type": "input",
        "answer": "2"
      },
      {
        "q": "Berapakah jumlah kolom matriks di atas?",
        "type": "input",
        "answer": "3"
      },
      {
        "q": "Berapakah ordo dari matriks di atas? (Format: m x n, contoh: 2x3)",
        "type": "input",
        "answer": "2x3"
      },
      {
        "q": "Tentukan nilai dari elemen a₁₃ (baris 1, kolom 3):",
        "type": "input",
        "answer": "5"
      },
      {
        "q": "Tentukan nilai dari elemen a₂₂ (baris 2, kolom 2):",
        "type": "input",
        "answer": "4"
      }
    ]
  },
  {
    "id": "lkpd-2",
    "title": "LKPD Interaktif 2: Penjumlahan & Pengurangan Matriks",
    "instructions": "Diberikan Matriks A dan B di bawah ini. Selesaikan penjumlahan A + B dengan mengisi kotak kosong pada matriks hasil.",
    "type": "matrix_addition",
    "matrixA": [[3, 5], [1, 2]],
    "matrixB": [[2, -1], [4, 0]],
    "correctAnswer": [[5, 4], [5, 2]]
  },
  {
    "id": "lkpd-3",
    "title": "LKPD Interaktif 3: Determinan Matriks 2x2",
    "instructions": "Diberikan Matriks C di bawah ini. Hitunglah determinan dari matriks C dengan mengisi pertanyaan penuntun.",
    "type": "concept",
    "matrix": [[6, 2], [3, 2]],
    "questions": [
      {
        "q": "Berapakah hasil perkalian diagonal utama (a × d)?",
        "type": "input",
        "answer": "12"
      },
      {
        "q": "Berapakah hasil perkalian diagonal samping (b × c)?",
        "type": "input",
        "answer": "6"
      },
      {
        "q": "Maka, determinan matriks C (det C = ad − bc) adalah:",
        "type": "input",
        "answer": "6"
      }
    ]
  }
];

/**
 * Fungsi: loadAllJson()
 * Kegunaan: Memuat seluruh data eksternal (Database) secara dinamis dari file format JSON.
 * Cara Kerja:
 *   1. Menggunakan API Fetch bawaan browser secara asinkron (async/await).
 *   2. Menambahkan query string parameter dinamis (?v=Date.now()) untuk mencegah caching browser.
 *   3. Memiliki sistem pengaman (fallback) dengan blok try-catch: jika file JSON tidak ditemukan atau gagal dimuat,
 *      fungsi akan otomatis menggunakan array data default yang sudah didefinisikan secara lokal di memori agar web tetap berjalan.
 *   4. Melakukan sinkronisasi data LKPD ke editor JSON kustom (lkpdJsonEditor) di panel guru/admin jika elemen tersedia.
 */
async function loadAllJson() { //Membuat fungsi asinkron untuk mengambil data JSON dari server.
  const version = Date.now(); //Menghasilkan timestamp saat ini dalam milidetik.
  try { //Mencoba menjalankan kode yang mungkin menghasilkan error.
    const resUsers = await fetch('users.json?v=' + version);
    dbUsers = await resUsers.json();
  } catch (e) {
    console.warn("Failed to load users.json, using default database.", e);
    dbUsers = defaultUsers;
  }

  try {
    const resQuestions = await fetch('questions.json?v=' + version);
    dbQuestions = await resQuestions.json();
  } catch (e) {
    console.warn("Failed to load questions.json, using default database.", e);
    dbQuestions = { allQuestions: [], examQuestions: [] };
  }

  try {
    const resFaq = await fetch('faq.json?v=' + version);
    dbFaq = await resFaq.json();
  } catch (e) {
    console.warn("Failed to load faq.json, using default database.", e);
    dbFaq = [];
  }

  try {
    const resLkpd = await fetch('lkpd.json?v=' + version);
    dbLkpd = await resLkpd.json();
  } catch (e) {
    console.warn("Failed to load lkpd.json, using default database.", e);
    dbLkpd = defaultLkpd;
  }

  const jsonEditor = document.getElementById('lkpdJsonEditor');
  if (jsonEditor) {
    jsonEditor.value = JSON.stringify(dbLkpd, null, 2);
  }
}

/**
 * Event Listener: DOMContentLoaded
 * Kegunaan: Mengatur inisialisasi awal seluruh fitur aplikasi web interaktif setelah struktur HTML selesai dimuat oleh browser.
 * Cara Kerja:
 *   1. Memicu eksekusi fungsi loadAllJson() untuk memuat database.
 *   2. Menginisialisasi sistem gamifikasi dengan profil tamu default ('Tamu', role 'Umum').
 *   3. Menyambungkan event handler click pada tombol Login (loginBtn) untuk membaca input username dan password, 
 *      mencocokkannya ke database (dbUsers), menyembunyikan halaman login, serta membuka akses penuh ke aplikasi dengan profil pengguna yang sesuai.
 *   4. Menyambungkan event keyup (Enter) pada kolom input username dan password untuk kemudahan login dengan menekan tombol Enter di keyboard.
 *   5. Menyambungkan event handler click pada tombol Logout (logoutBtn) untuk menghapus sesi pengguna, mengosongkan kolom input, 
 *      mereset profil widget di sidebar, dan menampilkan kembali halaman login.
 */
document.addEventListener('DOMContentLoaded', function () { //Menunggu sampai halaman HTML selesai dimuat sebelum menjalankan JavaScript.
  // Load databases
  loadAllJson();

  // Initialize gamification with guest status initially
  if (window.initGamification) {
    window.initGamification('Tamu', 'Umum');
  }

  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginPage = document.getElementById('loginPage');
  const mainSite = document.getElementById('mainSite');

  loginBtn.addEventListener('click', function () {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    // Check username & password against database
    const matchedUser = dbUsers.find(u => u.username === user && u.password === pass);

    if (matchedUser) {
      loginPage.classList.add('hidden');
      mainSite.classList.remove('hidden');

      // Update right-sidebar profile widget
      document.getElementById('widgetUserName').innerText = matchedUser.name;
      document.getElementById('widgetUserRole').innerText = matchedUser.role;

      // Sync and load user's gamification profile
      if (window.initGamification) {
        window.initGamification(matchedUser.name, matchedUser.role);
      }
    } else {
      document.getElementById('loginError').innerHTML = 'Username atau password salah!';
    }
  });

  // ENTER KEY
  document.getElementById('password').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') loginBtn.click();
  });

  document.getElementById('username').addEventListener('keyup', function (e) {
    if (e.key === 'Enter') loginBtn.click();
  });

  // LOGOUT
  logoutBtn.addEventListener('click', function () {
    loginPage.classList.remove('hidden');
    mainSite.classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    // Reset right-sidebar profile widget
    document.getElementById('widgetUserName').innerText = 'Tamu';
    document.getElementById('widgetUserRole').innerText = 'Umum';
  });
});

/**
 * Fungsi: showSection(id)
 * Kegunaan: Mengatur navigasi perpindahan layar antar bab/materi pembelajaran pada platform pembelajaran satu halaman (Single Page Application - SPA).
 * Parameter:
 *   - id: Nama pengenal (ID) dari elemen kontainer section tujuan (misal: 'pengertian', 'operasi').
 * Cara Kerja:
 *   1. Mencari seluruh elemen dengan class 'content-section' di dokumen dan menghapus class 'active' untuk menyembunyikan semua halaman.
 *   2. Mencari elemen tujuan dengan ID yang diawali string 'sec-' (contoh: 'sec-pengertian').
 *   3. Jika elemen target ditemukan, fungsi menambahkan class 'active' untuk menampilkannya di layar dengan efek CSS transisi.
 *   4. Menggulirkan layar (scroll) secara mulus (smooth behavior) langsung ke posisi paling atas elemen target agar pengguna nyaman membaca materi dari awal.
 */
function showSection(id) {
  document.querySelectorAll('.content-section').forEach(function (sec) {
    sec.classList.remove('active');
  });
  const target = document.getElementById('sec-' + id);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const sessionVisitedSections = new Set();//Menyimpan daftar section yang sudah dikunjungi pengguna tanpa duplikasi.

/**
 * Fungsi: showContent(sectionId)
 * Kegunaan: Fungsi routing SPA sekunder untuk navigasi halaman sekaligus menyuntikkan (hook) insentif gamifikasi secara otomatis.
 * Parameter:
 *   - sectionId: Nama pengenal (ID) dari kontainer section tujuan.
 * Cara Kerja:
 *   1. Melakukan looping pada seluruh elemen '.content-section' untuk menghapus class 'active' (menyembunyikan semua halaman).
 *   2. Menambahkan class 'active' pada elemen kontainer ber-ID 'sec-[sectionId]' agar halaman materi terpilih muncul ke layar.
 *   3. Memiliki mekanisme deteksi kunjungan pertama (single-visit hook) menggunakan struktur data Set (sessionVisitedSections).
 *   4. Jika sectionId yang dikunjungi termasuk dalam daftar materi pembelajaran inti ('pengertian', 'operasi', 'determinan', 'kriptografi', 'filterGambar')
 *      dan belum pernah dikunjungi sebelumnya dalam sesi berjalan, pengguna akan diberi bonus penghargaan berupa penambahan +15 XP ke profil gamifikasinya.
 */
function showContent(sectionId) {
  // sembunyikan semua section
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Routing Sederhana: Menghapus class 'active' dari semua section lebih dulu, baru menambahkannya ke ID target untuk menciptakan efek perpindahan halaman SPA.
  const target = document.getElementById('sec-' + sectionId);

  if (target) {
    target.classList.add('active');

    // Gamification hook: award +15 XP once per material viewed
    const materialList = ['pengertian', 'operasi', 'determinan', 'kriptografi', 'filterGambar'];
    if (materialList.includes(sectionId) && !sessionVisitedSections.has(sectionId)) {
      sessionVisitedSections.add(sectionId);
      if (window.gainXP) {
        window.gainXP(15);
      }
    }
  }
}

// ===========================
// BANK SOAL EVALUASI ACAK
// ===========================

// LOGIKA KUIS ACAK: Mengambil soal secara acak dan memulai timer 10 menit
const allQuestions = [
  {
    q: 'Matriks A berordo 3×2. Artinya matriks A memiliki....',
    options: ['3 kolom dan 2 baris', '3 baris dan 2 kolom', '6 baris', '2 baris dan 3 kolom'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Ordo matriks dituliskan dalam format standar universal: <code>m × n</code>.<br/>' +
      '• <strong>m</strong> mewakili jumlah <strong>baris</strong> (susunan elemen arah horizontal/mendatar).<br/>' +
      '• <strong>n</strong> mewakili jumlah <strong>kolom</strong> (susunan elemen arah vertikal tegak lurus dari atas ke bawah).<br/>' +
      'Jika matriks A berordo <code>3 × 2</code>, angka pertama (3) menunjukkan jumlah baris, dan angka kedua (2) menunjukkan jumlah kolom. Oleh karena itu, matriks tersebut memiliki <strong>3 baris dan 2 kolom</strong>. Pilihan lain salah karena menukar posisi baris dengan kolom.'
  },
  {
    q: 'Jika A = [[2,1],[3,4]] dan B = [[1,2],[0,1]], maka A + B = ....',
    options: ['[[3,3],[3,5]]', '[[3,2],[3,5]]', '[[2,3],[3,5]]', '[[3,3],[3,4]]'],
    answer: 0,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Operasi penjumlahan dua matriks hanya diperbolehkan jika kedua matriks memiliki ordo yang sama (dalam kasus ini keduanya berordo 2×2). Penjumlahan dilakukan dengan menjumlahkan elemen-elemen yang berada di posisi yang <strong>seletak (sebaris dan sekolom)</strong>.<br/><br/>' +
      'Mari kita hitung satu per satu posisi elemen hasil penjumlahan:<br/>' +
      '• <strong>Elemen Baris 1, Kolom 1 (Kiri Atas):</strong><br/>' +
      '  A<sub>11</sub> + B<sub>11</sub> = <code>2 + 1 = 3</code><br/>' +
      '• <strong>Elemen Baris 1, Kolom 2 (Kanan Atas):</strong><br/>' +
      '  A<sub>12</sub> + B<sub>12</sub> = <code>1 + 2 = 3</code><br/>' +
      '• <strong>Elemen Baris 2, Kolom 1 (Kiri Bawah):</strong><br/>' +
      '  A<sub>21</sub> + B<sub>21</sub> = <code>3 + 0 = 3</code><br/>' +
      '• <strong>Elemen Baris 2, Kolom 2 (Kanan Bawah):</strong><br/>' +
      '  A<sub>22</sub> + B<sub>22</sub> = <code>4 + 1 = 5</code><br/><br/>' +
      'Dengan menggabungkan semua elemen seletak tersebut, kita peroleh matriks baru:<br/>' +
      '<code>[[3, 3], [3, 5]]</code>. Oleh karena itu, pilihan pertama adalah jawaban yang benar.'
  },
  {
    q: 'Determinan matriks [[4,2],[3,1]] adalah....',
    options: ['4', '-2', '2', '10'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Untuk matriks persegi berordo 2×2 dengan bentuk umum <code>A = [[a, b], [c, d]]</code>, nilai determinan (dilambangkan dengan det(A) atau |A|) dihitung menggunakan rumus silang:<br/>' +
      '<code>det(A) = ad − bc</code> (Diagonal Utama dikurangi Diagonal Samping).<br/><br/>' +
      'Mari kita petakan elemen-elemen dari matriks <code>[[4, 2], [3, 1]]</code>:<br/>' +
      '• a = 4 (diagonal utama kiri atas)<br/>' +
      '• b = 2 (diagonal samping kanan atas)<br/>' +
      '• c = 3 (diagonal samping kiri bawah)<br/>' +
      '• d = 1 (diagonal utama kanan bawah)<br/><br/>' +
      'Sekarang masukkan nilai-nilai ini ke dalam rumus:<br/>' +
      'det(A) = (4 × 1) − (2 × 3)<br/>' +
      'det(A) = 4 − 6<br/>' +
      'det(A) = <strong>-2</strong>.<br/>' +
      'Sehingga nilai determinannya adalah <strong>-2</strong>.'
  },
  {
    q: 'Matriks yang semua elemennya bernilai nol disebut....',
    options: ['Matriks Identitas', 'Matriks Diagonal', 'Matriks Nol', 'Matriks Transpose'],
    answer: 2,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Di dalam teori aljabar matriks, penggolongan jenis matriks didasarkan pada karakteristik elemen penyusunnya:<br/>' +
      '• <strong>Matriks Nol (O):</strong> Sebuah matriks di mana setiap elemen di seluruh baris dan kolom bernilai 0 (contoh: <code>[[0,0],[0,0]]</code>). Ini adalah jawaban yang benar.<br/>' +
      '• <strong>Matriks Identitas:</strong> Matriks persegi dengan elemen diagonal utama bernilai 1 dan elemen lainnya bernilai 0.<br/>' +
      '• <strong>Matriks Diagonal:</strong> Matriks persegi yang elemen di luar diagonal utamanya bernilai 0, namun elemen diagonal utamanya tidak harus bernilai 1.<br/>' +
      '• <strong>Matriks Transpose:</strong> Bukan jenis matriks khusus, melainkan hasil operasi penukaran baris menjadi kolom dari matriks asal.'
  },
  {
    q: 'Matriks identitas orde 2×2 adalah....',
    options: ['[[0,0],[0,0]]', '[[1,1],[1,1]]', '[[1,0],[0,1]]', '[[0,1],[1,0]]'],
    answer: 2,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Matriks Identitas (dilambangkan dengan <code>I</code>) memiliki sifat khusus yang mirip dengan angka 1 dalam perkalian bilangan biasa. Aturan pembentukan Matriks Identitas adalah:<br/>' +
      '1. Harus berupa matriks persegi (jumlah baris = jumlah kolom).<br/>' +
      '2. Elemen pada diagonal utama (dari kiri atas ke kanan bawah) harus bernilai <strong>1</strong>.<br/>' +
      '3. Semua elemen di luar diagonal utama harus bernilai <strong>0</strong>.<br/><br/>' +
      'Mari kita cek pilihan yang tersedia:<br/>' +
      '• <code>[[1, 0], [0, 1]]</code>: Diagonal utama berisi 1, elemen lain berisi 0. Ini memenuhi syarat ordo 2×2 (benar).<br/>' +
      '• <code>[[1, 1], [1, 1]]</code>: Salah, karena elemen diagonal samping juga bernilai 1.<br/>' +
      '• <code>[[0, 0], [0, 0]]</code>: Salah, ini adalah matriks nol.'
  },
  {
    q: 'Jika A = [[3,0],[0,5]], maka Aᵀ (transpose A) adalah....',
    options: ['[[0,3],[5,0]]', '[[3,0],[0,5]]', '[[5,0],[0,3]]', '[[0,5],[3,0]]'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Operasi Transpose (dilambangkan dengan pangkat T, <code>Aᵀ</code>) adalah operasi mengubah elemen <strong>baris menjadi kolom</strong> (atau sebaliknya).<br/><br/>' +
      'Mari kita lakukan operasi transpose pada matriks <code>A = [[3, 0], [0, 5]]</code>:<br/>' +
      '• Baris pertama dari A adalah <code>[3, 0]</code>. Baris ini kita ubah menjadi kolom pertama dari Aᵀ, yaitu ditulis secara tegak lurus: <code>[3, 0]ᵀ</code>.<br/>' +
      '• Baris kedua dari A adalah <code>[0, 5]</code>. Baris ini kita ubah menjadi kolom kedua dari Aᵀ, ditulis tegak lurus: <code>[0, 5]ᵀ</code>.<br/><br/>' +
      'Jika disusun kembali, matriks hasil transpose adalah <code>[[3, 0], [0, 5]]</code>.<br/>' +
      'Perlu dicatat bahwa matriks A adalah <strong>matriks diagonal/simetris</strong>, di mana elemen di atas diagonal sama dengan elemen di bawah diagonal (yaitu bernilai 0). Untuk semua matriks simetris, berlaku sifat khusus: <code>A = Aᵀ</code>.'
  },
  {
    q: 'Perkalian matriks AB tidak selalu sama dengan BA. Sifat ini disebut....',
    options: ['Asosiatif', 'Tidak Komutatif', 'Distributif', 'Refleksif'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Di dalam matematika, apabila urutan operasi dibalik namun menghasilkan nilai yang sama (seperti perkalian angka biasa <code>2 × 3 = 3 × 2</code>), operasi tersebut dikatakan memiliki sifat <strong>Komutatif</strong>.<br/><br/>' +
      'Namun, pada perkalian matriks, operasi perkalian didasarkan pada metode baris dikali kolom. Mengubah posisi pengali (dari AB menjadi BA) hampir selalu menghasilkan nilai yang berbeda, bahkan sering kali ordo hasilnya pun berbeda atau tidak dapat dikalikan sama sekali. Sifat ini disebut sebagai sifat <strong>Tidak Komutatif</strong> (atau non-komutatif).'
  },
  {
    q: 'Syarat dua matriks dapat dikalikan adalah....',
    options: [
      'Jumlah baris A = jumlah baris B',
      'Jumlah kolom A = jumlah kolom B',
      'Jumlah kolom A = jumlah baris B',
      'Kedua matriks harus persegi'
    ],
    answer: 2,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Operasi perkalian dua matriks (A × B) didefinisikan menggunakan metode pengalian elemen-elemen baris matriks pertama dengan elemen-elemen kolom matriks kedua secara berpasangan.<br/><br/>' +
      'Agar setiap elemen mendapatkan pasangannya dengan tepat, maka <strong>jumlah kolom matriks pertama (A) wajib sama dengan jumlah baris matriks kedua (B)</strong>.<br/><br/>' +
      'Sebagai ilustrasi:<br/>' +
      '• Jika matriks A berordo <code>m × n</code> dan matriks B berordo <code>n × p</code>.<br/>' +
      '• Nilai tengahnya (yaitu <code>n</code>, kolom A dan baris B) harus sama.<br/>' +
      '• Hasil perkalian matriks C akan memiliki ordo dari nilai luar, yaitu <code>m × p</code>.<br/>' +
      'Jika syarat ini tidak terpenuhi, maka perkalian tidak dapat didefinisikan.'
  },
  {
    q: 'Invers matriks A ada jika dan hanya jika....',
    options: ['det(A) = 0', 'det(A) ≠ 0', 'A adalah matriks baris', 'A adalah matriks kolom'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Rumus untuk mencari invers dari suatu matriks A adalah:<br/>' +
      '<code>A⁻¹ = 1/det(A) × Adjoin(A)</code>.<br/><br/>' +
      'Di dalam matematika, pembagian dengan angka nol tidak didefinisikan (menghasilkan nilai tidak terhingga/error). Oleh karena itu, kita tidak dapat menghitung nilai <code>1/det(A)</code> apabila determinan dari matriks A bernilai nol.<br/><br/>' +
      '• Jika <strong>det(A) = 0</strong>: Matriks disebut matriks <strong>Singular</strong> dan tidak memiliki invers.<br/>' +
      '• Jika <strong>det(A) ≠ 0</strong>: Matriks disebut matriks <strong>Non-Singular</strong> dan dipastikan memiliki invers.<br/>' +
      'Oleh karena itu, invers matriks A ada jika dan hanya jika <strong>det(A) ≠ 0</strong>.'
  },
  {
    q: 'Jika det(A) = 5, maka det(2A) untuk matriks 2×2 adalah....',
    options: ['5', '10', '20', '25'],
    answer: 2,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Salah satu sifat penting determinan matriks saat dikalikan dengan skalar (bilangan real) adalah:<br/>' +
      '<code>det(k · A) = kⁿ · det(A)</code>, di mana <strong>k</strong> adalah bilangan skalar pengali dan <strong>n</strong> melambangkan ordo (dimensi) dari matriks persegi tersebut.<br/><br/>' +
      'Mari kita masukkan angka dari soal ke dalam sifat di atas:<br/>' +
      '• Konstanta skalar (k) = 2<br/>' +
      '• Matriks persegi berordo 2×2, maka n = 2<br/>' +
      '• Nilai determinan awal det(A) = 5<br/><br/>' +
      'Sekarang kita hitung:<br/>' +
      'det(2A) = 2² × det(A)<br/>' +
      'det(2A) = 4 × 5<br/>' +
      'det(2A) = <strong>20</strong>.<br/>' +
      'Pilihan 10 salah karena hanya mengalikan langsung 2 × 5 tanpa memangkatkan dengan ordo matriks.'
  },
  {
    q: 'Matriks persegi dengan elemen diagonal utama = 1 dan elemen lainnya = 0 disebut....',
    options: ['Matriks Nol', 'Matriks Simetris', 'Matriks Identitas', 'Matriks Diagonal'],
    answer: 2,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Mari kita bedakan definisi formal masing-masing istilah agar tidak tertukar:<br/>' +
      '• <strong>Matriks Identitas (I):</strong> Matriks persegi khusus di mana semua elemen diagonal utama bernilai 1, dan seluruh elemen di luar diagonal utama bernilai 0 (contoh: <code>[[1,0],[0,1]]</code>). Ini adalah jawaban yang benar.<br/>' +
      '• <strong>Matriks Diagonal:</strong> Matriks persegi yang elemen di luar diagonal utamanya bernilai 0, namun elemen diagonal utamanya tidak dibatasi (bisa angka berapa saja selain 1).<br/>' +
      '• <strong>Matriks Nol:</strong> Matriks yang semua elemennya bernilai 0.<br/>' +
      '• <strong>Matriks Simetris:</strong> Matriks persegi yang elemennya simetris terhadap diagonal utama (A = Aᵀ).'
  },
  {
    q: 'Jika A = [[1,2],[3,4]], elemen a₂₁ adalah....',
    options: ['1', '2', '3', '4'],
    answer: 2,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Setiap elemen di dalam matriks diidentifikasi menggunakan indeks baris dan kolom yang ditulis dalam format subskrip <strong>a<sub>ij</sub></strong>:<br/>' +
      '• <strong>i</strong> menunjukkan urutan <strong>baris</strong> (dihitung dari atas ke bawah).<br/>' +
      '• <strong>j</strong> menunjukkan urutan <strong>kolom</strong> (dihitung dari kiri ke kanan).<br/><br/>' +
      'Kita ingin mencari elemen <strong>a<sub>21</sub></strong>, yang berarti elemen pada <strong>Baris ke-2</strong> dan <strong>Kolom ke-1</strong>.<br/><br/>' +
      'Mari kita bedah matriks <code>A = [[1, 2], [3, 4]]</code>:<br/>' +
      '• Baris 1 berisi elemen 1 and 2.<br/>' +
      '• Baris 2 berisi elemen 3 and 4.<br/>' +
      'Dari Baris ke-2 ini, kita ambil Kolom ke-1 (elemen pertama di baris tersebut), yaitu angka <strong>3</strong>.<br/>' +
      'Sebagai pelengkap: a₁₁ = 1, a₁₂ = 2, a₂₁ = 3, dan a₂₂ = 4.'
  },
  {
    q: 'Hasil dari 2 × [[1,3],[2,4]] adalah....',
    options: ['[[1,3],[2,4]]', '[[2,6],[4,8]]', '[[3,5],[4,6]]', '[[2,3],[4,4]]'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Operasi perkalian matriks dengan bilangan skalar (angka real biasa) dilakukan dengan cara mengalikan bilangan pengali tersebut ke <strong>setiap elemen tunggal</strong> yang ada di dalam matriks secara merata.<br/><br/>' +
      'Mari kita kalikan angka skalar 2 ke masing-masing elemen matriks <code>[[1, 3], [2, 4]]</code>:<br/>' +
      '• Elemen Baris 1, Kolom 1: <code>2 × 1 = 2</code><br/>' +
      '• Elemen Baris 1, Kolom 2: <code>2 × 3 = 6</code><br/>' +
      '• Elemen Baris 2, Kolom 1: <code>2 × 2 = 4</code><br/>' +
      '• Elemen Baris 2, Kolom 2: <code>2 × 4 = 8</code><br/><br/>' +
      'Jika kita susun kembali elemen-elemen hasil perkalian ini ke dalam matriks baru, kita dapatkan <strong>[[2, 6], [4, 8]]</strong>. Ini adalah jawaban yang benar.'
  },
  {
    q: 'Suatu matriks A dikatakan simetris jika....',
    options: ['A = –A', 'A = Aᵀ', 'det(A) = 1', 'A × A = I'],
    answer: 1,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Matriks Simetris adalah matriks persegi khusus yang elemen-elemennya tersusun secara simetris (cerminan) terhadap garis diagonal utama.<br/><br/>' +
      'Secara matematis, sifat simetris ini didefinisikan secara formal dengan aturan: **Apabila matriks tersebut di-transpose (baris ditukar menjadi kolom), maka hasilnya akan menghasilkan matriks yang sama persis dengan matriks semula**.<br/><br/>' +
      'Notasi rumusnya adalah <strong>A = Aᵀ</strong>.<br/>' +
      'Contoh matriks simetris: <code>[[1, 2], [2, 5]]</code>. Jika baris 1 [1, 2] dijadikan kolom 1, dan baris 2 [2, 5] dijadikan kolom 2, hasil transposenya tetap <code>[[1, 2], [2, 5]]</code>.'
  },
  {
    q: 'Jika A = [[2,1],[5,3]], maka det(A) = ....',
    options: ['1', '6', '11', '–1'],
    answer: 0,
    pembahasan: '<strong>Penjelasan Sangat Rinci:</strong><br/>' +
      'Untuk menghitung determinan matriks persegi berordo 2×2 dengan elemen <code>[[a, b], [c, d]]</code>, kita gunakan rumus silang diagonal:<br/>' +
      '<code>det(A) = ad − bc</code>.<br/><br/>' +
      'Mari kita petakan elemen dari matriks <code>A = [[2, 1], [5, 3]]</code>:<br/>' +
      '• a = 2<br/>' +
      '• b = 1<br/>' +
      '• c = 5<br/>' +
      '• d = 3<br/><br/>' +
      'Sekarang kita hitung nilai determinannya:<br/>' +
      'det(A) = (2 × 3) − (1 × 5)<br/>' +
      'det(A) = 6 − 5<br/>' +
      'det(A) = <strong>1</strong>.<br/>' +
      'Karena 6 dikurangi 5 menghasilkan 1, maka determinan matriks tersebut adalah <strong>1</strong>.'
  }
];

/**
 * Fungsi: shuffle(arr)
 * Kegunaan: Mengacak urutan elemen-elemen di dalam sebuah array secara acak dan adil (unbiased).
 * Parameter:
 *   - arr: Array asal yang ingin diacak (tidak akan dimutasi secara langsung karena menggunakan spread operator).
 * Returns:
 *   - Mengembalikan array baru yang berisi elemen-elemen dengan urutan acak.
 * Cara Kerja:
 *   1. Membuat salinan dangkal (shallow copy) dari array input menggunakan syntax [...arr] untuk menjaga imutabilitas data asli.
 *   2. Menerapkan Algoritma Fisher-Yates (atau Knuth Shuffle) yang merupakan metode pengacakan dengan efisiensi waktu linear O(N) dan memori O(1).
 *   3. Melakukan perulangan mundur (backward loop) dari indeks terakhir (i) menuju 1.
 *   4. Menghasilkan angka acak j berupa indeks integer valid antara 0 hingga i (inklusif).
 *   5. Menukar posisi elemen pada indeks ke-i dengan elemen pada indeks acak ke-j (swap technique).
 */
function shuffle(arr) { //Mengacak urutan isi array.
  const a = [...arr];                                 // Membuat salinan array agar data asli tidak berubah
  for (let i = a.length - 1; i > 0; i--) {            // Melakukan perulangan mundur dari elemen terakhir ke elemen pertama
    const j = Math.floor(Math.random() * (i + 1));    // Menghasilkan angka indeks acak (j) antara 0 sampai indeks saat ini (i)
    [a[i], a[j]] = [a[j], a[i]];                      // Menukar posisi elemen di indeks i dengan elemen di indeks acak j (swap)
  }
  return a;                                           // Mengembalikan array yang sudah diacak posisinya
}

let quizQuestions = [];                                                                     // Array untuk menyimpan soal kuis terpilih
let userAnswers = [];                                                                       // Array untuk menampung jawaban user
let submitted = false;                                                                      // Status apakah kuis sudah disubmit atau belum
let quizTimerInterval = null;                                                               // Variabel penyimpan referensi interval timer
let quizTimeLeft = 0;                                                                       // Sisa waktu pengerjaan kuis
let quizTotalTime = 0;                                                                      // Total durasi kuis dalam detik
let quizStartTime = 0;                                                                      // Waktu mulai kuis dalam milidetik

/**
 * Fungsi buildQuiz()
 * Kegunaan: Menginisialisasi pembuatan soal acak baru.
 * Cara Kerja: Menghapus timer berjalan, mengacak bank soal, menyiapkan array jawaban kosong,
 *             dan merender tampilan layar awal kuis sebelum pengguna benar-benar memulai.
 */
function buildQuiz() {                                                                      // Fungsi untuk membangun kuis soal acak
  if (quizTimerInterval) {                                                                  // Jika ada timer yang masih berjalan
    clearInterval(quizTimerInterval);                                                       // Hentikan timer tersebut agar tidak tumpang tindih
    quizTimerInterval = null;                                                               // Reset variabel interval menjadi kosong
  }                                                                                         // Akhir pembersihan timer
  const bank = (dbQuestions && dbQuestions.allQuestions && dbQuestions.allQuestions.length > 0) ? dbQuestions.allQuestions : allQuestions;
  quizQuestions = shuffle(bank).slice(0, 10);                                       // Acak bank soal dan ambil 10 soal pertama
  userAnswers = new Array(quizQuestions.length).fill(null);                                 // Buat array jawaban kosong sebanyak jumlah soal
  submitted = false;                                                                        // Set status pengiriman kuis menjadi belum dikirim
  const container = document.getElementById('quizContainer');                               // Ambil elemen kontainer kuis dari HTML
  container.style.display = 'block';                                                        // Tampilkan kontainer kuis di layar user
  renderQuizStart();                                                                        // Panggil fungsi untuk menampilkan layar awal kuis
}                                                                                           // Akhir fungsi buildQuiz

/**
 * Fungsi renderQuizStart()
 * Kegunaan: Menampilkan layar pembuka dengan instruksi durasi dan tombol mulai kuis.
 * Cara Kerja: Memasukkan elemen HTML penjelasan kuis ke dalam kontainer 'quizContainer'.
 */
function renderQuizStart() {                                                                // Fungsi untuk menampilkan layar konfirmasi kuis
  const container = document.getElementById('quizContainer');                               // Mengambil kontainer kuis
  container.innerHTML = `                                                                   // Mengisi kontainer dengan kode HTML awal kuis
    <div style="text-align:center; padding: 20px 0;">                                       <!-- Container tengah untuk tombol mulai -->
      <p style="font-size:1rem; color:#4b5563; max-width:520px; margin:0 auto 20px;">       <!-- Paragraf deskripsi -->
        Kuis ini berisi <strong>10 soal acak</strong> tentang matriks. Kamu memiliki <strong>10 menit</strong> untuk menyelesaikan semua soal. Pilih jawaban yang paling tepat, lalu klik <em>Kirim Jawaban</em>.
      </p>                                                                                  <!-- Akhir paragraf -->
      <button class="quiz-start-btn" onclick="startQuiz()">🚀 Mulai Evaluasi</button>       <!-- Tombol untuk memicu fungsi startQuiz() -->
    </div>                                                                                  <!-- Akhir container -->
  `;                                                                                        // Akhir pengisian HTML
}                                                                                           // Akhir fungsi renderQuizStart

/**
 * Fungsi startQuiz()
 * Kegunaan: Memulai sesi kuis dan hitung mundur sesungguhnya setelah pengguna menekan "Mulai Evaluasi".
 * Cara Kerja: Menyetel batas waktu 10 menit, memanggil renderQuizForm() untuk menampilkan soal,
 *             dan mengaktifkan interval timer.
 */
function startQuiz() {                                                                      // Fungsi untuk memulai kuis dengan timer
  quizTotalTime = 10 * 60;                                                                  // Set total waktu 10 menit (600 detik)
  quizTimeLeft = quizTotalTime;                                                             // Inisialisasi sisa waktu kuis
  quizStartTime = Date.now();                                                               // Catat waktu mulai kuis
  renderQuizForm();                                                                         // Tampilkan daftar soal kuis
  startTimer();                                                                             // Jalankan hitung mundur timer
}                                                                                           // Akhir fungsi startQuiz

/**
 * Fungsi startTimer()
 * Kegunaan: Mengelola jalannya hitung mundur kuis acak.
 * Cara Kerja: Mengatur fungsi setInterval yang mengurangi sisa waktu setiap 1000 milidetik (1 detik).
 *             Memperbarui tampilan waktu di layar. Jika waktu habis, jawaban disubmit secara otomatis.
 */
function startTimer() {                                                                     // Fungsi untuk mengelola hitung mundur kuis
  if (quizTimerInterval) clearInterval(quizTimerInterval);                                  // Bersihkan timer lama jika ada yang berjalan
  quizTimerInterval = setInterval(function () {                                             // Mulai pengulangan setiap 1 detik
    quizTimeLeft--;                                                                         // Kurangi sisa waktu satu detik
    updateTimerDisplay();                                                                   // Perbarui tampilan timer di layar
    if (quizTimeLeft <= 0) {                                                                // Jika waktu habis (mencapai nol)
      clearInterval(quizTimerInterval);                                                     // Hentikan pengulangan timer
      quizTimerInterval = null;                                                             // Reset variabel interval
      if (!submitted) {                                                                     // Jika kuis belum terkirim
        alert('⏰ Waktu habis! Jawaban akan dikirim otomatis.');                             // Beri peringatan waktu habis
        autoSubmitQuiz();                                                                   // Kirim jawaban secara otomatis
      }                                                                                     // Akhir cek status submit
    }                                                                                       // Akhir cek waktu habis
  }, 1000);                                                                                 // Interval 1000ms = 1 detik
}                                                                                           // Akhir fungsi startTimer

/**
 * Fungsi updateTimerDisplay()
 * Kegunaan: Memperbarui tampilan waktu mundur, progress bar, dan jumlah soal yang telah dijawab pada UI kuis acak.
 * Cara Kerja: Menghitung menit dan detik dari sisa waktu, memformatnya menjadi MM:SS, dan memperbarui teks HTML.
 *             Juga mengubah warna bar menjadi merah (warning) jika sisa waktu kurang dari 60 detik.
 */
function updateTimerDisplay() {
  const minutes = Math.floor(quizTimeLeft / 60);
  const seconds = quizTimeLeft % 60;
  const timeStr = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

  const timerEl = document.getElementById('quizTimerDisplay');
  if (timerEl) {
    timerEl.textContent = timeStr;

    // Warning when less than 60 seconds
    if (quizTimeLeft <= 60) {
      timerEl.classList.add('warning');
    } else {
      timerEl.classList.remove('warning');
    }
  }

  // Update progress bar
  const fillEl = document.getElementById('quizTimerFill');
  if (fillEl) {
    const pct = (quizTimeLeft / quizTotalTime) * 100;
    fillEl.style.width = pct + '%';

    if (quizTimeLeft <= 60) {
      fillEl.classList.add('danger');
    } else {
      fillEl.classList.remove('danger');
    }
  }

  // Update answered count
  const answeredCount = userAnswers.filter(function (a) { return a !== null; }).length;
  const answeredEl = document.getElementById('quizAnsweredCount');
  if (answeredEl) {
    answeredEl.textContent = answeredCount + '/' + quizQuestions.length;
  }

  // Update progress fill
  const progressFill = document.getElementById('quizProgressFill');
  if (progressFill) {
    progressFill.style.width = (answeredCount / quizQuestions.length * 100) + '%';
  }
}

/**
 * Fungsi renderQuizForm()
 * Kegunaan: Membuat dan menampilkan antarmuka utama kuis acak (header status dan daftar pertanyaan).
 * Cara Kerja: Menggabungkan string HTML yang berisi elemen timer, skor berjalan, dan melakukan perulangan (looping)
 *             melalui array quizQuestions untuk merender setiap soal beserta pilihan jawabannya.
 */
function renderQuizForm() {
  const container = document.getElementById('quizContainer');
  let html = '';

  // Timer and Score header bar
  html += `
    <div class="quiz-header-bar" id="quizHeaderBar">
      <div class="quiz-timer-section">
        <i class="fa fa-clock quiz-timer-icon"></i>
        <div>
          <div class="quiz-timer-display" id="quizTimerDisplay">10:00</div>
          <div class="quiz-timer-label">Sisa Waktu</div>
        </div>
      </div>
      <div class="quiz-score-section">
        <div class="quiz-score-badge">
          <span class="score-value" id="quizAnsweredCount">0/${quizQuestions.length}</span>
          <span class="score-label">Dijawab</span>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" id="quizProgressFill" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="quiz-timer-bar">
      <div class="quiz-timer-fill" id="quizTimerFill" style="width: 100%"></div>
    </div>
  `;

  const abcd = ['A', 'B', 'C', 'D', 'E'];
  quizQuestions.forEach(function (soal, idx) {
    html += `
      <div class="quiz-card" id="qcard-${idx}" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed #dce5f8;">
        <div class="quiz-question" style="font-size: 16px; font-weight: 600; color: var(--abu-gelap); margin-bottom: 12px;">Soal ${idx + 1}.<br/><span style="font-weight: 400; margin-top: 6px; display: block;">${escapeHtml(soal.q)}</span></div>
        <div class="quiz-options" style="display: flex; flex-direction: column; gap: 8px;">
    `;
    soal.options.forEach(function (opt, oIdx) {
      html += `
        <label class="quiz-option" id="opt-${idx}-${oIdx}" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 10px 14px; border: 1.5px solid #c8d5f0; border-radius: 8px; transition: background 0.15s, border-color 0.15s; background: #fff;">
          <input type="radio" name="q${idx}" value="${oIdx}"
            onchange="selectAnswer(${idx}, ${oIdx})" style="margin-top: 4px;" />
          <div style="flex: 1;">
            <strong>${abcd[oIdx]}.</strong> ${escapeHtml(opt)}
          </div>
        </label>
      `;
    });
    html += `</div></div>`;
  });

  html += `<button class="quiz-submit-btn btn-primary" onclick="submitQuiz()" style="margin-top: 10px; width: 100%; padding: 12px; font-size: 16px;">📨 Kirim Jawaban</button>`;
  container.innerHTML = html;
  container.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {                                                            // Fungsi untuk mengamankan teks dari karakter HTML berbahaya
  return str                                                                        // Mengambil string input
    .replace(/&/g, '&amp;')                                                         // Mengubah simbol & menjadi teks aman &amp;
    .replace(/</g, '&lt;')                                                          // Mengubah simbol < menjadi teks aman &lt;
    .replace(/>/g, '&gt;')                                                          // Mengubah simbol > menjadi teks aman &gt;
    .replace(/"/g, '&quot;');                                                       // Mengubah simbol kutip " menjadi teks aman &quot;
}                                                                                   // Akhir fungsi escapeHtml

/**
 * Fungsi selectAnswer(qIdx, oIdx)
 * Kegunaan: Merekam jawaban yang dipilih oleh pengguna dan memberikan efek visual pada opsi yang dipilih.
 * Parameter:
 *   - qIdx: Indeks soal saat ini.
 *   - oIdx: Indeks opsi jawaban yang diklik.
 * Cara Kerja: Menyimpan indeks opsi ke array userAnswers. Menghapus warna 'active' dari opsi lain pada soal yang sama,
 *             dan menerapkan warna biru 'active' pada opsi yang baru saja dipilih.
 */
function selectAnswer(qIdx, oIdx) {
  userAnswers[qIdx] = oIdx;

  // Hapus highlight sebelumnya pada soal ini
  for (let i = 0; i < quizQuestions[qIdx].options.length; i++) {
    const el = document.getElementById('opt-' + qIdx + '-' + i);
    if (el) {
      el.style.background = '#fff';
      el.style.borderColor = '#c8d5f0';
    }
  }
  const chosen = document.getElementById('opt-' + qIdx + '-' + oIdx);
  if (chosen) {
    chosen.style.background = '#eef1fb';
    chosen.style.borderColor = '#003399';
  }

  // Update answered count display
  updateTimerDisplay();
}

/**
 * Fungsi autoSubmitQuiz()
 * Kegunaan: Mengumpulkan lembar jawaban secara otomatis saat waktu ujian/kuis habis.
 * Cara Kerja: Mencari indeks pada array userAnswers yang masih bernilai null (belum dijawab) dan mengubahnya
 *             menjadi -1 (dianggap jawaban salah), lalu memanggil doSubmitQuiz().
 */
function autoSubmitQuiz() {
  // Fill unanswered questions with -1 (wrong answer)
  for (let i = 0; i < userAnswers.length; i++) {
    if (userAnswers[i] === null) {
      userAnswers[i] = -1;
    }
  }
  doSubmitQuiz();
}

/**
 * Fungsi submitQuiz()
 * Kegunaan: Memicu proses pengumpulan jawaban ketika pengguna menekan tombol "Kirim Jawaban".
 * Cara Kerja: Melakukan validasi apakah masih ada soal yang kosong. Jika ada, tampilkan peringatan (alert)
 *             dan gagalkan pengiriman. Jika lengkap, lanjutkan ke doSubmitQuiz().
 */
function submitQuiz() {
  if (submitted) return;

  // Cek apakah semua soal dijawab
  const unanswered = userAnswers.filter(function (a) { return a === null; }).length;
  if (unanswered > 0) {
    alert('Masih ada ' + unanswered + ' soal yang belum dijawab!');
    return;
  }

  doSubmitQuiz();
}

/**
 * Fungsi doSubmitQuiz()
 * Kegunaan: Logika utama penentuan skor, evaluasi jawaban benar/salah, dan pencetakan layar hasil.
 * Cara Kerja: Menghentikan interval timer, menghitung lama waktu pengerjaan kuis, 
 *             mencocokkan jawaban pengguna dengan kunci jawaban yang ada di objek soal,
 *             dan memberi warna hijau (benar) atau merah (salah) pada opsi. Terakhir, merender skor akhir.
 */
function doSubmitQuiz() {
  if (submitted) return;
  submitted = true;

  // Stop timer
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }

  // Calculate elapsed time
  const elapsedMs = Date.now() - quizStartTime;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedSecRemainder = elapsedSec % 60;
  const elapsedStr = String(elapsedMin).padStart(2, '0') + ':' + String(elapsedSecRemainder).padStart(2, '0');

  let score = 0;

  quizQuestions.forEach(function (soal, idx) {
    const correct = soal.answer;
    const chosen = userAnswers[idx];

    // Tandai jawaban benar & salah
    for (let i = 0; i < soal.options.length; i++) {
      const el = document.getElementById('opt-' + idx + '-' + i);
      if (!el) continue;
      el.style.cursor = 'default';
      const radio = el.querySelector('input[type="radio"]');
      if (radio) radio.disabled = true;

      if (i === correct) {                              // Mengecek jika pilihan saat ini adalah kunci jawaban yang benar
        el.style.background = '#d4edda';              // Mengubah warna latar kotak pilihan menjadi hijau (tanda benar)
        el.style.borderColor = '#28a745';             // Memberikan border warna hijau gelap agar lebih jelas
        el.style.color = '#155724';                   // Mengubah warna teks menjadi hijau tua (standar feedback sukses)
      } else if (i === chosen && chosen !== correct) { // Mengecek jika pilihan user salah (pilihan user tidak sama dengan kunci)
        el.style.background = '#f8d7da';              // Mengubah warna latar kotak pilihan menjadi merah muda (tanda salah)
        el.style.borderColor = '#dc3545';             // Memberikan border warna merah agar user tahu letak kesalahannya
        el.style.color = '#721c24';                   // Mengubah warna teks menjadi merah tua (standar feedback error)
      }
    }

    if (chosen === correct) score++;                  // Jika jawaban user sama dengan kunci, variabel skor bertambah 1

    // Tampilkan pembahasan langkah-demi-langkah setelah kuis dikirim
    const qCard = document.getElementById('qcard-' + idx);
    if (qCard) {
      const pBox = document.createElement('div');
      pBox.className = 'quiz-explanation-box';
      pBox.style.cssText = 'margin-top: 14px; padding: 14px 18px; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; font-size: 13.5px; line-height: 1.5; color: #14532d;';

      const abcd = ['A', 'B', 'C', 'D', 'E'];
      const pText = soal.pembahasan || `<strong>Pembahasan:</strong> Kunci jawaban yang benar adalah opsi <strong>${abcd[correct]}</strong>.`;

      pBox.innerHTML = `
        <h5 style="margin: 0 0 6px 0; font-weight: 700; color: #15803d; font-size:14px;"><i class="fa fa-info-circle"></i> Pembahasan Soal ${idx + 1}</h5>
        <div>${pText}</div>
      `;
      qCard.appendChild(pBox);
    }
  });

  const persen = Math.round((score / quizQuestions.length) * 100);

  // Gamification reward for completing Quick Quiz
  if (window.gainXP) {
    window.gainXP(10);
    if (persen === 100) {
      window.gainXP(15);
    }
  }

  let feedbackText = '';
  let feedbackClass = '';

  if (persen >= 80) {
    feedbackText = '🌟 Luar biasa! Kamu menguasai materi matriks dengan sangat baik!';
    feedbackClass = 'great';
  } else if (persen >= 60) {
    feedbackText = '👍 Cukup baik! Pelajari kembali bagian yang masih kurang.';
    feedbackClass = 'ok';
  } else {
    feedbackText = '📖 Jangan menyerah! Ulangi materi dan coba lagi ya.';
    feedbackClass = 'bad';
  }

  // Hide the timer header bar
  const headerBar = document.getElementById('quizHeaderBar');
  if (headerBar) headerBar.style.display = 'none';
  const timerBar = document.querySelector('.quiz-timer-bar');
  if (timerBar) timerBar.style.display = 'none';

  // Tampilkan hasil di atas soal
  const container = document.getElementById('quizContainer');
  const resultDiv = document.createElement('div');
  resultDiv.className = 'quiz-result';
  resultDiv.innerHTML = `
    <h3>Hasil Evaluasi</h3>
    <span class="quiz-score">${persen}%</span>
    <p>Kamu menjawab benar <strong>${score} dari ${quizQuestions.length}</strong> soal.</p>
    <p class="quiz-feedback ${feedbackClass}">${feedbackText}</p>
    <div class="quiz-time-result">
      <i class="fa fa-clock"></i>
      <span>Waktu pengerjaan: <strong>${elapsedStr}</strong></span>
    </div>
    <button class="quiz-start-btn" style="margin-top:18px;" onclick="resetQuiz()">🔄 Ulangi Evaluasi</button>
  `;

  container.insertBefore(resultDiv, container.firstChild);
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Fungsi resetQuiz()
 * Kegunaan: Digunakan saat pengguna menekan tombol "Ulangi Evaluasi".
 * Cara Kerja: Menghapus timer lama, menggulir layar ke atas section, dan memanggil buildQuiz() untuk 
 *             mengatur set soal baru.
 */
function resetQuiz() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }
  buildQuiz();
  document.getElementById('sec-soalAcak').scrollIntoView({ behavior: 'smooth' });
}
/**
 * Fungsi: setActive(element)
 * Kegunaan: Menandai menu navigasi sidebar yang sedang aktif dikunjungi pengguna secara visual.
 * Parameter:
 *   - element: Elemen HTML anchor tag menu sidebar (nav-link) yang baru saja diklik oleh pengguna.
 * Cara Kerja:
 *   1. Melakukan query ke seluruh dokumen untuk mencari elemen dengan class '.nav-link'.
 *   2. Melakukan looping menggunakan forEach untuk menghapus class 'active' dari seluruh menu navigasi, mereset status visualnya.
 *   3. Menambahkan class 'active' secara spesifik ke elemen yang sedang diklik untuk memberikan highlight warna biru premium.
 */
function setActive(element) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  element.classList.add('active');
}

/**
 * Fungsi: toggleFaq(element)
 * Kegunaan: Mengatur visual buka-tutup akordion (collapse/expand) pada daftar pertanyaan FAQ.
 * Parameter:
 *   - element: Elemen header FAQ yang diklik oleh pengguna.
 * Cara Kerja:
 *   1. Mengambil elemen berikutnya (nextElementSibling) yang merupakan kotak jawaban terkait.
 *   2. Melakukan toggle class 'show' pada kotak jawaban tersebut (jika ada class 'show' maka dihapus, jika tidak ada maka ditambahkan) untuk memicu animasi CSS.
 *   3. Mencari ikon panah (.faq-arrow) di dalam elemen header.
 *   4. Melakukan toggle class 'rotate' pada ikon panah untuk memberikan efek visual panah berputar dinamis 180 derajat ke atas/bawah.
 */
function toggleFaq(element) {
  const answer = element.nextElementSibling;
  // buka/tutup jawaban
  answer.classList.toggle('show');

  // putar icon
  const arrow = element.querySelector('.faq-arrow');
  if (arrow) {
    arrow.classList.toggle('rotate');
  }
}
// CHATBOT OTOMATIS: Mencari jawaban dari bank data berdasarkan kata kunci dalam pertanyaan
const knowledgeBase = [
  {
    keywords: ['apa itu matriks', 'pengertian matriks', 'definisi matriks', 'apa matriks'],
    answer: '<strong>Matriks</strong> adalah susunan bilangan-bilangan yang disusun dalam baris dan kolom berbentuk persegi panjang, diapit oleh tanda kurung siku [ ] atau tanda kurung biasa ( ). Bilangan-bilangan tersebut disebut <em>elemen</em> atau <em>entri</em> matriks. Matriks biasa dilambangkan dengan huruf kapital seperti A, B, C.'
  },
  {
    keywords: ['ordo', 'ukuran matriks', 'ordo matriks', 'baris kolom'],
    answer: '<strong>Ordo matriks</strong> menyatakan ukuran matriks, yaitu banyak baris × banyak kolom (m × n). Contoh: matriks 2×3 artinya memiliki 2 baris dan 3 kolom. Elemen matriks dinyatakan sebagai a<sub>ij</sub>, dimana i = nomor baris dan j = nomor kolom.'
  },
  {
    keywords: ['jenis', 'macam', 'tipe matriks', 'jenis-jenis'],
    answer: 'Jenis-jenis matriks meliputi: <ul><li><strong>Matriks Baris</strong> — hanya punya 1 baris (ordo 1×n)</li><li><strong>Matriks Kolom</strong> — hanya punya 1 kolom (ordo m×1)</li><li><strong>Matriks Persegi</strong> — jumlah baris = kolom (n×n)</li><li><strong>Matriks Nol</strong> — semua elemen bernilai 0</li><li><strong>Matriks Identitas</strong> — diagonal utama = 1, lainnya = 0</li><li><strong>Matriks Segitiga</strong> — elemen di atas/bawah diagonal = 0</li><li><strong>Matriks Diagonal</strong> — hanya elemen diagonal yang tidak nol</li></ul>'
  },
  {
    keywords: ['penjumlahan', 'tambah', 'jumlah', 'menjumlahkan'],
    answer: 'Dua matriks dapat <strong>dijumlahkan</strong> jika memiliki <em>ordo yang sama</em>. Penjumlahan dilakukan elemen per elemen yang seletak. Contoh: jika A = [[1,2],[3,4]] dan B = [[5,6],[7,8]], maka A + B = [[6,8],[10,12]].'
  },
  {
    keywords: ['pengurangan', 'kurang', 'mengurangkan', 'selisih'],
    answer: '<strong>Pengurangan matriks</strong> dilakukan elemen per elemen pada matriks yang berordo sama, sama seperti penjumlahan. Contoh: A - B, setiap elemen A dikurangi elemen B yang seletak.'
  },
  {
    keywords: ['perkalian skalar', 'kali skalar', 'skalar'],
    answer: '<strong>Perkalian skalar</strong> adalah mengalikan setiap elemen matriks dengan suatu bilangan (skalar). Contoh: 2 × [[1,3],[2,4]] = [[2,6],[4,8]]. Setiap elemen dikalikan dengan 2.'
  },
  {
    keywords: ['perkalian matriks', 'kali matriks', 'mengalikan matriks', 'perkalian dua matriks'],
    answer: '<strong>Perkalian matriks</strong> A(m×n) dengan B(n×p) menghasilkan C(m×p). <em>Syarat:</em> jumlah kolom A harus sama dengan jumlah baris B. Caranya: c<sub>ij</sub> = Σ(a<sub>ik</sub> × b<sub>kj</sub>). Perkalian matriks bersifat <strong>tidak komutatif</strong> (A×B ≠ B×A pada umumnya).'
  },
  {
    keywords: ['determinan', 'det', 'nilai determinan'],
    answer: '<strong>Determinan</strong> hanya berlaku untuk matriks persegi. Untuk matriks 2×2: det(A) = ad − bc. Untuk 3×3 bisa menggunakan <em>aturan Sarrus</em> atau ekspansi kofaktor. Determinan berguna untuk menentukan apakah matriks memiliki invers.'
  },
  {
    keywords: ['invers', 'balikan', 'kebalikan', 'a invers'],
    answer: '<strong>Invers matriks</strong> A ditulis A⁻¹. Syarat: det(A) ≠ 0. Untuk matriks 2×2: A⁻¹ = (1/det(A)) × [[d, −b],[−c, a]]. Sifat penting: A × A⁻¹ = A⁻¹ × A = I (matriks identitas).'
  },
  {
    keywords: ['transpose', 'transpos'],
    answer: '<strong>Transpose matriks A</strong> (ditulis Aᵀ) diperoleh dengan menukar baris menjadi kolom dan sebaliknya. Contoh: jika A = [[1,2,3],[4,5,6]], maka Aᵀ = [[1,4],[2,5],[3,6]]. Ordo berubah dari m×n menjadi n×m.'
  },
  {
    keywords: ['identitas', 'matriks identitas', 'matriks satuan'],
    answer: '<strong>Matriks Identitas (I)</strong> adalah matriks persegi dengan elemen diagonal utama = 1 dan elemen lainnya = 0. Sifat: A × I = I × A = A. Matriks identitas berperan seperti angka 1 dalam perkalian biasa.'
  },
  {
    keywords: ['matriks nol', 'elemen nol', 'semua nol'],
    answer: '<strong>Matriks Nol (O)</strong> adalah matriks yang semua elemennya = 0. Sifat: A + O = A dan A × O = O. Matriks nol berperan seperti angka 0 dalam penjumlahan.'
  },
  {
    keywords: ['komutatif', 'sifat perkalian', 'ab ba', 'tidak komutatif'],
    answer: 'Perkalian matriks bersifat <strong>tidak komutatif</strong>, artinya A × B belum tentu sama dengan B × A. Namun, perkalian matriks bersifat <strong>asosiatif</strong>: (AB)C = A(BC) dan <strong>distributif</strong>: A(B+C) = AB + AC.'
  },
  {
    keywords: ['syarat kali', 'syarat perkalian', 'kapan bisa dikali', 'syarat mengalikan'],
    answer: 'Dua matriks A dan B dapat dikalikan (A × B) <strong>jika jumlah kolom A sama dengan jumlah baris B</strong>. Jika A berordo m×n dan B berordo n×p, maka hasil perkalian berordo m×p.'
  },
  {
    keywords: ['syarat jumlah', 'syarat penjumlahan', 'kapan bisa dijumlah', 'syarat tambah'],
    answer: 'Dua matriks dapat dijumlahkan atau dikurangkan <strong>jika dan hanya jika keduanya memiliki ordo yang sama</strong> (jumlah baris dan kolom yang sama).'
  },
  {
    keywords: ['singular', 'non singular', 'tidak punya invers'],
    answer: 'Matriks <strong>singular</strong> adalah matriks yang det(A) = 0, sehingga tidak memiliki invers. Matriks <strong>non-singular</strong> adalah matriks yang det(A) ≠ 0, sehingga memiliki invers.'
  },
  {
    keywords: ['simetris', 'matriks simetris'],
    answer: 'Matriks <strong>simetris</strong> adalah matriks persegi yang memenuhi A = Aᵀ (transpose-nya sama dengan dirinya sendiri). Artinya elemen a<sub>ij</sub> = a<sub>ji</sub> untuk semua i dan j.'
  },
  {
    keywords: ['aplikasi', 'kegunaan', 'manfaat', 'kehidupan nyata', 'penggunaan'],
    answer: 'Matriks memiliki banyak aplikasi: <ul><li><strong>Grafis komputer</strong> — transformasi gambar 2D/3D (rotasi, translasi, skala)</li><li><strong>Ekonomi</strong> — model input-output Leontief</li><li><strong>Kriptografi</strong> — enkripsi dan dekripsi pesan (Hill Cipher)</li><li><strong>Fisika</strong> — mekanika kuantum, transformasi koordinat</li><li><strong>Machine Learning</strong> — representasi data, neural network</li><li><strong>Teknik</strong> — analisis rangkaian listrik, struktur bangunan</li></ul>'
  },
  {
    keywords: ['elemen', 'entri', 'komponen', 'anggota matriks'],
    answer: '<strong>Elemen matriks</strong> adalah bilangan-bilangan yang menyusun matriks. Elemen pada baris ke-i dan kolom ke-j ditulis sebagai a<sub>ij</sub>. Contoh: pada matriks A = [[1,2],[3,4]], elemen a<sub>21</sub> = 3 (baris 2, kolom 1).'
  },
  {
    keywords: ['sarrus', 'aturan sarrus', 'determinan 3x3'],
    answer: '<strong>Aturan Sarrus</strong> digunakan untuk menghitung determinan matriks 3×3. Caranya: salin kolom 1 dan 2 di sebelah kanan matriks. Kalikan diagonal dari kiri atas ke kanan bawah (positif) dan diagonal dari kanan atas ke kiri bawah (negatif), lalu jumlahkan semua hasilnya.'
  },
  {
    keywords: ['cara menghitung', 'langkah', 'rumus', 'menghitung'],
    answer: 'Untuk <strong>menghitung matriks</strong>, tergantung operasinya: <ul><li><strong>Penjumlahan/Pengurangan</strong>: elemen per elemen (ordo harus sama)</li><li><strong>Perkalian skalar</strong>: kalikan setiap elemen dengan skalar</li><li><strong>Perkalian matriks</strong>: jumlahkan hasil kali baris × kolom</li><li><strong>Determinan 2×2</strong>: ad − bc</li><li><strong>Invers 2×2</strong>: (1/det) × [[d,−b],[−c,a]]</li></ul>'
  },
  {
    keywords: ['sama', 'matriks sama', 'kesamaan matriks'],
    answer: 'Dua matriks dikatakan <strong>sama</strong> jika: (1) memiliki <em>ordo yang sama</em>, dan (2) setiap elemen yang <em>seletak bernilai sama</em>. Contoh: [[1,2],[3,4]] = [[1,2],[3,4]] karena ordo dan semua elemen seletak bernilai sama.'
  }
];

/**
 * Fungsi: findAnswer(question)
 * Kegunaan: Mesin pencarian (Search Engine) FAQ berbasis kata kunci untuk menentukan jawaban paling relevan dari chatbot.
 * Parameter:
 *   - question: String teks pertanyaan yang diajukan oleh pengguna lewat input chat.
 * Returns:
 *   - Mengembalikan string HTML jawaban FAQ yang cocok, atau null jika tidak ada topik yang relevan.
 * Cara Kerja:
 *   1. Mengubah teks input pertanyaan menjadi huruf kecil (case-insensitive conversion) untuk mempermudah kecocokan.
 *   2. Memilih basis pengetahuan (dbFaq jika berhasil dimuat, atau fallback knowledgeBase) sebagai referensi pencarian.
 *   3. Melakukan looping ke setiap entri topik FAQ. Setiap entri memiliki daftar kata kunci (keywords).
 *   4. Menghitung nilai kecocokan (score):
 *      - Jika kalimat pertanyaan mengandung kata kunci secara utuh, skor bertambah sepanjang kata kunci dikali 2 (pembobotan tinggi).
 *      - Jika tidak cocok utuh, kata kunci dipecah menjadi kata tunggal. Jika kata tunggal (> 2 karakter) ada dalam pertanyaan, skor bertambah sepanjang kata tersebut.
 *   5. Menyimpan entri FAQ dengan skor tertinggi (bestMatch).
 *   6. Jika skor tertinggi yang diperoleh memenuhi batas minimal (threshold score >= 3), bot akan mengembalikan jawaban. Jika di bawah itu, mengembalikan null.
 */
function findAnswer(question) {
  const q = question.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  const base = (dbFaq && dbFaq.length > 0) ? dbFaq : knowledgeBase;

  for (let i = 0; i < base.length; i++) {
    const entry = base[i];
    let score = 0;

    for (let j = 0; j < entry.keywords.length; j++) {
      const keyword = entry.keywords[j];
      if (q.includes(keyword)) {                                                    // Jika pertanyaan mengandung kata kunci utuh
        score += keyword.length * 2;                                                // Tambahkan skor 2x lipat dari panjang kata kunci
      } else {                                                                      // Jika kata kunci utuh tidak ditemukan
        const words = keyword.split(' ');                                           // Pecah kata kunci menjadi kata-kata terpisah
        for (let k = 0; k < words.length; k++) {                                    // Cek setiap kata terpisah tersebut
          if (words[k].length > 2 && q.includes(words[k])) {                        // Jika kata tersebut panjangnya > 2 dan cocok
            score += words[k].length;                                               // Tambahkan skor sesuai panjang kata tersebut
          }                                                                         // Akhir cek kata tunggal
        }                                                                           // Akhir loop kata tunggal
      }                                                                             // Akhir logika skor kunci
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Scoring System Chatbot: Memberikan bobot nilai pada setiap kata kunci yang cocok. Jika total skor per topik >= 3, bot akan mengembalikan jawaban yang paling relevan.
  if (bestMatch && bestScore >= 3) {
    return bestMatch.answer;
  }

  return null;
}

/**
 * Fungsi: kirimPertanyaan()
 * Kegunaan: Mengatur visual alur percakapan (user-bot chatting interface) pada fitur Chatbot Interaktif.
 * Cara Kerja:
 *   1. Membaca nilai nama peserta dan isi teks pertanyaan dari input form HTML.
 *   2. Melakukan validasi awal: jika nama atau pertanyaan kosong, tampilkan notifikasi error berwarna merah dan hentikan fungsi.
 *   3. Membuat elemen chat-bubble pengguna baru dengan avatar ikon user dan merendernya ke panel chatHistory.
 *   4. Membuat elemen chat-bubble bot sementara yang menampilkan animasi titik mengetik (typing indicator).
 *   5. Mengatur scroll bar panel percakapan agar otomatis bergeser ke paling bawah (scrollTop = scrollHeight) agar balon chat baru langsung terlihat.
 *   6. Menggunakan setTimeout untuk menyimulasikan jeda berpikir manusiawi/komputer (antara 800 milidetik hingga 1500 milidetik secara acak).
 *   7. Setelah jeda berlalu:
 *      - Menghapus typing indicator dari layar.
 *      - Memanggil findAnswer() untuk mencari jawaban dari database.
 *      - Membuat chat-bubble jawaban bot (jika jawaban tidak ditemukan, bot menyarankan list rekomendasi topik pertanyaan bawaan).
 *      - Mengosongkan form textarea input pertanyaan agar siap digunakan kembali oleh pengguna.
 */
function kirimPertanyaan() {
  const nama = document.getElementById('tNama').value.trim();
  const pertanyaan = document.getElementById('tPertanyaan').value.trim();
  const feedback = document.getElementById('tFeedback');

  if (nama === '' || pertanyaan === '') {
    feedback.innerHTML = '❌ Nama dan pertanyaan harus diisi!';
    feedback.style.color = 'red';
    return;
  }

  feedback.innerHTML = '';

  const chatHistory = document.getElementById('chatHistory');

  // Add user question bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble chat-user';
  userBubble.innerHTML = `
    <div class="chat-avatar"><i class="fa fa-user"></i></div>
    <div class="chat-content">
      <div class="chat-name">${escapeHtml(nama)}</div>
      <div class="chat-text">${escapeHtml(pertanyaan)}</div>
    </div>
  `;
  chatHistory.appendChild(userBubble);

  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-bubble chat-bot';
  typingDiv.innerHTML = `
    <div class="chat-avatar bot-avatar"><i class="fa fa-robot"></i></div>
    <div class="chat-content">
      <div class="chat-name">MatriksEdu Bot</div>
      <div class="chat-text typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  chatHistory.appendChild(typingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Find answer after a short delay (simulate thinking)
  setTimeout(function () {
    chatHistory.removeChild(typingDiv);

    const answer = findAnswer(pertanyaan);
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble chat-bot';

    if (answer) {
      botBubble.innerHTML = `
        <div class="chat-avatar bot-avatar"><i class="fa fa-robot"></i></div>
        <div class="chat-content">
          <div class="chat-name">MatriksEdu Bot</div>
          <div class="chat-text">${answer}</div>
        </div>
      `;
    } else {
      botBubble.innerHTML = `
        <div class="chat-avatar bot-avatar"><i class="fa fa-robot"></i></div>
        <div class="chat-content">
          <div class="chat-name">MatriksEdu Bot</div>
          <div class="chat-text">Maaf, saya belum bisa menjawab pertanyaan tersebut. 😊 Coba tanyakan tentang topik berikut:
            <ul style="margin-top:8px;">
              <li>Pengertian matriks</li>
              <li>Jenis-jenis matriks</li>
              <li>Penjumlahan & pengurangan matriks</li>
              <li>Perkalian matriks</li>
              <li>Determinan & invers matriks</li>
              <li>Transpose matriks</li>
              <li>Aplikasi matriks</li>
            </ul>
          </div>
        </div>
      `;
    }

    chatHistory.appendChild(botBubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }, 800 + Math.random() * 700);

  // Reset form
  document.getElementById('tPertanyaan').value = '';
}
// MODE UJIAN: Fitur ujian terstruktur dengan panel nomor soal, navigasi prev/next, dan export excel
const examQuestionBank = [
  {
    q: 'Matriks A berordo 3×2. Artinya matriks A memiliki....',
    options: ['3 kolom dan 2 baris', '3 baris dan 2 kolom', '6 baris', '2 baris dan 3 kolom', '5 elemen'],
    answer: 1
  },
  {
    q: 'Jika A = [[2,1],[3,4]] dan B = [[1,2],[0,1]], maka A + B = ....',
    options: ['[[3,3],[3,5]]', '[[3,2],[3,5]]', '[[2,3],[3,5]]', '[[3,3],[3,4]]', '[[2,1],[3,4]]'],
    answer: 0
  },
  {
    q: 'Determinan matriks [[4,2],[3,1]] adalah....',
    options: ['4', '-2', '2', '10', '-4'],
    answer: 1
  },
  {
    q: 'Matriks yang semua elemennya bernilai nol disebut....',
    options: ['Matriks Identitas', 'Matriks Diagonal', 'Matriks Nol', 'Matriks Transpose', 'Matriks Simetris'],
    answer: 2
  },
  {
    q: 'Matriks identitas orde 2×2 adalah....',
    options: ['[[0,0],[0,0]]', '[[1,1],[1,1]]', '[[1,0],[0,1]]', '[[0,1],[1,0]]', '[[2,0],[0,2]]'],
    answer: 2
  },
  {
    q: 'Jika A = [[3,0],[0,5]], maka Aᵀ (transpose A) adalah....',
    options: ['[[0,3],[5,0]]', '[[3,0],[0,5]]', '[[5,0],[0,3]]', '[[0,5],[3,0]]', '[[3,5],[0,0]]'],
    answer: 1
  },
  {
    q: 'Perkalian matriks AB tidak selalu sama dengan BA. Sifat ini disebut....',
    options: ['Asosiatif', 'Tidak Komutatif', 'Distributif', 'Refleksif', 'Transitif'],
    answer: 1
  },
  {
    q: 'Syarat dua matriks dapat dikalikan adalah....',
    options: [
      'Jumlah baris A = jumlah baris B',
      'Jumlah kolom A = jumlah kolom B',
      'Jumlah kolom A = jumlah baris B',
      'Kedua matriks harus persegi',
      'Kedua matriks harus berordo sama'
    ],
    answer: 2
  },
  {
    q: 'Invers matriks A ada jika dan hanya jika....',
    options: ['det(A) = 0', 'det(A) ≠ 0', 'A adalah matriks baris', 'A adalah matriks kolom', 'A berordo 3×3'],
    answer: 1
  },
  {
    q: 'Jika det(A) = 5, maka det(2A) untuk matriks 2×2 adalah....',
    options: ['5', '10', '20', '25', '40'],
    answer: 2
  },
  {
    q: 'Matriks persegi dengan elemen diagonal utama = 1 dan elemen lainnya = 0 disebut....',
    options: ['Matriks Nol', 'Matriks Simetris', 'Matriks Identitas', 'Matriks Diagonal', 'Matriks Segitiga'],
    answer: 2
  },
  {
    q: 'Jika A = [[1,2],[3,4]], elemen a₂₁ adalah....',
    options: ['1', '2', '3', '4', '0'],
    answer: 2
  },
  {
    q: 'Hasil dari 2 × [[1,3],[2,4]] adalah....',
    options: ['[[1,3],[2,4]]', '[[2,6],[4,8]]', '[[3,5],[4,6]]', '[[2,3],[4,4]]', '[[4,6],[2,8]]'],
    answer: 1
  },
  {
    q: 'Suatu matriks A dikatakan simetris jika....',
    options: ['A = –A', 'A = Aᵀ', 'det(A) = 1', 'A × A = I', 'A = A⁻¹'],
    answer: 1
  },
  {
    q: 'Jika A = [[2,1],[5,3]], maka det(A) = ....',
    options: ['1', '6', '11', '–1', '0'],
    answer: 0
  }
];

let examQuestions = [];
let examAnswers = [];
let examSubmitted = false;
let examTimerInterval = null;
let examTimeLeft = 0;
let examTotalTime = 0;
let examStartTimeStamp = 0;
let examCurrentIndex = 0;
let examStudentName = '';

/**
 * Fungsi startExam()
 * Kegunaan: Memulai sesi "Ujian Matriks" yang lebih formal dengan input nama pengguna terlebih dahulu.
 * Cara Kerja: Mengambil teks nama dari input, menyembunyikan form nama, mengambil 5 soal acak 
 *             dari examQuestionBank, menyiapkan array jawaban, dan memanggil renderExam() serta startExamTimer().
 */
function startExam() {
  console.log('startExam called');
  const nameInput = document.getElementById('examNameInput');
  console.log('nameInput element:', nameInput);
  const name = nameInput ? nameInput.value.trim() : '';
  console.log('Captured name:', name);
  if (!name) {
    alert('DEBUG: Silakan masukkan nama terlebih dahulu!');
    return;
  }
  examStudentName = name;

  // Hide name form, show exam
  document.getElementById('examNameForm').style.display = 'none'; // Sembunyikan form nama
  const container = document.getElementById('examContainer'); // Ambil kontainer ujian
  container.style.display = 'block'; // Tampilkan kontainer

  // Clear any existing timer
  if (examTimerInterval) { // Cek jika ada timer aktif
    clearInterval(examTimerInterval); // Hapus timer lama
    examTimerInterval = null; // Reset variabel
  } // Tutup if

  // Prepare questions
  const bank = (dbQuestions && dbQuestions.examQuestions && dbQuestions.examQuestions.length > 0) ? dbQuestions.examQuestions : examQuestionBank;
  examQuestions = shuffle(bank).slice(0, 5); // Acak dan ambil 5 soal
  examAnswers = new Array(examQuestions.length).fill(null); // Siapkan array jawaban kosong
  examSubmitted = false; // Reset status submit
  examCurrentIndex = 0; // Reset indeks
  examTotalTime = 60; // 60 detik (1 menit) per soal
  examTimeLeft = examTotalTime; // Inisialisasi waktu sisa
  examStartTimeStamp = Date.now(); // Rekam waktu mulai

  renderExam(); // Render interface ujian
  startExamTimer(); // Jalankan timer
} // Tutup startExam

/**
 * Fungsi startExamTimer()
 * Kegunaan: Menjalankan hitung mundur waktu secara spesifik untuk mode Ujian.
 * Cara Kerja: Mengurangi examTimeLeft setiap detik. Jika mencapai 0, ujian otomatis dikumpulkan (auto-submit).
 */
function startExamTimer() { // Fungsi untuk menjalankan timer
  if (examTimerInterval) clearInterval(examTimerInterval); // Hapus jika ada timer berjalan
  examTimerInterval = setInterval(function () { // Jalankan interval tiap detik
    examTimeLeft--; // Kurangi waktu
    updateExamTimerDisplay(); // Update tampilan
    if (examTimeLeft <= 0) { // Jika waktu habis
      clearInterval(examTimerInterval); // Hentikan interval
      examTimerInterval = null; // Reset variabel
      if (!examSubmitted) { // Jika belum submit
        alert('⏰ Waktu habis! Jawaban akan dikirim otomatis.'); // Info waktu habis
        doSubmitExam(); // Kirim ujian otomatis
      } // Tutup if
    } // Tutup if
  }, 1000); // 1 detik per interval
} // Tutup startExamTimer

/**
 * Fungsi updateExamTimerDisplay()
 * Kegunaan: Memperbarui tampilan angka sisa detik pada layar mode ujian.
 */
function updateExamTimerDisplay() { // Fungsi update display waktu
  const timerEl = document.getElementById('examTimerValue'); // Ambil elemen timer
  if (timerEl) { // Jika ada
    timerEl.textContent = examTimeLeft; // Update teks sisa waktu
    if (examTimeLeft <= 10) { // Jika sisa waktu <= 10 detik
      timerEl.style.color = '#dc3545'; // Beri warna merah
    } else { // Selain itu
      timerEl.style.color = '#dc3545'; // Tetap merah
    } // Tutup else
  } // Tutup if
} // Tutup updateExamTimerDisplay

/**
 * Fungsi renderExam()
 * Kegunaan: Mengatur dan menampilkan antarmuka utama mode Ujian.
 * Cara Kerja: Membangun struktur layout dua kolom. Panel utama menampilkan soal aktif dan opsi radio button. 
 *             Panel samping menampilkan grid angka navigasi ke soal tertentu.
 */
function renderExam() { // Fungsi render interface ujian
  const container = document.getElementById('examContainer'); // Ambil kontainer
  const soal = examQuestions[examCurrentIndex]; // Ambil soal aktif
  const abcd = ['A', 'B', 'C', 'D', 'E']; // Opsi jawaban

  let questionHtml = ''; // String HTML soal
  // Top info bar
  questionHtml += `
    <div class="exam-layout">
      <div class="exam-main-panel">
        <div class="exam-info-bar">
          <div class="exam-name-display"><strong>Nama: ${escapeHtml(examStudentName)}</strong></div>
          <div class="exam-timer-display"><span style="color:#dc3545; font-weight:700;">Waktu: <span id="examTimerValue">${examTimeLeft}</span></span></div>
        </div>
        <div class="exam-question-area">
          <div class="exam-question-number"><strong>${examCurrentIndex + 1}. </strong></div>
          <div class="exam-question-text">${escapeHtml(soal.q)}</div>
        </div>
        <div class="exam-options-area">`; // Layout utama

  soal.options.forEach(function (opt, oIdx) { // Iterasi pilihan jawaban
    const checked = examAnswers[examCurrentIndex] === oIdx ? 'checked' : ''; // Cek pilihan aktif
    questionHtml += `
          <label class="exam-option-label" id="exam-opt-${examCurrentIndex}-${oIdx}">
            <input type="radio" name="examQ${examCurrentIndex}" value="${oIdx}" ${checked}
              onchange="selectExamAnswer(${examCurrentIndex}, ${oIdx})" />
            <span>${escapeHtml(opt)}</span>
          </label>`; // Tambah pilihan
  }); // Tutup iterasi

  questionHtml += `
        </div>
        <div class="exam-nav-buttons">
          <button class="exam-btn" onclick="examPrev()" ${examCurrentIndex === 0 ? 'disabled' : ''}>Prev</button>
          <button class="exam-btn" onclick="examNext()" ${examCurrentIndex === examQuestions.length - 1 ? 'disabled' : ''}>Next</button>
          <button class="exam-btn exam-btn-submit" onclick="submitExam()">Submit</button>
        </div>
        <div class="exam-export-area" style="margin-top:16px;">
          <button class="exam-btn exam-btn-export" onclick="exportExamExcel()" id="examExportBtn" style="display:none;">
            <i class="fa fa-file-excel"></i> Export Excel
          </button>
        </div>
      </div>
      <div class="exam-side-panel">
        <div class="exam-side-title">Soal</div>
        <div class="exam-side-grid">`; // Navigasi samping

  examQuestions.forEach(function (_, i) { // Iterasi nomor soal
    let cls = 'exam-num-btn'; // Kelas dasar
    if (i === examCurrentIndex) cls += ' active'; // Tandai aktif
    if (examAnswers[i] !== null) cls += ' answered'; // Tandai sudah dijawab
    questionHtml += `<button class="${cls}" onclick="examGoTo(${i})">${i + 1}</button>`; // Buat tombol nomor
  }); // Tutup iterasi

  questionHtml += `
        </div>
      </div>
    </div>`; // Penutup layout

  container.innerHTML = questionHtml; // Render HTML ke kontainer
} // Tutup renderExam

/**
 * Fungsi selectExamAnswer(qIdx, oIdx)
 * Kegunaan: Merekam interaksi pilihan jawaban pada layar mode ujian.
 * Parameter: qIdx (Indeks Soal), oIdx (Indeks Opsi).
 * Cara Kerja: Menyimpan indeks ke examAnswers dan memanggil renderExam() kembali untuk memperbarui warna tombol panel angka.
 */
function selectExamAnswer(qIdx, oIdx) { // Fungsi memilih jawaban
  examAnswers[qIdx] = oIdx; // Simpan pilihan
  renderExam(); // Render ulang interface
} // Tutup selectExamAnswer

/**
 * Fungsi examPrev(), examNext(), dan examGoTo(idx)
 * Kegunaan: Fitur tombol navigasi berpindah halaman (soal) pada mode Ujian.
 * Cara Kerja: Memanipulasi nilai variabel examCurrentIndex (nomor soal aktif), lalu me-render ulang UI.
 */
function examPrev() { // Fungsi navigasi sebelumnya
  if (examCurrentIndex > 0) { // Jika ada soal sebelumnya
    examCurrentIndex--; // Kurangi indeks
    renderExam(); // Render interface
  } // Tutup if
} // Tutup examPrev

function examNext() { // Fungsi navigasi selanjutnya
  if (examCurrentIndex < examQuestions.length - 1) { // Jika ada soal selanjutnya
    examCurrentIndex++; // Tambah indeks
    renderExam(); // Render interface
  } // Tutup if
} // Tutup examNext

function examGoTo(idx) { // Fungsi navigasi spesifik
  examCurrentIndex = idx; // Set indeks soal
  renderExam(); // Render interface
} // Tutup examGoTo

/**
 * Fungsi submitExam()
 * Kegunaan: Memicu proses pengumpulan ujian secara manual oleh pengguna.
 * Cara Kerja: Mengecek apakah terdapat soal yang belum dijawab. Jika ada, memberikan kotak konfirmasi "Yakin ingin submit?".
 */
function submitExam() { // Fungsi untuk submit manual
  if (examSubmitted) return; // Mencegah submit ganda
  const unanswered = examAnswers.filter(function (a) { return a === null; }).length; // Hitung soal kosong
  if (unanswered > 0) { // Jika ada soal kosong
    if (!confirm('Masih ada ' + unanswered + ' soal yang belum dijawab. Yakin ingin submit?')) return; // Konfirmasi user
  } // Tutup if
  doSubmitExam(); // Eksekusi submit
} // Tutup submitExam

/**
 * Fungsi doSubmitExam()
 * Kegunaan: Memproses pengumpulan ujian, melakukan verifikasi jawaban dengan kunci, dan memunculkan laporan ujian.
 * Cara Kerja: Menghitung persentase skor peserta, menyusun elemen HTML untuk halaman hasil akhir, serta menampilkan 
 *             kunci dan bahasan soal di bagian bawah layar. Memunculkan tombol export ke Excel.
 */
function doSubmitExam() { // Fungsi utama submit
  if (examSubmitted) return; // Mencegah double submit
  examSubmitted = true; // Tandai sudah submit

  if (examTimerInterval) { // Hentikan timer jika masih berjalan
    clearInterval(examTimerInterval); // Hentikan interval timer ujian
    examTimerInterval = null; // Mengosongkan variabel referensi timer
  } // Mengakhiri kondisi pengecekan timer

  const elapsedMs = Date.now() - examStartTimeStamp; // Menghitung selisih waktu pengerjaan dalam milidetik
  const elapsedSec = Math.floor(elapsedMs / 1000); // Mengonversi total milidetik ke satuan detik
  const elapsedMin = Math.floor(elapsedSec / 60); // Mengonversi total detik ke satuan menit
  const elapsedSecR = elapsedSec % 60; // Menghitung sisa detik setelah dikurangi menit
  const elapsedStr = String(elapsedMin).padStart(2, '0') + ':' + String(elapsedSecR).padStart(2, '0'); // Memformat string waktu pengerjaan menjadi format MM:SS

  let score = 0; // Inisialisasi skor benar dengan nilai awal nol
  examQuestions.forEach(function (soal, idx) { // Melakukan pemeriksaan untuk setiap soal ujian
    if (examAnswers[idx] === soal.answer) score++; // Menambah skor jika jawaban siswa sama dengan kunci jawaban
  }); // Mengakhiri perulangan pemeriksaan soal

  const persen = Math.round((score / examQuestions.length) * 100); // Menghitung persentase skor hasil ujian

  // Gamification rewards for Exam!
  if (window.gainXP) { // Cek apakah fungsi gainXP tersedia secara global
    if (persen >= 75) { // Jika nilai persentase kelulusan >= 75
      window.gainXP(100); // Berikan hadiah 100 XP
      if (persen === 100) { // Jika nilai sempurna 100
        window.unlockBadge('exam'); // Buka lencana khusus ujian
      } // Tutup if lencana
    } else { // Jika nilai kurang dari 75
      window.gainXP(50); // Berikan hadiah 50 XP
    } // Tutup if reward
  } // Tutup if gainXP

  let feedbackText = ''; // Variabel teks feedback hasil ujian
  let feedbackClass = ''; // Variabel kelas CSS untuk pewarnaan feedback

  if (persen >= 80) { // Jika skor >= 80
    feedbackText = '🌟 Luar biasa! Kamu menguasai materi matriks!'; // Pesan feedback sangat baik
    feedbackClass = 'great'; // Kelas CSS khusus warna hijau/sukses
  } else if (persen >= 60) { // Jika skor >= 60
    feedbackText = '👍 Cukup baik! Terus belajar ya!'; // Pesan feedback sedang
    feedbackClass = 'ok'; // Kelas CSS khusus warna kuning/peringatan
  } else { // Selain itu jika skor < 60
    feedbackText = '📖 Jangan menyerah! Ulangi materi dan coba lagi.'; // Pesan feedback remedial
    feedbackClass = 'bad'; // Kelas CSS khusus warna merah/gagal
  } // Tutup kondisi feedback

  const abcd = ['A', 'B', 'C', 'D', 'E']; // Opsi huruf untuk jawaban pilihan ganda
  const container = document.getElementById('examContainer'); // Ambil kontainer hasil ujian dari DOM

  let html = `
    <div class="quiz-result">
      <h3>Hasil Ujian Matriks</h3>
      <span class="quiz-score">${persen}%</span>
      <p><strong>Nama:</strong> ${escapeHtml(examStudentName)}</p>
      <p>Kamu menjawab benar <strong>${score} dari ${examQuestions.length}</strong> soal.</p>
      <p class="quiz-feedback ${feedbackClass}">${feedbackText}</p>
      <div class="quiz-time-result">
        <i class="fa fa-clock"></i>
        <span>Waktu pengerjaan: <strong>${elapsedStr}</strong></span>
      </div>
      <button class="quiz-start-btn" style="margin-top:18px;" onclick="resetExam()">🔄 Ulangi Ujian</button>
    </div>
  `; // Menyusun template string HTML untuk tampilan skor hasil ujian

  if (persen >= 75) { // Jika nilai persentase kelulusan >= 75
    html += `
      <div style="background:#fffbeb; border:2px solid #fcd34d; border-radius:12px; padding:20px; margin-top:20px; text-align:center; animation: premiumEnter 0.4s ease;">
        <h4 style="color:#d97706; font-family:'Playfair Display', serif; font-size:18px; margin-bottom:8px;"><i class="fa fa-certificate"></i> Selamat! Kamu Berhak Mendapatkan Sertifikat</h4>
        <p style="font-size:13px; color:#5c4a24; margin-bottom:15px;">Kamu berhasil lulus Ujian Kompetensi Matriks dengan skor <strong>${persen}%</strong>. Silakan unduh sertifikat kelulusanmu di bawah ini.</p>
        <div style="margin: 15px auto; max-width: 500px; border: 3px solid #b45309; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <canvas id="certCanvas" width="800" height="565" style="width:100%; display:block; background:#fff;"></canvas>
        </div>
        <button class="quiz-start-btn" style="background:#d97706; color:#fff; border:none; padding:10px 24px; box-shadow:none; margin-top:10px;" onclick="downloadCertificate()"><i class="fa fa-download"></i> Unduh Sertifikat (PNG High-Res)</button>
      </div>
    `; // Menambahkan tampilan kartu sertifikat kelulusan
    setTimeout(() => { // Menjalankan fungsi dengan penundaan waktu
      if (window.drawCertificate) { // Memeriksa jika fungsi drawCertificate tersedia secara global
        window.drawCertificate(examStudentName, persen); // Memanggil fungsi menggambar sertifikat kelulusan
      } // Mengakhiri pengecekan fungsi drawCertificate
    }, 200); // Mengatur delay waktu pemanggilan selama 200 milidetik
  } // Mengakhiri kondisi kelulusan nilai >= 75

  // Show export button
  html += `
    <div style="text-align:center; margin-top:20px;">
      <button class="exam-btn exam-btn-export" onclick="exportExamExcel()">
        <i class="fa fa-file-excel"></i> Export Excel
      </button>
    </div>`; // Menambahkan tombol ekspor hasil ujian ke format Excel

  container.innerHTML = html; // Memasukkan seluruh string kode HTML hasil ke dalam kontainer ujian
  container.scrollIntoView({ behavior: 'smooth' }); // Melakukan scroll halaman secara mulus ke arah kontainer hasil
} // Mengakhiri fungsi utama doSubmitExam

/**
 * Fungsi resetExam()
 * Kegunaan: Digunakan untuk mereset seluruh form ujian dan mengembalikannya ke layar pengisian Nama.
 */
function resetExam() { // Fungsi reset ujian
  if (examTimerInterval) { // Hentikan timer jika masih berjalan
    clearInterval(examTimerInterval); // Hapus interval timer ujian aktif
    examTimerInterval = null; // Mengosongkan variabel referensi timer interval
  } // Mengakhiri kondisi pengecekan timer
  document.getElementById('examNameForm').style.display = 'block'; // Menampilkan kembali form pengisian nama ujian
  document.getElementById('examContainer').style.display = 'none'; // Menyembunyikan kontainer lembar soal ujian
  document.getElementById('examContainer').innerHTML = ''; // Mengosongkan seluruh konten di kontainer ujian
  document.getElementById('sec-ujianMatriks').scrollIntoView({ behavior: 'smooth' }); // Melakukan scroll halaman secara halus ke bagian atas halaman ujian
} // Mengakhiri fungsi resetExam

/**
 * Fungsi exportExamExcel()
 * Kegunaan: Menyediakan fitur pengunduhan (download) rekaman hasil ujian peserta ke file eksternal.
 * Cara Kerja: Membentuk teks data terstruktur dengan format CSV (Comma-Separated Values) yang berisi Nama, Skor, 
 *             Pertanyaan, Jawaban User, Jawaban Benar, dan Statusnya. Menggunakan metode antarmuka Blob untuk
 *             mengonversi string menjadi file dan memaksa browser melakukan unduhan instan.
 */
function exportExamExcel() { // Fungsi untuk mengekspor data hasil ujian siswa ke format Excel/CSV
  const abcd = ['A', 'B', 'C', 'D', 'E']; // Opsi huruf untuk jawaban pilihan ganda
  let score = 0; // Inisialisasi skor benar dengan nilai awal nol
  examQuestions.forEach(function (soal, idx) { // Melakukan looping/iterasi untuk setiap soal ujian
    if (examAnswers[idx] === soal.answer) score++; // Menambah skor jika jawaban siswa sama dengan kunci jawaban
  }); // Mengakhiri proses perulangan pemeriksaan jawaban
  const persen = Math.round((score / examQuestions.length) * 100); // Menghitung nilai persentase kelulusan ujian

  // Build CSV content
  let csv = '\uFEFF'; // Menambahkan Byte Order Mark (BOM) UTF-8 agar file CSV terbaca dengan baik di Microsoft Excel
  csv += 'Hasil Ujian Matriks - MatriksEdu\n'; // Menambahkan judul lembar hasil ujian
  csv += 'Nama Peserta,' + examStudentName + '\n'; // Menulis nama siswa pada file CSV
  csv += 'Skor,' + score + '/' + examQuestions.length + ' (' + persen + '%)\n'; // Menulis perolehan skor ujian dalam bentuk persentase
  csv += '\n'; // Menambahkan baris kosong sebagai pemisah
  csv += 'No,Soal,Jawaban Anda,Jawaban Benar,Status\n'; // Menulis baris judul kolom (header) tabel hasil ujian

  examQuestions.forEach(function (soal, idx) { // Memulai looping baris data soal untuk diisi ke CSV
    const chosen = examAnswers[idx]; // Mengambil indeks jawaban yang dipilih oleh siswa
    const correct = soal.answer; // Mengambil indeks kunci jawaban yang benar
    const isCorrect = chosen === correct; // Memeriksa apakah status jawaban benar atau salah
    const chosenText = chosen !== null && chosen >= 0 ? abcd[chosen] + '. ' + soal.options[chosen] : 'Tidak dijawab'; // Menyusun string opsi jawaban siswa
    const correctText = abcd[correct] + '. ' + soal.options[correct]; // Menyusun string opsi kunci jawaban benar
    // Escape CSV fields
    const qText = '"' + soal.q.replace(/"/g, '""') + '"'; // Meng-escape karakter tanda kutip pada teks soal
    const cText = '"' + chosenText.replace(/"/g, '""') + '"'; // Meng-escape karakter tanda kutip pada jawaban siswa
    const crText = '"' + correctText.replace(/"/g, '""') + '"'; // Meng-escape karakter tanda kutip pada kunci jawaban
    csv += (idx + 1) + ',' + qText + ',' + cText + ',' + crText + ',' + (isCorrect ? 'Benar' : 'Salah') + '\n'; // Menggabungkan baris data baru ke string CSV
  }); // Mengakhiri iterasi pengisian data soal CSV

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); // Membuat objek Blob baru dari data string CSV dengan encoding UTF-8
  const url = URL.createObjectURL(blob); // Membuat URL objek blob sementara untuk unduhan
  const a = document.createElement('a'); // Membuat elemen link virtual <a> secara dinamis
  a.href = url; // Menghubungkan link ke URL objek blob sementara
  a.download = 'Hasil_Ujian_' + examStudentName.replace(/\s+/g, '_') + '.csv'; // Mengatur nama file CSV hasil ujian dengan menghilangkan spasi
  document.body.appendChild(a); // Memasukkan elemen link virtual ke dalam body halaman
  a.click(); // Memicu aksi klik secara terprogram untuk memulai unduhan
  document.body.removeChild(a); // Menghapus elemen link virtual setelah unduhan dipicu
  URL.revokeObjectURL(url); // Menghapus referensi URL objek blob untuk membebaskan memori browser
}

/**
 * Fungsi: showMedia(type, name)
 * Kegunaan: Mengatur modul pemutaran media interaktif(Multimedia Center) untuk video dan gambar.
 * Parameter:
 * - type: Jenis media, bernilai 'video' atau 'foto'.
 * - name: Nama berkas media lokal atau ID video YouTube atau lokasi path file foto.
 * Cara Kerja:
 * 1. Memicu perpindahan halaman SPA ke penampil media('media-viewer').
 * 2. Membaca elemen judul, label, dan kontainer konten media dari DOM.
 * 3. Jika type = 'video':
 * - Membuat elemen video HTML5 standar dengan atribut controls untuk berkas video lokal mp4('pengertian' atau 'operasi').
 * - Membuat elemen iframe YouTube dengan tautan embed resmi jika memuat playlist video YouTube.
 * - Menyisipkan "Kartu Pembahasan Video Premium"(video - discussion - card) di bawah video yang berisi penjelasan kontekstual ilmiah mengenai inti video tersebut.
 * 4. Jika type = 'foto':
 * - Membuat elemen < img > responsif dengan gaya penampil galeri.
 * - Melakukan penanganan error(onerror fallback): jika gambar gagal dimuat, tampilkan gambar placeholder 'file/images.png' agar tidak merusak tampilan.
 */
function showMedia(type, name) { // Mendefinisikan fungsi untuk menampilkan file media
  showContent('media-viewer'); // Membuka bagian halaman penampil media di SPA
  const titleEl = document.getElementById('mediaViewerTitle'); // Mengambil elemen judul penampil media
  const labelEl = document.getElementById('mediaViewerLabel'); // Mengambil elemen label penampil media
  const contentEl = document.getElementById('mediaViewerContent'); // Mengambil elemen kontainer utama konten media
  if (!titleEl || !labelEl || !contentEl) return; // Menghentikan fungsi jika elemen DOM tidak ditemukan

  if (type === 'video') {
    titleEl.innerHTML = '<i class="fa fa-video"></i> Penampil Video'; // Mengisi judul halaman penampil video beserta ikon video
    if (name === 'pengertian') { // Jika nama media adalah video pengertian matriks
      labelEl.textContent = 'Video: Pengertian Matriks (Lokal)'; // Memberi label penampil video lokal pengertian
      contentEl.innerHTML = '<video controls width="100%" style="max-height:480px; border-radius:10px;"><source src="pengertian matriks.mp4" type="video/mp4">Browser tidak mendukung video HTML5.</video>' +
        '<div class="video-discussion-card">' +
        '  <h4 style="color:#b27b1e; margin: 0 0 12px 0; font-size:15px; font-weight:700;"><i class="fa fa-book"></i> Pembahasan Video: Konsep & Pengertian Dasar Matriks</h4>' +
        '  <p style="font-size:13px; line-height:1.6; color:#444; margin-bottom:12px;">Dalam video pembelajaran ini, kita mempelajari dasar-dasar penyusunan matriks yang meliputi beberapa konsep kunci:</p>' +
        '  <ul style="font-size:12.5px; line-height:1.6; color:#555; padding-left:20px; display:flex; flex-direction:column; gap:8px; margin: 0;">' +
        '    <li><strong>Definisi Matriks:</strong> Kumpulan bilangan yang disusun dalam baris (arah horizontal) dan kolom (arah vertikal) serta ditempatkan di dalam tanda kurung siku <code>[ ]</code> atau tanda kurung biasa <code>( )</code>.</li>' +
        '    <li><strong>Ordo Matriks:</strong> Menyatakan ukuran dari matriks tersebut, dituliskan sebagai <strong>m × n</strong>, di mana <strong>m</strong> mewakili jumlah baris dan <strong>n</strong> mewakili jumlah kolom.</li>' +
        '    <li><strong>Elemen Matriks:</strong> Setiap angka/nilai yang berada di dalam matriks. Elemen pada baris ke-i dan kolom ke-j dilambangkan dengan <strong>a<sub>ij</sub></strong>.</li>' +
        '  </ul>' +
        '</div>'; // Memasukkan HTML video lokal pengertian matriks beserta kartu pembahasan konsep
    } else if (name === 'operasi') { // Jika nama media adalah video operasi matriks
      labelEl.textContent = 'Video: Operasi Matriks (Lokal)'; // Memberi label penampil video lokal operasi
      contentEl.innerHTML = '<video controls width="100%" style="max-height:480px; border-radius:10px;"><source src="operasi matriks.mp4" type="video/mp4">Browser tidak mendukung video HTML5.</video>' +
        '<div class="video-discussion-card">' +
        '  <h4 style="color:#b27b1e; margin: 0 0 12px 0; font-size:15px; font-weight:700;"><i class="fa fa-calculator"></i> Pembahasan Video: Operasi Penjumlahan & Pengurangan Matriks</h4>' +
        '  <p style="font-size:13px; line-height:1.6; color:#444; margin-bottom:12px;">Video ini membahas operasi aritmetika penjumlahan dan pengurangan dua buah matriks dengan aturan utama berikut:</p>' +
        '  <ul style="font-size:12.5px; line-height:1.6; color:#555; padding-left:20px; display:flex; flex-direction:column; gap:8px; margin: 0;">' +
        '    <li><strong>Syarat Utama:</strong> Dua buah matriks hanya bisa dijumlahkan atau dikurangkan jika dan hanya jika keduanya memiliki <strong>ordo yang sama persis</strong> (dimensinya harus cocok).</li>' +
        '    <li><strong>Metode Perhitungan:</strong> Jumlahkan atau kurangkan elemen-elemen yang <strong>seletak</strong> (posisi baris dan kolom yang bersesuaian). Misalnya: <em>c<sub>11</sub> = a<sub>11</sub> + b<sub>11</sub></em>.</li>' +
        '    <li><strong>Sifat Komutatif & Asosiatif:</strong> Operasi penjumlahan bersifat komutatif (<em>A + B = B + A</em>), namun operasi pengurangan <strong>tidak berlaku sifat komutatif</strong> (<em>A - B ≠ B - A</em>).</li>' +
        '  </ul>' +
        '</div>'; // Memasukkan HTML video lokal operasi matriks beserta kartu pembahasan konsep
    } else if (name === 'yt1' || name === 'yt-pengenalan') { // Jika nama media adalah video youtube pengenalan
      labelEl.textContent = 'YouTube: Pengenalan Konsep Matriks'; // Memberi label penampil video youtube pengenalan
      contentEl.innerHTML = '<iframe width="100%" height="420" src="https://www.youtube.com/embed/xyAuNHPsq-g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.05);"></iframe>' +
        '<div class="video-discussion-card">' +
        '  <h4 style="color:#b27b1e; margin: 0 0 12px 0; font-size:15px; font-weight:700;"><i class="fa fa-graduation-cap"></i> Pembahasan Video: Pengenalan Konsep Matriks & Notasi Ordo</h4>' +
        '  <p style="font-size:13px; line-height:1.6; color:#444; margin-bottom:12px;">Dokumentasi YouTube ini memperkenalkan pemahaman konseptual matriks dan kegunaan praktisnya:</p>' +
        '  <ul style="font-size:12.5px; line-height:1.6; color:#555; padding-left:20px; display:flex; flex-direction:column; gap:8px; margin: 0;">' +
        '    <li><strong>Notasi Formal:</strong> Matriks dinotasikan dengan huruf kapital (seperti <strong>A, B, C</strong>). Anggota bilangan di dalamnya ditulis di antara tanda kurung siku.</li>' +
        '    <li><strong>Aplikasi Nyata:</strong> Matriks digunakan untuk menyederhanakan penyajian data tabel yang kompleks, memecahkan sistem persamaan linear ganda secara aljabar, hingga pemrosesan citra digital di komputer.</li>' +
        '  </ul>' +
        '</div>'; // Memasukkan HTML iframe youtube pengenalan matriks beserta kartu pembahasan konsep
    } else if (name === 'yt2' || name === 'yt-operasi') { // Jika nama media adalah video youtube operasi
      labelEl.textContent = 'YouTube: Operasi & Perkalian Matriks'; // Memberi label penampil video youtube operasi
      contentEl.innerHTML = '<iframe width="100%" height="420" src="https://www.youtube.com/embed/rowWM-MijXU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.05);"></iframe>' +
        '<div class="video-discussion-card">' +
        '  <h4 style="color:#b27b1e; margin: 0 0 12px 0; font-size:15px; font-weight:700;"><i class="fa fa-multiply"></i> Pembahasan Video: Perkalian Skalar & Perkalian Dua Matriks</h4>' +
        '  <p style="font-size:13px; line-height:1.6; color:#444; margin-bottom:12px;">Materi video ini menjelaskan operasi perkalian matriks dengan skalar serta perkalian antar dua matriks:</p>' +
        '  <ul style="font-size:12.5px; line-height:1.6; color:#555; padding-left:20px; display:flex; flex-direction:column; gap:8px; margin: 0;">' +
        '    <li><strong>Perkalian Skalar (k · A):</strong> Mengalikan setiap elemen matriks dengan konstanta/skalar <strong>k</strong>.</li>' +
        '    <li><strong>Perkalian Dua Matriks (A × B):</strong> Syarat utamanya adalah <strong>jumlah kolom matriks pertama (A) harus sama dengan jumlah baris matriks kedua (B)</strong>. Hasilnya dihitung menggunakan metode <strong>"baris dikali kolom"</strong>.</li>' +
        '    <li><strong>Sifat Penting:</strong> Perkalian dua matriks bersifat <strong>tidak komutatif</strong> (<em>A × B ≠ B × A</em>).</li>' +
        '  </ul>' +
        '</div>'; // Memasukkan HTML iframe youtube operasi matriks beserta kartu pembahasan konsep
    }
  } else if (type === 'foto') { // Mengecek jika jenis media yang dipilih adalah foto/infografis
    titleEl.innerHTML = '<i class="fa fa-image"></i> Penampil Foto & Infografis'; // Mengisi judul halaman penampil foto beserta ikon gambar
    const src = name; // Menyimpan path file gambar ke dalam variabel src
    const fname = name.substring(name.lastIndexOf('/') + 1); // Mengambil nama file asli dari path
    labelEl.textContent = 'Foto: ' + fname; // Mengisi teks label dengan nama file foto
    contentEl.innerHTML = '<img src="' + src + '" alt="' + fname + '" style="max-width:100%;max-height:500px;object-fit:contain;border-radius:10px;display:block;margin:0 auto;" onerror="this.src=\'file/images.png\';"/>'; // Memasukkan tag img HTML dengan penanganan error gambar rusak
  }
}

/**
 * Fungsi: toggleMediaChecklist(type, name)
 * Kegunaan: Menghubungkan interaksi antara Checkbox Checklist Media di sidebar dengan Penampil Media Utama.
 * Parameter:
 *   - type: Jenis media ('video' atau 'foto').
 *   - name: Nama berkas media.
 * Cara Kerja:
 *   1. Menganalisis nama media untuk menentukan ID elemen Checkbox HTML terkait.
 *   2. Memeriksa status elemen Checkbox:
 *      - Jika dicentang (checked = true): Memanggil fungsi showMedia(type, name) untuk menampilkan berkas tersebut ke layar penampil.
 *      - Jika dimatikan (checked = false): Memeriksa apakah media tersebut sedang aktif ditayangkan di penampil media. Jika ya, kosongkan kontainer penampil secara instan dan beri keterangan teks "Media dinonaktifkan".
 */
function toggleMediaChecklist(type, name) { // Mendefinisikan fungsi toggle checkbox media
  let chkId = ''; // Menginisialisasi string kosong untuk ID checkbox
  if (type === 'video') { // Mengecek jika media berupa video
    if (name === 'pengertian') chkId = 'chk-video-pengertian'; // Menentukan ID checkbox video pengertian lokal
    else if (name === 'operasi') chkId = 'chk-video-operasi'; // Menentukan ID checkbox video operasi lokal
    else if (name === 'yt-pengenalan') chkId = 'chk-video-yt-pengenalan'; // Menentukan ID checkbox video youtube pengenalan
    else if (name === 'yt-operasi') chkId = 'chk-video-yt-operasi'; // Menentukan ID checkbox video youtube operasi
  } else if (type === 'foto') { // Mengecek jika media berupa foto
    if (name === 'Matriks baris.jpg') chkId = 'chk-foto-baris'; // Menentukan ID checkbox foto matriks baris
    else if (name === 'gambar matriks.webp') chkId = 'chk-foto-gambar'; // Menentukan ID checkbox foto gambar matriks
    else if (name === 'file/img_determinant.png') chkId = 'chk-foto-det'; // Menentukan ID checkbox foto determinan
    else if (name === 'file/img_multiplication.png') chkId = 'chk-foto-mult'; // Menentukan ID checkbox foto perkalian
    else if (name === 'file/img_real_world.png') chkId = 'chk-foto-real'; // Menentukan ID checkbox foto aplikasi riil
  }

  const chk = document.getElementById(chkId); // Mengambil elemen checkbox dari DOM berdasarkan ID
  if (chk && chk.checked) { // Jika elemen checkbox ditemukan dan dalam keadaan dicentang
    showMedia(type, name); // Memanggil fungsi showMedia untuk menampilkan media tersebut
  } else { // Jika checkbox tidak dicentang
    const activeLabel = document.getElementById('mediaViewerLabel').textContent; // Membaca teks label media yang sedang aktif ditonton
    const cleanName = name.substring(name.lastIndexOf('/') + 1); // Mengambil nama file bersih dari path untuk pembandingan
    if (activeLabel && activeLabel.includes(cleanName)) { // Jika media yang sedang dinonaktifkan adalah yang sedang aktif di layar
      document.getElementById('mediaViewerContent').innerHTML = `<p style="color:#888;">Media dinonaktifkan. Pilih media lain dari sidebar atau checklist.</p>`; // Mengisi kontainer konten dengan teks pemberitahuan dinonaktifkan
      document.getElementById('mediaViewerLabel').textContent = ''; // Mengosongkan label media aktif
    } // Mengakhiri kondisi activeLabel
  } // Mengakhiri kondisi else checkbox tidak dicentang
} // Mengakhiri fungsi toggleMediaChecklist

/**
 * Fungsi: showPDF(filePath)
 * Kegunaan: Mengaktifkan modul penampil dokumen digital PDF terintegrasi (PDF Viewer Module).
 * Parameter:
 *   - filePath: Alamat path dokumen PDF lokal yang ingin dibuka siswa (contoh: 'modul/matriks_lengkap.pdf').
 * Cara Kerja:
 *   1. Berpindah halaman ke panel penampil PDF SPA ('pdf-viewer').
 *   2. Memotong teks alamat path untuk memperoleh nama file asli sebagai judul.
 *   3. Memperbarui teks info navigasi lokasi path.
 *   4. Mengisi properti src pada elemen iframe pendukung PDF (pdfIframe) dengan filePath untuk merender dokumen PDF langsung di browser.
 */
function showPDF(filePath) { // Mendefinisikan fungsi menampilkan dokumen PDF
  showContent('pdf-viewer'); // Membuka bagian halaman penampil PDF di sistem SPA

  const titleEl = document.getElementById('pdfViewerTitle'); // Mengambil elemen judul penampil PDF dari DOM
  const descEl = document.getElementById('pdfViewerDesc'); // Mengambil elemen keterangan lokasi berkas PDF dari DOM
  const iframeEl = document.getElementById('pdfIframe'); // Mengambil elemen iframe tempat merender PDF dari DOM

  if (!titleEl || !descEl || !iframeEl) return; // Menghentikan eksekusi jika ada salah satu elemen DOM yang tidak ditemukan

  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1); // Memotong string alamat path untuk mengambil nama file PDF saja
  titleEl.innerHTML = `<i class="fa fa-file-pdf"></i> Penampil PDF: ${fileName}`; // Mengisi judul penampil dengan nama file dan ikon PDF
  descEl.textContent = `Menampilkan dokumen dari lokasi: ${filePath}`; // Menampilkan keterangan teks berisi alamat file path lengkap

  iframeEl.src = filePath; // Mengubah properti source iframe untuk memuat file PDF yang dipilih
}

// =============================================
// LKPD INTERAKTIF â€” Bank Soal Manual + Acak
// =============================================

const lkpdBank = [
  {
    id: 'lk1', title: 'LKPD 1: Pengertian & Ordo Matriks',
    instructions: 'Perhatikan matriks berikut, lalu jawab pertanyaan di bawah ini.',
    type: 'concept',
    matrix: [[3, -1, 5], [0, 4, 2]],
    questions: [
      { q: 'Berapa jumlah baris matriks di atas?', answer: '2' },
      { q: 'Berapa jumlah kolom matriks di atas?', answer: '3' },
      { q: 'Tuliskan ordo matriks di atas (format: mxn):', answer: '2x3' },
      { q: 'Berapa nilai elemen a12 (baris 1, kolom 2)?', answer: '-1' },
      { q: 'Berapa nilai elemen a23 (baris 2, kolom 3)?', answer: '2' }
    ]
  },
  {
    id: 'lk2', title: 'LKPD 2: Penjumlahan Matriks 2×2',
    instructions: 'Hitung hasil A + B dengan mengisi kotak hasil di sebelah kanan.',
    type: 'matrix_addition',
    matrixA: [[3, 5], [1, 2]],
    matrixB: [[2, -1], [4, 0]],
    correctAnswer: [[5, 4], [5, 2]]
  },
  {
    id: 'lk3', title: 'LKPD 3: Determinan Matriks 2×2',
    instructions: 'Diberikan matriks C. Ikuti langkah berikut untuk menghitung det(C).',
    type: 'concept',
    matrix: [[6, 2], [3, 2]],
    questions: [
      { q: 'Berapa nilai a×d (diagonal utama: 6×2)?', answer: '12' },
      { q: 'Berapa nilai b×c (diagonal samping: 2×3)?', answer: '6' },
      { q: 'det(C) = a×d − b×c = 12 − 6 = ?', answer: '6' }
    ]
  },
  {
    id: 'lk4', title: 'LKPD 4: Pengurangan Matriks 2×2',
    instructions: 'Hitung hasil A − B dengan mengisi kotak hasil.',
    type: 'matrix_addition',
    matrixA: [[7, 3], [5, 9]],
    matrixB: [[2, 1], [3, 4]],
    correctAnswer: [[5, 2], [2, 5]]
  },
  {
    id: 'lk5', title: 'LKPD 5: Jenis-Jenis Matriks',
    instructions: 'Jawab pertanyaan tentang jenis-jenis matriks berikut.',
    type: 'concept',
    matrix: [[1, 0], [0, 1]],
    questions: [
      { q: 'Matriks di atas disebut matriks apa?', answer: 'identitas' },
      { q: 'Berapa elemen pada diagonal utama?', answer: '1' },
      { q: 'Apakah matriks di atas berbentuk persegi? (ya/tidak)', answer: 'ya' },
      { q: 'Berapa ordo matriks di atas (format: mxn)?', answer: '2x2' }
    ]
  },
  {
    id: 'lk6', title: 'LKPD 6: Perkalian Skalar',
    instructions: 'Diberikan matriks A dan skalar k=3. Hitung 3×A dan isi hasilnya.',
    type: 'matrix_addition',
    matrixA: [[2, 4], [1, 3]],
    matrixB: [[0, 0], [0, 0]],
    correctAnswer: [[6, 12], [3, 9]],
    customInstructions: '3 × Matriks A = ?  (abaikan kotak B, langsung isi hasil)'
  },
  {
    id: 'lk7', title: 'LKPD 7: Transpose Matriks',
    instructions: 'Diberikan matriks P berikut. Jawab pertanyaan tentang transposenya.',
    type: 'concept',
    matrix: [[1, 2, 3], [4, 5, 6]],
    questions: [
      { q: 'Ordo matriks P sebelum di-transpose (format: mxn)?', answer: '2x3' },
      { q: 'Ordo matriks Pᵀ setelah di-transpose (format: mxn)?', answer: '3x2' },
      { q: 'Berapa nilai elemen baris 1 kolom 2 pada Pᵀ?', answer: '4' },
      { q: 'Berapa nilai elemen baris 3 kolom 1 pada Pᵀ?', answer: '3' }
    ]
  },
  {
    id: 'lk8', title: 'LKPD 8: Penjumlahan Matriks 3×3',
    instructions: 'Hitung hasil A + B untuk matriks 2×3 berikut.',
    type: 'matrix_addition',
    matrixA: [[1, 2, 3], [4, 5, 6]],
    matrixB: [[7, 8, 9], [1, 2, 3]],
    correctAnswer: [[8, 10, 12], [5, 7, 9]]
  },
  {
    id: 'lk9', title: 'LKPD 9: Matriks Simetris',
    instructions: 'Perhatikan matriks S berikut dan jawab pertanyaan.',
    type: 'concept',
    matrix: [[1, 2, 3], [2, 5, 4], [3, 4, 6]],
    questions: [
      { q: 'Apakah S = Sᵀ? (ya/tidak)', answer: 'ya' },
      { q: 'Matriks yang memenuhi S = Sᵀ disebut matriks apa?', answer: 'simetris' },
      { q: 'Berapa nilai elemen a₁₂?', answer: '2' },
      { q: 'Berapa nilai elemen a₂₁? (seharusnya sama dengan a₁₂)', answer: '2' }
    ]
  },
  {
    id: 'lk10', title: 'LKPD 10: Invers Matriks 2×2',
    instructions: 'Diberikan matriks M. Ikuti langkah menghitung invers M⁻¹.',
    type: 'concept',
    matrix: [[4, 3], [2, 2]],
    questions: [
      { q: 'Hitung det(M) = (4×2) − (3×2) = ?', answer: '2' },
      { q: 'Karena det ≠ 0, apakah M memiliki invers? (ya/tidak)', answer: 'ya' },
      { q: 'Elemen a pada M⁻¹ = (1/det)×d = (1/2)×2 = ?', answer: '1' },
      { q: 'Elemen b pada M⁻¹ = (1/det)×(-b) = (1/2)×(-3) = ?', answer: '-1.5' }
    ]
  }
];

let activeLKPDSet = [];  // soal yang sedang aktif (bisa diacak)

/**
 * Fungsi: showLKPDInteractive()
 * Kegunaan: Menampilkan layar utama Lembar Kerja Peserta Didik (LKPD) Interaktif.
 * Cara Kerja:
 *   1. Berpindah halaman menggunakan sistem SPA ke section 'lkpd-interaktif'.
 *   2. Membaca bank data LKPD (dbLkpd dari database JSON, atau fallback lkpdBank jika luring/offline).
 *   3. Menyalin isi data tersebut ke dalam array activeLKPDSet agar urutan asli aman dari mutasi langsung.
 *   4. Memicu fungsi renderLKPDPage() untuk membangun layout booklet kertas digital.
 */
function showLKPDInteractive() {
  showContent('lkpd-interaktif');
  const bank = (dbLkpd && dbLkpd.length > 0) ? dbLkpd : lkpdBank;
  activeLKPDSet = bank.slice(); // Copy bank data
  renderLKPDPage();
}

/**
 * Fungsi: shuffleLKPD()
 * Kegunaan: Mengacak urutan penempatan lembar kegiatan belajar LKPD secara dinamis.
 * Cara Kerja:
 *   1. Membaca bank data LKPD default.
 *   2. Memanggil fungsi shuffle() berbasis algoritma Fisher-Yates untuk mengacak susunan indeks lembaran LKPD.
 *   3. Memanggil renderLKPDPage() untuk merender ulang booklet digital dengan urutan halaman kegiatan belajar yang baru.
 */
function shuffleLKPD() {
  const bank = (dbLkpd && dbLkpd.length > 0) ? dbLkpd : lkpdBank;
  activeLKPDSet = shuffle(bank.slice());
  renderLKPDPage();
}

/**
 * Fungsi: getSubscript(num)
 * Kegunaan: Mengonversi karakter angka normal menjadi format simbol subscript kecil matematika (contoh: '1' -> '₁', '12' -> '₁₂').
 * Parameter:
 *   - num: Angka atau string angka yang akan diubah indeksnya.
 * Returns:
 *   - String angka yang sudah berformat subscript matematika.
 */
function getSubscript(num) {
  const subs = { '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅' };
  return num.toString().split('').map(c => subs[c] || c).join('');
}

/**
 * Fungsi: generateRandomLKPD()
 * Kegunaan: Fitur premium untuk membangkitkan (generate) parameter angka, ordo, dan soal matriks secara dinamis dan acak secara real-time.
 * Cara Kerja:
 *   1. Memiliki fungsi pembantu lokal randInt() untuk membangkitkan bilangan bulat acak dalam rentang minimum/maximum.
 *   2. Memiliki fungsi pembantu randMatrix() untuk membuat matriks berordo m x n dengan elemen angka acak.
 *   3. Membangkitkan nilai baru secara dinamis untuk seluruh 10 Kegiatan Belajar LKPD:
 *      - Kegiatan 1: Ordo matriks baris dan kolom diacak antara 2x2 hingga 3x3. Kunci jawaban letak elemen (a₁₂, dll) dihitung otomatis secara presisi.
 *      - Kegiatan 2 & 4: Angka elemen matriks A dan B diacak. Kunci hasil penjumlahan dan pengurangan dihitung secara matematis.
 *      - Kegiatan 3 & 10: Angka diagonal diacak. Rumus determinan (ad - bc) dan invers dihitung secara dinamis.
 *      - Kegiatan 5, 7, & 9: Mengacak elemen matriks identitas, transpose, dan simetris secara dinamis.
 *      - Kegiatan 6: Mengacak konstanta skalar k dan matriks A. Rumus k * A dihitung otomatis sebagai kunci jawaban.
 *   4. Menyimpan susunan data LKPD acak baru ini ke dalam activeLKPDSet.
 *   5. Memanggil renderLKPDPage() untuk menampilkan lembaran soal LKPD baru dengan visual yang segar and dinamis.
 */
function generateRandomLKPD() {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randMatrix(rows, cols, min = -9, max = 9) {
    const mat = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(randInt(min, max));
      }
      mat.push(row);
    }
    return mat;
  }

  const randomizedSet = [];

  // 1. LKPD 1: Konsep & Ordo Matriks
  const m1 = randInt(2, 3);
  const n1 = randInt(2, 3);
  const mat1 = randMatrix(m1, n1, -5, 9);
  const indices1 = [];
  for (let r = 1; r <= m1; r++) {
    for (let c = 1; c <= n1; c++) {
      indices1.push({ r, c });
    }
  }
  const shuffledIndices1 = shuffle(indices1);
  const q1_1 = shuffledIndices1[0];
  const q1_2 = shuffledIndices1[1];

  randomizedSet.push({
    id: 'lk1',
    title: 'LKPD 1: Pengertian & Ordo Matriks',
    instructions: 'Perhatikan matriks berikut, lalu jawab pertanyaan di bawah ini.',
    type: 'concept',
    matrix: mat1,
    questions: [
      { q: 'Berapa jumlah baris matriks di atas?', answer: m1.toString() },
      { q: 'Berapa jumlah kolom matriks di atas?', answer: n1.toString() },
      { q: 'Tuliskan ordo matriks di atas (format: mxn):', answer: m1 + 'x' + n1 },
      { q: `Berapa nilai elemen a${getSubscript(q1_1.r)}${getSubscript(q1_1.c)} (baris ${q1_1.r}, kolom ${q1_1.c})?`, answer: mat1[q1_1.r - 1][q1_1.c - 1].toString() },
      { q: `Berapa nilai elemen a${getSubscript(q1_2.r)}${getSubscript(q1_2.c)} (baris ${q1_2.r}, kolom ${q1_2.c})?`, answer: mat1[q1_2.r - 1][q1_2.c - 1].toString() }
    ]
  });

  // 2. LKPD 2: Penjumlahan Matriks 2×2
  const matA2 = randMatrix(2, 2, 1, 9);
  const matB2 = randMatrix(2, 2, -5, 5);
  const correctAns2 = [
    [matA2[0][0] + matB2[0][0], matA2[0][1] + matB2[0][1]],
    [matA2[1][0] + matB2[1][0], matA2[1][1] + matB2[1][1]]
  ];
  randomizedSet.push({
    id: 'lk2',
    title: 'LKPD 2: Penjumlahan Matriks 2×2',
    instructions: 'Hitung hasil A + B dengan mengisi kotak hasil di sebelah kanan.',
    type: 'matrix_addition',
    matrixA: matA2,
    matrixB: matB2,
    correctAnswer: correctAns2
  });

  // 3. LKPD 3: Determinan Matriks 2×2
  const letters3 = ['C', 'D', 'K', 'M', 'P', 'R', 'S'];
  const L3 = letters3[randInt(0, letters3.length - 1)];
  const mat3 = randMatrix(2, 2, 1, 6);
  const ad3 = mat3[0][0] * mat3[1][1];
  const bc3 = mat3[0][1] * mat3[1][0];
  const det3 = ad3 - bc3;
  randomizedSet.push({
    id: 'lk3',
    title: `LKPD 3: Determinan Matriks 2×2`,
    instructions: `Diberikan matriks ${L3}. Ikuti langkah berikut untuk menghitung det(${L3}).`,
    type: 'concept',
    matrix: mat3,
    questions: [
      { q: `Berapa nilai a×d (perkalian diagonal utama: ${mat3[0][0]}×${mat3[1][1]})?`, answer: ad3.toString() },
      { q: `Berapa nilai b×c (perkalian diagonal samping: ${mat3[0][1]}×${mat3[1][0]})?`, answer: bc3.toString() },
      { q: `det(${L3}) = a×d − b×c = ${ad3} − ${bc3} = ?`, answer: det3.toString() }
    ]
  });

  // 4. LKPD 4: Pengurangan Matriks 2×2
  const matA4 = randMatrix(2, 2, 5, 9);
  const matB4 = randMatrix(2, 2, 1, 5);
  const correctAns4 = [
    [matA4[0][0] - matB4[0][0], matA4[0][1] - matB4[0][1]],
    [matA4[1][0] - matB4[1][0], matA4[1][1] - matB4[1][1]]
  ];
  randomizedSet.push({
    id: 'lk4',
    title: 'LKPD 4: Pengurangan Matriks 2×2',
    instructions: 'Hitung hasil A − B dengan mengisi kotak hasil.',
    type: 'matrix_addition',
    matrixA: matA4,
    matrixB: matB4,
    correctAnswer: correctAns4
  });

  // 5. LKPD 5: Jenis-Jenis Matriks
  const typeOptions5 = ['identitas', 'nol', 'diagonal', 'baris', 'kolom'];
  const chosenType5 = typeOptions5[randInt(0, typeOptions5.length - 1)];
  let mat5, questions5, instructions5;
  if (chosenType5 === 'identitas') {
    const size = Math.random() > 0.5 ? 3 : 2;
    mat5 = size === 3 ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : [[1, 0], [0, 1]];
    instructions5 = 'Jawab pertanyaan tentang jenis-jenis matriks identitas berikut.';
    questions5 = [
      { q: 'Matriks di atas disebut matriks apa?', answer: 'identitas' },
      { q: 'Berapakah nilai elemen pada diagonal utamanya?', answer: '1' },
      { q: 'Apakah matriks di atas berbentuk persegi? (ya/tidak)', answer: 'ya' },
      { q: 'Berapa ordo matriks di atas (format: mxn)?', answer: size + 'x' + size }
    ];
  } else if (chosenType5 === 'nol') {
    const rows = randInt(2, 3);
    const cols = randInt(2, 3);
    mat5 = Array(rows).fill(null).map(() => Array(cols).fill(0));
    instructions5 = 'Analisis karakteristik elemen dari matriks khusus berikut.';
    questions5 = [
      { q: 'Matriks di atas disebut matriks apa?', answer: 'nol' },
      { q: 'Apakah semua elemen bernilai nol? (ya/tidak)', answer: 'ya' },
      { q: 'Apakah matriks di atas berbentuk persegi? (ya/tidak)', answer: rows === cols ? 'ya' : 'tidak' },
      { q: 'Berapa ordo matriks di atas (format: mxn)?', answer: rows + 'x' + cols }
    ];
  } else if (chosenType5 === 'diagonal') {
    const size = randInt(2, 3);
    mat5 = Array(size).fill(null).map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      mat5[i][i] = randInt(1, 9);
    }
    instructions5 = 'Perhatikan susunan diagonal dari matriks persegi berikut.';
    questions5 = [
      { q: 'Matriks di atas disebut matriks apa?', answer: 'diagonal' },
      { q: 'Apakah semua elemen di luar diagonal utama bernilai nol? (ya/tidak)', answer: 'ya' },
      { q: 'Apakah matriks di atas berbentuk persegi? (ya/tidak)', answer: 'ya' },
      { q: 'Berapa ordo matriks di atas (format: mxn)?', answer: size + 'x' + size }
    ];
  } else if (chosenType5 === 'baris') {
    const cols = randInt(3, 4);
    mat5 = [randMatrix(1, cols, -9, 9)[0]];
    instructions5 = 'Analisis susunan baris dan kolom pada matriks berikut.';
    questions5 = [
      { q: 'Matriks di atas disebut matriks apa?', answer: 'baris' },
      { q: 'Berapa jumlah baris matriks di atas?', answer: '1' },
      { q: 'Apakah matriks di atas memiliki lebih dari satu kolom? (ya/tidak)', answer: 'ya' },
      { q: 'Berapa ordo matriks di atas (format: mxn)?', answer: '1x' + cols }
    ];
  } else { // kolom
    const rows = randInt(3, 4);
    mat5 = randMatrix(rows, 1, -9, 9);
    instructions5 = 'Analisis susunan baris dan kolom pada matriks berikut.';
    questions5 = [
      { q: 'Matriks di atas disebut matriks apa?', answer: 'kolom' },
      { q: 'Berapa jumlah kolom matriks di atas?', answer: '1' },
      { q: 'Apakah matriks di atas memiliki lebih dari satu baris? (ya/tidak)', answer: 'ya' },
      { q: 'Berapa ordo matriks di atas (format: mxn)?', answer: rows + 'x1' }
    ];
  }
  randomizedSet.push({
    id: 'lk5',
    title: `LKPD 5: Jenis-Jenis Matriks (${chosenType5.charAt(0).toUpperCase() + chosenType5.slice(1)})`,
    instructions: instructions5,
    type: 'concept',
    matrix: mat5,
    questions: questions5
  });

  // 6. LKPD 6: Perkalian Skalar
  const k6 = randInt(2, 5);
  const matA6 = randMatrix(2, 2, 1, 5);
  const correctAns6 = [
    [k6 * matA6[0][0], k6 * matA6[0][1]],
    [k6 * matA6[1][0], k6 * matA6[1][1]]
  ];
  randomizedSet.push({
    id: 'lk6',
    title: 'LKPD 6: Perkalian Skalar',
    instructions: 'Diberikan matriks A dan skalar k. Hitung k×A dan isi hasilnya.',
    type: 'matrix_addition',
    matrixA: matA6,
    matrixB: [[0, 0], [0, 0]],
    correctAnswer: correctAns6,
    customInstructions: `${k6} × Matriks A = ?  (abaikan kotak B, langsung isi hasil)`
  });

  // 7. LKPD 7: Transpose Matriks
  const rows7 = randInt(2, 3);
  const cols7 = randInt(2, 3);
  const mat7 = randMatrix(rows7, cols7, -5, 9);
  const tr1_r = randInt(1, cols7);
  const tr1_c = randInt(1, rows7);
  let tr2_r = randInt(1, cols7);
  let tr2_c = randInt(1, rows7);
  if (tr1_r === tr2_r && tr1_c === tr2_c) {
    tr2_c = (tr2_c % rows7) + 1;
  }
  randomizedSet.push({
    id: 'lk7',
    title: 'LKPD 7: Transpose Matriks',
    instructions: 'Diberikan matriks P berikut. Jawab pertanyaan tentang transposenya.',
    type: 'concept',
    matrix: mat7,
    questions: [
      { q: 'Ordo matriks P sebelum di-transpose (format: mxn)?', answer: rows7 + 'x' + cols7 },
      { q: 'Ordo matriks Pᵀ setelah di-transpose (format: mxn)?', answer: cols7 + 'x' + rows7 },
      { q: `Berapa nilai elemen baris ${tr1_r} kolom ${tr1_c} pada Pᵀ?`, answer: mat7[tr1_c - 1][tr1_r - 1].toString() },
      { q: `Berapa nilai elemen baris ${tr2_r} kolom ${tr2_c} pada Pᵀ?`, answer: mat7[tr2_c - 1][tr2_r - 1].toString() }
    ]
  });

  // 8. LKPD 8: Penjumlahan Matriks Ordo Lain
  const isAddition3x3_8 = Math.random() > 0.5;
  let matA8, matB8, correctAns8, title8, instructions8;
  if (isAddition3x3_8) {
    title8 = 'LKPD 8: Penjumlahan Matriks 3×3';
    instructions8 = 'Hitung hasil A + B untuk matriks 3×3 berikut.';
    matA8 = randMatrix(3, 3, 1, 9);
    matB8 = randMatrix(3, 3, -5, 5);
    correctAns8 = [
      [matA8[0][0] + matB8[0][0], matA8[0][1] + matB8[0][1], matA8[0][2] + matB8[0][2]],
      [matA8[1][0] + matB8[1][0], matA8[1][1] + matB8[1][1], matA8[1][2] + matB8[1][2]],
      [matA8[2][0] + matB8[2][0], matA8[2][1] + matB8[2][1], matA8[2][2] + matB8[2][2]]
    ];
  } else {
    title8 = 'LKPD 8: Penjumlahan Matriks 2×3';
    instructions8 = 'Hitung hasil A + B untuk matriks 2×3 berikut.';
    matA8 = randMatrix(2, 3, 1, 9);
    matB8 = randMatrix(2, 3, -5, 5);
    correctAns8 = [
      [matA8[0][0] + matB8[0][0], matA8[0][1] + matB8[0][1], matA8[0][2] + matB8[0][2]],
      [matA8[1][0] + matB8[1][0], matA8[1][1] + matB8[1][1], matA8[1][2] + matB8[1][2]]
    ];
  }
  randomizedSet.push({
    id: 'lk8',
    title: title8,
    instructions: instructions8,
    type: 'matrix_addition',
    matrixA: matA8,
    matrixB: matB8,
    correctAnswer: correctAns8
  });

  // 9. LKPD 9: Matriks Simetris
  const s11 = randInt(-9, 9);
  const s22 = randInt(-9, 9);
  const s33 = randInt(-9, 9);
  const s12 = randInt(-5, 5);
  const s13 = randInt(-5, 5);
  const s23 = randInt(-5, 5);
  const mat9 = [
    [s11, s12, s13],
    [s12, s22, s23],
    [s13, s23, s33]
  ];
  const options9 = [
    { r: 1, c: 2 },
    { r: 1, c: 3 },
    { r: 2, c: 3 }
  ];
  const chosen9 = options9[randInt(0, 2)];
  const val9 = mat9[chosen9.r - 1][chosen9.c - 1];
  randomizedSet.push({
    id: 'lk9',
    title: 'LKPD 9: Matriks Simetris',
    instructions: 'Perhatikan matriks S berikut and jawab pertanyaan.',
    type: 'concept',
    matrix: mat9,
    questions: [
      { q: 'Apakah S = Sᵀ? (ya/tidak)', answer: 'ya' },
      { q: 'Matriks yang memenuhi S = Sᵀ disebut matriks apa?', answer: 'simetris' },
      { q: `Berapa nilai elemen a${getSubscript(chosen9.r)}${getSubscript(chosen9.c)}?`, answer: val9.toString() },
      { q: `Berapa nilai elemen a${getSubscript(chosen9.c)}${getSubscript(chosen9.r)}? (seharusnya sama dengan a${getSubscript(chosen9.r)}${getSubscript(chosen9.c)})`, answer: val9.toString() }
    ]
  });

  // 10. LKPD 10: Invers Matriks 2×2
  let a10, b10, c10, d10, det10;
  do {
    a10 = randInt(-4, 4);
    b10 = randInt(-4, 4);
    c10 = randInt(-4, 4);
    d10 = randInt(-4, 4);
    det10 = a10 * d10 - b10 * c10;
  } while (det10 !== 1 && det10 !== -1);

  const inv10_11 = d10 / det10;
  const inv10_12 = -b10 / det10;
  const inv10_21 = -c10 / det10;
  const inv10_22 = a10 / det10;

  const invOptions10 = [
    { r: 1, c: 1, label: 'a', val: inv10_11 },
    { r: 1, c: 2, label: 'b', val: inv10_12 },
    { r: 2, c: 1, label: 'c', val: inv10_21 },
    { r: 2, c: 2, label: 'd', val: inv10_22 }
  ];
  const shuffledInvOptions = shuffle(invOptions10);
  const iq1 = shuffledInvOptions[0];
  const iq2 = shuffledInvOptions[1];

  randomizedSet.push({
    id: 'lk10',
    title: 'LKPD 10: Invers Matriks 2×2',
    instructions: 'Diberikan matriks M. Ikuti langkah menghitung invers M⁻¹.',
    type: 'concept',
    matrix: [[a10, b10], [c10, d10]],
    questions: [
      { q: `Hitung det(M) = (${a10}×${d10}) − (${b10}×${c10}) = ?`, answer: det10.toString() },
      { q: 'Karena det ≠ 0, apakah M memiliki invers? (ya/tidak)', answer: 'ya' },
      { q: `Elemen ${iq1.label} pada M⁻¹ (baris ${iq1.r}, kolom ${iq1.c}) = ?`, answer: iq1.val.toString() },
      { q: `Elemen ${iq2.label} pada M⁻¹ (baris ${iq2.r}, kolom ${iq2.c}) = ?`, answer: iq2.val.toString() }
    ]
  });

  activeLKPDSet = randomizedSet;
  renderLKPDPage();
  alert("🎲 Sukses! Soal, matriks, letak elemen, dan jenis pertanyaan LKPD berhasil diacak secara dinamis. Silakan kerjakan soal baru yang unik!");
}

/**
 * Fungsi: printLKPD()
 * Kegunaan: Membuka dialog pencetakan (Print Dialog) browser bawaan secara terprogram.
 * Cara Kerja:
 *   1. Memicu method window.print() bawaan browser.
 *   2. Memanfaatkan media query CSS `@media print` yang telah dirancang khusus di index.css untuk menyembunyikan elemen dekoratif web yang tidak diperlukan (seperti sidebar, navigasi, dan tombol panel aksi), 
 *      serta menyusun ulang halaman booklet LKPD menjadi lembaran kertas cetak modular A4 yang siap dicetak ke printer fisik atau disimpan sebagai dokumen PDF dengan tata letak premium.
 */
function printLKPD() {
  // Pemicu cetak bawaan browser
  window.print();
}

/**
 * Fungsi: resetLKPDFields()
 * Kegunaan: Mengosongkan seluruh isian formulir nama, kelas, dan jawaban soal latihan pada Lembar Kerja (LKPD) Digital.
 * Cara Kerja:
 *   1. Memunculkan dialog konfirmasi persetujuan (confirm) sebelum menghapus data untuk mencegah penghapusan yang tidak sengaja.
 *   2. Menghapus isian nama dan kelas pada elemen cover halaman depan.
 *   3. Melakukan looping ke seluruh input isian manual (lkpd-manual-underline) untuk menghapus nilai input, mereset warna border dan warna latar belakang.
 *   4. Menghapus seluruh badge keterangan status umpan balik (benar/salah/kunci jawaban) yang ada di samping soal.
 *   5. Menghapus isian sel elemen matriks (lkpd-matrix-cell-input) pada operasi penjumlahan/pengurangan.
 *   6. Menyembunyikan dan mengosongkan kartu laporan skor akhir (scoreCard) di bagian bawah booklet.
 */
function resetLKPDFields() {
  if (!confirm("Apakah Anda yakin ingin mengosongkan seluruh jawaban di lembar kerja?")) return;

  // Kosongkan nama & kelas di cover
  const covNama = document.getElementById('lkpdCovNama');
  const covKelas = document.getElementById('lkpdCovKelas');
  if (covNama) covNama.value = '';
  if (covKelas) covKelas.value = '';

  // Kosongkan semua input konsep & ordo
  const underlineInputs = document.querySelectorAll('.lkpd-manual-underline');
  underlineInputs.forEach(inp => {
    inp.value = '';
    inp.style.borderColor = '';
    inp.style.background = '';
  });

  // Kosongkan semua badge masukan
  const badges = document.querySelectorAll('.lkfb-badge-manual');
  badges.forEach(b => {
    b.className = 'lkfb-badge-manual';
    b.innerHTML = '';
  });

  // Kosongkan masukan matriks addition
  const matInputs = document.querySelectorAll('.lkpd-matrix-cell-input');
  matInputs.forEach(inp => {
    inp.value = '';
    inp.style.borderColor = '';
    inp.style.background = '';
  });

  // Sembunyikan kartu hasil akhir
  const scoreCard = document.getElementById('lkpdScoreCardContainer');
  if (scoreCard) {
    scoreCard.style.display = 'none';
    scoreCard.innerHTML = '';
  }

  alert("🔄 Lembar Kerja telah dikosongkan.");
}

/**
 * Fungsi: renderLKPDPage()
 * Kegunaan: Fungsi sentral yang membangun and merender antarmuka Lembar Kerja Peserta Didik (LKPD) Interaktif dalam format booklet kertas digital kontinu.
 * Cara Kerja:
 *   1. Mencari kontainer utama (lkpdWorksheetContainer) pada DOM. Jika tidak ada, hentikan fungsi.
 *   2. Menyembunyikan sistem navigasi tab lama (lkpdTabsContainer) karena modul kini menggunakan satu booklet digital utuh yang terpadu.
 *   3. Mengosongkan kontainer utama untuk merender konten segar dengan animasi masuk premium (premiumEnter).
 *   4. Merender Halaman 1 (Cover Booklet) yang dihiasi dengan ilustrasi vektor SVG premium responsif (laptop, pesawat kertas, pena melayang, siswi berhijab, dan ornamen matematika floating) serta formulir identitas siswa.
 *   5. Merender Halaman 2 (Informasi & Capaian Pembelajaran) yang menyajikan Capaian Pembelajaran (CP), Alokasi Waktu, Petunjuk Belajar, dan Prasyarat Materi.
 *   6. Merender Halaman 3-12 (Kegiatan Belajar 1 hingga 10) secara modular berdasarkan konfigurasi activeLKPDSet.
 *      - Soal berjenis konsep dirender menggunakan gaya isian manual dengan garis bawah (manual underline).
 *      - Soal berjenis operasi matriks dirender menggunakan visualisasi susunan bracket siku [ ] dan kotak-kotak input sel grid numerik yang intuitif.
 *   7. Menyisipkan kontainer lapor nilai scorecard digital di akhir halaman booklet.
 *   8. Menyisipkan panel tombol aksi (Kosongkan, Acak Kegiatan, Acak Soal & Angka, Cetak PDF, Periksa Jawaban) di bagian paling atas lembar kerja.
 */
function renderLKPDPage() {
  const tabsEl = document.getElementById('lkpdTabsContainer');
  const wsEl = document.getElementById('lkpdWorksheetContainer');
  if (!wsEl) return;

  // Sembunyikan panel tabs bawaan karena kita memakai satu lembar kerja kontinu
  if (tabsEl) {
    tabsEl.style.display = 'none';
  }

  wsEl.innerHTML = '';

  // Buat booklet pembungkus utama
  const booklet = document.createElement('div');
  booklet.className = 'lkpd-booklet';
  booklet.style.animation = 'premiumEnter 0.45s ease';

  // ----------------------------------------------------
  // DOKUMEN 1: HALAMAN COVER (COVER PAGE)
  // ----------------------------------------------------
  const coverPage = document.createElement('div');
  coverPage.className = 'lkpd-cover-page';

  // Inline SVG illustration matching the user screenshot perfectly
  const illustrationSVG = `
    <svg viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg" class="lkpd-cover-svg-illustration">
      <!-- Desk/Table -->
      <path d="M 40 300 L 460 300 L 460 315 L 40 315 Z" fill="#6d4c41" stroke="#3e2723" stroke-width="2.5"/>
      <!-- Laptop base -->
      <path d="M 110 295 L 190 295 L 200 300 L 100 300 Z" fill="#311b92" stroke="#1a237e" stroke-width="2"/>
      <!-- Laptop screen -->
      <path d="M 110 245 L 110 295 L 170 295 L 170 245 Z" fill="#311b92" stroke="#1a237e" stroke-width="2" transform="rotate(-12 110 295)"/>
      <path d="M 115 250 L 115 290 L 165 290 L 165 250 Z" fill="#1a237e" transform="rotate(-12 110 295)"/>
      <!-- Paper airplane -->
      <path d="M 80 60 L 125 78 L 105 84 Z" fill="#80cbc4" stroke="#004d40" stroke-width="2"/>
      <path d="M 80 60 L 105 84 L 95 75 Z" fill="#b2dfdb" stroke="#004d40" stroke-width="2"/>
      <!-- Pen floating -->
      <g transform="translate(60, 150) rotate(-45)">
        <rect x="0" y="0" width="10" height="42" rx="2" fill="#81c784" stroke="#2e7d32" stroke-width="1.5"/>
        <path d="M 0 0 L 5 -8 L 10 0 Z" fill="#ffe082" stroke="#2e7d32" stroke-width="1.5"/>
        <path d="M 3 -6 L 5 -8 L 7 -6 Z" fill="#000"/>
      </g>
      <!-- Student Hijab & Body -->
      <!-- Body/Shoulders -->
      <path d="M 230 300 C 230 240, 340 240, 340 300 Z" fill="#d1c4e9" stroke="#512da8" stroke-width="2.5"/>
      <!-- Hijab back wrap -->
      <circle cx="285" cy="195" r="48" fill="#b39ddb" stroke="#512da8" stroke-width="2.5"/>
      <!-- Head/Face -->
      <circle cx="275" cy="195" r="33" fill="#ffe0b2" stroke="#ffb74d" stroke-width="2.5"/>
      <!-- Eyes (curved & happy) -->
      <path d="M 256 191 Q 260 187 264 191" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 276 191 Q 280 187 284 191" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Smile -->
      <path d="M 260 205 Q 267 212 274 205" stroke="#d84315" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Hijab front frame wrap -->
      <path d="M 240 195 C 240 142, 310 142, 310 195 C 310 242, 240 242, 240 195 Z" fill="#b39ddb" stroke="#512da8" stroke-width="2.5"/>
      <path d="M 252 173 C 257 169, 293 169, 298 173" stroke="#512da8" stroke-width="2.5" fill="none"/>
      <path d="M 252 215 L 285 252 L 318 215 Z" fill="#d1c4e9" stroke="#512da8" stroke-width="2"/>
      <!-- Headphones -->
      <path d="M 244 195 C 244 152, 306 152, 306 195" stroke="#212121" stroke-width="5" fill="none"/>
      <rect x="238" y="185" width="11" height="24" rx="5" fill="#212121" stroke="#424242" stroke-width="1.5"/>
      <rect x="301" y="185" width="11" height="24" rx="5" fill="#212121" stroke="#424242" stroke-width="1.5"/>
      <!-- Math Numbers Floating (Big, styled matching screenshot) -->
      <text x="35" y="270" font-family="'Outfit', sans-serif" font-size="62px" font-weight="900" fill="#a5d6a7" stroke="#2e7d32" stroke-width="2.5" opacity="0.85">5</text>
      <text x="415" y="130" font-family="'Outfit', sans-serif" font-size="65px" font-weight="900" fill="#ffe082" stroke="#f57f17" stroke-width="2.5" opacity="0.85">2</text>
      <!-- Clouds at top -->
      <path d="M 190 25 C 180 25, 175 33, 182 40 C 178 47, 188 55, 195 50 C 200 55, 212 53, 210 43 C 218 37, 210 25, 190 25 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" opacity="0.85"/>
      <path d="M 330 20 C 320 20, 315 28, 322 35 C 318 42, 328 50, 335 45 C 340 50, 352 48, 350 38 C 358 32, 350 20, 330 20 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" opacity="0.85"/>
    </svg>
  `;

  coverPage.innerHTML = `
    <!-- Floating background ornaments -->
    <div class="lkpd-cover-ornament lkpd-cov-o1">[ ]</div>
    <div class="lkpd-cover-ornament lkpd-cov-o2">A+B</div>
    <div class="lkpd-cover-ornament lkpd-cov-o3">x</div>
    <div class="lkpd-cover-ornament lkpd-cov-o4">a₁₂</div>

    <div class="lkpd-cover-header">
      <h3>Lembar Kerja Peserta Didik</h3>
      <div class="lkpd-cover-logo-wrapper">
        <h1 class="lkpd-cover-logo">LKPD</h1>
      </div>
      <span class="lkpd-cover-subtitle-badge">Matematika</span>
    </div>

    <!-- Interactive illustration container -->
    <div class="lkpd-cover-illustration-container">
      ${illustrationSVG}
    </div>

    <!-- Student Identity form matching the screenshot -->
    <div class="lkpd-cover-identity-card">
      <div class="lkpd-cover-field-group">
        <label>Nama:</label>
        <input type="text" id="lkpdCovNama" class="lkpd-cover-field-input" placeholder="Tulis nama..." />
      </div>
      <div class="lkpd-cover-field-group">
        <label>Kelas:</label>
        <input type="text" id="lkpdCovKelas" class="lkpd-cover-field-input" placeholder="Tulis kelas..." style="width: 100px !important;" />
      </div>
    </div>

    <div class="lkpd-cover-footer">
      <p class="lkpd-cover-footer-text">Materi Pembelajaran Matriks – Tingkat Lanjut Kelas XI</p>
      <p class="lkpd-cover-footer-text" style="font-size:11px; margin-top:4px; opacity:0.75;">MatriksEdu UNRAM &copy; 2026</p>
    </div>
  `;
  booklet.appendChild(coverPage);

  // ----------------------------------------------------
  // DOKUMEN 2: HALAMAN INFORMASI (INTRO / CURRICULUM PAGE)
  // ----------------------------------------------------
  const introPage = document.createElement('div');
  introPage.className = 'lkpd-intro-page';
  introPage.innerHTML = `
    <div class="lkpd-intro-header">
      <h2><i class="fa fa-graduation-cap"></i> Informasi & Capaian Pembelajaran</h2>
    </div>

    <!-- Capaian Pembelajaran Box -->
    <div class="lkpd-section-box sb-violet">
      <span class="lkpd-badge-title badge-violet"><i class="fa fa-bullseye"></i> Capaian Pembelajaran (CP)</span>
      <p>Di akhir fase F+, peserta didik dapat melakukan operasi aritmetika pada matriks (penjumlahan, pengurangan, perkalian skalar, dan perkalian matriks) serta memahami jenis-jenis matriks untuk menyelesaikan masalah dalam kehidupan sehari-hari.</p>
    </div>

    <!-- TP & Alokasi Waktu Grid -->
    <div class="grid-2col">
      <div class="lkpd-section-box sb-blue">
        <span class="lkpd-badge-title badge-blue"><i class="fa fa-list-check"></i> Tujuan Pembelajaran (TP)</span>
        <ol>
          <li>Mengidentifikasi jenis-jenis matriks (matriks baris, kolom, persegi, diagonal, identitas, dan skalar).</li>
          <li>Menjelaskan syarat and melakukan operasi penjumlahan serta pengurangan dua matriks atau lebih.</li>
          <li>Melakukan operasi perkalian skalar dengan matriks.</li>
          <li>Menentukan syarat perkalian dua matriks dan menghitung hasil kali dua matriks.</li>
        </ol>
      </div>

      <div class="lkpd-section-box sb-pink">
        <span class="lkpd-badge-title badge-pink"><i class="fa fa-clock"></i> Alokasi & Petunjuk</span>
        <p><strong>Alokasi Waktu:</strong> 2 &times; 30 Menit</p>
        <p style="margin-top: 8px;"><strong>Alat & Bahan:</strong></p>
        <ul>
          <li>Alat tulis (pulpen, pensil, penghapus)</li>
          <li>MatriksEdu Web Apps (gawai/laptop)</li>
        </ul>
      </div>
    </div>

    <!-- Petunjuk Belajar Box -->
    <div class="lkpd-section-box sb-violet">
      <span class="lkpd-badge-title badge-violet"><i class="fa fa-book-open"></i> Petunjuk Belajar</span>
      <ol style="margin-top: 6px;">
        <li>Berdoalah sebelum memulai mengerjakan LKPD.</li>
        <li>Baca dan pahami setiap instruksi atau "petunjuk unik" yang ada pada setiap kegiatan belajar.</li>
        <li>Gunakan buku teks Matematika Tingkat Lanjut Kelas XI sebagai referensi utama jika diperlukan.</li>
        <li>Kerjakan setiap soal secara berurutan, mulai dari konsep awal hingga operasi perkalian.</li>
        <li>Diskusikan dengan teman sebangku atau tanyakan kepada guru apabila menemui kendala.</li>
      </ol>
    </div>

    <!-- Prasyarat Box -->
    <div class="lkpd-section-box sb-blue">
      <span class="lkpd-badge-title badge-blue"><i class="fa fa-brain"></i> Pengetahuan Prasyarat</span>
      <ul>
        <li>Memahami konsep letak baris dan kolom pada suatu susunan matriks.</li>
        <li>Terampil dalam operasi hitung aritmetika bilangan real (penjumlahan, pengurangan, perkalian, pembagian).</li>
      </ul>
    </div>
  `;
  booklet.appendChild(introPage);

  // ----------------------------------------------------
  // DOKUMEN 3: DAFTAR KEGIATAN BELAJAR (PAPER SHEETS)
  // ----------------------------------------------------
  activeLKPDSet.forEach((lkpd, lIdx) => {
    const paper = document.createElement('div');
    paper.className = 'lkpd-paper-sheet lkpd-kegiatan-page';
    paper.dataset.lkpdId = lkpd.id;

    // Header Kegiatan
    paper.innerHTML = `
      <div class="lkpd-paper-header">
        <h3>Kegiatan Belajar ${lIdx + 1}: ${lkpd.title.replace(/LKPD.*?:/g, '').trim()}</h3>
        <p><i class="fa fa-info-circle"></i> ${lkpd.customInstructions || lkpd.instructions}</p>
      </div>
    `;

    // Render Concept Questions (Text-Underline style)
    if (lkpd.type === 'concept') {
      if (lkpd.matrix) {
        const matDiv = document.createElement('div');
        matDiv.style.cssText = 'text-align:center; margin:22px 0;';
        matDiv.innerHTML = buildMatrixHTML(lkpd.matrix, 'Matriks Referensi');
        paper.appendChild(matDiv);
      }

      const qWrap = document.createElement('div');
      qWrap.style.cssText = 'margin-top:20px; display:flex; flex-direction:column; gap:16px;';

      lkpd.questions.forEach((q, qIdx) => {
        const row = document.createElement('div');
        row.className = 'lkpd-question-row';
        row.innerHTML = `
          <div class="lkpd-question-text">${qIdx + 1}. ${q.q}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
            <span>Jawab:</span>
            <input type="text" class="lkpd-manual-underline lkpd-ans-input" 
              data-lkpd-idx="${lIdx}" data-q-idx="${qIdx}" data-ans="${q.answer}" 
              placeholder="Tulis jawaban di sini..." style="max-width: 250px;" />
            <span class="lkfb-badge-manual" id="lkfb-manual-${lIdx}-${qIdx}"></span>
          </div>
        `;
        qWrap.appendChild(row);
      });
      paper.appendChild(qWrap);

      // Render Matrix Operations (Grid calculations style)
    } else if (lkpd.type === 'matrix_addition') {
      const opLabel = lkpd.customInstructions ? '→' : '+';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex; align-items:center; justify-content:center; gap:22px; flex-wrap:wrap; margin:30px 0;';

      // Matrix A
      wrap.innerHTML += buildMatrixHTML(lkpd.matrixA, 'Matriks A');

      // Operator Sign
      const opSpan = document.createElement('span');
      opSpan.style.cssText = 'font-size:32px; font-weight:900; color:#5c4a24;';
      opSpan.textContent = opLabel;
      wrap.appendChild(opSpan);

      // Matrix B (if addition)
      if (!lkpd.customInstructions) {
        wrap.innerHTML += buildMatrixHTML(lkpd.matrixB, 'Matriks B');
        const eqSpan = document.createElement('span');
        eqSpan.style.cssText = 'font-size:32px; font-weight:900; color:#5c4a24;';
        eqSpan.textContent = '=';
        wrap.appendChild(eqSpan);
      }

      // Matrix Hasil Input Grid
      const gridWrap = document.createElement('div');
      gridWrap.style.cssText = 'display:inline-block; text-align:center;';
      gridWrap.innerHTML = `<strong style="display:block; margin-bottom:6px; font-size:13px; color:#5c4a24;">Hasil Matriks</strong>`;

      const grid = document.createElement('div');
      grid.style.cssText = 'display:inline-flex; flex-direction:column; gap:6px; padding:10px; border:2px solid #a89a7d; border-radius:8px; background:#ffffff;';

      lkpd.correctAnswer.forEach((rowArr, r) => {
        const rowEl = document.createElement('div');
        rowEl.style.cssText = 'display:flex; gap:6px;';
        rowArr.forEach((_, c) => {
          const cellInp = document.createElement('input');
          cellInp.type = 'number';
          cellInp.className = 'lkpd-matrix-cell-input lkpd-grid-ans-input';
          cellInp.dataset.lkpdIdx = lIdx;
          cellInp.dataset.row = r;
          cellInp.dataset.col = c;
          cellInp.dataset.correct = rowArr[c];
          cellInp.style.cssText = 'width:54px; height:44px; text-align:center; font-size:16px; font-weight:700; border:1.5px solid #a89a7d; border-radius:6px; outline:none; font-family:"Caveat", cursive, sans-serif; color:#003399;';
          rowEl.appendChild(cellInp);
        });
        grid.appendChild(rowEl);
      });

      gridWrap.appendChild(grid);
      wrap.appendChild(gridWrap);
      paper.appendChild(wrap);

      // Feedback area
      const matFeedback = document.createElement('div');
      matFeedback.id = `lkpd-mat-fb-${lIdx}`;
      matFeedback.style.cssText = 'margin-top:14px; text-align:center; font-weight:700; font-size:14px;';
      paper.appendChild(matFeedback);
    }

    booklet.appendChild(paper);
  });

  // ----------------------------------------------------
  // DOKUMEN 4: AKUMULASI NILAI DIGITAL & SUBMIT
  // ----------------------------------------------------
  const scoreCardContainer = document.createElement('div');
  scoreCardContainer.id = 'lkpdScoreCardContainer';
  scoreCardContainer.style.cssText = 'display:none; transition: all 0.3s ease;';
  booklet.appendChild(scoreCardContainer);

  // ----------------------------------------------------
  // INTERFACE TOMBOL WEB ACTION (PRINT & CHECK & RESET)
  // ----------------------------------------------------
  const webActions = document.createElement('div');
  webActions.className = 'lkpd-web-actions';
  webActions.innerHTML = `
    <h4><i class="fa fa-laptop-code"></i> Panel Interaksi Lembar Kerja (LKPD)</h4>
    <div class="lkpd-action-btns" style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
      <button class="btn-secondary lkpd-reset-btn" onclick="resetLKPDFields()" style="background:#555; color:#fff; border:none; padding:9px 18px; border-radius:var(--radius); font-size:13.5px; font-weight:700; cursor:pointer;"><i class="fa fa-undo"></i> Kosongkan</button>
      <button class="btn-secondary lkpd-shuffle-btn" onclick="shuffleLKPD()" style="background:#7c3aed; color:#fff; border:none; padding:9px 18px; border-radius:var(--radius); font-size:13.5px; font-weight:700; cursor:pointer;"><i class="fa fa-arrows-alt"></i> Acak Urutan Kegiatan</button>
      <button class="btn-secondary lkpd-random-btn" onclick="generateRandomLKPD()" style="background:#d97706; color:#fff; border:none; padding:9px 18px; border-radius:var(--radius); font-size:13.5px; font-weight:700; cursor:pointer;"><i class="fa fa-random"></i> 🎲 Acak Soal &amp; Angka</button>
      <button class="btn-print-lkpd" onclick="printLKPD()"><i class="fa fa-print"></i> Cetak / Simpan PDF</button>
      <button class="btn-primary lkpd-check-btn" onclick="periksaSeluruhLKPD()" style="padding:9px 22px; font-size:13.5px;"><i class="fa fa-check-circle"></i> Periksa Jawaban</button>
    </div>
  `;

  // Masukkan tombol di paling atas halaman
  wsEl.appendChild(webActions);
  wsEl.appendChild(booklet);
}

/**
 * Fungsi: periksaSeluruhLKPD()
 * Kegunaan: Sistem penilaian otomatis digital (Autograding Engine) untuk mengoreksi seluruh jawaban latihan soal LKPD siswa.
 * Cara Kerja:
 *   1. Menganalisis isian pada soal berjenis Konseptual (underline inputs):
 *      - Menghapus spasi (replace whitespace) dan mengubah huruf menjadi kecil (toLowerCase) agar penilaian fleksibel namun presisi.
 *      - Membandingkan nilai user dengan kunci jawaban (dataset.ans).
 *      - Jika cocok, beri border hijau dan pasang badge "Benar". Jika salah, beri border merah dan tunjukkan kunci jawaban asli.
 *   2. Menganalisis isian pada soal berjenis Operasi Matriks (matrix grid inputs):
 *      - Mengelompokkan input per halaman kegiatan belajar.
 *      - Mengonversi nilai ke format floating-point (parseFloat) dan mencocokkannya dengan elemen kunci matriks seletak (dataset.correct).
 *      - Menghitung persentase kebenaran sel untuk menampilkan umpan balik kelulusan per kegiatan ("Sempurna! Semua elemen benar" atau "Terdapat kesalahan!").
 *   3. Jika tidak ada soal yang dikerjakan, munculkan notifikasi peringatan.
 *   4. Menghitung persentase skor akhir akumulatif dari total seluruh elemen soal yang ada di booklet.
 *   5. Membuka kontainer scoreCard di bagian bawah booklet, menyusun warna kartu evaluasi secara dinamis (Hijau untuk nilai >= 80, Jingga untuk nilai >= 60, dan Merah untuk nilai di bawah itu), dan menulis pesan motivasi pedagogis kustom.
 *   6. Menggulirkan layar (smooth scroll) secara otomatis ke panel rapor nilai di bagian bawah.
 *   7. Menghubungkan reward gamifikasi: memberikan +15 XP untuk penyelesaian LKPD, ditambah bonus +30 XP jika memperoleh nilai 100% sempurna, serta membuka lencana pencapaian khusus (badges) di profil siswa.
 */
function periksaSeluruhLKPD() {
  let totalQuestions = 0;
  let correctAnswers = 0;

  // 1. Periksa Concept Underline Inputs
  const underlineInputs = document.querySelectorAll('.lkpd-ans-input');
  underlineInputs.forEach(inp => {
    totalQuestions++;
    const lIdx = inp.dataset.lkpdIdx;
    const qIdx = inp.dataset.qIdx;
    const userAns = inp.value.trim().toLowerCase().replace(/\s+/g, '');
    const correctAns = inp.dataset.ans.toLowerCase().replace(/\s+/g, '');
    const badge = document.getElementById(`lkfb-manual-${lIdx}-${qIdx}`);

    if (userAns === correctAns) {
      correctAnswers++;
      inp.style.borderColor = '#28a745';
      inp.style.backgroundColor = '#e8f5e9';
      if (badge) {
        badge.className = 'lkfb-badge-manual correct';
        badge.innerHTML = '<i class="fa fa-check"></i> Benar';
      }
    } else {
      inp.style.borderColor = '#dc3545';
      inp.style.backgroundColor = '#ffebee';
      if (badge) {
        badge.className = 'lkfb-badge-manual wrong';
        badge.innerHTML = `<i class="fa fa-times"></i> Kunci: ${inp.dataset.ans}`;
      }
    }
  });

  // 2. Periksa Matrix Grid inputs
  // Kumpulkan grid inputs per LKPD Kegiatan
  const lkpdGridGroups = {};
  const gridInputs = document.querySelectorAll('.lkpd-grid-ans-input');

  gridInputs.forEach(inp => {
    const lIdx = inp.dataset.lkpdIdx;
    if (!lkpdGridGroups[lIdx]) lkpdGridGroups[lIdx] = [];
    lkpdGridGroups[lIdx].push(inp);
  });

  // Validasi per kelompok grid
  Object.keys(lkpdGridGroups).forEach(lIdx => {
    const inputs = lkpdGridGroups[lIdx];
    let correctCells = 0;
    const totalCells = inputs.length;

    inputs.forEach(inp => {
      totalQuestions++;
      const userVal = parseFloat(inp.value);
      const correctVal = parseFloat(inp.dataset.correct);

      if (userVal === correctVal) {
        correctAnswers++;
        correctCells++;
        inp.style.borderColor = '#28a745';
        inp.style.backgroundColor = '#e8f5e9';
      } else {
        inp.style.borderColor = '#dc3545';
        inp.style.backgroundColor = '#ffebee';
      }
    });

    const fbText = document.getElementById(`lkpd-mat-fb-${lIdx}`);
    if (fbText) {
      if (correctCells === totalCells) {
        fbText.style.color = '#2e7d32';
        fbText.innerHTML = `<i class="fa fa-check-circle"></i> Sempurna! Semua elemen (${correctCells}/${totalCells}) benar.`;
      } else {
        fbText.style.color = '#c62828';
        fbText.innerHTML = `<i class="fa fa-times-circle"></i> Terdapat kesalahan! Baru ${correctCells} dari ${totalCells} elemen yang benar.`;
      }
    }
  });

  if (totalQuestions === 0) {
    alert("Lembar Kerja tidak berisi soal latihan yang dapat diperiksa secara digital.");
    return;
  }

  // Hitung persentase nilai akumulatif
  const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);

  // Tampilkan scorecard hasil akhir di bagian bawah booklet
  const scoreCard = document.getElementById('lkpdScoreCardContainer');
  if (scoreCard) {
    let feedText = '';
    let feedColor = '';

    if (scorePercent >= 80) {
      feedText = '🌟 Luar biasa! Seluruh Kegiatan Belajar LKPD telah kamu kuasai dengan sangat matang!';
      feedColor = '#2e7d32';
    } else if (scorePercent >= 60) {
      feedText = '👍 Cukup baik! Ulangi beberapa materi yang salah untuk hasil yang lebih memuaskan.';
      feedColor = '#e65100';
    } else {
      feedText = '📖 Jangan berkecil hati! Pelajari kembali materi modul dan tanyakan kesulitanmu pada guru.';
      feedColor = '#c62828';
    }

    scoreCard.innerHTML = `
      <div class="lkpd-booklet-result-card" style="border-color:${feedColor}; animation: premiumEnter 0.35s ease;">
        <h3>Laporan Hasil Pemeriksaan LKPD Digital</h3>
        <span class="lkpd-booklet-score-badge" style="background:${feedColor};">${scorePercent}%</span>
        <p style="color:#333; font-weight:700; font-size:15px; margin-top:14px;">Jawaban Benar: ${correctAnswers} dari ${totalQuestions} Soal/Elemen</p>
        <p style="color:${feedColor}; font-style:italic; font-weight:600; margin-top:8px;">"${feedText}"</p>
      </div>
    `;
    scoreCard.style.display = 'block';

    // Scroll mulus ke rapor nilai
    scoreCard.scrollIntoView({ behavior: 'smooth' });
  }

  // Gamification reward for completing LKPD
  if (window.gainXP) {
    window.gainXP(15);
    if (scorePercent === 100) {
      window.gainXP(30);

      // Check active LKPD set for badges
      if (typeof activeLKPDSet !== 'undefined' && activeLKPDSet) {
        activeLKPDSet.forEach(lkpd => {
          if (lkpd.id === 'lkpd-1') {
            window.unlockBadge('lk1');
          } else if (lkpd.id === 'lkpd-10') {
            window.unlockBadge('lk10');
          }
        });
      }
    }
  }

  alert(`📝 Hasil Penilaian LKPD:\nBenar: ${correctAnswers} dari ${totalQuestions} elemen (${scorePercent}%).`);
}

/**
 * Fungsi: updateLKPDFromJson()
 * Kegunaan: Menyediakan panel interaksi kustom bagi Guru/Admin untuk mengedit database LKPD secara langsung lewat representasi kode JSON.
 * Cara Kerja:
 *   1. Membaca teks mentah dari textarea lkpdJsonEditor.
 *   2. Memparse data teks menjadi objek array JavaScript menggunakan JSON.parse() dalam blok pengaman try-catch.
 *   3. Memvalidasi tipe: jika data berupa array yang valid, gantikan database lokal dbLkpd dengan data baru tersebut, tampilkan pesan sukses, dan muat ulang tampilan booklet LKPD interaktif.
 */
function updateLKPDFromJson() {
  const jsonEditor = document.getElementById('lkpdJsonEditor');
  if (!jsonEditor) return;
  try {
    const data = JSON.parse(jsonEditor.value);
    if (Array.isArray(data)) {
      dbLkpd = data;
      alert('✅ LKPD berhasil diperbarui!');
      showLKPDInteractive();
    } else {
      alert('Format JSON harus berupa array!');
    }
  } catch (e) {
    alert('JSON tidak valid: ' + e.message);
  }
}

// Alias lama agar tidak terjadi error
function selectLKPD(id) {
  const bank = (dbLkpd && dbLkpd.length > 0) ? dbLkpd : lkpdBank;
  const idx = bank.findIndex(l => l.id === id);
  if (idx >= 0) { renderLKPDPage(); }
}
function renderLKPDTabs() { renderLKPDPage(); }
function renderLKPDWorksheet(lkpd) { renderLKPDPage(); }
function submitLKPD(lkpd) { periksaSeluruhLKPD(); }

/**
 * Fungsi: buildMatrixHTML(mat, label)
 * Kegunaan: Fungsi pembantu (helper function) untuk mengubah array multi-dimensi numerik menjadi representasi visual susunan matriks formal yang elegan di halaman web.
 * Parameter:
 *   - mat: Array dua dimensi (2D) berisi angka-angka penyusun matriks (contoh: [[1, 2], [3, 4]]).
 *   - label: String teks judul/nama matriks (contoh: 'Matriks A').
 * Returns:
 *   - String HTML yang mewakili visualisasi matriks lengkap dengan tanda kurung siku siku besar [ ] di sisi kiri dan kanan.
 */
function buildMatrixHTML(mat, label) {
  let rows = mat.map(r =>
    `<div style="display:flex;gap:12px;">${r.map(v =>
      `<span style="display:inline-block;width:32px;text-align:center;font-size:16px;font-weight:700;">${v}</span>`
    ).join('')}</div>`
  ).join('');
  return `<div style="display:inline-block;text-align:center;margin:6px;">
    <strong style="display:block;font-size:13px;margin-bottom:4px;">${label}</strong>
    <div style="display:flex;align-items:center;">
      <span style="font-size:42px;font-weight:100;color:#555;">[</span>
      <div style="display:flex;flex-direction:column;gap:6px;padding:4px 0;">${rows}</div>
      <span style="font-size:42px;font-weight:100;color:#555;">]</span>
    </div>
  </div>`;
}


// ===========================
// GLOBAL FUNCTION EXPORT
// ===========================
window.showSection = showSection;
window.showContent = showContent;
window.buildQuiz = buildQuiz;
window.startQuiz = startQuiz;
window.startQuizWithTimer = startQuiz;
window.renderQuizForm = renderQuizForm;
window.selectAnswer = selectAnswer;
window.submitQuiz = submitQuiz;
window.autoSubmitQuiz = autoSubmitQuiz;
window.doSubmitQuiz = doSubmitQuiz;
window.resetQuiz = resetQuiz;
window.toggleFaq = toggleFaq;
window.kirimPertanyaan = kirimPertanyaan;
window.setActive = setActive;
window.startExam = startExam;
window.selectExamAnswer = selectExamAnswer;
window.examPrev = examPrev;
window.examNext = examNext;
window.examGoTo = examGoTo;
window.submitExam = submitExam;
window.resetExam = resetExam;
window.exportExamExcel = exportExamExcel;

window.showMedia = showMedia;
window.toggleMediaChecklist = toggleMediaChecklist;
window.showPDF = showPDF;
window.showLKPDInteractive = showLKPDInteractive;
window.selectLKPD = selectLKPD;
window.submitLKPD = submitLKPD;
window.updateLKPDFromJson = updateLKPDFromJson;
window.shuffleLKPD = shuffleLKPD;
window.generateRandomLKPD = generateRandomLKPD;

// ---- ACCORDION SIDEBAR: TRIK CEPAT ----
function toggleTrick(btn) {
  const content = btn.nextElementSibling;
  const icon = btn.querySelector('.fa-chevron-down, .fa-chevron-up');

  btn.classList.toggle('active');

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    content.style.padding = '0';
    if (icon) {
      icon.className = 'fa fa-chevron-down';
    }
  } else {
    // Close other tricks first
    document.querySelectorAll('.trick-content').forEach(c => {
      c.style.maxHeight = null;
      c.style.padding = '0';
      const prevBtn = c.previousElementSibling;
      if (prevBtn) {
        prevBtn.classList.remove('active');
        const prevIcon = prevBtn.querySelector('.fa-chevron-up');
        if (prevIcon) prevIcon.className = 'fa fa-chevron-down';
      }
    });

    content.style.maxHeight = content.scrollHeight + 'px';
    content.style.padding = '10px';
    if (icon) {
      icon.className = 'fa fa-chevron-up';
    }
  }
}
window.toggleTrick = toggleTrick;

// ==========================================================================
// 1. SISTEM GAMIFIKASI (XP, LEVEL, & 5 PIALA LENCANA DIGITAL DIGITAL)
// ==========================================================================

/**
 * Variabel Global untuk menyimpan nama akun pengguna aktif.
 * Default bernilai 'Tamu' jika siswa belum melakukan autentikasi login.
 */
let currentUsername = 'Tamu';

/**
 * Fungsi: playChime()
 * Kegunaan: Menghasilkan nada lonceng keemasan sintetis bernada tinggi secara dinamis.
 * Cara Kerja: Menggunakan browser Web Audio API untuk mensintesis gelombang suara 'sine' 
 *             pada frekuensi C5 (523.25 Hz) berpindah cepat ke E5 (659.25 Hz), 
 *             sehingga menghasilkan suara lonceng tanpa memerlukan file mp3/wav dari luar.
 */
function playChime() {
  try {
    // Membuat konteks audio baru
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine'; // Tipe gelombang sinus yang lembut
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // Nada Pertama: C5 (523.25 Hz)
    osc.frequency.setValueAtTime(523.25, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Fade in cepat
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Fade out melambat

    // Nada Kedua: E5 (659.25 Hz) pada detik ke-0.15
    osc.frequency.setValueAtTime(659.25, now + 0.15);
    gain.gain.setValueAtTime(0.3, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65); // Fade out akhir

    osc.start(now);
    osc.stop(now + 0.7); // Hentikan generator suara pada detik 0.7
  } catch (e) {
    console.log("Web Audio API tidak didukung pada browser ini:", e);
  }
}

/**
 * Fungsi: showLevelUpCelebration()
 * Kegunaan: Menampilkan layar modal selebrasi naik level melayang secara visual penuh.
 * Parameter: newLevel (Angka level baru yang berhasil ditembus oleh siswa).
 * Cara Kerja: Menyisipkan elemen overlay div penuh dengan kelas transisi dan animasi crown.
 */
function showLevelUpCelebration(newLevel) {
  playChime(); // Mainkan lonceng kegembiraan
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-card">
      <div class="level-up-crown"><i class="fa fa-crown"></i></div>
      <h2 style="font-family:'Playfair Display', serif; font-size:32px; color:#fbbf24; margin-bottom:10px;">NAIK LEVEL!</h2>
      <p style="font-size:18px; margin-bottom:20px; color:#e0e7ff;">Selamat! Kamu sekarang mencapai <strong>Level ${newLevel}</strong>!</p>
      <button class="quiz-start-btn" style="background:#fbbf24; color:#1e1b4b; font-weight:800; border:none; padding:12px 28px; cursor:pointer;" onclick="this.parentElement.parentElement.remove()">Hebat! Lanjutkan Belajar</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

/**
 * Fungsi: initGamification()
 * Kegunaan: Menyiapkan profil belajar dan status XP pengguna sesaat setelah login berhasil.
 * Parameter: username (Nama akun siswa), role (Tingkat hak akses akun).
 */
function initGamification(username, role) {
  currentUsername = username || 'Tamu';

  // Membaca data historis dari local storage komputer
  let xp = parseInt(localStorage.getItem('xp_' + currentUsername)) || 0;
  let level = Math.floor(xp / 100) + 1; // Rumus: Setiap 100 XP setara dengan naik 1 Level
  let badges = JSON.parse(localStorage.getItem('badges_' + currentUsername)) || [];

  // Menggambar ulang tampilan widget
  updateGamificationUI(xp, level, badges);

  // Menggambar gambar awal pada kanvas simulator filter
  setTimeout(() => {
    drawDefaultFilterImage();
  }, 200);
}

/**
 * Fungsi: updateGamificationUI()
 * Kegunaan: Menyinkronkan variabel angka XP, level, dan piala lencana ke dalam tampilan visual halaman.
 * Parameter: xp (Total Poin Pengalaman), level (Tingkat Level), badges (Daftar Lencana Terbuka).
 */
function updateGamificationUI(xp, level, badges) {
  const xpInLevel = xp % 100; // Sisa pembagian XP untuk progress bar tingkat level saat ini
  const levelText = document.getElementById('widgetUserLevel');
  const xpText = document.getElementById('widgetUserXpText');
  const xpBar = document.getElementById('widgetUserXpBar');

  if (levelText) levelText.innerText = 'Level ' + level;
  if (xpText) xpText.innerText = xpInLevel + ' / 100 XP';
  if (xpBar) xpBar.style.width = xpInLevel + '%';

  // Sinkronisasi status piala kompetensi digital (unlocked vs locked)
  const badgeList = ['lk1', 'lk10', 'exam', 'crypto', 'filter'];
  badgeList.forEach(b => {
    const el = document.getElementById('badge-' + b);
    if (el) {
      if (badges.includes(b)) {
        el.className = 'badge-item unlocked'; // Menyala keemasan
        el.style.opacity = '1';
      } else {
        el.className = 'badge-item locked'; // Redup terkuci
        el.style.opacity = '0.5';
      }
    }
  });
}

/**
 * Fungsi: gainXP()
 * Kegunaan: Menambah poin XP siswa secara aman dan otomatis mendeteksi naik level.
 * Parameter: amount (Jumlah nilai poin XP tambahan yang didapatkan).
 */
function gainXP(amount) {
  let xp = parseInt(localStorage.getItem('xp_' + currentUsername)) || 0;
  let oldLevel = Math.floor(xp / 100) + 1;
  xp += amount;

  // Simpan pembaharuan poin secara persisten di local storage peramban
  localStorage.setItem('xp_' + currentUsername, xp);

  let newLevel = Math.floor(xp / 100) + 1;
  let badges = JSON.parse(localStorage.getItem('badges_' + currentUsername)) || [];

  // Perbarui UI Sidebar
  updateGamificationUI(xp, newLevel, badges);
  showXpToast(amount); // Tampilkan notifikasi melayang (+XP)

  // Jika level baru lebih besar dibanding level lama, picu modal naik level
  if (newLevel > oldLevel) {
    showLevelUpCelebration(newLevel);
  }
}

/**
 * Fungsi: unlockBadge()
 * Kegunaan: Membuka gembok piala lencana kompetensi baru berdasarkan prestasi siswa.
 * Parameter: badgeId (ID piala unik, contoh: 'crypto').
 */
function unlockBadge(badgeId) {
  let badges = JSON.parse(localStorage.getItem('badges_' + currentUsername)) || [];

  // Pastikan piala belum pernah dibuka sebelumnya
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    localStorage.setItem('badges_' + currentUsername, JSON.stringify(badges));

    let xp = parseInt(localStorage.getItem('xp_' + currentUsername)) || 0;
    let level = Math.floor(xp / 100) + 1;

    // Perbarui UI
    updateGamificationUI(xp, level, badges);
    showBadgeToast(badgeId); // Tampilkan pesan perayaan pembukaan piala
    gainXP(30); // Berikan bonus tambahan +30 XP atas pencapaian lencana baru!
  }
}

/**
 * Fungsi: showXpToast()
 * Kegunaan: Memunculkan notifikasi balon kecil melayang di sudut kanan bawah saat XP bertambah.
 */
function showXpToast(amount) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = 'linear-gradient(135deg, #7c3aed, #ec4899)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '20px';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
  toast.style.zIndex = '100000';
  toast.style.fontSize = '13px';
  toast.style.fontWeight = '700';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '6px';
  toast.innerHTML = `<i class="fa fa-sparkles"></i> +${amount} XP Didapatkan!`;

  document.body.appendChild(toast);

  // Hilang secara perlahan setelah 2 detik
  setTimeout(() => {
    toast.style.transition = 'all 0.5s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

/**
 * Fungsi: showBadgeToast()
 * Kegunaan: Memunculkan balon notifikasi besar berwarna emas saat piala digital berhasil didapatkan.
 */
function showBadgeToast(badgeId) {
  const badgeNames = {
    'lk1': '🏆 Ksatria Ordo',
    'lk10': '🏆 Pakar Invers',
    'exam': '🏆 Master Ujian',
    'crypto': '🏆 Pecinta Kripto',
    'filter': '🏆 Seniman Matriks'
  };
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '70px';
  toast.style.right = '20px';
  toast.style.background = 'linear-gradient(135deg, #fbbf24, #d97706)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '24px';
  toast.style.boxShadow = '0 10px 20px -3px rgba(217,119,6,0.3)';
  toast.style.zIndex = '100000';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '800';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.innerHTML = `<i class="fa fa-trophy"></i> Lencana Terbuka: ${badgeNames[badgeId]}!`;

  document.body.appendChild(toast);
  playChime(); // Jalankan chime suara

  // Hapus setelah 3.5 detik pameran
  setTimeout(() => {
    toast.style.transition = 'all 0.5s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// Mengekspos fungsi-fungsi gamifikasi ke cakupan window global agar bisa dipanggil dari HTML
window.initGamification = initGamification;
window.gainXP = gainXP;
window.unlockBadge = unlockBadge;

// ==========================================================================
// 2. LAB KRIPTOGRAFI: SANDI HILL CIPHER MODULO 26 (MATRIKS 2x2)
// ==========================================================================

/**
 * Fungsi: getGcd()
 * Kegunaan: Menghitung FPB dari 2 angka menggunakan pembagian sisa rekursif Euclidean.
 * Syarat Kripto: Determinan mod 26 dan 26 harus memiliki FPB = 1 agar kunci cipher valid (invertible).
 */
function getGcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Fungsi: getModInverse()
 * Kegunaan: Menghitung Modular Multiplicative Inverse dari determinan matriks modulo m (m=26).
 * Rumus Aljabar: Mencari bilangan bulat x di mana (a * x) mod m = 1.
 */
function getModInverse(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return 1;
}

/**
 * Fungsi: parseKeyMatrix()
 * Kegunaan: Membaca elemen matriks input kunci 2x2 dari form antarmuka pengguna HTML.
 */
function parseKeyMatrix() {
  const k00 = parseInt(document.getElementById('keyK00').value) || 0;
  const k01 = parseInt(document.getElementById('keyK01').value) || 0;
  const k10 = parseInt(document.getElementById('keyK10').value) || 0;
  const k11 = parseInt(document.getElementById('keyK11').value) || 0;
  return [[k00, k01], [k10, k11]];
}

/**
 * Fungsi: doHillEncrypt()
 * Kegunaan: Melakukan proses penyandian teks asli (plaintext) menjadi teks sandi (ciphertext) Hill Cipher 2x2.
 * Rumus Matematika: C = K * P mod 26.
 */
function doHillEncrypt() {
  // Saring teks input agar hanya berupa huruf alfabet A-Z saja
  const text = document.getElementById('cryptoPlaintext').value.toUpperCase().replace(/[^A-Z]/g, '');
  if (!text) {
    alert('Masukkan teks huruf saja (A-Z)!');
    return;
  }

  const K = parseKeyMatrix(); // Membaca kunci matriks 2x2
  const det = K[0][0] * K[1][1] - K[0][1] * K[1][0]; // Determinan = a*d - b*c
  const detMod26 = ((det % 26) + 26) % 26; // Modulo positif

  // Validasi: gcd(det, 26) harus bernilai 1 agar pesan dapat didekripsi kelak
  if (getGcd(detMod26, 26) !== 1) {
    alert(`Matriks Kunci tidak valid! Determinan mod 26 adalah ${detMod26}, yang tidak prima relatif dengan 26 (gcd ≠ 1). Silakan ubah elemen matriks kunci (misal: 3, 3, 2, 5).`);
    return;
  }

  // Menghitung elemen matriks invers adjoin mod 26 untuk auto-complete form dekripsi
  const detInv = getModInverse(detMod26, 26);
  const inv00 = ((K[1][1] * detInv) % 26 + 26) % 26;
  const inv01 = (((-K[0][1]) * detInv) % 26 + 26) % 26;
  const inv10 = (((-K[1][0]) * detInv) % 26 + 26) % 26;
  const inv11 = ((K[0][0] * detInv) % 26 + 26) % 26;

  // Mengisi form input matriks dekripsi secara otomatis (membantu siswa mengonfirmasi perhitungan)
  document.getElementById('keyInv00').value = inv00;
  document.getElementById('keyInv01').value = inv01;
  document.getElementById('keyInv10').value = inv10;
  document.getElementById('keyInv11').value = inv11;

  // Jika panjang huruf teks ganjil, tambahkan huruf pengisi padding 'X' agar genap berpasangan
  let paddedText = text;
  if (paddedText.length % 2 !== 0) {
    paddedText += 'X';
  }

  let cipher = '';
  let steps = `🔑 PROSES ENKRIPSI HILL CIPHER\n`;
  steps += `Teks Asli: ${text} -> Setelah padding (2x2): ${paddedText}\n`;
  steps += `Matriks Kunci K:\n  [ ${K[0][0]}  ${K[0][1]} ]\n  [ ${K[1][0]}  ${K[1][1]} ]\n\n`;
  steps += `Determinan det(K) = (${K[0][0]} * ${K[1][1]}) - (${K[0][1]} * ${K[1][0]}) = ${det}\n`;
  steps += `det(K) mod 26 = ${detMod26}\n`;
  steps += `Invers Determinan mod 26 = ${detInv}\n\n`;
  steps += `--- PERKALIAN VEKTOR PESAN ---\n`;

  // Iterasi melompati teks per 2 karakter sekaligus
  for (let i = 0; i < paddedText.length; i += 2) {
    const p1 = paddedText.charCodeAt(i) - 65; // Konversi huruf ke nomor A=0, B=1, ...
    const p2 = paddedText.charCodeAt(i + 1) - 65;

    // Rumus perkalian dot-product matriks 2x2 dengan vektor kolom 2x1
    const c1 = (K[0][0] * p1 + K[0][1] * p2) % 26;
    const c2 = (K[1][0] * p1 + K[1][1] * p2) % 26;

    // Konversi nomor kembali menjadi karakter huruf sandi
    cipher += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);

    steps += `Blok ${i / 2 + 1}: [${paddedText[i]}${paddedText[i + 1]}] -> Vektor: [${p1}, ${p2}]ᵀ\n`;
    steps += `  C1 = (${K[0][0]}*${p1} + ${K[0][1]}*${p2}) mod 26 = ${c1} (${String.fromCharCode(c1 + 65)})\n`;
    steps += `  C2 = (${K[1][0]}*${p1} + ${K[1][1]}*${p2}) mod 26 = ${c2} (${String.fromCharCode(c2 + 65)})\n\n`;
  }

  steps += `Hasil Ciphertext Akhir: ${cipher}`;

  // Perbarui antarmuka pengguna
  document.getElementById('cryptoCiphertext').value = cipher;
  document.getElementById('cryptoStepContent').innerHTML = steps;
  document.getElementById('cryptoStepCard').style.display = 'block';

  // Pemicu piala kompetensi kriptografi!
  unlockBadge('crypto');
}

/**
 * Fungsi: doHillDecrypt()
 * Kegunaan: Membuka kunci ciphertext rahasia kembali menjadi plaintext asli.
 * Rumus Matematika: P = K^-1 * C mod 26.
 */
function doHillDecrypt() {
  const cipher = document.getElementById('cryptoCiphertext').value.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cipher) {
    alert('Masukkan teks sandi / ciphertext terlebih dahulu!');
    return;
  }

  if (cipher.length % 2 !== 0) {
    alert('Panjang Ciphertext Hill Cipher 2x2 harus genap!');
    return;
  }

  const K = parseKeyMatrix();
  const det = K[0][0] * K[1][1] - K[0][1] * K[1][0];
  const detMod26 = ((det % 26) + 26) % 26;

  if (getGcd(detMod26, 26) !== 1) {
    alert('Matriks Kunci tidak valid! Silakan perbaiki elemen kunci agar invertible.');
    return;
  }

  // Hitung kembali elemen matriks invers adjoin mod 26
  const detInv = getModInverse(detMod26, 26);
  const inv00 = ((K[1][1] * detInv) % 26 + 26) % 26;
  const inv01 = (((-K[0][1]) * detInv) % 26 + 26) % 26;
  const inv10 = (((-K[1][0]) * detInv) % 26 + 26) % 26;
  const inv11 = ((K[0][0] * detInv) % 26 + 26) % 26;

  let plain = '';
  let steps = `🔓 PROSES DEKRIPSI HILL CIPHER\n`;
  steps += `Teks Sandi: ${cipher}\n`;
  steps += `Matriks Invers K⁻¹ mod 26:\n  [ ${inv00}  ${inv01} ]\n  [ ${inv10}  ${inv11} ]\n\n`;
  steps += `--- PERKALIAN VEKTOR SANDI ---\n`;

  // Kalikan vektor sandi dengan matriks invers
  for (let i = 0; i < cipher.length; i += 2) {
    const c1 = cipher.charCodeAt(i) - 65;
    const c2 = cipher.charCodeAt(i + 1) - 65;

    const p1 = (inv00 * c1 + inv01 * c2) % 26;
    const p2 = (inv10 * c1 + inv11 * c2) % 26;

    plain += String.fromCharCode(p1 + 65) + String.fromCharCode(p2 + 65);

    steps += `Blok ${i / 2 + 1}: [${cipher[i]}${cipher[i + 1]}] -> Vektor: [${c1}, ${c2}]ᵀ\n`;
    steps += `  P1 = (${inv00}*${c1} + ${inv01}*${c2}) mod 26 = ${p1} (${String.fromCharCode(p1 + 65)})\n`;
    steps += `  P2 = (${inv10}*${c1} + ${inv11}*${c2}) mod 26 = ${p2} (${String.fromCharCode(p2 + 65)})\n\n`;
  }

  steps += `Hasil Plaintext Asli Akhir: ${plain}`;

  document.getElementById('cryptoPlaintext').value = plain;
  document.getElementById('cryptoStepContent').innerHTML = steps;
  document.getElementById('cryptoStepCard').style.display = 'block';
}

window.doHillEncrypt = doHillEncrypt;
window.doHillDecrypt = doHillDecrypt;

// ==========================================================================
// 3. SIMULATOR FILTER GAMBAR: KONVOLUSI spasial MATRIKS KERNEL 3x3
// ==========================================================================

/**
 * Fungsi: loadFilterPreset()
 * Kegunaan: Mengisi input matriks kernel 3x3 secara instan berdasarkan preset efek grafis digital.
 * Parameter: presetName (Nama preset efek, contoh: 'sharpen').
 */
function loadFilterPreset(presetName) {
  const presets = {
    'edge': [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    'sharpen': [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    'emboss': [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
    'blur': [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]]
  };

  const kernel = presets[presetName];
  if (!kernel) return;

  // Tuliskan angka kernel ke dalam grid form input HTML secara instan
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const val = parseFloat(kernel[r][c].toFixed(3));
      document.getElementById(`ker${r}${c}`).value = val;
    }
  }
}

/**
 * Fungsi: drawDefaultFilterImage()
 * Kegunaan: Melukis ilustrasi ornamen bentuk geometris pada Canvas original bawaan.
 * Cara Kerja: Menggunakan fungsi HTML5 Canvas 2D API untuk melukis bentuk dasar 
 *             berwarna-warni agar simulator langsung siap diuji tanpa unggah file kustom.
 */
function drawDefaultFilterImage() {
  const canvas = document.getElementById('filterCanvasOrig');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Melukis warna gradasi linear dari pojok kiri atas ke pojok kanan bawah
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#f43f5e');
  grad.addColorStop(0.5, '#3b82f6');
  grad.addColorStop(1, '#10b981');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lingkaran putih ditengah kanvas
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 45, 0, Math.PI * 2);
  ctx.fill();

  // Persegi kuning di kiri atas
  ctx.fillStyle = '#eab308';
  ctx.fillRect(35, 30, 45, 45);

  // Segitiga merah muda di kanan atas
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.moveTo(180, 35);
  ctx.lineTo(150, 95);
  ctx.lineTo(210, 95);
  ctx.closePath();
  ctx.fill();

  // Menuliskan teks matriks di pusat kanvas
  ctx.font = 'bold 22px Courier New, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'center';
  ctx.fillText('MATRIKS', canvas.width / 2, canvas.height / 2 + 7);

  // Salin hasil gambar kanvas original ke kanvas hasil konvolusi secara instan
  const canvasRes = document.getElementById('filterCanvasRes');
  if (canvasRes) {
    const ctxRes = canvasRes.getContext('2d');
    ctxRes.drawImage(canvas, 0, 0);
  }
}

/**
 * Fungsi: handleFilterImageUpload()
 * Kegunaan: Mengimpor foto/gambar luar kustom milik siswa ke dalam kanvas filter original.
 * Parameter: input (Elemen berkas masukan input file HTML).
 */
function handleFilterImageUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.getElementById('filterCanvasOrig');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gambar ulang foto kustom agar sesuai dengan ukuran kotak kanvas 220x180
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Salin ke kanvas hasil
        const canvasRes = document.getElementById('filterCanvasRes');
        const ctxRes = canvasRes.getContext('2d');
        ctxRes.drawImage(canvas, 0, 0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

/**
 * Fungsi: applyMatrixFilter()
 * Kegunaan: Melakukan operasi konvolusi spasial 2D piksel gambar menggunakan matriks kernel 3x3.
 * Deskripsi: Algoritma ini berjalan di seluruh baris/kolom piksel gambar, mengambil koordinat 
 *            warna piksel tetangga, mengalikan dengan matriks kernel, lalu menimpa kanvas hasil.
 */
function applyMatrixFilter() {
  const canvasOrig = document.getElementById('filterCanvasOrig');
  const canvasRes = document.getElementById('filterCanvasRes');
  if (!canvasOrig || !canvasRes) return;

  const ctxOrig = canvasOrig.getContext('2d');
  const ctxRes = canvasRes.getContext('2d');

  const w = canvasOrig.width;
  const h = canvasOrig.height;

  // Membaca array piksel satu dimensi (Red, Green, Blue, Alpha) gambar asal
  const srcData = ctxOrig.getImageData(0, 0, w, h);
  const dstData = ctxRes.createImageData(w, h);

  const src = srcData.data;
  const dst = dstData.data;

  // Membaca matriks kernel 3x3 dari input form kustom siswa
  const K = [];
  let kSum = 0;
  for (let r = 0; r < 3; r++) {
    K[r] = [];
    for (let c = 0; c < 3; c++) {
      const v = parseFloat(document.getElementById(`ker${r}${c}`).value) || 0;
      K[r][c] = v;
      kSum += v;
    }
  }

  // Looping 2 Dimensi menggeser matriks kernel di koordinat piksel RGB
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let rSum = 0, gSum = 0, bSum = 0;

      // Operasi konvolusi spasial piksel tetangga 3x3
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const pxY = y + ky - 1;
          const pxX = x + kx - 1;
          const idx = (pxY * w + pxX) * 4;
          const wK = K[ky][kx];

          rSum += src[idx] * wK;     // Akumulasi Merah (Red)
          gSum += src[idx + 1] * wK; // Akumulasi Hijau (Green)
          bSum += src[idx + 2] * wK; // Akumulasi Biru (Blue)
        }
      }

      const dstIdx = (y * w + x) * 4;

      // Pembatasan warna (Clamping) agar nilai warna pixel berada di rentang 0 s.d 255
      dst[dstIdx] = Math.min(255, Math.max(0, rSum));
      dst[dstIdx + 1] = Math.min(255, Math.max(0, gSum));
      dst[dstIdx + 2] = Math.min(255, Math.max(0, bSum));
      dst[dstIdx + 3] = 255; // Mengatur alpha penuh (Solid Image)
    }
  }

  // Mengisi piksel garis tepi/border agar tidak buram dengan warna original aslinya
  for (let x = 0; x < w; x++) {
    let idx = x * 4;
    dst[idx] = src[idx]; dst[idx + 1] = src[idx + 1]; dst[idx + 2] = src[idx + 2]; dst[idx + 3] = src[idx + 3];
    idx = ((h - 1) * w + x) * 4;
    dst[idx] = src[idx]; dst[idx + 1] = src[idx + 1]; dst[idx + 2] = src[idx + 2]; dst[idx + 3] = src[idx + 3];
  }
  for (let y = 0; y < h; y++) {
    let idx = (y * w) * 4;
    dst[idx] = src[idx]; dst[idx + 1] = src[idx + 1]; dst[idx + 2] = src[idx + 2]; dst[idx + 3] = src[idx + 3];
    idx = (y * w + (w - 1)) * 4;
    dst[idx] = src[idx]; dst[idx + 1] = src[idx + 1]; dst[idx + 2] = src[idx + 2]; dst[idx + 3] = src[idx + 3];
  }

  // Tuliskan array piksel olahan konvolusi ke kanvas hasil
  ctxRes.putImageData(dstData, 0, 0);

  // Pemicu pembukaan piala kompetensi "Seniman Matriks"
  unlockBadge('filter');
}

window.loadFilterPreset = loadFilterPreset;
window.handleFilterImageUpload = handleFilterImageUpload;
window.applyMatrixFilter = applyMatrixFilter;

// ==========================================================================
// 4. PEMBANGKIT SERTIFIKAT KELULUSAN DENGAN HTML5 CANVAS
// ==========================================================================

/**
 * Fungsi: drawCertificate()
 * Kegunaan: Menggambar sertifikat kelulusan premium di atas kanvas grafis HTML5.
 * Parameter: studentName (Nama siswa berprestasi, contoh: 'M. Syamsuddiya''), 
 *            score (Skor kelulusan ujian).
 */
function drawCertificate(studentName, score) {
  const canvas = document.getElementById('certCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const w = canvas.width;
  const h = canvas.height;

  // 1. Cat latar belakang dengan warna krem gading mewah
  ctx.fillStyle = '#fffdf7';
  ctx.fillRect(0, 0, w, h);

  // 2. Menggambar garis-garis silang tipis sebagai watermark aljabar matriks di latar belakang
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }
  for (let j = 0; j < h; j += 25) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(w, j);
    ctx.stroke();
  }

  // 3. Menggambar Garis Bingkai Emas Ganda (Double Borders)
  ctx.strokeStyle = '#d97706'; // Emas Tua
  ctx.lineWidth = 16;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  ctx.strokeStyle = '#fef3c7'; // Emas Muda
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, w - 64, h - 64);

  // Menggambar persegi ornamen dekorasi di 4 sudut bingkai
  ctx.fillStyle = '#d97706';
  ctx.fillRect(30, 30, 20, 20);
  ctx.fillRect(w - 50, 30, 20, 20);
  ctx.fillRect(30, h - 50, 20, 20);
  ctx.fillRect(w - 50, h - 50, 20, 20);

  // 4. Menuliskan Header Judul Sertifikat Kelulusan
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'italic bold 28px Georgia, serif';
  ctx.fillText('Sertifikat Kompetensi', w / 2, 90);

  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('KELULUSAN BELAJAR MATRIKS', w / 2, 140);

  // Menggambar garis batas pemisah dekoratif keemasan di bawah judul
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 120, 160);
  ctx.lineTo(w / 2 + 120, 160);
  ctx.stroke();

  // 5. Menuliskan baris teks pernyataan formal
  ctx.fillStyle = '#475569';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Diberikan secara terhormat kepada:', w / 2, 205);

  // 6. Menuliskan Nama Lengkap Penerima Sertifikat dengan ukuran sangat besar dan anggun
  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold italic 40px Georgia, serif';
  ctx.fillText(studentName, w / 2, 265);

  // Garis horizontal ungu di bawah nama penerima
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 180, 280);
  ctx.lineTo(w / 2 + 180, 280);
  ctx.stroke();

  // 7. Menuliskan baris teks modul kelulusan belajar
  ctx.fillStyle = '#475569';
  ctx.font = '14.5px Georgia, serif';
  ctx.fillText('Atas keberhasilan luar biasa menyelesaikan modul interaktif', w / 2, 320);
  ctx.fillText('dan lulus Ujian Akhir dengan predikat kelulusan:', w / 2, 345);

  // 8. Menghitung & menampilkan tingkat predikat kelulusan berdasarkan skor nilai ujian
  let pred = 'MEMUASKAN';
  if (score >= 90) pred = 'DENGAN PUJIAN (CUM LAUDE)';
  else if (score >= 80) pred = 'SANGAT MEMUASKAN';

  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`${pred} (Skor: ${score}%)`, w / 2, 395);

  // 9. Menggambar Segel Lencana Emas Bergelombang Dinamis di pusat tengah bawah kanvas
  const cx = w / 2;
  const cy = 480;

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  for (let k = 0; k < 24; k++) {
    const angle = (k * Math.PI) / 12;
    const rx = k % 2 === 0 ? 32 : 24;
    const sx = cx + Math.cos(angle) * rx;
    const sy = cy + Math.sin(angle) * rx;
    if (k === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();

  // Lingkaran cincin putih di bagian dalam segel emas
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.stroke();

  // Menggambar pita sebelah kiri segel
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 24);
  ctx.lineTo(cx - 24, cy + 64);
  ctx.lineTo(cx - 8, cy + 54);
  ctx.lineTo(cx, cy + 64);
  ctx.lineTo(cx - 2, cy + 24);
  ctx.closePath();
  ctx.fill();

  // Menggambar pita sebelah kanan segel
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy + 24);
  ctx.lineTo(cx, cy + 64);
  ctx.lineTo(cx + 8, cy + 54);
  ctx.lineTo(cx + 24, cy + 64);
  ctx.lineTo(cx + 10, cy + 24);
  ctx.closePath();
  ctx.fill();

  // 10. Menggambar baris teks pengesahan Tanda Tangan, Nama Dekan, dan Tanggal Terbit
  ctx.fillStyle = '#334155';
  ctx.font = '11px Courier New, sans-serif';
  ctx.fillText('Tanggal Terbit: ' + new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), 160, 480);
  ctx.fillText('MatriksEdu UNRAM 2026', 160, 498);

  ctx.fillText('Dekan / Kaprodi Matematika', w - 160, 480);
  ctx.fillText('Dr. Siti Kholilah, M.Si.', w - 160, 498);
}

/**
 * Fungsi: downloadCertificate()
 * Kegunaan: Menarik data kanvas sertifikat menjadi berkas biner PNG dan memicu download otomatis peramban.
 */
function downloadCertificate() {
  const canvas = document.getElementById('certCanvas');
  if (!canvas) return;

  const link = document.createElement('a');
  // Penamaan file unduhan berdasarkan nama lengkap siswa aktif agar rapi
  link.download = `Sertifikat_MatriksEdu_${examStudentName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png'); // Konversi kanvas ke string biner PNG
  document.body.appendChild(link);
  link.click(); // Klik tautan unduhan asinkron
  document.body.removeChild(link); // Hapus tautan sementara
}

window.drawCertificate = drawCertificate;
window.downloadCertificate = downloadCertificate;
