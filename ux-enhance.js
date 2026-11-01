/* ============================================================
   8UR STORY — UX MOTION ENHANCEMENT LAYER (JS)
   Bersifat aditif: tidak mengubah logic script.js yang sudah ada,
   hanya menambahkan highlight interaksi & motion di atasnya.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 1. LOADING BAR ---------------- */
  function runProgressBar() {
    var bar = document.getElementById("page-progress");
    if (!bar) return;
    bar.style.width = "0%";
    requestAnimationFrame(function () {
      bar.style.width = "72%";
    });
    window.addEventListener("load", function () {
      bar.style.width = "100%";
      setTimeout(function () { bar.classList.add("ux-done"); }, 350);
    });
  }

  /* ---------------- 2. SCROLL REVEAL ---------------- */
  function initReveal() {
    var targets = document.querySelectorAll(
      ".reveal, .fade-in-up, .product-grid, .features-grid, .product-card, .feature-card"
    );
    if (!targets.length) return;

    targets.forEach(function (el) {
      // Grid induk -> stagger anak-anaknya; elemen lain -> reveal biasa
      if (el.classList.contains("product-grid") || el.classList.contains("features-grid")) {
        el.classList.add("ux-stagger");
      } else if (!el.closest(".product-grid") && !el.closest(".features-grid")) {
        el.classList.add("ux-reveal");
      }
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".ux-reveal, .ux-stagger").forEach(function (el) {
        el.classList.add("ux-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ux-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".ux-reveal, .ux-stagger").forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------------- 3. BUTTON RIPPLE ---------------- */
  function initRipple() {
    var sel = ".btn-primary, .btn-secondary, .btn-hero-primary, .btn-hero-secondary, " +
      ".btn-secondary-dark, .filter-btn, #btn-confirm-order, #add-to-cart, #buy-now";
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(sel);
      if (!btn || reduceMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement("span");
      ripple.className = "ux-ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }

  /* ---------------- 4. CART BADGE POP ---------------- */
  function watchCartBadge() {
    var badge = document.getElementById("cart-count");
    if (!badge) return;
    var last = badge.textContent;
    var mo = new MutationObserver(function () {
      if (badge.textContent !== last) {
        last = badge.textContent;
        badge.classList.remove("ux-pop");
        void badge.offsetWidth; // restart animasi
        badge.classList.add("ux-pop");
      }
    });
    mo.observe(badge, { childList: true, characterData: true, subtree: true });
  }

  /* ---------------- 5. TOAST HELPER ---------------- */
  function ensureToastStack() {
    var stack = document.getElementById("ux-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "ux-toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  window.uxToast = function (message, icon) {
    var stack = ensureToastStack();
    var toast = document.createElement("div");
    toast.className = "ux-toast";
    toast.innerHTML =
      '<span class="ux-toast-icon">' + (icon || "✅") + "</span><span>" + message + "</span>";
    stack.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("ux-leave");
      setTimeout(function () { toast.remove(); }, 350);
    }, 2600);
  };

  /* Highlight otomatis saat tombol add-to-cart / beli ditekan */
  function initCartToast() {
    var addBtn = document.getElementById("add-to-cart");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        window.uxToast("Produk ditambahkan ke keranjang", "🛒");
      });
    }
  }

  /* ---------------- 6. FAQ ACCORDION HIGHLIGHT ---------------- */
  function initAccordion() {
    document.querySelectorAll(".faq-question").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq-item");
        if (!item) return;
        var answer = item.querySelector(".faq-answer");
        var isOpen = item.classList.contains("ux-open");

        // tutup item lain dalam grup yang sama (opsional, rapi)
        item.parentElement.querySelectorAll(".faq-item.ux-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("ux-open");
            var oa = other.querySelector(".faq-answer");
            if (oa) oa.style.maxHeight = "0px";
          }
        });

        if (isOpen) {
          item.classList.remove("ux-open");
          answer.style.maxHeight = "0px";
        } else {
          item.classList.add("ux-open");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------------- 7. SKELETON UNTUK RINGKASAN PESANAN ---------------- */
  function initCheckoutSkeleton() {
    var box = document.getElementById("order-summary");
    if (!box) return;
    var p = box.querySelector("p");
    if (p && /memuat data pesanan/i.test(p.textContent || "")) {
      for (var i = 0; i < 3; i++) {
        var line = document.createElement("div");
        line.className = "ux-skel";
        line.style.height = "14px";
        line.style.margin = "10px 0";
        line.style.width = i === 2 ? "60%" : "100%";
        box.appendChild(line);
      }
    }
  }

  /* ---------------- 8. COUNTDOWN URGENSI ---------------- */
  function watchCountdown() {
    var timerEl = document.getElementById("payment-timer");
    var box = document.getElementById("countdown-box");
    if (!timerEl || !box) return;
    var mo = new MutationObserver(function () {
      var txt = timerEl.textContent || "";
      var parts = txt.split(":");
      var seconds = parts.length === 2 ? (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) : null;
      if (seconds !== null && seconds <= 10) {
        box.classList.add("ux-urgent");
      } else {
        box.classList.remove("ux-urgent");
      }
    });
    mo.observe(timerEl, { childList: true, characterData: true, subtree: true });
  }

  /* ---------------- 9. FLASH HARGA SAAT BERUBAH ---------------- */
  function watchPriceFlash() {
    var priceEl = document.getElementById("total-price");
    if (!priceEl) return;
    var last = priceEl.textContent;
    var mo = new MutationObserver(function () {
      if (priceEl.textContent !== last) {
        last = priceEl.textContent;
        priceEl.classList.remove("ux-flash");
        void priceEl.offsetWidth;
        priceEl.classList.add("ux-flash");
      }
    });
    mo.observe(priceEl, { childList: true, characterData: true, subtree: true });
  }

  function init() {
    runProgressBar();
    initReveal();
    initRipple();
    watchCartBadge();
    initCartToast();
    initAccordion();
    initCheckoutSkeleton();
    watchCountdown();
    watchPriceFlash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
