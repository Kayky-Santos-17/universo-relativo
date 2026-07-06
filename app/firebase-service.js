import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-storage.js";

const firebaseConfig = window.FIREBASE_CONFIG || null;
const appConfig = window.UNIVERSO_RELATIVO_CONFIG || {};

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let firebaseStorage = null;
let perfilAtual = null;
let monitorSessaoAlunoAtivo = null;
let sessaoAlunoEmAtualizacao = false;
let catalogoQuestoesPadraoGarantido = false;

const SESSION_STORAGE_KEY = "universo_relativo_aluno_session_id";
const SESSION_NOTICE_KEY = "universo_relativo_session_notice";

const SUBCOLECOES_PROGRESSO = {
  questoes: "progresso_questoes",
  listas: "progresso_listas",
  flashcards: "progresso_flashcards",
  flashcardsPessoais: "flashcards_pessoais"
};

const COLECOES_QUESTOES = {
  subassuntos: "questoes_subassuntos",
  cards: "questoes_cards",
  questoes: "questoes"
};
const COLECAO_QUESTIONS_ALIAS = "questions";

const COLECAO_FLASHCARDS = "flashcards";
const COLECAO_EXAMS = "exams";

const FISICA_ASSUNTOS_PADRAO = [
  {
    id: "cinematica",
    label: "Cinematica",
    topicos: [
      { id: "introducao-a-cinematica", label: "Introducao a Cinematica", cardTitulo: "Introducao a Mecanica", descricao: "Primeira lista da trilha para apresentar linguagem, deslocamento, referencial e leitura inicial dos movimentos." },
      { id: "movimento-retilineo-constante", label: "Movimento retilineo uniforme", cardTitulo: "Movimento retilineo uniforme", descricao: "Lista pronta para a fase em que o aluno estuda deslocamento uniforme e leitura de graficos simples." },
      { id: "aceleracao-em-linha-reta", label: "Movimento retilineo uniformemente variado", cardTitulo: "Movimento retilineo uniformemente variado", descricao: "Bloco preparado para variacao de velocidade, funcoes horarias e interpretacao grafica do movimento." },
      { id: "vetores-do-movimento", label: "Vetores no movimento", cardTitulo: "Vetores do movimento", descricao: "Card direcionado a decomposicao vetorial, componentes e leitura espacial do deslocamento." },
      { id: "trajetorias-circulares-e-polias", label: "Movimento circular e sistemas com polias", cardTitulo: "Movimento circular e polias", descricao: "Conjunto pronto para circularidade, frequencia, periodo e montagens com polias." },
      { id: "quedas-e-subidas-verticais", label: "Movimentos verticais", cardTitulo: "Movimentos verticais", descricao: "Espaco reservado para listas de queda livre, lancamentos verticais e leitura de sinais." },
      { id: "lancamentos-em-duas-dimensoes", label: "Lancamento horizontal e lancamento obliquo", cardTitulo: "Lancamento horizontal e obliquo", descricao: "Bloco visual preparado para composicao de movimentos em eixos horizontal e vertical." }
    ]
  },
  {
    id: "dinamica",
    label: "Dinamica",
    topicos: [
      { id: "bases-das-leis-de-newton", label: "Principios de Newton", cardTitulo: "Principios de Newton", descricao: "Lista principal para consolidar inercia, forca resultante e acao-reacao." },
      { id: "molas-e-forca-restauradora", label: "Forca elastica", cardTitulo: "Forca elastica", descricao: "Card pronto para sistemas com molas, energia elastica e proporcionalidade da deformacao." },
      { id: "arranjos-de-blocos", label: "Sistemas de blocos", cardTitulo: "Sistemas de blocos", descricao: "Sequencia pensada para composicao de forcas e aceleracoes em blocos ligados." },
      { id: "atrito-em-superficies", label: "Forca de atrito", cardTitulo: "Forca de atrito", descricao: "Estrutura para atrito estatico e dinamico em planos horizontais e inclinados." },
      { id: "dinamica-da-forca-centripeta", label: "Forca centripeta", cardTitulo: "Forca centripeta", descricao: "Lista preparada para movimento curvo, tracao e componentes radiais." },
      { id: "trabalho-e-energia-em-acao", label: "Trabalho e energia mecanica", cardTitulo: "Trabalho e energia mecanica", descricao: "Bloco dedicado a teorema da energia, conservacao e transformacoes mecanicas." },
      { id: "impulso-e-quantidade-de-movimento", label: "Quantidade de movimento e impulso", cardTitulo: "Impulso e quantidade de movimento", descricao: "Espaco pronto para colisoes, impulso e conservacao do momento linear." }
    ]
  },
  {
    id: "gravitacao",
    label: "Gravitacao",
    topicos: [
      { id: "orbita-e-leis-de-kepler", label: "Leis de Kepler", cardTitulo: "Leis de Kepler", descricao: "Trilha inicial para periodos, orbitas elipticas e relacoes entre planetas e estrelas." },
      { id: "campo-da-gravitacao-universal", label: "Gravitacao universal", cardTitulo: "Gravitacao universal", descricao: "Lista preparada para forca gravitacional, intensidade de campo e energia potencial." }
    ]
  },
  {
    id: "estatica",
    label: "Estatica",
    topicos: [
      { id: "equilibrio-do-ponto-material", label: "Equilibrio do ponto material", cardTitulo: "Equilibrio do ponto material", descricao: "Card montado para condicoes de equilibrio em sistemas puntuais." },
      { id: "equilibrio-do-corpo-extenso", label: "Equilibrio do corpo extenso", cardTitulo: "Equilibrio do corpo extenso", descricao: "Espaco dedicado a torque, alavancas e distribuicao de forcas." }
    ]
  },
  {
    id: "hidrostatica",
    label: "Hidrostatica",
    topicos: [
      { id: "densidade-e-pressao-nos-fluidos", label: "Densidade e pressao", cardTitulo: "Densidade e pressao nos fluidos", descricao: "Trilha pronta para massa especifica, colunas de liquido e pressao hidrostática." },
      { id: "pascal-e-prensas-hidraulicas", label: "Principio de Pascal", cardTitulo: "Pascal e prensas hidraulicas", descricao: "Bloco organizado para transmissao de pressao e dispositivos hidraulicos." },
      { id: "empuxo-e-principio-de-arquimedes", label: "Principio de Arquimedes", cardTitulo: "Empuxo e principio de Arquimedes", descricao: "Lista preparada para empuxo, flutuacao e peso aparente." }
    ]
  },
  {
    id: "hidrodinamica",
    label: "Hidrodinamica",
    topicos: [
      { id: "fundamentos-de-hidrodinamica", label: "Fundamentos de hidrodinamica", cardTitulo: "Fundamentos de hidrodinamica", descricao: "Card base para vazao, continuidade e interpretacao do escoamento." }
    ]
  },
  {
    id: "termologia",
    label: "Termologia",
    topicos: [
      { id: "fundamentos-de-termologia", label: "Fundamentos de Termologia", cardTitulo: "Fundamentos de Termologia", descricao: "Primeira lista da trilha para temperatura, calor e linguagem basica do tema." },
      { id: "medidas-e-escalas-termicas", label: "Escalas termicas", cardTitulo: "Escalas termicas", descricao: "Bloco inicial para conversoes de escala e interpretacao de temperatura." },
      { id: "dilatacao-em-solidos-e-fluidos", label: "Dilatacao termica", cardTitulo: "Dilatacao termica", descricao: "Estrutura pronta para variacoes dimensionais por aquecimento." },
      { id: "misturas-e-calorimetria", label: "Calorimetria", cardTitulo: "Calorimetria", descricao: "Lista preparada para trocas de calor, calor especifico e misturas termicas." },
      { id: "caminhos-da-propagacao-do-calor", label: "Propagacao de calor", cardTitulo: "Propagacao de calor", descricao: "Card pronto para conducao, conveccao e irradiacao." },
      { id: "comportamento-termico-dos-gases", label: "Estudo dos gases", cardTitulo: "Estudo dos gases", descricao: "Espaco reservado para transformacoes gasosas e leis dos gases ideais." },
      { id: "principios-da-termodinamica", label: "Termodinamica", cardTitulo: "Termodinamica", descricao: "Trilha de fechamento para energia interna, trabalho e leis da termodinamica." }
    ]
  },
  {
    id: "ondulatoria",
    label: "Ondulatoria",
    topicos: [
      { id: "ideias-iniciais-de-ondulatoria", label: "Conceitos iniciais de ondulatoria", cardTitulo: "Conceitos iniciais de ondulatoria", descricao: "Bloco base para frequencia, periodo, comprimento de onda e classificacoes." },
      { id: "fenomenos-das-ondas", label: "Fenomenos ondulatorios", cardTitulo: "Fenomenos ondulatorios", descricao: "Espaco para reflexao, refracao, difracao, interferencia e polarizacao." },
      { id: "natureza-e-propriedades-do-som", label: "Propriedades do som", cardTitulo: "Propriedades do som", descricao: "Lista pensada para intensidade, altura, timbre e propagacao sonora." },
      { id: "efeitos-sonoros-no-dia-a-dia", label: "Fenomenos sonoros", cardTitulo: "Fenomenos sonoros", descricao: "Card para eco, reverberacao, ressonancia e efeito Doppler." },
      { id: "ressonancia-em-cordas-e-tubos", label: "Cordas e tubos sonoros", cardTitulo: "Cordas e tubos sonoros", descricao: "Trilha para harmônicos, extremos e instrumentos musicais." },
      { id: "oscilacao-e-movimento-harmonico", label: "Movimento harmonico simples", cardTitulo: "Movimento harmonico simples", descricao: "Bloco preparado para MHS, fase, elongacao e energia oscilatoria." }
    ]
  },
  {
    id: "optica",
    label: "Optica",
    topicos: [
      { id: "principios-da-optica-geometrica", label: "Conceitos fundamentais de optica", cardTitulo: "Conceitos fundamentais de optica", descricao: "Lista de entrada para propagacao retilinea, raios de luz e meios." },
      { id: "reflexao-em-espelhos-planos", label: "Espelhos planos", cardTitulo: "Espelhos planos", descricao: "Card pronto para formacao de imagens e simetria em espelhos planos." },
      { id: "espelhos-esfericos-na-pratica", label: "Espelhos esfericos", cardTitulo: "Espelhos esfericos", descricao: "Trilha organizada para focos, centros e formacao de imagens esfericas." },
      { id: "desvio-da-luz-e-refracao", label: "Refracao da luz", cardTitulo: "Refracao da luz", descricao: "Estrutura para Snell, indice de refracao e angulo limite." },
      { id: "lentes-imagens-e-visao", label: "Lentes e visao humana", cardTitulo: "Lentes e visao humana", descricao: "Card preparado para lentes delgadas, instrumentos e defeitos da visao." }
    ]
  },
  {
    id: "eletrostatica",
    label: "Eletrostatica",
    topicos: [
      { id: "modos-de-eletrizacao", label: "Processos de eletrizacao", cardTitulo: "Processos de eletrizacao", descricao: "Lista inicial para atrito, contato, inducao e conservacao de carga." },
      { id: "interacao-e-lei-de-coulomb", label: "Lei de Coulomb", cardTitulo: "Lei de Coulomb", descricao: "Card organizado para forca eletrica entre cargas puntuais." },
      { id: "linhas-e-intensidade-do-campo-eletrico", label: "Campo eletrico", cardTitulo: "Campo eletrico", descricao: "Bloco visual para campo, vetores e distribuicao de linhas de forca." },
      { id: "energia-e-potencial-eletrico", label: "Potencial eletrico", cardTitulo: "Potencial eletrico", descricao: "Trilha preparada para trabalho, diferenca de potencial e superficies equipotenciais." },
      { id: "condutores-em-equilibrio-eletrico", label: "Condutores eletrizados", cardTitulo: "Condutores eletrizados", descricao: "Card pronto para blindagem, distribuicao de carga e poder das pontas." },
      { id: "capacitancia-e-capacitores", label: "Capacitores", cardTitulo: "Capacitores", descricao: "Espaco organizado para energia armazenada e associacoes simples." }
    ]
  },
  {
    id: "eletrodinamica",
    label: "Eletrodinamica",
    topicos: [
      { id: "corrente-e-movimento-de-cargas", label: "Corrente eletrica", cardTitulo: "Corrente eletrica", descricao: "Lista base para intensidade de corrente e sentido convencional." },
      { id: "relacoes-das-leis-de-ohm", label: "Leis de Ohm", cardTitulo: "Leis de Ohm", descricao: "Card pronto para resistencia, tensao e comportamento de resistores." },
      { id: "consumo-potencia-e-energia", label: "Potencia e energia eletrica", cardTitulo: "Potencia e energia eletrica", descricao: "Trilha preparada para consumo residencial e potencia em circuitos." },
      { id: "arranjos-de-resistores", label: "Associacao de resistores", cardTitulo: "Associacao de resistores", descricao: "Bloco para serie, paralelo e circuitos mistos." },
      { id: "medicao-eletrica-na-pratica", label: "Instrumentos de medida", cardTitulo: "Instrumentos de medida", descricao: "Card dedicado ao uso de amperimetros, voltimetros e leituras basicas." },
      { id: "fontes-e-geradores-eletricos", label: "Geradores eletricos", cardTitulo: "Geradores eletricos", descricao: "Estrutura para forca eletromotriz, resistencia interna e rendimento." },
      { id: "circuitos-eletricos-aplicados", label: "Circuitos eletricos", cardTitulo: "Circuitos eletricos", descricao: "Lista preparada para analise mais integrada de malhas e associacoes." }
    ]
  },
  {
    id: "eletromagnetismo",
    label: "Eletromagnetismo",
    topicos: [
      { id: "ideias-centrais-do-eletromagnetismo", label: "Fundamentos de eletromagnetismo", cardTitulo: "Fundamentos de eletromagnetismo", descricao: "Bloco base para a relacao entre campos eletricos, magneticos e cargas em movimento." },
      { id: "origens-do-campo-magnetico", label: "Fontes de campo magnetico", cardTitulo: "Fontes de campo magnetico", descricao: "Lista organizada para fios, espiras, solenoides e linhas de campo." },
      { id: "interacao-e-forca-magnetica", label: "Forca magnetica", cardTitulo: "Forca magnetica", descricao: "Trilha para particulas carregadas, regra da mao e forca em condutores." },
      { id: "variacao-de-fluxo-e-inducao", label: "Inducao eletromagnetica", cardTitulo: "Inducao eletromagnetica", descricao: "Card preparado para Faraday, Lenz e geracao de corrente induzida." }
    ]
  }
];

