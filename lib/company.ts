export const contact = {
  "email": "contact@ss-ng.com",
  "phone": "+234 909 014 0000",
  "tel": "+2349090140000",
  "address": "62 Mbonu Street, D-Line, Port Harcourt, Rivers State, Nigeria",
  "postcode": "500261",
  "map": "https://www.google.com/maps/search/?api=1&query=62+Mbonu+Street+D-Line+Port+Harcourt+Nigeria"
};

export type Solution = {
  id: string;
  name: string;
  short: string;
  category: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageFit: "cover" | "contain";
  imageFrame?: readonly [number, number, number, number];
  alt: string;
  caption: string;
  intro: string;
  items: readonly string[];
  note: string;
  icon: "home" | "shield" | "network" | "sun" | "phone" | "audio" | "settings" | "fire" | "access" | "camera";
  planned?: string;
};

export const services: readonly Solution[] = [
  {
    "imageWidth": 1536,
    "imageHeight": 1024,
    "imageFit": "cover",
    "caption": "Illustrative environment",
    "id": "smart-home",
    "name": "Smart home automation",
    "short": "Spaces that respond to you.",
    "category": "Living",
    "image": "living-room",
    "alt": "Architectural concept of a warmly lit living room",
    "intro": "Bring lighting, shading, access and security into a more connected home. We provide smart home solutions for residential and industrial settings.",
    "items": [
      "Smart lighting and shading control",
      "Automated door locks and intrusion alerts",
      "Smart energy-saving solutions",
      "Visitor management and access control",
      "Smart elderly care, hotel and real estate solutions",
      "Smart community solutions"
    ],
    "note": "From a single room to a connected property.",
    "icon": "home"
  },
  {
    "imageWidth": 1920,
    "imageHeight": 1080,
    "imageFit": "cover",
    "caption": "Aqara camera demonstration",
    "id": "security",
    "name": "Security & surveillance",
    "short": "Know what matters. Protect what matters.",
    "category": "Protection",
    "image": "smart-security-poster",
    "alt": "Aqara Camera Hub G5 Pro shown on the exterior of a home",
    "intro": "Video surveillance, access control and intrusion alerts for homes and organisations. Our Synchronised Eye offering includes the design, installation and sales of IP and analogue surveillance systems.",
    "items": [
      "IP and analogue video surveillance",
      "Surveillance system design and installation",
      "Automated door locks",
      "Access control and visitor management",
      "Intrusion alert systems"
    ],
    "note": "Security considered as a complete system.",
    "icon": "shield"
  },
  {
    "id": "fire-alarm",
    "name": "Fire Alarm Systems",
    "short": "Fire alarms for your building.",
    "category": "Protection",
    "image": "fire-alarm-client",
    "imageWidth": 1600,
    "imageHeight": 683,
    "imageFit": "contain",
    "alt": "HIKFIRE fire alarm control panels, detectors and alarm equipment",
    "caption": "Fire alarm equipment",
    "intro": "Fire Alarm Systems for buildings and properties. Talk to our team about the fire alarm requirements of your space.",
    "items": [],
    "note": "Discuss your building’s fire alarm requirements.",
    "icon": "fire"
  },
  {
    "id": "access-control",
    "name": "Access Control Systems",
    "short": "Manage who comes in.",
    "category": "Protection",
    "image": "access-control-client",
    "imageFrame": [177, 211, 1212, 1277],
    "imageWidth": 1500,
    "imageHeight": 1500,
    "imageFit": "contain",
    "alt": "UniFi access control kit with a door reader, controller and key fobs",
    "caption": "Access control equipment",
    "intro": "Access Control Systems for homes and organisations, including visitor management and automated door locks. Discuss the entry points and access requirements of your property with our team.",
    "items": [
      "Access control and visitor management",
      "Automated door locks"
    ],
    "note": "Access considered around your property.",
    "icon": "access"
  },
  {
    "id": "vsaas",
    "name": "Video Surveillance as a Service (VSaaS)",
    "short": "Video surveillance, as a service.",
    "category": "Protection",
    "image": "smart-security-poster",
    "imageWidth": 1920,
    "imageHeight": 1080,
    "imageFit": "cover",
    "alt": "Aqara security camera demonstration used to illustrate video surveillance",
    "caption": "Video surveillance illustration",
    "intro": "Video Surveillance as a Service (VSaaS) is planned for introduction in 2027. Speak to our team about your surveillance requirements ahead of the planned service.",
    "items": [],
    "note": "Planned for 2027.",
    "icon": "camera",
    "planned": "Planned for 2027"
  },
  {
    "imageWidth": 1600,
    "imageHeight": 1600,
    "imageFit": "contain",
    "caption": "Network equipment",
    "id": "networks",
    "name": "Network engineering",
    "short": "The foundation of a connected space.",
    "category": "Connectivity",
    "image": "network-rack-client",
    "imageFrame": [328, 569, 944, 1027],
    "alt": "UniFi network equipment rack",
    "intro": "Design, installation and maintenance of the infrastructure that connects people, buildings and systems. Our scope spans local networks, wireless links, fibre and satellite connectivity.",
    "items": [
      "LAN and wireless LAN design",
      "Optic fibre networks",
      "Point-to-point and point-to-multipoint infrastructure",
      "Campus-wide networks",
      "LEO satellite installation and maintenance"
    ],
    "note": "Connectivity from the room to the campus.",
    "icon": "network"
  },
  {
    "imageWidth": 1536,
    "imageHeight": 1024,
    "imageFit": "cover",
    "caption": "Illustrative environment",
    "id": "power",
    "name": "Renewable Energy",
    "short": "Power, thoughtfully planned.",
    "category": "Energy",
    "image": "renewable-power",
    "alt": "Illustration of inverter and battery equipment in a residential utility room",
    "intro": "Sales, installation and maintenance of renewable energy equipment. We work with inverters, batteries, solar panels and solar street lighting, including streetlights with CCTV.",
    "items": [
      "Inverter systems",
      "Batteries and solar panels",
      "Solar streetlights",
      "Solar streetlights with CCTV",
      "Equipment installation and maintenance"
    ],
    "note": "Renewable energy for homes and organisations.",
    "icon": "sun"
  },
  {
    "imageWidth": 1500,
    "imageHeight": 1500,
    "imageFit": "contain",
    "caption": "IP communications equipment",
    "id": "communications",
    "name": "PBX & communications",
    "short": "Keep the conversation connected.",
    "category": "Communication",
    "image": "communications-client",
    "imageFrame": [101, 324, 1357, 1081],
    "alt": "Enterprise touchscreen IP phone",
    "intro": "Analogue, digital and IP PBX systems designed around the way your organisation communicates. We also design and install call centre infrastructure.",
    "items": [
      "Analogue and digital PBX systems",
      "IP PBX design and implementation",
      "Conventional intercom upgrades",
      "Call centre infrastructure",
      "Installation and maintenance"
    ],
    "note": "From office intercoms to call centre systems.",
    "icon": "phone"
  },
  {
    "imageWidth": 1600,
    "imageHeight": 836,
    "imageFit": "cover",
    "caption": "Audio & Visual equipment",
    "id": "audio",
    "name": "Audio & Visual",
    "short": "Picture and sound, together.",
    "category": "Experience",
    "image": "audio-visual-client",
    "alt": "Sonos soundbar and speaker equipment alongside a television in a home entertainment setting",
    "intro": "Audio & Visual for residential and organisational environments. We design, sell and install sound systems, public address systems and integrated sound control rooms.",
    "items": [
      "Hi-Fi and Wi-Fi sound systems",
      "Public address systems",
      "Sound control room integration",
      "System design, sales and installation"
    ],
    "note": "Considered sound, from room to venue.",
    "icon": "audio"
  },
  {
    "imageWidth": 1536,
    "imageHeight": 1024,
    "imageFit": "cover",
    "caption": "Illustrative environment",
    "id": "support",
    "name": "ICT support & consultancy",
    "short": "Expertise behind the technology.",
    "category": "Support",
    "image": "network-system",
    "alt": "Illustrative network environment for ICT support services",
    "intro": "Technical support and consultancy for the systems your organisation relies on. Our services include system administration, ICT support, Internet of Things services and BlackBerry Enterprise support.",
    "items": [
      "ICT support services and consultancy",
      "System administration",
      "Internet of Things services",
      "BlackBerry Enterprise support and consultancy"
    ],
    "note": "Practical support for your ICT environment.",
    "icon": "settings"
  }
];

