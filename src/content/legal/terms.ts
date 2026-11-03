import type { LegalDocument } from "./types";

/*
 * DRAFT based on how Conectrz actually works. Text in [brackets] still needs a decision or the
 * company's details. Have a lawyer familiar with Japanese law review it before launch.
 */
export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "2026-11-03",
  intro:
    "These Terms govern your use of Conectrz, operated by Conectrz (“we”, “us”). By creating an account or using the Service, you agree to these Terms. If you do not agree, please do not use the Service.",
  sections: [
    {
      heading: "1. Definitions",
      body: [
        "“Service” means the Conectrz website and related features, including creator profiles, search, projects, applications, messaging and reviews.",
        "“Company” means a business or individual that uses the Service to find creators. “Creator” means a UGC creator or influencer living in Japan who has a profile on the Service. “User” means a Company or a Creator. “Content” means anything a User uploads or writes on the Service, such as profile details, portfolio items, project descriptions, messages, attachments and reviews. “Plan” means a paid or free subscription for Companies.",
      ],
    },
    {
      heading: "2. Accounts",
      body: [
        "You must provide accurate and current information and keep it up to date. Each person or company may hold one account. Creators must be individuals who live in Japan. Companies may be located anywhere in the world.",
        "You are responsible for keeping your password secure and for everything that happens under your account. Tell us promptly at hello@conectrz.com if you suspect unauthorised use.",
        "You must be at least 18 years old, or the age of majority where you live, to create an account.",
      ],
    },
    {
      heading: "3. Our role",
      body: [
        "Conectrz is a platform for discovery and messaging between Companies and Creators. We are not a party to any agreement between a Company and a Creator, and we are not an agency, employer or representative of either side.",
        "Companies and Creators agree the scope of work, deliverables, usage rights, deadlines and price directly with each other. Payment between a Company and a Creator is arranged directly between them. Conectrz does not process, hold or guarantee those payments, and is not responsible for unpaid fees, late delivery or disputes between Users. We recommend putting every agreement in writing before work starts.",
      ],
    },
    {
      heading: "4. Plans and fees",
      body: [
        "Creators can use Conectrz for free.",
        "Companies can browse creators on the Free plan. Starting new conversations with Creators requires a paid Plan. Each Plan includes a number of new conversations per billing period: the Pro plan (US$39 per month) includes 10 new conversations, and the Business plan (US$99 per month) includes unlimited new conversations, up to 10 new conversations per day. Replying in a conversation you or the other User already started does not use a new conversation. Current Plans and prices are always shown on our Plans page.",
        "Paid Plans are billed monthly in advance by our payment provider, Stripe, and renew automatically until cancelled. You can change or cancel your Plan at any time from Account settings (Manage billing). All prices include Japanese consumption tax. Payments are non-refundable: we do not give refunds for amounts already charged, including for a partly used billing period. [Confirm: when a cancellation takes effect, e.g. at the end of the current billing period, and what the Company keeps until then.] If we change our prices, we will tell you in advance, and the change applies from your next billing period.",
      ],
    },
    {
      heading: "5. Profiles, content and licence",
      body: [
        "You keep ownership of your Content. You grant us a non-exclusive, worldwide, royalty-free licence to host, store, display and distribute your Content as needed to operate and promote the Service (for example, showing a Creator’s profile and portfolio to Companies). This licence ends when you delete the Content or your account, except for copies that are needed for backups or legal obligations, and for messages already delivered to other Users.",
        "You confirm that you have the rights to everything you upload and that it does not infringe anyone else’s rights. Creators are responsible for the accuracy of their profile information, including follower counts, rates, languages and availability. Companies are responsible for the accuracy of their project descriptions, budgets and deadlines.",
        "Messages and attachments you send are shared with the other participant in the conversation. Do not share information in them that you are not willing to share with that person.",
      ],
    },
    {
      heading: "6. Reviews",
      body: [
        "Companies who have spoken with a Creator may leave a review about that Creator, and Creators who have spoken with a Company may leave a review about that Company. Each User may leave one review per counterpart and can edit or delete it later. Reviews of a Company are visible to logged-in Creators and to that Company. Reviews of a Creator are visible on the Creator’s profile.",
        "Reviews must be honest, based on your own experience, and must not contain personal data, threats, hate speech or false statements. We may hide or remove a review that breaks these Terms. We do not verify that a review is accurate and are not responsible for its content.",
      ],
    },
    {
      heading: "7. Prohibited conduct",
      body: [
        "You must not: create fake or misleading profiles or reviews; impersonate another person or company; send spam or unsolicited bulk messages; harass, threaten or discriminate against others; post illegal, hateful or sexually explicit content; upload malware or content you do not have the right to share; scrape, copy or collect data from the Service by automated means; share your account; try to bypass Plan limits or security measures; or use the Service in a way that breaks any applicable law.",
        "Companies must not use Creator contact or profile information for anything other than genuine collaboration enquiries.",
      ],
    },
    {
      heading: "8. Reports, suspension and termination",
      body: [
        "Users can report profiles, projects, messages or reviews. We review reports and may warn a User, hide Content, pause an account or close it, with or without prior notice where we reasonably think these Terms have been broken or other Users may be harmed.",
        "You can close your account at any time. Creators can delete their account from Settings. Companies can ask us to close their account by writing to hello@conectrz.com. Closing an account removes your profile and, subject to what we must keep by law, deletes your personal data as described in our Privacy Policy. Closing a Company account also cancels its paid Plan. As stated in section 4, no refund is given for the current billing period.",
      ],
    },
    {
      heading: "9. Disclaimers and limitation of liability",
      body: [
        "The Service is provided “as is” and “as available”. We do not guarantee that it will be uninterrupted or error-free, that any Creator or Company will respond, or that a collaboration will lead to any particular result. We do not verify the identity, skills, reach or claims of Users beyond what we say on the Service.",
        "To the maximum extent permitted by law, we are not liable for indirect or consequential losses, lost profits or lost business, or for disputes between Users. Our total liability to you for any claim related to the Service is limited to the fees you paid us in the 12 months before the claim. Nothing in these Terms limits liability that cannot be limited under applicable law, including our liability for wilful misconduct or gross negligence and any rights you have under the Consumer Contract Act of Japan.",
      ],
    },
    {
      heading: "10. Changes to the Service and to these Terms",
      body: [
        "We may update the Service and these Terms from time to time. If we make a material change, we will notify you by email or in the Service at least 14 days before it takes effect. Continuing to use the Service after the effective date means you accept the updated Terms. The date at the top of this page shows when the Terms were last updated.",
      ],
    },
    {
      heading: "11. Governing law",
      body: ["These Terms are governed by the laws of Japan."],
    },
    {
      heading: "12. Contact",
      body: [
        "Conectrz, [Address]. Email: hello@conectrz.com. See also our Privacy Policy and the Legal Notice (特定商取引法に基づく表記).",
      ],
    },
  ],
};
