# OSIRIS

Višestranična web stranica za OSIRIS — mali web tim Tina i Matea iz Zagreba. Projekt je izrađen kao lagana statička stranica bez frameworka, vanjskih JavaScript paketa ili vlastitog backenda.

## Stranice

- Početna: `/`
- Usluge: `/usluge/`
- Projekti: `/projekti/`
- O nama: `/o-nama/`
- Kontakt: `/kontakt/`
- Landing za MSP: `/web-stranice-za-poduzeca/`
- Privatnost: `/privatnost/`

## Lokalno pokretanje

Potreban je Node.js. Projekt nema pakete koje treba instalirati.

```bash
npm run dev
```

Stranica će biti dostupna na [http://localhost:4173](http://localhost:4173).

## Uređivanje sadržaja

Promjenjivi podaci nalaze se u `js/content.js`:

- `brand` — naziv, lokacija, članovi i statistike
- `contact` — email, telefon, društvene mreže i Formspree form ID
- `serviceTracks` — tri jedinstvena smjera usluge
- `projects` — pet objavljenih projekata s ulogom, izazovom, rješenjem, ishodom, responsive medijima i live URL-ovima

Oba kontaktna obrasca koriste isti skup polja i šalju podatke izravno u Formspree ID zapisan u `js/content.js`. Nisu potrebni vlastiti backend ni environment varijable. Portfolio kartice vode samo na provjerene javne projekte.

## Provjera kvalitete

```bash
npm run check
```

Provjera obuhvaća svih sedam ruta, lokalne assete, strukturu naslova, ugovor obrazaca, responsive slike, sigurnost vanjskih poveznica, CSS tokene, kontrast i zabranjene globalne overrideove. Pravila novog vizualnog sustava nalaze se u `DESIGN-SYSTEM.md`.

Predlošci tri emaila i preduvjeti zasebne email kampanje nalaze se u `OUTREACH-EMAILS.md`. Kampanja nije dio web stranice niti kontaktnog obrasca.

## GitHub

Lokalni repozitorij koristi granu `main`, a `origin` treba pokazivati na:

```text
https://github.com/VrachoxWizard/osiris-web.git
```

Za prvi ručni commit i push:

```bash
git add .
git status
git commit -m "feat: initial OSIRIS website"
git push -u origin main
```

## Ručni deploy na Vercel

1. U Vercel nadzornoj ploči odaberite **New Project**.
2. Uvezite GitHub repozitorij `VrachoxWizard/osiris-web`.
3. Ostavite root direktorij na `./`.
4. Framework Preset postavite na **Other**. To je već naznačeno u `vercel.json`.
5. Build Command i Output Directory ostavite praznima — stranica je statička i nema build korak.
6. Nisu potrebne environment varijable.
7. Odaberite **Deploy**.

Nakon povezivanja GitHub repozitorija, budući commitovi na produkcijsku granu mogu automatski pokretati nova Vercel izdanja.

## Struktura

```text
css/           stilovi
images/        logo i grafički elementi
js/            sadržaj i interakcije
media/         lokalne fotografije i video
kontakt/       kontakt stranica
web-stranice-za-poduzeca/  landing za email promet
privatnost/    informacije o privatnosti
o-nama/        stranica o timu
projekti/      portfolio stranica
usluge/        stranica usluga
index.html     početna stranica
server.mjs     lokalni razvojni server
```

Izvori korištenih medija navedeni su u [MEDIA-CREDITS.md](MEDIA-CREDITS.md).

## Licenca

Sva prava pridržana. Izvorni kod i OSIRIS vizualni identitet nisu objavljeni pod open-source licencom.
