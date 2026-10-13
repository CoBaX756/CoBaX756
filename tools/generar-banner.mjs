// Generates every block of the profile (banner, introduction, terminal, what he builds,
// technologies) in dark and light, all inside the same frame (see marco.mjs).
// Run from the repo root: node tools/generar-banner.mjs
// Subject of the banner: the Vizcaya Bridge (Puente Colgante) in Bizkaia, a transporter bridge
// whose gondola carries people and vehicles across the ría. It is a bridge that *transports*,
// which is what Xabier's software does for the companies he builds it for.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { ANCHO, FUENTE, MONO, celosia, desmontar, enmarcar, esc, etiqueta, lienzo, paletas, partir } from './marco.mjs';

const W = 1200, H = 360, AGUA = 292;
const TORRE_IZQ = 560, TORRE_DER = 1020, VIGA_Y = 74, VIGA_ALTO = 14;

// One lattice tower: two legs that lean in toward the top, cross braces between them.
function torre(cx, c) {
  const base = 74, arriba = 26; // half widths at the water and at the top
  const y0 = AGUA, y1 = VIGA_Y - 14;
  const alto = y0 - y1;
  const lado = (y) => base - ((y0 - y) / alto) * (base - arriba);
  const partes = [];
  partes.push(`<line x1="${cx - base}" y1="${y0}" x2="${cx - arriba}" y2="${y1}"/>`);
  partes.push(`<line x1="${cx + base}" y1="${y0}" x2="${cx + arriba}" y2="${y1}"/>`);
  const peldanos = 7;
  for (let i = 0; i <= peldanos; i++) {
    const y = y0 - (alto / peldanos) * i;
    const a = lado(y);
    partes.push(`<line x1="${cx - a}" y1="${y}" x2="${cx + a}" y2="${y}"/>`);
    if (i < peldanos) {
      const yn = y0 - (alto / peldanos) * (i + 1);
      const an = lado(yn);
      partes.push(`<line x1="${cx - a}" y1="${y}" x2="${cx + an}" y2="${yn}" opacity=".55"/>`);
      partes.push(`<line x1="${cx + a}" y1="${y}" x2="${cx - an}" y2="${yn}" opacity=".55"/>`);
    }
  }
  return partes.join('');
}

function vigaCeloso(x1, x2, c) {
  const partes = [];
  partes.push(`<rect x="${x1}" y="${VIGA_Y}" width="${x2 - x1}" height="3" fill="${c.hierro}"/>`);
  partes.push(`<rect x="${x1}" y="${VIGA_Y + VIGA_ALTO}" width="${x2 - x1}" height="3" fill="${c.hierro}"/>`);
  const paso = 16;
  for (let x = x1; x < x2; x += paso) {
    const par = ((x - x1) / paso) % 2 === 0;
    partes.push(`<line x1="${x}" y1="${par ? VIGA_Y : VIGA_Y + VIGA_ALTO}" x2="${x + paso}" y2="${par ? VIGA_Y + VIGA_ALTO : VIGA_Y}" stroke="${c.hierroSuave}" stroke-width="1.2"/>`);
  }
  return partes.join('');
}

// Stays from each tower top out to the deck, as on the real bridge.
function tirantes(c) {
  const lineas = [];
  const alturaTorre = VIGA_Y - 14;
  for (let i = 1; i <= 4; i++) {
    const dx = i * 38;
    lineas.push(`<line x1="${TORRE_IZQ - 26}" y1="${alturaTorre}" x2="${TORRE_IZQ - 26 - dx}" y2="${VIGA_Y + 3}"/>`);
    lineas.push(`<line x1="${TORRE_DER + 26}" y1="${alturaTorre}" x2="${TORRE_DER + 26 + dx}" y2="${VIGA_Y + 3}"/>`);
  }
  return `<g stroke="${c.hierroSuave}" stroke-width="1" opacity=".7">${lineas.join('')}</g>`;
}

