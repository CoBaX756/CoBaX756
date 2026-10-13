// Puts the contribution snake (an SVG made by the Platane/snk action) inside the same frame
// as every other block of the profile.
// Usage: node tools/envolver-serpiente.mjs <serpiente.svg> <salida.svg> <dark|light>
import { readFileSync, writeFileSync } from 'node:fs';
import { ANCHO, enmarcar, paletas } from './marco.mjs';

const [entrada, salida, tema] = process.argv.slice(2);
const c = paletas[tema];

if (!entrada || !salida || !c) {
  console.error('Uso: node tools/envolver-serpiente.mjs <serpiente.svg> <salida.svg> <dark|light>');
  process.exit(1);
}

const origen = readFileSync(entrada, 'utf8')
  .replace(/<\?xml[^>]*\?>/g, '')
  .replace(/<!DOCTYPE[^>]*>/gi, '');
const raiz = origen.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);
const viewBox = raiz?.[1].match(/viewBox="([^"]+)"/)?.[1];

if (!raiz || !viewBox) {
  console.error(`No se reconoce el SVG de la serpiente en ${entrada}`);
  process.exit(1);
}

const [, , w, h] = viewBox.split(/[ ,]+/).map(Number);
const MARGEN = 28;
const ancho = ANCHO - 2 * MARGEN;
const alto = Math.round((h * ancho) / w);

writeFileSync(salida, enmarcar({
  titulo: 'xabier@bilbao: ~/actividad',
  descripcion: 'Mis contribuciones del último año, recorridas por una serpiente.',
  alto: alto + 32,
  cuerpo: `<svg x="${MARGEN}" y="16" width="${ancho}" height="${alto}" viewBox="${viewBox}">${raiz[2]}</svg>`,
}, c));
