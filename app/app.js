const ESTADO_ALUNO = {
  perfil: null
};

const ESTADO_QUIZ = {
  filtrosPendentes: null
};

let BANCO_DINAMICO_CARREGADO = false;
let QUESTOES_INICIALIZADAS = false;
let QUESTOES_INICIALIZANDO = null;
let TOPICS_FISICA_RENDERIZADOS = false;
let DETALHE_FISICA_ASSINATURA = "";
let HANDLERS_QUESTOES_ATUAIS = null;
let RECARREGANDO_BANCO_QUESTOES = null;
let LISTENERS_TEMPO_REAL_ATIVOS = false;

const PERFORMANCE_SUAVE =
  (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
  (typeof navigator !== "undefined" && Number(navigator.hardwareConcurrency || 0) > 0 && Number(navigator.hardwareConcurrency || 0) <= 4);

const DURACAO_TRANSICAO_SECAO = PERFORMANCE_SUAVE ? 170 : 280;
const DURACAO_TRANSICAO_PAINEL = PERFORMANCE_SUAVE ? 240 : 420;
const AUTH_BOOT_TIMEOUT_MS = PERFORMANCE_SUAVE ? 8500 : 6500;

const MOBILE_GPU_SAFE =
  typeof window !== "undefined" &&
  (
    (window.matchMedia && (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 1180px)").matches
    )) ||
    (typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ""))
  );

function aplicarModoGpuSeguroMobile() {
  if (!MOBILE_GPU_SAFE || typeof document === "undefined") return;
  document.documentElement.classList.add("mobile-gpu-safe");
  if (document.body) document.body.classList.add("mobile-gpu-safe");
}

aplicarModoGpuSeguroMobile();

if (typeof document !== "undefined" && document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aplicarModoGpuSeguroMobile, { once: true });
}

const STORAGE_TEMA_KEY = "theme";
const STORAGE_SECAO_ALUNO_KEY = "universo_relativo_secao_aluno";
const STORAGE_PROVA_ALUNO_KEY = "universo_relativo_prova_aluno";

function salvarSecaoAluno(secao) {
  try {
    if (secao) localStorage.setItem(STORAGE_SECAO_ALUNO_KEY, String(secao));
  } catch (_) {}
}

function obterSecaoAlunoSalva() {
  try {
    const secao = localStorage.getItem(STORAGE_SECAO_ALUNO_KEY);
    return secao && document.getElementById("secao-" + secao) ? secao : "inicio";
  } catch (_) {
    return "inicio";
  }
}

function salvarProvaAluno(ano) {
  try {
    if (ano) localStorage.setItem(STORAGE_PROVA_ALUNO_KEY, String(ano));
    else localStorage.removeItem(STORAGE_PROVA_ALUNO_KEY);
  } catch (_) {}
}

function obterProvaAlunoSalva() {
  try {
    return String(localStorage.getItem(STORAGE_PROVA_ALUNO_KEY) || "").trim();
  } catch (_) {
    return "";
  }
}

function obterTemaSalvo() {
  try {
    const tema = localStorage.getItem(STORAGE_TEMA_KEY);
    return tema === "light" || tema === "dark" ? tema : "dark";
  } catch (_) {
    return "dark";
  }
}

function atualizarControleTema(tema) {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  const claro = tema === "light";
  toggle.setAttribute("aria-pressed", claro ? "true" : "false");
  toggle.setAttribute("aria-label", claro ? "Alternar para modo escuro" : "Alternar para modo claro");
  const label = toggle.querySelector(".theme-toggle-label");
  if (label) label.textContent = claro ? "Modo claro" : "Modo escuro";
}

function aplicarTema(tema, salvar = true) {
  const proximoTema = tema === "light" ? "light" : "dark";
  document.body.classList.remove("dark", "light");
  document.body.classList.add(proximoTema);
  atualizarControleTema(proximoTema);
  if (salvar) {
    try {
      localStorage.setItem(STORAGE_TEMA_KEY, proximoTema);
    } catch (_) {}
  }
}

aplicarTema(obterTemaSalvo(), false);

const FISICA_UI_CONFIG = [
  {
    id: "cinematica",
    titulo: "Cinemática",
    descricao: "Trilha visual para estudar deslocamento, gráficos, lançamentos e leitura do movimento em etapas curtas.",
    destaque: "7 blocos montados",
    iconClass: "illustration-cinematica",
    iconChip: "Movimento",
    iconTitle: "Deslocamento e velocidade",
    temaNumero: "Tema 01",
    lead: "Uma trilha organizada para conduzir o aluno da leitura inicial do movimento até lançamentos em duas dimensões.",
    topicos: [
      { id: "introducao-a-cinematica", titulo: "Introdução à Cinemática" },
      { id: "movimento-retilineo-constante", titulo: "Movimento retilíneo uniforme" },
      { id: "aceleracao-em-linha-reta", titulo: "Movimento retilíneo uniformemente variado" },
      { id: "vetores-do-movimento", titulo: "Vetores do movimento" },
      { id: "trajetorias-circulares-e-polias", titulo: "Movimento circular e polias" },
      { id: "quedas-e-subidas-verticais", titulo: "Movimentos verticais" },
      { id: "lancamentos-em-duas-dimensoes", titulo: "Lançamento horizontal e oblíquo" }
    ]
  },
  {
    id: "dinamica",
    titulo: "Dinâmica",
    descricao: "Estrutura pronta para forças, blocos, atrito, trabalho, energia e quantidade de movimento.",
    destaque: "7 blocos montados",
    iconClass: "illustration-dinamica",
    iconChip: "Forças",
    iconTitle: "Interações e energia",
    temaNumero: "Tema 02",
    lead: "Uma trilha desenhada para levar o aluno das leis de Newton até conservação de energia e impulso.",
    topicos: [
      { id: "bases-das-leis-de-newton", titulo: "Princípios de Newton" },
      { id: "molas-e-forca-restauradora", titulo: "Força elástica" },
      { id: "arranjos-de-blocos", titulo: "Sistemas de blocos" },
      { id: "atrito-em-superficies", titulo: "Força de atrito" },
      { id: "dinamica-da-forca-centripeta", titulo: "Força centrípeta" },
      { id: "trabalho-e-energia-em-acao", titulo: "Trabalho e energia mecânica" },
      { id: "impulso-e-quantidade-de-movimento", titulo: "Impulso e quantidade de movimento" }
    ]
  },
  {
    id: "gravitacao",
    titulo: "Gravitação",
    descricao: "Área preparada para órbitas, leis de Kepler e gravitação universal com sequência bem clara.",
    destaque: "2 blocos montados",
    iconClass: "illustration-gravitacao",
    iconChip: "Órbitas",
    iconTitle: "Campos e atração",
    temaNumero: "Tema 03",
    lead: "Um percurso curto e direto para conectar movimento celeste, leis orbitais e campo gravitacional.",
    topicos: [
      { id: "orbita-e-leis-de-kepler", titulo: "Leis de Kepler" },
      { id: "campo-da-gravitacao-universal", titulo: "Gravitação universal" }
    ]
  },
  {
    id: "estatica",
    titulo: "Estática",
    descricao: "Sequência montada para equilíbrio de ponto material e corpo extenso, com visual já preparado.",
    destaque: "2 blocos montados",
    iconClass: "illustration-estatica",
    iconChip: "Equilíbrio",
    iconTitle: "Forças balanceadas",
    temaNumero: "Tema 04",
    lead: "Uma trilha pronta para o aluno entender condições de equilíbrio com clareza visual e progressão natural.",
    topicos: [
      { id: "equilibrio-do-ponto-material", titulo: "Equilíbrio do ponto material" },
      { id: "equilibrio-do-corpo-extenso", titulo: "Equilíbrio do corpo extenso" }
    ]
  },
  {
    id: "hidrostatica",
    titulo: "Hidrostática",
    descricao: "Cards prontos para pressão, empuxo e princípios clássicos dos fluidos em repouso.",
    destaque: "3 blocos montados",
    iconClass: "illustration-hidrostatica",
    iconChip: "Fluidos",
    iconTitle: "Pressão e empuxo",
    temaNumero: "Tema 05",
    lead: "Trilha organizada para o aluno construir a base de fluidos em repouso antes das listas reais.",
    topicos: [
      { id: "densidade-e-pressao-nos-fluidos", titulo: "Densidade e pressão nos fluidos" },
      { id: "pascal-e-prensas-hidraulicas", titulo: "Pascal e prensas hidráulicas" },
      { id: "empuxo-e-principio-de-arquimedes", titulo: "Empuxo e princípio de Arquimedes" }
    ]
  },
  {
    id: "hidrodinamica",
    titulo: "Hidrodinâmica",
    descricao: "Estrutura visual pronta para escoamento, vazão e leitura da dinâmica dos fluidos.",
    destaque: "1 bloco montado",
    iconClass: "illustration-hidrodinamica",
    iconChip: "Escoamento",
    iconTitle: "Fluxo e continuidade",
    temaNumero: "Tema 06",
    lead: "Uma trilha enxuta para apresentar continuidade, vazão e fundamentos do escoamento com a cara da plataforma.",
    topicos: [
      { id: "fundamentos-de-hidrodinamica", titulo: "Fundamentos de hidrodinâmica" }
    ]
  },
  {
    id: "termologia",
    titulo: "Termologia",
    descricao: "Toda a frente de calor já organizada com blocos de temperatura, gases e termodinâmica.",
    destaque: "7 blocos montados",
    iconClass: "illustration-termologia",
    iconChip: "Calor",
    iconTitle: "Temperatura e energia térmica",
    temaNumero: "Tema 07",
    lead: "Uma trilha pronta para guiar o aluno da linguagem básica do calor até os princípios da termodinâmica.",
    topicos: [
      { id: "fundamentos-de-termologia", titulo: "Fundamentos de Termologia" },
      { id: "medidas-e-escalas-termicas", titulo: "Escalas térmicas" },
      { id: "dilatacao-em-solidos-e-fluidos", titulo: "Dilatação térmica" },
      { id: "misturas-e-calorimetria", titulo: "Calorimetria" },
      { id: "caminhos-da-propagacao-do-calor", titulo: "Propagação de calor" },
      { id: "comportamento-termico-dos-gases", titulo: "Estudo dos gases" },
      { id: "principios-da-termodinamica", titulo: "Termodinâmica" }
    ]
  },
  {
    id: "ondulatoria",
    titulo: "Ondulatória",
    descricao: "Área preparada com ondas, som, ressonância e movimento harmônico simples.",
    destaque: "6 blocos montados",
    iconClass: "illustration-ondulatoria",
    iconChip: "Ondas",
    iconTitle: "Som e oscilações",
    temaNumero: "Tema 08",
    lead: "Uma trilha pensada para sair dos conceitos iniciais de onda e chegar ao movimento harmônico com clareza.",
    topicos: [
      { id: "ideias-iniciais-de-ondulatoria", titulo: "Conceitos iniciais de ondulatória" },
      { id: "fenomenos-das-ondas", titulo: "Fenômenos ondulatórios" },
      { id: "natureza-e-propriedades-do-som", titulo: "Propriedades do som" },
      { id: "efeitos-sonoros-no-dia-a-dia", titulo: "Fenômenos sonoros" },
      { id: "ressonancia-em-cordas-e-tubos", titulo: "Cordas e tubos sonoros" },
      { id: "oscilacao-e-movimento-harmonico", titulo: "Movimento harmônico simples" }
    ]
  },
  {
    id: "optica",
    titulo: "Óptica",
    descricao: "Trilha visual montada para reflexão, refração, espelhos e lentes com identidade própria.",
    destaque: "5 blocos montados",
    iconClass: "illustration-optica",
    iconChip: "Luz",
    iconTitle: "Espelhos, lentes e visão",
    temaNumero: "Tema 09",
    lead: "Um percurso visual para o aluno avançar da óptica geométrica até lentes e visão humana.",
    topicos: [
      { id: "principios-da-optica-geometrica", titulo: "Conceitos fundamentais de óptica" },
      { id: "reflexao-em-espelhos-planos", titulo: "Espelhos planos" },
      { id: "espelhos-esfericos-na-pratica", titulo: "Espelhos esféricos" },
      { id: "desvio-da-luz-e-refracao", titulo: "Refração da luz" },
      { id: "lentes-imagens-e-visao", titulo: "Lentes e visão humana" }
    ]
  },
  {
    id: "eletrostatica",
    titulo: "Eletrostática",
    descricao: "Toda a parte de cargas elétricas já montada para organização futura de aulas e listas.",
    destaque: "6 blocos montados",
    iconClass: "illustration-eletrostatica",
    iconChip: "Cargas",
    iconTitle: "Campo e potencial",
    temaNumero: "Tema 10",
    lead: "Uma trilha completa para eletrização, campo elétrico, potencial e capacitores já preparada visualmente.",
    topicos: [
      { id: "modos-de-eletrizacao", titulo: "Processos de eletrização" },
      { id: "interacao-e-lei-de-coulomb", titulo: "Lei de Coulomb" },
      { id: "linhas-e-intensidade-do-campo-eletrico", titulo: "Campo elétrico" },
      { id: "energia-e-potencial-eletrico", titulo: "Potencial elétrico" },
      { id: "condutores-em-equilibrio-eletrico", titulo: "Condutores eletrizados" },
      { id: "capacitancia-e-capacitores", titulo: "Capacitores" }
    ]
  },
  {
    id: "eletrodinamica",
    titulo: "Eletrodinâmica",
    descricao: "Estrutura pronta para corrente, resistores, potência e circuitos com organização profissional.",
    destaque: "7 blocos montados",
    iconClass: "illustration-eletrodinamica",
    iconChip: "Circuitos",
    iconTitle: "Corrente e resistores",
    temaNumero: "Tema 11",
    lead: "Uma trilha desenhada para organizar corrente elétrica, potência, medições e circuitos aplicados.",
    topicos: [
      { id: "corrente-e-movimento-de-cargas", titulo: "Corrente elétrica" },
      { id: "relacoes-das-leis-de-ohm", titulo: "Leis de Ohm" },
      { id: "consumo-potencia-e-energia", titulo: "Potência e energia elétrica" },
      { id: "arranjos-de-resistores", titulo: "Associação de resistores" },
      { id: "medicao-eletrica-na-pratica", titulo: "Instrumentos de medida" },
      { id: "fontes-e-geradores-eletricos", titulo: "Geradores elétricos" },
      { id: "circuitos-eletricos-aplicados", titulo: "Circuitos elétricos" }
    ]
  },
  {
    id: "eletromagnetismo",
    titulo: "Eletromagnetismo",
    descricao: "Blocos preparados para campo magnético, força magnética e indução, com desenho temático próprio.",
    destaque: "4 blocos montados",
    iconClass: "illustration-eletromagnetismo",
    iconChip: "Magnetismo",
    iconTitle: "Campo e indução",
    temaNumero: "Tema 12",
    lead: "Uma trilha visual pronta para integrar campo magnético, forças e indução eletromagnética sem improviso.",
    topicos: [
      { id: "ideias-centrais-do-eletromagnetismo", titulo: "Fundamentos de eletromagnetismo" },
      { id: "origens-do-campo-magnetico", titulo: "Fontes de campo magnético" },
      { id: "interacao-e-forca-magnetica", titulo: "Força magnética" },
      { id: "variacao-de-fluxo-e-inducao", titulo: "Indução eletromagnética" }
    ]
  }
];

let fisicaAssuntoAtual = "cinematica";

function animarEntradaSuave(elemento, seletorItens) {
  if (!elemento) return;

  if (PERFORMANCE_SUAVE) {
    elemento.classList.remove("section-stage-enter");
    if (seletorItens) {
      elemento.querySelectorAll(seletorItens).forEach((item, indice) => {
        item.style.setProperty("--stagger-index", String(Math.min(indice, 6)));
        item.classList.remove("stagger-enter");
      });
    }
    return;
  }

  elemento.classList.remove("section-stage-enter");
  requestAnimationFrame(() => {
    elemento.classList.add("section-stage-enter");
  });

  if (seletorItens) {
    elemento.querySelectorAll(seletorItens).forEach((item, indice) => {
      item.style.setProperty("--stagger-index", String(indice));
      item.classList.remove("stagger-enter");
      if (indice < 8) {
        requestAnimationFrame(() => {
          item.classList.add("stagger-enter");
        });
        setTimeout(() => item.classList.remove("stagger-enter"), DURACAO_TRANSICAO_PAINEL + (indice * 12));
      }
    });
  }

  setTimeout(() => elemento.classList.remove("section-stage-enter"), DURACAO_TRANSICAO_PAINEL);
}

function transicionarPainel(atual, proximo, opcoes = {}) {
  if (!proximo) return;

  const {
    antesDeEntrar = null,
    depoisDeEntrar = null,
    seletorItens = null,
    duracao = DURACAO_TRANSICAO_SECAO
  } = opcoes;

  if (atual === proximo) {
    if (typeof antesDeEntrar === "function") antesDeEntrar();
    animarEntradaSuave(proximo, seletorItens);
    if (typeof depoisDeEntrar === "function") {
      setTimeout(() => depoisDeEntrar(), 20);
    }
    return;
  }

  const concluirEntrada = () => {
    if (typeof antesDeEntrar === "function") antesDeEntrar();
    proximo.classList.add("active");
    animarEntradaSuave(proximo, seletorItens);
    if (typeof depoisDeEntrar === "function") {
      setTimeout(() => depoisDeEntrar(), 20);
    }
  };

  if (atual) {
    atual.classList.add("leaving");
    setTimeout(() => {
      atual.classList.remove("active", "leaving");
      concluirEntrada();
    }, duracao);
    return;
  }

  concluirEntrada();
}

function slugifyCliente(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function progressoQuestaoDocIdLocal(listaKey, questaoId) {
  return [String(listaKey || "").trim(), String(questaoId || "").trim()]
    .filter(Boolean)
    .join("__")
    .replace(/\//g, "-");
}

function garantirEstruturaBanco(banco, disciplinaId, disciplinaLabel, assuntoId, assuntoLabel, subassuntoId, subassuntoLabel) {
  if (!banco.disciplinas) {
    banco.disciplinas = {};
  }

  if (!banco.disciplinas[disciplinaId]) {
    banco.disciplinas[disciplinaId] = {
      label: disciplinaLabel || disciplinaId,
      assuntos: {}
    };
  }

  if (!banco.disciplinas[disciplinaId].assuntos) {
    banco.disciplinas[disciplinaId].assuntos = {};
  }

  if (!banco.disciplinas[disciplinaId].assuntos[assuntoId]) {
    banco.disciplinas[disciplinaId].assuntos[assuntoId] = {
      label: assuntoLabel || assuntoId,
      questoes: [],
      subassuntos: {}
    };
  }

  const assunto = banco.disciplinas[disciplinaId].assuntos[assuntoId];
  if (!assunto.subassuntos) {
    assunto.subassuntos = {};
  }

  if (subassuntoId && !assunto.subassuntos[subassuntoId]) {
    assunto.subassuntos[subassuntoId] = {
      label: subassuntoLabel || subassuntoId,
      questoes: []
    };
  }
}

function criarCardsPadraoFisica(assuntoId, topico) {
  const subassuntoId = topico.id;
  const titulo = topico.titulo || subassuntoId;
  return [
    {
      id: ["fisica-basica", assuntoId, subassuntoId, "aula-1"].join("-"),
      titulo: "Aula 1: " + titulo,
      descricao: "Primeira aula do bloco de " + titulo.toLowerCase() + ".",
      tag: "Aula 1",
      tipo: "aula",
      botaoLabel: "Em breve",
      botaoDesabilitado: true,
      ordemExibicao: 1
    },
    {
      id: ["fisica-basica", assuntoId, subassuntoId, "aula-2"].join("-"),
      titulo: "Aula 2: " + titulo,
      descricao: "Segunda aula do bloco de " + titulo.toLowerCase() + ".",
      tag: "Aula 2",
      tipo: "aula",
      botaoLabel: "Em breve",
      botaoDesabilitado: true,
      ordemExibicao: 2
    },
    {
      id: ["fisica-basica", assuntoId, subassuntoId, "apostila"].join("-"),
      titulo: "Apostila: " + titulo,
      descricao: "Material de apoio para acompanhar o bloco.",
      tag: "Apostila",
      tipo: "apostila",
      botaoLabel: "Abrir apostila",
      botaoDesabilitado: false,
      ordemExibicao: 3
    },
    {
      id: ["fisica-basica", assuntoId, subassuntoId, "questoes"].join("-"),
      titulo: "Exercícios: " + titulo,
      descricao: "Lista de questões para praticar este conteúdo.",
      tag: "Questões",
      tipo: "questoes",
      botaoLabel: "Resolver questões",
      botaoDesabilitado: false,
      ordemExibicao: 4
    }
  ].map((card) => ({
    ...card,
    disciplinaId: "fisica-basica",
    disciplinaLabel: "Física Básica",
    assuntoId,
    subassuntoId,
    subassuntoLabel: titulo,
    ativo: true,
    origem: "fallback-local"
  }));
}

function mesclarCardsFisica(cardsAtuais, cardsNovos) {
  return deduplicarCardsFisica([...(cardsAtuais || []), ...(cardsNovos || [])])
    .sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0));
}

function garantirCardsPadraoFisicaBanco(banco) {
  FISICA_UI_CONFIG.forEach((assuntoConfig) => {
    (assuntoConfig.topicos || []).forEach((topico) => {
      garantirEstruturaBanco(
        banco,
        "fisica-basica",
        "Física Básica",
        assuntoConfig.id,
        assuntoConfig.titulo,
        topico.id,
        topico.titulo
      );
      const subassunto = banco.disciplinas["fisica-basica"].assuntos[assuntoConfig.id].subassuntos[topico.id];
      subassunto.cards = mesclarCardsFisica(subassunto.cards || [], criarCardsPadraoFisica(assuntoConfig.id, topico));
    });
  });
}

function htmlEscape(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LUCIDE_ICONES_POR_TIPO = {
  check: "check",
  "book-open": "book-open",
  "file-text": "file-text",
  history: "history",
  clock: "clock",
  dashboard: "home",
  inicio: "home",
  "fisica-basica": "atom",
  "fisica basica": "atom",
  "relatividade-geral": "orbit",
  "relatividade classica": "orbit",
  "relatividade especial": "orbit",
  "banco-de-questoes": "clipboard-list",
  "banco de questoes": "clipboard-list",
  questoes: "clipboard-list",
  questao: "clipboard-list",
  "questao-certa": "square-check",
  "questao certa": "square-check",
  apostilas: "file-text",
  apostila: "file-text",
  aula: "panel-top",
  cinematica: "car",
  dinamica: "rocket",
  termologia: "thermometer",
  optica: "triangle",
  "optica-e-ondas": "triangle",
  "optica e ondas": "triangle",
  ondulatoria: "activity",
  eletrostatica: "circle-dot",
  eletrodinamica: "cpu",
  magnetismo: "magnet",
  eletromagnetismo: "magnet",
  gravitacao: "orbit",
  hidrostatica: "droplet",
  hidrodinamica: "waves",
  estatica: "scale",
  "movimento-circular": "refresh-cw",
  "movimento circular": "refresh-cw",
  "mru-mruv": "move-right",
  "mru/mruv": "move-right",
  vetores: "navigation",
  lancamentos: "send",
  "trabalho-e-energia": "battery-charging",
  "trabalho e energia": "battery-charging",
  "quantidade-de-movimento": "fast-forward",
  "quantidade de movimento": "fast-forward",
  impulso: "arrow-big-right-dash",
  "questoes-respondidas": "clipboard-check",
  "questoes respondidas": "clipboard-check",
  "taxa-de-acertos": "badge-check",
  "taxa de acertos": "badge-check",
  "tempo-de-estudo": "timer",
  "tempo de estudo": "timer",
  "aulas-concluidas": "graduation-cap",
  "aulas concluidas": "graduation-cap",
  "atividade-recente": "history",
  "atividade recente": "history",
  treinar: "dumbbell",
  progresso: "chart-no-axes-column-increasing",
  trilhas: "route"
};

function chaveIconeLucide(valor) {
  return slugifyCliente(valor).replace(/-/g, " ");
}

function obterIconeLucide(tipo) {
  const texto = String(tipo || "").trim();
  const slug = slugifyCliente(texto);
  const chave = chaveIconeLucide(texto);
  return LUCIDE_ICONES_POR_TIPO[texto] || LUCIDE_ICONES_POR_TIPO[slug] || LUCIDE_ICONES_POR_TIPO[chave] || "book-open";
}

function renderizarIconeLucide(tipo, classeExtra) {
  const classes = ["icon", classeExtra].filter(Boolean).join(" ");
  return '<i data-lucide="' + htmlEscape(obterIconeLucide(tipo)) + '" class="' + htmlEscape(classes) + '" aria-hidden="true"></i>';
}

function atualizarIconesLucide(contexto) {
  if (!window.lucide || typeof window.lucide.createIcons !== "function") return;
  try {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 2
      }
    });
  } catch (erro) {
    console.warn("Nao foi possivel renderizar os icones agora:", erro);
  }
}

function textoParaHtmlCliente(texto) {
  const valor = String(texto || "").trim();
  if (!valor) return "";

  return valor
    .split(/\n{2,}/)
    .map((bloco) => "<p>" + htmlEscape(bloco.trim()).replace(/\n/g, "<br>") + "</p>")
    .join("");
}

const IMAGENS_FALLBACK_QUESTOES = {
  FBM003: {
    src: "imagens/questoes/fbm003-nado-borboleta.jpg",
    alt: "Nadador executando nado borboleta em piscina de 50 metros",
    legenda: "Nado borboleta em piscina de 50 m. Fonte: Wikimedia Commons, CC0."
  }
};

function obterImagemFallbackQuestao(id) {
  return IMAGENS_FALLBACK_QUESTOES[String(id || "").trim()] || null;
}

function normalizarUrlImagemQuestao(url) {
  const valor = String(url || "").trim();
  if (!valor) return "";
  try {
    const parsed = new URL(valor, window.location.href);
    if (parsed.hostname.toLowerCase().includes("drive.google.com")) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/i);
      const id = fileMatch && fileMatch[1] ? fileMatch[1] : parsed.searchParams.get("id");
      if (id) return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w1000";
    }
    return parsed.href;
  } catch (_) {
    return valor;
  }
}

function normalizarImagemQuestao(item) {
  const imagem = item && item.imagem ? item.imagem : null;
  const src = normalizarUrlImagemQuestao(imagem && imagem.src ? imagem.src : item && (item.imagemUrl || item.imageUrl || item.urlImagem));
  if (!src) return null;
  return {
    src,
    alt: String((imagem && imagem.alt) || "Imagem da questão"),
    legenda: String((imagem && imagem.legenda) || "")
  };
}

function normalizarQuestaoGerenciada(item) {
  const alternativas = Array.isArray(item.alternativas) ? item.alternativas : [];
  const id = item.id || ("Q" + Math.random().toString(36).slice(2, 8));
  return {
    id,
    origem: item.origemTexto || item.cardTitulo || "Questoes cadastradas no painel",
    banca: item.banca || "Vestibulares",
    enunciado: textoParaHtmlCliente(item.enunciado || ""),
    alternativas: ["a", "b", "c", "d", "e"].map((letra, indice) => {
      const texto = alternativas[indice] ? String(alternativas[indice]).trim() : "";
      return letra + ") " + texto;
    }),
    correta: Number.isInteger(item.correta) ? item.correta : ["A", "B", "C", "D", "E"].indexOf(String(item.respostaCorreta || "").toUpperCase()),
    resolucaoEscrita: item.resolucaoTexto ? textoParaHtmlCliente(item.resolucaoTexto) : "",
    videoUrl: item.videoUrl || "",
    videoEmbedUrl: item.videoEmbedUrl || "",
    imagem: normalizarImagemQuestao(item) || obterImagemFallbackQuestao(id),
    ordemExibicao: Number(item.ordemExibicao || 0),
    cardId: item.cardId || ""
  };
}

