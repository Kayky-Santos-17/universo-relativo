const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Header, Footer, PageNumber, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType
} = require("docx");

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const FONT  = "Times New Roman";
const BODY  = 20;   // 10 pt (half-points)
const H1    = 24;   // 12 pt

// ABNT: margens 3 cm sup/esq, 2 cm inf/dir
const MARGIN = { top: 1701, right: 1134, bottom: 1134, left: 1701 };
// Largura útil: 11906 - 1701 - 1134 = 9071 DXA
const CONTENT_W = 9071;

// ─── HELPERS GERAIS ──────────────────────────────────────────────────────────
const SP       = { line: 240, before: 0, after: 100 };
const SP_TIGHT = { line: 240, before: 0, after: 60 };
const SP_SEC   = { line: 240, before: 180, after: 80 };

function p(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: opts.spacing || SP,
    indent: opts.noIndent ? undefined : { firstLine: 709 },
    children: [new TextRun({ text, font: FONT, size: BODY, bold: !!opts.bold })]
  });
}

function pCenter(runs, spacing) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: spacing || SP_TIGHT,
    children: runs.map(r =>
      new TextRun({ text: r.text, font: FONT, size: r.size || BODY,
                    bold: !!r.bold, italics: !!r.italics })
    )
  });
}

// Cabeçalho de seção numerada — ABNT: negrito, maiúsculas
function secao(num, titulo) {
  const label = num ? `${num} ${titulo}` : titulo;
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: SP_SEC,
    children: [new TextRun({ text: label, font: FONT, size: H1, bold: true })]
  });
}

// Subseção
function subsecao(num, titulo) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 240, before: 140, after: 60 },
    children: [new TextRun({ text: `${num} ${titulo}`, font: FONT, size: BODY, bold: true })]
  });
}

// ─── PLACEHOLDER DE FIGURA ───────────────────────────────────────────────────
// Retorna [caixa, legenda, fonte] — três parágrafos/elementos
function figura(num, descricao) {
  const borda = { style: BorderStyle.SINGLE, size: 6, color: "999999" };

  const caixa = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            borders: { top: borda, bottom: borda, left: borda, right: borda },
            shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
            margins: { top: 500, bottom: 500, left: 300, right: 300 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 240, before: 0, after: 0 },
                children: [
                  new TextRun({ text: `[ FIGURA ${num} — INSERIR IMAGEM AQUI ]`,
                                font: FONT, size: BODY, bold: true, color: "555555" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Legenda: "Figura X - Descrição." — conforme template do APÊNDICE I do edital
  const legenda = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 240, before: 60, after: 0 },
    children: [
      new TextRun({ text: `Figura ${num} - `, font: FONT, size: BODY, bold: true }),
      new TextRun({ text: descricao, font: FONT, size: BODY })
    ]
  });

  // Fonte em linha separada — conforme template do edital
  const fonte = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 240, before: 0, after: 140 },
    children: [
      new TextRun({ text: "Fonte: o autor (2026).", font: FONT, size: BODY })
    ]
  });

  return [caixa, legenda, fonte];
}

// Referência bibliográfica — ABNT, sem recuo
function ref(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: SP_TIGHT,
    children: [new TextRun({ text, font: FONT, size: BODY })]
  });
}

// ─── TÍTULO E AUTORES ────────────────────────────────────────────────────────
const tituloAutores = [
  // Título do trabalho
  pCenter(
    [{ text: "UNIVERSO RELATIVO: PLATAFORMA EDUCACIONAL GAMIFICADA PARA O ENSINO DE FÍSICA NO ENSINO MÉDIO COM ÊNFASE EM RELATIVIDADE ESPECIAL", size: H1, bold: true }],
    { line: 276, before: 0, after: 160 }
  ),

  // Autores em maiúsculas — conforme solicitado
  pCenter([{ text: "PAULO RICARDO COSTA ALCHAPAR¹; LUIZ CARLOS²", bold: true }],
    { line: 240, before: 0, after: 80 }),

  // Afiliações
  pCenter(
    [{ text: "¹ Bolsista CNPq/IFPA – Curso Técnico em Informática – IFPA Campus Altamira", italics: true, size: 18 }],
    { line: 220, before: 0, after: 0 }
  ),
  pCenter(
    [{ text: "² Docente Orientador – IFPA Campus Altamira. E-mail: ______________________________", italics: true, size: 18 }],
    { line: 220, before: 0, after: 220 }
  )
];

