"use client";

import { useState } from "react";
import type { Notice, NoticeAttachment, NoticeInput } from "@/lib/type/notice";
import {
  NOTICE_AUDIENCES,
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  NOTICE_STATUSES,
} from "@/lib/type/notice";
import { showToast } from "@/utils/common/toast";
import { NoticeModal } from "./notice-modal";

type AttachmentDraft = NoticeAttachment & { key: string };

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function createAttachmentDraft(): AttachmentDraft {
  return {
    key:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    url: "",
    fileType: "",
    size: undefined,
  };
}

function createInitialAttachments(notice?: Notice | null): AttachmentDraft[] {
  return (notice?.attachments ?? []).map((attachment, index) => ({
    key: `${notice?._id ?? "new"}-${index}`,
    ...attachment,
  }));
}

function createInitialTargetAudience(
  notice: Notice | null | undefined,
  canTargetAdmin: boolean,
): NoticeInput["targetAudience"] {
  if (!canTargetAdmin && notice?.targetAudience === "admin") {
    return "public";
  }

  return notice?.targetAudience ?? "public";
}

export function NoticeFormModal({
  open,
  mode,
  notice,
  canTargetAdmin,
  submitting,
  onClose,
  onSubmit,
}: Readonly<{
  open: boolean;
  mode: "create" | "edit";
  notice?: Notice | null;
  canTargetAdmin: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: NoticeInput, noticeId?: string) => Promise<unknown>;
}>) {
  const [title, setTitle] = useState(() => notice?.title ?? "");
  const [content, setContent] = useState(() => notice?.content ?? "");
  const [targetAudience, setTargetAudience] = useState<NoticeInput["targetAudience"]>(
    () => createInitialTargetAudience(notice, canTargetAdmin),
  );
  const [category, setCategory] = useState<NoticeInput["category"]>(
    () => notice?.category ?? "general",
  );
  const [priority, setPriority] = useState<NoticeInput["priority"]>(
    () => notice?.priority ?? "normal",
  );
  const [status, setStatus] = useState<NoticeInput["status"]>(
    () => notice?.status ?? "published",
  );
  const [isPinned, setIsPinned] = useState(() => Boolean(notice?.isPinned));
  const [requiresAcknowledgment, setRequiresAcknowledgment] = useState(
    () => Boolean(notice?.requiresAcknowledgment),
  );
  const [publishedAt, setPublishedAt] = useState(
    () => toDateTimeLocal(notice?.publishedAt),
  );
  const [expiresAt, setExpiresAt] = useState(
    () => toDateTimeLocal(notice?.expiresAt),
  );
  const [tagsInput, setTagsInput] = useState(() => (notice?.tags ?? []).join(", "));
  const [attachments, setAttachments] = useState<AttachmentDraft[]>(
    () => createInitialAttachments(notice),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      showToast({
        variant: "error",
        title: "Missing title",
        description: "Provide a notice title.",
      });
      return;
    }

    if (!content.trim()) {
      showToast({
        variant: "error",
        title: "Missing content",
        description: "Provide notice details.",
      });
      return;
    }

    const normalizedPublishedAt = publishedAt
      ? new Date(publishedAt).toISOString()
      : undefined;
    const normalizedExpiresAt = expiresAt
      ? new Date(expiresAt).toISOString()
      : undefined;

    if (
      normalizedPublishedAt &&
      normalizedExpiresAt &&
      new Date(normalizedExpiresAt) <= new Date(normalizedPublishedAt)
    ) {
      showToast({
        variant: "error",
        title: "Invalid expiry",
        description: "Expiry must be later than publish time.",
      });
      return;
    }

    const sanitizedAttachments = attachments
      .map((item) => ({
        name: item.name.trim(),
        url: item.url.trim(),
        fileType: item.fileType?.trim() || undefined,
        size: item.size,
      }))
      .filter((item) => item.name && item.url);

    await onSubmit(
      {
        title: title.trim(),
        content: content.trim(),
        targetAudience,
        category,
        priority,
        status,
        isPinned,
        requiresAcknowledgment,
        publishedAt: normalizedPublishedAt,
        expiresAt: normalizedExpiresAt,
        tags: tagsInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        attachments: sanitizedAttachments,
      },
      notice?._id,
    );
  }

  return (
    <NoticeModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create Notice" : "Update Notice"}
      description={
        mode === "create"
          ? "Publish a new notice to the board."
          : "Adjust visibility, content, and schedule."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="notice-title"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Title
            </label>
            <input
              id="notice-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Mid-term exam schedule published"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
              maxLength={200}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="notice-content"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Content
            </label>
            <textarea
              id="notice-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
              placeholder="Write the notice content here..."
            />
          </div>

          <div>
            <label
              htmlFor="notice-audience"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Audience
            </label>
            <select
              id="notice-audience"
              value={targetAudience}
              onChange={(event) =>
                setTargetAudience(event.target.value as NoticeInput["targetAudience"])
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-(--surface) dark:text-inherit"
            >
              {NOTICE_AUDIENCES.filter((item) => canTargetAdmin || item !== "admin").map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {!canTargetAdmin ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-(--text-dim)">
                Admin audience notices can only be published by super admin.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="notice-category"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Category
            </label>
            <select
              id="notice-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as NoticeInput["category"])
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-(--surface) dark:text-inherit"
            >
              {NOTICE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="notice-priority"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Priority
            </label>
            <select
              id="notice-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as NoticeInput["priority"])
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-(--surface) dark:text-inherit"
            >
              {NOTICE_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="notice-status"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Status
            </label>
            <select
              id="notice-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as NoticeInput["status"])
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-(--surface) dark:text-inherit"
            >
              {NOTICE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="notice-published-at"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Publish At
            </label>
            <input
              id="notice-published-at"
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
            />
          </div>

          <div>
            <label
              htmlFor="notice-expires-at"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Expires At
            </label>
            <input
              id="notice-expires-at"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="notice-tags"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-(--text-dim)"
            >
              Tags
            </label>
            <input
              id="notice-tags"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="exam, routine, 2026"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4 dark:border-(--line) dark:bg-(--surface-muted)">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Attachments</p>
              <p className="text-xs text-slate-500 dark:text-(--text-dim)">
                Add external file links if needed.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setAttachments((current) => [...current, createAttachmentDraft()])
              }
              className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-transparent dark:text-(--text-dim) dark:hover:bg-(--surface)"
            >
              Add Attachment
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {attachments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-(--text-dim)">No attachments added.</p>
            ) : (
              attachments.map((attachment, index) => (
                <div
                  key={attachment.key}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white/85 p-3 sm:grid-cols-[1fr_1.2fr_140px_auto] dark:border-(--line) dark:bg-(--surface)"
                >
                  <input
                    value={attachment.name}
                    onChange={(event) =>
                      setAttachments((current) =>
                        current.map((item) =>
                          item.key === attachment.key
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder={`Attachment ${index + 1} name`}
                    className="focus-ring h-10 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
                  />
                  <input
                    value={attachment.url}
                    onChange={(event) =>
                      setAttachments((current) =>
                        current.map((item) =>
                          item.key === attachment.key
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="https://example.com/file.pdf"
                    className="focus-ring h-10 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
                  />
                  <input
                    value={attachment.fileType ?? ""}
                    onChange={(event) =>
                      setAttachments((current) =>
                        current.map((item) =>
                          item.key === attachment.key
                            ? { ...item, fileType: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="pdf"
                    className="focus-ring h-10 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm text-slate-700 dark:border-(--line) dark:bg-transparent dark:text-inherit"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((item) => item.key !== attachment.key),
                      )
                    }
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-rose-300/70 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-100/70 dark:border-rose-700/60 dark:text-rose-200 dark:hover:bg-rose-950/40"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-(--text-dim)">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
              className="h-4 w-4 rounded border-(--line)"
            />
            Pin this notice
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-(--text-dim)">
            <input
              type="checkbox"
              checked={requiresAcknowledgment}
              onChange={(event) => setRequiresAcknowledgment(event.target.checked)}
              className="h-4 w-4 rounded border-(--line)"
            />
            Require acknowledgment
          </label>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-(--line) dark:bg-transparent dark:text-(--text-dim) dark:hover:bg-(--surface-muted)"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : mode === "create"
                ? "Create Notice"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </NoticeModal>
  );
}
