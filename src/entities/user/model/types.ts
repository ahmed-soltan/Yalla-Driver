export type CaptainUser = {
  id: number;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  role: 'CAPTAIN';
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  requiresProfileCompletion: boolean;
  user: CaptainUser;
};

export type RefreshedAuthTokens = {
  accessToken: string;
  refreshToken: string;
};
