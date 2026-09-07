/**
 * ============================================================================
 * AROMA ROASTERS - INTERACTIVE JAVASCRIPT
 * ============================================================================
 * Features:
 *  1. Theme Switcher (Dark / Light mode with localStorage & OS sync)
 *  2. Interactive Menu Category Filtering with animations
 *  3. Dynamic Order & Reservation Modal with item pre-selection
 *  4. Form Validation & Modern Toast Notification Feedback
 *  5. Mobile Navigation Drawer & Hamburger Toggle
 *  6. Sticky Header & Scrollspy Navigation Highlighting
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initThemeSwitcher();
  initMenuFilter();
  initModalSystem();
  initFormsAndToasts();
  initMobileNav();
  initScrollspyAndHeader();
});

/* ==========================================================================
   1. THEME SWITCHER (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeSwitcher() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const THEME_STORAGE_KEY = 'aroma_roasters_theme';
  const root = document.documentElement;

  // Determine starting theme: Saved preference -> OS preference -> Default 'light'
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  // Toggle button click listener
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Provide quick tactile feedback via toast
    showToast(
      `${newTheme === 'dark' ? 'Dark' : 'Light'} Mode Enabled`,
      `Switched to ${newTheme === 'dark' ? 'roasted obsidian' : 'warm oat latte'} theme.`,
      '🌓',
      2500
    );
  });

  // Listen for system theme adjustments if no custom choice saved
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    themeToggleBtn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    themeToggleBtn.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  }
}

/* ==========================================================================
   2. INTERACTIVE MENU CATEGORY FILTER
   ========================================================================== */
function initMenuFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  if (!filterButtons.length || !menuCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active button state
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const selectedFilter = btn.getAttribute('data-filter');

      // Filter cards with smooth entrance
      menuCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        const shouldShow = selectedFilter === 'all' || cardCategory === selectedFilter;

        if (shouldShow) {
          card.classList.remove('is-hidden');
          // Trigger subtle CSS re-flow for entrance animation
          card.style.animation = 'none';
          card.offsetHeight; /* trigger reflow */
          card.style.animation = 'fadeIn 0.35s ease-out';
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   3. ORDER & TABLE RESERVATION MODAL
   ========================================================================== */
function initModalSystem() {
  const modalBackdrop = document.getElementById('booking-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTabOrder = document.getElementById('tab-modal-order');
  const modalTabReserve = document.getElementById('tab-modal-reserve');
  const viewOrder = document.getElementById('view-modal-order');
  const viewReserve = document.getElementById('view-modal-reserve');
  const orderItemSelect = document.getElementById('order-item-select');

  if (!modalBackdrop) return;

  // Function to open modal to specific tab
  window.openBookingModal = function(targetView = 'order', preselectedItem = null) {
    modalBackdrop.removeAttribute('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Switch to targeted tab
    switchModalTab(targetView);

    // If an item was passed from card button, pre-select it
    if (preselectedItem && orderItemSelect) {
      let matched = false;
      for (let option of orderItemSelect.options) {
        if (option.value.toLowerCase().includes(preselectedItem.toLowerCase())) {
          orderItemSelect.value = option.value;
          matched = true;
          break;
        }
      }
      if (!matched) {
        orderItemSelect.selectedIndex = 0;
      }
    }

    // Set focus into modal for accessibility
    setTimeout(() => {
      const firstInput = modalBackdrop.querySelector('input, select, button');
      if (firstInput) firstInput.focus();
    }, 100);
  };

  // Function to close modal
  window.closeBookingModal = function() {
    modalBackdrop.setAttribute('hidden', '');
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Switch between Quick Order and Table Reservation tabs
  function switchModalTab(viewName) {
    if (viewName === 'order') {
      modalTabOrder.classList.add('active');
      modalTabOrder.setAttribute('aria-selected', 'true');
      modalTabReserve.classList.remove('active');
      modalTabReserve.setAttribute('aria-selected', 'false');

      viewOrder.removeAttribute('hidden');
      viewReserve.setAttribute('hidden', '');
    } else {
      modalTabReserve.classList.add('active');
      modalTabReserve.setAttribute('aria-selected', 'true');
      modalTabOrder.classList.remove('active');
      modalTabOrder.setAttribute('aria-selected', 'false');

      viewReserve.removeAttribute('hidden');
      viewOrder.setAttribute('hidden', '');
    }
  }

  // Modal Tab Click Events
  modalTabOrder.addEventListener('click', () => switchModalTab('order'));
  modalTabReserve.addEventListener('click', () => switchModalTab('reservation'));

  // Close triggers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeBookingModal);
  }

  // Click on dark backdrop outside modal card
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeBookingModal();
    }
  });

  // ESC key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalBackdrop.hasAttribute('hidden')) {
      closeBookingModal();
    }
  });

  // Attach click listeners to all buttons targeting modal
  document.querySelectorAll('[data-modal-target]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-modal-target');
      openBookingModal(target);
    });
  });

  // Card-specific "Order Now" buttons
  document.querySelectorAll('.btn-order-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemName = btn.getAttribute('data-item-name');
      openBookingModal('order', itemName);
    });
  });
}