function vincularBotoesQuizDirecionados(contexto, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn) {
  (contexto || document).querySelectorAll("[data-quiz-disciplina][data-quiz-assunto]").forEach((botao) => {
    if (botao.dataset.quizBound === "true") return;
    botao.addEventListener("click", async () => {
      abrirBancoQuestoesComFiltros({
        disciplina: botao.dataset.quizDisciplina || "",
        assunto: botao.dataset.quizAssunto || "",
        subassunto: botao.dataset.quizSubassunto || "",
        autoStart: true
      });
      setTimeout(() => {
        Promise.resolve(aplicarFiltrosPendentes()).then(async (autoStart) => {
          if (autoStart && await iniciarQuizSelecionado()) {
            container.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          startBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }, 120);
    });
    botao.dataset.quizBound = "true";
  });
}

function obterUrlVideoCard(item) {
  return String(item && (item.videoEmbedUrl || item.videoUrl) ? (item.videoEmbedUrl || item.videoUrl) : "").trim();
}

function cardAulaDisponivel(item) {
  return String((item && item.tipo) || "").trim() === "aula" && !!obterUrlVideoCard(item);
}

  const APOSTILAS_LOCAIS_CINEMATICA = {
    "introducao-a-cinematica": {
      url: "apostilas/bloco1-introducao-cinematica.pdf?v=2",
      nome: "bloco1-introducao-cinematica.pdf"
    },
    "movimento-retilineo-constante": {
      url: "apostilas/bloco2-mru.pdf?v=2",
      nome: "bloco2-mru.pdf"
    },
    "aceleracao-em-linha-reta": {
      url: "apostilas/bloco3-mruv.pdf?v=2",
      nome: "bloco3-mruv.pdf"
    },
    "vetores-do-movimento": {
      url: "apostilas/bloco4-vetores-do-movimento.pdf?v=2",
      nome: "bloco4-vetores-do-movimento.pdf"
    },
    "trajetorias-circulares-e-polias": {
      url: "apostilas/bloco5-movimento-circular-e-polias.pdf?v=2",
      nome: "bloco5-movimento-circular-e-polias.pdf"
    },
    "quedas-e-subidas-verticais": {
      url: "apostilas/bloco6-movimentos-verticais.pdf?v=2",
      nome: "bloco6-movimentos-verticais.pdf"
    },
    "lancamentos-em-duas-dimensoes": {
      url: "apostilas/bloco7-lancamento-horizontal-e-obliquo.pdf?v=2",
      nome: "bloco7-lancamento-horizontal-e-obliquo.pdf"
    }
  };

  const APOSTILAS_LOCAIS_TERMOLOGIA = {
    "fundamentos-de-termologia": {
      url: "apostilas/termologia1-fundamentos-de-termologia.pdf?v=2",
      nome: "termologia1-fundamentos-de-termologia.pdf"
    },
    "medidas-e-escalas-termicas": {
      url: "apostilas/termologia2-escalas-termicas.pdf?v=2",
      nome: "termologia2-escalas-termicas.pdf"
    },
    "dilatacao-em-solidos-e-fluidos": {
      url: "apostilas/termologia3-dilatacao-termica.pdf?v=2",
      nome: "termologia3-dilatacao-termica.pdf"
    },
    "misturas-e-calorimetria": {
      url: "apostilas/termologia4-calorimetria.pdf?v=2",
      nome: "termologia4-calorimetria.pdf"
    },
    "caminhos-da-propagacao-do-calor": {
      url: "apostilas/termologia5-propagacao-de-calor.pdf?v=2",
      nome: "termologia5-propagacao-de-calor.pdf"
    },
    "comportamento-termico-dos-gases": {
      url: "apostilas/termologia6-estudo-dos-gases.pdf?v=2",
      nome: "termologia6-estudo-dos-gases.pdf"
    },
    "principios-da-termodinamica": {
      url: "apostilas/termologia7-termodinamica.pdf?v=2",
      nome: "termologia7-termodinamica.pdf"
    }
  };

  const APOSTILAS_LOCAIS_ONDULATORIA = {
    "ideias-iniciais-de-ondulatoria": {
      url: "apostilas/ondulatoria1-conceitos-iniciais.pdf?v=2",
      nome: "ondulatoria1-conceitos-iniciais.pdf"
    },
    "fenomenos-das-ondas": {
      url: "apostilas/ondulatoria2-fenomenos-ondulatorios.pdf?v=2",
      nome: "ondulatoria2-fenomenos-ondulatorios.pdf"
    },
    "natureza-e-propriedades-do-som": {
      url: "apostilas/ondulatoria3-propriedades-do-som.pdf?v=2",
      nome: "ondulatoria3-propriedades-do-som.pdf"
    },
    "efeitos-sonoros-no-dia-a-dia": {
      url: "apostilas/ondulatoria4-fenomenos-sonoros.pdf?v=2",
      nome: "ondulatoria4-fenomenos-sonoros.pdf"
    },
    "ressonancia-em-cordas-e-tubos": {
      url: "apostilas/ondulatoria5-cordas-e-tubos-sonoros.pdf?v=2",
      nome: "ondulatoria5-cordas-e-tubos-sonoros.pdf"
    },
    "oscilacao-e-movimento-harmonico": {
      url: "apostilas/ondulatoria6-movimento-harmonico-simples.pdf?v=2",
      nome: "ondulatoria6-movimento-harmonico-simples.pdf"
    }
  };

  const APOSTILAS_LOCAIS_OPTICA = {
    "principios-da-optica-geometrica": {
      url: "apostilas/optica1-conceitos-fundamentais.pdf?v=2",
      nome: "optica1-conceitos-fundamentais.pdf"
    },
    "reflexao-em-espelhos-planos": {
      url: "apostilas/optica2-espelhos-planos.pdf?v=2",
      nome: "optica2-espelhos-planos.pdf"
    },
    "espelhos-esfericos-na-pratica": {
      url: "apostilas/optica3-espelhos-esfericos.pdf?v=2",
      nome: "optica3-espelhos-esfericos.pdf"
    },
    "desvio-da-luz-e-refracao": {
      url: "apostilas/optica4-refracao-da-luz.pdf?v=2",
      nome: "optica4-refracao-da-luz.pdf"
    },
    "lentes-imagens-e-visao": {
      url: "apostilas/optica5-lentes-e-visao.pdf?v=2",
      nome: "optica5-lentes-e-visao.pdf"
    }
  };

  function obterApostilaLocalFisica(hierarquia) {
    if (!hierarquia || hierarquia.disciplinaId !== "fisica-basica") {
      return null;
    }
    const mapas = {
      cinematica: APOSTILAS_LOCAIS_CINEMATICA,
      termologia: APOSTILAS_LOCAIS_TERMOLOGIA,
      ondulatoria: APOSTILAS_LOCAIS_ONDULATORIA,
      optica: APOSTILAS_LOCAIS_OPTICA
    };
    return (mapas[hierarquia.assuntoId] && mapas[hierarquia.assuntoId][hierarquia.subassuntoId]) || null;
  }

  function cardApostilaDisponivel(item, hierarquia) {
    if (item && item.botaoDesabilitado === true) return false;
    const local = obterApostilaLocalFisica(hierarquia);
    return String((item && item.tipo) || "").trim() === "apostila" && !!String((item && item.apostilaUrl) || (local && local.url) || "").trim();
  }

function ehBlocoIntroducaoCinematica(hierarquia) {
  return hierarquia &&
    hierarquia.disciplinaId === "fisica-basica" &&
    hierarquia.assuntoId === "cinematica" &&
    hierarquia.subassuntoId === "introducao-a-cinematica";
}

function cardPermitidoIntroCinematica(card) {
  if (!card || card.tipo !== "aula") return true;
  const id = String(card.id || "");
  if (id === "card-cinematica-introducao-a-cinematica-aula-1") return true;
  if (id === "card-cinematica-introducao-a-cinematica-aula-2") return true;
  return false;
}

function renderizarCardFisica(item, hierarquia) {
  const tipoCard = item.tipo === "aula"
    ? "topic-path-lesson"
    : item.tipo === "apostila"
      ? "topic-path-apostila"
      : "topic-path-questions";
  const aulaDisponivel = cardAulaDisponivel(item);
    const apostilaLocal = item.tipo === "apostila" ? obterApostilaLocalFisica(hierarquia) : null;
    const apostilaDisponivel = cardApostilaDisponivel(item, hierarquia);
    const apostilaUrl = apostilaDisponivel ? String(item.apostilaUrl || (apostilaLocal && apostilaLocal.url) || "").trim() : "";
    const apostilaNome = apostilaDisponivel ? String(item.apostilaNome || (apostilaLocal && apostilaLocal.nome) || "").trim() : "";
  const botaoDesabilitado = item.tipo === "aula"
    ? !aulaDisponivel
    : item.botaoDesabilitado === true;
  const botaoClasse = botaoDesabilitado ? "topic-path-button topic-path-button-muted" : "topic-path-button";
  const titulo = htmlEscape(item.titulo || "");
  const tag = htmlEscape(item.tag || (item.tipo === "aula" ? "Aula" : item.tipo === "apostila" ? "Apostila" : "Questoes"));
  const botaoLabel = htmlEscape(
    item.botaoLabel ||
    (botaoDesabilitado
      ? "Em breve"
      : item.tipo === "apostila"
        ? "Abrir apostila"
        : item.tipo === "aula"
          ? "Assistir aula"
          : "Resolver questoes")
  );
  const dataQuiz = botaoDesabilitado || item.tipo !== "questoes"
    ? ""
    : ' data-quiz-disciplina="' + hierarquia.disciplinaId + '" data-quiz-assunto="' + hierarquia.assuntoId + '" data-quiz-subassunto="' + hierarquia.subassuntoId + '"';
    const dataApostila = item.tipo === "apostila"
      ? ' data-apostila-disciplina="' + hierarquia.disciplinaId + '" data-apostila-assunto="' + hierarquia.assuntoId + '" data-apostila-subassunto="' + hierarquia.subassuntoId + '" data-apostila-url="' + htmlEscape(apostilaUrl) + '" data-apostila-nome="' + htmlEscape(apostilaNome) + '" data-apostila-disponivel="' + (apostilaDisponivel ? "true" : "false") + '"'
      : "";
  const dataAula = item.tipo === "aula" && aulaDisponivel
    ? ' data-aula-titulo="' + titulo + '" data-aula-url="' + htmlEscape(item.videoUrl || "") + '" data-aula-embed="' + htmlEscape(obterUrlVideoCard(item)) + '"'
    : "";

  return '' +
    '<article class="topic-path-card ' + tipoCard + '">' +
      '<span class="topic-path-icon icon-box">' + renderizarIconeLucide(item.tipo === "questoes" ? "questoes" : item.tipo) + '</span>' +
      '<span class="topic-path-tag">' + tag + '</span>' +
      '<h3>' + titulo + '</h3>' +
      '<button type="button" class="' + botaoClasse + '"' + dataQuiz + dataApostila + dataAula + (botaoDesabilitado ? ' disabled' : '') + '>' + botaoLabel + '</button>' +
    '</article>';
}
function obterConfigFisica(assuntoId) {
  return FISICA_UI_CONFIG.find((item) => item.id === assuntoId) || FISICA_UI_CONFIG[0];
}

function renderizarCardPrincipalFisica(item) {
  return '' +
    '<button class="fisica-topic-card fisica-topic-card-action card-subject" type="button" data-fisica-open="' + htmlEscape(item.id) + '" role="listitem" aria-label="' + htmlEscape(item.titulo) + '">' +
      '<span class="fisica-topic-icon-box icon-box">' +
        renderizarIconeLucide(item.id) +
      '</span>' +
      '<span class="subject-name">' + htmlEscape(item.titulo) + '</span>' +
    '</button>';
}

function renderizarBlocoTopicoFisica(topico, cards, hierarquia) {
  const cardsUnicos = [];
  const assinaturas = new Set();

  (cards || []).forEach((card) => {
    if (ehBlocoIntroducaoCinematica(hierarquia) && !cardPermitidoIntroCinematica(card)) {
      return;
    }

    const assinatura = card.tipo === "aula"
      ? ["aula", String(card.tag || ""), String(card.ordemExibicao || "")].join("__")
      : ["questoes", String(card.titulo || "").trim().toLowerCase()].join("__");

    if (assinaturas.has(assinatura)) {
      return;
    }

    assinaturas.add(assinatura);
    cardsUnicos.push(card);
  });

  const prioridadeTipo = {
    apostila: 0,
    aula: 1,
    questoes: 2
  };
  const cardsOrdenados = cardsUnicos.slice().sort((a, b) => {
    const prioridadeA = prioridadeTipo[a.tipo] ?? 9;
    const prioridadeB = prioridadeTipo[b.tipo] ?? 9;
    if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB;
    return Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0);
  });
  const gridHtml = cardsOrdenados.length
    ? cardsOrdenados.map((item) => renderizarCardFisica(item, hierarquia)).join("")
    : '<article class="topic-path-card topic-path-lesson"><span class="topic-path-tag">Em preparo</span><h3>Sem cards cadastrados</h3><p>Assim que o admin criar cards para este bloco, eles aparecem aqui automaticamente.</p><button type="button" class="topic-path-button topic-path-button-muted" disabled>Em breve</button></article>';

  return '' +
    '<section class="topic-section-block">' +
      '<div class="topic-section-heading">' +
        '<span class="topic-section-index">' + htmlEscape(topico.kicker || "Bloco") + '</span>' +
        '<h3>' + htmlEscape(topico.titulo) + '</h3>' +
      '</div>' +
      '<div class="topic-card-grid topic-card-grid-compact">' + gridHtml + '</div>' +
    '</section>';
}

function obterConfigTopicoFisica(assuntoId, subassuntoId) {
  const assunto = FISICA_UI_CONFIG.find((item) => item.id === assuntoId);
  if (!assunto) return null;
  return (assunto.topicos || []).find((item) => item.id === subassuntoId) || null;
}

function obterUrlApostilaIncorporada(urlPdf) {
  const url = String(urlPdf || "").trim();
  if (!url) return "";

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    return "https://drive.google.com/file/d/" + driveFileMatch[1] + "/preview";
  }

  const driveIdMatch = url.match(/[?&]id=([^&#]+)/i);
  if (/drive\.google\.com/i.test(url) && driveIdMatch && driveIdMatch[1]) {
    return "https://drive.google.com/file/d/" + driveIdMatch[1] + "/preview";
  }

  const docsMatch = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([^/?#]+)/i);
  if (docsMatch && docsMatch[1] && docsMatch[2]) {
    return "https://docs.google.com/" + docsMatch[1] + "/d/" + docsMatch[2] + "/preview";
  }

  return url;
}

function obterHtmlApostilaFisica(disciplinaId, assuntoId, subassuntoId, apostilaUrl, apostilaNome) {
  const assunto = FISICA_UI_CONFIG.find((item) => item.id === assuntoId);
  const topico = obterConfigTopicoFisica(assuntoId, subassuntoId);
  const tituloAssunto = assunto ? assunto.titulo : "Física Básica";
  const tituloTopico = topico ? topico.titulo : "Apostila";
  const descricao = topico && topico.descricao
    ? topico.descricao
    : "Material teórico centralizado para leitura antes das aulas e da lista de exercícios.";
  const urlPdf = String(apostilaUrl || "").trim();
  const urlIncorporada = obterUrlApostilaIncorporada(urlPdf);
  const nomeArquivo = String(apostilaNome || "apostila.pdf").trim() || "apostila.pdf";

  if (urlPdf) {
    return '' +
      '<div class="apostila-sheet">' +
        '<h2>' + htmlEscape(tituloTopico) + '</h2>' +
        '<div class="apostila-pdf-shell">' +
          '<div class="apostila-pdf-meta">' +
            '<strong>' + htmlEscape(nomeArquivo) + '</strong>' +
            '<span>Leitura incorporada na plataforma.</span>' +
          '</div>' +
          '<div class="apostila-pdf-frame">' +
            '<iframe src="' + htmlEscape(urlIncorporada) + '" title="Apostila em PDF" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
          '</div>' +
        '</div>' +
        '<div class="apostila-actions">' +
          '<a class="apostila-open-link" href="' + htmlEscape(urlPdf) + '" target="_blank" rel="noopener noreferrer">Abrir em nova aba</a>' +
        '</div>' +
      '</div>';
  }

  return '' +
    '<div class="apostila-sheet">' +
      '<h2>' + htmlEscape(tituloTopico) + '</h2>' +
      '<div class="apostila-grid">' +
        '<section class="apostila-block">' +
          '<h3>Como estudar este bloco</h3>' +
          '<p>Comece pela leitura conceitual, identifique grandezas, símbolos e relações principais, e só depois avance para as aulas e exercícios.</p>' +
        '</section>' +
        '<section class="apostila-block">' +
          '<h3>O que vai entrar aqui</h3>' +
          '<ul><li>Resumo teórico em linguagem clara</li><li>Fórmulas e observações importantes</li><li>Exemplos guiados e notas de revisão</li></ul>' +
        '</section>' +
      '</div>' +
      '<section class="apostila-block apostila-block-wide">' +
        '<h3>Estrutura preparada</h3>' +
        '<p>Esta apostila já está pronta para receber PDF, texto interno e futuras versões para download sem alterar a organização do assunto.</p>' +
        '<div class="apostila-meta">' +
          '<span><strong>Disciplina:</strong> ' + htmlEscape(disciplinaId === "fisica-basica" ? "Física Básica" : disciplinaId) + '</span>' +
          '<span><strong>Assunto:</strong> ' + htmlEscape(tituloAssunto) + '</span>' +
          '<span><strong>Bloco:</strong> ' + htmlEscape(tituloTopico) + '</span>' +
        '</div>' +
      '</section>' +
      '<div class="apostila-actions">' +
        '<button type="button" class="btn btn-outline-light" disabled>Download em breve</button>' +
      '</div>' +
    '</div>';
}
function garantirModalApostilaFisica() {
  let overlay = document.getElementById("apostilaOverlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "apostilaOverlay";
  overlay.className = "apostila-overlay d-none";
  overlay.innerHTML =
    '<div class="apostila-backdrop" data-apostila-close="true"></div>' +
    '<section class="apostila-dialog" role="dialog" aria-modal="true" aria-labelledby="apostilaTitle">' +
      '<header class="apostila-header">' +
        '<div>' +
          '<span class="apostila-eyebrow">Universo Relativo</span>' +
          '<h1 id="apostilaTitle">Apostila</h1>' +
        '</div>' +
        '<button type="button" class="apostila-close" data-apostila-close="true" aria-label="Fechar apostila">×</button>' +
      '</header>' +
      '<div class="apostila-content" id="apostilaContent"></div>' +
    '</section>';
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    const alvo = event.target;
    if (!(alvo instanceof HTMLElement)) return;
    if (alvo.closest("[data-apostila-close='true']")) {
      overlay.classList.add("d-none");
      document.body.classList.remove("apostila-open");
    }
  });

  return overlay;
}

function garantirModalAulaFisica() {
  let overlay = document.getElementById("aulaVideoOverlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "aulaVideoOverlay";
  overlay.className = "apostila-overlay d-none";
  overlay.innerHTML =
    '<div class="apostila-backdrop" data-aula-close="true"></div>' +
    '<section class="apostila-dialog aula-video-dialog" role="dialog" aria-modal="true" aria-labelledby="aulaVideoTitle">' +
      '<header class="apostila-header">' +
        '<div>' +
          '<span class="apostila-eyebrow">Universo Relativo</span>' +
          '<h1 id="aulaVideoTitle">Aula</h1>' +
        '</div>' +
        '<button type="button" class="apostila-close" data-aula-close="true" aria-label="Fechar aula">×</button>' +
      '</header>' +
      '<div class="apostila-content" id="aulaVideoContent"></div>' +
    '</section>';
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    const alvo = event.target;
    if (!(alvo instanceof HTMLElement)) return;
    if (alvo.closest("[data-aula-close='true']")) {
      overlay.classList.add("d-none");
      document.body.classList.remove("apostila-open");
    }
  });

  return overlay;
}

function abrirAulaFisica(titulo, videoEmbedUrl, videoUrl) {
  const overlay = garantirModalAulaFisica();
  const content = overlay.querySelector("#aulaVideoContent");
  const title = overlay.querySelector("#aulaVideoTitle");

  if (title) {
    title.textContent = titulo || "Aula";
  }
  if (content) {
    content.innerHTML =
      '<div class="aula-video-sheet">' +
        '<span class="apostila-kicker">Aula em vídeo</span>' +
        '<h2>' + htmlEscape(titulo || "Aula") + '</h2>' +
        '<p class="apostila-lead">Assista ao conteúdo sem sair da plataforma. O player abre direto nesta tela.</p>' +
        '<div class="aula-video-frame-wrap">' +
          '<iframe src="' + htmlEscape(videoEmbedUrl || videoUrl || "") + '" title="' + htmlEscape(titulo || "Aula em vídeo") + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
        '</div>' +
      '</div>';
  }

  overlay.classList.remove("d-none");
  document.body.classList.add("apostila-open");
  registrarAtividadeDashboard("aula", "Assistiu à aula", titulo || "Aula");
}

function abrirApostilaFisica(disciplinaId, assuntoId, subassuntoId, apostilaUrl, apostilaNome) {
  const overlay = garantirModalApostilaFisica();
  const content = overlay.querySelector("#apostilaContent");
  const title = overlay.querySelector("#apostilaTitle");
  const topico = obterConfigTopicoFisica(assuntoId, subassuntoId);

  if (title) {
    title.textContent = topico ? topico.titulo : "Apostila";
  }
  if (content) {
    content.innerHTML = obterHtmlApostilaFisica(disciplinaId, assuntoId, subassuntoId, apostilaUrl, apostilaNome);
  }

  overlay.classList.remove("d-none");
  document.body.classList.add("apostila-open");
  registrarAtividadeDashboard("apostila", "Abriu a apostila", topico ? topico.titulo : "Apostila");
}

function vincularBotoesApostila(contexto) {
  (contexto || document).querySelectorAll("[data-apostila-disciplina][data-apostila-assunto][data-apostila-subassunto]").forEach((botao) => {
    if (botao.dataset.apostilaBound === "true") return;
    botao.addEventListener("click", () => {
      abrirApostilaFisica(
        botao.dataset.apostilaDisciplina || "",
        botao.dataset.apostilaAssunto || "",
        botao.dataset.apostilaSubassunto || "",
        botao.dataset.apostilaUrl || "",
        botao.dataset.apostilaNome || ""
      );
    });
    botao.dataset.apostilaBound = "true";
  });
}

function vincularBotoesAula(contexto) {
  (contexto || document).querySelectorAll("[data-aula-embed]").forEach((botao) => {
    if (botao.dataset.aulaBound === "true") return;
    botao.addEventListener("click", () => {
      abrirAulaFisica(
        botao.dataset.aulaTitulo || "Aula",
        botao.dataset.aulaEmbed || "",
        botao.dataset.aulaUrl || ""
      );
    });
    botao.dataset.aulaBound = "true";
  });
}

function montarResumoCards(cards) {
  const aulas = cards.filter((item) => item.tipo === "aula").length;
  const questoes = cards.filter((item) => item.tipo !== "aula").length;
  const partes = [];
  if (aulas) partes.push(aulas + " aula" + (aulas > 1 ? "s" : ""));
  if (questoes) partes.push(questoes + " card" + (questoes > 1 ? "s" : "") + " de questoes");
  return partes.length ? partes.join(" + ") : "Nenhum card ainda";
}

function assinaturaDetalheFisica(configAssunto, subassuntos) {
  return [
    configAssunto.id,
    ...configAssunto.topicos.map((topico) => {
      const subassunto = subassuntos[topico.id] || {};
      const cards = deduplicarCardsFisica(Array.isArray(subassunto.cards) ? subassunto.cards : []);
      return [
        topico.id,
        cards.length,
        cards.map((item) => [item.id, item.ordemExibicao, item.botaoLabel, item.videoUrl, item.apostilaUrl].join(":")).join("|")
      ].join("::");
    })
  ].join("##");
}

function obterSlotAulaFisica(card) {
  const origem = String(card && card.origem || "").trim();
  const ordem = Number(card && card.ordemExibicao || 0);
  const texto = slugifyCliente([card && card.tag, card && card.titulo, card && card.botaoLabel].join(" "));

  if (texto.includes("aula-02") || texto.includes("aula-2") || texto.includes("segunda") || texto.includes("2")) {
    return "aula-2";
  }

  if (texto.includes("aula-01") || texto.includes("aula-1") || texto.includes("primeira") || texto.includes("1")) {
    return "aula-1";
  }

  if (origem === "fallback-local") {
    return ordem === 2 ? "aula-2" : "aula-1";
  }

  if (origem !== "admin" && ordem <= 3) {
    return ordem === 3 ? "aula-2" : "aula-1";
  }

  return String(card && (card.id || card.titulo || card.ordemExibicao) || "aula-extra");
}

function chaveCardFisica(card) {
  const tipo = String(card && card.tipo || "").trim();
  const subassuntoId = String(card && card.subassuntoId || "").trim();

  if (!tipo || !subassuntoId) {
    return "";
  }

  if (tipo === "apostila") {
    return ["apostila", subassuntoId].join("::");
  }

  if (tipo === "questoes") {
    return ["questoes", subassuntoId].join("::");
  }

  if (tipo === "aula") {
    return ["aula", subassuntoId, obterSlotAulaFisica(card)].join("::");
  }

  return [tipo, subassuntoId, card && (card.id || card.titulo || card.ordemExibicao)].join("::");
}

function prioridadeCardFisica(card) {
  const origem = String(card && card.origem || "").trim();
  let pontos = 0;

  if (origem !== "fallback-local") pontos += 10;
  if (origem === "admin") pontos += 10;
  if (card && (card.videoUrl || card.videoEmbedUrl || card.apostilaUrl)) pontos += 20;
  if (card && card.botaoDesabilitado !== true) pontos += 2;

  return pontos;
}

function deduplicarCardsFisica(cards) {
  const mapa = new Map();

  (cards || []).forEach((item) => {
    const chave = chaveCardFisica(item);
    if (!chave) return;

    const atual = mapa.get(chave);
    if (!atual || prioridadeCardFisica(item) >= prioridadeCardFisica(atual)) {
      mapa.set(chave, { ...(atual || {}), ...item });
      return;
    }

    mapa.set(chave, { ...item, ...atual });
  });

  return Array.from(mapa.values());
}

function renderizarTrilhasFisica(catalogo, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn) {
  const topicsGrid = document.getElementById("fisicaTopicsGrid");
  const detailGrid = document.getElementById("fisicaTopicDetailGrid");
  const detailTitle = document.getElementById("fisicaTopicDetailTitle");
  const detailLead = document.getElementById("fisicaTopicDetailLead");
  const detailKicker = document.getElementById("fisicaTopicDetailKicker");
  const detailCount = document.getElementById("fisicaTopicDetailCount");
  const detailSummary = document.getElementById("fisicaTopicDetailSummary");

  if (topicsGrid && !TOPICS_FISICA_RENDERIZADOS) {
    topicsGrid.innerHTML = FISICA_UI_CONFIG.map((item) => renderizarCardPrincipalFisica(item)).join("");
    animarEntradaSuave(topicsGrid, ".fisica-topic-card");
    iniciarNavegacaoFisica(catalogo, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn);
    atualizarIconesLucide(topicsGrid);
    TOPICS_FISICA_RENDERIZADOS = true;
  }

  const configAssunto = obterConfigFisica(fisicaAssuntoAtual);
  const disciplina = catalogo.disciplinas && catalogo.disciplinas["fisica-basica"];
  const assunto = disciplina && disciplina.assuntos ? disciplina.assuntos[configAssunto.id] : null;
  const subassuntos = (assunto && assunto.subassuntos) || {};
  const assinaturaAtual = assinaturaDetalheFisica(configAssunto, subassuntos);

  if (detailTitle) detailTitle.textContent = configAssunto.titulo;
  if (detailLead) detailLead.textContent = "";
  if (detailKicker) detailKicker.textContent = configAssunto.temaNumero;

  const blocosRenderizados = configAssunto.topicos.map((topico, indice) => {
    const subassunto = subassuntos[topico.id] || {};
    const cards = deduplicarCardsFisica(Array.isArray(subassunto.cards) ? subassunto.cards : []);
    return {
      html: renderizarBlocoTopicoFisica({
        ...topico,
        kicker: "Bloco " + String(indice + 1).padStart(2, "0")
      }, cards, {
        disciplinaId: "fisica-basica",
        assuntoId: configAssunto.id,
        subassuntoId: topico.id
      }),
      cards
    };
  });

  const totalCards = blocosRenderizados.reduce((total, bloco) => total + bloco.cards.length, 0);
  if (detailCount) {
    detailCount.textContent = totalCards + " cards";
  }
  if (detailSummary) {
    detailSummary.textContent = configAssunto.topicos.length + " blocos organizados com 2 aulas e 1 lista cada";
  }

  if (detailGrid && DETALHE_FISICA_ASSINATURA !== assinaturaAtual) {
    detailGrid.innerHTML = blocosRenderizados.map((item) => item.html).join("");
    vincularBotoesQuizDirecionados(detailGrid, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn);
    vincularBotoesApostila(detailGrid);
    vincularBotoesAula(detailGrid);
    animarEntradaSuave(detailGrid, ".topic-section-block");
    atualizarIconesLucide(detailGrid);
    DETALHE_FISICA_ASSINATURA = assinaturaAtual;
  }
}

async function carregarBancoQuestoesGerenciado() {
  if (BANCO_DINAMICO_CARREGADO) {
    return normalizarBancoQuestoes();
  }

  const banco = normalizarBancoQuestoes();
  if (!window.authService || !window.authService.listarCatalogoQuestoes || !window.authService.listarQuestoesGerenciadas) {
    return banco;
  }

  try {
    const [catalogo, questoes] = await Promise.all([
      window.authService.listarCatalogoQuestoes(),
      window.authService.listarQuestoesGerenciadas()
    ]);

    Object.entries((catalogo && catalogo.disciplinas) || {}).forEach(([disciplinaId, disciplina]) => {
      Object.entries((disciplina.assuntos) || {}).forEach(([assuntoId, assunto]) => {
        const subassuntos = assunto.subassuntos || {};
        const chaves = Object.keys(subassuntos);

        if (!chaves.length) {
          garantirEstruturaBanco(banco, disciplinaId, disciplina.label, assuntoId, assunto.label);
          return;
        }

        chaves.forEach((subassuntoId) => {
          garantirEstruturaBanco(
            banco,
            disciplinaId,
            disciplina.label,
            assuntoId,
            assunto.label,
            subassuntoId,
            subassuntos[subassuntoId].label
          );

          const destino = banco.disciplinas[disciplinaId].assuntos[assuntoId].subassuntos[subassuntoId];
          destino.cards = mesclarCardsFisica(destino.cards || [], Array.isArray(subassuntos[subassuntoId].cards)
            ? subassuntos[subassuntoId].cards.slice()
            : []);
        });
      });
    });

    questoes.forEach((item) => {
      if (!item.disciplinaId || !item.assuntoId || !item.subassuntoId) return;

      garantirEstruturaBanco(
        banco,
        item.disciplinaId,
        item.disciplinaLabel,
        item.assuntoId,
        item.assuntoLabel,
        item.subassuntoId,
        item.subassuntoLabel
      );

      const destino = banco.disciplinas[item.disciplinaId].assuntos[item.assuntoId].subassuntos[item.subassuntoId];
      if (!Array.isArray(destino.questoes)) {
        destino.questoes = [];
      }

      const questaoNormalizada = normalizarQuestaoGerenciada(item);
      const indiceExistente = destino.questoes.findIndex((questao) => questao.id === item.id);
      if (indiceExistente >= 0) {
        destino.questoes[indiceExistente] = questaoNormalizada;
      } else {
        destino.questoes.push(normalizarQuestaoGerenciada(item));
      }

      destino.questoes.sort((a, b) => Number(a.ordemExibicao || 0) - Number(b.ordemExibicao || 0));
    });

    BANCO_DINAMICO_CARREGADO = true;
  } catch (error) {
    console.warn("Nao foi possivel carregar as questoes gerenciadas do Firestore.", error);
  }

  return banco;
}

function normalizarBancoQuestoes() {
  const banco = window.BANCO_QUESTOES || {};
  const disciplinas = banco.disciplinas || {};
  const fisicaBasica = disciplinas["fisica-basica"];
  const cinematica = fisicaBasica && fisicaBasica.assuntos && fisicaBasica.assuntos.cinematica;
  const termologia = fisicaBasica && fisicaBasica.assuntos && fisicaBasica.assuntos.termologia;

  if (cinematica && !cinematica.subassuntos) {
    cinematica.subassuntos = {
      "introducao-a-cinematica": {
        label: "Introdução à Cinemática",
        questoes: []
      }
    };
  }

  if (termologia && !termologia.subassuntos) {
    termologia.subassuntos = {
      "fundamentos-de-termologia": {
        label: "Fundamentos de Termologia",
        questoes: []
      }
    };
  }

  garantirCardsPadraoFisicaBanco(banco);
  return banco;
}

function abrirBancoQuestoesComFiltros(filtros) {
  ESTADO_QUIZ.filtrosPendentes = filtros;
  void garantirQuestoesInicializadas();
  navegarParaSecao("questoes");
}

function mostrarTelaFisica(modo, assuntoId) {
  const topicsScreen = document.getElementById("fisicaTopicsScreen");
  const detailScreen = document.getElementById("fisicaTopicDetailScreen");

  if (!topicsScreen || !detailScreen) return;
  if (assuntoId) {
    fisicaAssuntoAtual = assuntoId;
  }
  const telas = {
    topics: topicsScreen,
    detail: detailScreen
  };
  const proxima = telas[modo] || topicsScreen;
  const atual = document.querySelector(".fisica-screen.active");

  transicionarPainel(atual, proxima, {
    seletorItens: ".fisica-topic-card, .study-module, .topic-detail-header, .topic-path-card"
  });
}

function iniciarNavegacaoFisica(catalogo, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn) {
  document.querySelectorAll("[data-fisica-open]").forEach((botao) => {
    if (botao.dataset.fisicaBound === "true") return;
    botao.addEventListener("click", () => {
      const proximoAssunto = botao.dataset.fisicaOpen || "cinematica";
      const mudouAssunto = fisicaAssuntoAtual !== proximoAssunto;
      fisicaAssuntoAtual = proximoAssunto;
      if (mudouAssunto) {
        renderizarTrilhasFisica(catalogo, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn);
      }
      mostrarTelaFisica("detail", fisicaAssuntoAtual);
    });
    botao.dataset.fisicaBound = "true";
  });

  document.querySelectorAll("[data-fisica-back]").forEach((botao) => {
    if (botao.dataset.fisicaBound === "true") return;
    botao.addEventListener("click", () => mostrarTelaFisica(botao.dataset.fisicaBack || "topics"));
    botao.dataset.fisicaBound = "true";
  });
}

function iniciarExperienciaRelatividade() {
  const shell = document.querySelector(".relatividade-shell");
  const focusBtn = document.getElementById("relFocusToggleBtn");
  const modulePanes = document.querySelectorAll(".relatividade-content-area .tab-pane");

  if (!shell || !focusBtn || !modulePanes.length) return;

  const quizConfig = {
    modulo1: {
      pergunta: "Por que o resultado de Michelson-Morley foi tão desconfortável para a física clássica?",
      opcoes: [
        "Porque confirmou que o éter era o referencial absoluto do universo.",
        "Porque não revelou o vento de éter esperado e enfraqueceu a ideia de repouso absoluto.",
        "Porque mostrou que a luz não sofre interferência."
      ],
      correta: 1,
      feedback: "Exato: o resultado nulo atacou a ideia de um meio absoluto detectável e abriu caminho para a Relatividade Especial."
    },
    modulo2: {
      pergunta: "O que relatividade e quântica têm em comum nesse contexto?",
      opcoes: [
        "As duas mantiveram intacta a física clássica.",
        "As duas romperam com certezas da física clássica.",
        "As duas tratam apenas de fenômenos macroscópicos."
      ],
      correta: 1,
      feedback: "Esse é o ponto central do módulo: as duas teorias exigiram uma nova visão física e matemática do mundo."
    },
    modulo3: {
      pergunta: "No exemplo do elevador, o princípio da equivalência aproxima gravidade de qual fenômeno?",
      opcoes: [
        "Aceleração.",
        "Temperatura.",
        "Pressão atmosférica."
      ],
      correta: 0,
      feedback: "A intuição de Einstein foi perceber que, localmente, gravidade e aceleração podem produzir efeitos indistinguíveis."
    },
    modulo4: {
      pergunta: "Segundo esse módulo, o movimento natural em um espaço-tempo curvo segue:",
      opcoes: [
        "Linhas de força newtonianas fixas.",
        "Geodésicas determinadas pela geometria.",
        "Somente órbitas circulares perfeitas."
      ],
      correta: 1,
      feedback: "A ideia-chave aqui é que a geometria do espaço-tempo orienta o movimento livre por meio das geodésicas."
    },
    modulo5: {
      pergunta: "Por que os testes clássicos fortaleceram a teoria relativística?",
      opcoes: [
        "Porque impediram qualquer comparação com observações reais.",
        "Porque mostraram previsões que podiam ser confrontadas com observações.",
        "Porque substituíram toda a astronomia observacional."
      ],
      correta: 1,
      feedback: "A força da teoria aumentou quando seus efeitos previstos puderam ser verificados em fenômenos observáveis."
    },
    modulo6: {
      pergunta: "Além de órbitas e quedas, a teoria geométrica de Einstein também ajuda a descrever:",
      opcoes: [
        "A estrutura do universo em grande escala.",
        "Somente sistemas mecânicos sem gravidade.",
        "Apenas circuitos elétricos ideais."
      ],
      correta: 0,
      feedback: "Esse módulo abre justamente essa ponte: cosmologia, expansão do universo e objetos extremos como buracos negros."
    }
  };

  let popCard = document.getElementById("studyPopCard");

  function garantirPopCard() {
    if (popCard) return popCard;
    popCard = document.createElement("div");
    popCard.id = "studyPopCard";
    popCard.className = "study-pop-card";
    popCard.innerHTML = '<div class="study-pop-card-head"><h4 id="studyPopCardTitle">Imagem de apoio</h4><div class="study-pop-card-actions"><button type="button" class="study-pop-card-expand" id="studyPopCardExpand" aria-label="Expandir imagem" title="Expandir imagem">⛶</button><button type="button" class="study-pop-card-close" id="studyPopCardClose">×</button></div></div><img id="studyPopCardImage" alt=""><p id="studyPopCardCaption"></p>';
    document.body.appendChild(popCard);
    popCard.querySelector("#studyPopCardClose").addEventListener("click", fecharPopCard);
    popCard.querySelector("#studyPopCardExpand").addEventListener("click", expandirPopCard);
    return popCard;
  }

  function fecharPopCard() {
    if (!popCard) return;
    popCard.classList.remove("active");
  }

  function expandirPopCard() {
    if (!popCard) return;
    const image = popCard.querySelector("#studyPopCardImage");
    if (!image) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    if (image.requestFullscreen) {
      image.requestFullscreen().catch(() => {});
      return;
    }

    if (popCard.requestFullscreen) {
      popCard.requestFullscreen().catch(() => {});
    }
  }

  function abrirPopCard(trigger) {
    const card = garantirPopCard();
    const title = card.querySelector("#studyPopCardTitle");
    const image = card.querySelector("#studyPopCardImage");
    const caption = card.querySelector("#studyPopCardCaption");

    title.textContent = trigger.dataset.popTitle || "Imagem de apoio";
    image.src = trigger.dataset.popImage || "";
    image.alt = trigger.dataset.popTitle || "Imagem de apoio";
    caption.textContent = trigger.dataset.popCaption || "";

    const rect = trigger.getBoundingClientRect();
    const cardWidth = Math.min(360, window.innerWidth - 32);
    const left = Math.min(window.innerWidth - cardWidth - 16, Math.max(16, rect.left + rect.width / 2 - cardWidth / 2));
    const estimatedHeight = 320;
    const topAbove = rect.top - estimatedHeight - 14;
    const topBelow = rect.bottom + 14;
    const top = topAbove > 16
      ? topAbove
      : Math.min(window.innerHeight - estimatedHeight - 16, topBelow);

    card.style.left = left + "px";
    card.style.top = top + "px";
    card.classList.add("active");
  }

  function aplicarEstadoFocus(ativo) {
    shell.classList.toggle("focus-mode", ativo);
    focusBtn.textContent = ativo ? "Sair do modo foco" : "Ativar modo foco";
    try {
      localStorage.setItem("relativityFocusMode", ativo ? "1" : "0");
    } catch (_) {}
  }

  function criarMiniQuizCard(config) {
    const card = document.createElement("div");
    card.className = "study-inline-quiz reveal-segment is-hidden";

    const titulo = document.createElement("h4");
    titulo.textContent = "Mini quiz";
    card.appendChild(titulo);

    const pergunta = document.createElement("p");
    pergunta.textContent = config.pergunta;
    card.appendChild(pergunta);

    const opcoes = document.createElement("div");
    opcoes.className = "study-inline-quiz-options";

    const feedback = document.createElement("div");
    feedback.className = "study-inline-quiz-feedback d-none";

    config.opcoes.forEach((texto, indice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "study-inline-quiz-option";
      btn.textContent = texto;
      btn.addEventListener("click", () => {
        if (opcoes.dataset.respondido === "true") return;
        opcoes.dataset.respondido = "true";
        opcoes.querySelectorAll(".study-inline-quiz-option").forEach((item, pos) => {
          item.disabled = true;
          if (pos === config.correta) item.classList.add("correct");
        });
        if (indice !== config.correta) {
          btn.classList.add("incorrect");
        }
        feedback.classList.remove("d-none");
        feedback.textContent = config.feedback;
      });
      opcoes.appendChild(btn);
    });

    card.appendChild(opcoes);
    card.appendChild(feedback);
    return card;
  }

  function prepararModulo(pane) {
    if (pane.dataset.relPrep === "true") return;

    const module = pane.querySelector(".study-module");
    const header = module && module.querySelector(".study-module-header");
    if (!module || !header) return;

    const ferramentas = document.createElement("div");
    ferramentas.className = "study-module-tools";
    ferramentas.innerHTML = '<span class="study-progressive-note">Leitura ativa: revele uma etapa por vez e use o mini quiz para fixar a ideia central.</span><button type="button" class="study-reveal-btn">Revelar próxima parte</button>';
    header.insertAdjacentElement("afterend", ferramentas);

    const segmentos = [];
    Array.from(module.children).forEach((child) => {
      if (child === header || child === ferramentas) return;
      child.classList.add("reveal-segment");
      if (!child.classList.contains("is-revealed")) child.classList.add("is-hidden");
      segmentos.push(child);
    });

    const quiz = quizConfig[pane.id];
    if (quiz && !pane.querySelector(".study-inline-quiz")) {
      const quizCard = criarMiniQuizCard(quiz);
      const referencia = module.querySelector(".study-grid");
      if (referencia) {
        referencia.insertAdjacentElement("afterend", quizCard);
      } else {
        module.appendChild(quizCard);
      }
      segmentos.splice(1, 0, quizCard);
    }

    const revealBtn = ferramentas.querySelector(".study-reveal-btn");
    let indiceAtual = 0;

    function atualizarSegmentos() {
      segmentos.forEach((segmento, indice) => {
        segmento.classList.toggle("is-hidden", indice > indiceAtual);
      });

      const acabou = indiceAtual >= segmentos.length - 1;
      revealBtn.disabled = acabou;
      revealBtn.textContent = acabou ? "Leitura completa" : "Revelar próxima parte";
    }

    revealBtn.addEventListener("click", () => {
      if (indiceAtual < segmentos.length - 1) {
        indiceAtual += 1;
        atualizarSegmentos();
      }
    });

    atualizarSegmentos();
    pane.dataset.relPrep = "true";
  }

  modulePanes.forEach(prepararModulo);

  document.querySelectorAll(".study-pop-trigger").forEach((trigger) => {
    if (trigger.dataset.popBound === "true") return;
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (popCard && popCard.classList.contains("active")) {
        fecharPopCard();
        if (popCard.dataset.currentTrigger === trigger.dataset.popTitle) return;
      }
      abrirPopCard(trigger);
      if (popCard) popCard.dataset.currentTrigger = trigger.dataset.popTitle || "";
    });
    trigger.dataset.popBound = "true";
  });

  document.querySelectorAll('#moduleTabs [data-bs-toggle="pill"]').forEach((btn) => {
    btn.addEventListener("shown.bs.tab", (event) => {
      const target = document.querySelector(event.target.getAttribute("data-bs-target"));
      if (target) prepararModulo(target);
      fecharPopCard();
    });
  });

  focusBtn.addEventListener("click", () => {
    aplicarEstadoFocus(!shell.classList.contains("focus-mode"));
  });

  let focusSalvo = false;
  try {
    focusSalvo = localStorage.getItem("relativityFocusMode") === "1";
  } catch (_) {}
  aplicarEstadoFocus(focusSalvo);

  document.addEventListener("click", (event) => {
    if (!popCard || !popCard.classList.contains("active")) return;
    if (popCard.contains(event.target) || event.target.closest(".study-pop-trigger")) return;
    fecharPopCard();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") fecharPopCard();
  });
}

function iniciarExperienciaRelatividadeV2() {
  const shell = document.querySelector(".relatividade-shell");
  const focusBtn = document.getElementById("relFocusToggleBtn");
  const progressBar = document.getElementById("relReadingProgressBar");
  const modulePanes = document.querySelectorAll(".relatividade-content-area .tab-pane");

  if (!shell || !focusBtn || !modulePanes.length) return;

  const quizConfig = {
    modulo1: {
      pergunta: "Por que o resultado de Michelson-Morley foi tão desconfortável para a física clássica?",
      opcoes: [
        "Porque confirmou que o éter era o referencial absoluto do universo.",
        "Porque não revelou o vento de éter esperado e enfraqueceu a ideia de repouso absoluto.",
        "Porque mostrou que a luz não sofre interferência."
      ],
      correta: 1,
      feedback: "Exato: o resultado nulo atacou a ideia de um meio absoluto detectável e abriu caminho para a Relatividade Especial."
    },
    modulo2: {
      pergunta: "O que relatividade e quântica têm em comum nesse contexto?",
      opcoes: [
        "As duas mantiveram intacta a física clássica.",
        "As duas romperam com certezas da física clássica.",
        "As duas tratam apenas de fenômenos macroscópicos."
      ],
      correta: 1,
      feedback: "Esse é o ponto central do módulo: as duas teorias exigiram uma nova visão física e matemática do mundo."
    },
    modulo3: {
      pergunta: "No exemplo do elevador, o princípio da equivalência aproxima gravidade de qual fenômeno?",
      opcoes: [
        "Aceleração.",
        "Temperatura.",
        "Pressão atmosférica."
      ],
      correta: 0,
      feedback: "A intuição de Einstein foi perceber que, localmente, gravidade e aceleração podem produzir efeitos indistinguíveis."
    },
    modulo4: {
      pergunta: "Segundo esse módulo, o movimento natural em um espaço-tempo curvo segue:",
      opcoes: [
        "Linhas de força newtonianas fixas.",
        "Geodésicas determinadas pela geometria.",
        "Somente órbitas circulares perfeitas."
      ],
      correta: 1,
      feedback: "A ideia-chave aqui é que a geometria do espaço-tempo orienta o movimento livre por meio das geodésicas."
    },
    modulo5: {
      pergunta: "Por que os testes clássicos fortaleceram a teoria relativística?",
      opcoes: [
        "Porque impediram qualquer comparação com observações reais.",
        "Porque mostraram previsões que podiam ser confrontadas com observações.",
        "Porque substituíram toda a astronomia observacional."
      ],
      correta: 1,
      feedback: "A força da teoria aumentou quando seus efeitos previstos puderam ser verificados em fenômenos observáveis."
    },
    modulo6: {
      pergunta: "Além de órbitas e quedas, a teoria geométrica de Einstein também ajuda a descrever:",
      opcoes: [
        "A estrutura do universo em grande escala.",
        "Somente sistemas mecânicos sem gravidade.",
        "Apenas circuitos elétricos ideais."
      ],
      correta: 0,
      feedback: "Esse módulo abre justamente essa ponte: cosmologia, expansão do universo e objetos extremos como buracos negros."
    }
  };

  const curiosityConfig = {
    modulo1: [{
      titulo: "Curiosidade",
      texto: "O resultado nulo de Michelson-Morley ficou famoso como um dos experimentos mais importantes da história justamente porque a ausência do efeito esperado mudou o rumo da física."
    }],
    modulo2: [{
      titulo: "Curiosidade",
      texto: "Enquanto a relatividade reorganiza espaço, tempo e gravidade, a quântica desmonta a ideia de previsão totalmente determinística no mundo microscópico."
    }],
    modulo3: [{
      titulo: "Curiosidade",
      texto: "Einstein chamou a ideia da queda livre de um dos pensamentos mais felizes de sua vida, porque ela ligava gravidade e aceleração de um modo novo."
    }],
    modulo4: [{
      titulo: "Curiosidade",
      texto: "Nesse ponto da trilha, vale pensar menos em força puxando e mais em trajetórias moldadas pela própria geometria do universo."
    }],
    modulo5: [{
      titulo: "Curiosidade",
      texto: "O GPS precisa de correções relativísticas: sem elas, os erros de posição cresceriam rapidamente ao longo do dia."
    }],
    modulo6: [{
      titulo: "Curiosidade",
      texto: "Buracos negros, ondas gravitacionais e cosmologia mostram que a teoria geométrica de Einstein não ficou no passado; ela segue explicando fenômenos centrais do universo."
    }]
  };

  const glossaryConfig = {
    modulo1: [
      { termo: "éter luminífero", definicao: "Hipótese clássica de um meio invisível que preencheria o espaço e serviria de suporte para a propagação da luz." },
      { termo: "referencial absoluto", definicao: "Ideia de um estado de repouso privilegiado em relação ao qual todos os movimentos poderiam ser medidos de forma definitiva." },
      {
        termo: "interferômetro",
        definicao: "Instrumento que compara percursos de ondas de luz para detectar diferenças muito pequenas entre eles.",
        imagem: "https://commons.wikimedia.org/wiki/Special:FilePath/Michelson-Morley%20experiment%20%28pt%29.svg",
        tituloImagem: "Interferômetro de Michelson-Morley",
        legendaImagem: "O feixe de luz é dividido em dois caminhos perpendiculares e depois recombinado para revelar diferenças muito pequenas no percurso."
      },
      { termo: "vento de éter", definicao: "Efeito esperado caso a Terra estivesse se movendo através do éter, alterando o percurso da luz em direções diferentes." },
      { termo: "franjas de interferência", definicao: "Faixas claras e escuras formadas quando ondas se somam ou se cancelam ao serem recombinadas." },
      { termo: "Relatividade Especial", definicao: "Teoria de Einstein para referenciais inerciais, baseada na equivalência das leis da física e na constância da velocidade da luz no vácuo." }
    ],
    modulo2: [
      { termo: "física quântica", definicao: "Ramo da física que descreve matéria e radiação em escalas microscópicas, com forte papel da probabilidade." },
      { termo: "física moderna", definicao: "Conjunto das grandes teorias do século XX que reformularam a visão clássica do mundo, como relatividade e quântica." },
      { termo: "imagem clássica do mundo", definicao: "Visão determinística e intuitiva herdada da física de Newton e Maxwell." }
    ],
    modulo3: [
      { termo: "princípio da equivalência", definicao: "Ideia central de Einstein segundo a qual, localmente, os efeitos da gravidade podem ser indistinguíveis dos efeitos da aceleração." },
      { termo: "gravidade", definicao: "Na teoria geométrica de Einstein, é entendida como efeito da geometria do espaço-tempo, não apenas como uma força puxando corpos." },
      { termo: "massa inercial", definicao: "Medida da resistência de um corpo a mudar seu estado de movimento." },
      { termo: "massa gravitacional", definicao: "Grandeza ligada à forma como um corpo responde a campos gravitacionais." }
    ],
    modulo4: [
      { termo: "massa", definicao: "Grandeza ligada à quantidade de matéria e energia de um corpo, capaz de influenciar a curvatura ao redor." },
      {
        termo: "espaço-tempo",
        definicao: "Estrutura unificada que combina espaço e tempo em uma mesma descrição geométrica.",
        imagem: "https://commons.wikimedia.org/wiki/Special:FilePath/Spacetime%20curvature.png",
        tituloImagem: "Curvatura do espaço-tempo",
        legendaImagem: "A massa altera a geometria ao redor; objetos e luz seguem trajetórias moldadas por essa curvatura."
      },
      { termo: "luz", definicao: "Radiação eletromagnética que também segue trajetórias afetadas pela geometria do espaço-tempo." },
      { termo: "geodésicas", definicao: "Trajetórias naturais seguidas por corpos e luz em uma geometria curva." },
      { termo: "curvatura", definicao: "Alteração geométrica causada por massa e energia, responsável por orientar o movimento." }
    ],
    modulo5: [
      { termo: "precessão de Mercúrio", definicao: "Pequeno deslocamento adicional na órbita de Mercúrio que a mecânica newtoniana não explicava completamente." },
      {
        termo: "desvio gravitacional",
        definicao: "Mudança na trajetória da luz ao passar por uma região onde o espaço-tempo está curvo.",
        imagem: "https://commons.wikimedia.org/wiki/Special:FilePath/Gravitational%20lens-full.jpg",
        tituloImagem: "Desvio gravitacional da luz",
        legendaImagem: "Campos gravitacionais intensos podem curvar a trajetória da luz, produzindo efeitos como lentes gravitacionais."
      },
      { termo: "vermelho gravitacional", definicao: "Perda de energia da luz ao escapar de um campo gravitacional intenso, aumentando seu comprimento de onda." }
    ],
    modulo6: [
      {
        termo: "buracos negros",
        definicao: "Regiões onde a gravidade é tão intensa que nem a luz consegue escapar após cruzar o horizonte de eventos.",
        imagem: "https://commons.wikimedia.org/wiki/Special:FilePath/Black%20hole%20-%20Messier%2087%20crop%20max%20res.jpg",
        tituloImagem: "Buraco negro",
        legendaImagem: "Região extrema do espaço-tempo em que a gravidade impede até a luz de escapar depois do horizonte de eventos."
      },
      { termo: "luz", definicao: "Mesmo a luz pode ter sua trajetória alterada ou ser impedida de escapar em regiões gravitacionais extremas." },
      { termo: "cosmologia", definicao: "Área que estuda a estrutura, a história e a evolução do universo como um todo." },
      { termo: "ondas gravitacionais", definicao: "Ondulações do espaço-tempo produzidas por eventos astrofísicos extremos." }
    ]
  };

  let popCard = document.getElementById("studyPopCard");

  function garantirPopCard() {
    if (popCard) return popCard;
    popCard = document.createElement("div");
    popCard.id = "studyPopCard";
    popCard.className = "study-pop-card";
    popCard.innerHTML = '<div class="interactive-image-backdrop" data-interactive-image-close="true"></div><section class="interactive-image-panel" role="dialog" aria-modal="true" aria-labelledby="studyPopCardTitle"><div class="study-pop-card-head"><h4 id="studyPopCardTitle">Imagem de apoio</h4><div class="study-pop-card-actions"><button type="button" class="study-pop-card-expand" id="studyPopCardExpand" aria-label="Expandir imagem" title="Expandir imagem">\u26f6</button><button type="button" class="study-pop-card-close" id="studyPopCardClose" aria-label="Fechar imagem">\u00d7</button></div></div><img id="studyPopCardImage" alt=""><p id="studyPopCardCaption"></p></section>';
    document.body.appendChild(popCard);
    popCard.querySelector("#studyPopCardClose").addEventListener("click", fecharPopCard);
    popCard.querySelector("#studyPopCardExpand").addEventListener("click", expandirPopCard);
    popCard.querySelector("[data-interactive-image-close='true']").addEventListener("click", fecharPopCard);
    return popCard;
  }

  function fecharPopCard() {
    if (!popCard) return;
    popCard.classList.remove("active", "is-fullscreen");
    delete popCard.dataset.currentTrigger;
  }

  function expandirPopCard() {
    if (!popCard) return;
    popCard.classList.toggle("is-fullscreen");
  }

  function abrirPopCard(trigger) {
    const card = garantirPopCard();
    const title = card.querySelector("#studyPopCardTitle");
    const image = card.querySelector("#studyPopCardImage");
    const caption = card.querySelector("#studyPopCardCaption");

    const titulo = trigger.dataset.popTitle || trigger.dataset.title || trigger.textContent || "Imagem de apoio";
    title.textContent = titulo;
    image.src = trigger.dataset.popImage || trigger.dataset.image || "";
    image.alt = titulo;
    caption.textContent = trigger.dataset.popCaption || trigger.dataset.caption || "";

    card.classList.remove("is-fullscreen");
    card.classList.add("active");
  }

  function aplicarEstadoFocus(ativo) {
    shell.classList.toggle("focus-mode", ativo);
    focusBtn.textContent = ativo ? "Sair do modo foco" : "Ativar modo foco";
    try {
      localStorage.setItem("relativityFocusMode", ativo ? "1" : "0");
    } catch (_) {}
    atualizarBotaoContinuarFocus();
  }

  function obterPaneAtivo() {
    return document.querySelector(".relatividade-content-area .tab-pane.active.show") ||
      document.querySelector(".relatividade-content-area .tab-pane.show") ||
      modulePanes[0];
  }

  function devolverBotoesContinuarParaOrigem() {
    document.querySelectorAll(".study-reveal-btn[data-floating-focus='true']").forEach((btn) => {
      if (btn.__focusPlaceholder && btn.__focusPlaceholder.parentNode) {
        btn.__focusPlaceholder.parentNode.insertBefore(btn, btn.__focusPlaceholder);
        btn.__focusPlaceholder.remove();
      }
      delete btn.__focusPlaceholder;
      btn.dataset.floatingFocus = "false";
      btn.classList.remove("continue-reading-btn", "next-step-btn");
    });
  }

  function atualizarBotaoContinuarFocus() {
    devolverBotoesContinuarParaOrigem();
    if (!shell.classList.contains("focus-mode")) return;

    const site = document.getElementById("site-content");
    const secaoRelatividade = document.getElementById("secao-relatividade-geral");
    const alunoLogado = Boolean(ESTADO_ALUNO && ESTADO_ALUNO.perfil);
    const siteVisivel = Boolean(site && !site.classList.contains("d-none") && site.classList.contains("d-flex"));
    const leituraVisivel = Boolean(secaoRelatividade && secaoRelatividade.classList.contains("active"));
    if (!alunoLogado || !siteVisivel || !leituraVisivel) return;

    const paneAtivo = obterPaneAtivo();
    const revealBtn = paneAtivo && paneAtivo.querySelector(".study-reveal-btn");
    if (!revealBtn || revealBtn.dataset.floatingFocus === "true") return;

    const placeholder = document.createComment("study-reveal-btn-placeholder");
    revealBtn.parentNode.insertBefore(placeholder, revealBtn);
    revealBtn.__focusPlaceholder = placeholder;
    revealBtn.dataset.floatingFocus = "true";
    revealBtn.classList.add("continue-reading-btn", "next-step-btn");
    document.body.appendChild(revealBtn);
  }

  window.atualizarBotaoContinuarFocusRelatividade = atualizarBotaoContinuarFocus;

  function atualizarBarraLeitura() {
    if (!progressBar) return;
    const ativo = obterPaneAtivo();
    const module = ativo && ativo.querySelector(".study-module");
    if (!module) {
      progressBar.style.width = "0%";
      return;
    }

    const rect = module.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const inicio = viewport * 0.2;
    const fim = viewport * 0.78;
    const total = Math.max(rect.height + inicio - fim, 1);
    const percorrido = inicio - rect.top;
    const progresso = Math.max(0, Math.min(1, percorrido / total));
    progressBar.style.width = Math.round(progresso * 100) + "%";
  }

  function rolarParaTopoDaLeitura(pane) {
    const module = pane && pane.querySelector(".study-module");
    if (!module) return;
    module.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function navegarParaProximoModulo(pane) {
    const panes = Array.from(modulePanes);
    const indiceAtual = panes.indexOf(pane);
    const proximoPane = panes[indiceAtual + 1];
    if (!proximoPane) {
      const actions = pane && pane.querySelector(".study-completion-actions");
      if (actions) {
        actions.dataset.finished = "true";
        const nextBtn = actions.querySelector(".study-next-module-btn");
        if (nextBtn) nextBtn.textContent = "Trilha concluída 🎉";
      }
      return;
    }

    const tabBtn = document.querySelector('#moduleTabs [data-bs-target="#' + proximoPane.id + '"]');
    if (tabBtn && window.bootstrap && bootstrap.Tab) {
      bootstrap.Tab.getOrCreateInstance(tabBtn).show();
    } else if (tabBtn) {
      tabBtn.click();
    } else {
      proximoPane.classList.add("show", "active");
    }

    window.setTimeout(() => {
      prepararModulo(proximoPane);
      rolarParaTopoDaLeitura(proximoPane);
      atualizarBarraLeitura();
      atualizarBotaoContinuarFocus();
    }, 80);
  }

  function criarMiniQuizCard(config) {
    const card = document.createElement("section");
    card.className = "study-inline-quiz reveal-segment is-hidden";
    card.setAttribute("aria-label", "Mini quiz de fixação");

    const titulo = document.createElement("h4");
    titulo.textContent = "Mini quiz";
    card.appendChild(titulo);

    const pergunta = document.createElement("p");
    pergunta.textContent = config.pergunta;
    card.appendChild(pergunta);

    const opcoes = document.createElement("div");
    opcoes.className = "study-inline-quiz-options";

    const feedback = document.createElement("div");
    feedback.className = "study-inline-quiz-feedback d-none";
    feedback.setAttribute("role", "status");

    config.opcoes.forEach((texto, indice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "study-inline-quiz-option";
      btn.textContent = texto;
      btn.addEventListener("click", () => {
        if (opcoes.dataset.respondido === "true") return;
        const acertou = indice === config.correta;
        opcoes.dataset.respondido = "true";
        opcoes.querySelectorAll(".study-inline-quiz-option").forEach((item, pos) => {
          item.disabled = true;
          if (pos === config.correta) item.classList.add("correct");
        });
        if (!acertou) btn.classList.add("incorrect");
        feedback.classList.remove("d-none", "correct", "incorrect");
        feedback.classList.add(acertou ? "correct" : "incorrect");
        feedback.textContent = (acertou ? "Certo. " : "Ainda não. ") + config.feedback;
      });
      opcoes.appendChild(btn);
    });

    card.appendChild(opcoes);
    card.appendChild(feedback);
    return card;
  }

  function criarCuriosidadeCard(config) {
    const card = document.createElement("aside");
    card.className = "study-curiosity-card reveal-segment is-hidden";
    card.innerHTML = '<span>Curiosidade</span><h4></h4><p></p>';
    card.querySelector("h4").textContent = config.titulo || "Curiosidade";
    card.querySelector("p").textContent = config.texto || "";
    return card;
  }

  function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function termoJaDentroDeElemento(node) {
    return Boolean(node.parentElement && node.parentElement.closest(".study-term, button, textarea, input, select, script, style"));
  }

  function aplicarTermosAoElemento(elemento, termos) {
    if (!elemento || !termos.length) return;
    const walker = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim() || termoJaDentroDeElemento(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        const textoNormalizado = node.nodeValue.toLocaleLowerCase("pt-BR");
        return termos.some((item) => textoNormalizado.includes(item.termo.toLocaleLowerCase("pt-BR")))
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      let partes = [{ tipo: "texto", valor: node.nodeValue }];
      termos.forEach((item) => {
        const regex = new RegExp("(" + escaparRegex(item.termo) + ")", "gi");
        partes = partes.flatMap((parte) => {
          if (parte.tipo !== "texto") return [parte];
          return parte.valor.split(regex).filter(Boolean).map((valor) => (
            valor.toLocaleLowerCase("pt-BR") === item.termo.toLocaleLowerCase("pt-BR")
              ? {
                tipo: "termo",
                valor,
                definicao: item.definicao,
                imagem: item.imagem || "",
                tituloImagem: item.tituloImagem || item.termo,
                legendaImagem: item.legendaImagem || ""
              }
              : { tipo: "texto", valor }
          ));
        });
      });

      const fragment = document.createDocumentFragment();
      partes.forEach((parte) => {
        if (parte.tipo === "termo") {
          const span = document.createElement("span");
          span.className = parte.imagem ? "study-term interactive-term" : "study-term";
          span.tabIndex = 0;
          span.textContent = parte.valor;
          if (parte.imagem) {
            span.dataset.image = parte.imagem;
            span.dataset.title = parte.tituloImagem || parte.valor;
            span.dataset.caption = parte.legendaImagem || parte.definicao || "";
          }
          const tooltip = document.createElement("span");
          tooltip.className = "study-term-tooltip";
          tooltip.textContent = parte.definicao;
          span.appendChild(tooltip);
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(parte.valor));
        }
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function prepararGlossario(pane) {
    const termos = glossaryConfig[pane.id] || [];
    if (!termos.length || pane.dataset.relGlossary === "true") return;
    pane.querySelectorAll(".study-module-header .lead, .study-card p, .study-card li, .study-steps p").forEach((elemento) => {
      aplicarTermosAoElemento(elemento, termos);
    });
    pane.dataset.relGlossary = "true";
  }

  let termTooltipCard = document.getElementById("studyTermTooltipCard");
  let termTooltipOwner = null;

  function garantirTermTooltipCard() {
    if (termTooltipCard) return termTooltipCard;
    termTooltipCard = document.createElement("div");
    termTooltipCard.id = "studyTermTooltipCard";
    termTooltipCard.className = "tooltip-card study-term-floating-tooltip";
    termTooltipCard.setAttribute("role", "tooltip");
    document.body.appendChild(termTooltipCard);
    return termTooltipCard;
  }

  function posicionarTermTooltip(term) {
    const card = garantirTermTooltipCard();
    const rect = term.getBoundingClientRect();
    const margem = 16;
    const largura = Math.min(360, window.innerWidth - margem * 2);
    card.style.maxWidth = largura + "px";
    card.style.left = Math.min(window.innerWidth - largura - margem, Math.max(margem, rect.left + rect.width / 2 - largura / 2)) + "px";

    const altura = card.offsetHeight || 96;
    const acima = rect.top - altura - 12;
    const abaixo = rect.bottom + 12;
    card.style.top = (acima >= margem ? acima : Math.min(window.innerHeight - altura - margem, abaixo)) + "px";
  }

  function abrirTermTooltip(term, travado = false) {
    const tooltip = term.querySelector(".study-term-tooltip");
    if (!tooltip) return;
    const card = garantirTermTooltipCard();
    termTooltipOwner = term;
    card.textContent = tooltip.textContent || "";
    card.dataset.locked = travado ? "true" : "false";
    card.classList.add("is-visible");
    term.classList.add("is-open");
    requestAnimationFrame(() => posicionarTermTooltip(term));
  }

  function fecharTermTooltip(forcar = false) {
    if (!termTooltipCard) return;
    if (!forcar && termTooltipCard.dataset.locked === "true") return;
    termTooltipCard.classList.remove("is-visible");
    termTooltipCard.dataset.locked = "false";
    if (termTooltipOwner) termTooltipOwner.classList.remove("is-open");
    termTooltipOwner = null;
  }

  function ativarTooltipsDeTermos(pane) {
    pane.querySelectorAll(".study-term").forEach((term) => {
      if (term.dataset.termBound === "true") return;
      term.addEventListener("mouseenter", () => abrirTermTooltip(term, false));
      term.addEventListener("mouseleave", () => fecharTermTooltip(false));
      term.addEventListener("focus", () => abrirTermTooltip(term, false));
      term.addEventListener("blur", () => fecharTermTooltip(false));
      term.addEventListener("click", (event) => {
        event.stopPropagation();
        if (term.classList.contains("interactive-term") && term.dataset.image) {
          fecharTermTooltip(true);
          abrirPopCard(term);
          return;
        }
        const estavaAberto = term.classList.contains("is-open");
        shell.querySelectorAll(".study-term.is-open").forEach((item) => {
          if (item !== term) item.classList.remove("is-open");
        });
        if (estavaAberto && termTooltipCard && termTooltipCard.dataset.locked === "true") {
          fecharTermTooltip(true);
          return;
        }
        abrirTermTooltip(term, true);
      });
      term.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        term.click();
      });
      term.dataset.termBound = "true";
    });
  }

  function prepararModulo(pane) {
    if (pane.dataset.relPrep === "true") return;

    const module = pane.querySelector(".study-module");
    const header = module && module.querySelector(".study-module-header");
    if (!module || !header) return;

    prepararGlossario(pane);
    ativarTooltipsDeTermos(pane);

    const ferramentas = document.createElement("div");
    ferramentas.className = "study-module-tools";
    ferramentas.innerHTML = '<span class="study-progressive-note">Leitura ativa: avance em pequenos blocos, confira a curiosidade e responda ao mini quiz quando ele aparecer.</span><button type="button" class="study-reveal-btn">Continuar leitura</button><div class="study-completion-actions d-none"><span class="study-complete-text">Leitura concluída</span><button type="button" class="study-next-module-btn">Próximo módulo →</button><button type="button" class="study-review-btn">Revisar leitura</button></div>';
    header.insertAdjacentElement("afterend", ferramentas);

    const referencia = module.querySelector(".study-grid");
    const curiosidade = (curiosityConfig[pane.id] || [])[0];
    if (curiosidade && referencia && !pane.querySelector(".study-curiosity-card")) {
      referencia.insertAdjacentElement("afterend", criarCuriosidadeCard(curiosidade));
    }

    const quiz = quizConfig[pane.id];
    if (quiz && !pane.querySelector(".study-inline-quiz")) {
      const destino = pane.querySelector(".study-curiosity-card") || referencia || header;
      destino.insertAdjacentElement("afterend", criarMiniQuizCard(quiz));
    }

    const segmentos = Array.from(module.children).filter((child) => child !== header && child !== ferramentas);
    segmentos.forEach((child, indice) => {
      child.classList.add("reveal-segment");
      child.classList.toggle("is-hidden", indice > 0);
    });

    const revealBtn = ferramentas.querySelector(".study-reveal-btn");
    const completionActions = ferramentas.querySelector(".study-completion-actions");
    const nextModuleBtn = ferramentas.querySelector(".study-next-module-btn");
    const reviewBtn = ferramentas.querySelector(".study-review-btn");
    let indiceAtual = 0;

    function atualizarSegmentos() {
      segmentos.forEach((segmento, indice) => {
        segmento.classList.toggle("is-hidden", indice > indiceAtual);
      });
      const leituraCompleta = indiceAtual >= segmentos.length - 1;
      revealBtn.disabled = leituraCompleta;
      revealBtn.textContent = leituraCompleta ? "Leitura concluída" : "Continuar leitura";
      if (completionActions) completionActions.classList.toggle("d-none", !leituraCompleta);
      atualizarBarraLeitura();
    }

    revealBtn.addEventListener("click", () => {
      if (indiceAtual >= segmentos.length - 1) return;
      indiceAtual += 1;
      atualizarSegmentos();
      atualizarBotaoContinuarFocus();
    });
    if (nextModuleBtn) {
      nextModuleBtn.addEventListener("click", () => navegarParaProximoModulo(pane));
    }
    if (reviewBtn) {
      reviewBtn.addEventListener("click", () => rolarParaTopoDaLeitura(pane));
    }

    atualizarSegmentos();
    atualizarBotaoContinuarFocus();
    pane.dataset.relPrep = "true";
  }

  modulePanes.forEach(prepararModulo);

  shell.querySelectorAll(".study-pop-trigger").forEach((trigger) => {
    if (trigger.dataset.popBound === "true") return;
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (popCard && popCard.classList.contains("active")) {
        fecharPopCard();
        if (popCard.dataset.currentTrigger === trigger.dataset.popTitle) return;
      }
      abrirPopCard(trigger);
      if (popCard) popCard.dataset.currentTrigger = trigger.dataset.popTitle || "";
    });
    trigger.dataset.popBound = "true";
  });

  document.querySelectorAll('#moduleTabs [data-bs-toggle="pill"]').forEach((btn) => {
    btn.addEventListener("shown.bs.tab", (event) => {
      const target = document.querySelector(event.target.getAttribute("data-bs-target"));
      if (target) prepararModulo(target);
      fecharPopCard();
      atualizarBarraLeitura();
      atualizarBotaoContinuarFocus();
    });
  });

  focusBtn.addEventListener("click", () => {
    aplicarEstadoFocus(!shell.classList.contains("focus-mode"));
    atualizarBarraLeitura();
    atualizarBotaoContinuarFocus();
  });

  let focusSalvo = false;
  try {
    focusSalvo = localStorage.getItem("relativityFocusMode") === "1";
  } catch (_) {}
  aplicarEstadoFocus(focusSalvo);
  atualizarBarraLeitura();
  atualizarBotaoContinuarFocus();

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".study-term")) {
        shell.querySelectorAll(".study-term.is-open").forEach((item) => item.classList.remove("is-open"));
        fecharTermTooltip(true);
      }
      if (popCard && popCard.classList.contains("active")) {
      if (!popCard.contains(event.target) && !event.target.closest(".study-pop-trigger")) {
        fecharPopCard();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharPopCard();
      shell.querySelectorAll(".study-term.is-open").forEach((item) => item.classList.remove("is-open"));
      fecharTermTooltip(true);
    }
  });

  window.addEventListener("scroll", atualizarBarraLeitura, { passive: true });
  window.addEventListener("scroll", () => {
    if (termTooltipOwner && termTooltipCard && termTooltipCard.classList.contains("is-visible")) {
      posicionarTermTooltip(termTooltipOwner);
    }
  }, { passive: true });
  window.addEventListener("resize", atualizarBarraLeitura);
  window.addEventListener("resize", () => {
    if (termTooltipOwner && termTooltipCard && termTooltipCard.classList.contains("is-visible")) {
      posicionarTermTooltip(termTooltipOwner);
    }
  });
}
function obterPerfilAtual() {
  if (ESTADO_ALUNO.perfil) return ESTADO_ALUNO.perfil;
  if (window.authService && typeof window.authService.getPerfilAtual === "function") {
    return window.authService.getPerfilAtual();
  }
  return null;
}