function montarCatalogoQuestoesPadrao() {
  const catalogo = {
    disciplinas: {
      "fisica-basica": {
        label: "Fisica Basica",
        assuntos: {}
      },
      "relatividade-geral": {
        label: "Relatividade Especial",
        assuntos: {
          "evolucao-da-fisica": {
            label: "Evolucao da Fisica",
            subassuntos: {}
          }
        }
      }
    }
  };

  FISICA_ASSUNTOS_PADRAO.forEach((assunto) => {
    catalogo.disciplinas["fisica-basica"].assuntos[assunto.id] = {
      label: assunto.label,
      subassuntos: {}
    };

    assunto.topicos.forEach((topico) => {
      catalogo.disciplinas["fisica-basica"].assuntos[assunto.id].subassuntos[topico.id] = {
        label: topico.label
      };
    });
  });

  return catalogo;
}

function descricaoPadraoAula(labelTopico, indice) {
  return indice === 1
    ? "Espaco elegante reservado para a primeira aula de " + labelTopico + ", mantendo a identidade visual da plataforma."
    : "Espaco elegante reservado para a segunda aula de " + labelTopico + ", separando bem teoria guiada e pratica.";
}

function descricaoPadraoLista(labelTopico) {
  return "Lista pronta para " + labelTopico + ", com filtros corretos para o aluno entrar direto nesse recorte do assunto.";
}

function descricaoPadraoApostila(labelTopico) {
  return "Material teorico completo de " + labelTopico + ", com leitura guiada e estrutura pronta para PDF e aprofundamento.";
}

function montarCardsQuestoesPadrao() {
  const cards = [];

  FISICA_ASSUNTOS_PADRAO.forEach((assunto) => {
    assunto.topicos.forEach((topico) => {
      cards.push(
        {
          id: "card-" + assunto.id + "-" + topico.id + "-apostila",
          titulo: "Apostila",
          descricao: descricaoPadraoApostila(topico.label),
          tag: "Leitura",
          tipo: "apostila",
          botaoLabel: "Abrir apostila",
          botaoDesabilitado: false,
          apostilaUrl: "",
          apostilaNome: "",
          apostilaStoragePath: "",
          disciplinaId: "fisica-basica",
          assuntoId: assunto.id,
          subassuntoId: topico.id,
          ordemExibicao: 1,
          origem: "sistema"
        },
        {
          id: "card-" + assunto.id + "-" + topico.id + "-aula-1",
          titulo: "Aulas ainda a serem postas",
          descricao: descricaoPadraoAula(topico.label, 1),
          tag: "Aula 01",
          tipo: "aula",
          botaoLabel: "Em breve",
          botaoDesabilitado: true,
          videoUrl: "",
          videoEmbedUrl: "",
          disciplinaId: "fisica-basica",
          assuntoId: assunto.id,
          subassuntoId: topico.id,
          ordemExibicao: 2,
          origem: "sistema"
        },
        {
          id: "card-" + assunto.id + "-" + topico.id + "-aula-2",
          titulo: "Aulas ainda a serem postas",
          descricao: descricaoPadraoAula(topico.label, 2),
          tag: "Aula 02",
          tipo: "aula",
          botaoLabel: "Em breve",
          botaoDesabilitado: true,
          videoUrl: "",
          videoEmbedUrl: "",
          disciplinaId: "fisica-basica",
          assuntoId: assunto.id,
          subassuntoId: topico.id,
          ordemExibicao: 3,
          origem: "sistema"
        },
        {
          id: "card-" + assunto.id + "-" + topico.id + "-lista",
          titulo: topico.cardTitulo,
          descricao: topico.descricao || descricaoPadraoLista(topico.label),
          tag: "Questoes",
          tipo: "questoes",
          botaoLabel: "Resolver questoes",
          botaoDesabilitado: false,
          disciplinaId: "fisica-basica",
          assuntoId: assunto.id,
          subassuntoId: topico.id,
          ordemExibicao: 4,
          origem: "sistema"
        }
      );
    });
  });

  return cards;
}

const CATALOGO_QUESTOES_PADRAO = montarCatalogoQuestoesPadrao();
const CARDS_QUESTOES_PADRAO = montarCardsQuestoesPadrao();

function estaConfigurado() {
  return !!(
    firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.appId &&
    firebaseConfig.apiKey !== "COLE_AQUI_SUA_API_KEY" &&
    firebaseConfig.appId !== "COLE_AQUI_O_APP_ID"
  );
}

function getDominioMatricula() {
  return appConfig.dominioMatricula || "aluno.universorelativo.app";
}

function normalizarMatricula(matricula) {
  return String(matricula || "").trim().replace(/\s+/g, "").toLowerCase();
}

function emailDaMatricula(matricula) {
  return normalizarMatricula(matricula) + "@" + getDominioMatricula();
}

function gerarSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "sessao-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

function obterSessionIdLocalAluno() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch (_) {
    return "";
  }
}

function salvarSessionIdLocalAluno(sessionId) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, String(sessionId || ""));
  } catch (_) {}
}

function limparSessionIdLocalAluno() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_) {}
}

function registrarAvisoSessaoDuplicada() {
  try {
    localStorage.setItem(SESSION_NOTICE_KEY, "other-device");
  } catch (_) {}
}

function consumirAvisoSessaoDuplicada() {
  try {
    const valor = localStorage.getItem(SESSION_NOTICE_KEY) || "";
    if (valor) {
      localStorage.removeItem(SESSION_NOTICE_KEY);
    }
    return valor;
  } catch (_) {
    return "";
  }
}

function garantirFirebase() {
  if (!estaConfigurado()) {
    throw new Error("Preencha firebase-config.js com os dados reais do seu app web.");
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firestoreDb,
    storage: firebaseStorage
  };
}

function encerrarMonitorSessaoAluno() {
  if (typeof monitorSessaoAlunoAtivo === "function") {
    monitorSessaoAlunoAtivo();
  }
  monitorSessaoAlunoAtivo = null;
}

function iniciarMonitorSessaoAluno(uid) {
  const { db, auth } = garantirFirebase();
  encerrarMonitorSessaoAluno();

  monitorSessaoAlunoAtivo = onSnapshot(doc(db, "alunos", uid), async (snap) => {
    if (!snap.exists()) return;

    const dados = snap.data() || {};
    const sessionIdAtivo = String(dados.sessionIdAtivo || "").trim();
    const sessionLocal = obterSessionIdLocalAluno();

    if (!sessionIdAtivo || !sessionLocal || sessionIdAtivo === sessionLocal) {
      return;
    }

    registrarAvisoSessaoDuplicada();
    encerrarMonitorSessaoAluno();
    perfilAtual = null;
    limparSessionIdLocalAluno();
    if (auth.currentUser) {
      await signOut(auth);
    }
  });
}

async function registrarSessaoAtivaAluno(uid) {
  const { db } = garantirFirebase();
  const sessionId = gerarSessionId();
  await setDoc(doc(db, "alunos", uid), {
    sessionIdAtivo: sessionId,
    sessionAtualizadaEm: serverTimestamp(),
    ultimoAcessoEm: serverTimestamp()
  }, { merge: true });

  salvarSessionIdLocalAluno(sessionId);
  if (perfilAtual) {
    perfilAtual = {
      ...perfilAtual,
      sessionIdAtivo: sessionId
    };
  }
  iniciarMonitorSessaoAluno(uid);
  return sessionId;
}

async function buscarPerfilAluno(uid) {
  const { db } = garantirFirebase();
  const alunoRef = doc(db, "alunos", uid);
  const alunoSnap = await getDoc(alunoRef);
  if (!alunoSnap.exists()) {
    return null;
  }
  return {
    uid,
    ...alunoSnap.data()
  };
}

function formatarNumero(valor) {
  return Number.isFinite(Number(valor)) ? Number(valor) : 0;
}

function progressoPadrao() {
  return {
    questoesRespondidas: 0,
    acertos: 0,
    aproveitamento: 0,
    sessoesConcluidas: 0,
    ultimoAcessoEm: null
  };
}

function progressoQuestaoDocId(listaKey, questaoId) {
  return [String(listaKey || "").trim(), String(questaoId || "").trim()]
    .filter(Boolean)
    .join("__")
    .replace(/\//g, "-");
}

function ordenarPorDataRecente(a, b, campo = "dataTentativaCliente") {
  const dataA = String(a && a[campo] ? a[campo] : "");
  const dataB = String(b && b[campo] ? b[campo] : "");
  return dataB.localeCompare(dataA);
}

function normalizarFlashcard(docId, dados) {
  return {
    id: String((dados && dados.id) || docId || "").trim(),
    pergunta: String((dados && dados.pergunta) || "").trim(),
    resposta: String((dados && dados.resposta) || "").trim(),
    materia: String((dados && dados.materia) || "").trim(),
    assunto: String((dados && dados.assunto) || "").trim(),
    criadoPor: String((dados && dados.criadoPor) || "").trim(),
    origem: String((dados && dados.origem) || "global").trim(),
    ativo: !dados || dados.ativo !== false,
    criadoEmCliente: String((dados && dados.criadoEmCliente) || "").trim()
  };
}

function normalizarProgressoFlashcard(docId, dados) {
  return {
    id: String(docId || "").trim(),
    userId: String((dados && (dados.userId || dados.uid)) || "").trim(),
    flashcardId: String((dados && dados.flashcardId) || docId || "").trim(),
    status: String((dados && dados.status) || "").trim(),
    dominio: formatarNumero(dados && dados.dominio),
    acertos: formatarNumero(dados && dados.acertos),
    erros: formatarNumero(dados && dados.erros),
    parciais: formatarNumero(dados && dados.parciais),
    tentativas: formatarNumero(dados && dados.tentativas),
    ultimaRevisaoCliente: String((dados && (dados.ultimaRevisaoCliente || dados.ultima_revisao)) || "").trim()
  };
}

async function listarProgressoFlashcardsAlunoBase(uid) {
  const { db } = garantirFirebase();
  const snap = await getDocs(collection(db, "alunos", uid, SUBCOLECOES_PROGRESSO.flashcards));
  return snap.docs
    .map((item) => normalizarProgressoFlashcard(item.id, item.data()))
    .filter((item) => item.flashcardId);
}

function resumirProgressoAluno(registrosQuestoes, registrosListas) {
  const questoesAtivas = (registrosQuestoes || [])
    .filter((item) => item && item.ativo !== false && item.resolvida === true);
  const listasAtivas = (registrosListas || [])
    .filter((item) => item && item.ativo !== false);

  const questoesRespondidas = questoesAtivas.length;
  const acertos = questoesAtivas.filter((item) => item.acertou === true).length;
  const sessoesConcluidas = listasAtivas.length;

  return {
    questoesRespondidas,
    acertos,
    aproveitamento: questoesRespondidas ? Math.round((acertos / questoesRespondidas) * 100) : 0,
    sessoesConcluidas,
    ultimoAcessoEm: new Date().toISOString()
  };
}

function slugifyTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clonarCatalogoQuestoesPadrao() {
  return JSON.parse(JSON.stringify(CATALOGO_QUESTOES_PADRAO));
}

function hierarquiaKey(disciplinaId, assuntoId, subassuntoId) {
  return [disciplinaId, assuntoId, subassuntoId].filter(Boolean).join("__");
}

function subassuntoDocId(disciplinaId, assuntoId, subassuntoId) {
  return hierarquiaKey(disciplinaId, assuntoId, subassuntoId);
}

function normalizarCardQuestoes(card) {
  const tipo = String(card.tipo || "questoes").trim();
  const botaoPadrao = tipo === "aula"
    ? "Em breve"
    : tipo === "apostila"
      ? "Abrir apostila"
      : "Resolver questoes";
  return {
    id: String(card.id || ""),
    titulo: String(card.titulo || "").trim(),
    descricao: String(card.descricao || "").trim(),
    tag: String(card.tag || (tipo === "aula" ? "Aula" : tipo === "apostila" ? "Apostila" : "Questoes")).trim(),
    tipo,
    botaoLabel: String(card.botaoLabel || botaoPadrao).trim(),
    botaoDesabilitado: card.botaoDesabilitado === true,
    disciplinaId: String(card.disciplinaId || "").trim(),
    disciplinaLabel: String(card.disciplinaLabel || card.disciplina || "").trim(),
    assuntoId: String(card.assuntoId || "").trim(),
    assuntoLabel: String(card.assuntoLabel || card.assunto || "").trim(),
    subassuntoId: String(card.subassuntoId || "").trim(),
    subassuntoLabel: String(card.subassuntoLabel || card.subassunto || "").trim(),
    ordemExibicao: formatarNumero(card.ordemExibicao || 0),
    videoUrl: String(card.videoUrl || "").trim(),
    videoEmbedUrl: String(card.videoEmbedUrl || "").trim(),
    apostilaUrl: String(card.apostilaUrl || card.pdfUrl || "").trim(),
    apostilaNome: String(card.apostilaNome || card.pdfName || "").trim(),
    origem: String(card.origem || "admin"),
    ativo: card.ativo !== false
  };
}

function campoAusente(valor) {
  return valor === undefined || valor === null;
}

function garantirEstruturaCatalogo(catalogo, disciplinaId, disciplinaLabel, assuntoId, assuntoLabel, subassuntoId, subassuntoLabel) {
  if (!catalogo.disciplinas[disciplinaId]) {
    catalogo.disciplinas[disciplinaId] = {
      label: disciplinaLabel || disciplinaId,
      assuntos: {}
    };
  }

  if (!catalogo.disciplinas[disciplinaId].assuntos[assuntoId]) {
    catalogo.disciplinas[disciplinaId].assuntos[assuntoId] = {
      label: assuntoLabel || assuntoId,
      subassuntos: {}
    };
  }

  if (!catalogo.disciplinas[disciplinaId].assuntos[assuntoId].subassuntos) {
    catalogo.disciplinas[disciplinaId].assuntos[assuntoId].subassuntos = {};
  }

  if (subassuntoId && !catalogo.disciplinas[disciplinaId].assuntos[assuntoId].subassuntos[subassuntoId]) {
    catalogo.disciplinas[disciplinaId].assuntos[assuntoId].subassuntos[subassuntoId] = {
      label: subassuntoLabel || subassuntoId
    };
  }
}

function construirCatalogoQuestoes(subassuntosExtras, cardsExtras) {
  const catalogo = clonarCatalogoQuestoesPadrao();

  (subassuntosExtras || []).forEach((item) => {
    if (!item.disciplinaId || !item.assuntoId || !item.subassuntoId) return;
    garantirEstruturaCatalogo(
      catalogo,
      item.disciplinaId,
      item.disciplinaLabel,
      item.assuntoId,
      item.assuntoLabel,
      item.subassuntoId,
      item.label
    );
  });

  const cardsMap = new Map();
  [...CARDS_QUESTOES_PADRAO, ...(cardsExtras || [])]
    .map(normalizarCardQuestoes)
    .filter((card) => card.id && card.disciplinaId && card.assuntoId && card.subassuntoId && card.ativo !== false)
    .forEach((card) => {
      cardsMap.set(card.id, card);
    });

  const cards = Array.from(cardsMap.values())
    .sort((a, b) => (a.ordemExibicao || 0) - (b.ordemExibicao || 0) || a.titulo.localeCompare(b.titulo));

  cards.forEach((card) => {
    garantirEstruturaCatalogo(
      catalogo,
      card.disciplinaId,
      "",
      card.assuntoId,
      "",
      card.subassuntoId,
      ""
    );

    const subassunto = catalogo.disciplinas[card.disciplinaId].assuntos[card.assuntoId].subassuntos[card.subassuntoId];
    if (!subassunto.cards) {
      subassunto.cards = [];
    }

    if (!subassunto.cards.some((item) => item.id === card.id)) {
      subassunto.cards.push(card);
    }
  });

  return catalogo;
}

function textoParaHtml(texto) {
  const textoNormalizado = String(texto || "").trim();
  if (!textoNormalizado) return "";

  return textoNormalizado
    .split(/\n{2,}/)
    .map((bloco) => "<p>" + bloco.trim().replace(/\n/g, "<br>") + "</p>")
    .join("");
}

function normalizarAlternativasQuestao(alternativas) {
  return ["A", "B", "C", "D", "E"].map((letra, indice) => {
    const valor = alternativas && alternativas[indice] ? String(alternativas[indice]).trim() : "";
    return letra.toLowerCase() + ") " + valor;
  });
}

function videoUrlParaEmbed(url) {
  const valor = String(url || "").trim();
  if (!valor) return "";

  const embedMatch = valor.match(/youtube\.com\/embed\/([^&?/]+)/i);
  if (embedMatch && embedMatch[1]) {
    return "https://www.youtube.com/embed/" + embedMatch[1];
  }

  const youtubeMatch = valor.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/i);
  if (!youtubeMatch) return "";

  return "https://www.youtube.com/embed/" + youtubeMatch[1];
}

