import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/common/login-form";
import { loginUser } from "@/lib/api/auth/login";
import { showToast } from "@/utils/common/toast";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/lib/api/auth/login", () => ({
  loginUser: vi.fn(),
}));

vi.mock("@/utils/common/toast", () => ({
  showToast: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits credentials and redirects to the role dashboard", async () => {
    vi.mocked(loginUser).mockResolvedValue({
      role: "admin",
      needsPasswordChange: false,
    });

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("User ID"), "A-0001");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ id: "A-0001", password: "secret" });
    });

    expect(pushMock).toHaveBeenCalledWith("/dashboard/admin");
    expect(refreshMock).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: "Login successful",
      }),
    );
  });

  it("shows the API error when login fails", async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error("Invalid credentials."));

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("User ID"), "A-0001");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Login failed",
        description: "Invalid credentials.",
      }),
    );
  });

  it("locks the login screen while authentication is pending", async () => {
    let resolveLogin: (value: { role: "admin"; needsPasswordChange: false }) => void =
      () => undefined;

    vi.mocked(loginUser).mockImplementation(
      () =>
        new Promise<{ role: "admin"; needsPasswordChange: false }>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("User ID"), "A-0001");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByRole("status", { name: "Signing in" })).toBeInTheDocument();
    expect(screen.getByLabelText("User ID")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled();

    resolveLogin({ role: "admin", needsPasswordChange: false });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard/admin");
    });
  });
});
