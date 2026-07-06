const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const outRoot = path.join(root, "apostilas_refeitas");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = path.join(root, ".edge-apostilas-refeitas");
const onlyFolder = process.argv[2] || "";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

const htmlFiles = walk(outRoot).filter((file) => {
  if (!onlyFolder) return true;
  return path.relative(outRoot, file).split(path.sep)[0] === onlyFolder;
});

for (const htmlFile of htmlFiles) {
  const pdfFile = htmlFile.replace(/\.html$/i, ".pdf");
  if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);
  const args = [
    "--headless",
    "--disable-gpu",
    "--disable-crash-reporter",
    "--print-to-pdf-no-header",
    `--user-data-dir=${profile}`,
    `--print-to-pdf=${pdfFile}`,
    `file:///${htmlFile.replace(/\\/g, "/")}`
  ];
  const result = spawnSync(edge, args, { encoding: "utf8" });
  if (result.status !== 0) {
    if (fs.existsSync(pdfFile)) {
      console.log(`Gerado com aviso: ${path.relative(root, pdfFile)}`);
      continue;
    }
    console.error(`Falha ao imprimir ${htmlFile}`);
    console.error(result.error ? result.error.message : "");
    console.error(result.stderr || "");
    console.error(result.stdout || "");
    process.exit(result.status || 1);
  }
  console.log(path.relative(root, pdfFile));
}
