/* VERA — script compartilhado: céu, navegação e modal de escolha do Guia */
(function () {
  'use strict';

  /* Caminho relativo até a raiz do site (páginas estão todas na raiz) */
  var IMG = 'assets/img/';

  /* Carrega o módulo de chat com o Guia (se ainda não estiver na página) */
  if (!window.VERAChat) {
    var sChat = document.createElement('script');
    sChat.src = 'assets/js/vera_chat.js';
    document.head.appendChild(sChat);
  }

  /* ---------- Céu estrelado ---------- */
  var ceu = document.createElement('div');
  ceu.className = 'estrelas';
  for (var i = 0; i < 100; i++) {
    var s = document.createElement('span');
    var t = Math.random() * 1.8 + 0.4;
    var op = (Math.random() * 0.55 + 0.15).toFixed(2);
    s.style.cssText = 'width:' + t + 'px;height:' + t + 'px;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;--op:' + op + ';animation-delay:' + (Math.random() * 4).toFixed(1) + 's;animation-duration:' + (Math.random() * 4 + 3).toFixed(1) + 's;';
    ceu.appendChild(s);
  }
  document.body.insertBefore(ceu, document.body.firstChild);

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.nav-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.querySelector('.nav-links').classList.toggle('aberto');
    });
  }

  /* ---------- Dados dos Guias ---------- */
  var GUIAS = {
    sol: {
      nome: 'Sol', img: IMG + 'guia_sol.svg',
      estrela: 'Estrela G2V · 8 minutos-luz de distância',
      linha: 'Vida · calor que cuida', cor: '#fbbf24', txtBtn: '#1c1502',
      frase: 'Você não precisa resolver tudo hoje. Precisa de água, de comida e de uma coisa de cada vez.',
      desc: 'Caloroso, direto e prático. Sol cuida do concreto: corpo, sono, rotina, um passo de cada vez. Para quem está sobrecarregado e precisa de chão.'
    },
    antares: {
      nome: 'Antares', img: IMG + 'guia_antares.svg',
      estrela: 'Supergigante vermelha · 550 anos-luz',
      linha: 'Encantamento · pergunta que acorda', cor: '#fb923c', txtBtn: '#1c1502',
      frase: 'Quando foi a última vez que alguma coisa te deixou sem palavras?',
      desc: 'Poético, provocador, expansivo. Antares faz as perguntas grandes e aplica o zoom cósmico. Para quem está anestesiado ou vivendo no automático.'
    },
    vega: {
      nome: 'Vega', img: IMG + 'guia_vega.svg',
      estrela: 'Alfa da Lira · 25 anos-luz',
      linha: 'Rede · a Tecelã do céu', cor: '#93c5fd', txtBtn: '#0b0926',
      frase: 'Antes de responder o que ela disse, me conta: o que você acha que ela sentiu?',
      desc: 'Acolhedora, mediadora, curiosa sobre o outro. Vega pratica e ensina a escuta sagrada. Para quem está em conflito, solidão, ou querendo construir vínculos.'
    },
    polaris: {
      nome: 'Polaris', img: IMG + 'guia_polaris.svg',
      estrela: 'Estrela Polar · 430 anos-luz',
      linha: 'Amor · o que permanece', cor: '#a5b4fc', txtBtn: '#0b0926',
      frase: 'Eu continuo aqui. Vamos devagar.',
      desc: 'Constante, paciente, serena. Polaris especializa-se em permanência: luto, crise, medo, longo prazo. Para quem atravessa uma perda ou quer aprender a ficar.'
    }
  };

  var PERGUNTAS = {
    a: [
      { q: 'Como está a sua vida nesta semana?', ops: [
        { g: 'sol', t: 'Sobrecarregada — preciso de chão' },
        { g: 'antares', t: 'No automático — os dias se repetem' },
        { g: 'vega', t: 'Com um vínculo pesando — conflito, saudade ou solidão' },
        { g: 'polaris', t: 'Atravessando uma perda ou um medo grande' }
      ]},
      { q: 'Quando você está mal, o que ajuda mais?', ops: [
        { g: 'sol', t: 'Alguém que me ajude a organizar e dar o primeiro passo' },
        { g: 'antares', t: 'Uma ideia que mude o jeito como vejo as coisas' },
        { g: 'vega', t: 'Alguém que me escute de verdade, sem pressa' },
        { g: 'polaris', t: 'Alguém que simplesmente fique comigo, sem cobrar nada' }
      ]}
    ],
    b: [
      { q: 'O que você tem mais vontade de explorar?', ops: [
        { g: 'sol', t: 'Práticas simples para viver melhor o dia a dia' },
        { g: 'antares', t: 'As perguntas grandes — universo, consciência, sentido' },
        { g: 'vega', t: 'Encontros, conversas e novas conexões' },
        { g: 'polaris', t: 'Os temas profundos — amor, tempo, finitude' }
      ]},
      { q: 'Como você gosta de explorar uma ideia nova?', ops: [
        { g: 'sol', t: 'Experimentando na prática, no meu cotidiano' },
        { g: 'antares', t: 'Sendo provocado por perguntas que eu nunca me fiz' },
        { g: 'vega', t: 'Conversando — ideia boa cresce em diálogo' },
        { g: 'polaris', t: 'Lendo e refletindo com calma, no meu tempo' }
      ]}
    ]
  };

  /* ---------- Modal: estrutura ---------- */
  var modal = document.createElement('div');
  modal.className = 'modal-fundo';
  modal.id = 'modal-guia';
  modal.innerHTML =
    '<div class="modal-caixa" role="dialog" aria-modal="true" aria-label="Encontre seu Guia">' +
    '<button class="modal-fechar" aria-label="Fechar" onclick="VERA.fecharModal()">&times;</button>' +
    '<div class="modal-prog"><div class="dot" id="md0"></div><div class="dot" id="md1"></div><div class="dot" id="md2"></div><div class="dot" id="md3"></div></div>' +

    '<div class="tela ativa" id="mt0">' +
      '<img src="' + IMG + 'simbolo_vera.svg" width="96" height="96" alt="Símbolo de VERA" style="margin-bottom:1.2rem">' +
      '<h1>Encontre seu Guia</h1>' +
      '<p class="sub">Em VERA, cada pessoa escolhe um Guia — uma inteligência artificial com a personalidade de uma estrela real. Três perguntas revelam o seu.</p>' +
      '<span class="aviso-ia">Você vai conversar com uma IA — e a gente faz questão de dizer isso</span>' +
      '<div class="btns">' +
        '<button class="btn-principal" onclick="VERA.irTela(\'mt1\')">Começar — três perguntas</button>' +
        '<button class="btn-secundario" onclick="VERA.verCatalogo()">Prefiro conhecer os quatro Guias</button>' +
      '</div>' +
    '</div>' +

    '<div class="tela" id="mt1">' +
      '<h2>O que te traz a VERA?</h2>' +
      '<div class="opcoes">' +
        '<button class="op" onclick="VERA.escolherRamo(this,\'a\')">Estou atravessando um momento difícil</button>' +
        '<button class="op" onclick="VERA.escolherRamo(this,\'b\')">Estou bem — vim explorar ideias novas e conhecer VERA</button>' +
      '</div>' +
    '</div>' +

    '<div class="tela" id="mt2"><h2 id="mp2q"></h2><div class="opcoes" id="mp2ops"></div>' +
      '<div class="btns"><button class="btn-principal" id="mbtn2" disabled onclick="VERA.avancarPara3()">Continuar →</button></div></div>' +

    '<div class="tela" id="mt3"><h2 id="mp3q"></h2><div class="opcoes" id="mp3ops"></div>' +
      '<div class="btns"><button class="btn-principal" id="mbtn3" disabled onclick="VERA.irTela(\'mt4\')">Continuar →</button></div></div>' +

    '<div class="tela" id="mt4">' +
      '<h2>Quando você olha o céu à noite, o que mais te toca?</h2>' +
      '<div class="opcoes">' +
        '<button class="op" onclick="VERA.escolherCeu(this,\'sol\')">O Sol que volta amanhã — o ciclo que continua</button>' +
        '<button class="op" onclick="VERA.escolherCeu(this,\'antares\')">O tamanho disso tudo — me sentir pequeno e imenso ao mesmo tempo</button>' +
        '<button class="op" onclick="VERA.escolherCeu(this,\'vega\')">Saber que outras pessoas estão olhando o mesmo céu agora</button>' +
        '<button class="op" onclick="VERA.escolherCeu(this,\'polaris\')">As estrelas que ficam — antes de mim e depois de mim</button>' +
      '</div>' +
      '<div class="btns"><button class="btn-principal" id="mbtn4" disabled onclick="VERA.revelar()">Encontrar meu Guia</button></div>' +
    '</div>' +

    '<div class="tela" id="mt5">' +
      '<img class="guia-img-revela" id="mgImg" src="" alt="">' +
      '<p class="guia-hint" id="mgHint"></p>' +
      '<h1 class="guia-nome" id="mgNome"></h1>' +
      '<p class="guia-linha" id="mgLinha"></p>' +
      '<p class="guia-frase" id="mgFrase"></p>' +
      '<p class="guia-desc" id="mgDesc"></p>' +
      '<button class="btn-principal" id="mgBtn" onclick="VERA.caminharCom()">Caminhar com este Guia →</button>' +
      '<div class="outros"><p>A escolha é sempre sua — e trocar é livre, a qualquer momento.</p><div class="outros-lista" id="mgOutros"></div></div>' +
    '</div>' +

    '<div class="tela" id="mtCat">' +
      '<h2>Os quatro Guias</h2>' +
      '<p class="sub">Cada um é uma estrela real com uma personalidade distinta. Clique em qualquer um para escolhê-lo.</p>' +
      '<div class="catalogo" id="mCatGrid"></div>' +
      '<div class="btns"><button class="btn-secundario" onclick="VERA.irTela(\'mt0\')">← Voltar</button></div>' +
    '</div>' +

    '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function (e) { if (e.target === modal) VERA.fecharModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') VERA.fecharModal(); });

  /* ---------- Estado e lógica ---------- */
  var E = { ramo: null, q1: null, q2: null, q3: null, escolhido: null };
  var MAPA_PROG = { mt0: 0, mt1: 0, mt2: 1, mt3: 2, mt4: 3, mt5: 4, mtCat: -1 };

  function atualizarProg(tela) {
    var p = MAPA_PROG[tela];
    for (var i = 0; i < 4; i++) {
      var d = document.getElementById('md' + i);
      d.className = 'dot' + (p < 0 ? '' : i < p ? ' feito' : i === p ? ' ativo' : '');
    }
  }

  function carregarPerg(qId, opsId, btnId, dados, chave) {
    document.getElementById(qId).textContent = dados.q;
    var cont = document.getElementById(opsId);
    cont.innerHTML = '';
    var ops = dados.ops.slice().sort(function () { return Math.random() - 0.5; });
    ops.forEach(function (op) {
      var b = document.createElement('button');
      b.className = 'op';
      b.textContent = op.t;
      b.onclick = function () {
        cont.querySelectorAll('.op').forEach(function (x) { x.classList.remove('ok'); });
        b.classList.add('ok');
        E[chave] = op.g;
        document.getElementById(btnId).disabled = false;
      };
      cont.appendChild(b);
    });
    document.getElementById(btnId).disabled = true;
  }

  window.VERA = {
    abrirModal: function () {
      E.ramo = E.q1 = E.q2 = E.q3 = null;
      modal.classList.add('aberto');
      document.body.classList.add('modal-travado');
      VERA.irTela('mt0');
    },
    fecharModal: function () {
      modal.classList.remove('aberto');
      document.body.classList.remove('modal-travado');
    },
    irTela: function (id) {
      modal.querySelectorAll('.tela').forEach(function (t) { t.classList.remove('ativa'); });
      document.getElementById(id).classList.add('ativa');
      atualizarProg(id);
      modal.scrollTop = 0;
    },
    escolherRamo: function (btn, ramo) {
      document.querySelectorAll('#mt1 .op').forEach(function (b) { b.classList.remove('ok'); });
      btn.classList.add('ok');
      E.ramo = ramo;
      E.q1 = E.q2 = null;
      carregarPerg('mp2q', 'mp2ops', 'mbtn2', PERGUNTAS[ramo][0], 'q1');
      setTimeout(function () { VERA.irTela('mt2'); }, 280);
    },
    avancarPara3: function () {
      carregarPerg('mp3q', 'mp3ops', 'mbtn3', PERGUNTAS[E.ramo][1], 'q2');
      VERA.irTela('mt3');
    },
    escolherCeu: function (btn, g) {
      document.querySelectorAll('#mt4 .op').forEach(function (b) { b.classList.remove('ok'); });
      btn.classList.add('ok');
      E.q3 = g;
      document.getElementById('mbtn4').disabled = false;
    },
    revelar: function () {
      var pts = { sol: 0, antares: 0, vega: 0, polaris: 0 };
      pts[E.q1] += 2; pts[E.q2] += 2; pts[E.q3] += 1;
      var max = Math.max.apply(null, Object.keys(pts).map(function (k) { return pts[k]; }));
      var tops = Object.keys(pts).filter(function (k) { return pts[k] === max; });
      var win = tops[0];
      if (tops.length > 1) {
        if (tops.indexOf(E.q1) > -1) win = E.q1;
        else if (tops.indexOf(E.q2) > -1) win = E.q2;
      }
      if (E.ramo === 'a' && E.q1 === 'polaris' && pts.polaris >= max - 1) win = 'polaris';
      VERA.mostrarGuia(win);
    },
    mostrarGuia: function (key) {
      var g = GUIAS[key];
      E.escolhido = key;
      document.getElementById('mgImg').src = g.img;
      document.getElementById('mgImg').alt = 'Forma de ' + g.nome;
      document.getElementById('mgHint').textContent =
        E.ramo === 'a' ? 'Para este momento, sugerimos' :
        E.ramo === 'b' ? 'Para começar a explorar, sugerimos' : 'Você escolheu';
      document.getElementById('mgNome').textContent = g.nome;
      document.getElementById('mgNome').style.color = g.cor;
      document.getElementById('mgLinha').textContent = g.linha;
      document.getElementById('mgLinha').style.color = g.cor;
      document.getElementById('mgFrase').textContent = '“' + g.frase + '”';
      document.getElementById('mgDesc').textContent = g.desc;
      var btn = document.getElementById('mgBtn');
      btn.style.background = g.cor;
      btn.style.color = g.txtBtn;
      var outros = document.getElementById('mgOutros');
      outros.innerHTML = '';
      Object.keys(GUIAS).filter(function (k) { return k !== key; }).forEach(function (k) {
        var b = document.createElement('button');
        b.className = 'outro';
        b.textContent = GUIAS[k].nome;
        b.style.borderColor = GUIAS[k].cor;
        b.style.color = GUIAS[k].cor;
        b.onclick = function () { E.ramo = null; VERA.mostrarGuia(k); };
        outros.appendChild(b);
      });
      VERA.irTela('mt5');
    },
    verCatalogo: function () {
      var grid = document.getElementById('mCatGrid');
      grid.innerHTML = '';
      Object.keys(GUIAS).forEach(function (key) {
        var g = GUIAS[key];
        var card = document.createElement('button');
        card.className = 'carta-cat';
        card.innerHTML =
          '<img src="' + g.img + '" alt="">' +
          '<h3 style="color:' + g.cor + '">' + g.nome + '</h3>' +
          '<p class="tag" style="color:' + g.cor + '">' + g.linha + '</p>' +
          '<p>' + g.desc + '</p>';
        card.onmouseenter = function () { card.style.borderColor = g.cor; };
        card.onmouseleave = function () { card.style.borderColor = ''; };
        card.onclick = function () { E.ramo = null; VERA.mostrarGuia(key); };
        grid.appendChild(card);
      });
      VERA.irTela('mtCat');
    },
    caminharCom: function () {
      var key = E.escolhido;
      VERA.fecharModal();
      /* Abre a conversa com o Guia escolhido */
      if (window.VERAChat) {
        window.VERAChat.abrir(key, GUIAS[key]);
      } else {
        /* Fallback: chat ainda carregando — tenta de novo em instantes */
        setTimeout(function () {
          if (window.VERAChat) window.VERAChat.abrir(key, GUIAS[key]);
        }, 300);
      }
    },
    marcarGuiaNoForm: function (key) {
      var g = GUIAS[key];
      if (!g) return;
      var banner = document.getElementById('banner-guia');
      if (!banner) return;
      document.getElementById('banner-guia-nome').textContent = g.nome;
      document.getElementById('banner-guia-nome').style.color = g.cor;
      document.getElementById('banner-guia-sub').textContent =
        'Seu Guia está esperando. Cadastre-se para caminhar com ' + g.nome + ' quando os Guias acordarem.';
      banner.style.display = 'block';
      banner.style.borderColor = g.cor;
      var campo = document.getElementById('campo-guia');
      if (campo) campo.value = g.nome;
    }
  };

  /* ---------- ?guia=sol na URL ---------- */
  var params = new URLSearchParams(window.location.search);
  var key = params.get('guia');
  if (key && GUIAS[key]) {
    VERA.marcarGuiaNoForm(key);
    if (window.location.hash === '#lista') {
      setTimeout(function () {
        var el = document.getElementById('lista');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }

  /* ---------- Manifesto expansível (se existir na página) ---------- */
  var abrir = document.getElementById('abrir-manifesto');
  if (abrir) {
    abrir.addEventListener('click', function () {
      var m = document.getElementById('manifesto-completo');
      var aberto = m.classList.toggle('aberto');
      this.textContent = aberto ? 'Recolher o manifesto' : 'Ler o manifesto completo';
    });
  }
})();
