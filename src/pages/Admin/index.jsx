import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAll, addToCol, setDocById, updateDocById, deleteDocById, getDocById, getDocsByQuery } from "../../services/firestore";
import { register } from "../../services/auth";
import { htmlEscape } from "../../utils/helpers";
import SvgIcon from "../../components/SvgIcon";

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  students: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  questions: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M12 18h.01",
  resolutions: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  lessons: "M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 6 2 10 0v-5",
  apostilas: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z",
  exams: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 4V2m0 2v2m4-2V2m0 2v2m4-2V2m0 2v2",
  settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 15a3 3 0 100-6 3 3 0 000 6z",
  plus: "M12 5v14M5 12h14",
  "arrow-left": "M19 12H5M12 19l-7-7 7-7",
  x: "M18 6L6 18M6 6l12 12",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  search: "M10 13a3 3 0 100-6 3 3 0 000 6zM21 21l-4.35-4.35",
  external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  "circle-help": "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M12 18h.01",
  "check-circle": "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  "user-plus": "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6",
  "graduation-cap": "M22 10l-10-5L2 10l10 5 10-5zM6 12v5c3 2 6 2 10 0v-5",
  database: "M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6",
  gauge: "M12 20a8 8 0 100-16 8 8 0 000 16zM12 12l3-3M12 12v4",
  "list-plus": "M8 6h13M8 12h13M8 18h9M3 6h.01M3 12h.01M3 18h.01",
  layers: "M12 2l9 4-9 4-9-4 9-4zM2 10l10 5 10-5M2 14l10 5 10-5M2 18l10 5 10-5",
  "alert-circle": "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01"
};

const PAGE_SIZE = 15;
const FISICA_CONFIG = [
  { id: "cinematica", titulo: "Cinemática", descricao: "Deslocamento, gráficos, lançamentos" },
  { id: "dinamica", titulo: "Dinâmica", descricao: "Forças, leis de Newton, energia" },
  { id: "termologia", titulo: "Termologia", descricao: "Temperatura, calor, gases" },
  { id: "optica", titulo: "Óptica", descricao: "Reflexão, refração, lentes" },
  { id: "ondulatoria", titulo: "Ondulatória", descricao: "Ondas, acústica, MHS" },
  { id: "gravitacao", titulo: "Gravitação", descricao: "Kepler, gravitação universal" },
  { id: "estatica", titulo: "Estática", descricao: "Equilíbrio, torque" },
  { id: "hidrostatica", titulo: "Hidrostática", descricao: "Pressão, Stevin, Arquimedes" },
  { id: "hidrodinamica", titulo: "Hidrodinâmica", descricao: "Vazão, Bernoulli" },
  { id: "eletrostatica", titulo: "Eletrostática", descricao: "Carga, campo, potencial" },
  { id: "eletrodinamica", titulo: "Eletrodinâmica", descricao: "Corrente, resistores, circuitos" },
  { id: "eletromagnetismo", titulo: "Eletromagnetismo", descricao: "Campo magnético, indução" }
];

