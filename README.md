# OSIRIS

Statička web stranica OSIRIS-a, web tima Tina i Matea iz Zagreba. Nema frameworka, baze podataka ni produkcijskih JavaScript ovisnosti. Razvojne ovisnosti služe isključivo testiranju.

## Pokretanje i build

Potreban je Node.js 22 ili noviji.

- `npm ci` — instalacija zaključanih razvojnih ovisnosti.
- `npm run dev` — lokalni prikaz na http://localhost:4173.
- `npm run build` — provjere i generiranje kompletne statičke stranice u `dist/`.
- `npm run preview` — posluživanje gotovog `dist/` na istom portu.

Razvojni server i build koriste isti renderer iz `scripts/render-page.mjs`. HTML predlošci sadrže označena mjesta za zajedničku navigaciju, obrasce, usluge i projekte. Ne objavljujte izvorne HTML predloške izravno: objavljuje se isključivo `dist/`.

## Sadržaj

`js/content.js` sadrži poslovni naziv, kontakt, provjerene podatke osnivača, usluge, svih pet projekata i Formspree ID. Stranični tekst nalazi se u pripadajućim HTML predlošcima. Renderer HTML-escapea podatke prije umetanja.

Rute: `/`, `/usluge/`, `/projekti/`, `/o-nama/`, `/kontakt/`, `/web-stranice-za-poduzeca/`, `/privatnost/`. Nepostojeća ruta prikazuje `404.html` sa statusom 404.

Oba obrasca koriste isti skup polja i Formspree POST odredište. HTML ima izvornu validaciju; JavaScript dodaje poruke uz polja, obradu pogrešaka, zaštitu od ponovljenog slanja i timeout od 20 sekundi. Nazivi polja ostaju `name`, `email`, `websiteStatus`, `primaryGoal`, `websiteUrl`, `company`, `message`, `_gotcha`, četiri UTM oznake i `pageUrl`.

UTM oznake prenose se putem internih poveznica. Ne koriste se kolačići ni trajna pohrana za praćenje. Besplatna analiza vodi na Kontakt, osim na landing i kontakt stranici gdje poveznica ostaje na lokalnom obrascu.

## Testiranje

- `npm run check` — statički ugovori, struktura naslova, ID-jevi, lokalni asseti, ARIA reference, obrasci, CSS tokeni i odabrani kontrastni parovi.
- `npx playwright install chromium firefox webkit` — instalacija razvojnih preglednika.
- `npm test` — build i provjere u sva tri browser enginea.
- `npm run test:chromium` — brža provjera u Chromiumu.

Testovi pokrivaju osam ruta, 17 širina, kratki mobilni zaslon, fokus, native navigaciju, rad bez JavaScripta, povećanje teksta, reduced motion, axe provjere i simulirane ishode obrasca. Zahtjevi prema Formspreeju presreću se; testovi ne šalju stvarne upite. Screenshotovi i tragovi nalaze se u ignoriranom `test-results/`, a izvještaj u `playwright-report/`.

Automatizirani testovi ne zamjenjuju ručnu provjeru čitačem zaslona i na stvarnom telefonu. Stvarnu dostavu provjeravajte samo unaprijed dogovorenim testnim upitom.

## Objava

Postojeća Sites konfiguracija koristi `dist/`. Vercel također koristi `dist/` i naredbu `npm run build`. Sačuvajte postojeći projekt i način pristupa; ne objavljujte `node_modules`, testove, nacrte ni arhivske stilove. Poslovni naziv i email potvrđeni su od vlasnika; poslovnu adresu i dodatne poslovne podatke unosite samo nakon potvrde.

Aktualni vizualni ugovor je `DESIGN-SYSTEM.md`. Stariji DESIGN dokumenti i stilovi predstavljaju povijest projekta. Izvori medija nalaze se u `MEDIA-CREDITS.md`. Email kampanja iz `OUTREACH-EMAILS.md` zaseban je posao i nije dio obrasca.