function normalizarUrlImagemPublica(url) {
  const valor = String(url || "").trim();
  if (!valor) return "";
  try {
    const parsed = new URL(valor);
    if (parsed.hostname.toLowerCase().includes("drive.google.com")) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/i);
      const id = fileMatch && fileMatch[1] ? fileMatch[1] : parsed.searchParams.get("id");
      if (id) return "https://drive.google.com/uc?export=view&id=" + encodeURIComponent(id);
    }
    return parsed.href;
  } catch (_) {
    return valor;
  }
}

function normalizarImagemQuestaoAdmin(imagem) {
  const src = normalizarUrlImagemPublica(imagem && imagem.src ? imagem.src : imagem);
  if (!src) return null;
  return {
    src,
    alt: String((imagem && imagem.alt) || "Imagem da questao"),
    legenda: String((imagem && imagem.legenda) || "")
  };
}

function linkYoutubeValido(url) {
  return !!videoUrlParaEmbed(url);
}

function normalizarNomeArquivoStorage(nome) {
  return String(nome || "arquivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function nomeApostilaPadrao(card) {
  const partes = [
    card.disciplinaId || "fisica-basica",
    card.assuntoId || "assunto",
    card.subassuntoId || "subassunto",
    "apostila.pdf"
  ];
  return normalizarNomeArquivoStorage(partes.join("-"));
}

function decodificarHtmlSimples(texto) {
  const valor = String(texto || "");
  if (!valor) return "";

  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = valor;
    return textarea.value;
  }

  return valor
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function htmlParaTextoSimples(texto) {
  return decodificarHtmlSimples(
    String(texto || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<li>/gi, "- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  ).trim();
}

function normalizarAlternativaLegada(texto) {
  return decodificarHtmlSimples(String(texto || ""))
    .replace(/^\s*[a-e]\)\s*/i, "")
    .trim();
}

function coletarQuestoesLegadasDoBanco() {
  if (typeof window === "undefined" || !window.BANCO_QUESTOES || !window.BANCO_QUESTOES.disciplinas) {
    return [];
  }

  const itens = [];

  Object.entries(window.BANCO_QUESTOES.disciplinas || {}).forEach(([disciplinaId, disciplina]) => {
    Object.entries((disciplina && disciplina.assuntos) || {}).forEach(([assuntoId, assunto]) => {
      const subassuntos = assunto && assunto.subassuntos ? assunto.subassuntos : {};

      Object.entries(subassuntos).forEach(([subassuntoId, subassunto]) => {
        const questoes = Array.isArray(subassunto && subassunto.questoes) ? subassunto.questoes : [];
        questoes.forEach((questao, indice) => {
          if (!questao || !questao.id) return;
          itens.push({
            disciplinaId,
            disciplinaLabel: disciplina && disciplina.label ? disciplina.label : disciplinaId,
            assuntoId,
            assuntoLabel: assunto && assunto.label ? assunto.label : assuntoId,
            subassuntoId,
            subassuntoLabel: subassunto && subassunto.label ? subassunto.label : subassuntoId,
            questao,
            ordemFallback: indice + 1
          });
        });
      });
    });
  });

  return itens;
}

async function listarDocumentosColecao(nomeColecao) {
  const { db } = garantirFirebase();
  const snap = await getDocs(collection(db, nomeColecao));
  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));
}

async function obterCatalogoPersistido() {
  const subassuntos = await listarDocumentosColecao(COLECOES_QUESTOES.subassuntos);
  const cards = await listarDocumentosColecao(COLECOES_QUESTOES.cards);
  return construirCatalogoQuestoes(subassuntos, cards);
}

async function garantirCatalogoQuestoesPadrao() {
  await garantirAdminAtual();
  if (catalogoQuestoesPadraoGarantido) return;
  const { db } = garantirFirebase();

  for (const [disciplinaId, disciplina] of Object.entries(CATALOGO_QUESTOES_PADRAO.disciplinas || {})) {
    for (const [assuntoId, assunto] of Object.entries(disciplina.assuntos || {})) {
      for (const [subassuntoId, subassunto] of Object.entries(assunto.subassuntos || {})) {
        const refSubassunto = doc(db, COLECOES_QUESTOES.subassuntos, subassuntoDocId(disciplinaId, assuntoId, subassuntoId));
        const snapSubassunto = await getDoc(refSubassunto);
        if (!snapSubassunto.exists()) {
          await setDoc(refSubassunto, {
            disciplinaId,
            disciplinaLabel: disciplina.label,
            assuntoId,
            assuntoLabel: assunto.label,
            subassuntoId,
            label: subassunto.label,
            hierarquiaKey: hierarquiaKey(disciplinaId, assuntoId, subassuntoId),
            criadoEm: serverTimestamp(),
            atualizadoEm: serverTimestamp()
          });
        }
      }
    }
  }

  for (const card of CARDS_QUESTOES_PADRAO) {
    const refCard = doc(db, COLECOES_QUESTOES.cards, card.id);
    const snapCard = await getDoc(refCard);
    if (!snapCard.exists()) {
      await setDoc(refCard, {
        ...card,
        ativo: true,
        hierarquiaKey: hierarquiaKey(card.disciplinaId, card.assuntoId, card.subassuntoId),
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      continue;
    }

    const dadosAtuais = snapCard.data() || {};
    const hierarquiaAtual = hierarquiaKey(card.disciplinaId, card.assuntoId, card.subassuntoId);
    const payload = {};
    const preencherSeAusente = (campo, valor) => {
      if (campoAusente(dadosAtuais[campo])) payload[campo] = valor;
    };

    preencherSeAusente("id", card.id);
    preencherSeAusente("disciplinaId", card.disciplinaId);
    preencherSeAusente("assuntoId", card.assuntoId);
    preencherSeAusente("subassuntoId", card.subassuntoId);
    preencherSeAusente("tipo", card.tipo);
    preencherSeAusente("origem", card.origem);
    preencherSeAusente("ordemExibicao", card.ordemExibicao);
    preencherSeAusente("ativo", true);
    if (!dadosAtuais.criadoEm) payload.criadoEm = serverTimestamp();
    if (dadosAtuais.hierarquiaKey !== hierarquiaAtual) payload.hierarquiaKey = hierarquiaAtual;

    if (Object.keys(payload).length) {
      payload.atualizadoEm = serverTimestamp();
      await setDoc(refCard, payload, { merge: true });
    }
  }

  catalogoQuestoesPadraoGarantido = true;
}

async function listarCardsPorHierarquia(disciplinaId, assuntoId, subassuntoId) {
  const { db } = garantirFirebase();
  const snap = await getDocs(query(
    collection(db, COLECOES_QUESTOES.cards),
    where("hierarquiaKey", "==", hierarquiaKey(disciplinaId, assuntoId, subassuntoId))
  ));

  return snap.docs
    .map((item) => normalizarCardQuestoes({
      id: item.id,
      ...item.data()
    }))
    .filter((item) => item.ativo !== false)
    .sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0) || a.titulo.localeCompare(b.titulo));
}

async function listarCardsDoBanco() {
  const { db } = garantirFirebase();
  const snap = await getDocs(collection(db, COLECOES_QUESTOES.cards));
  return snap.docs
    .map((item) => normalizarCardQuestoes({
      id: item.id,
      ...item.data()
    }))
    .filter((item) => item.ativo !== false)
    .sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0) || a.titulo.localeCompare(b.titulo));
}

function montarConsultaFiltrada(nomeColecao, filtros = {}) {
  const { db } = garantirFirebase();
  const constraints = [];

  if (filtros.cardId && (nomeColecao === COLECOES_QUESTOES.questoes || nomeColecao === COLECAO_QUESTIONS_ALIAS)) {
    constraints.push(where("cardId", "==", filtros.cardId));
  } else if (filtros.disciplinaId && filtros.assuntoId && filtros.subassuntoId) {
    constraints.push(where("hierarquiaKey", "==", hierarquiaKey(filtros.disciplinaId, filtros.assuntoId, filtros.subassuntoId)));
  } else if (filtros.disciplinaId) {
    constraints.push(where("disciplinaId", "==", filtros.disciplinaId));
  } else if (filtros.assuntoId) {
    constraints.push(where("assuntoId", "==", filtros.assuntoId));
  } else if (filtros.subassuntoId) {
    constraints.push(where("subassuntoId", "==", filtros.subassuntoId));
  }

  const base = collection(db, nomeColecao);
  return constraints.length ? query(base, ...constraints) : base;
}

function correspondeAosFiltrosGerenciados(item, filtros = {}) {
  if (filtros.disciplinaId && item.disciplinaId !== filtros.disciplinaId) return false;
  if (filtros.assuntoId && item.assuntoId !== filtros.assuntoId) return false;
  if (filtros.subassuntoId && item.subassuntoId !== filtros.subassuntoId) return false;
  if (filtros.cardId && item.cardId !== filtros.cardId) return false;
  return true;
}

function normalizarQuestaoGerenciada(id, dados, origemColecao = COLECOES_QUESTOES.questoes) {
  const resolutionVideoUrl = String(dados.resolutionVideoUrl || dados.videoUrl || "").trim();
  return {
    id,
    ...dados,
    enunciado: dados.enunciado || dados.statement || "",
    alternativas: dados.alternativas || dados.alternatives || [],
    respostaCorreta: dados.respostaCorreta || dados.correctAnswer || "",
    disciplinaId: dados.disciplinaId || dados.disciplineId || "",
    disciplinaLabel: dados.disciplinaLabel || dados.disciplineLabel || dados.disciplina || "",
    assuntoId: dados.assuntoId || dados.subjectId || "",
    assuntoLabel: dados.assuntoLabel || dados.subjectLabel || dados.assunto || "",
    subassuntoId: dados.subassuntoId || dados.subtopicId || "",
    subassuntoLabel: dados.subassuntoLabel || dados.subtopicLabel || dados.subassunto || "",
    cardId: dados.cardId || "",
    cardTitulo: dados.cardTitulo || dados.cardTitle || "",
    resolutionVideoUrl,
    hasResolution: dados.hasResolution === true || Boolean(resolutionVideoUrl),
    ativo: dados.ativo !== false && dados.active !== false,
    origemColecao
  };
}

function normalizarQuestaoProva(item, index) {
  const numero = Number(item && item.numero ? item.numero : index + 1);
  const video = String((item && (item.video || item.resolutionVideoUrl || item.videoUrl)) || "").trim();
  return {
    numero,
    titulo: String((item && item.titulo) || ("Questao " + numero)).trim(),
    video,
    resolutionVideoUrl: video,
    status: String((item && item.status) || (video ? "com-resolucao" : "nao-iniciada")).trim()
  };
}

function normalizarProvaEnem(id, dados = {}) {
  const questoesRaw = Array.isArray(dados.questoes) ? dados.questoes : [];
  const questoesTotal = Number(dados.questoesTotal || questoesRaw.length || 0);
  const questoes = questoesRaw.length
    ? questoesRaw.map(normalizarQuestaoProva)
    : Array.from({ length: questoesTotal }, (_, index) => normalizarQuestaoProva({}, index));
  return {
    id,
    titulo: String(dados.titulo || (dados.ano ? "ENEM " + dados.ano : "Prova ENEM")).trim(),
    ano: String(dados.ano || "").trim(),
    tipo: String(dados.tipo || "ENEM").trim(),
    disciplina: String(dados.disciplina || "Fisica Basica").trim(),
    status: String(dados.status || "rascunho").trim(),
    pdfUrl: String(dados.pdfUrl || dados.pdf || "").trim(),
    pdf: String(dados.pdf || dados.pdfUrl || "").trim(),
    questoesTotal: questoesTotal || questoes.length,
    questoes,
    data: String(dados.data || "").trim(),
    criadoEm: dados.criadoEm || null,
    criadoEmCliente: dados.criadoEmCliente || "",
    ativo: dados.ativo !== false
  };
}

async function uploadPdfProvaEnem(provaId, arquivoPdf, ano = "") {
  if (!arquivoPdf) return null;
  const { storage } = garantirFirebase();
  const nomeSeguro = String(arquivoPdf.name || "prova-enem.pdf").replace(/[^\w.\-]+/g, "-");
  const caminhoStorage = "provas-enem/" + String(ano || provaId || "sem-ano").trim() + "/" + Date.now() + "-" + nomeSeguro;
  const arquivoRef = storageRef(storage, caminhoStorage);
  await uploadBytes(arquivoRef, arquivoPdf, { contentType: arquivoPdf.type || "application/pdf" });
  const pdfUrl = await getDownloadURL(arquivoRef);
  return {
    pdfUrl,
    pdfNome: arquivoPdf.name || nomeSeguro,
    pdfStoragePath: caminhoStorage
  };
}