function estrellas(c) {
  const puntos = [[60, 40], [150, 90], [240, 30], [330, 70], [410, 28], [470, 110], [520, 52], [700, 20], [830, 44], [980, 24], [1090, 40], [1160, 84], [1130, 150], [640, 130], [90, 160]];
  return puntos.map(([x, y], i) => `<circle class="est e${i % 3}" cx="${x}" cy="${y}" r="${i % 4 === 0 ? 1.6 : 1.1}" fill="${c.estrellas}"/>`).join('');
}

function ondas(c) {
  const filas = [];
  for (let i = 0; i < 5; i++) {
    const y = AGUA + 16 + i * 12;
    let d = `M-80 ${y}`;
    for (let x = -80; x < W + 160; x += 60) d += ` q15 -5 30 0 t30 0`;
    filas.push(`<path class="onda o${i % 2}" d="${d}" fill="none" stroke="${c.ondas}" stroke-width="1.4" opacity="${0.85 - i * 0.12}"/>`);
  }
  return filas.join('');
}

function gondola(c) {
  // Drawn with its centre at x=0 so a single translateX moves it along the deck.
  // The carriage is as wide as the platform, so all four hangers start on it.
  const cx = 0, y = VIGA_Y + VIGA_ALTO + 3, plataformaY = 232;
  return `
  <g class="gondola" style="transform-box: fill-box">
    <rect x="${cx - 36}" y="${y}" width="72" height="9" rx="2" fill="${c.hierro}"/>
    <rect x="${cx - 6}" y="${y - 3}" width="12" height="3" fill="${c.hierro}"/>
    <g stroke="${c.hierroSuave}" stroke-width="1.2">
      <line x1="${cx - 30}" y1="${y + 9}" x2="${cx - 30}" y2="${plataformaY}"/>
      <line x1="${cx - 10}" y1="${y + 9}" x2="${cx - 10}" y2="${plataformaY}"/>
      <line x1="${cx + 10}" y1="${y + 9}" x2="${cx + 10}" y2="${plataformaY}"/>
      <line x1="${cx + 30}" y1="${y + 9}" x2="${cx + 30}" y2="${plataformaY}"/>
    </g>
    <rect x="${cx - 36}" y="${plataformaY}" width="72" height="7" rx="1.5" fill="${c.hierro}"/>
    <rect x="${cx - 28}" y="${plataformaY - 22}" width="56" height="22" rx="3" fill="none" stroke="${c.hierro}" stroke-width="1.4"/>
    <rect x="${cx - 22}" y="${plataformaY - 17}" width="44" height="11" rx="1.5" fill="${c.luz}" class="luz"/>
  </g>`;
}

// Red-and-amber warning lights on top of each tower, blinking out of step with each other.
function balizas(c) {
  const y = VIGA_Y - 18;
  return `<circle class="baliza" cx="${TORRE_IZQ}" cy="${y}" r="3.2" fill="${c.luz}"/>
  <circle class="baliza b2" cx="${TORRE_DER}" cy="${y}" r="3.2" fill="${c.luz}"/>`;
}

// Two boats going up and down the ría at different speeds, the far one smaller and fainter.
function barcos(c) {
  const casco = (escala, opacidad, clase, y) => `<g class="barco ${clase}" opacity="${opacidad}">
    <g transform="translate(0 ${y}) scale(${escala})">
      <path d="M-34 0 L34 0 L26 11 L-26 11 Z" fill="${c.hierro}"/>
      <rect x="-10" y="-13" width="20" height="13" fill="${c.hierroSuave}"/>
      <rect x="-5" y="-22" width="4" height="9" fill="${c.hierro}"/>
      <rect x="-8" y="-9" width="6" height="4" fill="${c.luz}" opacity=".9"/>
    </g>
  </g>`;
  return casco(1, 0.95, 'barco1', AGUA + 6) + casco(0.62, 0.55, 'barco2', AGUA + 30);
}

// Gulls: a "V" that flaps while it crosses the sky.
function gaviotas(c) {
  const ave = (clase, y, escala) => `<g class="vuelo ${clase}"><g transform="translate(0 ${y}) scale(${escala})"><path class="ala" d="M-12 0 Q-6 -7 0 0 Q6 -7 12 0" fill="none" stroke="${c.texto}" stroke-width="2" stroke-linecap="round" opacity=".8"/></g></g>`;
  return ave("v1", 56, 1.5) + ave("v2", 118, 1.15) + ave("v3", 30, 0.95);
}

