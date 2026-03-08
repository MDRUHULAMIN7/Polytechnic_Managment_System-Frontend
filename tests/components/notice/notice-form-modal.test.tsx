import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoticeFormModal } from "@/components/notice/notice-form-modal";
import { showToast } from "@/utils/common/toast";

vi.mock("@/utils/common/toast", () => ({
  showToast: vi.fn(),
}));

describe("NoticeFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides the admin audience for non super-admin users", () => {
    render(
      <NoticeFormModal
        open
        mode="create"
        canTargetAdmin={false}
        submitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const audienceSelect = screen.getByRole("combobox", { name: /audience/i });
    const options = Array.from(audienceSelect.querySelectorAll("option")).map(
      (option) => option.textContent,
    );

    expect(options).not.toContain("admin");
    expect(
      screen.getByText("Admin audience notices can only be published by super admin."),
    ).toBeInTheDocument();
  });

  it("blocks invalid input and submits a sanitized notice payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const expectedPublishedAt = new Date("2026-03-10T09:00").toISOString();
    const expectedExpiresAt = new Date("2026-03-11T09:00").toISOString();

    render(
      <NoticeFormModal
        open
        mode="create"
        canTargetAdmin
        submitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Create Notice" }));

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "error",
        title: "Missing title",
      }),
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  Mid-term exam schedule  " },
    });
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "  Exam starts next week.  " },
    });
    await user.selectOptions(screen.getByRole("combobox", { name: /audience/i }), "admin");
    fireEvent.change(screen.getByLabelText("Tags"), {
      target: { value: " exam, routine, 2026 " },
    });
    fireEvent.change(screen.getByLabelText("Publish At"), {
      target: { value: "2026-03-10T09:00" },
    });
    fireEvent.change(screen.getByLabelText("Expires At"), {
      target: { value: "2026-03-11T09:00" },
    });

    await user.click(screen.getByRole("button", { name: "Add Attachment" }));

    fireEvent.change(screen.getByPlaceholderText("Attachment 1 name"), {
      target: { value: " Routine " },
    });
    fireEvent.change(screen.getByPlaceholderText("https://example.com/file.pdf"), {
      target: { value: " https://example.com/routine.pdf " },
    });
    fireEvent.change(screen.getByPlaceholderText("pdf"), {
      target: { value: " pdf " },
    });

    await user.click(screen.getByRole("button", { name: "Create Notice" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          title: "Mid-term exam schedule",
          content: "Exam starts next week.",
          targetAudience: "admin",
          category: "general",
          priority: "normal",
          status: "published",
          isPinned: false,
          requiresAcknowledgment: false,
          publishedAt: expectedPublishedAt,
          expiresAt: expectedExpiresAt,
          tags: ["exam", "routine", "2026"],
          attachments: [
            {
              name: "Routine",
              url: "https://example.com/routine.pdf",
              fileType: "pdf",
              size: undefined,
            },
          ],
        },
        undefined,
      );
    });
  });
});
