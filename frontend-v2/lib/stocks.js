const stocks = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    aliases: ["apple", "iphone", "apple inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/apple.com",
    logoDomain: "apple.com",
    sector: "Technology",
    industry: "Consumer Electronics",
    description: "Globaler Technologieanbieter mit starkem Oekosystem aus Hardware, Services und Software."
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    aliases: ["tesla", "tesla motors"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/tesla.com",
    logoDomain: "tesla.com",
    sector: "Automotive / Energy",
    industry: "Electric Vehicles",
    description: "Wachstumsorientierter Hersteller von Elektrofahrzeugen, Batterien und Energieprodukten."
  },
  {
    ticker: "SAP",
    name: "SAP SE",
    aliases: ["sap", "sap se"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/sap.com",
    logoDomain: "sap.com",
    sector: "Enterprise Software",
    industry: "Cloud ERP",
    description: "Europaeischer Softwarekonzern mit Fokus auf ERP, Cloud-Migration und Unternehmensdaten."
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    aliases: ["nvidia", "nvidia corporation", "nvidia corp"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/nvidia.com",
    logoDomain: "nvidia.com",
    sector: "Semiconductors",
    industry: "AI Accelerators",
    description: "Halbleiterunternehmen mit fuehrender Position bei GPUs, KI-Beschleunigern und Rechenzentren."
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    aliases: ["microsoft", "microsoft corporation", "ms"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/microsoft.com",
    logoDomain: "microsoft.com",
    sector: "Technology",
    industry: "Cloud Software",
    description: "Diversifizierter Software- und Cloudanbieter mit starken Plattform- und KI-Geschaeften."
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    aliases: ["alphabet", "google", "alphabet inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/google.com",
    logoDomain: "google.com",
    sector: "Communication Services",
    industry: "Search / Cloud / Ads",
    description: "Digitalplattform mit Suchmaschine, Werbung, YouTube, Cloud und KI-Forschung."
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    aliases: ["amazon", "amazon.com", "aws"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/amazon.com",
    logoDomain: "amazon.com",
    sector: "Consumer / Cloud",
    industry: "E-Commerce / Cloud",
    description: "E-Commerce- und Cloudkonzern mit AWS, Marktplatz, Logistik und Advertising."
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    aliases: ["meta", "facebook", "instagram", "whatsapp"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/meta.com",
    logoDomain: "meta.com",
    sector: "Communication Services",
    industry: "Social Platforms",
    description: "Plattformunternehmen mit starken Werbeerlösen, Social Apps und KI-Infrastruktur."
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hathaway B",
    aliases: ["berkshire", "berkshire hathaway", "brk", "buffett"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/berkshirehathaway.com",
    logoDomain: "berkshirehathaway.com",
    sector: "Financials",
    industry: "Conglomerate / Insurance",
    description: "Diversifiziertes Konglomerat von Warren Buffett mit Versicherungen, Energie und Beteiligungen."
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    aliases: ["jpmorgan", "jp morgan", "chase", "jpmc"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/jpmorganchase.com",
    logoDomain: "jpmorganchase.com",
    sector: "Financials",
    industry: "Investment Banking",
    description: "Groesste US-Bank mit Investmentbanking, Retail-Banking und Asset Management."
  },
  {
    ticker: "V",
    name: "Visa Inc.",
    aliases: ["visa", "visa inc"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/visa.com",
    logoDomain: "visa.com",
    sector: "Financials",
    industry: "Payment Networks",
    description: "Globales Zahlungsnetzwerk mit hohen Margen, starkem Moat und Volumenkonjunktur."
  },
  {
    ticker: "MA",
    name: "Mastercard Inc.",
    aliases: ["mastercard", "mastercard inc"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/mastercard.com",
    logoDomain: "mastercard.com",
    sector: "Financials",
    industry: "Payment Networks",
    description: "Globales Zahlungsnetzwerk im Duopol mit Visa, starken Wachstumsmargen und Netzwerkeffekten."
  },
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    aliases: ["eli lilly", "lilly", "eli lilly and company"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/lilly.com",
    logoDomain: "lilly.com",
    sector: "Healthcare",
    industry: "Pharmaceuticals",
    description: "Pharmakonzern mit blockbuster-Medikamenten in Diabetes, Adipositas und Onkologie."
  },
  {
    ticker: "UNH",
    name: "UnitedHealth Group",
    aliases: ["unitedhealth", "united health", "unh"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/unitedhealthgroup.com",
    logoDomain: "unitedhealthgroup.com",
    sector: "Healthcare",
    industry: "Health Insurance",
    description: "Groesster US-Krankenversicherer mit diversifiziertem Healthcare-Dienstleistungsportfolio."
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    aliases: ["johnson", "j&j", "johnson and johnson"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/jnj.com",
    logoDomain: "jnj.com",
    sector: "Healthcare",
    industry: "Pharmaceuticals / MedTech",
    description: "Diversifizierter Healthcare-Konzern mit Pharma, MedTech und langer Dividendenhistorie."
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil Corp.",
    aliases: ["exxon", "exxonmobil", "exxon mobil"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/exxonmobil.com",
    logoDomain: "exxonmobil.com",
    sector: "Energy",
    industry: "Oil & Gas",
    description: "Groesster westlicher Oel- und Gaskonzern mit globalem Foerderungs- und Raffineriegeschaeft."
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    aliases: ["walmart", "wal-mart", "walmart inc"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/walmart.com",
    logoDomain: "walmart.com",
    sector: "Consumer Staples",
    industry: "Retail",
    description: "Weltgroesster Einzelhaendler mit starkem Omnichannel-Wachstum und Advertising-Geschaeft."
  },
  {
    ticker: "PG",
    name: "Procter & Gamble Co.",
    aliases: ["procter gamble", "p&g", "procter and gamble"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/pg.com",
    logoDomain: "pg.com",
    sector: "Consumer Staples",
    industry: "Household Products",
    description: "Konsumgueterkonzern mit globalen Marken wie Pampers, Gillette, Tide und Oral-B."
  },
  {
    ticker: "ASML",
    name: "ASML Holding N.V.",
    aliases: ["asml", "asml holding"],
    exchange: "NASDAQ",
    country: "Niederlande",
    currency: "EUR",
    logo: "https://logo.clearbit.com/asml.com",
    logoDomain: "asml.com",
    sector: "Semiconductors",
    industry: "Chip Equipment",
    description: "Weltweiter Monopolist fuer EUV-Lithografiesysteme, unverzichtbar fuer modernste Chips."
  },
  {
    ticker: "BABA",
    name: "Alibaba Group",
    aliases: ["alibaba", "alibaba group", "ali"],
    exchange: "NYSE",
    country: "China",
    currency: "USD",
    logo: "https://logo.clearbit.com/alibaba.com",
    logoDomain: "alibaba.com",
    sector: "Consumer / Cloud",
    industry: "E-Commerce / Cloud",
    description: "Chinesischer E-Commerce- und Cloudkonzern mit dominanten Marktanteilen in Asien."
  },
  {
    ticker: "TSM",
    name: "Taiwan Semiconductor",
    aliases: ["tsmc", "taiwan semiconductor", "taiwan semi"],
    exchange: "NYSE",
    country: "Taiwan",
    currency: "USD",
    logo: "https://logo.clearbit.com/tsmc.com",
    logoDomain: "tsmc.com",
    sector: "Semiconductors",
    industry: "Foundry",
    description: "Weltgroesster Auftragsfertiger fuer Halbleiter, produziert fuer Apple, NVIDIA und AMD."
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    aliases: ["amd", "advanced micro devices"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/amd.com",
    logoDomain: "amd.com",
    sector: "Semiconductors",
    industry: "CPUs / GPUs",
    description: "Halbleiterhersteller mit wachsender Position in CPUs, GPUs und KI-Beschleunigern."
  },
  {
    ticker: "INTC",
    name: "Intel Corp.",
    aliases: ["intel", "intel corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/intel.com",
    logoDomain: "intel.com",
    sector: "Semiconductors",
    industry: "CPUs / Foundry",
    description: "Traditioneller CPU-Marktfuehrer im Transformationsprozess hin zur eigenen Foundry-Strategie."
  },
  {
    ticker: "NFLX",
    name: "Netflix Inc.",
    aliases: ["netflix", "netflix inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/netflix.com",
    logoDomain: "netflix.com",
    sector: "Communication Services",
    industry: "Streaming",
    description: "Weltgroesste Streaming-Plattform mit Advertising-Tier und globalem Content-Portfolio."
  },
  {
    ticker: "SPOT",
    name: "Spotify Technology",
    aliases: ["spotify", "spotify technology"],
    exchange: "NYSE",
    country: "Schweden",
    currency: "USD",
    logo: "https://logo.clearbit.com/spotify.com",
    logoDomain: "spotify.com",
    sector: "Communication Services",
    industry: "Audio Streaming",
    description: "Fuehrender Musik- und Podcast-Streamingdienst mit starkem Abo-Wachstum und Margin-Expansion."
  },
  {
    ticker: "PYPL",
    name: "PayPal Holdings Inc.",
    aliases: ["paypal", "paypal holdings"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/paypal.com",
    logoDomain: "paypal.com",
    sector: "Financials",
    industry: "Digital Payments",
    description: "Digitaler Zahlungsanbieter mit Venmo, Braintree und wachsendem Commerce-Geschaeft."
  },
  {
    ticker: "COIN",
    name: "Coinbase Global Inc.",
    aliases: ["coinbase", "coinbase global"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/coinbase.com",
    logoDomain: "coinbase.com",
    sector: "Financials",
    industry: "Crypto Exchange",
    description: "Groesste US-regulierte Kryptobörse mit institutionellem und Retail-Handelsvolumen."
  },
  {
    ticker: "UBER",
    name: "Uber Technologies Inc.",
    aliases: ["uber", "uber technologies"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/uber.com",
    logoDomain: "uber.com",
    sector: "Technology",
    industry: "Ride-Sharing / Delivery",
    description: "Globale Mobilitaetsplattform mit Ridesharing, Lieferdienst und Freight-Geschaeft."
  },
  {
    ticker: "ADBE",
    name: "Adobe Inc.",
    aliases: ["adobe", "adobe inc", "photoshop"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/adobe.com",
    logoDomain: "adobe.com",
    sector: "Technology",
    industry: "Creative Software",
    description: "Kreativsoftware-Konzern mit Photoshop, Acrobat, Firefly-KI und Document-Cloud."
  },
  {
    ticker: "CRM",
    name: "Salesforce Inc.",
    aliases: ["salesforce", "salesforce inc", "crm"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/salesforce.com",
    logoDomain: "salesforce.com",
    sector: "Technology",
    industry: "CRM / Cloud",
    description: "Marktfuehrer im CRM-Segment mit wachsender KI-Agenten-Plattform und Salesforce Einstein."
  },
  {
    ticker: "NOW",
    name: "ServiceNow Inc.",
    aliases: ["servicenow", "service now"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/servicenow.com",
    logoDomain: "servicenow.com",
    sector: "Technology",
    industry: "Enterprise Workflow",
    description: "Enterprise-Workflow-Plattform mit KI-Integration und starker Kundenbindung in Grosskonzernen."
  },
  {
    ticker: "SHOP",
    name: "Shopify Inc.",
    aliases: ["shopify", "shopify inc"],
    exchange: "NYSE",
    country: "Kanada",
    currency: "USD",
    logo: "https://logo.clearbit.com/shopify.com",
    logoDomain: "shopify.com",
    sector: "Technology",
    industry: "E-Commerce Platform",
    description: "E-Commerce-Plattform fuer KMU und Grosshaendler mit Payments, Logistik und B2B-Expansion."
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies",
    aliases: ["palantir", "palantir technologies"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/palantir.com",
    logoDomain: "palantir.com",
    sector: "Technology",
    industry: "AI / Data Analytics",
    description: "KI- und Datenanalyseplattform fuer Regierungen und Unternehmen, bekannt fuer AIP-Produkt."
  },
  {
    ticker: "SIE",
    name: "Siemens AG",
    aliases: ["siemens", "siemens ag"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/siemens.com",
    logoDomain: "siemens.com",
    sector: "Industrials",
    industry: "Industrial Automation",
    description: "Diversifizierter Industriekonzern mit Automatisierung, Energie und Infrastruktur."
  },
  {
    ticker: "BAYN",
    name: "Bayer AG",
    aliases: ["bayer", "bayer ag"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/bayer.com",
    logoDomain: "bayer.com",
    sector: "Healthcare",
    industry: "Pharma / Agro",
    description: "Pharma- und Agrochemiekonzern mit Roundup-Rechtsrisiken und Pipeline in Onkologie."
  },
  {
    ticker: "VOW3",
    name: "Volkswagen AG",
    aliases: ["volkswagen", "vw", "volkswagen ag"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/volkswagen.com",
    logoDomain: "volkswagen.com",
    sector: "Automotive",
    industry: "Automobiles",
    description: "Europas groesster Automobilkonzern mit Brands wie VW, Audi, Porsche und Lamborghini."
  },
  {
    ticker: "BMW",
    name: "BMW AG",
    aliases: ["bmw", "bmw ag", "bayerische motoren"],
    exchange: "XETRA",
    country: "Deutschland",
    currency: "EUR",
    logo: "https://logo.clearbit.com/bmw.com",
    logoDomain: "bmw.com",
    sector: "Automotive",
    industry: "Luxury Automobiles",
    description: "Premiumautomobilhersteller mit starker E-Mobilitaetsstrategie und globaler Markenstaerke."
  },
  {
    ticker: "RHHBY",
    name: "Roche Holding AG",
    aliases: ["roche", "roche holding"],
    exchange: "NASDAQ",
    country: "Schweiz",
    currency: "USD",
    logo: "https://logo.clearbit.com/roche.com",
    logoDomain: "roche.com",
    sector: "Healthcare",
    industry: "Pharmaceuticals / Diagnostics",
    description: "Schweizer Pharma- und Diagnostikkonzern mit starker Onkologie-Pipeline und In-vitro-Diagnostik."
  },
  {
    ticker: "NOVN",
    name: "Novartis AG",
    aliases: ["novartis", "novartis ag"],
    exchange: "NASDAQ",
    country: "Schweiz",
    currency: "USD",
    logo: "https://logo.clearbit.com/novartis.com",
    logoDomain: "novartis.com",
    sector: "Healthcare",
    industry: "Pharmaceuticals",
    description: "Schweizer Pharmakonzern mit diversifiziertem Portfolio in Onkologie, Kardiologie und Augenheilkunde."
  },
  {
    ticker: "NESN",
    name: "Nestle SA",
    aliases: ["nestle", "nestle sa"],
    exchange: "NASDAQ",
    country: "Schweiz",
    currency: "USD",
    logo: "https://logo.clearbit.com/nestle.com",
    logoDomain: "nestle.com",
    sector: "Consumer Staples",
    industry: "Food & Beverage",
    description: "Weltgroesster Lebensmittelkonzern mit starken Marken in Kaffee, Wasser und Ernaehrung."
  },
  {
    ticker: "LRCX",
    name: "Lam Research Corp.",
    aliases: ["lam research", "lam"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/lamresearch.com",
    logoDomain: "lamresearch.com",
    sector: "Semiconductors",
    industry: "Chip Equipment",
    description: "Ausruestungshersteller fuer Halbleiter-Fertigung mit Fokus auf Aetzmaschinen und Prozessoptimierung."
  },
  {
    ticker: "QCOM",
    name: "Qualcomm Inc.",
    aliases: ["qualcomm", "qualcomm inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/qualcomm.com",
    logoDomain: "qualcomm.com",
    sector: "Semiconductors",
    industry: "Mobile / Wireless",
    description: "Halbleiter- und Lizenzunternehmen mit fuehrender Position in Mobilfunk und 5G-Technologie."
  },
  {
    ticker: "BROADCOM",
    name: "Broadcom Inc.",
    aliases: ["broadcom", "broadcom inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/broadcom.com",
    logoDomain: "broadcom.com",
    sector: "Semiconductors",
    industry: "Infrastructure / Wireless",
    description: "Infrastruktur-Halbleiterhersteller mit Fokus auf Netzwerk, Breitband und Wireless-Technologie."
  },
  {
    ticker: "AVGO",
    name: "Broadcom Inc. (Alt)",
    aliases: ["avago", "avago technologies"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/broadcom.com",
    logoDomain: "broadcom.com",
    sector: "Semiconductors",
    industry: "Infrastructure",
    description: "Halbleiterhersteller mit Fokus auf Infrastruktur und Wireless-Technologien."
  },
  {
    ticker: "MRVL",
    name: "Marvell Technology Inc.",
    aliases: ["marvell", "marvell technology"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/marvell.com",
    logoDomain: "marvell.com",
    sector: "Semiconductors",
    industry: "Data Infrastructure",
    description: "Halbleiterhersteller mit Fokus auf Datenzentren, Cloud und Speicher-Infrastruktur."
  },
  {
    ticker: "SNPS",
    name: "Synopsys Inc.",
    aliases: ["synopsys", "synopsys inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/synopsys.com",
    logoDomain: "synopsys.com",
    sector: "Technology",
    industry: "EDA / Semiconductor Design",
    description: "EDA-Softwareanbieter fuer Chip-Design mit fuehrender Position in Verifikation und Simulation."
  },
  {
    ticker: "CDNS",
    name: "Cadence Design Systems",
    aliases: ["cadence", "cadence design"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/cadence.com",
    logoDomain: "cadence.com",
    sector: "Technology",
    industry: "EDA / Semiconductor Design",
    description: "EDA-Softwareanbieter mit Fokus auf Chip-Design, Simulation und Verifikation."
  },
  {
    ticker: "KLAC",
    name: "KLA Corp.",
    aliases: ["kla", "kla corporation"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/kla.com",
    logoDomain: "kla.com",
    sector: "Semiconductors",
    industry: "Process Control",
    description: "Ausruestungshersteller fuer Halbleiter-Fertigung mit Fokus auf Inspektions- und Messtechnik."
  },
  {
    ticker: "AMAT",
    name: "Applied Materials Inc.",
    aliases: ["applied materials", "amat"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/appliedmaterials.com",
    logoDomain: "appliedmaterials.com",
    sector: "Semiconductors",
    industry: "Chip Equipment",
    description: "Weltgroesster Halbleiter-Ausruestungshersteller mit Fokus auf Depositions- und Aetzmaschinen."
  },
  {
    ticker: "CSCO",
    name: "Cisco Systems Inc.",
    aliases: ["cisco", "cisco systems"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/cisco.com",
    logoDomain: "cisco.com",
    sector: "Technology",
    industry: "Networking",
    description: "Netzwerk-Ausruestungshersteller mit Fokus auf Router, Switches und Cybersecurity."
  },
  {
    ticker: "ORCL",
    name: "Oracle Corp.",
    aliases: ["oracle", "oracle corporation"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/oracle.com",
    logoDomain: "oracle.com",
    sector: "Technology",
    industry: "Enterprise Software / Cloud",
    description: "Enterprise-Softwarekonzern mit Datenbank-, Cloud- und Unternehmensanwendungen."
  },
  {
    ticker: "IBM",
    name: "International Business Machines",
    aliases: ["ibm", "international business machines"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/ibm.com",
    logoDomain: "ibm.com",
    sector: "Technology",
    industry: "IT Services / Cloud",
    description: "IT-Dienstleistungskonzern mit Fokus auf Cloud, KI, Hybrid-Infrastruktur und Consulting."
  },
  {
    ticker: "INTU",
    name: "Intuit Inc.",
    aliases: ["intuit", "intuit inc", "quickbooks"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/intuit.com",
    logoDomain: "intuit.com",
    sector: "Technology",
    industry: "Financial Software",
    description: "Finanzsoftware-Anbieter mit QuickBooks, TurboTax und Credit Karma fuer KMU und Privatpersonen."
  },
  {
    ticker: "TEAM",
    name: "Atlassian Corp.",
    aliases: ["atlassian", "atlassian corp", "jira"],
    exchange: "NASDAQ",
    country: "Australien",
    currency: "USD",
    logo: "https://logo.clearbit.com/atlassian.com",
    logoDomain: "atlassian.com",
    sector: "Technology",
    industry: "Developer Tools / Collaboration",
    description: "Softwareentwicklungs-Plattform mit Jira, Confluence und Bitbucket fuer Agile Teams."
  },
  {
    ticker: "DDOG",
    name: "Datadog Inc.",
    aliases: ["datadog", "datadog inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/datadoghq.com",
    logoDomain: "datadoghq.com",
    sector: "Technology",
    industry: "Cloud Monitoring",
    description: "Cloud-Monitoring- und Observability-Plattform fuer Infrastruktur, Apps und Logs."
  },
  {
    ticker: "CRWD",
    name: "CrowdStrike Holdings",
    aliases: ["crowdstrike", "crowdstrike holdings"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/crowdstrike.com",
    logoDomain: "crowdstrike.com",
    sector: "Technology",
    industry: "Cybersecurity",
    description: "Cloud-native Cybersecurity-Plattform mit Endpoint Protection und Threat Intelligence."
  },
  {
    ticker: "PALO",
    name: "Palo Alto Networks",
    aliases: ["palo alto", "palo alto networks"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/paloaltonetworks.com",
    logoDomain: "paloaltonetworks.com",
    sector: "Technology",
    industry: "Cybersecurity",
    description: "Cybersecurity-Plattform mit Firewalls, Cloud-Sicherheit und Threat-Management."
  },
  {
    ticker: "ZM",
    name: "Zoom Video Communications",
    aliases: ["zoom", "zoom video"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/zoom.us",
    logoDomain: "zoom.us",
    sector: "Technology",
    industry: "Communication / Collaboration",
    description: "Video-Kommunikationsplattform mit Meetings, Webinare und Chat fuer Unternehmen."
  },
  {
    ticker: "OKTA",
    name: "Okta Inc.",
    aliases: ["okta", "okta inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/okta.com",
    logoDomain: "okta.com",
    sector: "Technology",
    industry: "Identity & Access",
    description: "Identity- und Access-Management-Plattform fuer Unternehmen und Entwickler."
  },
  {
    ticker: "TWLO",
    name: "Twilio Inc.",
    aliases: ["twilio", "twilio inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/twilio.com",
    logoDomain: "twilio.com",
    sector: "Technology",
    industry: "Communication APIs",
    description: "Cloud-Kommunikations-API-Plattform fuer SMS, Voice und Video-Integrationen."
  },
  {
    ticker: "SNOW",
    name: "Snowflake Inc.",
    aliases: ["snowflake", "snowflake inc"],
    exchange: "NYSE",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/snowflake.com",
    logoDomain: "snowflake.com",
    sector: "Technology",
    industry: "Cloud Data Platform",
    description: "Cloud-Datenlagerungsplattform mit SQL-Engine fuer Analytics und Data Sharing."
  },
  {
    ticker: "DOMO",
    name: "Domo Inc.",
    aliases: ["domo", "domo inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/domo.com",
    logoDomain: "domo.com",
    sector: "Technology",
    industry: "Business Intelligence",
    description: "Business-Intelligence- und Analytics-Plattform fuer Echtzeit-Dashboards und Insights."
  },
  {
    ticker: "TABLEAU",
    name: "Tableau Software (Salesforce)",
    aliases: ["tableau", "tableau software"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/tableau.com",
    logoDomain: "tableau.com",
    sector: "Technology",
    industry: "Business Intelligence",
    description: "Datenvisualisierungs- und Analytics-Plattform, jetzt Teil von Salesforce."
  },
  {
    ticker: "SPLK",
    name: "Splunk Inc.",
    aliases: ["splunk", "splunk inc"],
    exchange: "NASDAQ",
    country: "USA",
    currency: "USD",
    logo: "https://logo.clearbit.com/splunk.com",
    logoDomain: "splunk.com",
    sector: "Technology",
    industry: "Data Analytics / Observability",
    description: "Datenanalyse-Plattform fuer Logs, Metriken und Security-Daten aus Infrastruktur und Apps."
  }
];

// Chart data lengths per timeframe
const TIMEFRAME_LENGTHS = { "1W": 7, "1M": 30, "3M": 63, "6M": 126, "1Y": 252, "5Y": 1260, "MAX": 2520 };

function searchStocks(query) {
  const normalized = normalize(query);
  if (!normalized) return [];

  return stocks
    .map((stock) => ({ stock, score: matchScore(stock, normalized) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.stock.name.localeCompare(b.stock.name))
    .slice(0, 8)
    .map((result) => createQuote(result.stock));
}

function findStock(query) {
  const normalized = normalize(query);
  return stocks.find((stock) => stock.ticker.toLowerCase() === normalized)
    || stocks.find((stock) => stock.aliases.some((alias) => normalize(alias) === normalized))
    || stocks.find((stock) => normalize(stock.name).includes(normalized));
}

function createQuote(stock, timeframe = "1M") {
  const length = TIMEFRAME_LENGTHS[timeframe] || 30;
  const price = seededNumber(`${stock.ticker}-price`, stock.currency === "EUR" ? 80 : 95, stock.ticker === "NVDA" ? 920 : 640);
  const change = seededNumber(`${stock.ticker}-change`, -4.6, 5.4);
  const revenueGrowth = seededNumber(`${stock.ticker}-rev`, -2.5, 29);
  const earningsGrowth = seededNumber(`${stock.ticker}-eps`, -4, 34);
  const pe = seededNumber(`${stock.ticker}-pe`, 12, 56);
  const volatility = seededNumber(`${stock.ticker}-vol`, 13, 62);
  const marketCap = seededNumber(`${stock.ticker}-cap`, 65, 3200) * 1_000_000_000;
  const grossMargin = seededNumber(`${stock.ticker}-gross`, 28, 74);
  const fcfYield = seededNumber(`${stock.ticker}-fcf`, 1.1, 8.8);
  const beta = seededNumber(`${stock.ticker}-beta`, 0.72, 1.92);
  const analystScore = seededNumber(`${stock.ticker}-analyst`, 54, 91);
  const analysis = analyze({ revenueGrowth, earningsGrowth, pe, volatility, change, grossMargin, fcfYield });

  return {
    ...stock,
    price,
    change,
    marketCap,
    pe,
    revenueGrowth,
    earningsGrowth,
    volatility,
    grossMargin,
    fcfYield,
    beta,
    analystScore,
    dividendYield: seededNumber(`${stock.ticker}-div`, 0, 3.8),
    debtToEquity: seededNumber(`${stock.ticker}-debt`, 0.08, 2.8),
    chart: buildChart(stock.ticker, price, length, timeframe),
    timeframe,
    chartTimeframes: Object.keys(TIMEFRAME_LENGTHS)
  };
}

function analyze(metrics) {
  const growth = clamp(metrics.revenueGrowth * 1.7 + metrics.earningsGrowth * 1.25 + metrics.grossMargin * 0.18);
  const valuation = clamp(108 - metrics.pe * 1.18 + metrics.fcfYield * 3.2);
  const trend = clamp(54 + metrics.change * 6.6);
  const risk = clamp(100 - metrics.volatility * 1.08);
  const score = clamp(growth * 0.32 + valuation * 0.24 + trend * 0.24 + risk * 0.2);

  return {
    score,
    verdict: score >= 76 ? "Premium-wuerdiges Research-Profil" : score >= 60 ? "Solide Watchlist-Kandidatin" : "Gemischtes Profil mit Pruefpunkten",
    pillars: { growth, valuation, trend, risk },
    summary: [
      `Wachstum: Umsatz und Gewinn ergeben zusammen ${growth}/100 Punkte.`,
      `Bewertung: KGV und Free-Cashflow-Qualitaet fuehren zu ${valuation}/100 Punkten.`,
      `Trend: Tagesbewegung und Momentum liefern ${trend}/100 Punkte.`,
      `Risiko: Volatilitaet und Stabilitaet ergeben ${risk}/100 Punkte.`
    ]
  };
}

function buildChart(ticker, price, length, timeframe = "1M") {
  const driftScale = { "1W": 0.1, "1M": 0.5, "3M": 1.0, "6M": 1.5, "1Y": 2.0, "5Y": 3.5, "MAX": 4.0 }[timeframe] || 0.5;
  const noiseScale = { "1W": 0.008, "1M": 0.017, "3M": 0.018, "6M": 0.020, "1Y": 0.022, "5Y": 0.025, "MAX": 0.028 }[timeframe] || 0.017;

  return Array.from({ length }, (_, index) => {
    const wave = Math.sin(index / Math.max(4, length / 12)) * price * 0.032;
    const drift = index * seededNumber(`${ticker}-drift-${timeframe}`, -0.32, 0.86) * driftScale;
    const noise = seededNumber(`${ticker}-${timeframe}-${index}`, -price * noiseScale, price * noiseScale);
    return Number(Math.max(1, price * 0.78 + wave + drift + noise).toFixed(2));
  });
}

function matchScore(stock, normalized) {
  if (stock.ticker.toLowerCase() === normalized) return 100;
  if (stock.ticker.toLowerCase().startsWith(normalized)) return 86;
  if (normalize(stock.name) === normalized) return 96;
  if (normalize(stock.name).startsWith(normalized)) return 84;
  if (normalize(stock.name).includes(normalized)) return 76;
  if (stock.aliases.some((alias) => normalize(alias) === normalized)) return 94;
  if (stock.aliases.some((alias) => normalize(alias).startsWith(normalized))) return 82;
  if (stock.aliases.some((alias) => normalize(alias).includes(normalized))) return 70;
  return 0;
}

function seededNumber(seed, min, max) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return Number((min + (hash % 1000) / 1000 * (max - min)).toFixed(2));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

module.exports = { findStock, searchStocks, createQuote, TIMEFRAME_LENGTHS };
