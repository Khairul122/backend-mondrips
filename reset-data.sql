-- Reset Data D1 (Hapus semua isi tabel, jangan hapus schema)
-- Database: db_mondrips

-- Hapus semua data dari tabel (urutan penting karena ada foreign key)
DELETE FROM collaboration_sliders;
DELETE FROM sosial_media;
DELETE FROM users;

-- Reset auto-increment counters
DELETE FROM sqlite_sequence WHERE name='users';
DELETE FROM sqlite_sequence WHERE name='sosial_media';
DELETE FROM sqlite_sequence WHERE name='collaboration_sliders';
