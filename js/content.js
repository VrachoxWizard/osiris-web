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
    category: "Web aplikacija",
    industry: "Sport",
    services: ["UX/UI", "Frontend", "Sportski sadržaj"],
    summary:
      "Sportska web aplikacija koja okuplja klupske informacije, sadržaj i digitalno iskustvo za korisnike.",
    preview: "/images/projects/tina-sport-pia.png",
    liveUrl: "https://stella-final-web.vercel.app/",
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
      "Web development studio iz Zagreba koji izrađuje web stranice, web aplikacije i digitalna rješenja za male i srednje poduzetnike.",
    stats: [
      { value: "12", label: "izrađenih projekata" },
      { value: "2", label: "iskusna developera" },
      { value: "ZG", label: "studio iz Zagreba" },
    ],
  },
  contact: {
    email: "",
    phone: "",
    endpoint: "",
    socials: {
      linkedin: "",
      instagram: "",
      github: "",
    },
    statusMessage:
      "Kontaktni podaci i slanje obrasca bit će aktivirani prije javne objave stranice.",
  },
  packages: [
    {
      code: "START",
      title: "Poslovna web stranica",
      description:
        "Za poduzetnike kojima treba vjerodostojna online prisutnost i jasan put do upita.",
      includes: ["Struktura i UI/UX", "Responzivan development", "Kontakt i SEO osnova"],
      tone: "light",
    },
    {
      code: "SHOP",
      title: "Webshop spreman za prodaju",
      description:
        "Za poslovanja koja žele pregledno predstaviti ponudu i pojednostaviti online kupnju.",
      includes: ["Katalog i kategorije", "Košarica i prodajni tok", "Upravljanje sadržajem"],
      tone: "blue",
    },
    {
      code: "APP",
      title: "Prilagođena web aplikacija",
      description:
        "Za procese koje generički alati ne rješavaju dovoljno dobro ili jednostavno.",
      includes: ["Analiza procesa", "Sučelje i razvoj", "Temelj za nadogradnje"],
      tone: "dark",
    },
    {
      code: "CARE",
      title: "Održavanje i kontinuirani rast",
      description:
        "Za tvrtke koje žele pouzdanog partnera nakon objave prve verzije proizvoda.",
      includes: ["Tehnička podrška", "Optimizacija performansi", "Nove funkcionalnosti"],
      tone: "silver",
    },
  ],
  projects,
};
