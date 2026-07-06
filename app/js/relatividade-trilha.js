/* Relatividade Especial - Trilha Gamificada */
(function () {
  "use strict";

  const MODULOS_META = [
    { id: 1, slug: "modulo1", titulo: "Relatividade Restrita", subtitulo: "Éter, Michelson-Morley, postulados e dilatação do tempo" },
    { id: 2, slug: "modulo2", titulo: "Fator de Lorentz", subtitulo: "Dedução geométrica de γ e contração do comprimento" },
    { id: 3, slug: "modulo3", titulo: "Massa e Energia", subtitulo: "E = mc², fusão nuclear e energia solar" },
    { id: 4, slug: "modulo4", titulo: "Radiação do Corpo Negro", subtitulo: "Catástrofe ultravioleta e quantização de Planck" },
    { id: 5, slug: "modulo5", titulo: "Átomo de Bohr", subtitulo: "Órbitas quantizadas e saltos quânticos" },
    { id: 6, slug: "modulo6", titulo: "Efeito Fotoelétrico", subtitulo: "Fótons de Einstein e Kmax = hf − Φ" }
  ];

  const QUIZZES_BASE = {
    modulo1: [
      {
        id: "modulo1-q1",
        titulo: "Quiz 1 – O éter luminífero",
        pergunta: "O que os cientistas do século XIX acreditavam ser necessário para a propagação da luz?",
        opcoes: ["O vácuo absoluto", "O campo gravitacional", "O éter luminífero", "O ar atmosférico"],
        correta: 2,
        xp: 20,
        feedback: "Correto! O éter luminífero era a hipótese aceita: um meio invisível que preencheria o espaço e serviria de suporte para as ondas de luz."
      },
      {
        id: "modulo1-q2",
        titulo: "Quiz 2 – Resultado de Michelson-Morley",
        pergunta: "Por que o resultado nulo de Michelson-Morley foi tão perturbador para a física clássica?",
        opcoes: ["Confirmou o éter como referencial absoluto.", "Não revelou o vento de éter esperado, enfraquecendo a ideia de repouso absoluto.", "Mostrou que a luz não era uma onda."],
        correta: 1,
        xp: 20,
        feedback: "O resultado nulo atacou diretamente a ideia de um meio absoluto detectável, abrindo caminho para a Relatividade Especial."
      },
      {
        id: "modulo1-q3",
        titulo: "Quiz 3 – Postulados de Einstein",
        pergunta: "Qual postulado de Einstein afirma que a velocidade da luz no vácuo é a mesma para todos os observadores inerciais?",
        opcoes: ["1º Postulado – Princípio da Relatividade", "2º Postulado – Constância da velocidade da luz", "Princípio da Equivalência"],
        correta: 1,
        xp: 20,
        feedback: "O 2º Postulado estabelece que c ≈ 3×10⁸ m/s é constante para qualquer observador inercial, independentemente do movimento da fonte."
      },
      {
        id: "modulo1-q4",
        titulo: "Quiz 4 – Dilatação do tempo",
        pergunta: "O que a dilatação do tempo prevê sobre o relógio de quem está em movimento em relação a um observador externo?",
        opcoes: ["O relógio de quem se move marca o tempo mais rápido.", "O relógio de quem se move marca o tempo mais devagar.", "Ambos os relógios sempre marcam o mesmo tempo."],
        correta: 1,
        xp: 20,
        feedback: "Correto: Δt = γΔt₀, com γ ≥ 1. O observador externo mede um tempo maior — o relógio do objeto em movimento parece mais lento."
      }
    ],
    modulo2: [
      {
        id: "modulo2-q1",
        titulo: "Quiz 1 – Relógio de luz",
        pergunta: "No relógio de luz em movimento (visão de Bruno), por que o caminho percorrido pela luz é maior do que no relógio em repouso?",
        opcoes: ["Porque a luz acelera quando o trem se move.", "Porque o trem se desloca enquanto a luz viaja, formando um caminho diagonal.", "Porque os espelhos se afastam um do outro."],
        correta: 1,
        xp: 20,
        feedback: "Exatamente. O deslocamento horizontal do trem cria um triângulo retângulo — a hipotenusa (caminho da luz) é maior que a altura L dos espelhos."
      },
      {
        id: "modulo2-q2",
        titulo: "Quiz 2 – Derivação de γ",
        pergunta: "Qual teorema matemático é suficiente para derivar o fator de Lorentz γ a partir do relógio de luz?",
        opcoes: ["Teorema de Tales", "Teorema de Pitágoras", "Teorema Fundamental do Cálculo"],
        correta: 1,
        xp: 20,
        feedback: "(c·Δt/2)² = L² + (v·Δt/2)² — essa relação entre os lados do triângulo do relógio de luz leva diretamente a γ = 1/√(1 − v²/c²)."
      },
      {
        id: "modulo2-q3",
        titulo: "Quiz 3 – Contração do comprimento",
        pergunta: "Se o fator de Lorentz de um objeto é γ = 4, qual é o comprimento medido por um observador externo em relação ao comprimento próprio L₀?",
        opcoes: ["4L₀", "L₀/4", "L₀ × √4"],
        correta: 1,
        xp: 20,
        feedback: "L = L₀/γ, portanto L = L₀/4. O observador externo mede um comprimento menor — o objeto parece contraído na direção do movimento."
      }
    ],
    modulo3: [
      {
        id: "modulo3-q1",
        titulo: "Quiz 1 – Energia de repouso",
        pergunta: "O que representa a energia E₀ = mc² de um objeto?",
        opcoes: ["A energia cinética do objeto em movimento.", "A energia intrínseca que o objeto possui mesmo estando em repouso.", "A energia potencial gravitacional do objeto."],
        correta: 1,
        xp: 20,
        feedback: "E₀ = mc² é a energia de repouso — a energia intrínseca associada à massa, mesmo quando o objeto não está se movendo."
      },
      {
        id: "modulo3-q2",
        titulo: "Quiz 2 – Defecto de massa",
        pergunta: "Na fusão nuclear, o que acontece com a diferença de massa Δm entre reagentes e produto?",
        opcoes: ["É perdida para o ambiente sem utilidade.", "É convertida em energia pela equação E = Δm·c².", "Se acumula no núcleo formado como energia potencial."],
        correta: 1,
        xp: 20,
        feedback: "Correto! O defecto de massa Δm é convertido em energia cinética e radiação eletromagnética via E = Δm·c²."
      },
      {
        id: "modulo3-q3",
        titulo: "Quiz 3 – Energia do Sol",
        pergunta: "Por que o Sol libera uma quantidade tão enorme de energia (~4×10²⁶ W)?",
        opcoes: ["Por combustão química de hidrogênio.", "Pela fusão nuclear, onde o defecto de massa é convertido em energia via E = Δm·c².", "Pela fissão nuclear de urânio no seu núcleo."],
        correta: 1,
        xp: 20,
        feedback: "O Sol converte ~4 milhões de toneladas de massa em energia por segundo pela fusão nuclear — a equação E = mc² explica exatamente isso."
      }
    ],
    modulo4: [
      {
        id: "modulo4-q1",
        titulo: "Quiz 1 – Catástrofe ultravioleta",
        pergunta: "O que a física clássica (Lei de Rayleigh-Jeans) previa incorretamente sobre a radiação do corpo negro?",
        opcoes: ["Que a intensidade teria um pico e depois cairia.", "Que a intensidade cresceria sem limite para comprimentos de onda pequenos (UV).", "Que corpos negros não emitiriam radiação visível."],
        correta: 1,
        xp: 20,
        feedback: "A Lei de Rayleigh-Jeans previa uma divergência no ultravioleta — a chamada catástrofe ultravioleta — que claramente não acontece na realidade."
      },
      {
        id: "modulo4-q2",
        titulo: "Quiz 2 – Hipótese de Planck",
        pergunta: "O que Max Planck propôs para resolver a catástrofe ultravioleta?",
        opcoes: ["Que a luz viaja em ondas contínuas sem limite de frequência.", "Que a energia só pode ser emitida em pacotes discretos (quanta) com E = hf.", "Que o corpo negro reflete toda a radiação ultravioleta."],
        correta: 1,
        xp: 20,
        feedback: "Planck propôs a quantização: E = hf. Quanto maior a frequência, maior o pacote mínimo de energia — isso limita naturalmente a emissão no ultravioleta."
      },
      {
        id: "modulo4-q3",
        titulo: "Quiz 3 – Constante de Planck",
        pergunta: "Na fórmula E = hf, o que representa a constante h?",
        opcoes: ["A frequência da radiação emitida.", "A constante de Planck: h ≈ 6,63 × 10⁻³⁴ J·s, que define o tamanho mínimo de um quantum de energia.", "A velocidade da luz no vácuo."],
        correta: 1,
        xp: 20,
        feedback: "h ≈ 6,63 × 10⁻³⁴ J·s é a constante de Planck — ela define a granularidade da energia eletromagnética."
      }
    ],
    modulo5: [
      {
        id: "modulo5-q1",
        titulo: "Quiz 1 – Paradoxo clássico",
        pergunta: "Por que a física clássica previa que o átomo seria instável e colapsaria?",
        opcoes: ["Porque o núcleo repele os elétrons.", "Porque o elétron em órbita circular está em aceleração e, classicamente, deveria irradiar energia e espiralar para o núcleo.", "Porque a gravidade atrairia o elétron para o núcleo."],
        correta: 1,
        xp: 20,
        feedback: "Correto. O eletromagnetismo clássico exige que cargas aceleradas irradiem. O elétron em órbita perde energia continuamente e o colapso seria inevitável em ~10⁻¹⁰ s."
      },
      {
        id: "modulo5-q2",
        titulo: "Quiz 2 – 1º Postulado de Bohr",
        pergunta: "O que diz o 1º postulado de Bohr sobre o elétron?",
        opcoes: ["O elétron pode ocupar qualquer órbita e sempre emite radiação.", "O elétron só pode existir em órbitas estacionárias específicas (n = 1, 2, 3…), sem emitir energia enquanto nelas permanece.", "O elétron se move em linha reta e só muda quando colidido."],
        correta: 1,
        xp: 20,
        feedback: "As órbitas estacionárias são a resposta de Bohr ao paradoxo clássico — nelas, o elétron não irradia e o átomo permanece estável."
      },
      {
        id: "modulo5-q3",
        titulo: "Quiz 3 – Saltos quânticos",
        pergunta: "Quando um elétron salta de n=3 para n=2, o que é emitido e com que energia?",
        opcoes: ["Um nêutron com energia E₃ + E₂.", "Um fóton com energia E_fóton = hf = E₃ − E₂.", "Um elétron com energia igual a E₃."],
        correta: 1,
        xp: 20,
        feedback: "Ao decair para um nível menor, o elétron emite um fóton cuja energia é exatamente a diferença entre os dois níveis: E = hf = E₃ − E₂."
      }
    ],
    modulo6: [
      {
        id: "modulo6-q1",
        titulo: "Quiz 1 – O que importa no efeito fotoelétrico",
        pergunta: "O que determina se elétrons são ejetados no efeito fotoelétrico?",
        opcoes: ["A intensidade da luz (quanto mais intensa, mais elétrons energéticos).", "A frequência da luz (precisa superar a frequência de corte).", "A cor da superfície metálica."],
        correta: 1,
        xp: 20,
        feedback: "É a frequência que importa. Se hf < Φ (função trabalho), nenhum elétron é ejetado — independente da intensidade."
      },
      {
        id: "modulo6-q2",
        titulo: "Quiz 2 – Função trabalho",
        pergunta: "O que é a função trabalho Φ na fórmula Kmax = hf − Φ?",
        opcoes: ["A energia cinética máxima dos elétrons ejetados.", "A energia mínima necessária para arrancar um elétron do metal.", "A frequência de corte da luz incidente."],
        correta: 1,
        xp: 20,
        feedback: "Φ é a energia de ligação do elétron ao metal — o fóton precisa fornecer pelo menos Φ para ejetar o elétron. O excesso vira energia cinética."
      },
      {
        id: "modulo6-q3",
        titulo: "Quiz 3 – Intensidade vs. frequência",
        pergunta: "Se dobrarmos a intensidade da luz sem mudar a frequência, o que acontece com a energia cinética de cada elétron ejetado?",
        opcoes: ["A energia cinética de cada elétron dobra.", "A energia cinética de cada elétron não muda — apenas mais elétrons são ejetados.", "Nenhum elétron é ejetado com intensidade maior."],
        correta: 1,
        xp: 20,
        feedback: "Mais intensidade = mais fótons = mais elétrons ejetados. Mas cada fóton tem a mesma energia hf, então cada elétron tem a mesma Kmax = hf − Φ."
      }
    ]
  };

  const CONQUISTAS = [
    { id: "primeiro-passo", titulo: "Primeiro passo", desc: "Complete o primeiro módulo", tone: "amber", icon: "star", xp: 50, check: (s) => (s.modulosConcluidos || []).length >= 1 },
    { id: "em-busca", titulo: "Em busca do conhecimento", desc: "Acerte 3 quizzes seguidos", tone: "purple", icon: "target", xp: 30, check: (s) => (s.maxQuizSeguidos || 0) >= 3 },
    { id: "foco-poder", titulo: "Foco é poder", desc: "Estude por 7 dias seguidos", tone: "cyan", icon: "flame", xp: 100, check: (s) => (s.diasFoco || 0) >= 7 },
    { id: "mestre", titulo: "Mestre da Relatividade", desc: "Complete todos os módulos", tone: "emerald", icon: "award", xp: 200, check: (s) => (s.modulosConcluidos || []).length >= 6 }
  ];

  const XP_PARTE = 10;
  const XP_QUIZ = 20;
  const XP_MODULO = 50;
  const XP_BONUS_PERFEITO = 20;

  const PARTES_POR_MODULO = {};
  let CONTROLLER_INICIADO = false;
  let MODULO_ATUAL = null;
  let PROGRESSO = null;
  let PROGRESSO_SALVANDO = null;
  let FOCUS_MODE = false;

  function el(id) { return document.getElementById(id); }

  function progressoVazio() {
    return {
      moduloAtual: 1,
      partesConcluidas: {},
      quizzesConcluidos: {},
      quizzesAcertos: {},
      modulosDesbloqueados: [1],
      modulosConcluidos: [],
      xpTotal: 0,
      nivel: 1,
      diasFoco: 0,
      sequencia: 0,
      maxQuizSeguidos: 0,
      ultimoQuizCorreto: 0,
      ultimoAcessoData: null,
      iniciada: false
    };
  }

  function calcularNivel(xp) {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 450) return 3;
    if (xp < 700) return 4;
    if (xp < 1000) return 5;
    if (xp < 1350) return 6;
    if (xp < 1750) return 7;
    if (xp < 2200) return 8;
    if (xp < 2700) return 9;
    if (xp < 3250) return 10;
    if (xp < 3850) return 11;
    if (xp < 4500) return 12;
    return 13 + Math.floor((xp - 4500) / 700);
  }

  function xpParaNivel(nivel) {
    const tabela = [0,100,250,450,700,1000,1350,1750,2200,2700,3250,3850,4500];
    if (nivel < tabela.length) return tabela[nivel] || 0;
    return 4500 + (nivel - 12) * 700;
  }

  function fmtNumero(n) {
    return Number(n || 0).toLocaleString("pt-BR");
  }

  function dividirEmPartes(htmlOriginal, qtdAlvo) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlOriginal || "";
    const filhos = Array.from(wrapper.children);
    const studyModule = filhos.find((f) => f.classList && f.classList.contains("study-module"));
    const fonte = studyModule || wrapper;
    const blocos = Array.from(fonte.children).filter((b) => {
      if (!b.classList) return true;
      if (b.classList.contains("study-module-header")) return false;
      if (b.tagName === "FORM") return false;
      return true;
    });
    if (!blocos.length) return [fonte.innerHTML || ""];
    const total = blocos.length;
    const alvo = Math.max(1, Math.min(qtdAlvo || 4, total));
    const tamanho = Math.ceil(total / alvo);
    const partes = [];
    for (let i = 0; i < total; i += tamanho) {
      const grupo = blocos.slice(i, i + tamanho);
      partes.push(grupo.map((g) => g.outerHTML).join(""));
    }
    return partes;
  }

  function carregarConteudoModulos() {
    MODULOS_META.forEach((meta) => {
      const fonte = el(meta.slug);
      const html = fonte ? fonte.innerHTML : "";
      const qtdAlvo = meta.id === 1 ? 4 : 2;
      PARTES_POR_MODULO[meta.id] = dividirEmPartes(html, qtdAlvo);
    });
  }

  function obterPerfilUid() {
    if (typeof ESTADO_ALUNO !== "undefined" && ESTADO_ALUNO && ESTADO_ALUNO.perfil && ESTADO_ALUNO.perfil.uid) {
      return ESTADO_ALUNO.perfil.uid;
    }
    return "anonimo";
  }

  function chaveLocalProgresso() {
    return "rel_trilha_progresso_" + obterPerfilUid();
  }

  function carregarProgressoLocal() {
    try {
      const dado = localStorage.getItem(chaveLocalProgresso());
      if (!dado) return null;
      const obj = JSON.parse(dado);
      return Object.assign(progressoVazio(), obj || {});
    } catch (_) { return null; }
  }

  function salvarProgressoLocal(p) {
    try { localStorage.setItem(chaveLocalProgresso(), JSON.stringify(p)); } catch (_) {}
  }

  async function carregarProgresso() {
    const local = carregarProgressoLocal() || progressoVazio();
    PROGRESSO = local;
    const uid = obterPerfilUid();
    console.debug("[Trilha Relatividade] Carregando progresso para uid:", uid);
    if (uid && uid !== "anonimo" && window.authService && typeof window.authService.carregarTrilhaRelatividadeAluno === "function") {
      try {
        const remoto = await window.authService.carregarTrilhaRelatividadeAluno(uid);
        if (remoto && typeof remoto === "object") {
          PROGRESSO = Object.assign(progressoVazio(), remoto);
          salvarProgressoLocal(PROGRESSO);
          console.debug("[Trilha Relatividade] Progresso carregado do Firestore.");
        } else {
          console.debug("[Trilha Relatividade] Nenhum progresso remoto encontrado. Usando local.");
        }
      } catch (erro) {
        console.warn("[Trilha Relatividade] Falha ao carregar do Firestore. Usando local:", erro);
      }
    }
    atualizarSequenciaDiaria();
    return PROGRESSO;
  }

  function atualizarSequenciaDiaria() {
    if (!PROGRESSO) return;
    const hoje = new Date().toISOString().slice(0,10);
    if (PROGRESSO.ultimoAcessoData === hoje) return;
    if (PROGRESSO.ultimoAcessoData) {
      const ontem = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      if (PROGRESSO.ultimoAcessoData === ontem) {
        PROGRESSO.diasFoco = (PROGRESSO.diasFoco || 0) + 1;
        PROGRESSO.sequencia = (PROGRESSO.sequencia || 0) + 1;
      } else {
        PROGRESSO.diasFoco = 1;
        PROGRESSO.sequencia = 1;
      }
    } else {
      PROGRESSO.diasFoco = 1;
      PROGRESSO.sequencia = 1;
    }
    PROGRESSO.ultimoAcessoData = hoje;
    salvarProgresso();
  }

  let SALVAMENTO_PENDENTE = false;
  function salvarProgresso() {
    if (!PROGRESSO) return;
    salvarProgressoLocal(PROGRESSO);
    if (!window.authService || typeof window.authService.salvarTrilhaRelatividadeAluno !== "function") return;
    const uid = obterPerfilUid();
    if (!uid || uid === "anonimo") return;
    if (PROGRESSO_SALVANDO) { SALVAMENTO_PENDENTE = true; return; }
    const dispararSave = () => {
      const snapshot = JSON.parse(JSON.stringify(PROGRESSO));
      PROGRESSO_SALVANDO = window.authService.salvarTrilhaRelatividadeAluno(uid, snapshot)
        .then((ok) => {
          if (ok === false) console.warn("[Trilha Relatividade] Save remoto retornou falso. Verifique permissoes no Firestore.");
          else console.debug("[Trilha Relatividade] Progresso salvo no Firestore.");
        })
        .catch((erro) => {
          console.error("[Trilha Relatividade] Falha ao salvar no Firestore:", erro);
        })
        .finally(() => {
          PROGRESSO_SALVANDO = null;
          if (SALVAMENTO_PENDENTE) {
            SALVAMENTO_PENDENTE = false;
            dispararSave();
          }
        });
    };
    dispararSave();
  }

  function partesDoModulo(idMod) { return PARTES_POR_MODULO[idMod] || [""]; }
  function totalPartes(idMod) { return partesDoModulo(idMod).length; }
  function quizzesDoModulo(idMod) { return QUIZZES_BASE["modulo" + idMod] || []; }

  function moduloEstaCompleto(idMod) {
    const partesFeitas = (PROGRESSO.partesConcluidas[idMod] || []).length;
    const totalP = totalPartes(idMod);
    if (partesFeitas < totalP) return false;
    const quizzesIds = quizzesDoModulo(idMod).map((q) => q.id);
    const concluidos = PROGRESSO.quizzesConcluidos || {};
    return quizzesIds.every((id) => concluidos[id]);
  }

  function moduloEmAndamento(idMod) {
    const partesFeitas = (PROGRESSO.partesConcluidas[idMod] || []).length;
    return partesFeitas > 0 && !moduloEstaCompleto(idMod);
  }

  function progressoModuloPct(idMod) {
    const totalP = totalPartes(idMod);
    const totalQ = quizzesDoModulo(idMod).length;
    const total = totalP + totalQ;
    if (!total) return 0;
    const partesFeitas = (PROGRESSO.partesConcluidas[idMod] || []).length;
    const concluidos = PROGRESSO.quizzesConcluidos || {};
    const quizzesFeitos = quizzesDoModulo(idMod).filter((q) => concluidos[q.id]).length;
    return Math.round(((partesFeitas + quizzesFeitos) / total) * 100);
  }

  function moduloEstaDesbloqueado(idMod) {
    return (PROGRESSO.modulosDesbloqueados || []).indexOf(idMod) !== -1;
  }

  function ganharXp(qtd) {
    PROGRESSO.xpTotal = (PROGRESSO.xpTotal || 0) + Number(qtd || 0);
    PROGRESSO.nivel = calcularNivel(PROGRESSO.xpTotal);
  }

  function concluirParte(idMod, indiceParte) {
    if (!PROGRESSO.partesConcluidas[idMod]) PROGRESSO.partesConcluidas[idMod] = [];
    if (PROGRESSO.partesConcluidas[idMod].indexOf(indiceParte) !== -1) return;
    PROGRESSO.partesConcluidas[idMod].push(indiceParte);
    ganharXp(XP_PARTE);
  }

  function concluirQuiz(idQuiz, idMod, acertou) {
    const concluidos = PROGRESSO.quizzesConcluidos || (PROGRESSO.quizzesConcluidos = {});
    if (concluidos[idQuiz]) return;
    concluidos[idQuiz] = true;
    PROGRESSO.quizzesAcertos[idQuiz] = !!acertou;
    if (acertou) {
      ganharXp(XP_QUIZ);
      PROGRESSO.ultimoQuizCorreto = (PROGRESSO.ultimoQuizCorreto || 0) + 1;
      PROGRESSO.maxQuizSeguidos = Math.max(PROGRESSO.maxQuizSeguidos || 0, PROGRESSO.ultimoQuizCorreto);
    } else {
      PROGRESSO.ultimoQuizCorreto = 0;
    }
    if (moduloEstaCompleto(idMod)) {
      if ((PROGRESSO.modulosConcluidos || []).indexOf(idMod) === -1) {
        PROGRESSO.modulosConcluidos.push(idMod);
        ganharXp(XP_MODULO);
        const acertosMod = quizzesDoModulo(idMod).every((q) => PROGRESSO.quizzesAcertos[q.id]);
        if (acertosMod) ganharXp(XP_BONUS_PERFEITO);
        const proximo = idMod + 1;
        if (proximo <= 6 && PROGRESSO.modulosDesbloqueados.indexOf(proximo) === -1) {
          PROGRESSO.modulosDesbloqueados.push(proximo);
        }
      }
    }
  }

  function escolherIconeLucide(nome) {
    const i = document.createElement("i");
    i.setAttribute("data-lucide", nome);
    return i.outerHTML;
  }

  function renderHome() {
    const lista = el("relHomeModulosLista");
    if (!lista) return;
    const totalConcluidos = (PROGRESSO.modulosConcluidos || []).length;
    const xpTotal = PROGRESSO.xpTotal || 0;
    const xpAlvo = 1200;
    const pct = Math.min(100, Math.round((totalConcluidos / 6) * 100));

    lista.innerHTML = MODULOS_META.map((meta) => {
      const desbloqueado = moduloEstaDesbloqueado(meta.id);
      const concluido = (PROGRESSO.modulosConcluidos || []).indexOf(meta.id) !== -1;
      const partesFeitas = (PROGRESSO.partesConcluidas[meta.id] || []).length;
      const totalP = totalPartes(meta.id);
      const isCurrent = desbloqueado && !concluido;
      let classe = "rel-home-module";
      if (concluido) classe += " is-completed";
      else if (isCurrent) classe += " is-current";
      if (!desbloqueado) classe += " is-locked";
      const status = concluido
        ? '<small class="rel-home-module-sub">Concluído</small>'
        : (desbloqueado
            ? (partesFeitas > 0
                ? '<small class="rel-home-module-sub">' + partesFeitas + " / " + totalP + ' partes</small><span class="rel-home-module-status">Em andamento</span>'
                : '<small class="rel-home-module-sub">' + meta.subtitulo + '</small><span class="rel-home-module-status">Disponível</span>')
            : '<small class="rel-home-module-sub">Complete o módulo anterior</small>');
      return '<div class="' + classe + '" data-modulo-id="' + meta.id + '" role="listitem">' +
        '<div class="rel-home-module-num">' + meta.id + '</div>' +
        '<div class="rel-home-module-title">' + meta.titulo + '</div>' +
        status +
        '</div>';
    }).join("");

    lista.querySelectorAll("[data-modulo-id]").forEach((card) => {
      const id = Number(card.getAttribute("data-modulo-id"));
      card.addEventListener("click", () => {
        if (!moduloEstaDesbloqueado(id)) return;
        abrirModulo(id);
      });
    });

    const ringPct = el("relProgressRingPctHome");
    const ring = el("relProgressRingHome");
    if (ring) ring.style.setProperty("--rel-progress", (pct * 3.6) + "deg");
    if (ringPct) ringPct.textContent = pct + "%";
    const modulosTxt = el("relProgressModulosHome");
    if (modulosTxt) modulosTxt.textContent = totalConcluidos + "/6";
    const xpTxt = el("relProgressXpHome");
    if (xpTxt) xpTxt.textContent = fmtNumero(xpTotal) + "/" + fmtNumero(xpAlvo);

    const seq = el("relStatSequenciaHome");
    if (seq) seq.textContent = PROGRESSO.sequencia || 0;
    const dias = el("relStatDiasFocoHome");
    if (dias) dias.textContent = PROGRESSO.diasFoco || 0;
    const niv = el("relStatNivelHome");
    if (niv) niv.textContent = PROGRESSO.nivel || 1;

    const totalQuizzes = MODULOS_META.reduce((a, m) => a + quizzesDoModulo(m.id).length, 0);
    const elQ = el("relMetaQuizzes");
    if (elQ) elQ.textContent = totalQuizzes;

    const btn = el("relIniciarTrilhaBtn");
    const lbl = el("relIniciarTrilhaLabel");
    if (btn && lbl) {
      const proximo = encontrarProximoModulo();
      lbl.textContent = (PROGRESSO.iniciada && proximo) ? ("Continuar módulo " + proximo) : "Iniciar trilha";
    }

    if (typeof atualizarIconesLucide === "function") atualizarIconesLucide(el("relTrilhaGamificada"));
    else if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();

    const nome = (typeof ESTADO_ALUNO !== "undefined" && ESTADO_ALUNO.perfil && ESTADO_ALUNO.perfil.nome)
      ? String(ESTADO_ALUNO.perfil.nome).split(" ")[0] : "Aluno";
    const elNome = el("relSaudacaoNome");
    if (elNome) elNome.textContent = nome;
  }

  function encontrarProximoModulo() {
    for (let i = 0; i < MODULOS_META.length; i++) {
      const id = MODULOS_META[i].id;
      if (moduloEstaDesbloqueado(id) && !moduloEstaCompleto(id)) return id;
    }
    return null;
  }

  function abrirModulo(idMod) {
    PROGRESSO.iniciada = true;
    PROGRESSO.moduloAtual = idMod;
    salvarProgresso();
    const partesFeitas = PROGRESSO.partesConcluidas[idMod] || [];
    const proximaParte = Math.min(partesFeitas.length, totalPartes(idMod) - 1);
    MODULO_ATUAL = { id: idMod, parteVisivel: proximaParte };
    mostrarTela("modulo");
    renderModulo();
  }

  function mostrarTela(qual) {
    const root = el("relTrilhaGamificada");
    if (!root) return;
    root.setAttribute("data-rel-view", qual);
    const home = root.querySelector('[data-rel-screen="home"]');
    const mod = root.querySelector('[data-rel-screen="modulo"]');
    if (home) home.classList.toggle("d-none", qual !== "home");
    if (mod) mod.classList.toggle("d-none", qual !== "modulo");
  }

  function renderModulo() {
    if (!MODULO_ATUAL) return;
    const idMod = MODULO_ATUAL.id;
    const meta = MODULOS_META.find((m) => m.id === idMod) || MODULOS_META[0];
    const partes = partesDoModulo(idMod);
    const totalP = partes.length;
    const partesFeitas = PROGRESSO.partesConcluidas[idMod] || [];
    const parteAtualIdx = MODULO_ATUAL.parteVisivel;
    const xpTotal = PROGRESSO.xpTotal || 0;
    const nivel = PROGRESSO.nivel || 1;

    const tag = el("relModTag");
    if (tag) tag.textContent = "MÓDULO " + idMod + " / PARTE " + (parteAtualIdx + 1) + " DE " + totalP;
    const tit = el("relModTitulo");
    if (tit) tit.textContent = meta.titulo + ": " + meta.subtitulo;

    const cont = el("relModConteudo");
    if (cont) {
      const partesParaMostrar = partes.slice(0, parteAtualIdx + 1);
      cont.innerHTML = partesParaMostrar.map((html, idx) => {
        const ehAtual = idx === parteAtualIdx;
        return '<div class="rel-mod-part" data-parte-idx="' + idx + '"' + (ehAtual ? ' data-current="true"' : '') + '>' + html + '</div>';
      }).join("");
    }

    const btnContinuar = el("relContinuarLeituraBtn");
    const ind = el("relParteIndicador");
    if (ind) ind.textContent = "Parte " + (parteAtualIdx + 1) + " de " + totalP;
    if (btnContinuar) {
      const ehUltima = parteAtualIdx >= totalP - 1;
      btnContinuar.disabled = false;
      if (ehUltima) {
        const partesJaFeitas = partesFeitas.length;
        if (partesJaFeitas >= totalP) {
          btnContinuar.querySelector("span").textContent = "Leitura concluída";
          btnContinuar.disabled = true;
        } else {
          btnContinuar.querySelector("span").textContent = "Concluir leitura";
        }
      } else {
        btnContinuar.querySelector("span").textContent = "Continuar leitura";
      }
    }

    const quizzes = quizzesDoModulo(idMod);
    const quizCont = el("relModQuizzes");
    if (quizCont) {
      const partesTodasFeitas = (PROGRESSO.partesConcluidas[idMod] || []).length >= totalP;
      quizCont.innerHTML = quizzes.map((q, qIdx) => renderQuizCard(q, idMod, qIdx, partesTodasFeitas)).join("");
      quizCont.querySelectorAll("[data-rel-quiz-option]").forEach((btn) => {
        btn.addEventListener("click", onQuizOptionClick);
      });
    }

    renderSidebarModulos();
    atualizarPainelDireitoModulo();

    if (typeof atualizarIconesLucide === "function") atualizarIconesLucide(el("relTrilhaGamificada"));
    else if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();

    salvarProgresso();
  }

  function renderQuizCard(q, idMod, qIdx, liberado) {
    const concluido = !!(PROGRESSO.quizzesConcluidos || {})[q.id];
    const acertou = !!(PROGRESSO.quizzesAcertos || {})[q.id];
    const klass = "rel-quiz-card" + (concluido ? (acertou ? " is-correct" : " is-done") : "") + (!liberado ? " is-locked" : "");
    const status = concluido ? '<span class="rel-quiz-status-pill is-done">Concluído</span>' : '<span class="rel-quiz-status-pill is-pending">Pendente</span>';
    const xpLabel = '<span class="rel-quiz-xp">+' + (q.xp || XP_QUIZ) + ' XP</span>';
    const letras = ["A","B","C","D","E"];
    const opcoes = q.opcoes.map((op, idx) => {
      let cls = "rel-quiz-option";
      if (concluido) {
        if (idx === q.correta) cls += " is-correct";
        else cls += "";
      }
      const disabled = concluido ? "disabled" : "";
      return '<button type="button" class="' + cls + '" data-rel-quiz-option data-quiz-id="' + q.id + '" data-modulo-id="' + idMod + '" data-opcao-idx="' + idx + '" ' + disabled + '><span class="rel-quiz-option-letter">' + letras[idx] + '</span><span>' + op + '</span></button>';
    }).join("");
    const feedback = concluido
      ? ('<div class="rel-quiz-feedback ' + (acertou ? "is-correct" : "is-wrong") + '">' + q.feedback + '</div>')
      : "";
    return '<article class="' + klass + '" data-quiz-id="' + q.id + '">' +
      '<header class="rel-quiz-head"><strong>' + (q.titulo || "Quiz " + (qIdx + 1)) + '</strong>' +
      '<div class="rel-quiz-status">' + status + xpLabel + '</div></header>' +
      '<p class="rel-quiz-question">' + (qIdx + 1) + '. ' + q.pergunta + '</p>' +
      '<div class="rel-quiz-options">' + opcoes + '</div>' +
      feedback +
      '</article>';
  }

  function onQuizOptionClick(ev) {
    const btn = ev.currentTarget;
    const idQuiz = btn.getAttribute("data-quiz-id");
    const idMod = Number(btn.getAttribute("data-modulo-id"));
    const idx = Number(btn.getAttribute("data-opcao-idx"));
    const quizzes = quizzesDoModulo(idMod);
    const quiz = quizzes.find((q) => q.id === idQuiz);
    if (!quiz) return;
    if ((PROGRESSO.quizzesConcluidos || {})[idQuiz]) return;
    const partesTodasFeitas = (PROGRESSO.partesConcluidas[idMod] || []).length >= totalPartes(idMod);
    if (!partesTodasFeitas) return;
    const acertou = idx === quiz.correta;
    concluirQuiz(idQuiz, idMod, acertou);
    salvarProgresso();
    renderModulo();
  }

  function renderSidebarModulos() {
    const ul = el("relModSidebarList");
    if (!ul) return;
    ul.innerHTML = MODULOS_META.map((meta) => {
      const desbloqueado = moduloEstaDesbloqueado(meta.id);
      const concluido = (PROGRESSO.modulosConcluidos || []).indexOf(meta.id) !== -1;
      const ativo = MODULO_ATUAL && MODULO_ATUAL.id === meta.id;
      const pct = progressoModuloPct(meta.id);
      let cls = "";
      if (ativo) cls += " is-active";
      if (concluido) cls += " is-completed";
      if (!desbloqueado) cls += " is-locked";
      const sub = concluido ? "100%" : (desbloqueado ? (pct > 0 ? pct + "%" : "Disponível") : "Bloqueado");
      const barra = (desbloqueado && pct > 0 && !concluido)
        ? '<div class="rel-mod-info-bar"><div style="width:' + pct + '%"></div></div>'
        : (concluido ? '<div class="rel-mod-info-bar"><div style="width:100%"></div></div>' : "");
      return '<li class="' + cls.trim() + '" data-modulo-id="' + meta.id + '">' +
        '<span class="rel-mod-num">' + meta.id + '</span>' +
        '<div class="rel-mod-info"><strong>' + meta.titulo + '</strong><small>' + meta.subtitulo + '</small>' + barra +
        (desbloqueado ? '<span class="rel-mod-info-pct">' + sub + '</span>' : '<span class="rel-mod-info-pct">' + sub + '</span>') +
        '</div></li>';
    }).join("");
    ul.querySelectorAll("[data-modulo-id]").forEach((li) => {
      li.addEventListener("click", () => {
        const id = Number(li.getAttribute("data-modulo-id"));
        if (!moduloEstaDesbloqueado(id)) return;
        abrirModulo(id);
      });
    });
  }

  function atualizarPainelDireitoModulo() {
    const totalConcluidos = (PROGRESSO.modulosConcluidos || []).length;
    const xpTotal = PROGRESSO.xpTotal || 0;
    const nivel = PROGRESSO.nivel || 1;
    const xpAtualNivel = xpParaNivel(nivel - 1);
    const xpProxNivel = xpParaNivel(nivel);
    const xpDelta = xpProxNivel - xpAtualNivel;
    const xpDentroNivel = xpTotal - xpAtualNivel;
    const pctNivel = xpDelta > 0 ? Math.min(100, Math.round((xpDentroNivel / xpDelta) * 100)) : 0;
    const pctTrilha = Math.min(100, Math.round((totalConcluidos / 6) * 100));

    const ring = el("relProgressRingMod");
    if (ring) ring.style.setProperty("--rel-progress", (pctTrilha * 3.6) + "deg");
    const ringPct = el("relProgressRingPctMod");
    if (ringPct) ringPct.textContent = pctTrilha + "%";
    const elModConc = el("relProgressModulosMod");
    if (elModConc) elModConc.textContent = totalConcluidos + "/6";
    const elXpTotal = el("relProgressXpMod");
    if (elXpTotal) elXpTotal.textContent = fmtNumero(xpTotal);

    const elNivelEsq = el("relStatNivelMod");
    if (elNivelEsq) elNivelEsq.textContent = nivel;
    const elNivelLbl = el("relStatNivelLabelMod");
    if (elNivelLbl) elNivelLbl.textContent = nivel;
    const elNivelBar = el("relStatNivelBarMod");
    if (elNivelBar) elNivelBar.style.width = pctNivel + "%";
    const elXpAtual = el("relStatXpAtual");
    if (elXpAtual) elXpAtual.textContent = fmtNumero(xpTotal);
    const elXpProx = el("relStatXpProximo");
    if (elXpProx) elXpProx.textContent = fmtNumero(xpProxNivel);
    const elDias = el("relStatDiasFocoMod");
    if (elDias) elDias.textContent = PROGRESSO.diasFoco || 0;
    const elSeq = el("relStatSequenciaMod");
    if (elSeq) elSeq.textContent = PROGRESSO.sequencia || 0;

    const elRecNiv = el("relRecompensaNivel");
    if (elRecNiv) elRecNiv.textContent = nivel + 1;
    const elRecXp = el("relRecompensaXp");
    if (elRecXp) elRecXp.textContent = fmtNumero(xpDentroNivel) + " / " + fmtNumero(xpDelta);
    const elRecBar = el("relRecompensaBar");
    if (elRecBar) elRecBar.style.width = pctNivel + "%";

    const conqUl = el("relConquistasList");
    if (conqUl) {
      conqUl.innerHTML = CONQUISTAS.map((c) => {
        const desbloqueada = c.check(PROGRESSO);
        return '<li class="' + (desbloqueada ? "" : "is-locked") + '">' +
          '<span class="rel-conquista-icon" data-tone="' + c.tone + '"><i data-lucide="' + c.icon + '"></i></span>' +
          '<div class="rel-conquista-info"><strong>' + c.titulo + '</strong><small>' + c.desc + '</small></div>' +
          '<span class="rel-conquista-xp">+' + c.xp + '</span></li>';
      }).join("");
    }

    const totalQuizzesFeitos = Object.keys(PROGRESSO.quizzesConcluidos || {}).length;
    const totalQuizzesAcertos = Object.values(PROGRESSO.quizzesAcertos || {}).filter(Boolean).length;
    const taxaAcertos = totalQuizzesFeitos ? Math.round((totalQuizzesAcertos / totalQuizzesFeitos) * 100) : 0;
    const elDiasS = el("relStatsDiasFoco");
    if (elDiasS) elDiasS.textContent = PROGRESSO.diasFoco || 0;
    const elQzS = el("relStatsQuizzes");
    if (elQzS) elQzS.textContent = totalQuizzesFeitos;
    const elAcS = el("relStatsAcertos");
    if (elAcS) elAcS.textContent = taxaAcertos + "%";
  }

  function continuarLeitura() {
    if (!MODULO_ATUAL) return;
    const idMod = MODULO_ATUAL.id;
    const totalP = totalPartes(idMod);
    const parteIdx = MODULO_ATUAL.parteVisivel;
    concluirParte(idMod, parteIdx);
    if (parteIdx + 1 < totalP) {
      MODULO_ATUAL.parteVisivel = parteIdx + 1;
    }
    salvarProgresso();
    renderModulo();
    setTimeout(() => {
      const ult = document.querySelector('.rel-mod-part[data-current="true"]');
      if (ult && ult.scrollIntoView) ult.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function alternarFocusMode() {
    FOCUS_MODE = !FOCUS_MODE;
    const root = el("relTrilhaGamificada");
    if (root) root.classList.toggle("is-focus-mode", FOCUS_MODE);
    const lbl = el("relFocusBtnLabel");
    if (lbl) lbl.textContent = FOCUS_MODE ? "Sair do modo foco" : "Modo foco";
  }

  function abrirMaterialApoio() {
    const modal = el("relMaterialApoioModal");
    const frame = el("relMaterialApoioFrame");
    const btn = el("relMaterialApoioBtn");
    if (!modal || !frame || !btn) return;
    const pdfSrc = btn.getAttribute("data-pdf-src");
    if (pdfSrc && frame.getAttribute("src") !== pdfSrc) frame.setAttribute("src", pdfSrc);
    modal.classList.remove("d-none");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("rel-support-reader-open");
    if (typeof atualizarIconesLucide === "function") atualizarIconesLucide(modal);
    else if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function fecharMaterialApoio() {
    const modal = el("relMaterialApoioModal");
    if (!modal) return;
    modal.classList.add("d-none");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("rel-support-reader-open");
  }

  let EVENTOS_VINCULADOS = false;
  function vincularEventos() {
    if (EVENTOS_VINCULADOS) return;
    EVENTOS_VINCULADOS = true;
    const btnIniciar = el("relIniciarTrilhaBtn");
    if (btnIniciar) {
      btnIniciar.addEventListener("click", () => {
        if (!PROGRESSO) return;
        PROGRESSO.iniciada = true;
        const proximo = encontrarProximoModulo() || 1;
        abrirModulo(proximo);
      });
    }
    const btnApoio = el("relMaterialApoioBtn");
    if (btnApoio) btnApoio.addEventListener("click", abrirMaterialApoio);
    const modalApoio = el("relMaterialApoioModal");
    if (modalApoio) {
      modalApoio.querySelectorAll("[data-rel-support-close]").forEach((btn) => {
        btn.addEventListener("click", fecharMaterialApoio);
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modalApoio.classList.contains("d-none")) fecharMaterialApoio();
      });
    }
    const btnVoltar = el("relVoltarHomeBtn");
    if (btnVoltar) {
      btnVoltar.addEventListener("click", () => {
        if (FOCUS_MODE) alternarFocusMode();
        mostrarTela("home");
        renderHome();
      });
    }
    const btnContinuar = el("relContinuarLeituraBtn");
    if (btnContinuar) btnContinuar.addEventListener("click", continuarLeitura);
    const btnFocus = el("relFocusToggleBtn");
    if (btnFocus) btnFocus.addEventListener("click", alternarFocusMode);
  }

  async function iniciar() {
    if (CONTROLLER_INICIADO) return;
    const root = el("relTrilhaGamificada");
    if (!root) return;
    CONTROLLER_INICIADO = true;
    carregarConteudoModulos();
    await carregarProgresso();
    vincularEventos();
    mostrarTela("home");
    renderHome();
  }

  window.iniciarTrilhaRelatividade = iniciar;
  window.recarregarTrilhaRelatividade = async function () {
    CONTROLLER_INICIADO = false;
    await iniciar();
  };
})();
