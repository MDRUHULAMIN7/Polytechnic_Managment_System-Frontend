export type AuthRole = "admin" | "superAdmin" | "instructor" | "student";

export type LoginInput = {
  id: string;
  password: string;
};

export type LoginResponseData = {
  accessToken?: string;
  needsPasswordChange?: boolean;
};

export type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: LoginResponseData;
};

export type LoginResult = {
  accessToken: string;
  needsPasswordChange?: boolean;
};

export type AuthTokenPayload = {
  role?: unknown;
};