/* ==========================================================================
   4. FORM VALIDATION & TOAST NOTIFICATION FEEDBACK
   ========================================================================== */
function initFormsAndToasts() {
  const contactForm = document.getElementById('contact-form');
  const orderForm = document.getElementById('order-form');
  const reserveForm = document.getElementById('reserve-form');
  const newsletterForm = document.getElementById('newsletter-form');

  // Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      let isValid = true;

      if (!nameInput.value.trim()) {
        showInputError(nameInput, 'error-contact-name', true);
        isValid = false;
      } else {
        showInputError(nameInput, 'error-contact-name', false);
      }

      if (!validateEmail(emailInput.value)) {
        showInputError(emailInput, 'error-contact-email', true);
        isValid = false;
      } else {
        showInputError(emailInput, 'error-contact-email', false);
      }

      if (!messageInput.value.trim()) {
        showInputError(messageInput, 'error-contact-message', true);
        isValid = false;
      } else {
        showInputError(messageInput, 'error-contact-message', false);
      }

      if (isValid) {
        const userName = nameInput.value.trim();
        contactForm.reset();
        showToast(
          'Inquiry Received!',
          `Thank you, ${userName}. Our roastery team will get back to you within 24 hours.`,
          '✉️',
          5000
        );
      }
    });
  }

  // Quick Order Form Submission
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('order-name');
      const phoneInput = document.getElementById('order-phone');
      const itemSelect = document.getElementById('order-item-select');
      const qtyInput = document.getElementById('order-qty');
      const pickupTimeSelect = document.getElementById('order-pickup-time');

      let isValid = true;

      if (!nameInput.value.trim()) {
        showInputError(nameInput, 'error-order-name', true);
        isValid = false;
      } else {
        showInputError(nameInput, 'error-order-name', false);
      }

      if (!phoneInput.value.trim() || phoneInput.value.trim().length < 7) {
        showInputError(phoneInput, 'error-order-phone', true);
        isValid = false;
      } else {
        showInputError(phoneInput, 'error-order-phone', false);
      }

      if (isValid) {
        const customerName = nameInput.value.trim();
        const itemName = itemSelect.value.split('(')[0].trim();
        const qty = qtyInput.value || 1;
        const pickup = pickupTimeSelect.value;

        orderForm.reset();
        closeBookingModal();

        showToast(
          'Order Confirmed! ☕',
          `Thanks ${customerName}! Your order for ${qty}x ${itemName} is being roasted & prepared for ${pickup}.`,
          '🎉',
          6000
        );
      }
    });
  }

  // Table Reservation Form Submission
  if (reserveForm) {
    // Set min date to today for date picker
    const dateInput = document.getElementById('reserve-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('reserve-date');
      const timeVal = document.getElementById('reserve-time');
      const guestsVal = document.getElementById('reserve-guests');
      const nameVal = document.getElementById('reserve-name');
      const emailVal = document.getElementById('reserve-email');

      let isValid = true;

      if (!dateVal.value) {
        showInputError(dateVal, 'error-reserve-date', true);
        isValid = false;
      } else {
        showInputError(dateVal, 'error-reserve-date', false);
      }

      if (!nameVal.value.trim()) {
        showInputError(nameVal, 'error-reserve-name', true);
        isValid = false;
      } else {
        showInputError(nameVal, 'error-reserve-name', false);
      }

      if (!validateEmail(emailVal.value)) {
        showInputError(emailVal, 'error-reserve-email', true);
        isValid = false;
      } else {
        showInputError(emailVal, 'error-reserve-email', false);
      }

      if (isValid) {
        const guestName = nameVal.value.trim();
        const dateStr = dateVal.value;
        const timeStr = timeVal.value;
        const guestsStr = guestsVal.value.split('(')[0].trim();

        reserveForm.reset();
        closeBookingModal();

        showToast(
          'Table Reserved!',
          `We've saved a spot for ${guestsStr} under ${guestName} on ${dateStr} at ${timeStr}. Check your email for details!`,
          '🪑',
          6000
        );
      }
    });
  }

  // Newsletter Subscription Form
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (validateEmail(emailInput.value)) {
        emailInput.value = '';
        showToast(
          'Subscribed to The Aroma Dispatch',
          "Welcome to the inner circle! You'll receive our monthly roast tasting guides and café perks.",
          '✨',
          4500
        );
      } else {
        showToast('Invalid Email', 'Please provide a valid email address to subscribe.', '⚠️', 3000);
      }
    });
  }

  function showInputError(inputEl, errorId, show) {
    const errorEl = document.getElementById(errorId);
    if (show) {
      inputEl.classList.add('is-invalid');
      if (errorEl) errorEl.classList.add('visible');
    } else {
      inputEl.classList.remove('is-invalid');
      if (errorEl) errorEl.classList.remove('visible');
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
}

/**
 * Modern Toast Alert Notification Helper
 * @param {string} title - Heading of the alert
 * @param {string} message - Description message
 * @param {string} icon - Emoji or symbol icon
 * @param {number} duration - Milliseconds before auto-dismiss
 */
function showToast(title, message, icon = '☕', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const dismissToast = () => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  };

  closeBtn.addEventListener('click', dismissToast);

  container.appendChild(toast);

  // Auto-dismiss timer
  const autoDismissTimer = setTimeout(dismissToast, duration);

  // Pause timer on hover
  toast.addEventListener('mouseenter', () => clearTimeout(autoDismissTimer));
  toast.addEventListener('mouseleave', () => setTimeout(dismissToast, 2000));
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* ==========================================================================
   5. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const hamburgerBtn = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-actions button');

  if (!hamburgerBtn || !mobileNav) return;

  function toggleMobileMenu(forceClose = false) {
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isExpanded;

    hamburgerBtn.setAttribute('aria-expanded', String(shouldOpen));
    hamburgerBtn.classList.toggle('is-active', shouldOpen);

    if (shouldOpen) {
      mobileNav.removeAttribute('hidden');
    } else {
      mobileNav.setAttribute('hidden', '');
    }
  }

  hamburgerBtn.addEventListener('click', () => toggleMobileMenu());

  // Close when clicking any nav link
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    const header = document.getElementById('site-header');
    if (header && !header.contains(e.target)) {
      toggleMobileMenu(true);
    }
  });

  // Close on window resize beyond tablet breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      toggleMobileMenu(true);
    }
  });
}

/* ==========================================================================
   6. SCROLLSPY & HEADER SCROLL EFFECT
   ========================================================================== */
function initScrollspyAndHeader() {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link');
  const sections = document.querySelectorAll('main section[id]');

  // Add subtle shadow and border opacity on scroll
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Active section scrollspy using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();
}
