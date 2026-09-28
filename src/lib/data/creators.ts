import type { Creator } from "@/types/creator";
import type { DiscoveryFilterOptions } from "@/types/discovery";
import { mockCreators } from "@/mocks/creators";
import { mockFilterOptions } from "@/mocks/filterOptions";

/*
 * Data access for Creator Discovery.
 * Pages call these functions — never the mocks directly — so switching to
 * Supabase only means changing the bodies below.
 */

export async function getDiscoverableCreators(): Promise<Creator[]> {
  // TODO(supabase): query creator_profiles (status = 'active') with
  // languages, niches, services and social_accounts, mapped to `Creator`.
  return mockCreators;
}

export async function getDiscoveryFilterOptions(): Promise<DiscoveryFilterOptions> {
  // TODO(supabase): read active rows from niches / languages / services.
  return mockFilterOptions;
}
