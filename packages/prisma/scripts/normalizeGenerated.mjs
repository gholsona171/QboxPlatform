import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const generatedDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/generated/client",
);

for (const file of await generatedFiles(generatedDirectory)) {
  const source = await readFile(file, "utf8");
  const normalized = `${source.replace(/[\t ]+$/gmu, "").trimEnd()}\n`;
  if (normalized !== source) await writeFile(file, normalized, "utf8");
}

async function generatedFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await generatedFiles(path)));
    else if (entry.isFile() && path.endsWith(".ts")) files.push(path);
  }
  return files;
}
