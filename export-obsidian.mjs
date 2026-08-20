import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const journalRoot = process.argv[2] ?? "/home/enjoy/Documents/Obsidian Vault/Journal";
const healthRoot = process.argv[3] ?? "/home/enjoy/Documents/Obsidian Vault/Hälsa/Dagar";
const selected = ["Journal", "Läsa", "Hygien", "Hållning"];
const completed = Object.fromEntries(selected.map(name => [name, new Set()]));
const readiness = {};

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(fullPath));
    else if (entry.isFile() && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

for (const file of await markdownFiles(journalRoot)) {
  const date = path.basename(file, ".md");
  const text = await readFile(file, "utf8");
  if (!text.startsWith("---\n")) continue;
  const end = text.indexOf("\n---", 4);
  if (end === -1) continue;
  const frontmatter = text.slice(4, end);
  for (const name of selected) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`^${escaped}:\\s*true\\s*$`, "mi").test(frontmatter)) completed[name].add(date);
  }
}

for (const file of await markdownFiles(healthRoot)) {
  const date = path.basename(file, ".md");
  const text = await readFile(file, "utf8");
  if (!text.startsWith("---\n")) continue;
  const end = text.indexOf("\n---", 4);
  if (end === -1) continue;
  const frontmatter = text.slice(4, end);
  const google = frontmatter.match(/^google_dagsform:\s*(\d+(?:\.\d+)?)\s*$/mi);
  const calculated = frontmatter.match(/^dagsform:\s*(\d+(?:\.\d+)?)\s*$/mi);
  const value = Number(google?.[1] ?? calculated?.[1]);
  if (Number.isFinite(value)) readiness[date] = Math.round(value);
}

const data = selected.map(name => ({ name, done: [...completed[name]].sort() }));
await writeFile(
  new URL("./habits-data.js", import.meta.url),
  `window.habitsData = ${JSON.stringify(data, null, 2)};\nwindow.readinessData = ${JSON.stringify(readiness, null, 2)};\n`,
);
console.log(data.map(habit => `${habit.name}: ${habit.done.length}`).join("\n"));
console.log(`Dagsform: ${Object.keys(readiness).length}`);
