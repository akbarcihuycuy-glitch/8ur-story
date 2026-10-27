const express = require('express');
const path = require('path');
const app = express();

// Menentukan port untuk Render
const PORT = process.env.PORT || 3000;

// Mengizinkan server membaca semua file HTML, CSS, JS, dan gambar di folder ini
app.use(express.static(__dirname));

// Rute utama saat pengunjung membuka website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server toko aktif dan berjalan di port ${PORT}`);
});