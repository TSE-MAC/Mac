import './style.css';

// 1. Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
});

const loop = () => {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// 2. Space Canvas
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');
let width, height;

const stars = [];
const shootingStars = [];

function initCanvas() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  
  const isMobile = width < 768;
  const farStars = isMobile ? 120 : 300;
  const midStars = isMobile ? 40 : 150;
  const nearStars = isMobile ? 20 : 50;
  
  stars.length = 0;
  for(let i=0; i<farStars; i++) stars.push(createStar(0.4, 0.8, 0.2, 0.5, 0.008, false));
  for(let i=0; i<midStars; i++) stars.push(createStar(0.8, 1.4, 0.5, 0.8, 0.02, false));
  for(let i=0; i<nearStars; i++) stars.push(createStar(1.5, 2.5, 0.9, 1, 0.04, true));
  
  let twinkleCount = 0;
  while(twinkleCount < 30 && twinkleCount < stars.length) {
    const star = stars[Math.floor(Math.random() * stars.length)];
    if (!star.twinkles) {
      star.twinkles = true;
      star.twinkleOffset = Math.random() * Math.PI * 2;
      twinkleCount++;
    }
  }
}

function createStar(minSize, maxSize, minOp, maxOp, parallaxRatio) {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: minSize + Math.random() * (maxSize - minSize),
    baseOpacity: minOp + Math.random() * (maxOp - minOp),
    parallax: parallaxRatio,
    twinkles: false,
    twinkleOffset: 0
  };
}

let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

let time = 0;
let lastShootingStar = 0;

function drawSpace(timestamp) {
  time = timestamp * 0.001;
  ctx.clearRect(0, 0, width, height);
  
  const isMobile = window.innerWidth < 768;
  const cx = width / 2;
  const cy = height / 2;
  const dx = isMobile ? 0 : mouseX - cx;
  const dy = isMobile ? 0 : mouseY - cy;
  
  ctx.fillStyle = '#FFFFFF';
  stars.forEach(star => {
    let px = star.x - (dx * star.parallax);
    let py = star.y - (dy * star.parallax) - (scrollY * star.parallax);
    
    px = (px % width + width) % width;
    py = (py % height + height) % height;
    
    let opacity = star.baseOpacity;
    if (star.twinkles) {
      opacity += Math.sin(time * 2 + star.twinkleOffset) * 0.3;
      opacity = Math.max(0, Math.min(1, opacity));
    }
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(px, py, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.globalAlpha = 1;
  if (time - lastShootingStar > 6 + Math.random() * 3) {
    shootingStars.push({
      x: Math.random() * (width - 200) + 100,
      y: -50,
      vx: 15 + Math.random() * 5,
      vy: 15 + Math.random() * 5,
      life: 1,
      maxLife: 700,
      born: timestamp
    });
    lastShootingStar = time;
  }
  
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    let ss = shootingStars[i];
    let age = timestamp - ss.born;
    let progress = age / ss.maxLife;
    
    if (progress >= 1) {
      shootingStars.splice(i, 1);
      continue;
    }
    
    ss.x += ss.vx;
    ss.y += ss.vy;
    
    ctx.globalAlpha = 1 - progress;
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(ss.x - ss.vx * 10, ss.y - ss.vy * 10);
    ctx.strokeStyle = 'rgba(255,149,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  requestAnimationFrame(drawSpace);
}

window.addEventListener('resize', initCanvas);
initCanvas();
requestAnimationFrame(drawSpace);

// 3. Scroll Reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 4. Stat Count-Up
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.counted) {
      entry.target.counted = true;
      const target = parseInt(entry.target.getAttribute('data-target'));
      if(isNaN(target)) return;
      
      const duration = 1200;
      const startTime = performance.now();
      
      const updateStat = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(easeOut * target);
        
        entry.target.innerText = current + '+';
        
        if (progress < 1) {
          requestAnimationFrame(updateStat);
        } else {
          entry.target.innerText = target + '+';
        }
      };
      requestAnimationFrame(updateStat);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => statObserver.observe(el));

// 5. Skills Animation
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target.querySelector('.skill-fill');
      if (fill) fill.style.width = fill.getAttribute('data-width');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-item').forEach(el => skillsObserver.observe(el));

// 6. Form Submission Simulation
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    form.innerHTML = '';
    formStatus.style.display = 'block';
    formStatus.innerHTML = '';
    
    const lines = [
      '> SIGNAL RECEIVED.',
      '> ARYA (MAC) WILL RESPOND WITHIN 24H.',
      '> <span class="blink">_</span>'
    ];
    
    lines.forEach((line, index) => {
      setTimeout(() => {
        formStatus.innerHTML += line + '<br>';
      }, index * 500);
    });
  });
}

// 7. Sticky Nav
const nav = document.querySelector('.sticky-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    nav.classList.add('visible');
  } else {
    nav.classList.remove('visible');
  }
});

// 8. Mobile Nav
const hamburger = document.querySelector('.hamburger');
const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
const closeMenu = document.querySelector('.close-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

if (hamburger && mobileNavOverlay) {
  hamburger.addEventListener('click', () => {
    mobileNavOverlay.classList.add('active');
  });

  closeMenu.addEventListener('click', () => {
    mobileNavOverlay.classList.remove('active');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNavOverlay.classList.remove('active');
    });
  });
}
