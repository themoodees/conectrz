import type { LegalDocument } from "./types";

/*
 * DRAFT — structure only. Have the final text written/reviewed by a lawyer
 * familiar with Japanese law. Text in [brackets] is a placeholder.
 */
export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "[YYYY-MM-DD]",
  intro:
    "These Terms govern your use of Conectrz, operated by [Company legal name] (“we”, “us”). By creating an account, you agree to these Terms.",
  sections: [
    {
      heading: "1. Definitions",
      body: [
        "[Define “Service”, “Company” (businesses looking for creators), “Creator” (UGC creators and influencers), “User”, “Content”, and “Plan”.]",
      ],
    },
    {
      heading: "2. Accounts",
      body: [
        "[Eligibility (e.g. minimum age, business users), accurate information, one account per person/company, keeping passwords secure, responsibility for activity on the account.]",
      ],
    },
    {
      heading: "3. Our role",
      body: [
        "[Conectrz is a discovery and messaging platform. We are not a party to agreements between Companies and Creators, and we do not handle contracts, payments between them, deliverables or escrow. Users are responsible for their own agreements.]",
      ],
    },
    {
      heading: "4. Plans and fees",
      body: [
        "[Free plan: a one-time allowance of new conversations. Paid plans: price, number of new conversations per billing period, how plans are started, changed and cancelled, refunds (if any), and tax.]",
      ],
    },
    {
      heading: "5. Creator profiles and content",
      body: [
        "[Creators own their content. License granted to us to display profiles and portfolio on the Service. Creators confirm they have the rights to what they upload. Accuracy of follower counts and rates.]",
      ],
    },
    {
      heading: "6. Prohibited conduct",
      body: [
        "[Spam, harassment, fake profiles, misleading information, contacting users to take business off-platform in bad faith (if applicable), illegal content, scraping, interfering with the Service, violating others' rights.]",
      ],
    },
    {
      heading: "7. Reports, suspension and termination",
      body: [
        "[How reports are handled, our right to pause or close accounts, what happens to data when an account is closed, how users can close their account.]",
      ],
    },
    {
      heading: "8. Disclaimers and limitation of liability",
      body: [
        "[Service provided “as is”, no guarantee of results from creator collaborations, limits of our liability as permitted by the Consumer Contract Act and other applicable law.]",
      ],
    },
    {
      heading: "9. Changes to these Terms",
      body: ["[How and when we notify users of changes, effective date.]"],
    },
    {
      heading: "10. Governing law and jurisdiction",
      body: [
        "[These Terms are governed by the laws of Japan. Exclusive jurisdiction: [e.g. Tokyo District Court].]",
      ],
    },
    {
      heading: "11. Contact",
      body: ["[Company legal name, address, contact email.]"],
    },
  ],
};
