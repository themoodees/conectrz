import type { LegalDocument } from "./types";

/*
 * DRAFT based on how Conectrz actually works, organised around Japan's Act on the Protection of
 * Personal Information (APPI). Have a lawyer familiar with Japanese law review it before launch.
 */
export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "2026-11-07",
  intro:
    "This policy explains how Conectrz (“we”, “us”) handles personal information when you use the Conectrz website and services (the “Service”). It applies to Companies and Creators alike. Words with capital letters have the meaning given in our Terms of Service.",
  sections: [
    {
      heading: "1. Business operator",
      body: [
        "Conectrz. Representative: Sayuri Nakamura. Contact for all privacy matters: hello@conectrz.com.",
      ],
    },
    {
      heading: "2. Information we collect",
      body: [
        "Account information: your name (or company name), email address and password. Passwords are stored in hashed form by our authentication system and we cannot read them.",
        "Creator profile information: first and last name, profile photo, bio, country, prefecture and city, languages, niches, services and rates, payment methods you accept, social media accounts and follower counts, portfolio items, and your availability. Date of birth and gender are optional. Companies see your gender and your age, but not your date of birth.",
        "Company information: company name, contact email, projects you post (title, description, budget, deadline, reference files) and the creators you save.",
        "Activity in the Service: applications, conversations and the messages and attachments (images and videos) you send, reviews you write or receive, reports you submit or that concern you, and notifications.",
        "Billing information (Companies): your plan and subscription status. Card payments are handled by our payment provider, Stripe. We do not see or store your card number; we keep only an identifier that links your account to your Stripe customer record.",
        "Technical information: cookies that keep you signed in (see section 9), and server logs such as IP address, browser type and time of access, used for security and to keep the Service running; and anonymous usage statistics (pages visited, country, device and browser type, and key actions such as signing up or starting a subscription) collected with Vercel Analytics.",
      ],
    },
    {
      heading: "3. Purposes of use",
      body: [
        "We use personal information to: create and manage your account; provide discovery, projects, applications, messaging, reviews and notifications; show Creator profiles to Companies; process Plans and payments; send service emails such as new message notifications, billing and security notices; review reports and keep the Service safe, including preventing fraud and abuse; answer your enquiries; fix problems and improve the Service; and comply with the law.",
        "We do not sell your personal information, and we do not use it for third-party advertising.",
      ],
    },
    {
      heading: "4. What other users can see",
      body: [
        "Creator profiles are visible to signed-in Companies. Messages and attachments are visible only to the two people in the conversation. Reviews of a Creator are shown on the Creator’s profile with the reviewing Company’s name. Reviews of a Company are visible to signed-in Creators and to that Company, with the reviewing Creator’s first name. A Company’s name and projects are visible to signed-in Creators.",
        "Payment between a Company and a Creator is arranged directly between them. If you share payment details with another User in a message, that is your own choice.",
      ],
    },
    {
      heading: "5. Sharing with third parties and service providers",
      body: [
        "We do not provide personal data to third parties without your consent, except where the law allows or requires it (for example, a request from a court or public authority, or when needed to protect life, body or property).",
        "We use the following service providers to run the Service. They handle personal data only on our behalf and for the purposes above: Supabase (database, authentication and file storage); Vercel (website hosting and anonymous usage statistics); Stripe (payments and subscriptions); Resend (sending service emails); and Anthropic (automatic translation of chat messages: when you read a conversation, the text of the messages you receive is sent to Anthropic to be translated into the language you chose, and the translation is stored with the message so it is only translated once. Messages are sent only for this purpose, and you can always see the original text).",
      ],
    },
    {
      heading: "6. Transfers outside Japan",
      body: [
        "Our main database and file storage are located in Tokyo, Japan. Some of our service providers may process data in other countries, including the United States, for example for hosting, payment processing and email delivery. We choose providers that apply security measures in line with the APPI and require them to protect personal data. You can ask us for details about the countries involved and the protection measures at hello@conectrz.com.",
        "If you are a Company outside Japan, your information is necessarily processed in Japan and the countries above.",
      ],
    },
    {
      heading: "7. Retention and deletion",
      body: [
        "We keep your information while your account is open. Creators can delete their account from Settings. Companies can ask us to close their account at hello@conectrz.com. When an account is closed we delete its profile, messages, applications and related data, except for information we must keep by law (for example billing records) or that is needed to handle a pending report, and for copies kept in backups until they expire.",
        "Messages already delivered stay in the other person’s conversation history only for as long as that conversation exists in the Service.",
      ],
    },
    {
      heading: "8. Security measures",
      body: [
        "We take reasonable measures to protect personal information from loss, leakage and unauthorised access. These include: encrypted connections (HTTPS); access rules in our database so users can only read what they are allowed to see; private storage for message attachments, which are accessed through temporary links; limiting administrator access to what is needed; and choosing service providers with appropriate security.",
        "No system is completely secure. Please use a strong, unique password and tell us at hello@conectrz.com if you think your account has been accessed without permission.",
      ],
    },
    {
      heading: "9. Cookies",
      body: [
        "We use cookies that are strictly necessary to keep you signed in and to keep the Service secure. We do not use advertising cookies. We measure how the Service is used with Vercel Analytics, which does not use cookies and does not track you across other websites or build a profile of you; it counts visits and actions in an anonymous way and we use the result only to understand and improve the Service.",
      ],
    },
    {
      heading: "10. Your rights",
      body: [
        "Under the APPI you can ask us to disclose, correct, add to, delete or stop using the personal information we hold about you, and to stop providing it to third parties, where the law gives you that right. You can also change much of your information yourself in your profile and settings.",
        "To make a request, email hello@conectrz.com from the address on your account. We may ask you to confirm your identity first, and we will reply without delay. If you are in another country, you may have additional rights under local law, and we will do our best to respect them.",
      ],
    },
    {
      heading: "11. Age",
      body: [
        "The Service is for people aged 18 or over. We do not knowingly collect personal information from anyone younger. If you think a person under 18 has an account, please tell us and we will delete it.",
      ],
    },
    {
      heading: "12. Changes to this policy",
      body: [
        "If we make a material change, we will notify you by email or in the Service at least 14 days before it takes effect. The date at the top of this page shows when the policy was last updated.",
      ],
    },
    {
      heading: "13. Contact",
      body: [
        "For questions, complaints or requests about your personal information, contact us at hello@conectrz.com.",
      ],
    },
  ],
};
