import { describe, expect, it } from "vitest";
import { dashboardPathByRole, parseTokenRole } from "@/utils/auth/login";

function createToken(role: unknown) {
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `header.${payload}.signature`;
}

describe("auth login utils", () => {
  it("maps each role to the correct dashboard path", () => {
    expect(dashboardPathByRole("student")).toBe("/dashboard/student");
    expect(dashboardPathByRole("instructor")).toBe("/dashboard/instructor");
    expect(dashboardPathByRole("admin")).toBe("/dashboard/admin");
    expect(dashboardPathByRole("superAdmin")).toBe("/dashboard/admin");
  });

  it("parses a valid token role and rejects invalid payloads", () => {
    expect(parseTokenRole(createToken("instructor"))).toBe("instructor");
    expect(parseTokenRole(createToken("unknown-role"))).toBeNull();
    expect(parseTokenRole("bad-token")).toBeNull();
  });
});
