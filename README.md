# Chirivo — landing page

Pagină statică de prezentare pentru Chirivo, cu formular de waitlist.
HTML + CSS + JavaScript simplu, fără framework-uri și fără build tools.

## Fișiere

```
index.html      — structura paginii (toate textele sunt aici)
style.css       — stiluri, temele light/dark, breakpoints
script.js       — preloader, switch temă, fallback poze, trimitere formular
favicon.svg     — iconița brandului pe pătrat albastru
images/         — aici pui poza1.png și poza2.png (vezi images/README.md)
```

## Ce trebuie să faci înainte de publicare

### 1. Formularul (obligatoriu — altfel nu ajung emailurile nicăieri)

1. Fă-ți cont gratuit pe [formspree.io](https://formspree.io) (50 trimiteri/lună).
2. Creează un formular nou și copiază ID-ul lui (arată ca `xayzbwqr`).
3. În `index.html`, înlocuiește `YOUR_FORM_ID` cu ID-ul tău. **Apare de două ori** —
   o dată în formularul din Hero, o dată în cel din secțiunea finală:

```bash
grep -n YOUR_FORM_ID index.html
```

Până înlocuiești ID-ul, formularul afișează corect mesajul de eroare
(„Nu am putut trimite acum…”) — nu se strică pagina.

### 2. Pozele

Pune `poza1.png` și `poza2.png` în `images/`. Detalii despre dimensiuni și
subiect în `images/README.md`. Cât timp lipsesc, cadrele rămân colorate discret,
cu eticheta „Imagine în curând” — pagina nu se strică.

### 3. Linkurile de social media

În `footer`, cele trei linkuri au `href="#"` și un comentariu `<!-- TODO: link ... -->`.
Pune adresele reale de Instagram, TikTok și Facebook.

## Publicare pe GitHub Pages

```bash
git init
git add .
git commit -m "Landing page Chirivo"
git branch -M main
git remote add origin https://github.com/UTILIZATORUL-TAU/chirivo-landing.git
git push -u origin main
```

Apoi în repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root` → Save**.
Site-ul apare în 1-2 minute la `https://UTILIZATORUL-TAU.github.io/chirivo-landing/`.

Dacă legi un domeniu propriu (ex. `chirivo.ro`), completează și tagurile
`og:url` / `og:image` din `<head>`, marcate cu TODO.

## Cum modifici lucruri

| Vrei să schimbi | Unde te uiți |
|---|---|
| un text | `index.html` — textele sunt direct în markup, nu în JS |
| o culoare | `style.css`, secțiunea 1 (variabilele din `:root` și `[data-theme="dark"]`) |
| durata preloader-ului | `script.js`, constanta `DURATA_PRELOADER` |
| aranjarea pe mobil/desktop | `style.css`, secțiunea 15 (breakpoints) |

Culorile sunt scrise de două ori (întâi hex, apoi `oklch`) — browserele moderne
folosesc `oklch`, cele vechi rămân pe hex. Dacă schimbi o culoare, schimbă ambele rânduri.

Butoanele folosesc `--brand-solid` (cu două trepte mai închis decât `--brand`),
pentru că au text alb deasupra și trebuie să treacă pragul de contrast AA.
