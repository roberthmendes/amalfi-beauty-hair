/* Amalfi Beauty Hair (Estoril, PT) — main.js
   Navegação móvel, estado do cabeçalho, link ativo, revelação no scroll e formulário de marcação via WhatsApp (pt-PT). */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('menu');
  var toggle = document.querySelector('.nav-toggle');
  var mobileQuery = window.matchMedia('(max-width: 63.99rem)');

  /* ---------- Navegação móvel ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
  }

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });
    mobileQuery.addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Sombra no cabeçalho ao fazer scroll ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Link ativo + revelação no scroll ---------- */
  if ('IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = byId[entry.target.id];
        if (!link) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Formulário de marcação (pt-PT) ---------- */
  var form = document.getElementById('booking-form');
  if (!form) return;

  var status = document.getElementById('booking-status');
  var resultBox = document.getElementById('booking-result');
  var waLink = document.getElementById('booking-wa');
  var dateInput = form.elements.data;

  function isoDate(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  if (dateInput) {
    dateInput.min = isoDate(new Date());
  }

  function parseDate(value) {
    var p = value.split('-');
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }

  var validators = {
    nome: function (v) { return v.trim().length >= 2; },
    telemovel: function (v) { return v.replace(/\D/g, '').length >= 9; },
    servico: function (v) { return v !== ''; },
    data: function (v) {
      var d = parseDate(v);
      if (!d || isNaN(d)) return false;
      return v >= dateInput.min;
    }
  };

  function validateField(name) {
    var field = form.elements[name];
    if (!field) return true;
    var ok = validators[name](field.value);
    var errId = field.dataset.errId;
    var error = errId ? document.getElementById(errId) : null;
    field.setAttribute('aria-invalid', String(!ok));
    if (!ok && errId) field.setAttribute('aria-describedby', errId);
    else field.removeAttribute('aria-describedby');
    field.closest('.field').classList.toggle('field--error', !ok);
    if (error) error.hidden = ok;
    return ok;
  }

  Object.keys(validators).forEach(function (name) {
    var field = form.elements[name];
    if (!field) return;
    var errId = field.getAttribute('aria-describedby');
    if (errId) {
      field.dataset.errId = errId;
      field.removeAttribute('aria-describedby');
    }
    field.addEventListener('blur', function () { if (field.value) validateField(name); });
    ['input', 'change'].forEach(function (evt) {
      field.addEventListener(evt, function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(name);
      });
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    Object.keys(validators).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    if (firstInvalid) {
      status.textContent = '';
      if (resultBox) resultBox.hidden = true;
      firstInvalid.focus();
      return;
    }

    var f = form.elements;
    var dataPt = f.data.value.split('-').reverse().join('/');
    var obs = f.observacoes ? f.observacoes.value.trim() : '';
    var message = 'Olá! Vi o vosso site e gostaria de marcar ' + f.servico.value +
      ' no Amalfi Beauty Hair. O meu nome é ' + f.nome.value.trim() + ' (' + f.telemovel.value.trim() +
      '), com preferência para o dia ' + dataPt + ' (' + f.periodo.value + ').' +
      (obs ? ' ' + obs : '');
    var waUrl = 'https://wa.me/351927098806?text=' + encodeURIComponent(message);

    if (waLink) waLink.href = waUrl;
    if (resultBox) resultBox.hidden = false;
    status.textContent = 'Mensagem pronta! A abrir o WhatsApp do Amalfi Beauty Hair...';
    window.open(waUrl, '_blank', 'noopener');
  });
})();
