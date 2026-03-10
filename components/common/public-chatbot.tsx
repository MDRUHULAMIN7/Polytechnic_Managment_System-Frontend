"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  LoaderCircle,
  MessageCircleQuestion,
  SendHorizontal,
  X
} from "lucide-react";
import { askPublicChatbot } from "@/lib/api/chatbot";
import type { ChatbotConversationMessage } from "@/lib/type/chatbot";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  suggestions?: string[];
  shouldAnimate?: boolean;
};

const starterPrompts = [
  "Kon department bhalo hobe?",
  "Ekhon kon semester cholse?",
  "Kon kon department ase?",
  "Instructor ke ke ase?"
];

const initialMessage: ChatMessage = {
  id: "assistant-intro",
  role: "assistant",
  text:
    "Department, semester, registration, ba instructor niye prosno korun. Follow-up prosno o korte parben.",
  suggestions: starterPrompts
};

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function AssistantText({
  text,
  animate,
  onProgress
}: {
  text: string;
  animate?: boolean;
  onProgress?: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const progressRef = useRef(onProgress);

  useEffect(() => {
    progressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    if (!animate) {
      return;
    }

    const chunks = text.split(/(\s+)/);

    if (chunks.length <= 1) {
      const timeout = window.setTimeout(() => {
        setVisibleCount(text.length);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    let index = 0;
    let composedLength = 0;

    const interval = window.setInterval(() => {
      composedLength += chunks[index]?.length ?? 0;
      index += 1;
      setVisibleCount(Math.min(composedLength, text.length));
      progressRef.current?.();

      if (index >= chunks.length) {
        window.clearInterval(interval);
      }
    }, 34);

    return () => window.clearInterval(interval);
  }, [animate, text]);

  return <>{animate ? text.slice(0, visibleCount) : text}</>;
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "0px";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
}

export function PublicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const reduceMotion = useReducedMotion();

  function closeChatbot() {
    setIsOpen(false);
    setMessages((current) =>
      current.map((message) => ({
        ...message,
        shouldAnimate: false
      }))
    );
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setMessages((current) =>
          current.map((message) => ({
            ...message,
            shouldAnimate: false
          }))
        );
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
      if (inputRef.current) {
        resizeTextarea(inputRef.current);
      }
    }, 140);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior
    });
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    scrollToBottom();
  }, [isOpen, isSubmitting, messages]);

  async function submitQuestion(nextQuestion?: string) {
    const trimmedQuestion = (nextQuestion ?? question).trim();

    if (!trimmedQuestion || isSubmitting) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      text: trimmedQuestion
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError(null);
    setIsSubmitting(true);

    if (inputRef.current) {
      inputRef.current.style.height = "48px";
    }

    try {
      const conversationHistory: ChatbotConversationMessage[] = messages
        .map((message) => ({
          role: message.role,
          content: message.text
        }))
        .slice(-8);

      const reply = await askPublicChatbot(trimmedQuestion, conversationHistory);

      setMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          text: reply.answer,
          suggestions: reply.suggestions,
          shouldAnimate: true
        }
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Assistant response could not be loaded.";

      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant-error"),
          role: "assistant",
          text: "Ei muhurte answer ana jacche na. Ektu pore abar try korun.",
          suggestions: starterPrompts,
          shouldAnimate: true
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  const latestSuggestions =
    [...messages].reverse().find((message) => message.suggestions?.length)?.suggestions ??
    starterPrompts;

  return (
    <LayoutGroup>
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            key="chatbot-fab"
            type="button"
            onClick={() => setIsOpen(true)}
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className="group fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center"
            aria-label="Open PMS assistant"
          >
            <motion.span
              layoutId="pms-chatbot-shell"
              transition={
                reduceMotion
                  ? { duration: 0.01 }
                  : { type: "spring", stiffness: 320, damping: 38 }
              }
              className="absolute inset-0 rounded-full border border-(--line) bg-(--surface) shadow-[0_18px_38px_rgba(15,23,42,0.16)]"
            >
              <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(75,125,233,0.18),transparent_58%)]" />
            </motion.span>

            <span className="relative inline-flex items-center justify-center text-(--text)">
              <MessageCircleQuestion className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-3 ring-(--surface)" />
            </span>

            <span className="pointer-events-none absolute right-16 hidden rounded-full border border-(--line) bg-(--surface) px-3 py-1 text-xs font-medium text-(--text-dim) shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:block sm:translate-x-2 sm:opacity-0 sm:transition sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
              Ask PMS
            </span>
          </motion.button>
        ) : (
          <>
            <motion.button
              key="chatbot-backdrop"
              type="button"
              aria-label="Close assistant"
              onClick={closeChatbot}
              className="fixed inset-0 z-50 bg-slate-950/26 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0.01 } : { duration: 0.18 }}
            />

            <motion.section
              key="chatbot-panel"
              role="dialog"
              aria-modal="true"
              aria-label="PMS assistant"
              initial={
                reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.99 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
              transition={
                reduceMotion ? { duration: 0.01 } : { duration: 0.32, ease: "easeOut" }
              }
              className="fixed bottom-3 left-3 right-3 z-50 flex h-[min(42rem,calc(85vh-1.5rem))] flex-col overflow-visible sm:bottom-5 sm:left-auto sm:right-5 sm:w-[24rem]"
            >
              <motion.div
                layoutId="pms-chatbot-shell"
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : { type: "spring", stiffness: 320, damping: 42 }
                }
                className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-(--line) bg-(--surface) text-(--text) shadow-[0_28px_90px_rgba(15,23,42,0.22)]"
              >
              <div className="border-b border-(--line) bg-[linear-gradient(180deg,rgba(75,125,233,0.08),transparent_120%)] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--surface) px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-(--surface-muted) text-(--accent)">
                        <Bot className="h-3.5 w-3.5" />
                      </span>
                      PMS Assistant
                    </div>
                   
                  </div>

                  <button
                    type="button"
                    onClick={closeChatbot}
                    className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--line) bg-(--surface) text-(--text-dim) transition hover:bg-(--surface-muted) hover:text-(--text)"
                    aria-label="Close assistant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                ref={viewportRef}
                className="scrollbar-soft flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(75,125,233,0.08),transparent_30%),var(--bg)] px-4 py-4"
              >
                {messages.map((message) => (
                  <motion.article
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                      message.role === "assistant"
                        ? "self-start border border-(--line) bg-(--surface) shadow-[0_12px_26px_rgba(15,23,42,0.06)]"
                        : "self-end bg-(--accent) text-(--accent-ink) shadow-[0_14px_30px_rgba(75,125,233,0.22)]"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <AssistantText
                        text={message.text}
                        animate={message.shouldAnimate}
                        onProgress={() => scrollToBottom("auto")}
                      />
                    ) : (
                      message.text
                    )}
                  </motion.article>
                ))}

                {isSubmitting ? (
                  <motion.article
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="self-start rounded-[1.35rem] border border-(--line) bg-(--surface) px-4 py-3 text-sm text-(--text-dim) shadow-[0_12px_26px_rgba(15,23,42,0.06)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Thinking...
                    </span>
                  </motion.article>
                ) : null}
              </div>

              <div className="border-t border-(--line) bg-(--surface) px-4 py-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {latestSuggestions.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void submitQuestion(suggestion)}
                      disabled={isSubmitting}
                      className="rounded-full border border-(--line) bg-(--surface-muted) px-3 py-1.5 text-xs font-medium text-(--text-dim) transition hover:border-(--accent) hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <form
                  className="rounded-[1.4rem] border border-(--line) bg-(--bg) p-2 shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitQuestion();
                  }}
                >
                  <label className="sr-only" htmlFor="floating-chatbot-question">
                    Ask PMS assistant
                  </label>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      id="floating-chatbot-question"
                      value={question}
                      onChange={(event) => {
                        setQuestion(event.target.value);
                        resizeTextarea(event.target);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void submitQuestion();
                        }
                      }}
                      placeholder="Type your question..."
                      rows={1}
                      className="min-h-8 max-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-(--text-dim)"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={isSubmitting || !question.trim()}
                      className=" inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--accent) text-(--accent-ink) shadow-[0_12px_26px_rgba(75,125,233,0.24)] transition disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Send message"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </motion.button>
                  </div>
                </form>

                {error ? (
                  <p className="mt-3 text-xs text-rose-600">{error}</p>
                ) : null}
              </div>
              </motion.div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
