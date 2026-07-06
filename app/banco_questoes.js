window.BANCO_QUESTOES = {
  disciplinas: {
    "fisica-basica": {
      label: "Física Básica",
      assuntos: {
        "fisica-basica": { label: "Física Básica", questoes: [] },
        cinematica: {
          label: "Cinemática",
          questoes: [],
          subassuntos: {
            "introducao-a-cinematica": {
              label: "Introdução à Cinemática",
              questoes: [
                {
                  id: "FBM001",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Em 2016 foi batido o recorde de voo ininterrupto mais longo da hist&oacute;ria. O avi&atilde;o Solar Impulse 2, movido a energia solar, percorreu quase 6.480 km em aproximadamente 5 dias, partindo de Nagoya no Jap&atilde;o at&eacute; o Hava&iacute; nos Estados Unidos da Am&eacute;rica.</p><p>A velocidade escalar m&eacute;dia desenvolvida pelo avi&atilde;o foi de aproximadamente</p>",
                  alternativas: [
                    "a) 54 km/h.",
                    "b) 15 km/h.",
                    "c) 1.296 km/h.",
                    "d) 198 km/h."
                  ],
                  correta: 0,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>Usamos a velocidade m&eacute;dia: <strong>v = &Delta;s / &Delta;t</strong>.</p><p>A dist&acirc;ncia foi de <strong>6.480 km</strong> e o tempo foi de <strong>5 dias = 5 &times; 24 = 120 h</strong>.</p><p>Logo, <strong>v = 6480 / 120 = 54 km/h</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>A</strong>.</p>"
                },
                {
                  id: "FBM002",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Podemos considerar que a velocidade de crescimento do cabelo humano &eacute;, em m&eacute;dia, de 1 mil&iacute;metro a cada tr&ecirc;s dias.</p><p>Esta velocidade pode variar de pessoa para pessoa, mas &eacute; constante para cada um de n&oacute;s, n&atilde;o havendo qualquer base cient&iacute;fica que venha comprovar que podemos acelerar o crescimento capilar cortando o cabelo em determinada fase da Lua ou aparando as pontas para dar for&ccedil;a ao fio. O que se pode afirmar &eacute; que os h&aacute;bitos de alimenta&ccedil;&atilde;o e o metabolismo de cada indiv&iacute;duo influenciam diretamente no crescimento dos fios.</p><p>Se os cabelos de uma jovem t&ecirc;m velocidade de crescimento que acompanha a m&eacute;dia, em quanto tempo seu cabelo crescer&aacute; 9 cm?</p>",
                  alternativas: [
                    "a) 9 horas.",
                    "b) 9 dias.",
                    "c) 9 meses.",
                    "d) 9 anos."
                  ],
                  correta: 2,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>A taxa de crescimento &eacute; <strong>1 mm a cada 3 dias</strong>.</p><p>Como <strong>9 cm = 90 mm</strong>, o cabelo precisa crescer <strong>90 vezes 1 mm</strong>.</p><p>Ent&atilde;o o tempo ser&aacute; <strong>90 &times; 3 = 270 dias</strong>.</p><p>Considerando <strong>1 m&ecirc;s &asymp; 30 dias</strong>, temos <strong>270 / 30 = 9 meses</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>C</strong>.</p>"
                },
                {
                  id: "FBM003",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Para os jogos ol&iacute;mpicos que ser&atilde;o realizados no Brasil, em 2016, espera-se bater o recorde na prova de nado borboleta em piscina de 50m, alcan&ccedil;ada no campeonato brasileiro, de 2012, no Rio de Janeiro. Naquela oportunidade, a prova foi realizada em 22,76 segundos, quando C&eacute;sar Cielo desenvolveu uma velocidade de, aproximadamente, 2,00 m/s.</p><p>HTTP://tribunadonorte.com.br.</p><p>A velocidade empreendida pelo atleta na prova corresponde, em km/h, a</p>",
                  alternativas: [
                    "a) 1,64.",
                    "b) 7,2.",
                    "c) 8,00.",
                    "d) 11,38.",
                    "e) 25,00."
                  ],
                  correta: 1,
                  imagem: {
                    src: "imagens/questoes/fbm003-nado-borboleta.jpg",
                    alt: "Nadador executando nado borboleta em piscina de 50 metros",
                    legenda: "Nado borboleta em piscina de 50 m. Fonte: Wikimedia Commons, CC0."
                  },
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>O enunciado informa velocidade aproximada de <strong>2,00 m/s</strong>.</p><p>Para converter de <strong>m/s</strong> para <strong>km/h</strong>, multiplicamos por <strong>3,6</strong>.</p><p>Assim, <strong>2,00 &times; 3,6 = 7,2 km/h</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>B</strong>.</p>"
                },
                {
                  id: "FBM004",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Um motorista planejou realizar uma viagem de 240 km em, no m&aacute;ximo, 3 horas. Ap&oacute;s percorrer 160 km em 1 hora e 45 minutos, teve que ficar parado por 15 minutos devido &agrave; execu&ccedil;&atilde;o de obras na estrada. Para cumprir o planejamento inicial, o motorista deve realizar o restante do percurso com velocidade m&eacute;dia de</p>",
                  alternativas: [
                    "a) 60 km/h.",
                    "b) 80 km/h.",
                    "c) 85 km/h.",
                    "d) 90 km/h.",
                    "e) 95 km/h."
                  ],
                  correta: 1,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>O tempo total dispon&iacute;vel era de <strong>3 h</strong>.</p><p>Ele j&aacute; usou <strong>1 h 45 min</strong> dirigindo e ficou <strong>15 min</strong> parado. Isso soma <strong>2 h</strong>.</p><p>Resta, portanto, <strong>1 h</strong> para completar a viagem.</p><p>A dist&acirc;ncia restante &eacute; <strong>240 - 160 = 80 km</strong>.</p><p>Logo, a velocidade m&eacute;dia necess&aacute;ria &eacute; <strong>v = 80 / 1 = 80 km/h</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>B</strong>.</p>"
                },
                {
                  id: "FBM005",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Um passageiro de &ocirc;nibus est&aacute; transitando pela Taba&iacute; Canoas no sentido Santa Cruz do Sul &ndash; Porto Alegre quando v&ecirc; uma placa indicando que faltam 12 km para chegar ao Restaurante GreNal. A partir deste momento ele marca o tempo at&eacute; passar pela frente deste restaurante. O tempo marcado foi de 10 minutos. Qual foi a velocidade m&eacute;dia do &ocirc;nibus neste trajeto?</p>",
                  alternativas: [
                    "a) 72 km/h",
                    "b) 50 km/h",
                    "c) 80 km/h",
                    "d) 68 km/h",
                    "e) 120 km/h"
                  ],
                  correta: 0,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>Usamos <strong>v = &Delta;s / &Delta;t</strong>.</p><p>A dist&acirc;ncia foi de <strong>12 km</strong> e o tempo de <strong>10 min = 10/60 h = 1/6 h</strong>.</p><p>Assim, <strong>v = 12 / (1/6) = 12 &times; 6 = 72 km/h</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>A</strong>.</p>"
                },
                {
                  id: "FBM006",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Uma formiga cortadeira, movendo-se a 8 cm/s deixa a entrada do formigueiro em dire&ccedil;&atilde;o a uma folha que est&aacute; 8 m distante do ponto em que se encontrava. Para cortar essa folha, a formiga necessita de 40 s. Ao retornar &agrave; entrada do formigueiro pelo mesmo caminho, a formiga desenvolve uma velocidade de 4 cm/s, por causa do peso da folha e de uma brisa constante contra o seu movimento.</p><p>O tempo total gasto pela formiga ao realizar a sequ&ecirc;ncia de a&ccedil;&otilde;es descritas foi</p>",
                  alternativas: [
                    "a) 340 s.",
                    "b) 420 s.",
                    "c) 260 s.",
                    "d) 240 s.",
                    "e) 200 s."
                  ],
                  correta: 0,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>A dist&acirc;ncia at&eacute; a folha &eacute; <strong>8 m = 800 cm</strong>.</p><p>Na ida, a velocidade &eacute; <strong>8 cm/s</strong>, ent&atilde;o o tempo &eacute; <strong>800 / 8 = 100 s</strong>.</p><p>A formiga ainda gasta <strong>40 s</strong> para cortar a folha.</p><p>Na volta, a velocidade &eacute; <strong>4 cm/s</strong>, ent&atilde;o o tempo &eacute; <strong>800 / 4 = 200 s</strong>.</p><p>Tempo total: <strong>100 + 40 + 200 = 340 s</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>A</strong>.</p>"
                },
                {
                  id: "FBM007",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Considerando as informa&ccedil;&otilde;es apresentadas nas alternativas, assinale a alternativa que indica o p&aacute;ssaro mais veloz.</p>",
                  alternativas: [
                    "a) Beija-flores voam a aproximadamente 90 km/h.",
                    "b) Gaivotas voam a aproximadamente 50 m/s.",
                    "c) Faisões voam a aproximadamente 1,8 km/min.",
                    "d) Pardais voam a aproximadamente 600 m/min.",
                    "e) Perdizes voam a aproximadamente 100 cm/s."
                  ],
                  correta: 1,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>Vamos comparar as velocidades em uma mesma unidade.</p><p><strong>A)</strong> 90 km/h = <strong>25 m/s</strong>.</p><p><strong>B)</strong> 50 m/s = <strong>50 m/s</strong>.</p><p><strong>C)</strong> 1,8 km/min = 1800 m/min = <strong>30 m/s</strong>.</p><p><strong>D)</strong> 600 m/min = <strong>10 m/s</strong>.</p><p><strong>E)</strong> 100 cm/s = <strong>1 m/s</strong>.</p><p>A maior velocidade &eacute; <strong>50 m/s</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>B</strong>.</p>"
                },
                {
                  id: "FBM008",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>Uma viagem de &ocirc;nibus entre Juiz de Fora e o Rio de Janeiro normalmente &eacute; realizada com velocidade m&eacute;dia de 60 km/h e tem dura&ccedil;&atilde;o de 3 horas, entre suas respectivas rodovi&aacute;rias. Uma estudante fez esta viagem de &ocirc;nibus, e relatou que, ap&oacute;s 2 horas do in&iacute;cio da viagem, devido a obras na pista, o &ocirc;nibus ficou parado por 30 minutos. Depois disso, a pista foi liberada e o &ocirc;nibus seguiu sua viagem, mas, devido ao engarrafamento na entrada da cidade do Rio de Janeiro at&eacute; a rodovi&aacute;ria, a estudante demorou mais 2 horas. Qual foi a velocidade m&eacute;dia do &ocirc;nibus na viagem relatada pela estudante?</p>",
                  alternativas: [
                    "a) 60 km/h",
                    "b) 72 km/h",
                    "c) 45 km/h",
                    "d) 40 km/h",
                    "e) 36 km/h"
                  ],
                  correta: 3,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>A viagem normal tem velocidade m&eacute;dia de <strong>60 km/h</strong> durante <strong>3 h</strong>.</p><p>Logo, a dist&acirc;ncia entre as rodovi&aacute;rias &eacute; <strong>60 &times; 3 = 180 km</strong>.</p><p>Na viagem relatada, o tempo total foi de <strong>2 h + 30 min + 2 h = 4,5 h</strong>.</p><p>Assim, a velocidade m&eacute;dia foi <strong>v = 180 / 4,5 = 40 km/h</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>D</strong>.</p>"
                },
                {
                  id: "FBM009",
                  origem: "Introdução à Mecânica",
                  banca: "Vestibulares",
                  enunciado: "<p>O limite m&aacute;ximo de velocidade para ve&iacute;culos leves na pista expressa da Av. das Na&ccedil;&otilde;es Unidas, em S&atilde;o Paulo, foi recentemente ampliado de 70 km/h para 90 km/h. O trecho dessa avenida conhecido como Marginal Pinheiros possui extens&atilde;o de 22,5 km. Comparando os limites antigo e novo de velocidades, a redu&ccedil;&atilde;o m&aacute;xima de tempo que um motorista de ve&iacute;culo leve poder&aacute; conseguir ao percorrer toda a extens&atilde;o da Marginal Pinheiros pela pista expressa, nas velocidades m&aacute;ximas permitidas, ser&aacute; de, aproximadamente,</p>",
                  alternativas: [
                    "a) 1 minuto e 7 segundos.",
                    "b) 4 minutos e 33 segundos.",
                    "c) 3 minutos e 45 segundos.",
                    "d) 3 minutos e 33 segundos.",
                    "e) 4 minutos e 17 segundos."
                  ],
                  correta: 4,
                  resolucaoEscrita: "<p><strong>Resolu&ccedil;&atilde;o escrita</strong></p><p>Calculamos o tempo no limite antigo e no novo.</p><p><strong>Antes:</strong> <strong>t<sub>1</sub> = 22,5 / 70 h = 0,3214 h</strong>.</p><p>Convertendo para minutos: <strong>0,3214 &times; 60 = 19,2857 min</strong>.</p><p><strong>Depois:</strong> <strong>t<sub>2</sub> = 22,5 / 90 h = 0,25 h = 15 min</strong>.</p><p>Redu&ccedil;&atilde;o do tempo: <strong>19,2857 - 15 = 4,2857 min</strong>.</p><p>Isso corresponde a aproximadamente <strong>4 min e 17 s</strong>.</p><p>Portanto, a alternativa correta &eacute; <strong>E</strong>.</p>"
                }
              ]
            }
          }
        },
        dinamica: { label: "Dinâmica", questoes: [] },
        gravitacao: { label: "Gravitação", questoes: [] },
        estatica: { label: "Estática", questoes: [] },
        hidrostatica: { label: "Hidrostática", questoes: [] },
        hidrodinamica: { label: "Hidrodinâmica", questoes: [] },
        termologia: { label: "Termologia", questoes: [] }
      }
    },
    "relatividade-geral": {
      label: "Relatividade Especial",
      assuntos: {
        "evolucao-da-fisica": {
          label: "Evolução da Física",
          questoes: [
            {
              id: "F0516",
              origem: "UFRGS",
              banca: "Vestibulares",
              enunciado: "<p>Sobre a teoria da relatividade especial, assinale a alternativa correta.</p>",
              alternativas: [
                "a) A dilatação do tempo e a contração do espaço são consequências relativísticas.",
                "b) A velocidade da luz depende do movimento da fonte.",
                "c) O tempo permanece absoluto em todos os referenciais.",
                "d) A massa e a energia não se relacionam fisicamente.",
                "e) O éter luminífero explica a constância da luz."
              ],
              correta: 0
            },
            {
              id: "F0517",
              origem: "FGV",
              banca: "Vestibulares",
              enunciado: "<p>Uma nave passa por um planeta com velocidade de <strong>0,6&nbsp;c</strong> e mede seu diâmetro em <strong>4,8 &times; 10<sup>6</sup> km</strong>. Qual era o diâmetro do planeta em repouso?</p>",
              alternativas: [
                "a) 3,8 &times; 10<sup>6</sup> km",
                "b) 4,0 &times; 10<sup>6</sup> km",
                "c) 6,0 &times; 10<sup>6</sup> km",
                "d) 7,5 &times; 10<sup>6</sup> km",
                "e) 8,0 &times; 10<sup>6</sup> km"
              ],
              correta: 2
            },
            {
              id: "F0518",
              origem: "FGV",
              banca: "Vestibulares",
              enunciado: "<p>A nave <strong>&ldquo;New Horizons&rdquo;</strong>, cuja foto é apresentada a seguir, partiu do Cabo Canaveral em janeiro de 2006 e chegou bem perto de Plutão em julho de 2015. Foram mais de 9 anos no espaço, voando a <strong>21 km/s</strong>. É uma velocidade muito alta para nossos padrões aqui na Terra, mas muito baixa se comparada aos <strong>300.000 km/s</strong> da velocidade da luz no vácuo.</p><p>Considere uma nave que possa voar a uma velocidade igual a <strong>80% da velocidade da luz</strong> e cuja viagem dure <strong>9 anos</strong> para nós, observadores localizados na Terra. Para um astronauta no interior dessa nave, tal viagem duraria cerca de:</p>",
              alternativas: [
                "a) 4,1 anos",
                "b) 5,4 anos",
                "c) 6,5 anos",
                "d) 15 anos",
                "e) 20,5 anos"
              ],
              correta: 1,
              imagem: {
                src: "imagens/questoes/f0518-new-horizons.jpeg",
                alt: "Foto da nave New Horizons próxima a Plutão",
                legenda: ""
              }
            },
            {
              id: "F0519",
              origem: "UEL",
              banca: "Vestibulares",
              enunciado: "<p>No chamado paradoxo dos gêmeos, um astronauta viaja a velocidades próximas à da luz e depois retorna à Terra. Ao final da viagem, ele terá:</p>",
              alternativas: [
                "a) envelhecido mais que o irmão que ficou na Terra.",
                "b) envelhecido menos que o irmão que ficou na Terra.",
                "c) exatamente a mesma idade do irmão que ficou na Terra.",
                "d) parado totalmente o próprio tempo biológico.",
                "e) ficado mais jovem do que tinha antes de partir."
              ],
              correta: 1
            },
            {
              id: "F1241",
              origem: "UFJF",
              banca: "Vestibulares",
              enunciado: "<p>Em relatividade especial, qual afirmação sobre simultaneidade está correta?</p>",
              alternativas: [
                "a) Eventos simultâneos são simultâneos para qualquer observador.",
                "b) A simultaneidade depende apenas da massa do observador.",
                "c) A simultaneidade só falha em campos gravitacionais.",
                "d) Eventos simultâneos em um referencial podem não ser simultâneos em outro.",
                "e) A simultaneidade depende da temperatura do sistema."
              ],
              correta: 3
            },
            {
              id: "F1242",
              origem: "UFJF",
              banca: "Vestibulares",
              enunciado: "<p>Assinale a alternativa correta sobre os postulados e as consequências da relatividade especial.</p>",
              alternativas: [
                "a) A luz sempre tem velocidades diferentes para observadores em repouso e em movimento.",
                "b) A massa do corpo impede qualquer dilatação temporal.",
                "c) Somente a mecânica clássica pode explicar fenômenos próximos a <strong>c</strong>.",
                "d) O tempo próprio é sempre o maior intervalo medido por qualquer observador.",
                "e) A velocidade da luz no vácuo é a mesma para todos os referenciais inerciais."
              ],
              correta: 4
            },
            {
              id: "F1245",
              origem: "FGV",
              banca: "Vestibulares",
              enunciado: "<p>Não está longe a época em que aviões poderão voar a velocidades da ordem de grandeza da velocidade da luz (<strong>c</strong>) no vácuo. Se um desses aviões, voando a uma velocidade de <strong>0,6 · c</strong>, passar rente à pista de um aeroporto de <strong>2,5 km</strong>, percorrendo-a em sua extensão, para o piloto desse avião a pista terá uma extensão, em km, de</p>",
              alternativas: [
                "a) 1,6.",
                "b) 2,0.",
                "c) 2,3.",
                "d) 2,8.",
                "e) 3,2."
              ],
              correta: 1
            },
            {
              id: "F1246",
              origem: "UFJF",
              banca: "Vestibulares",
              enunciado: "<p>A expressão <strong>E = mc<sup>2</sup></strong> indica que massa e energia:</p>",
              alternativas: [
                "a) não podem ser comparadas porque pertencem a áreas diferentes da física.",
                "b) só se equivalem em reações químicas comuns.",
                "c) são formas equivalentes de uma mesma grandeza física.",
                "d) dependem apenas da temperatura do sistema.",
                "e) se anulam quando a velocidade tende a zero."
              ],
              correta: 2
            },
            {
              id: "F1247",
              origem: "UFJF",
              banca: "Vestibulares",
              enunciado: "<p>Em um microscópio eletrônico, elétrons acelerados por uma diferença de potencial da ordem de <strong>8,0 &times; 10<sup>5</sup> eV</strong> atingem velocidade relativística. O valor mais adequado para essa velocidade é:</p>",
              alternativas: [
                "a) aproximadamente 0,92&nbsp;c",
                "b) aproximadamente 0,35&nbsp;c",
                "c) aproximadamente 0,50&nbsp;c",
                "d) aproximadamente 0,70&nbsp;c",
                "e) aproximadamente 0,99&nbsp;c"
              ],
              correta: 0
            },
            {
              id: "F1248",
              origem: "ENEM",
              banca: "ENEM",
              enunciado: "<p>Se uma explosão libera energia equivalente a <strong>10<sup>12</sup> calorias</strong>, a massa convertida em energia é muito pequena. A ordem de grandeza correta é:</p>",
              alternativas: [
                "a) 10<sup>-5</sup> kg",
                "b) 10<sup>-2</sup> kg",
                "c) 10<sup>0</sup> kg",
                "d) 10<sup>2</sup> kg",
                "e) 10<sup>5</sup> kg"
              ],
              correta: 0
            },
            {
              id: "F1250",
              origem: "UFG",
              banca: "Vestibulares",
              enunciado: "<p>A massa do bóson de Higgs, cerca de <strong>125 GeV/c<sup>2</sup></strong>, corresponde aproximadamente a:</p>",
              alternativas: [
                "a) 2,2 &times; 10<sup>-30</sup> kg",
                "b) 2,2 &times; 10<sup>-28</sup> kg",
                "c) 2,2 &times; 10<sup>-25</sup> kg",
                "d) 2,2 &times; 10<sup>-21</sup> kg",
                "e) 2,2 &times; 10<sup>-18</sup> kg"
              ],
              correta: 2
            },
            {
              id: "F0520",
              origem: "UEL",
              banca: "ENEM",
              enunciado: "<p>A energia liberada em reações nucleares, como as citadas no contexto da bomba atômica, evidencia que:</p>",
              alternativas: [
                "a) a massa total sempre aumenta após a reação.",
                "b) uma pequena quantidade de massa pode ser convertida em grande quantidade de energia.",
                "c) a energia nuclear independe da massa dos núcleos.",
                "d) somente reações químicas obedecem à conservação da energia.",
                "e) a relação entre massa e energia vale apenas para estrelas."
              ],
              correta: 1
            },
            {
              id: "F1243",
              origem: "UFJF",
              banca: "Vestibulares",
              enunciado: "<p>Os satélites do GPS precisam de correção relativística porque:</p>",
              alternativas: [
                "a) o vácuo espacial altera a carga elétrica dos relógios.",
                "b) a velocidade da luz diminui perto da superfície da Terra.",
                "c) os relógios atômicos não funcionam fora da atmosfera.",
                "d) sem correção relativística, erros de sincronismo crescem e comprometem a localização.",
                "e) a gravidade anula completamente a dilatação temporal."
              ],
              correta: 3
            },
            {
              id: "F1244",
              origem: "Vestibular",
              banca: "Vestibulares",
              enunciado: "<p>Para chegar a Kepler-452b, a <strong>42 anos-luz</strong> de distância, em <strong>28 anos</strong> medidos pelo astronauta, a nave deve ter velocidade aproximada de:</p>",
              alternativas: [
                "a) 0,40&nbsp;c",
                "b) 0,58&nbsp;c",
                "c) 0,67&nbsp;c",
                "d) 0,75&nbsp;c",
                "e) 0,83&nbsp;c"
              ],
              correta: 4
            },
            {
              id: "F1249",
              origem: "UDESC",
              banca: "Vestibulares",
              enunciado: "<p>Uma viagem espacial dura <strong>5 anos</strong> para o astronauta em uma nave a <strong>0,8&nbsp;c</strong>. Quanto tempo se passa aproximadamente na Terra?</p>",
              alternativas: [
                "a) 8,3 anos",
                "b) 5,0 anos",
                "c) 4,2 anos",
                "d) 10,0 anos",
                "e) 12,5 anos"
              ],
              correta: 0
            }
          ]
        },
        "fisica-quantica": {
          label: "Física Quântica",
          questoes: []
        },
        "principio-da-equivalencia": {
          label: "Princípio da Equivalência",
          questoes: []
        },
        "curvatura-do-espaco-tempo": {
          label: "Curvatura do Espaço-Tempo",
          questoes: []
        },
        "testes-da-relatividade-geral": {
          label: "Evidências Relativísticas",
          questoes: []
        },
        "buracos-negros-e-cosmologia": {
          label: "Buracos Negros e Cosmologia",
          questoes: []
        }
      }
    }
  }
};
