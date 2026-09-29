/**
 * IDLIX - APPLICATION LOGIC
 * Interaktivitas lengkap: Pemutar video kustom, modal detail, pencarian live,
 * sistem Daftar Saya (localStorage), filter kategori, dan animasi hover.
 */

// =============================================================================
// STATE & LOCAL STORAGE
// =============================================================================
let currentActiveMovie = null;
let currentPlayingMovie = null;
let watchlist = JSON.parse(localStorage.getItem('idlix_watchlist') || localStorage.getItem('netflix_watchlist') || '[]');
let likedMovies = JSON.parse(localStorage.getItem('idlix_liked') || localStorage.getItem('netflix_liked') || '[]');
let controlsTimeout = null;
let isMuted = false;

// =============================================================================
// DOM ELEMENTS
// =============================================================================
const navbar = document.getElementById('navbar');
const searchBox = document.getElementById('search-box');
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchInput = document.getElementById('search-input');
const searchSection = document.getElementById('search-results-section');
const searchGrid = document.getElementById('search-grid');
const searchTitleText = document.getElementById('search-title-text');
const searchClearBtn = document.getElementById('search-clear-btn');
const brandHome = document.getElementById('brand-home');
const navLinks = document.querySelectorAll('.nav-item');

// Hero elements
const heroBillboard = document.getElementById('hero-billboard');
const heroTitle = document.getElementById('hero-title');
const heroSynopsis = document.getElementById('hero-synopsis');
const heroMatch = document.getElementById('hero-match');
const heroAge = document.getElementById('hero-age');
const heroBtnPlay = document.getElementById('hero-btn-play');
const heroBtnInfo = document.getElementById('hero-btn-info');
const heroSoundToggle = document.getElementById('hero-sound-toggle');
const heroSoundIcon = document.getElementById('hero-sound-icon');

// Catalog & Rows
const mainCatalog = document.getElementById('main-catalog');
const dynamicRows = document.getElementById('dynamic-rows');
const watchlistRow = document.getElementById('watchlist-row');
const watchlistSlider = document.getElementById('watchlist-slider');

// Detail Modal elements
const detailModal = document.getElementById('detail-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBanner = document.getElementById('modal-banner');
const modalTitle = document.getElementById('modal-title');
const modalBtnPlay = document.getElementById('modal-btn-play');
const modalBtnWatchlist = document.getElementById('modal-btn-watchlist');
const modalWatchlistIcon = document.getElementById('modal-watchlist-icon');
const modalBtnLike = document.getElementById('modal-btn-like');
const modalLikeIcon = document.getElementById('modal-like-icon');
const modalMatch = document.getElementById('modal-match');
const modalAge = document.getElementById('modal-age');
const modalDuration = document.getElementById('modal-duration');
const modalQuality = document.getElementById('modal-quality');
const modalSynopsis = document.getElementById('modal-synopsis');
const modalCast = document.getElementById('modal-cast');
const modalDirector = document.getElementById('modal-director');
const modalGenres = document.getElementById('modal-genres');
const modalSimilarGrid = document.getElementById('modal-similar-grid');

// Video Player elements
const videoPlayerModal = document.getElementById('video-player-modal');
const netflixVideo = document.getElementById('netflix-video');
const playerControlsOverlay = document.getElementById('player-controls-overlay');
const btnPlayerBack = document.getElementById('btn-player-back');
const playerTitleDisplay = document.getElementById('player-title-display');
const playerQualityDisplay = document.getElementById('player-quality-display');
const playerCenterIcon = document.getElementById('player-center-icon');
const centerIconSymbol = document.getElementById('center-icon-symbol');
const playerTimeline = document.getElementById('player-timeline');
const playerBuffer = document.getElementById('player-buffer');
const playerProgress = document.getElementById('player-progress');
const playerTimelineTooltip = document.getElementById('player-timeline-tooltip');
const ctrlPlayPause = document.getElementById('ctrl-play-pause');
const ctrlPlayIcon = document.getElementById('ctrl-play-icon');
const ctrlRewind10 = document.getElementById('ctrl-rewind-10');
const ctrlForward10 = document.getElementById('ctrl-forward-10');
const ctrlVolumeBtn = document.getElementById('ctrl-volume-btn');
const ctrlVolumeIcon = document.getElementById('ctrl-volume-icon');
const ctrlVolumeBar = document.getElementById('ctrl-volume-bar');
const ctrlVolumeLevel = document.getElementById('ctrl-volume-level');
const ctrlTimeDisplay = document.getElementById('ctrl-time-display');
const ctrlSpeedSelect = document.getElementById('ctrl-speed-select');
const ctrlSubtitlesBtn = document.getElementById('ctrl-subtitles-btn');
const ctrlFullscreenBtn = document.getElementById('ctrl-fullscreen-btn');
const ctrlFullscreenIcon = document.getElementById('ctrl-fullscreen-icon');
const toastContainer = document.getElementById('toast-container');

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  renderHero();
  renderAllRows();
  updateWatchlistRow();
  setupSearch();
  setupDetailModalEvents();
  setupVideoPlayerEvents();
  setupKeyboardShortcuts();
});

