/** A creator's review of a brand. */
export interface CompanyReview {
  id: string;
  rating: number;
  comment: string | null;
  creatorName: string;
  createdAt: string;
  /** The signed-in creator wrote this review. */
  isMine: boolean;
}

/** A brand's public page, as creators see it. */
export interface CompanyPublicProfile {
  id: string;
  name: string;
  joinedAt: string;
  ratingAverage: number | null;
  reviewCount: number;
}
