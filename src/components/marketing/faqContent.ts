/*
 * FAQ page copy — edit freely. Plain text answers (they are also sent to search engines).
 * Keep it true to what the product does today; prices live on /pricing, not here.
 */

export interface FaqGroup {
  id: "brands" | "creators" | "general";
  title: string;
  intro: string;
  items: { q: string; a: string }[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "brands",
    title: "For brands",
    intro: "Finding creators, starting conversations and posting projects.",
    items: [
      {
        q: "Is it free to join?",
        a: "Creating a company account is free. The Free plan lets you browse creators (first names and audience sizes) and post projects. To start conversations and see creators' full names, city and social links, choose a paid plan. You can see the plans on the Pricing page.",
      },
      {
        q: "How do I find the right creator?",
        a: "Open Discover and filter by niche, location, language, platform, services, price, age, gender, audience size and availability. Open a profile to see services, rates, portfolio and reviews, and save the ones you like to come back to them later.",
      },
      {
        q: "How do I contact a creator?",
        a: "Open the creator's profile and send a message to start a conversation. Starting conversations needs a paid plan, and each plan includes a number of new conversations per month. Replies inside an existing conversation are unlimited on paid plans.",
      },
      {
        q: "What is a project?",
        a: "A project is a brief you post for creators to see: what you need, your budget, the deadline, the services, niches and languages you want, and how you will pay. Creators then apply with a message and their own price, and you review the applications. Posting a project doesn't need a paid plan, and you can close it at any time so no one else can apply.",
      },
      {
        q: "Can I share references and files?",
        a: "Yes. In a project you can add links and images (for example a mood board or product photos) that creators see on the project page. In a conversation you can send up to 5 images (10 MB each) or videos (50 MB each) per message.",
      },
      {
        q: "How do I pay a creator?",
        a: "Directly. You and the creator agree on the amount and the payment method, such as bank transfer, PayPal, Wise or Stripe, and pay each other outside Conectrz. In a project you choose the methods you can pay with, and creators say which ones they accept, so both sides know before any work starts.",
      },
      {
        q: "How do reviews work?",
        a: "After you have had a conversation with a creator, you can leave a rating from 1 to 5 stars and a short comment on their profile. Reviews are published right away and help other brands choose.",
      },
      {
        q: "How do I change or cancel my plan?",
        a: "Go to Plans in your account. You can switch plans there or cancel. A cancellation takes effect at the end of the period you have already paid for.",
      },
    ],
  },
  {
    id: "creators",
    title: "For creators",
    intro: "Joining, getting found, applying to projects and getting paid.",
    items: [
      {
        q: "Is Conectrz free for creators?",
        a: "Yes. Creating a profile and applying to projects is free for creators.",
      },
      {
        q: "Who can join as a creator?",
        a: "Creators who live in Japan, Japanese or international. You don't need a minimum number of followers, and UGC creators are welcome: you can create content for a brand's own channels, post to your own audience, or both.",
      },
      {
        q: "How do I get my profile in front of brands?",
        a: "Add your prefecture, at least one language and at least one service with your price. Once those are in place your profile is published and brands can find it in search. A photo, a short bio and portfolio examples make a big difference.",
      },
      {
        q: "What can brands see about me?",
        a: "Brands on the Free plan see your first name and audience size. Brands on paid plans see your full name, city, social handles and links. Your date of birth is never shown: if you add it, brands only see your age. Age and gender are optional.",
      },
      {
        q: "How do I set my rates?",
        a: "Each service on your profile has its own price in US dollars, for example a TikTok video or an Instagram Reel. Brands can filter by price, so keep your rates up to date.",
      },
      {
        q: "How do I find projects and apply?",
        a: "Open Projects to see briefs from brands. Filter by niche, service, language, budget, payment method and deadline, and sort by newest, budget or deadline. To apply, write a short message and give your price. You can apply once per project and withdraw your application if your plans change.",
      },
      {
        q: "How do I get paid?",
        a: "Directly by the brand. Add the payment methods you accept to your profile, and check how the brand plans to pay on the project page. You agree the details in the chat before you start, and Conectrz is not involved in the payment.",
      },
      {
        q: "What are reviews?",
        a: "Brands you have talked with can rate you from 1 to 5 stars and leave a comment. They show on your profile, so a good review helps you get chosen.",
      },
      {
        q: "How will I know when a brand writes to me?",
        a: "The bell at the top of the page shows new messages, projects that match your services and updates on your applications. We also email you when a new message arrives.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Settings and choose Delete my account. Your personal details are removed and you are taken out of search. Past conversations stay visible to the brands you talked with, without your details.",
      },
    ],
  },
  {
    id: "general",
    title: "General",
    intro: "Payments, safety and getting in touch.",
    items: [
      {
        q: "What is Conectrz?",
        a: "Conectrz is a platform where brands find and work with UGC creators and influencers who live in Japan. Brands search for creators and post projects. Creators build a profile and apply to the projects they like.",
      },
      {
        q: "Does Conectrz handle payments?",
        a: "No. Conectrz does not process, hold or guarantee payments, and it is not a party to the agreement between a brand and a creator. You agree the amount and how it will be paid directly, so we recommend settling the details in the chat before work begins.",
      },
      {
        q: "Which languages does Conectrz support?",
        a: "The site is in English. Creators list the languages they speak, and brands can filter creators by language.",
      },
      {
        q: "How do I report a problem?",
        a: "Use the report option on a creator's profile or in a conversation. Our team reviews reports and can pause or close accounts that break the rules. For anything else, contact us by email.",
      },
    ],
  },
];
