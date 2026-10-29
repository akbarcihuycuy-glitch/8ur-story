/* ============================================================
   8UR STORY — email-service.js
   Khusus menangani Email Otomatis & Download Invoice PDF
   ============================================================ */

// 1. INISIALISASI EMAILJS
(function() {
    if (typeof emailjs !== 'undefined') {
        // GANTI INI DENGAN PUBLIC KEY ANDA
        emailjs.init("bs3EPXeXyVgvgJb2A"); 
    }
})();

// 2. FUNGSI KIRIM EMAIL (DIPANGGIL OLEH SCRIPT.JS)
function sendEmailInvoice(orderData) {
    // GANTI INI DENGAN SERVICE ID & TEMPLATE ID ANDA
    const serviceID = "service_xzsw3fl"; 
    const templateID = "template_klxhg3v";

    // Merakit HTML Tabel Barang khusus untuk dikirim via EmailJS
    let itemsHTML = `
        <table style="width: 100%; border-collapse: collapse;">
    `;
    
    orderData.items.forEach(item => {
        itemsHTML += `
            <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 10px 0;">
                    <strong>${item.product}</strong><br>
                    <span style="font-size: 12px; color: #6B7280;">Warna: ${item.color} | Size: ${item.size}</span>
                </td>
                <td style="padding: 10px 0; text-align: center;">x${item.qty}</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">Rp ${item.totalPrice.toLocaleString('id-ID')}</td>
            </tr>
        `;
    });
    itemsHTML += `</table>`;

    // Data yang dikirimkan ke EmailJS sesuai dengan variabel {{...}} di template HTML
    const templateParams = {
        to_email: orderData.email,
        buyer_name: orderData.name,
        order_id: orderData.orderId,
        order_date: orderData.date,
        payment_method: orderData.paymentMethod,
        order_items: itemsHTML,
        total_price: orderData.total.toLocaleString('id-ID')
    };

    if (typeof emailjs !== 'undefined') {
        emailjs.send(serviceID, templateID, templateParams)
            .then(() => {
                console.log("SUKSES! Email Invoice terkirim ke: " + orderData.email);
            })
            .catch((err) => {
                console.error("GAGAL mengirim email:", err);
            });
    } else {
        console.error("Pustaka EmailJS belum termuat di halaman.");
    }
}

// 3. FUNGSI DOWNLOAD INVOICE PDF PROFESIONAL (DIPANGGIL OLEH TOMBOL DI CHECKOUT.HTML)
function downloadInvoicePDF(orderData) {
    if (!orderData) {
        alert("Data pesanan tidak ditemukan!");
        return;
    }

    let itemsHTML = "";
    orderData.items.forEach(item => {
        itemsHTML += `
            <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 12px;">
                    ${item.product}<br>
                    <span style="font-weight: 400; color: #6B7280; font-size: 11px;">${item.color} | Size: ${item.size}</span>
                </td>
                <td style="padding: 12px 0; text-align: center; font-size: 12px;">${item.qty}</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 12px;">Rp ${item.totalPrice.toLocaleString('id-ID')}</td>
            </tr>
        `;
    });

    const invoiceHTML = `
        <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; background: #fff; max-width: 800px; margin: 0 auto;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E83124; padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #E83124; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">8UR STORY</h1>
                    <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;">Platform Custom Apparel Premium</p>
                    <p style="margin: 2px 0 0 0; color: #6B7280; font-size: 12px;">Kota Bekasi, Jawa Barat</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800; letter-spacing: 2px;">INVOICE</h2>
                    <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 12px;"><strong>No:</strong> ${orderData.orderId}</p>
                    <p style="margin: 2px 0 0 0; color: #6B7280; font-size: 12px;"><strong>Tanggal:</strong> ${orderData.date}</p>
                    <span style="display: inline-block; margin-top: 10px; background: #10B981; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;">LUNAS (Menunggu Verifikasi)</span>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <p style="margin: 0; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase;">Ditagihkan Kepada:</p>
                <h3 style="margin: 5px 0; font-size: 16px; color: #111827;">${orderData.name}</h3>
                <p style="margin: 2px 0; font-size: 12px; color: #374151;">📞 ${orderData.phone} | ✉️ ${orderData.email}</p>
                <p style="margin: 2px 0; font-size: 12px; color: #374151; max-width: 300px;">📍 ${orderData.address}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background: #111827; color: #fff; text-align: left;">
                        <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">Deskripsi Produk</th>
                        <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600;">Qty</th>
                        <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end;">
                <div style="min-width: 250px; background: #F9FAFB; padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 13px; color: #6B7280;">Metode Bayar:</span>
                        <span style="font-size: 13px; color: #111827; font-weight: bold;">${orderData.paymentMethod}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 1px solid #D1D5DB; padding-top: 12px; margin-top: 4px;">
                        <span style="font-size: 15px; color: #111827; font-weight: 800;">TOTAL TAGIHAN</span>
                        <span style="font-size: 18px; color: #E83124; font-weight: 900;">Rp ${orderData.total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 60px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                <p style="margin: 0; font-size: 12px; color: #6B7280;">Terima kasih atas kepercayaan Anda berbelanja di 8UR STORY!</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #9CA3AF;">Dokumen ini dihasilkan secara otomatis oleh sistem 8UR STORY dan sah sebagai bukti pemesanan sementara.</p>
            </div>
        </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = invoiceHTML;

    html2pdf().from(element).set({
        margin: 0,
        filename: `Invoice_8URSTORY_${orderData.orderId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).save().then(() => {
        showToast('Invoice PDF berhasil diunduh!', '📄');
    });
}