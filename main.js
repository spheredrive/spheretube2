import { STUDIO_URL, EMBED_BASE_URL, SITE_URL } from './config.js';
import { api } from './api.js';
import { icons } from './icons.js';
import { formatDuration, formatViews, formatRelativeTime, premiereLabel, debounce, escapeHtml } from './utils.js';

/* ---------- Ikony: wstrzykujemy raz przy starcie i po każdym doklejeniu DOM ---------- */
function injectIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.dataset.icon;
    if (icons[name] && !el.dataset.iconDone) {
      el.innerHTML = icons[name];
      el.dataset.iconDone = '1';
    }
  });
}
injectIcons();

/* ---------- Elementy DOM ---------- */
const videoGrid = document.getElementById('videoGrid');
const loadingRow = document.getElementById('loadingRow');
const loadMoreRow = document.getElementById('loadMoreRow');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const feedHeading = document.getElementById('feedHeading');
const resultsPill = document.getElementById('resultsPill');
const cardTemplate = document.getElementById('videoCardTemplate');

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchToggleBtn = document.getElementById('searchToggleBtn');

const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
const profileDropdown = document.getElementById('profileDropdown');

const contextMenu = document.getElementById('videoContextMenu');

const shareDialog = document.getElementById('shareDialog');
const shareCloseBtn = document.getElementById('shareCloseBtn');

/* ---------- Stan strony: feed domowy albo wyniki wyszukiwania ---------- */
const isSearchRoute = location.pathname.replace(/\/$/, '') === '/search';
const searchParams = new URLSearchParams(location.search);
const searchQuery = (searchParams.get('') || searchParams.get('q') || '').trim();

let nextCursor = null;
let isLoading = false;
let currentUser = null;

/* ============================================================================
   Menu profilu (Login/Register vs Twój kanał/Ustawienia/Studio/Wyloguj)
   ============================================================================ */
function renderProfileMenu() {
  if (currentUser) {
    profileBtn.innerHTML = `<span>${escapeHtml(currentUser.name.trim().charAt(0).toUpperCase())}</span>`;
    profileMenu.innerHTML = `
      <div class="dropdown-panel__header">${escapeHtml(currentUser.name)}</div>
      <a class="menu-item" href="/channel/${encodeURIComponent(currentUser.slug)}"><span data-icon="profile"></span>Twój kanał</a>
      <a class="menu-item" href="/settings"><span data-icon="settings"></span>Ustawienia</a>
      <a class="menu-item" href="${STUDIO_URL}" target="_blank" rel="noopener"><span data-icon="chart"></span>Studio</a>
      <div class="menu-divider"></div>
      <button class="menu-item menu-item--danger" type="button" id="logoutBtn"><span data-icon="close"></span>Wyloguj</button>
    `;
  } else {
    profileBtn.innerHTML = `<span data-icon="profile"></span>`;
    profileMenu.innerHTML = `
      <a class="menu-item" href="/login"><span data-icon="login"></span>Login</a>
      <a class="menu-item" href="/register"><span data-icon="userPlus"></span>Register</a>
    `;
  }
  injectIcons(profileMenu);
  injectIcons(profileBtn);
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.logout().catch(() => {});
      location.reload();
    });
  }
}

async function loadCurrentUser() {
  try {
    const { user } = await api.me();
    currentUser = user;
  } catch {
    currentUser = null;
  }
  renderProfileMenu();
}

/* ============================================================================
   Dropdowny współdzielone: otwieranie/zamykanie + zamykanie na klik poza / Escape
   ============================================================================ */
function closeAllPanels(except) {
  document.querySelectorAll('.dropdown-panel.is-open').forEach((panel) => {
    if (panel !== except) {
      panel.classList.remove('is-open');
      const btn = panel.previousElementSibling;
      if (btn?.setAttribute) btn.setAttribute('aria-expanded', 'false');
    }
  });
}

profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = !profileMenu.classList.contains('is-open');
  closeAllPanels();
  profileMenu.classList.toggle('is-open', willOpen);
  profileBtn.setAttribute('aria-expanded', String(willOpen));
});

