/**
 * Galaxy Glasses - Vanilla JavaScript Logic
 * Handles dynamic product rendering, filtering, booking submission, and WhatsApp integrations.
 */

const STORE_CONFIG = {
  phone: '6285100488801',
  productsUrl: 'products.json'
};

// Escape teks dari products.json sebelum dimasukkan ke HTML
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// Generate WhatsApp inquiry link for a specific product
function getProductWaUrl(product) {
  const message = `Halo Galaxy Glasses, saya tertarik dengan produk ${product.nama} (${product.id}). Apakah tersedia?`;
  return `https://wa.me/${STORE_CONFIG.phone}?text=${encodeURIComponent(message)}`;
}

// Generate WhatsApp booking link
function getBookingWaUrl(nama, layanan, tanggal, jam) {
  const message = `Halo Galaxy Glasses, saya ${nama} ingin booking ${layanan} pada ${tanggal} jam ${jam}.`;
  return `https://wa.me/${STORE_CONFIG.phone}?text=${encodeURIComponent(message)}`;
}

// Foto produk. Kalau file belum ada, tampilkan kotak abu-abu "Foto segera hadir".
function productImage(product, size, className) {
  return `<img
      src="${esc(product.foto)}"
      alt="Galaxy Glasses ${esc(product.nama)}"
      width="${size}"
      height="${size}"
      loading="lazy"
      ${className ? `class="${className}"` : ''}
      onerror="this.outerHTML='<span class=&quot;img-missing&quot;>Foto segera hadir</span>';"
    />`;
}

// Fetch products from products.json
async function loadProducts() {
  try {
    const res = await fetch(STORE_CONFIG.productsUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Error loading products.json:', err);
    return [];
  }
}

// ==========================================================================
// Index Page Logic (Pilihan Kami horizontal row & Booking form)
// ==========================================================================
function initIndexPage(products) {
  const rowContainer = document.getElementById('featured-products-row');
  if (rowContainer && products.length > 0) {
    // Take first 6 products for "Pilihan Kami"
    const featured = products.slice(0, 6);
    rowContainer.innerHTML = '';

    featured.forEach(item => {
      const waUrl = getProductWaUrl(item);

      const card = document.createElement('article');
      card.className = 'snap-card';
      card.innerHTML = `
        <div class="snap-card-image-wrap">
          ${productImage(item, 240, 'snap-card-image')}
        </div>
        <div class="snap-card-body">
          <span class="snap-card-category">${esc(item.kategori || 'Kacamata')}</span>
          <h3 class="snap-card-name">${esc(item.nama)}</h3>
        </div>
      `;

      // Allow clicking card to ask about product on WhatsApp
      card.addEventListener('click', () => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
      card.style.cursor = 'pointer';

      rowContainer.appendChild(card);
    });
  }

  // Booking Form Setup
  const bookingForm = document.getElementById('booking-form');
  const dateInput = document.getElementById('booking-tanggal');
  const timeSelect = document.getElementById('booking-jam');

  // Set min date to today
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Populate time select with slots strictly between 10.30 and 20.30
  if (timeSelect && timeSelect.options.length <= 1) {
    const timeSlots = [
      '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30', '15:00',
      '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
    ];

    timeSelect.innerHTML = '<option value="" disabled selected>Pilih Jam (10.30 - 20.30)</option>';
    timeSlots.forEach(slot => {
      const opt = document.createElement('option');
      opt.value = `${slot} WIB`;
      opt.textContent = `${slot} WIB`;
      timeSelect.appendChild(opt);
    });
  }

  // Handle Booking Submit
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = document.getElementById('booking-nama')?.value.trim();
      const layanan = document.getElementById('booking-layanan')?.value;
      const tanggal = document.getElementById('booking-tanggal')?.value;
      const jam = document.getElementById('booking-jam')?.value;

      if (!nama || !layanan || !tanggal || !jam) {
        alert('Mohon lengkapi semua data booking.');
        return;
      }

      // Format date for readable Indonesian text e.g. "12 November 2026"
      let formattedTanggal = tanggal;
      try {
        const parts = tanggal.split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          formattedTanggal = d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
      } catch (err) {
        formattedTanggal = tanggal;
      }

      const waUrl = getBookingWaUrl(nama, layanan, formattedTanggal, jam);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

// ==========================================================================
// Catalog Page Logic (Filter material + tag, Product Grid)
// ==========================================================================
function initKatalogPage(products) {
  const gridContainer = document.getElementById('product-grid');
  if (!gridContainer) return;

  let activeCategory = 'Semua';
  let activeTag = null; // null = semua tipe

  function renderGrid() {
    gridContainer.innerHTML = '';

    const filtered = products.filter(product => {
      const tags = Array.isArray(product.tag) ? product.tag : [];
      if (activeCategory !== 'Semua' && product.kategori !== activeCategory) return false;
      if (activeTag && !tags.includes(activeTag)) return false;
      return true;
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="catalog-empty">
          <p style="font-weight: 700; margin-bottom: 6px;">Tidak ada produk yang cocok</p>
          <p style="font-size: 0.875rem;">Silakan ubah filter material atau tipe.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const waUrl = getProductWaUrl(product);
      const tags = Array.isArray(product.tag) ? product.tag : [];
      const tagHtml = tags.map(t => `<span class="badge-tag">${esc(t)}</span>`).join('');

      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-card-thumb">
          ${productImage(product, 300)}
          ${tagHtml}
        </div>
        <div class="product-card-content">
          <span class="product-card-category">${esc(product.kategori || 'Kacamata')}</span>
          <h2 class="product-card-title">${esc(product.nama)}</h2>

          <a
            href="${waUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-card-wa"
          >
            Tanya via WhatsApp
          </a>
        </div>
      `;

      gridContainer.appendChild(card);
    });
  }

  // Filter Material (pilih satu)
  const categoryChips = document.querySelectorAll('[data-filter-category]');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-filter-category');
      renderGrid();
    });
  });

  // Filter Tipe (Sporty / Kids): klik lagi untuk mematikan
  const tagChips = document.querySelectorAll('[data-filter-tag]');
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const value = chip.getAttribute('data-filter-tag');
      const turnOff = activeTag === value;
      tagChips.forEach(c => c.classList.remove('active'));
      activeTag = turnOff ? null : value;
      if (!turnOff) chip.classList.add('active');
      renderGrid();
    });
  });

  // Initial render
  renderGrid();
}

// ==========================================================================
// Initialization on DOMContentLoaded
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();

  // Check which page we are on
  if (document.getElementById('featured-products-row')) {
    initIndexPage(products);
  }

  if (document.getElementById('product-grid')) {
    initKatalogPage(products);
  }
});