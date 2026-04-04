import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import Sources from "./Sources";
import type { Source } from "./Sources";

export interface MessageProps {
  role: "user" | "ai";
  content: string;
  sources?: Source[];
}

export default function MessageBubble({
  role,
  content,
  sources,
}: MessageProps) {
  const isAI = role === "ai";

  return (
    <div
      className={`flex w-full ${isAI ? "justify-start" : "justify-end"} mb-6`}
    >
      <div
        className={`flex gap-4 max-w-[85%] ${isAI ? "flex-row" : "flex-row-reverse"}`}
      >
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isAI
              ? "bg-[#E0E7FF] dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          {isAI ? <Bot size={18} /> : <User size={18} />}
        </div>

        <div className="flex flex-col max-w-full">
          <div
            className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed wrap-break-word ${
              isAI
                ? "bg-[#F9FAFB] dark:bg-[#1E293B] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800/60"
                : "bg-[#3B82F6] text-white rounded-tr-sm"
            } ${isAI ? "rounded-tl-sm" : ""}`}
          >
            <div className={isAI ? "markdown-body" : ""}>
              {isAI ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap m-0">{content}</p>
              )}
            </div>

            {isAI && sources && sources.length > 0 && (
              <Sources sources={sources} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
