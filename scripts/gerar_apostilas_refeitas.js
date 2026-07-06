const fs = require("fs");
const path = require("path");

const outRoot = path.join(process.cwd(), "apostilas_refeitas");
const assetRoot = path.join(outRoot, "fontes-e-imagens");
const diagramRoot = path.join(assetRoot, "diagramas-autorais");

const groups = {
  cinematica: "Cinemática",
  ondulatoria: "Ondulatória",
  termologia: "Termologia",
  optica: "Óptica"
};

const diagrams = {
  eixo: {
    file: "cinematica-eixo-posicao.svg",
    title: "Eixo de posição e deslocamento",
    caption: "Diagrama autoral para posição inicial, posição final e deslocamento escalar.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <line x1="105" y1="230" x2="795" y2="230" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round"/>
      <path d="M795 230l-32-20v40z" fill="#1d4ed8"/>
      <g font-family="Arial" font-size="28" fill="#172033" font-weight="700">
        <text x="99" y="285">0</text><text x="295" y="285">xᵢ = 20 m</text><text x="610" y="285">x_f = 70 m</text>
      </g>
      <circle cx="330" cy="230" r="18" fill="#7c3aed"/><circle cx="680" cy="230" r="18" fill="#38bdf8"/>
      <path d="M330 150 C430 95, 580 95, 680 150" fill="none" stroke="#7c3aed" stroke-width="7" stroke-linecap="round"/>
      <path d="M680 150l-34-2 21 27z" fill="#7c3aed"/>
      <text x="407" y="92" font-family="Arial" font-size="30" fill="#4338ca" font-weight="800">Δx = x_f − xᵢ</text>
    </svg>`
  },
  mru: {
    file: "cinematica-mru-grafico.svg",
    title: "Gráficos do MRU",
    caption: "Diagrama autoral para leitura de posição crescente e velocidade constante no MRU.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <g stroke="#c7d2fe" stroke-width="2">${Array.from({ length: 7 }, (_, i) => `<line x1="${110 + i * 90}" y1="70" x2="${110 + i * 90}" y2="340"/>`).join("")}${Array.from({ length: 5 }, (_, i) => `<line x1="90" y1="${100 + i * 55}" x2="710" y2="${100 + i * 55}"/>`).join("")}</g>
      <line x1="90" y1="340" x2="725" y2="340" stroke="#172033" stroke-width="5"/><line x1="90" y1="340" x2="90" y2="65" stroke="#172033" stroke-width="5"/>
      <path d="M120 310 L670 95" stroke="#2563eb" stroke-width="9" fill="none" stroke-linecap="round"/>
      <text x="52" y="83" font-family="Arial" font-size="28" font-weight="800" fill="#172033">s</text><text x="730" y="350" font-family="Arial" font-size="28" font-weight="800" fill="#172033">t</text>
      <rect x="575" y="245" width="235" height="82" rx="18" fill="#eef2ff" stroke="#c7d2fe"/><text x="600" y="282" font-family="Arial" font-size="24" font-weight="800" fill="#3730a3">inclinação = v</text><text x="600" y="312" font-family="Arial" font-size="20" fill="#475569">velocidade constante</text>
    </svg>`
  },
  lancamento: {
    file: "cinematica-lancamento.svg",
    title: "Lançamento oblíquo",
    caption: "Diagrama autoral para decomposição da velocidade inicial em lançamento oblíquo.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <line x1="80" y1="340" x2="815" y2="340" stroke="#172033" stroke-width="6"/><line x1="90" y1="345" x2="90" y2="70" stroke="#172033" stroke-width="6"/>
      <path d="M110 335 C250 130, 520 70, 770 335" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
      <line x1="130" y1="320" x2="290" y2="190" stroke="#7c3aed" stroke-width="8" stroke-linecap="round"/><path d="M290 190l-36 8 22 27z" fill="#7c3aed"/>
      <line x1="130" y1="320" x2="300" y2="320" stroke="#38bdf8" stroke-width="7"/><line x1="300" y1="320" x2="300" y2="190" stroke="#38bdf8" stroke-width="7"/>
      <text x="210" y="178" font-family="Arial" font-size="26" font-weight="800" fill="#4338ca">v₀</text><text x="190" y="356" font-family="Arial" font-size="24" font-weight="800" fill="#0369a1">v₀x</text><text x="312" y="260" font-family="Arial" font-size="24" font-weight="800" fill="#0369a1">v₀y</text><text x="420" y="384" font-family="Arial" font-size="24" font-weight="800" fill="#172033">alcance A</text>
    </svg>`
  },
  onda: {
    file: "ondulatoria-onda.svg",
    title: "Elementos de uma onda",
    caption: "Diagrama autoral para amplitude, comprimento de onda, crista e vale.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <line x1="80" y1="215" x2="820" y2="215" stroke="#cbd5e1" stroke-width="4"/>
      <path d="M80 215 C150 70, 230 70, 300 215 S450 360, 520 215 S670 70, 740 215 S835 330, 860 260" fill="none" stroke="#2563eb" stroke-width="9" stroke-linecap="round"/>
      <line x1="190" y1="215" x2="190" y2="92" stroke="#7c3aed" stroke-width="5" stroke-dasharray="10 10"/><text x="205" y="160" font-family="Arial" font-size="26" fill="#4338ca" font-weight="800">A</text>
      <line x1="190" y1="85" x2="630" y2="85" stroke="#16a34a" stroke-width="5"/><path d="M190 85l24-14v28zM630 85l-24-14v28z" fill="#16a34a"/><text x="386" y="67" font-family="Arial" font-size="26" fill="#166534" font-weight="800">λ</text>
      <text x="145" y="55" font-family="Arial" font-size="24" fill="#172033" font-weight="800">crista</text><text x="372" y="375" font-family="Arial" font-size="24" fill="#172033" font-weight="800">vale</text>
    </svg>`
  },
  som: {
    file: "ondulatoria-som.svg",
    title: "Onda sonora longitudinal",
    caption: "Diagrama autoral para compressões e rarefações em uma onda sonora.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      ${Array.from({ length: 46 }, (_, i) => {
        const x = 80 + i * 16;
        const r = i % 12 < 5 ? 9 : 4;
        return `<circle cx="${x}" cy="${215 + Math.sin(i) * 20}" r="${r}" fill="${i % 12 < 5 ? "#2563eb" : "#93c5fd"}"/>`;
      }).join("")}
      <text x="115" y="115" font-family="Arial" font-size="28" fill="#1d4ed8" font-weight="800">compressão</text><text x="405" y="315" font-family="Arial" font-size="28" fill="#0369a1" font-weight="800">rarefação</text>
      <path d="M90 365 L810 365" stroke="#16a34a" stroke-width="7" stroke-linecap="round"/><path d="M810 365l-34-18v36z" fill="#16a34a"/><text x="360" y="398" font-family="Arial" font-size="24" fill="#166534" font-weight="800">sentido de propagação</text>
    </svg>`
  },
  termometro: {
    file: "termologia-termometro.svg",
    title: "Temperatura e equilíbrio térmico",
    caption: "Diagrama autoral para leitura de temperatura e equilíbrio térmico.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <rect x="380" y="65" width="82" height="250" rx="41" fill="#e0f2fe" stroke="#0369a1" stroke-width="7"/><rect x="410" y="125" width="22" height="195" rx="11" fill="#ef4444"/><circle cx="421" cy="335" r="55" fill="#ef4444" stroke="#991b1b" stroke-width="7"/>
      <g font-family="Arial" font-size="22" fill="#172033" font-weight="700"><text x="480" y="135">100 °C</text><text x="480" y="225">50 °C</text><text x="480" y="315">0 °C</text></g>
      <path d="M160 215 C230 160, 285 160, 350 215" fill="none" stroke="#7c3aed" stroke-width="7"/><path d="M350 215l-32-6 18 28z" fill="#7c3aed"/><text x="125" y="145" font-family="Arial" font-size="27" fill="#4338ca" font-weight="800">calor flui do mais quente</text>
    </svg>`
  },
  calor: {
    file: "termologia-transferencia-calor.svg",
    title: "Transferência de calor",
    caption: "Diagrama autoral para condução, convecção e radiação.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <rect x="105" y="240" width="210" height="46" rx="12" fill="#94a3b8"/><circle cx="100" cy="263" r="38" fill="#ef4444"/><circle cx="320" cy="263" r="38" fill="#38bdf8"/><text x="105" y="330" font-family="Arial" font-size="22" font-weight="800" fill="#172033">condução</text>
      <path d="M455 300 C410 220, 420 130, 500 120 C580 130, 590 220, 545 300" fill="none" stroke="#2563eb" stroke-width="8"/><path d="M545 300l-26-24 35-8z" fill="#2563eb"/><text x="420" y="330" font-family="Arial" font-size="22" font-weight="800" fill="#172033">convecção</text>
      <circle cx="725" cy="205" r="52" fill="#f59e0b"/><g stroke="#f59e0b" stroke-width="7" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => {
        const a = i * Math.PI / 6; const x1 = 725 + Math.cos(a) * 72; const y1 = 205 + Math.sin(a) * 72; const x2 = 725 + Math.cos(a) * 105; const y2 = 205 + Math.sin(a) * 105;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join("")}</g><text x="675" y="330" font-family="Arial" font-size="22" font-weight="800" fill="#172033">radiação</text>
    </svg>`
  },
  gas: {
    file: "termologia-gases.svg",
    title: "Gás em recipiente",
    caption: "Diagrama autoral para pressão, volume e temperatura em gases.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <rect x="205" y="85" width="420" height="260" rx="22" fill="#eef2ff" stroke="#3730a3" stroke-width="8"/>
      <rect x="585" y="85" width="40" height="260" fill="#c7d2fe" stroke="#3730a3" stroke-width="6"/>
      ${Array.from({ length: 34 }, (_, i) => `<circle cx="${245 + (i * 67) % 300}" cy="${125 + (i * 43) % 175}" r="9" fill="${i % 2 ? "#2563eb" : "#7c3aed"}"/>`).join("")}
      <path d="M645 215h130" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/><path d="M775 215l-34-18v36z" fill="#ef4444"/>
      <text x="250" y="395" font-family="Arial" font-size="30" fill="#172033" font-weight="800">p · V = n · R · T</text><text x="657" y="190" font-family="Arial" font-size="24" fill="#991b1b" font-weight="800">pressão</text>
    </svg>`
  },
  reflexao: {
    file: "optica-reflexao.svg",
    title: "Reflexão da luz",
    caption: "Diagrama autoral para raio incidente, raio refletido e normal.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <line x1="120" y1="315" x2="780" y2="315" stroke="#172033" stroke-width="9"/><line x1="450" y1="80" x2="450" y2="315" stroke="#64748b" stroke-width="5" stroke-dasharray="12 12"/>
      <path d="M210 100 L450 315" stroke="#2563eb" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M450 315 L690 100" stroke="#7c3aed" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M450 315l-12-36-24 27zM690 100l-35 12 24 25z" fill="#7c3aed"/>
      <text x="190" y="75" font-family="Arial" font-size="25" fill="#1d4ed8" font-weight="800">raio incidente</text><text x="605" y="75" font-family="Arial" font-size="25" fill="#4338ca" font-weight="800">raio refletido</text><text x="462" y="150" font-family="Arial" font-size="24" fill="#475569" font-weight="800">normal</text>
    </svg>`
  },
  refracao: {
    file: "optica-refracao.svg",
    title: "Refração da luz",
    caption: "Diagrama autoral para mudança de direção da luz entre meios.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="215" rx="34" fill="#f8fbff"/><rect y="215" width="900" height="215" rx="34" fill="#e0f2fe"/>
      <line x1="90" y1="215" x2="810" y2="215" stroke="#0369a1" stroke-width="6"/><line x1="450" y1="60" x2="450" y2="370" stroke="#64748b" stroke-width="5" stroke-dasharray="12 12"/>
      <path d="M250 70 L450 215 L580 365" stroke="#2563eb" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M580 365l-31-18 30-18z" fill="#2563eb"/>
      <text x="120" y="55" font-family="Arial" font-size="25" fill="#172033" font-weight="800">meio 1: ar</text><text x="120" y="265" font-family="Arial" font-size="25" fill="#075985" font-weight="800">meio 2: vidro/água</text><text x="470" y="145" font-family="Arial" font-size="24" fill="#475569" font-weight="800">normal</text>
    </svg>`
  },
  lente: {
    file: "optica-lentes.svg",
    title: "Lente convergente",
    caption: "Diagrama autoral para convergência dos raios em uma lente.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430">
      <rect width="900" height="430" rx="34" fill="#f8fbff"/>
      <line x1="80" y1="215" x2="820" y2="215" stroke="#cbd5e1" stroke-width="5"/><path d="M430 70 C500 145, 500 285, 430 360 C360 285, 360 145, 430 70z" fill="#dbeafe" stroke="#2563eb" stroke-width="7"/>
      <g stroke="#7c3aed" stroke-width="7" fill="none" stroke-linecap="round"><path d="M100 130 L430 130 L735 215"/><path d="M100 215 L735 215"/><path d="M100 300 L430 300 L735 215"/></g>
      <circle cx="735" cy="215" r="12" fill="#ef4444"/><text x="705" y="255" font-family="Arial" font-size="25" fill="#991b1b" font-weight="800">foco</text><text x="365" y="395" font-family="Arial" font-size="25" fill="#1d4ed8" font-weight="800">lente convergente</text>
    </svg>`
  }
};

