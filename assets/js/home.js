/* =========================================================================
   home.js — lista de eventos, filtro por categoria e busca
   ========================================================================= */

let TODOS_EVENTOS = [];
let categoriaAtiva = 'Todos';
let termoBusca = '';

const grid = document.getElementById('eventosGrid');
const skeletonWrap = document.getElementById('skeletonWrap');
const contador = document.getElementById('eventosContador');
const inputBusca = document.getElementById('inputBusca');
const filtrosWrap = document.getElementById('filtrosCategoria');

function cardEvento(evento) {
    const cat = infoCategoria(evento.categoria);
    const ocupadas = vagasOcupadasReal(evento);
    const pct = Math.round((ocupadas / evento.vagasTotais) * 100);
    const esgotado = ocupadas >= evento.vagasTotais;
    const corBarra = pct >= 100 ? 'var(--danger)' : pct >= 75 ? 'var(--warning)' : 'var(--success)';

    const card = document.createElement('a');
    card.href = `evento.html?id=${evento.id}`;
    card.className = 'evento-card';
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';

    card.innerHTML = `
    <div class="evento-card__banner" style="background:${gradienteCategoria(evento.categoria)}">
      ${evento.destaque ? `<span class="badge-destaque"><span class="material-symbols-outlined">star</span>Destaque</span>` : ''}
      <span class="material-symbols-outlined">${cat.icone}</span>
      <span class="evento-card__data">${formatarData(evento.data)} · ${evento.horario}</span>
    </div>
    <div class="evento-card__corpo">
      <span class="chip-categoria" style="background:${cat.cor1}22; color:${cat.cor1}">${evento.categoria}</span>
      <h3 class="evento-card__titulo">${evento.titulo}</h3>
      <div class="evento-card__meta">
        <span><span class="material-symbols-outlined">location_on</span>${evento.local}</span>
      </div>
      <div>
        <div class="vagas-texto"><span>${esgotado ? 'Esgotado' : `${evento.vagasTotais - ocupadas} vagas restantes`}</span><span>${pct}%</span></div>
        <div class="vagas-bar"><div class="vagas-bar__fill" style="width:${pct}%; background:${corBarra}"></div></div>
      </div>
      <div class="evento-card__cta">
        ${esgotado
            ? `<span class="badge-esgotado"><span class="material-symbols-outlined" style="font-size:15px">block</span>Sem vagas</span>`
            : `<span class="btn btn-ghost btn-block">Ver detalhes<span class="material-symbols-outlined" style="font-size:17px">arrow_forward</span></span>`}
      </div>
    </div>
  `;
    return card;
}

function renderizar() {
    const filtrados = TODOS_EVENTOS.filter((e) => {
        const bateCategoria = categoriaAtiva === 'Todos' || e.categoria === categoriaAtiva;
        const bateBusca = e.titulo.toLowerCase().includes(termoBusca.toLowerCase());
        return bateCategoria && bateBusca;
    });

    contador.textContent = `${filtrados.length} evento${filtrados.length === 1 ? '' : 's'} encontrado${filtrados.length === 1 ? '' : 's'}`;

    grid.innerHTML = '';

    if (filtrados.length === 0) {
        grid.innerHTML = `
      <div class="estado-vazio" style="grid-column:1/-1">
        <span class="material-symbols-outlined">search_off</span>
        <h3>Nenhum evento encontrado</h3>
        <p>Tenta outra categoria ou outro termo de busca.</p>
      </div>`;
        return;
    }

    filtrados.forEach((evento, i) => {
        const card = cardEvento(evento);
        card.style.animationDelay = `${i * 0.05}s`;
        grid.appendChild(card);
    });
}

function montarFiltros() {
    const categorias = ['Todos', ...new Set(TODOS_EVENTOS.map((e) => e.categoria))];
    filtrosWrap.innerHTML = categorias.map((cat) =>
        `<button class="chip-filtro${cat === categoriaAtiva ? ' ativo' : ''}" data-cat="${cat}">${cat}</button>`
    ).join('');

    filtrosWrap.querySelectorAll('.chip-filtro').forEach((btn) => {
        btn.addEventListener('click', () => {
            categoriaAtiva = btn.dataset.cat;
            filtrosWrap.querySelectorAll('.chip-filtro').forEach((b) => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            renderizar();
        });
    });
}

inputBusca.addEventListener('input', (e) => {
    termoBusca = e.target.value;
    renderizar();
});

(async function iniciar() {
    try {
        TODOS_EVENTOS = await carregarEventos();
        skeletonWrap.classList.add('escondido');
        grid.classList.remove('escondido');
        montarFiltros();
        renderizar();
    } catch (erro) {
        skeletonWrap.classList.add('escondido');
        grid.classList.remove('escondido');
        grid.innerHTML = `
      <div class="estado-vazio" style="grid-column:1/-1">
        <span class="material-symbols-outlined">cloud_off</span>
        <h3>Não deu pra carregar os eventos</h3>
        <p>Este mock usa <code>fetch</code>, então precisa rodar num servidor local (Live Server, <code>python3 -m http.server</code>...), não abrindo o arquivo direto no navegador.</p>
      </div>`;
        console.error(erro);
    }
})();