// ─── RESUMO ──────────────────────────────────────────────────────────────────
// ATENÇÃO: o RESUMO não deve conter fórmulas, citações nem referências bibliográficas
// conforme regra do edital (APÊNDICE I).
const resumo = [
  // Área do conhecimento — conforme seção 2.10 do edital
  pCenter(
    [{ text: "ÁREA DO CONHECIMENTO: CIÊNCIAS EXATAS E DA TERRA | SUBÁREA: FÍSICA", size: BODY, bold: true }],
    { line: 240, before: 0, after: 60 }
  ),
  // ODS vinculado — conforme seção 2.11 do edital
  pCenter(
    [{ text: "ODS VINCULADO: ODS04 — EDUCAÇÃO DE QUALIDADE", size: BODY, bold: true }],
    { line: 240, before: 0, after: 180 }
  ),

  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 240, before: 0, after: 80 },
    children: [new TextRun({ text: "RESUMO", font: FONT, size: H1, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 240, before: 0, after: 80 },
    children: [new TextRun({
      // Sem citações nem referências — conforme regra do edital
      text: "O presente trabalho apresenta o desenvolvimento e a avaliação do Universo Relativo, uma plataforma educacional web gamificada voltada ao ensino de Física para alunos do Ensino Médio, com módulos de Cinemática, Termologia, Ondulatória, Óptica e ênfase em Relatividade Especial. A pesquisa parte da constatação de que conteúdos de Física Moderna recebem pouco espaço na educação básica e, quando abordados, são tratados de forma puramente expositiva e desvinculada dos experimentos históricos que os fundamentam. Como solução, propôs-se uma trilha gamificada implementada em HTML, CSS e JavaScript, integrada ao Firebase e disponibilizada como Progressive Web App. A metodologia combinou pesquisa aplicada, prototipação iterativa e avaliação heurística com base em princípios de Design Instrucional e gamificação educacional. O sistema oferece autenticação por matrícula, painel administrativo com sincronização em tempo real, banco de questões filtrável, provas do ENEM, flashcards com repetição espaçada e trilha gamificada de Relatividade Especial organizada em seis módulos, do experimento de Michelson–Morley até E = mc². Os resultados iniciais indicam que a abordagem por fases, com sistema de pontos de experiência, níveis e conquistas, reduz a barreira de entrada típica da Física Moderna e organiza o percurso do estudante de forma progressiva.",
      font: FONT, size: BODY
    })]
  }),
  // Palavras-chave: minúsculas, separadas por ";", sem repetir palavras do título
  // Palavras evitadas: "física" (título), "ensino médio" (título), "relatividade especial" (título),
  // "plataforma educacional" (título), "gamificada/gamificação" (título)
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 240, before: 0, after: 200 },
    children: [
      new TextRun({ text: "Palavras-chave: ", font: FONT, size: BODY, bold: true }),
      new TextRun({ text: "gamificação; física moderna; aprendizagem ativa; design instrucional; progressive web app.", font: FONT, size: BODY })
    ]
  })
];

// ─── 1 INTRODUÇÃO ────────────────────────────────────────────────────────────
const introducao = [
  secao("1", "INTRODUÇÃO"),
  p("A Física Moderna ocupa, em geral, um espaço marginal nos currículos do Ensino Médio brasileiro, embora seja explicitamente recomendada pela Base Nacional Comum Curricular (BRASIL, 2018) e cobrada em vestibulares e no ENEM. Conceitos como referenciais inerciais, dilatação temporal e equivalência massa–energia, quando apresentados de forma puramente expositiva, raramente se conectam ao experimento histórico que os fundamenta — o de Michelson e Morley — e tampouco aproveitam o potencial das tecnologias digitais para favorecer a aprendizagem ativa (MOREIRA, 2014)."),
  p("A literatura sobre tecnologias na educação tem destacado a gamificação como estratégia capaz de aumentar engajamento e persistência, desde que articulada a objetivos pedagógicos claros (DETERDING et al., 2011; KAPP, 2012). Plataformas como o Duolingo demonstram empiricamente que mecânicas de progressão por fases, sistema de pontos de experiência (XP), níveis e conquistas organizam o percurso do estudante sem competir com o conteúdo. Diante desse cenário, o projeto Universo Relativo propõe integrar conteúdo formal de Física, banco de questões do ENEM, flashcards com repetição espaçada e uma trilha gamificada exclusiva de Relatividade Especial em uma única plataforma web responsiva."),
  p("Como objetivo geral, busca-se desenvolver uma plataforma educacional gratuita que aproxime estudantes do Ensino Médio dos conceitos da Relatividade Especial por meio da gamificação. Os objetivos específicos são: (i) implementar trilha gamificada de seis módulos com leitura progressiva, quizzes e sistema de XP; (ii) garantir persistência individualizada do progresso na nuvem; (iii) disponibilizar painel administrativo com atualização de conteúdo em tempo real; e (iv) avaliar a aderência da interface às heurísticas de usabilidade de Nielsen (1994).")
];

