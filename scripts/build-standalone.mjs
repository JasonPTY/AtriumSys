// Genera atrium-standalone.html (todo en un solo archivo) a partir de index.html + css/ + js/.
// Uso: npm install && npm run build
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// 1) CSS: concatena los @import de css/main.css en el mismo orden.
const imports = [...read("css/main.css").matchAll(/@import url\("([^"]+)"\);/g)].map((m) => m[1]);
const css = imports.map((f) => read("css/" + f).trimEnd()).join("\n");

// 2) JS: empaqueta js/main.js como IIFE (los modulos ES no cargan bien desde file://).
const out = await build({
  entryPoints: [join(root, "js/main.js")],
  bundle: true,
  format: "iife",
  write: false,
  charset: "utf8",
  target: "es2020",
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

// 3) HTML: reemplaza el <link> de estilos y el <script type="module">.
const html = read("index.html")
  .replace('<link rel="stylesheet" href="css/main.css">', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="js/main.js"></script>', `<script>\n${js}</script>`);

writeFileSync(join(root, "atrium-standalone.html"), html);
console.log("atrium-standalone.html generado (" + Math.round(html.length / 1024) + " KB)");
