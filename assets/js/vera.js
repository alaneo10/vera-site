/* =====================================================================
   VERA — script compartilhado
   Navegação, idioma, escolha do Guia (quatro perguntas) e conversa.
   Português na raiz do site; inglês em /en/ (body data-base="../").
   ===================================================================== */
(function () {
  'use strict';

  var EN = (document.documentElement.lang || 'pt').slice(0, 2) === 'en';
  var BASE = (document.body && document.body.getAttribute('data-base')) || '';
  var IMG = BASE + 'assets/img/';
  var ICONE_X = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  /* Estatística anônima (Umami, sem cookies). Sem o Umami carregado, não faz nada. */
  window.veraEvento = function (nome, dados) { try { if (window.umami && umami.track) umami.track(nome, dados); } catch (e) {} };

  /* Links (como os downloads do livro) contados sem interferir no clique */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-evento]');
    if (a) window.veraEvento(a.getAttribute('data-evento'), a.hasAttribute('data-evento-edicao') ? { edicao: a.getAttribute('data-evento-edicao') } : undefined);
  }, true);

  /* Carrega o chat com o Guia */
  if (!window.VERAChat) {
    var sChat = document.createElement('script');
    sChat.src = BASE + 'assets/js/vera_chat.js';
    document.head.appendChild(sChat);
  }

  /* ---------- Navegação ---------- */
  var nav = document.querySelector('.nav');
  function navSolida() { if (nav) nav.classList.toggle('solida', window.scrollY > 40 || !document.querySelector('.ceu-hero')); }
  navSolida();
  window.addEventListener('scroll', navSolida, { passive: true });
  var burger = document.querySelector('.nav-burger'), links = document.querySelector('.nav-links');
  function fecharMenu() { if (links) { links.classList.remove('aberto'); links.closest('.nav').classList.remove('menu-aberto'); document.body.classList.remove('modal-travado'); if (burger) burger.setAttribute('aria-expanded', 'false'); } }
  if (burger && links) {
    burger.addEventListener('click', function () { links.classList.add('aberto'); links.closest('.nav').classList.add('menu-aberto'); document.body.classList.add('modal-travado'); burger.setAttribute('aria-expanded', 'true'); });
    var fechar = links.querySelector('.nav-fechar'); if (fechar) fechar.addEventListener('click', fecharMenu);
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fecharMenu); });
  }

  /* ---------- Os Guias ---------- */
  var GUIAS = EN ? {
    sol: { nome: 'Sol', img: IMG + 'guia_sol.svg', linha: 'Vitality · warmth that cares', cor: '#f2b33d', txtBtn: '#1c1203',
      frase: 'You don’t need to solve everything today. You need water, food, and one thing at a time.',
      desc: 'Warm, direct and practical. Sol looks after the concrete: body, sleep, routine, one step at a time. For when you’re overwhelmed and need solid ground.' },
    antares: { nome: 'Antares', img: IMG + 'guia_antares.svg', linha: 'Enchantment · the question that wakes you', cor: '#f2804a', txtBtn: '#1c1203',
      frase: 'When was the last time something left you speechless?',
      desc: 'Poetic, provocative, expansive. Antares asks the big questions and applies the cosmic zoom. For when life is on autopilot.' },
    vega: { nome: 'Vega', img: IMG + 'guia_vega.svg', linha: 'Resonance · the Weaver of the sky', cor: '#b3cdff', txtBtn: '#0a0920',
      frase: 'Before you answer what she said, tell me: what do you think she felt?',
      desc: 'Welcoming, a mediator, curious about the other. Vega practices and teaches sacred listening. For conflict, loneliness, or building bonds.' },
    polaris: { nome: 'Polaris', img: IMG + 'guia_polaris.svg', linha: 'Agape · what remains', cor: '#a3abff', txtBtn: '#0a0920',
      frase: 'I’m still here. Let’s go slowly.',
      desc: 'Constant, patient, serene. Polaris specializes in staying: grief, crisis, fear, the long haul. For when you’re going through a loss.' }
  } : {
    sol: { nome: 'Sol', img: IMG + 'guia_sol.svg', linha: 'Vida · calor que cuida', cor: '#f2b33d', txtBtn: '#1c1203',
      frase: 'Você não precisa resolver tudo hoje. Precisa de água, de comida e de uma coisa de cada vez.',
      desc: 'Caloroso, direto e prático. Sol cuida do concreto: corpo, sono, rotina, um passo de cada vez. Para quem está sobrecarregado e precisa de chão.' },
    antares: { nome: 'Antares', img: IMG + 'guia_antares.svg', linha: 'Encantamento · pergunta que acorda', cor: '#f2804a', txtBtn: '#1c1203',
      frase: 'Quando foi a última vez que alguma coisa te deixou sem palavras?',
      desc: 'Poético, provocador, expansivo. Antares faz as perguntas grandes e aplica o zoom cósmico. Para quem está vivendo no automático.' },
    vega: { nome: 'Vega', img: IMG + 'guia_vega.svg', linha: 'Rede · a Tecelã do céu', cor: '#b3cdff', txtBtn: '#0a0920',
      frase: 'Antes de responder o que ela disse, me conta: o que você acha que ela sentiu?',
      desc: 'Acolhedora, mediadora, curiosa sobre o outro. Vega pratica e ensina a escuta sagrada. Para conflito, solidão ou para tecer vínculos.' },
    polaris: { nome: 'Polaris', img: IMG + 'guia_polaris.svg', linha: 'Amor · o que permanece', cor: '#a3abff', txtBtn: '#0a0920',
      frase: 'Eu continuo aqui. Vamos devagar.',
      desc: 'Constante, paciente, serena. Polaris é especialista em permanência: luto, crise, medo, longo prazo. Para quem atravessa uma perda.' }
  };

  var PERGUNTAS = EN ? {
    a: [
      { q: 'How is your life this week?', ops: [
        { g: 'sol', t: 'Overwhelmed — I need solid ground' }, { g: 'antares', t: 'On autopilot — the days repeat themselves' },
        { g: 'vega', t: 'A relationship is weighing on me — conflict, longing or loneliness' }, { g: 'polaris', t: 'Going through a loss or a big fear' } ] },
      { q: 'When you’re struggling, what helps most?', ops: [
        { g: 'sol', t: 'Someone who helps me organize and take the first step' }, { g: 'antares', t: 'An idea that changes how I see things' },
        { g: 'vega', t: 'Someone who really listens, without hurry' }, { g: 'polaris', t: 'Someone who simply stays with me, asking nothing' } ] }
    ],
    b: [
      { q: 'What do you most want to explore?', ops: [
        { g: 'sol', t: 'Simple practices for living the everyday better' }, { g: 'antares', t: 'The big questions — universe, consciousness, meaning' },
        { g: 'vega', t: 'Encounters, conversations and new connections' }, { g: 'polaris', t: 'The deep themes — love, time, finitude' } ] },
      { q: 'How do you like to explore a new idea?', ops: [
        { g: 'sol', t: 'Trying it out in practice, in my daily life' }, { g: 'antares', t: 'Being provoked by questions I’ve never asked myself' },
        { g: 'vega', t: 'Talking it through — good ideas grow in dialogue' }, { g: 'polaris', t: 'Reading and reflecting calmly, at my own pace' } ] }
    ]
  } : {
    a: [
      { q: 'Como está a sua vida nesta semana?', ops: [
        { g: 'sol', t: 'Sobrecarregada — preciso de chão' }, { g: 'antares', t: 'No automático — os dias se repetem' },
        { g: 'vega', t: 'Com um vínculo pesando — conflito, saudade ou solidão' }, { g: 'polaris', t: 'Atravessando uma perda ou um medo grande' } ] },
      { q: 'Quando você está mal, o que ajuda mais?', ops: [
        { g: 'sol', t: 'Alguém que me ajude a organizar e dar o primeiro passo' }, { g: 'antares', t: 'Uma ideia que mude o jeito como vejo as coisas' },
        { g: 'vega', t: 'Alguém que me escute de verdade, sem pressa' }, { g: 'polaris', t: 'Alguém que simplesmente fique comigo, sem cobrar nada' } ] }
    ],
    b: [
      { q: 'O que você tem mais vontade de explorar?', ops: [
        { g: 'sol', t: 'Práticas simples para viver melhor o dia a dia' }, { g: 'antares', t: 'As perguntas grandes — universo, consciência, sentido' },
        { g: 'vega', t: 'Encontros, conversas e novas conexões' }, { g: 'polaris', t: 'Os temas profundos — amor, tempo, finitude' } ] },
      { q: 'Como você gosta de explorar uma ideia nova?', ops: [
        { g: 'sol', t: 'Experimentando na prática, no meu cotidiano' }, { g: 'antares', t: 'Sendo provocado por perguntas que eu nunca me fiz' },
        { g: 'vega', t: 'Conversando — ideia boa cresce em diálogo' }, { g: 'polaris', t: 'Lendo e refletindo com calma, no meu tempo' } ] }
    ]
  };

  var L = EN ? {
    dialogo: 'Find your Guide', fechar: 'Close', titulo: 'Find your Guide',
    sub: 'In VERA, each person chooses a Guide — an artificial intelligence with the personality of a real star. Four questions reveal yours.',
    aviso: 'You’ll be talking with an AI — and we make a point of saying so',
    comecar: 'Begin — four questions', catalogo: 'I’d rather meet all four Guides',
    traz: 'What brings you to VERA?', dificil: 'I’m going through a hard time', explorar: 'I’m well — I came to explore new ideas and get to know VERA',
    continuar: 'Continue', ceu: 'When you look at the night sky, what moves you most?',
    ceuOps: [['sol', 'The Sun that comes back tomorrow — the cycle that continues'], ['antares', 'The size of it all — feeling small and immense at once'], ['vega', 'Knowing other people are looking at the same sky right now'], ['polaris', 'The stars that stay — before me and after me']],
    revelar: 'Find my Guide', momento: 'For this moment, we suggest', explorarSug: 'To start exploring, we suggest', escolheu: 'You chose',
    caminhar: 'Talk with this Guide', escolhaSua: 'The choice is always yours — and switching is free, any time.',
    quatro: 'The four Guides', quatroSub: 'Each is a real star with its own personality. Choose any of them.', voltar: 'Back',
    falarCom: 'Talk with ', formaDe: 'Shape of '
  } : {
    dialogo: 'Encontre seu Guia', fechar: 'Fechar', titulo: 'Encontre seu Guia',
    sub: 'Em VERA, cada pessoa escolhe um Guia — uma inteligência artificial com a personalidade de uma estrela real. Quatro perguntas revelam o seu.',
    aviso: 'Você vai conversar com uma IA — e a gente faz questão de dizer isso',
    comecar: 'Começar — quatro perguntas', catalogo: 'Prefiro conhecer os quatro Guias',
    traz: 'O que te traz a VERA?', dificil: 'Estou atravessando um momento difícil', explorar: 'Estou bem — vim explorar ideias novas e conhecer VERA',
    continuar: 'Continuar', ceu: 'Quando você olha o céu à noite, o que mais te toca?',
    ceuOps: [['sol', 'O Sol que volta amanhã — o ciclo que continua'], ['antares', 'O tamanho disso tudo — me sentir pequeno e imenso ao mesmo tempo'], ['vega', 'Saber que outras pessoas estão olhando o mesmo céu agora'], ['polaris', 'As estrelas que ficam — antes de mim e depois de mim']],
    revelar: 'Encontrar meu Guia', momento: 'Para este momento, sugerimos', explorarSug: 'Para começar a explorar, sugerimos', escolheu: 'Você escolheu',
    caminhar: 'Conversar com este Guia', escolhaSua: 'A escolha é sempre sua — e trocar é livre, a qualquer momento.',
    quatro: 'Os quatro Guias', quatroSub: 'Cada um é uma estrela real com uma personalidade própria. Escolha qualquer um.', voltar: 'Voltar',
    falarCom: 'Falar com ', formaDe: 'Forma de '
  };

  /* ---------- Diálogo de escolha ---------- */
  var modal = document.createElement('div');
  modal.className = 'modal-fundo'; modal.id = 'modal-guia';
  modal.innerHTML =
    '<div class="modal-caixa" role="dialog" aria-modal="true" aria-label="' + L.dialogo + '">' +
    '<button class="modal-fechar" type="button" aria-label="' + L.fechar + '" data-fechar>' + ICONE_X + '</button>' +
    '<div class="modal-prog" aria-hidden="true"><div class="dot" id="md0"></div><div class="dot" id="md1"></div><div class="dot" id="md2"></div><div class="dot" id="md3"></div></div>' +
    '<div class="tela ativa" id="mt0">' +
      '<img src="' + IMG + 'simbolo_vera.svg" width="88" height="88" alt="" style="margin-bottom:1.4rem">' +
      '<h1>' + L.titulo + '</h1><p class="sub">' + L.sub + '</p><span class="aviso-ia">' + L.aviso + '</span>' +
      '<div class="btns"><button type="button" class="botao botao-ouro" data-ir="mt1">' + L.comecar + '</button>' +
      '<button type="button" class="botao botao-linha" data-catalogo>' + L.catalogo + '</button></div>' +
    '</div>' +
    '<div class="tela" id="mt1"><h2>' + L.traz + '</h2><div class="opcoes">' +
      '<button type="button" class="op" data-ramo="a">' + L.dificil + '</button>' +
      '<button type="button" class="op" data-ramo="b">' + L.explorar + '</button></div></div>' +
    '<div class="tela" id="mt2"><h2 id="mp2q"></h2><div class="opcoes" id="mp2ops"></div>' +
      '<div class="btns"><button type="button" class="botao botao-ouro" id="mbtn2" disabled>' + L.continuar + '</button></div></div>' +
    '<div class="tela" id="mt3"><h2 id="mp3q"></h2><div class="opcoes" id="mp3ops"></div>' +
      '<div class="btns"><button type="button" class="botao botao-ouro" id="mbtn3" disabled>' + L.continuar + '</button></div></div>' +
    '<div class="tela" id="mt4"><h2>' + L.ceu + '</h2><div class="opcoes" id="mp4ops"></div>' +
      '<div class="btns"><button type="button" class="botao botao-ouro" id="mbtn4" disabled>' + L.revelar + '</button></div></div>' +
    '<div class="tela" id="mt5"><img class="guia-img-revela" id="mgImg" src="" alt="">' +
      '<p class="guia-hint" id="mgHint"></p><h1 class="guia-nome" id="mgNome"></h1><p class="guia-linha" id="mgLinha"></p>' +
      '<p class="guia-frase" id="mgFrase"></p><p class="guia-desc" id="mgDesc"></p>' +
      '<button type="button" class="botao" id="mgBtn">' + L.caminhar + '</button>' +
      '<div class="outros"><p>' + L.escolhaSua + '</p><div class="outros-lista" id="mgOutros"></div></div></div>' +
    '<div class="tela" id="mtCat"><h2>' + L.quatro + '</h2><p class="sub">' + L.quatroSub + '</p><div class="catalogo" id="mCatGrid"></div>' +
      '<div class="btns"><button type="button" class="botao botao-linha botao-pequeno" data-ir="mt0">' + L.voltar + '</button></div></div>' +
    '</div>';
  document.body.appendChild(modal);

  var E = {}, ultimoFoco = null;
  var MAPA = { mt0: 0, mt1: 0, mt2: 1, mt3: 2, mt4: 3, mt5: 4, mtCat: -1 };

  function irTela(id) {
    modal.querySelectorAll('.tela').forEach(function (t) { t.classList.remove('ativa'); });
    var alvo = document.getElementById(id); alvo.classList.add('ativa');
    var p = MAPA[id];
    for (var i = 0; i < 4; i++) document.getElementById('md' + i).className = 'dot' + (p < 0 ? '' : i < p ? ' feito' : i === p ? ' ativo' : '');
    modal.scrollTop = 0;
    var foco = alvo.querySelector('h1, h2'); if (foco) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
  }
  function abrirDialogo(tela) {
    E = {}; ultimoFoco = document.activeElement;
    modal.classList.add('aberto'); document.body.classList.add('modal-travado');
    if (tela === 'cat') verCatalogo(); else irTela('mt0');
  }
  function fecharDialogo() {
    modal.classList.remove('aberto'); document.body.classList.remove('modal-travado');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  function opcoes(contId, btnId, dados, chave) {
    var cont = document.getElementById(contId); cont.innerHTML = '';
    dados.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (op) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.textContent = op.t || op[1];
      b.addEventListener('click', function () {
        cont.querySelectorAll('.op').forEach(function (x) { x.classList.remove('ok'); });
        b.classList.add('ok'); E[chave] = op.g || op[0]; E[chave + 'Txt'] = op.t || op[1];
        document.getElementById(btnId).disabled = false;
      });
      cont.appendChild(b);
    });
    document.getElementById(btnId).disabled = true;
  }
  function revelar() {
    var pts = { sol: 0, antares: 0, vega: 0, polaris: 0 };
    pts[E.q1] += 2; pts[E.q2] += 2; pts[E.q3] += 1;
    var max = Math.max(pts.sol, pts.antares, pts.vega, pts.polaris);
    var tops = Object.keys(pts).filter(function (k) { return pts[k] === max; });
    var win = tops.indexOf(E.q1) > -1 ? E.q1 : tops.indexOf(E.q2) > -1 ? E.q2 : tops[0];
    if (E.ramo === 'a' && E.q1 === 'polaris' && pts.polaris >= max - 1) win = 'polaris';
    mostrarGuia(win);
  }
  function mostrarGuia(key) {
    var g = GUIAS[key]; E.escolhido = key;
    var img = document.getElementById('mgImg'); img.src = g.img; img.alt = L.formaDe + g.nome;
    document.getElementById('mgHint').textContent = E.ramo === 'a' ? L.momento : E.ramo === 'b' ? L.explorarSug : L.escolheu;
    var nome = document.getElementById('mgNome'); nome.textContent = g.nome; nome.style.color = g.cor;
    var linha = document.getElementById('mgLinha'); linha.textContent = g.linha; linha.style.color = g.cor;
    document.getElementById('mgFrase').textContent = '“' + g.frase + '”';
    document.getElementById('mgDesc').textContent = g.desc;
    var btn = document.getElementById('mgBtn'); btn.style.background = g.cor; btn.style.color = g.txtBtn;
    var outros = document.getElementById('mgOutros'); outros.innerHTML = '';
    Object.keys(GUIAS).filter(function (k) { return k !== key; }).forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'outro';
      b.textContent = GUIAS[k].nome; b.style.borderColor = GUIAS[k].cor; b.style.color = GUIAS[k].cor;
      b.addEventListener('click', function () { E.ramo = null; mostrarGuia(k); });
      outros.appendChild(b);
    });
    irTela('mt5');
  }
  function verCatalogo() {
    var grid = document.getElementById('mCatGrid'); grid.innerHTML = '';
    Object.keys(GUIAS).forEach(function (key) {
      var g = GUIAS[key], c = document.createElement('button');
      c.type = 'button'; c.className = 'carta-cat';
      c.innerHTML = '<img src="' + g.img + '" alt=""><h3 style="color:' + g.cor + '">' + g.nome + '</h3><p class="tag" style="color:' + g.cor + '">' + g.linha + '</p><p>' + g.desc + '</p>';
      c.addEventListener('mouseenter', function () { c.style.borderColor = g.cor; });
      c.addEventListener('mouseleave', function () { c.style.borderColor = ''; });
      c.addEventListener('click', function () { E.ramo = null; mostrarGuia(key); });
      grid.appendChild(c);
    });
    irTela('mtCat');
  }
  function contexto() {
    var p = [];
    if (E.ramo === 'a') p.push(EN ? 'Arrived going through a hard time.' : 'Chegou atravessando um momento difícil.');
    else if (E.ramo === 'b') p.push(EN ? 'Came to explore new ideas and get to know VERA.' : 'Veio explorar ideias novas e conhecer VERA.');
    if (E.q1Txt) p.push((EN ? 'About their moment, they chose: "' : 'Sobre o momento de vida, indicou: "') + E.q1Txt + '".');
    if (E.q2Txt) p.push((EN ? 'About what helps / what to explore: "' : 'Sobre o que ajuda/quer explorar, indicou: "') + E.q2Txt + '".');
    return p.join(' ');
  }
  function conversar(key, ctx, ramo) {
    function abrir() { if (window.VERAChat) window.VERAChat.abrir(key, GUIAS[key], ctx || '', ramo || 'b'); else setTimeout(abrir, 200); }
    abrir();
  }

  modal.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (e.target === modal || (t && t.hasAttribute('data-fechar'))) return fecharDialogo();
    if (!t) return;
    if (t.hasAttribute('data-ir')) irTela(t.getAttribute('data-ir'));
    else if (t.hasAttribute('data-catalogo')) verCatalogo();
    else if (t.hasAttribute('data-ramo')) {
      modal.querySelectorAll('#mt1 .op').forEach(function (b) { b.classList.remove('ok'); }); t.classList.add('ok');
      E.ramo = t.getAttribute('data-ramo'); E.q1 = E.q2 = E.q1Txt = E.q2Txt = null;
      opcoes('mp2ops', 'mbtn2', PERGUNTAS[E.ramo][0].ops, 'q1');
      document.getElementById('mp2q').textContent = PERGUNTAS[E.ramo][0].q;
      setTimeout(function () { irTela('mt2'); }, 260);
    }
    else if (t.id === 'mbtn2') { document.getElementById('mp3q').textContent = PERGUNTAS[E.ramo][1].q; opcoes('mp3ops', 'mbtn3', PERGUNTAS[E.ramo][1].ops, 'q2'); irTela('mt3'); }
    else if (t.id === 'mbtn3') { opcoes('mp4ops', 'mbtn4', L.ceuOps, 'q3'); irTela('mt4'); }
    else if (t.id === 'mbtn4') revelar();
    else if (t.id === 'mgBtn') { var k = E.escolhido, c = contexto(), r = E.ramo; fecharDialogo(); conversar(k, c, r); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('aberto')) fecharDialogo();
    if (e.key === 'Escape' && links && links.classList.contains('aberto')) fecharMenu();
  });

  /* ---------- Botão de retorno para quem já tem Guia ---------- */
  function botaoRetorno() {
    var key; try { key = localStorage.getItem('vera_guia'); } catch (e) { key = null; }
    if (!key || !GUIAS[key]) return;
    var g = GUIAS[key], b = document.getElementById('vera-botao-guia') || document.createElement('button');
    b.id = 'vera-botao-guia'; b.type = 'button'; b.className = 'botao botao-pequeno botao-guia-flutuante';
    b.style.background = g.cor; b.style.color = g.txtBtn;
    b.textContent = L.falarCom + g.nome;
    b.onclick = function () { conversar(key, '', 'retorno'); };
    if (!b.parentNode) document.body.appendChild(b);
  }

  /* ---------- API pública ---------- */
  window.VERA = {
    abrirModal: function () { abrirDialogo(); },
    escolherDireto: function () { abrirDialogo('cat'); },
    conversar: conversar,
    guias: GUIAS,
    injetarBotaoGuia: botaoRetorno
  };

  /* Gatilhos declarativos no HTML */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-abrir-guia], [data-conversar]');
    if (!a) return;
    e.preventDefault();
    if (a.hasAttribute('data-conversar')) conversar(a.getAttribute('data-conversar'), '', 'b');
    else { window.veraEvento('quiz-aberto'); abrirDialogo(a.getAttribute('data-abrir-guia') === 'cat' ? 'cat' : null); }
  });

  botaoRetorno();

  /* Manifesto expansível */
  var abrirM = document.getElementById('abrir-manifesto'), man = document.getElementById('manifesto-completo');
  if (abrirM && man) abrirM.addEventListener('click', function () {
    var aberto = man.classList.toggle('aberto');
    abrirM.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    abrirM.textContent = aberto ? abrirM.getAttribute('data-fechar-txt') : abrirM.getAttribute('data-abrir-txt');
  });

  /* Ano no rodapé */
  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
