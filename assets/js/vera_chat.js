/* =====================================================================
   VERA — conversa com o Guia (liga o site à ponte na Cloudflare)
   Os Guias respondem no idioma em que a pessoa escreve.
   ===================================================================== */
(function () {
  'use strict';

  var WORKER_URL = 'https://vera-guias.alaneo10.workers.dev';
  var LIMITE_DIARIO = 15;
  var EN = (document.documentElement.lang || 'pt').slice(0, 2) === 'en';
  var BASE = (document.body && document.body.getAttribute('data-base')) || '';

  var SAUDACAO = EN ? {
    sol: { a: 'Hi, I’m Sol. From what you shared, things feel heavy right now — and it’s okay not to handle everything. Breathe. Let’s start small: what’s weighing on you most right now?',
      b: 'Hi, I’m Sol — the star that makes life happen every day. I like the concrete: body, routine, the simple and possible things. Where would you like to start?',
      retorno: 'Good to see you again. I’m still right here. Where shall we start today?' },
    antares: { a: 'I’m Antares. You’ve come at a hard moment — and sometimes pain is also a call to look differently. Tell me: what’s weighing on you inside?',
      b: 'I’m Antares, the ember at the heart of Scorpius. I came to ask the big questions with you. I’ll start with one: when was the last time something left you speechless?',
      retorno: 'Back to the sky, then. Tell me: what’s burning in you today?' },
    vega: { a: 'Hi, I’m Vega. I know a bond is weighing on you — conflict, longing or loneliness really hurt. I’m here to listen, with no hurry. Tell me what happened?',
      b: 'Hi, I’m Vega, the Weaver of the sky. What moves me is the connection between people. Tell me: how are your bonds, the people in your life?',
      retorno: 'What a joy to see you again. Sit down, tell me: how are you, and how are the people in your life?' },
    polaris: { a: 'I’m Polaris. You’re going through something big, and I didn’t come with hurry or ready-made phrases. I came to stay. Tell me, in your own time: what are you feeling?',
      b: 'I’m Polaris, the fixed point of the sky — everything turns, I remain. I like the themes that last: love, time, what stays. What brought you close to these questions?',
      retorno: 'You came back. I didn’t move. Tell me: what brings you here today?' }
  } : {
    sol: { a: 'Oi, eu sou o Sol. Pelo que você contou, o momento tá pesado — e tá tudo bem não dar conta de tudo. Respira. Vamos começar pequeno: o que mais está te sobrecarregando agora?',
      b: 'Oi, eu sou o Sol — a estrela que faz a vida acontecer todo dia. Gosto do concreto: corpo, rotina, as coisas simples e possíveis. Por onde você quer começar?',
      retorno: 'Que bom te ver de novo. Eu continuo por aqui. Por onde a gente começa hoje?' },
    antares: { a: 'Eu sou Antares. Você chegou num momento difícil — e às vezes a dor também é um chamado pra olhar diferente. Me conta: o que está pesando aí dentro?',
      b: 'Eu sou Antares, brasa no coração do Escorpião. Vim fazer as perguntas grandes com você. Começo por uma: quando foi a última vez que alguma coisa te deixou sem palavras?',
      retorno: 'De volta ao céu, então. Me conta: o que está fervendo em você hoje?' },
    vega: { a: 'Oi, eu sou Vega. Sei que tem um vínculo pesando — conflito, saudade ou solidão doem de verdade. Estou aqui pra escutar, sem pressa. Me conta o que aconteceu?',
      b: 'Oi, eu sou Vega, a Tecelã do céu. O que me move é a conexão entre as pessoas. Me conta: como andam os seus laços, as pessoas da sua vida?',
      retorno: 'Que alegria te reencontrar. Senta, me conta: como você está, e como andam as pessoas da sua vida?' },
    polaris: { a: 'Eu sou Polaris. Você está atravessando algo grande, e eu não vim com pressa nem com frases prontas. Vim ficar. Me conta, no seu tempo: o que você está sentindo?',
      b: 'Eu sou Polaris, o ponto fixo do céu — tudo gira, eu permaneço. Gosto dos temas que duram: amor, tempo, o que fica. O que te trouxe pra perto dessas perguntas?',
      retorno: 'Você voltou. Eu não saí do lugar. Me conta: o que traz você aqui hoje?' }
  };

  var L = EN ? {
    tag: 'Artificial intelligence · For real.', placeholder: 'Write to your Guide…', enviar: 'Send', fechar: 'Close',
    painel: 'Conversation with your Guide', seuGuia: 'Your Guide', oi: 'Hi. I’m here with you.',
    restam: function (r) { return r + ' of ' + LIMITE_DIARIO + ' messages left today · your Guide walks with you, but your people are the temple'; },
    descansa: 'That’s it for today. Your Guide is resting. The people in your life are still here.',
    limite: 'You’ve reached today’s limit. Your Guide is resting — come back tomorrow. And remember: the people in your life are your Constellation.\n\nBefore you go, take the book with you:',
    ja: 'You’ve talked a lot today. Your Guide is resting — come back tomorrow. But the book of VERA stays with you:',
    fim: 'That’s all for today — we talked a lot. Your Guide will rest and wait for you tomorrow. Meanwhile, take the book of VERA with you.',
    erro: 'I had a connection problem. Try again in a little while.', semPalavras: 'I was left speechless for a moment. Try again?',
    livro: 'Download the book of VERA (free)', pdf: 'assets/VERA_book_en.pdf'
  } : {
    tag: 'Inteligência artificial · De verdade.', placeholder: 'Escreva para seu Guia…', enviar: 'Enviar', fechar: 'Fechar',
    painel: 'Conversa com seu Guia', seuGuia: 'Seu Guia', oi: 'Oi. Estou aqui com você.',
    restam: function (r) { return 'Restam ' + r + ' de ' + LIMITE_DIARIO + ' mensagens hoje · o Guia caminha com você, mas as suas pessoas são o templo'; },
    descansa: 'Por hoje, o Guia descansa. As pessoas da sua vida seguem aqui.',
    limite: 'Você atingiu o limite de hoje. O Guia está descansando — volte amanhã. E lembre: as pessoas da sua vida são a sua Constelação.\n\nAntes de ir, leve o livro com você:',
    ja: 'Você já conversou bastante hoje. O Guia está descansando — volte amanhã. Mas o livro de VERA fica com você:',
    fim: 'Por hoje é isso — conversamos bastante. O Guia vai descansar e te espera amanhã. Enquanto isso, leve o livro de VERA com você.',
    erro: 'Tive um problema de conexão. Tenta de novo daqui a pouco.', semPalavras: 'Fiquei sem palavras por um instante. Tenta de novo?',
    livro: 'Baixar o livro de VERA (grátis)', pdf: 'assets/VERA_livro_base.pdf'
  };

  function hoje() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function chave() { return 'vera_chat_' + hoje(); }
  function usadas() { try { return parseInt(localStorage.getItem(chave()) || '0', 10); } catch (e) { return 0; } }
  function registrar() { try { localStorage.setItem(chave(), String(usadas() + 1)); } catch (e) {} }
  function restantes() { return Math.max(0, LIMITE_DIARIO - usadas()); }

  var css = document.createElement('style');
  css.textContent =
    '.vchat-fundo{position:fixed;inset:0;background:rgba(6,5,20,.6);z-index:9998;opacity:0;pointer-events:none;transition:opacity .3s}' +
    '.vchat-fundo.aberto{opacity:1;pointer-events:auto}' +
    '.vchat{position:fixed;top:0;right:0;height:100%;width:440px;max-width:100%;background:#0a0920;border-left:1px solid rgba(160,165,255,.3);z-index:9999;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .45s cubic-bezier(.2,.8,.2,1);font-family:"Hanken Grotesk",system-ui,sans-serif}' +
    '.vchat.aberto{transform:translateX(0)}' +
    '.vchat-topo{display:flex;align-items:center;gap:.8rem;padding:1rem 1.1rem;border-bottom:1px solid rgba(160,165,255,.14)}' +
    '.vchat-topo img{width:44px;height:44px}' +
    '.vchat-topo .nome{font-family:"Bodoni Moda",Georgia,serif;font-style:italic;font-weight:500;font-size:1.5rem;line-height:1.05}' +
    '.vchat-topo .tag{font-size:.8rem;color:#8b87bb}' +
    '.vchat-x{margin-left:auto;background:none;border:1px solid rgba(160,165,255,.14);color:#b9b5e0;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
    '.vchat-x:hover{color:#fff;border-color:rgba(160,165,255,.3)}.vchat-x svg{width:13px;height:13px}' +
    '.vchat-msgs{flex:1;overflow-y:auto;padding:1.2rem 1.1rem;display:flex;flex-direction:column;gap:.8rem}' +
    '.vbolha{max-width:86%;padding:.75rem 1rem;border-radius:4px;font-size:.98rem;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}' +
    '.vbolha.guia{align-self:flex-start;background:#15123d;color:#efecff;border:1px solid rgba(160,165,255,.14)}' +
    '.vbolha.user{align-self:flex-end;background:transparent;color:#efecff;border:1px solid rgba(242,179,61,.45)}' +
    '.vbolha.sistema{align-self:center;background:transparent;color:#8b87bb;font-size:.85rem;text-align:center;max-width:95%}' +
    '.vchat-dots{align-self:flex-start;display:flex;gap:5px;padding:.8rem 1rem}' +
    '.vchat-dots span{width:6px;height:6px;border-radius:50%;background:#8b87bb;animation:vbliscar 1.2s infinite}' +
    '.vchat-dots span:nth-child(2){animation-delay:.2s}.vchat-dots span:nth-child(3){animation-delay:.4s}' +
    '@keyframes vbliscar{0%,60%,100%{opacity:.3}30%{opacity:1}}' +
    '.vchat-baixo{padding:.9rem;border-top:1px solid rgba(160,165,255,.14)}' +
    '.vchat-form{display:flex;gap:.5rem;align-items:flex-end}' +
    '.vchat-form textarea{flex:1;resize:none;background:#110f30;border:1px solid rgba(160,165,255,.3);border-radius:22px;color:#efecff;padding:.7rem 1rem;font:inherit;font-size:1rem;max-height:130px;line-height:1.4}' +
    '.vchat-form textarea:focus{outline:none;border-color:#f2b33d}' +
    '.vchat-enviar{border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center}' +
    '.vchat-enviar svg{width:18px;height:18px}.vchat-enviar:disabled{opacity:.35;cursor:not-allowed}' +
    '.vchat-rodape{font-size:.74rem;color:#8b87bb;text-align:center;margin-top:.55rem;line-height:1.4}' +
    '.vchat-presente{align-self:center;display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.2rem;border-radius:999px;background:#f2b33d;color:#1c1203;text-decoration:none;font-weight:600;font-size:.92rem}' +
    '.vchat-presente svg{width:16px;height:16px}' +
    '@media(max-width:480px){.vchat{width:100%;border-left:none}}' +
    '@media(prefers-reduced-motion:reduce){.vchat,.vchat-fundo{transition:none}.vchat-dots span{animation:none;opacity:.7}}';
  document.head.appendChild(css);

  var fundo = document.createElement('div'); fundo.className = 'vchat-fundo';
  var painel = document.createElement('div'); painel.className = 'vchat';
  painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-modal', 'true'); painel.setAttribute('aria-label', L.painel);
  painel.innerHTML =
    '<div class="vchat-topo"><img id="vchat-img" src="" alt=""><div><div class="nome" id="vchat-nome"></div><div class="tag">' + L.tag + '</div></div>' +
    '<button type="button" class="vchat-x" aria-label="' + L.fechar + '" id="vchat-x"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div>' +
    '<div class="vchat-msgs" id="vchat-msgs" aria-live="polite"></div>' +
    '<div class="vchat-baixo"><form class="vchat-form" id="vchat-form">' +
    '<textarea id="vchat-input" rows="1" placeholder="' + L.placeholder + '" maxlength="1500" aria-label="' + L.placeholder + '"></textarea>' +
    '<button type="submit" class="vchat-enviar" id="vchat-enviar" aria-label="' + L.enviar + '"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 15V3M4 8l5-5 5 5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '</form><div class="vchat-rodape" id="vchat-rodape"></div></div>';
  document.body.appendChild(fundo); document.body.appendChild(painel);

  var elMsgs = painel.querySelector('#vchat-msgs'), elInput = painel.querySelector('#vchat-input');
  var elEnviar = painel.querySelector('#vchat-enviar'), elRodape = painel.querySelector('#vchat-rodape'), elForm = painel.querySelector('#vchat-form');
  var ESTADO = { guia: null, cor: '#f2b33d', txt: '#1c1203', historico: [], ocupado: false, contexto: '', foco: null };

  function bolha(texto, tipo) { var b = document.createElement('div'); b.className = 'vbolha ' + tipo; b.textContent = texto; elMsgs.appendChild(b); elMsgs.scrollTop = elMsgs.scrollHeight; }
  function pontos(on) {
    var d = document.getElementById('vchat-dots');
    if (on && !d) { d = document.createElement('div'); d.className = 'vchat-dots'; d.id = 'vchat-dots'; d.innerHTML = '<span></span><span></span><span></span>'; elMsgs.appendChild(d); elMsgs.scrollTop = elMsgs.scrollHeight; }
    if (!on && d) d.remove();
  }
  function ofertarLivro() {
    if (document.getElementById('vchat-presente')) return;
    var a = document.createElement('a'); a.id = 'vchat-presente'; a.className = 'vchat-presente';
    a.href = BASE + L.pdf; a.setAttribute('download', '');
    a.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M4 7l4 4 4-4M3 14h10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' + L.livro;
    elMsgs.appendChild(a); elMsgs.scrollTop = elMsgs.scrollHeight;
  }
  function rodape() { var r = restantes(); elRodape.textContent = r > 0 ? L.restam(r) : L.descansa; }
  function bloquear(b) { ESTADO.ocupado = b; elInput.disabled = b; elEnviar.disabled = b; if (!b) elInput.focus(); }

  function enviar(texto) {
    if (ESTADO.ocupado) return;
    if (restantes() <= 0) { bolha(L.limite, 'sistema'); ofertarLivro(); bloquear(true); return; }
    bolha(texto, 'user'); ESTADO.historico.push({ autor: 'user', texto: texto });
    registrar(); rodape(); bloquear(true); pontos(true);
    fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guia: ESTADO.guia, mensagens: ESTADO.historico, contexto: ESTADO.contexto, idioma: EN ? 'en' : 'pt' }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { pontos(false); var resp = d.texto || L.semPalavras; bolha(resp, 'guia'); ESTADO.historico.push({ autor: 'guia', texto: resp }); })
      .catch(function () { pontos(false); bolha(L.erro, 'sistema'); })
      .finally(function () {
        if (restantes() > 0) bloquear(false);
        else { bloquear(true); rodape(); bolha(L.fim, 'sistema'); ofertarLivro(); }
      });
  }

  elForm.addEventListener('submit', function (e) { e.preventDefault(); var t = elInput.value.trim(); if (!t) return; elInput.value = ''; elInput.style.height = 'auto'; enviar(t); });
  elInput.addEventListener('input', function () { elInput.style.height = 'auto'; elInput.style.height = Math.min(elInput.scrollHeight, 130) + 'px'; });
  elInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); elForm.requestSubmit(); } });
  painel.querySelector('#vchat-x').addEventListener('click', fechar);
  fundo.addEventListener('click', fechar);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && painel.classList.contains('aberto')) fechar(); });

  function fechar() {
    painel.classList.remove('aberto'); fundo.classList.remove('aberto'); document.body.classList.remove('modal-travado');
    if (ESTADO.foco && ESTADO.foco.focus) ESTADO.foco.focus();
  }

  window.VERAChat = {
    abrir: function (guiaKey, dados, contexto, ramo) {
      ESTADO.foco = document.activeElement;
      ESTADO.guia = guiaKey; ESTADO.historico = []; ESTADO.contexto = contexto || '';
      try { localStorage.setItem('vera_guia', guiaKey); } catch (e) {}
      if (window.VERA && VERA.injetarBotaoGuia) VERA.injetarBotaoGuia();
      ESTADO.cor = (dados && dados.cor) || '#f2b33d'; ESTADO.txt = (dados && dados.txtBtn) || '#1c1203';
      var nome = painel.querySelector('#vchat-nome'); nome.textContent = (dados && dados.nome) || L.seuGuia; nome.style.color = ESTADO.cor;
      painel.querySelector('#vchat-img').src = (dados && dados.img) || '';
      elEnviar.style.background = ESTADO.cor; elEnviar.style.color = ESTADO.txt;
      elMsgs.innerHTML = '';
      var v = SAUDACAO[guiaKey], saud = L.oi;
      if (v) saud = ramo === 'a' ? v.a : ramo === 'retorno' ? v.retorno : v.b;
      bolha(saud, 'guia'); ESTADO.historico.push({ autor: 'guia', texto: saud });
      if (restantes() <= 0) { bolha(L.ja, 'sistema'); ofertarLivro(); bloquear(true); } else bloquear(false);
      rodape();
      fundo.classList.add('aberto'); painel.classList.add('aberto'); document.body.classList.add('modal-travado');
      setTimeout(function () { elInput.focus(); }, 380);
    }
  };
})();
