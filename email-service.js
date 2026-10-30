/* ============================================================
   8UR STORY — email-service.js (v4.0 - Server Pribadi Google)
   Khusus menangani Email Otomatis & Download Invoice PDF
   ============================================================ */

// 1. URL WEB APP GOOGLE APPS SCRIPT ANDA
const GAS_URL = "https://script.google.com/macros/s/AKfycbyfz_YBfqbgsiKUhs1bqQPzcS3KipAsxjH4coZq9qAE6fy6g03vj_RQzwN2Js9HuYOX6w/exec";

// 2. FUNGSI KIRIM EMAIL VIA GOOGLE SERVER (100% ANTI SPAM)
function sendEmailInvoice(orderData) {
    // Merakit Tabel Produk E-Commerce dengan Badge CSS
    let itemsHTML = `<table style="width: 100%; border-collapse: collapse; font-family: Arial, Helvetica, sans-serif;">`;
    
    orderData.items.forEach((item, idx) => {
        const unitPrice = item.pricePerItem 
            ? item.pricePerItem.toLocaleString('id-ID') 
            : item.totalPrice.toLocaleString('id-ID');

        itemsHTML += `
            <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 10px 12px 0; width: 38px; vertical-align: top;">
                    <div style="width: 34px; height: 34px; line-height: 34px; text-align: center; background-color: #FEF2F2; color: #E83124; border: 1px solid #FECACA; border-radius: 8px; font-weight: bold; font-size: 13px;">
                        #${idx + 1}
                    </div>
                </td>
                <td style="padding: 12px 0; font-size: 13.5px; color: #111827; vertical-align: top;">
                    <strong style="display: block; margin-bottom: 3px; color: #111827;">${item.product}</strong>
                    <span style="font-size: 11.5px; color: #6B7280; display: block;">
                        Warna: ${item.color} | Ukuran: ${item.size}
                    </span>
                    <span style="font-size: 11px; color: #9CA3AF; display: block; margin-top: 2px;">
                        Harga Satuan: Rp ${unitPrice} | File: ${item.designFile || 'Desain Default'}
                    </span>
                </td>
                <td style="padding: 12px 8px; text-align: center; font-size: 13px; font-weight: bold; color: #374151; vertical-align: top; white-space: nowrap;">
                    x${item.qty}
                </td>
                <td style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 13.5px; color: #E83124; vertical-align: top; white-space: nowrap;">
                    Rp ${item.totalPrice.toLocaleString('id-ID')}
                </td>
            </tr>
        `;
    });
    itemsHTML += `</table>`;

    // Siapkan data (*payload*) untuk dikirim ke Google Apps Script
    const payload = {
        to_email: orderData.email,
        buyer_name: orderData.name,
        order_id: orderData.orderId,
        order_date: orderData.date,
        payment_method: orderData.paymentMethod,
        order_items: itemsHTML,
        total_price: orderData.total.toLocaleString('id-ID')
    };

    // Mengirim HTTP POST langsung ke server Gmail (Mencegah blokir CORS)
    fetch(GAS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === "success") {
            console.log("SUKSES! Email Invoice resmi terkirim ke: " + orderData.email);
        } else {
            console.error("Gagal mengirim email (GAS error):", result.message);
        }
    })
    .catch(error => {
        console.error("Error saat menghubungi server Google:", error);
    });
}