function formula(name, expression, symbols, example) {
  return { name, expression, symbols, example };
}

function ex(q, steps, answer) {
  return { q, steps, answer };
}

function block(folder, file, blockLabel, title, subject, diagram, topics, formulas, examples, commonErrors, summary) {
  return { folder, file, blockLabel, title, subject, diagram, topics, formulas, examples, commonErrors, summary };
}

const apostilas = [
  block("cinematica", "bloco-1-introducao-a-cinematica", "Bloco 1", "Introdução à Cinemática", "movimento, repouso, referencial e velocidade média", "eixo",
    ["O que a Cinemática estuda", "Referencial, movimento e repouso", "Posição, trajetória, distância e deslocamento", "Rapidez média e velocidade média", "Conversão entre km/h e m/s"],
    [
      formula("Deslocamento escalar", "Δs = s<sub>f</sub> − s<sub>i</sub>", [["Δs", "deslocamento escalar, em metro (m)"], ["s<sub>f</sub>", "posição final, em metro (m)"], ["s<sub>i</sub>", "posição inicial, em metro (m)"]], "Se s<sub>i</sub> = 12 m e s<sub>f</sub> = 45 m, então Δs = 33 m."),
      formula("Velocidade média", "v<sub>m</sub> = Δs/Δt", [["v<sub>m</sub>", "velocidade média, em m/s"], ["Δs", "deslocamento, em metro (m)"], ["Δt", "intervalo de tempo, em segundo (s)"]], "Se Δs = 80 m e Δt = 10 s, então v<sub>m</sub> = 8 m/s."),
      formula("Conversão de velocidade", "v(m/s) = v(km/h)/3,6", [["km/h", "quilômetro por hora"], ["m/s", "metro por segundo"]], "72 km/h correspondem a 20 m/s.")
    ],
    [
      ex("Um estudante vai de s<sub>i</sub> = 5 m até s<sub>f</sub> = 37 m em 8 s. Calcule o deslocamento e a velocidade média.", ["Calcule o deslocamento: Δs = 37 − 5 = 32 m.", "Use v<sub>m</sub> = Δs/Δt = 32/8.", "Mantenha a unidade do SI: metro por segundo."], "Δs = 32 m e v<sub>m</sub> = 4 m/s."),
      ex("Uma pessoa dá uma volta completa em uma praça e retorna ao ponto de partida. A distância percorrida é 600 m. Qual é o deslocamento?", ["Distância é o comprimento do caminho: 600 m.", "Deslocamento depende apenas da posição final e inicial.", "Como a pessoa retorna ao ponto inicial, s<sub>f</sub> = s<sub>i</sub>."], "O deslocamento é Δs = 0 m.")
    ],
    ["Confundir distância percorrida com deslocamento.", "Dizer que movimento é absoluto, ignorando o referencial.", "Usar km/h junto com segundos sem converter unidades."],
    ["Cinemática descreve movimentos sem estudar suas causas.", "Movimento e repouso dependem do referencial.", "Deslocamento pode ser zero mesmo quando a distância percorrida não é zero.", "Velocidade média usa deslocamento e intervalo de tempo."]
  ),
  block("cinematica", "bloco-2-mru", "Bloco 2", "Movimento Retilíneo Uniforme", "velocidade constante e função horária da posição", "mru",
    ["Característica do MRU", "Função horária da posição", "Gráfico s × t", "Gráfico v × t", "Encontro de móveis"],
    [
      formula("Função horária do MRU", "s = s<sub>0</sub> + v · t", [["s", "posição no instante t, em metro (m)"], ["s<sub>0</sub>", "posição inicial, em metro (m)"], ["v", "velocidade constante, em m/s"], ["t", "tempo, em segundo (s)"]], "Com s<sub>0</sub> = 10 m, v = 3 m/s e t = 6 s, resulta s = 28 m."),
      formula("Velocidade no MRU", "v = Δs/Δt", [["v", "velocidade constante, em m/s"], ["Δs", "deslocamento"], ["Δt", "intervalo de tempo"]], "Um móvel que percorre 150 m em 30 s tem v = 5 m/s.")
    ],
    [
      ex("Um carro parte de s<sub>0</sub> = 20 m com v = 12 m/s. Qual é sua posição em t = 5 s?", ["Escreva a função: s = s<sub>0</sub> + v · t.", "Substitua os dados: s = 20 + 12 · 5.", "Calcule: s = 20 + 60 = 80 m."], "A posição final é s = 80 m."),
      ex("Dois móveis estão na mesma reta: A sai de 0 m com 20 m/s e B sai de 120 m com 10 m/s. Quando A alcança B?", ["Escreva s<sub>A</sub> = 20t.", "Escreva s<sub>B</sub> = 120 + 10t.", "Iguale as posições: 20t = 120 + 10t, então t = 12 s."], "O encontro ocorre em t = 12 s.")
    ],
    ["Achar que toda reta em gráfico representa repouso.", "Esquecer que a inclinação do gráfico s × t representa velocidade.", "Misturar posição inicial com deslocamento."],
    ["No MRU, a velocidade é constante.", "A posição varia linearmente com o tempo.", "No gráfico s × t, maior inclinação indica maior módulo da velocidade.", "Encontro de móveis é resolvido igualando posições."]
  ),
  block("cinematica", "bloco-3-mruv", "Bloco 3", "Movimento Retilíneo Uniformemente Variado", "aceleração constante, velocidade e posição", "mru",
    ["Aceleração média", "Função da velocidade", "Função horária da posição", "Equação de Torricelli", "Sinais da aceleração"],
    [
      formula("Função da velocidade", "v = v<sub>0</sub> + a · t", [["v", "velocidade final, em m/s"], ["v<sub>0</sub>", "velocidade inicial, em m/s"], ["a", "aceleração, em m/s²"], ["t", "tempo, em segundo (s)"]], "Se v<sub>0</sub> = 4 m/s, a = 2 m/s² e t = 5 s, então v = 14 m/s."),
      formula("Função horária do MRUV", "s = s<sub>0</sub> + v<sub>0</sub>t + (a · t²)/2", [["s", "posição final"], ["s<sub>0</sub>", "posição inicial"], ["v<sub>0</sub>", "velocidade inicial"], ["a", "aceleração"], ["t", "tempo"]], "Com s<sub>0</sub> = 0, v<sub>0</sub> = 3 m/s, a = 2 m/s² e t = 4 s, resulta s = 28 m."),
      formula("Equação de Torricelli", "v² = v<sub>0</sub>² + 2 · a · Δs", [["v", "velocidade final"], ["v<sub>0</sub>", "velocidade inicial"], ["a", "aceleração"], ["Δs", "deslocamento"]], "Use quando o tempo não aparece no enunciado.")
    ],
    [
      ex("Um corpo parte do repouso com a = 3 m/s². Qual é sua velocidade após 6 s?", ["Como parte do repouso, v<sub>0</sub> = 0.", "Use v = v<sub>0</sub> + a · t.", "v = 0 + 3 · 6 = 18 m/s."], "A velocidade final é 18 m/s."),
      ex("Um móvel tem v<sub>0</sub> = 5 m/s e a = 2 m/s² durante 4 s. Calcule o deslocamento.", ["Use Δs = v<sub>0</sub>t + (a · t²)/2.", "Substitua: Δs = 5 · 4 + (2 · 16)/2.", "Δs = 20 + 16 = 36 m."], "O deslocamento é 36 m.")
    ],
    ["Usar Torricelli em problema que pede tempo sem verificar os dados.", "Trocar aceleração negativa por desaceleração automaticamente.", "Esquecer o quadrado em v² ou t²."],
    ["No MRUV, a aceleração é constante.", "A velocidade varia linearmente com o tempo.", "A posição tem termo em t².", "Torricelli relaciona velocidades e deslocamento sem usar tempo."]
  ),
  block("cinematica", "bloco-4-vetores-do-movimento", "Bloco 4", "Vetores do Movimento", "módulo, direção, sentido e decomposição", "lancamento",
    ["Grandezas escalares e vetoriais", "Módulo, direção e sentido", "Componentes horizontal e vertical", "Soma vetorial", "Aplicações em deslocamento e velocidade"],
    [
      formula("Módulo de um vetor no plano", "|A| = √(A<sub>x</sub>² + A<sub>y</sub>²)", [["|A|", "módulo do vetor"], ["A<sub>x</sub>", "componente horizontal"], ["A<sub>y</sub>", "componente vertical"]], "Se A<sub>x</sub> = 3 e A<sub>y</sub> = 4, então |A| = 5."),
      formula("Componentes de um vetor", "A<sub>x</sub> = A · cos θ; A<sub>y</sub> = A · sen θ", [["A", "módulo do vetor"], ["θ", "ângulo com o eixo x"], ["A<sub>x</sub>, A<sub>y</sub>", "componentes do vetor"]], "Um vetor de 10 m a 60° tem componentes obtidas por seno e cosseno.")
    ],
    [
      ex("Um vetor tem componentes A<sub>x</sub> = 6 m e A<sub>y</sub> = 8 m. Determine o módulo.", ["Use |A| = √(A<sub>x</sub>² + A<sub>y</sub>²).", "Substitua: |A| = √(6² + 8²).", "|A| = √100 = 10 m."], "O módulo é 10 m."),
      ex("Por que velocidade é uma grandeza vetorial?", ["Velocidade não informa apenas rapidez.", "Ela também precisa de direção e sentido.", "Duas velocidades de mesmo módulo podem representar movimentos diferentes."], "Velocidade é vetorial porque possui módulo, direção e sentido.")
    ],
    ["Somar vetores como se fossem apenas números.", "Ignorar o ângulo entre os vetores.", "Confundir módulo do vetor com uma de suas componentes."],
    ["Vetores precisam de módulo, direção e sentido.", "Componentes permitem estudar movimentos em eixos separados.", "O teorema de Pitágoras aparece quando componentes são perpendiculares.", "Sinais dependem da orientação dos eixos."]
  ),
  block("cinematica", "bloco-5-movimento-circular-e-polias", "Bloco 5", "Movimento Circular e Polias", "período, frequência, velocidade angular e transmissão", "mru",
    ["Período e frequência", "Velocidade angular", "Velocidade tangencial", "Aceleração centrípeta", "Polias ligadas por correia"],
    [
      formula("Frequência", "f = 1/T", [["f", "frequência, em hertz (Hz)"], ["T", "período, em segundo (s)"]], "Se uma volta dura 0,25 s, então f = 4 Hz."),
      formula("Velocidade angular", "ω = 2π/T = 2πf", [["ω", "velocidade angular, em rad/s"], ["T", "período"], ["f", "frequência"]], "Quanto menor o período, maior a velocidade angular."),
      formula("Velocidade tangencial", "v = ω · R", [["v", "velocidade tangencial, em m/s"], ["ω", "velocidade angular"], ["R", "raio"]], "A borda de uma roda maior percorre mais espaço por volta.")
    ],
    [
      ex("Uma roda completa 5 voltas em 10 s. Calcule a frequência.", ["Frequência é número de voltas por segundo.", "f = 5/10.", "f = 0,5 Hz."], "A frequência é 0,5 Hz."),
      ex("Uma partícula gira com ω = 4 rad/s em uma circunferência de raio 2 m. Qual é sua velocidade tangencial?", ["Use v = ω · R.", "Substitua: v = 4 · 2.", "v = 8 m/s."], "A velocidade tangencial é 8 m/s.")
    ],
    ["Confundir velocidade angular com velocidade tangencial.", "Usar grau como se fosse radiano sem converter.", "Achar que movimento circular uniforme não tem aceleração."],
    ["Período é tempo por volta; frequência é voltas por segundo.", "ω mede rapidez angular.", "v depende de ω e do raio.", "Mesmo com módulo de v constante, existe aceleração centrípeta."]
  ),
  block("cinematica", "bloco-6-movimentos-verticais", "Bloco 6", "Movimentos Verticais", "queda livre e lançamento vertical", "lancamento",
    ["Aceleração da gravidade", "Queda livre", "Lançamento vertical para cima", "Altura máxima", "Convenção de sinais"],
    [
      formula("Velocidade vertical", "v = v<sub>0</sub> + g · t", [["v", "velocidade vertical final"], ["v<sub>0</sub>", "velocidade inicial"], ["g", "aceleração da gravidade com sinal"], ["t", "tempo"]], "Se o eixo positivo é para baixo, pode-se usar g = +10 m/s²."),
      formula("Posição vertical", "y = y<sub>0</sub> + v<sub>0</sub>t + (g · t²)/2", [["y", "posição vertical"], ["y<sub>0</sub>", "posição inicial"], ["g", "gravidade com sinal"], ["t", "tempo"]], "Se o eixo positivo é para cima, normalmente g = −10 m/s².")
    ],
    [
      ex("Uma pedra é abandonada do repouso. Use g = 10 m/s². Qual é sua velocidade após 3 s?", ["Como foi abandonada, v<sub>0</sub> = 0.", "Adotando sentido para baixo positivo: v = 0 + 10 · 3.", "v = 30 m/s."], "A velocidade é 30 m/s para baixo."),
      ex("No ponto mais alto de um lançamento vertical, qual é a velocidade instantânea?", ["O objeto ainda está sob aceleração da gravidade.", "No ponto mais alto, ele para momentaneamente antes de descer.", "Portanto, a velocidade instantânea é nula."], "No ponto mais alto, v = 0.")
    ],
    ["Dizer que a gravidade zera no ponto mais alto.", "Esquecer que o sinal de g depende do eixo escolhido.", "Misturar altura com deslocamento vertical sem referência."],
    ["Queda livre é movimento sob ação da gravidade.", "No lançamento vertical para cima, a velocidade diminui até zero.", "A gravidade permanece durante todo o movimento.", "A escolha do eixo define os sinais."]
  ),
  block("cinematica", "bloco-7-lancamento-horizontal-e-obliquo", "Bloco 7", "Lançamento Horizontal e Oblíquo", "movimento em duas dimensões", "lancamento",
    ["Independência dos movimentos", "Lançamento horizontal", "Lançamento oblíquo", "Componentes da velocidade inicial", "Alcance e altura máxima"],
    [
      formula("Componentes da velocidade inicial", "v<sub>0x</sub> = v<sub>0</sub> · cos θ; v<sub>0y</sub> = v<sub>0</sub> · sen θ", [["v<sub>0</sub>", "velocidade inicial"], ["θ", "ângulo de lançamento"], ["v<sub>0x</sub>", "componente horizontal"], ["v<sub>0y</sub>", "componente vertical"]], "Decompor o vetor separa o problema em dois eixos."),
      formula("Alcance horizontal", "A = v<sub>x</sub> · t", [["A", "alcance, em metro (m)"], ["v<sub>x</sub>", "velocidade horizontal"], ["t", "tempo total de voo"]], "Sem resistência do ar, v<sub>x</sub> é constante.")
    ],
    [
      ex("Um projétil é lançado horizontalmente com v<sub>x</sub> = 12 m/s e fica 3 s no ar. Qual é o alcance?", ["No eixo horizontal, a velocidade é constante.", "Use A = v<sub>x</sub> · t.", "A = 12 · 3 = 36 m."], "O alcance é 36 m."),
      ex("Por que o lançamento oblíquo pode ser separado em dois movimentos?", ["A componente horizontal não sofre aceleração, se desprezarmos o ar.", "A componente vertical sofre aceleração gravitacional.", "Como os eixos são independentes, resolvemos cada um separadamente."], "O movimento horizontal e o vertical são tratados separadamente.")
    ],
    ["Usar a velocidade total no lugar de v<sub>x</sub> para calcular alcance.", "Esquecer de decompor v<sub>0</sub>.", "Achar que a componente horizontal também acelera sem resistência do ar."],
    ["Lançamentos combinam movimento horizontal e vertical.", "A decomposição da velocidade inicial é a primeira etapa.", "O tempo de voo é determinado pelo eixo vertical.", "O alcance depende da componente horizontal e do tempo."]
  ),
  ...makeOndulatoria(),
  ...makeTermologia(),
  ...makeOptica()
];

