import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RootNoticeDropdown } from "@/components/common/root-notice-dropdown";
import { getLatestNotices } from "@/lib/api/notice";
import type { LatestNoticePayload, Notice } from "@/lib/type/notice";

vi.mock("@/lib/api/notice", () => ({
  getLatestNotices: vi.fn(),
}));

function createNotice(overrides: Partial<Notice>): Notice {
  return {
    _id: "notice-1",
    title: "Routine updated",
    content: "Updated routine details",
    excerpt: "Updated routine",
    attachments: [],
    targetAudience: "public",
    targetDepartments: [],
    category: "general",
    tags: [],
    priority: "normal",
    isPinned: false,
    publishedAt: "2026-03-08T00:00:00.000Z",
    requiresAcknowledgment: false,
    status: "published",
    createdBy: "admin",
    ...overrides,
  };
}

describe("RootNoticeDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads notices only after opening and does not refetch on reopen", async () => {
    const payload: LatestNoticePayload = {
      pinned: [createNotice({ _id: "notice-1", title: "Pinned", isPinned: true })],
      latest: [createNotice({ _id: "notice-2", title: "Latest" })],
    };
    vi.mocked(getLatestNotices).mockResolvedValue(payload);

    render(<RootNoticeDropdown />);
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: /notice board/i });

    expect(getLatestNotices).not.toHaveBeenCalled();

    await user.click(toggle);

    await waitFor(() => {
      expect(getLatestNotices).toHaveBeenCalledWith(5);
    });

    expect(await screen.findByText("Latest")).toBeInTheDocument();
    expect(screen.getAllByText("Pinned")).toHaveLength(2);
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(toggle);
    await user.click(toggle);

    expect(getLatestNotices).toHaveBeenCalledTimes(1);
  });

  it("shows retry UI when the request fails", async () => {
    vi.mocked(getLatestNotices).mockRejectedValueOnce(new Error("Failed to load notices."));

    render(<RootNoticeDropdown />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /notice board/i }));

    expect(await screen.findByText("Failed to load notices.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
