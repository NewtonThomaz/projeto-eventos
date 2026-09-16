/* =========================================================================
   api.js — camada de dados do mock (JSON local + localStorage)
   Compartilhado por index.html, evento.html e inscricao.html.
   ========================================================================= */

const CATEGORIAS = {
  Workshop: { icone: 'construction', cor1: '#6366f1', cor2: '#8b5cf6' },
  Palestra: { icone: 'campaign', cor1: '#0ea5e9', cor2: '#6366f1' },
  Hackathon: { icone: 'bolt', cor1: '#f59e0b', cor2: '#ef4444' },
  Meetup: { icone: 'groups', cor1: '#10b981', cor2: '#0d9488' },
  Curso: { icone: 'school', cor1: '#8b5cf6', cor2: '#d946ef' },
  Show: { icone: 'music_note', cor1: '#f43f5e', cor2: '#fb923c' }
};

const CHAVE_INSCRICOES = 'eventosFatec.inscricoesExtras';

function infoCategoria(categoria) {
  return CATEGORIAS[categoria] || { icone: 'event', cor1: '#6366f1', cor2: '#8b5cf6' };
}

function gradienteCategoria(categoria) {
  const c = infoCategoria(categoria);
  return `linear-gradient(135deg, ${c.cor1}, ${c.cor2})`;
}

async function carregarEventos() {
  const resposta = await fetch('data/eventos.json');
  if (!resposta.ok) throw new Error('Não foi possível carregar data/eventos.json');
  return resposta.json();
}

async function buscarEventoPorId(id) {
  const eventos = await carregarEventos();
  return eventos.find((e) => String(e.id) === String(id)) || null;
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${dia} ${meses[parseInt(mes, 10) - 1]}`;
}

function formatarDataCompleta(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${parseInt(dia, 10)} de ${meses[parseInt(mes, 10) - 1]} de ${ano}`;
}

/* ---------- Inscrições extras (simulam o INSERT que o Supabase vai fazer de verdade) ---------- */

function lerInscricoesExtras() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_INSCRICOES)) || {};
  } catch {
    return {};
  }
}

function registrarInscricaoLocal(eventoId) {
  const extras = lerInscricoesExtras();
  extras[eventoId] = (extras[eventoId] || 0) + 1;
  localStorage.setItem(CHAVE_INSCRICOES, JSON.stringify(extras));
}

function vagasOcupadasReal(evento) {
  const extras = lerInscricoesExtras();
  const extra = extras[evento.id] || 0;
  return Math.min(evento.vagasTotais, evento.vagasOcupadas + extra);
}

function gerarCodigoInscricao() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let codigo = 'EVT-';
  for (let i = 0; i < 4; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  codigo += '-' + Math.floor(1000 + Math.random() * 9000);
  return codigo;
}
