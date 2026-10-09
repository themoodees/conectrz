import type { LegalDocument } from "./types";

/*
 * DRAFT — structure only, organised around Japan's Act on the Protection of
 * Personal Information (APPI / 個人情報保護法). Have the final text written/reviewed
 * by a lawyer. Text in [brackets] is a placeholder.
 */
export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "[YYYY-MM-DD]",
  intro:
    "This policy explains how [Company legal name] handles personal information when you use Conectrz.",
  sections: [
    {
      heading: "1. Business operator",
      body: ["[Company legal name, address, representative's name.]"],
    },
    {
      heading: "2. Information we collect",
      body: [
        "[Account details (name, company name, email, password — stored securely by our authentication provider). Creator profile information (display name, photo, location, languages, niches, services and rates, social accounts, portfolio). Messages between users. Saved creators, reports. Technical data (cookies needed to keep you signed in, logs).]",
      ],
    },
    {
      heading: "3. Purposes of use",
      body: [
        "[Providing the Service (discovery, messaging, plans), showing creator profiles to companies, account support, safety and moderation (handling reports), improving the Service, communicating important notices.]",
      ],
    },
    {
      heading: "4. Sharing with third parties",
      body: [
        "[Creator profiles are visible to signed-in companies. We do not provide personal data to third parties without consent except as permitted by law. Service providers we use (e.g. Supabase for database, authentication and file storage; [hosting provider]).]",
      ],
    },
    {
      heading: "5. Transfers outside Japan",
      body: [
        "[Which providers may process data outside Japan, the countries involved, and the protection measures in place, as required by APPI.]",
      ],
    },
    {
      heading: "6. Security measures",
      body: [
        "[Summary of safety management measures: access controls, encryption in transit, restricted admin access, staff training, etc.]",
      ],
    },
    {
      heading: "7. Your rights",
      body: [
        "[How to request disclosure, correction, suspension of use or deletion of your personal information, and how we verify identity. Contact point for requests.]",
      ],
    },
    {
      heading: "8. Cookies",
      body: ["[Cookies used to keep you signed in; any analytics cookies if added later.]"],
    },
    {
      heading: "9. Changes to this policy",
      body: ["[How changes are announced.]"],
    },
    {
      heading: "10. Contact",
      body: ["[Personal information inquiries contact: email / address.]"],
    },
  ],
};
