// What the blocks of the profile share, so they read as one family without being copies:
// the palette, the typefaces, the amber lamp, the steel line work and the same 960 width.
// Each block then gets its own container (see generar-banner.mjs): a window, a plate with a
// girder along its side, three pillars, a truss rail, corner marks.
export const ANCHO = 960;
export const BARRA = 44;

export const paletas = {
  // Dusk over the ría: an aubergine ink, a cream text and four accents taken from Bilbao's
  // iron and water (red-lead orange, ría green, violet, rose). Each block leans on one of them.
  dark: {
    cieloArriba: '#15111f', cieloMedio: '#4a2068', horizonte: '#ff7a3d', cieloAbajo: '#4a2068',
    agua: '#1c1226', ondas: '#8a4a6a',
    hierro: '#ece4f7', hierroSuave: '#7d6f9b', luz: '#ffc857',
    texto: '#f6f1e7', textoSuave: '#b9aed0', estrellas: '#ffe9c7',
    naranja: '#ff7a3d', verde: '#2ec4a6', violeta: '#a58bff', rosa: '#ff5c8a',
  },
  light: {
    cieloArriba: '#fff4e2', cieloMedio: '#ffd9a8', horizonte: '#ffa35c', cieloAbajo: '#ffd9a8',
    agua: '#8fd8cc', ondas: '#3fae9f',
    hierro: '#2b2340', hierroSuave: '#8c7fa8', luz: '#f59e0b',
    texto: '#1f1a2b', textoSuave: '#5c5273', estrellas: '#ffffff',
    naranja: '#e4570f', verde: '#0e9f83', violeta: '#6d3fd1', rosa: '#d1305e',
  },
};

export const FUENTE = "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'Cascadia Mono', 'SF Mono', Consolas, Menlo, 'DejaVu Sans Mono', monospace";

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Splits text into lines of at most `max` characters, never cutting a word.
 */
export function partir(texto, max) {
  const lineas = [];
  let actual = '';
  for (const palabra of texto.split(/\s+/)) {
    if ((actual + ' ' + palabra).trim().length > max) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = (actual + ' ' + palabra).trim();
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** The small mono label every block carries: the amber lamp and a path-like name. */
export function etiqueta(texto, x, y, c) {
  return `<circle cx="${x + 4}" cy="${y - 4.5}" r="3.6" fill="${c.luz}"/>
    <text class="etq" x="${x + 16}" y="${y}">${esc(texto)}</text>`;
}

export const estiloEtiqueta = (c) => `.etq { font: 500 13px ${MONO}; fill: ${c.textoSuave}; }`;

/** A strip of girder: two rails with the zigzag of a truss between them, like the bridge deck. */
export function celosia(x1, x2, y, c, alto = 12, paso = 14, rail = c.hierro) {
  const zigzag = [];
  for (let x = x1, i = 0; x < x2; x += paso, i++) {
    const fin = Math.min(x + paso, x2);
    zigzag.push(`<line x1="${x}" y1="${i % 2 ? y + alto : y}" x2="${fin}" y2="${i % 2 ? y : y + alto}"/>`);
  }
  return `<g stroke="${c.hierroSuave}" stroke-width="1.2" fill="none">
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${rail}" stroke-width="2.4"/>
    <line x1="${x1}" y1="${y + alto}" x2="${x2}" y2="${y + alto}" stroke="${rail}" stroke-width="2.4"/>
    ${zigzag.join('')}
  </g>`;
}

/** Four corner marks instead of a full border, like the survey marks on a plan. */
export function esquinas(ancho, alto, c, largo = 26, grosor = 2.6, color = c.hierro) {
  const m = 1.5;
  const l = largo;
  return `<g stroke="${color}" stroke-width="${grosor}" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M${m} ${m + l} V${m} H${m + l}"/>
    <path d="M${ancho - m - l} ${m} H${ancho - m} V${m + l}"/>
    <path d="M${m} ${alto - m - l} V${alto - m} H${m + l}"/>
    <path d="M${ancho - m - l} ${alto - m} H${ancho - m} V${alto - m - l}"/>
  </g>`;
}

/** Wraps a drawing in an <svg> of the profile's width, with the shared label style. */
export function lienzo({ alto, descripcion, titulo, cuerpo, defs = '', estilos = '' }, c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${alto}" width="${ANCHO}" height="${alto}" role="img" aria-label="${esc(descripcion)}">
  <title>${esc(titulo)}</title>
  <defs>${defs}</defs>
  <style>
    ${estiloEtiqueta(c)}
    ${estilos}
  </style>
  ${cuerpo}
</svg>
`;
}

/**
 * The window frame (rounded border and a title bar with the lamp), used by the banner and
 * the terminal. With `barra: false` it is just the rounded border.
 *
 * @param alto     height of the content area (below the title bar, if there is one)
 * @param cuerpo   SVG elements, drawn with their origin at the top-left of the content area
 */
export function enmarcar({ titulo, descripcion, alto, cuerpo, defs = '', estilos = '', barra = true }, c) {
  const cabecera = barra ? BARRA : 0;
  const total = cabecera + alto;
  const titular = barra
    ? `<line x1="0" y1="${BARRA}" x2="${ANCHO}" y2="${BARRA}" stroke="${c.hierroSuave}" stroke-width="1" opacity=".6"/>`
    : '';
  const rotulo = barra ? etiqueta(titulo, 26, BARRA / 2 + 4.5, c) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${total}" width="${ANCHO}" height="${total}" role="img" aria-label="${esc(descripcion)}">
  <title>${esc(titulo)}</title>
  <defs>
    <clipPath id="marco"><rect width="${ANCHO}" height="${total}" rx="12"/></clipPath>
    ${defs}
  </defs>
  <style>
    ${estiloEtiqueta(c)}
    ${estilos}
  </style>
  <g clip-path="url(#marco)">
    <rect width="${ANCHO}" height="${total}" fill="${c.cieloArriba}"/>
    <g transform="translate(0 ${cabecera})">${cuerpo}</g>
    ${titular}
  </g>
  ${rotulo}
  <rect x=".75" y=".75" width="${ANCHO - 1.5}" height="${total - 1.5}" rx="12" fill="none" stroke="${c.hierroSuave}" stroke-width="1.5"/>
</svg>
`;
}

/**
 * Pulls the <defs>, <style> and drawing out of a finished <svg> string so it can be nested
 * inside another drawing as a smaller <svg>.
 */
export function desmontar(svg) {
  const defs = (svg.match(/<defs>([\s\S]*?)<\/defs>/) ?? [, ''])[1];
  const estilos = (svg.match(/<style>([\s\S]*?)<\/style>/) ?? [, ''])[1];
  const dibujo = svg.slice(svg.indexOf('</style>') + '</style>'.length, svg.lastIndexOf('</svg>'));
  return { defs, estilos, dibujo };
}