function obterResumoProgresso() {
  const perfil = obterPerfilAtual();
  const progresso = (perfil && perfil.progresso) || {};
  return {
    questoesRespondidas: Number(progresso.questoesRespondidas || 0),
    acertos: Number(progresso.acertos || 0),
    aproveitamento: Number(progresso.aproveitamento || 0),
    sessoesConcluidas: Number(progresso.sessoesConcluidas || 0),
    aulasConcluidas: Number(progresso.aulasConcluidas || 0)
  };
}

function obterSaudacaoDashboard() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function chaveAtividadesDashboard() {
  const perfil = obterPerfilAtual();
  return "universo_relativo_atividades_dashboard_" + String((perfil && perfil.uid) || "anonimo");
}

function listarAtividadesLocaisDashboard() {
  try {
    return JSON.parse(localStorage.getItem(chaveAtividadesDashboard()) || "[]")
      .filter((item) => item && item.titulo && item.tipo);
  } catch (_) {
    return [];
  }
}

function registrarAtividadeDashboard(tipo, titulo, detalhe) {
  const perfil = obterPerfilAtual();
  if (!perfil || !perfil.uid) return;
  const atividades = listarAtividadesLocaisDashboard();
  atividades.unshift({
    tipo,
    titulo: String(titulo || "").trim(),
    detalhe: String(detalhe || "").trim(),
    data: new Date().toISOString()
  });
  try {
    localStorage.setItem(chaveAtividadesDashboard(), JSON.stringify(atividades.slice(0, 12)));
  } catch (_) {}
}

