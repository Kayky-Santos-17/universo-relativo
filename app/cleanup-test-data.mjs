/**
 * cleanup-test-data.mjs
 * Limpa dados de teste deixados pelo Codex no Firestore.
 *
 * Uso:
 *   node cleanup-test-data.mjs
 *
 * Requer: firebase instalado no mesmo diretório ou globalmente.
 * Instale com: npm install firebase
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

// ── Configuração ──────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCr-IyfXGkX7JZRvnmjaBPlkdbAUsS7rok",
  authDomain: "universo-reativo.firebaseapp.com",
  projectId: "universo-reativo",
  storageBucket: "universo-reativo.firebasestorage.app",
  messagingSenderId: "743892806079",
  appId: "1:743892806079:web:ac13674c9b3fb639db190a",
};

const ADMIN_EMAIL    = "universorelativoadmin@gmail.com";
const ADMIN_PASSWORD = "universorelativo2026admin";

// Padrões de IDs legados (formato antigo sem subassunto):
// card-fisicamecanica-aula-1, card-fisicamecanica-apostila, etc.
const LEGACY_CARD_ID_RE = /^card-[a-z]+-(?:aula-\d+|apostila)$/;

// URLs ou títulos de teste deixados pelo Codex
const TEST_URL_RE      = /TESTE|SWAP|TEST_|codex|CODEX/i;
const TEST_TITULO_RE   = /\[TESTE\]|\[TEST\]|codex test|CODEX/i;

// Padrões de enunciado/título de questão de teste
const TEST_QUESTAO_RE  = /\bteste\b/i;

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg)  { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.warn(`  ⚠ ${msg}`); }

async function limparColecaoCards(db, nomeColecao) {
  console.log(`\n── Verificando coleção: ${nomeColecao} ──`);
  const snap = await getDocs(collection(db, nomeColecao));
  if (snap.empty) { log("Coleção vazia ou não encontrada."); return; }

  let totalLegacy = 0;
  let totalTestUrl = 0;
  let totalTestTitulo = 0;

  for (const docSnap of snap.docs) {
    const id   = docSnap.id;
    const data = docSnap.data();
    const ref  = doc(db, nomeColecao, id);

    // 1) ID no formato legado → desativar
    if (LEGACY_CARD_ID_RE.test(id)) {
      await updateDoc(ref, { ativo: false, atualizadoEm: serverTimestamp() });
      log(`Legado desativado: ${id}`);
      totalLegacy++;
      continue;
    }

    // 2) URL de apostila/vídeo com padrão de teste → limpar URL
    const videoUrl    = String(data.videoUrl    || "");
    const apostilaUrl = String(data.apostilaUrl || "");
    const hasTestUrl  = TEST_URL_RE.test(videoUrl) || TEST_URL_RE.test(apostilaUrl);
    if (hasTestUrl) {
      const patch = { atualizadoEm: serverTimestamp() };
      if (TEST_URL_RE.test(videoUrl))    { patch.videoUrl    = ""; patch.videoEmbedUrl = ""; patch.botaoDesabilitado = true; patch.botaoLabel = "Em breve"; }
      if (TEST_URL_RE.test(apostilaUrl)) { patch.apostilaUrl = ""; patch.botaoDesabilitado = true; patch.botaoLabel = "Em breve"; }
      await updateDoc(ref, patch);
      log(`URL de teste limpa: ${id}`);
      totalTestUrl++;
      continue;
    }

    // 3) Título com padrão de teste → restaurar para "Em breve" e desabilitar botão
    const titulo = String(data.titulo || "");
    if (TEST_TITULO_RE.test(titulo)) {
      await updateDoc(ref, {
        titulo: titulo.replace(TEST_TITULO_RE, "").trim() || "Aula",
        botaoDesabilitado: true,
        botaoLabel: "Em breve",
        atualizadoEm: serverTimestamp(),
      });
      log(`Título de teste corrigido: ${id}`);
      totalTestTitulo++;
    }
  }

  console.log(`  → Legados desativados: ${totalLegacy} | URLs limpas: ${totalTestUrl} | Títulos corrigidos: ${totalTestTitulo}`);
}

async function limparColecaoQuestoes(db, nomeColecao) {
  console.log(`\n── Verificando questões: ${nomeColecao} ──`);
  const snap = await getDocs(collection(db, nomeColecao));
  if (snap.empty) { log("Coleção vazia ou não encontrada."); return; }

  let total = 0;

  for (const docSnap of snap.docs) {
    const id   = docSnap.id;
    const data = docSnap.data();
    const enunciado = String(data.enunciado || data.question || "").trim();

    // Questão com enunciado vazio ou contendo "teste"
    const isTestQuestao = enunciado === "" || TEST_QUESTAO_RE.test(enunciado);
    if (isTestQuestao) {
      await updateDoc(doc(db, nomeColecao, id), {
        ativo: false,
        atualizadoEm: serverTimestamp(),
      });
      log(`Questão de teste desativada: ${id} — "${enunciado.slice(0, 60)}"`);
      total++;
    }
  }

  console.log(`  → Questões desativadas: ${total}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Universo Relativo — Limpeza de dados de teste (Codex)");
  console.log("═══════════════════════════════════════════════════════\n");

  const app  = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  // Autenticar como admin
  console.log("Autenticando como admin…");
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    log("Autenticado com sucesso.");
  } catch (err) {
    console.error("Falha na autenticação:", err.message);
    process.exit(1);
  }

  // Limpar cards de aula/apostila
  await limparColecaoCards(db, "questoes_subassuntos");
  await limparColecaoCards(db, "questoes_cards");

  // Limpar questões de teste
  await limparColecaoQuestoes(db, "questoes");
  await limparColecaoQuestoes(db, "questions");

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Limpeza concluída!");
  console.log("═══════════════════════════════════════════════════════\n");
  process.exit(0);
})();
