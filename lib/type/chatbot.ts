export type ChatbotIntent =
  | "ai"
  | "department_recommendation"
  | "department_list"
  | "semester_current"
  | "semester_registration"
  | "semester_list"
  | "instructor_list"
  | "fallback";

export type ChatbotConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatbotReply = {
  question: string;
  answer: string;
  matchedIntent: ChatbotIntent;
  suggestions: string[];
  source?: "ai" | "fallback";
};

export type ChatbotApiResponse = {
  success?: boolean;
  message?: string;
  data?: ChatbotReply;
};