function assuntoDashboardPorId(id) {
  const valor = String(id || "").toLowerCase();
  if (valor.includes("cinematica")) return "Cinemática";
  if (valor.includes("dinamica")) return "Dinâmica";
  if (valor.includes("termologia")) return "Termologia";
  if (valor.includes("optica") || valor.includes("ondulatoria")) return "Óptica e ondas";
  if (valor.includes("relatividade") || valor.includes("espaco-tempo") || valor.includes("curvatura")) return "Relatividade Especial";
  return "Outros assuntos";
}

function montarApostilasDashboard() {
  const grupos = [
    ["Cinemática", "cinematica", APOSTILAS_LOCAIS_CINEMATICA],
    ["Termologia", "termologia", APOSTILAS_LOCAIS_TERMOLOGIA],
    ["Óptica", "optica", APOSTILAS_LOCAIS_OPTICA],
    ["Ondulatória", "ondulatoria", APOSTILAS_LOCAIS_ONDULATORIA]
  ];
  return grupos.map(([label, assuntoId, mapa]) => {
    const topicos = (FISICA_UI_CONFIG.find((item) => item.id === assuntoId) || {}).topicos || [];
    const itens = topicos
      .map((topico) => ({ topico, apostila: mapa[topico.id] }))
      .filter((item) => item.apostila);
    return { label, assuntoId, itens };
  }).filter((grupo) => grupo.itens.length);
}

function criarQuestoesProva(ano, total = 5) {
  return Array.from({ length: Number(total || 5) }, (_, index) => index + 1).map((numero) => ({
    numero,
    titulo: "Questão " + numero,
    video: "",
    status: "nao-iniciada",
    ano
  }));
}

const PROVAS_PADRAO = [];

let provas = PROVAS_PADRAO.slice();
let PROVAS_RENDERIZADAS = false;
let PROVA_ATUAL_ANO = "";
let PROVAS_CARREGANDO = false;

function normalizarProvaAluno(prova) {
  const ano = String(prova && prova.ano ? prova.ano : "").trim();
  const questoesRaw = Array.isArray(prova && prova.questoes) ? prova.questoes : [];
  const total = Number((prova && prova.questoesTotal) || questoesRaw.length || 0);
  const questoes = questoesRaw.length
    ? questoesRaw.map((questao, index) => ({
        numero: Number(questao.numero || index + 1),
        titulo: questao.titulo || ("Questão " + Number(questao.numero || index + 1)),
        video: questao.video || questao.resolutionVideoUrl || questao.videoUrl || "",
        status: questao.status || "",
        ano
      }))
    : criarQuestoesProva(ano || new Date().getFullYear(), total || 0);
  return {
    id: String(prova.id || ano || "").trim(),
    ano,
    tipo: String(prova.tipo || "ENEM").trim(),
    titulo: String(prova.titulo || ("ENEM " + ano)).trim(),
    pdf: String(prova.pdfUrl || prova.pdf || "").trim() || "#",
    questoes
  };
}

async function carregarProvasPublicadas() {
  if (!window.authService || typeof window.authService.listarProvasPublicas !== "function") return;
  if (PROVAS_CARREGANDO) return;
  PROVAS_CARREGANDO = true;
  try {
    const remotas = await window.authService.listarProvasPublicas();
    const publicadas = Array.isArray(remotas) ? remotas.map(normalizarProvaAluno).filter((prova) => prova.id || prova.ano) : [];
    if (publicadas.length) provas = publicadas;
  } catch (erro) {
    console.error("Falha ao carregar provas publicadas:", erro);
  } finally {
    PROVAS_CARREGANDO = false;
  }
}

function chaveProvasConcluidas() {
  const perfil = obterPerfilAtual();
  return "universo_relativo_provas_concluidas_" + String((perfil && perfil.uid) || "anonimo");
}

function listarQuestoesConcluidasProvas() {
  try {
    return new Set(JSON.parse(localStorage.getItem(chaveProvasConcluidas()) || "[]"));
  } catch (_) {
    return new Set();
  }
}

function salvarQuestaoConcluidaProva(ano, numero) {
  const chave = ano + "-" + numero;
  const concluidas = listarQuestoesConcluidasProvas();
  concluidas.add(chave);
  try {
    localStorage.setItem(chaveProvasConcluidas(), JSON.stringify(Array.from(concluidas)));
  } catch (_) {}
}

function questaoProvaConcluida(ano, numero, status) {
  return status === "concluida" || listarQuestoesConcluidasProvas().has(ano + "-" + numero);
}

function obterProvaPorAno(ano) {
  return provas.find((prova) => String(prova.id || "") === String(ano) || String(prova.ano) === String(ano)) || null;
}

function normalizarVideoProva(url) {
  const valor = String(url || "").trim();
  if (!valor) return "";
  const embedMatch = valor.match(/youtube\.com\/embed\/([^&?/]+)/i);
  if (embedMatch && embedMatch[1]) return "https://www.youtube.com/embed/" + embedMatch[1];
  const youtubeMatch = valor.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/i);
  if (youtubeMatch && youtubeMatch[1]) return "https://www.youtube.com/embed/" + youtubeMatch[1];
  return "";
}

function normalizarLinkDownloadProva(url) {
  const valor = String(url || "").trim();
  if (!valor || valor === "#") return "";
  try {
    const parsed = new URL(valor, window.location.href);
    const host = parsed.hostname.toLowerCase();
    if (host.includes("drive.google.com")) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/i);
      const id = fileMatch && fileMatch[1] ? fileMatch[1] : parsed.searchParams.get("id");
      if (id) return "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(id);
    }
    return parsed.href;
  } catch (_) {
    return valor;
  }
}

function obterPdfProva(prova) {
  const linkCadastrado = normalizarLinkDownloadProva(prova && prova.pdf);
  if (linkCadastrado) return linkCadastrado;
  return "";
}

function nomeArquivoProva(prova) {
  const ano = String((prova && prova.ano) || "").trim();
  return ("enem-" + (ano || "prova") + ".pdf").toLowerCase();
}

function garantirModalProvaEnem() {
  let overlay = document.getElementById("provaPdfOverlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "provaPdfOverlay";
  overlay.className = "apostila-overlay d-none";
  overlay.innerHTML =
    '<div class="apostila-backdrop" data-prova-pdf-close="true"></div>' +
    '<section class="apostila-dialog" role="dialog" aria-modal="true" aria-labelledby="provaPdfTitle">' +
      '<header class="apostila-header">' +
        '<div>' +
          '<span class="apostila-eyebrow">Universo Relativo</span>' +
          '<h1 id="provaPdfTitle">Prova ENEM</h1>' +
        '</div>' +
        '<button type="button" class="apostila-close" data-prova-pdf-close="true" aria-label="Fechar prova">×</button>' +
      '</header>' +
      '<div class="apostila-content" id="provaPdfContent"></div>' +
    '</section>';
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    const alvo = event.target;
    if (!(alvo instanceof HTMLElement)) return;
    if (alvo.closest("[data-prova-pdf-close='true']")) {
      overlay.classList.add("d-none");
      document.body.classList.remove("apostila-open");
    }
  });

  return overlay;
}

function abrirLeitorProva(prova) {
  const urlPdf = obterPdfProva(prova);
  if (!urlPdf) {
    alert("Ainda não há PDF cadastrado para esta prova.");
    return;
  }

  const overlay = garantirModalProvaEnem();
  const content = overlay.querySelector("#provaPdfContent");
  const title = overlay.querySelector("#provaPdfTitle");
  const titulo = (prova && (prova.titulo || ((prova.tipo || "ENEM") + " " + prova.ano))) || "Prova ENEM";
  const urlIncorporada = obterUrlApostilaIncorporada(urlPdf);

  if (title) title.textContent = titulo;
  if (content) {
    content.innerHTML =
      '<div class="apostila-sheet">' +
        '<span class="apostila-kicker">Prova completa</span>' +
        '<h2>' + htmlEscape(titulo) + '</h2>' +
        '<p class="apostila-lead">Leia a prova sem sair da plataforma. O arquivo tamb&eacute;m pode ser aberto em nova aba.</p>' +
        '<div class="apostila-pdf-shell">' +
          '<div class="apostila-pdf-meta">' +
            '<strong>' + htmlEscape(nomeArquivoProva(prova)) + '</strong>' +
            '<span>Leitura incorporada na plataforma.</span>' +
          '</div>' +
          '<div class="apostila-pdf-frame">' +
            '<iframe src="' + htmlEscape(urlIncorporada) + '" title="' + htmlEscape(titulo) + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
          '</div>' +
        '</div>' +
        '<div class="apostila-actions">' +
          '<a class="apostila-open-link" href="' + htmlEscape(urlPdf) + '" target="_blank" rel="noopener noreferrer">Abrir em nova aba</a>' +
        '</div>' +
      '</div>';
  }

  overlay.classList.remove("d-none");
  document.body.classList.add("apostila-open");
  registrarAtividadeDashboard("prova", "Abriu a prova", titulo);
}

