import './style.css';

/* ── Loading Screen ── */
const loader = document.getElementById('loading-screen');
setTimeout(() => loader && loader.classList.add('hidden'), 700);

/* ── Lazy Video ── */
const bgVideo = document.getElementById('bg-video');
function loadVideo() {
  if (!bgVideo) return;
  const src = bgVideo.querySelector('source[data-src]');
  if (src) { src.setAttribute('src', src.getAttribute('data-src')); src.removeAttribute('data-src'); }
  bgVideo.load();
  bgVideo.addEventListener('canplay', () => {
    bgVideo.play().catch(() => {});
    bgVideo.playbackRate = 1.7;
    bgVideo.classList.add('loaded');
  }, { once: true });
  bgVideo.addEventListener('loadedmetadata', () => { bgVideo.playbackRate = 1.7; });
}
setTimeout(loadVideo, 800);



/* ── Canvas Stars ── */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, stars = [], time = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  buildStars();
}

function buildStars() {
  stars = [];
  const count = W < 768 ? 150 : 300;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.3 + Math.random() * 1.2,
      op: 0.2 + Math.random() * 0.7,
      twinkle: Math.random() > 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2
    });
  }
}

function drawStars(ts) {
  time = ts * 0.001;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    let op = s.op;
    if (s.twinkle) op += Math.sin(time * s.speed + s.phase) * 0.3;
    op = Math.max(0, Math.min(1, op));
    ctx.globalAlpha = op;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(drawStars);

/* ── Nav scroll ── */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── Mobile Nav ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileClose = document.getElementById('mobile-close');

hamburger && hamburger.addEventListener('click', () => mobileNav.classList.add('open'));
mobileClose && mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav && mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

/* ── Reveal on Scroll ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Stats Counter (fixed smooth version) ── */
function animateStat(el) {
  if (el._counted) return;
  el._counted = true;
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  if (isNaN(target)) return;
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) animateStat(e.target); });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => statObserver.observe(el));

/* ── Project Gallery ── */
function initGallery(thumbsId, mainImgId, captionId) {
  const thumbsEl = document.getElementById(thumbsId);
  const mainImg = document.getElementById(mainImgId);
  const caption = document.getElementById(captionId);
  if (!thumbsEl || !mainImg) return;

  thumbsEl.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const img = thumb.dataset.img;
      const cap = thumb.dataset.caption || '';

      // Fade out, swap, fade in
      mainImg.style.transition = 'opacity .3s';
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = img;
        if (caption) caption.textContent = cap;
        mainImg.style.opacity = '1';
      }, 300);

      thumbsEl.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

initGallery('cf-thumbs', 'cf-main-img', 'cf-caption');
initGallery('ss-thumbs', 'ss-main-img', 'ss-caption');
