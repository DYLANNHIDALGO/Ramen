const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const bgImage = document.getElementById('background-image');

let text = "TE AMO B♡9";
let fontSize = 22;
let columnSpacing = 2;
let columnWidth;
let columns;
let drops = [];
let speed = 60;
let fallType = "heart";

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.font = `${fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue('--matrix-font').trim() || 'Arial'}`;
  columnWidth = ctx.measureText(text).width + columnSpacing;
  columns = Math.floor(canvas.width / columnWidth);
  drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = 0; // Empieza desde arriba
  }
}

setupCanvas();
window.addEventListener('resize', setupCanvas);

document.getElementById('speed').addEventListener('input', e => {
  speed = parseInt(e.target.value);
  clearInterval(loop);
  loop = setInterval(draw, speed);
});

document.getElementById('color').addEventListener('input', e => {
  document.documentElement.style.setProperty('--matrix-txt', e.target.value);
});

document.getElementById('font').addEventListener('change', e => {
  document.documentElement.style.setProperty('--matrix-font', e.target.value);
  ctx.font = `${fontSize}px ${e.target.value}`;
  setupCanvas();
});

document.getElementById('fallType').addEventListener('change', e => {
  fallType = e.target.value;
});

document.getElementById('fontSize').addEventListener('input', e => {
  fontSize = parseInt(e.target.value);
  ctx.font = `${fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue('--matrix-font').trim() || 'Arial'}`;
  setupCanvas();
});

document.getElementById('bgImageInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      bgImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

const hearts = [];
function createHearts(x, y) {
  for (let i = 0; i < 15; i++) {
    hearts.push({
      x: x + Math.random() * 50 - 25,
      y: y + Math.random() * 50 - 25,
      size: Math.random() * 10 + 10,
      alpha: 1,
      dy: Math.random() * -2 - 1
    });
  }
}

const explosions = [];
function createExplosion(x, y) {
  const steps = 80;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const r = 15 * (1 - Math.sin(angle)) * Math.sin(angle) * Math.sqrt(Math.abs(Math.cos(angle))) / (Math.sin(angle) + 1.4) - 2;
    const px = x + r * 10 * Math.cos(angle);
    const py = y - r * 10 * Math.sin(angle);
    explosions.push({
      x,
      y,
      dx: (px - x) / 20,
      dy: (py - y) / 20,
      alpha: 1,
      char: text[Math.floor(Math.random() * text.length)]
    });
  }
}

canvas.addEventListener('click', e => {
  showMessage();
  createHearts(e.clientX, e.clientY);
  createExplosion(e.clientX, e.clientY);
});

function showMessage() {
  const msg = document.getElementById('message');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2000);
}

function drawHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    ctx.globalAlpha = h.alpha;
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.moveTo(h.x, h.y);
    ctx.bezierCurveTo(h.x + h.size / 2, h.y - h.size, h.x + h.size * 2, h.y + h.size, h.x, h.y + h.size * 1.5);
    ctx.bezierCurveTo(h.x - h.size * 2, h.y + h.size, h.x - h.size / 2, h.y - h.size, h.x, h.y);
    ctx.fill();
    h.y += h.dy;
    h.alpha -= 0.02;
    if (h.alpha <= 0) hearts.splice(i, 1);
    ctx.globalAlpha = 1;
  }
}

function drawExplosions() {
  ctx.font = `${fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue('--matrix-font').trim() || 'Arial'}`;
  for (let i = explosions.length - 1; i >= 0; i--) {
    const p = explosions[i];
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--matrix-txt').trim() || '#0F0';
    ctx.fillText(p.char, p.x, p.y);
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.02;
    if (p.alpha <= 0) explosions.splice(i, 1);
    ctx.globalAlpha = 1;
  }
}

function draw() {
  // Fondo negro semi-transparente para "desvanecer"
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar imagen de fondo opaca
  if (bgImage.src) {
    ctx.globalAlpha = 0.2;  // algo visible pero tenue
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }

  // Cambiar modo para borrar fondo en las letras (hacer zonas transparentes)
  ctx.globalCompositeOperation = 'destination-out';

  ctx.font = `${fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue('--matrix-font').trim() || 'Arial'}`;
  for (let i = 0; i < drops.length; i++) {
    const xBase = i * columnWidth;
    const y = drops[i] * fontSize;

    let offsetX = 0;
    switch (fallType) {
      case 'heart':
        offsetX = (16 * Math.pow(Math.sin(drops[i] * 0.1), 3)) * 0.5;
        break;
      case 'wave':
        offsetX = Math.sin(drops[i] * 0.3) * (columnWidth / 3);
        break;
      case 'zigzag':
        offsetX = Math.sin(drops[i] * 0.3) * 10;
        break;
      case 'spiral':
        offsetX = 10 * Math.cos(drops[i] * 0.1);
        break;
      case 'random':
        offsetX = (Math.random() - 0.5) * (columnWidth / 2);
        break;
    }

    // Letras como máscara: borran el fondo (dejan transparente)
    ctx.fillText(text, xBase + offsetX, y);

    if (y > canvas.height + fontSize * 5 && Math.random() > 0.98) {
      drops[i] = 0;
    } else {
      drops[i]++;
    }
  }

  // Volver al modo normal para pintar las letras encima
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--matrix-txt').trim() || '#0F0';
  ctx.font = `${fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue('--matrix-font').trim() || 'Arial'}`;
  for (let i = 0; i < drops.length; i++) {
    const xBase = i * columnWidth;
    const y = drops[i] * fontSize;

    let offsetX = 0;
    switch (fallType) {
      case 'heart':
        offsetX = (16 * Math.pow(Math.sin(drops[i] * 0.1), 3)) * 0.5;
        break;
      case 'wave':
        offsetX = Math.sin(drops[i] * 0.3) * (columnWidth / 3);
        break;
      case 'zigzag':
        offsetX = Math.sin(drops[i] * 0.3) * 10;
        break;
      case 'spiral':
        offsetX = 10 * Math.cos(drops[i] * 0.1);
        break;
      case 'random':
        offsetX = (Math.random() - 0.5) * (columnWidth / 2);
        break;
    }

    ctx.fillText(text, xBase + offsetX, y);
  }

  drawHearts();
  drawExplosions();
}

let loop = setInterval(draw, speed);