function renderizarCardProva(prova, indice) {
  const chave = prova.id || prova.ano;
  const resolvidas = (prova.questoes || []).filter((questao) => String(questao.video || "").trim()).length;
  return '' +
    '<article class="card-prova" data-prova-ano="' + htmlEscape(chave) + '">' +
      '<span class="card-prova-label">' + htmlEscape(prova.tipo || "ENEM") + '</span>' +
      '<strong>' + htmlEscape(prova.ano || prova.titulo) + '</strong>' +
      '<small>' + resolvidas + '/' + (prova.questoes || []).length + ' resoluções</small>' +
    '</article>';
}

function renderizarProvasLista() {
  const grid = document.getElementById("provasGrid");
  if (!grid) return;
  if (!provas.length) {
    grid.innerHTML = '<div class="provas-empty-state"><strong>Nenhuma prova cadastrada</strong><span>As provas publicadas no painel administrativo aparecem aqui para o aluno.</span></div>';
    return;
  }
  grid.innerHTML = provas.map((prova, indice) => renderizarCardProva(prova, indice)).join("");
  atualizarIconesLucide(grid);
}

function renderizarQuestaoProva(prova, questao) {
  const numero = String(questao.numero).padStart(2, "0");
  const concluida = questaoProvaConcluida(prova.ano, questao.numero, questao.status);
  const statusTexto = concluida ? "Concluída" : "Ainda não iniciada";
  const statusClasse = concluida ? "is-done" : "is-pending";
  const videoUrl = String(questao.video || "").trim();
  const videoEmbed = normalizarVideoProva(questao.video);
  const videoHtml = videoEmbed
    ? '<div class="prova-video-frame"><iframe src="' + htmlEscape(videoEmbed) + '" title="' + htmlEscape("Resolução da questão " + questao.numero) + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>'
    : videoUrl
      ? '<div class="prova-video-empty"><strong>Resolução cadastrada</strong><span>Este link abre fora do player da plataforma.</span><a class="btn btn-primary" href="' + htmlEscape(videoUrl) + '" target="_blank" rel="noopener noreferrer">Abrir resolução</a></div>'
      : '<div class="prova-video-empty"><strong>Resolução ainda não cadastrada</strong><span>Quando o link for adicionado no painel administrativo, ele aparecerá aqui.</span></div>';

  return '' +
    '<article class="card-questao ' + statusClasse + '" data-prova-questao="' + htmlEscape(questao.numero) + '">' +
      '<div class="card-questao-main">' +
        '<span class="card-questao-numero">' + numero + '</span>' +
        '<div class="card-questao-copy">' +
          '<h4>' + htmlEscape(questao.titulo) + '</h4>' +
          '<p class="card-questao-status"><span></span>' + statusTexto + '</p>' +
        '</div>' +
        '<button type="button" class="card-questao-btn" data-prova-video="' + htmlEscape(questao.numero) + '">' + (videoUrl ? "Ver resolução" : "Aguardando resolução") + '</button>' +
      '</div>' +
      '<div class="prova-video-panel" aria-hidden="true">' +
        '<div class="prova-video-panel-head"><strong>Resolução em vídeo</strong><button type="button" data-prova-video-close="' + htmlEscape(questao.numero) + '" aria-label="Fechar vídeo">×</button></div>' +
        videoHtml +
      '</div>' +
    '</article>';
}

function mostrarTelaProvas(tipo) {
  const lista = document.getElementById("provasListScreen");
  const detalhe = document.getElementById("provasDetailScreen");
  if (!lista || !detalhe) return;
  lista.classList.toggle("active", tipo === "lista");
  detalhe.classList.toggle("active", tipo === "detalhe");
}

function abrirProva(ano) {
  const prova = obterProvaPorAno(ano);
  if (!prova) return;
  PROVA_ATUAL_ANO = String(prova.ano);
  salvarProvaAluno(PROVA_ATUAL_ANO);

  const titulo = document.getElementById("provaDetalheTitulo");
  const breadcrumbAno = document.getElementById("provasBreadcrumbAno");
  const pdfBtn = document.getElementById("provaPdfBtn");
  const total = document.getElementById("provaQuestoesTotal");
  const lista = document.getElementById("provaQuestoesList");

  if (titulo) titulo.textContent = prova.titulo || ((prova.tipo || "ENEM") + " " + prova.ano);
  if (breadcrumbAno) breadcrumbAno.textContent = String(prova.ano);
  if (pdfBtn) {
    const pdfDownload = obterPdfProva(prova);
    const semPdf = !pdfDownload;
    pdfBtn.href = semPdf ? "#" : pdfDownload;
    pdfBtn.download = semPdf ? "" : nomeArquivoProva(prova);
    pdfBtn.classList.toggle("is-disabled", semPdf);
    pdfBtn.setAttribute("aria-disabled", semPdf ? "true" : "false");
    pdfBtn.setAttribute("target", "_blank");
    pdfBtn.setAttribute("rel", "noopener noreferrer");
    pdfBtn.innerHTML = '<i data-lucide="book-open" class="icon"></i>' + (semPdf ? "PDF indisponível" : "Ler prova");
  }
  if (total) total.textContent = prova.questoes.length + " questões";
  if (lista) lista.innerHTML = prova.questoes.map((questao) => renderizarQuestaoProva(prova, questao)).join("");

  mostrarTelaProvas("detalhe");
  atualizarIconesLucide(document.getElementById("provasDetailScreen"));
}

function alternarResolucaoProva(numero, abrir) {
  const prova = obterProvaPorAno(PROVA_ATUAL_ANO);
  if (!prova) return;
  const card = document.querySelector('.card-questao[data-prova-questao="' + String(numero) + '"]');
  if (!card) return;
  const deveAbrir = typeof abrir === "boolean" ? abrir : !card.classList.contains("is-open");
  document.querySelectorAll(".card-questao.is-open").forEach((item) => {
    if (item !== card) item.classList.remove("is-open");
  });
  card.classList.toggle("is-open", deveAbrir);
  const panel = card.querySelector(".prova-video-panel");
  if (panel) panel.setAttribute("aria-hidden", deveAbrir ? "false" : "true");
  if (deveAbrir) {
    salvarQuestaoConcluidaProva(prova.ano, numero);
    const status = card.querySelector(".card-questao-status");
    if (status) status.innerHTML = "<span></span>Concluída";
    card.classList.remove("is-pending");
    card.classList.add("is-done");
  }
}

async function iniciarProvas() {
  if (!PROVAS_RENDERIZADAS) {
    renderizarProvasLista();
    PROVAS_RENDERIZADAS = true;
  }
  await carregarProvasPublicadas();
  if (PROVA_ATUAL_ANO && !obterProvaPorAno(PROVA_ATUAL_ANO)) {
    PROVA_ATUAL_ANO = "";
    salvarProvaAluno("");
  }
  if (!PROVA_ATUAL_ANO) {
    const provaSalva = obterProvaAlunoSalva();
    if (provaSalva && obterProvaPorAno(provaSalva)) PROVA_ATUAL_ANO = provaSalva;
  }
  renderizarProvasLista();
  if (PROVA_ATUAL_ANO) {
    abrirProva(PROVA_ATUAL_ANO);
    return;
  }
  mostrarTelaProvas(PROVA_ATUAL_ANO ? "detalhe" : "lista");
}

document.addEventListener("click", (event) => {
  const pdfProvaBtn = event.target.closest("#provaPdfBtn");
  if (pdfProvaBtn) {
    event.preventDefault();
    const prova = obterProvaPorAno(PROVA_ATUAL_ANO);
    if (!prova || pdfProvaBtn.classList.contains("is-disabled")) {
      alert("Ainda não há PDF cadastrado para esta prova.");
      return;
    }
    abrirLeitorProva(prova);
    return;
  }

  const provaBtn = event.target.closest("[data-prova-ano]");
  if (provaBtn) {
    event.preventDefault();
    abrirProva(provaBtn.getAttribute("data-prova-ano"));
    return;
  }

  if (event.target.closest("[data-provas-back]")) {
    event.preventDefault();
    PROVA_ATUAL_ANO = "";
    salvarProvaAluno("");
    mostrarTelaProvas("lista");
    return;
  }

  const videoBtn = event.target.closest("[data-prova-video]");
  if (videoBtn) {
    event.preventDefault();
    alternarResolucaoProva(videoBtn.getAttribute("data-prova-video"), true);
    return;
  }

  const closeBtn = event.target.closest("[data-prova-video-close]");
  if (closeBtn) {
    event.preventDefault();
    alternarResolucaoProva(closeBtn.getAttribute("data-prova-video-close"), false);
  }
});

function atualizarLinkAtivo(secao) {
  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    const alvo = link.getAttribute("onclick") || "";
    link.classList.toggle("active", alvo.includes("'" + secao + "'"));
  });
}

function navegarParaSecao(secao, event) {
  if (event) event.preventDefault();
  const atual = document.querySelector(".secao-conteudo.active");
  const proxima = document.getElementById("secao-" + secao);
  if (proxima) salvarSecaoAluno(secao);

  const atualizarInicio = () => {
    if (secao !== "inicio") return;
    if (window.authService && typeof window.authService.recarregarPerfilAtual === "function") {
      window.authService.recarregarPerfilAtual()
        .then((perfil) => {
          if (perfil) ESTADO_ALUNO.perfil = perfil;
          iniciarDashboard();
        })
        .catch(() => iniciarDashboard());
      return;
    }
    iniciarDashboard();
  };

  if (!proxima) return;
  transicionarPainel(atual, proxima, {
    seletorItens: ".dashboard-hero, .dashboard-stat-card, .dashboard-panel, .dashboard-shortcut-card, .fisica-topic-card, .study-module, .quiz-shell, .relatividade-hero, .relatividade-toolbar, .relatividade-layout, .provas-hero, .card-prova, .prova-detail-hero, .card-questao",
    antesDeEntrar: () => {
      if (secao === "questoes") {
        void garantirQuestoesInicializadas();
      }
      if (secao === "flashcards") {
        void iniciarFlashcards();
      }
      if (secao === "provas") {
        iniciarProvas();
      }
      if (secao === "programacao") mostrarTelaFisica("topics");
      if (typeof window.atualizarBotaoContinuarFocusRelatividade === "function") {
        window.setTimeout(window.atualizarBotaoContinuarFocusRelatividade, 0);
      }
      atualizarLinkAtivo(secao);
      atualizarInicio();
    }
  });
}

async function iniciarDashboard() {
  const dashboardGreeting = document.getElementById("dashboardGreeting");
  const lessonList = document.getElementById("lessonDisciplineList");
  const statsQuestoesRespondidas = document.getElementById("statsQuestoesRespondidas");
  const statsAproveitamento = document.getElementById("statsAproveitamento");
  const statsHoras = document.getElementById("statsHoras");
  const statsAulasConcluidas = document.getElementById("statsAulasConcluidas");
  const activityList = document.getElementById("dashboardActivityList");
  const apostilasList = document.getElementById("dashboardApostilasList");
  const focusDone = document.getElementById("dashboardFocusDone");
  const focusBar = document.getElementById("dashboardFocusBar");

  if (!dashboardGreeting || !lessonList) return;

  const perfilAtual = obterPerfilAtual() || {};
  const nomeAluno = (perfilAtual.nome || perfilAtual.matricula || "Aluno").trim();
  if (dashboardGreeting) {
    dashboardGreeting.textContent = obterSaudacaoDashboard() + ", " + nomeAluno + "!";
  }

  const resumo = obterResumoProgresso();
  const horasEstimadas = (resumo.sessoesConcluidas * 0.5).toFixed(1);

  if (statsQuestoesRespondidas) statsQuestoesRespondidas.textContent = String(resumo.questoesRespondidas);
  if (statsAproveitamento) statsAproveitamento.textContent = resumo.aproveitamento + "%";
  if (statsHoras) statsHoras.textContent = horasEstimadas.replace(".0", "") + "h";
  if (statsAulasConcluidas) statsAulasConcluidas.textContent = String(resumo.aulasConcluidas || 0);
  if (focusDone) focusDone.textContent = String(Math.min(resumo.questoesRespondidas, 20));
  if (focusBar) focusBar.style.width = Math.min(100, Math.round((resumo.questoesRespondidas / 20) * 100)) + "%";

  let historicoQuestoes = [];
  const perfilUid = perfilAtual && perfilAtual.uid ? perfilAtual.uid : "";
  if (perfilUid && window.authService && typeof window.authService.listarHistoricoQuestoesAluno === "function") {
    try {
      historicoQuestoes = await window.authService.listarHistoricoQuestoesAluno(perfilUid);
    } catch (erro) {
      console.error("Falha ao carregar atividades da dashboard:", erro);
    }
  }

  const contagemPorMateria = new Map();
  historicoQuestoes.filter((item) => item && item.ativo !== false && item.resolvida === true).forEach((item) => {
    const materia = assuntoDashboardPorId(item.assuntoId || item.subassuntoId || item.disciplinaId);
    contagemPorMateria.set(materia, (contagemPorMateria.get(materia) || 0) + 1);
  });

  const materias = ["Cinemática", "Dinâmica", "Termologia", "Óptica e ondas", "Relatividade Especial"];
  lessonList.innerHTML = materias.map((materia) => {
    const questoes = contagemPorMateria.get(materia) || 0;
    const aulas = Number((perfilAtual.progressoPorMateria && perfilAtual.progressoPorMateria[materia] && perfilAtual.progressoPorMateria[materia].aulasConcluidas) || 0);
    const percentual = Math.max(0, Math.min(100, Math.round(Math.min(questoes, 20) * 3.5 + Math.min(aulas, 2) * 15)));
    return '<div class="dashboard-discipline-item"><div class="dashboard-discipline-top"><span><span class="dashboard-matter-icon icon-box">' + renderizarIconeLucide(materia) + '</span>' + htmlEscape(materia) + '</span><strong>' + percentual + '%</strong></div><div class="dashboard-bar"><div style="width:' + percentual + '%;"></div></div><small>' + questoes + ' quest&otilde;es respondidas' + (aulas ? ' + ' + aulas + ' aulas conclu&iacute;das' : '') + '</small></div>';
  }).join("");

  const atividadesQuestoes = historicoQuestoes
    .filter((item) => item && item.ativo !== false && item.resolvida === true)
    .map((item) => ({
      tipo: item.acertou ? "questao-certa" : "questao",
      titulo: item.acertou ? "Acertou uma questão" : "Respondeu uma questão",
      detalhe: assuntoDashboardPorId(item.assuntoId || item.subassuntoId || item.disciplinaId),
      data: item.dataTentativaCliente || item.dataConclusaoCliente || item.criadoEm || ""
    }));
  const atividades = [...listarAtividadesLocaisDashboard(), ...atividadesQuestoes]
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))
    .slice(0, 6);

  if (activityList) {
    activityList.innerHTML = atividades.length
      ? atividades.map((item) => '<div class="dashboard-activity-item"><span class="activity-icon icon-box activity-' + htmlEscape(item.tipo) + '">' + renderizarIconeLucide(item.tipo) + '</span><div><small>' + htmlEscape(item.titulo) + '</small><strong>' + htmlEscape(item.detalhe || "Universo Relativo") + '</strong></div></div>').join("")
      : "";
  }

  if (apostilasList) {
    apostilasList.innerHTML = montarApostilasDashboard().map((grupo) => (
      '<section class="dashboard-apostila-group"><h4>' + htmlEscape(grupo.label) + '</h4>' +
      grupo.itens.map(({ topico, apostila }) => (
        '<button type="button" data-apostila-disciplina="fisica-basica" data-apostila-assunto="' + htmlEscape(grupo.assuntoId) + '" data-apostila-subassunto="' + htmlEscape(topico.id) + '" data-apostila-url="' + htmlEscape(apostila.url) + '" data-apostila-nome="' + htmlEscape(apostila.nome) + '">' + htmlEscape(topico.titulo) + '</button>'
      )).join("") +
      '</section>'
    )).join("");
    vincularBotoesApostila(apostilasList);
  }

  atualizarIconesLucide();
}

const FLASHCARD_FILTROS = ["Todos", ...FISICA_UI_CONFIG.map((item) => item.titulo)];
const ESTADO_FLASHCARDS = {
  carregado: false,
  carregando: false,
  cards: [],
  progresso: new Map(),
  filtro: "Todos",
  ordenacao: "revisao",
  atualId: "",
  versoVisivel: false
};

function normalizarTextoComparacao(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function materiaFlashcard(card) {
  const materia = String(card && card.materia ? card.materia : "").trim();
  const normalizada = normalizarTextoComparacao(materia);
  const assuntoFisica = FISICA_UI_CONFIG.find((item) => normalizarTextoComparacao(item.titulo) === normalizada);
  if (assuntoFisica) return assuntoFisica.titulo;
  if (normalizada.includes("cinematica")) return "Cinemática";
  if (normalizada.includes("dinamica") && !normalizada.includes("hidro")) return "Dinâmica";
  if (normalizada.includes("gravit")) return "Gravitação";
  if (normalizada.includes("estatica") && !normalizada.includes("hidro") && !normalizada.includes("eletro")) return "Estática";
  if (normalizada.includes("hidrostatica")) return "Hidrostática";
  if (normalizada.includes("hidrodinamica")) return "Hidrodinâmica";
  if (normalizada.includes("termo")) return "Termologia";
  if (normalizada.includes("ondulatoria") || normalizada.includes("onda")) return "Ondulatória";
  if (normalizada.includes("optica")) return "Óptica";
  if (normalizada.includes("eletrostatica")) return "Eletrostática";
  if (normalizada.includes("eletrodinamica")) return "Eletrodinâmica";
  if (normalizada.includes("eletromag")) return "Eletromagnetismo";
  return materia || "Cinemática";
}

function renderizarControlesMateriaFlashcards() {
  const filtros = document.getElementById("flashcardsFiltros");
  const materiaSelect = document.getElementById("flashcardCreateMateria");
  if (filtros && !filtros.dataset.renderedFromFisica) {
    filtros.innerHTML = FLASHCARD_FILTROS.map((materia, indice) => (
      '<button type="button" class="' + (indice === 0 ? "active" : "") + '" data-flash-filter="' + htmlEscape(materia) + '">' + htmlEscape(materia) + '</button>'
    )).join("");
    filtros.dataset.renderedFromFisica = "true";
  }
  if (materiaSelect && !materiaSelect.dataset.renderedFromFisica) {
    materiaSelect.innerHTML = '<option value="">Escolha a matéria</option>' +
      FISICA_UI_CONFIG.map((item) => '<option value="' + htmlEscape(item.titulo) + '">' + htmlEscape(item.titulo) + '</option>').join("");
    materiaSelect.dataset.renderedFromFisica = "true";
  }
}

function obterPerfilFlashcards() {
  const perfil = obterPerfilAtual();
  return perfil && perfil.uid ? perfil : null;
}

function obterCardsFiltradosFlashcards() {
  const filtro = ESTADO_FLASHCARDS.filtro;
  const cards = ESTADO_FLASHCARDS.cards.filter((card) => filtro === "Todos" || materiaFlashcard(card) === filtro);
  const comPrioridade = cards.map((card) => {
    const progresso = ESTADO_FLASHCARDS.progresso.get(card.id);
    const status = progresso ? progresso.status : "";
    const dominio = progresso ? Number(progresso.dominio || 0) : 0;
    const data = progresso ? String(progresso.ultimaRevisaoCliente || "") : "";
    const prioridade = !progresso
      ? 100
      : status === "nao_lembrei"
        ? 90
        : status === "mais_ou_menos"
          ? 60
          : Math.max(10, 45 - dominio * 8);
    return { card, progresso, prioridade, data };
  });

  if (ESTADO_FLASHCARDS.ordenacao === "recentes") {
    comPrioridade.sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")) || a.card.pergunta.localeCompare(b.card.pergunta));
  } else if (ESTADO_FLASHCARDS.ordenacao === "materia") {
    comPrioridade.sort((a, b) => materiaFlashcard(a.card).localeCompare(materiaFlashcard(b.card)) || a.card.assunto.localeCompare(b.card.assunto));
  } else {
    comPrioridade.sort((a, b) => b.prioridade - a.prioridade || String(a.data || "").localeCompare(String(b.data || "")) || a.card.pergunta.localeCompare(b.card.pergunta));
  }
  return comPrioridade.map((item) => item.card);
}

function calcularResumoFlashcards() {
  const progresso = Array.from(ESTADO_FLASHCARDS.progresso.values());
  const acertos = progresso.reduce((total, item) => total + Number(item.acertos || 0), 0);
  const erros = progresso.reduce((total, item) => total + Number(item.erros || 0), 0);
  const parciais = progresso.reduce((total, item) => total + Number(item.parciais || 0), 0);
  const totalRespostas = acertos + erros + parciais;
  const estudados = progresso.filter((item) => Number(item.tentativas || 0) > 0 || item.status).length;
  return {
    disponiveis: ESTADO_FLASHCARDS.cards.length,
    estudados,
    acertos,
    erros,
    parciais,
    taxa: totalRespostas ? Math.round((acertos / totalRespostas) * 100) : 0
  };
}

function renderizarResumoFlashcards() {
  const resumo = calcularResumoFlashcards();
  const setTexto = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };
  setTexto("flashcardsTotalDisponiveis", String(resumo.disponiveis));
  setTexto("flashcardsTotalEstudados", String(resumo.estudados));
  setTexto("flashcardsTaxaAcertosTopo", resumo.taxa + "%");
  setTexto("flashcardsTaxaAcertos", resumo.taxa + "%");
  setTexto("flashcardsAcertos", String(resumo.acertos));
  setTexto("flashcardsErros", String(resumo.erros));
  setTexto("flashcardsParciais", String(resumo.parciais));

  const ring = document.getElementById("flashProgressRing");
  if (ring) ring.style.setProperty("--flash-progress", Math.round((resumo.taxa / 100) * 360) + "deg");

  const materiasResumo = document.getElementById("flashcardsMateriasResumo");
  if (materiasResumo) {
    const contagem = new Map();
    ESTADO_FLASHCARDS.cards.forEach((card) => {
      const materia = materiaFlashcard(card);
      contagem.set(materia, (contagem.get(materia) || 0) + 1);
    });
    const materias = FLASHCARD_FILTROS.filter((item) => item !== "Todos");
    materiasResumo.innerHTML = materias.map((materia) => (
      '<button type="button" data-flash-filter-short="' + htmlEscape(materia) + '">' +
        '<span>' + htmlEscape(materia) + '</span><strong>' + (contagem.get(materia) || 0) + ' cards</strong>' +
      '</button>'
    )).join("");
  }
}

function renderizarRecentesFlashcards() {
  const recentesEl = document.getElementById("flashcardsRecentes");
  const totalEl = document.getElementById("flashcardsRecentesTotal");
  if (!recentesEl) return;

  const cardsPorId = new Map(ESTADO_FLASHCARDS.cards.map((card) => [card.id, card]));
  const recentes = Array.from(ESTADO_FLASHCARDS.progresso.values())
    .filter((item) => item.flashcardId && cardsPorId.has(item.flashcardId))
    .sort((a, b) => String(b.ultimaRevisaoCliente || "").localeCompare(String(a.ultimaRevisaoCliente || "")))
    .slice(0, 4);
  if (totalEl) totalEl.textContent = recentes.length + (recentes.length === 1 ? " registro" : " registros");

  recentesEl.innerHTML = recentes.length
    ? recentes.map((item) => {
      const card = cardsPorId.get(item.flashcardId);
      const ok = item.status === "lembrei";
      const mid = item.status === "mais_ou_menos";
      return '<button type="button" data-flash-open="' + htmlEscape(card.id) + '">' +
        '<span class="flash-recent-icon icon-box">' + renderizarIconeLucide(materiaFlashcard(card)) + '</span><div><strong>' + htmlEscape(card.assunto || card.pergunta) + '</strong><small>' + htmlEscape(materiaFlashcard(card)) + '</small></div><span class="flash-recent-status ' + (ok ? "recent-good" : mid ? "recent-mid" : "recent-bad") + '">' + renderizarIconeLucide(ok ? "check" : mid ? "progresso" : "questoes") + '</span>' +
      '</button>';
    }).join("")
    : '<p class="flashcards-empty-recent">Nenhum flash card estudado ainda.</p>';
}

function renderizarCardAtualFlashcards() {
  const perguntaEl = document.getElementById("flashcardPergunta");
  const respostaEl = document.getElementById("flashcardResposta");
  const metaFrenteEl = document.getElementById("flashcardMetaFrente");
  const metaVersoEl = document.getElementById("flashcardMetaVerso");
  const backPanel = document.getElementById("flashcardBackPanel");
  const grid = document.getElementById("flashcardsCardGrid");
  const actions = document.getElementById("flashcardActions");
  const message = document.getElementById("flashcardsMessage");
  const cards = obterCardsFiltradosFlashcards();

  if (!ESTADO_FLASHCARDS.atualId || !cards.some((card) => card.id === ESTADO_FLASHCARDS.atualId)) {
    ESTADO_FLASHCARDS.atualId = cards.length ? cards[0].id : "";
    ESTADO_FLASHCARDS.versoVisivel = false;
  }

  const card = ESTADO_FLASHCARDS.cards.find((item) => item.id === ESTADO_FLASHCARDS.atualId);
  if (!card) {
    if (perguntaEl) perguntaEl.textContent = ESTADO_FLASHCARDS.carregando ? "Carregando flash cards..." : "Nenhum flash card encontrado";
    if (respostaEl) respostaEl.textContent = "Cadastre flash cards na coleção flashcards do Firebase para que eles apareçam aqui.";
    if (metaFrenteEl) metaFrenteEl.textContent = "Sem dados disponíveis";
    if (metaVersoEl) metaVersoEl.textContent = "Firebase";
    if (grid) grid.classList.remove("is-flipped");
    if (backPanel) backPanel.classList.remove("is-visible");
    if (actions) actions.querySelectorAll("button").forEach((btn) => { btn.disabled = true; });
    if (message) {
      message.textContent = ESTADO_FLASHCARDS.carregando ? "Buscando seus flash cards no Firebase..." : "Nenhum card disponível para este filtro.";
      message.classList.remove("d-none");
    }
    return;
  }

  const progresso = ESTADO_FLASHCARDS.progresso.get(card.id);
  if (perguntaEl) perguntaEl.textContent = card.pergunta;
  if (respostaEl) respostaEl.textContent = ESTADO_FLASHCARDS.versoVisivel ? card.resposta : "Clique no botão central para revelar a resposta.";
  if (metaFrenteEl) metaFrenteEl.textContent = materiaFlashcard(card) + (card.assunto ? " • " + card.assunto : "");
  if (metaVersoEl) metaVersoEl.textContent = progresso && progresso.status ? "Domínio " + Number(progresso.dominio || 0) + "/5" : "Primeira revisão";
  if (grid) grid.classList.toggle("is-flipped", ESTADO_FLASHCARDS.versoVisivel);
  if (backPanel) backPanel.classList.toggle("is-visible", ESTADO_FLASHCARDS.versoVisivel);
  if (actions) actions.querySelectorAll("button").forEach((btn) => { btn.disabled = !ESTADO_FLASHCARDS.versoVisivel; });
  if (message) message.classList.add("d-none");
}