function makeOndulatoria() {
  return [
    block("ondulatoria", "ondulatoria1-conceitos-iniciais", "Ondulatória 1", "Conceitos Iniciais de Ondulatória", "pulso, onda, amplitude, período, frequência e comprimento de onda", "onda",
      ["Pulso e onda", "Crista, vale e amplitude", "Comprimento de onda", "Período e frequência", "Velocidade de propagação"],
      [
        formula("Velocidade da onda", "v = λ · f", [["v", "velocidade de propagação, em m/s"], ["λ", "comprimento de onda, em metro (m)"], ["f", "frequência, em hertz (Hz)"]], "Se λ = 2 m e f = 4 Hz, então v = 8 m/s."),
        formula("Frequência e período", "f = 1/T", [["f", "frequência, em Hz"], ["T", "período, em segundo (s)"]], "Se T = 0,5 s, então f = 2 Hz.")
      ],
      [
        ex("Uma onda tem λ = 0,75 m e f = 6 Hz. Calcule sua velocidade.", ["Use v = λ · f.", "Substitua: v = 0,75 · 6.", "v = 4,5 m/s."], "A velocidade é 4,5 m/s."),
        ex("O período de uma onda é 0,25 s. Qual é sua frequência?", ["Use f = 1/T.", "f = 1/0,25.", "f = 4 Hz."], "A frequência é 4 Hz.")
      ],
      ["Confundir amplitude com comprimento de onda.", "Achar que frequência alta sempre significa velocidade alta.", "Esquecer que Hz significa s⁻¹."],
      ["Ondas transportam energia sem transportar matéria de forma permanente.", "Amplitude está ligada à intensidade/energia.", "λ é a distância entre pontos equivalentes da onda.", "v = λ · f conecta espaço e tempo na propagação."]
    ),
    block("ondulatoria", "ondulatoria2-fenomenos-ondulatorios", "Ondulatória 2", "Fenômenos Ondulatórios", "reflexão, refração, difração, interferência e polarização", "onda",
      ["Reflexão", "Refração", "Difração", "Interferência", "Polarização"],
      [
        formula("Lei da reflexão", "θ<sub>i</sub> = θ<sub>r</sub>", [["θ<sub>i</sub>", "ângulo de incidência"], ["θ<sub>r</sub>", "ângulo de reflexão"]], "Uma onda que incide a 30° reflete a 30° em relação à normal."),
        formula("Condição de interferência construtiva", "Δd = n · λ", [["Δd", "diferença de caminho"], ["n", "número inteiro"], ["λ", "comprimento de onda"]], "Quando as ondas chegam em fase, os efeitos se reforçam.")
      ],
      [
        ex("Uma onda incide em uma barreira com θ<sub>i</sub> = 40°. Qual é θ<sub>r</sub>?", ["Na reflexão, o ângulo incidente é igual ao refletido.", "θ<sub>r</sub> = θ<sub>i</sub>.", "θ<sub>r</sub> = 40°."], "O ângulo de reflexão é 40°."),
        ex("Por que a difração é mais perceptível quando a abertura tem tamanho próximo de λ?", ["A onda contorna obstáculos com mais evidência quando a abertura é comparável ao comprimento de onda.", "Se a abertura é muito maior que λ, o desvio fica menos marcante."], "Difração forte exige abertura da ordem de λ.")
      ],
      ["Confundir refração com reflexão.", "Pensar que interferência sempre aumenta a amplitude.", "Medir ângulos em relação à superfície em vez da normal."],
      ["Reflexão mantém a onda no mesmo meio.", "Refração ocorre com mudança de meio e velocidade.", "Difração é o espalhamento ao passar por abertura ou contornar obstáculo.", "Interferência pode reforçar ou cancelar ondas."]
    ),
    block("ondulatoria", "ondulatoria3-propriedades-do-som", "Ondulatória 3", "Propriedades do Som", "altura, intensidade, timbre e velocidade do som", "som",
      ["Som como onda mecânica", "Altura e frequência", "Intensidade e amplitude", "Timbre", "Velocidade do som"],
      [
        formula("Velocidade do som", "v = λ · f", [["v", "velocidade do som"], ["λ", "comprimento de onda"], ["f", "frequência"]], "No ar, usa-se frequentemente v ≈ 340 m/s em temperatura ambiente."),
        formula("Nível sonoro", "β = 10 · log(I/I<sub>0</sub>)", [["β", "nível sonoro, em decibel (dB)"], ["I", "intensidade sonora"], ["I<sub>0</sub>", "intensidade de referência"]], "O decibel usa escala logarítmica.")
      ],
      [
        ex("Um som no ar tem f = 170 Hz. Use v = 340 m/s. Qual é λ?", ["Use v = λ · f.", "Isole: λ = v/f.", "λ = 340/170 = 2 m."], "O comprimento de onda é 2 m."),
        ex("O que diferencia dois instrumentos tocando a mesma nota?", ["A nota está ligada à frequência fundamental.", "Instrumentos diferentes têm harmônicos com intensidades diferentes.", "Essa assinatura sonora é o timbre."], "O timbre diferencia os instrumentos.")
      ],
      ["Confundir altura sonora com volume.", "Dizer que som se propaga no vácuo.", "Achar que timbre depende apenas da frequência fundamental."],
      ["Som é onda mecânica longitudinal no ar.", "Altura depende da frequência.", "Intensidade depende da energia/amplitude.", "Timbre depende da composição de harmônicos."]
    ),
    block("ondulatoria", "ondulatoria4-fenomenos-sonoros", "Ondulatória 4", "Fenômenos Sonoros", "eco, reverberação, ressonância, batimentos e efeito Doppler", "som",
      ["Eco", "Reverberação", "Ressonância", "Batimentos", "Efeito Doppler"],
      [
        formula("Distância no eco", "d = (v · Δt)/2", [["d", "distância até o obstáculo"], ["v", "velocidade do som"], ["Δt", "tempo total de ida e volta"]], "Divide-se por 2 porque o som vai e volta."),
        formula("Batimentos", "f<sub>bat</sub> = |f<sub>1</sub> − f<sub>2</sub>|", [["f<sub>bat</sub>", "frequência dos batimentos"], ["f<sub>1</sub>, f<sub>2</sub>", "frequências próximas"]], "Sons de 440 Hz e 444 Hz geram batimentos de 4 Hz.")
      ],
      [
        ex("Um eco retorna após 0,8 s. Use v = 340 m/s. Qual é a distância até a parede?", ["Use d = (v · Δt)/2.", "d = (340 · 0,8)/2.", "d = 136 m."], "A parede está a 136 m."),
        ex("Duas fontes emitem 256 Hz e 260 Hz. Qual é a frequência dos batimentos?", ["Use f<sub>bat</sub> = |f<sub>1</sub> − f<sub>2</sub>|.", "f<sub>bat</sub> = |260 − 256|.", "f<sub>bat</sub> = 4 Hz."], "Os batimentos ocorrem a 4 Hz.")
      ],
      ["Esquecer o fator 2 no eco.", "Confundir eco com reverberação.", "Achar que Doppler muda a frequência emitida pela fonte, e não a percebida."],
      ["Eco é reflexão percebida separadamente.", "Reverberação é persistência sonora no ambiente.", "Ressonância aumenta a amplitude quando frequências combinam.", "Doppler altera a frequência percebida quando há movimento relativo."]
    ),
    block("ondulatoria", "ondulatoria5-cordas-e-tubos-sonoros", "Ondulatória 5", "Cordas e Tubos Sonoros", "ondas estacionárias, harmônicos e instrumentos musicais", "som",
      ["Ondas estacionárias", "Nós e ventres", "Cordas vibrantes", "Tubos abertos", "Tubos fechados"],
      [
        formula("Corda fixa nas extremidades", "f<sub>n</sub> = n · v/(2L)", [["f<sub>n</sub>", "frequência do n-ésimo harmônico"], ["n", "número do harmônico"], ["v", "velocidade da onda na corda"], ["L", "comprimento da corda"]], "O harmônico fundamental tem n = 1."),
        formula("Tubo fechado em uma extremidade", "f<sub>n</sub> = n · v/(4L), com n ímpar", [["n", "1, 3, 5, ..."], ["L", "comprimento do tubo"], ["v", "velocidade do som"]], "Tubos fechados só apresentam harmônicos ímpares no modelo ideal.")
      ],
      [
        ex("Uma corda de L = 1 m tem v = 100 m/s. Qual é a frequência fundamental?", ["Para n = 1, use f<sub>1</sub> = v/(2L).", "f<sub>1</sub> = 100/(2 · 1).", "f<sub>1</sub> = 50 Hz."], "A frequência fundamental é 50 Hz."),
        ex("Por que encurtar uma corda aumenta a frequência?", ["A frequência fundamental é inversamente proporcional ao comprimento.", "Se L diminui, v/(2L) aumenta.", "Por isso, a nota fica mais aguda."], "Corda menor produz frequência maior.")
      ],
      ["Usar fórmula de tubo aberto em tubo fechado.", "Esquecer que tubo fechado ideal só tem harmônicos ímpares.", "Confundir nó com ventre."],
      ["Ondas estacionárias aparecem por superposição de ondas opostas.", "Nós têm amplitude nula; ventres têm amplitude máxima.", "Cordas fixas têm nós nas extremidades.", "O comprimento controla os harmônicos permitidos."]
    ),
    block("ondulatoria", "ondulatoria6-movimento-harmonico-simples", "Ondulatória 6", "Movimento Harmônico Simples", "oscilações, período, frequência e energia", "onda",
      ["Oscilação periódica", "Amplitude", "Período e frequência", "Sistema massa-mola", "Pêndulo simples"],
      [
        formula("Massa-mola", "T = 2π√(m/k)", [["T", "período, em segundo (s)"], ["m", "massa, em kg"], ["k", "constante elástica, em N/m"]], "Massa maior aumenta o período; mola mais rígida reduz o período."),
        formula("Pêndulo simples", "T = 2π√(L/g)", [["T", "período"], ["L", "comprimento do fio"], ["g", "gravidade"]], "Para pequenas oscilações, o período independe da massa.")
      ],
      [
        ex("Um sistema massa-mola tem m = 1 kg e k = 100 N/m. Calcule o período aproximado.", ["Use T = 2π√(m/k).", "T = 2π√(1/100) = 2π · 0,1.", "T ≈ 0,63 s."], "O período é aproximadamente 0,63 s."),
        ex("Em um pêndulo simples, aumentar a massa muda o período?", ["No modelo ideal, T = 2π√(L/g).", "A massa não aparece na expressão.", "Logo, mudar a massa não altera o período ideal."], "A massa não muda o período no modelo ideal.")
      ],
      ["Achar que maior amplitude sempre muda o período no modelo ideal.", "Confundir período com frequência.", "Aplicar fórmula de pêndulo para oscilações muito grandes sem cuidado."],
      ["MHS é oscilação periódica em torno do equilíbrio.", "Período é tempo de uma oscilação completa.", "Frequência é o número de oscilações por segundo.", "Massa-mola e pêndulo têm fórmulas próprias para o período."]
    )
  ];
}

