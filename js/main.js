(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('header');
  var progress = document.getElementById('progress');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var heroBg = document.getElementById('heroBg');

  /* Menu mobile */
  function closeNav(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
  burger.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNav(); });

  /* Scroll: header, progresso, parallax leve */
  var ticking = false;
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    progress.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    if(!reduce && heroBg && y < window.innerHeight){ heroBg.style.transform = 'translate3d(0,' + (y * .25) + 'px,0)'; }
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  /* Revelar elementos */
  var items = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
    items.forEach(function(el){ io.observe(el); });
  } else { items.forEach(function(el){ el.classList.add('in'); }); }

  /* Contadores */
  function count(el){
    var target = +el.dataset.count;
    if(reduce){ el.textContent = target; return; }
    var start = null, dur = 1400;
    (function step(t){
      if(!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if(p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var counters = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    var co = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ count(e.target); co.unobserve(e.target); } });
    }, {threshold:.6});
    counters.forEach(function(c){ co.observe(c); });
  } else { counters.forEach(count); }

  /* Link ativo no menu */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  var map = links.map(function(a){ return {a:a, s:document.querySelector(a.getAttribute('href'))}; }).filter(function(m){ return m.s; });
  if('IntersectionObserver' in window){
    var so = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          map.forEach(function(m){ m.a.classList.toggle('active', m.s === e.target); });
        }
      });
    }, {rootMargin:'-40% 0px -55% 0px'});
    map.forEach(function(m){ so.observe(m.s); });
  }

  /* Formulário demonstrativo: valida e abre WhatsApp com a mensagem pronta */
  var form = document.getElementById('form');
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var f = form.elements, ok = true;
    ['nome','tel'].forEach(function(n){
      var bad = !f[n].value.trim();
      f[n].classList.toggle('err', bad);
      if(bad) ok = false;
    });
    if(!ok){ msg.style.color = '#8a3b2a'; msg.textContent = 'Preencha nome e telefone para continuar.'; return; }
    var text = 'Olá! Gostaria de solicitar atendimento da REPRO+BOV.' +
      '\nNome: ' + f.nome.value.trim() +
      '\nTelefone: ' + f.tel.value.trim() +
      (f.mail.value.trim() ? '\nE-mail: ' + f.mail.value.trim() : '') +
      (f.fazenda.value.trim() ? '\nPropriedade/município: ' + f.fazenda.value.trim() : '') +
      '\nRebanho: ' + f.tipo.value +
      (f.msg.value.trim() ? '\nMensagem: ' + f.msg.value.trim() : '');
    msg.style.color = '';
    msg.textContent = 'Solicitação registrada! Abrindo o WhatsApp para finalizar o contato…';
    window.open('https://wa.me/5583987384549?text=' + encodeURIComponent(text), '_blank', 'noopener');
    form.reset();
  });
})();