// ─── 2 METODOLOGIA ───────────────────────────────────────────────────────────
const metodologia = [
  secao("2", "METODOLOGIA"),
  p("Quanto à natureza, a pesquisa é aplicada; quanto aos objetivos, descritiva e exploratória; quanto aos procedimentos, configura pesquisa de desenvolvimento de software educacional (ROMISZOWSKI, 1996; FILATRO, 2008). A metodologia foi conduzida em quatro etapas iterativas."),
  subsecao("2.1", "Levantamento bibliográfico e curricular"),
  p("Realizou-se revisão narrativa em bases acadêmicas (Scielo, Capes Periódicos, ERIC) sobre ensino de Física Moderna, Design Instrucional, Progressive Web Apps em educação e gamificação, com mapeamento dos descritores da BNCC e da matriz de Ciências da Natureza do ENEM, fundamentando a divisão dos seis módulos da trilha.", { noIndent: true }),
  subsecao("2.2", "Modelagem instrucional dos módulos"),
  p("Cada módulo foi modelado segundo a sequência: (1) contexto histórico, (2) experimento central, (3) formalização matemática mínima, (4) implicações conceituais e (5) verificação por quiz. A divisão em partes curtas e reveladas progressivamente segue a recomendação de chunking do Design Instrucional (FILATRO, 2008), reduzindo a sobrecarga cognitiva (SWELLER, 1988).", { noIndent: true }),
  subsecao("2.3", "Desenvolvimento do sistema"),
  p("A plataforma foi implementada em HTML5, CSS3 e JavaScript ES2022, sem frameworks pesados, utilizando Firebase Authentication (login por matrícula), Cloud Firestore (persistência em tempo real do progresso individual) e Firebase Storage (apostilas em PDF), configurada como Progressive Web App com Service Worker.", { noIndent: true }),
  subsecao("2.4", "Avaliação heurística e ajuste iterativo"),
  p("Após cada incremento, a interface foi submetida a avaliação heurística informal com base nas dez heurísticas de Nielsen (1994), com atenção especial à visibilidade do estado do sistema, estética minimalista e controle e liberdade do usuário. Os ajustes foram registrados via histórico Git.", { noIndent: true })
];

// ─── 3 RESULTADOS E DISCUSSÃO ────────────────────────────────────────────────
const resultados = [
  secao("3", "RESULTADOS E DISCUSSÃO"),
  p("A versão em produção da plataforma, hospedada no Firebase Hosting, contempla seis seções interligadas por um painel administrativo único, descritas a seguir."),

  subsecao("3.1", "Visão geral da plataforma"),
  p("A Figura 1 exibe a tela de acesso da plataforma (login por matrícula) e a Figura 2 mostra o dashboard do aluno, com atalhos para Física Básica, Relatividade Especial, Banco de Questões, Provas e Flashcards, além de estatísticas individuais em tempo real. O Banco de Questões permite filtragem por disciplina, assunto e status de progresso. A área Flashcards utiliza repetição espaçada com registro de acertos, erros e taxa de domínio.", { noIndent: true }),

  ...figura(1, "Tela de acesso da plataforma Universo Relativo."),
  ...figura(2, "Dashboard do aluno com progresso individual em tempo real."),

  subsecao("3.2", "Trilha gamificada de Relatividade Especial"),
  p("A trilha (Figura 3) organiza o conteúdo em seis módulos sequenciais: (1) Éter e experimento de Michelson–Morley; (2) Postulados de Einstein; (3) Fator de Lorentz; (4) Dilatação do Tempo; (5) Contração do Espaço; e (6) Energia e Massa (E = mc²). O Módulo 1 inicia desbloqueado; os demais são liberados conforme o estudante conclui o anterior. Cada módulo apresenta conteúdo em partes reveladas progressivamente (+10 XP por parte), seguidas de quizzes (+20 XP por acerto; +50 XP por módulo concluído). O painel lateral exibe anel de progresso, próxima recompensa de nível e conquistas (Primeiro passo, Em busca do conhecimento, Foco é poder e Mestre da Relatividade). A leitura progressiva, associada à recompensa imediata, aproxima a experiência do estudante da observada em aplicativos de aprendizagem consolidados, mantendo o XP como sinal de progresso, não como objetivo final.", { noIndent: true }),

  ...figura(3, "Tela interna da trilha gamificada de Relatividade Especial — Módulo 1."),

  subsecao("3.3", "Painel administrativo e persistência"),
  p("O painel administrativo (Figura 4) permite ao professor cadastrar alunos, editar cards de aulas e apostilas, vincular resoluções em vídeo às questões do ENEM e cadastrar novas provas, com sincronização em tempo real via listeners onSnapshot. As regras do Cloud Firestore garantem que cada aluno acesse apenas seus próprios documentos, enquanto o cadastro coletivo exige permissão de administrador, verificada pela coleção admins.", { noIndent: true }),

  ...figura(4, "Painel administrativo do Universo Relativo.")
];

