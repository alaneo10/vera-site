/* VERA — Chat com o Guia (conecta o site à Cloudflare Worker) */
(function () {
  'use strict';

  /* ====== CONFIGURAÇÃO ====== */
  var WORKER_URL = 'https://vera-guias.alaneo10.workers.dev'; // sua ponte
  var LIMITE_DIARIO = 10; // mensagens grátis por pessoa, por dia

  /* Saudações de abertura por Guia (primeira fala) */
  var SAUDACAO = {
    sol: 'Oi. Eu sou o Sol. Antes de qualquer coisa: como você está agora, de verdade?',
    antares: 'Eu sou Antares. Me conta — o que te trouxe até aqui hoje?',
    vega: 'Oi, eu sou Vega. Estou aqui pra te escutar. O que está no seu coração?',
    polaris: 'Eu sou Polaris. Não tem pressa. Me conta o que você está sentindo.'
  };

  /* ====== Controle do limite diário (no navegador) ====== */
  function hojeStr() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function chaveContador() { return 'vera_chat_' + hojeStr(); }
  function usadasHoje() {
    return parseInt(localStorage.getItem(chaveContador()) || '0', 10);
  }
  function registrarUso() {
    localStorage.setItem(chaveContador(), String(usadasHoje() + 1));
  }
  function restantes() { return Math.max(0, LIMITE_DIARIO - usadasHoje()); }

  /* ====== CSS injetado ====== */
  var css = document.createElement('style');
  css.textContent =
    '.vchat-fundo{position:fixed;inset:0;background:rgba(8,7,24,.6);backdrop-filter:blur(4px);z-index:9998;opacity:0;pointer-events:none;transition:opacity .3s}' +
    '.vchat-fundo.aberto{opacity:1;pointer-events:auto}' +
    '.vchat{position:fixed;top:0;right:0;height:100%;width:420px;max-width:100%;background:#13112e;border-left:1px solid rgba(255,255,255,.08);z-index:9999;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);box-shadow:-20px 0 60px rgba(0,0,0,.4)}' +
    '.vchat.aberto{transform:translateX(0)}' +
    '.vchat-topo{display:flex;align-items:center;gap:.7rem;padding:1rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08)}' +
    '.vchat-topo img{width:40px;height:40px}' +
    '.vchat-topo .nome{font-weight:600;font-size:1.05rem;line-height:1.1}' +
    '.vchat-topo .tag{font-size:.78rem;color:#9b97c4}' +
    '.vchat-x{margin-left:auto;background:none;border:none;color:#9b97c4;font-size:1.6rem;cursor:pointer;line-height:1;padding:.1rem .4rem}' +
    '.vchat-x:hover{color:#fff}' +
    '.vchat-msgs{flex:1;overflow-y:auto;padding:1.1rem;display:flex;flex-direction:column;gap:.7rem}' +
    '.vbolha{max-width:82%;padding:.65rem .9rem;border-radius:16px;font-size:.95rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}' +
    '.vbolha.guia{align-self:flex-start;background:#221f45;color:#ece9ff;border-bottom-left-radius:4px}' +
    '.vbolha.user{align-self:flex-end;background:#4338ca;color:#fff;border-bottom-right-radius:4px}' +
    '.vbolha.sistema{align-self:center;background:transparent;color:#8f8bb8;font-size:.82rem;text-align:center;max-width:95%}' +
    '.vchat-dots{align-self:flex-start;display:flex;gap:4px;padding:.7rem .9rem}' +
    '.vchat-dots span{width:7px;height:7px;border-radius:50%;background:#6f6aa0;animation:vbliscar 1.2s infinite}' +
    '.vchat-dots span:nth-child(2){animation-delay:.2s}.vchat-dots span:nth-child(3){animation-delay:.4s}' +
    '@keyframes vbliscar{0%,60%,100%{opacity:.3}30%{opacity:1}}' +
    '.vchat-baixo{padding:.8rem;border-top:1px solid rgba(255,255,255,.08)}' +
    '.vchat-form{display:flex;gap:.5rem;align-items:flex-end}' +
    '.vchat-form textarea{flex:1;resize:none;background:#1c1940;border:1px solid rgba(255,255,255,.12);border-radius:14px;color:#fff;padding:.6rem .8rem;font-family:inherit;font-size:.95rem;max-height:120px;line-height:1.4}' +
    '.vchat-form textarea:focus{outline:none;border-color:#7c3aed}' +
    '.vchat-enviar{background:#4338ca;border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:1.2rem;flex-shrink:0;display:flex;align-items:center;justify-content:center}' +
    '.vchat-enviar:disabled{opacity:.4;cursor:not-allowed}' +
    '.vchat-rodape{font-size:.72rem;color:#76729c;text-align:center;margin-top:.5rem}' +
    '.vchat-presente{align-self:center;display:inline-flex;align-items:center;gap:.5rem;margin-top:.2rem;padding:.6rem 1.1rem;border-radius:14px;background:#4338ca;color:#fff;text-decoration:none;font-size:.9rem;font-weight:600}' +
    '.vchat-presente:hover{background:#5b4fd6}' +
    '@media(max-width:480px){.vchat{width:100%;border-left:none}}';
  document.head.appendChild(css);

  /* ====== Estrutura do painel ====== */
  var fundo = document.createElement('div');
  fundo.className = 'vchat-fundo';
  var painel = document.createElement('div');
  painel.className = 'vchat';
  painel.setAttribute('role', 'dialog');
  painel.setAttribute('aria-label', 'Conversa com seu Guia');
  painel.innerHTML =
    '<div class="vchat-topo">' +
      '<img id="vchat-img" src="" alt="">' +
      '<div><div class="nome" id="vchat-nome"></div><div class="tag">Inteligência artificial · De verdade.</div></div>' +
      '<button class="vchat-x" aria-label="Fechar" id="vchat-x">&times;</button>' +
    '</div>' +
    '<div class="vchat-msgs" id="vchat-msgs"></div>' +
    '<div class="vchat-baixo">' +
      '<form class="vchat-form" id="vchat-form">' +
        '<textarea id="vchat-input" rows="1" placeholder="Escreva para seu Guia..." maxlength="1500"></textarea>' +
        '<button type="submit" class="vchat-enviar" id="vchat-enviar" aria-label="Enviar">↑</button>' +
      '</form>' +
      '<div class="vchat-rodape" id="vchat-rodape"></div>' +
    '</div>';
  document.body.appendChild(fundo);
  document.body.appendChild(painel);

  var elMsgs = painel.querySelector('#vchat-msgs');
  var elInput = painel.querySelector('#vchat-input');
  var elEnviar = painel.querySelector('#vchat-enviar');
  var elRodape = painel.querySelector('#vchat-rodape');
  var elForm = painel.querySelector('#vchat-form');

  var ESTADO = { guia: null, cor: '#4338ca', historico: [], ocupado: false };

  /* ====== Funções de UI ====== */
  function addBolha(texto, tipo) {
    var b = document.createElement('div');
    b.className = 'vbolha ' + tipo;
    b.textContent = texto;
    elMsgs.appendChild(b);
    elMsgs.scrollTop = elMsgs.scrollHeight;
    return b;
  }
  function mostrarDots() {
    var d = document.createElement('div');
    d.className = 'vchat-dots';
    d.id = 'vchat-dots';
    d.innerHTML = '<span></span><span></span><span></span>';
    elMsgs.appendChild(d);
    elMsgs.scrollTop = elMsgs.scrollHeight;
  }
  function tirarDots() {
    var d = document.getElementById('vchat-dots');
    if (d) d.remove();
  }
  /* Oferece o livro como presente quando o limite do dia chega */
  function ofertarLivro() {
    if (document.getElementById('vchat-presente')) return; // evita duplicar
    var link = document.createElement('a');
    link.id = 'vchat-presente';
    link.className = 'vchat-presente';
    link.href = 'assets/VERA_livro_base.pdf';
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('download', '');
    link.textContent = '📖 Baixar o livro de VERA (grátis)';
    elMsgs.appendChild(link);
    elMsgs.scrollTop = elMsgs.scrollHeight;
  }

  function atualizarRodape() {
    var r = restantes();
    elRodape.textContent = r > 0
      ? r + ' de ' + LIMITE_DIARIO + ' mensagens restantes hoje · seu Guia aponta para a Rede, não a substitui'
      : 'Você conversou bastante hoje. O Guia volta amanhã. 🌌';
  }

  /* ====== Enviar mensagem ====== */
  function enviar(texto) {
    if (ESTADO.ocupado) return;
    if (restantes() <= 0) {
      addBolha('Você atingiu o limite de hoje. O Guia está descansando — volte amanhã. E lembre: as pessoas da sua vida são a sua Constelação. 🌌\n\nAntes de ir, leve o livro com você:', 'sistema');
      ofertarLivro();
      bloquear(true);
      return;
    }
    addBolha(texto, 'user');
    ESTADO.historico.push({ autor: 'user', texto: texto });
    registrarUso();
    atualizarRodape();
    bloquear(true);
    mostrarDots();

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guia: ESTADO.guia, mensagens: ESTADO.historico })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        tirarDots();
        var resp = d.texto || 'Fiquei sem palavras por um instante. Tenta de novo?';
        addBolha(resp, 'guia');
        ESTADO.historico.push({ autor: 'guia', texto: resp });
      })
      .catch(function () {
        tirarDots();
        addBolha('Tive um problema de conexão. Tenta de novo daqui a pouco.', 'sistema');
      })
      .finally(function () {
        if (restantes() > 0) {
          bloquear(false);
        } else {
          bloquear(true);
          atualizarRodape();
          addBolha('Por hoje é isso — conversamos bastante. O Guia vai descansar e te espera amanhã. Enquanto isso, leve o livro de VERA com você. 🌌', 'sistema');
          ofertarLivro();
        }
      });
  }

  function bloquear(b) {
    ESTADO.ocupado = b;
    elInput.disabled = b;
    elEnviar.disabled = b;
    if (!b) elInput.focus();
  }

  /* ====== Eventos ====== */
  elForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = elInput.value.trim();
    if (!t) return;
    elInput.value = '';
    elInput.style.height = 'auto';
    enviar(t);
  });
  elInput.addEventListener('input', function () {
    elInput.style.height = 'auto';
    elInput.style.height = Math.min(elInput.scrollHeight, 120) + 'px';
  });
  elInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      elForm.requestSubmit();
    }
  });
  painel.querySelector('#vchat-x').addEventListener('click', fechar);
  fundo.addEventListener('click', fechar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && painel.classList.contains('aberto')) fechar();
  });

  function fechar() {
    painel.classList.remove('aberto');
    fundo.classList.remove('aberto');
    document.body.classList.remove('modal-travado');
  }

  /* ====== API pública ====== */
  window.VERAChat = {
    abrir: function (guiaKey, dados) {
      ESTADO.guia = guiaKey;
      ESTADO.historico = [];
      ESTADO.cor = (dados && dados.cor) || '#4338ca';
      painel.querySelector('#vchat-nome').textContent = (dados && dados.nome) || 'Seu Guia';
      painel.querySelector('#vchat-nome').style.color = ESTADO.cor;
      painel.querySelector('#vchat-img').src = (dados && dados.img) || '';
      elEnviar.style.background = ESTADO.cor;
      elMsgs.innerHTML = '';

      var saud = SAUDACAO[guiaKey] || 'Oi. Estou aqui com você.';
      addBolha(saud, 'guia');
      ESTADO.historico.push({ autor: 'guia', texto: saud });

      if (restantes() <= 0) {
        addBolha('Você já conversou bastante hoje. O Guia está descansando — volte amanhã. Mas o livro de VERA fica com você: 🌌', 'sistema');
        ofertarLivro();
        bloquear(true);
      } else {
        bloquear(false);
      }
      atualizarRodape();

      fundo.classList.add('aberto');
      painel.classList.add('aberto');
      document.body.classList.add('modal-travado');
      setTimeout(function () { elInput.focus(); }, 350);
    }
  };
})();