function renderizarFlashcards() {
  renderizarResumoFlashcards();
  renderizarCardAtualFlashcards();
  renderizarRecentesFlashcards();
  atualizarIconesLucide();
}

function abrirModalFlashcard() {
  const modal = document.getElementById("flashcardModal");
  const feedback = document.getElementById("flashcardCreateFeedback");
  if (!modal) return;
  if (feedback) feedback.classList.add("d-none");
  modal.classList.remove("d-none");
  modal.setAttribute("aria-hidden", "false");
  const materia = document.getElementById("flashcardCreateMateria");
  if (materia) materia.focus();
}

function fecharModalFlashcard() {
  const modal = document.getElementById("flashcardModal");
  if (!modal) return;
  modal.classList.add("d-none");
  modal.setAttribute("aria-hidden", "true");
}

function mostrarFeedbackCriacaoFlashcard(texto, tipo = "info") {
  const feedback = document.getElementById("flashcardCreateFeedback");
  if (!feedback) return;
  feedback.textContent = texto;
  feedback.dataset.tipo = tipo;
  feedback.classList.remove("d-none");
}

async function criarFlashcardAlunoAtual(event) {
  if (event) event.preventDefault();
  const perfil = obterPerfilFlashcards();
  const form = document.getElementById("flashcardCreateForm");
  const materia = document.getElementById("flashcardCreateMateria");
  const assunto = document.getElementById("flashcardCreateAssunto");
  const pergunta = document.getElementById("flashcardCreatePergunta");
  const resposta = document.getElementById("flashcardCreateResposta");
  const submit = form ? form.querySelector('button[type="submit"]') : null;

  if (!perfil || !window.authService || typeof window.authService.criarFlashcardAluno !== "function") {
    mostrarFeedbackCriacaoFlashcard("Entre como aluno para salvar seus flash cards.", "erro");
    return;
  }

  const dados = {
    materia: materia ? materia.value : "",
    assunto: assunto ? assunto.value : "",
    pergunta: pergunta ? pergunta.value : "",
    resposta: resposta ? resposta.value : ""
  };

  try {
    if (submit) submit.disabled = true;
    const novoCard = await window.authService.criarFlashcardAluno(perfil.uid, dados);
    ESTADO_FLASHCARDS.cards = [novoCard, ...ESTADO_FLASHCARDS.cards.filter((card) => card.id !== novoCard.id)];
    ESTADO_FLASHCARDS.filtro = materiaFlashcard(novoCard);
    ESTADO_FLASHCARDS.atualId = novoCard.id;
    ESTADO_FLASHCARDS.versoVisivel = false;
    ESTADO_FLASHCARDS.carregado = true;
    if (form) form.reset();
    fecharModalFlashcard();
    const filtroBtn = document.querySelector('#flashcardsFiltros [data-flash-filter="' + ESTADO_FLASHCARDS.filtro + '"]');
    if (filtroBtn) {
      document.querySelectorAll("#flashcardsFiltros button").forEach((btn) => btn.classList.toggle("active", btn === filtroBtn));
    }
    renderizarFlashcards();
  } catch (erro) {
    console.error("Falha ao criar flash card:", erro);
    mostrarFeedbackCriacaoFlashcard(erro && erro.message ? erro.message : "Não foi possível salvar o flash card.", "erro");
  } finally {
    if (submit) submit.disabled = false;
  }
}

async function carregarFlashcardsFirebase() {
  const perfil = obterPerfilFlashcards();
  if (!perfil || !window.authService) return;
  ESTADO_FLASHCARDS.carregando = true;
  renderizarFlashcards();
  try {
    const [cards, progresso] = await Promise.all([
      typeof window.authService.listarFlashcards === "function" ? window.authService.listarFlashcards(perfil.uid) : Promise.resolve([]),
      typeof window.authService.listarProgressoFlashcardsAluno === "function" ? window.authService.listarProgressoFlashcardsAluno(perfil.uid) : Promise.resolve([])
    ]);
    ESTADO_FLASHCARDS.cards = Array.isArray(cards) ? cards : [];
    ESTADO_FLASHCARDS.progresso = new Map((Array.isArray(progresso) ? progresso : []).map((item) => [item.flashcardId, item]));
    ESTADO_FLASHCARDS.carregado = true;
  } catch (erro) {
    console.error("Falha ao carregar flash cards:", erro);
    const message = document.getElementById("flashcardsMessage");
    if (message) {
      message.textContent = "Não foi possível carregar os flash cards do Firebase agora.";
      message.classList.remove("d-none");
    }
  } finally {
    ESTADO_FLASHCARDS.carregando = false;
    renderizarFlashcards();
  }
}

async function salvarRespostaFlashcard(status) {
  const perfil = obterPerfilFlashcards();
  const card = ESTADO_FLASHCARDS.cards.find((item) => item.id === ESTADO_FLASHCARDS.atualId);
  const message = document.getElementById("flashcardsMessage");
  if (!perfil || !card || !window.authService || typeof window.authService.salvarRespostaFlashcardAluno !== "function") return;
  if (!ESTADO_FLASHCARDS.versoVisivel) {
    if (message) {
      message.textContent = "Veja o verso antes de registrar sua resposta.";
      message.classList.remove("d-none");
    }
    return;
  }

  try {
    const registro = await window.authService.salvarRespostaFlashcardAluno(perfil.uid, {
      flashcardId: card.id,
      status,
      materia: materiaFlashcard(card),
      assunto: card.assunto || ""
    });
    ESTADO_FLASHCARDS.progresso.set(card.id, registro);
    const proximo = obterCardsFiltradosFlashcards().find((item) => item.id !== card.id);
    if (proximo) {
      ESTADO_FLASHCARDS.atualId = proximo.id;
      ESTADO_FLASHCARDS.versoVisivel = false;
    }
    if (message) {
      message.textContent = "Resposta salva. Próximo card preparado pela prioridade de revisão.";
      message.classList.remove("d-none");
    }
    renderizarFlashcards();
  } catch (erro) {
    console.error("Falha ao salvar resposta do flash card:", erro);
    if (message) {
      message.textContent = "Não foi possível salvar sua resposta no Firebase.";
      message.classList.remove("d-none");
    }
  }
}

function vincularFlashcards() {
  renderizarControlesMateriaFlashcards();
  if (ESTADO_FLASHCARDS.eventosVinculados) return;
  ESTADO_FLASHCARDS.eventosVinculados = true;
  const filtros = document.getElementById("flashcardsFiltros");
  const ordenacao = document.getElementById("flashcardsOrdenacao");
  const flipBtn = document.getElementById("flashcardFlipBtn");
  const actions = document.getElementById("flashcardActions");
  const materiasResumo = document.getElementById("flashcardsMateriasResumo");
  const recentes = document.getElementById("flashcardsRecentes");
  const createBtn = document.getElementById("flashcardsCreateBtn");
  const modal = document.getElementById("flashcardModal");
  const form = document.getElementById("flashcardCreateForm");

  if (filtros) {
    filtros.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-flash-filter]");
      if (!btn) return;
      ESTADO_FLASHCARDS.filtro = btn.getAttribute("data-flash-filter") || "Todos";
      ESTADO_FLASHCARDS.atualId = "";
      ESTADO_FLASHCARDS.versoVisivel = false;
      filtros.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === btn));
      renderizarFlashcards();
    });
  }

  if (ordenacao) {
    ordenacao.addEventListener("change", () => {
      ESTADO_FLASHCARDS.ordenacao = ordenacao.value || "revisao";
      ESTADO_FLASHCARDS.atualId = "";
      ESTADO_FLASHCARDS.versoVisivel = false;
      renderizarFlashcards();
    });
  }

  if (flipBtn) {
    flipBtn.addEventListener("click", () => {
      if (!ESTADO_FLASHCARDS.atualId) return;
      ESTADO_FLASHCARDS.versoVisivel = !ESTADO_FLASHCARDS.versoVisivel;
      renderizarCardAtualFlashcards();
    });
  }

  if (actions) {
    actions.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-flash-status]");
      if (!btn || btn.disabled) return;
      void salvarRespostaFlashcard(btn.getAttribute("data-flash-status"));
    });
  }

  if (materiasResumo) {
    materiasResumo.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-flash-filter-short]");
      if (!btn) return;
      const filtro = btn.getAttribute("data-flash-filter-short") || "Todos";
      const filtroBtn = document.querySelector('#flashcardsFiltros [data-flash-filter="' + filtro + '"]');
      if (filtroBtn) filtroBtn.click();
    });
  }

  if (recentes) {
    recentes.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-flash-open]");
      if (!btn) return;
      ESTADO_FLASHCARDS.atualId = btn.getAttribute("data-flash-open") || "";
      ESTADO_FLASHCARDS.versoVisivel = true;
      renderizarCardAtualFlashcards();
    });
  }

  if (createBtn) {
    createBtn.addEventListener("click", abrirModalFlashcard);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-flashcard-modal-close='true']")) {
        fecharModalFlashcard();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", criarFlashcardAlunoAtual);
  }
}

async function iniciarFlashcards() {
  vincularFlashcards();
  if (!ESTADO_FLASHCARDS.carregado && !ESTADO_FLASHCARDS.carregando) {
    await carregarFlashcardsFirebase();
    return;
  }
  renderizarFlashcards();
}

