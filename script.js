/* ============================================================
   CHIRIVO — script.js
   ------------------------------------------------------------
   Patru lucruri, în ordine:
   1. Preloader   — animația de întâmpinare + deblocarea scroll-ului
   2. Temă        — switch light/dark, salvat în localStorage
   3. Imagini     — fallback curat dacă poza încă nu e pusă în images/
   4. Formulare   — trimitere AJAX către Formspree + mesaj de succes
   ============================================================ */

(function () {
  'use strict';

  /* utilitar scurt, ca să nu repet document.querySelector peste tot */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* utilizatorul a cerut mai puțină mișcare? (sistem) */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ============================================================
     1. PRELOADER
     Fundal închis, iconița se desenează (CSS), apoi fade-out.
     Cât e vizibil, <body> are clasa .is-loading → fără scroll.
     ============================================================ */
  var preloader = $('#preloader');

  /* Durata totală: 0.7s (start bifă) + 0.4s (desenare) ≈ 1.1s,
     plus o mică pauză ca ochiul să prindă forma completă. */
  var DURATA_PRELOADER = 1300;

  function ascundePreloader() {
    if (!preloader) { return; }
    preloader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    /* îl scoatem complet din DOM după fade, ca să nu prindă focus */
    window.setTimeout(function () {
      if (preloader && preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    }, 600);
  }

  if (preloader) {
    if (reduceMotion) {
      /* fără animație: arătăm pagina direct */
      ascundePreloader();
    } else {
      document.body.classList.add('is-loading');
      window.setTimeout(ascundePreloader, DURATA_PRELOADER);
    }
  }


  /* ============================================================
     2. TEMA (light / dark)
     Tema inițială e aplicată deja de scriptul inline din <head>,
     ca să nu clipească pagina. Aici doar comutăm și salvăm.
     ============================================================ */
  var CHEIE_TEMA = 'chirivo-theme';
  var root       = document.documentElement;
  var btnTema    = $('#theme-toggle');

  function citesteTema() {
    try { return localStorage.getItem(CHEIE_TEMA); } catch (e) { return null; }
  }

  function salveazaTema(tema) {
    try { localStorage.setItem(CHEIE_TEMA, tema); } catch (e) { /* mod privat / storage blocat */ }
  }

  function aplicaTema(tema) {
    root.setAttribute('data-theme', tema);
    if (btnTema) {
      /* eticheta descrie ACȚIUNEA, nu starea curentă */
      btnTema.setAttribute(
        'aria-label',
        tema === 'dark' ? 'Comută pe tema deschisă' : 'Comută pe tema închisă'
      );
      btnTema.setAttribute('title', btnTema.getAttribute('aria-label'));
    }
  }

  /* sincronizăm eticheta butonului cu tema deja aplicată în <head> */
  aplicaTema(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (btnTema) {
    btnTema.addEventListener('click', function () {
      var noua = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      aplicaTema(noua);
      salveazaTema(noua);
    });
  }

  /* Dacă utilizatorul NU a ales manual o temă, urmărim setarea sistemului
     și în timp real (ex. macOS trece pe dark seara). */
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchimbareSistem = function (e) {
    if (!citesteTema()) { aplicaTema(e.matches ? 'dark' : 'light'); }
  };
  if (mqDark.addEventListener) {
    mqDark.addEventListener('change', onSchimbareSistem);
  } else if (mqDark.addListener) {
    mqDark.addListener(onSchimbareSistem);          /* Safari vechi */
  }


  /* ============================================================
     3. IMAGINI — fallback dacă fișierul lipsește
     Cât timp poza1.png / poza2.png nu sunt în images/, browserul
     ar arăta o iconiță de imagine ruptă. Marcăm cadrul cu .is-empty:
     rămâne doar fundalul din paletă + o etichetă discretă.
     Când pui pozele, totul revine automat la normal.
     ============================================================ */
  $$('.media-frame img').forEach(function (img) {
    var cadru = img.closest('.media-frame');
    if (!cadru) { return; }

    function marcheazaLipsa() {
      cadru.classList.add('is-empty');
      cadru.setAttribute('data-empty-label', 'Imagine în curând');
    }

    /* imaginea poate să fi eșuat deja, înainte să ruleze scriptul */
    if (img.complete && img.naturalWidth === 0) {
      marcheazaLipsa();
    }
    img.addEventListener('error', marcheazaLipsa);
    img.addEventListener('load', function () {
      cadru.classList.remove('is-empty');
      cadru.removeAttribute('data-empty-label');
    });
  });


  /* ============================================================
     4. FORMULARELE DE WAITLIST (Hero + final)
     Trimitem cu fetch către Formspree (Accept: application/json),
     ca pagina să nu se reîncarce. Dacă fetch nu e disponibil sau
     ID-ul nu e încă înlocuit, formularul rămâne funcțional clasic.
     ============================================================ */
  var TEXT_SUCCES = 'Mulțumim! Te anunțăm când e gata.';
  var TEXT_EROARE = 'Nu am putut trimite acum. Încearcă din nou sau scrie-ne la ChirivoRo@gmail.com.';
  var TEXT_EMAIL  = 'Introdu o adresă de email validă.';

  function arataMesaj(box, text, tip) {
    var msg = $('.signup__msg', box);
    if (!msg) { return; }
    msg.textContent = text;
    msg.classList.remove('signup__msg--ok', 'signup__msg--err');
    msg.classList.add(tip === 'ok' ? 'signup__msg--ok' : 'signup__msg--err');
    msg.hidden = false;
  }

  $$('[data-signup]').forEach(function (box) {
    var form  = $('.signup__form', box);
    var input = $('.signup__input', box);
    var nota  = $('.signup__note', box);
    if (!form || !input) { return; }

    var btn = $('button[type="submit"]', form);

    form.addEventListener('submit', function (ev) {
      /* validare proprie, ca să afișăm mesajul în română */
      if (!input.checkValidity()) {
        ev.preventDefault();
        input.classList.add('has-error');
        arataMesaj(box, TEXT_EMAIL, 'err');
        input.focus();
        return;
      }
      input.classList.remove('has-error');

      /* fără fetch (browser vechi) → lăsăm trimiterea normală,
         cu redirect spre pagina de mulțumire a Formspree */
      if (!window.fetch) { return; }

      ev.preventDefault();

      var textInitial = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Se trimite…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (raspuns) {
          if (!raspuns.ok) { throw new Error('Formspree a răspuns cu ' + raspuns.status); }

          /* succes: ascundem formularul și nota, arătăm confirmarea */
          form.hidden = true;
          if (nota) { nota.hidden = true; }
          arataMesaj(box, TEXT_SUCCES, 'ok');
        })
        .catch(function () {
          /* cea mai probabilă cauză cât timp e YOUR_FORM_ID: ID neconfigurat */
          arataMesaj(box, TEXT_EROARE, 'err');
          if (btn) { btn.disabled = false; btn.textContent = textInitial; }
        });
    });

    /* la re-tastare, curățăm starea de eroare */
    input.addEventListener('input', function () {
      input.classList.remove('has-error');
    });
  });


  /* ============================================================
     5. CONSIMȚĂMÂNT (GDPR) — casetă mică, o singură dată
     Apare după preloader, dacă utilizatorul n-a acceptat deja.
     Nu blochează pagina — doar informează.
     ============================================================ */
  var CHEIE_CONSIMTAMANT = 'chirivo-consent';
  var consimtamant        = $('#consent');
  var btnConsimtamant     = $('#consent-accept');

  function citesteConsimtamant() {
    try { return localStorage.getItem(CHEIE_CONSIMTAMANT); } catch (e) { return null; }
  }
  function salveazaConsimtamant() {
    try { localStorage.setItem(CHEIE_CONSIMTAMANT, 'acceptat'); } catch (e) { /* mod privat / storage blocat */ }
  }

  if (consimtamant && !citesteConsimtamant()) {
    var arataConsimtamant = function () {
      consimtamant.hidden = false;
      /* forțăm un reflow, ca tranziția CSS să pornească din starea inițială */
      void consimtamant.offsetWidth;
      consimtamant.classList.add('is-visible');
    };

    if (reduceMotion) {
      arataConsimtamant();
    } else {
      window.setTimeout(arataConsimtamant, DURATA_PRELOADER + 300);
    }

    if (btnConsimtamant) {
      btnConsimtamant.addEventListener('click', function () {
        consimtamant.classList.remove('is-visible');
        salveazaConsimtamant();
        window.setTimeout(function () { consimtamant.hidden = true; }, 350);
      });
    }
  }

})();