document.addEventListener('click', () => closeAllPanels());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllPanels(); });

/* ============================================================================
   Menu kontekstowe "trzy kropki"
   ============================================================================ */
function buildContextMenu(video) {
  const isOwner = !!currentUser && currentUser.id === video.creator_id;
  const editUrl = `/edit?accessId=${encodeURIComponent(currentUser?.id || '')}&videoid=${encodeURIComponent(video.id)}`;

  contextMenu.innerHTML = `
    <button class="menu-item" type="button" data-action="share"><span data-icon="share"></span>Udostępnij</button>
    <a class="menu-item" href="/report/?videoid=${encodeURIComponent(video.id)}"><span data-icon="flag"></span>Zgłoś</a>
    ${isOwner ? `
      <div class="menu-divider"></div>
      <a class="menu-item" href="${editUrl}"><span data-icon="pencil"></span>Edytuj</a>
      <a class="menu-item" href="${STUDIO_URL}" target="_blank" rel="noopener"><span data-icon="chart"></span>Wyświetl statystyki</a>
    ` : ''}
  `;
  injectIcons(contextMenu);

  contextMenu.querySelector('[data-action="share"]').addEventListener('click', () => {
    contextMenu.classList.remove('is-open');
    openShareDialog(video);
  });
}

function openContextMenu(button, video) {
  buildContextMenu(video);
  const rect = button.getBoundingClientRect();
  contextMenu.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 160)}px`;
  contextMenu.style.left = `${Math.min(rect.left - 170, window.innerWidth - 240)}px`;
  closeAllPanels(contextMenu);
  contextMenu.classList.add('is-open');
  button.setAttribute('aria-expanded', 'true');
  document.querySelectorAll('.video-card__menu-btn.is-open').forEach((b) => b.classList.remove('is-open'));
  button.classList.add('is-open');
}

/* ============================================================================
   Modal udostępniania
   ============================================================================ */
function openShareDialog(video) {
  const watchUrl = `${SITE_URL}/watch?v=${encodeURIComponent(video.id)}`;
  const embedUrl = `${EMBED_BASE_URL}/${encodeURIComponent(video.id)}`;
  const embedCode = `<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
  const text = encodeURIComponent(`Obejrzyj „${video.title}” na SphereTube`);

  document.getElementById('shareGmail').href = `https://mail.google.com/mail/?view=cm&fs=1&su=${text}&body=${encodeURIComponent(watchUrl)}`;
  document.getElementById('shareYoutube').href = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`;
  document.getElementById('shareDiscord').href = `https://discord.com/channels/@me`;
  document.getElementById('shareX').href = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(watchUrl)}`;
  document.getElementById('shareLinkInput').value = watchUrl;
  document.getElementById('shareEmbedInput').value = embedCode;

  shareDialog.showModal();
}
shareCloseBtn.addEventListener('click', () => shareDialog.close());
shareDialog.addEventListener('click', (e) => { if (e.target === shareDialog) shareDialog.close(); });

document.getElementById('shareCopyBtn').addEventListener('click', async (e) => {
  await navigator.clipboard.writeText(document.getElementById('shareLinkInput').value);
  flashCopied(e.currentTarget);
});
document.getElementById('shareEmbedBtn').addEventListener('click', async (e) => {
  await navigator.clipboard.writeText(document.getElementById('shareEmbedInput').value);
  flashCopied(e.currentTarget);
});
function flashCopied(button) {
  const original = button.innerHTML;
  button.innerHTML = `<span data-icon="check"></span>Skopiowano`;
  injectIcons(button);
  setTimeout(() => { button.innerHTML = original; }, 1800);
}

/* ============================================================================
   Renderowanie kart filmów
   ============================================================================ */
function renderVideoCard(video) {
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  const watchHref = `/watch?v=${encodeURIComponent(video.id)}`;

  node.querySelector('[data-role="thumb-link"]').href = watchHref;
  const img = node.querySelector('[data-role="thumb"]');
  img.src = video.thumb_url;
  img.alt = video.title;

  const durationEl = node.querySelector('[data-role="duration"]');
  const premiere = premiereLabel(video);
  if (premiere) {
    durationEl.textContent = premiere;
    durationEl.classList.add('video-card__duration--premiere');
  } else {
    durationEl.textContent = formatDuration(video.duration_seconds);
    durationEl.setAttribute('aria-label', `Czas trwania: ${formatDuration(video.duration_seconds)}`);
  }

  node.querySelector('[data-role="avatar"]').textContent = (video.creator_name || '?').trim().charAt(0).toUpperCase();

  const titleLink = node.querySelector('[data-role="title-link"]');
  titleLink.href = watchHref;
  titleLink.textContent = video.title;

  node.querySelector('[data-role="creator"]').textContent = video.creator_name;
  node.querySelector('[data-role="views"]').textContent = formatViews(video.views);
  node.querySelector('[data-role="time"]').textContent = formatRelativeTime(video.created_at);

  node.querySelector('[data-role="menu-btn"]').addEventListener('click', (e) => {
    e.stopPropagation();
    openContextMenu(e.currentTarget, video);
  });

  return node;
}

function renderSkeletons(count = 8) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'video-card skeleton-card';
    el.innerHTML = `
      <div class="video-card__thumb-wrap"></div>
      <div class="skeleton-line" style="width:90%"></div>
      <div class="skeleton-line" style="width:60%"></div>
    `;
    frag.appendChild(el);
  }
  videoGrid.appendChild(frag);
}

function renderEmptyState() {
  videoGrid.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="icon-orb"></div>
      <h3>${isSearchRoute ? 'Brak wyników' : 'Brak filmów'}</h3>
      <p>${isSearchRoute ? 'Nie znaleźliśmy nic pasującego do Twojego zapytania.' : 'Wróć tu później — twórcy dopiero zaczynają wgrywać materiały.'}</p>
    </div>
  `;
}

