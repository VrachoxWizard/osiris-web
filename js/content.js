const projectBlueprints = [
  { category: "Web stranica", services: ["UX/UI", "Development", "SEO osnova"] },
  { category: "Web aplikacija", services: ["UX/UI", "Frontend", "Poslovna logika"] },
  { category: "Webshop", services: ["UX/UI", "Katalog", "Prodajni tok"] },
  { category: "Web stranica", services: ["Strategija", "Development", "Responzivnost"] },
  { category: "Web aplikacija", services: ["Dashboard", "Korisničke uloge", "Podaci"] },
  { category: "Webshop", services: ["Katalog", "Košarica", "Administracija"] },
  { category: "Web stranica", services: ["Landing page", "Sadržaj", "Performanse"] },
  { category: "Web aplikacija", services: ["UX tokovi", "Frontend", "Automatizacija"] },
  { category: "Webshop", services: ["B2B iskustvo", "Proizvodi", "Upiti"] },
  { category: "Web stranica", services: ["Redizajn", "Development", "Migracija"] },
  { category: "Web aplikacija", services: ["Administracija", "Izvještaji", "Podrška"] },
  { category: "Web stranica", services: ["Prodajni web", "SEO osnova", "Održavanje"] },
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
  projects: projectBlueprints.map((blueprint, index) => {
    const number = String(index + 1).padStart(2, "0");

    return {
      id: `project-${number}`,
      title: `Projekt ${number}`,
      category: blueprint.category,
      services: blueprint.services,
      summary:
        "Stvarni naziv, poslovni izazov, rezultat i live poveznica unose se nakon potvrde objave portfolija.",
      preview: "",
      liveUrl: "",
      status: "Detalji u pripremi",
    };
  }),
};