// =============================================================================
// NAVBAR & NAVIGATION
// =============================================================================
function setupNavbar() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Nav filters
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');

      const filterType = link.dataset.filter;
      applyCategoryFilter(filterType);
    });
  });

  brandHome.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach((l) => l.classList.remove('active'));
    document.querySelector('.nav-item[data-filter="all"]').classList.add('active');
    applyCategoryFilter('all');
    closeSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const navOpenWatchlist = document.getElementById('nav-open-watchlist');
  if (navOpenWatchlist) {
    navOpenWatchlist.addEventListener('click', () => {
      applyCategoryFilter('watchlist');
    });
  }

  const notificationBtn = document.getElementById('notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showToast('Ada 3 film baru yang ditambahkan ke koleksi minggu ini!', 'fa-bell');
    });
  }
}

function applyCategoryFilter(type) {
  closeSearch();

  if (type === 'watchlist') {
    heroBillboard.style.display = 'none';
    if (watchlist.length === 0) {
      dynamicRows.innerHTML = `
        <div style="text-align:center; padding: 120px 20px 60px;">
          <i class="fa-solid fa-bookmark" style="font-size: 48px; color: #555; margin-bottom: 16px;"></i>
          <h2 style="color: #fff; margin-bottom: 8px;">Daftar Tontonan Anda Masih Kosong</h2>
          <p style="color: #aaa;">Jelajahi film atau acara TV, lalu klik tanda (+) untuk menyimpannya di sini.</p>
        </div>
      `;
      watchlistRow.style.display = 'none';
    } else {
      dynamicRows.innerHTML = '';
      watchlistRow.style.display = 'block';
      updateWatchlistRow();
    }
    return;
  }

  heroBillboard.style.display = 'flex';

  if (type === 'all') {
    renderAllRows();
    updateWatchlistRow();
  } else if (type === 'series') {
    renderFilteredRows((m) => m.type === 'series', '📺 Kategori Acara TV & Serial Pilihan');
  } else if (type === 'movie') {
    renderFilteredRows((m) => m.type === 'movie', '🎬 Kategori Film Layar Lebar');
  } else if (type === 'popular') {
    renderFilteredRows((m) => m.categories.includes('trending') || m.categories.includes('top10'), '🔥 Paling Populer & Baru');
  }
}

// =============================================================================
// HERO BILLBOARD
// =============================================================================
function renderHero(movie = null) {
  const featured = movie || MOVIES_DATA.find((m) => m.isFeatured) || MOVIES_DATA[0];
  currentActiveMovie = featured;

  heroBillboard.style.backgroundImage = `url('${featured.backdrop}')`;
  heroTitle.textContent = featured.title;
  heroSynopsis.textContent = featured.synopsis;
  heroMatch.textContent = `${featured.match} Cocok`;
  heroAge.textContent = featured.ageRating;

  heroBtnPlay.onclick = () => openPlayer(featured);
  heroBtnInfo.onclick = () => openDetailModal(featured);

  heroSoundToggle.onclick = () => {
    isMuted = !isMuted;
    if (isMuted) {
      heroSoundIcon.className = 'fa-solid fa-volume-xmark';
      showToast('Suara Pratinjau Dimatikan', 'fa-volume-xmark');
    } else {
      heroSoundIcon.className = 'fa-solid fa-volume-high';
      showToast('Suara Pratinjau Dinyalakan', 'fa-volume-high');
    }
  };
}

