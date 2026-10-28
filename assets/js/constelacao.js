/* =====================================================================
   VERA — Desenhe sua Constelação
   Cada nome vira uma estrela; cada estrela nova se liga à mais próxima.
   Você fica no centro do seu céu. Nada sai do aparelho: os nomes
   ficam só neste navegador, e a imagem é gerada aqui mesmo.
   ===================================================================== */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || 'pt').slice(0, 2) === 'en';
  var T = EN ? {
    voce: 'you', vazio: 'Your sky is still empty. Start with one name.',
    tituloPadrao: 'My Constellation', remover: 'Remove', limite: 'Fourteen stars is a full sky for one drawing.',
    convite1: 'Now choose one of these stars and tell them, today, what they are in your sky.',
    convite2: 'So many people go their whole lives without hearing it. Don’t wait.',
    nomeada: 'Named on ', rodape: 'somosvera.com.br · For real.', arquivo: 'my-constellation.png',
    partilha: 'This is my Constellation — the people who hold up my days. Draw yours at somosvera.com.br',
    ariaCarta: 'Drawing of your Constellation: ', ariaVazia: 'Empty star chart with you at the center.',
    estrelas: ' stars', data: 'en-US'
  } : {
    voce: 'você', vazio: 'Seu céu ainda está vazio. Comece por um nome.',
    tituloPadrao: 'Minha Constelação', remover: 'Remover', limite: 'Catorze estrelas já são um céu inteiro para um desenho.',
    convite1: 'Agora escolha uma dessas estrelas e diga a ela, hoje, o que ela é no seu céu.',
    convite2: 'Quase ninguém morre tendo ouvido isso. Não espere.',
    nomeada: 'Nomeada em ', rodape: 'somosvera.com.br · De verdade.', arquivo: 'minha-constelacao.png',
    partilha: 'Esta é a minha Constelação — as pessoas que sustentam os meus dias. Desenhe a sua em somosvera.com.br',
    ariaCarta: 'Desenho da sua Constelação: ', ariaVazia: 'Carta celeste vazia, com você no centro.',
    estrelas: ' estrelas', data: 'pt-BR'
  };
  var MAX = 14, CHAVE = 'vera_constelacao';

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function layout(nomes) {
    var pts = [{ x: 0, y: 0, b: 1.15, nome: T.voce, centro: true, pai: -1 }];
    nomes.forEach(function (n, i) {
      var h = hash(n.toLowerCase() + '·' + i);
      var ang = (i * 137.508 + (h % 44) - 22) * Math.PI / 180;
      var r = Math.min(0.84, 0.24 + 0.072 * Math.pow(i, 0.85) + ((h >> 8) % 100) / 1400);
      var p = { x: Math.cos(ang) * r, y: Math.sin(ang) * r, b: 0.75 + ((h >> 16) % 100) / 200, nome: n };
      var melhor = 0, dist = 1e9;
      pts.forEach(function (q, j) { var d = Math.hypot(q.x - p.x, q.y - p.y); if (d < dist) { dist = d; melhor = j; } });
      p.pai = melhor; pts.push(p);
    });
    return pts;
  }

  /* Desenha a carta celeste num contexto 2D, num quadrado de lado S com origem (ox, oy) */
  function desenharCarta(g, S, ox, oy, pts, progresso) {
    var cx = ox + S / 2, cy = oy + S / 2, R = S * 0.46;
    g.save();
    /* fundo da prancha */
    var fundo = g.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.05);
    fundo.addColorStop(0, 'rgba(36,32,98,0.55)'); fundo.addColorStop(1, 'rgba(10,9,32,0)');
    g.fillStyle = fundo; g.beginPath(); g.arc(cx, cy, R * 1.05, 0, 2 * Math.PI); g.fill();
    /* retícula */
    g.strokeStyle = 'rgba(160,165,255,0.13)'; g.lineWidth = Math.max(1, S / 900);
    [0.33, 0.66].forEach(function (k) { g.setLineDash([S / 300, S / 110]); g.beginPath(); g.arc(cx, cy, R * k, 0, 2 * Math.PI); g.stroke(); });
    g.setLineDash([]);
    for (var a = 0; a < 360; a += 30) {
      var rr = a * Math.PI / 180;
      g.beginPath(); g.moveTo(cx + Math.cos(rr) * R * 0.12, cy + Math.sin(rr) * R * 0.12); g.lineTo(cx + Math.cos(rr) * R, cy + Math.sin(rr) * R); g.stroke();
    }
    /* anel graduado */
    g.strokeStyle = 'rgba(242,179,61,0.45)';
    g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.stroke();
    g.beginPath(); g.arc(cx, cy, R * 1.035, 0, 2 * Math.PI); g.stroke();
    for (var t = 0; t < 360; t += 5) {
      var tr = t * Math.PI / 180, longo = t % 30 === 0 ? 0.035 : 0.018;
      g.beginPath(); g.moveTo(cx + Math.cos(tr) * R, cy + Math.sin(tr) * R);
      g.lineTo(cx + Math.cos(tr) * R * (1 + longo), cy + Math.sin(tr) * R * (1 + longo)); g.stroke();
    }
    function xy(p) { return [cx + p.x * R, cy + p.y * R]; }
    /* linhas */
    g.strokeStyle = 'rgba(242,179,61,0.75)'; g.lineWidth = Math.max(1, S / 520);
    pts.forEach(function (p, i) {
      if (p.pai < 0) return;
      var k = i === pts.length - 1 ? progresso : 1;
      var a1 = xy(pts[p.pai]), a2 = xy(p);
      g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a1[0] + (a2[0] - a1[0]) * k, a1[1] + (a2[1] - a1[1]) * k); g.stroke();
    });
    /* estrelas e nomes */
    pts.forEach(function (p, i) {
      var k = i === pts.length - 1 ? Math.max(0, (progresso - 0.55) / 0.45) : 1;
      if (k <= 0) return;
      var q = xy(p), r = S / 120 * p.b * (p.centro ? 1.1 : 1);
      var cor = p.centro ? '255,250,240' : '255,236,200';
      var halo = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], r * 5.5);
      halo.addColorStop(0, 'rgba(' + cor + ',' + (0.35 * k) + ')'); halo.addColorStop(1, 'rgba(' + cor + ',0)');
      g.fillStyle = halo; g.beginPath(); g.arc(q[0], q[1], r * 5.5, 0, 2 * Math.PI); g.fill();
      g.fillStyle = 'rgba(' + cor + ',' + k + ')';
      g.beginPath();
      if (p.centro) { /* a estrela de quatro pontas de VERA */
        var s = r * 2.4, m = r * 0.42;
        g.moveTo(q[0], q[1] - s); g.lineTo(q[0] + m, q[1] - m); g.lineTo(q[0] + s, q[1]); g.lineTo(q[0] + m, q[1] + m);
        g.lineTo(q[0], q[1] + s); g.lineTo(q[0] - m, q[1] + m); g.lineTo(q[0] - s, q[1]); g.lineTo(q[0] - m, q[1] - m); g.closePath();
      } else g.arc(q[0], q[1], r, 0, 2 * Math.PI);
      g.fill();
      /* rótulo, empurrado para fora do centro */
      var ang = Math.atan2(p.y, p.x), fora = p.centro ? 0 : 1;
      var lx = q[0] + (p.centro ? 0 : Math.cos(ang) * r * 3.2), ly = q[1] + (p.centro ? r * 4.4 : Math.sin(ang) * r * 3.2);
      g.font = (p.centro ? '500 ' : 'italic 500 ') + Math.round(S / (p.centro ? 44 : 30)) + 'px ' + (p.centro ? '"Hanken Grotesk", sans-serif' : '"Bodoni Moda", Georgia, serif');
      g.fillStyle = p.centro ? 'rgba(185,181,224,' + k + ')' : 'rgba(239,236,255,' + k + ')';
      g.textBaseline = 'middle';
      g.textAlign = p.centro ? 'center' : (Math.cos(ang) >= 0 ? 'left' : 'right');
      if (fora && Math.abs(Math.cos(ang)) < 0.35) { g.textAlign = 'center'; ly = q[1] + Math.sign(Math.sin(ang) || 1) * r * 3.6; }
      g.fillText(p.nome, lx, ly);
    });
    g.restore();
  }

  function iniciar() {
    var cv = document.getElementById('const-canvas');
    if (!cv) return;
    var inp = document.getElementById('const-nome'), form = document.getElementById('const-form');
    var lista = document.getElementById('const-lista'), titulo = document.getElementById('const-titulo');
    var baixar = document.getElementById('const-baixar'), partilhar = document.getElementById('const-compartilhar');
    var convite = document.getElementById('const-convite'), aviso = document.getElementById('const-aviso');
    var nomes = [];
    try { var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (salvo && salvo.n) { nomes = salvo.n.slice(0, MAX); if (salvo.t) titulo.value = salvo.t; } } catch (e) {}
    var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify({ n: nomes, t: titulo.value })); } catch (e) {} }

    function render(progresso) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), lado = cv.getBoundingClientRect().width || 520;
      cv.width = lado * dpr; cv.height = lado * dpr;
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, lado, lado);
      desenharCarta(g, lado, 0, 0, layout(nomes), progresso === undefined ? 1 : progresso);
      cv.setAttribute('aria-label', nomes.length ? T.ariaCarta + nomes.join(', ') + '.' : T.ariaVazia);
    }
    function animarNova() {
      if (reduzido) { render(1); return; }
      var t0 = performance.now();
      (function quadro(t) { var k = Math.min(1, (t - t0) / 900); render(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(quadro); })(t0);
    }
    function listar() {
      lista.innerHTML = '';
      if (!nomes.length) { var v = document.createElement('li'); v.className = 'estrelas-vazio'; v.style.border = 'none'; v.textContent = T.vazio; lista.appendChild(v); }
      nomes.forEach(function (n, i) {
        var li = document.createElement('li'); li.textContent = n;
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', T.remover + ' ' + n);
        b.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        b.addEventListener('click', function () { nomes.splice(i, 1); salvar(); listar(); render(1); });
        li.appendChild(b); lista.appendChild(li);
      });
      var tem = nomes.length > 0;
      baixar.disabled = !tem; if (partilhar) partilhar.disabled = !tem;
      convite.classList.toggle('visivel', tem);
      aviso.textContent = nomes.length >= MAX ? T.limite : '';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = inp.value.replace(/\s+/g, ' ').trim().slice(0, 24);
      if (!n || nomes.length >= MAX) return;
      nomes.push(n); inp.value = ''; salvar(); listar(); animarNova(); inp.focus();
    });
    titulo.addEventListener('input', salvar);

    function gerarImagem(cb) {
      var W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
      var g = c.getContext('2d');
      var fundo = g.createLinearGradient(0, 0, 0, H); fundo.addColorStop(0, '#120f36'); fundo.addColorStop(1, '#0a0920');
      g.fillStyle = fundo; g.fillRect(0, 0, W, H);
      /* poeira de fundo */
      var n = 2166136261; function r() { n = (n * 1664525 + 1013904223) % 4294967296; return n / 4294967296; }
      for (var i = 0; i < 420; i++) { g.fillStyle = 'rgba(220,225,255,' + (0.08 + r() * 0.4).toFixed(2) + ')'; g.beginPath(); g.arc(r() * W, r() * H, r() * 1.6 + 0.3, 0, 7); g.fill(); }
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillStyle = '#f2b33d'; g.font = '500 30px "Hanken Grotesk", sans-serif';
      g.fillText('V  E  R  A', W / 2, 150);
      var t = (titulo.value || T.tituloPadrao).trim();
      g.fillStyle = '#efecff'; g.font = 'italic 500 84px "Bodoni Moda", Georgia, serif';
      var palavras = t.split(' '), linhas = [], atual = '';
      palavras.forEach(function (p) { var teste = atual ? atual + ' ' + p : p; if (g.measureText(teste).width > W - 160 && atual) { linhas.push(atual); atual = p; } else atual = teste; });
      linhas.push(atual);
      linhas.slice(0, 3).forEach(function (l, k) { g.fillText(l, W / 2, 300 + k * 96); });
      desenharCarta(g, 980, 50, 520, layout(nomes), 1);
      g.fillStyle = '#b9b5e0'; g.font = 'italic 400 40px "Bodoni Moda", Georgia, serif';
      var pc = T.convite2.split(' '), lc = [], ac = '';
      pc.forEach(function (p) { var teste = ac ? ac + ' ' + p : p; if (g.measureText(teste).width > W - 200 && ac) { lc.push(ac); ac = p; } else ac = teste; });
      lc.push(ac);
      lc.forEach(function (l, k) { g.fillText(l, W / 2, 1640 - (lc.length - 1) * 54 + k * 54); });
      var hoje = new Intl.DateTimeFormat(T.data, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
      g.fillStyle = '#8b87bb'; g.font = '400 30px "Hanken Grotesk", sans-serif';
      g.fillText(T.nomeada + hoje, W / 2, 1760);
      g.fillStyle = '#f2b33d'; g.fillText(T.rodape, W / 2, 1810);
      c.toBlob(cb, 'image/png');
    }
    baixar.addEventListener('click', function () {
      gerarImagem(function (blob) {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = T.arquivo;
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      });
    });
    if (partilhar) {
      var podeArquivo = false;
      try { podeArquivo = !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })); } catch (e) {}
      if (!podeArquivo) partilhar.hidden = true;
      partilhar.addEventListener('click', function () {
        gerarImagem(function (blob) {
          var f = new File([blob], T.arquivo, { type: 'image/png' });
          navigator.share({ files: [f], text: T.partilha }).catch(function () {});
        });
      });
    }
    window.addEventListener('resize', function () { clearTimeout(cv._rz); cv._rz = setTimeout(function () { render(1); }, 150); });
    var go = function () { listar(); render(1); };
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('italic 500 20px "Bodoni Moda"'), document.fonts.load('500 20px "Hanken Grotesk"')]).then(go, go); else go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