// ─── 4 CONCLUSÕES ────────────────────────────────────────────────────────────
// Baseadas exclusivamente nos resultados — conforme regra do edital
const conclusoes = [
  secao("4", "CONCLUSÕES"),
  p("A versão atual do Universo Relativo demonstra que é viável construir, com tecnologias web abertas e o ecossistema Firebase, uma plataforma educacional completa, com painel administrativo, banco de questões, flashcards e trilha gamificada coerente com a Relatividade Especial. Os objetivos específicos propostos foram alcançados: a trilha de seis módulos com leitura progressiva e sistema de XP está operacional; o progresso é persistido individualmente na nuvem; o painel administrativo sincroniza atualizações em tempo real; e a interface demonstrou aderência às heurísticas de Nielsen nas avaliações realizadas."),
  p("Como continuidade, prevê-se: (i) ampliar quizzes intermediários e introduzir questões abertas com correção assistida; (ii) implementar o Laboratório Interativo com simulações de dilatação do tempo e composição relativística de velocidades; e (iii) realizar avaliação formal com estudantes voluntários do Ensino Médio, submetendo os instrumentos ao Comitê de Ética em Pesquisa conforme a Resolução CNS nº 510/2016.")
];

// ─── AGRADECIMENTOS ──────────────────────────────────────────────────────────
// Regra 3.4: bolsistas DEVEM identificar o edital e a modalidade da bolsa
const agradecimentos = [
  secao("", "AGRADECIMENTOS"),
  p("Projeto financiado por bolsa de Iniciação Científica, concedida pelo Conselho Nacional de Desenvolvimento Científico e Tecnológico (CNPq) através do edital n° [INSERIR NÚMERO DO EDITAL]/PROPPG/IFPA. Agradeço ao orientador Prof. Luiz Carlos pelo acompanhamento durante todas as etapas e aos colegas que contribuíram com sugestões e testes da plataforma.", { noIndent: true })
];

// ─── REFERÊNCIAS ─────────────────────────────────────────────────────────────
// ABNT, ordem alfabética, conforme regra do edital
const referencias = [
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: SP_SEC,
    children: [new TextRun({ text: "Referências", font: FONT, size: H1, bold: true })]
  }),
  ref("BRASIL. Ministério da Educação. Base Nacional Comum Curricular: Ensino Médio. Brasília: MEC, 2018."),
  ref("DETERDING, S.; DIXON, D.; KHALED, R.; NACKE, L. From game design elements to gamefulness: defining gamification. In: Proceedings of the 15th International Academic MindTrek Conference. New York: ACM, 2011. p. 9–15."),
  ref("FILATRO, A. Design instrucional na prática. São Paulo: Pearson Education do Brasil, 2008."),
  ref("FIREBASE. Cloud Firestore documentation. Mountain View: Google LLC, 2026. Disponível em: https://firebase.google.com/docs/firestore. Acesso em: maio 2026."),
  ref("KAPP, K. M. The gamification of learning and instruction: game-based methods and strategies for training and education. San Francisco: Pfeiffer, 2012."),
  ref("MOREIRA, M. A. Aprendizagem significativa: a teoria e textos complementares. São Paulo: Livraria da Física, 2014."),
  ref("NIELSEN, J. Heuristic evaluation. In: NIELSEN, J.; MACK, R. L. (Eds.). Usability inspection methods. New York: John Wiley & Sons, 1994. p. 25–62."),
  ref("ROMISZOWSKI, A. J. Designing instructional systems: decision making in course planning and curriculum design. London: Kogan Page, 1996."),
  ref("SWELLER, J. Cognitive load during problem solving: effects on learning. Cognitive Science, v. 12, n. 2, p. 257–285, 1988.")
];

// ─── DOCUMENTO ────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: "Paulo Ricardo Costa Alchapar",
  title: "Universo Relativo — Resumo Expandido SICTI 2026",
  styles: {
    default: { document: { run: { font: FONT, size: BODY } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: MARGIN
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { line: 240, before: 0, after: 60 },
          border: { bottom: { color: "000000", size: 4, space: 4, style: BorderStyle.SINGLE } },
          children: [new TextRun({ text: "XVIII SICTI 2026 — IFPA", font: FONT, size: 16, italics: true })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 240, before: 0, after: 0 },
          children: [
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })
          ]
        })]
      })
    },
    children: [
      ...tituloAutores,
      ...resumo,
      ...introducao,
      ...metodologia,
      ...resultados,
      ...conclusoes,
      ...agradecimentos,
      ...referencias
    ]
  }]
});

const out = path.join(__dirname, "Resumo_Expandido_Universo_Relativo_SICTI_2026.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log("Gerado: " + out);
}).catch(err => {
  console.error("Erro:", err.message);
  process.exit(1);
});
