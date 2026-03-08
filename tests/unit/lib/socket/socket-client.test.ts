import { afterEach, describe, expect, it } from "vitest";
import { resolveSocketBaseUrl } from "@/lib/socket/socket-client";

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const originalSocketBase = process.env.NEXT_PUBLIC_SOCKET_URL;

describe("resolveSocketBaseUrl", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    process.env.NEXT_PUBLIC_SOCKET_URL = originalSocketBase;
  });

  it("prefers an explicit socket url when provided", () => {
    process.env.NEXT_PUBLIC_SOCKET_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/api/v1";

    expect(resolveSocketBaseUrl()).toBe("https://api.example.com");
  });

  it("derives the socket base url from the api base url", () => {
    delete process.env.NEXT_PUBLIC_SOCKET_URL;
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5000/api/v1";

    expect(resolveSocketBaseUrl()).toBe("http://localhost:5000");
  });
});