async function iniciarQuestoes() {
  const banco = await carregarBancoQuestoesGerenciado();
  const disciplinas = banco.disciplinas || {};
  const disciplinaSelect = document.getElementById("disciplinaSelect");
  const assuntoSelect = document.getElementById("assuntoSelect");
  const subassuntoSelect = document.getElementById("subassuntoSelect");
  const downloadPdfBtn = document.getElementById("btnBaixarPdfQuiz");
  const aviso = document.getElementById("questoesAviso");
  const config = document.getElementById("quizConfig");
  const container = document.getElementById("quizContainer");
  const questoesHero = document.getElementById("questoesHero");
  const tema = document.getElementById("quizTema");
  const fonte = document.getElementById("quizSourceMeta");
  const codigo = document.getElementById("quizQuestionCode");
  const score = document.getElementById("quizScore");
  const counter = document.getElementById("quizCounter");
  const question = document.getElementById("quizQuestion");
  const figure = document.getElementById("quizFigure");
  const figureImage = document.getElementById("quizFigureImage");
  const figureCaption = document.getElementById("quizFigureCaption");
  const options = document.getElementById("quizOptions");
  const feedback = document.getElementById("quizFeedback");
  const resolutionBtn = document.getElementById("quizResolutionBtn");
  const resolutionBox = document.getElementById("quizResolutionBox");
  const videoResolutionBtn = document.getElementById("quizVideoResolutionBtn");
  const videoResolutionBox = document.getElementById("quizVideoResolutionBox");
  const restartBtn = document.getElementById("quizRestartBtn");
  const resetBtn = document.getElementById("quizResetBtn");
  const answerBtn = document.getElementById("quizAnswerBtn");
  const prevBtn = document.getElementById("quizPrevBtn");
  const advanceBtn = document.getElementById("quizAdvanceBtn");
  const progressBar = document.getElementById("quizProgressBar");
  const startBtn = document.getElementById("btnIniciarQuiz");
  const bancaFilter = document.getElementById("bancaFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (!disciplinaSelect || !assuntoSelect || !subassuntoSelect || !startBtn) return;

  let lista = [];
  let atual = 0;
  let respostas = [];
  let finalizadas = [];
  let respondidas = [];
  let questoesRegistradas = [];
  let sessaoRegistrada = false;
  let historicoQuestoes = [];
  let historicoDaListaAtual = new Map();

  function obterUidAlunoQuiz() {
    const perfil = obterPerfilAtual();
    return perfil && perfil.uid ? perfil.uid : "";
  }

  async function garantirPerfilAlunoQuiz() {
    const atual = obterPerfilAtual();
    if (atual && atual.uid) return atual;

    if (!window.authService) return null;

    if (typeof window.authService.identificarSessaoAtual === "function") {
      try {
        const sessao = await window.authService.identificarSessaoAtual();
        if (sessao && sessao.tipo === "aluno" && sessao.perfil) {
          ESTADO_ALUNO.perfil = sessao.perfil;
          return sessao.perfil;
        }
      } catch (_) {}
    }

    if (typeof window.authService.recarregarPerfilAtual === "function") {
      try {
        const perfil = await window.authService.recarregarPerfilAtual();
        if (perfil && perfil.uid) {
          ESTADO_ALUNO.perfil = perfil;
          return perfil;
        }
      } catch (_) {}
    }

    return null;
  }

  function listaKeyAtual() {
    return [
      disciplinaSelect.value || "sem-disciplina",
      assuntoSelect.value || "sem-assunto",
      subassuntoSelect.value || "sem-subassunto",
      (bancaAtiva() || "todas").toLowerCase()
    ].join("__");
  }

  function aplicarResumoNoPerfil(resumo) {
    const perfil = obterPerfilAtual();
    if (!perfil || !resumo) return;
    ESTADO_ALUNO.perfil = {
      ...perfil,
      progresso: {
        ...(perfil.progresso || {}),
        ...resumo
      }
    };
    iniciarDashboard();
  }

  async function carregarHistoricoAluno() {
    const perfil = await garantirPerfilAlunoQuiz();
    const uid = perfil && perfil.uid ? perfil.uid : "";
    if (!uid || !window.authService || typeof window.authService.listarHistoricoQuestoesAluno !== "function") {
      historicoQuestoes = [];
      return;
    }

    try {
      historicoQuestoes = await window.authService.listarHistoricoQuestoesAluno(uid);
    } catch (erro) {
      console.error("Falha ao carregar historico das questoes:", erro);
      historicoQuestoes = [];
    }
  }

  function dataHistoricoComparable(item) {
    return String(
      (item && (item.dataTentativaCliente || item.dataConclusaoCliente || item.dataTentativa || item.criadoEm)) || ""
    );
  }

  function registroCompativelComLista(item, chaveLista) {
    if (!item || item.ativo === false) return false;
    if (item.listaKey === chaveLista) return true;

    return (
      String(item.disciplinaId || "") === String(disciplinaSelect.value || "") &&
      String(item.assuntoId || "") === String(assuntoSelect.value || "") &&
      String(item.subassuntoId || "") === String(subassuntoSelect.value || "")
    );
  }

  function mapaHistoricoDaLista(chaveLista) {
    const mapa = new Map();
    historicoQuestoes.forEach((item) => {
      if (!registroCompativelComLista(item, chaveLista)) return;

      const questaoId = String(item.questaoId || "");
      if (!questaoId) return;

      const atual = mapa.get(questaoId);
      if (!atual) {
        mapa.set(questaoId, item);
        return;
      }

      const prioridadeAtual = atual.listaKey === chaveLista ? 1 : 0;
      const prioridadeNova = item.listaKey === chaveLista ? 1 : 0;
      if (prioridadeNova > prioridadeAtual || (prioridadeNova === prioridadeAtual && dataHistoricoComparable(item) > dataHistoricoComparable(atual))) {
        mapa.set(questaoId, item);
      }
    });
    return mapa;
  }

  function registroHistoricoAtual() {
    const questaoAtual = lista[atual];
    if (!questaoAtual) return null;
    return historicoDaListaAtual.get(String(questaoAtual.id || "")) || null;
  }

  function formatarDataHistorico(dataIso) {
    const valor = String(dataIso || "").trim();
    if (!valor) return "";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(data);
  }

  function mensagemQuestaoPersistida(registro, questaoAtual) {
    if (!registro || !questaoAtual) return "";

    const letraMarcada = String(
      registro.alternativaMarcada ||
      (Number.isInteger(Number(respostas[atual])) ? String.fromCharCode(65 + Number(respostas[atual])) : "")
    ).trim();
    const dataTentativa = formatarDataHistorico(registro.dataTentativaCliente);
    const base = registro.acertou
      ? "Esta questao ja foi respondida por voce e foi marcada como correta."
      : "Esta questao ja foi respondida por voce e ficou registrada como incorreta.";
    const partes = [base];

    if (letraMarcada) {
      partes.push("Alternativa marcada: " + letraMarcada + ".");
    }

    if (dataTentativa) {
      partes.push("Ultima tentativa: " + dataTentativa + ".");
    }

    return partes.join(" ");
  }

  function reiniciarVisualDaSessao() {
    aviso.classList.add("d-none");
    config.classList.add("d-none");
    container.classList.remove("d-none");
    if (questoesHero) {
      questoesHero.classList.add("is-hidden");
    }
    if (resetBtn) {
      resetBtn.disabled = !lista.length;
    }
  }

  function mostrarAvisoQuestoes(mensagem) {
    aviso.innerHTML = mensagem;
    aviso.classList.remove("d-none");
  }

  async function iniciarQuizSelecionado() {
    const assunto = assuntoAtual();
    const exigeSubassunto = !!(assunto && assunto.subassuntos && Object.keys(assunto.subassuntos).length);
    if (!disciplinaSelect.value || !assuntoSelect.value || (exigeSubassunto && !subassuntoSelect.value)) {
      mostrarAvisoQuestoes("Selecione uma disciplina e um assunto com quest&otilde;es dispon&iacute;veis para prosseguir.");
      return false;
    }

    await carregarHistoricoAluno();

    historicoDaListaAtual = mapaHistoricoDaLista(listaKeyAtual());
    lista = listaFiltrada();
    if (lista.length === 0) {
      mostrarAvisoQuestoes("Nenhuma quest&atilde;o encontrada para esse filtro.");
      if (!container.classList.contains("d-none")) {
        container.classList.add("d-none");
        config.classList.remove("d-none");
        if (questoesHero) {
          questoesHero.classList.remove("is-hidden");
        }
      }
      return false;
    }

    respostas = lista.map((questao) => {
      const registro = historicoDaListaAtual.get(String(questao.id || ""));
      return registro && Number.isInteger(Number(registro.alternativaMarcadaIndice))
        ? Number(registro.alternativaMarcadaIndice)
        : null;
    });
    finalizadas = lista.map((questao) => {
      const registro = historicoDaListaAtual.get(String(questao.id || ""));
      return !!(registro && registro.resolvida === true);
    });
    respondidas = lista.map((questao) => {
      const registro = historicoDaListaAtual.get(String(questao.id || ""));
      return !!(registro && registro.resolvida === true && Number(registro.alternativaMarcadaIndice) >= 0);
    });
    questoesRegistradas = lista.map((questao) => {
      const registro = historicoDaListaAtual.get(String(questao.id || ""));
      return !!(registro && registro.resolvida === true);
    });
    sessaoRegistrada = finalizadas.length > 0 && finalizadas.every(Boolean);
    atual = Math.max(finalizadas.findIndex((item) => item === false), 0);
    if (finalizadas.every(Boolean)) {
      atual = 0;
    }
    reiniciarVisualDaSessao();
    renderQuestao();
    return true;
  }

  function pontuacaoAtual() {
    return respostas.reduce((total, resposta, index) => {
      if (resposta === null || resposta === undefined) return total;
      return total + (resposta === lista[index].correta ? 1 : 0);
    }, 0);
  }

  function atualizarScore() {
    const acertos = pontuacaoAtual();
    score.textContent = acertos + (acertos === 1 ? " acerto" : " acertos");
  }

  function atualizarPillsBanca() {
    if (!bancaFilter) return;
    bancaFilter.querySelectorAll(".quiz-radio-pill").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("active", !!input.checked);
    });
  }

  function atualizarPillsStatus() {
    if (!statusFilter) return;
    statusFilter.querySelectorAll(".quiz-radio-pill").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("active", !!input.checked);
    });
  }

  function popularDisciplinas() {
    disciplinaSelect.innerHTML = '<option value="">-- Escolha a disciplina --</option>';
    Object.entries(disciplinas).forEach(([slug, item]) => {
      const option = document.createElement("option");
      option.value = slug;
      option.textContent = item.label;
      disciplinaSelect.appendChild(option);
    });
  }

  function popularAssuntos() {
    const disciplina = disciplinas[disciplinaSelect.value];
    assuntoSelect.innerHTML = '<option value="">-- Escolha um assunto --</option>';
    if (!disciplina) {
      assuntoSelect.disabled = true;
      popularSubassuntos();
      return;
    }
    Object.entries(disciplina.assuntos).forEach(([slug, item]) => {
      if (!item) return;
      if (slug === disciplinaSelect.value) return;
      if (String(item.label || "").trim().toLowerCase() === String(disciplina.label || "").trim().toLowerCase()) return;
      const option = document.createElement("option");
      option.value = slug;
      option.textContent = item.label;
      assuntoSelect.appendChild(option);
    });
    assuntoSelect.disabled = false;
    popularSubassuntos();
  }

  function popularSubassuntos() {
    const disciplina = disciplinas[disciplinaSelect.value];
    const assunto = disciplina && disciplina.assuntos ? disciplina.assuntos[assuntoSelect.value] : null;
    const subassuntos = assunto && assunto.subassuntos ? assunto.subassuntos : null;

    subassuntoSelect.innerHTML = '<option value="">-- Escolha um assunto secundario --</option>';

    if (!subassuntos || !Object.keys(subassuntos).length) {
      subassuntoSelect.disabled = true;
      return;
    }

    Object.entries(subassuntos).forEach(([slug, item]) => {
      const option = document.createElement("option");
      option.value = slug;
      option.textContent = item.label;
      subassuntoSelect.appendChild(option);
    });

    subassuntoSelect.disabled = false;
  }

  function assuntoAtual() {
    const disciplina = disciplinas[disciplinaSelect.value];
    if (!disciplina) return null;
    return disciplina.assuntos[assuntoSelect.value] || null;
  }

  function subassuntoAtual() {
    const assunto = assuntoAtual();
    if (!assunto || !assunto.subassuntos) return null;
    return assunto.subassuntos[subassuntoSelect.value] || null;
  }

  function bancaAtiva() {
    const marcada = document.querySelector('input[name="banca"]:checked');
    return marcada ? marcada.value : "Todas";
  }

  function statusAtivo() {
    const marcado = document.querySelector('input[name="statusQuestao"]:checked');
    return marcado ? marcado.value : "todos";
  }

  function decodificarHtml(texto) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = texto || "";
    return textarea.value;
  }

  function htmlParaTexto(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html || "";
    return (temp.textContent || temp.innerText || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{2,}/g, "\n\n")
      .trim();
  }

  function _desenharImagemNoCanvas(img, recorteAspectRatio) {
    const canvas = document.createElement("canvas");
    const ow = img.naturalWidth, oh = img.naturalHeight;
    let sx = 0, sy = 0, sw = ow, sh = oh;
    if (recorteAspectRatio && ow && oh) {
      const aspect = ow / oh;
      if (aspect > recorteAspectRatio) { sw = oh * recorteAspectRatio; sx = (ow - sw) / 2; }
      else { sh = ow / recorteAspectRatio; sy = (oh - sh) / 2; }
    }
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), width: canvas.width, height: canvas.height };
  }

  function carregarImagemComoDataUrl(src, recorteAspectRatio) {
    const url = normalizarUrlImagemQuestao(src);
    // Base64 data URLs are already in memory — return dimensions directly.
    if (url.startsWith("data:")) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ dataUrl: url, width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = url;
      });
    }
    // fetch() loads a fresh copy bypassing the browser image cache, so the
    // blob-backed <img> never taints the canvas (fixes PDF images going blank).
    return fetch(url)
      .then(r => { if (!r.ok) throw new Error("fetch " + r.status); return r.blob(); })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => { try { resolve(_desenharImagemNoCanvas(img, recorteAspectRatio)); } catch(e) { reject(e); } };
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(() => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { try { resolve(_desenharImagemNoCanvas(img, recorteAspectRatio)); } catch(e) { reject(e); } };
        img.onerror = reject;
        img.src = url;
      }));
  }

  function textoMatematicoPdf(html) {
    return String(html || "")
      .replace(/<\s*sup[^>]*>(.*?)<\s*\/\s*sup\s*>/gi, "^($1)")
      .replace(/<\s*sub[^>]*>(.*?)<\s*\/\s*sub\s*>/gi, "_($1)")
      .replace(/&times;/gi, "×")
      .replace(/&Delta;/g, "Δ")
      .replace(/&theta;/gi, "θ")
      .replace(/&mu;/gi, "μ");
  }

  function htmlParaTextoPdf(html) {
    return normalizarTextoPdf(htmlParaTexto(textoMatematicoPdf(html)));
  }

  function normalizarTextoPdf(texto) {
    return decodificarHtml(texto || "")
      .replace(/\u00a0/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .trim();
  }

  function obterNumeroPaginasPdf(pdf) {
    if (typeof pdf.getNumberOfPages === "function") {
      return pdf.getNumberOfPages();
    }
    return pdf.internal && typeof pdf.internal.getNumberOfPages === "function"
      ? pdf.internal.getNumberOfPages()
      : 1;
  }

  function tituloAtualPdf() {
    const disciplina = disciplinas[disciplinaSelect.value];
    const assunto = assuntoAtual();
    const subassunto = subassuntoAtual();
    return {
      disciplina: disciplina ? disciplina.label : "",
      assunto: assunto ? assunto.label : "",
      subassunto: subassunto ? subassunto.label : ""
    };
  }

  async function baixarPdfLista() {
    await carregarHistoricoAluno();
    historicoDaListaAtual = mapaHistoricoDaLista(listaKeyAtual());
    const listaPdf = listaFiltrada();
    const assunto = assuntoAtual();
    const exigeSubassunto = !!(assunto && assunto.subassuntos && Object.keys(assunto.subassuntos).length);

    if (!disciplinaSelect.value || !assuntoSelect.value || (exigeSubassunto && !subassuntoSelect.value) || !listaPdf.length) {
      mostrarAvisoQuestoes("Nenhuma quest&atilde;o encontrada para esse filtro.");
      return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      mostrarAvisoQuestoes("O gerador de PDF ainda n&atilde;o terminou de carregar.");
      return;
    }

    const modoPreviaPdf = new URLSearchParams(window.location.search).get("pdfPreview") === "1";
    const questoesPdf = modoPreviaPdf ? listaPdf.slice(0, 6) : listaPdf;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const colors = {
      navy: [7, 17, 31],
      navy2: [11, 16, 32],
      blue: [37, 99, 235],
      blue2: [59, 130, 246],
      purple: [124, 58, 237],
      purple2: [139, 92, 246],
      text: [17, 24, 39],
      muted: [75, 85, 99],
      line: [226, 232, 240],
      page: [248, 250, 252]
    };
    const meta = tituloAtualPdf();
    const statusNome = ({
      todos: "Todos",
      "nao-respondidas": "Não respondidas",
      respondidas: "Respondidas",
      corretas: "Corretas",
      incorretas: "Incorretas"
    })[statusAtivo()] || "Todos";
    const bancaNome = bancaAtiva() || "Todas";
    const cardWidth = 178;
    const cardX = (pageWidth - cardWidth) / 2;
    const pageBottom = pageHeight - 22;
    const internalTop = 31;
    let y = 118;
    let logoData = null;
    let headerData = null;

    try {
      logoData = await carregarImagemComoDataUrl("imagens/logo-universo-relativo.jpeg");
    } catch (error) {
      console.warn("Nao foi possivel carregar a logo do PDF:", error);
    }

    try {
      headerData = await carregarImagemComoDataUrl("imagens/pdf-banco-questoes-header.jpeg", pageWidth / 118);
    } catch (error) {
      console.warn("Nao foi possivel carregar o fundo do cabecalho do PDF:", error);
    }

    const imagensQuestoes = await Promise.all(questoesPdf.map(async (questao) => {
      const src = questao && questao.imagem && questao.imagem.src ? String(questao.imagem.src).trim() : "";
      if (!src) return null;
      try {
        return await carregarImagemComoDataUrl(src);
      } catch (error) {
        console.warn("Nao foi possivel carregar imagem da questao no PDF:", src, error);
        return null;
      }
    }));

    function setFill(rgb) {
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
    }

    function setText(rgb) {
      pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
    }

    function setDraw(rgb) {
      pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
    }

    function textoDireita(texto, x, posY) {
      pdf.text(texto, x - pdf.getTextWidth(texto), posY);
    }

    function desenharMarca(x, posY, largura) {
      if (logoData && logoData.dataUrl) {
        const altura = Math.min(10, largura * (logoData.height / Math.max(logoData.width, 1)));
        pdf.addImage(logoData.dataUrl, "JPEG", x, posY, largura, altura);
        return;
      }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      setText(colors.blue);
      pdf.text("UR", x, posY + 5);
      pdf.setFontSize(6);
      setText(colors.text);
      pdf.text("Universo Relativo", x + 9, posY + 5);
    }

    function desenharIconeAssunto(assuntoId, x, posY, tamanho) {
      const id = String(assuntoId || "").toLowerCase();
      setDraw(colors.blue);
      setFill([239, 246, 255]);
      pdf.setLineWidth(0.55);

      if (id.includes("cinematica")) {
        pdf.roundedRect(x + tamanho * 0.13, posY + tamanho * 0.42, tamanho * 0.68, tamanho * 0.28, 1.4, 1.4, "S");
        pdf.line(x + tamanho * 0.25, posY + tamanho * 0.42, x + tamanho * 0.38, posY + tamanho * 0.27);
        pdf.line(x + tamanho * 0.38, posY + tamanho * 0.27, x + tamanho * 0.58, posY + tamanho * 0.27);
        pdf.line(x + tamanho * 0.58, posY + tamanho * 0.27, x + tamanho * 0.7, posY + tamanho * 0.42);
        setFill(colors.blue);
        pdf.circle(x + tamanho * 0.28, posY + tamanho * 0.74, tamanho * 0.08, "F");
        pdf.circle(x + tamanho * 0.68, posY + tamanho * 0.74, tamanho * 0.08, "F");
        return;
      }

      if (id.includes("termo")) {
        pdf.line(x + tamanho * 0.5, posY + tamanho * 0.18, x + tamanho * 0.5, posY + tamanho * 0.68);
        pdf.circle(x + tamanho * 0.5, posY + tamanho * 0.76, tamanho * 0.11, "S");
        setFill(colors.blue);
        pdf.circle(x + tamanho * 0.5, posY + tamanho * 0.76, tamanho * 0.06, "F");
        return;
      }

      if (id.includes("optica")) {
        pdf.line(x + tamanho * 0.12, posY + tamanho * 0.52, x + tamanho * 0.82, posY + tamanho * 0.22);
        pdf.line(x + tamanho * 0.12, posY + tamanho * 0.52, x + tamanho * 0.82, posY + tamanho * 0.52);
        pdf.line(x + tamanho * 0.12, posY + tamanho * 0.52, x + tamanho * 0.82, posY + tamanho * 0.82);
        setFill(colors.purple);
        pdf.circle(x + tamanho * 0.12, posY + tamanho * 0.52, tamanho * 0.07, "F");
        return;
      }

      if (id.includes("ondulatoria")) {
        let lastX = x + tamanho * 0.12;
        let lastY = posY + tamanho * 0.52;
        for (let i = 1; i <= 12; i += 1) {
          const px = x + tamanho * (0.12 + i * 0.065);
          const py = posY + tamanho * (0.52 + Math.sin(i * 0.9) * 0.18);
          pdf.line(lastX, lastY, px, py);
          lastX = px;
          lastY = py;
        }
        return;
      }

      pdf.circle(x + tamanho * 0.5, posY + tamanho * 0.5, tamanho * 0.28, "S");
      setFill(colors.blue);
      pdf.circle(x + tamanho * 0.5, posY + tamanho * 0.5, tamanho * 0.07, "F");
    }

    function desenharInfoFiltro(texto, subtitulo, assuntoId, x, posY, largura) {
      setFill([255, 255, 255]);
      setDraw([219, 234, 254]);
      pdf.roundedRect(x, posY, largura, 16, 4, 4, "FD");
      setFill([239, 246, 255]);
      pdf.roundedRect(x + 4, posY + 3.1, 10, 10, 3, 3, "F");
      desenharIconeAssunto(assuntoId, x + 4.9, posY + 3.7, 8.4);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.3);
      setText(colors.text);
      pdf.text(normalizarTextoPdf(texto).slice(0, 34), x + 17, posY + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(5.8);
      setText(colors.muted);
      pdf.text(normalizarTextoPdf(subtitulo).slice(0, 42), x + 17, posY + 11.7);
    }

    function desenharCapa() {
      if (headerData && headerData.dataUrl) {
        pdf.addImage(headerData.dataUrl, "JPEG", 0, 0, pageWidth, 118);
      } else {
        setFill([239, 246, 255]);
        pdf.rect(0, 0, pageWidth, 118, "F");
      }

      const infoY = 95;
      desenharInfoFiltro(meta.disciplina || "Física Básica", "Disciplina", disciplinaSelect.value || "fisica-basica", 14, infoY, 52);
      desenharInfoFiltro(meta.assunto || "Cinemática", "Assunto", assuntoSelect.value || "cinematica", 70, infoY, 52);
      desenharInfoFiltro(meta.subassunto || "Lista de questões", bancaNome + " | " + statusNome, assuntoSelect.value || "cinematica", 126, infoY, 70);
    }

    function desenharCabecalhoInterno(pageNumber) {
      if (pageNumber === 1) return;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      setText(colors.text);
      textoDireita("Banco de Questões | " + (meta.assunto || "Universo Relativo"), pageWidth - 12, 16);
      setDraw(colors.line);
      pdf.setLineWidth(0.25);
      pdf.line(12, 23, pageWidth - 12, 23);
    }

    function desenharRodape(pageNumber, totalPages) {
      setDraw(colors.line);
      pdf.setLineWidth(0.2);
      pdf.line(20, pageHeight - 14, pageWidth - 20, pageHeight - 14);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      setText(colors.blue);
      pdf.text("UR", pageWidth / 2 - 13, pageHeight - 8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      setText([99, 102, 241]);
      pdf.text("universorelativo.com.br", pageWidth / 2 - 7, pageHeight - 8.5);
      setFill(colors.blue);
      pdf.roundedRect(pageWidth - 17, pageHeight - 12, 6.5, 6.5, 1.8, 1.8, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      setText([255, 255, 255]);
      pdf.text(String(pageNumber), pageWidth - 14.8, pageHeight - 7.5);
      if (totalPages > 1) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(5.5);
        setText(colors.muted);
        textoDireita("de " + totalPages, pageWidth - 19, pageHeight - 7.5);
      }
    }

    function alternativasPdf(questao) {
      const letras = ["A", "B", "C", "D", "E"];
      return letras.map((letra, indice) => {
        const bruta = Array.isArray(questao.alternativas) ? questao.alternativas[indice] : "";
        const htmlSemLetra = String(bruta || "")
          .replace(/^\s*[a-e]\)\s*/i, "")
          .replace(/^\s*\(?[a-e]\)?\s*/i, "");
        const texto = htmlParaTextoPdf(bruta)
          .replace(/^[a-e]\)\s*/i, "")
          .replace(/^\(?[a-e]\)?\s*/i, "")
          .trim();
        return {
          letra,
          texto: texto || "Não informada",
          tokens: tokensTextoRicoPdf(htmlSemLetra || "Não informada")
        };
      });
    }

    function limparTrechoTextoRicoPdf(trecho) {
      return decodificarHtml(String(trecho || "")
        .replace(/<\s*br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, " "))
        .replace(/\u00a0/g, " ")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, " ");
    }

    function apararTokensTextoRicoPdf(tokens) {
      const limpos = tokens.filter((token) => token && token.texto);
      if (limpos.length) {
        limpos[0] = { ...limpos[0], texto: limpos[0].texto.replace(/^\s+/, "") };
        const ultimo = limpos.length - 1;
        limpos[ultimo] = { ...limpos[ultimo], texto: limpos[ultimo].texto.replace(/\s+$/, "") };
      }
      return limpos.filter((token) => token.texto);
    }

    function tokensTextoRicoPdf(html) {
      const tokens = [];
      const fonte = String(html || "")
        .replace(/<\s*\/p\s*>\s*<\s*p[^>]*>/gi, " ")
        .replace(/<\s*p[^>]*>/gi, "")
        .replace(/<\s*\/p\s*>/gi, " ");
      const regex = /<\s*(sup|sub)[^>]*>(.*?)<\s*\/\s*\1\s*>/gi;
      let cursor = 0;
      let match = regex.exec(fonte);
      while (match) {
        const antes = limparTrechoTextoRicoPdf(fonte.slice(cursor, match.index));
        if (antes) tokens.push({ tipo: "normal", texto: antes });
        const valor = limparTrechoTextoRicoPdf(match[2]).trim();
        if (valor) tokens.push({ tipo: match[1].toLowerCase(), texto: valor });
        cursor = match.index + match[0].length;
        match = regex.exec(fonte);
      }
      const depois = limparTrechoTextoRicoPdf(fonte.slice(cursor));
      if (depois) tokens.push({ tipo: "normal", texto: depois });
      return apararTokensTextoRicoPdf(tokens);
    }

    function unidadesTextoRicoPdf(tokens) {
      return tokens.flatMap((token) => {
        const tipo = token.tipo || "normal";
        if (tipo !== "normal") return [{ tipo, texto: token.texto }];
        return String(token.texto || "")
          .split(/(\s+)/)
          .filter(Boolean)
          .map((texto) => ({ tipo, texto }));
      });
    }

    function larguraUnidadeTextoRicoPdf(unidade, tamanhoNormal) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(unidade.tipo === "normal" ? tamanhoNormal : tamanhoNormal * 0.72);
      return pdf.getTextWidth(unidade.texto);
    }

    function quebrarTextoRicoPdf(tokens, larguraMaxima, tamanhoNormal) {
      const linhas = [];
      let linha = [];
      let larguraLinha = 0;
      unidadesTextoRicoPdf(tokens).forEach((unidade) => {
        const espaco = /^\s+$/.test(unidade.texto);
        if (espaco && !linha.length) return;
        const largura = larguraUnidadeTextoRicoPdf(unidade, tamanhoNormal);
        if (linha.length && !espaco && larguraLinha + largura > larguraMaxima) {
          while (linha.length && /^\s+$/.test(linha[linha.length - 1].texto)) {
            linha.pop();
          }
          linhas.push(linha);
          linha = [];
          larguraLinha = 0;
        }
        if (!espaco || linha.length) {
          linha.push(unidade);
          larguraLinha += largura;
        }
      });
      while (linha.length && /^\s+$/.test(linha[linha.length - 1].texto)) {
        linha.pop();
      }
      if (linha.length) linhas.push(linha);
      return linhas.length ? linhas : [[{ tipo: "normal", texto: "" }]];
    }

    function desenharTextoRicoPdf(linhas, x, posY, tamanhoNormal) {
      const entreLinhas = tamanhoNormal * 0.45;
      linhas.forEach((linha, indiceLinha) => {
        let cursorX = x;
        const baseline = posY + indiceLinha * entreLinhas;
        linha.forEach((unidade) => {
          const elevado = unidade.tipo === "sup";
          const rebaixado = unidade.tipo === "sub";
          const tamanho = unidade.tipo === "normal" ? tamanhoNormal : tamanhoNormal * 0.72;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(tamanho);
          setText(colors.text);
          const deslocamentoY = elevado ? -tamanhoNormal * 0.32 : rebaixado ? tamanhoNormal * 0.2 : 0;
          pdf.text(unidade.texto, cursorX, baseline + deslocamentoY);
          cursorX += pdf.getTextWidth(unidade.texto);
        });
      });
    }

    function prepararQuestaoPdf(questao, indice) {
      const enunciado = htmlParaTextoPdf(questao.enunciado || "");
      const enunciadoTokens = tokensTextoRicoPdf(questao.enunciado || "");
      const origem = htmlParaTextoPdf(questao.origem || questao.cardTitulo || questao.banca || "");
      const imagem = imagensQuestoes[indice];
      const imagemInfo = questao.imagem && imagem
        ? {
            ...imagem,
            legenda: htmlParaTextoPdf(questao.imagem.legenda || questao.imagem.alt || "")
          }
        : null;
      return {
        numero: String(indice + 1).padStart(2, "0"),
        origem,
        enunciado: enunciado || "Enunciado não informado.",
        enunciadoTokens: enunciadoTokens.length ? enunciadoTokens : tokensTextoRicoPdf("Enunciado não informado."),
        alternativas: alternativasPdf(questao),
        imagem: imagemInfo
      };
    }

    function medirQuestao(questao) {
      const padding = 6.8;
      const numberBox = 9.8;
      const gap = 5.2;
      const innerWidth = cardWidth - padding * 2;
      const usaDuasColunas = !!(questao.imagem && questao.enunciado.length <= 900);
      const imageWidth = usaDuasColunas ? 52 : Math.min(104, innerWidth - numberBox - gap);
      const imageHeight = questao.imagem
        ? Math.min(48, Math.max(24, imageWidth * (questao.imagem.height / Math.max(questao.imagem.width, 1))))
        : 0;
      const textWidth = usaDuasColunas
        ? innerWidth - numberBox - gap - imageWidth - 8
        : innerWidth - numberBox - gap;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.55);
      const enunciadoLinhas = quebrarTextoRicoPdf(questao.enunciadoTokens, textWidth, 8.55);
      pdf.setFontSize(7.95);
      const alternativas = questao.alternativas.map((alternativa) => ({
        ...alternativa,
        linhas: quebrarTextoRicoPdf(alternativa.tokens, Math.max(45, textWidth - 10), 7.7)
      }));
      const textoAltura = enunciadoLinhas.length * 3.85 + 2.2 + alternativas.reduce((total, alternativa) => {
        return total + Math.max(4.5, alternativa.linhas.length * 3.25) + 0.6;
      }, 0);
      const origemAltura = questao.origem ? 4 : 0;
      const imagemAltura = questao.imagem
        ? imageHeight + (questao.imagem.legenda ? 7 : 3)
        : 0;
      const altura = padding * 2 + Math.max(textoAltura + origemAltura, usaDuasColunas ? imagemAltura : 0) + (!usaDuasColunas ? imagemAltura : 0);
      return {
        padding,
        numberBox,
        gap,
        textWidth,
        usaDuasColunas,
        imageWidth,
        imageHeight,
        enunciadoLinhas,
        alternativas,
        altura: Math.max(44, altura)
      };
    }

    function novaPaginaSeNecessario(alturaMinima) {
      if (y + alturaMinima <= pageBottom) return;
      pdf.addPage();
      y = internalTop;
    }

    function desenharAlternativas(alternativas, x, posY) {
      let altY = posY;
      alternativas.forEach((alternativa) => {
        setFill([239, 246, 255]);
        setDraw([191, 219, 254]);
        pdf.circle(x + 2.35, altY - 1.05, 2.35, "FD");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(5.4);
        setText(colors.blue);
        pdf.text(alternativa.letra, x + 1.45, altY - 0.15);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.7);
        setText(colors.text);
        desenharTextoRicoPdf(alternativa.linhas, x + 7.4, altY, 7.7);
        altY += Math.max(4.5, alternativa.linhas.length * 3.25) + 0.6;
      });
      return altY;
    }

    function desenharImagemQuestao(questao, x, posY, largura, altura) {
      if (!questao.imagem) return 0;
      setFill([241, 245, 249]);
      setDraw(colors.line);
      pdf.roundedRect(x - 1.5, posY - 1.5, largura + 3, altura + 3, 3, 3, "FD");
      pdf.addImage(questao.imagem.dataUrl, "JPEG", x, posY, largura, altura);
      let ocupado = altura + 3.5;
      if (questao.imagem.legenda) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.2);
        setText(colors.muted);
        const linhas = pdf.splitTextToSize(questao.imagem.legenda, largura);
        pdf.text(linhas.slice(0, 2), x, posY + altura + 4.8);
        ocupado += Math.min(2, linhas.length) * 3.1 + 1;
      }
      return ocupado;
    }

    function desenharQuestao(questao, indice) {
      const medida = medirQuestao(questao);
      novaPaginaSeNecessario(medida.altura + 5);

      setFill([229, 231, 235]);
      pdf.roundedRect(cardX + 1.2, y + 1.2, cardWidth, medida.altura, 4, 4, "F");
      setFill([255, 255, 255]);
      setDraw(colors.line);
      pdf.roundedRect(cardX, y, cardWidth, medida.altura, 4, 4, "FD");

      const contentX = cardX + medida.padding;
      const contentY = y + medida.padding;
      setFill([248, 250, 252]);
      setDraw([199, 210, 254]);
      pdf.roundedRect(contentX, contentY + 0.2, medida.numberBox, 7.2, 3.2, 3.2, "FD");
      setFill(colors.blue);
      pdf.circle(contentX + 1.8, contentY + 3.8, 0.75, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.6);
      setText(colors.blue);
      pdf.text(questao.numero, contentX + 3.25, contentY + 5.55);

      const textX = contentX + medida.numberBox + medida.gap;
      let textY = contentY + 3;
      if (questao.origem) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(5.8);
        setText(colors.purple);
        pdf.text(questao.origem.toUpperCase().slice(0, 48), textX, textY);
        textY += 3.8;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.55);
      setText(colors.text);
      desenharTextoRicoPdf(medida.enunciadoLinhas, textX, textY, 8.55);
      textY += medida.enunciadoLinhas.length * 3.85 + 3.1;

      if (questao.imagem) {
        if (medida.usaDuasColunas) {
          const imageX = cardX + cardWidth - medida.padding - medida.imageWidth;
          desenharImagemQuestao(questao, imageX, contentY + 3, medida.imageWidth, medida.imageHeight);
        } else {
          const imageX = cardX + (cardWidth - medida.imageWidth) / 2;
          textY += desenharImagemQuestao(questao, imageX, textY + 1.5, medida.imageWidth, medida.imageHeight) + 2;
        }
      }

      textY = desenharAlternativas(medida.alternativas, textX, textY);

      y += medida.altura + 5;
    }

    desenharCapa();
    questoesPdf.map(prepararQuestaoPdf).forEach((questao, index) => {
      desenharQuestao(questao, index);
    });

    const totalPages = obterNumeroPaginasPdf(pdf);
    for (let page = 1; page <= totalPages; page += 1) {
      pdf.setPage(page);
      desenharCabecalhoInterno(page);
      desenharRodape(page, totalPages);
    }

    const nomeArquivo = [
      "universo-relativo",
      modoPreviaPdf ? "previa" : "lista",
      (meta.disciplina || "disciplina").toLowerCase().replace(/\s+/g, "-"),
      (meta.assunto || "assunto").toLowerCase().replace(/\s+/g, "-"),
      (meta.subassunto || "lista").toLowerCase().replace(/\s+/g, "-")
    ].join("-") + ".pdf";

    pdf.save(nomeArquivo);
  }

  function listaFiltrada() {
    const assunto = assuntoAtual();
    if (!assunto) return [];
    const subassunto = subassuntoAtual();
    const banca = bancaAtiva();
    const status = statusAtivo();
    const baseQuestoes = subassunto ? (subassunto.questoes || []) : (assunto.questoes || []);
    return baseQuestoes.filter((item) => {
      if (banca !== "Todas" && item.banca !== banca) return false;
      if (status === "todos") return true;

      const registro = historicoDaListaAtual.get(String(item.id || ""));
      const respondida = !!(registro && registro.resolvida === true && Number(registro.alternativaMarcadaIndice) >= 0);

      if (status === "nao-respondidas") return !respondida;
      if (status === "respondidas") return respondida;
      if (status === "corretas") return respondida && registro.acertou === true;
      if (status === "incorretas") return respondida && registro.acertou === false;

      return true;
    });
  }

  function atualizarProgressoBarra() {
    const valor = lista.length ? ((atual + 1) / lista.length) * 100 : 0;
    progressBar.style.width = valor + "%";
    progressBar.setAttribute("aria-valuenow", valor);
    const registroAtual = registroHistoricoAtual();
    const sufixo = finalizadas[atual]
      ? (registroAtual ? " · j&aacute; respondida" : " · conclu&iacute;da")
      : "";
    counter.innerHTML = "Quest&atilde;o " + (atual + 1) + " de " + lista.length + sufixo;
    prevBtn.disabled = atual === 0;
    advanceBtn.disabled = false;
  }

  function mostrarFeedback(tipo, texto) {
    feedback.innerHTML = texto;
    feedback.className = "quiz-feedback " + tipo;
  }

  async function registrarTentativaQuestaoAtual() {
    const perfilAluno = obterPerfilAtual();
    const questaoAtual = lista[atual];
    if (!perfilAluno || !questaoAtual || !window.authService || typeof window.authService.salvarTentativaQuestaoAluno !== "function") {
      return null;
    }

    try {
      const resultado = await window.authService.salvarTentativaQuestaoAluno(perfilAluno.uid, {
        listaKey: listaKeyAtual(),
        questaoId: questaoAtual.id,
        disciplinaId: disciplinaSelect.value,
        assuntoId: assuntoSelect.value,
        subassuntoId: subassuntoSelect.value,
        cardId: questaoAtual.cardId || "",
        banca: questaoAtual.banca || "",
        resolvida: true,
        acertou: respostas[atual] === questaoAtual.correta,
        alternativaMarcada: String.fromCharCode(65 + Number(respostas[atual] || 0)),
        alternativaMarcadaIndice: Number(respostas[atual])
      });

      if (resultado && resultado.registro) {
        historicoQuestoes = historicoQuestoes.filter((item) => item.id !== progressoQuestaoDocIdLocal(resultado.registro.listaKey, resultado.registro.questaoId));
        historicoQuestoes.unshift({
          id: progressoQuestaoDocIdLocal(resultado.registro.listaKey, resultado.registro.questaoId),
          ...resultado.registro
        });
        historicoDaListaAtual.set(String(resultado.registro.questaoId || ""), {
          id: progressoQuestaoDocIdLocal(resultado.registro.listaKey, resultado.registro.questaoId),
          ...resultado.registro
        });
      }

      if (resultado && resultado.resumo) {
        aplicarResumoNoPerfil(resultado.resumo);
      }

      return resultado;
    } catch (erro) {
      console.error("Falha ao salvar tentativa da questao:", erro);
      mostrarFeedback("incorrect", "Nao foi possivel salvar esta tentativa no Firebase.");
      return null;
    }
  }

  async function registrarConclusaoDaLista() {
    const perfilAluno = obterPerfilAtual();
    if (!perfilAluno || !window.authService || typeof window.authService.marcarListaConcluidaAluno !== "function") {
      return;
    }

    try {
      const resumo = await window.authService.marcarListaConcluidaAluno(perfilAluno.uid, {
        listaKey: listaKeyAtual(),
        disciplinaId: disciplinaSelect.value,
        assuntoId: assuntoSelect.value,
        subassuntoId: subassuntoSelect.value,
        banca: bancaAtiva(),
        totalQuestoes: lista.length
      });
      registrarAtividadeDashboard("questoes", "Respondeu questões", assuntoDashboardPorId(assuntoSelect.value || subassuntoSelect.value || disciplinaSelect.value));
      aplicarResumoNoPerfil(resumo);
    } catch (erro) {
      console.error("Falha ao marcar conclusao da lista:", erro);
    }
  }

  async function resetarListaAtual() {
    const perfilAluno = obterPerfilAtual();
    if (!perfilAluno || !lista.length || !window.authService || typeof window.authService.resetarListaQuestoesAluno !== "function") {
      return;
    }

    if (!window.confirm("Deseja resetar esta lista? O progresso salvo desta lista sera apagado e voce podera refaze-la do zero.")) {
      return;
    }

    if (resetBtn) {
      resetBtn.disabled = true;
      resetBtn.textContent = "Resetando...";
    }

    try {
      const chaveLista = listaKeyAtual();
      const resumo = await window.authService.resetarListaQuestoesAluno(perfilAluno.uid, chaveLista);
      historicoQuestoes = historicoQuestoes.filter((item) => item.listaKey !== chaveLista);
      aplicarResumoNoPerfil(resumo);
      await iniciarQuizSelecionado();
      mostrarFeedback("correct", "Lista resetada. Agora voce pode refaze-la do zero.");
      answerBtn.disabled = false;
    } catch (erro) {
      console.error("Falha ao resetar lista:", erro);
      mostrarFeedback("incorrect", "Nao foi possivel resetar esta lista agora.");
    } finally {
      if (resetBtn) {
        resetBtn.disabled = !lista.length;
        resetBtn.textContent = "Resetar lista";
      }
    }
  }

  function esconderResolucao() {
    if (resolutionBtn) {
      resolutionBtn.classList.add("d-none");
      resolutionBtn.textContent = "Resolução escrita";
    }
    if (resolutionBox) {
      resolutionBox.classList.add("d-none");
      resolutionBox.innerHTML = "";
    }
    if (videoResolutionBtn) {
      videoResolutionBtn.classList.add("d-none");
      videoResolutionBtn.textContent = "Resolução em vídeo";
    }
    if (videoResolutionBox) {
      videoResolutionBox.classList.add("d-none");
      videoResolutionBox.innerHTML = "";
    }
  }

  function obterUrlVideoEmbed(questaoAtual) {
    if (!questaoAtual) return "";

    const embedPronto = String(questaoAtual.videoEmbedUrl || "").trim();
    if (embedPronto) return embedPronto;

    const url = String(questaoAtual.videoUrl || "").trim();
    if (!url) return "";

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/i);
    if (!match) return "";

    return "https://www.youtube-nocookie.com/embed/" + match[1] + "?rel=0&modestbranding=1&playsinline=1";
  }

  function obterMiniaturaVideo(urlEmbed) {
    const match = String(urlEmbed || "").match(/embed\/([^?&/]+)/i);
    if (!match) return "";
    return "https://i.ytimg.com/vi/" + match[1] + "/hqdefault.jpg";
  }

  function atualizarResolucao() {
    const questaoAtual = lista[atual];
    if (!questaoAtual || !finalizadas[atual]) {
      esconderResolucao();
      return;
    }

    if (resolutionBtn && resolutionBox) {
      if (questaoAtual.resolucaoEscrita) {
        resolutionBtn.classList.remove("d-none");
        resolutionBox.innerHTML = questaoAtual.resolucaoEscrita;
      } else {
        resolutionBtn.classList.add("d-none");
        resolutionBox.classList.add("d-none");
        resolutionBox.innerHTML = "";
      }
    }

    if (videoResolutionBtn && videoResolutionBox) {
      const videoEmbedUrl = obterUrlVideoEmbed(questaoAtual);
      if (videoEmbedUrl) {
        const thumbnailUrl = obterMiniaturaVideo(videoEmbedUrl);
        videoResolutionBtn.classList.remove("d-none");
        videoResolutionBox.innerHTML =
          '<div class="quiz-video-resolution-head">' +
            '<div class="quiz-video-resolution-title"><span>▶</span><strong>Resolução em vídeo</strong></div>' +
            '<button type="button" class="quiz-video-close" data-video-close="true" aria-label="Fechar resolução em vídeo">×</button>' +
          '</div>' +
          '<div class="quiz-video-resolution-meta">' +
            '<img src="' + thumbnailUrl + '" alt="Miniatura da resolução em vídeo" class="quiz-video-thumb">' +
            '<div class="quiz-video-meta-copy"><strong>Assista sem sair da plataforma</strong><p class="mb-0">Abra a resolução quando quiser revisar a estratégia e feche com o X para voltar ao foco da questão.</p></div>' +
          '</div>' +
          '<div class="quiz-video-frame-wrap">' +
            '<iframe src="' + videoEmbedUrl + '" title="Resolução em vídeo" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
          '</div>';
      } else {
        videoResolutionBtn.classList.add("d-none");
        videoResolutionBox.classList.add("d-none");
        videoResolutionBox.innerHTML = "";
      }
    }
  }

  function revelarGabarito() {
    const questaoAtual = lista[atual];
    options.querySelectorAll(".option-custom").forEach((botao, indice) => {
      botao.disabled = true;
      botao.classList.remove("selected");
      if (indice === questaoAtual.correta) botao.classList.add("correct");
      if (respostas[atual] === indice && indice !== questaoAtual.correta) botao.classList.add("incorrect");
      if (respostas[atual] === indice && indice === questaoAtual.correta) botao.classList.add("selected");
    });
  }

  async function finalizarQuestao(tempoEsgotado) {
    if (finalizadas[atual]) return true;

    if (respostas[atual] === null || respostas[atual] === undefined) {
      if (tempoEsgotado) {
        finalizadas[atual] = true;
        respondidas[atual] = false;
        atualizarScore();
        return true;
      }
      mostrarFeedback("incorrect", "Selecione uma alternativa antes de responder.");
      return false;
    }

    finalizadas[atual] = true;
    respondidas[atual] = true;
    revelarGabarito();
    atualizarScore();

    if (!questoesRegistradas[atual]) {
      questoesRegistradas[atual] = true;
      await registrarTentativaQuestaoAtual();
    }

    if (respostas[atual] === lista[atual].correta) {
      mostrarFeedback("correct", "Resposta correta. Muito bem.");
    } else {
      mostrarFeedback("incorrect", "Resposta incorreta. Veja a alternativa correta em destaque.");
    }
    atualizarResolucao();
    return true;
  }

  function selecionarOpcao(indice) {
    if (finalizadas[atual]) return;
    respostas[atual] = indice;
    options.querySelectorAll(".option-custom").forEach((botao, posicao) => {
      botao.classList.toggle("selected", posicao === indice);
    });
    feedback.className = "quiz-feedback d-none";
    esconderResolucao();
  }

  function renderFigura(questaoAtual) {
    if (questaoAtual.imagem && questaoAtual.imagem.src) {
      figure.classList.remove("d-none");
      figureImage.src = questaoAtual.imagem.src;
      figureImage.alt = questaoAtual.imagem.alt || "";
      figureCaption.innerHTML = questaoAtual.imagem.legenda || "";
      return;
    }

    figure.classList.add("d-none");
    figureImage.removeAttribute("src");
    figureCaption.innerHTML = "";
  }

  function renderQuestao() {
    const questaoAtual = lista[atual];
    const disciplina = disciplinas[disciplinaSelect.value];
    const assunto = assuntoAtual();
    const subassunto = subassuntoAtual();

    feedback.className = "quiz-feedback d-none";
    esconderResolucao();
    tema.textContent = subassunto
      ? disciplina.label + " - " + assunto.label + " - " + subassunto.label
      : disciplina.label + " - " + assunto.label;
    fonte.innerHTML = questaoAtual.origem + " - " + questaoAtual.banca;
    codigo.innerHTML = "C&oacute;digo da quest&atilde;o: " + questaoAtual.id;
    question.innerHTML = questaoAtual.enunciado;
    renderFigura(questaoAtual);
    options.innerHTML = "";

    questaoAtual.alternativas.forEach((alternativa, indice) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "option-custom";
      botao.innerHTML = questaoAtual.opcoesCurtas
        ? "Alternativa " + String.fromCharCode(65 + indice)
        : alternativa;
      botao.addEventListener("click", () => selecionarOpcao(indice));
      options.appendChild(botao);
    });

    const registroPersistido = registroHistoricoAtual();
    if (registroPersistido && registroPersistido.resolvida === true) {
      finalizadas[atual] = true;
      respondidas[atual] = Number(registroPersistido.alternativaMarcadaIndice) >= 0;
      questoesRegistradas[atual] = true;
      if (respondidas[atual] && Number.isInteger(Number(registroPersistido.alternativaMarcadaIndice))) {
        respostas[atual] = Number(registroPersistido.alternativaMarcadaIndice);
      }
    }

    atualizarProgressoBarra();

    if (finalizadas[atual]) {
      if (!respondidas[atual]) {
        feedback.className = "quiz-feedback d-none";
      } else {
        revelarGabarito();
        if (registroPersistido) {
          mostrarFeedback(registroPersistido.acertou ? "correct" : "incorrect", mensagemQuestaoPersistida(registroPersistido, questaoAtual));
        } else if (respostas[atual] === questaoAtual.correta) {
          mostrarFeedback("correct", "Resposta correta. Muito bem.");
        } else {
          mostrarFeedback("incorrect", "Resposta incorreta. Veja a alternativa correta em destaque.");
        }
        atualizarResolucao();
      }
    } else {
      feedback.className = "quiz-feedback d-none";
      esconderResolucao();
    }

    answerBtn.disabled = finalizadas[atual];
    atualizarScore();
  }

  async function mostrarResultado() {
    const total = lista.length;
    const acertos = pontuacaoAtual();
    const percentual = total ? Math.round((acertos / total) * 100) : 0;
    counter.innerHTML = "Sess&atilde;o conclu&iacute;da";
    codigo.innerHTML = "Resultado final";
    fonte.innerHTML = "Resumo da sess&atilde;o";
    question.innerHTML =
      '<div class="quiz-result"><span class="quiz-result-badge">' + percentual +
      '% de aproveitamento</span><p class="quiz-result-score">' + acertos + " de " + total +
      ' quest&otilde;es corretas</p><p class="mb-0">' +
      (percentual >= 60
        ? "Bom trabalho. Continue avan&ccedil;ando nos pr&oacute;ximos m&oacute;dulos."
        : "A base j&aacute; est&aacute; montada. Vale tentar novamente para melhorar.") +
      "</p></div>";
    options.innerHTML = "";
    figure.classList.add("d-none");
    feedback.className = "quiz-feedback d-none";
    esconderResolucao();
    prevBtn.disabled = true;
    advanceBtn.disabled = true;

    if (!sessaoRegistrada) {
      sessaoRegistrada = true;
      await registrarConclusaoDaLista();
    }
  }

  disciplinaSelect.addEventListener("change", () => {
    popularAssuntos();
    aviso.classList.add("d-none");
  });

  assuntoSelect.addEventListener("change", () => {
    popularSubassuntos();
    aviso.classList.add("d-none");
  });

  subassuntoSelect.addEventListener("change", () => {
    aviso.classList.add("d-none");
  });

  if (bancaFilter) {
    bancaFilter.querySelectorAll('input[name="banca"]').forEach((input) => {
      input.addEventListener("change", async () => {
        atualizarPillsBanca();
        aviso.classList.add("d-none");
        if (!container.classList.contains("d-none")) {
          await iniciarQuizSelecionado();
        }
      });
    });
    atualizarPillsBanca();
  }

  if (statusFilter) {
    statusFilter.querySelectorAll('input[name="statusQuestao"]').forEach((input) => {
      input.addEventListener("change", async () => {
        atualizarPillsStatus();
        aviso.classList.add("d-none");
        if (!container.classList.contains("d-none")) {
          await iniciarQuizSelecionado();
        }
      });
    });
    atualizarPillsStatus();
  }

  startBtn.addEventListener("click", async () => {
    await iniciarQuizSelecionado();
  });

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", async () => {
      await baixarPdfLista();
    });
  }

  answerBtn.addEventListener("click", async () => {
    await finalizarQuestao(false);
    answerBtn.disabled = finalizadas[atual];
  });

  advanceBtn.addEventListener("click", async () => {
    if (atual < lista.length - 1) {
      atual += 1;
      renderQuestao();
    } else {
      await mostrarResultado();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (atual === 0) return;
    atual -= 1;
    renderQuestao();
  });

  restartBtn.addEventListener("click", () => {
    container.classList.add("d-none");
    config.classList.remove("d-none");
    if (questoesHero) {
      questoesHero.classList.remove("is-hidden");
    }
    feedback.className = "quiz-feedback d-none";
    aviso.classList.add("d-none");
    esconderResolucao();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      await resetarListaAtual();
    });
  }

  if (resolutionBtn) {
    resolutionBtn.addEventListener("click", () => {
      if (!resolutionBox || resolutionBtn.classList.contains("d-none")) return;
      const aberta = !resolutionBox.classList.contains("d-none");
      resolutionBox.classList.toggle("d-none", aberta);
      resolutionBtn.textContent = aberta ? "Resolução escrita" : "Ocultar resolução";
    });
  }

  if (videoResolutionBtn) {
    videoResolutionBtn.addEventListener("click", () => {
      if (!videoResolutionBox || videoResolutionBtn.classList.contains("d-none")) return;
      const aberta = !videoResolutionBox.classList.contains("d-none");
      videoResolutionBox.classList.toggle("d-none", aberta);
      videoResolutionBtn.textContent = aberta ? "Resolução em vídeo" : "Ocultar vídeo";
    });
  }

  if (videoResolutionBox) {
    videoResolutionBox.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.closest("[data-video-close='true']")) return;
      videoResolutionBox.classList.add("d-none");
      if (videoResolutionBtn) {
        videoResolutionBtn.textContent = "Resolução em vídeo";
      }
    });
  }

  function aplicarFiltrosPendentes() {
    const filtros = ESTADO_QUIZ.filtrosPendentes;
    if (!filtros) return false;

    if (filtros.disciplina && disciplinas[filtros.disciplina]) {
      disciplinaSelect.value = filtros.disciplina;
      popularAssuntos();
    }

    if (filtros.assunto && assuntoSelect.querySelector('option[value="' + filtros.assunto + '"]')) {
      assuntoSelect.value = filtros.assunto;
      popularSubassuntos();
    }

    if (filtros.subassunto && subassuntoSelect.querySelector('option[value="' + filtros.subassunto + '"]')) {
      subassuntoSelect.value = filtros.subassunto;
    }

    const autoStart = !!filtros.autoStart;
    ESTADO_QUIZ.filtrosPendentes = null;
    return autoStart;
  }

  vincularBotoesQuizDirecionados(document, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn);
  renderizarTrilhasFisica(banco, iniciarQuizSelecionado, aplicarFiltrosPendentes, container, startBtn);

  HANDLERS_QUESTOES_ATUAIS = {
    iniciarQuizSelecionado,
    aplicarFiltrosPendentes,
    container,
    startBtn,
    popularDisciplinas,
    popularAssuntos,
    popularSubassuntos
  };

  popularDisciplinas();
  popularAssuntos();
  popularSubassuntos();
  if (aplicarFiltrosPendentes()) {
    await iniciarQuizSelecionado();
  }
}

