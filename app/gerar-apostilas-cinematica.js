const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "apostilas");
const EDIT = path.join(OUT, "editaveis");
const LOGO_ASTRO = "C:\\Users\\paulo\\Downloads\\WhatsApp Image 2026-04-18 at 09.32.30.jpeg";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(EDIT, { recursive: true });

const BLUE = "#2563eb";
const DARK = "#020617";
const TEXT = "#334155";
const MUTED = "#64748b";

function latin(text) {
  return String(text)
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/≈/g, "aprox.")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/→/g, "->")
    .replace(/√/g, "raiz")
    .replace(/Δ/g, "Delta")
    .replace(/θ/g, "theta")
    .replace(/ω/g, "omega")
    .replace(/π/g, "pi")
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "");
}

function escapePdfText(text) {
  return latin(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function wrap(text, maxChars) {
  const words = latin(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function rgb(hex, mode = "rg") {
  const n = hex.replace("#", "");
  return `${(parseInt(n.slice(0, 2), 16) / 255).toFixed(3)} ${(parseInt(n.slice(2, 4), 16) / 255).toFixed(3)} ${(parseInt(n.slice(4, 6), 16) / 255).toFixed(3)} ${mode}`;
}

function jpegSize(buffer) {
  let i = 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xff) break;
    const marker = buffer[i + 1];
    const len = buffer.readUInt16BE(i + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
      return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
    }
    i += 2 + len;
  }
  return { width: 512, height: 384 };
}

const T = (text) => ({ type: "text", text });
const I = (text) => ({ type: "italic", text });
const B = (text) => ({ type: "bold", text });
const SY = (key) => ({ type: "symbol", key });
const SUB = (text) => ({ type: "sub", text });
const SUP = (text) => ({ type: "sup", text });
const FR = (num, den) => ({ type: "frac", num, den });
const SQ = (value) => ({ type: "sqrt", value });
const DOT = () => T(" · ");

const SYMBOLS = {
  Delta: "D",
  theta: "q",
  pi: "p",
  omega: "w",
  lambda: "l",
  alpha: "a",
  gamma: "g",
};

class Pdf {
  constructor(title, subjectLabel = "Física") {
    this.title = title;
    this.subjectLabel = subjectLabel;
    this.objects = [];
    this.pages = [];
    this.width = 595.28;
    this.height = 841.89;
    this.margin = 52;
    this.fontRegular = this.obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    this.fontBold = this.obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    this.fontItalic = this.obj("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>");
    this.fontSymbol = this.obj("<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>");
    const imgBuffer = fs.readFileSync(LOGO_ASTRO);
    const size = jpegSize(imgBuffer);
    this.logo = this.obj(`<< /Type /XObject /Subtype /Image /Width ${size.width} /Height ${size.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBuffer.length} >>\nstream\n${imgBuffer.toString("binary")}\nendstream`, true);
    this.newPage();
  }

  obj(content, binary = false) {
    const id = this.objects.length + 1;
    this.objects.push({ id, content, binary });
    return id;
  }

  cy(y) {
    return this.height - y;
  }

  newPage() {
    this.commands = [];
    this.pages.push(this.commands);
    this.header();
  }

  ensure(h) {
    if (this.y + h > 786) this.newPage();
  }

  text(x, y, txt, size = 10.5, font = "F1", color = TEXT) {
    this.commands.push("BT");
    this.commands.push(`/${font} ${size} Tf`);
    this.commands.push(rgb(color, "rg"));
    this.commands.push(`${x.toFixed(2)} ${this.cy(y).toFixed(2)} Td`);
    this.commands.push(`(${escapePdfText(txt)}) Tj`);
    this.commands.push("ET");
  }

  rect(x, y, w, h, fill = "#ffffff", stroke = "#dbeafe", lineWidth = 1) {
    this.commands.push("q");
    this.commands.push(rgb(fill, "rg"));
    this.commands.push(`${x.toFixed(2)} ${this.cy(y + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    this.commands.push(rgb(stroke, "RG"));
    this.commands.push(`${lineWidth} w`);
    this.commands.push(`${x.toFixed(2)} ${this.cy(y + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
    this.commands.push("Q");
  }

  line(x1, y1, x2, y2, stroke = BLUE, width = 1) {
    this.commands.push("q");
    this.commands.push(rgb(stroke, "RG"));
    this.commands.push(`${width} w`);
    this.commands.push(`${x1.toFixed(2)} ${this.cy(y1).toFixed(2)} m ${x2.toFixed(2)} ${this.cy(y2).toFixed(2)} l S`);
    this.commands.push("Q");
  }

  circle(x, y, r, fill = "#dbeafe", stroke = BLUE) {
    const c = 0.55228475 * r;
    this.commands.push("q");
    this.commands.push(rgb(fill, "rg"));
    this.commands.push(rgb(stroke, "RG"));
    this.commands.push(`1 w ${x + r} ${this.cy(y)} m`);
    this.commands.push(`${x + r} ${this.cy(y - c)} ${x + c} ${this.cy(y - r)} ${x} ${this.cy(y - r)} c`);
    this.commands.push(`${x - c} ${this.cy(y - r)} ${x - r} ${this.cy(y - c)} ${x - r} ${this.cy(y)} c`);
    this.commands.push(`${x - r} ${this.cy(y + c)} ${x - c} ${this.cy(y + r)} ${x} ${this.cy(y + r)} c`);
    this.commands.push(`${x + c} ${this.cy(y + r)} ${x + r} ${this.cy(y + c)} ${x + r} ${this.cy(y)} c`);
    this.commands.push("f S Q");
  }

  image(x, y, w, h) {
    this.commands.push("q");
    this.commands.push(`${w} 0 0 ${h} ${x} ${this.cy(y + h)} cm`);
    this.commands.push("/Logo Do");
    this.commands.push("Q");
  }

  header() {
    this.rect(0, 0, this.width, 74, DARK, DARK);
    this.image(42, 13, 58, 44);
    this.text(114, 30, "Universo Relativo", 21, "F2", "#ffffff");
    this.text(114, 53, `${this.subjectLabel} | material teórico`, 9.5, "F1", "#bfdbfe");
    this.y = 104;
  }

  footer(pageIndex) {
    this.text(this.margin, 820, `Universo Relativo - ${this.subjectLabel}`, 8, "F1", MUTED);
    this.text(510, 820, String(pageIndex + 1), 8, "F1", MUTED);
  }

  addTitle(title, subtitle) {
    this.ensure(96);
    this.text(this.margin, this.y, title, 24, "F2", "#0f172a");
    this.y += 28;
    wrap(subtitle, 82).forEach((line) => {
      this.text(this.margin, this.y, line, 11, "F1", "#475569");
      this.y += 15;
    });
    this.y += 12;
  }

  h2(title) {
    this.ensure(38);
    this.text(this.margin, this.y, title, 15.5, "F2", "#1d4ed8");
    this.line(this.margin, this.y + 9, this.width - this.margin, this.y + 9, "#bfdbfe", 1);
    this.y += 26;
  }

  p(text) {
    const lines = wrap(text, 86);
    this.ensure(lines.length * 14.5 + 8);
    lines.forEach((line) => {
      this.text(this.margin, this.y, line, 10.5, "F1", TEXT);
      this.y += 14.5;
    });
    this.y += 7;
  }

  bullet(items) {
    this.ensure(items.length * 22 + 12);
    items.forEach((item) => {
      const lines = wrap(item, 78);
      this.text(this.margin + 8, this.y, "-", 11, "F2", BLUE);
      lines.forEach((line, idx) => this.text(this.margin + 24, this.y + idx * 14, line, 10.2, "F1", TEXT));
      this.y += Math.max(18, lines.length * 14 + 4);
    });
    this.y += 7;
  }

  callout(title, text, tone = "blue") {
    const lines = wrap(text, 78);
    const h = 36 + lines.length * 14;
    const fill = tone === "warm" ? "#fffbeb" : "#f8fbff";
    const stroke = tone === "warm" ? "#fde68a" : "#bfdbfe";
    this.ensure(h + 12);
    this.rect(this.margin, this.y, this.width - this.margin * 2, h, fill, stroke);
    this.text(this.margin + 16, this.y + 18, title, 10.5, "F2", tone === "warm" ? "#92400e" : "#1d4ed8");
    lines.forEach((line, idx) => this.text(this.margin + 16, this.y + 38 + idx * 14, line, 10.1, "F1", TEXT));
    this.y += h + 12;
  }

  tokenWidth(token, size) {
    if (Array.isArray(token)) return token.reduce((sum, t) => sum + this.tokenWidth(t, size), 0);
    if (token.type === "frac") return Math.max(this.tokenWidth(token.num, size * 0.76), this.tokenWidth(token.den, size * 0.76)) + 18;
    if (token.type === "sqrt") return this.tokenWidth(token.value, size * 0.8) + 28;
    if (token.type === "sub" || token.type === "sup") return String(token.text).length * size * 0.31 + 2;
    const text = token.type === "symbol" ? SYMBOLS[token.key] || token.key : token.text;
    return String(text).length * size * (token.type === "text" ? 0.45 : 0.5);
  }

  drawToken(token, x, y, size) {
    if (Array.isArray(token)) {
      let xx = x;
      token.forEach((t) => {
        this.drawToken(t, xx, y, size);
        xx += this.tokenWidth(t, size);
      });
      return;
    }
    if (token.type === "frac") {
      const w = this.tokenWidth(token, size);
      const nw = this.tokenWidth(token.num, size * 0.72);
      const dw = this.tokenWidth(token.den, size * 0.72);
      this.drawToken(token.num, x + (w - nw) / 2, y - 11, size * 0.72);
      this.line(x + 5, y, x + w - 5, y, "#0f172a", 0.9);
      this.drawToken(token.den, x + (w - dw) / 2, y + 17, size * 0.72);
      return;
    }
    if (token.type === "sqrt") {
      const innerW = this.tokenWidth(token.value, size * 0.8);
      this.text(x, y + 4, "√", size * 0.95, "F1", "#0f172a");
      this.line(x + 16, y - 13, x + 24 + innerW, y - 13, "#0f172a", 0.9);
      this.line(x + 12, y + 6, x + 17, y + 12, "#0f172a", 0.9);
      this.line(x + 17, y + 12, x + 23, y - 13, "#0f172a", 0.9);
      this.drawToken(token.value, x + 26, y, size * 0.8);
      return;
    }
    const font = token.type === "bold" ? "F2" : token.type === "italic" ? "F3" : token.type === "symbol" ? "F4" : "F1";
    const txt = token.type === "symbol" ? SYMBOLS[token.key] || token.key : token.text;
    const dy = token.type === "sub" ? 7 : token.type === "sup" ? -9 : 0;
    const s = token.type === "sub" || token.type === "sup" ? size * 0.63 : size;
    this.text(x, y + dy, txt, s, font, "#0f172a");
  }

  formulaPanel(formula) {
    const panelX = this.margin + 24;
    const panelW = this.width - this.margin * 2 - 48;
    const panelH = 62;
    this.rect(panelX, this.y, panelW, panelH, "#ffffff", "#dbeafe");
    const w = this.tokenWidth(formula.tokens, 22);
    this.drawToken(formula.tokens, panelX + (panelW - w) / 2, this.y + 35, 22);
    this.y += panelH + 14;
  }

  formulaBlock(formula) {
    const varLines = (formula.vars || []).flatMap((v) => wrap(v, 74));
    const useLines = wrap(formula.use, 76);
    const exampleLines = wrap(formula.example, 76);
    const h = 38 + 76 + useLines.length * 14 + varLines.length * 14 + exampleLines.length * 14 + 72;
    this.ensure(h + 14);
    this.rect(this.margin, this.y, this.width - this.margin * 2, h, "#eff6ff", "#93c5fd", 1.2);
    this.text(this.margin + 16, this.y + 20, formula.title, 11, "F2", "#1d4ed8");
    this.y += 38;
    this.formulaPanel(formula);
    this.text(this.margin + 16, this.y, "Como interpretar", 9.8, "F2", "#0f172a");
    this.y += 14;
    useLines.forEach((line) => {
      this.text(this.margin + 16, this.y, line, 9.8, "F1", TEXT);
      this.y += 13.5;
    });
    this.y += 5;
    this.text(this.margin + 16, this.y, "Variáveis", 9.8, "F2", "#0f172a");
    this.y += 14;
    varLines.forEach((line) => {
      this.text(this.margin + 24, this.y, line, 9.6, "F1", TEXT);
      this.y += 13.5;
    });
    this.y += 8;
    this.rect(this.margin + 16, this.y, this.width - this.margin * 2 - 32, 24 + exampleLines.length * 14, "#f8fafc", "#dbeafe");
    this.text(this.margin + 30, this.y + 16, "Exemplo comentado", 9.6, "F2", "#1d4ed8");
    exampleLines.forEach((line, idx) => this.text(this.margin + 30, this.y + 34 + idx * 14, line, 9.5, "F1", TEXT));
    this.y += 32 + exampleLines.length * 14;
    this.y = Math.ceil(this.y / 1) + 18;
  }

  illustration(kind) {
    this.ensure(140);
    const x = this.margin;
    const y = this.y;
    const w = this.width - this.margin * 2;
    this.rect(x, y, w, 126, "#f8fbff", "#dbeafe");
    this.text(x + 18, y + 24, "Visualização do conceito", 10, "F2", "#1d4ed8");
    if (kind === "intro" || kind === "mru" || kind === "mruv") {
      this.line(x + 42, y + 88, x + w - 42, y + 88, "#94a3b8", 1.2);
      [0, 1, 2, 3, 4].forEach((i) => {
        const px = x + 64 + i * 80;
        this.line(px, y + 82, px, y + 94, "#94a3b8", 1);
        this.text(px - 4, y + 108, String(i), 8.5, "F1", MUTED);
      });
      this.rect(x + 92, y + 63, 52, 20, "#bfdbfe", BLUE);
      this.circle(x + 104, y + 86, 5, "#020617", "#020617");
      this.circle(x + 134, y + 86, 5, "#020617", "#020617");
      this.line(x + 152, y + 72, x + 206, y + 72, BLUE, 2);
      this.line(x + 206, y + 72, x + 195, y + 65, BLUE, 2);
      this.line(x + 206, y + 72, x + 195, y + 79, BLUE, 2);
      this.text(x + 218, y + 77, kind === "mruv" ? "velocidade variando" : "movimento em relação ao solo", 9.5, "F1", TEXT);
    } else if (kind === "vetores") {
      const ox = x + 154;
      const oy = y + 86;
      this.line(ox, oy, ox + 150, oy, "#94a3b8", 1);
      this.line(ox, oy, ox, oy - 56, "#94a3b8", 1);
      this.line(ox, oy, ox + 126, oy - 48, BLUE, 2.4);
      this.line(ox + 126, oy - 48, ox + 112, oy - 47, BLUE, 2.4);
      this.line(ox + 126, oy - 48, ox + 119, oy - 36, BLUE, 2.4);
      this.line(ox + 126, oy, ox + 126, oy - 48, "#38bdf8", 1.6);
      this.line(ox, oy - 48, ox + 126, oy - 48, "#38bdf8", 1.6);
      this.text(ox + 130, oy - 50, "R", 13, "F3", BLUE);
      this.text(ox + 56, oy + 15, "componente x", 8.5, "F1", MUTED);
      this.text(ox + 132, oy - 22, "componente y", 8.5, "F1", MUTED);
    } else if (kind === "circular") {
      this.circle(x + 180, y + 76, 38, "#dbeafe", BLUE);
      this.line(x + 180, y + 76, x + 218, y + 76, BLUE, 2);
      this.line(x + 218, y + 76, x + 265, y + 54, "#38bdf8", 2);
      this.line(x + 265, y + 54, x + 253, y + 52, "#38bdf8", 2);
      this.line(x + 265, y + 54, x + 258, y + 64, "#38bdf8", 2);
      this.circle(x + 322, y + 76, 24, "#f8fafc", "#0ea5e9");
      this.circle(x + 390, y + 76, 36, "#f8fafc", "#0ea5e9");
      this.line(x + 322, y + 52, x + 390, y + 40, "#64748b", 1.5);
      this.line(x + 322, y + 100, x + 390, y + 112, "#64748b", 1.5);
      this.text(x + 262, y + 36, "velocidade tangencial", 9, "F1", TEXT);
    } else if (kind === "vertical") {
      this.line(x + 160, y + 108, x + 160, y + 42, "#94a3b8", 1.2);
      this.line(x + 160, y + 42, x + 154, y + 54, "#94a3b8", 1.2);
      this.line(x + 160, y + 42, x + 166, y + 54, "#94a3b8", 1.2);
      this.circle(x + 160, y + 88, 8, "#bfdbfe", BLUE);
      this.line(x + 205, y + 48, x + 205, y + 105, "#ef4444", 2);
      this.line(x + 205, y + 105, x + 198, y + 94, "#ef4444", 2);
      this.line(x + 205, y + 105, x + 212, y + 94, "#ef4444", 2);
      this.text(x + 218, y + 82, "gravidade aponta para baixo", 9.5, "F1", TEXT);
    } else {
      this.line(x + 70, y + 104, x + w - 70, y + 104, "#94a3b8", 1.2);
      let last = null;
      for (let i = 0; i <= 22; i++) {
        const t = i / 22;
        const px = x + 88 + t * 330;
        const py = y + 100 - Math.sin(t * Math.PI) * 64;
        if (last) this.line(last[0], last[1], px, py, BLUE, 1.8);
        last = [px, py];
      }
      this.circle(x + 88, y + 100, 5, "#bfdbfe", BLUE);
      this.circle(x + 418, y + 100, 5, "#bfdbfe", BLUE);
      this.text(x + 188, y + 40, "componentes horizontal e vertical", 9.5, "F1", TEXT);
    }
    this.y += 142;
  }

  save(file) {
    const pageObjs = [];
    this.pages.forEach((commands, i) => {
      this.commands = commands;
      this.footer(i);
      const stream = commands.filter(Boolean).join("\n");
      const contentObj = this.obj(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
      const pageObj = this.obj(`<< /Type /Page /Parent PAGES_REF 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Resources << /Font << /F1 ${this.fontRegular} 0 R /F2 ${this.fontBold} 0 R /F3 ${this.fontItalic} 0 R /F4 ${this.fontSymbol} 0 R >> /XObject << /Logo ${this.logo} 0 R >> >> /Contents ${contentObj} 0 R >>`);
      pageObjs.push(pageObj);
    });
    const pagesObj = this.obj(`<< /Type /Pages /Kids [${pageObjs.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjs.length} >>`);
    const catalogObj = this.obj(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);
    this.objects = this.objects.map((obj) => ({ ...obj, content: String(obj.content).replace(/PAGES_REF/g, String(pagesObj)) }));
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    this.objects.forEach((obj) => {
      offsets[obj.id] = Buffer.byteLength(pdf, "binary");
      pdf += `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
    });
    const xref = Buffer.byteLength(pdf, "binary");
    pdf += `xref\n0 ${this.objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= this.objects.length; i++) pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    pdf += `trailer\n<< /Size ${this.objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    fs.writeFileSync(file, Buffer.from(pdf, "binary"));
  }
}

function renderPdf(item) {
  const pdf = new Pdf(item.title, item.subject || "Física");
  pdf.addTitle(item.title, item.subtitle);
  pdf.callout("Como estudar este bloco", item.guide, "blue");
  pdf.illustration(item.illustration);
  item.sections.forEach((section) => {
    pdf.h2(section.title);
    section.paragraphs.forEach((p) => pdf.p(p));
    if (section.bullets) pdf.bullet(section.bullets);
    if (section.note) pdf.callout("Observação importante", section.note, "warm");
  });
  item.formulas.forEach((formula) => pdf.formulaBlock(formula));
  pdf.h2("Exemplos resolvidos comentados");
  item.examples.forEach((example, idx) => {
    pdf.callout(`Exemplo ${idx + 1}`, example, idx % 2 ? "blue" : "warm");
  });
  pdf.h2("Resumo de revisão");
  pdf.bullet(item.summary);
  pdf.save(path.join(OUT, item.file));
}

function htmlFormula(tokens) {
  if (!Array.isArray(tokens)) tokens = [tokens];
  return tokens.map((token) => {
    if (Array.isArray(token)) return htmlFormula(token);
    if (token.type === "frac") return `<span class="frac"><span>${htmlFormula(token.num)}</span><span>${htmlFormula(token.den)}</span></span>`;
    if (token.type === "sqrt") return `<span class="sqrt">√<span>${htmlFormula(token.value)}</span></span>`;
    if (token.type === "sub") return `<sub>${token.text}</sub>`;
    if (token.type === "sup") return `<sup>${token.text}</sup>`;
    if (token.type === "symbol") return { Delta: "Δ", theta: "θ", pi: "π", omega: "ω", lambda: "λ", alpha: "α", gamma: "γ" }[token.key] || token.key;
    return token.text;
  }).join("");
}

function renderHtml(item) {
  const sections = item.sections.map((s) => `
    <section class="card">
      <h2>${s.title}</h2>
      ${s.paragraphs.map((p) => `<p>${p}</p>`).join("")}
      ${s.bullets ? `<ul>${s.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
      ${s.note ? `<aside><strong>Observação:</strong> ${s.note}</aside>` : ""}
    </section>`).join("");
  const formulas = item.formulas.map((f) => `
    <section class="formula card">
      <h2>${f.title}</h2>
      <div class="math">${htmlFormula(f.tokens)}</div>
      <p><strong>Como interpretar:</strong> ${f.use}</p>
      <ul>${f.vars.map((v) => `<li>${v}</li>`).join("")}</ul>
      <aside><strong>Exemplo comentado:</strong> ${f.example}</aside>
    </section>`).join("");
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${item.title}</title>
  <style>
    :root{--blue:#2563eb;--dark:#020617;--text:#334155;--soft:#eff6ff}
    body{font-family:Georgia,"Times New Roman",serif;max-width:900px;margin:0 auto;padding:48px 28px;color:#0f172a;line-height:1.7;background:#f8fbff}
    header{border-radius:28px;padding:30px;background:linear-gradient(135deg,#020617,#1d4ed8);color:white}
    .brand{font:800 18px Arial,sans-serif;color:#93c5fd;letter-spacing:.04em;text-transform:uppercase}
    h1{font:800 34px Arial,sans-serif;margin:10px 0 8px} h2{font:800 22px Arial,sans-serif;color:var(--blue)}
    .card{background:white;border:1px solid #dbeafe;border-radius:22px;padding:22px;margin:22px 0;box-shadow:0 18px 45px rgba(15,23,42,.08)}
    .math{font-size:32px;text-align:center;background:var(--soft);border:1px solid #bfdbfe;border-radius:18px;padding:22px;margin:16px 0;font-style:italic}
    .frac{display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;margin:0 .25em}.frac span:first-child{border-bottom:2px solid #0f172a}.sqrt{display:inline-flex;align-items:flex-end;gap:.08em}.sqrt span{border-top:2px solid #0f172a;padding:.02em .18em 0}
    aside{background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:14px;margin-top:14px}
  </style>
</head>
<body>
  <header><div class="brand">Universo Relativo</div><h1>${item.title}</h1><p>${item.subtitle}</p></header>
  <section class="card"><h2>Como estudar este bloco</h2><p>${item.guide}</p></section>
  ${sections}
  ${formulas}
  <section class="card"><h2>Exemplos resolvidos comentados</h2>${item.examples.map((e, i) => `<p><strong>Exemplo ${i + 1}:</strong> ${e}</p>`).join("")}</section>
  <section class="card"><h2>Resumo de revisão</h2><ul>${item.summary.map((s) => `<li>${s}</li>`).join("")}</ul></section>
</body>
</html>`;
}

const apostilas = [
  {
    file: "bloco1-introducao-cinematica.pdf",
    html: "bloco1-introducao-cinematica.html",
    title: "Bloco 1: Introdução à Cinemática",
    subtitle: "Movimento, repouso, referencial, trajetória, posição, deslocamento, distância percorrida e velocidade média.",
    illustration: "intro",
    guide: "Leia primeiro as definições com calma. Em Cinemática, muitos erros acontecem porque o aluno mistura deslocamento com distância percorrida, ou esquece que movimento e repouso dependem do referencial.",
    sections: [
      { title: "O que a Cinemática estuda", paragraphs: ["A Cinemática descreve o movimento dos corpos sem investigar suas causas. Ela não pergunta por que o corpo acelera, freia ou muda de direção; isso será papel da Dinâmica. Aqui o foco é localizar o corpo, comparar posições e medir como essas posições mudam ao longo do tempo.", "Um mesmo fenômeno pode parecer diferente para observadores diferentes. Por isso, antes de qualquer cálculo, precisamos definir o referencial adotado. Sem referencial, expressões como parado, rápido, para frente ou para trás ficam incompletas."] },
      { title: "Referencial, movimento e repouso", paragraphs: ["Referencial é o corpo, sistema ou ponto de vista usado para descrever posições. Um passageiro sentado está em repouso em relação ao ônibus, mas em movimento em relação à rua. Não existe repouso absoluto dentro da Cinemática elementar: existe repouso em relação a algo.", "Essa ideia é muito cobrada porque parece simples, mas muda completamente a interpretação do problema. Sempre pergunte: em relação a quem o movimento está sendo descrito?"], note: "Se o enunciado não declarar o referencial, em geral assume-se a Terra ou o solo como referência." },
      { title: "Trajetória, posição, deslocamento e distância", paragraphs: ["Trajetória é o caminho geométrico descrito pelo móvel. Em uma estrada reta, a trajetória é retilínea; em uma curva, pode ser circular ou curvilínea. A posição é o número associado ao ponto ocupado pelo móvel em certo instante dentro de um eixo ou sistema de referência.", "Deslocamento é a diferença entre posição final e posição inicial. Já a distância percorrida é o comprimento total efetivamente percorrido. Se uma pessoa anda 10 m para frente e volta 4 m, a distância é 14 m, mas o deslocamento é 6 m."], bullets: ["Deslocamento depende apenas dos pontos inicial e final.", "Distância percorrida depende do caminho realizado.", "Em movimento sem mudança de sentido, o módulo do deslocamento coincide com a distância."] },
    ],
    formulas: [
      { title: "Deslocamento escalar", tokens: [SY("Delta"), I("s"), T(" = "), I("s"), T(" - "), I("s"), SUB("0")], use: "A fórmula compara a posição final com a posição inicial. O sinal do deslocamento informa o sentido em relação ao eixo escolhido.", vars: ["Δs: deslocamento escalar.", "s: posição final.", "s0: posição inicial."], example: "Se um móvel sai de s0 = 20 m e chega a s = 85 m, então Δs = 85 - 20 = 65 m. O resultado positivo indica avanço no sentido positivo do eixo." },
      { title: "Velocidade escalar média", tokens: [I("v"), SUB("m"), T(" = "), FR([SY("Delta"), I("s")], [SY("Delta"), I("t")])], use: "Indica a razão entre o deslocamento e o tempo gasto. É uma grandeza média: não informa tudo que aconteceu durante o percurso.", vars: ["vm: velocidade escalar média.", "Δs: deslocamento escalar.", "Δt: intervalo de tempo."], example: "Se o deslocamento foi 120 km em 2 h, então vm = 120/2 = 60 km/h. Isso não significa que o móvel manteve 60 km/h o tempo inteiro." },
    ],
    examples: [
      "Um carro sai do km 30 e chega ao km 90. Seu deslocamento é 60 km. Se ele fez esse percurso em 1,5 h, a velocidade média é 40 km/h.",
      "Uma pessoa caminha 8 m para leste e depois 8 m para oeste, retornando ao ponto inicial. A distância percorrida é 16 m, mas o deslocamento é zero. Por isso a velocidade média vetorial seria nula, embora tenha havido movimento.",
    ],
    summary: ["Movimento e repouso dependem do referencial.", "Trajetória é o caminho descrito; posição é a localização no eixo.", "Deslocamento compara posição final e inicial.", "Distância percorrida soma o caminho total.", "Velocidade média é deslocamento dividido pelo intervalo de tempo."],
  },
  {
    file: "bloco2-mru.pdf",
    html: "bloco2-mru.html",
    title: "Bloco 2: Movimento Retilíneo Uniforme",
    subtitle: "Movimento em linha reta com velocidade constante, aceleração nula e função horária de primeiro grau.",
    illustration: "mru",
    guide: "No MRU, domine a interpretação da função horária. Ela permite prever posições, descobrir tempos e entender encontros entre móveis em linha reta.",
    sections: [
      { title: "Características do MRU", paragraphs: ["O Movimento Retilíneo Uniforme ocorre quando o móvel percorre uma trajetória reta com velocidade constante. Como a velocidade não muda, a aceleração é nula. A cada intervalo de tempo igual, o corpo percorre deslocamentos iguais.", "Em problemas de MRU, o sinal da velocidade é tão importante quanto seu módulo. Velocidade positiva indica movimento no sentido positivo do eixo; velocidade negativa indica movimento no sentido contrário."] },
      { title: "Função horária da posição", paragraphs: ["A função horária do MRU é uma equação de primeiro grau. Isso significa que a posição muda linearmente com o tempo. Se a velocidade é positiva, a posição aumenta; se é negativa, a posição diminui.", "Esse modelo aparece em viagens com velocidade constante, deslocamentos em esteiras, trens em movimento uniforme e questões de encontro ou ultrapassagem quando as velocidades são aproximadamente constantes."] },
      { title: "Encontro de móveis", paragraphs: ["Dois móveis se encontram quando ocupam a mesma posição no mesmo instante. A estratégia mais segura é escrever a função horária de cada móvel e igualar as posições.", "Cuidado com sentidos opostos: um móvel pode ter velocidade positiva e o outro negativa, dependendo do eixo adotado. O eixo é uma escolha matemática, mas precisa ser mantido até o fim."] },
    ],
    formulas: [
      { title: "Função horária do MRU", tokens: [I("s"), T(" = "), I("s"), SUB("0"), T(" + "), I("v"), DOT(), I("t")], use: "Calcula a posição do móvel em qualquer instante, desde que a velocidade seja constante.", vars: ["s: posição no instante t.", "s0: posição inicial.", "v: velocidade constante.", "t: tempo decorrido."], example: "Se s0 = 10 km e v = 60 km/h, depois de 2 h: s = 10 + 60 · 2 = 130 km." },
      { title: "Velocidade constante", tokens: [I("v"), T(" = "), FR([SY("Delta"), I("s")], [SY("Delta"), I("t")])], use: "No MRU, essa razão é a mesma em qualquer intervalo de tempo. Por isso a velocidade média coincide com a velocidade instantânea.", vars: ["v: velocidade escalar constante.", "Δs: deslocamento.", "Δt: intervalo de tempo."], example: "Se um trem percorre 300 m em 20 s com velocidade constante, v = 300/20 = 15 m/s." },
    ],
    examples: [
      "Um ônibus parte do km 12 com velocidade de 48 km/h. Após 3 h, sua posição será s = 12 + 48 · 3 = 156 km.",
      "Dois carros estão na mesma estrada. A: sA = 20 + 80t. B: sB = 260 - 40t. No encontro, 20 + 80t = 260 - 40t, então 120t = 240 e t = 2 h. A posição será 180 km.",
    ],
    summary: ["No MRU, a velocidade é constante e a aceleração é zero.", "A função horária é uma reta em relação ao tempo.", "A inclinação da posição em função do tempo representa a velocidade.", "Em encontro de móveis, iguale as posições no mesmo instante."],
  },
  {
    file: "bloco3-mruv.pdf",
    html: "bloco3-mruv.html",
    title: "Bloco 3: Movimento Retilíneo Uniformemente Variado",
    subtitle: "Movimento em linha reta com aceleração constante, variação uniforme de velocidade e equações fundamentais.",
    illustration: "mruv",
    guide: "O MRUV é o bloco em que a Cinemática começa a ganhar força. Em vez de decorar fórmulas, observe quais grandezas aparecem no enunciado e qual delas falta.",
    sections: [
      { title: "A ideia de aceleração constante", paragraphs: ["No MRUV, a velocidade varia de maneira uniforme. Isso significa que, a cada segundo, a velocidade aumenta ou diminui sempre a mesma quantidade. A aceleração é a taxa de variação da velocidade.", "Se velocidade e aceleração têm o mesmo sinal, o movimento é acelerado. Se têm sinais opostos, o movimento é retardado. O sinal depende do eixo escolhido, por isso é importante manter coerência ao longo da resolução."] },
      { title: "Quando usar cada equação", paragraphs: ["A equação da velocidade é útil quando o problema envolve tempo e velocidade. A função horária da posição é usada quando queremos posição ou deslocamento em função do tempo. A equação de Torricelli é poderosa quando o tempo não aparece.", "Antes de substituir números, organize uma pequena tabela com v0, v, a, t e Δs. Essa prática reduz erros e ajuda a perceber qual fórmula se encaixa."] },
      { title: "Interpretação física", paragraphs: ["A aceleração não mede velocidade; mede mudança de velocidade. Um corpo pode estar com velocidade alta e aceleração zero, como no MRU. Também pode ter velocidade instantânea nula e aceleração diferente de zero, como uma bola no ponto mais alto de um lançamento vertical."] },
    ],
    formulas: [
      { title: "Velocidade no MRUV", tokens: [I("v"), T(" = "), I("v"), SUB("0"), T(" + "), I("a"), DOT(), I("t")], use: "Mostra como a velocidade muda com o tempo quando a aceleração é constante.", vars: ["v: velocidade final.", "v0: velocidade inicial.", "a: aceleração constante.", "t: intervalo de tempo."], example: "Um móvel parte com 4 m/s e acelera 3 m/s² por 5 s. v = 4 + 3 · 5 = 19 m/s." },
      { title: "Função horária da posição", tokens: [I("s"), T(" = "), I("s"), SUB("0"), T(" + "), I("v"), SUB("0"), DOT(), I("t"), T(" + "), FR([I("a"), DOT(), I("t"), SUP("2")], [T("2")])], use: "Determina a posição quando há velocidade inicial e aceleração constante.", vars: ["s: posição no instante t.", "s0: posição inicial.", "v0: velocidade inicial.", "a: aceleração.", "t: tempo."], example: "Se s0 = 0, v0 = 2 m/s, a = 4 m/s² e t = 3 s, então s = 0 + 2 · 3 + (4 · 9)/2 = 24 m." },
      { title: "Equação de Torricelli", tokens: [I("v"), SUP("2"), T(" = "), I("v"), SUB("0"), SUP("2"), T(" + 2"), I("a"), SY("Delta"), I("s")], use: "Relaciona velocidades, aceleração e deslocamento sem usar o tempo.", vars: ["v: velocidade final.", "v0: velocidade inicial.", "a: aceleração.", "Δs: deslocamento."], example: "Um carro parte do repouso e acelera 2 m/s² por 25 m. v² = 0 + 2 · 2 · 25 = 100, logo v = 10 m/s." },
    ],
    examples: [
      "Um corpo parte do repouso com aceleração de 2 m/s² durante 8 s. A velocidade final é 16 m/s e o deslocamento é (2 · 64)/2 = 64 m.",
      "Um veículo a 30 m/s freia com aceleração de módulo 5 m/s² até parar. Pela equação de Torricelli: 0² = 30² + 2(-5)Δs, então Δs = 90 m.",
    ],
    summary: ["No MRUV, a aceleração é constante.", "Velocidade e aceleração com mesmo sinal indicam aumento do módulo da velocidade.", "Torricelli é ideal quando o tempo não aparece.", "A função horária da posição é de segundo grau no tempo."],
  },
  {
    file: "bloco4-vetores-do-movimento.pdf",
    html: "bloco4-vetores-do-movimento.html",
    title: "Bloco 4: Vetores do Movimento",
    subtitle: "Grandezas vetoriais, decomposição, soma vetorial, componentes e aplicação em movimentos bidimensionais.",
    illustration: "vetores",
    guide: "Vetores são a linguagem dos movimentos em duas dimensões. A chave é separar módulo, direção e sentido, depois decompor em eixos quando o problema ficar difícil.",
    sections: [
      { title: "Grandezas escalares e vetoriais", paragraphs: ["Grandezas escalares ficam completamente definidas por valor numérico e unidade, como massa, temperatura e tempo. Grandezas vetoriais precisam de módulo, direção e sentido, como deslocamento, velocidade, aceleração e força.", "Na Cinemática, vetores aparecem quando o movimento não cabe em uma única linha reta. Lançamentos, curvas e composição de movimentos exigem decomposição vetorial."] },
      { title: "Soma vetorial e resultante", paragraphs: ["A resultante é o vetor único que produz o mesmo efeito que um conjunto de vetores. Quando vetores têm a mesma direção, a soma pode ser feita por sinais. Quando formam ângulo, é comum usar decomposição ou relações trigonométricas.", "Em eixos perpendiculares, analisamos separadamente componente horizontal e vertical. Depois, reconstruímos o vetor resultante se necessário."] },
      { title: "Decomposição em componentes", paragraphs: ["Decompor um vetor significa projetá-lo em dois eixos. Em geral, usamos eixo x horizontal e eixo y vertical. Isso transforma um problema inclinado em dois problemas mais simples.", "A componente em cada eixo depende do ângulo informado. Se o ângulo é medido a partir da horizontal, o cosseno costuma aparecer na componente horizontal e o seno na vertical."] },
    ],
    formulas: [
      { title: "Componentes retangulares", tokens: [I("R"), SUB("x"), T(" = "), I("R"), DOT(), T("cos"), I("q"), T("     "), I("R"), SUB("y"), T(" = "), I("R"), DOT(), T("sen"), I("q")], use: "Usada para decompor um vetor R que forma ângulo θ com o eixo horizontal.", vars: ["Rx: componente horizontal.", "Ry: componente vertical.", "R: módulo do vetor.", "θ: ângulo em relação ao eixo x."], example: "Para R = 10 m e θ = 30°, Rx = 10 · cos30° ≈ 8,7 m e Ry = 10 · sen30° = 5 m." },
      { title: "Módulo da resultante por Pitágoras", tokens: [I("R"), SUP("2"), T(" = "), I("R"), SUB("x"), SUP("2"), T(" + "), I("R"), SUB("y"), SUP("2")], use: "Quando as componentes são perpendiculares, o módulo da resultante é obtido pelo teorema de Pitágoras.", vars: ["R: módulo da resultante.", "Rx: componente no eixo x.", "Ry: componente no eixo y."], example: "Se Rx = 6 m e Ry = 8 m, então R² = 36 + 64 = 100, logo R = 10 m." },
    ],
    examples: [
      "Um barco tenta atravessar um rio com velocidade perpendicular à margem, mas a correnteza o arrasta horizontalmente. O movimento real é a resultante vetorial entre a velocidade do barco e a velocidade da correnteza.",
      "Um vetor velocidade de 20 m/s faz 60° com a horizontal. A componente horizontal é 10 m/s e a vertical é aproximadamente 17,3 m/s. Essas componentes podem ser analisadas separadamente.",
    ],
    summary: ["Vetores têm módulo, direção e sentido.", "Componentes transformam problemas inclinados em problemas por eixo.", "A resultante substitui vários vetores por um único vetor equivalente.", "Pitágoras vale diretamente para componentes perpendiculares."],
  },
  {
    file: "bloco5-movimento-circular-e-polias.pdf",
    html: "bloco5-movimento-circular-e-polias.html",
    title: "Bloco 5: Movimento Circular e Polias",
    subtitle: "Período, frequência, velocidade angular, velocidade tangencial, aceleração centrípeta e transmissão de movimento.",
    illustration: "circular",
    guide: "Neste bloco, pense em duas linguagens: a angular, que descreve a rotação, e a linear, que descreve a velocidade dos pontos da borda.",
    sections: [
      { title: "Movimento circular uniforme", paragraphs: ["No movimento circular uniforme, o módulo da velocidade pode permanecer constante, mas a direção da velocidade muda continuamente. Por isso, mesmo no MCU, existe aceleração: ela aponta para o centro da trajetória e é chamada centrípeta.", "Período é o tempo de uma volta completa. Frequência é o número de voltas por unidade de tempo. Essas duas grandezas são inversas."] },
      { title: "Velocidade angular e tangencial", paragraphs: ["A velocidade angular mede a rapidez da rotação. A velocidade tangencial mede a rapidez de um ponto ao longo da circunferência. Para o mesmo valor de velocidade angular, pontos mais distantes do eixo possuem maior velocidade tangencial.", "Essa diferença explica por que a borda de uma roda percorre distância maior que um ponto próximo ao eixo no mesmo intervalo de tempo."] },
      { title: "Polias e engrenagens", paragraphs: ["Quando duas polias são ligadas por correia sem escorregamento, os pontos de contato da correia têm a mesma velocidade tangencial. Se duas rodas estão presas ao mesmo eixo, elas compartilham a mesma velocidade angular.", "Essa distinção é fundamental: mesma correia sugere mesma velocidade tangencial; mesmo eixo sugere mesma velocidade angular."] },
    ],
    formulas: [
      { title: "Período e frequência", tokens: [I("f"), T(" = "), FR([T("1")], [I("T")])], use: "Relaciona quantas voltas ocorrem por unidade de tempo com o tempo gasto em uma volta.", vars: ["f: frequência, em hertz quando o tempo está em segundos.", "T: período, tempo de uma volta completa."], example: "Se uma roda completa uma volta a cada 0,5 s, então f = 1/0,5 = 2 Hz." },
      { title: "Velocidade angular", tokens: [SY("omega"), T(" = "), FR([T("2"), SY("pi")], [I("T")])], use: "Mede o ângulo varrido por unidade de tempo no movimento circular uniforme.", vars: ["ω: velocidade angular.", "T: período.", "2π: ângulo de uma volta completa em radianos."], example: "Se T = 4 s, então ω = 2π/4 = π/2 rad/s." },
      { title: "Velocidade tangencial", tokens: [I("v"), T(" = "), SY("omega"), DOT(), I("R")], use: "Conecta a rotação à velocidade ao longo da borda da circunferência.", vars: ["v: velocidade tangencial.", "ω: velocidade angular.", "R: raio da trajetória."], example: "Para R = 0,5 m e ω = 6 rad/s, v = 6 · 0,5 = 3 m/s." },
      { title: "Aceleração centrípeta", tokens: [I("a"), SUB("c"), T(" = "), FR([I("v"), SUP("2")], [I("R")])], use: "Indica a aceleração responsável por mudar a direção da velocidade em uma trajetória circular.", vars: ["ac: aceleração centrípeta.", "v: velocidade tangencial.", "R: raio da trajetória."], example: "Se v = 10 m/s e R = 20 m, ac = 100/20 = 5 m/s²." },
    ],
    examples: [
      "Duas polias ligadas por correia têm raios 10 cm e 20 cm. Sem escorregamento, suas bordas têm a mesma velocidade tangencial, mas a menor gira com maior velocidade angular.",
      "Um carro faz uma curva circular de raio 50 m com velocidade 10 m/s. A aceleração centrípeta é 100/50 = 2 m/s², apontando para o centro da curva.",
    ],
    summary: ["Período e frequência são inversos.", "Velocidade angular descreve rotação; tangencial descreve movimento na borda.", "Mesmo eixo: mesma velocidade angular.", "Mesma correia sem escorregamento: mesma velocidade tangencial.", "A aceleração centrípeta aponta para o centro."],
  },
  {
    file: "bloco6-movimentos-verticais.pdf",
    html: "bloco6-movimentos-verticais.html",
    title: "Bloco 6: Movimentos Verticais",
    subtitle: "Queda livre, lançamento vertical, sinal da gravidade, tempo de subida e altura máxima.",
    illustration: "vertical",
    guide: "Aqui o cuidado principal é o sinal. Escolha um eixo, defina o sentido positivo e só depois substitua os valores.",
    sections: [
      { title: "Queda livre e gravidade", paragraphs: ["Movimentos verticais próximos à superfície da Terra podem ser modelados como MRUV, porque a aceleração da gravidade é aproximadamente constante. Em exercícios introdutórios, costuma-se adotar g = 10 m/s².", "Queda livre não significa ausência de gravidade. Significa que a gravidade é a influência principal considerada no modelo, desprezando resistência do ar."] },
      { title: "Lançamento vertical para cima", paragraphs: ["Quando um corpo é lançado para cima, ele sobe desacelerando, para instantaneamente no ponto mais alto e depois desce acelerando. No ponto mais alto, a velocidade é zero, mas a aceleração da gravidade continua existindo.", "O tempo de subida e a altura máxima costumam ser encontrados usando a equação da velocidade ou Torricelli."] },
      { title: "Sinais e eixo escolhido", paragraphs: ["Se o eixo positivo é para cima, a gravidade entra como -g. Se o eixo positivo é para baixo, ela entra como +g. Nenhuma escolha é errada; o erro é trocar de convenção no meio da resolução.", "A posição inicial também precisa ser coerente com o eixo. Em quedas a partir de determinada altura, pode ser conveniente colocar o solo como origem."] },
    ],
    formulas: [
      { title: "Velocidade no movimento vertical", tokens: [I("v"), T(" = "), I("v"), SUB("0"), T(" + "), I("a"), DOT(), I("t")], use: "É a mesma equação do MRUV, mas a aceleração passa a ser a gravidade com sinal definido pelo eixo.", vars: ["v: velocidade final.", "v0: velocidade inicial.", "a: aceleração, normalmente ±g.", "t: tempo."], example: "Lançando para cima com v0 = 20 m/s e adotando positivo para cima: 0 = 20 - 10t, logo t = 2 s até o ponto mais alto." },
      { title: "Altura em função do tempo", tokens: [I("h"), T(" = "), I("h"), SUB("0"), T(" + "), I("v"), SUB("0"), DOT(), I("t"), T(" + "), FR([I("a"), DOT(), I("t"), SUP("2")], [T("2")])], use: "Permite calcular a altura em certo instante, desde que a origem e o sentido do eixo estejam definidos.", vars: ["h: altura ou posição vertical.", "h0: altura inicial.", "v0: velocidade inicial vertical.", "a: aceleração vertical.", "t: tempo."], example: "Para h0 = 0, v0 = 20 m/s, a = -10 m/s² e t = 2 s: h = 40 - 20 = 20 m." },
      { title: "Altura máxima por Torricelli", tokens: [I("v"), SUP("2"), T(" = "), I("v"), SUB("0"), SUP("2"), T(" + 2"), I("a"), SY("Delta"), I("h")], use: "No ponto mais alto, v = 0. Isso permite encontrar a variação de altura sem calcular o tempo.", vars: ["v: velocidade no ponto analisado.", "v0: velocidade inicial.", "a: aceleração vertical.", "Δh: variação de altura."], example: "Com v0 = 30 m/s e a = -10 m/s²: 0 = 900 - 20Δh, então Δh = 45 m." },
    ],
    examples: [
      "Uma pedra é abandonada de uma altura de 80 m. Com g = 10 m/s² e eixo positivo para baixo: 80 = (10t²)/2, então t = 4 s.",
      "Uma bola é lançada para cima com 15 m/s. O tempo de subida é 1,5 s e a altura máxima é 11,25 m, desprezando a resistência do ar.",
    ],
    summary: ["Movimentos verticais são casos de MRUV.", "A gravidade permanece atuando mesmo no ponto mais alto.", "O sinal de g depende do eixo adotado.", "No lançamento para cima, v = 0 na altura máxima.", "Torricelli é útil para altura máxima sem tempo."],
  },
  {
    file: "bloco7-lancamento-horizontal-e-obliquo.pdf",
    html: "bloco7-lancamento-horizontal-e-obliquo.html",
    title: "Bloco 7: Lançamento Horizontal e Oblíquo",
    subtitle: "Composição de movimentos, independência dos eixos, alcance, altura máxima e decomposição da velocidade inicial.",
    illustration: "projectile",
    guide: "O segredo dos lançamentos é separar em dois movimentos simultâneos: horizontal e vertical. O tempo é comum aos dois eixos.",
    sections: [
      { title: "Composição de movimentos", paragraphs: ["Um lançamento em duas dimensões pode ser dividido em movimento horizontal e movimento vertical. Na horizontal, sem resistência do ar, a velocidade é constante. Na vertical, o movimento é uniformemente variado pela gravidade.", "Esses movimentos acontecem ao mesmo tempo. Por isso, o tempo encontrado no eixo vertical também vale para calcular o alcance horizontal."] },
      { title: "Lançamento horizontal", paragraphs: ["No lançamento horizontal, o corpo sai com velocidade inicial apenas no eixo x. A velocidade vertical inicial é zero. O tempo de queda depende da altura e da gravidade; o alcance depende da velocidade horizontal e do tempo de queda.", "Esse caso aparece em objetos lançados de mesas, aviões soltando cargas e projéteis que deixam uma borda horizontalmente."] },
      { title: "Lançamento oblíquo", paragraphs: ["No lançamento oblíquo, a velocidade inicial forma um ângulo com a horizontal. Ela precisa ser decomposta em componente horizontal e componente vertical. A componente horizontal permanece constante e a vertical varia por causa da gravidade.", "Em lançamentos que partem e chegam à mesma altura, o movimento costuma ser simétrico: tempo de subida igual ao de descida e velocidade vertical final com mesmo módulo da inicial, mas sentido oposto."] },
    ],
    formulas: [
      { title: "Decomposição da velocidade inicial", tokens: [I("v"), SUB("x"), T(" = "), I("v"), SUB("0"), DOT(), T("cos"), I("q"), T("     "), I("v"), SUB("y0"), T(" = "), I("v"), SUB("0"), DOT(), T("sen"), I("q")], use: "Transforma a velocidade inclinada em duas componentes independentes.", vars: ["vx: componente horizontal da velocidade.", "vy0: componente vertical inicial.", "v0: módulo da velocidade inicial.", "θ: ângulo de lançamento."], example: "Com v0 = 20 m/s e θ = 30°, vx ≈ 17,3 m/s e vy0 = 10 m/s." },
      { title: "Movimento horizontal", tokens: [I("x"), T(" = "), I("x"), SUB("0"), T(" + "), I("v"), SUB("x"), DOT(), I("t")], use: "Como a velocidade horizontal é constante, o eixo x é tratado como MRU.", vars: ["x: posição horizontal.", "x0: posição horizontal inicial.", "vx: velocidade horizontal.", "t: tempo."], example: "Se vx = 12 m/s e o tempo de voo é 3 s, o alcance horizontal é 36 m." },
      { title: "Movimento vertical", tokens: [I("y"), T(" = "), I("y"), SUB("0"), T(" + "), I("v"), SUB("y0"), DOT(), I("t"), T(" - "), FR([I("g"), DOT(), I("t"), SUP("2")], [T("2")])], use: "O eixo vertical é tratado como MRUV sob ação da gravidade, adotando o sentido positivo para cima.", vars: ["y: posição vertical.", "y0: posição vertical inicial.", "vy0: velocidade vertical inicial.", "g: aceleração da gravidade.", "t: tempo."], example: "Se y0 = 0, vy0 = 10 m/s e g = 10 m/s², no instante t = 1 s: y = 10 - 5 = 5 m." },
    ],
    examples: [
      "Um objeto sai horizontalmente de uma mesa de 1,25 m com velocidade 4 m/s. O tempo de queda vem de 1,25 = 5t², logo t = 0,5 s. O alcance é x = 4 · 0,5 = 2 m.",
      "Um projétil é lançado a 20 m/s formando 30° com a horizontal. A componente vertical inicial é 10 m/s; o tempo até o topo é 1 s e a altura máxima é 5 m em relação ao ponto de lançamento.",
    ],
    summary: ["O lançamento bidimensional é estudado por componentes.", "Horizontal sem resistência do ar: MRU.", "Vertical: MRUV com gravidade.", "O tempo é comum aos dois eixos.", "No lançamento oblíquo, decomponha a velocidade inicial antes de calcular."],
  },
];

const aprofundamentos = {
  "bloco1-introducao-cinematica.pdf": {
    sections: [
      { title: "Como diferenciar as grandezas na prática", paragraphs: ["Uma boa resolução começa separando o que é posição, o que é deslocamento e o que é distância percorrida. Posição é um endereço no eixo; deslocamento é a mudança de endereço; distância é o comprimento do caminho realizado.", "Quando o móvel muda de sentido, a distância percorrida continua aumentando, mas o deslocamento pode diminuir, zerar ou até mudar de sinal. Essa diferença é uma das bases de toda a Cinemática."] },
      { title: "Armadilhas frequentes em questões iniciais", paragraphs: ["É comum o enunciado usar expressões como ida e volta, retorna ao ponto inicial ou percorre determinado caminho. Essas palavras costumam indicar que distância percorrida e deslocamento não serão iguais.", "Outra armadilha aparece em velocidade média. Se o problema pede velocidade escalar média usando o caminho total, a distância percorrida pode ser relevante. Se pede deslocamento médio ou velocidade vetorial média, o deslocamento é a grandeza central."], bullets: ["Leia se o problema pede distância ou deslocamento.", "Observe se houve mudança de sentido.", "Não confunda posição final com caminho percorrido.", "Declare o referencial antes de interpretar repouso ou movimento."] },
    ],
    formulas: [
      { title: "Intervalo de tempo", tokens: [SY("Delta"), I("t"), T(" = "), I("t"), T(" - "), I("t"), SUB("0")], use: "O intervalo de tempo mede a duração do fenômeno. Ele não depende da posição do móvel, apenas dos instantes final e inicial.", vars: ["Δt: intervalo de tempo.", "t: instante final.", "t0: instante inicial."], example: "Se um movimento começa às 14 h 10 min e termina às 14 h 40 min, então Δt = 30 min = 0,5 h." },
      { title: "Velocidade média usando distância total", tokens: [I("v"), SUB("esc"), T(" = "), FR([I("d"), SUB("total")], [SY("Delta"), I("t")])], use: "Algumas questões trabalham com a rapidez média ao longo do caminho total. Nesse caso, usa-se a distância percorrida.", vars: ["vesc: velocidade escalar média associada ao caminho.", "dtotal: distância total percorrida.", "Δt: tempo total gasto."], example: "Um aluno anda 300 m para ir e 300 m para voltar em 10 min. A distância total é 600 m, então a velocidade escalar média é 60 m/min." },
    ],
    examples: [
      "Um atleta dá uma volta completa em uma pista circular de 400 m e retorna ao ponto inicial. A distância percorrida é 400 m, mas o deslocamento é zero. Essa diferença explica por que a velocidade vetorial média seria nula.",
      "Se uma pessoa sai da posição -5 m e chega à posição 12 m, o deslocamento é 17 m. O sinal positivo indica que ela avançou no sentido positivo do eixo.",
    ],
  },
  "bloco2-mru.pdf": {
    sections: [
      { title: "MRU em unidades diferentes", paragraphs: ["Muitos erros em MRU não são de Física, mas de unidade. Antes de calcular, confirme se velocidade, distância e tempo estão no mesmo sistema. Km/h combina naturalmente com quilômetros e horas; m/s combina com metros e segundos.", "A conversão mais usada é entre km/h e m/s. Para passar de m/s para km/h, multiplica-se por 3,6. Para passar de km/h para m/s, divide-se por 3,6."] },
      { title: "Ultrapassagem e movimento relativo", paragraphs: ["Em ultrapassagens, a distância a ser vencida pode não ser apenas a separação inicial: muitas vezes inclui o comprimento dos veículos. O movimento relativo simplifica o problema, porque permite analisar um móvel em relação ao outro.", "Se os móveis estão no mesmo sentido, a velocidade relativa é a diferença dos módulos. Se estão em sentidos opostos, é a soma dos módulos, desde que os sentidos estejam bem definidos."] },
    ],
    formulas: [
      { title: "Conversão de velocidade", tokens: [I("v"), SUB("m/s"), T(" = "), FR([I("v"), SUB("km/h")], [T("3,6")])], use: "Transforma velocidade em km/h para m/s quando o restante do problema está no Sistema Internacional.", vars: ["v(m/s): velocidade em metros por segundo.", "v(km/h): velocidade em quilômetros por hora."], example: "72 km/h = 72/3,6 = 20 m/s." },
      { title: "Condição de encontro", tokens: [I("s"), SUB("A"), T(" = "), I("s"), SUB("B")], use: "Dois móveis se encontram quando ocupam a mesma posição no mesmo instante.", vars: ["sA: posição do móvel A.", "sB: posição do móvel B."], example: "Se sA = 10 + 5t e sB = 70 - 10t, então 10 + 5t = 70 - 10t, logo t = 4 s." },
    ],
    examples: [
      "Um trem de 120 m ultrapassa uma ponte de 180 m com velocidade constante de 15 m/s. Para sair completamente da ponte, precisa percorrer 300 m. O tempo é 300/15 = 20 s.",
      "Dois ciclistas separados por 900 m pedalam um em direção ao outro com velocidades 4 m/s e 5 m/s. A velocidade de aproximação é 9 m/s, então o encontro ocorre em 100 s.",
    ],
  },
  "bloco3-mruv.pdf": {
    sections: [
      { title: "Aceleração positiva não significa sempre acelerar", paragraphs: ["A palavra acelerar no cotidiano costuma significar aumentar a velocidade. Em Física, aceleração é variação da velocidade. Se a velocidade é negativa e a aceleração é positiva, o módulo da velocidade pode diminuir.", "Por isso, a classificação entre movimento acelerado ou retardado depende da comparação entre os sinais de velocidade e aceleração. Mesmo sinal: módulo da velocidade aumenta. Sinais opostos: módulo da velocidade diminui."] },
      { title: "Organização algébrica antes dos números", paragraphs: ["Problemas de MRUV ficam mais limpos quando você identifica primeiro as grandezas conhecidas. Escreva v0, v, a, t e Δs. Depois escolha a equação que contém apenas uma incógnita.", "Essa rotina evita a tentativa de encaixar fórmulas decoradas e aproxima o estudo do raciocínio usado em livros de Física."] },
    ],
    formulas: [
      { title: "Aceleração média", tokens: [I("a"), T(" = "), FR([SY("Delta"), I("v")], [SY("Delta"), I("t")])], use: "Mede quanto a velocidade varia por unidade de tempo. No MRUV, esse valor é constante.", vars: ["a: aceleração média.", "Δv: variação de velocidade.", "Δt: intervalo de tempo."], example: "Se a velocidade passa de 6 m/s para 18 m/s em 4 s, então a = 12/4 = 3 m/s²." },
      { title: "Deslocamento pela velocidade média no MRUV", tokens: [SY("Delta"), I("s"), T(" = "), FR([I("v"), T(" + "), I("v"), SUB("0")], [T("2")]), DOT(), I("t")], use: "No MRUV, a velocidade média entre dois instantes é a média aritmética das velocidades inicial e final.", vars: ["Δs: deslocamento.", "v: velocidade final.", "v0: velocidade inicial.", "t: tempo."], example: "Se v0 = 4 m/s, v = 16 m/s e t = 5 s, então Δs = ((16 + 4)/2) · 5 = 50 m." },
    ],
    examples: [
      "Um carro reduz de 25 m/s para 5 m/s em 4 s. A aceleração é (5 - 25)/4 = -5 m/s². O sinal negativo indica aceleração oposta ao sentido positivo escolhido.",
      "Um móvel com v0 = 10 m/s sofre aceleração -2 m/s². Após 3 s, v = 10 - 6 = 4 m/s. O movimento ainda é para frente se o eixo positivo acompanha a velocidade inicial, mas está retardado.",
    ],
  },
  "bloco4-vetores-do-movimento.pdf": {
    sections: [
      { title: "Quando usar trigonometria", paragraphs: ["A trigonometria aparece quando um vetor está inclinado em relação aos eixos. O seno e o cosseno não são fórmulas decoradas: eles representam projeções do vetor sobre direções perpendiculares.", "Se o ângulo está com o eixo horizontal, a componente horizontal usa cosseno e a vertical usa seno. Se o ângulo estiver com o eixo vertical, essa associação pode inverter."] },
      { title: "Vetores em movimentos reais", paragraphs: ["Em lançamentos oblíquos, a velocidade inicial é um vetor inclinado. Em curvas, a velocidade muda de direção. Em rios, a velocidade do barco se soma à velocidade da correnteza.", "Esses exemplos mostram por que vetores não são apenas um detalhe matemático: eles descrevem a geometria real do movimento."] },
    ],
    formulas: [
      { title: "Lei dos cossenos para resultante", tokens: [I("R"), SUP("2"), T(" = "), I("A"), SUP("2"), T(" + "), I("B"), SUP("2"), T(" + 2"), I("A"), I("B"), T("cos"), I("q")], use: "Usada para encontrar a resultante de dois vetores que formam ângulo θ entre si.", vars: ["R: módulo da resultante.", "A e B: módulos dos vetores somados.", "θ: ângulo entre os vetores."], example: "Dois vetores de 6 m e 8 m perpendiculares têm cos90° = 0. Assim, R² = 36 + 64 e R = 10 m." },
      { title: "Tangente do ângulo da resultante", tokens: [T("tg"), I("q"), T(" = "), FR([I("R"), SUB("y")], [I("R"), SUB("x")])], use: "Permite encontrar a direção da resultante quando suas componentes são conhecidas.", vars: ["θ: ângulo em relação ao eixo x.", "Ry: componente vertical.", "Rx: componente horizontal."], example: "Se Rx = 12 e Ry = 9, tgθ = 9/12 = 0,75. O ângulo é aquele cuja tangente vale 0,75." },
    ],
    examples: [
      "Um avião aponta para norte, mas há vento para leste. A velocidade em relação ao solo é a soma vetorial da velocidade do avião com a velocidade do vento.",
      "Um deslocamento de 5 m para leste seguido de 12 m para norte resulta em um deslocamento de módulo 13 m, pelo triângulo retângulo 5-12-13.",
    ],
  },
  "bloco5-movimento-circular-e-polias.pdf": {
    sections: [
      { title: "Por que existe aceleração se a velocidade é constante", paragraphs: ["No MCU, o módulo da velocidade pode ser constante, mas a velocidade é uma grandeza vetorial. Como sua direção muda a todo instante, há variação de velocidade e, portanto, aceleração.", "A aceleração centrípeta não aumenta o módulo da velocidade; ela muda a direção do vetor velocidade, mantendo o corpo na trajetória curva."] },
      { title: "Transmissão de movimento em sistemas de polias", paragraphs: ["Em polias com correia sem escorregamento, a correia impõe a mesma velocidade tangencial às bordas. Como v = ωR, uma polia menor precisa ter maior velocidade angular para acompanhar a mesma velocidade tangencial.", "Em rodas no mesmo eixo, todos os pontos dão a mesma quantidade de voltas no mesmo tempo; por isso, a velocidade angular é igual para as rodas solidárias ao eixo."] },
    ],
    formulas: [
      { title: "Relação entre arcos e ângulos", tokens: [SY("Delta"), I("s"), T(" = "), I("R"), DOT(), SY("Delta"), I("q")], use: "Relaciona o comprimento de arco percorrido com o ângulo varrido em radianos.", vars: ["Δs: comprimento do arco.", "R: raio da circunferência.", "Δθ: deslocamento angular em radianos."], example: "Se R = 2 m e Δθ = 3 rad, então Δs = 6 m." },
      { title: "Polias ligadas por correia", tokens: [I("v"), SUB("1"), T(" = "), I("v"), SUB("2"), T("  então  "), SY("omega"), SUB("1"), I("R"), SUB("1"), T(" = "), SY("omega"), SUB("2"), I("R"), SUB("2")], use: "Sem escorregamento, a velocidade tangencial nas bordas das polias é a mesma.", vars: ["v1 e v2: velocidades tangenciais nas bordas.", "ω1 e ω2: velocidades angulares.", "R1 e R2: raios das polias."], example: "Se R1 é metade de R2, então ω1 precisa ser o dobro de ω2 para manter a mesma velocidade tangencial." },
    ],
    examples: [
      "Uma roda de bicicleta com raio 0,35 m gira com frequência 2 Hz. Sua velocidade angular é 4π rad/s e a velocidade tangencial da borda é aproximadamente 4,4 m/s.",
      "Uma polia de raio 5 cm está ligada por correia a outra de 15 cm. A polia menor gira três vezes mais rápido em velocidade angular.",
    ],
  },
  "bloco6-movimentos-verticais.pdf": {
    sections: [
      { title: "Simetria no lançamento vertical", paragraphs: ["Quando um corpo é lançado verticalmente para cima e retorna ao mesmo nível de lançamento, o tempo de subida é igual ao tempo de descida, desprezando a resistência do ar.", "A velocidade ao retornar ao nível inicial tem mesmo módulo da velocidade de lançamento, mas sentido oposto. Essa simetria é consequência da aceleração constante da gravidade."] },
      { title: "Escolhendo a origem", paragraphs: ["Em queda livre, escolher o solo como origem pode facilitar a interpretação da altura. Em outros casos, escolher o ponto de lançamento como origem deixa as equações mais simples.", "Não existe origem obrigatória. O importante é que posições, deslocamentos e sinal da gravidade sejam compatíveis com essa escolha."] },
    ],
    formulas: [
      { title: "Tempo de subida", tokens: [I("t"), SUB("subida"), T(" = "), FR([I("v"), SUB("0")], [I("g")])], use: "Vale para lançamento vertical para cima quando se usa o módulo da gravidade e a velocidade inicial vertical.", vars: ["tsubida: tempo até o ponto mais alto.", "v0: velocidade inicial para cima.", "g: módulo da gravidade."], example: "Com v0 = 25 m/s e g = 10 m/s², tsubida = 2,5 s." },
      { title: "Altura máxima", tokens: [I("H"), SUB("max"), T(" = "), FR([I("v"), SUB("0"), SUP("2")], [T("2"), I("g")])], use: "Calcula a altura máxima em relação ao ponto de lançamento, desprezando a resistência do ar.", vars: ["Hmax: altura máxima relativa.", "v0: velocidade inicial para cima.", "g: módulo da gravidade."], example: "Com v0 = 20 m/s e g = 10 m/s², Hmax = 400/20 = 20 m." },
    ],
    examples: [
      "Um corpo é lançado para cima com 40 m/s. O tempo de subida é 4 s, o tempo total de voo até voltar ao mesmo nível é 8 s e a altura máxima é 80 m.",
      "Uma pedra é abandonada do repouso. Após 3 s de queda, sua velocidade é 30 m/s para baixo e ela percorreu 45 m, adotando g = 10 m/s².",
    ],
  },
  "bloco7-lancamento-horizontal-e-obliquo.pdf": {
    sections: [
      { title: "Independência dos movimentos", paragraphs: ["A independência dos eixos significa que o movimento horizontal não altera diretamente o movimento vertical, e vice-versa. Eles compartilham o mesmo tempo, mas obedecem a equações diferentes.", "Essa ideia explica por que dois objetos abandonados da mesma altura, um solto verticalmente e outro lançado horizontalmente, chegam ao solo ao mesmo tempo se a resistência do ar for desprezada."] },
      { title: "Alcance e altura máxima", paragraphs: ["Em lançamentos oblíquos que partem e chegam à mesma altura, existem fórmulas diretas para alcance e altura máxima. Elas são úteis, mas devem ser usadas com atenção às condições do problema.", "Se o ponto de chegada está em altura diferente do ponto de lançamento, é mais seguro usar as equações por eixo em vez de decorar fórmulas específicas."] },
    ],
    formulas: [
      { title: "Tempo total em lançamento oblíquo no mesmo nível", tokens: [I("T"), T(" = "), FR([T("2"), I("v"), SUB("0"), T("sen"), I("q")], [I("g")])], use: "Vale quando o projétil sai e retorna ao mesmo nível vertical.", vars: ["T: tempo total de voo.", "v0: velocidade inicial.", "θ: ângulo de lançamento.", "g: módulo da gravidade."], example: "Com v0 = 20 m/s, θ = 30° e g = 10 m/s², T = 2 · 20 · 0,5 / 10 = 2 s." },
      { title: "Alcance horizontal no mesmo nível", tokens: [I("A"), T(" = "), FR([I("v"), SUB("0"), SUP("2"), T("sen 2"), I("q")], [I("g")])], use: "Calcula o alcance quando lançamento e queda ocorrem no mesmo nível.", vars: ["A: alcance horizontal.", "v0: velocidade inicial.", "θ: ângulo de lançamento.", "g: gravidade."], example: "Para v0 = 20 m/s e θ = 45°, sen90° = 1. Assim, A = 400/10 = 40 m." },
      { title: "Altura máxima do lançamento oblíquo", tokens: [I("H"), SUB("max"), T(" = "), FR([I("v"), SUB("0"), SUP("2"), T("sen"), SUP("2"), I("q")], [T("2"), I("g")])], use: "Determina a altura máxima em relação ao ponto de lançamento.", vars: ["Hmax: altura máxima.", "v0: velocidade inicial.", "θ: ângulo de lançamento.", "g: gravidade."], example: "Com v0 = 20 m/s e θ = 30°, Hmax = 400 · 0,25 / 20 = 5 m." },
    ],
    examples: [
      "Dois projéteis são lançados com a mesma velocidade inicial em ângulos complementares, como 30° e 60°. Se partem e chegam ao mesmo nível, têm o mesmo alcance, mas alturas máximas diferentes.",
      "Em um lançamento horizontal, dobrar a velocidade horizontal dobra o alcance se a altura de queda permanecer a mesma, porque o tempo de queda não depende da velocidade horizontal.",
    ],
  },
};

apostilas.forEach((item) => {
  const extra = aprofundamentos[item.file];
  if (!extra) return;
  item.sections.push(...extra.sections);
  item.formulas.push(...extra.formulas);
  item.examples.push(...extra.examples);
});

apostilas.forEach((item) => {
  if (!item.subject) item.subject = "Cinemática";
});

apostilas.push(
  {
    subject: "Termologia",
    file: "termologia1-fundamentos-de-termologia.pdf",
    html: "termologia1-fundamentos-de-termologia.html",
    title: "Termologia 1: Fundamentos de Termologia",
    subtitle: "Temperatura, calor, equilíbrio térmico, energia interna e linguagem inicial dos fenômenos térmicos.",
    illustration: "vertical",
    guide: "Comece separando temperatura de calor. Temperatura mede estado térmico; calor é energia em trânsito por diferença de temperatura.",
    sections: [
      { title: "Temperatura e agitação térmica", paragraphs: ["Temperatura está relacionada ao grau de agitação microscópica das partículas de um corpo. Quanto maior a temperatura, maior tende a ser a energia cinética média das partículas.", "Essa descrição microscópica ajuda a entender por que corpos aparentemente parados possuem energia interna: suas moléculas continuam em movimento."] },
      { title: "Calor não é algo que o corpo possui", paragraphs: ["Calor é energia térmica em trânsito entre corpos ou sistemas devido a uma diferença de temperatura. Um corpo não contém calor; ele contém energia interna.", "Quando dois corpos a temperaturas diferentes entram em contato térmico, a energia flui espontaneamente do corpo de maior temperatura para o de menor temperatura até o equilíbrio térmico."] },
      { title: "Equilíbrio térmico e lei zero", paragraphs: ["Dois corpos estão em equilíbrio térmico quando não há troca líquida de calor entre eles. A lei zero da Termodinâmica permite definir temperatura como grandeza comparável entre sistemas.", "Se A está em equilíbrio térmico com B, e B está em equilíbrio térmico com C, então A e C também estão em equilíbrio térmico."] },
      { title: "Energia interna", paragraphs: ["Energia interna é a energia associada ao estado microscópico do sistema: movimentos, interações e organização das partículas. Em gases ideais, ela depende diretamente da temperatura.", "Essa grandeza será fundamental na Termodinâmica, porque permite relacionar calor, trabalho e variação do estado do sistema."] },
    ],
    formulas: [
      { title: "Variação de temperatura", tokens: [SY("Delta"), I("T"), T(" = "), I("T"), T(" - "), I("T"), SUB("0")], use: "Compara a temperatura final com a inicial. O sinal indica aquecimento ou resfriamento.", vars: ["ΔT: variação de temperatura.", "T: temperatura final.", "T0: temperatura inicial."], example: "De 20 °C para 80 °C, ΔT = 60 °C. O corpo aqueceu." },
      { title: "Equilíbrio térmico ideal", tokens: [I("T"), SUB("A"), T(" = "), I("T"), SUB("B")], use: "No equilíbrio térmico, os corpos em contato atingem a mesma temperatura final.", vars: ["TA e TB: temperaturas dos corpos em contato."], example: "Um termômetro mede corretamente quando entra em equilíbrio térmico com o corpo analisado." },
      { title: "Energia interna de gás ideal monoatômico", tokens: [I("U"), T(" = "), FR([T("3"), I("n"), I("R"), I("T")], [T("2")])], use: "Mostra que a energia interna de um gás ideal monoatômico depende da temperatura absoluta.", vars: ["U: energia interna.", "n: quantidade de matéria.", "R: constante dos gases.", "T: temperatura em kelvin."], example: "Se a temperatura absoluta dobra, a energia interna também dobra para o mesmo gás." },
    ],
    examples: ["Uma colher metálica em uma xícara quente aquece porque recebe energia térmica do café até se aproximar da mesma temperatura.", "Ao medir febre, o termômetro não mede calor do corpo: ele atinge equilíbrio térmico e indica temperatura.", "Um gás aquecido em recipiente rígido aumenta sua energia interna porque suas partículas passam a se mover com maior energia média."],
    summary: ["Temperatura está ligada à agitação térmica.", "Calor é energia em trânsito, não algo armazenado.", "Equilíbrio térmico ocorre quando não há troca líquida de calor.", "Energia interna descreve o estado microscópico do sistema."],
  },
  {
    subject: "Termologia",
    file: "termologia2-escalas-termicas.pdf",
    html: "termologia2-escalas-termicas.html",
    title: "Termologia 2: Escalas Térmicas",
    subtitle: "Celsius, Fahrenheit, Kelvin, conversões de temperatura e interpretação de variações térmicas.",
    illustration: "vertical",
    guide: "Em escalas térmicas, diferencie temperatura marcada de variação de temperatura. Essa diferença evita boa parte dos erros.",
    sections: [
      { title: "Escalas termométricas", paragraphs: ["Escalas térmicas são formas de atribuir números ao estado térmico de um corpo. Celsius e Fahrenheit são escalas usuais; Kelvin é a escala absoluta usada no estudo de gases e termodinâmica.", "A escala Kelvin não usa grau e começa no zero absoluto, limite teórico associado à mínima agitação térmica possível no modelo clássico."] },
      { title: "Pontos fixos e relação linear", paragraphs: ["As escalas usuais são construídas com pontos fixos, como fusão e ebulição da água sob pressão padrão. Entre esses pontos, a relação entre escalas é linear.", "Por isso, a conversão pode ser feita por proporção ou por fórmulas prontas. O importante é saber de onde elas vêm."] },
      { title: "Variações de temperatura", paragraphs: ["Uma variação de 1 °C equivale a uma variação de 1 K, mas a temperatura 1 °C não equivale a 1 K. Já Fahrenheit possui intervalo diferente.", "Em calorimetria, quase sempre usamos variação de temperatura. Em gases, usamos temperatura absoluta em kelvin."] },
      { title: "Erro comum", paragraphs: ["Nunca substitua temperatura em Celsius na equação dos gases ideais. A escala correta é Kelvin, porque as leis dos gases dependem da temperatura absoluta.", "Também não escreva 0 °C como ausência de temperatura. 0 °C corresponde a 273 K, bem acima do zero absoluto."] },
    ],
    formulas: [
      { title: "Celsius e Kelvin", tokens: [I("T"), SUB("K"), T(" = "), I("T"), SUB("C"), T(" + 273")], use: "Converte temperatura em Celsius para Kelvin em problemas introdutórios.", vars: ["TK: temperatura em kelvin.", "TC: temperatura em Celsius."], example: "27 °C corresponde a 300 K." },
      { title: "Celsius e Fahrenheit", tokens: [FR([I("T"), SUB("C")], [T("5")]), T(" = "), FR([I("T"), SUB("F"), T(" - 32")], [T("9")])], use: "Relaciona as duas escalas por proporcionalidade entre seus intervalos.", vars: ["TC: temperatura em Celsius.", "TF: temperatura em Fahrenheit."], example: "Para 20 °C: TF = 9 · 20/5 + 32 = 68 °F." },
      { title: "Variação entre Celsius e Fahrenheit", tokens: [FR([SY("Delta"), I("T"), SUB("C")], [T("5")]), T(" = "), FR([SY("Delta"), I("T"), SUB("F")], [T("9")])], use: "Usada quando o problema fala em aumento ou diminuição de temperatura.", vars: ["ΔTC: variação em Celsius.", "ΔTF: variação em Fahrenheit."], example: "Uma variação de 10 °C corresponde a 18 °F." },
    ],
    examples: ["Um corpo passa de 20 °C para 50 °C. A variação é 30 °C, ou 30 K.", "A temperatura de 300 K corresponde a 27 °C, pois TC = 300 - 273.", "Se uma cidade varia 15 °C ao longo do dia, essa variação equivale a 27 °F."],
    summary: ["Kelvin é escala absoluta.", "Variação em Celsius tem mesmo valor numérico em Kelvin.", "Fahrenheit possui intervalo diferente.", "Gases exigem temperatura em kelvin."],
  },
  {
    subject: "Termologia",
    file: "termologia3-dilatacao-termica.pdf",
    html: "termologia3-dilatacao-termica.html",
    title: "Termologia 3: Dilatação Térmica",
    subtitle: "Dilatação linear, superficial, volumétrica, coeficientes e comportamento anômalo da água.",
    illustration: "vertical",
    guide: "Pense em dilatação como mudança de dimensão causada por variação de temperatura. A geometria do corpo define se usamos comprimento, área ou volume.",
    sections: [
      { title: "Por que os corpos dilatam", paragraphs: ["Ao aquecer um sólido, suas partículas vibram com maior intensidade e tendem a se afastar em média. O resultado macroscópico é aumento de dimensões.", "Em resfriamento, geralmente ocorre contração. A intensidade depende do material, representada pelo coeficiente de dilatação."] },
      { title: "Dilatação linear", paragraphs: ["É usada quando uma dimensão predomina, como fios, barras e trilhos. A variação de comprimento é proporcional ao comprimento inicial e à variação de temperatura.", "Juntas de dilatação em pontes e trilhos existem para evitar deformações perigosas durante aquecimento."] },
      { title: "Dilatação superficial e volumétrica", paragraphs: ["Quando duas dimensões importam, usamos dilatação superficial. Quando o volume do corpo importa, usamos dilatação volumétrica.", "Para materiais isotrópicos, os coeficientes aproximados obedecem: β ≈ 2α e γ ≈ 3α."] },
      { title: "Dilatação dos líquidos", paragraphs: ["Líquidos também dilatam, mas precisam de recipiente. O que observamos muitas vezes é dilatação aparente, resultado da dilatação real do líquido menos a dilatação do recipiente.", "A água tem comportamento anômalo entre 0 °C e 4 °C: ao aquecer de 0 °C a 4 °C, seu volume diminui."] },
    ],
    formulas: [
      { title: "Dilatação linear", tokens: [SY("Delta"), I("L"), T(" = "), I("L"), SUB("0"), SY("alpha"), SY("Delta"), I("T")], use: "Calcula a variação de comprimento de uma barra ou fio.", vars: ["ΔL: variação de comprimento.", "L0: comprimento inicial.", "α: coeficiente de dilatação linear.", "ΔT: variação de temperatura."], example: "Uma barra de 2 m com α = 10^-5 °C^-1 aquece 50 °C. ΔL = 2 · 10^-5 · 50 = 0,001 m." },
      { title: "Dilatação superficial", tokens: [SY("Delta"), I("A"), T(" = "), I("A"), SUB("0"), I("beta"), SY("Delta"), I("T")], use: "Aplica-se quando a área do corpo varia com a temperatura.", vars: ["ΔA: variação de área.", "A0: área inicial.", "β: coeficiente superficial.", "ΔT: variação térmica."], example: "Se α = 2 · 10^-5 °C^-1, então β ≈ 4 · 10^-5 °C^-1." },
      { title: "Dilatação volumétrica", tokens: [SY("Delta"), I("V"), T(" = "), I("V"), SUB("0"), SY("gamma"), SY("Delta"), I("T")], use: "Calcula a variação de volume de sólidos ou líquidos.", vars: ["ΔV: variação de volume.", "V0: volume inicial.", "γ: coeficiente volumétrico.", "ΔT: variação de temperatura."], example: "Um líquido de 1 L com γ = 10^-3 °C^-1 aquece 20 °C: ΔV = 0,02 L." },
    ],
    examples: ["Uma tampa metálica presa pode soltar ao ser aquecida porque o metal dilata mais rapidamente que o vidro.", "Trilhos de trem possuem espaçamentos para acomodar dilatação em dias quentes.", "O gelo flutua porque a água se expande ao congelar, ficando menos densa que a água líquida."],
    summary: ["Dilatação depende do material, tamanho inicial e variação térmica.", "Linear: uma dimensão; superficial: duas; volumétrica: três.", "β ≈ 2α e γ ≈ 3α para sólidos isotrópicos.", "A água tem comportamento anômalo próximo de 4 °C."],
  },
  {
    subject: "Termologia",
    file: "termologia4-calorimetria.pdf",
    html: "termologia4-calorimetria.html",
    title: "Termologia 4: Calorimetria",
    subtitle: "Calor sensível, calor latente, capacidade térmica, equilíbrio térmico e trocas de calor.",
    illustration: "vertical",
    guide: "Calorimetria exige atenção ao que muda: temperatura ou estado físico. Se muda temperatura, use calor sensível; se muda fase, use calor latente.",
    sections: [
      { title: "Calor sensível", paragraphs: ["Calor sensível é a energia térmica que provoca variação de temperatura sem mudança de estado físico. Ele depende da massa, do calor específico e da variação de temperatura.", "Materiais com alto calor específico precisam de mais energia para variar a mesma temperatura. A água é um exemplo clássico."] },
      { title: "Calor latente", paragraphs: ["Durante mudança de fase, a temperatura pode permanecer constante enquanto o sistema troca energia. Essa energia é chamada calor latente.", "Na fusão, ebulição, condensação e solidificação, a energia altera a organização molecular, não necessariamente a temperatura."] },
      { title: "Capacidade térmica", paragraphs: ["Capacidade térmica indica quanto calor um corpo precisa receber para variar sua temperatura em uma unidade. Ela depende da massa e do material.", "Calor específico é característica do material; capacidade térmica é característica do corpo específico."] },
      { title: "Equilíbrio térmico em misturas", paragraphs: ["Em um sistema isolado, o calor cedido pelos corpos mais quentes é igual, em módulo, ao calor recebido pelos corpos mais frios.", "A equação de equilíbrio térmico normalmente é escrita como soma dos calores igual a zero, considerando sinais."] },
    ],
    formulas: [
      { title: "Calor sensível", tokens: [I("Q"), T(" = "), I("m"), I("c"), SY("Delta"), I("T")], use: "Usada quando há variação de temperatura sem mudança de fase.", vars: ["Q: quantidade de calor.", "m: massa.", "c: calor específico.", "ΔT: variação de temperatura."], example: "Para aquecer 200 g de água em 10 °C, com c = 1 cal/g°C, Q = 2000 cal." },
      { title: "Calor latente", tokens: [I("Q"), T(" = "), I("m"), I("L")], use: "Usada durante mudança de estado físico.", vars: ["Q: calor trocado.", "m: massa.", "L: calor latente da mudança de fase."], example: "Para fundir 50 g de gelo com L = 80 cal/g, Q = 4000 cal." },
      { title: "Capacidade térmica", tokens: [I("C"), T(" = "), I("m"), I("c")], use: "Relaciona a capacidade de um corpo armazenar energia térmica com sua massa e material.", vars: ["C: capacidade térmica.", "m: massa.", "c: calor específico."], example: "Um corpo de 500 g com c = 0,2 cal/g°C tem C = 100 cal/°C." },
      { title: "Equilíbrio térmico", tokens: [I("Q"), SUB("cedido"), T(" + "), I("Q"), SUB("recebido"), T(" = 0")], use: "Expressa conservação de energia em sistema termicamente isolado.", vars: ["Qcedido: calor negativo para quem perde energia.", "Qrecebido: calor positivo para quem recebe energia."], example: "Água quente misturada com água fria chega a uma temperatura intermediária se não houver perdas." },
    ],
    examples: ["Misturam-se 100 g de água a 80 °C com 100 g de água a 20 °C. Sem perdas, a temperatura final é 50 °C.", "Para transformar gelo a 0 °C em água a 0 °C, não se usa mcΔT, porque a temperatura não muda; usa-se Q = mL.", "Uma panela metálica aquece rápido porque sua capacidade térmica é menor que a de uma grande quantidade de água."],
    summary: ["Calor sensível altera temperatura.", "Calor latente altera estado físico.", "Capacidade térmica depende do corpo; calor específico depende do material.", "Em sistema isolado, soma dos calores é zero."],
  },
  {
    subject: "Termologia",
    file: "termologia5-propagacao-de-calor.pdf",
    html: "termologia5-propagacao-de-calor.html",
    title: "Termologia 5: Propagação de Calor",
    subtitle: "Condução, convecção, irradiação térmica, fluxo de calor e aplicações cotidianas.",
    illustration: "vertical",
    guide: "Associe cada mecanismo ao meio: condução em contato material, convecção em fluidos e irradiação por ondas eletromagnéticas.",
    sections: [
      { title: "Condução térmica", paragraphs: ["Na condução, energia térmica passa de partícula para partícula sem transporte macroscópico de matéria. É muito importante em sólidos, especialmente metais.", "Materiais bons condutores, como metais, transferem calor rapidamente. Isolantes, como madeira e lã, dificultam essa transferência."] },
      { title: "Convecção", paragraphs: ["Na convecção, há transporte de matéria junto com energia térmica. Ocorre em líquidos e gases por diferenças de densidade provocadas pelo aquecimento.", "Ar quente sobe porque fica menos denso; ar frio desce. Esse movimento gera correntes de convecção."] },
      { title: "Irradiação térmica", paragraphs: ["A irradiação ocorre por ondas eletromagnéticas e não precisa de meio material. É assim que a energia solar chega à Terra.", "Superfícies escuras tendem a absorver e emitir radiação com mais eficiência que superfícies claras e polidas."] },
      { title: "Fluxo de calor", paragraphs: ["Fluxo térmico mede a quantidade de calor transferida por unidade de tempo. Quanto maior a diferença de temperatura e a área de contato, maior tende a ser o fluxo.", "A espessura e a condutividade térmica do material também interferem. Paredes grossas e isolantes reduzem transferência de calor."] },
    ],
    formulas: [
      { title: "Fluxo térmico", tokens: [I("Phi"), T(" = "), FR([I("Q")], [SY("Delta"), I("t")])], use: "Mede a rapidez com que o calor é transferido.", vars: ["Φ: fluxo de calor.", "Q: quantidade de calor transferida.", "Δt: intervalo de tempo."], example: "Se 1200 J atravessam uma parede em 60 s, Φ = 20 W." },
      { title: "Lei de Fourier simplificada", tokens: [I("Phi"), T(" = "), FR([I("k"), I("A"), SY("Delta"), I("T")], [I("L")])], use: "Modelo de condução em parede plana em regime estacionário.", vars: ["k: condutividade térmica.", "A: área.", "ΔT: diferença de temperatura.", "L: espessura."], example: "Dobrar a espessura da parede reduz o fluxo pela metade, mantendo o resto constante." },
      { title: "Potência irradiada", tokens: [I("P"), T(" = "), I("e"), I("sigma"), I("A"), I("T"), SUP("4")], use: "Expressa a emissão de radiação térmica por um corpo, em modelo idealizado.", vars: ["P: potência irradiada.", "e: emissividade.", "σ: constante de Stefan-Boltzmann.", "A: área.", "T: temperatura absoluta."], example: "A dependência com T^4 mostra que pequenos aumentos de temperatura podem elevar bastante a emissão." },
    ],
    examples: ["Uma colher metálica esquenta no café por condução.", "O ar-condicionado é instalado no alto porque o ar frio tende a descer, favorecendo convecção.", "Uma roupa preta aquece mais ao Sol porque absorve mais radiação visível e infravermelha."],
    summary: ["Condução ocorre por contato microscópico.", "Convecção envolve transporte de fluido.", "Irradiação não precisa de meio material.", "Fluxo térmico mede calor por unidade de tempo."],
  },
  {
    subject: "Termologia",
    file: "termologia6-estudo-dos-gases.pdf",
    html: "termologia6-estudo-dos-gases.html",
    title: "Termologia 6: Estudo dos Gases",
    subtitle: "Variáveis de estado, transformações gasosas, equação geral e modelo de gás ideal.",
    illustration: "vertical",
    guide: "Use sempre temperatura em kelvin. Em gases, pressão, volume e temperatura formam um conjunto: mexer em uma grandeza geralmente afeta as outras.",
    sections: [
      { title: "Modelo de gás ideal", paragraphs: ["Um gás ideal é um modelo em que as partículas são muito pequenas, não interagem significativamente à distância e colidem elasticamente. Embora idealizado, o modelo descreve bem muitos gases em baixas pressões e altas temperaturas.", "As variáveis de estado principais são pressão, volume, temperatura absoluta e quantidade de matéria."] },
      { title: "Transformações gasosas", paragraphs: ["Transformação isotérmica ocorre a temperatura constante. Isobárica ocorre a pressão constante. Isovolumétrica ocorre a volume constante.", "Cada transformação destaca uma relação diferente entre pressão, volume e temperatura."] },
      { title: "Interpretação microscópica", paragraphs: ["Pressão resulta das colisões das partículas com as paredes do recipiente. Temperatura está ligada à energia cinética média das partículas.", "Quando a temperatura aumenta em recipiente rígido, as partículas colidem com mais intensidade e a pressão aumenta."] },
      { title: "Cuidados de unidade", paragraphs: ["Temperatura deve estar em kelvin. Volume e pressão podem usar unidades variadas desde que haja consistência na equação usada.", "Na equação PV = nRT, use R compatível com as unidades de pressão e volume."] },
    ],
    formulas: [
      { title: "Equação geral dos gases", tokens: [FR([I("P"), SUB("1"), I("V"), SUB("1")], [I("T"), SUB("1")]), T(" = "), FR([I("P"), SUB("2"), I("V"), SUB("2")], [I("T"), SUB("2")])], use: "Relaciona dois estados de uma mesma massa de gás.", vars: ["P: pressão.", "V: volume.", "T: temperatura absoluta em kelvin."], example: "Se T dobra a volume constante, a pressão também dobra." },
      { title: "Equação de Clapeyron", tokens: [I("P"), I("V"), T(" = "), I("n"), I("R"), I("T")], use: "Descreve o estado de um gás ideal.", vars: ["P: pressão.", "V: volume.", "n: mols.", "R: constante dos gases.", "T: temperatura em kelvin."], example: "Para n e T constantes, se o volume diminui, a pressão aumenta." },
      { title: "Lei de Boyle", tokens: [I("P"), I("V"), T(" = constante")], use: "Vale para transformação isotérmica de certa massa gasosa.", vars: ["P: pressão.", "V: volume."], example: "Ao comprimir lentamente uma seringa tampada, o volume diminui e a pressão aumenta." },
    ],
    examples: ["Um balão aquece ao Sol e se expande porque o gás interno tende a aumentar volume quando a temperatura sobe sob pressão externa quase constante.", "Em um pneu aquecido pela estrada, o volume quase não muda; por isso, o aumento de temperatura eleva a pressão.", "Se um gás passa de 300 K para 600 K a volume constante, sua pressão absoluta dobra."],
    summary: ["Gás ideal é um modelo útil para muitos problemas.", "Temperatura em gases deve ser absoluta.", "Isotérmica: T constante; isobárica: P constante; isovolumétrica: V constante.", "PV = nRT organiza pressão, volume, mols e temperatura."],
  },
  {
    subject: "Termologia",
    file: "termologia7-termodinamica.pdf",
    html: "termologia7-termodinamica.html",
    title: "Termologia 7: Termodinâmica",
    subtitle: "Trabalho, calor, energia interna, primeira lei, máquinas térmicas e rendimento.",
    illustration: "vertical",
    guide: "Termodinâmica organiza trocas de energia. A primeira lei é uma contabilidade: energia que entra como calor pode virar trabalho e/ou variar energia interna.",
    sections: [
      { title: "Sistema, vizinhança e transformação", paragraphs: ["Um sistema termodinâmico é a porção do universo que escolhemos estudar. Tudo ao redor é vizinhança. O sistema pode trocar calor, trabalho e matéria dependendo do tipo de fronteira.", "Transformações termodinâmicas descrevem mudanças de estado, como expansão, compressão, aquecimento ou resfriamento."] },
      { title: "Trabalho de um gás", paragraphs: ["Quando um gás se expande contra uma pressão externa, ele realiza trabalho. Quando é comprimido, o trabalho é realizado sobre ele.", "No gráfico pressão versus volume, o trabalho pode ser interpretado como área sob a curva da transformação."] },
      { title: "Primeira lei da Termodinâmica", paragraphs: ["A primeira lei expressa conservação de energia. O calor recebido pelo sistema pode aumentar sua energia interna e/ou ser convertido em trabalho realizado pelo sistema.", "A convenção de sinais precisa ser mantida: em muitos cursos, Q positivo entra no sistema e W positivo é trabalho realizado pelo sistema."] },
      { title: "Máquinas térmicas", paragraphs: ["Máquinas térmicas operam em ciclos, recebem calor de uma fonte quente, rejeitam parte para uma fonte fria e transformam parte em trabalho.", "Nenhuma máquina térmica real converte todo calor recebido em trabalho. Essa limitação é central na segunda lei da Termodinâmica."] },
    ],
    formulas: [
      { title: "Trabalho em pressão constante", tokens: [I("W"), T(" = "), I("P"), SY("Delta"), I("V")], use: "Calcula o trabalho realizado por um gás em transformação isobárica.", vars: ["W: trabalho.", "P: pressão.", "ΔV: variação de volume."], example: "Se P = 2 · 10^5 Pa e ΔV = 0,01 m³, W = 2000 J." },
      { title: "Primeira lei", tokens: [SY("Delta"), I("U"), T(" = "), I("Q"), T(" - "), I("W")], use: "Relaciona variação de energia interna, calor recebido e trabalho realizado pelo sistema.", vars: ["ΔU: variação da energia interna.", "Q: calor recebido.", "W: trabalho realizado pelo sistema."], example: "Se o gás recebe 500 J e realiza 200 J de trabalho, ΔU = 300 J." },
      { title: "Rendimento de máquina térmica", tokens: [I("eta"), T(" = "), FR([I("W")], [I("Q"), SUB("q")])], use: "Indica a fração do calor recebido da fonte quente convertida em trabalho.", vars: ["η: rendimento.", "W: trabalho útil.", "Qq: calor recebido da fonte quente."], example: "Se a máquina recebe 1000 J e realiza 250 J, o rendimento é 25%." },
    ],
    examples: ["Em uma expansão isobárica, o gás empurra o êmbolo e realiza trabalho positivo.", "Em um ciclo completo, a energia interna volta ao valor inicial, então o trabalho líquido é igual ao calor líquido recebido.", "Uma máquina que recebe 800 J e rejeita 500 J realiza 300 J de trabalho; seu rendimento é 37,5%."],
    summary: ["Trabalho de gás está associado à variação de volume.", "A primeira lei é conservação de energia.", "Em ciclo, ΔU = 0.", "Máquinas térmicas nunca convertem todo calor em trabalho útil."],
  },
  {
    subject: "Ondulatória",
    file: "ondulatoria1-conceitos-iniciais.pdf",
    html: "ondulatoria1-conceitos-iniciais.html",
    title: "Ondulatória 1: Conceitos Iniciais",
    subtitle: "Pulso, onda, frequência, período, comprimento de onda, velocidade de propagação e classificação.",
    illustration: "projectile",
    guide: "Ondulatória fica simples quando você separa o que se propaga daquilo que apenas oscila localmente.",
    sections: [
      { title: "O que é uma onda", paragraphs: ["Onda é uma perturbação que se propaga transportando energia sem transporte líquido de matéria. As partículas do meio podem oscilar, mas não acompanham a onda por todo o percurso.", "Em uma corda, por exemplo, cada ponto sobe e desce enquanto a forma da onda se desloca ao longo da corda."] },
      { title: "Classificações", paragraphs: ["Ondas mecânicas precisam de meio material, como som e ondas em cordas. Ondas eletromagnéticas não precisam de meio e podem se propagar no vácuo, como luz e ondas de rádio.", "Ondas transversais têm vibração perpendicular à propagação. Ondas longitudinais têm vibração paralela à propagação."] },
      { title: "Grandezas fundamentais", paragraphs: ["Período é o tempo de uma oscilação completa. Frequência é o número de oscilações por unidade de tempo. Comprimento de onda é a distância entre dois pontos equivalentes consecutivos, como crista a crista.", "A velocidade da onda depende do meio e se relaciona com frequência e comprimento de onda."] },
      { title: "Amplitude e energia", paragraphs: ["Amplitude mede o afastamento máximo em relação à posição de equilíbrio. Em muitos contextos, maior amplitude significa maior energia transportada.", "Amplitude não deve ser confundida com comprimento de onda: uma é medida verticalmente na oscilação; a outra, ao longo da propagação."] },
    ],
    formulas: [
      { title: "Frequência e período", tokens: [I("f"), T(" = "), FR([T("1")], [I("T")])], use: "Relaciona o número de oscilações por segundo com o tempo de uma oscilação.", vars: ["f: frequência.", "T: período."], example: "Se T = 0,02 s, então f = 50 Hz." },
      { title: "Equação fundamental da onda", tokens: [I("v"), T(" = "), SY("lambda"), I("f")], use: "Relaciona velocidade de propagação, comprimento de onda e frequência.", vars: ["v: velocidade da onda.", "λ: comprimento de onda.", "f: frequência."], example: "Para λ = 2 m e f = 5 Hz, v = 10 m/s." },
      { title: "Velocidade por distância e tempo", tokens: [I("v"), T(" = "), FR([SY("Delta"), I("s")], [SY("Delta"), I("t")])], use: "Também pode ser usada para medir a velocidade de propagação de um pulso.", vars: ["Δs: distância percorrida pela perturbação.", "Δt: tempo gasto."], example: "Um pulso percorre 30 m em 6 s, logo v = 5 m/s." },
    ],
    examples: ["Uma boia no mar sobe e desce, mas não viaja junto com a onda até a praia. A energia se propaga; a matéria apenas oscila.", "Uma onda de frequência 20 Hz e velocidade 60 m/s tem comprimento de onda 3 m.", "Se a fonte aumenta a frequência e o meio permanece o mesmo, o comprimento de onda diminui."],
    summary: ["Onda transporta energia sem transporte líquido de matéria.", "Ondas mecânicas precisam de meio; eletromagnéticas não.", "f = 1/T.", "v = λf.", "Amplitude não é comprimento de onda."],
  },
  {
    subject: "Ondulatória",
    file: "ondulatoria2-fenomenos-ondulatorios.pdf",
    html: "ondulatoria2-fenomenos-ondulatorios.html",
    title: "Ondulatória 2: Fenômenos Ondulatórios",
    subtitle: "Reflexão, refração, difração, interferência, polarização e princípio da superposição.",
    illustration: "projectile",
    guide: "Estude cada fenômeno perguntando o que muda: direção, velocidade, comprimento de onda, fase ou amplitude resultante.",
    sections: [
      { title: "Reflexão", paragraphs: ["Reflexão ocorre quando uma onda encontra uma barreira e retorna ao meio de origem. Em cordas, a extremidade fixa pode inverter o pulso; a extremidade livre não inverte.", "Na reflexão, a onda permanece no mesmo meio, então sua velocidade não muda se as características do meio forem as mesmas."] },
      { title: "Refração", paragraphs: ["Refração ocorre quando a onda passa de um meio para outro e muda sua velocidade de propagação. A frequência é determinada pela fonte e permanece constante na passagem.", "Como v = λf, se a velocidade muda e a frequência permanece, o comprimento de onda também muda."] },
      { title: "Difração e interferência", paragraphs: ["Difração é a capacidade de uma onda contornar obstáculos ou se espalhar ao passar por aberturas. Ela é mais intensa quando o obstáculo ou abertura tem tamanho comparável ao comprimento de onda.", "Interferência ocorre pela superposição de ondas. Pode ser construtiva, quando amplitudes se reforçam, ou destrutiva, quando se reduzem."] },
      { title: "Polarização", paragraphs: ["Polarização é característica de ondas transversais e envolve selecionar uma direção de vibração. Por isso, som no ar, que é longitudinal, não sofre polarização nesse modelo.", "Filtros polarizadores em óculos reduzem reflexos porque selecionam direções de vibração da luz."] },
    ],
    formulas: [
      { title: "Lei da reflexão", tokens: [I("i"), T(" = "), I("r")], use: "O ângulo de incidência é igual ao ângulo de reflexão, medidos em relação à normal.", vars: ["i: ângulo de incidência.", "r: ângulo de reflexão."], example: "Se uma onda incide com 35° em relação à normal, reflete com 35°." },
      { title: "Frequência na refração", tokens: [I("f"), SUB("1"), T(" = "), I("f"), SUB("2")], use: "A frequência permanece a mesma ao mudar de meio, pois é definida pela fonte.", vars: ["f1 e f2: frequências nos meios 1 e 2."], example: "Se uma onda de 10 Hz passa para outro meio, continua com 10 Hz, mas v e λ podem mudar." },
      { title: "Superposição", tokens: [I("y"), T(" = "), I("y"), SUB("1"), T(" + "), I("y"), SUB("2")], use: "A perturbação resultante é a soma das perturbações individuais.", vars: ["y: perturbação resultante.", "y1 e y2: perturbações das ondas."], example: "Duas cristas iguais se encontram e formam uma crista momentaneamente maior." },
    ],
    examples: ["Ondas sonoras contornam portas porque sofrem difração.", "Em fones com cancelamento de ruído, ondas são combinadas para produzir interferência destrutiva.", "Ao passar para água mais rasa, uma onda marítima reduz velocidade e comprimento de onda."],
    summary: ["Reflexão mantém a onda no mesmo meio.", "Refração muda velocidade e comprimento de onda.", "Difração depende do tamanho da abertura em relação a λ.", "Interferência vem da superposição.", "Polarização é fenômeno de ondas transversais."],
  },
  {
    subject: "Ondulatória",
    file: "ondulatoria3-propriedades-do-som.pdf",
    html: "ondulatoria3-propriedades-do-som.html",
    title: "Ondulatória 3: Propriedades do Som",
    subtitle: "Som como onda mecânica, altura, intensidade, timbre, velocidade e nível sonoro.",
    illustration: "projectile",
    guide: "Som é onda mecânica longitudinal. Diferencie altura, intensidade e timbre: são conceitos diferentes e muito cobrados.",
    sections: [
      { title: "Natureza do som", paragraphs: ["O som é uma onda mecânica longitudinal. Ele precisa de meio material para se propagar e não se propaga no vácuo.", "No ar, o som se propaga por compressões e rarefações sucessivas. As partículas vibram paralelamente à direção de propagação."] },
      { title: "Altura, intensidade e timbre", paragraphs: ["Altura está relacionada à frequência: sons agudos têm maior frequência; sons graves têm menor frequência. Intensidade está ligada à energia transportada e à amplitude da onda.", "Timbre permite distinguir sons de mesma frequência e intensidade produzidos por fontes diferentes, como violão e flauta."] },
      { title: "Velocidade do som", paragraphs: ["A velocidade do som depende do meio. Em geral, é maior em sólidos, menor em líquidos e menor ainda em gases, embora dependa de condições como temperatura.", "No ar a 20 °C, costuma-se usar aproximadamente 340 m/s em exercícios."] },
      { title: "Nível sonoro", paragraphs: ["A escala de decibéis é logarítmica. Isso significa que aumentos iguais em decibéis correspondem a multiplicações de intensidade, não somas simples.", "Exposição prolongada a níveis sonoros elevados pode causar danos auditivos."] },
    ],
    formulas: [
      { title: "Onda sonora", tokens: [I("v"), T(" = "), SY("lambda"), I("f")], use: "Relaciona velocidade do som, frequência e comprimento de onda.", vars: ["v: velocidade do som no meio.", "λ: comprimento de onda.", "f: frequência."], example: "Para v = 340 m/s e f = 170 Hz, λ = 2 m." },
      { title: "Nível sonoro", tokens: [I("N"), T(" = 10 log "), FR([I("I")], [I("I"), SUB("0")])], use: "Define nível sonoro em decibéis a partir da intensidade.", vars: ["N: nível sonoro em dB.", "I: intensidade sonora.", "I0: intensidade de referência."], example: "Se a intensidade aumenta 10 vezes, o nível sonoro aumenta 10 dB." },
      { title: "Intervalo de tempo em eco", tokens: [I("d"), T(" = "), FR([I("v"), I("t")], [T("2")])], use: "No eco, o som vai até o obstáculo e volta; por isso a distância ao obstáculo é metade do percurso total.", vars: ["d: distância ao obstáculo.", "v: velocidade do som.", "t: tempo entre emissão e retorno."], example: "Se o eco volta em 2 s e v = 340 m/s, o obstáculo está a 340 m." },
    ],
    examples: ["Uma sirene mais aguda tem frequência maior, não necessariamente intensidade maior.", "Dois instrumentos tocando a mesma nota podem ser distinguidos pelo timbre.", "Em um eco, se o tempo total é 0,4 s, o som percorreu ida e volta; a distância até a parede é vt/2."],
    summary: ["Som é onda mecânica longitudinal.", "Altura depende da frequência.", "Intensidade depende da energia/amplitude.", "Timbre diferencia fontes sonoras.", "Eco envolve ida e volta do som."],
  },
  {
    subject: "Ondulatória",
    file: "ondulatoria4-fenomenos-sonoros.pdf",
    html: "ondulatoria4-fenomenos-sonoros.html",
    title: "Ondulatória 4: Fenômenos Sonoros",
    subtitle: "Eco, reverberação, batimentos, efeito Doppler e aplicações em acústica.",
    illustration: "projectile",
    guide: "Fenômenos sonoros são aplicações diretas das propriedades ondulatórias. Observe movimento relativo, diferença de frequência e reflexão.",
    sections: [
      { title: "Eco e reverberação", paragraphs: ["Eco ocorre quando o som refletido chega ao ouvido separado do som original por tempo suficiente para ser percebido como repetição. Reverberação ocorre quando reflexões chegam muito próximas, prolongando o som.", "Ambientes grandes e com superfícies duras favorecem reverberação. Materiais absorventes reduzem reflexões sonoras."] },
      { title: "Batimentos", paragraphs: ["Batimentos acontecem quando duas ondas sonoras de frequências próximas se superpõem. O ouvido percebe variações periódicas de intensidade.", "Esse fenômeno é usado na afinação de instrumentos: quanto menor a frequência de batimento, mais próximas estão as frequências das fontes."] },
      { title: "Efeito Doppler", paragraphs: ["O efeito Doppler é a mudança aparente de frequência percebida quando há movimento relativo entre fonte e observador.", "Quando fonte e observador se aproximam, a frequência percebida aumenta. Quando se afastam, a frequência percebida diminui."] },
      { title: "Aplicações", paragraphs: ["Radares, ultrassons médicos, sonares e medições astronômicas usam ideias associadas ao Doppler e à reflexão de ondas.", "Na acústica de salas, controlar reflexão e absorção é essencial para inteligibilidade e conforto auditivo."] },
    ],
    formulas: [
      { title: "Frequência de batimento", tokens: [I("f"), SUB("bat"), T(" = |"), I("f"), SUB("1"), T(" - "), I("f"), SUB("2"), T("|")], use: "Calcula a frequência com que a intensidade sonora oscila quando duas frequências próximas interferem.", vars: ["fbat: frequência dos batimentos.", "f1 e f2: frequências das fontes."], example: "Sons de 440 Hz e 444 Hz produzem batimentos de 4 Hz." },
      { title: "Eco", tokens: [I("d"), T(" = "), FR([I("v"), I("t")], [T("2")])], use: "Determina a distância até uma superfície refletora usando o tempo de ida e volta.", vars: ["d: distância ao obstáculo.", "v: velocidade do som.", "t: tempo total até o eco."], example: "Se o eco retorna em 1 s, com v = 340 m/s, a parede está a 170 m." },
      { title: "Doppler qualitativo", tokens: [I("f"), SUB("aproximação"), T(" > "), I("f"), SUB("emitida"), T(" > "), I("f"), SUB("afastamento")], use: "Resume a tendência percebida quando há aproximação ou afastamento.", vars: ["faproximação: frequência percebida na aproximação.", "femitida: frequência real da fonte.", "fafastamento: frequência percebida no afastamento."], example: "A sirene de uma ambulância parece mais aguda ao se aproximar e mais grave ao se afastar." },
    ],
    examples: ["Dois diapasões quase iguais geram batimentos audíveis. Ajustar um deles reduz a frequência dos batimentos.", "Em um teatro, excesso de reverberação pode prejudicar a clareza da fala.", "O Doppler sonoro explica a mudança de tom percebida quando uma motocicleta passa rapidamente por um observador."],
    summary: ["Eco é reflexão percebida separadamente.", "Reverberação prolonga o som.", "Batimentos vêm de frequências próximas.", "Doppler depende de movimento relativo.", "Aproximação aumenta frequência percebida."],
  },
  {
    subject: "Ondulatória",
    file: "ondulatoria5-cordas-e-tubos-sonoros.pdf",
    html: "ondulatoria5-cordas-e-tubos-sonoros.html",
    title: "Ondulatória 5: Cordas e Tubos Sonoros",
    subtitle: "Ondas estacionárias, harmônicos, cordas vibrantes, tubos abertos, tubos fechados e ressonância.",
    illustration: "projectile",
    guide: "Cordas e tubos são problemas de ondas estacionárias. O segredo é identificar nós, ventres e condições de extremidade.",
    sections: [
      { title: "Ondas estacionárias", paragraphs: ["Ondas estacionárias surgem da superposição de ondas que se propagam em sentidos opostos com mesma frequência e amplitude. O resultado tem nós, pontos que não vibram, e ventres, pontos de máxima vibração.", "Elas não transportam energia ao longo do meio como uma onda progressiva comum; a energia fica distribuída em padrões fixos."] },
      { title: "Cordas vibrantes", paragraphs: ["Em uma corda fixa nas duas extremidades, as extremidades são nós. Os modos permitidos dependem do comprimento da corda e do número de ventres.", "Instrumentos de corda alteram frequência ao modificar comprimento vibrante, tensão ou densidade linear da corda."] },
      { title: "Tubos sonoros", paragraphs: ["Em tubos abertos, a extremidade aberta corresponde a ventre de deslocamento. Em tubos fechados, a extremidade fechada corresponde a nó de deslocamento.", "Tubos abertos nas duas extremidades admitem todos os harmônicos. Tubos fechados em uma extremidade admitem apenas harmônicos ímpares."] },
      { title: "Ressonância", paragraphs: ["Ressonância ocorre quando um sistema é excitado próximo de uma de suas frequências naturais, aumentando a amplitude de oscilação.", "Esse fenômeno explica a amplificação em instrumentos musicais e também exige cuidados em estruturas mecânicas."] },
    ],
    formulas: [
      { title: "Corda com extremidades fixas", tokens: [I("f"), SUB("n"), T(" = "), FR([I("n"), I("v")], [T("2"), I("L")])], use: "Determina os harmônicos permitidos em uma corda fixa nas duas extremidades.", vars: ["fn: frequência do harmônico n.", "n: número inteiro positivo.", "v: velocidade na corda.", "L: comprimento da corda."], example: "Para L = 1 m e v = 100 m/s, a fundamental é f1 = 50 Hz." },
      { title: "Tubo aberto", tokens: [I("f"), SUB("n"), T(" = "), FR([I("n"), I("v")], [T("2"), I("L")])], use: "Tubos abertos nas duas extremidades seguem forma semelhante à corda com extremidades fixas para frequências.", vars: ["n: 1, 2, 3, ...", "v: velocidade do som.", "L: comprimento do tubo."], example: "Um tubo aberto de 0,85 m, com v = 340 m/s, tem f1 = 200 Hz." },
      { title: "Tubo fechado", tokens: [I("f"), SUB("n"), T(" = "), FR([I("n"), I("v")], [T("4"), I("L")])], use: "Para tubo fechado em uma extremidade, n assume apenas valores ímpares.", vars: ["n: 1, 3, 5, ...", "v: velocidade do som.", "L: comprimento do tubo."], example: "Para L = 0,85 m, f1 = 340/(4 · 0,85) = 100 Hz." },
    ],
    examples: ["Apertar uma corda de violão reduz seu comprimento vibrante e aumenta a frequência.", "Um tubo fechado soa mais grave que um tubo aberto de mesmo comprimento na frequência fundamental.", "Uma taça pode vibrar intensamente se excitada em frequência próxima à sua frequência natural."],
    summary: ["Ondas estacionárias têm nós e ventres.", "Cordas fixas têm nós nas extremidades.", "Tubos abertos e fechados têm condições diferentes.", "Tubo fechado só admite harmônicos ímpares.", "Ressonância aumenta amplitude quando há frequência adequada."],
  },
  {
    subject: "Ondulatória",
    file: "ondulatoria6-movimento-harmonico-simples.pdf",
    html: "ondulatoria6-movimento-harmonico-simples.html",
    title: "Ondulatória 6: Movimento Harmônico Simples",
    subtitle: "Oscilações, amplitude, período, frequência angular, sistema massa-mola e pêndulo simples.",
    illustration: "projectile",
    guide: "MHS é a ponte entre oscilações e ondas. Domine a ideia de força restauradora proporcional ao afastamento.",
    sections: [
      { title: "O que caracteriza o MHS", paragraphs: ["No Movimento Harmônico Simples, o sistema oscila em torno de uma posição de equilíbrio sob ação de uma força restauradora proporcional ao deslocamento.", "Quanto mais afastado da posição de equilíbrio, maior a tendência de retorno. Isso produz movimento periódico."] },
      { title: "Amplitude, período e frequência", paragraphs: ["Amplitude é o afastamento máximo em relação ao equilíbrio. Período é o tempo de uma oscilação completa. Frequência é o número de oscilações por unidade de tempo.", "Frequência angular mede a rapidez da fase do movimento e se relaciona ao período e à frequência."] },
      { title: "Massa-mola", paragraphs: ["Em um sistema massa-mola ideal, o período depende da massa e da constante elástica da mola. A amplitude não altera o período no modelo ideal.", "Uma mola mais rígida oscila mais rapidamente; uma massa maior oscila mais lentamente."] },
      { title: "Pêndulo simples", paragraphs: ["Para pequenas amplitudes, o pêndulo simples realiza movimento aproximadamente harmônico. Seu período depende do comprimento do fio e da gravidade.", "No modelo ideal, o período não depende da massa do corpo preso ao fio."] },
    ],
    formulas: [
      { title: "Frequência angular", tokens: [SY("omega"), T(" = "), FR([T("2"), SY("pi")], [I("T")]), T(" = 2"), SY("pi"), I("f")], use: "Relaciona período, frequência e frequência angular.", vars: ["ω: frequência angular.", "T: período.", "f: frequência."], example: "Se T = 2 s, então ω = π rad/s." },
      { title: "Lei de Hooke", tokens: [I("F"), T(" = -"), I("k"), I("x")], use: "Expressa a força restauradora da mola, oposta ao deslocamento.", vars: ["F: força elástica.", "k: constante elástica.", "x: deformação."], example: "Se k = 100 N/m e x = 0,05 m, o módulo da força é 5 N." },
      { title: "Período massa-mola", tokens: [I("T"), T(" = 2"), SY("pi"), SQ(FR([I("m")], [I("k")]))], use: "Mostra que maior massa aumenta o período e mola mais rígida reduz o período.", vars: ["T: período.", "m: massa.", "k: constante elástica."], example: "Se a massa aumenta, o sistema oscila mais devagar; se k aumenta, oscila mais rápido." },
      { title: "Período do pêndulo simples", tokens: [I("T"), T(" = 2"), SY("pi"), SQ(FR([I("L")], [I("g")]))], use: "Vale para pequenas oscilações de um pêndulo simples ideal.", vars: ["T: período.", "L: comprimento do pêndulo.", "g: gravidade."], example: "Aumentar o comprimento do pêndulo aumenta o período; aumentar g reduz o período." },
    ],
    examples: ["Um relógio de pêndulo atrasa se o comprimento efetivo do pêndulo aumenta, pois o período fica maior.", "Uma mola mais rígida tem constante elástica maior e tende a oscilar com menor período.", "No MHS, a velocidade é máxima na posição de equilíbrio e nula nos extremos."],
    summary: ["MHS exige força restauradora proporcional ao deslocamento.", "Amplitude é afastamento máximo.", "Período é tempo de uma oscilação.", "Massa-mola depende de m e k.", "Pêndulo simples depende de L e g para pequenas amplitudes."],
  }
);

apostilas.forEach((item) => {
  if (item.subject === "Termologia") {
    item.sections.push(
      {
        title: "Roteiro de resolução em Termologia",
        paragraphs: [
          "Antes de substituir valores, identifique qual grandeza está mudando: temperatura, estado físico, volume, pressão ou energia interna. Essa leitura inicial decide qual modelo físico deve ser usado.",
          "Em exercícios térmicos, a escolha da unidade costuma ser decisiva. Temperaturas em gases devem estar em kelvin; massas precisam ser compatíveis com calor específico; pressão e volume devem conversar com a constante escolhida.",
          "Quando houver mais de um corpo trocando calor, escreva quem recebe energia e quem cede energia. Depois aplique conservação de energia, tomando cuidado com sinais e mudanças de fase intermediárias."
        ],
        bullets: [
          "Se muda temperatura: pense em calor sensível.",
          "Se muda estado físico: pense em calor latente.",
          "Se aparece gás: verifique se a temperatura está em kelvin.",
          "Se aparece máquina térmica: organize calor recebido, calor rejeitado e trabalho."
        ]
      },
      {
        title: "Interpretação física antes da conta",
        paragraphs: [
          "Um resultado numérico só faz sentido quando combina com o comportamento físico esperado. Se um corpo recebe calor sem mudar de fase, sua temperatura deve aumentar; se cede calor, deve diminuir.",
          "Em dilatação, aquecer geralmente aumenta dimensões; em gases, aquecer a volume constante aumenta pressão; em termodinâmica, expansão geralmente significa trabalho realizado pelo gás.",
          "Essa checagem qualitativa evita respostas absurdas, como temperatura final fora do intervalo esperado em uma mistura simples sem mudança de fase."
        ]
      },
      {
        title: "Leitura de unidades e proporcionalidade",
        paragraphs: [
          "As fórmulas da Termologia frequentemente indicam proporcionalidade direta ou inversa. Em Q = mcΔT, dobrar a massa dobra o calor necessário. Em Fourier, dobrar a espessura reduz o fluxo pela metade.",
          "Treinar proporcionalidade ajuda a resolver questões conceituais sem cálculo pesado e também permite conferir se o resultado final está coerente.",
          "Quando o enunciado não pede valor exato, compare grandezas: maior massa, maior calor específico, maior variação térmica ou maior diferença de temperatura."
        ]
      }
    );
    item.examples.push(
      "Em uma mistura de água quente e fria, a temperatura final deve ficar entre as temperaturas iniciais se não houver mudança de fase nem perda de calor. Se o cálculo der fora desse intervalo, há erro de sinal ou unidade.",
      "Se um gás é aquecido dentro de recipiente rígido, o volume não muda. Portanto, o aumento de temperatura deve aparecer principalmente como aumento de pressão e energia interna.",
      "Ao comparar dois materiais aquecidos pela mesma quantidade de calor, o que possui maior capacidade térmica sofre menor variação de temperatura."
    );
  }

  if (item.subject === "Ondulatória") {
    item.sections.push(
      {
        title: "Roteiro de resolução em Ondulatória",
        paragraphs: [
          "Comece identificando fonte, meio de propagação e grandezas dadas. Em ondas, muitos problemas misturam frequência, período, velocidade e comprimento de onda; organizar essas grandezas evita confusões.",
          "A frequência é determinada pela fonte. Quando a onda muda de meio, a frequência permanece, enquanto velocidade e comprimento de onda podem mudar.",
          "Quando houver reflexão, interferência ou ondas estacionárias, desenhe mentalmente nós, ventres, cristas, vales e sentidos de propagação antes de calcular."
        ],
        bullets: [
          "Se aparece período: use f = 1/T.",
          "Se aparece comprimento de onda: pense em v = λf.",
          "Se muda de meio: frequência permanece constante.",
          "Se há duas ondas sobrepostas: use superposição e fase."
        ]
      },
      {
        title: "Interpretação física dos fenômenos",
        paragraphs: [
          "Ondas transportam energia, mas isso não significa transporte permanente de matéria. Em uma corda ou na superfície da água, os pontos do meio oscilam em torno de posições de equilíbrio.",
          "Fenômenos como difração, interferência e ressonância mostram que ondas não se comportam como partículas rígidas. Elas se espalham, se somam e podem formar padrões estáveis.",
          "No som, a leitura física passa por frequência, intensidade e timbre. Frequência muda a altura; intensidade muda a sensação de volume; timbre identifica a fonte sonora."
        ]
      },
      {
        title: "Como evitar erros comuns",
        paragraphs: [
          "Não confunda velocidade da onda com velocidade de oscilação das partículas do meio. A onda se propaga; cada partícula apenas vibra localmente em torno de sua posição.",
          "Também não confunda amplitude com comprimento de onda. Amplitude é afastamento máximo; comprimento de onda é distância entre pontos equivalentes consecutivos.",
          "Em tubos e cordas, observe as extremidades. Uma extremidade fixa ou fechada impõe condição diferente de uma extremidade livre ou aberta."
        ]
      }
    );
    item.examples.push(
      "Se uma onda passa para outro meio e sua velocidade diminui, mas a fonte continua a mesma, a frequência permanece e o comprimento de onda diminui.",
      "Duas ondas em fase produzem reforço; duas ondas em oposição de fase podem se cancelar parcialmente ou totalmente.",
      "Em uma corda fixa nas extremidades, não pode haver ventre na extremidade: ali a condição física exige nó."
    );
  }
});

apostilas.forEach((item) => {
  renderPdf(item);
  fs.writeFileSync(path.join(EDIT, item.html), renderHtml(item), "utf8");
});

console.log("Apostilas robustas geradas em:", OUT);
