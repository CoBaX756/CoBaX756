// Generates the two profile banners (dark and light) from one drawing.
// Subject: the Vizcaya Bridge (Puente Colgante) in Bizkaia, a transporter bridge whose gondola
// carries people and vehicles across the ría. It is a bridge that *transports*, which is
// what Xabier's software does for the companies he builds it for.
import { writeFileSync, mkdirSync } from 'node:fs';

const paletas = {
  dark: {
    cieloArriba: '#0b1720', cieloAbajo: '#17303f', agua: '#0a141b', ondas: '#21404f',
    hierro: '#86a9c0', hierroSuave: '#4f7189', luz: '#e9c46a',
    texto: '#e8f0f4', textoSuave: '#93b3c7', estrellas: '#cfe1ec',
  },
  light: {
    cieloArriba: '#e9f1f5', cieloAbajo: '#d3e2ea', agua: '#b9cfda', ondas: '#9fbccb',
    hierro: '#2d4a5e', hierroSuave: '#6b8a9d', luz: '#a8731a',
    texto: '#0e1b24', textoSuave: '#456375', estrellas: '#ffffff',
  },
};

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

// Moon at night, sun by day, with a slow glow and a flicker of its reflection on the water.
function astro(esOscuro, c) {
  const x = 880, y = 40;
  const reflejo = [0, 1, 2, 3].map((i) => `<rect class="reflejo r${i}" x="${x - 18 + i * 3}" y="${AGUA + 10 + i * 14}" width="${36 - i * 6}" height="2" rx="1" fill="${c.luz}"/>`).join('');
  return `<circle class="halo" cx="${x}" cy="${y}" r="46" fill="url(#brillo)"/>
  <circle cx="${x}" cy="${y}" r="${esOscuro ? 13 : 15}" fill="${c.luz}"/>
  ${esOscuro ? `<circle cx="${x + 5}" cy="${y - 3}" r="11" fill="${c.cieloArriba}"/>` : ''}
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
      <stop offset="1" stop-color="${c.cieloAbajo}"/>
    </linearGradient>
    <radialGradient id="brillo">
      <stop offset="0" stop-color="${c.luz}" stop-opacity=".38"/>
      <stop offset="1" stop-color="${c.luz}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    .nombre { font: 700 64px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.texto}; letter-spacing: -1px; }
    .linea  { font: 400 24px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.texto}; }
    .lugar  { font: 400 17px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.textoSuave}; }
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
  ${astro(nombre === 'dark', c)}
  ${gaviotas(c)}
  <rect y="${AGUA}" width="${W}" height="${H - AGUA}" fill="${c.agua}"/>
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

// A strip of technology names that scrolls sideways forever, fading out at both ends.
const TECNOLOGIAS = ['PHP', 'Laravel', 'Filament', 'C#', '.NET', 'MariaDB', 'MySQL', 'Redis', 'Livewire', 'Alpine.js', 'Tailwind CSS', 'Docker', 'Coolify', 'Linux', 'GitHub Actions'];

function cinta(nombre, c) {
  const alto = 52, hueco = 12, anchoCar = 8.6;
  const pastillas = [];
  let x = 0;
  for (const t of TECNOLOGIAS) {
    const ancho = Math.round(t.length * anchoCar + 34);
    pastillas.push(`<g transform="translate(${x} 8)"><rect width="${ancho}" height="34" rx="17" fill="none" stroke="${c.hierroSuave}" stroke-width="1.4"/><text x="${ancho / 2}" y="22.5" text-anchor="middle">${t}</text></g>`);
    x += ancho + hueco;
  }
  const largo = x; // one full set; the second copy follows it so the loop has no seam
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${alto}" width="${W}" height="${alto}" role="img" aria-label="Tecnologías: ${TECNOLOGIAS.join(', ')}">
  <defs>
    <linearGradient id="borde" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".08" stop-color="#fff" stop-opacity="1"/>
      <stop offset=".92" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="m"><rect width="${W}" height="${alto}" fill="url(#borde)"/></mask>
  </defs>
  <style>
    text { font: 500 15px 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif; fill: ${c.texto}; }
    .cinta { animation: desfilar 48s linear infinite; }
    @keyframes desfilar { from { transform: translateX(0); } to { transform: translateX(-${largo}px); } }
    @media (prefers-reduced-motion: reduce) { .cinta { animation: none; } }
  </style>
  <g mask="url(#m)">
    <g class="cinta">${pastillas.join('')}<g transform="translate(${largo} 0)">${pastillas.join('')}</g></g>
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
  const ancho = 960, anchoCar = 9.7, margen = 28, filaY = 84, alto = 34;
  const total = 22; // seconds for one full loop
  const seg = (s) => ((s / total) * 100).toFixed(2);
  let t = 1.2;
  const bloques = LINEAS_TERMINAL.map((l, i) => {
    const texto = (l.prompt ? '$ ' : '') + l.texto;
    const n = [...texto].length;
    const dur = Math.max(0.5, n * 0.06);
    const inicio = t;
    t += dur + (l.prompt ? 0.5 : 1.1);
    return { ...l, texto, n, inicio, dur, y: filaY + i * alto };
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
    const x = margen;
    const relleno = b.ok ? c.hierro : c.texto;
    const prompt = b.prompt ? `<tspan fill="${c.luz}">$</tspan><tspan fill="${c.texto}"> ${b.texto.slice(2)}</tspan>` : `<tspan fill="${relleno}">${b.texto}</tspan>`;
    return `<clipPath id="c${i}"><rect class="tipo${i}" x="${x}" y="${b.y - 20}" width="0" height="28"/></clipPath>
    <text clip-path="url(#c${i})" x="${x}" y="${b.y}" textLength="${b.n * anchoCar}" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${prompt}</text>`;
  }).join('\n    ');
  const cursorX = margen + 0;
  const altoTotal = filaY + LINEAS_TERMINAL.length * alto + 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${altoTotal}" width="${ancho}" height="${altoTotal}" role="img" aria-label="Terminal con tres comandos: whoami, que responde Xabier, software de gestión a medida en Bilbao; ls aplicaciones, con multiempresa, apis y produccion; y docker compose up, con todo en marcha.">
  <style>
    text { font: 500 16px 'Cascadia Mono', 'SF Mono', Consolas, Menlo, 'DejaVu Sans Mono', monospace; }
    .titulo { font: 500 13px 'Segoe UI', system-ui, sans-serif; fill: ${c.textoSuave}; }
    .cursor { animation: cursor 1.05s steps(1) infinite; }
    .cursorgrupo { animation: aparece ${total}s infinite; }
    @keyframes aparece { 0%, ${seg(fin - 0.2)}% { opacity: 0; } ${seg(fin)}%, ${seg(total - 2.5)}% { opacity: 1; } ${seg(total - 1.8)}%, 100% { opacity: 0; } }
    ${css}
    @keyframes cursor { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      ${bloques.map((b, i) => `.tipo${i}`).join(', ')} { animation: none; }
      ${bloques.map((b, i) => `.tipo${i} { width: ${b.n * anchoCar}px; }`).join(' ')}
      .cursor, .cursorgrupo { animation: none; }
    }
  </style>
  <rect x=".75" y=".75" width="${ancho - 1.5}" height="${altoTotal - 1.5}" rx="12" fill="${c.cieloArriba}" stroke="${c.hierroSuave}" stroke-width="1.5"/>
  <line x1=".75" y1="44" x2="${ancho - .75}" y2="44" stroke="${c.hierroSuave}" stroke-width="1" opacity=".6"/>
  <text class="titulo" x="${margen}" y="28" style="font-family: 'Segoe UI', system-ui, sans-serif; font-size: 13px; fill: ${c.textoSuave}">xabier@bilbao: ~/trabajo</text>
  <g>
    ${lineas}
  </g>
  <g class="cursorgrupo"><rect class="cursor" x="${margen + (LINEAS_TERMINAL.at(-1).texto.length) * anchoCar + 8}" y="${filaY + (LINEAS_TERMINAL.length - 1) * alto - 15}" width="9" height="19" fill="${c.luz}"/></g>
</svg>
`;
}

mkdirSync('assets', { recursive: true }); // run from the repo root: node tools/generar-banner.mjs
for (const [nombre, c] of Object.entries(paletas)) {
  writeFileSync(`assets/banner-${nombre}.svg`, banner(nombre, c));
  writeFileSync(`assets/tecnologias-${nombre}.svg`, cinta(nombre, c));
  writeFileSync(`assets/terminal-${nombre}.svg`, terminal(c));
}
console.log('listo: assets/banner-*.svg, assets/tecnologias-*.svg y assets/terminal-*.svg');