export const clients = [
  "Border Communities and Development Agency",
  "MoniPulo Petroleum Development Limited",
  "Power Holding Company",
  "G N Iheaku & Co Ltd.",
  "Kingsoo Group Ltd.",
  "KDI Group Ltd.",
  "TMCH Group Inc.",
  "Ibeto Group",
  "Beks Kimse Nigeria Ltd.",
  "Hadnuvo Ltd.",
  "Izinyo & Co.",
  "Royal Court Private School",
  "Utchay Okorji Associates",
  "British High Commission",
  "Lasien Bottling Company",
  "Jacsfitness Hotel & Lounge",
  "Arida Security & Facility Management",
  "West African College of Physicians",
  "Jepp Dynamic Contractors",
  "The Bridge by UOA",
  "Donna Spectre Limited"
];

export const values = [
  {
    "name": "Integrity",
    "description": "Consistency in what we say and do. Adhering to our ethics, even behind closed doors."
  },
  {
    "name": "Professionalism",
    "description": "Upholding the standards of our professions and the culture of our organisation."
  },
  {
    "name": "High quality",
    "description": "Continuously improving our services and the way we work."
  },
  {
    "name": "Innovation",
    "description": "Finding better, more efficient ways to solve the task at hand."
  },
  {
    "name": "Respect",
    "description": "Treating people with dignity and listening to their contribution."
  }
];
