/*
 * Homepage copy — edit freely.
 * The screens shown next to the steps live in previews.tsx (drawn in code, sample data).
 */

export const HERO = {
  eyebrow: "Creators living in Japan",
  title: "Hire UGC creators and influencers who live in Japan",
  description:
    "Search by niche, language and rate. Post a project and let creators apply. Chat directly and agree the details, including how you'll pay.",
  primaryCta: { label: "Find creators", href: "/signup/company" },
  secondaryCta: { label: "Join as a creator", href: "/signup/creator" },
  note: "Browse for free. Choose a plan when you're ready to start conversations.",
};

export const PAIN = {
  eyebrow: "Save hours of research",
  title: "Stop spending hours searching for creators",
  description:
    "Scrolling through hashtags, cold DMs, rates buried in spreadsheets. Finding the right creator in Japan shouldn't be a second job. Search them all in one place and see who fits in minutes.",
  before: {
    label: "The old way",
    items: [
      "Scrolling Instagram and TikTok for hours",
      "Cold DMs that never get an answer",
      "Rates and portfolios in spreadsheets",
      "Unclear payment terms at the end",
    ],
  },
  after: {
    label: "On Conectrz",
    items: [
      "One search, filtered by niche, language and price",
      "Profiles with services, rates and reviews",
      "Chat in one place, with images and videos",
      "Payment agreed up front",
    ],
  },
};

export const BRAND_STEPS = [
  {
    title: "Find your creator",
    text: "Filter by niche, language, location, platform, price and more. Or post a project and let creators come to you.",
  },
  {
    title: "Check the fit",
    text: "See services, rates, portfolios and reviews from other brands before you reach out.",
  },
  {
    title: "Talk it through",
    text: "Message creators directly and share references, images and videos.",
  },
  {
    title: "Agree how to pay",
    text: "Choose how you'll pay up front: bank transfer, PayPal, Wise or Stripe. You and the creator settle it directly.",
  },
];

export const CREATOR_STEPS = [
  {
    title: "Build your profile",
    text: "Add your services, niches, languages and portfolio. No follower minimum.",
  },
  {
    title: "Find projects",
    text: "Browse open briefs and filter by niche, service, budget and deadline.",
  },
  {
    title: "Apply with your price",
    text: "Send a short message and your price, and say which payment methods you accept.",
  },
  {
    title: "Work directly with the brand",
    text: "Agree the details in chat and know how you'll be paid before you start.",
  },
];

export const WHY = {
  eyebrow: "Why Conectrz",
  title: "Built for working with creators in Japan",
  items: [
    {
      title: "Based in Japan",
      text: "Japanese and international creators who live in Japan, in the languages your audience speaks.",
      icon: "map",
    },
    {
      title: "Search that fits",
      text: "Filters for niche, language, location, platform, price, age and gender.",
      icon: "search",
    },
    {
      title: "A projects board",
      text: "Post a brief and creators apply with a message and a price.",
      icon: "briefcase",
    },
    {
      title: "Reviews from brands",
      text: "Companies that have talked with a creator can leave a rating and a comment.",
      icon: "star",
    },
    {
      title: "Chat with references",
      text: "Share images and videos right in the conversation.",
      icon: "message",
    },
    {
      title: "Clear payment terms",
      text: "Both sides say how they'll pay and get paid from the start.",
      icon: "check",
    },
  ],
} as const;

export const FAQ = [
  {
    q: "Is Conectrz free for creators?",
    a: "Yes. Creating a profile and applying to projects is free for creators.",
  },
  {
    q: "Do I need a lot of followers?",
    a: "No. UGC creators are welcome, with or without a big audience.",
  },
  {
    q: "How do payments work?",
    a: "The brand and the creator agree on a payment method and pay each other directly. Conectrz doesn't process, hold or guarantee payments.",
  },
  {
    q: "What can brands see on the Free plan?",
    a: "Free plans can browse creators (first names and audience sizes). Paid plans show full names, city and social links, and let you start conversations.",
  },
];

export const CLOSING = {
  title: "Ready to meet your next creator?",
  description: "Create a company account and start discovering creators today.",
  cta: { label: "Get started", href: "/signup/company" },
};
