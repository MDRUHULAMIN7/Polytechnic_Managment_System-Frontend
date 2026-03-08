import type {
  LoginInput,
  LoginResponse,
  LoginResult
} from "@/lib/type/auth/login";

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in environment.");
  }

  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input)
  });

  const payload = (await response.json()) as LoginResponse;
  const role = payload.data?.role;

  if (!response.ok || !payload.success || !role) {
    throw new Error(payload.message || "Login failed. Check credentials.");
  }

  return {
    role,
    needsPasswordChange: payload.data?.needsPasswordChange
  };
}