// =============================================================================
// RENDERING CATALOG ROWS
// =============================================================================
function renderAllRows() {
  dynamicRows.innerHTML = '';

  CATEGORIES.forEach((cat) => {
    const movies = MOVIES_DATA.filter(cat.filter);
    if (movies.length === 0) return;

    const rowEl = createRowElement(cat.title, movies, cat.id === 'top10');
    dynamicRows.appendChild(rowEl);
  });
}

function renderFilteredRows(predicate, categoryTitle) {
  dynamicRows.innerHTML = '';
  const filtered = MOVIES_DATA.filter(predicate);
  if (filtered.length > 0) {
    const rowEl = createRowElement(categoryTitle, filtered, false);
    dynamicRows.appendChild(rowEl);
  } else {
    dynamicRows.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; color: #888;">
        Tidak ada judul dalam kategori ini.
      </div>
    `;
  }
}

function createRowElement(title, movies, isRanked = false) {
  const row = document.createElement('div');
  row.className = 'movie-row';

  row.innerHTML = `
    <div class="row-header">
      <h3 class="row-title">${title}</h3>
      <span class="row-explore-text">Lihat Semua <i class="fa-solid fa-chevron-right"></i></span>
    </div>
    <div class="row-slider-container">
      <button class="slider-arrow left" aria-label="Geser ke kiri"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="row-slider"></div>
      <button class="slider-arrow right" aria-label="Geser ke kanan"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  `;

  const slider = row.querySelector('.row-slider');
  const leftArrow = row.querySelector('.slider-arrow.left');
  const rightArrow = row.querySelector('.slider-arrow.right');

  // Slider buttons
  leftArrow.addEventListener('click', () => {
    slider.scrollBy({ left: -600, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    slider.scrollBy({ left: 600, behavior: 'smooth' });
  });

  // Render cards
  movies.forEach((movie, index) => {
    const rank = isRanked ? index + 1 : null;
    const card = createMovieCard(movie, rank);
    slider.appendChild(card);
  });

  return row;
}

function createMovieCard(movie, rank = null) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.dataset.id = movie.id;

  const isInWatchlist = watchlist.includes(movie.id);
  const isLiked = likedMovies.includes(movie.id);

  card.innerHTML = `
    <div class="card-media">
      <img src="${movie.backdrop}" alt="${movie.title}" class="card-img" loading="lazy">
      ${rank ? `<div class="card-rank-badge">TOP #${rank}</div>` : ''}
    </div>
    
    <!-- Hover Expansion Card (Desktop) -->
    <div class="card-hover-details">
      <div class="hover-media">
        <img src="${movie.backdrop}" alt="${movie.title}" class="hover-img">
      </div>
      <div class="hover-content">
        <div class="hover-actions">
          <div class="hover-actions-left">
            <button class="btn-circle btn-play-sm" title="Putar Sekarang">
              <i class="fa-solid fa-play"></i>
            </button>
            <button class="btn-circle btn-watchlist ${isInWatchlist ? 'active' : ''}" title="${isInWatchlist ? 'Hapus dari Daftar Saya' : 'Tambah ke Daftar Saya'}">
              <i class="fa-solid ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i>
            </button>
            <button class="btn-circle btn-like ${isLiked ? 'active' : ''}" title="${isLiked ? 'Batal Suka' : 'Sukai'}">
              <i class="fa-solid fa-thumbs-up"></i>
            </button>
          </div>
          <button class="btn-circle btn-more" title="Informasi Lengkap">
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
        <div class="hover-meta">
          <span class="meta-match">${movie.match}</span>
          <span class="meta-age">${movie.ageRating}</span>
          <span class="meta-duration">${movie.duration}</span>
          <span class="meta-quality">${movie.quality.includes('4K') ? '4K' : 'HD'}</span>
        </div>
        <div class="hover-title">${movie.title}</div>
        <div class="hover-genres">
          ${movie.genres.slice(0, 3).map((g) => `<span>${g}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Click card on mobile / directly opens modal
  card.addEventListener('click', (e) => {
    // If clicked on hover action buttons, handle separately
    if (e.target.closest('.btn-play-sm')) {
      e.stopPropagation();
      openPlayer(movie);
      return;
    }
    if (e.target.closest('.btn-watchlist')) {
      e.stopPropagation();
      toggleWatchlist(movie.id);
      return;
    }
    if (e.target.closest('.btn-like')) {
      e.stopPropagation();
      toggleLike(movie.id);
      return;
    }
    if (e.target.closest('.btn-more')) {
      e.stopPropagation();
      openDetailModal(movie);
      return;
    }

    // Default card click opens detail modal
    openDetailModal(movie);
  });

  return card;
}

// =============================================================================
// WATCHLIST & LIKES LOGIC
// =============================================================================
function toggleWatchlist(movieId) {
  const movie = MOVIES_DATA.find((m) => m.id === movieId);
  if (!movie) return;

  const index = watchlist.indexOf(movieId);
  if (index > -1) {
    watchlist.splice(index, 1);
    showToast(`"${movie.title}" dihapus dari Daftar Saya`, 'fa-trash');
  } else {
    watchlist.push(movieId);
    showToast(`"${movie.title}" ditambahkan ke Daftar Saya`, 'fa-check');
  }

  localStorage.setItem('idlix_watchlist', JSON.stringify(watchlist));
  updateWatchlistRow();
  syncCardWatchlistButtons();

  // If detail modal is open for this movie, update its icon
  if (currentActiveMovie && currentActiveMovie.id === movieId) {
    updateModalWatchlistState();
  }
}

function toggleLike(movieId) {
  const movie = MOVIES_DATA.find((m) => m.id === movieId);
  if (!movie) return;

  const index = likedMovies.indexOf(movieId);
  if (index > -1) {
    likedMovies.splice(index, 1);
    showToast(`Batal menyukai "${movie.title}"`, 'fa-thumbs-up');
  } else {
    likedMovies.push(movieId);
    showToast(`Menyukai "${movie.title}"`, 'fa-thumbs-up');
  }

  localStorage.setItem('idlix_liked', JSON.stringify(likedMovies));
  syncCardLikeButtons();

  if (currentActiveMovie && currentActiveMovie.id === movieId) {
    updateModalLikeState();
  }
}

function updateWatchlistRow() {
  if (!watchlistRow || !watchlistSlider) return;

  const savedMovies = MOVIES_DATA.filter((m) => watchlist.includes(m.id));

  if (savedMovies.length === 0) {
    watchlistRow.style.display = 'none';
    watchlistSlider.innerHTML = '';
  } else {
    watchlistRow.style.display = 'block';
    watchlistSlider.innerHTML = '';
    savedMovies.forEach((movie) => {
      const card = createMovieCard(movie);
      watchlistSlider.appendChild(card);
    });

    // Slider arrows setup for watchlist row
    const leftArrow = watchlistRow.querySelector('.slider-arrow.left');
    const rightArrow = watchlistRow.querySelector('.slider-arrow.right');
    leftArrow.onclick = () => watchlistSlider.scrollBy({ left: -600, behavior: 'smooth' });
    rightArrow.onclick = () => watchlistSlider.scrollBy({ left: 600, behavior: 'smooth' });
  }
}

function syncCardWatchlistButtons() {
  document.querySelectorAll('.movie-card').forEach((card) => {
    const id = card.dataset.id;
    const btn = card.querySelector('.btn-watchlist');
    if (btn) {
      const isSaved = watchlist.includes(id);
      btn.className = `btn-circle btn-watchlist ${isSaved ? 'active' : ''}`;
      btn.innerHTML = `<i class="fa-solid ${isSaved ? 'fa-check' : 'fa-plus'}"></i>`;
      btn.title = isSaved ? 'Hapus dari Daftar Saya' : 'Tambah ke Daftar Saya';
    }
  });
}

function syncCardLikeButtons() {
  document.querySelectorAll('.movie-card').forEach((card) => {
    const id = card.dataset.id;
    const btn = card.querySelector('.btn-like');
    if (btn) {
      const isLiked = likedMovies.includes(id);
      btn.className = `btn-circle btn-like ${isLiked ? 'active' : ''}`;
    }
  });
}

// =============================================================================
// SEARCH FUNCTIONALITY
// =============================================================================
function setupSearch() {
  searchToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchBox.classList.toggle('open');
    if (searchBox.classList.contains('open')) {
      searchInput.focus();
    }
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    performSearch(query);
  });

  searchClearBtn.addEventListener('click', () => {
    closeSearch();
  });

  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && searchInput.value.trim() === '') {
      searchBox.classList.remove('open');
    }
  });
}

function performSearch(query) {
  if (!query) {
    searchSection.classList.remove('active');
    heroBillboard.style.display = 'flex';
    mainCatalog.style.display = 'flex';
    return;
  }

  heroBillboard.style.display = 'none';
  mainCatalog.style.display = 'none';
  searchSection.classList.add('active');
  searchTitleText.textContent = `Hasil Pencarian untuk "${query}"`;

  const results = MOVIES_DATA.filter((m) => {
    const matchTitle = m.title.toLowerCase().includes(query);
    const matchSynopsis = m.synopsis.toLowerCase().includes(query);
    const matchGenres = m.genres.some((g) => g.toLowerCase().includes(query));
    const matchCast = m.cast.some((c) => c.toLowerCase().includes(query));
    return matchTitle || matchSynopsis || matchGenres || matchCast;
  });

  searchGrid.innerHTML = '';
  if (results.length === 0) {
    searchGrid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 40px; margin-bottom: 12px; color: #555;"></i>
        <h3>Pencarian tidak menemukan hasil</h3>
        <p>Saran: Coba kata kunci yang berbeda, nama aktor, atau genre film seperti 'Aksi', 'Horor', 'Fiksi Ilmiah'.</p>
      </div>
    `;
  } else {
    results.forEach((movie) => {
      const card = createMovieCard(movie);
      searchGrid.appendChild(card);
    });
  }
}

function closeSearch() {
  searchInput.value = '';
  searchBox.classList.remove('open');
  searchSection.classList.remove('active');
  heroBillboard.style.display = 'flex';
  mainCatalog.style.display = 'flex';
}

// =============================================================================
// DETAIL MODAL ("SELENGKAPNYA")
// =============================================================================
function openDetailModal(movie) {
  currentActiveMovie = movie;

  modalBanner.style.backgroundImage = `url('${movie.backdrop}')`;
  modalTitle.textContent = movie.title;
  modalMatch.textContent = `${movie.match} Cocok`;
  modalAge.textContent = movie.ageRating;
  modalDuration.textContent = movie.duration;
  modalQuality.textContent = movie.quality;
  modalSynopsis.textContent = movie.synopsis;
  modalCast.textContent = movie.cast.join(', ');
  modalDirector.textContent = movie.director;
  modalGenres.textContent = movie.genres.join(', ');

  updateModalWatchlistState();
  updateModalLikeState();

  // Play button in modal
  modalBtnPlay.onclick = () => {
    closeDetailModal();
    openPlayer(movie);
  };

  // Watchlist button in modal
  modalBtnWatchlist.onclick = () => {
    toggleWatchlist(movie.id);
  };

  // Like button in modal
  modalBtnLike.onclick = () => {
    toggleLike(movie.id);
  };

  // Render Similar Titles
  renderSimilarMovies(movie);

  detailModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateModalWatchlistState() {
  if (!currentActiveMovie) return;
  const isSaved = watchlist.includes(currentActiveMovie.id);
  modalBtnWatchlist.className = `btn-circle ${isSaved ? 'active' : ''}`;
  modalWatchlistIcon.className = `fa-solid ${isSaved ? 'fa-check' : 'fa-plus'}`;
}

function updateModalLikeState() {
  if (!currentActiveMovie) return;
  const isLiked = likedMovies.includes(currentActiveMovie.id);
  modalBtnLike.className = `btn-circle ${isLiked ? 'active' : ''}`;
}

function renderSimilarMovies(current) {
  modalSimilarGrid.innerHTML = '';
  // Find movies sharing genres or random
  const similar = MOVIES_DATA.filter((m) => m.id !== current.id).slice(0, 6);

  similar.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'similar-card';
    card.innerHTML = `
      <img src="${item.backdrop}" alt="${item.title}" class="similar-img">
      <div class="similar-info">
        <div class="similar-title">${item.title}</div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
          <span style="color: #46d369; font-weight: 700;">${item.match}</span>
          <span style="border: 1px solid #555; padding: 0 4px; border-radius: 2px;">${item.ageRating}</span>
          <span style="color: #aaa;">${item.year}</span>
        </div>
        <p class="similar-desc">${item.synopsis}</p>
      </div>
    `;

    card.onclick = () => {
      openDetailModal(item);
    };

    modalSimilarGrid.appendChild(card);
  });
}

function closeDetailModal() {
  detailModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function setupDetailModalEvents() {
  modalCloseBtn.addEventListener('click', closeDetailModal);

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeDetailModal();
    }
  });
}

