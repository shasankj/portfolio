// WCAG contrast check for a project accent. Usage: node scripts/contrast.mjs "#0f766e" "#5eead4"
// First color is checked on the light paper tokens, second (optional) on the dark tokens. Target: 4.5:1 or more everywhere.
const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const [light, dark = light] = process.argv.slice(2);
if (!/^#[0-9a-f]{6}$/i.test(light ?? '') || !/^#[0-9a-f]{6}$/i.test(dark)) { console.error('Usage: node scripts/contrast.mjs "#rrggbb" ["#rrggbb" for dark theme]'); process.exit(1); }
const rows = [['light', light, '#f3f0e8', 'paper'], ['light', light, '#faf8f2', 'card surface'], ['dark', dark, '#0b1220', 'paper'], ['dark', dark, '#101a2e', 'card surface']];
let ok = true;
for (const [theme, fg, bg, name] of rows) { const r = ratio(fg, bg); if (r < 4.5) ok = false; console.log(`${theme.padEnd(5)} ${fg} on ${name.padEnd(12)} ${r.toFixed(2)}:1 ${r >= 4.5 ? 'pass' : 'FAIL (need 4.5)'}`); }
process.exit(ok ? 0 : 1);
