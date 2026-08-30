const projects = [
  {
    id: "dolce-torte",
    title: "Dolce Torte",
    category: "Web stranica",
    industry: "Slastičarstvo",
    services: ["UX/UI", "Development", "SEO osnova"],
    summary:
      "Web stranica zagrebačke slastičarnice s jasnim pregledom ponude i jednostavnim putem do narudžbe.",
    preview: "/images/projects/dolce-torte.png",
    liveUrl: "https://dolcetorte.hr/",
    status: "Projekt uživo",
  },
  {
    id: "dogan-septem",
    title: "Dogan Septem",
    category: "Web stranica",
    industry: "Interijeri",
    services: ["Web dizajn", "Development", "Responzivnost"],
    summary:
      "Prezentacijska web stranica za studio interijera, oblikovana oko prostora, usluga i izvedenih radova.",
    preview: "/images/projects/dogan-septem.png",
    liveUrl: "https://www.doganseptem-interijeri.hr/",
    status: "Projekt uživo",
  },
  {
    id: "tina-sport-pia",
    title: "Tina Šport–Pia",
    category: "Web stranica",
    industry: "Sport",
    services: ["Web dizajn", "Development", "Sportski raspored"],
    summary:
      "Web stranica malonogometne lige s rasporedima, rezultatima, uzrastima i galerijom na jednom mjestu.",
    preview: "/images/projects/tina-sport-pia.png",
    liveUrl: "https://mnk-tinasport.hr/",
    status: "Projekt uživo",
  },
  {
    id: "atasol",
    title: "ATASOL",
    category: "Web stranica",
    industry: "Psihoterapija",
    services: ["Web dizajn", "Development", "Responzivnost"],
    summary:
      "Smirena i pregledna web stranica za somatsku psihoterapiju, usmjerena na usluge i prvi kontakt.",
    preview: "/images/projects/atasol.png",
    liveUrl: "https://www.atasol.hr/",
    status: "Projekt uživo",
  },
  {
    id: "produkt-auto",
    title: "Produkt Auto",
    category: "Web platforma",
    industry: "Automobili",
    services: ["UX/UI", "Web platforma", "Katalog vozila"],
    summary:
      "Automobilska web platforma s pregledom dostupnih vozila i jasnim putem do informacija i upita.",
    preview: "/images/projects/produkt-auto.png",
    liveUrl: "https://produktauto.com/",
    status: "Projekt uživo",
  },
];

export const siteData = {
  brand: {
    name: "OSIRIS",
    location: "Zagreb, Hrvatska",
    founders: ["Tin", "Mate"],
    description:
      "Mali, iskusan web tim iz Zagreba koji izrađuje web stranice po mjeri za mala i srednja poduzeća.",
    stats: [
      { value: "5", label: "živih projekata" },
      { value: "2", label: "člana tima" },
      { value: "1", label: "izravan razgovor" },
    ],
  },
  contact: {
    email: "",
    phone: "",
    formspreeId: "xeaqovbe",
    socials: {
      linkedin: "",
      instagram: "",
      github: "",
    },
    statusMessage: "Hvala! Javit ćemo vam se u roku od tri radna dana.",
  },
  packages: [
    {
      code: "NOVA",
      title: "Nova poslovna web stranica",
      description:
        "Za poduzeća kojima treba profesionalna web prisutnost prilagođena ponudi, kupcima i cilju.",
      includes: ["Struktura i sadržaj", "Dizajn po mjeri", "Responzivan razvoj"],
      tone: "light",
    },
    {
      code: "REDIZAJN",
      title: "Redizajn postojeće stranice",
      description:
        "Za poslovanja čija stranica više ne predstavlja kvalitetu njihova rada ili ne vodi prema upitu.",
      includes: ["Analiza postojećeg weba", "Nova hijerarhija", "Migracija sadržaja"],
      tone: "blue",
    },
    {
      code: "RAST",
      title: "Web za sljedeću fazu rasta",
      description:
        "Za tvrtke kojima uz novu stranicu trebaju webshop, korisnički portal ili prilagođene funkcionalnosti.",
      includes: ["Poslovne funkcionalnosti", "Webshop ili portal", "Temelj za nadogradnje"],
      tone: "dark",
    },
    {
      code: "CARE",
      title: "Održavanje i kontinuirano poboljšanje",
      description:
        "Za tvrtke koje žele pouzdanog partnera nakon objave prve verzije proizvoda.",
      includes: ["Tehnička podrška", "Optimizacija performansi", "Nove funkcionalnosti"],
      tone: "silver",
    },
  ],
  projects,
};