// A low sun setting into the ría between the two towers, with a slow glow and its
// reflection flickering on the water. It is drawn before the water, which hides its lower half.
function astro(c) {
  const x = 790, y = 286;
  const reflejo = [0, 1, 2, 3, 4].map((i) => `<rect class="reflejo r${i % 4}" x="${x - 34 + i * 4}" y="${AGUA + 8 + i * 12}" width="${68 - i * 8}" height="3" rx="1.5" fill="${c.naranja}"/>`).join('');
  return `<circle class="halo" cx="${x}" cy="${y}" r="120" fill="url(#brillo)"/>
  <circle cx="${x}" cy="${y}" r="34" fill="${c.luz}"/>
  ${reflejo}`;
}

function banner(nombre, c) {
  const viajeIni = 0, viajeFin = TORRE_DER - TORRE_IZQ - 150; // how far the gondola travels
  const inicioX = TORRE_IZQ + 75;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">Xabier, desarrollo de software a medida desde Bilbao</title>
  <desc id="d">Ilustración del Puente Colgante de Bizkaia: una góndola cruza la ría de un lado a otro colgada de la viga superior.</desc>
  <defs>
    <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.cieloArriba}"/>
      <stop offset=".58" stop-color="${c.cieloMedio}"/>
      <stop offset="1" stop-color="${c.horizonte}"/>
    </linearGradient>
    <radialGradient id="brillo">
      <stop offset="0" stop-color="${c.naranja}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${c.naranja}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rio" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.naranja}" stop-opacity=".35"/>
      <stop offset="1" stop-color="${c.agua}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    .nombre { font: 700 64px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.texto}; letter-spacing: -1px; }
    .linea  { font: 400 24px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.texto}; }
    .lugar  { font: 400 17px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.texto}; opacity: .85; }
    .gondola { animation: cruzar 16s infinite; }
    .luz { animation: parpadeo 4s ease-in-out infinite; }
    .onda { animation: mecer 9s ease-in-out infinite alternate; }
    .o1 { animation-duration: 11s; animation-direction: alternate-reverse; }
    .est { animation: brillo 5s ease-in-out infinite; }
    .e1 { animation-delay: 1.4s; } .e2 { animation-delay: 3s; }
    @keyframes cruzar {
      0%, 7%   { transform: translateX(${inicioX}px); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      46%, 54% { transform: translateX(${inicioX + viajeFin - viajeIni}px); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      93%, 100% { transform: translateX(${inicioX}px); }
    }
    .baliza { animation: baliza 2.4s ease-in-out infinite; }
    .b2 { animation-delay: 1.2s; }
    .barco1 { animation: ir 46s linear infinite; }
    .barco2 { animation: volver 74s linear infinite; animation-delay: -30s; }
    .vuelo { animation: volar 26s linear infinite; }
    .v2 { animation-duration: 34s; animation-delay: -11s; }
    .v3 { animation-duration: 41s; animation-delay: -24s; }
    .ala { transform-box: fill-box; transform-origin: 50% 100%; animation: aleteo .9s ease-in-out infinite alternate; }
    .v2 .ala { animation-duration: 1.2s; } .v3 .ala { animation-duration: 1.05s; }
    .halo { animation: halo 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .reflejo { animation: reflejo 3.2s ease-in-out infinite; }
    .r1 { animation-delay: .5s; } .r2 { animation-delay: 1.1s; } .r3 { animation-delay: 1.7s; }
    .frase { opacity: 0; animation: frase 15s ease-in-out infinite; }
    .f2 { animation-delay: 5s; } .f3 { animation-delay: 10s; }
    @keyframes cruzar {
      0%, 7%   { transform: translateX(${inicioX}px); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      46%, 54% { transform: translateX(${inicioX + viajeFin - viajeIni}px); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      93%, 100% { transform: translateX(${inicioX}px); }
    }
    @keyframes parpadeo { 0%, 100% { opacity: 1; } 50% { opacity: .65; } }
    @keyframes mecer { from { transform: translateX(0); } to { transform: translateX(-60px); } }
    @keyframes brillo { 0%, 100% { opacity: .9; } 50% { opacity: .25; } }
    @keyframes baliza { 0%, 55%, 100% { opacity: .15; } 15%, 40% { opacity: 1; } }
    @keyframes ir { from { transform: translateX(-90px); } to { transform: translateX(${W + 90}px); } }
    @keyframes volver { from { transform: translateX(${W + 90}px); } to { transform: translateX(-90px); } }
    @keyframes volar { from { transform: translateX(-40px); } to { transform: translateX(${W + 40}px); } }
    @keyframes aleteo { from { transform: scaleY(1); } to { transform: scaleY(-.55); } }
    @keyframes halo { 0%, 100% { transform: scale(1); opacity: .14; } 50% { transform: scale(1.35); opacity: .06; } }
    @keyframes reflejo { 0%, 100% { opacity: .55; } 50% { opacity: .12; } }
    @keyframes frase { 0% { opacity: 0; } 4%, 29% { opacity: 1; } 33%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .gondola, .luz, .onda, .est, .baliza, .barco1, .barco2, .vuelo, .ala, .halo, .reflejo, .frase { animation: none; }
      .gondola { transform: translateX(${inicioX + 200}px); }
      .barco1 { transform: translateX(300px); } .barco2 { transform: translateX(900px); }
      .vuelo { display: none; }
      .f1 { opacity: 1; }
    }
  </style>

  <rect width="${W}" height="${AGUA}" fill="url(#cielo)"/>
  ${estrellas(c)}
  ${astro(c)}
  ${gaviotas(c)}
  <rect y="${AGUA}" width="${W}" height="${H - AGUA}" fill="${c.agua}"/>
  <rect y="${AGUA}" width="${W}" height="${H - AGUA}" fill="url(#rio)"/>
  ${ondas(c)}
  ${barcos(c)}

  <g stroke="${c.hierro}" stroke-width="2.2" fill="none">${torre(TORRE_IZQ, c)}${torre(TORRE_DER, c)}</g>
  ${tirantes(c)}
  ${vigaCeloso(TORRE_IZQ - 26 - 4 * 38, TORRE_DER + 26 + 4 * 38, c)}
  ${balizas(c)}
  ${gondola(c)}

  <text class="nombre" x="64" y="168">Xabier</text>
  <text class="linea frase f1" x="66" y="212">Software de gestión a medida</text>
  <text class="linea frase f2" x="66" y="212">Laravel, Filament y .NET</text>
  <text class="linea frase f3" x="66" y="212">Del código al servidor</text>
  <text class="lugar" x="66" y="246">Bilbao</text>
</svg>
`;
}

// A strip of technology tiles, each with the real logo in its own brand colour, that scrolls
// sideways forever and fades out at both ends. The logos are the Simple Icons set (CC0),
// kept as files in tools/iconos so nothing is requested from anywhere when the profile loads.
const TECNOLOGIAS = [
  { n: 'PHP', s: 'php', claro: '#777bb4', oscuro: '#b4b8f2' },
  { n: 'Laravel', s: 'laravel', claro: '#ff2d20', oscuro: '#ff5a4e' },
  { n: 'Filament', s: 'filament', claro: '#e89a1f', oscuro: '#fdae4b' },
  { n: 'C#', s: 'csharp', claro: '#9b4f96', oscuro: '#c77bc2' },
  { n: '.NET', s: 'dotnet', claro: '#512bd4', oscuro: '#8d6bff' },
  { n: 'MariaDB', s: 'mariadb', claro: '#0f6e8c', oscuro: '#5bc0d6' },
  { n: 'MySQL', s: 'mysql', claro: '#4479a1', oscuro: '#6fa3c9' },
  { n: 'Redis', s: 'redis', claro: '#ff4438', oscuro: '#ff4438' },
  { n: 'Livewire', s: 'livewire', claro: '#4e56a6', oscuro: '#8991e8' },
  { n: 'Alpine.js', s: 'alpinedotjs', claro: '#3f97ae', oscuro: '#8bc0d0' },
  { n: 'Tailwind CSS', s: 'tailwindcss', claro: '#0891b2', oscuro: '#06b6d4' },
  { n: 'Docker', s: 'docker', claro: '#2496ed', oscuro: '#2496ed' },
  { n: 'Coolify', s: 'coolify', claro: '#6b16ed', oscuro: '#a66bff' },
  { n: 'Linux', s: 'linux', claro: '#d4a100', oscuro: '#fcc624' },
  { n: 'GitHub Actions', s: 'githubactions', claro: '#2088ff', oscuro: '#2088ff' },
];

const trazoIcono = (slug) => readFileSync(new URL(`./iconos/${slug}.svg`, import.meta.url), 'utf8').match(/<path d="([^"]+)"/)[1];

function cinta(c, tema, W = ANCHO) {
  const alto = 92, hueco = 10;
  const fichas = [];
  let x = 0;
  for (const t of TECNOLOGIAS) {
    const color = tema === 'dark' ? t.oscuro : t.claro;
    const ancho = Math.max(72, Math.round(t.n.length * 7.6 + 18));
    fichas.push(`<g transform="translate(${x} 4)">
      <rect x="${ancho / 2 - 28}" y="0" width="56" height="56" rx="15" fill="${color}" fill-opacity=".24" stroke="${color}" stroke-opacity=".75" stroke-width="1.4"/>
      <g transform="translate(${ancho / 2 - 15} 13) scale(1.25)" fill="${color}"><path d="${trazoIcono(t.s)}"/></g>
      <text class="nom" x="${ancho / 2}" y="76" text-anchor="middle">${esc(t.n)}</text>
    </g>`);
    x += ancho + hueco;
  }
  const largo = x; // one full set; the second copy follows it so the loop has no seam
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${alto}" width="${W}" height="${alto}" role="img" aria-label="Tecnologías: ${TECNOLOGIAS.map((t) => t.n).join(', ')}">
  <defs>
    <linearGradient id="borde" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".07" stop-color="#fff" stop-opacity="1"/>
      <stop offset=".93" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="m"><rect width="${W}" height="${alto}" fill="url(#borde)"/></mask>
  </defs>
  <style>
    .nom { font: 500 13px ${FUENTE}; fill: ${c.textoSuave}; }
    .cinta { animation: desfilar 60s linear infinite; }
    @keyframes desfilar { from { transform: translateX(0); } to { transform: translateX(-${largo}px); } }
    @media (prefers-reduced-motion: reduce) { .cinta { animation: none; } }
  </style>
  <g mask="url(#m)">
    <g class="cinta">${fichas.join('')}<g transform="translate(${largo} 0)">${fichas.join('')}</g></g>
  </g>
</svg>
`;
}

// A terminal card that types its own lines, one after another, and repeats. Every line
// is clipped by a rectangle that grows in as many steps as the line has characters, and
// textLength pins each line to exactly that width whatever monospace font the viewer has.
const LINEAS_TERMINAL = [
  { prompt: true, texto: 'whoami' },
  { texto: 'Xabier, software de gestión a medida en Bilbao' },
  { prompt: true, texto: 'ls aplicaciones/' },
  { texto: 'multiempresa/   apis/   produccion/' },
  { prompt: true, texto: 'docker compose up -d' },
  { texto: '✔ todo en marcha', ok: true },
];

function terminal(c) {
  const anchoCar = 9.7, margen = 28, filaY = 44, paso = 34;
  const total = 22; // seconds for one full loop
  const seg = (s) => ((s / total) * 100).toFixed(2);
  let t = 1.2;
  const bloques = LINEAS_TERMINAL.map((l, i) => {
    const texto = (l.prompt ? '$ ' : '') + l.texto;
    const n = [...texto].length;
    const dur = Math.max(0.5, n * 0.06);
    const inicio = t;
    t += dur + (l.prompt ? 0.5 : 1.1);
    return { ...l, texto, n, inicio, dur, y: filaY + i * paso };
  });
  const fin = t;
  const css = bloques.map((b, i) => `
    .tipo${i} { animation: escribir${i} ${total}s infinite; }
    @keyframes escribir${i} {
      0%, ${seg(b.inicio)}% { width: 0; animation-timing-function: steps(${b.n}, end); }
      ${seg(b.inicio + b.dur)}%, ${seg(total - 2.5)}% { width: ${b.n * anchoCar}px; }
      ${seg(total - 1.8)}%, 100% { width: 0; }
    }`).join('');
  const lineas = bloques.map((b, i) => {
    const contenido = b.prompt
      ? `<tspan fill="${c.verde}">$</tspan><tspan fill="${c.texto}"> ${b.texto.slice(2)}</tspan>`
      : `<tspan fill="${b.ok ? c.verde : c.texto}">${b.texto}</tspan>`;
    return `<clipPath id="c${i}"><rect class="tipo${i}" x="${margen}" y="${b.y - 20}" width="0" height="28"/></clipPath>
    <text class="term" clip-path="url(#c${i})" x="${margen}" y="${b.y}" textLength="${b.n * anchoCar}" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${contenido}</text>`;
  }).join('\n    ');
  const alto = filaY + LINEAS_TERMINAL.length * paso - 4;
  const cursor = `<g class="cursorgrupo"><rect class="cursor" x="${margen + LINEAS_TERMINAL.at(-1).texto.length * anchoCar + 8}" y="${filaY + (LINEAS_TERMINAL.length - 1) * paso - 15}" width="9" height="19" fill="${c.verde}"/></g>`;
  return enmarcar({
    titulo: 'xabier@bilbao: ~/trabajo',
    descripcion: 'Terminal con tres comandos: whoami, que responde Xabier, software de gestión a medida en Bilbao; ls aplicaciones, con multiempresa, apis y produccion; y docker compose up, con todo en marcha.',
    alto,
    defs: '',
    estilos: `
    .term { font: 500 16px ${MONO}; }
    .cursor { animation: cursor 1.05s steps(1) infinite; }
    .cursorgrupo { animation: aparece ${total}s infinite; }
    @keyframes aparece { 0%, ${seg(fin - 0.2)}% { opacity: 0; } ${seg(fin)}%, ${seg(total - 2.5)}% { opacity: 1; } ${seg(total - 1.8)}%, 100% { opacity: 0; } }
    ${css}
    @keyframes cursor { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      ${bloques.map((b, i) => `.tipo${i}`).join(', ')} { animation: none; }
      ${bloques.map((b, i) => `.tipo${i} { width: ${b.n * anchoCar}px; }`).join(' ')}
      .cursor, .cursorgrupo { animation: none; }
    }`,
    cuerpo: `${lineas}\n    ${cursor}`,
  }, c);
}

// ── One container per block ──────────────────────────────────────────────────────────────
// They share palette, typefaces, the amber lamp and the steel line work (see marco.mjs),
// but each wears its own shape: a window, a plate with a girder at its side, three pillars,
// a truss rail, corner marks.

const MARGEN = 28;

// Introduction: no box. A tinted plate with a girder running down its left side.
function bloquePresentacion(c) {
  const texto = 'Hago aplicaciones de gestión a medida para empresas, desde la base de datos hasta el servidor donde se ejecutan.';
  const lineas = partir(texto, 78);
  const alto = 58 + lineas.length * 34 + 22;
  const trazos = lineas.map((l, i) => `<text class="grande" x="56" y="${74 + i * 34}">${esc(l)}</text>`).join('\n  ');
  const celosiaLateral = [];
  for (let y = 0; y < alto; y += 14) {
    const par = (y / 14) % 2 === 0;
    celosiaLateral.push(`<line x1="${par ? 8 : 22}" y1="${y}" x2="${par ? 22 : 8}" y2="${Math.min(y + 14, alto)}"/>`);
  }
  return lienzo({
    titulo: 'xabier@bilbao: ~/presentacion',
    descripcion: texto,
    alto,
    estilos: `.grande { font: 400 22px ${FUENTE}; fill: ${c.texto}; }`,
    cuerpo: `<rect width="${ANCHO}" height="${alto}" rx="6" fill="${c.cieloArriba}"/>
  <g stroke="${c.naranja}" stroke-width="1.3" opacity=".75">${celosiaLateral.join('')}</g>
  <line x1="8" y1="0" x2="8" y2="${alto}" stroke="${c.naranja}" stroke-width="2.6"/>
  <line x1="22" y1="0" x2="22" y2="${alto}" stroke="${c.naranja}" stroke-width="2.6"/>
  ${etiqueta('xabier@bilbao: ~/presentacion', 56, 34, c)}
  ${trazos}`,
  }, c);
}

// What he builds: three pillars side by side, each with a deck beam on top and a small drawing.
const ICONOS = {
  web: (c, k) => `<g stroke="${k}" stroke-width="2" fill="none" stroke-linejoin="round">
      <rect x="0" y="0" width="44" height="34" rx="4"/><line x1="0" y1="9" x2="44" y2="9"/>
      <circle cx="6" cy="4.5" r="1" fill="${k}"/><circle cx="11" cy="4.5" r="1" fill="${k}"/>
      <line x1="8" y1="18" x2="26" y2="18"/><line x1="8" y1="25" x2="36" y2="25"/></g>`,
  api: (c, k) => `<g stroke="${k}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2 C6 2 8 14 2 17 C8 20 6 32 13 32"/><path d="M31 2 C38 2 36 14 42 17 C36 20 38 32 31 32"/></g>
      <circle cx="22" cy="17" r="2.6" fill="${c.luz}"/>`,
  servidor: (c, k) => `<g stroke="${k}" stroke-width="2" fill="none" stroke-linejoin="round">
      <rect x="0" y="0" width="44" height="14" rx="3"/><rect x="0" y="20" width="44" height="14" rx="3"/></g>
      <circle cx="9" cy="7" r="2" fill="${c.luz}"/><circle cx="9" cy="27" r="2" fill="${c.luz}"/>
      <line x1="20" y1="7" x2="36" y2="7" stroke="${k}" stroke-width="2"/><line x1="20" y1="27" x2="36" y2="27" stroke="${k}" stroke-width="2"/>`,
};

function bloqueConstruyo(c) {
  const columnas = [
    { icono: 'web', titulo: 'Aplicaciones web', texto: 'Para varias empresas a la vez, cada una con su propia base de datos y su propio dominio. Con Laravel y Filament.' },
    { icono: 'api', titulo: 'Servicios y APIs', texto: 'Con .NET.' },
    { icono: 'servidor', titulo: 'En producción', texto: 'Docker en servidor propio, HTTPS, copias de seguridad y despliegue automático desde GitHub.' },
  ];
  const hueco = 24, ancho = (ANCHO - 2 * hueco) / 3, alto = 214;
  const acentos = [c.naranja, c.verde, c.violeta];
  const tarjetas = columnas.map((col, i) => {
    const x = i * (ancho + hueco);
    const lineas = partir(col.texto, 32);
    const k = acentos[i];
    const texto = lineas.map((l, j) => `<text class="cuerpo" x="22" y="${132 + j * 22}">${esc(l)}</text>`).join('');
    return `<g transform="translate(${x} 0)">
    <rect x=".75" y=".75" width="${ancho - 1.5}" height="${alto - 1.5}" rx="5" fill="${c.cieloArriba}" stroke="${k}" stroke-opacity=".55" stroke-width="1.5"/>
    <rect x="0" y="0" width="${ancho}" height="7" rx="3" fill="${k}"/>
    <circle cx="${ancho - 20}" cy="3.5" r="2.2" fill="${c.luz}"/>
    <g transform="translate(22 30)">${ICONOS[col.icono](c, k)}</g>
    <text class="titulo" x="22" y="106">${esc(col.titulo)}</text>
    ${texto}
  </g>`;
  }).join('\n  ');
  return lienzo({
    titulo: 'xabier@bilbao: ~/lo-que-construyo',
    descripcion: 'Lo que construyo: aplicaciones web para varias empresas a la vez, con Laravel y Filament; servicios y APIs con .NET; y la puesta en producción con Docker en servidor propio, HTTPS, copias de seguridad y despliegue automático desde GitHub.',
    alto,
    estilos: `.titulo { font: 600 19px ${FUENTE}; fill: ${c.texto}; } .cuerpo { font: 400 15px ${FUENTE}; fill: ${c.textoSuave}; }`,
    cuerpo: tarjetas,
  }, c);
}

// Technologies: no box either. A truss rail above and below, the strip and the rows between.
const CATEGORIAS = [
  ['Backend', 'PHP, Laravel, Filament, C#, .NET'],
  ['Datos', 'MariaDB, MySQL, Redis'],
  ['Interfaz', 'Livewire, Alpine.js, Tailwind CSS'],
  ['Servidores', 'Linux, Docker, Coolify, GitHub Actions'],
];

function bloqueTecnologias(nombre, c) {
  const tira = desmontar(cinta(c, nombre, ANCHO));
  const filaBase = 190;
  const acentos = [c.naranja, c.verde, c.violeta, c.rosa];
  const filas = CATEGORIAS.map(([etq, items], i) => `
  <text class="etiqueta" x="${MARGEN}" y="${filaBase + i * 30}" fill="${acentos[i]}">${esc(etq)}</text>
  <text class="texto" x="${MARGEN + 120}" y="${filaBase + i * 30}">${esc(items)}</text>`).join('');
  const alto = filaBase + CATEGORIAS.length * 30 + 4;
  return lienzo({
    titulo: 'xabier@bilbao: ~/tecnologias',
    descripcion: 'Con qué trabajo. ' + CATEGORIAS.map(([e, i]) => `${e}: ${i}.`).join(' '),
    alto,
    defs: tira.defs,
    estilos: `${tira.estilos}
    .texto { font: 400 17px ${FUENTE}; fill: ${c.texto}; }
    .etiqueta { font: 700 17px ${FUENTE}; }`,
    cuerpo: `${celosia(0, ANCHO, 2, c, 12, 14, c.violeta)}
  ${etiqueta('xabier@bilbao: ~/tecnologias', MARGEN, 44, c)}
  <g transform="translate(0 62)">${tira.dibujo}</g>
  ${filas}
  ${celosia(0, ANCHO, alto - 14, c, 12, 14, c.violeta)}`,
  }, c);
}

function bloqueBanner(nombre, c) {
  const escena = desmontar(banner(nombre, c));
  const escala = ANCHO / W; // the 1200x360 drawing is shown at the profile's width
  const alto = Math.round(H * escala);
  return enmarcar({
    titulo: 'xabier@bilbao: ~',
    descripcion: 'Xabier, software de gestión a medida desde Bilbao. Ilustración del Puente Colgante de Bizkaia con una góndola que cruza la ría de un lado a otro.',
    barra: false,
    alto,
    defs: escena.defs,
    estilos: escena.estilos,
    cuerpo: `<svg x="0" y="0" width="${ANCHO}" height="${alto}" viewBox="0 0 ${W} ${H}">${escena.dibujo}</svg>`,
  }, c);
}

mkdirSync('assets', { recursive: true });
const salida = {
  banner: (n, c) => bloqueBanner(n, c),
  presentacion: (n, c) => bloquePresentacion(c),
  terminal: (n, c) => terminal(c),
  construyo: (n, c) => bloqueConstruyo(c),
  tecnologias: (n, c) => bloqueTecnologias(n, c),
};

for (const [nombre, c] of Object.entries(paletas)) {
  for (const [bloque, dibujar] of Object.entries(salida)) {
    writeFileSync(`assets/${bloque}-${nombre}.svg`, dibujar(nombre, c));
  }
}
console.log('listo: assets/{banner,presentacion,terminal,construyo,tecnologias}-{dark,light}.svg');
