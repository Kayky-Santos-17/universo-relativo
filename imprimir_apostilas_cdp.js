const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const root = process.cwd();
const outRoot = path.join(root, "apostilas_refeitas");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const onlyFolder = process.argv[2] || "";
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function requestJson(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, path: pathname, method: "GET" }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (err) { reject(err); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForDebug(port) {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    try {
      return await requestJson(port, "/json/version");
    } catch (_) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("DevTools não iniciou a tempo.");
}

function wsCall(ws, method, params = {}) {
  const id = ++wsCall.id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const listener = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      ws.removeEventListener("message", listener);
      if (message.error) reject(new Error(message.error.message || method));
      else resolve(message.result || {});
    };
    ws.addEventListener("message", listener);
  });
}
wsCall.id = 0;

async function printFile(htmlFile, index) {
  const pdfFile = htmlFile.replace(/\.html$/i, ".pdf");
  if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);
  const fileUrl = `file:///${htmlFile.replace(/\\/g, "/")}`;
  const port = 9339 + index;
  const profile = path.join(root, `.edge-apostilas-cdp-${index}`);
  const child = spawn(edge, [
    "--headless=new",
    "--disable-gpu",
    "--disable-crash-reporter",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank"
  ], { stdio: "ignore" });

  try {
    await waitForDebug(port);
    const pages = await requestJson(port, "/json/list");
    const page = pages.find((item) => item.type === "page" && item.url === fileUrl) ||
      pages.find((item) => item.type === "page") ||
      pages[0];
    if (!page || !page.webSocketDebuggerUrl) throw new Error("Página CDP não encontrada.");
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    await wsCall(ws, "Page.enable");
    await wsCall(ws, "Page.navigate", { url: fileUrl });
    const started = Date.now();
    while (Date.now() - started < 12000) {
      const state = await wsCall(ws, "Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true
      });
      if (state.result && state.result.value === "complete") break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
    await wsCall(ws, "Page.printToPDF", {
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true
    }).then((result) => {
      fs.writeFileSync(pdfFile, Buffer.from(result.data, "base64"));
    });
    ws.close();
    console.log(path.relative(root, pdfFile));
  } finally {
    child.kill("SIGKILL");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

(async () => {
  if (typeof WebSocket === "undefined") {
    throw new Error("Esta versão do Node não possui WebSocket global.");
  }
  const files = walk(outRoot).filter((file) => {
    if (!onlyFolder) return true;
    return path.relative(outRoot, file).split(path.sep)[0] === onlyFolder;
  });
  for (let index = 0; index < files.length; index += 1) {
    await printFile(files[index], index);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