function makeTermologia() {
  return [
    block("termologia", "termologia1-fundamentos-de-termologia", "Termologia 1", "Fundamentos de Termologia", "temperatura, calor e equilíbrio térmico", "termometro",
      ["Temperatura", "Calor", "Energia térmica", "Equilíbrio térmico", "Lei zero da Termodinâmica"],
      [
        formula("Variação de temperatura", "ΔT = T<sub>f</sub> − T<sub>i</sub>", [["ΔT", "variação de temperatura"], ["T<sub>f</sub>", "temperatura final"], ["T<sub>i</sub>", "temperatura inicial"]], "Se T<sub>i</sub> = 20 °C e T<sub>f</sub> = 55 °C, então ΔT = 35 °C."),
        formula("Equilíbrio térmico", "T<sub>A</sub> = T<sub>B</sub>", [["T<sub>A</sub>", "temperatura do corpo A"], ["T<sub>B</sub>", "temperatura do corpo B"]], "No equilíbrio, não há fluxo líquido de calor entre os corpos.")
      ],
      [
        ex("Um corpo passa de 18 °C para 43 °C. Calcule ΔT.", ["Use ΔT = T<sub>f</sub> − T<sub>i</sub>.", "ΔT = 43 − 18.", "ΔT = 25 °C."], "A variação de temperatura é 25 °C."),
        ex("Por que calor não é a mesma coisa que temperatura?", ["Temperatura mede o estado térmico associado à agitação média.", "Calor é energia em trânsito por diferença de temperatura.", "Um corpo não possui calor; ele troca calor."], "Calor é energia transferida, não algo armazenado como substância.")
      ],
      ["Dizer que um corpo contém calor.", "Confundir sensação térmica com temperatura medida.", "Achar que equilíbrio térmico significa ausência de energia térmica."],
      ["Temperatura indica estado térmico.", "Calor é energia transferida por diferença de temperatura.", "Equilíbrio térmico ocorre quando temperaturas se igualam.", "A lei zero fundamenta o uso de termômetros."]
    ),
    block("termologia", "termologia2-escalas-termicas", "Termologia 2", "Escalas Térmicas", "Celsius, Fahrenheit e Kelvin", "termometro",
      ["Escala Celsius", "Escala Kelvin", "Escala Fahrenheit", "Conversões", "Temperatura absoluta"],
      [
        formula("Celsius para Kelvin", "T<sub>K</sub> = T<sub>C</sub> + 273", [["T<sub>K</sub>", "temperatura em kelvin (K)"], ["T<sub>C</sub>", "temperatura em graus Celsius (°C)"]], "27 °C correspondem a 300 K."),
        formula("Celsius e Fahrenheit", "T<sub>F</sub> = (9/5)T<sub>C</sub> + 32", [["T<sub>F</sub>", "temperatura em Fahrenheit"], ["T<sub>C</sub>", "temperatura em Celsius"]], "20 °C correspondem a 68 °F.")
      ],
      [
        ex("Converta 32 °C para kelvin.", ["Use T<sub>K</sub> = T<sub>C</sub> + 273.", "T<sub>K</sub> = 32 + 273.", "T<sub>K</sub> = 305 K."], "32 °C correspondem a 305 K."),
        ex("Converta 25 °C para Fahrenheit.", ["Use T<sub>F</sub> = (9/5)T<sub>C</sub> + 32.", "T<sub>F</sub> = (9/5) · 25 + 32 = 45 + 32.", "T<sub>F</sub> = 77 °F."], "25 °C correspondem a 77 °F.")
      ],
      ["Usar °C em equações de gases.", "Somar 273 em variações de temperatura.", "Escrever grau Kelvin; a unidade correta é kelvin, símbolo K."],
      ["Kelvin é escala absoluta.", "Intervalos em °C e K têm o mesmo tamanho.", "Conversões devem preservar o significado físico.", "Em gases, use temperatura em K."]
    ),
    block("termologia", "termologia3-dilatacao-termica", "Termologia 3", "Dilatação Térmica", "dilatação linear, superficial e volumétrica", "termometro",
      ["Dilatação linear", "Dilatação superficial", "Dilatação volumétrica", "Coeficientes de dilatação", "Dilatação de líquidos"],
      [
        formula("Dilatação linear", "ΔL = L<sub>0</sub> · α · ΔT", [["ΔL", "variação do comprimento"], ["L<sub>0</sub>", "comprimento inicial"], ["α", "coeficiente de dilatação linear"], ["ΔT", "variação de temperatura"]], "Barras maiores dilatam mais para a mesma variação de temperatura."),
        formula("Dilatação volumétrica", "ΔV = V<sub>0</sub> · γ · ΔT", [["ΔV", "variação de volume"], ["V<sub>0</sub>", "volume inicial"], ["γ", "coeficiente volumétrico"]], "Para sólidos isotrópicos, γ ≈ 3α.")
      ],
      [
        ex("Uma barra de 2 m tem α = 1,2 × 10<sup>−5</sup> °C<sup>−1</sup> e sofre ΔT = 50 °C. Calcule ΔL.", ["Use ΔL = L<sub>0</sub> · α · ΔT.", "ΔL = 2 · 1,2 × 10<sup>−5</sup> · 50.", "ΔL = 1,2 × 10<sup>−3</sup> m."], "A barra dilata 1,2 mm."),
        ex("Por que trilhos têm juntas de dilatação?", ["Metais aumentam de comprimento quando aquecidos.", "Sem folga, a dilatação geraria deformações.", "As juntas permitem expansão com menor risco estrutural."], "As juntas evitam empenamento dos trilhos.")
      ],
      ["Esquecer que ΔT pode ser negativo.", "Confundir comprimento final com dilatação.", "Usar coeficiente linear em fórmula volumétrica sem ajuste."],
      ["Dilatação depende do tamanho inicial, do material e de ΔT.", "Coeficientes indicam quanto o material dilata.", "A dilatação pode ser linear, superficial ou volumétrica.", "Folgas de engenharia existem para acomodar expansão térmica."]
    ),
    block("termologia", "termologia4-calorimetria", "Termologia 4", "Calorimetria", "calor sensível, calor latente e equilíbrio térmico", "calor",
      ["Calor sensível", "Calor latente", "Capacidade térmica", "Equilíbrio térmico", "Curvas de aquecimento"],
      [
        formula("Calor sensível", "Q = m · c · ΔT", [["Q", "calor, em joule (J)"], ["m", "massa, em kg"], ["c", "calor específico"], ["ΔT", "variação de temperatura"]], "Quanto maior a massa, maior o calor necessário para a mesma ΔT."),
        formula("Calor latente", "Q = m · L", [["Q", "calor trocado"], ["m", "massa"], ["L", "calor latente"]], "Usado em mudanças de estado físico.")
      ],
      [
        ex("Aqueça 0,5 kg de água de 20 °C a 60 °C. Use c = 4180 J/(kg · °C).", ["Calcule ΔT = 60 − 20 = 40 °C.", "Use Q = m · c · ΔT.", "Q = 0,5 · 4180 · 40 = 83 600 J."], "São necessários 83 600 J."),
        ex("Por que a temperatura não muda durante uma mudança de estado?", ["O calor recebido reorganiza as partículas.", "A energia entra como calor latente.", "A agitação média não aumenta durante o patamar ideal."], "Durante a mudança de estado, usa-se Q = m · L.")
      ],
      ["Usar Q = m · c · ΔT durante mudança de estado.", "Esquecer o sinal de Q quando o corpo perde calor.", "Misturar calor específico em cal/g°C com massa em kg sem converter."],
      ["Calor sensível muda temperatura.", "Calor latente muda estado físico.", "Equilíbrio térmico usa soma dos calores igual a zero no sistema isolado.", "Unidades precisam ser coerentes antes da substituição."]
    ),
    block("termologia", "termologia5-propagacao-de-calor", "Termologia 5", "Propagação de Calor", "condução, convecção e radiação", "calor",
      ["Condução", "Convecção", "Radiação", "Isolantes térmicos", "Fluxo de calor"],
      [
        formula("Fluxo por condução", "Φ = k · A · ΔT/L", [["Φ", "fluxo de calor"], ["k", "condutividade térmica"], ["A", "área"], ["L", "espessura"]], "Paredes mais espessas reduzem o fluxo de calor."),
        formula("Potência térmica", "P = Q/Δt", [["P", "potência térmica, em watt (W)"], ["Q", "calor, em joule (J)"], ["Δt", "intervalo de tempo"]], "Transferir 600 J em 10 s equivale a 60 W.")
      ],
      [
        ex("Uma parede mais grossa facilita ou dificulta a condução de calor?", ["Na fórmula Φ = k · A · ΔT/L, L está no denominador.", "Aumentar L diminui Φ.", "Logo, a parede mais grossa reduz o fluxo."], "Ela dificulta a condução de calor."),
        ex("Por que a convecção ocorre em fluidos?", ["Aquecimento altera a densidade do fluido.", "Partes mais quentes tendem a subir e partes mais frias descem.", "Esse movimento transporta energia."], "Convecção depende do movimento do fluido.")
      ],
      ["Confundir condução com convecção.", "Dizer que radiação precisa de meio material.", "Achar que isolante impede totalmente a troca de calor."],
      ["Condução ocorre por contato microscópico.", "Convecção envolve movimento de fluidos.", "Radiação ocorre por ondas eletromagnéticas.", "Isolantes reduzem, mas não eliminam completamente, trocas térmicas."]
    ),
    block("termologia", "termologia6-estudo-dos-gases", "Termologia 6", "Estudo dos Gases", "transformações gasosas e equação de estado", "gas",
      ["Variáveis de estado", "Transformação isotérmica", "Transformação isobárica", "Transformação isovolumétrica", "Equação de Clapeyron"],
      [
        formula("Equação geral dos gases", "p · V/T = constante", [["p", "pressão"], ["V", "volume"], ["T", "temperatura absoluta, em K"]], "A temperatura deve estar sempre em kelvin."),
        formula("Equação de Clapeyron", "p · V = n · R · T", [["p", "pressão"], ["V", "volume"], ["n", "quantidade de matéria"], ["R", "constante universal"], ["T", "temperatura absoluta"]], "Relaciona o estado de um gás ideal.")
      ],
      [
        ex("Um gás dobra o volume em temperatura constante. O que ocorre com a pressão?", ["Em transformação isotérmica, p · V = constante.", "Se V dobra, p deve cair pela metade.", "Assim o produto p · V permanece constante."], "A pressão fica igual à metade da inicial."),
        ex("Por que usar kelvin nas leis dos gases?", ["As leis dos gases usam proporcionalidade com temperatura absoluta.", "A escala Celsius não começa no zero absoluto.", "Por isso, T deve ser expresso em K."], "Use sempre temperatura em kelvin.")
      ],
      ["Usar °C em p · V/T.", "Confundir transformação isobárica com isotérmica.", "Achar que pressão e volume sempre aumentam juntos."],
      ["Estado gasoso é descrito por p, V, T e n.", "Isotérmica mantém T constante.", "Isobárica mantém p constante.", "Isovolumétrica mantém V constante.", "Clapeyron resume o modelo de gás ideal."]
    ),
    block("termologia", "termologia7-termodinamica", "Termologia 7", "Termodinâmica", "trabalho, calor, energia interna e máquinas térmicas", "gas",
      ["Energia interna", "Trabalho de um gás", "Primeira lei", "Segunda lei", "Máquinas térmicas"],
      [
        formula("Primeira lei da Termodinâmica", "ΔU = Q − τ", [["ΔU", "variação da energia interna"], ["Q", "calor recebido pelo sistema"], ["τ", "trabalho realizado pelo sistema"]], "Se o gás recebe calor e realiza trabalho, parte da energia sai como trabalho."),
        formula("Rendimento de máquina térmica", "η = τ/Q<sub>q</sub>", [["η", "rendimento"], ["τ", "trabalho útil"], ["Q<sub>q</sub>", "calor recebido da fonte quente"]], "O rendimento sempre é menor que 100% em máquinas reais.")
      ],
      [
        ex("Um gás recebe Q = 500 J e realiza τ = 200 J. Calcule ΔU.", ["Use ΔU = Q − τ.", "ΔU = 500 − 200.", "ΔU = 300 J."], "A energia interna aumenta 300 J."),
        ex("Por que uma máquina térmica não converte todo calor em trabalho?", ["A segunda lei impõe rejeição de parte do calor para uma fonte fria.", "Perdas reais também reduzem o rendimento.", "Logo, η < 1."], "Máquinas térmicas não têm rendimento de 100%.")
      ],
      ["Trocar o sinal do trabalho sem observar a convenção.", "Achar que calor recebido vira sempre trabalho integralmente.", "Confundir energia interna com temperatura em qualquer situação."],
      ["A primeira lei expressa conservação de energia.", "Trabalho do gás reduz a energia disponível no sistema.", "Máquinas térmicas operam entre fontes quente e fria.", "A segunda lei limita o rendimento."]
    )
  ];
}

