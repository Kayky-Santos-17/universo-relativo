const PALAVRAS_PROIBIDAS = [
  "admin", "administrator", "usuario", "user",
  "visitante", "guest", "cliente", "teste", "test",
  "sem nome", "meu nome", "root", "null", "undefined",
  "admin123", "usuario123"
];

const SEQUENCIES_TECLADO = [
  "qwerty", "qwertyuiop", "qwertz", "asdfgh", "asdfghjkl",
  "zxcvbn", "zxcvbnm", "123456", "123456789", "12345678",
  "abcdef", "abcabc"
];

const SIMBOLOS_ACEITOS = "@#$%&*!?_-. ";

export function normalizarNome(nome) {
  return nome
    .trim()
    .replace(/\s+/g, " ");
}

function temSequenciaTeclado(str) {
  const lower = str.toLowerCase();
  for (const seq of SEQUENCIES_TECLADO) {
    if (lower === seq || lower.includes(seq)) return true;
  }
  return false;
}

function temRepeticaoCaractere(str) {
  if (str.length < 3) return false;
  const primeiro = str[0];
  return [...str].every(c => c === primeiro);
}

function temPadraoRepetido(str) {
  const len = str.length;
  for (let tamanho = 2; tamanho <= len / 2; tamanho++) {
    if (len % tamanho !== 0) continue;
    const padrao = str.slice(0, tamanho);
    const repeticoes = len / tamanho;
    if (padrao.repeat(repeticoes) === str) return true;
  }
  return false;
}

function apenasSimbolos(str) {
  return [...str].every(c => "@#$%&*!?_-. ".includes(c));
}

function apenasDigitos(str) {
  return /^\d+$/.test(str);
}

export function validarNome(nome) {
  const normalized = normalizarNome(nome);

  if (!normalized) {
    return { valido: false, mensagem: "Informe seu nome completo." };
  }

  if (normalized.length < 5) {
    return { valido: false, mensagem: "Informe seu nome completo." };
  }

  if (normalized.length > 80) {
    return { valido: false, mensagem: "O nome informado parece inválido." };
  }

  const palavras = normalized.split(" ");
  if (palavras.length < 2) {
    return { valido: false, mensagem: "Utilize seu nome e sobrenome." };
  }

  const lower = normalized.toLowerCase();

  if (PALAVRAS_PROIBIDAS.includes(lower)) {
    return { valido: false, mensagem: "O nome informado parece inválido." };
  }

  for (const palavra of palavras) {
    if (PALAVRAS_PROIBIDAS.includes(palavra.toLowerCase())) {
      return { valido: false, mensagem: "O nome informado parece inválido." };
    }
  }

  const apenasLetrasEEspacos = /^[a-zA-Zà-ÿÀ-ß\s'-]+$/.test(normalized);
  if (!apenasLetrasEEspacos) {
    return { valido: false, mensagem: "Utilize seu nome e sobrenome." };
  }

  if (temSequenciaTeclado(lower.replace(/\s/g, ""))) {
    return { valido: false, mensagem: "O nome informado parece inválido." };
  }

  const junta = normalized.replace(/\s/g, "");
  if (temRepeticaoCaractere(junta)) {
    return { valido: false, mensagem: "O nome informado parece inválido." };
  }

  if (temPadraoRepetido(junta)) {
    return { valido: false, mensagem: "O nome informado parece inválido." };
  }

  if (apenasDigitos(junta)) {
    return { valido: false, mensagem: "Utilize seu nome e sobrenome." };
  }

  if (apenasSimbolos(junta)) {
    return { valido: false, mensagem: "O nome informado parece inválido." };
  }

  return { valido: true, mensagem: "" };
}

export function validarSenha(senha) {
  const erros = [];

  if (!senha) {
    return { valido: false, erros: ["Digite uma senha."] };
  }

  if (senha.length < 8) {
    erros.push("Mínimo de 8 caracteres.");
  }

  if (!/[A-Z]/.test(senha)) {
    erros.push("Letra maiúscula.");
  }

  if (!/[a-z]/.test(senha)) {
    erros.push("Letra minúscula.");
  }

  if (!/[0-9]/.test(senha)) {
    erros.push("Pelo menos um número.");
  }

  const temSimbolo = [...senha].some(c => SIMBOLOS_ACEITOS.trim().includes(c));
  if (!temSimbolo) {
    erros.push("Pelo menos um símbolo (@ # $ % & * ! ? _ - .).");
  }

  return { valido: erros.length === 0, erros };
}

export function calcularForcaSenha(senha) {
  if (!senha) {
    return { nivel: 0, label: "", cor: "var(--text-muted)" };
  }

  if (senha.length < 8) {
    return { nivel: 1, label: "Muito Fraca", cor: "var(--red)" };
  }

  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temSimbolo = [...senha].some(c => SIMBOLOS_ACEITOS.trim().includes(c));
  const categorias = [temMaiuscula, temMinuscula, temNumero, temSimbolo].filter(Boolean).length;
  const apenasLetras = /^[a-zA-Z]+$/.test(senha);
  const apenasNumeros = /^\d+$/.test(senha);
  const letrasENumeros = /^[a-zA-Z0-9]+$/.test(senha);

  if (apenasLetras || apenasNumeros) {
    return { nivel: 2, label: "Fraca", cor: "var(--amber)" };
  }

  if (letrasENumeros) {
    return { nivel: 3, label: "Boa", cor: "var(--blue)" };
  }

  if (categorias === 4 && senha.length > 12) {
    return { nivel: 5, label: "Muito Forte", cor: "var(--green)" };
  }

  if (categorias === 4) {
    return { nivel: 4, label: "Forte", cor: "var(--emerald)" };
  }

  return { nivel: 3, label: "Boa", cor: "var(--blue)" };
}

export function validarConfirmacao(senha, confirmacao) {
  if (!confirmacao) {
    return { valido: false, mensagem: "" };
  }
  if (senha !== confirmacao) {
    return { valido: false, mensagem: "As senhas não coincidem." };
  }
  return { valido: true, mensagem: "Senhas coincidem." };
}

export function obterChecklistSenha(senha) {
  return [
    { id: "char8", label: "8 caracteres", valido: senha.length >= 8 },
    { id: "maiuscula", label: "Letra maiúscula", valido: /[A-Z]/.test(senha) },
    { id: "minuscula", label: "Letra minúscula", valido: /[a-z]/.test(senha) },
    { id: "numero", label: "Número", valido: /[0-9]/.test(senha) },
    { id: "simbolo", label: "Símbolo", valido: [...senha].some(c => SIMBOLOS_ACEITOS.trim().includes(c)) }
  ];
}