async function garantirQuestoesInicializadas() {
  if (QUESTOES_INICIALIZADAS) return;
  if (QUESTOES_INICIALIZANDO) {
    await QUESTOES_INICIALIZANDO;
    return;
  }

  QUESTOES_INICIALIZANDO = iniciarQuestoes()
    .then(() => {
      QUESTOES_INICIALIZADAS = true;
    })
    .finally(() => {
      QUESTOES_INICIALIZANDO = null;
    });

  await QUESTOES_INICIALIZANDO;
}

async function recarregarBancoQuestoesAoVivo() {
  if (RECARREGANDO_BANCO_QUESTOES) return RECARREGANDO_BANCO_QUESTOES;

  RECARREGANDO_BANCO_QUESTOES = (async () => {
    try {
      BANCO_DINAMICO_CARREGADO = false;
      DETALHE_FISICA_ASSINATURA = "";
      const banco = await carregarBancoQuestoesGerenciado();

      try {
        const handlers = HANDLERS_QUESTOES_ATUAIS;
        if (handlers) {
          renderizarTrilhasFisica(
            banco,
            handlers.iniciarQuizSelecionado,
            handlers.aplicarFiltrosPendentes,
            handlers.container,
            handlers.startBtn
          );
          if (typeof handlers.popularDisciplinas === "function") handlers.popularDisciplinas();
          if (typeof handlers.popularAssuntos === "function") handlers.popularAssuntos();
          if (typeof handlers.popularSubassuntos === "function") handlers.popularSubassuntos();
        }
      } catch (erro) {
        console.warn("Falha ao re-renderizar trilhas apos atualizacao em tempo real.", erro);
      }
    } catch (erro) {
      console.warn("Falha ao recarregar banco em tempo real.", erro);
    } finally {
      RECARREGANDO_BANCO_QUESTOES = null;
    }
  })();

  return RECARREGANDO_BANCO_QUESTOES;
}

function agendarRecarregamentoBancoQuestoes() {
  if (typeof window === "undefined") return;
  window.clearTimeout(agendarRecarregamentoBancoQuestoes._timer);
  agendarRecarregamentoBancoQuestoes._timer = window.setTimeout(() => {
    void recarregarBancoQuestoesAoVivo();
  }, 250);
}

function ativarListenersTempoReal() {
  if (LISTENERS_TEMPO_REAL_ATIVOS) return;
  if (!window.authService) return;
  LISTENERS_TEMPO_REAL_ATIVOS = true;

  if (typeof window.authService.escutarMudancasCardsAulasApostilas === "function") {
    window.authService.escutarMudancasCardsAulasApostilas(() => {
      agendarRecarregamentoBancoQuestoes();
    });
  }

  if (typeof window.authService.escutarMudancasSubassuntos === "function") {
    window.authService.escutarMudancasSubassuntos(() => {
      agendarRecarregamentoBancoQuestoes();
    });
  }

  if (typeof window.authService.escutarMudancasQuestoes === "function") {
    window.authService.escutarMudancasQuestoes(() => {
      agendarRecarregamentoBancoQuestoes();
    });
  }

  if (typeof window.authService.escutarMudancasProvas === "function") {
    window.authService.escutarMudancasProvas(() => {
      if (typeof iniciarProvas === "function") {
        try { iniciarProvas(); } catch (_) {}
      }
    });
  }
}

function iniciarLoginComTransicao() {
  const login = document.getElementById("login-screen");
  const site = document.getElementById("site-content");
  const form = document.getElementById("loginForm");
  const erro = document.getElementById("login-error");
  const status = document.getElementById("login-status");
  const astro = document.getElementById("astronautWrapper");
  const overlay = document.getElementById("post-login-transition");
  const logoutBtn = document.getElementById("logoutBtn");
  const sidebarStudentName = document.getElementById("sidebarStudentName");
  const sidebarProfileTrigger = document.getElementById("sidebarProfileTrigger");
  const sidebarProfilePhoto = document.getElementById("sidebarProfilePhoto");
  const profileModal = document.getElementById("profileModal");
  const profileNameText = document.getElementById("profileNameText");
  const profileNome = document.getElementById("profileNome");
  const profileMatricula = document.getElementById("profileMatricula");
  const profileTurma = document.getElementById("profileTurma");
  const profilePhotoPreview = document.getElementById("profilePhotoPreview");
  const profileAvatarFallback = document.getElementById("profileAvatarFallback");
  const profilePhotoForm = document.getElementById("profilePhotoForm");
  const profilePhotoInput = document.getElementById("profilePhotoInput");
  const profilePasswordForm = document.getElementById("profilePasswordForm");
  const profileFeedback = document.getElementById("profileFeedback");
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const hintBox = form ? form.querySelector(".login-hint") : null;
  const adminLink = form ? form.querySelector('a[href="admin.html"]') : null;
  const passwordInput = document.getElementById("loginPassword");
  const passwordToggle = document.getElementById("loginPasswordToggle");

  if (!login || !site || !form) {
    document.body.classList.remove("auth-pending");
    return;
  }

  let authCallbackRecebido = false;
  let authBootTimer = null;

  function liberarTelaInicial() {
    document.body.classList.remove("auth-pending");
    if (authBootTimer) {
      window.clearTimeout(authBootTimer);
      authBootTimer = null;
    }
  }

  function mostrarLoginFallback(mensagem) {
    liberarTelaInicial();
    site.classList.add("d-none");
    site.classList.remove("d-flex", "site-enter");
    login.classList.remove("d-none", "login-exit");
    if (overlay) overlay.classList.remove("active");
    if (mensagem && erro) {
      erro.textContent = mensagem;
      erro.classList.remove("d-none");
    }
  }

  authBootTimer = window.setTimeout(() => {
    if (authCallbackRecebido) return;
    mostrarLoginFallback("A conexao demorou para responder. Tente entrar normalmente ou atualize a pagina se o problema continuar.");
  }, AUTH_BOOT_TIMEOUT_MS);

  if (hintBox) {
    hintBox.remove();
  }

  if (status) {
    status.remove();
  }

  if (adminLink) {
    const adminWrapper = adminLink.closest("p");
    if (adminWrapper) {
      adminWrapper.remove();
    }
  }

  if (passwordInput && passwordToggle) {
    passwordToggle.addEventListener("click", () => {
      const mostrar = passwordInput.type === "password";
      passwordInput.type = mostrar ? "text" : "password";
      passwordToggle.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
      passwordToggle.setAttribute("aria-pressed", mostrar ? "true" : "false");
      passwordToggle.innerHTML = '<i data-lucide="' + (mostrar ? "eye-off" : "eye") + '" aria-hidden="true"></i>';
      atualizarIconesLucide(passwordToggle);
    });
  }

  function atualizarNomeSidebar(nomeExibicao) {
    if (sidebarStudentName) {
      sidebarStudentName.textContent = nomeExibicao || "Aluno";
    }
  }

  function mostrarFeedbackPerfil(tipo, mensagem) {
    if (!profileFeedback) return;
    profileFeedback.textContent = mensagem;
    profileFeedback.classList.remove("d-none", "success", "error");
    profileFeedback.classList.add(tipo === "success" ? "success" : "error");
  }

  function atualizarFotoPerfil(foto) {
    const temFoto = Boolean(foto);
    if (sidebarProfilePhoto) {
      sidebarProfilePhoto.src = temFoto ? foto : "";
      sidebarProfilePhoto.classList.toggle("d-none", !temFoto);
    }
    if (profilePhotoPreview) {
      profilePhotoPreview.src = temFoto ? foto : "";
      profilePhotoPreview.classList.toggle("d-none", !temFoto);
    }
    if (profileAvatarFallback) {
      profileAvatarFallback.classList.toggle("d-none", temFoto);
    }
  }

  function atualizarPerfilModal() {
    const perfil = obterPerfilAtual() || {};
    const nome = (perfil.nome || perfil.matricula || "Aluno").trim();
    const matricula = perfil.matricula || "-";
    const turma = perfil.turma || "-";
    if (profileNameText) profileNameText.textContent = nome;
    if (profileNome) profileNome.textContent = nome;
    if (profileMatricula) profileMatricula.textContent = matricula;
    if (profileTurma) profileTurma.textContent = turma || "-";
    atualizarFotoPerfil(perfil.fotoPerfil || "");
  }

  function abrirPerfilModal() {
    if (!profileModal) return;
    atualizarPerfilModal();
    profileModal.classList.remove("d-none");
    profileModal.setAttribute("aria-hidden", "false");
  }

  function fecharPerfilModal() {
    if (!profileModal) return;
    profileModal.classList.add("d-none");
    profileModal.setAttribute("aria-hidden", "true");
    if (profileFeedback) profileFeedback.classList.add("d-none");
  }

  function otimizarImagemPerfil(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith("image/")) {
        reject(new Error("Envie uma imagem válida."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const tamanho = 320;
          const lado = Math.min(image.width, image.height);
          const sx = Math.max(0, (image.width - lado) / 2);
          const sy = Math.max(0, (image.height - lado) / 2);
          canvas.width = tamanho;
          canvas.height = tamanho;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, sx, sy, lado, lado, 0, 0, tamanho, tamanho);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        image.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        image.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
      reader.readAsDataURL(file);
    });
  }

  function abrirSite(nomeExibicao) {
    if (site.classList.contains("d-flex")) {
      atualizarNomeSidebar(nomeExibicao);
      navegarParaSecao(obterSecaoAlunoSalva());
      return;
    }

    erro.classList.add("d-none");
    login.classList.add("login-exit");
    overlay.classList.add("active");

    atualizarNomeSidebar(nomeExibicao);

    setTimeout(() => {
      login.classList.add("d-none");
      site.classList.remove("d-none");
      site.classList.add("d-flex");
      site.classList.add("site-enter");
      navegarParaSecao("inicio");
      setTimeout(() => {
        overlay.classList.remove("active");
      }, 900);
      setTimeout(() => {
        site.classList.remove("site-enter");
      }, 900);
    }, 2800);
  }

  if (login && astro) {
    login.addEventListener("mousemove", (ev) => {
      const rect = login.getBoundingClientRect();
      const x = (((ev.clientX - rect.left) / rect.width) - 0.5) * 26;
      const y = (((ev.clientY - rect.top) / rect.height) - 0.5) * 22;
      astro.style.transform = "translate(" + x + "px," + y + "px)";
    });

    login.addEventListener("mouseleave", () => {
      astro.style.transform = "translate(0,0)";
    });
  }

  function aplicarAvisoSessaoDuplicada() {
    if (!window.authService || typeof window.authService.consumirAvisoSessaoDuplicada !== "function") return;
    const avisoSessao = window.authService.consumirAvisoSessaoDuplicada();
    if (!avisoSessao) return;
    erro.textContent = "Sua conta foi acessada em outro dispositivo.";
    erro.classList.remove("d-none");
  }

  if (typeof window.authService !== "undefined") {
    window.authService.onAlunoAutenticado((perfil, detalhesAuth) => {
      authCallbackRecebido = true;
      if (!perfil) {
        liberarTelaInicial();
        site.classList.add("d-none");
        site.classList.remove("d-flex");
        login.classList.remove("d-none");
        if (detalhesAuth && detalhesAuth.erro && erro) {
          erro.textContent = "Nao foi possivel confirmar sua sessao agora. Entre novamente para continuar.";
          erro.classList.remove("d-none");
        }
        aplicarAvisoSessaoDuplicada();
        return;
      }

      ESTADO_ALUNO.perfil = perfil;
      atualizarPerfilModal();
      login.classList.add("d-none");
      site.classList.remove("d-none");
      site.classList.add("d-flex");
      abrirSite((perfil && perfil.nome) || perfil.matricula || "");
      iniciarDashboard();
      ativarListenersTempoReal();
      try {
        if (typeof window.recarregarTrilhaRelatividade === "function") {
          void window.recarregarTrilhaRelatividade();
        }
      } catch (_) {}
      liberarTelaInicial();
    });
  } else {
    window.setTimeout(() => {
      if (authCallbackRecebido) return;
      mostrarLoginFallback("Servico de login indisponivel neste carregamento. Atualize a pagina e tente novamente.");
    }, 1200);
  }

  aplicarAvisoSessaoDuplicada();

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const identificador = document.getElementById("loginMatricula").value.trim();
    const senha = document.getElementById("loginPassword").value.trim();

    if (typeof window.authService === "undefined" || !window.authService.estaConfigurado()) {
      erro.textContent = "Firebase ainda nao foi configurado neste projeto.";
      erro.classList.remove("d-none");
      return;
    }

    erro.classList.add("d-none");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Entrando...";
    }

    try {
      if (identificador.includes("@")) {
        await window.authService.entrarAdmin(identificador, senha);
        window.location.href = "admin.html";
        return;
      }

      await window.authService.entrarAluno(identificador, senha);
    } catch (error) {
      if (identificador.includes("@")) {
        erro.textContent = error && error.message ? error.message : "N\u00e3o foi poss\u00edvel entrar.";
      } else {
        erro.textContent = "Senha ou Matr\u00edcula incorreta.";
      }
      erro.classList.remove("d-none");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Entrar no universo";
      }
    }
  });

  if (logoutBtn && typeof window.authService !== "undefined") {
    logoutBtn.addEventListener("click", async () => {
      await window.authService.sair();
      window.location.reload();
    });
  }

  if (sidebarProfileTrigger) {
    sidebarProfileTrigger.addEventListener("click", abrirPerfilModal);
  }

  if (profileModal) {
    profileModal.querySelectorAll("[data-profile-close='true']").forEach((item) => {
      item.addEventListener("click", fecharPerfilModal);
    });
  }

  if (profilePhotoInput) {
    profilePhotoInput.addEventListener("change", async () => {
      const file = profilePhotoInput.files && profilePhotoInput.files[0];
      if (!file) return;
      try {
        const preview = await otimizarImagemPerfil(file);
        atualizarFotoPerfil(preview);
      } catch (erroImagem) {
        mostrarFeedbackPerfil("error", erroImagem.message || "Não foi possível carregar a imagem.");
      }
    });
  }

  if (profilePhotoForm) {
    profilePhotoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const file = profilePhotoInput && profilePhotoInput.files && profilePhotoInput.files[0];
      if (!file) {
        mostrarFeedbackPerfil("error", "Escolha uma imagem antes de salvar.");
        return;
      }
      if (!window.authService || typeof window.authService.atualizarFotoPerfilAlunoAtual !== "function") {
        mostrarFeedbackPerfil("error", "Serviço de perfil indisponível no momento.");
        return;
      }

      const botao = profilePhotoForm.querySelector("button[type='submit']");
      if (botao) {
        botao.disabled = true;
        botao.textContent = "Salvando...";
      }

      try {
        const foto = await otimizarImagemPerfil(file);
        const perfilAtualizado = await window.authService.atualizarFotoPerfilAlunoAtual(foto);
        ESTADO_ALUNO.perfil = perfilAtualizado;
        atualizarPerfilModal();
        mostrarFeedbackPerfil("success", "Foto atualizada com sucesso.");
        profilePhotoForm.reset();
      } catch (erroFoto) {
        mostrarFeedbackPerfil("error", erroFoto.message || "Não foi possível salvar a foto.");
      } finally {
        if (botao) {
          botao.disabled = false;
          botao.textContent = "Salvar foto";
        }
      }
    });
  }

  if (profilePasswordForm) {
    profilePasswordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const senhaAtual = document.getElementById("profileCurrentPassword").value;
      const novaSenha = document.getElementById("profileNewPassword").value;
      const confirmarSenha = document.getElementById("profileConfirmPassword").value;

      if (novaSenha !== confirmarSenha) {
        mostrarFeedbackPerfil("error", "A confirmação precisa ser igual à nova senha.");
        return;
      }
      if (novaSenha.length < 6) {
        mostrarFeedbackPerfil("error", "A nova senha precisa ter pelo menos 6 caracteres.");
        return;
      }
      if (!window.authService || typeof window.authService.atualizarSenhaAlunoAtual !== "function") {
        mostrarFeedbackPerfil("error", "Serviço de senha indisponível no momento.");
        return;
      }

      const botao = profilePasswordForm.querySelector("button[type='submit']");
      if (botao) {
        botao.disabled = true;
        botao.textContent = "Atualizando...";
      }

      try {
        await window.authService.atualizarSenhaAlunoAtual(senhaAtual, novaSenha);
        profilePasswordForm.reset();
        mostrarFeedbackPerfil("success", "Senha atualizada com sucesso.");
      } catch (erroSenha) {
        mostrarFeedbackPerfil("error", erroSenha.message || "Não foi possível atualizar a senha.");
      } finally {
        if (botao) {
          botao.disabled = false;
          botao.textContent = "Atualizar senha";
        }
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && profileModal && !profileModal.classList.contains("d-none")) {
      fecharPerfilModal();
    }
    if (event.key === "Escape") {
      fecharModalFlashcard();
    }
  });

  if (sidebarToggleBtn && site) {
    sidebarToggleBtn.addEventListener("click", () => {
      document.body.classList.add("sidebar-toggle-active");
      site.classList.toggle("sidebar-collapsed");
      sidebarToggleBtn.setAttribute("aria-label", site.classList.contains("sidebar-collapsed") ? "Expandir menu" : "Recolher menu");
      window.setTimeout(() => {
        document.body.classList.remove("sidebar-toggle-active");
      }, 260);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema(obterTemaSalvo(), false);
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      aplicarTema(document.body.classList.contains("light") ? "dark" : "light");
    });
  }

  if (PERFORMANCE_SUAVE) {
    document.body.classList.add("performance-lite");
  }
  iniciarDashboard();
  iniciarLoginComTransicao();
  atualizarIconesLucide();
  try {
    if (typeof window.iniciarTrilhaRelatividade === "function") {
      window.iniciarTrilhaRelatividade();
    }
  } catch (erroRelatividade) {
    console.error("Falha ao iniciar trilha gamificada de Relatividade Especial:", erroRelatividade);
  }
  mostrarTelaFisica("topics");
  const aquecerQuestoes = () => {
    void garantirQuestoesInicializadas();
  };
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(aquecerQuestoes, { timeout: 1500 });
  } else {
    window.setTimeout(aquecerQuestoes, PERFORMANCE_SUAVE ? 900 : 300);
  }
});

window.navegarParaSecao = navegarParaSecao;
