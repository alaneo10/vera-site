/* =====================================================================
   VERA — o céu de verdade sobre quem visita
   Calcula a posição real de ~2.000 estrelas, das 88 constelações,
   do Sol e dos quatro Guias para o lugar e a hora do visitante,
   e desenha a cúpula celeste (projeção estereográfica, zênite ao centro).
   ===================================================================== */
(function () {
  'use strict';

  var RAD = Math.PI / 180;
  var EN = (document.documentElement.lang || 'pt').slice(0, 2) === 'en';

  /* ---------------- Astronomia ---------------- */
  var Astro = {
    jd: function (data) { return data.getTime() / 86400000 + 2440587.5; },
    tsl: function (data, lon) { /* tempo sideral local, em graus */
      var d = Astro.jd(data) - 2451545.0;
      var g = 280.46061837 + 360.98564736629 * d;
      return ((g + lon) % 360 + 360) % 360;
    },
    altaz: function (ra, dec, lat, tsl) {
      var H = (tsl - ra) * RAD, d = dec * RAD, f = lat * RAD;
      var sa = Math.sin(d) * Math.sin(f) + Math.cos(d) * Math.cos(f) * Math.cos(H);
      var alt = Math.asin(Math.max(-1, Math.min(1, sa)));
      var az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.sin(f) * Math.cos(H));
      return [alt / RAD, ((az / RAD) + 360) % 360];
    },
    sol: function (data) { /* posição aproximada do Sol (precisão de ~1°) */
      var n = Astro.jd(data) - 2451545.0;
      var L = (280.46 + 0.9856474 * n) % 360;
      var g = ((357.528 + 0.9856003 * n) % 360) * RAD;
      var lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
      var eps = (23.439 - 0.0000004 * n) * RAD;
      var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / RAD;
      var dec = Math.asin(Math.sin(eps) * Math.sin(lam)) / RAD;
      return [(ra + 360) % 360, dec];
    },
    galParaEq: function (l, b) { /* coordenadas galácticas -> equatoriais (J2000) */
      var ra0 = 192.85948 * RAD, de0 = 27.12825 * RAD, l0 = 122.93192 * RAD;
      l *= RAD; b *= RAD;
      var sd = Math.sin(b) * Math.sin(de0) + Math.cos(b) * Math.cos(de0) * Math.cos(l0 - l);
      var dec = Math.asin(sd);
      var y = Math.cos(b) * Math.sin(l0 - l);
      var x = Math.sin(b) * Math.cos(de0) - Math.cos(b) * Math.sin(de0) * Math.cos(l0 - l);
      var ra = ra0 + Math.atan2(y, x);
      return [((ra / RAD) + 360) % 360, dec / RAD];
    },
    corBV: function (bv) {
      if (bv < 0) return [179, 205, 255];
      if (bv < 0.3) return [222, 230, 255];
      if (bv < 0.6) return [250, 248, 255];
      if (bv < 1.0) return [255, 240, 212];
      if (bv < 1.4) return [255, 216, 170];
      return [255, 190, 140];
    }
  };
  window.VERA_ASTRO = Astro;

  /* ---------------- Lugar padrão pelo fuso horário ---------------- */
  var FUSOS = {
    'America/Sao_Paulo': [-23.55, -46.63, 'São Paulo'], 'America/Fortaleza': [-3.73, -38.52, 'Fortaleza'],
    'America/Recife': [-8.05, -34.9, 'Recife'], 'America/Bahia': [-12.97, -38.5, 'Salvador'],
    'America/Belem': [-1.46, -48.5, 'Belém'], 'America/Manaus': [-3.12, -60.02, 'Manaus'],
    'America/Cuiaba': [-15.6, -56.1, 'Cuiabá'], 'America/Campo_Grande': [-20.44, -54.65, 'Campo Grande'],
    'America/Porto_Velho': [-8.76, -63.9, 'Porto Velho'], 'America/Rio_Branco': [-9.97, -67.81, 'Rio Branco'],
    'America/Boa_Vista': [2.82, -60.67, 'Boa Vista'], 'America/Maceio': [-9.67, -35.74, 'Maceió'],
    'America/Araguaina': [-7.19, -48.2, 'Araguaína'], 'America/Santarem': [-2.44, -54.7, 'Santarém'],
    'America/Noronha': [-3.85, -32.42, 'Fernando de Noronha'],
    'America/New_York': [40.71, -74.0, 'New York'], 'America/Chicago': [41.88, -87.63, 'Chicago'],
    'America/Denver': [39.74, -104.99, 'Denver'], 'America/Phoenix': [33.45, -112.07, 'Phoenix'],
    'America/Los_Angeles': [34.05, -118.24, 'Los Angeles'], 'America/Anchorage': [61.2, -149.9, 'Anchorage'],
    'Pacific/Honolulu': [21.3, -157.86, 'Honolulu'], 'America/Toronto': [43.65, -79.38, 'Toronto'],
    'America/Vancouver': [49.28, -123.12, 'Vancouver'], 'Europe/London': [51.5, -0.13, 'London'],
    'Europe/Lisbon': [38.72, -9.14, 'Lisboa'], 'Europe/Dublin': [53.35, -6.26, 'Dublin'],
    'Europe/Paris': [48.86, 2.35, 'Paris'], 'Europe/Madrid': [40.42, -3.7, 'Madrid'],
    'Europe/Berlin': [52.52, 13.4, 'Berlin'], 'Europe/Rome': [41.9, 12.5, 'Roma'],
    'Australia/Sydney': [-33.87, 151.21, 'Sydney'], 'Asia/Tokyo': [35.68, 139.69, 'Tokyo'],
    'America/Mexico_City': [19.43, -99.13, 'Ciudad de México'], 'America/Argentina/Buenos_Aires': [-34.6, -58.38, 'Buenos Aires'],
    'America/Santiago': [-33.45, -70.67, 'Santiago'], 'America/Bogota': [4.71, -74.07, 'Bogotá'],
    'America/Lima': [-12.05, -77.04, 'Lima'], 'Africa/Luanda': [-8.84, 13.23, 'Luanda'], 'Africa/Maputo': [-25.97, 32.57, 'Maputo']
  };
  function lugarPadrao() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (FUSOS[tz]) return { lat: FUSOS[tz][0], lon: FUSOS[tz][1], nome: FUSOS[tz][2] };
    var lon = -new Date().getTimezoneOffset() / 4;
    return { lat: EN ? 38 : -15, lon: lon, nome: null };
  }

  /* ---------------- Textos ---------------- */
  var T = EN ? {
    agora: 'right now', hoje21: 'tonight at 9 p.m.', estrelas: 'stars above your horizon',
    dia: 'It’s daytime where you are. This is the sky that will be over you tonight at 9 p.m. The stars are there now too — the Sun just outshines them.',
    abaixo: 'below your horizon right now — it’s there anyway',
    usarLocal: 'Use my exact location', localUsado: 'your location', fusoAprox: 'your time zone (approx.)',
    negado: 'Location not shared — showing an approximate sky.',
    cruzeiro: 'Southern Cross', sol: 'Sun', polaris: 'Polaris', vega: 'Vega', antares: 'Antares',
    descr: 'Map of the real sky over '
  } : {
    agora: 'agora', hoje21: 'hoje às 21h', estrelas: 'estrelas acima do seu horizonte',
    dia: 'É dia aí agora. Este é o céu que vai estar sobre você hoje às 21h. As estrelas também estão lá agora — o Sol só as apaga com a luz dele.',
    abaixo: 'abaixo do seu horizonte agora — está lá mesmo assim',
    usarLocal: 'Usar minha localização exata', localUsado: 'sua localização', fusoAprox: 'seu fuso horário (aprox.)',
    negado: 'Localização não compartilhada — mostrando um céu aproximado.',
    cruzeiro: 'Cruzeiro do Sul', sol: 'Sol', polaris: 'Polaris', vega: 'Vega', antares: 'Antares',
    descr: 'Mapa do céu real sobre '
  };

  var GUIAS = [
    { id: 'polaris', ra: 37.9546, dec: 89.2641, cor: '#a3abff' },
    { id: 'vega', ra: 279.2347, dec: 38.7837, cor: '#b3cdff' },
    { id: 'antares', ra: 247.3519, dec: -26.4320, cor: '#f2804a' },
    { id: 'sol', ra: null, dec: null, cor: '#f2b33d' }
  ];

  /* ---------------- Gerador pseudoaleatório estável ---------------- */
  function semente(n) { return function () { n = (n * 1664525 + 1013904223) % 4294967296; return n / 4294967296; }; }

  /* ---------------- Desenho da cúpula ---------------- */
  function Cupula(canvas, legenda) {
    this.c = canvas; this.g = canvas.getContext('2d');
    this.leg = legenda;
    this.lugar = lugarPadrao();
    this.fonte = this.lugar.nome ? 'tz' : 'aprox';
    this.base = document.createElement('canvas');
    this.brilhantes = [];
    this.inicio = performance.now();
    this.reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var self = this;
    this.medir();
    window.addEventListener('resize', function () { clearTimeout(self._rz); self._rz = setTimeout(function () { self.medir(); self.renderizar(); }, 150); });
    this.renderizar();
    setInterval(function () { self.renderizar(); }, 60000);
    this.animar();
  }

  Cupula.prototype.medir = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = this.c.getBoundingClientRect();
    this.w = Math.max(320, r.width); this.h = Math.max(400, r.height); this.dpr = dpr;
    this.c.width = this.w * dpr; this.c.height = this.h * dpr;
    this.base.width = this.c.width; this.base.height = this.c.height;
    var movel = this.w < 760;
    this.R = movel ? Math.max(this.w * 0.95, this.h * 0.62) : Math.max(this.w * 0.56, this.h * 0.86);
    this.cx = movel ? this.w * 0.5 : this.w * 0.63;
    this.cy = movel ? this.h * 0.33 : this.h * 0.47;
  };

  Cupula.prototype.projetar = function (alt, az) {
    var z = (90 - alt) * RAD;
    var r = this.R * Math.tan(z / 2);
    return [this.cx - r * Math.sin(az * RAD), this.cy - r * Math.cos(az * RAD)];
  };

  Cupula.prototype.instante = function () {
    var agora = new Date();
    var s = Astro.sol(agora);
    var hs = Astro.altaz(s[0], s[1], this.lugar.lat, Astro.tsl(agora, this.lugar.lon))[0];
    this.dia = hs > -7;
    if (!this.dia) return agora;
    var noite = new Date(agora); noite.setHours(21, 0, 0, 0);
    if (noite < agora) noite.setDate(noite.getDate() + 1);
    return noite;
  };

  Cupula.prototype.renderizar = function () {
    var D = window.VERA_CEU; if (!D) return;
    var g = this.base.getContext('2d'), self = this, dpr = this.dpr;
    var data = this.instante();
    this.data = data;
    var tsl = Astro.tsl(data, this.lugar.lon), lat = this.lugar.lat;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    var esc = Math.pow(this.R / 760, 0.35);

    /* Via Láctea: faixa procedural ao longo do plano galáctico */
    var rnd = semente(7);
    g.globalCompositeOperation = 'lighter';
    for (var l = 0; l < 360; l += 1.2) {
      var forca = 0.35 + 0.65 * Math.pow(Math.cos((l / 2) * RAD), 2);
      for (var k = 0; k < 3; k++) {
        var gauss = (rnd() + rnd() + rnd() - 1.5) * 1.15;
        var b = gauss * (5 + 4 * forca);
        var eq = Astro.galParaEq(l + rnd() * 1.2, b);
        var aa = Astro.altaz(eq[0], eq[1], lat, tsl);
        if (aa[0] < -3) continue;
        var p = this.projetar(aa[0], aa[1]);
        var raio = this.R * (0.035 + rnd() * 0.04);
        var grd = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], raio);
        grd.addColorStop(0, 'rgba(150,160,255,' + (0.022 * forca) + ')');
        grd.addColorStop(1, 'rgba(150,160,255,0)');
        g.fillStyle = grd; g.beginPath(); g.arc(p[0], p[1], raio, 0, 2 * Math.PI); g.fill();
      }
    }
    g.globalCompositeOperation = 'source-over';

    /* Retícula: círculos de altitude e azimutes */
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(160,165,255,0.10)';
    [30, 60].forEach(function (a) {
      var r = self.R * Math.tan((90 - a) * RAD / 2);
      g.setLineDash([2, 6]); g.beginPath(); g.arc(self.cx, self.cy, r, 0, 2 * Math.PI); g.stroke();
    });
    g.setLineDash([]);
    for (var az = 0; az < 360; az += 30) {
      var a1 = this.projetar(84, az), a2 = this.projetar(0, az);
      g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke();
    }
    /* Horizonte e o que está abaixo dele */
    g.fillStyle = 'rgba(6,5,18,0.55)';
    g.beginPath(); g.rect(0, 0, this.w, this.h); g.arc(this.cx, this.cy, this.R, 0, 2 * Math.PI, true); g.fill('evenodd');
    g.strokeStyle = 'rgba(242,179,61,0.35)';
    g.beginPath(); g.arc(this.cx, this.cy, this.R, 0, 2 * Math.PI); g.stroke();
    for (var t = 0; t < 360; t += 5) {
      var dentro = this.projetar(t % 30 === 0 ? 2.4 : 1.1, t), fora = this.projetar(0, t);
      g.beginPath(); g.moveTo(dentro[0], dentro[1]); g.lineTo(fora[0], fora[1]); g.stroke();
    }
    var cardeais = EN ? ['N', 'E', 'S', 'W'] : ['N', 'L', 'S', 'O'];
    g.font = 'italic 500 ' + Math.round(15 * esc) + 'px "Bodoni Moda", Georgia, serif';
    g.fillStyle = 'rgba(242,179,61,0.75)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [0, 90, 180, 270].forEach(function (azc, i) {
      var p = self.projetar(4.2, azc);
      g.fillText(cardeais[i], p[0], p[1]);
    });

    /* Linhas das constelações */
    g.strokeStyle = 'rgba(242,179,61,0.30)'; g.lineWidth = 1;
    D.l.forEach(function (linha) {
      var ant = null;
      g.beginPath();
      linha.forEach(function (pt) {
        var aa = Astro.altaz(pt[0], pt[1], lat, tsl);
        var p = aa[0] > -1 ? self.projetar(aa[0], aa[1]) : null;
        if (p && ant) { g.moveTo(ant[0], ant[1]); g.lineTo(p[0], p[1]); }
        ant = p;
      });
      g.stroke();
    });

    /* Estrelas */
    var visiveis = 0; this.brilhantes = [];
    for (var i = D.s.length - 1; i >= 0; i--) {
      var s = D.s[i];
      var aa2 = Astro.altaz(s[0], s[1], lat, tsl);
      if (aa2[0] < 0) continue;
      visiveis++;
      var q = this.projetar(aa2[0], aa2[1]);
      var extincao = aa2[0] < 12 ? 0.35 + 0.65 * aa2[0] / 12 : 1;
      var raioE = Math.max(0.45, (2.9 - 0.47 * s[2])) * esc;
      var cor = Astro.corBV(s[3]);
      var alfa = Math.min(1, (0.25 + (5.4 - s[2]) / 4.2)) * extincao;
      if (s[2] < 1.6) {
        var halo = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], raioE * 6);
        halo.addColorStop(0, 'rgba(' + cor.join(',') + ',' + (0.28 * extincao) + ')');
        halo.addColorStop(1, 'rgba(' + cor.join(',') + ',0)');
        g.fillStyle = halo; g.beginPath(); g.arc(q[0], q[1], raioE * 6, 0, 2 * Math.PI); g.fill();
      }
      g.fillStyle = 'rgba(' + cor.join(',') + ',' + alfa.toFixed(3) + ')';
      g.beginPath(); g.arc(q[0], q[1], raioE, 0, 2 * Math.PI); g.fill();
      if (s[2] < 2.4 && this.brilhantes.length < 50) this.brilhantes.push([q[0], q[1], raioE, cor, i * 0.7]);
    }
    this.visiveis = visiveis;

    /* Cruzeiro do Sul */
    var ac = Astro.altaz(186.65, -63.1, lat, tsl);
    g.font = 'italic 400 ' + Math.round(14 * esc) + 'px "Bodoni Moda", Georgia, serif';
    if (ac[0] > 4) { var pc = this.projetar(ac[0], ac[1]); g.fillStyle = 'rgba(185,181,224,0.8)'; g.textAlign = 'left'; g.fillText(T.cruzeiro, pc[0] + 16 * esc, pc[1] + 18 * esc); }

    /* Os quatro Guias */
    var sol = Astro.sol(data);
    this.ausentes = [];
    GUIAS.forEach(function (gu) {
      var ra = gu.ra === null ? sol[0] : gu.ra, dec = gu.dec === null ? sol[1] : gu.dec;
      var a = Astro.altaz(ra, dec, lat, tsl);
      if (a[0] < 0) { self.ausentes.push(T[gu.id]); return; }
      var p = self.projetar(a[0], a[1]);
      g.strokeStyle = gu.cor; g.lineWidth = 1; g.globalAlpha = 0.85;
      g.beginPath(); g.arc(p[0], p[1], 11 * esc, 0, 2 * Math.PI); g.stroke();
      g.beginPath(); g.moveTo(p[0] + 11 * esc, p[1] - 11 * esc); g.lineTo(p[0] + 26 * esc, p[1] - 26 * esc); g.stroke();
      g.globalAlpha = 1;
      if (gu.id === 'sol') { g.fillStyle = gu.cor; g.beginPath(); g.arc(p[0], p[1], 5 * esc, 0, 2 * Math.PI); g.fill(); }
      g.font = 'italic 500 ' + Math.round(19 * esc) + 'px "Bodoni Moda", Georgia, serif';
      g.fillStyle = gu.cor; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.fillText(T[gu.id], p[0] + 30 * esc, p[1] - 28 * esc);
    });

    this.c.setAttribute('aria-label', T.descr + (this.lugar.nome || T.fusoAprox) + '.');
    this.atualizarLegenda();
    this.compor(1);
  };

  Cupula.prototype.atualizarLegenda = function () {
    if (!this.leg) return;
    var self = this;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat(EN ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(this.data);
    } catch (e) { fmt = this.data.toLocaleString(); }
    var nome = this.fonte === 'gps' ? T.localUsado : (this.lugar.nome || T.fusoAprox);
    var html = '<b>' + nome + '</b> · ' + fmt + (this.dia ? ' (' + T.hoje21 + ')' : '') + '<br>' +
      this.visiveis.toLocaleString(EN ? 'en-US' : 'pt-BR') + ' ' + T.estrelas;
    if (this.dia) html += '<span class="ausentes">' + T.dia + '</span>';
    else if (this.ausentes.length) html += '<span class="ausentes">' + this.ausentes.join(', ') + ' — ' + T.abaixo + '</span>';
    if (this.fonte !== 'gps' && navigator.geolocation) html += '<br><button type="button" id="ceu-gps">' + T.usarLocal + '</button>';
    this.leg.innerHTML = html;
    var b = document.getElementById('ceu-gps');
    if (b) b.addEventListener('click', function () {
      navigator.geolocation.getCurrentPosition(function (pos) {
        self.lugar = { lat: pos.coords.latitude, lon: pos.coords.longitude, nome: null };
        self.fonte = 'gps'; self.renderizar();
      }, function () { b.textContent = T.negado; b.disabled = true; }, { timeout: 10000, maximumAge: 600000 });
    });
  };

  /* Compõe a base no canvas visível e faz algumas estrelas cintilarem */
  Cupula.prototype.compor = function (tempo) {
    var g = this.g, dpr = this.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.c.width, this.c.height);
    var entrada = this.reduzido ? 1 : Math.min(1, (performance.now() - this.inicio) / 1600);
    g.globalAlpha = 1 - Math.pow(1 - entrada, 3);
    g.drawImage(this.base, 0, 0);
    g.globalAlpha = 1;
    if (this.reduzido) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'lighter';
    var t = tempo / 1000;
    for (var i = 0; i < this.brilhantes.length; i++) {
      var b = this.brilhantes[i];
      var cint = Math.max(0, Math.sin(t * 1.3 + b[4]) * Math.sin(t * 0.7 + b[4] * 1.7));
      if (cint < 0.05) continue;
      g.fillStyle = 'rgba(' + b[3].join(',') + ',' + (0.35 * cint).toFixed(3) + ')';
      g.beginPath(); g.arc(b[0], b[1], b[2] * 1.9, 0, 2 * Math.PI); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  };

  Cupula.prototype.animar = function () {
    var self = this, visivel = true, ultimo = 0;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; }).observe(this.c);
    }
    function quadro(t) {
      if (visivel && t - ultimo > 40) { self.compor(t); ultimo = t; }
      if (!self.reduzido) requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  };

  function iniciar() {
    var c = document.getElementById('ceu');
    if (!c || !window.VERA_CEU) return;
    var leg = document.getElementById('ceu-legenda');
    var go = function () { window.VERA_CUPULA = new Cupula(c, leg); };
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('italic 500 16px "Bodoni Moda"')]).then(go, go);
    } else go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