// 3. FUNGSI DOWNLOAD INVOICE PDF PROFESIONAL
function downloadInvoicePDF(orderData) {
    if (!orderData) {
        alert("Data pesanan tidak ditemukan!");
        return;
    }

    if (typeof window.showToast === 'function') {
        window.showToast('Sedang menyiapkan file PDF...', '⏳');
    }

    let itemsHTML = "";
    orderData.items.forEach((item, index) => {
        const unitPrice = item.pricePerItem 
            ? item.pricePerItem.toLocaleString('id-ID') 
            : item.totalPrice.toLocaleString('id-ID');

        itemsHTML += `
            <tr style="border-bottom: 1px solid #E5E7EB; background-color: ${index % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
                <td style="padding: 12px 10px; color: #111827; font-weight: 600; font-size: 12px;">
                    ${item.product}
                    <div style="font-weight: 400; color: #6B7280; font-size: 11px; margin-top: 3px;">
                        Warna: ${item.color} | Ukuran: ${item.size}
                    </div>
                </td>
                <td style="padding: 12px 10px; text-align: center; font-size: 12px; color: #111827; font-weight: 600;">${item.qty}</td>
                <td style="padding: 12px 10px; text-align: right; font-size: 12px; color: #374151;">Rp ${unitPrice}</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: 700; font-size: 12px; color: #111827;">Rp ${item.totalPrice.toLocaleString('id-ID')}</td>
            </tr>
        `;
    });

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '700px';
    wrapper.style.background = '#FFFFFF';
    wrapper.style.zIndex = '-9999';
    wrapper.style.opacity = '1';
    wrapper.style.pointerEvents = 'none';

    wrapper.innerHTML = `
        <div id="pdf-print-area" style="width: 700px; padding: 40px; font-family: Arial, Helvetica, sans-serif; color: #111827; background-color: #FFFFFF; box-sizing: border-box;">
            <table style="width: 100%; border-bottom: 3px solid #E83124; padding-bottom: 18px; margin-bottom: 24px;">
                <tr>
                    <td style="vertical-align: top;">
                        <div style="color: #E83124; font-size: 28px; font-weight: 900; letter-spacing: 0.5px;">8UR STORY</div>
                        <div style="color: #4B5563; font-size: 12px; margin-top: 4px; font-weight: 600;">Official Custom Apparel &amp; Streetwear</div>
                        <div style="color: #6B7280; font-size: 11px; margin-top: 2px;">Kota Bekasi, Jawa Barat, Indonesia</div>
                    </td>
                    <td style="vertical-align: top; text-align: right;">
                        <div style="color: #111827; font-size: 22px; font-weight: 900; letter-spacing: 1.5px;">INVOICE</div>
                        <div style="color: #374151; font-size: 12px; margin-top: 6px;"><strong>No. Pesanan:</strong> #${orderData.orderId}</div>
                        <div style="color: #6B7280; font-size: 11px; margin-top: 2px;"><strong>Tanggal:</strong> ${orderData.date}</div>
                        <div style="margin-top: 8px;">
                            <span style="display: inline-block; background-color: #10B981; color: #FFFFFF; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px;">
                                PEMBAYARAN DITERIMA
                            </span>
                        </div>
                    </td>
                </tr>
            </table>

            <table style="width: 100%; margin-bottom: 24px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px;">
                <tr>
                    <td style="vertical-align: top; width: 60%;">
                        <div style="font-size: 10px; color: #6B7280; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">DITAGIHKAN &amp; DIKIRIM KEPADA:</div>
                        <div style="font-size: 15px; font-weight: bold; color: #111827; margin-top: 4px;">${orderData.name}</div>
                        <div style="font-size: 12px; color: #374151; margin-top: 3px;">WhatsApp: ${orderData.phone}</div>
                        <div style="font-size: 12px; color: #374151; margin-top: 2px;">Email: ${orderData.email}</div>
                        <div style="font-size: 12px; color: #374151; margin-top: 4px; line-height: 1.4;">Alamat: ${orderData.address}</div>
                    </td>
                    <td style="vertical-align: top; text-align: right; width: 40%;">
                        <div style="font-size: 10px; color: #6B7280; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">METODE PEMBAYARAN:</div>
                        <div style="font-size: 14px; font-weight: bold; color: #E83124; margin-top: 4px;">${orderData.paymentMethod}</div>
                        <div style="font-size: 11px; color: #6B7280; margin-top: 8px;">Estimasi Produksi:</div>
                        <div style="font-size: 12px; font-weight: bold; color: #111827;">1 - 3 Hari Kerja</div>
                    </td>
                </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #E5E7EB;">
                <thead>
                    <tr style="background-color: #111827; color: #FFFFFF;">
                        <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase;">Deskripsi Produk</th>
                        <th style="padding: 10px; text-align: center; font-size: 11px; font-weight: bold; text-transform: uppercase; width: 55px;">Qty</th>
                        <th style="padding: 10px; text-align: right; font-size: 11px; font-weight: bold; text-transform: uppercase; width: 115px;">Harga Satuan</th>
                        <th style="padding: 10px; text-align: right; font-size: 11px; font-weight: bold; text-transform: uppercase; width: 125px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <table style="width: 100%; margin-bottom: 35px;">
                <tr>
                    <td style="width: 50%;"></td>
                    <td style="width: 50%; background-color: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 8px; padding: 14px 16px;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="font-size: 13px; font-weight: bold; color: #111827;">TOTAL PEMBAYARAN</td>
                                <td style="font-size: 18px; font-weight: 900; color: #E83124; text-align: right;">Rp ${orderData.total.toLocaleString('id-ID')}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <div style="border-top: 1px dashed #D1D5DB; padding-top: 16px; text-align: center;">
                <div style="font-size: 12px; font-weight: bold; color: #111827;">Terima kasih telah berbelanja di 8UR STORY!</div>
                <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">
                    Simpan bukti pembayaran ini sebagai referensi pesanan Anda. Tim kami akan menghubungi WhatsApp Anda untuk pengiriman resi.
                </div>
                <div style="font-size: 10px; color: #9CA3AF; margin-top: 8px;">
                    &copy; 2026 8UR STORY Official • Dokumen Sah &amp; Diterbitkan Otomatis oleh Sistem
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(wrapper);
    const targetArea = wrapper.querySelector('#pdf-print-area');

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Invoice_8URSTORY_${orderData.orderId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 700,
            windowWidth: 700,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
        html2pdf().set(opt).from(targetArea).save().then(() => {
            document.body.removeChild(wrapper);
            if (typeof window.showToast === 'function') {
                window.showToast('Invoice PDF berhasil diunduh!', '📄');
            }
        }).catch(err => {
            console.error('PDF Error:', err);
            if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
        });
    }, 150);
}
