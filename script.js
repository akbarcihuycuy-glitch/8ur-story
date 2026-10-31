/* ============================================================
   8UR STORY — script.js  v5.1 FINAL
   (Home-Only Welcome Delay 1.5s + 10s Voice + Tet-Tott Buzzer)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ══════════════════════════════════════════════════════════════
     0A. AUTO CLEAN URL (HILANGKAN .HTML SEPERTI MARKETPLACE)
  ══════════════════════════════════════════════════════════════ */
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    // 1. Bersihkan URL di address bar saat halaman terbuka
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('/index.html')) {
      const newUrl = currentPath.slice(0, -10) + window.location.search + window.location.hash;
      window.history.replaceState(null, '', newUrl || '/');
    } else if (currentPath.endsWith('.html')) {
      const newUrl = currentPath.slice(0, -5) + window.location.search + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }

    // 2. Ubah semua link <a href="...html"> secara otomatis saat website tampil di Render
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      if (href === 'index.html') {
        link.setAttribute('href', '/');
      } else if (href.startsWith('index.html#')) {
        link.setAttribute('href', '/' + href.substring(10));
      } else if (href.endsWith('.html')) {
        link.setAttribute('href', '/' + href.slice(0, -5));
      }
    });
  }

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

 /* ══════════════════════════════════════════════════════════════════
     0B. VOICE OVER SAPAAN CS LISA (AGGRESSIVE AUTOPLAY 0.5 DETIK)
  ══════════════════════════════════════════════════════════════════ */
  const isHomePage = document.querySelector('.hero-section') !== null;

  if (isHomePage && !sessionStorage.getItem('8ur_welcome_voiced')) {
    const audioSrc = 'sound/selamat%20datang.MP3';
    let welcomeEl = document.getElementById('vo-welcome');
    if (!welcomeEl) {
      welcomeEl = new Audio(audioSrc);
      welcomeEl.preload = 'auto';
    }
    welcomeEl.autoplay = true;

    let welcomePlayed = false;

    function markAsPlayed() {
      welcomePlayed = true;
      sessionStorage.setItem('8ur_welcome_voiced', 'true');
      ['pointerdown', 'touchstart', 'touchmove', 'mousemove', 'wheel', 'scroll', 'keydown', 'click'].forEach(evt => {
        window.removeEventListener(evt, forcePlayWelcome, true);
      });
    }

    function forcePlayWelcome() {
      if (welcomePlayed || sessionStorage.getItem('8ur_welcome_voiced')) return;

      /* Percobaan 1: Langsung putar bersuara penuh */
      welcomeEl.muted = false;
      welcomeEl.volume = 1.0;
      const playAttempt = welcomeEl.play();

      if (playAttempt !== undefined) {
        playAttempt.then(() => {
          markAsPlayed();
        }).catch(() => {
          /* Percobaan 2 (Trik Bypass): Putar dalam keadaan Muted dulu (diizinkan browser), lalu Unmute paksa */
          welcomeEl.muted = true;
          welcomeEl.play().then(() => {
            setTimeout(() => {
              welcomeEl.muted = false;
              welcomeEl.volume = 1.0;
              if (!welcomeEl.paused) {
                markAsPlayed();
              }
            }, 80);
          }).catch(() => {
            /* Jika sistem OS HP mengunci keras, akan langsung menyala begitu jari menyentuh/menggeser layar */
          });
        });
      }
    }

    /* Jalankan otomatis tepat 0.5 detik (500ms) setelah halaman dibuka */
    setTimeout(forcePlayWelcome, 500);

    /* Pemicu cadangan super sensitif (termasuk gerakan mouse / geser layar) */
    ['pointerdown', 'touchstart', 'touchmove', 'mousemove', 'wheel', 'scroll', 'keydown', 'click'].forEach(evt => {
      window.addEventListener(evt, forcePlayWelcome, { capture: true, passive: true });
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
     2. AUTO-SLIDE MARQUEE TESTIMONI (TANPA PUTUS)
  ══════════════════════════════════════ */
  const testimonialsTrack = document.getElementById('testimonials-track');
  if (testimonialsTrack && !testimonialsTrack.dataset.cloned) {
    testimonialsTrack.innerHTML += testimonialsTrack.innerHTML;
    testimonialsTrack.dataset.cloned = 'true';
  }

  /* ══════════════════════════════════════
     3. CUSTOM CURSOR & SCROLL REVEAL
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

  /* ════════════════════════════════════════════════════════════════════════
     8. CHECKOUT PAGE + TIMER 1 MENIT + VOICE 10 DETIK + BUNYI "TET-TOTT!"
  ════════════════════════════════════════════════════════════════════════ */
  const btnConfirm     = document.getElementById('btn-confirm-order');
  const paymentModal   = document.getElementById('payment-modal');
  const successModal   = document.getElementById('success-modal');
  const failedModal    = document.getElementById('failed-modal');
  const btnSubmitPay   = document.getElementById('btn-submit-payment');
  const btnCancelPay   = document.getElementById('btn-cancel-payment');
  const btnRetryPay    = document.getElementById('btn-retry-payment');
  const btnCloseFailed = document.getElementById('btn-close-failed');
  const summaryEl      = document.getElementById('order-summary');
  const timerDisplay   = document.getElementById('payment-timer');
  const countdownBox   = document.getElementById('countdown-box');

  let paymentTimerInterval = null;
  let remainingSeconds     = 60;

  let paymentSuccessSound = document.getElementById('vo-success');
  if (!paymentSuccessSound) {
    paymentSuccessSound = document.createElement('audio');
    paymentSuccessSound.id = 'vo-success';
    paymentSuccessSound.preload = 'auto';
    paymentSuccessSound.innerHTML = `
      <source src="sound/pembayaran%20diterima.MP3" type="audio/mpeg">
      <source src="sound/pembayaran%20diterima.mp3" type="audio/mpeg">
    `;
    document.body.appendChild(paymentSuccessSound);
  }

  let tenSecWarningSound = document.getElementById('vo-10sec');
  if (!tenSecWarningSound) {
    tenSecWarningSound = document.createElement('audio');
    tenSecWarningSound.id = 'vo-10sec';
    tenSecWarningSound.preload = 'auto';
    tenSecWarningSound.innerHTML = `
      <source src="sound/10%20detik%20%20(%20waktu%20habis%20).MP3" type="audio/mpeg">
      <source src="sound/10%20detik%20(%20waktu%20habis%20).MP3" type="audio/mpeg">
      <source src="sound/10%20detik%20%20(%20waktu%20habis%20).mp3" type="audio/mpeg">
      <source src="sound/10%20detik%20(%20waktu%20habis%20).mp3" type="audio/mpeg">
    `;
    document.body.appendChild(tenSecWarningSound);
  }

  /* Fungsi Hentikan Suara 10 Detik Seketika */
  function stopTenSecWarningSound() {
    try {
      tenSecWarningSound.pause();
      tenSecWarningSound.currentTime = 0;
    } catch (e) {}
  }

  /* Efek Suara Buzzer "Tet-Tott!" Saat Waktu Habis (00:00) */
  function playTetTottBuzzer() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Nada 1: "TET" (Pendek & Tegas)
      const osc1  = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(340, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.19);

      // Nada 2: "TOTT" (Lebih Rendah & Panjang)
      const osc2  = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(215, now + 0.23);
      osc2.frequency.linearRampToValueAtTime(195, now + 0.72);
      gain2.gain.setValueAtTime(0.22, now + 0.23);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.23);
      osc2.stop(now + 0.76);
    } catch (e) {}
  }

  let unlockedSuccess = false;
  let unlockedTenSec  = false;

  function unlockAudioSilently() {
    if (!unlockedSuccess) {
      paymentSuccessSound.muted = true;
      const p1 = paymentSuccessSound.play();
      if (p1 !== undefined) {
        p1.then(() => {
          paymentSuccessSound.pause();
          paymentSuccessSound.currentTime = 0;
          paymentSuccessSound.muted = false;
          unlockedSuccess = true;
        }).catch(() => {
          paymentSuccessSound.muted = false;
        });
      }
    }

    if (!unlockedTenSec) {
      tenSecWarningSound.muted = true;
      const p2 = tenSecWarningSound.play();
      if (p2 !== undefined) {
        p2.then(() => {
          tenSecWarningSound.pause();
          tenSecWarningSound.currentTime = 0;
          tenSecWarningSound.muted = false;
          unlockedTenSec = true;
        }).catch(() => {
          tenSecWarningSound.muted = false;
        });
      }
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

  function setStep(step, isFailed = false) {
    document.querySelectorAll('.checkout-step-item').forEach((el, i) => {
      el.classList.remove('active', 'done', 'failed');
      if (i < step)   el.classList.add('done');
      if (i === step) el.classList.add(isFailed ? 'failed' : 'active');
    });
  }
  setStep(0);

  function stopPaymentTimer(stopVoice = true) {
    if (paymentTimerInterval) {
      clearInterval(paymentTimerInterval);
      paymentTimerInterval = null;
    }
    if (stopVoice) {
      stopTenSecWarningSound();
    }
  }

  function startPaymentTimer() {
    stopPaymentTimer(true);
    remainingSeconds = 60;
    if (countdownBox) countdownBox.classList.remove('danger');
    if (timerDisplay) timerDisplay.textContent = '01:00';

    paymentTimerInterval = setInterval(() => {
      remainingSeconds--;
      const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
      const secs = String(remainingSeconds % 60).padStart(2, '0');
      if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;

      if (remainingSeconds <= 15 && countdownBox) {
        countdownBox.classList.add('danger');
      }

      /* Tepat di Detik ke-10: Putar Voice Over "10 detik  ( waktu habis )" */
      if (remainingSeconds === 10) {
        tenSecWarningSound.muted = false;
        tenSecWarningSound.volume = 1.0;
        tenSecWarningSound.currentTime = 0;
        tenSecWarningSound.play().catch(() => {
          const backup10s = new Audio('sound/10%20detik%20%20(%20waktu%20habis%20).MP3');
          backup10s.play().catch(() => {
            const backup10sSingle = new Audio('sound/10%20detik%20(%20waktu%20habis%20).MP3');
            backup10sSingle.play().catch(e => console.log('Audio 10s error:', e));
          });
        });
      }

      /* Tepat saat Waktu Habis (00:00): Hentikan suara 10s, bunyikan "Tet-Tott!", tampilkan Pop-Up Gagal */
      if (remainingSeconds <= 0) {
        stopPaymentTimer(true);
        if (paymentModal) paymentModal.style.display = 'none';
        setStep(1, true);
        playTetTottBuzzer();
        showToast('Waktu pembayaran 1 menit telah habis!', '⏰');
        if (failedModal) failedModal.style.display = 'flex';
      }
    }, 1000);
  }

  function openPaymentPopup() {
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

    if (failedModal) failedModal.style.display = 'none';
    if (paymentModal) paymentModal.style.display = 'flex';
    startPaymentTimer();
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', function (e) {
      e.preventDefault();
      unlockAudioSilently();

      const cart = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
      if (cart.length === 0) { showToast('Pesanan kosong! Silakan belanja dulu.', '⚠️'); return; }

      const nameEl  = document.getElementById('buyer-name');
      const phoneEl = document.getElementById('buyer-phone');
      const emailEl = document.getElementById('buyer-email');
      const addrEl  = document.getElementById('buyer-address');

      const name  = nameEl?.value.trim();
      const phone = phoneEl?.value.trim();
      const email = emailEl?.value.trim();
      const addr  = addrEl?.value.trim();

      if (!name)  { showToast('Mohon isi Nama Lengkap Anda', '⚠️'); nameEl?.focus(); return; }
      if (!phone) { showToast('Mohon isi Nomor WhatsApp Aktif', '⚠️'); phoneEl?.focus(); return; }
      if (!email || !email.includes('@')) { showToast('Mohon isi Alamat Email yang Valid', '⚠️'); emailEl?.focus(); return; }
      if (!addr)  { showToast('Mohon isi Alamat Pengiriman Lengkap', '⚠️'); addrEl?.focus(); return; }

      openPaymentPopup();
    });
  }

  /* Jika klik "Batal / Tutup", hentikan timer & matikan suara 10 detik seketika */
  if (btnCancelPay) {
    btnCancelPay.addEventListener('click', function () {
      stopPaymentTimer(true);
      paymentModal.style.display = 'none';
      setStep(0);
    });
  }

  if (btnRetryPay) {
    btnRetryPay.addEventListener('click', function () {
      stopTenSecWarningSound();
      unlockAudioSilently();
      finalOrderID = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      openPaymentPopup();
      showToast('Sesi pembayaran baru (1 menit) dimulai!', '🔄');
    });
  }

  if (btnCloseFailed) {
    btnCloseFailed.addEventListener('click', function () {
      stopPaymentTimer(true);
      failedModal.style.display = 'none';
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

      /* Hentikan timer & suara peringatan 10 detik agar tidak tabrakan dengan suara sukses */
      stopPaymentTimer(true);
      paymentModal.style.display = 'none';
      setStep(2);

      paymentSuccessSound.muted = false;
      paymentSuccessSound.volume = 1.0;
      paymentSuccessSound.currentTime = 0;
      paymentSuccessSound.play().catch(() => {
        const backupAudio = new Audio('sound/pembayaran%20diterima.MP3');
        backupAudio.play().catch(err => console.log('Audio error:', err));
      });

      const orderIdEl = document.getElementById('success-order-id');
      if (orderIdEl) orderIdEl.textContent = finalOrderID;

      const cartData = JSON.parse(localStorage.getItem('8urStoryCart')) || [];
      const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value || 'QRIS';

      const orderData = {
        orderId: finalOrderID,
        name: document.getElementById('buyer-name')?.value.trim() || 'Pelanggan 8UR STORY',
        phone: document.getElementById('buyer-phone')?.value.trim() || '-',
        email: document.getElementById('buyer-email')?.value.trim() || '-',
        address: document.getElementById('buyer-address')?.value.trim() || '-',
        paymentMethod: selectedPayment,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }),
        total: checkoutTotal,
        items: cartData
      };

      window.currentOrderData = orderData;

      if (typeof sendEmailInvoice === 'function') {
        sendEmailInvoice(orderData);
        showToast(`Invoice dikirim ke ${orderData.email}`, '📧');
      }

      localStorage.removeItem('8urStoryCart');
      updateCartCount();

      successModal.style.display = 'flex';
    });
  }

  /* ══════════════════════════════════════
     9. ACCORDION, FILTER KATALOG, SEARCH & MODAL OVERLAY
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
        stopPaymentTimer(true);
        overlay.style.display = 'none';
        setStep(0);
      }
      if (e.target === overlay && overlay.id === 'failed-modal') {
        stopTenSecWarningSound();
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

  /* ════════════════════════════════════════════════════════════════
     10. SMART FLOATING CS (AGEN LISA + OTAK CONVERSATIONAL CERDAS)
  ════════════════════════════════════════════════════════════════ */
  const isCheckoutOrCart =
    document.querySelector('.checkout-page') !== null ||
    document.querySelector('.cart-page') !== null ||
    window.location.pathname.toLowerCase().includes('checkout') ||
    window.location.pathname.toLowerCase().includes('cart');

  if (!isCheckoutOrCart && !document.getElementById('cs-widget-root')) {

    const csVectorIconSVG = `
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#FFFFFF"/>
        <path d="M 16 48 A 35 35 0 0 1 60 15" stroke="#111827" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M 10 41 L 16 50 L 23 42" stroke="#111827" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 83 38 A 35 35 0 0 1 48 85" stroke="#111827" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M 33 42 C 33 23, 67 23, 67 42 L 66 57 L 34 57 Z" fill="#6D4C41" stroke="#111827" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M 28 76 C 28 62, 39 58, 50 58 C 61 58, 72 62, 72 76 Z" fill="#4B5563" stroke="#111827" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M 43 58 L 50 73 L 57 58 Z" fill="#E5E7EB" stroke="#111827" stroke-width="3.5" stroke-linejoin="round"/>
        <rect x="45" y="50" width="10" height="10" rx="3" fill="#FCD3B6" stroke="#111827" stroke-width="4"/>
        <path d="M 37 39 C 37 28, 63 28, 63 39 C 63 50, 56 55, 50 55 C 44 55, 37 50, 37 39 Z" fill="#FCD3B6" stroke="#111827" stroke-width="4.5"/>
        <path d="M 34 39 A 16 16 0 0 1 66 39" stroke="#111827" stroke-width="5" stroke-linecap="round"/>
        <rect x="30" y="36" width="7" height="13" rx="3.5" fill="#374151" stroke="#111827" stroke-width="4"/>
        <rect x="63" y="36" width="7" height="13" rx="3.5" fill="#374151" stroke="#111827" stroke-width="4"/>
        <path d="M 65 47 Q 65 52 52 52" stroke="#111827" stroke-width="4.5" stroke-linecap="round"/>
        <rect x="46" y="49.5" width="8" height="4.5" rx="2.2" fill="#111827"/>
        <rect x="62" y="7" width="30" height="21" rx="5" fill="#FF6B81" stroke="#111827" stroke-width="4.5"/>
        <path d="M 68 28 L 65 35 L 75 28" fill="#FF6B81" stroke="#111827" stroke-width="4.5" stroke-linejoin="round"/>
        <line x1="68" y1="14" x2="85" y2="14" stroke="#111827" stroke-width="3.8" stroke-linecap="round"/>
        <line x1="68" y1="21" x2="80" y2="21" stroke="#111827" stroke-width="3.8" stroke-linecap="round"/>
        <path d="M 18 59 C 14 66, 25 83, 36 84 L 40 77 L 33 72 L 30 75 C 25 73, 23 69, 25 65 L 28 62 L 22 56 Z" fill="#FF6B81" stroke="#111827" stroke-width="4.5" stroke-linejoin="round"/>
      </svg>
    `;

    if (!document.getElementById('cs-injected-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'cs-injected-styles';
      styleTag.textContent = `
        #cs-widget-root {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 9995 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
          font-family: 'Poppins', sans-serif !important;
          pointer-events: none !important;
        }
        #cs-widget-root * { box-sizing: border-box; }
        .cs-greeting-bubble {
          pointer-events: auto !important;
          background: #FFFFFF !important;
          color: #111827 !important;
          padding: 12px 34px 12px 16px !important;
          border-radius: 16px 16px 4px 16px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.16) !important;
          border: 1.5px solid #FECACA !important;
          font-size: 12.5px !important;
          font-weight: 600 !important;
          line-height: 1.45 !important;
          max-width: 260px !important;
          margin-bottom: 12px !important;
          position: relative !important;
          cursor: pointer !important;
          animation: csFloatAnim 3s ease-in-out infinite !important;
          transition: all 0.25s ease !important;
        }
        .cs-greeting-bubble:hover { border-color: #E83124 !important; transform: translateY(-2px) !important; }
        .cs-greeting-bubble strong { color: #E83124 !important; }
        .cs-bubble-close {
          position: absolute !important;
          top: 6px !important; right: 8px !important;
          width: 20px !important; height: 20px !important;
          border-radius: 50% !important; border: none !important;
          background: #F3F4F6 !important; color: #6B7280 !important;
          font-size: 13px !important; line-height: 1 !important;
          cursor: pointer !important; display: flex !important;
          align-items: center !important; justify-content: center !important;
        }
        .cs-bubble-close:hover { background: #E83124 !important; color: #FFF !important; }
        @keyframes csFloatAnim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .cs-Launcher-btn {
          pointer-events: auto !important;
          display: flex !important; align-items: center !important; gap: 11px !important;
          background: linear-gradient(135deg, #E83124, #C0281E) !important;
          color: #FFFFFF !important; border: none !important;
          padding: 9px 22px 9px 10px !important; border-radius: 50px !important;
          font-family: 'Poppins', sans-serif !important;
          font-size: 13px !important; font-weight: 800 !important;
          letter-spacing: 0.6px !important; cursor: pointer !important;
          box-shadow: 0 8px 25px rgba(232, 49, 36, 0.42) !important;
          position: relative !important; transition: all 0.3s ease !important;
          animation: csPulseAnim 2.4s infinite !important;
        }
        .cs-Launcher-btn:hover { transform: translateY(-3px) scale(1.03) !important; }
        .cs-launcher-icon {
          width: 38px !important; height: 38px !important;
          background: #FFFFFF !important;
          border-radius: 50% !important; display: flex !important;
          align-items: center !important; justify-content: center !important;
          padding: 2px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18) !important;
          flex-shrink: 0 !important;
        }
        .cs-online-dot {
          width: 12px !important; height: 12px !important;
          background: #10B981 !important; border: 2px solid #FFFFFF !important;
          border-radius: 50% !important; position: absolute !important;
          top: 0px !important; right: 6px !important;
        }
        @keyframes csPulseAnim {
          0%   { box-shadow: 0 0 0 0 rgba(232, 49, 36, 0.55), 0 8px 25px rgba(232, 49, 36, 0.35); }
          70%  { box-shadow: 0 0 0 14px rgba(232, 49, 36, 0), 0 8px 25px rgba(232, 49, 36, 0.35); }
          100% { box-shadow: 0 0 0 0 rgba(232, 49, 36, 0), 0 8px 25px rgba(232, 49, 36, 0.35); }
        }
        .cs-chat-window {
          pointer-events: none !important;
          width: 370px !important; max-width: calc(100vw - 28px) !important;
          height: 520px !important; max-height: calc(100vh - 110px) !important;
          background: #FFFFFF !important; border-radius: 20px !important;
          box-shadow: 0 20px 60px rgba(17, 24, 39, 0.26) !important;
          border: 1px solid #E5E7EB !important;
          display: none !important; flex-direction: column !important;
          overflow: hidden !important; margin-bottom: 14px !important;
          transform-origin: bottom right !important;
        }
        .cs-chat-window.open {
          display: flex !important;
          pointer-events: auto !important;
          animation: csWindowOpen 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both !important;
        }
        @keyframes csWindowOpen {
          from { opacity: 0; transform: translateY(20px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cs-chat-header {
          background: linear-gradient(135deg, #111827, #1F2937) !important;
          color: #FFFFFF !important; padding: 15px 18px !important;
          display: flex !important; align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 3px solid #E83124 !important;
        }
        .cs-agent-info { display: flex !important; align-items: center !important; gap: 12px !important; }
        .cs-agent-avatar {
          width: 44px !important; height: 44px !important;
          border-radius: 50% !important;
          background: #FFFFFF !important;
          padding: 2px !important;
          display: flex !important; align-items: center !important;
          justify-content: center !important;
          position: relative !important; flex-shrink: 0 !important;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25) !important;
        }
        .cs-agent-text h4 { font-size: 14.5px !important; font-weight: 800 !important; color: #FFFFFF !important; margin: 0 0 2px 0 !important; }
        .cs-agent-text span { font-size: 11px !important; color: #A7F3D0 !important; font-weight: 500 !important; }
        .cs-close-chat {
          background: rgba(255,255,255,0.12) !important; border: none !important;
          color: #FFFFFF !important; width: 32px !important; height: 32px !important;
          border-radius: 50% !important; font-size: 15px !important;
          cursor: pointer !important; display: flex !important;
          align-items: center !important; justify-content: center !important;
        }
        .cs-close-chat:hover { background: #E83124 !important; }
        .cs-chat-body {
          flex: 1 !important; padding: 15px !important;
          overflow-y: auto !important; background: #F8FAFC !important;
          display: flex !important; flex-direction: column !important; gap: 12px !important;
        }
        .cs-msg-row { display: flex !important; flex-direction: column !important; max-width: 86% !important; }
        .cs-msg-row.agent { align-self: flex-start !important; }
        .cs-msg-row.user  { align-self: flex-end !important; }
        .cs-msg-bubble {
          padding: 11px 14px !important; border-radius: 14px !important;
          font-size: 12.8px !important; line-height: 1.55 !important;
          text-align: left !important; word-wrap: break-word !important;
        }
        .cs-msg-row.agent .cs-msg-bubble {
          background: #FFFFFF !important; color: #111827 !important;
          border: 1px solid #E5E7EB !important; border-top-left-radius: 4px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04) !important;
        }
        .cs-msg-row.user .cs-msg-bubble {
          background: #E83124 !important; color: #FFFFFF !important;
          border-bottom-right-radius: 4px !important;
        }
        .cs-msg-time { font-size: 10px !important; color: #6B7280 !important; margin-top: 4px !important; padding: 0 4px !important; }
        .cs-msg-row.user .cs-msg-time { text-align: right !important; }
        .cs-product-link-card {
          display: flex !important; align-items: center !important;
          justify-content: space-between !important; gap: 8px !important;
          margin-top: 8px !important; padding: 9px 12px !important;
          background: #FEF2F2 !important; border: 1.5px solid #FECACA !important;
          border-radius: 10px !important; color: #111827 !important;
          text-decoration: none !important; font-size: 12px !important;
          font-weight: 700 !important; transition: all 0.2s ease !important;
        }
        .cs-product-link-card:hover {
          background: #E83124 !important; color: #FFFFFF !important; border-color: #E83124 !important;
        }
        .cs-product-link-card span.price-tag { color: #E83124 !important; font-weight: 800 !important; font-size: 11.5px !important; }
        .cs-product-link-card:hover span.price-tag { color: #FFFFFF !important; }
        .cs-typing {
          display: inline-flex !important; align-items: center !important; gap: 4px !important;
          padding: 10px 14px !important; background: #FFFFFF !important;
          border: 1px solid #E5E7EB !important; border-radius: 14px !important;
        }
        .cs-typing span {
          width: 6px !important; height: 6px !important; background: #6B7280 !important;
          border-radius: 50% !important; animation: csDotBlink 1.2s infinite !important;
        }
        .cs-typing span:nth-child(2) { animation-delay: 0.2s !important; }
        .cs-typing span:nth-child(3) { animation-delay: 0.4s !important; }
        @keyframes csDotBlink {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
        .cs-quick-chips {
          display: flex !important; gap: 6px !important; padding: 8px 12px !important;
          background: #F8FAFC !important; border-top: 1px solid #EEF2F6 !important;
          overflow-x: auto !important; scrollbar-width: none !important;
        }
        .cs-quick-chips::-webkit-scrollbar { display: none !important; }
        .cs-chip-btn {
          background: #FFFFFF !important; border: 1px solid #D1D5DB !important;
          color: #111827 !important; padding: 6px 12px !important;
          border-radius: 50px !important; font-family: 'Poppins', sans-serif !important;
          font-size: 11.5px !important; font-weight: 600 !important;
          white-space: nowrap !important; cursor: pointer !important; flex-shrink: 0 !important;
        }
        .cs-chip-btn:hover { border-color: #E83124 !important; background: #FEF2F2 !important; color: #E83124 !important; }
        .cs-chat-input-area {
          display: flex !important; align-items: center !important; gap: 8px !important;
          padding: 10px 12px !important; background: #FFFFFF !important;
          border-top: 1px solid #E5E7EB !important;
        }
        .cs-chat-input-area input {
          flex: 1 !important; border: 1.5px solid #E5E7EB !important;
          border-radius: 50px !important; padding: 9px 15px !important;
          font-size: 12.5px !important; outline: none !important; background: #F9FAFB !important;
        }
        .cs-chat-input-area input:focus { border-color: #E83124 !important; background: #FFFFFF !important; }
        .cs-send-btn {
          width: 38px !important; height: 38px !important; border-radius: 50% !important;
          border: none !important; background: #E83124 !important; color: #FFFFFF !important;
          font-size: 15px !important; cursor: pointer !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          flex-shrink: 0 !important;
        }
        .cs-send-btn:hover { background: #C0281E !important; }
        @media (max-width: 768px) {
          #cs-widget-root { bottom: 16px !important; right: 14px !important; }
          .cs-Launcher-btn { padding: 8px 16px 8px 8px !important; font-size: 11.5px !important; }
          .cs-launcher-icon { width: 34px !important; height: 34px !important; }
          .cs-greeting-bubble { font-size: 11.5px !important; max-width: 225px !important; padding: 10px 28px 10px 12px !important; }
          .cs-chat-window { width: calc(100vw - 28px) !important; height: 70vh !important; }
        }
      `;
      document.head.appendChild(styleTag);
    }

    const csWidget = document.createElement('div');
    csWidget.id = 'cs-widget-root';
    csWidget.className = 'cs-widget-wrapper';
    csWidget.innerHTML = `
      <!-- Jendela Chat Pop-Up -->
      <div class="cs-chat-window" id="cs-chat-window">
        <div class="cs-chat-header">
          <div class="cs-agent-info">
            <div class="cs-agent-avatar">${csVectorIconSVG}</div>
            <div class="cs-agent-text">
              <h4>LISA — Customer Service</h4>
              <span>● Online • Siap Membantu Anda</span>
            </div>
          </div>
          <button type="button" class="cs-close-chat" id="cs-close-chat" aria-label="Tutup Chat">✕</button>
        </div>

        <div class="cs-chat-body" id="cs-chat-body"></div>

        <!-- Opsi Cepat (Quick Replies) -->
        <div class="cs-quick-chips">
          <button type="button" class="cs-chip-btn" data-query="Bingung pilih ukuran?">📏 Cek Ukuran (BB/TB)</button>
          <button type="button" class="cs-chip-btn" data-query="Rekomendasi produk terbaik">🔥 Rekomendasi Produk</button>
          <button type="button" class="cs-chip-btn" data-query="Setelah selesai bayar harus ngapain?">💳 Info Setelah Bayar</button>
          <button type="button" class="cs-chip-btn" data-query="Berapa lama proses & pengiriman?">🚚 Proses & Pengiriman</button>
          <button type="button" class="cs-chip-btn" data-query="Apakah ada garansi jika cacat?">🛡️ Garansi 100%</button>
        </div>

        <!-- Kolom Ketik Bebas -->
        <form class="cs-chat-input-area" id="cs-chat-form">
          <input type="text" id="cs-chat-input" placeholder="Ketik tinggi/berat badan atau pertanyaanmu..." autocomplete="off">
          <button type="submit" class="cs-send-btn" aria-label="Kirim">➤</button>
        </form>
      </div>

      <!-- Gelembung Sapaan Otomatis -->
      <div class="cs-greeting-bubble" id="cs-greeting-bubble">
        <button type="button" class="cs-bubble-close" id="cs-bubble-close" aria-label="Tutup sapaan">×</button>
        👋 Halo Kak! Bingung pilih ukuran atau butuh rekomendasi? <strong>Chat LISA (CS) yuk!</strong>
      </div>

      <!-- Tombol Utama CUSTOMER SERVICE -->
      <button type="button" class="cs-Launcher-btn" id="cs-launcher-btn">
        <span class="cs-online-dot"></span>
        <span class="cs-launcher-icon">${csVectorIconSVG}</span>
        <span>CUSTOMER SERVICE</span>
      </button>
    `;
    document.body.appendChild(csWidget);

    const chatWindow   = document.getElementById('cs-chat-window');
    const launcherBtn  = document.getElementById('cs-launcher-btn');
    const closeChatBtn = document.getElementById('cs-close-chat');
    const greetBubble  = document.getElementById('cs-greeting-bubble');
    const closeBubble  = document.getElementById('cs-bubble-close');
    const chatBody     = document.getElementById('cs-chat-body');
    const chatForm     = document.getElementById('cs-chat-form');
    const chatInput    = document.getElementById('cs-chat-input');

    let fallbackTurnIndex = 0;

    function getTimeStr() {
      const d = new Date();
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function appendMessage(sender, htmlText) {
      const row = document.createElement('div');
      row.className = `cs-msg-row ${sender}`;
      row.innerHTML = `
        <div class="cs-msg-bubble">${htmlText}</div>
        <div class="cs-msg-time">${sender === 'agent' ? 'LISA (CS) • ' : ''}${getTimeStr()}</div>
      `;
      chatBody.appendChild(row);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    appendMessage('agent', `
      Halo Kak! 👋 Kenalin aku <strong>LISA</strong> dari tim Customer Service <strong>8UR STORY</strong>.<br><br>
      Kakak bisa klik menu cepat di bawah, atau <strong>ketik langsung berat & tinggi badan Kakak</strong> (contoh: <em>"BB 65 kg tinggi 170 cm"</em>) biar LISA hitungkan ukuran yang paling pas! 😊
    `);

    function toggleChat(forceOpen = null) {
      const willOpen = forceOpen !== null ? forceOpen : !chatWindow.classList.contains('open');
      chatWindow.classList.toggle('open', willOpen);
      if (willOpen && greetBubble) {
        greetBubble.style.display = 'none';
        setTimeout(() => chatInput?.focus(), 200);
      }
    }

    launcherBtn.addEventListener('click', () => toggleChat());
    closeChatBtn.addEventListener('click', () => toggleChat(false));
    greetBubble.addEventListener('click', (e) => {
      if (e.target !== closeBubble) toggleChat(true);
    });
    closeBubble.addEventListener('click', (e) => {
      e.stopPropagation();
      greetBubble.style.display = 'none';
    });

    function generateSmartCSReply(rawText) {
      const cleanRaw = rawText.trim();
      const text     = cleanRaw.toLowerCase();

      if (/waji/i.test(cleanRaw)) {
        const angryReplies = [
          `Mending lu diam, gausah ngetik... tololl!! 🤬 Datang-datang bukannya belanja malah nyebut-nyebut itu, minggir lu sana! 💢`,
          `Heh!! Mending lu diam, gausah banyak ngetik... tololl! 🤬 Kalau cuma mau ngatain atau cari gara-gara mending keluar dari toko gue sekarang juga! 💢`,
          `Gausah kurang ajar ya lu! Mending lu diam, gausah ngetik... tololl!! 🤬 Kesabaran LISA ada batasnya buat orang iseng kayak lu! 💢`
        ];
        return angryReplies[Math.floor(Math.random() * angryReplies.length)];
      }

      const numbers = cleanRaw.match(/\d{1,4}/g);
      let weight = null;
      let height = null;

      const bbMatch = text.match(/(?:bb|berat|badan)\s*[:=]?\s*(\d{1,4})/i) || text.match(/(\d{1,4})\s*kg/i);
      const tbMatch = text.match(/(?:tb|tinggi)\s*[:=]?\s*(\d{1,4})/i) || text.match(/(\d{1,4})\s*cm/i);

      if (bbMatch) weight = parseInt(bbMatch[1]);
      if (tbMatch) height = parseInt(tbMatch[1]);

      if (!weight && !height && numbers && numbers.length >= 2) {
        const n1 = parseInt(numbers[0]);
        const n2 = parseInt(numbers[1]);
        if (n1 >= 135 && n2 < 135) { height = n1; weight = n2; }
        else if (n2 >= 135 && n1 < 135) { weight = n1; height = n2; }
        else if (text.includes('berat') || text.includes('tinggi') || text.includes('bb') || text.includes('tb') || text.includes('ambil') || text.includes('size') || text.includes('ukuran')) {
          weight = Math.min(n1, n2);
          height = Math.max(n1, n2);
        }
      } else if (!weight && !height && numbers && numbers.length === 1) {
        const n = parseInt(numbers[0]);
        if (text.includes('size') || text.includes('ukuran') || text.includes('muat') || text.includes('bb') || text.includes('berat') || text.includes('tb') || text.includes('tinggi')) {
          if (n < 135) weight = n;
          else height = n;
        }
      }

      if (weight !== null || height !== null) {
        if ((weight !== null && weight > 130) || (height !== null && height > 205)) {
          return `
            Busett ${weight ? `berat <strong>${weight} kg</strong>` : ''} ${height ? `tinggi <strong>${height} cm</strong>` : ''}?! 😱🗿<br><br>
            Kakak ini manusia apa Titan/Raksasa Kak? 😂 Jangan iseng ngetes LISA dong! Ukuran terbesar kita (<strong>Size XXXL</strong> — 56x78 cm) cuma muat sampai berat maksimal <strong>115 kg</strong> dan tinggi <strong>195 cm</strong> aja.<br><br>
            Kalau mau buat ukuran sebesar itu harus jahit terpal tenda dulu nih 😅. Yuk ketik berat & tinggi badan Kakak yang asli biar LISA hitungkan beneran!
          `;
        }

        if ((weight !== null && weight < 30) || (height !== null && height < 125)) {
          return `
            Waduh ${weight ? `berat <strong>${weight} kg</strong>` : ''} ${height ? `tinggi <strong>${height} cm</strong>` : ''}? 😅 Itu ukuran buat adik bayi atau kucing kesayangan Kak? 🐱<br><br>
            Kaos 8UR STORY potongannya dewasa/remaja mulai dari <strong>Size S (46x68 cm)</strong> untuk berat minimal 38 kg ke atas. Kalau mau buat kado yang pasti muat untuk semua umur, LISA sarankan <strong>Bantal Custom</strong> atau <strong>Topi Baseball</strong> aja yuk:
            <a href="product-bantal.html" class="cs-product-link-card">
              <span>🛋️ Bantal Custom Full Print</span>
              <span class="price-tag">Mulai Rp 45.000 &rarr;</span>
            </a>
          `;
        }

        let recSize = 'L';
        let kaosDims = '50 cm x 72 cm';
        let kaosPrice = 'Rp 95.000';
        let hoodiePrice = 'Rp 145.000';

        const w = weight || (height ? height - 105 : 62);
        const h = height || 168;

        if (w <= 52 && h <= 164) {
          recSize = 'S'; kaosDims = '46 cm x 68 cm'; kaosPrice = 'Rp 89.000'; hoodiePrice = 'Rp 135.000';
        } else if (w <= 62 && h <= 170) {
          recSize = 'M'; kaosDims = '48 cm x 70 cm'; kaosPrice = 'Rp 92.000'; hoodiePrice = 'Rp 140.000';
        } else if (w <= 72 && h <= 176) {
          recSize = 'L'; kaosDims = '50 cm x 72 cm'; kaosPrice = 'Rp 95.000'; hoodiePrice = 'Rp 145.000';
        } else if (w <= 82 && h <= 182) {
          recSize = 'XL'; kaosDims = '52 cm x 74 cm'; kaosPrice = 'Rp 98.000'; hoodiePrice = 'Rp 150.000';
        } else if (w <= 95) {
          recSize = 'XXL'; kaosDims = '54 cm x 76 cm'; kaosPrice = 'Rp 101.000'; hoodiePrice = 'Rp 155.000';
        } else {
          recSize = 'XXXL'; kaosDims = '56 cm x 78 cm'; kaosPrice = 'Rp 104.000'; hoodiePrice = 'Rp 160.000';
        }

        const infoBody = `${weight ? `berat <strong>${weight} kg</strong>` : ''}${weight && height ? ' dan ' : ''}${height ? `tinggi <strong>${height} cm</strong>` : ''}`;

        return `
          Untuk postur Kakak (${infoBody}), LISA sangat merekomendasikan ukuran <strong>Size ${recSize}</strong> (${kaosDims}) supaya jatuhnya pas dan nyaman di badan! ✨<br><br>
          💡 <em>Tips LISA:</em> Kalau Kakak suka gaya agak longgar (<em>oversize look</em>), Kakak bisa naik 1 ukuran ya.<br><br>
          Silakan klik produk yang Kakak incar di bawah ini untuk langsung pilih <strong>Size ${recSize}</strong>:
          <a href="product-pendek.html" class="cs-product-link-card">
            <span>👕 Kaos Lengan Pendek (Size ${recSize})</span>
            <span class="price-tag">${kaosPrice} &rarr;</span>
          </a>
          <a href="product-hoodie.html" class="cs-product-link-card">
            <span>👑 Hoodie Premium (Size ${recSize})</span>
            <span class="price-tag">${hoodiePrice} &rarr;</span>
          </a>
        `;
      }

      if (text.includes('kemajuan') || text.includes('maju') || text.includes('bangkrut') || text.includes('laku') || text.includes('masa depan') || text.includes('sukses')) {
        return `
          Wah jelas bakal maju pesat dong Kak! 🚀 Buktinya sekarang aja udah lebih dari <strong>1.500+ produk terjual</strong> dan katalog kita makin lengkap dari Kaos, Hoodie, Topi, sampai Bantal Custom!<br><br>
          Biar toko kita makin maju lagi, yuk Kakak ikut nyumbang 1 pesanan hari ini hehe 😎👇
          <a href="product-pendek.html" class="cs-product-link-card">
            <span>🔥 Ikut Order Kaos Terlaris</span>
            <span class="price-tag">Rp 89.000 &rarr;</span>
          </a>
        `;
      }

      if (text.includes('pacar') || text.includes('jomblo') || text.includes('nikah') || text.includes('jodoh') || text.includes('sayang') || text.includes('cinta') || text.includes('cantik')) {
        return `
          Waduhh Kak, LISA di sini tugasnya bantu carikan ukuran kaos, bukan biro jodoh 😅🗿.<br><br>
          Tapi percaya deh, kalau Kakak pakai <strong>Hoodie atau Kaos Custom 8UR STORY</strong>, aura ganteng/cantiknya langsung naik 100% dan gebetan pasti auto naksir! Cobain dulu yuk:
          <a href="product-hoodie.html" class="cs-product-link-card">
            <span>👑 Hoodie Custom Biar Makin Keren</span>
            <span class="price-tag">Rp 135.000 &rarr;</span>
          </a>
        `;
      }

      if (text.includes('makan') || text.includes('lapar') || text.includes('laper') || text.includes('haus') || text.includes('kopi') || text.includes('ngantuk') || text.includes('tidur')) {
        return `
          Haha kalau lapar itu buka aplikasi ojek makanan Kak, masa masuk ke toko baju 8UR STORY 🗿😂.<br><br>
          Tapi kalau ngantuk pengen tidur nyenyak, kita punya <strong>Bantal Custom Dakron Silikon</strong> yang super empuk buat dipeluk nih Kak!
          <a href="product-bantal.html" class="cs-product-link-card">
            <span>🛋️ Bantal Empuk 8UR STORY</span>
            <span class="price-tag">Mulai Rp 45.000 &rarr;</span>
          </a>
        `;
      }

      if (text.includes('diskon') || text.includes('nego') || text.includes('kurangin') || text.includes('mahal') || text.includes('gratis') || text.includes('murah')) {
        return `
          Waduh Kak, harga di <strong>8UR STORY</strong> (mulai Rp 45rb–89rb) itu udah paling ramah di kantong buat kelas bahan <strong>Cotton Combed 24s & Sablon DTF Premium</strong> lho! 😊<br><br>
          Kalau mau paling hemat, Kakak bisa cek koleksi Topi atau Bantal Custom kita yang mulai Rp 45 ribuan aja:
          <a href="product-topi.html" class="cs-product-link-card">
            <span>🧢 Topi Baseball Custom</span>
            <span class="price-tag">Rp 49.000 &rarr;</span>
          </a>
        `;
      }

      if (text.includes('siapa') || text.includes('bot') || text.includes('robot') || text.includes('manusia') || text.includes('asli')) {
        return `
          Aku <strong>LISA</strong> Kak, Customer Service & Stylist resmi di <strong>8UR STORY</strong>! 👩‍💼✨<br><br>
          Tugas LISA nemenin Kakak 24 jam biar gak salah pilih ukuran, warna, atau bahan sebelum checkout. Kakak lagi ngincar produk yang mana nih?
        `;
      }

      if (/^(halo|hai|hi|p|ping|tes|test|assalamualaikum|pagi|siang|sore|malam)$/i.test(cleanRaw)) {
        return `
          Halo juga Kak! 👋 Senang banget Kakak mampir ke <strong>8UR STORY</strong>.<br><br>
          Lagi cari kaos custom buat dipakai sendiri, seragam komunitas, atau buat kado nih Kak? Kalau bingung ukuran, sebutin aja berat & tinggi badan Kakak ya! 😊
        `;
      }

      if (text.includes('ukuran') || text.includes('size') || text.includes('chart') || text.includes('melar') || text.includes('sempit')) {
        return `
          Boleh banget Kak! Biar LISA bantu hitungkan ukuran paling akurat (S sampai XXXL), <strong>berapa perkiraan Berat Badan (kg) dan Tinggi Badan (cm) Kakak?</strong> 😊<br><br>
          Ketik aja langsung misalnya: <em>"Berat 60 tinggi 168"</em> ya Kak!
        `;
      }

      if (text.includes('selesai bayar') || text.includes('sudah bayar') || text.includes('habis bayar') || text.includes('ngapain') || text.includes('bukti') || text.includes('proses') || text.includes('kirim') || text.includes('berapa lama')) {
        return `
          Tenang Kak, proses di <strong>8UR STORY</strong> super jelas dan aman! 🔒<br><br>
          <strong>Alur Setelah Kakak Klik Bayar:</strong><br>
          1️⃣ Muncul QRIS / Nomor Virtual Account beserta batas waktu <strong>1 menit</strong> untuk unggah foto bukti transfer.<br>
          2️⃣ Setelah klik <strong>"Saya Sudah Bayar"</strong>, sistem otomatis menerbitkan <strong>Nomor Pesanan (ORD-xxxxxx)</strong> & mengirim <strong>Invoice ke Email Kakak</strong>.<br>
          3️⃣ Tim Admin kami akan menghubungi WhatsApp Kakak untuk konfirmasi pratinjau desain & resi pengiriman.<br>
          4️⃣ Pesanan diproduksi kilat <strong>1–3 hari kerja</strong> dengan Quality Control ketat!<br><br>
          Yuk mulai pilih produk favorit Kakak:
          <a href="index.html#katalog" class="cs-product-link-card">
            <span>🛍️ Lihat Katalog Lengkap</span>
            <span class="price-tag">Mulai Rp 45rb &rarr;</span>
          </a>
        `;
      }

      if (text.includes('rekomendasi') || text.includes('bagus') || text.includes('bingung') || text.includes('kado') || text.includes('hadiah') || text.includes('laris') || text.includes('produk')) {
        return `
          Ini dia <strong>Top Produk Paling Favorit</strong> rekomendasi LISA di 8UR STORY yang wajib Kakak coba: 🔥
          <a href="product-pendek.html" class="cs-product-link-card">
            <span>👕 Kaos Lengan Pendek (Best Seller)</span>
            <span class="price-tag">Rp 89.000 &rarr;</span>
          </a>
          <a href="product-hoodie.html" class="cs-product-link-card">
            <span>👑 Hoodie Fleece 280gsm Tebal</span>
            <span class="price-tag">Rp 135.000 &rarr;</span>
          </a>
          <a href="product-bantal.html" class="cs-product-link-card">
            <span>🛋️ Bantal Full Print (Favorit Kado)</span>
            <span class="price-tag">Rp 45.000 &rarr;</span>
          </a>
          <a href="product-topi.html" class="cs-product-link-card">
            <span>🧢 Topi Baseball Custom</span>
            <span class="price-tag">Rp 49.000 &rarr;</span>
          </a>
        `;
      }

      if (text.includes('topi')) {
        return `
          Untuk <strong>Topi Baseball Custom</strong> kami memakai bahan <em>Cotton Twill Premium</em> yang kokoh dengan pengait besi belakang (All Size). Bisa cetak DTF (Rp 49.000) atau <strong>Upgrade Bordir Timbul 3D</strong> (+Rp 10.000)! 🧢
          <a href="product-topi.html" class="cs-product-link-card">
            <span>🧢 Custom Topi Sekarang</span>
            <span class="price-tag">Rp 49.000 &rarr;</span>
          </a>
        `;
      }
      if (text.includes('bantal')) {
        return `
          <strong>Bantal Custom 8UR STORY</strong> menggunakan kain <em>Velboa/Satin Halus</em> dengan isian 100% Dakron Silikon Grade A yang super empuk & ada resletingnya! Bisa beli sarungnya saja (Rp 45.000) atau lengkap dengan isi bantal (Rp 65.000). 🛋️
          <a href="product-bantal.html" class="cs-product-link-card">
            <span>🛋️ Custom Bantal Foto/Desain</span>
            <span class="price-tag">Mulai Rp 45.000 &rarr;</span>
          </a>
        `;
      }
      if (text.includes('panjang') || text.includes('longsleeve')) {
        return `
          <strong>Kaos Lengan Panjang</strong> kami menggunakan 100% Cotton Combed 24s dengan karet <em>rib</em> di pergelangan tangan yang gak gampang melar. Cocok banget buat gaya streetwear! ✨
          <a href="product-panjang.html" class="cs-product-link-card">
            <span>✨ Lihat Kaos Lengan Panjang</span>
            <span class="price-tag">Rp 99.000 &rarr;</span>
          </a>
        `;
      }

      if (text.includes('garansi') || text.includes('cacat') || text.includes('retur') || text.includes('aman') || text.includes('percaya') || text.includes('bahan') || text.includes('luntur')) {
        return `
          Kakak gak perlu ragu sedikit pun! 🛡️ Di <strong>8UR STORY</strong> berlaku <strong>Garansi Kepuasan 100%</strong>:<br><br>
          ✔️ Bahan 100% <strong>Cotton Combed 24s</strong> & <strong>Cotton Fleece 280gsm</strong> asli standar distro.<br>
          ✔️ Sablon <strong>DTF High-Resolution</strong> anti retak & tahan cuci mesin.<br>
          ✔️ <strong>Jaminan Ganti Baru Gratis</strong> jika ada cacat jahitan atau salah cetak dari tim kami!<br><br>
          Sudah lebih dari <strong>1.500+ pelanggan puas</strong> berbelanja di sini Kak 😊
        `;
      }

      const outOfTopicReplies = [
        `Waduh, pertanyaan Kakak tentang <em>"${cleanRaw}"</em> agak di luar nurul nih buat LISA 🗿😅.<br><br>Maaf ya Kak, LISA cuma asisten toko yang jago urusan <em>streetwear</em> & sablon custom. Mending kita ngomongin kaos atau hoodie impian Kakak yuk, lagi cari ukuran apa nih?
        <a href="product-pendek.html" class="cs-product-link-card">
          <span>👕 Cek Kaos Lengan Pendek</span>
          <span class="price-tag">Rp 89.000 &rarr;</span>
        </a>`,
        `Haha Kakak bisa aja ngetes LISA pakai bahasan <em>"${cleanRaw}"</em> 😂🗿.<br><br>Daripada bahas yang bikin LISA pusing, mending Kakak sebutin <strong>Berat & Tinggi Badan</strong> Kakak di sini biar LISA carikan ukuran Hoodie atau Kaos yang paling kece buat Kakak! ✨
        <a href="product-hoodie.html" class="cs-product-link-card">
          <span>👑 Lihat Hoodie Custom Premium</span>
          <span class="price-tag">Rp 135.000 &rarr;</span>
        </a>`,
        `Hmm jujurly kalau soal <em>"${cleanRaw}"</em> LISA angkat tangan Kak 🏳️😅. Fokus LISA cuma bikin penampilan Kakak makin keren pakai produk <strong>8UR STORY</strong>!<br><br>Ada yang bisa LISA bantu untuk pilih warna kaos, ukuran, atau cara upload desain customnya Kak?`
      ];

      const chosenReply = outOfTopicReplies[fallbackTurnIndex % outOfTopicReplies.length];
      fallbackTurnIndex++;
      return chosenReply;
    }

    function handleUserSendMessage(userText) {
      if (!userText || !userText.trim()) return;
      appendMessage('user', userText.trim());

      const typingRow = document.createElement('div');
      typingRow.className = 'cs-msg-row agent';
      typingRow.innerHTML = `<div class="cs-typing"><span></span><span></span><span></span></div>`;
      chatBody.appendChild(typingRow);
      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(() => {
        typingRow.remove();
        const replyHTML = generateSmartCSReply(userText);
        appendMessage('agent', replyHTML);
      }, 600);
    }

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value;
      chatInput.value = '';
      handleUserSendMessage(val);
    });

    csWidget.querySelectorAll('.cs-chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        handleUserSendMessage(query);
      });
    });
  }

});
