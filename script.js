/* ============================================================
   8UR STORY — script.js  v2.3 FINAL (Mobile Menu + Audio Fix)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════
     0. LOADING SCREEN & SCROLL PROGRESS
  ══════════════════════════════════════ */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 1200);
    });
    setTimeout(() => loader && loader.classList.add('hidden'), 2500);
  }

  const progressBar = document.getElementById('page-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollH   = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollH > 0) {
        progressBar.style.width = (scrollTop / scrollH * 100) + '%';
      }
    });
  }

  /* ══════════════════════════════════════
     1. AUTO HAMBURGER MENU (UNTUK LAYAR HP)
  ══════════════════════════════════════ */
  const header      = document.querySelector('header');
  const headerRight = document.querySelector('.header-right');
  const navLinks    = document.querySelector('.nav-links');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (headerRight && navLinks && !document.querySelector('.hamburger-btn')) {
    const burgerBtn = document.createElement('button');
    burgerBtn.type = 'button';
    burgerBtn.className = 'hamburger-btn';
    burgerBtn.setAttribute('aria-label', 'Buka Menu Navigasi');
    burgerBtn.innerHTML = '<span></span><span></span><span></span>';
    headerRight.appendChild(burgerBtn);

    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      burgerBtn.classList.toggle('open');
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('open');
        navLinks.classList.remove('mobile-open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        burgerBtn.classList.remove('open');
        navLinks.classList.remove('mobile-open');
      }
    });
  }

  /* ══════════════════════════════════════
     2. CUSTOM CURSOR
  ══════════════════════════════════════ */
  const dot     = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (dot && outline) {
    let mouseX = 0, mouseY = 0, outX = 0, outY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px';
    });
    function animateCursor() {
      outX += (mouseX - outX) * 0.15;
      outY += (mouseY - outY) * 0.15;
      outline.style.left = outX + 'px'; outline.style.top = outY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ══════════════════════════════════════
     3. SCROLL REVEAL & COUNTER
  ══════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length > 0) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      revealEls.forEach(el => revealObserver.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('active'));
    }
  }

  /* ══════════════════════════════════════
     4. TOAST NOTIFICATION & CART BADGE
  ══════════════════════════════════════ */
  window.showToast = function (msg, icon = '✅') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  };

  function updateCartCount() {
    const badges = document.querySelectorAll('#cart-count');
    let cart = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
    let total = cart.reduce((s, i) => s + parseInt(i.qty || 1), 0);
    badges.forEach(badge => {
      badge.textContent = total;
      if (total > 0) {
        badge.classList.add('visible');
        badge.style.display = 'flex';
      } else {
        badge.classList.remove('visible');
        badge.style.display = 'none';
      }
    });
  }
  updateCartCount();

  /* ══════════════════════════════════════
     5. PRODUCT PAGE LOGIC
  ══════════════════════════════════════ */
  const priceDisplay = document.getElementById('total-price');
  if (priceDisplay) {
    const sizeSelect       = document.getElementById('size-select');
    const qtyInput         = document.getElementById('quantity');
    const btnAddToCart     = document.getElementById('add-to-cart');
    const btnBuyNow        = document.getElementById('buy-now');
    const customDesign     = document.getElementById('custom-design');
    const productNameEl    = document.getElementById('product-name');
    const baseShirtImage   = document.getElementById('base-shirt');
    const colorNameDisplay = document.getElementById('color-name-display');
    const swatches         = document.querySelectorAll('.color-swatch');

    const productName = productNameEl ? productNameEl.innerText : 'Produk 8UR STORY';
    const basePrice   = parseInt(priceDisplay.getAttribute('data-baseprice')) || 0;
    let selectedColor = 'Putih (Basic)';
    let colorAddon    = 0;

    swatches.forEach(s => {
      s.addEventListener('click', function () {
        swatches.forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        selectedColor = this.dataset.color || 'Putih (Basic)';
        colorAddon    = parseInt(this.dataset.addon) || 0;
        if (colorNameDisplay) colorNameDisplay.textContent = selectedColor;
        updatePrice(true);
      });
    });

    function updatePrice(animate = false) {
      const sizeAddon = parseInt(sizeSelect?.value) || 0;
      const qty       = Math.max(1, parseInt(qtyInput?.value) || 1);
      const total     = (basePrice + colorAddon + sizeAddon) * qty;
      priceDisplay.textContent = 'Rp ' + total.toLocaleString('id-ID');
      if (animate) {
        priceDisplay.classList.remove('price-bump');
        void priceDisplay.offsetWidth;
        priceDisplay.classList.add('price-bump');
      }
      return total;
    }

    if (sizeSelect) sizeSelect.addEventListener('change', () => updatePrice(true));
    if (qtyInput)   qtyInput.addEventListener('input',  () => updatePrice(true));

    function buildCartItem() {
      const sizeAddon = parseInt(sizeSelect?.value) || 0;
      const qty       = Math.max(1, parseInt(qtyInput?.value) || 1);
      const unitPrice = basePrice + colorAddon + sizeAddon;
      const sizeTxt   = sizeSelect?.options[sizeSelect.selectedIndex]?.text || 'All Size';
      const fileName  = (customDesign?.files?.length > 0) ? customDesign.files[0].name : 'Desain Default';
      return {
        id: Date.now(),
        product: productName,
        color: selectedColor,
        size: sizeTxt,
        qty: qty,
        pricePerItem: unitPrice,
        totalPrice: unitPrice * qty,
        designFile: fileName,
        image: baseShirtImage?.src || 'images/logo.png',
      };
    }

    if (btnAddToCart) {
      btnAddToCart.addEventListener('click', function () {
        const cart = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
        cart.push(buildCartItem());
        localStorage.setItem('8urStoryCart', JSON.stringify(cart));
        updateCartCount();

        this.classList.add('btn-animate-click');
        const prev = this.textContent;
        this.textContent = '✓ Berhasil Masuk Keranjang!';
        showToast(`${productName} ditambahkan ke keranjang!`, '🛒');
        setTimeout(() => {
          this.classList.remove('btn-animate-click');
          this.textContent = prev;
        }, 1300);
      });
    }

    if (btnBuyNow) {
      btnBuyNow.addEventListener('click', function () {
        localStorage.setItem('8urStoryCart', JSON.stringify([buildCartItem()]));
        updateCartCount();
        window.location.href = 'checkout.html';
      });
    }
  }

  /* ══════════════════════════════════════
     6. SLIDER GAMBAR PRODUK, QTY STEPPER & UPLOAD PREVIEW
  ══════════════════════════════════════ */
  let currentImgIndex = 0;
  const thumbImages  = document.querySelectorAll('.thumbnail-gallery img');
  const mainImage    = document.getElementById('base-shirt');
  const slideCounter = document.getElementById('slide-counter');

  window.changeImage = function (indexOrSrc) {
    if (!mainImage || thumbImages.length === 0) return;

    if (typeof indexOrSrc === 'number') {
      currentImgIndex = (indexOrSrc + thumbImages.length) % thumbImages.length;
    } else {
      const foundIdx = Array.from(thumbImages).findIndex(img => img.src === indexOrSrc);
      currentImgIndex = foundIdx !== -1 ? foundIdx : 0;
    }

    const newSrc = thumbImages[currentImgIndex].src;
    mainImage.classList.remove('image-fade-anim');
    void mainImage.offsetWidth;
    mainImage.src = newSrc;
    mainImage.classList.add('image-fade-anim');

    thumbImages.forEach((img, idx) => {
      img.classList.toggle('active', idx === currentImgIndex);
    });

    if (slideCounter) {
      slideCounter.textContent = `${currentImgIndex + 1} / ${thumbImages.length}`;
    }
  };

  window.prevImage = function () { window.changeImage(currentImgIndex - 1); };
  window.nextImage = function () { window.changeImage(currentImgIndex + 1); };

  window.stepQuantity = function (delta) {
    const qtyInput = document.getElementById('quantity');
    if (!qtyInput) return;
    const current = parseInt(qtyInput.value) || 1;
    qtyInput.value = Math.max(1, current + delta);
    qtyInput.dispatchEvent(new Event('input'));
  };

  const customDesignInput = document.getElementById('custom-design');
  const uploadContainer   = document.getElementById('upload-preview-container');
  const uploadDropzone    = document.getElementById('upload-dropzone');
  const uploadTextEl      = document.querySelector('.upload-text');

  if (customDesignInput && uploadContainer) {
    customDesignInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;

      if (uploadTextEl) uploadTextEl.textContent = 'Ganti File Desain Custom';
      if (uploadDropzone) {
        uploadDropzone.style.borderColor = 'var(--success)';
        uploadDropzone.style.background  = '#F0FDF4';
      }

      const reader = new FileReader();
      reader.onload = e => {
        uploadContainer.innerHTML = `
          <div class="upload-preview-card">
            <img src="${e.target.result}" alt="Preview Desain">
            <div class="upload-preview-details">
              <h4>${file.name}</h4>
              <p>✓ Desain siap dicetak resolusi tinggi</p>
            </div>
            <button type="button" class="remove-upload-btn" id="btn-remove-design">Hapus</button>
          </div>
        `;
        const removeBtn = document.getElementById('btn-remove-design');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            customDesignInput.value = '';
            uploadContainer.innerHTML = '';
            if (uploadTextEl) uploadTextEl.textContent = 'Klik untuk Unggah File Desain (PNG / JPG)';
            if (uploadDropzone) {
              uploadDropzone.style.borderColor = '#D1D5DB';
              uploadDropzone.style.background  = '#FAFAFA';
            }
            showToast('File desain custom dibatalkan', '🗑️');
          });
        }
      };
      reader.readAsDataURL(file);
      showToast(`Desain "${file.name}" siap dicetak!`, '🎨');
    });
  }

  /* ══════════════════════════════════════
     7. CART PAGE
  ══════════════════════════════════════ */
  const cartContainer = document.getElementById('cart-items-container');
  if (cartContainer) {
    let cart = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
    const totalEl     = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('btn-checkout');

    function renderCart() {
      cartContainer.innerHTML = '';
      let grand = 0;
      if (cart.length === 0) {
        cartContainer.innerHTML = `
          <div class="empty-cart">
            <div style="font-size:3.5rem;margin-bottom:12px">🛒</div>
            <h3>Keranjang Belanja Anda Kosong</h3>
            <p style="margin-top:6px; font-size:13.5px">Yuk pilih produk dasar favoritmu dan mulai kustomisasi sekarang!</p>
            <a href="index.html#katalog" style="display:inline-block;margin-top:18px;background:var(--red);color:#fff;padding:12px 26px;border-radius:50px;font-weight:700;text-decoration:none;font-size:13.5px">Mulai Belanja</a>
          </div>`;
        if (totalEl) totalEl.style.display = 'none';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
      }
      if (totalEl) totalEl.style.display = '';
      if (checkoutBtn) checkoutBtn.style.display = '';

      cart.forEach((item, idx) => {
        grand += item.totalPrice;
        cartContainer.innerHTML += `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.product}" onerror="this.src='images/logo.png'">
            <div style="flex:1;min-width:140px">
              <h4 style="font-size:14.5px;font-weight:700;margin-bottom:3px">${item.product}</h4>
              <p style="font-size:12px;color:var(--muted)">Warna: ${item.color} | Ukuran: ${item.size}</p>
              <p style="font-size:12px;color:var(--muted)">File: ${item.designFile}</p>
              <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
                <button onclick="changeQtyCart(${idx},-1)" style="width:28px;height:28px;border:1.5px solid var(--border);border-radius:50%;background:#fff;font-weight:700;cursor:pointer;font-size:15px">−</button>
                <span style="font-weight:700;font-size:14px">${item.qty}</span>
                <button onclick="changeQtyCart(${idx},1)"  style="width:28px;height:28px;border:1.5px solid var(--border);border-radius:50%;background:#fff;font-weight:700;cursor:pointer;font-size:15px">+</button>
              </div>
            </div>
            <div style="text-align:right;min-width:95px;margin-left:auto">
              <strong style="font-size:14.5px;color:var(--red)">Rp ${item.totalPrice.toLocaleString('id-ID')}</strong><br>
              <button onclick="removeItem(${idx})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:11.5px;margin-top:5px;text-decoration:underline">Hapus</button>
            </div>
          </div>`;
      });
      if (totalEl) totalEl.textContent = 'Total Tagihan: Rp ' + grand.toLocaleString('id-ID');
    }

    window.removeItem = function (idx) {
      cart.splice(idx, 1);
      localStorage.setItem('8urStoryCart', JSON.stringify(cart));
      renderCart();
      updateCartCount();
      showToast('Produk dihapus dari keranjang', '🗑️');
    };

    window.changeQtyCart = function (idx, delta) {
      cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
      cart[idx].totalPrice = cart[idx].pricePerItem * cart[idx].qty;
      localStorage.setItem('8urStoryCart', JSON.stringify(cart));
      renderCart();
      updateCartCount();
    };

    renderCart();
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => window.location.href = 'checkout.html');
  }

  /* ══════════════════════════════════════
     8. CHECKOUT PAGE + AUDIO PEMBAYARAN DITERIMA (SUPPORT .MP3 & .mp3 DI HP/RENDER)
  ══════════════════════════════════════ */
  const btnConfirm   = document.getElementById('btn-confirm-order');
  const paymentModal = document.getElementById('payment-modal');
  const successModal = document.getElementById('success-modal');
  const btnSubmitPay = document.getElementById('btn-submit-payment');
  const btnCancelPay = document.getElementById('btn-cancel-payment');
  const summaryEl    = document.getElementById('order-summary');

  /* Deteksi Otomatis File Audio (.MP3 huruf besar maupun .mp3 huruf kecil untuk server Linux/Render) */
  const paymentSuccessSound = new Audio();
  paymentSuccessSound.preload = 'auto';
  paymentSuccessSound.src = 'sound/pembayaran%20diterima.MP3';
  paymentSuccessSound.addEventListener('error', function fallbackAudio() {
    paymentSuccessSound.removeEventListener('error', fallbackAudio);
    paymentSuccessSound.src = 'sound/pembayaran%20diterima.mp3';
    paymentSuccessSound.load();
  });

  /* Silent Unlock untuk Browser HP (Tanpa suara klik sama sekali, agar saat klik Sudah Bayar 100% berbunyi) */
  let audioUnlocked = false;
  function unlockAudioSilently() {
    if (audioUnlocked) return;
    paymentSuccessSound.muted = true;
    const p = paymentSuccessSound.play();
    if (p !== undefined) {
      p.then(() => {
        paymentSuccessSound.pause();
        paymentSuccessSound.currentTime = 0;
        paymentSuccessSound.muted = false;
        audioUnlocked = true;
      }).catch(() => {
        paymentSuccessSound.muted = false;
      });
    }
  }

  let checkoutTotal = 0;
  let finalOrderID  = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  if (summaryEl) {
    const cart = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
    let html = '<h3>Ringkasan Pesanan</h3>';
    if (cart.length === 0) {
      html += '<p style="color:var(--red);font-size:13.5px">Pesanan kosong. Silakan kembali memilih produk di katalog.</p>';
      if (btnConfirm) btnConfirm.disabled = true;
    } else {
      html += '<div style="max-height:260px;overflow-y:auto;padding-right:4px">';
      cart.forEach(item => {
        checkoutTotal += item.totalPrice;
        html += `
          <div style="padding:10px 0;border-bottom:1px dashed var(--border)">
            <strong style="font-size:13.5px;display:block;margin-bottom:3px">${item.product} (x${item.qty})</strong>
            <span style="font-size:12px;color:var(--muted)">Warna: ${item.color} | Ukuran: ${item.size}</span><br>
            <span style="font-size:13.5px;color:var(--red);font-weight:700">Rp ${item.totalPrice.toLocaleString('id-ID')}</span>
          </div>`;
      });
      html += '</div>';
    }
    html += `<div style="margin-top:14px;padding-top:12px;border-top:2px solid var(--border)">
      <p style="font-size:12.5px;color:var(--muted);margin-bottom:4px">Total Tagihan:</p>
      <h3 style="font-size:1.45rem;color:var(--red);font-weight:900;border:none;padding:0;margin:0">Rp ${checkoutTotal.toLocaleString('id-ID')}</h3>
    </div>`;
    summaryEl.innerHTML = html;
  }

  function setStep(step) {
    document.querySelectorAll('.checkout-step-item').forEach((el, i) => {
      el.classList.remove('active', 'done');
      if (i < step)   el.classList.add('done');
      if (i === step) el.classList.add('active');
    });
  }
  setStep(0);

  if (btnConfirm) {
    btnConfirm.addEventListener('click', function (e) {
      e.preventDefault();
      unlockAudioSilently(); // Membuka izin audio HP secara hening (0% suara)

      const cart = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
      if (cart.length === 0) { showToast('Pesanan kosong! Silakan belanja dulu.', '⚠️'); return; }

      const nameEl  = document.getElementById('buyer-name');
      const phoneEl = document.getElementById('buyer-phone');
      const addrEl  = document.getElementById('buyer-address');

      const name  = nameEl?.value.trim();
      const phone = phoneEl?.value.trim();
      const addr  = addrEl?.value.trim();

      if (!name)  { showToast('Mohon isi Nama Lengkap Anda', '⚠️'); nameEl?.focus(); return; }
      if (!phone) { showToast('Mohon isi Nomor WhatsApp Aktif', '⚠️'); phoneEl?.focus(); return; }
      if (!addr)  { showToast('Mohon isi Alamat Pengiriman Lengkap', '⚠️'); addrEl?.focus(); return; }

      const selected = document.querySelector('input[name="payment"]:checked')?.value;
      if (!selected) { showToast('Pilih metode pembayaran terlebih dahulu', '⚠️'); return; }

      setStep(1);

      document.getElementById('modal-bank-name').textContent = selected === 'QRIS'
        ? 'Pembayaran via QRIS' : `Transfer Virtual Account ${selected}`;
      document.getElementById('modal-total-pay').textContent =
        `Total Tagihan: Rp ${checkoutTotal.toLocaleString('id-ID')}`;

      const qrImg   = document.getElementById('qr-image');
      const vaBlock = document.getElementById('rekening-container');
      const vaCode  = document.getElementById('va-code');

      if (selected === 'QRIS') {
        qrImg.style.display   = 'block';
        vaBlock.style.display = 'none';
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_8URSTORY_${finalOrderID}_TOTAL_${checkoutTotal}`;
      } else {
        qrImg.style.display   = 'none';
        vaBlock.style.display = 'flex';
        const prefixes = { BCA: '3901', MANDIRI: '89508', BRI: '8881' };
        vaCode.textContent = (prefixes[selected] || '3901') + ' ' + Math.floor(10000000 + Math.random() * 90000000);
      }
      paymentModal.style.display = 'flex';
    });
  }

  if (btnCancelPay) {
    btnCancelPay.addEventListener('click', function () {
      paymentModal.style.display = 'none';
      setStep(0);
    });
  }

  if (btnSubmitPay) {
    btnSubmitPay.addEventListener('click', function () {
      const proof = document.getElementById('payment-proof');
      if (!proof || proof.files.length === 0) {
        showToast('Mohon upload bukti pembayaran Anda terlebih dahulu!', '⚠️');
        return;
      }

      paymentModal.style.display = 'none';
      setStep(2);

      /* Putar Suara Pembayaran Diterima tepat saat Pop-Up Sukses muncul */
      paymentSuccessSound.muted = false;
      paymentSuccessSound.currentTime = 0;
      paymentSuccessSound.play().catch(() => {
        const backupAudio = new Audio('sound/pembayaran%20diterima.mp3');
        backupAudio.play().catch(err => console.log('Audio error:', err));
      });

      const orderIdEl = document.getElementById('success-order-id');
      if (orderIdEl) orderIdEl.textContent = finalOrderID;

      localStorage.removeItem('8urStoryCart');
      updateCartCount();

      successModal.style.display = 'flex';
    });
  }

  /* ══════════════════════════════════════
     9. ACCORDION, FILTER KATALOG, SEARCH & MODAL
  ══════════════════════════════════════ */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    const a = item.querySelector('.faq-answer');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item.active').forEach(el => {
        el.classList.remove('active');
        const ans = el.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('active');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  const filterBtns   = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('#product-list .product-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const val = this.dataset.filter;
      productCards.forEach(card => {
        const show = val === 'all' || card.dataset.category === val;
        card.style.display = show ? 'flex' : 'none';
        if (show) {
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = 'fadeInUp .4s ease both';
        }
      });
    });
  });

  const searchInput = document.querySelector('.search-bar');
  if (searchInput && productCards.length > 0) {
    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      productCards.forEach(card => {
        const txt = (card.querySelector('h3')?.innerText || '').toLowerCase();
        const cat = (card.dataset.name || '').toLowerCase();
        card.style.display = (txt.includes(q) || cat.includes(q)) ? 'flex' : 'none';
      });
    });
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay && overlay.id === 'payment-modal') {
        overlay.style.display = 'none';
        setStep(0);
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

});