function makeOptica() {
  return [
    block("optica", "optica1-conceitos-fundamentais", "Óptica 1", "Conceitos Fundamentais de Óptica", "luz, raios luminosos, sombra, penumbra e princípios da óptica geométrica", "reflexao",
      ["Luz e raio luminoso", "Meios transparentes, translúcidos e opacos", "Propagação retilínea", "Sombra e penumbra", "Câmara escura"],
      [
        formula("Propagação retilínea", "em meio homogêneo: trajetória retilínea", [["meio homogêneo", "meio com mesmas propriedades em todos os pontos"], ["raio luminoso", "representação geométrica da direção de propagação"]], "Sombras nítidas aparecem porque a luz se propaga em linha reta em meios homogêneos."),
        formula("Câmara escura", "h<sub>i</sub>/h<sub>o</sub> = d<sub>i</sub>/d<sub>o</sub>", [["h<sub>i</sub>", "altura da imagem"], ["h<sub>o</sub>", "altura do objeto"], ["d<sub>i</sub>", "distância da imagem ao orifício"], ["d<sub>o</sub>", "distância do objeto ao orifício"]], "A imagem da câmara escura é invertida.")
      ],
      [
        ex("Por que a sombra de um objeto pode ser explicada por raios de luz?", ["Em meio homogêneo, a luz se propaga em linha reta.", "O objeto opaco bloqueia parte dos raios.", "A região sem iluminação direta forma a sombra."], "A sombra resulta da propagação retilínea e do bloqueio da luz."),
        ex("Em uma câmara escura, d<sub>i</sub> = 10 cm, d<sub>o</sub> = 100 cm e h<sub>o</sub> = 1,8 m. Calcule h<sub>i</sub>.", ["Use h<sub>i</sub>/h<sub>o</sub> = d<sub>i</sub>/d<sub>o</sub>.", "h<sub>i</sub> = 1,8 · 10/100.", "h<sub>i</sub> = 0,18 m."], "A imagem tem 18 cm.")
      ],
      ["Confundir raio luminoso com objeto físico.", "Achar que sombra e penumbra são a mesma coisa.", "Ignorar que o modelo de raios é uma aproximação geométrica."],
      ["Óptica geométrica representa a luz por raios.", "Em meio homogêneo, a luz se propaga em linha reta.", "Sombra e penumbra dependem do tamanho da fonte luminosa.", "Câmara escura forma imagem invertida."]
    ),
    block("optica", "optica2-espelhos-planos", "Óptica 2", "Espelhos Planos", "reflexão regular, imagem virtual e campo visual", "reflexao",
      ["Lei da reflexão", "Imagem em espelho plano", "Imagem virtual", "Campo visual", "Associação de espelhos"],
      [
        formula("Lei da reflexão", "θ<sub>i</sub> = θ<sub>r</sub>", [["θ<sub>i</sub>", "ângulo de incidência"], ["θ<sub>r</sub>", "ângulo de reflexão"]], "Os ângulos são medidos em relação à normal."),
        formula("Número de imagens entre espelhos", "N = 360°/α − 1", [["N", "número de imagens"], ["α", "ângulo entre os espelhos"]], "A expressão vale diretamente quando 360°/α é inteiro.")
      ],
      [
        ex("Um raio incide em um espelho plano com ângulo de 35° em relação à normal. Qual é o ângulo de reflexão?", ["Pela lei da reflexão, θ<sub>i</sub> = θ<sub>r</sub>.", "θ<sub>r</sub> = 35°.", "A medida é feita em relação à normal."], "O ângulo de reflexão é 35°."),
        ex("Dois espelhos planos formam α = 60°. Quantas imagens aparecem?", ["Use N = 360°/α − 1.", "N = 360°/60° − 1.", "N = 6 − 1 = 5."], "Formam-se 5 imagens.")
      ],
      ["Medir o ângulo em relação ao espelho em vez da normal.", "Dizer que a imagem do espelho plano é real.", "Confundir inversão lateral com inversão de cima para baixo."],
      ["Espelho plano obedece θ<sub>i</sub> = θ<sub>r</sub>.", "A imagem é virtual, direita e do mesmo tamanho.", "A distância da imagem ao espelho é igual à distância do objeto.", "Espelhos associados podem formar múltiplas imagens."]
    ),
    block("optica", "optica3-espelhos-esfericos", "Óptica 3", "Espelhos Esféricos", "espelhos côncavos, convexos e formação de imagens", "reflexao",
      ["Espelho côncavo", "Espelho convexo", "Foco e centro de curvatura", "Equação de Gauss", "Aumento linear"],
      [
        formula("Equação dos espelhos esféricos", "1/f = 1/p + 1/p'", [["f", "distância focal"], ["p", "distância do objeto"], ["p'", "distância da imagem"]], "Sinais devem seguir a convenção adotada no curso."),
        formula("Aumento linear", "A = i/o = −p'/p", [["A", "aumento linear"], ["i", "altura da imagem"], ["o", "altura do objeto"], ["p, p'", "distâncias do objeto e da imagem"]], "A negativo indica imagem invertida.")
      ],
      [
        ex("Um espelho côncavo tem f = 20 cm e objeto em p = 60 cm. Calcule p'.", ["Use 1/f = 1/p + 1/p'.", "1/20 = 1/60 + 1/p'.", "1/p' = 1/20 − 1/60 = 2/60 = 1/30."], "A imagem está a p' = 30 cm."),
        ex("Se A = −0,5 em um espelho, o que isso significa?", ["O sinal negativo indica imagem invertida.", "O módulo 0,5 indica metade do tamanho do objeto.", "A imagem é menor e invertida."], "Imagem invertida e reduzida pela metade.")
      ],
      ["Usar f = R em vez de f = R/2.", "Ignorar convenção de sinais.", "Confundir espelho convexo com lente convergente."],
      ["Espelhos côncavos podem formar imagens reais ou virtuais.", "Espelhos convexos formam imagens virtuais, direitas e reduzidas.", "A equação de Gauss relaciona foco, objeto e imagem.", "O aumento informa tamanho e orientação."]
    ),
    block("optica", "optica4-refracao-da-luz", "Óptica 4", "Refração da Luz", "índice de refração, lei de Snell e reflexão total", "refracao",
      ["Índice de refração", "Lei de Snell", "Desvio da luz", "Ângulo limite", "Reflexão total"],
      [
        formula("Índice de refração", "n = c/v", [["n", "índice de refração"], ["c", "velocidade da luz no vácuo"], ["v", "velocidade da luz no meio"]], "Quanto maior n, menor a velocidade da luz no meio."),
        formula("Lei de Snell", "n<sub>1</sub> · sen θ<sub>1</sub> = n<sub>2</sub> · sen θ<sub>2</sub>", [["n<sub>1</sub>, n<sub>2</sub>", "índices dos meios"], ["θ<sub>1</sub>, θ<sub>2</sub>", "ângulos com a normal"]], "Ao entrar em meio mais refringente, o raio se aproxima da normal."),
        formula("Ângulo limite", "sen L = n<sub>menor</sub>/n<sub>maior</sub>", [["L", "ângulo limite"], ["n<sub>maior</sub>", "índice do meio mais refringente"], ["n<sub>menor</sub>", "índice do meio menos refringente"]], "Reflexão total só ocorre do meio mais refringente para o menos refringente.")
      ],
      [
        ex("A luz passa do ar para o vidro. O raio se aproxima ou se afasta da normal?", ["Vidro tem índice maior que o ar.", "Ao entrar em meio mais refringente, a velocidade diminui.", "O raio se aproxima da normal."], "O raio se aproxima da normal."),
        ex("Um meio tem n = 1,5. Qual é a velocidade da luz nele? Use c = 3,0 × 10<sup>8</sup> m/s.", ["Use n = c/v.", "Isole: v = c/n.", "v = 3,0 × 10<sup>8</sup>/1,5 = 2,0 × 10<sup>8</sup> m/s."], "A velocidade é 2,0 × 10<sup>8</sup> m/s.")
      ],
      ["Medir ângulo em relação à superfície.", "Achar que frequência muda na refração.", "Aplicar reflexão total indo do meio menos refringente para o mais refringente."],
      ["Refração é mudança de velocidade da luz ao trocar de meio.", "A frequência permanece constante na mudança de meio.", "Snell relaciona índices e ângulos.", "Reflexão total exige sentido do meio mais refringente para o menos refringente."]
    ),
    block("optica", "optica5-lentes-e-visao", "Óptica 5", "Lentes e Visão Humana", "lentes convergentes, divergentes, imagens e correções visuais", "lente",
      ["Lentes convergentes", "Lentes divergentes", "Equação das lentes", "Vergência", "Miopia e hipermetropia"],
      [
        formula("Equação das lentes delgadas", "1/f = 1/p + 1/p'", [["f", "distância focal"], ["p", "distância do objeto"], ["p'", "distância da imagem"]], "A mesma forma algébrica aparece em espelhos, mas a convenção física deve ser respeitada."),
        formula("Vergência", "V = 1/f", [["V", "vergência, em dioptria (D)"], ["f", "distância focal, em metro (m)"]], "Uma lente de f = 0,5 m tem V = 2 D.")
      ],
      [
        ex("Uma lente tem f = 0,25 m. Calcule a vergência.", ["Use V = 1/f.", "V = 1/0,25.", "V = 4 D."], "A vergência é 4 dioptrias."),
        ex("Qual lente corrige miopia?", ["Na miopia, a imagem tende a se formar antes da retina.", "Usa-se lente divergente para espalhar os raios antes de entrarem no olho.", "Isso desloca a formação da imagem para a retina."], "Miopia é corrigida com lente divergente.")
      ],
      ["Usar focal em centímetros na fórmula V = 1/f sem converter para metro.", "Confundir lente convergente com divergente.", "Dizer que toda lente convergente sempre forma imagem real."],
      ["Lentes convergentes podem formar imagens reais ou virtuais.", "Lentes divergentes formam imagens virtuais, direitas e reduzidas no caso usual.", "Vergência é medida em dioptrias.", "Defeitos de visão são corrigidos alterando a convergência dos raios."]
    )
  ];
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pageBreak() {
  return '<div class="page-break"></div>';
}

function writeDiagrams() {
  ensureDir(diagramRoot);
  for (const d of Object.values(diagrams)) {
    fs.writeFileSync(path.join(diagramRoot, d.file), d.svg, "utf8");
  }
}

function renderFormula(f) {
  return `<section class="formula-card">
    <p class="label">Fórmula-chave</p>
    <h3>${esc(f.name)}</h3>
    <div class="math">${f.expression}</div>
    <div class="symbol-grid">${f.symbols.map(([s, d]) => `<div><strong>${s}</strong><span>${esc(d)}</span></div>`).join("")}</div>
    <div class="mini-example"><strong>Exemplo simples:</strong> ${f.example}</div>
  </section>`;
}

function renderSteps(steps) {
  return `<ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>`;
}

function exerciseSet(c) {
  const extras = [
    ex(`Explique a ideia central de ${c.title} sem começar por fórmula.`, ["Identifique o fenômeno físico estudado.", "Cite as grandezas principais.", "Finalize conectando conceito, unidade e interpretação."], "Resposta esperada: explicação física clara, com grandezas e unidades."),
    ex("Aponte um erro comum desse bloco e corrija-o.", ["Escolha uma confusão frequente da seção de erros comuns.", "Explique por que ela é incorreta.", "Mostre o procedimento correto."], "Erro identificado e correção justificada."),
    ex("Monte um quadro de dados antes de resolver uma questão numérica do bloco.", ["Liste dados fornecidos.", "Converta unidades quando necessário.", "Escreva a fórmula somente depois de identificar o pedido."], "Quadro organizado com dados, unidade e incógnita.")
  ];
  return [...c.examples, ...extras].slice(0, 5);
}

function renderDoc(c) {
  const diagram = diagrams[c.diagram] || diagrams.eixo;
  const relDiagram = `../fontes-e-imagens/diagramas-autorais/${diagram.file}`;
  const groupName = groups[c.folder] || c.folder;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${esc(c.blockLabel)} - ${esc(c.title)}</title>
  <style>
    @page{size:A4;margin:13mm}
    *{box-sizing:border-box}
    body{margin:0;background:#eef4ff;color:#172033;font-family:Arial,Helvetica,sans-serif;line-height:1.54}
    .page{min-height:268mm;background:#fff;border:1px solid #dbeafe;border-radius:22px;padding:27px;margin:0 auto 18px;box-shadow:0 14px 36px rgba(30,64,175,.10);position:relative;overflow:hidden}
    .cover{display:grid;align-content:center;background:radial-gradient(circle at 80% 14%,rgba(124,58,237,.28),transparent 30%),linear-gradient(135deg,#020617,#172554 56%,#2563eb);color:#fff}
    .brand{display:flex;align-items:center;gap:12px;text-transform:uppercase;font-weight:900;letter-spacing:.08em;color:#bfdbfe}
    .logo{width:44px;height:44px;border-radius:15px;background:linear-gradient(135deg,#7c3aed,#38bdf8);display:grid;place-items:center;color:#fff;font-weight:900}
    h1{font-size:43px;line-height:1.02;margin:24px 0 12px;color:inherit}
    h2{font-size:25px;color:#1d4ed8;margin:0 0 12px}
    h3{font-size:18px;color:#172033;margin:0 0 10px}
    p{margin:0 0 12px}.muted{color:#64748b}.lead{font-size:18px;color:#dbeafe;max-width:650px}
    .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:34px}.meta div{background:rgba(255,255,255,.1);border:1px solid rgba(191,219,254,.24);border-radius:16px;padding:14px}.meta span{display:block;color:#bfdbfe;font-size:12px;text-transform:uppercase;font-weight:800}.meta strong{display:block;color:#fff;margin-top:4px}
    .card,.formula-card,.example,.warning,.tip,.exercise{background:#fff;border:1px solid #dbeafe;border-radius:18px;padding:17px;margin:13px 0;box-shadow:0 10px 22px rgba(37,99,235,.07);break-inside:avoid;page-break-inside:avoid}
    .route{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.route div{padding:13px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe;font-weight:700;color:#1e3a8a}
    .image-card{display:grid;grid-template-columns:1fr 1.04fr;gap:18px;align-items:center}.image-card img{width:100%;max-height:226px;object-fit:contain;border-radius:16px;background:#f8fbff;border:1px solid #dbeafe;padding:8px}.caption{font-size:12px;color:#64748b}
    .label{display:inline-flex;margin:0 0 10px;padding:6px 10px;border-radius:999px;background:#e0e7ff;color:#4338ca;font-size:12px;font-weight:900;text-transform:uppercase}
    .math{font-family:"Cambria Math","Times New Roman",serif;font-size:30px;text-align:center;background:linear-gradient(135deg,#eff6ff,#eef2ff);border:1px solid #bfdbfe;border-radius:16px;padding:15px;margin:11px 0;color:#0f172a}
    .symbol-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.symbol-grid div{background:#f8fbff;border:1px solid #e2e8f0;border-radius:12px;padding:10px}.symbol-grid strong{color:#1d4ed8}.symbol-grid span{display:block;color:#475569;font-size:13px}
    .mini-example,.tip{background:#ecfdf5;border-color:#bbf7d0;color:#14532d}.warning{background:#fffbeb;border-color:#fde68a;color:#78350f}.example{background:#f8fbff}.answer{margin-top:10px;padding:12px;border-radius:14px;background:#dbeafe;color:#1e3a8a;font-weight:900}
    ol,ul{margin:8px 0 0;padding-left:22px}li{margin:4px 0}.page-break{break-after:page}
    .refs p{font-size:13px;color:#475569}.footer{position:absolute;left:27px;right:27px;bottom:15px;color:#94a3b8;font-size:11px;display:flex;justify-content:space-between}
    @media print{body{background:#fff}.page{box-shadow:none;margin:0;border:none;border-radius:0;min-height:auto}.page-break{break-after:page}}
  </style>
</head>
<body>
  <section class="page cover">
    <div class="brand"><div class="logo">UR</div><span>Universo Relativo</span></div>
    <h1>${esc(c.title)}</h1>
    <p class="lead">${esc(c.subject)}. Material refeito com linguagem didática, matemática revisada, exemplos resolvidos e exercícios comentados.</p>
    <div class="meta"><div><span>Curso</span><strong>Universo Relativo</strong></div><div><span>Área</span><strong>Física</strong></div><div><span>${esc(groupName)}</span><strong>${esc(c.blockLabel)}</strong></div></div>
  </section>${pageBreak()}
  <section class="page">
    <h2>Roteiro do bloco</h2>
    <div class="route">${c.topics.map((t, i) => `<div>${String(i + 1).padStart(2, "0")}. ${esc(t)}</div>`).join("")}</div>
    <div class="tip"><strong>Como estudar:</strong> leia a explicação, refaça os exemplos sem olhar a resolução e depois tente os exercícios. A matemática fica mais segura quando cada símbolo é entendido antes da substituição.</div>
    <div class="image-card card">
      <div><h2>Introdução</h2><p>${esc(c.title)} organiza uma parte importante da Física. Neste bloco, o foco é entender o fenômeno, reconhecer as grandezas, usar unidades corretas e interpretar cada resultado.</p><p>Antes de aplicar qualquer fórmula, pergunte: qual é o sistema físico, quais dados foram fornecidos e qual grandeza o problema pede?</p></div>
      <figure><img src="${relDiagram}" alt="${esc(diagram.caption)}"><figcaption class="caption">${esc(diagram.caption)}</figcaption></figure>
    </div>
  </section>${pageBreak()}
  <section class="page">
    <h2>Conceitos principais</h2>
    ${c.topics.map((t, i) => `<div class="card"><h3>${esc(t)}</h3><p>${conceptText(c, t, i)}</p></div>`).join("")}
    <div class="warning"><strong>Erro comum:</strong> copiar uma fórmula antes de entender o que cada símbolo representa. Antes de substituir valores, escreva as unidades e confira se as grandezas pertencem à mesma situação física.</div>
  </section>${pageBreak()}
  <section class="page">
    <h2>Fórmulas essenciais</h2>
    ${c.formulas.map(renderFormula).join("")}
  </section>${pageBreak()}
  <section class="page">
    <h2>Exemplos resolvidos</h2>
    ${c.examples.map((item, i) => `<div class="example"><p class="label">Exemplo ${i + 1}</p><h3>${item.q}</h3><p><strong>Resolução passo a passo:</strong></p>${renderSteps(item.steps)}<div class="answer">${item.answer}</div></div>`).join("")}
  </section>${pageBreak()}
  <section class="page">
    <h2>Erros comuns</h2>
    ${c.commonErrors.map((err) => `<div class="warning"><strong>Atenção:</strong> ${esc(err)}</div>`).join("")}
    <h2>Exercícios para fixação</h2>
    ${exerciseSet(c).map((item, i) => `<div class="exercise"><p class="label">Exercício ${i + 1}</p><h3>${item.q}</h3><p><strong>Resolução completa:</strong></p>${renderSteps(item.steps)}<div class="answer">${item.answer}</div></div>`).join("")}
  </section>${pageBreak()}
  <section class="page">
    <h2>Resumo final</h2>
    <ul>${c.summary.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    <div class="tip"><strong>Fechamento do bloco:</strong> uma resposta de Física só está completa quando traz valor numérico, unidade correta e interpretação do resultado.</div>
    <h2>Referências das imagens</h2>
    <div class="refs"><p>${esc(diagram.title)}: diagrama autoral criado para o projeto Universo Relativo, arquivo local <strong>${esc(diagram.file)}</strong>.</p><p>Logo e identidade visual: Universo Relativo, usados como marca do material didático.</p></div>
  </section>
</body>
</html>`;
}

function conceptText(c, topic, index) {
  const base = [
    `Este ponto define a linguagem do bloco. Ao estudar ${topic.toLowerCase()}, observe quais grandezas aparecem, como elas são medidas e qual relação física conecta os dados.`,
    `A ideia central é evitar substituição mecânica. Primeiro interpretamos a situação, depois escolhemos a expressão matemática compatível com o fenômeno.`,
    `Sempre escreva as unidades junto dos valores. Isso ajuda a perceber conversões necessárias e evita resultados numericamente corretos, mas fisicamente sem sentido.`,
    `Quando houver direção, sentido, imagem, onda ou troca de energia, desenhe um esquema simples. O diagrama costuma revelar a equação correta.`,
    `Finalize conferindo se o resultado responde exatamente ao que foi perguntado e se a ordem de grandeza é plausível.`
  ];
  return esc(base[index % base.length]);
}

function writeManifest() {
  const manifest = apostilas.map((c) => ({
    grupo: c.folder,
    arquivo: `${c.file}.html`,
    pdf: `${c.file}.pdf`,
    titulo: c.title,
    bloco: c.blockLabel
  }));
  fs.writeFileSync(path.join(outRoot, "manifesto.json"), JSON.stringify(manifest, null, 2), "utf8");
}

function writeRefs() {
  const lines = [
    "# Fontes e imagens",
    "",
    "As imagens usadas nesta versão foram geradas como diagramas autorais em SVG para o projeto Universo Relativo.",
    "Quando uma apostila precisar de imagem externa, usar preferencialmente Wikimedia Commons, OpenStax, PhET Interactive Simulations, NASA Image Library, The Physics Classroom, HyperPhysics, LibreTexts Physics, SVG Repo, Heroicons ou Lucide, sempre registrando origem, licença e créditos.",
    "Ícones de bibliotecas como SVG Repo, Heroicons e Lucide devem ser usados apenas como apoio visual, não como conteúdo físico principal.",
    "Licença dos diagramas locais: material autoral do Universo Relativo.",
    "",
    "## Arquivos"
  ];
  for (const d of Object.values(diagrams)) {
    lines.push(`- ${d.file}: ${d.title}. ${d.caption}`);
  }
  fs.writeFileSync(path.join(assetRoot, "referencias-imagens.md"), lines.join("\n"), "utf8");
}

ensureDir(outRoot);
ensureDir(assetRoot);
writeDiagrams();

for (const c of apostilas) {
  const dir = path.join(outRoot, c.folder);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${c.file}.html`), renderDoc(c), "utf8");
}

writeManifest();
writeRefs();
console.log(`Apostilas HTML geradas: ${apostilas.length}`);