// =============================================================================
// CUSTOM NETFLIX VIDEO PLAYER
// =============================================================================
function openPlayer(movie) {
  currentPlayingMovie = movie;

  playerTitleDisplay.textContent = movie.title;
  playerQualityDisplay.textContent = `${movie.quality} • ${movie.duration} • Dolby Digital`;

  netflixVideo.src = movie.videoUrl;
  videoPlayerModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  netflixVideo.currentTime = 0;
  netflixVideo.play().then(() => {
    updatePlayPauseUI(true);
  }).catch((err) => {
    console.warn("Autoplay was blocked or video failed to play:", err);
    updatePlayPauseUI(false);
  });

  resetControlsIdleTimer();
  showToast(`Sedang memutar: "${movie.title}"`, 'fa-play');
}

function closePlayer() {
  netflixVideo.pause();
  netflixVideo.src = '';
  videoPlayerModal.classList.remove('active');
  document.body.style.overflow = 'auto';

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function togglePlayPause() {
  if (netflixVideo.paused || netflixVideo.ended) {
    netflixVideo.play();
    updatePlayPauseUI(true);
    triggerCenterFlash('play');
  } else {
    netflixVideo.pause();
    updatePlayPauseUI(false);
    triggerCenterFlash('pause');
  }
}

function updatePlayPauseUI(isPlaying) {
  if (isPlaying) {
    ctrlPlayIcon.className = 'fa-solid fa-pause';
    ctrlPlayPause.title = 'Jeda (Spasi)';
  } else {
    ctrlPlayIcon.className = 'fa-solid fa-play';
    ctrlPlayPause.title = 'Putar (Spasi)';
  }
}

function triggerCenterFlash(type) {
  centerIconSymbol.className = type === 'play' ? 'fa-solid fa-play' : 'fa-solid fa-pause';
  playerCenterIcon.classList.add('animate');
  setTimeout(() => {
    playerCenterIcon.classList.remove('animate');
  }, 400);
}

function setupVideoPlayerEvents() {
  // Back button
  btnPlayerBack.addEventListener('click', closePlayer);

  // Click on video to toggle play/pause
  netflixVideo.addEventListener('click', togglePlayPause);
  ctrlPlayPause.addEventListener('click', togglePlayPause);

  // Rewind & Forward
  ctrlRewind10.addEventListener('click', () => {
    netflixVideo.currentTime = Math.max(0, netflixVideo.currentTime - 10);
    showToast('Mundur 10 detik', 'fa-rotate-left');
  });

  ctrlForward10.addEventListener('click', () => {
    netflixVideo.currentTime = Math.min(netflixVideo.duration || 0, netflixVideo.currentTime + 10);
    showToast('Maju 10 detik', 'fa-rotate-right');
  });

  // Time & Scrubber
  netflixVideo.addEventListener('timeupdate', () => {
    const current = netflixVideo.currentTime || 0;
    const duration = netflixVideo.duration || 0;
    const percent = duration > 0 ? (current / duration) * 100 : 0;

    playerProgress.style.width = `${percent}%`;
    ctrlTimeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  });

  netflixVideo.addEventListener('progress', () => {
    if (netflixVideo.buffered.length > 0 && netflixVideo.duration > 0) {
      const bufferedEnd = netflixVideo.buffered.end(netflixVideo.buffered.length - 1);
      const bufferPercent = (bufferedEnd / netflixVideo.duration) * 100;
      playerBuffer.style.width = `${bufferPercent}%`;
    }
  });

  // Seeking on timeline
  playerTimeline.addEventListener('click', (e) => {
    const rect = playerTimeline.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (netflixVideo.duration) {
      netflixVideo.currentTime = pos * netflixVideo.duration;
    }
  });

  playerTimeline.addEventListener('mousemove', (e) => {
    const rect = playerTimeline.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const previewTime = pos * (netflixVideo.duration || 0);

    playerTimelineTooltip.style.left = `${e.clientX - rect.left}px`;
    playerTimelineTooltip.textContent = formatTime(previewTime);
  });

  // Volume
  ctrlVolumeBtn.addEventListener('click', () => {
    netflixVideo.muted = !netflixVideo.muted;
    updateVolumeUI();
  });

  ctrlVolumeBar.addEventListener('click', (e) => {
    const rect = ctrlVolumeBar.getBoundingClientRect();
    const level = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    netflixVideo.volume = level;
    netflixVideo.muted = false;
    updateVolumeUI();
  });

  // Playback speed
  ctrlSpeedSelect.addEventListener('change', (e) => {
    netflixVideo.playbackRate = parseFloat(e.target.value);
    showToast(`Kecepatan putar: ${e.target.value}x`, 'fa-gauge-high');
  });

  // Subtitle simulation
  ctrlSubtitlesBtn.addEventListener('click', () => {
    showToast('Audio: Indonesia (Asli) | Teks Terjemahan: Indonesia', 'fa-comment-dots');
  });

  // Fullscreen
  ctrlFullscreenBtn.addEventListener('click', toggleFullscreen);

  // Auto-hide controls during mouse inactivity
  videoPlayerModal.addEventListener('mousemove', () => {
    resetControlsIdleTimer();
  });

  videoPlayerModal.addEventListener('mouseleave', () => {
    if (!netflixVideo.paused) {
      playerControlsOverlay.classList.add('idle');
    }
  });
}

function updateVolumeUI() {
  if (netflixVideo.muted || netflixVideo.volume === 0) {
    ctrlVolumeIcon.className = 'fa-solid fa-volume-xmark';
    ctrlVolumeLevel.style.width = '0%';
  } else {
    ctrlVolumeIcon.className = 'fa-solid fa-volume-high';
    ctrlVolumeLevel.style.width = `${netflixVideo.volume * 100}%`;
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoPlayerModal.requestFullscreen().then(() => {
      ctrlFullscreenIcon.className = 'fa-solid fa-compress';
    }).catch((err) => {
      console.warn("Fullscreen request error:", err);
    });
  } else {
    document.exitFullscreen().then(() => {
      ctrlFullscreenIcon.className = 'fa-solid fa-expand';
    });
  }
}

function resetControlsIdleTimer() {
  playerControlsOverlay.classList.remove('idle');
  clearTimeout(controlsTimeout);

  controlsTimeout = setTimeout(() => {
    if (!netflixVideo.paused && videoPlayerModal.classList.contains('active')) {
      playerControlsOverlay.classList.add('idle');
    }
  }, 2800);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const padM = m < 10 ? `0${m}` : m;
  const padS = s < 10 ? `0${s}` : s;
  return `${padM}:${padS}`;
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // If user is typing in search input, do not trigger shortcuts
    if (document.activeElement === searchInput) {
      if (e.key === 'Escape') closeSearch();
      return;
    }

    // Video Player active shortcuts
    if (videoPlayerModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closePlayer();
      } else if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        netflixVideo.currentTime = Math.min(netflixVideo.duration || 0, netflixVideo.currentTime + 10);
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        netflixVideo.currentTime = Math.max(0, netflixVideo.currentTime - 10);
      } else if (e.key === 'm') {
        netflixVideo.muted = !netflixVideo.muted;
        updateVolumeUI();
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'ArrowUp') {
        netflixVideo.volume = Math.min(1, netflixVideo.volume + 0.1);
        netflixVideo.muted = false;
        updateVolumeUI();
      } else if (e.key === 'ArrowDown') {
        netflixVideo.volume = Math.max(0, netflixVideo.volume - 0.1);
        updateVolumeUI();
      }
      return;
    }

    // Detail modal shortcut
    if (detailModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeDetailModal();
      }
      return;
    }
  });
}

// =============================================================================
// TOAST NOTIFICATION
// =============================================================================
function showToast(message, iconClass = 'fa-circle-info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 3200);
}
