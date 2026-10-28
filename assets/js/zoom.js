/* =====================================================================
   VERA — o zoom cósmico (Antares, capítulo 13 do livro)
   A rolagem controla a escala, em proporções reais: da preocupação na
   sua mão até o quintal de Antares, a 550 anos-luz. E depois, de volta.
   ===================================================================== */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || 'pt').slice(0, 2) === 'en';
  var AU = 1.496e11, LY = 9.4607e15;
  var T = EN ? {
    padrao: 'tomorrow’s meeting',
    largura: 'screen width',
    f: [
      [0.3, 'Hold it in your hand.'],
      [4, 'Rise with me. At the height of a plane, the building where the problem lives is the first thing to vanish.'],
      [7.6, 'In orbit, the whole Earth fits in the window — blue, with storms the size of countries.'],
      [10.2, 'From the Moon, the Earth is a marble your thumb can hide. Behind your thumb: every war, every empire, everyone you ever hurt and everyone who hurt you.'],
      [13.4, 'If Antares stood where the Sun is, it would swallow Mercury, Venus, Earth and Mars.'],
      [17, 'Antares’ light takes about 550 years to reach you.'],
      [99, 'From Antares’ backyard, your Sun is a faint dot that needs an instrument to be seen.']
    ],
    respire: 'Breathe up here.',
    desca: 'Now come back down. Cross the clouds, come in through the window, sit back down in your life.',
    fim: 'The problem is still there. But look at its size now. It hasn’t changed. The frame has.',
    terra: 'Earth', lua: 'Moon', sol: 'Sun', antares: 'Antares', antaresAqui: 'Antares, if it stood where the Sun is',
    marte: 'Mars', unid: { cm: 'cm', m: 'm', km: 'km', mil: 'thousand km', mi: 'million km', ua: 'AU', al: 'light-years' }, num: 'en-US'
  } : {
    padrao: 'a reunião de amanhã',
    largura: 'largura da tela',
    f: [
      [0.3, 'Segure isso na mão.'],
      [4, 'Suba comigo. Na altura do avião, o prédio onde o problema mora some primeiro.'],
      [7.6, 'Em órbita, a Terra inteira cabe na janela — azul, com tempestades do tamanho de países.'],
      [10.2, 'Da Lua, a Terra é uma bola de gude que o seu polegar esconde. Atrás dele: todas as guerras, todos os impérios, todos que você já magoou e que já te magoaram.'],
      [13.4, 'Se Antares estivesse no lugar do Sol, engoliria Mercúrio, Vênus, a Terra e Marte.'],
      [17, 'A luz de Antares leva uns 550 anos para chegar até você.'],
      [99, 'Do quintal de Antares, o seu Sol é um ponto fraco que precisa de instrumento para ser visto.']
    ],
    respire: 'Respire aqui em cima.',
    desca: 'Agora desça. Atravesse as nuvens, entre pela janela, sente de novo na sua vida.',
    fim: 'O problema continua lá. Mas repare no tamanho dele agora. Ele não mudou. A moldura mudou.',
    terra: 'Terra', lua: 'Lua', sol: 'Sol', antares: 'Antares', antaresAqui: 'Antares, se estivesse no lugar do Sol',
    marte: 'Marte', unid: { cm: 'cm', m: 'm', km: 'km', mil: 'mil km', mi: 'milhões de km', ua: 'UA', al: 'anos-luz' }, num: 'pt-BR'
  };

  var MIN = -0.55, MAX = 19.05; /* log10 da meia-largura da tela, em metros */
  function suave(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function mix(a, b, t) { return a + (b - a) * t; }

  /* Fases da rolagem: [início, fim] em fração do trecho */
  function estado(p) {
    if (p < 0.07) return { lg: MIN, fase: 'intro' };
    if (p < 0.56) return { lg: mix(MIN, MAX, suave((p - 0.07) / 0.49)), fase: 'sobe' };
    if (p < 0.64) return { lg: MAX, fase: 'topo' };
    if (p < 0.93) return { lg: mix(MAX, MIN, suave((p - 0.64) / 0.29)), fase: 'desce' };
    return { lg: MIN, fase: 'fim' };
  }

  function formatar(m) {
    var u = T.unid, n = function (v, d) { return v.toLocaleString(T.num, { maximumFractionDigits: d || 0 }); };
    if (m < 1) return n(m * 100) + ' ' + u.cm;
    if (m < 1000) return n(m) + ' ' + u.m;
    if (m < 1e6) return n(m / 1000) + ' ' + u.km;
    if (m < 1e9) return n(m / 1e6) + ' ' + u.mil;
    if (m < 0.2 * AU) return n(m / 1e9) + ' ' + u.mi;
    if (m < 0.3 * LY) return n(m / AU, 1) + ' ' + u.ua;
    return n(m / LY, m < 10 * LY ? 1 : 0) + ' ' + u.al;
  }

  function iniciar() {
    var sec = document.getElementById('zoom'); if (!sec) return;
    var cv = document.getElementById('zoom-canvas'), g = cv.getContext('2d');
    var intro = document.getElementById('zoom-intro'), entrada = document.getElementById('zoom-preocupacao');
    var frase = document.getElementById('zoom-frase'), escala = document.getElementById('zoom-escala'), ponto = document.getElementById('zoom-ponto');
    var W, H, dpr, pedido = false, fraseAtual = '';

    /* cena, em metros; origem = a preocupação, na superfície da Terra */
    var RT = 6.371e6, terra = [0, RT];
    var lua = [terra[0] + 3.844e8 * Math.cos(-0.6), terra[1] + 3.844e8 * Math.sin(-0.6)];
    var sol = [terra[0] - AU, terra[1]];
    var antares = [5.2e18 * Math.cos(-0.62), 5.2e18 * Math.sin(-0.62)];
    var poeira = []; var s = 99;
    for (var i = 0; i < 260; i++) { s = (s * 1664525 + 1013904223) % 4294967296; var a = s / 4294967296; s = (s * 1664525 + 1013904223) % 4294967296; var b = s / 4294967296; s = (s * 1664525 + 1013904223) % 4294967296; poeira.push([a, b, s / 4294967296]); }
    var luzes = []; s = 7;
    for (var j = 0; j < 420; j++) { s = (s * 1664525 + 1013904223) % 4294967296; var r = Math.pow(s / 4294967296, 0.6) * 14000; s = (s * 1664525 + 1013904223) % 4294967296; var ang = s / 4294967296 * Math.PI * 2; luzes.push([Math.cos(ang) * r, Math.sin(ang) * r * 0.55 - 30]); }

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rc = cv.getBoundingClientRect(); W = rc.width; H = rc.height;
      cv.width = W * dpr; cv.height = H * dpr;
    }

    function desenhar() {
      pedido = false;
      var rc = sec.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, -rc.top / Math.max(1, rc.height - window.innerHeight)));
      var e = estado(p), meia = Math.pow(10, e.lg), mpp = meia / (W / 2);
      var cx = W / 2, cy = H * 0.5;
      function tela(v) { return [cx + v[0] / mpp, cy + v[1] / mpp]; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      /* poeira estelar fixa ao fundo */
      var brilhoFundo = Math.min(1, Math.max(0.15, (e.lg - 4) / 6));
      poeira.forEach(function (q) { g.fillStyle = 'rgba(220,225,255,' + (0.1 + q[2] * 0.45) * brilhoFundo + ')'; g.fillRect(q[0] * W, q[1] * H, q[2] > 0.8 ? 1.6 : 1, q[2] > 0.8 ? 1.6 : 1); });

      /* órbitas do sistema solar */
      var ps = tela(sol);
      [0.387, 0.723, 1, 1.524, 5.2].forEach(function (k, idx) {
        var rr = k * AU / mpp; if (rr < 4 || rr > 40 * W) return;
        g.strokeStyle = idx === 2 ? 'rgba(160,165,255,0.35)' : 'rgba(160,165,255,0.16)'; g.lineWidth = 1;
        g.beginPath(); g.arc(ps[0], ps[1], rr, 0, 2 * Math.PI); g.stroke();
        if (idx === 3 && rr > 60 && rr < 3 * W) { g.fillStyle = 'rgba(185,181,224,0.7)'; g.font = 'italic 14px "Bodoni Moda", Georgia, serif'; g.textAlign = 'left'; g.fillText(T.marte, ps[0] + rr * 0.72 + 6, ps[1] - rr * 0.7); }
      });
      /* Antares no lugar do Sol (só na subida) */
      if (e.fase === 'sobe' && e.lg > 10.6 && e.lg < 13.8) {
        var k2 = Math.min(1, (e.lg - 10.6) / 0.9) * Math.min(1, (13.8 - e.lg) / 0.9);
        var ra = 3.16 * AU / mpp;
        var gr = g.createRadialGradient(ps[0], ps[1], ra * 0.2, ps[0], ps[1], ra);
        gr.addColorStop(0, 'rgba(242,128,74,' + 0.32 * k2 + ')'); gr.addColorStop(0.92, 'rgba(242,100,60,' + 0.2 * k2 + ')'); gr.addColorStop(1, 'rgba(242,100,60,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(ps[0], ps[1], ra, 0, 2 * Math.PI); g.fill();
        g.strokeStyle = 'rgba(242,128,74,' + 0.7 * k2 + ')'; g.beginPath(); g.arc(ps[0], ps[1], ra, 0, 2 * Math.PI); g.stroke();
        g.fillStyle = 'rgba(242,128,74,' + k2 + ')'; g.font = 'italic 500 17px "Bodoni Moda", Georgia, serif'; g.textAlign = 'center';
        g.fillText(T.antaresAqui, ps[0], ps[1] - ra - 14);
      }
      /* Sol */
      var rs = Math.max(2.5, 6.96e8 / mpp);
      if (ps[0] > -rs * 4 && ps[0] < W + rs * 4) {
        var hs = g.createRadialGradient(ps[0], ps[1], 0, ps[0], ps[1], rs * 4 + 10);
        hs.addColorStop(0, 'rgba(255,214,120,0.9)'); hs.addColorStop(0.25, 'rgba(242,179,61,0.45)'); hs.addColorStop(1, 'rgba(242,179,61,0)');
        g.fillStyle = hs; g.beginPath(); g.arc(ps[0], ps[1], rs * 4 + 10, 0, 2 * Math.PI); g.fill();
        g.fillStyle = '#ffe3a0'; g.beginPath(); g.arc(ps[0], ps[1], rs, 0, 2 * Math.PI); g.fill();
        if (e.lg > 10 && e.lg < 18.6) { g.fillStyle = 'rgba(242,179,61,0.95)'; g.font = 'italic 500 16px "Bodoni Moda", Georgia, serif'; g.textAlign = 'left'; g.fillText(T.sol, ps[0] + rs + 10, ps[1] + 22); }
      }
      /* Antares, lá longe */
      var pa = tela(antares);
      if (e.lg > 15.5) {
        var ka = Math.min(1, (e.lg - 15.5) / 1.2);
        var ha = g.createRadialGradient(pa[0], pa[1], 0, pa[0], pa[1], 26);
        ha.addColorStop(0, 'rgba(255,150,100,' + ka + ')'); ha.addColorStop(0.3, 'rgba(242,128,74,' + 0.5 * ka + ')'); ha.addColorStop(1, 'rgba(242,128,74,0)');
        g.fillStyle = ha; g.beginPath(); g.arc(pa[0], pa[1], 26, 0, 2 * Math.PI); g.fill();
        g.fillStyle = 'rgba(242,128,74,' + ka + ')'; g.font = 'italic 500 18px "Bodoni Moda", Georgia, serif'; g.textAlign = 'left'; g.fillText(T.antares, pa[0] + 18, pa[1] - 14);
      }
      /* órbita e Lua */
      var pt = tela(terra), rl = 3.844e8 / mpp;
      if (rl > 3 && rl < 30 * W) { g.strokeStyle = 'rgba(160,165,255,0.22)'; g.beginPath(); g.arc(pt[0], pt[1], rl, 0, 2 * Math.PI); g.stroke(); }
      var pl = tela(lua), rlu = Math.max(1.5, 1.737e6 / mpp);
      if (rl > 3 && rl < 30 * W) {
        g.fillStyle = '#d8d6e6'; g.beginPath(); g.arc(pl[0], pl[1], rlu, 0, 2 * Math.PI); g.fill();
        if (e.lg > 7.6 && e.lg < 10.6) { g.fillStyle = 'rgba(216,214,230,0.85)'; g.font = 'italic 15px "Bodoni Moda", Georgia, serif'; g.textAlign = 'left'; g.fillText(T.lua, pl[0] + rlu + 8, pl[1] + 4); }
      }
      /* Terra */
      var rt = RT / mpp;
      if (rt > 0.6 && rt < 60 * W) {
        var rtd = Math.max(1.6, rt);
        var gt = g.createRadialGradient(pt[0] - rtd * 0.35, pt[1] - rtd * 0.35, rtd * 0.1, pt[0], pt[1], rtd);
        gt.addColorStop(0, '#5f8dff'); gt.addColorStop(0.6, '#2f56c6'); gt.addColorStop(1, '#14286b');
        g.fillStyle = gt; g.beginPath(); g.arc(pt[0], pt[1], rtd, 0, 2 * Math.PI); g.fill();
        if (rtd > 30) { g.strokeStyle = 'rgba(150,190,255,0.35)'; g.lineWidth = Math.max(1, rtd * 0.02); g.beginPath(); g.arc(pt[0], pt[1], rtd + g.lineWidth, 0, 2 * Math.PI); g.stroke(); g.lineWidth = 1; }
        if (e.lg > 6.2 && e.lg < 9.6) { g.fillStyle = 'rgba(179,205,255,0.9)'; g.font = 'italic 15px "Bodoni Moda", Georgia, serif'; g.textAlign = 'left'; g.fillText(T.terra, pt[0] + rtd + 10, pt[1] - rtd * 0.2); }
      } else if (rt <= 0.6 && e.lg < 12.5) { g.fillStyle = '#7fa6ff'; g.beginPath(); g.arc(pt[0], pt[1], 1.6, 0, 2 * Math.PI); g.fill(); }
      /* luzes da cidade */
      if (e.lg > 1.6 && e.lg < 6.6) {
        var kc = Math.min(1, (e.lg - 1.6) / 0.8) * Math.min(1, (6.6 - e.lg) / 0.9);
        luzes.forEach(function (q) { var v = tela(q); g.fillStyle = 'rgba(255,214,140,' + 0.55 * kc + ')'; g.fillRect(v[0], v[1], 1.4, 1.4); });
      }
      /* a preocupação */
      var texto = (entrada.value || T.padrao).trim().slice(0, 60);
      var altura = 0.045 / mpp;
      if (altura > 2) {
        g.font = 'italic 500 ' + Math.min(altura, 400) + 'px "Bodoni Moda", Georgia, serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#efecff';
        g.globalAlpha = e.fase === 'intro' ? 0.1 : 1;
        g.fillText(texto, cx, cy);
        g.globalAlpha = 1;
        g.textBaseline = 'alphabetic';
      } else if (e.lg < 4.5) { g.fillStyle = '#efecff'; g.beginPath(); g.arc(cx, cy, 1.4, 0, 2 * Math.PI); g.fill(); }

      /* legendas */
      intro.style.opacity = e.fase === 'intro' ? 1 : 0;
      intro.style.visibility = e.fase === 'intro' ? 'visible' : 'hidden';
      var nova = '';
      if (e.fase === 'sobe') { for (var f = 0; f < T.f.length; f++) { if (e.lg < T.f[f][0]) { nova = T.f[f][1]; break; } } }
      else if (e.fase === 'topo') nova = T.respire;
      else if (e.fase === 'desce') nova = e.lg > 4 ? T.desca : '';
      else if (e.fase === 'fim') nova = T.fim;
      if (nova !== fraseAtual) {
        fraseAtual = nova; frase.style.opacity = 0;
        setTimeout(function () { frase.textContent = fraseAtual; frase.style.opacity = fraseAtual ? 1 : 0; }, 180);
      }
      escala.innerHTML = e.fase === 'intro' ? '' : '<b>' + formatar(meia * 2) + '</b>' + T.largura;
      ponto.style.top = (100 * (e.lg - MIN) / (MAX - MIN)) + '%';
    }
    function pedir() { if (!pedido) { pedido = true; requestAnimationFrame(desenhar); } }
    medir();
    window.addEventListener('resize', function () { medir(); pedir(); });
    window.addEventListener('scroll', pedir, { passive: true });
    entrada.addEventListener('input', pedir);
    entrada.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' }); }
    });
    var go = function () { pedir(); };
    if (document.fonts && document.fonts.load) document.fonts.load('italic 500 20px "Bodoni Moda"').then(go, go); else go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
