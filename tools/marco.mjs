// The one frame every block of the profile is drawn in, so they all read as one family:
// same width, same rounded border, same title bar with the amber lamp, same palette.
export const ANCHO = 960;
export const BARRA = 44;

export const paletas = {
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

/**
 * @param titulo       text in the title bar, e.g. "xabier@bilbao: ~/trabajo"
 * @param descripcion  what a screen reader should say for the whole block
 * @param alto         height of the content area (below the title bar)
 * @param cuerpo       SVG elements, drawn with their origin at the top-left of the content area
 * @param defs         extra <defs> content
 * @param estilos      extra CSS for this block
 */
export function enmarcar({ titulo, descripcion, alto, cuerpo, defs = '', estilos = '' }, c) {
  const total = BARRA + alto;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${total}" width="${ANCHO}" height="${total}" role="img" aria-label="${esc(descripcion)}">
  <title>${esc(titulo)}</title>
  <defs>
    <clipPath id="marco"><rect width="${ANCHO}" height="${total}" rx="12"/></clipPath>
    ${defs}
  </defs>
  <style>
    .marco-titulo { font: 500 13px ${MONO}; fill: ${c.textoSuave}; }
    ${estilos}
  </style>
  <g clip-path="url(#marco)">
    <rect width="${ANCHO}" height="${total}" fill="${c.cieloArriba}"/>
    <g transform="translate(0 ${BARRA})">${cuerpo}</g>
    <line x1="0" y1="${BARRA}" x2="${ANCHO}" y2="${BARRA}" stroke="${c.hierroSuave}" stroke-width="1" opacity=".6"/>
  </g>
  <circle cx="30" cy="${BARRA / 2}" r="4" fill="${c.luz}"/>
  <text class="marco-titulo" x="46" y="${BARRA / 2 + 4.5}">${esc(titulo)}</text>
  <rect x=".75" y=".75" width="${ANCHO - 1.5}" height="${total - 1.5}" rx="12" fill="none" stroke="${c.hierroSuave}" stroke-width="1.5"/>
</svg>
`;
}

/**
 * Pulls the <defs>, <style> and drawing out of a finished <svg> string so it can be nested
 * inside a frame as a smaller <svg>.
 */
export function desmontar(svg) {
  const defs = (svg.match(/<defs>([\s\S]*?)<\/defs>/) ?? [, ''])[1];
  const estilos = (svg.match(/<style>([\s\S]*?)<\/style>/) ?? [, ''])[1];
  const dibujo = svg.slice(svg.indexOf('</style>') + '</style>'.length, svg.lastIndexOf('</svg>'));
  return { defs, estilos, dibujo };
}
