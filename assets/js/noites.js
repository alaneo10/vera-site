/* =====================================================================
   VERA — Sete noites de teste
   Gera, no próprio aparelho, um arquivo de agenda (.ics) com sete
   lembretes às 21h, a partir de hoje à noite. Sem servidor, sem cadastro.
   Os textos de cada noite vêm do próprio HTML (data-titulo / data-texto).
   ===================================================================== */
(function () {
  'use strict';
  var EN = (document.documentElement.lang || 'pt').slice(0, 2) === 'en';

  function dois(n) { return (n < 10 ? '0' : '') + n; }
  function carimbo(d) { return d.getFullYear() + dois(d.getMonth() + 1) + dois(d.getDate()) + 'T' + dois(d.getHours()) + dois(d.getMinutes()) + '00'; }
  function utc(d) { return d.getUTCFullYear() + dois(d.getUTCMonth() + 1) + dois(d.getUTCDate()) + 'T' + dois(d.getUTCHours()) + dois(d.getUTCMinutes()) + dois(d.getUTCSeconds()) + 'Z'; }
  function escapar(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function dobrar(linha) { /* linhas de no máximo 75 octetos, como pede o padrão */
    var out = [], atual = '';
    Array.from(linha).forEach(function (ch) {
      if (new TextEncoder().encode(atual + ch).length > 73) { out.push(atual); atual = ' ' + ch; } else atual += ch;
    });
    out.push(atual); return out.join('\r\n');
  }

  function iniciar() {
    var botao = document.getElementById('noites-agenda');
    if (!botao) return;
    botao.addEventListener('click', function () {
      var itens = document.querySelectorAll('[data-noite]');
      var agora = new Date(), inicio = new Date(agora); inicio.setHours(21, 0, 0, 0);
      if (inicio <= agora) inicio.setDate(inicio.getDate() + 1);
      var site = 'https://somosvera.com.br/' + (EN ? 'en/' : '');
      var linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//VERA//' + (EN ? 'Seven nights' : 'Sete noites') + '//' + (EN ? 'EN' : 'PT'), 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
      itens.forEach(function (li, i) {
        var d = new Date(inicio); d.setDate(inicio.getDate() + i);
        var resumo = 'VERA · ' + (EN ? 'Night ' : 'Noite ') + (i + 1) + (EN ? ' of 7 — ' : ' de 7 — ') + li.getAttribute('data-titulo');
        var descr = li.getAttribute('data-texto') + '\n\n' + (EN ? 'Test it. What survives is yours.' : 'Teste. O que sobreviver é seu.') + '\n' + site;
        linhas.push('BEGIN:VEVENT', 'UID:vera-' + Date.now() + '-' + i + '@somosvera.com.br', 'DTSTAMP:' + utc(agora),
          'DTSTART:' + carimbo(d), 'DURATION:PT15M', dobrar('SUMMARY:' + escapar(resumo)), dobrar('DESCRIPTION:' + escapar(descr)),
          'URL:' + site, 'BEGIN:VALARM', 'ACTION:DISPLAY', dobrar('DESCRIPTION:' + escapar(resumo)), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
      });
      linhas.push('END:VCALENDAR');
      var blob = new Blob([linhas.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = EN ? 'vera-seven-nights.ics' : 'vera-sete-noites.ics';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      var ok = document.getElementById('noites-ok');
      if (ok) ok.hidden = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
