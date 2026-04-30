import { CREATORS, type Creator } from "./creators-data";

export type Persona = {
  slug: string;
  name: string;
  title: string;
  avatar: string;
  about: string;
  starters: string[];
};

function creatorToPersona(c: Creator): Persona {
  return {
    slug: c.id,
    name: c.name,
    title: c.title,
    avatar: c.modalImg,
    about: c.about,
    starters: c.questions,
  };
}

const HOME_CREATOR_PERSONAS: Persona[] = CREATORS.map(creatorToPersona);

const FIND_EXPERT_PERSONAS: Persona[] = [
  {
    slug: "brandon-burchard",
    name: "Brandon Burchard",
    title: "High Performance Coach",
    avatar: "/website/figma/f8d7ced3013accaed1151579100cc96a965d3928.png",
    about:
      "High performance strategist who has coached Fortune 500 executives and Olympic athletes on focus, energy, and productivity habits.",
    starters: [
      "How do I build a morning routine?",
      "How do I stay focused for long work sessions?",
      "What's the #1 habit of high performers?",
    ],
  },
  {
    slug: "dr-todd-howard",
    name: "Dr. Todd Howard",
    title: "Health & Wellness Expert",
    avatar: "/website/figma/20f624e77c9897b40a7dc38e9399123232d89dda.png",
    about:
      "Board-certified physician and wellness coach specialising in metabolic health, sleep, and longevity.",
    starters: [
      "How can I improve my sleep quality?",
      "What tests should I ask my doctor for?",
      "How do I lower my resting heart rate?",
    ],
  },
  {
    slug: "dr-tom-segall",
    name: "Dr. Tom Segall",
    title: "Business Strategy Coach",
    avatar: "/website/figma/dc207af7696cb49ecaae3764d2879afae843fcb3.png",
    about:
      "Business strategy coach who helps founders craft positioning, pricing, and go-to-market plans that compound.",
    starters: [
      "How do I price my new product?",
      "What's a good go-to-market for a B2B SaaS?",
      "How do I find my first 10 customers?",
    ],
  },
  {
    slug: "nick-drab",
    name: "Nick Drab",
    title: "Finance & Investment Advisor",
    avatar: "/website/figma/b23ab8a387c695d1faaf2ba292d5c72d6f85a8df.png",
    about:
      "Finance and investment advisor focused on portfolio construction, risk management, and long-term wealth building.",
    starters: [
      "How do I start investing with $1000?",
      "What's a safe withdrawal rate in retirement?",
      "How should I think about asset allocation?",
    ],
  },
];

export const PERSONAS: Persona[] = [
  ...HOME_CREATOR_PERSONAS,
  ...FIND_EXPERT_PERSONAS,
];

export function getPersonaBySlug(slug: string): Persona | null {
  return PERSONAS.find((p) => p.slug === slug) ?? null;
}
