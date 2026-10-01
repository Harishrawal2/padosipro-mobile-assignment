// ─── User Types ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  isVerified: boolean;
  profileCompleted: boolean;
  name?: string | null;
  mobileNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileOnboardingInput {
  name: string;
  mobileNumber: string;
  address: string;
  businessName?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}