/* ============================================================================
   Wczytywanie danych: strona główna albo wyniki wyszukiwania
   ============================================================================ */
async function loadPage(reset = false) {
  if (isLoading) return;
  isLoading = true;
  loadingRow.hidden = false;
  loadMoreRow.hidden = true;

  if (reset) {
    videoGrid.innerHTML = '';
    renderSkeletons();
  }

  try {
    let videos, cursor = null;
    if (isSearchRoute) {
      const data = await api.search(searchQuery);
      videos = data.videos;
    } else {
      const data = await api.listVideos(nextCursor);
      videos = data.videos;
      cursor = data.nextCursor;
    }

    if (reset) videoGrid.innerHTML = '';
    if (videos.length === 0 && reset) {
      renderEmptyState();
    } else {
      const frag = document.createDocumentFragment();
      videos.forEach((v) => frag.appendChild(renderVideoCard(v)));
      videoGrid.appendChild(frag);
    }

    nextCursor = cursor;
    loadMoreRow.hidden = !nextCursor;
  } catch (err) {
    console.error(err);
    if (reset) {
      videoGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Coś poszło nie tak</h3><p>Nie udało się połączyć z backendem. Sprawdź adres API w config.js.</p></div>`;
    }
  } finally {
    isLoading = false;
    loadingRow.hidden = true;
  }
}

/* ---------- Konfiguracja nagłówka pod tryb wyszukiwania ---------- */
if (isSearchRoute) {
  feedHeading.firstChild.textContent = `Wyniki wyszukiwania: „${searchQuery}”`;
  searchInput.value = searchQuery;
}

/* ---------- Formularz wyszukiwania: nawigacja do /search?={spacje->+} ---------- */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  const encoded = encodeURIComponent(q).replace(/%20/g, '+');
  location.href = `/search?=${encoded}`;
});

searchToggleBtn?.addEventListener('click', () => {
  searchForm.classList.toggle('is-active');
  if (searchForm.classList.contains('is-active')) searchInput.focus();
});

loadMoreBtn.addEventListener('click', () => loadPage(false));

/* ---------- Start ---------- */
loadCurrentUser();
loadPage(true);