/* ── Admin Page ── */
export default function Admin() {
  const { user, loading, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState({ alunos: [], questoes: [], cards: [], provas: [], catalog: null });
  const [loadingData, setLoadingData] = useState(true);

  /* Sub-states */
  const [studentFilters, setStudentFilters] = useState({ search: "", turma: "", status: "" });
  const [studentPage, setStudentPage] = useState(1);
  const [showStudentFilters, setShowStudentFilters] = useState(false);

  const [hierarchyView, setHierarchyView] = useState(null);
  const [hierarchySubject, setHierarchySubject] = useState(null);
  const [hierarchyBlocks, setHierarchyBlocks] = useState([]);

  const [examSearch, setExamSearch] = useState("");
  const [examPage, setExamPage] = useState(1);

  /* Modals */
  const [studentModal, setStudentModal] = useState(null);
  const [questionModal, setQuestionModal] = useState(null);
  const [lessonModal, setLessonModal] = useState(null);
  const [apostilaModal, setApostilaModal] = useState(null);
  const [resolutionModal, setResolutionModal] = useState(null);
  const [examModal, setExamModal] = useState(null);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [alunosSnap, questoesSnap, cardsSnap, provasSnap] = await Promise.allSettled([
        getAll("alunos"),
        getAll("questoes"),
        getAll("questoes_cards"),
        getDocsByQuery("exams", [{ field: "ativo", op: "!=", value: false }])
      ]);

      const alunos = alunosSnap.status === "fulfilled" ? alunosSnap.value.docs.map((d) => ({ uid: d.id, ...d.data() })) : [];
      const questoes = questoesSnap.status === "fulfilled" ? questoesSnap.value.docs.map((d) => ({ id: d.id, ...d.data() })) : [];
      const cards = cardsSnap.status === "fulfilled" ? cardsSnap.value.docs.map((d) => ({ id: d.id, ...d.data() })) : [];
      const provas = provasSnap.status === "fulfilled" ? provasSnap.value.docs.map((d) => ({ id: d.id, ...d.data() })) : [];

      setData({ alunos, questoes, cards, provas, catalog: null });
    } catch (err) {
      console.error("Erro ao carregar dados admin:", err);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) { navigate("/login"); return; }
    if (!loading && user) loadData();
  }, [user, loading, navigate, loadData]);

  if (loading || !user) return null;

  const alunosAtivos = data.alunos.filter((a) => a.ativo !== false);
  const questoesComResolucao = data.questoes.filter((q) => q.videoUrl || q.resolucaoTexto);
  const questoesSemResolucao = data.questoes.filter((q) => !q.videoUrl && !q.resolucaoTexto);
  const aulasPublicadas = data.cards.filter((c) => c.tipo === "aula" && c.videoUrl);

  /* ── Nav helper ── */
  function NavView({ id, icon, label }) {
    return (
      <button className={`nav-btn${view === id ? " active" : ""}`} onClick={() => setView(id)}>
        <SvgIcon d={ICONS[icon] || ICONS.dashboard} /> {label}
      </button>
    );
  }

  /* ── Students ── */
  const filteredStudents = useMemo(() => {
    let list = [...data.alunos];
    if (studentFilters.search) {
      const s = studentFilters.search.toLowerCase();
      list = list.filter((a) => (a.nome || "").toLowerCase().includes(s) || (a.matricula || "").toLowerCase().includes(s));
    }
    if (studentFilters.turma) list = list.filter((a) => a.turma === studentFilters.turma);
    if (studentFilters.status === "active") list = list.filter((a) => a.ativo !== false);
    else if (studentFilters.status === "inactive") list = list.filter((a) => a.ativo === false);
    return list;
  }, [data.alunos, studentFilters]);

  const turmas = useMemo(() => {
    const t = new Set();
    data.alunos.forEach((a) => { if (a.turma) t.add(a.turma); });
    return [...t].sort();
  }, [data.alunos]);

  const studentPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const studentPageData = filteredStudents.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE);
  const activeCount = data.alunos.filter((a) => a.ativo !== false).length;
  const onlineCount = data.alunos.filter((a) => a.sessionIdAtivo).length;
  const newThisMonth = data.alunos.filter((a) => {
    if (!a.criadoEm) return false;
    const d = a.criadoEm.toDate ? a.criadoEm.toDate() : new Date(a.criadoEm);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const openStudentModal = useCallback((student) => {
    setStudentModal(student ? { ...student, editing: true } : { editing: false, nome: "", matricula: "", turma: "", senha: "", ativo: "true" });
  }, []);

  const saveStudent = useCallback(async (form) => {
    try {
      if (form.editing && form.uid) {
        await updateDocById("alunos", form.uid, { nome: form.nome, matricula: form.matricula, turma: form.turma, ativo: form.ativo === "true" });
      } else {
        const cred = await register(form.matricula + "@universorelativo.app", form.senha || "123456");
        await setDocById("alunos", cred.user.uid, {
          nome: form.nome, matricula: form.matricula, turma: form.turma || "", emailAuth: cred.user.email,
          ativo: true, criadoEm: new Date(), progresso: { questoesRespondidas: 0, acertos: 0 }
        });
      }
      setStudentModal(null);
      loadData();
    } catch (err) { alert("Erro: " + err.message); }
  }, [loadData]);

  const deleteStudent = useCallback(async (uid) => {
    if (!confirm("Desativar este aluno?")) return;
    await updateDocById("alunos", uid, { ativo: false });
    loadData();
  }, [loadData]);

  /* ── Questions ── */
  const questionStats = useMemo(() => ({
    total: data.questoes.length,
    comResolucao: questoesComResolucao.length,
    semResolucao: questoesSemResolucao.length,
    cards: data.cards.filter((c) => c.tipo === "questoes").length
  }), [data.questoes, data.cards, questoesComResolucao, questoesSemResolucao]);

  function getSubjectBlocks(subjectId) {
    const config = FISICA_CONFIG.find((s) => s.id === subjectId);
    if (!config) return [];
    const blocks = ["introducao-a-cinematica", "movimento-retilineo-constante", "aceleracao-em-linha-reta", "vetores-do-movimento"];
    return blocks.map((b, i) => {
      const blockCards = data.cards.filter((c) => c.assuntoId === subjectId && c.subassuntoId === b);
      const blockQuestions = data.questoes.filter((q) => q.assuntoId === subjectId && q.subassuntoId === b);
      return { id: b, titulo: `Bloco ${String(i + 1).padStart(2, "0")}`, cards: blockCards, questions: blockQuestions };
    });
  }

  function openHierarchy(type, subjectId) {
    setHierarchySubject(subjectId);
    setHierarchyView(type);
    const blocks = getSubjectBlocks(subjectId);
    setHierarchyBlocks(blocks);
  }

  const openQuestionModalFn = useCallback((q) => {
    setQuestionModal(q ? { ...q, editing: true } : {
      editing: false, disciplina: "fisica-basica", assuntoId: "", subassuntoId: "", cardId: "",
      enunciado: "", alternativas: ["", "", "", "", ""], respostaCorreta: "A", resolucaoTexto: "", imagem: null
    });
  }, []);

  const saveQuestion = useCallback(async (form) => {
    try {
      const payload = {
        disciplinaId: "fisica-basica", assuntoId: form.assuntoId, subassuntoId: form.subassuntoId,
        cardId: form.cardId, enunciado: form.enunciado, alternativas: form.alternativas,
        respostaCorreta: form.respostaCorreta, resolucaoTexto: form.resolucaoTexto || ""
      };
      if (form.editing && form.id) {
        await updateDocById("questoes", form.id, payload);
      } else {
        await addToCol("questoes", { ...payload, ativo: true, criadoEm: new Date() });
      }
      setQuestionModal(null);
      loadData();
    } catch (err) { alert("Erro: " + err.message); }
  }, [loadData]);

  const deleteQuestion = useCallback(async (id) => {
    if (!confirm("Excluir esta questão?")) return;
    await updateDocById("questoes", id, { ativo: false });
    loadData();
  }, [loadData]);

  /* ── Lessons ── */
  const openLessonModalFn = useCallback((card) => {
    setLessonModal(card ? { ...card, editing: true } : null);
  }, []);

  const saveLesson = useCallback(async (form) => {
    try {
      if (form.editing && form.id) {
        await updateDocById("questoes_cards", form.id, { titulo: form.titulo, descricao: form.descricao, videoUrl: form.videoUrl });
      }
      setLessonModal(null);
      loadData();
    } catch (err) { alert("Erro: " + err.message); }
  }, [loadData]);

  /* ── Apostilas ── */
  const openApostilaModalFn = useCallback((card) => {
    setApostilaModal(card ? { ...card, editing: true } : null);
  }, []);

  const saveApostila = useCallback(async (form) => {
    try {
      if (form.editing && form.id) {
        await updateDocById("questoes_cards", form.id, { apostilaUrl: form.apostilaUrl });
      }
      setApostilaModal(null);
      loadData();
    } catch (err) { alert("Erro: " + err.message); }
  }, [loadData]);

  /* ── Resolutions ── */
  const openResolutionModalFn = useCallback((q) => {
    setResolutionModal(q ? { ...q, editing: true } : null);
  }, []);

  const saveResolution = useCallback(async (form) => {
    try {
      if (form.editing && form.id) {
        await updateDocById("questoes", form.id, { videoUrl: form.videoUrl });
      }
      setResolutionModal(null);
      loadData();
    } catch (err) { alert("Erro: " + err.message); }
  }, [loadData]);

  /* ── Exams ── */
  const filteredExams = useMemo(() => {
    let list = [...data.provas];
    if (examSearch) {
      const s = examSearch.toLowerCase();
      list = list.filter((e) => (e.titulo || "").toLowerCase().includes(s) || String(e.ano || "").includes(s));
    }
    return list.sort((a, b) => ((b.ano || 0) > (a.ano || 0) ? 1 : -1));
  }, [data.provas, examSearch]);

  const examPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const examPageData = filteredExams.slice((examPage - 1) * PAGE_SIZE, examPage * PAGE_SIZE);

  const openExamModalFn = useCallback((exam) => {
    setExamModal(exam ? { ...exam, editing: true, questoes: exam.questoes || [] } : {
      editing: false, ano: new Date().getFullYear(), tipo: "ENEM", questoesTotal: 0, pdfUrl: "", questoes: []
    });
  }, []);

  const saveExam = useCallback(async (form) => {
    try {
      const payload = { titulo: `ENEM ${form.ano}`, ano: form.ano, tipo: form.tipo, questoesTotal: Number(form.questoesTotal), pdfUrl: form.pdfUrl, questoes: form.questoes, status: "published" };
      if (form.editing && form.id) {
        await updateDocById("exams", form.id, payload);
      } else {
        await addToCol("exams", { ...payload, ativo: true, criadoEm: new Date() });
      }
      setExamModal(null);
      loadData();
    } catch (err) { alert("Erro: " + err.message); }
  }, [loadData]);

  const deleteExam = useCallback(async (id) => {
    if (!confirm("Excluir esta prova?")) return;
    await updateDocById("exams", id, { ativo: false });
    loadData();
  }, [loadData]);

  /* ── Renderers ── */
  const renderDashboard = () => (
    <section className="page" id="view-dashboard">
      <div className="topbar">
        <div><h1>Bem-vindo, Admin!</h1><p className="page-subtitle">Aqui está um resumo geral da plataforma.</p></div>
      </div>
      <div className="stats-grid">
        <article className="stat-card"><div className="stat-icon"><SvgIcon d={ICONS.users} size={31} /></div><div><span>Alunos ativos</span><strong>{activeCount}</strong><small>Base atual da plataforma</small></div></article>
        <article className="stat-card blue"><div className="stat-icon"><SvgIcon d={ICONS["circle-help"]} size={31} /></div><div><span>Questões cadastradas</span><strong>{questionStats.total}</strong><small>Total de questões no banco</small></div></article>
        <article className="stat-card orange"><div className="stat-icon"><SvgIcon d={ICONS["alert-circle"]} size={31} /></div><div><span>Questões sem resolução</span><strong>{questionStats.semResolucao}</strong><small>Prioridade para gravar</small></div></article>
        <article className="stat-card green"><div className="stat-icon"><SvgIcon d={ICONS.lessons} size={31} /></div><div><span>Aulas publicadas</span><strong>{aulasPublicadas.length}</strong><small>Total de aulas disponíveis</small></div></article>
      </div>
      <div className="panel"><div className="empty-state">Use o menu lateral para gerenciar alunos, questões, aulas e provas.</div></div>
    </section>
  );

  const renderStudents = () => (
    <section className={`page${view === "students" ? "" : " d-none"}`} id="view-students">
      <div className="topbar">
        <div><h1>Alunos</h1><p className="page-subtitle">Gerencie os alunos cadastrados na plataforma.</p></div>
        <div className="toolbar">
          <input className="control search" placeholder="Buscar aluno..." value={studentFilters.search} onChange={(e) => { setStudentFilters((f) => ({ ...f, search: e.target.value })); setStudentPage(1); }} />
          <button className="btn-ur" onClick={() => setShowStudentFilters(!showStudentFilters)}><SvgIcon d={ICONS.filter} /> Filtros</button>
          <button className="btn-ur btn-primary-ur" onClick={() => openStudentModal(null)}><SvgIcon d={ICONS.plus} /> Novo aluno</button>
        </div>
      </div>
      {showStudentFilters && (
        <div className="toolbar mb-3">
          <select className="select-control" value={studentFilters.turma} onChange={(e) => { setStudentFilters((f) => ({ ...f, turma: e.target.value })); setStudentPage(1); }}>
            <option value="">Todas as turmas</option>
            {turmas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="select-control" value={studentFilters.status} onChange={(e) => { setStudentFilters((f) => ({ ...f, status: e.target.value })); setStudentPage(1); }}>
            <option value="">Ativos</option><option value="inactive">Inativos</option><option value="all">Todos os status</option>
          </select>
        </div>
      )}
      <div className="stats-grid">
        <article className="stat-card"><div className="stat-icon"><SvgIcon d={ICONS.users} size={31} /></div><div><span>Total de alunos</span><strong>{data.alunos.length}</strong><small>Base completa</small></div></article>
        <article className="stat-card blue"><div className="stat-icon"><SvgIcon d={ICONS["graduation-cap"]} size={31} /></div><div><span>Alunos ativos</span><strong>{activeCount}</strong><small>{data.alunos.length ? Math.round(activeCount / data.alunos.length * 100) : 0}% do total</small></div></article>
        <article className="stat-card green"><div className="stat-icon"><SvgIcon d={ICONS["check-circle"]} size={31} /></div><div><span>Alunos online</span><strong>{onlineCount}</strong><small>Agora</small></div></article>
        <article className="stat-card orange"><div className="stat-icon"><SvgIcon d={ICONS["user-plus"]} size={31} /></div><div><span>Novos este mês</span><strong>{newThisMonth}</strong></div></article>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nome</th><th>Matrícula</th><th>Turma</th><th>Status</th><th>Último acesso</th><th>Ações</th></tr></thead>
            <tbody id="studentsBody">
              {studentPageData.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state">Nenhum aluno encontrado.</div></td></tr>
              )}
              {studentPageData.map((s) => (
                <tr key={s.uid}>
                  <td><div className="student-name"><span className="mini-avatar">{htmlEscape((s.nome || "?")[0])}</span>{htmlEscape(s.nome || "Sem nome")}</div></td>
                  <td>{htmlEscape(s.matricula || "-")}</td><td>{htmlEscape(s.turma || "-")}</td>
                  <td><span className={`badge-soft ${s.ativo !== false ? "status-active" : "status-inactive"}`}>{s.ativo !== false ? "Ativo" : "Inativo"}</span></td>
                  <td style={{ color: "#94a3b8", fontSize: ".85rem" }}>{s.ultimoAcesso ? (s.ultimoAcesso.toDate ? s.ultimoAcesso.toDate().toLocaleDateString() : "-") : "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <button className="btn-icon" onClick={() => openStudentModal(s)} title="Editar"><SvgIcon d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></button>
                      <button className="btn-icon delete" onClick={() => deleteStudent(s.uid)} title="Desativar"><SvgIcon d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span>Mostrando {studentPageData.length} de {filteredStudents.length} alunos</span>
          <div className="pagination-actions">
            <button className="page-btn" disabled={studentPage <= 1} onClick={() => setStudentPage((p) => Math.max(1, p - 1))}><SvgIcon d={ICONS["chevron-left"]} /></button>
            {studentPages > 1 && Array.from({ length: studentPages }, (_, i) => i + 1).filter((p) => Math.abs(p - studentPage) <= 2 || p === 1 || p === studentPages).map((p, idx, arr) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: "#64748b", padding: "0 4px" }}>…</span>}
                <button className={`page-btn${studentPage === p ? " active" : ""}`} onClick={() => setStudentPage(p)}>{p}</button>
              </span>
            ))}
            <button className="page-btn" disabled={studentPage >= studentPages} onClick={() => setStudentPage((p) => Math.min(studentPages, p + 1))}><SvgIcon d={ICONS["chevron-right"]} /></button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderHierarchyView = (type, title, icon, CardComponent, backBtn) => {
    const subject = FISICA_CONFIG.find((s) => s.id === hierarchySubject);
    return (
      <div id={`${type}DetailView`}>
        <div className="adm-lesson-back-bar">
          <button className="btn-ur" onClick={() => { setHierarchyView(null); setHierarchySubject(null); }}>
            <SvgIcon d={ICONS["arrow-left"]} /> Voltar
          </button>
          <div><h2>{subject ? subject.titulo : ""}</h2><small>Física Básica</small></div>
        </div>
        <div className="adm-lesson-blocks">
          {hierarchyBlocks.length === 0 && <div className="empty-state">Nenhum bloco encontrado para este assunto.</div>}
          {hierarchyBlocks.map((block) => {
            const filtered = type === "questions" ? block.questions
              : type === "lessons" ? block.cards.filter((c) => c.tipo === "aula")
              : type === "apostilas" ? block.cards.filter((c) => c.tipo === "apostila")
              : block.questions;
            return (
              <div className="adm-lesson-block" key={block.id}>
                <div className="adm-lesson-block-head">
                  <span className="adm-lesson-block-kicker">{block.titulo}</span>
                  <span className="adm-lesson-block-title">{block.id.replace(/-/g, " ")}</span>
                </div>
                {type === "questions" || type === "resolutions" ? (
                  <div className="adm-qlist">
                    {filtered.length === 0 && <div className="adm-qlist-empty">Nenhuma questão neste bloco.</div>}
                    {filtered.map((q, idx) => (
                      <div className="adm-qlist-item" key={q.id || idx}>
                        <span className="adm-qlist-num">{idx + 1}</span>
                        <div className="adm-qlist-body">
                          <div className="adm-qlist-text">{(q.enunciado || "").replace(/<[^>]*>/g, "").substring(0, 120)}</div>
                          <div className="adm-qlist-meta">
                            {q.videoUrl || q.resolucaoTexto ? (
                              <span className="badge-soft status-ready">Com resolução</span>
                            ) : (
                              <span className="badge-soft status-missing">Sem resolução</span>
                            )}
                          </div>
                        </div>
                        <div className="adm-qlist-actions">
                          {type === "resolutions" && (
                            <button className="adm-lesson-card-edit" onClick={() => openResolutionModalFn(q)}>
                              <SvgIcon d={ICONS.resolutions} /> Editar
                            </button>
                          )}
                          {type === "questions" && (
                            <>
                              <button className="adm-lesson-card-edit" onClick={() => openQuestionModalFn(q)}>
                                <SvgIcon d={ICONS.resolutions} /> Editar
                              </button>
                              <button className="btn-icon delete" onClick={() => deleteQuestion(q.id)}>
                                <SvgIcon d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="adm-lesson-cards-row" style={{ gridTemplateColumns: type === "apostilas" ? "1fr" : "1fr 1fr" }}>
                    {filtered.length === 0 && <div className="adm-qlist-empty" style={{ gridColumn: "1/-1" }}>Nenhum {type === "lessons" ? "card de aula" : "card de apostila"} neste bloco.</div>}
                    {filtered.map((card) => (
                      <div className="adm-lesson-card" key={card.id}>
                        <div className="adm-lesson-card-tag">{type === "lessons" ? "Aula" : "Apostila"}</div>
                        <div className="adm-lesson-card-title">{card.titulo || card.subassuntoId || "Sem título"}</div>
                        <div className="adm-lesson-card-desc">{card.descricao || ""}</div>
                        <div className="adm-lesson-card-footer">
                          {type === "lessons" && (
                            <span className="badge-soft" style={{ background: card.videoUrl ? "rgba(34,197,94,.18)" : "rgba(245,158,11,.18)", color: card.videoUrl ? "#86efac" : "#fbbf24" }}>
                              {card.videoUrl ? "Publicada" : "Sem vídeo"}
                            </span>
                          )}
                          {type === "apostilas" && card.apostilaUrl && (
                            <a className="adm-apostila-card-link" href={card.apostilaUrl} target="_blank" rel="noopener noreferrer">
                              <SvgIcon d={ICONS.external} size={13} /> PDF
                            </a>
                          )}
                          <button className="adm-lesson-card-edit" onClick={() => type === "lessons" ? openLessonModalFn(card) : openApostilaModalFn(card)}>
                            <SvgIcon d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /> Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuestions = () => (
    <section className={`page${view === "questions" ? "" : " d-none"}`} id="view-questions">
      <div className="topbar">
        <div><h1>Banco de Questões</h1><p className="page-subtitle">Selecione um assunto para ver as questões por bloco.</p></div>
        <div className="toolbar">
          <button className="btn-ur btn-primary-ur" onClick={() => openQuestionModalFn(null)}><SvgIcon d={ICONS.plus} /> Nova questão</button>
        </div>
      </div>
      <div className="stats-grid">
        <article className="stat-card blue"><div className="stat-icon"><SvgIcon d={ICONS["circle-help"]} size={31} /></div><div><span>Total de questões</span><strong>{questionStats.total}</strong><small>Banco completo</small></div></article>
        <article className="stat-card green"><div className="stat-icon"><SvgIcon d={ICONS["check-circle"]} size={31} /></div><div><span>Com resolução</span><strong>{questionStats.comResolucao}</strong><small>Vídeo vinculado</small></div></article>
        <article className="stat-card orange"><div className="stat-icon"><SvgIcon d={ICONS["alert-circle"]} size={31} /></div><div><span>Sem resolução</span><strong>{questionStats.semResolucao}</strong><small>Prioridade de gravação</small></div></article>
        <article className="stat-card"><div className="stat-icon"><SvgIcon d={ICONS.layers} size={31} /></div><div><span>Cards</span><strong>{questionStats.cards}</strong><small>Listas e módulos</small></div></article>
      </div>
      {!hierarchyView || hierarchyView !== "questions" ? (
        <div className="adm-lesson-subjects">
          {FISICA_CONFIG.map((s) => (
            <button key={s.id} className="adm-lesson-subj-btn" onClick={() => openHierarchy("questions", s.id)}>
              <SvgIcon d={ICONS.questions} size={22} /> {s.titulo}
            </button>
          ))}
        </div>
      ) : renderHierarchyView("questions", "Banco de Questões", ICONS.questions)}
    </section>
  );

  const renderResolutions = () => (
    <section className={`page${view === "resolutions" ? "" : " d-none"}`} id="view-resolutions">
      <div className="topbar">
        <div><h1>Resoluções</h1><p className="page-subtitle">Selecione um assunto para gerenciar as resoluções por bloco.</p></div>
      </div>
      {!hierarchyView || hierarchyView !== "resolutions" ? (
        <div className="adm-lesson-subjects">
          {FISICA_CONFIG.map((s) => (
            <button key={s.id} className="adm-lesson-subj-btn" onClick={() => openHierarchy("resolutions", s.id)}>
              <SvgIcon d={ICONS.resolutions} size={22} /> {s.titulo}
            </button>
          ))}
        </div>
      ) : renderHierarchyView("resolutions", "Resoluções", ICONS.resolutions)}
    </section>
  );

  const renderLessons = () => (
    <section className={`page${view === "lessons" ? "" : " d-none"}`} id="view-lessons">
      <div className="topbar">
        <div><h1>Aulas</h1><p className="page-subtitle">Selecione um assunto para ver e editar os cards de aula por bloco.</p></div>
      </div>
      {!hierarchyView || hierarchyView !== "lessons" ? (
        <div className="adm-lesson-subjects">
          {FISICA_CONFIG.map((s) => (
            <button key={s.id} className="adm-lesson-subj-btn" onClick={() => openHierarchy("lessons", s.id)}>
              <SvgIcon d={ICONS.lessons} size={22} /> {s.titulo}
            </button>
          ))}
        </div>
      ) : renderHierarchyView("lessons", "Aulas", ICONS.lessons)}
    </section>
  );

  const renderApostilas = () => (
    <section className={`page${view === "apostilas" ? "" : " d-none"}`} id="view-apostilas">
      <div className="topbar">
        <div><h1>Apostilas</h1><p className="page-subtitle">Selecione um assunto para gerenciar as apostilas por bloco.</p></div>
      </div>
      {!hierarchyView || hierarchyView !== "apostilas" ? (
        <div className="adm-lesson-subjects">
          {FISICA_CONFIG.map((s) => (
            <button key={s.id} className="adm-lesson-subj-btn" onClick={() => openHierarchy("apostilas", s.id)}>
              <SvgIcon d={ICONS.apostilas} size={22} /> {s.titulo}
            </button>
          ))}
        </div>
      ) : renderHierarchyView("apostilas", "Apostilas", ICONS.apostilas)}
    </section>
  );

  const renderExams = () => (
    <section className={`page${view === "exams" ? "" : " d-none"}`} id="view-exams">
      <div className="topbar">
        <div><h1>Provas ENEM</h1><p className="page-subtitle">Publique PDFs de provas do ENEM e cadastre as resoluções das questões de Física.</p></div>
        <div className="toolbar">
          <input className="control search" placeholder="Buscar prova..." value={examSearch} onChange={(e) => { setExamSearch(e.target.value); setExamPage(1); }} />
          <button className="btn-ur btn-primary-ur" onClick={() => openExamModalFn(null)}><SvgIcon d={ICONS.plus} /> Nova prova ENEM</button>
        </div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Prova</th><th>Tipo</th><th>PDF</th><th>Questões Física</th><th>Resoluções</th><th>Data</th><th>Ações</th></tr></thead>
            <tbody id="examsBody">
              {examPageData.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state">Nenhuma prova encontrada.</div></td></tr>
              )}
              {examPageData.map((e) => {
                const total = e.questoesTotal || 0;
                const resolvidas = (e.questoes || []).filter((q) => q.video).length;
                return (
                  <tr key={e.id}>
                    <td><strong>{htmlEscape(e.titulo || `ENEM ${e.ano}`)}</strong></td>
                    <td>{e.tipo || "ENEM"}</td>
                    <td>{e.pdfUrl ? <a className="adm-apostila-card-link" href={e.pdfUrl} target="_blank" rel="noopener noreferrer">Abrir PDF</a> : <span style={{ color: "#94a3b8" }}>-</span>}</td>
                    <td>{total}</td>
                    <td><span className={`badge-soft ${resolvidas === total && total > 0 ? "status-ready" : "status-missing"}`}>{resolvidas}/{total}</span></td>
                    <td style={{ color: "#94a3b8", fontSize: ".85rem" }}>{e.data || (e.criadoEm ? (e.criadoEm.toDate ? e.criadoEm.toDate().toLocaleDateString() : "-") : "-")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <button className="btn-icon" onClick={() => openExamModalFn(e)} title="Editar"><SvgIcon d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></button>
                        <button className="btn-icon" onClick={async () => {
                          try {
                            const snap = await getDocById("exams", e.id);
                            if (snap.exists()) {
                              const d = snap.data();
                              delete d.id; delete d.ativo;
                              await addToCol("exams", { ...d, ativo: true, titulo: d.titulo + " (cópia)", criadoEm: new Date() });
                              loadData();
                            }
                          } catch (err) { alert("Erro: " + err.message); }
                        }} title="Duplicar"><SvgIcon d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 14h2a2 2 0 012 2v2a2 2 0 01-2 2h-2M16 10v4M12 16h4" /></button>
                        <button className="btn-icon delete" onClick={() => deleteExam(e.id)} title="Excluir"><SvgIcon d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span>Mostrando {examPageData.length} de {filteredExams.length} provas</span>
          <div className="pagination-actions">
            <button className="page-btn" disabled={examPage <= 1} onClick={() => setExamPage((p) => Math.max(1, p - 1))}><SvgIcon d={ICONS["chevron-left"]} /></button>
            {examPages > 1 && Array.from({ length: examPages }, (_, i) => i + 1).filter((p) => Math.abs(p - examPage) <= 2 || p === 1 || p === examPages).map((p, idx, arr) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: "#64748b", padding: "0 4px" }}>…</span>}
                <button className={`page-btn${examPage === p ? " active" : ""}`} onClick={() => setExamPage(p)}>{p}</button>
              </span>
            ))}
            <button className="page-btn" disabled={examPage >= examPages} onClick={() => setExamPage((p) => Math.min(examPages, p + 1))}><SvgIcon d={ICONS["chevron-right"]} /></button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSettings = () => {
    const qCards = data.cards.filter((c) => c.tipo === "questoes");
    return (
      <section className={`page${view === "settings" ? "" : " d-none"}`} id="view-settings">
        <div className="topbar"><div><h1>Configurações</h1><p className="page-subtitle">Ferramentas rápidas para manutenção do painel.</p></div></div>
        <div className="cards-grid">
          <article className="tool-card"><SvgIcon d={ICONS.refresh} size={24} /><strong>Recarregar dados</strong><p>Atualiza alunos, questões, cards e provas.</p><button className="btn-ur" onClick={loadData}>Recarregar</button></article>
          <article className="tool-card"><SvgIcon d={ICONS.database} size={24} /><strong>Collections em uso</strong><span>Alunos: alunos + students</span><span>Questões: questoes</span><span>Provas: exams</span></article>
          <article className="tool-card"><SvgIcon d={ICONS.gauge} size={24} /><strong>Desempenho</strong><p>Busca usa índice local normalizado após o carregamento inicial.</p><span>{loadingData ? "Carregando..." : `Cache: ${data.alunos.length} alunos, ${data.questoes.length} questões, ${data.cards.length} cards`}</span></article>
        </div>
        <div className="panel"><div className="empty-state">{loadingData ? "Carregando..." : "Painel pronto."}</div></div>
        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <div className="topbar" style={{ padding: "0 0 1rem 0" }}>
            <div><h2 style={{ fontSize: "1rem", margin: 0 }}>Cards de Questões</h2><p className="page-subtitle" style={{ margin: 0 }}>Lista todos os cards do tipo "questões".</p></div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Título</th><th>Disciplina</th><th>Assunto</th><th>Subassunto</th><th>Questões vinculadas</th><th>Origem</th><th>ID</th></tr></thead>
              <tbody id="qCardsBody">
                {qCards.map((c) => {
                  const linked = data.questoes.filter((q) => q.cardId === c.id).length;
                  return (
                    <tr key={c.id}>
                      <td>{c.titulo || c.subassuntoId || "-"}</td>
                      <td>Física Básica</td>
                      <td>{c.assuntoId || "-"}</td>
                      <td>{c.subassuntoId || "-"}</td>
                      <td><span className={`badge-soft ${linked > 0 ? "status-ready" : "status-missing"}`}>{linked}</span></td>
                      <td><span className="badge-soft tag-purple">{c.origem || "sistema"}</span></td>
                      <td style={{ fontSize: ".78rem", color: "#64748b", fontFamily: "monospace" }}>{c.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  /* ── Modals ── */
  const renderModal = () => {
    /* Student Modal */
    if (studentModal) {
      const [form, setForm] = useState(studentModal);
      useEffect(() => setForm(studentModal), [studentModal]);
      return (
        <div className="modal-backdrop-ur" onClick={(e) => { if (e.target === e.currentTarget) setStudentModal(null); }}>
          <form className="modal-card" onSubmit={(e) => { e.preventDefault(); saveStudent(form); }}>
            <div className="modal-head">
              <strong>{form.editing ? "Editar aluno" : "Novo aluno"}</strong>
              <button className="btn-icon" type="button" onClick={() => setStudentModal(null)}><SvgIcon d={ICONS.x} /></button>
            </div>
            <div className="modal-body">
              <div className="full">
                <label>Nome</label>
                <input className="control w-100" required value={form.nome || ""} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
              </div>
              <div><label>Matrícula</label><input className="control w-100" required value={form.matricula || ""} onChange={(e) => setForm((f) => ({ ...f, matricula: e.target.value }))} /></div>
              <div><label>Turma</label><input className="control w-100" value={form.turma || ""} onChange={(e) => setForm((f) => ({ ...f, turma: e.target.value }))} /></div>
              {!form.editing && <div><label>Senha inicial</label><input className="control w-100" type="password" value={form.senha || ""} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} /></div>}
              {form.editing && <div><label>Status</label><select className="select-control w-100" value={form.ativo !== false ? "true" : "false"} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value }))}><option value="true">Ativo</option><option value="false">Inativo</option></select></div>}
            </div>
            <div className="modal-foot">
              <button className="btn-ur" type="button" onClick={() => setStudentModal(null)}>Cancelar</button>
              <button className="btn-ur btn-primary-ur" type="submit">{form.editing ? "Salvar aluno" : "Criar aluno"}</button>
            </div>
          </form>
        </div>
      );
    }

    /* Question Modal */
    if (questionModal) {
      const [form, setForm] = useState(questionModal);
      useEffect(() => setForm(questionModal), [questionModal]);
      return (
        <div className="modal-backdrop-ur" onClick={(e) => { if (e.target === e.currentTarget) setQuestionModal(null); }}>
          <form className="modal-card modal-card-wide" onSubmit={(e) => { e.preventDefault(); saveQuestion(form); }}>
            <div className="modal-head">
              <strong>{form.editing ? "Editar questão" : "Nova questão"}</strong>
              <button className="btn-icon" type="button" onClick={() => setQuestionModal(null)}><SvgIcon d={ICONS.x} /></button>
            </div>
            <div className="modal-body">
              <div><label>Assunto</label>
                <select className="select-control w-100" required value={form.assuntoId || ""} onChange={(e) => setForm((f) => ({ ...f, assuntoId: e.target.value }))}>
                  <option value="">Selecione</option>
                  {FISICA_CONFIG.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
                </select>
              </div>
              <div><label>Subassunto (bloco)</label><input className="control w-100" value={form.subassuntoId || ""} onChange={(e) => setForm((f) => ({ ...f, subassuntoId: e.target.value }))} placeholder="Ex: introducao-a-cinematica" /></div>
              <div className="full"><label>Enunciado</label><textarea className="control w-100" rows={4} required value={form.enunciado || ""} onChange={(e) => setForm((f) => ({ ...f, enunciado: e.target.value }))} /></div>
              {["A", "B", "C", "D", "E"].map((letra, i) => (
                <div key={letra}><label>Alternativa {letra}</label><input className="control w-100" required value={form.alternativas?.[i] || ""} onChange={(e) => { const a = [...(form.alternativas || ["", "", "", "", ""])]; a[i] = e.target.value; setForm((f) => ({ ...f, alternativas: a })); }} /></div>
              ))}
              <div><label>Resposta correta</label>
                <select className="select-control w-100" value={form.respostaCorreta || "A"} onChange={(e) => setForm((f) => ({ ...f, respostaCorreta: e.target.value }))}>
                  {["A", "B", "C", "D", "E"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="full"><label>Resolução em texto</label><textarea className="control w-100" rows={3} value={form.resolucaoTexto || ""} onChange={(e) => setForm((f) => ({ ...f, resolucaoTexto: e.target.value }))} /></div>
            </div>
            <div className="modal-foot">
              <button className="btn-ur" type="button" onClick={() => setQuestionModal(null)}>Cancelar</button>
              <button className="btn-ur btn-primary-ur" type="submit">Salvar questão</button>
            </div>
          </form>
        </div>
      );
    }

    /* Lesson Modal */
    if (lessonModal) {
      const [form, setForm] = useState(lessonModal);
      useEffect(() => setForm(lessonModal), [lessonModal]);
      return (
        <div className="modal-backdrop-ur" onClick={(e) => { if (e.target === e.currentTarget) setLessonModal(null); }}>
          <form className="modal-card" onSubmit={(e) => { e.preventDefault(); saveLesson(form); }}>
            <div className="modal-head"><strong>Editar aula</strong><button className="btn-icon" type="button" onClick={() => setLessonModal(null)}><SvgIcon d={ICONS.x} /></button></div>
            <div className="modal-body" style={{ gridTemplateColumns: "1fr" }}>
              <div className="adm-lesson-ctx">{form.subassuntoId || "Card de aula"} · {form.tipo || "aula"}</div>
              <div><label>Título</label><input className="control w-100" required value={form.titulo || ""} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} /></div>
              <div><label>Descrição</label><input className="control w-100" value={form.descricao || ""} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} /></div>
              <div><label>Link do YouTube</label><input className="control w-100" placeholder="https://www.youtube.com/watch?v=..." value={form.videoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} /></div>
            </div>
            <div className="modal-foot"><button className="btn-ur" type="button" onClick={() => setLessonModal(null)}>Cancelar</button><button className="btn-ur btn-primary-ur" type="submit">Salvar aula</button></div>
          </form>
        </div>
      );
    }

    /* Apostila Modal */
    if (apostilaModal) {
      const [form, setForm] = useState(apostilaModal);
      useEffect(() => setForm(apostilaModal), [apostilaModal]);
      return (
        <div className="modal-backdrop-ur" onClick={(e) => { if (e.target === e.currentTarget) setApostilaModal(null); }}>
          <form className="modal-card" onSubmit={(e) => { e.preventDefault(); saveApostila(form); }}>
            <div className="modal-head"><strong>Trocar apostila</strong><button className="btn-icon" type="button" onClick={() => setApostilaModal(null)}><SvgIcon d={ICONS.x} /></button></div>
            <div className="modal-body">
              <div className="full"><label>Apostila</label><input className="control w-100" disabled value={form.subassuntoId || ""} /></div>
              <div><label>Disciplina</label><input className="control w-100" disabled value="Física Básica" /></div>
              <div><label>Subassunto</label><input className="control w-100" disabled value={form.subassuntoId || ""} /></div>
              <div className="full"><label>Link público do PDF</label><input className="control w-100" type="url" placeholder="https://..." required value={form.apostilaUrl || ""} onChange={(e) => setForm((f) => ({ ...f, apostilaUrl: e.target.value }))} /></div>
            </div>
            <div className="modal-foot"><button className="btn-ur" type="button" onClick={() => setApostilaModal(null)}>Cancelar</button><button className="btn-ur btn-primary-ur" type="submit">Salvar apostila</button></div>
          </form>
        </div>
      );
    }

    /* Resolution Modal */
    if (resolutionModal) {
      const [form, setForm] = useState(resolutionModal);
      useEffect(() => setForm(resolutionModal), [resolutionModal]);
      return (
        <div className="modal-backdrop-ur" onClick={(e) => { if (e.target === e.currentTarget) setResolutionModal(null); }}>
          <form className="modal-card" onSubmit={(e) => { e.preventDefault(); saveResolution(form); }}>
            <div className="modal-head"><strong>Editar resolução</strong><button className="btn-icon" type="button" onClick={() => setResolutionModal(null)}><SvgIcon d={ICONS.x} /></button></div>
            <div className="modal-body" style={{ gridTemplateColumns: "1fr" }}>
              <div className="adm-lesson-ctx">Questão · {form.assuntoId || ""}</div>
              <div className="question-preview" style={{ maxHeight: 120, overflowY: "auto" }}>{(form.enunciado || "").replace(/<[^>]*>/g, "").substring(0, 200)}</div>
              <div><label>Link do YouTube</label><input className="control w-100" placeholder="https://www.youtube.com/watch?v=..." value={form.videoUrl || ""} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} /></div>
            </div>
            <div className="modal-foot"><button className="btn-ur" type="button" onClick={() => setResolutionModal(null)}>Cancelar</button><button className="btn-ur btn-primary-ur" type="submit">Salvar resolução</button></div>
          </form>
        </div>
      );
    }

    /* Exam Modal */
    if (examModal) {
      const [form, setForm] = useState(examModal);
      useEffect(() => setForm(examModal), [examModal]);
      return (
        <div className="modal-backdrop-ur" onClick={(e) => { if (e.target === e.currentTarget) setExamModal(null); }}>
          <form className="modal-card modal-card-wide" onSubmit={(e) => { e.preventDefault(); saveExam(form); }}>
            <div className="modal-head"><strong>{form.editing ? "Editar prova ENEM" : "Nova prova ENEM"}</strong><button className="btn-icon" type="button" onClick={() => setExamModal(null)}><SvgIcon d={ICONS.x} /></button></div>
            <div className="modal-body">
              <div><label>Ano</label><input className="control w-100" type="number" min="1998" max="2100" value={form.ano || ""} onChange={(e) => setForm((f) => ({ ...f, ano: e.target.value }))} required /></div>
              <div><label>Tipo</label>
                <select className="select-control w-100" value={form.tipo || "ENEM"} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                  <option>ENEM</option><option>PPL</option><option>Reaplicação</option>
                </select>
              </div>
              <div><label>Questões de Física</label><input className="control w-100" type="number" min="0" value={form.questoesTotal || 0} onChange={(e) => setForm((f) => ({ ...f, questoesTotal: e.target.value }))} /></div>
              <div className="full"><label>Link público do PDF da prova</label><input className="control w-100" type="text" placeholder="https://..." value={form.pdfUrl || ""} onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))} /></div>
              <div className="full">
                <div className="exam-resolution-tools">
                  <div><label>Resoluções por questão</label><small>Adicione o link da resolução em cada questão.</small></div>
                  <button className="btn-ur" type="button" onClick={() => {
                    const qs = form.questoes || [];
                    const n = Math.max(Number(form.questoesTotal || 0), qs.length + 1);
                    const newQs = [];
                    for (let i = 0; i < n; i++) newQs.push({ numero: i + 1, video: qs[i]?.video || "" });
                    setForm((f) => ({ ...f, questoes: newQs }));
                  }}><SvgIcon d={ICONS["list-plus"]} /> Gerar questões</button>
                  <button className="btn-ur" type="button" onClick={() => setForm((f) => ({ ...f, questoes: [...(f.questoes || []), { numero: (f.questoes?.length || 0) + 1, video: "" }] }))}><SvgIcon d={ICONS.plus} /> Adicionar</button>
                </div>
                <div className="exam-resolution-list">
                  {(form.questoes || []).length === 0 && <div className="exam-resolution-empty">Clique em "Gerar questões" para criar as linhas de resolução.</div>}
                  {(form.questoes || []).map((q, i) => (
                    <div className="exam-resolution-row" key={i}>
                      <span>Q{i + 1}</span>
                      <input className="control w-100" placeholder="https://youtube.com/..." value={q.video || ""} onChange={(e) => {
                        const qs = [...(form.questoes || [])];
                        qs[i] = { ...qs[i], video: e.target.value };
                        setForm((f) => ({ ...f, questoes: qs }));
                      }} />
                      <button className="btn-icon delete" type="button" onClick={() => {
                        const qs = (form.questoes || []).filter((_, idx) => idx !== i);
                        setForm((f) => ({ ...f, questoes: qs }));
                      }}><SvgIcon d={ICONS.x} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot"><button className="btn-ur" type="button" onClick={() => setExamModal(null)}>Cancelar</button><button className="btn-ur btn-primary-ur" type="submit">Salvar prova ENEM</button></div>
          </form>
        </div>
      );
    }

    return null;
  };

  if (loadingData) {
    return (
      <div className="admin-app">
        <div className="main"><div className="empty-state" style={{ padding: "4rem" }}>
          <div className="auth-loading-spinner"></div>
          <p style={{ marginTop: 16, color: "#94a3b8" }}>Carregando dados...</p>
        </div></div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">UR</div>
          <div><strong>UNIVERSO<br />RELATIVO</strong></div>
        </div>
        <div className="nav-list"><NavView id="dashboard" icon="dashboard" label="Dashboard" /></div>
        <div>
          <div className="nav-group-label">Gerenciamento</div>
          <div className="nav-list">
            <NavView id="students" icon="students" label="Alunos" />
            <NavView id="questions" icon="questions" label="Banco de Questões" />
            <NavView id="resolutions" icon="resolutions" label="Resoluções" />
            <NavView id="lessons" icon="lessons" label="Aulas" />
            <NavView id="apostilas" icon="apostilas" label="Apostilas" />
            <NavView id="exams" icon="exams" label="Provas" />
          </div>
        </div>
        <div>
          <div className="nav-group-label">Configurações</div>
          <div className="nav-list"><NavView id="settings" icon="settings" label="Configurações" /></div>
        </div>
        <div className="sidebar-footer">
          <button className="student-preview" onClick={() => navigate("/dashboard?visao=aluno")}>
            Visão do Aluno <SvgIcon d={ICONS.external} />
          </button>
          <button className="student-preview logout" onClick={async () => { await logout(); navigate("/"); }}>
            Sair <SvgIcon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </button>
          <div className="admin-profile">
            <div className="avatar">AD</div>
            <div><strong>Admin</strong><span>Administrador</span></div>
          </div>
        </div>
      </aside>
      <main className="main">
        {renderDashboard()}
        {renderStudents()}
        {renderQuestions()}
        {renderResolutions()}
        {renderLessons()}
        {renderApostilas()}
        {renderExams()}
        {renderSettings()}
      </main>
      {renderModal()}
    </div>
  );
}