async function listarCardsFiltradosDoBanco(filtros = {}) {
  const snap = await getDocs(montarConsultaFiltrada(COLECOES_QUESTOES.cards, filtros));
  return snap.docs
    .map((item) => normalizarCardQuestoes({
      id: item.id,
      ...item.data()
    }))
    .filter((item) => item.ativo !== false)
    .filter((item) => correspondeAosFiltrosGerenciados(item, filtros))
    .sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0) || a.titulo.localeCompare(b.titulo));
}

async function listarQuestoesFiltradasDoBanco(filtros = {}, incluirInativos = false) {
  const [snapPrincipal, snapAlias] = await Promise.all([
    getDocs(montarConsultaFiltrada(COLECOES_QUESTOES.questoes, filtros)).catch(() => ({ docs: [] })),
    getDocs(montarConsultaFiltrada(COLECAO_QUESTIONS_ALIAS, filtros)).catch(() => ({ docs: [] }))
  ]);
  const mapa = new Map();
  [
    ...snapPrincipal.docs.map((item) => normalizarQuestaoGerenciada(item.id, item.data(), COLECOES_QUESTOES.questoes)),
    ...snapAlias.docs.map((item) => normalizarQuestaoGerenciada(item.id, item.data(), COLECAO_QUESTIONS_ALIAS))
  ].forEach((item) => {
    if (!mapa.has(item.id)) mapa.set(item.id, item);
  });
  return [...mapa.values()]
    .filter((item) => incluirInativos || item.ativo !== false)
    .filter((item) => correspondeAosFiltrosGerenciados(item, filtros))
    .sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0));
}

async function listarQuestoesPorCard(cardId) {
  const { db } = garantirFirebase();
  const snap = await getDocs(query(
    collection(db, COLECOES_QUESTOES.questoes),
    where("cardId", "==", cardId)
  ));

  return snap.docs
    .map((item) => ({
      id: item.id,
      ...item.data()
    }))
    .filter((item) => item.ativo !== false)
    .sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0));
}

async function listarProgressoQuestoesAluno(uid) {
  const { db } = garantirFirebase();
  const snap = await getDocs(collection(db, "alunos", uid, SUBCOLECOES_PROGRESSO.questoes));
  return snap.docs
    .map((item) => ({
      id: item.id,
      ...item.data()
    }))
    .sort((a, b) => ordenarPorDataRecente(a, b));
}

async function listarProgressoListasAluno(uid) {
  const { db } = garantirFirebase();
  const snap = await getDocs(collection(db, "alunos", uid, SUBCOLECOES_PROGRESSO.listas));
  return snap.docs
    .map((item) => ({
      id: item.id,
      ...item.data()
    }))
    .sort((a, b) => ordenarPorDataRecente(a, b, "dataConclusaoCliente"));
}

async function atualizarResumoProgressoAluno(uid) {
  const { db } = garantirFirebase();
  const [registrosQuestoes, registrosListas] = await Promise.all([
    listarProgressoQuestoesAluno(uid),
    listarProgressoListasAluno(uid)
  ]);

  const resumo = resumirProgressoAluno(registrosQuestoes, registrosListas);
  await setDoc(doc(db, "alunos", uid), {
    progresso: {
      questoesRespondidas: resumo.questoesRespondidas,
      acertos: resumo.acertos,
      aproveitamento: resumo.aproveitamento,
      sessoesConcluidas: resumo.sessoesConcluidas,
      ultimoAcessoEm: serverTimestamp()
    }
  }, { merge: true });

  perfilAtual = {
    ...(perfilAtual || {}),
    progresso: resumo
  };

  return {
    resumo,
    registrosQuestoes,
    registrosListas
  };
}

async function atualizarQuestoesVinculadasAoCard(cardId, atualizacaoCard) {
  const { db } = garantirFirebase();
  const questoes = await listarQuestoesPorCard(cardId);

  for (const questao of questoes) {
    await updateDoc(doc(db, COLECOES_QUESTOES.questoes, questao.id), {
      ...(atualizacaoCard.titulo ? { cardTitulo: atualizacaoCard.titulo } : {}),
      ...(atualizacaoCard.disciplinaId ? {
        disciplinaId: atualizacaoCard.disciplinaId,
        disciplinaLabel: atualizacaoCard.disciplinaLabel,
        assuntoId: atualizacaoCard.assuntoId,
        assuntoLabel: atualizacaoCard.assuntoLabel,
        subassuntoId: atualizacaoCard.subassuntoId,
        subassuntoLabel: atualizacaoCard.subassuntoLabel,
        hierarquiaKey: hierarquiaKey(atualizacaoCard.disciplinaId, atualizacaoCard.assuntoId, atualizacaoCard.subassuntoId)
      } : {}),
      atualizadoEm: serverTimestamp()
    });
  }
}

function normalizarOrdemSolicitada(valor, totalExistente) {
  const ordem = Number(valor || 0);
  if (!Number.isFinite(ordem) || ordem < 1) {
    return totalExistente + 1;
  }
  return Math.min(Math.floor(ordem), totalExistente + 1);
}

async function abrirEspacoNaOrdemDosCards(disciplinaId, assuntoId, subassuntoId, ordemDesejada) {
  const { db } = garantirFirebase();
  const cards = await listarCardsPorHierarquia(disciplinaId, assuntoId, subassuntoId);
  const ordemNormalizada = normalizarOrdemSolicitada(ordemDesejada, cards.length);
  const cardsAfetados = cards.filter((item) => Number(item.ordemExibicao || 0) >= ordemNormalizada);

  for (const card of cardsAfetados) {
    await updateDoc(doc(db, COLECOES_QUESTOES.cards, card.id), {
      ordemExibicao: Number(card.ordemExibicao || 0) + 1,
      atualizadoEm: serverTimestamp()
    });
  }

  return ordemNormalizada;
}

async function abrirEspacoNaOrdemDasQuestoes(cardId, ordemDesejada) {
  const { db } = garantirFirebase();
  const questoes = await listarQuestoesPorCard(cardId);
  const ordemNormalizada = normalizarOrdemSolicitada(ordemDesejada, questoes.length);
  const questoesAfetadas = questoes.filter((item) => Number(item.ordemExibicao || 0) >= ordemNormalizada);

  for (const questao of questoesAfetadas) {
    await updateDoc(doc(db, COLECOES_QUESTOES.questoes, questao.id), {
      ordemExibicao: Number(questao.ordemExibicao || 0) + 1,
      atualizadoEm: serverTimestamp()
    });
  }

  return ordemNormalizada;
}

function encontrarCardNoCatalogo(catalogo, cardId) {
  const disciplinas = Object.values((catalogo && catalogo.disciplinas) || {});
  for (const disciplina of disciplinas) {
    const assuntos = Object.values(disciplina.assuntos || {});
    for (const assunto of assuntos) {
      const subassuntos = Object.values(assunto.subassuntos || {});
      for (const subassunto of subassuntos) {
        const card = (subassunto.cards || []).find((item) => item.id === cardId);
        if (card) return card;
      }
    }
  }
  return null;
}

async function garantirAdminAtual() {
  const { auth } = garantirFirebase();
  if (!auth.currentUser) {
    throw new Error("Entre como administrador antes de gerenciar questoes.");
  }

  const permitido = await verificarAdmin(auth.currentUser.uid);
  if (!permitido) {
    throw new Error("Seu usuario nao tem permissao de administrador.");
  }

  return auth.currentUser;
}

function normalizarPerfilAluno(uid, dados) {
  return {
    uid,
    nome: dados.nome || dados.nomeCompleto || dados.name || dados.fullName || dados.displayName || "",
    matricula: dados.matricula || dados.codigoMatricula || dados.registration || dados.studentId || dados.codigo || "",
    turma: dados.turma || dados.class || dados.className || dados.classe || "",
    emailAuth: dados.emailAuth || dados.email || "",
    fotoPerfil: dados.fotoPerfil || "",
    ativo: dados.ativo !== false,
    criadoEm: dados.criadoEm || null,
    lastLogin: dados.lastLogin || dados.ultimoAcessoEm || null,
    ultimoAcessoEm: dados.ultimoAcessoEm || dados.lastLogin || null,
    sessionIdAtivo: String(dados.sessionIdAtivo || "").trim(),
    progresso: {
      ...progressoPadrao(),
      ...(dados.progresso || {})
    },
    origemColecao: dados.origemColecao || "alunos"
  };
}

function mesclarAlunosPorMatricula(alunos) {
  const mapa = new Map();
  alunos.forEach((aluno) => {
    const chave = normalizarMatricula(aluno.matricula) || aluno.uid;
    if (!mapa.has(chave)) {
      mapa.set(chave, aluno);
      return;
    }
    const atual = mapa.get(chave);
    mapa.set(chave, {
      ...atual,
      ...aluno,
      uid: atual.uid || aluno.uid,
      nome: aluno.nome || atual.nome,
      matricula: aluno.matricula || atual.matricula,
      turma: aluno.turma || atual.turma,
      ativo: atual.ativo !== false || aluno.ativo !== false
    });
  });
  return [...mapa.values()].sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));
}

async function verificarAdmin(uid) {
  const { db } = garantirFirebase();
  const adminRef = doc(db, "admins", uid);
  const adminSnap = await getDoc(adminRef);
  return adminSnap.exists();
}

window.authService = {
  estaConfigurado,

  async identificarSessaoAtual() {
    const { auth } = garantirFirebase();
    if (!auth.currentUser) {
      perfilAtual = null;
      return null;
    }

    const perfil = await buscarPerfilAluno(auth.currentUser.uid);
    if (perfil) {
      perfilAtual = normalizarPerfilAluno(auth.currentUser.uid, perfil);
      return {
        tipo: "aluno",
        perfil: perfilAtual
      };
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (adminPermitido) {
      perfilAtual = null;
      return {
        tipo: "admin",
        perfil: {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || ""
        }
      };
    }

    perfilAtual = null;
    return null;
  },

  async entrarAluno(matricula, senha) {
    const codigoMatricula = normalizarMatricula(matricula);
    if (!codigoMatricula) {
      throw new Error("Informe a matricula.");
    }
    if (!senha) {
      throw new Error("Informe a senha.");
    }
    const { auth } = garantirFirebase();
    sessaoAlunoEmAtualizacao = true;

    try {
      const credencial = await signInWithEmailAndPassword(auth, emailDaMatricula(codigoMatricula), senha);
      const perfil = await buscarPerfilAluno(credencial.user.uid);

      if (!perfil || perfil.ativo === false) {
        await signOut(auth);
        throw new Error("Aluno nao encontrado ou sem permissao de acesso.");
      }

      perfilAtual = normalizarPerfilAluno(credencial.user.uid, perfil);
      await registrarSessaoAtivaAluno(credencial.user.uid);
      return perfilAtual;
    } finally {
      sessaoAlunoEmAtualizacao = false;
    }
  },

  async entrarAdmin(email, senha) {
    if (!email || !senha) {
      throw new Error("Informe email e senha do administrador.");
    }

    const { auth } = garantirFirebase();
    const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
    const permitido = await verificarAdmin(credencial.user.uid);

    if (!permitido) {
      await signOut(auth);
      throw new Error("Este usuario nao esta liberado como administrador.");
    }

    return credencial.user;
  },

  async cadastrarAluno(dadosAluno) {
    const { auth, db } = garantirFirebase();
    const matricula = normalizarMatricula(dadosAluno.matricula);
    const senha = String(dadosAluno.senha || "");
    const nome = String(dadosAluno.nome || "").trim();
    const turma = String(dadosAluno.turma || "").trim();

    if (!matricula || !nome || !senha) {
      throw new Error("Preencha nome, matricula e senha.");
    }

    const adminAtual = auth.currentUser;
    if (!adminAtual) {
      throw new Error("Entre como administrador antes de cadastrar alunos.");
    }

    const adminPermitido = await verificarAdmin(adminAtual.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const appTemporario = initializeApp(firebaseConfig, "cadastro-aluno-" + Date.now());
    const authTemporario = getAuth(appTemporario);

    try {
      const credencialAluno = await createUserWithEmailAndPassword(authTemporario, emailDaMatricula(matricula), senha);

      await setDoc(doc(db, "alunos", credencialAluno.user.uid), {
        nome,
        matricula,
        turma,
        emailAuth: emailDaMatricula(matricula),
        ativo: true,
        criadoEm: serverTimestamp(),
        progresso: progressoPadrao()
      });

      return credencialAluno.user;
    } finally {
      await signOut(authTemporario);
      await deleteApp(appTemporario);
    }
  },

  async listarCatalogoQuestoes() {
    garantirFirebase();
    return obterCatalogoPersistido();
  },

  async criarCardQuestoesAdmin(dadosCard) {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const catalogo = await obterCatalogoPersistido();

    const disciplinaId = String(dadosCard.disciplinaId || "").trim();
    const assuntoId = String(dadosCard.assuntoId || "").trim();
    const subassuntoIdSelecionado = String(dadosCard.subassuntoId || "").trim();
    const novoSubassuntoLabel = String(dadosCard.novoSubassunto || "").trim();
    const titulo = String(dadosCard.titulo || "").trim();

    if (!disciplinaId || !assuntoId || !titulo) {
      throw new Error("Preencha disciplina, assunto e titulo do card.");
    }

    const disciplina = (catalogo.disciplinas || {})[disciplinaId];
    const assunto = disciplina && disciplina.assuntos ? disciplina.assuntos[assuntoId] : null;
    if (!disciplina || !assunto) {
      throw new Error("A hierarquia selecionada nao foi encontrada.");
    }

    const subassuntoId = novoSubassuntoLabel ? slugifyTexto(novoSubassuntoLabel) : subassuntoIdSelecionado;
    if (!subassuntoId) {
      throw new Error("Selecione um subassunto existente ou digite um novo.");
    }

    const subassuntoExistente = assunto.subassuntos ? assunto.subassuntos[subassuntoId] : null;
    const subassuntoLabel = novoSubassuntoLabel || (subassuntoExistente && subassuntoExistente.label) || subassuntoId;

    if (novoSubassuntoLabel && !subassuntoExistente) {
      await setDoc(doc(db, COLECOES_QUESTOES.subassuntos, subassuntoDocId(disciplinaId, assuntoId, subassuntoId)), {
        disciplinaId,
        disciplinaLabel: disciplina.label,
        assuntoId,
        assuntoLabel: assunto.label,
        subassuntoId,
        label: subassuntoLabel,
        hierarquiaKey: hierarquiaKey(disciplinaId, assuntoId, subassuntoId),
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    }

    const ordemExibicao = await abrirEspacoNaOrdemDosCards(
      disciplinaId,
      assuntoId,
      subassuntoId,
      dadosCard.ordemExibicao
    );

    const cardIdBase = slugifyTexto(titulo) || "card-questoes";
    const cardRef = doc(collection(db, COLECOES_QUESTOES.cards));
    await setDoc(cardRef, {
      titulo,
      descricao: String(dadosCard.descricao || "").trim() || "Card de questoes criado pelo painel administrativo.",
      tag: "Questoes",
      tipo: "questoes",
      botaoLabel: "Resolver questoes",
      botaoDesabilitado: false,
      disciplinaId,
      disciplinaLabel: disciplina.label,
      assuntoId,
      assuntoLabel: assunto.label,
      subassuntoId,
      subassuntoLabel,
      ordemExibicao,
      hierarquiaKey: hierarquiaKey(disciplinaId, assuntoId, subassuntoId),
      ativo: true,
      origem: "admin",
      slugBase: cardIdBase,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });

    return {
      id: cardRef.id,
      ordemExibicao,
      titulo
    };
  },

  async cadastrarQuestaoAdmin(dadosQuestao) {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const catalogo = await obterCatalogoPersistido();

    const disciplinaId = String(dadosQuestao.disciplinaId || "").trim();
    const assuntoId = String(dadosQuestao.assuntoId || "").trim();
    const subassuntoIdSelecionado = String(dadosQuestao.subassuntoId || "").trim();
    const novoSubassuntoLabel = String(dadosQuestao.novoSubassunto || "").trim();
    const usarNovoCard = dadosQuestao.cardModo === "novo";
    let cardId = String(dadosQuestao.cardId || "").trim();
    const enunciado = String(dadosQuestao.enunciado || "").trim();
    const alternativasRaw = Array.isArray(dadosQuestao.alternativas) ? dadosQuestao.alternativas : [];
    const alternativas = alternativasRaw.map((item) => String(item || "").trim());
    const respostaCorreta = String(dadosQuestao.respostaCorreta || "").trim().toUpperCase();

    if (!disciplinaId || !assuntoId) {
      throw new Error("Selecione disciplina e assunto.");
    }

    if (!enunciado || alternativas.some((item) => !item) || !["A", "B", "C", "D", "E"].includes(respostaCorreta)) {
      throw new Error("Preencha enunciado, alternativas de A a E e a resposta correta.");
    }

    const subassuntoId = novoSubassuntoLabel ? slugifyTexto(novoSubassuntoLabel) : subassuntoIdSelecionado;
    if (!subassuntoId) {
      throw new Error("Selecione um subassunto existente ou digite um novo.");
    }

    const disciplina = (catalogo.disciplinas || {})[disciplinaId];
    const assunto = disciplina && disciplina.assuntos ? disciplina.assuntos[assuntoId] : null;
    const subassuntoExistente = assunto && assunto.subassuntos ? assunto.subassuntos[subassuntoId] : null;
    const subassuntoLabel = novoSubassuntoLabel || (subassuntoExistente && subassuntoExistente.label) || subassuntoId;

    if (novoSubassuntoLabel && !subassuntoExistente) {
      await setDoc(doc(db, COLECOES_QUESTOES.subassuntos, subassuntoDocId(disciplinaId, assuntoId, subassuntoId)), {
        disciplinaId,
        disciplinaLabel: disciplina ? disciplina.label : disciplinaId,
        assuntoId,
        assuntoLabel: assunto ? assunto.label : assuntoId,
        subassuntoId,
        label: subassuntoLabel,
        hierarquiaKey: hierarquiaKey(disciplinaId, assuntoId, subassuntoId),
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    }
    let card = null;
    if (usarNovoCard) {
      const novoCard = await this.criarCardQuestoesAdmin({
        disciplinaId,
        assuntoId,
        subassuntoId,
        novoSubassunto: novoSubassuntoLabel,
        titulo: dadosQuestao.novoCardTitulo,
        descricao: dadosQuestao.novoCardDescricao,
        ordemExibicao: dadosQuestao.ordemCard
      });
      cardId = novoCard.id;
      card = {
        id: novoCard.id,
        titulo: novoCard.titulo,
        disciplinaId,
        assuntoId,
        subassuntoId
      };
    } else {
      if (!cardId) {
        throw new Error("Escolha um card existente ou crie um novo card.");
      }

      card = encontrarCardNoCatalogo(await obterCatalogoPersistido(), cardId);
      if (!card) {
        throw new Error("O card selecionado nao foi encontrado.");
      }

      if (card.disciplinaId !== disciplinaId || card.assuntoId !== assuntoId || card.subassuntoId !== subassuntoId) {
        throw new Error("O card escolhido precisa pertencer exatamente a disciplina, assunto e subassunto selecionados.");
      }
    }

    const ordemExibicao = await abrirEspacoNaOrdemDasQuestoes(cardId, dadosQuestao.ordemExibicao);

    const questaoRef = doc(collection(db, COLECOES_QUESTOES.questoes));
    await setDoc(questaoRef, {
      enunciado,
      alternativas,
      respostaCorreta,
      resolucaoTexto: String(dadosQuestao.resolucaoTexto || "").trim(),
      videoUrl: String(dadosQuestao.videoUrl || "").trim(),
      videoEmbedUrl: videoUrlParaEmbed(dadosQuestao.videoUrl || ""),
      imagem: normalizarImagemQuestaoAdmin(dadosQuestao.imagem),
      correta: ["A", "B", "C", "D", "E"].indexOf(respostaCorreta),
      cardId,
      cardTitulo: card.titulo,
      disciplinaId,
      disciplinaLabel: disciplina ? disciplina.label : disciplinaId,
      assuntoId,
      assuntoLabel: assunto ? assunto.label : assuntoId,
      subassuntoId,
      subassuntoLabel,
      hierarquiaKey: hierarquiaKey(disciplinaId, assuntoId, subassuntoId),
      ordemExibicao,
      ativo: true,
      origem: "admin",
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });

    return {
      id: questaoRef.id,
      ordemExibicao,
      cardId
    };
  },

  async listarQuestoesGerenciadas(filtros = {}) {
    garantirFirebase();
    return listarQuestoesFiltradasDoBanco(filtros);
  },

  async importarQuestoesLegadasAdmin() {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const legadas = coletarQuestoesLegadasDoBanco();

    if (!legadas.length) {
      return { importadas: 0, puladas: 0 };
    }

    const [catalogo, cardsExistentes, questoesExistentes] = await Promise.all([
      obterCatalogoPersistido(),
      listarCardsDoBanco(),
      this.listarQuestoesGerenciadas()
    ]);

    const idsExistentes = new Set(questoesExistentes.map((item) => String(item.id || "")));
    const cardsCache = [...cardsExistentes];
    const subassuntosCatalogo = (((catalogo || {}).disciplinas) || {});
    let importadas = 0;
    let puladas = 0;

    for (const item of legadas) {
      const questaoId = String(item.questao && item.questao.id ? item.questao.id : "").trim();
      if (!questaoId) {
        puladas += 1;
        continue;
      }

      if (idsExistentes.has(questaoId)) {
        puladas += 1;
        continue;
      }

      const disciplina = subassuntosCatalogo[item.disciplinaId];
      const assunto = disciplina && disciplina.assuntos ? disciplina.assuntos[item.assuntoId] : null;
      const subassunto = assunto && assunto.subassuntos ? assunto.subassuntos[item.subassuntoId] : null;

      if (!subassunto) {
        await setDoc(doc(db, COLECOES_QUESTOES.subassuntos, subassuntoDocId(item.disciplinaId, item.assuntoId, item.subassuntoId)), {
          disciplinaId: item.disciplinaId,
          disciplinaLabel: item.disciplinaLabel,
          assuntoId: item.assuntoId,
          assuntoLabel: item.assuntoLabel,
          subassuntoId: item.subassuntoId,
          label: item.subassuntoLabel,
          hierarquiaKey: hierarquiaKey(item.disciplinaId, item.assuntoId, item.subassuntoId),
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        }, { merge: true });
      }

      const cardsMesmaHierarquia = cardsCache.filter((card) =>
        card.disciplinaId === item.disciplinaId &&
        card.assuntoId === item.assuntoId &&
        card.subassuntoId === item.subassuntoId
      );
      const cardsQuestoes = cardsMesmaHierarquia.filter((card) => card.tipo !== "aula");
      const tituloDesejado = String(item.questao.origem || item.subassuntoLabel || "Lista de questoes").trim();
      const slugTituloDesejado = slugifyTexto(tituloDesejado);

      let cardSelecionado =
        cardsQuestoes.find((card) => slugifyTexto(card.titulo) === slugTituloDesejado) ||
        cardsQuestoes[0] ||
        null;

      if (!cardSelecionado) {
        const ordemExibicao = Math.max(
          1,
          ...cardsMesmaHierarquia.map((card) => Number(card.ordemExibicao || 0))
        ) + (cardsMesmaHierarquia.length ? 1 : 2);
        const cardId = "card-importado-" + item.disciplinaId + "-" + item.assuntoId + "-" + item.subassuntoId + "-" + slugTituloDesejado;
        const novoCard = {
          id: cardId,
          titulo: tituloDesejado || "Lista de questoes",
          descricao: "Card importado automaticamente para reunir questoes antigas ja existentes na plataforma.",
          tag: "Questoes",
          tipo: "questoes",
          botaoLabel: "Resolver questoes",
          botaoDesabilitado: false,
          disciplinaId: item.disciplinaId,
          assuntoId: item.assuntoId,
          subassuntoId: item.subassuntoId,
          ordemExibicao,
          origem: "legado",
          ativo: true
        };

        await setDoc(doc(db, COLECOES_QUESTOES.cards, cardId), {
          ...novoCard,
          hierarquiaKey: hierarquiaKey(item.disciplinaId, item.assuntoId, item.subassuntoId),
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        }, { merge: true });

        cardsCache.push(novoCard);
        cardSelecionado = novoCard;
      }

      const respostaCorretaIndice = Number(item.questao.correta);
      const respostaCorretaLetra = ["A", "B", "C", "D", "E"][respostaCorretaIndice] || "";

      await setDoc(doc(db, COLECOES_QUESTOES.questoes, questaoId), {
        enunciado: htmlParaTextoSimples(item.questao.enunciado || ""),
        alternativas: Array.isArray(item.questao.alternativas)
          ? item.questao.alternativas.map(normalizarAlternativaLegada)
          : [],
        respostaCorreta: respostaCorretaLetra,
        correta: respostaCorretaIndice,
        resolucaoTexto: htmlParaTextoSimples(item.questao.resolucaoEscrita || ""),
        videoUrl: String(item.questao.videoUrl || "").trim(),
        videoEmbedUrl: String(item.questao.videoEmbedUrl || "").trim() || videoUrlParaEmbed(item.questao.videoUrl || ""),
        imagem: normalizarImagemQuestaoAdmin(item.questao.imagem),
        cardId: cardSelecionado.id,
        cardTitulo: cardSelecionado.titulo,
        disciplinaId: item.disciplinaId,
        disciplinaLabel: item.disciplinaLabel,
        assuntoId: item.assuntoId,
        assuntoLabel: item.assuntoLabel,
        subassuntoId: item.subassuntoId,
        subassuntoLabel: item.subassuntoLabel,
        hierarquiaKey: hierarquiaKey(item.disciplinaId, item.assuntoId, item.subassuntoId),
        ordemExibicao: Number(item.questao.ordemExibicao || item.ordemFallback || 1),
        banca: String(item.questao.banca || "Vestibulares").trim(),
        origem: "legado",
        origemTexto: String(item.questao.origem || cardSelecionado.titulo || "").trim(),
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      idsExistentes.add(questaoId);
      importadas += 1;
    }

    return { importadas, puladas };
  },

  async listarCardsGerenciados(filtros = {}) {
    await garantirCatalogoQuestoesPadrao();
    return listarCardsFiltradosDoBanco(filtros);
  },

  async listarQuestoesAdmin(filtros = {}) {
    await garantirCatalogoQuestoesPadrao();
    return listarQuestoesFiltradasDoBanco(filtros, true);
  },

  async atualizarCardQuestoesAdmin(cardId, dadosCard) {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const cardSnap = await getDoc(doc(db, COLECOES_QUESTOES.cards, cardId));
    const cardAtual = cardSnap.exists()
      ? normalizarCardQuestoes({ id: cardSnap.id, ...cardSnap.data() })
      : null;

    if (!cardAtual) {
      throw new Error("Card nao encontrado.");
    }

    const titulo = String(dadosCard.titulo || cardAtual.titulo).trim();
    const descricao = String(dadosCard.descricao || cardAtual.descricao || "").trim();
    const ordemDesejada = dadosCard.ordemExibicao;
    const precisaMover = ordemDesejada && Number(ordemDesejada) !== Number(cardAtual.ordemExibicao || 0);

    if (precisaMover) {
      await updateDoc(doc(db, COLECOES_QUESTOES.cards, cardId), {
        ordemExibicao: 999999,
        atualizadoEm: serverTimestamp()
      });
      const novaOrdem = await abrirEspacoNaOrdemDosCards(cardAtual.disciplinaId, cardAtual.assuntoId, cardAtual.subassuntoId, ordemDesejada);
      await updateDoc(doc(db, COLECOES_QUESTOES.cards, cardId), {
        titulo,
        descricao,
        ordemExibicao: novaOrdem,
        atualizadoEm: serverTimestamp()
      });
    } else {
      await updateDoc(doc(db, COLECOES_QUESTOES.cards, cardId), {
        titulo,
        descricao,
        atualizadoEm: serverTimestamp()
      });
    }

    await atualizarQuestoesVinculadasAoCard(cardId, {
      titulo
    });

    return true;
  },

  async excluirCardQuestoesAdmin(cardId) {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const cardSnap = await getDoc(doc(db, COLECOES_QUESTOES.cards, cardId));
    const cardAtual = cardSnap.exists()
      ? normalizarCardQuestoes({ id: cardSnap.id, ...cardSnap.data() })
      : null;
    if (!cardAtual) {
      throw new Error("Card nao encontrado.");
    }

    await updateDoc(doc(db, COLECOES_QUESTOES.cards, cardId), {
      ativo: false,
      atualizadoEm: serverTimestamp()
    });

    const questoes = await listarQuestoesPorCard(cardId);
    for (const questao of questoes) {
      await updateDoc(doc(db, COLECOES_QUESTOES.questoes, questao.id), {
        ativo: false,
        atualizadoEm: serverTimestamp()
      });
    }

    return true;
  },

  async atualizarQuestaoAdmin(questaoId, dadosQuestao) {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const questaoRefPrincipal = doc(db, COLECOES_QUESTOES.questoes, questaoId);
    const questaoSnapPrincipal = await getDoc(questaoRefPrincipal);
    const questaoRef = questaoSnapPrincipal.exists() ? questaoRefPrincipal : doc(db, COLECAO_QUESTIONS_ALIAS, questaoId);
    const questaoSnap = questaoSnapPrincipal.exists() ? questaoSnapPrincipal : await getDoc(questaoRef);
    const questaoAtual = questaoSnap.exists()
      ? { id: questaoSnap.id, ...questaoSnap.data() }
      : null;

    if (!questaoAtual) {
      const respostaNova = String(dadosQuestao.respostaCorreta || "").trim().toUpperCase();
      const resolutionVideoUrl = String(dadosQuestao.resolutionVideoUrl || dadosQuestao.videoUrl || "").trim();
      await setDoc(questaoRef, {
        enunciado: String(dadosQuestao.enunciado || "").trim(),
        alternativas: Array.isArray(dadosQuestao.alternativas) ? dadosQuestao.alternativas.map((item) => String(item || "").trim()) : [],
        respostaCorreta: respostaNova,
        correta: ["A", "B", "C", "D", "E"].indexOf(respostaNova),
        resolucaoTexto: String(dadosQuestao.resolucaoTexto || "").trim(),
        resolutionVideoUrl,
        hasResolution: Boolean(resolutionVideoUrl),
        videoUrl: resolutionVideoUrl,
        videoEmbedUrl: videoUrlParaEmbed(resolutionVideoUrl),
        disciplinaId: String(dadosQuestao.disciplinaId || "").trim(),
        disciplinaLabel: String(dadosQuestao.disciplinaLabel || "").trim(),
        assuntoId: String(dadosQuestao.assuntoId || "").trim(),
        assuntoLabel: String(dadosQuestao.assuntoLabel || "").trim(),
        subassuntoId: String(dadosQuestao.subassuntoId || "").trim(),
        subassuntoLabel: String(dadosQuestao.subassuntoLabel || "").trim(),
        cardId: String(dadosQuestao.cardId || "").trim(),
        cardTitulo: String(dadosQuestao.cardTitulo || "").trim(),
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }, { merge: true });
      return true;
    }

    const respostaCorreta = String(dadosQuestao.respostaCorreta || questaoAtual.respostaCorreta || "").trim().toUpperCase();
    const payload = {
      enunciado: String(dadosQuestao.enunciado || questaoAtual.enunciado || "").trim(),
      alternativas: Array.isArray(dadosQuestao.alternativas) ? dadosQuestao.alternativas.map((item) => String(item || "").trim()) : questaoAtual.alternativas,
      respostaCorreta,
      correta: ["A", "B", "C", "D", "E"].indexOf(respostaCorreta),
      resolucaoTexto: typeof dadosQuestao.resolucaoTexto === "string" ? dadosQuestao.resolucaoTexto.trim() : (questaoAtual.resolucaoTexto || ""),
      videoUrl: typeof dadosQuestao.videoUrl === "string" ? dadosQuestao.videoUrl.trim() : (questaoAtual.videoUrl || ""),
      videoEmbedUrl: videoUrlParaEmbed(typeof dadosQuestao.videoUrl === "string" ? dadosQuestao.videoUrl.trim() : (questaoAtual.videoUrl || "")),
      atualizadoEm: serverTimestamp()
    };

    if (typeof dadosQuestao.resolutionVideoUrl === "string") {
      payload.resolutionVideoUrl = dadosQuestao.resolutionVideoUrl.trim();
      payload.hasResolution = Boolean(payload.resolutionVideoUrl);
      payload.videoUrl = payload.resolutionVideoUrl;
      payload.videoEmbedUrl = videoUrlParaEmbed(payload.resolutionVideoUrl);
    } else if (typeof dadosQuestao.hasResolution === "boolean") {
      payload.hasResolution = dadosQuestao.hasResolution;
    }

    const ordemDesejada = dadosQuestao.ordemExibicao;
    const precisaMover = ordemDesejada && Number(ordemDesejada) !== Number(questaoAtual.ordemExibicao || 0);

    if (precisaMover) {
      await updateDoc(doc(db, COLECOES_QUESTOES.questoes, questaoId), {
        ordemExibicao: 999999,
        atualizadoEm: serverTimestamp()
      });
      const novaOrdem = await abrirEspacoNaOrdemDasQuestoes(questaoAtual.cardId, ordemDesejada);
      payload.ordemExibicao = novaOrdem;
    }

    await updateDoc(questaoRef, payload);
    return true;
  },

  async excluirQuestaoAdmin(questaoId) {
    await garantirCatalogoQuestoesPadrao();
    const { db } = garantirFirebase();
    const questaoRefPrincipal = doc(db, COLECOES_QUESTOES.questoes, questaoId);
    const questaoSnapPrincipal = await getDoc(questaoRefPrincipal);
    const questaoRef = questaoSnapPrincipal.exists() ? questaoRefPrincipal : doc(db, COLECAO_QUESTIONS_ALIAS, questaoId);
    await setDoc(questaoRef, {
      ativo: false,
      atualizadoEm: serverTimestamp()
    }, { merge: true });
    return true;
  },

  async listarProvasAdmin() {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de listar provas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const snap = await getDocs(collection(db, COLECAO_EXAMS));
    return snap.docs
      .map((item) => normalizarProvaEnem(item.id, item.data()))
      .filter((item) => item.ativo !== false)
      .sort((a, b) => Number(b.ano || 0) - Number(a.ano || 0) || String(b.criadoEmCliente || "").localeCompare(String(a.criadoEmCliente || "")));
  },

  async listarProvasPublicas() {
    const { db } = garantirFirebase();
    const snap = await getDocs(collection(db, COLECAO_EXAMS));
    return snap.docs
      .map((item) => normalizarProvaEnem(item.id, item.data()))
      .filter((item) => item.ativo !== false && item.status === "publicado")
      .sort((a, b) => Number(b.ano || 0) - Number(a.ano || 0) || String(b.criadoEmCliente || "").localeCompare(String(a.criadoEmCliente || "")));
  },

  async criarProvaAdmin(dadosProva = {}) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de criar provas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const titulo = String(dadosProva.titulo || "").trim();
    if (!titulo) {
      throw new Error("Informe o titulo da prova.");
    }

    const provaRef = doc(collection(db, COLECAO_EXAMS));
    const pdfUpload = await uploadPdfProvaEnem(provaRef.id, dadosProva.pdfFile, dadosProva.ano);
    const pdfUrl = String((pdfUpload && pdfUpload.pdfUrl) || dadosProva.pdfUrl || dadosProva.pdf || "").trim();
    await setDoc(provaRef, {
      titulo,
      ano: String(dadosProva.ano || "").trim(),
      tipo: String(dadosProva.tipo || "ENEM").trim(),
      disciplina: String(dadosProva.disciplina || "Fisica Basica").trim(),
      status: String(dadosProva.status || "rascunho").trim(),
      duracao: String(dadosProva.duracao || "").trim(),
      pdfUrl,
      pdf: pdfUrl,
      pdfNome: pdfUpload ? pdfUpload.pdfNome : String(dadosProva.pdfNome || "").trim(),
      pdfStoragePath: pdfUpload ? pdfUpload.pdfStoragePath : String(dadosProva.pdfStoragePath || "").trim(),
      questoesTotal: Number(dadosProva.questoesTotal || 0),
      questoes: Array.isArray(dadosProva.questoes) ? dadosProva.questoes.map(normalizarQuestaoProva) : [],
      data: String(dadosProva.data || new Date().toLocaleDateString("pt-BR")).trim(),
      ativo: true,
      criadoEmCliente: new Date().toISOString(),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });

    return { id: provaRef.id };
  },

  async criarAulaAdmin(dadosAula = {}) {
    await garantirCatalogoQuestoesPadrao();
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de criar aulas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const disciplinaId = String(dadosAula.disciplinaId || "").trim();
    const assuntoId = String(dadosAula.assuntoId || "").trim();
    const subassuntoId = String(dadosAula.subassuntoId || "").trim();
    const titulo = String(dadosAula.titulo || "").trim();
    const videoUrl = String(dadosAula.videoUrl || "").trim();
    if (!disciplinaId || !assuntoId || !subassuntoId || !titulo) {
      throw new Error("Informe disciplina, assunto, subassunto e titulo da aula.");
    }

    const catalogo = await obterCatalogoPersistido();
    const disciplina = (catalogo.disciplinas || {})[disciplinaId] || {};
    const assunto = disciplina.assuntos ? disciplina.assuntos[assuntoId] || {} : {};
    const subassunto = assunto.subassuntos ? assunto.subassuntos[subassuntoId] || {} : {};
    const cards = await listarCardsPorHierarquia(disciplinaId, assuntoId, subassuntoId);
    const aulaRef = doc(collection(db, COLECOES_QUESTOES.cards));
    await setDoc(aulaRef, {
      titulo,
      descricao: String(dadosAula.descricao || "").trim(),
      tag: "Aula",
      tipo: "aula",
      botaoLabel: videoUrl ? "Assistir aula" : "Em breve",
      botaoDesabilitado: !videoUrl,
      disciplinaId,
      disciplinaLabel: disciplina.label || disciplinaId,
      assuntoId,
      assuntoLabel: assunto.label || assuntoId,
      subassuntoId,
      subassuntoLabel: subassunto.label || subassuntoId,
      hierarquiaKey: hierarquiaKey(disciplinaId, assuntoId, subassuntoId),
      ordemExibicao: cards.length + 1,
      videoUrl,
      videoEmbedUrl: videoUrlParaEmbed(videoUrl),
      origem: "admin",
      ativo: true,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });

    return { id: aulaRef.id };
  },

  async editarAulaAdmin(cardId, dadosAula = {}) {
    await garantirCatalogoQuestoesPadrao();
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de editar aulas.");
    }
    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }
    const id = String(cardId || "").trim();
    if (!id) throw new Error("Aula invalida.");

    const cardRef = doc(db, COLECOES_QUESTOES.cards, id);
    const cardSnap = await getDoc(cardRef);
    let cardAtualAula = cardSnap.exists()
      ? normalizarCardQuestoes({ id: cardSnap.id, ...cardSnap.data() })
      : null;

    if (!cardAtualAula) {
      const cardPadrao = CARDS_QUESTOES_PADRAO.find((item) => item.id === id);
      if (cardPadrao) {
        await setDoc(cardRef, {
          ...cardPadrao,
          ativo: true,
          hierarquiaKey: hierarquiaKey(cardPadrao.disciplinaId, cardPadrao.assuntoId, cardPadrao.subassuntoId),
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        }, { merge: true });
        cardAtualAula = normalizarCardQuestoes(cardPadrao);
      } else if (dadosAula.disciplinaId && dadosAula.assuntoId && dadosAula.subassuntoId) {
        const cardContexto = {
          id,
          tipo: "aula",
          titulo: String(dadosAula.titulo || "Aula").trim(),
          descricao: String(dadosAula.descricao || "").trim(),
          disciplinaId: String(dadosAula.disciplinaId),
          disciplinaLabel: String(dadosAula.disciplinaLabel || dadosAula.disciplinaId),
          assuntoId: String(dadosAula.assuntoId),
          assuntoLabel: String(dadosAula.assuntoLabel || dadosAula.assuntoId),
          subassuntoId: String(dadosAula.subassuntoId),
          subassuntoLabel: String(dadosAula.subassuntoLabel || dadosAula.subassuntoId),
          hierarquiaKey: hierarquiaKey(String(dadosAula.disciplinaId), String(dadosAula.assuntoId), String(dadosAula.subassuntoId)),
          ordemExibicao: Number(dadosAula.ordemExibicao) || 1,
          botaoLabel: "Em breve",
          botaoDesabilitado: true,
          videoUrl: "",
          videoEmbedUrl: "",
          ativo: true,
          origem: "sistema",
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        };
        await setDoc(cardRef, cardContexto, { merge: true });
        cardAtualAula = normalizarCardQuestoes(cardContexto);
      }
    }

    if (!cardAtualAula) throw new Error("Aula nao encontrada.");
    if (cardAtualAula.tipo !== "aula") throw new Error("Este card nao e uma aula.");

    const payload = { atualizadoEm: serverTimestamp() };
    if (typeof dadosAula.titulo === "string" && dadosAula.titulo.trim()) payload.titulo = dadosAula.titulo.trim();
    if (typeof dadosAula.descricao === "string") payload.descricao = dadosAula.descricao.trim();
    if (typeof dadosAula.videoUrl === "string") {
      const videoUrl = dadosAula.videoUrl.trim();
      payload.videoUrl = videoUrl;
      payload.videoEmbedUrl = videoUrlParaEmbed(videoUrl);
      payload.botaoLabel = videoUrl ? "Assistir aula" : "Em breve";
      payload.botaoDesabilitado = !videoUrl;
    }

    await updateDoc(cardRef, payload);
    return true;
  },

  async excluirAulaAdmin(cardId) {
    await garantirCatalogoQuestoesPadrao();
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de remover aulas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const id = String(cardId || "").trim();
    if (!id) {
      throw new Error("Aula invalida.");
    }

    const cardRef = doc(db, COLECOES_QUESTOES.cards, id);
    const cardSnap = await getDoc(cardRef);
    const cardAtual = cardSnap.exists()
      ? normalizarCardQuestoes({ id: cardSnap.id, ...cardSnap.data() })
      : null;

    if (!cardAtual || cardAtual.tipo !== "aula") {
      throw new Error("Aula nao encontrada.");
    }

    const payload = String(cardAtual.origem || "") === "admin"
      ? { ativo: false, atualizadoEm: serverTimestamp() }
      : {
          videoUrl: "",
          videoEmbedUrl: "",
          botaoLabel: "Em breve",
          botaoDesabilitado: true,
          atualizadoEm: serverTimestamp()
        };

    await updateDoc(cardRef, payload);
    return true;
  },

  async excluirApostilaAdmin(cardId) {
    await garantirCatalogoQuestoesPadrao();
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de remover apostilas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const id = String(cardId || "").trim();
    if (!id) {
      throw new Error("Apostila invalida.");
    }

    const cardRef = doc(db, COLECOES_QUESTOES.cards, id);
    const cardSnap = await getDoc(cardRef);
    const cardAtual = cardSnap.exists()
      ? normalizarCardQuestoes({ id: cardSnap.id, ...cardSnap.data() })
      : null;

    if (!cardAtual || cardAtual.tipo !== "apostila") {
      throw new Error("Apostila nao encontrada.");
    }

    await updateDoc(cardRef, {
      apostilaUrl: "",
      apostilaNome: "",
      apostilaStoragePath: "",
      botaoLabel: "Abrir apostila",
      botaoDesabilitado: true,
      atualizadoEm: serverTimestamp()
    });
    return true;
  },

  async atualizarProvaAdmin(provaId, dadosProva = {}) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de editar provas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const payload = { atualizadoEm: serverTimestamp() };
    ["titulo", "ano", "tipo", "disciplina", "status", "duracao", "data", "pdfUrl", "pdf"].forEach((campo) => {
      if (typeof dadosProva[campo] === "string") payload[campo] = dadosProva[campo].trim();
    });
    if (typeof dadosProva.questoesTotal !== "undefined") {
      payload.questoesTotal = Number(dadosProva.questoesTotal || 0);
    }
    if (Array.isArray(dadosProva.questoes)) {
      payload.questoes = dadosProva.questoes.map(normalizarQuestaoProva);
    }
    const pdfUpload = await uploadPdfProvaEnem(provaId, dadosProva.pdfFile, dadosProva.ano);
    if (pdfUpload) {
      payload.pdfUrl = pdfUpload.pdfUrl;
      payload.pdf = pdfUpload.pdfUrl;
      payload.pdfNome = pdfUpload.pdfNome;
      payload.pdfStoragePath = pdfUpload.pdfStoragePath;
    }

    await updateDoc(doc(db, COLECAO_EXAMS, provaId), payload);
    return true;
  },

  async excluirProvaAdmin(provaId) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de excluir provas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    await updateDoc(doc(db, COLECAO_EXAMS, provaId), {
      ativo: false,
      atualizadoEm: serverTimestamp()
    });
    return true;
  },

  async duplicarProvaAdmin(provaId) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de duplicar provas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const provaSnap = await getDoc(doc(db, COLECAO_EXAMS, provaId));
    if (!provaSnap.exists()) {
      throw new Error("Prova nao encontrada.");
    }

    const dados = provaSnap.data() || {};
    const novaRef = doc(collection(db, COLECAO_EXAMS));
    await setDoc(novaRef, {
      ...dados,
      titulo: String(dados.titulo || "Prova").trim() + " - copia",
      status: "rascunho",
      ativo: true,
      criadoEmCliente: new Date().toISOString(),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    });
    return { id: novaRef.id };
  },

  async listarCardsAulasAdmin(filtros = {}) {
    await garantirCatalogoQuestoesPadrao();
    const cards = await listarCardsFiltradosDoBanco(filtros);
    return cards.filter((item) => {
      if (!["aula", "apostila"].includes(String(item.tipo || "").trim())) return false;
      return true;
    });
  },

  async atualizarMidiaCardAdmin(cardId, dadosMidia = {}) {
    await garantirCatalogoQuestoesPadrao();
    const { auth, db, storage } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de editar aulas.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const cardRef = doc(db, COLECOES_QUESTOES.cards, cardId);
    const cardSnap = await getDoc(cardRef);
    let cardAtual = cardSnap.exists()
      ? normalizarCardQuestoes({ id: cardSnap.id, ...cardSnap.data() })
      : null;

    if (!cardAtual) {
      const cardPadrao = CARDS_QUESTOES_PADRAO.find((item) => item.id === cardId);
      if (cardPadrao) {
        await setDoc(cardRef, {
          ...cardPadrao,
          ativo: true,
          hierarquiaKey: hierarquiaKey(cardPadrao.disciplinaId, cardPadrao.assuntoId, cardPadrao.subassuntoId),
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        }, { merge: true });
        cardAtual = normalizarCardQuestoes(cardPadrao);
      }
    }

    if (!cardAtual || cardAtual.ativo === false) {
      throw new Error("Card de aula ou apostila nao encontrado.");
    }

    if (cardAtual.tipo === "aula") {
      const videoUrl = String(dadosMidia.videoUrl || "").trim();
      const videoEmbedUrl = videoUrlParaEmbed(videoUrl);
      if (!videoUrl || !videoEmbedUrl) {
        throw new Error("Cole um link valido do YouTube para salvar a aula.");
      }

      await updateDoc(cardRef, {
        videoUrl,
        videoEmbedUrl,
        botaoLabel: "Assistir aula",
        botaoDesabilitado: false,
        atualizadoEm: serverTimestamp()
      });

      return {
        tipo: "aula",
        videoUrl,
        videoEmbedUrl
      };
    }

    if (cardAtual.tipo === "apostila") {
      const linkApostila = String(dadosMidia.apostilaUrl || dadosMidia.pdfUrl || dadosMidia.link || "").trim();
      if (linkApostila) {
        await updateDoc(cardRef, {
          apostilaUrl: linkApostila,
          apostilaNome: String(dadosMidia.apostilaNome || dadosMidia.nome || nomeApostilaPadrao(cardAtual)).trim() || nomeApostilaPadrao(cardAtual),
          apostilaStoragePath: "",
          botaoLabel: "Abrir apostila",
          botaoDesabilitado: false,
          atualizadoEm: serverTimestamp()
        });

        return {
          tipo: "apostila",
          apostilaUrl: linkApostila,
          apostilaNome: String(dadosMidia.apostilaNome || dadosMidia.nome || nomeApostilaPadrao(cardAtual)).trim() || nomeApostilaPadrao(cardAtual)
        };
      }

      const arquivoPdf = dadosMidia.arquivoPdf instanceof File ? dadosMidia.arquivoPdf : null;
      if (!arquivoPdf) {
        throw new Error("Cole um link publico do PDF para salvar a apostila.");
      }

      const nomeArquivo = normalizarNomeArquivoStorage(arquivoPdf.name || nomeApostilaPadrao(cardAtual)) || nomeApostilaPadrao(cardAtual);
      const caminhoStorage = [
        "apostilas",
        cardAtual.disciplinaId || "fisica-basica",
        cardAtual.assuntoId || "assunto",
        cardAtual.subassuntoId || "subassunto",
        cardId,
        nomeArquivo
      ].join("/");

      const arquivoRef = storageRef(storage, caminhoStorage);
      await uploadBytes(arquivoRef, arquivoPdf, {
        contentType: arquivoPdf.type || "application/pdf"
      });
      const apostilaUrl = await getDownloadURL(arquivoRef);

      await updateDoc(cardRef, {
        apostilaUrl,
        apostilaNome: String(arquivoPdf.name || nomeArquivo).trim() || nomeArquivo,
        apostilaStoragePath: caminhoStorage,
        botaoLabel: "Abrir apostila",
        botaoDesabilitado: false,
        atualizadoEm: serverTimestamp()
      });

      return {
        tipo: "apostila",
        apostilaUrl,
        apostilaNome: String(arquivoPdf.name || nomeArquivo).trim() || nomeArquivo
      };
    }

    throw new Error("Esse card nao e uma aula nem uma apostila editavel.");
  },

  async sair() {
    if (!firebaseAuth) return;
    encerrarMonitorSessaoAluno();
    perfilAtual = null;
    limparSessionIdLocalAluno();
    await signOut(firebaseAuth);
  },

  async listarAlunos() {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de visualizar a lista de alunos.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const colecoes = ["alunos", "students", "usuarios", "users"];
    const resultados = await Promise.allSettled(colecoes.map(async (nomeColecao) => {
      const snap = await getDocs(collection(db, nomeColecao));
      return {
        nomeColecao,
        docs: snap.docs
      };
    }));
    const errosPrincipais = resultados
      .map((resultado, index) => ({ resultado, nomeColecao: colecoes[index] }))
      .filter((item) => ["alunos", "students"].includes(item.nomeColecao) && item.resultado.status === "rejected");

    if (errosPrincipais.length === 2) {
      throw new Error("Nao foi possivel ler as colecoes de alunos: " + errosPrincipais.map((item) => item.nomeColecao).join(", "));
    }

    const alunos = [];
    resultados.forEach((resultado) => {
      if (resultado.status !== "fulfilled") return;
      const { nomeColecao, docs } = resultado.value;
      docs.forEach((alunoDoc) => {
        const dados = alunoDoc.data() || {};
        const tipo = String(dados.tipo || dados.role || dados.perfil || "").toLowerCase();
        const pareceAluno = nomeColecao === "alunos" || nomeColecao === "students" || tipo.includes("aluno") || tipo.includes("student") || dados.matricula || dados.studentId;
        if (!pareceAluno) return;
        alunos.push(normalizarPerfilAluno(alunoDoc.id, { ...dados, origemColecao: nomeColecao }));
      });
    });
    return mesclarAlunosPorMatricula(alunos);
  },

  async atualizarAluno(uid, dadosAluno) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de editar alunos.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const atualizacao = {};
    if (typeof dadosAluno.nome === "string") atualizacao.nome = dadosAluno.nome.trim();
    if (typeof dadosAluno.turma === "string") atualizacao.turma = dadosAluno.turma.trim();
    if (typeof dadosAluno.ativo === "boolean") atualizacao.ativo = dadosAluno.ativo;

    const alunoRef = doc(db, "alunos", uid);
    const studentRef = doc(db, "students", uid);
    const alunoSnap = await getDoc(alunoRef);
    const refAtual = alunoSnap.exists() ? alunoRef : studentRef;
    await setDoc(refAtual, atualizacao, { merge: true });
    const perfilSnap = await getDoc(refAtual);
    return normalizarPerfilAluno(uid, {
      ...(perfilSnap.data() || {}),
      origemColecao: alunoSnap.exists() ? "alunos" : "students"
    });
  },

  async atualizarSenhaAluno(matricula, senhaAtual, novaSenha) {
    const { auth } = garantirFirebase();
    if (!auth.currentUser) {
      throw new Error("Entre como administrador antes de trocar a senha.");
    }

    const adminPermitido = await verificarAdmin(auth.currentUser.uid);
    if (!adminPermitido) {
      throw new Error("Seu usuario nao tem permissao de administrador.");
    }

    const codigoMatricula = normalizarMatricula(matricula);
    if (!codigoMatricula || !senhaAtual || !novaSenha) {
      throw new Error("Informe matricula, senha atual e nova senha.");
    }

    const appTemporario = initializeApp(firebaseConfig, "troca-senha-" + Date.now());
    const authTemporario = getAuth(appTemporario);

    try {
      const credencialAluno = await signInWithEmailAndPassword(authTemporario, emailDaMatricula(codigoMatricula), senhaAtual);
      await updatePassword(credencialAluno.user, novaSenha);
      return true;
    } finally {
      await signOut(authTemporario);
      await deleteApp(appTemporario);
    }
  },

  async atualizarSenhaAlunoAtual(senhaAtual, novaSenha) {
    const { auth } = garantirFirebase();
    const usuario = auth.currentUser;
    if (!usuario) {
      throw new Error("Sessão do aluno não encontrada.");
    }
    if (!senhaAtual || !novaSenha) {
      throw new Error("Informe a senha atual e a nova senha.");
    }
    if (String(novaSenha).length < 6) {
      throw new Error("A nova senha precisa ter pelo menos 6 caracteres.");
    }

    const perfil = await buscarPerfilAluno(usuario.uid);
    if (!perfil || perfil.ativo === false) {
      throw new Error("Perfil do aluno não encontrado.");
    }

    const credencial = EmailAuthProvider.credential(usuario.email || perfil.emailAuth || emailDaMatricula(perfil.matricula), senhaAtual);
    await reauthenticateWithCredential(usuario, credencial);
    await updatePassword(usuario, novaSenha);
    return true;
  },

  async atualizarFotoPerfilAlunoAtual(fotoPerfil) {
    const { auth, db } = garantirFirebase();
    const usuario = auth.currentUser;
    if (!usuario) {
      throw new Error("Sessão do aluno não encontrada.");
    }

    const perfil = await buscarPerfilAluno(usuario.uid);
    if (!perfil || perfil.ativo === false) {
      throw new Error("Perfil do aluno não encontrado.");
    }

    const foto = String(fotoPerfil || "").trim();
    if (!foto || !foto.startsWith("data:image/")) {
      throw new Error("Envie uma imagem válida.");
    }

    await setDoc(doc(db, "alunos", usuario.uid), {
      fotoPerfil: foto,
      fotoPerfilAtualizadaEm: serverTimestamp()
    }, { merge: true });

    perfilAtual = normalizarPerfilAluno(usuario.uid, {
      ...perfil,
      fotoPerfil: foto
    });

    return perfilAtual;
  },

  async salvarProgressoAluno(uid, progresso) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const payload = {
      progresso: {
        questoesRespondidas: formatarNumero(progresso.questoesRespondidas),
        acertos: formatarNumero(progresso.acertos),
        aproveitamento: formatarNumero(progresso.aproveitamento),
        sessoesConcluidas: formatarNumero(progresso.sessoesConcluidas),
        ultimoAcessoEm: serverTimestamp()
      }
    };

    await setDoc(doc(db, "alunos", uid), payload, { merge: true });
    perfilAtual = {
      ...(perfilAtual || {}),
      progresso: {
        ...progressoPadrao(),
        ...(payload.progresso || {}),
        ultimoAcessoEm: new Date().toISOString()
      }
    };
    return perfilAtual;
  },

  async listarHistoricoQuestoesAluno(uid) {
    const { auth } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const registros = await listarProgressoQuestoesAluno(uid);
    return registros.filter((item) => item.ativo !== false);
  },

  async salvarTentativaQuestaoAluno(uid, tentativa) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const listaKey = String(tentativa.listaKey || "").trim();
    const questaoId = String(tentativa.questaoId || "").trim();
    if (!listaKey || !questaoId) {
      throw new Error("Dados da tentativa incompletos.");
    }

    const alternativaIndice = Number(tentativa.alternativaMarcadaIndice);
    const alternativaLetra = String(tentativa.alternativaMarcada || "").trim().toUpperCase();
    const tentativaRef = doc(db, "alunos", uid, SUBCOLECOES_PROGRESSO.questoes, progressoQuestaoDocId(listaKey, questaoId));
    const agora = new Date().toISOString();

    await setDoc(tentativaRef, {
      uid,
      listaKey,
      questaoId,
      disciplinaId: String(tentativa.disciplinaId || "").trim(),
      assuntoId: String(tentativa.assuntoId || "").trim(),
      subassuntoId: String(tentativa.subassuntoId || "").trim(),
      cardId: String(tentativa.cardId || "").trim(),
      banca: String(tentativa.banca || "").trim(),
      resolvida: tentativa.resolvida === true,
      acertou: tentativa.acertou === true,
      alternativaMarcada: alternativaLetra,
      alternativaMarcadaIndice: Number.isInteger(alternativaIndice) ? alternativaIndice : -1,
      dataTentativaCliente: agora,
      dataTentativa: serverTimestamp(),
      ativo: true
    }, { merge: true });

    const { resumo } = await atualizarResumoProgressoAluno(uid);
    return {
      resumo,
      registro: {
        uid,
        listaKey,
        questaoId,
        resolvida: tentativa.resolvida === true,
        acertou: tentativa.acertou === true,
        alternativaMarcada: alternativaLetra,
        alternativaMarcadaIndice: Number.isInteger(alternativaIndice) ? alternativaIndice : -1,
        dataTentativaCliente: agora,
        ativo: true
      }
    };
  },

  async marcarListaConcluidaAluno(uid, dadosLista) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const listaKey = String(dadosLista.listaKey || "").trim();
    if (!listaKey) {
      throw new Error("Lista nao identificada.");
    }

    const agora = new Date().toISOString();
    await setDoc(doc(db, "alunos", uid, SUBCOLECOES_PROGRESSO.listas, listaKey), {
      uid,
      listaKey,
      disciplinaId: String(dadosLista.disciplinaId || "").trim(),
      assuntoId: String(dadosLista.assuntoId || "").trim(),
      subassuntoId: String(dadosLista.subassuntoId || "").trim(),
      banca: String(dadosLista.banca || "").trim(),
      totalQuestoes: formatarNumero(dadosLista.totalQuestoes || 0),
      concluidaEmCliente: agora,
      dataConclusaoCliente: agora,
      concluidaEm: serverTimestamp(),
      ativo: true
    }, { merge: true });

    const { resumo } = await atualizarResumoProgressoAluno(uid);
    return resumo;
  },

  async resetarListaQuestoesAluno(uid, listaKey) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const chave = String(listaKey || "").trim();
    if (!chave) {
      throw new Error("Lista nao identificada.");
    }

    const [registrosQuestoes, registrosListas] = await Promise.all([
      listarProgressoQuestoesAluno(uid),
      listarProgressoListasAluno(uid)
    ]);

    const agora = new Date().toISOString();

    for (const registro of registrosQuestoes.filter((item) => item.listaKey === chave && item.ativo !== false)) {
      await setDoc(doc(db, "alunos", uid, SUBCOLECOES_PROGRESSO.questoes, registro.id), {
        ativo: false,
        resetadoEmCliente: agora,
        resetadoEm: serverTimestamp()
      }, { merge: true });
    }

    for (const registro of registrosListas.filter((item) => item.listaKey === chave && item.ativo !== false)) {
      await setDoc(doc(db, "alunos", uid, SUBCOLECOES_PROGRESSO.listas, registro.id), {
        ativo: false,
        resetadoEmCliente: agora,
        resetadoEm: serverTimestamp()
      }, { merge: true });
    }

    const { resumo } = await atualizarResumoProgressoAluno(uid);
    return resumo;
  },

  async recarregarPerfilAtual() {
    const { auth } = garantirFirebase();
    if (!auth.currentUser) {
      return null;
    }

    const perfil = await buscarPerfilAluno(auth.currentUser.uid);
    perfilAtual = perfil ? normalizarPerfilAluno(auth.currentUser.uid, perfil) : null;
    return perfilAtual;
  },

  getPerfilAtual() {
    return perfilAtual;
  },

  async listarFlashcards(uid = "") {
    const { auth, db } = garantirFirebase();
    const uidAluno = String(uid || (auth.currentUser && auth.currentUser.uid) || "").trim();
    if (!auth.currentUser || !uidAluno || auth.currentUser.uid !== uidAluno) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const [globaisSnap, pessoaisSnap] = await Promise.all([
      getDocs(collection(db, COLECAO_FLASHCARDS)).catch(() => ({ docs: [] })),
      getDocs(collection(db, "alunos", uidAluno, SUBCOLECOES_PROGRESSO.flashcardsPessoais))
    ]);

    const globais = globaisSnap.docs
      .map((item) => normalizarFlashcard(item.id, { ...item.data(), origem: "global" }));
    const pessoais = pessoaisSnap.docs
      .map((item) => normalizarFlashcard(item.id, { ...item.data(), origem: "aluno", criadoPor: uidAluno }));

    return [...globais, ...pessoais]
      .filter((item) => item.id && item.ativo && item.pergunta && item.resposta)
      .sort((a, b) => a.materia.localeCompare(b.materia) || a.assunto.localeCompare(b.assunto) || a.pergunta.localeCompare(b.pergunta));
  },

  async criarFlashcardAluno(uid, dadosCard) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const pergunta = String(dadosCard && dadosCard.pergunta ? dadosCard.pergunta : "").trim();
    const resposta = String(dadosCard && dadosCard.resposta ? dadosCard.resposta : "").trim();
    const materia = String(dadosCard && dadosCard.materia ? dadosCard.materia : "").trim();
    const assunto = String(dadosCard && dadosCard.assunto ? dadosCard.assunto : "").trim();
    if (!pergunta || !resposta || !materia || !assunto) {
      throw new Error("Preencha pergunta, resposta, materia e assunto.");
    }

    const cardId = "flash-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    const agora = new Date().toISOString();
    const registro = {
      id: cardId,
      pergunta,
      resposta,
      materia,
      assunto,
      criadoPor: uid,
      origem: "aluno",
      ativo: true,
      criadoEmCliente: agora,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };

    await setDoc(doc(db, "alunos", uid, SUBCOLECOES_PROGRESSO.flashcardsPessoais, cardId), registro);
    return normalizarFlashcard(cardId, registro);
  },

  async listarProgressoFlashcardsAluno(uid) {
    const { auth } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    return listarProgressoFlashcardsAlunoBase(uid);
  },

  async salvarRespostaFlashcardAluno(uid, dadosResposta) {
    const { auth, db } = garantirFirebase();
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Sessao do aluno nao encontrada.");
    }

    const flashcardId = String(dadosResposta && dadosResposta.flashcardId ? dadosResposta.flashcardId : "").trim();
    const status = String(dadosResposta && dadosResposta.status ? dadosResposta.status : "").trim();
    if (!flashcardId || !["nao_lembrei", "mais_ou_menos", "lembrei"].includes(status)) {
      throw new Error("Resposta de flash card incompleta.");
    }

    const refProgresso = doc(db, "alunos", uid, SUBCOLECOES_PROGRESSO.flashcards, flashcardId);
    const snapAtual = await getDoc(refProgresso);
    const atual = snapAtual.exists() ? normalizarProgressoFlashcard(flashcardId, snapAtual.data()) : normalizarProgressoFlashcard(flashcardId, {});
    const agora = new Date().toISOString();
    const dominioAnterior = Number.isFinite(Number(atual.dominio)) ? Number(atual.dominio) : 0;
    const dominio = status === "lembrei"
      ? Math.min(5, dominioAnterior + 1)
      : status === "mais_ou_menos"
        ? Math.max(1, Math.min(4, dominioAnterior))
        : Math.max(0, dominioAnterior - 1);

    const registro = {
      userId: uid,
      uid,
      flashcardId,
      status,
      dominio,
      acertos: atual.acertos + (status === "lembrei" ? 1 : 0),
      erros: atual.erros + (status === "nao_lembrei" ? 1 : 0),
      parciais: atual.parciais + (status === "mais_ou_menos" ? 1 : 0),
      tentativas: atual.tentativas + 1,
      materia: String(dadosResposta.materia || "").trim(),
      assunto: String(dadosResposta.assunto || "").trim(),
      ultima_revisao: agora,
      ultimaRevisaoCliente: agora,
      ultimaRevisao: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    };

    await setDoc(refProgresso, registro, { merge: true });
    return normalizarProgressoFlashcard(flashcardId, registro);
  },

  async carregarTrilhaRelatividadeAluno(uid) {
    if (!estaConfigurado()) return null;
    const codigoUid = String(uid || "").trim();
    if (!codigoUid || codigoUid === "anonimo") return null;
    try {
      const { db } = garantirFirebase();
      const ref = doc(db, "alunos", codigoUid, "trilhas", "relatividade-especial");
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return snap.data() || null;
    } catch (erro) {
      console.warn("Falha ao carregar trilha de Relatividade Especial.", erro);
      return null;
    }
  },

  async salvarTrilhaRelatividadeAluno(uid, dadosTrilha) {
    if (!estaConfigurado()) return false;
    const codigoUid = String(uid || "").trim();
    if (!codigoUid || codigoUid === "anonimo") return false;
    try {
      const { db } = garantirFirebase();
      const ref = doc(db, "alunos", codigoUid, "trilhas", "relatividade-especial");
      const payload = Object.assign({}, dadosTrilha || {}, {
        atualizadoEm: serverTimestamp()
      });
      await setDoc(ref, payload, { merge: true });
      return true;
    } catch (erro) {
      console.warn("Falha ao salvar trilha de Relatividade Especial.", erro);
      return false;
    }
  },

  escutarMudancasCardsAulasApostilas(callback) {
    if (!estaConfigurado() || typeof callback !== "function") return () => {};
    try {
      const { db } = garantirFirebase();
      const referencia = collection(db, COLECOES_QUESTOES.cards);
      const cancelar = onSnapshot(referencia, (snap) => {
        const cards = snap.docs
          .map((item) => normalizarCardQuestoes({ id: item.id, ...item.data() }))
          .filter((item) => item.ativo !== false);
        try {
          callback(cards);
        } catch (erro) {
          console.warn("Falha ao processar atualizacao em tempo real dos cards.", erro);
        }
      }, (erro) => {
        console.warn("Listener de cards encerrado.", erro);
      });
      return cancelar;
    } catch (erro) {
      console.warn("Nao foi possivel iniciar listener de cards.", erro);
      return () => {};
    }
  },

  escutarMudancasSubassuntos(callback) {
    if (!estaConfigurado() || typeof callback !== "function") return () => {};
    try {
      const { db } = garantirFirebase();
      const referencia = collection(db, COLECOES_QUESTOES.subassuntos);
      const cancelar = onSnapshot(referencia, (snap) => {
        const subassuntos = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
        try {
          callback(subassuntos);
        } catch (erro) {
          console.warn("Falha ao processar atualizacao em tempo real dos subassuntos.", erro);
        }
      }, (erro) => {
        console.warn("Listener de subassuntos encerrado.", erro);
      });
      return cancelar;
    } catch (erro) {
      console.warn("Nao foi possivel iniciar listener de subassuntos.", erro);
      return () => {};
    }
  },

  escutarMudancasQuestoes(callback) {
    if (!estaConfigurado() || typeof callback !== "function") return () => {};
    try {
      const { db } = garantirFirebase();
      const referencia = collection(db, COLECOES_QUESTOES.questoes);
      const cancelar = onSnapshot(referencia, () => {
        try {
          callback();
        } catch (erro) {
          console.warn("Falha ao processar atualizacao em tempo real das questoes.", erro);
        }
      }, (erro) => {
        console.warn("Listener de questoes encerrado.", erro);
      });
      return cancelar;
    } catch (erro) {
      console.warn("Nao foi possivel iniciar listener de questoes.", erro);
      return () => {};
    }
  },

  escutarMudancasProvas(callback) {
    if (!estaConfigurado() || typeof callback !== "function") return () => {};
    try {
      const { db } = garantirFirebase();
      const referencia = collection(db, COLECAO_EXAMS);
      const cancelar = onSnapshot(referencia, () => {
        try {
          callback();
        } catch (erro) {
          console.warn("Falha ao processar atualizacao em tempo real das provas.", erro);
        }
      }, (erro) => {
        console.warn("Listener de provas encerrado.", erro);
      });
      return cancelar;
    } catch (erro) {
      console.warn("Nao foi possivel iniciar listener de provas.", erro);
      return () => {};
    }
  },

  onAlunoAutenticado(callback) {
    if (!estaConfigurado()) {
      if (typeof callback === "function") callback(null, { erro: true });
      return () => {};
    }
    const { auth } = garantirFirebase();
    return onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          encerrarMonitorSessaoAluno();
          perfilAtual = null;
          callback(null);
          return;
        }
        const perfil = await buscarPerfilAluno(user.uid);
        perfilAtual = perfil ? normalizarPerfilAluno(user.uid, perfil) : null;

        if (!perfilAtual) {
          callback(null);
          return;
        }

        if (sessaoAlunoEmAtualizacao) {
          callback(perfilAtual);
          return;
        }

        const sessionLocal = obterSessionIdLocalAluno();
        const sessionRemota = String(perfilAtual.sessionIdAtivo || "").trim();
        if (!sessionLocal || !sessionRemota || sessionLocal !== sessionRemota) {
          registrarAvisoSessaoDuplicada();
          encerrarMonitorSessaoAluno();
          perfilAtual = null;
          limparSessionIdLocalAluno();
          await signOut(auth);
          callback(null);
          return;
        }

        iniciarMonitorSessaoAluno(user.uid);
        callback(perfilAtual);
      } catch (erro) {
        console.error("Falha ao confirmar sessao do aluno:", erro);
        encerrarMonitorSessaoAluno();
        perfilAtual = null;
        callback(null, { erro: true });
      }
    });
  },

  onAdminAutenticado(callback) {
    if (!estaConfigurado()) return;
    const { auth } = garantirFirebase();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        callback(null);
        return;
      }

      const adminPermitido = await verificarAdmin(user.uid);
      if (!adminPermitido) {
        callback(null);
        return;
      }
      callback({
        uid: user.uid,
        email: user.email || ""
      });
    });
  },

  consumirAvisoSessaoDuplicada() {
    return consumirAvisoSessaoDuplicada();
  },

  async uploadImagemQuestao(arquivo) {
    const { auth, storage } = garantirFirebase();
    if (!auth.currentUser) throw new Error("Faça login como administrador antes de enviar imagens.");
    const ext = String(arquivo.name || "imagem.jpg").split(".").pop().toLowerCase() || "jpg";
    const caminho = "questoes-imagens/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    const ref = storageRef(storage, caminho);
    const contentType = arquivo.type || ("image/" + ext);
    await uploadBytes(ref, arquivo, { contentType });
    return await getDownloadURL(ref);
  }
};

window.firebaseHelpers = {
  emailDaMatricula,
  normalizarMatricula
};

window.dispatchEvent(new Event("auth-service-ready"));
