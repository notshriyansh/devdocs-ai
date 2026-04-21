import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import Sources from "./Sources";
import type { Source } from "./Sources";
import TypingIndicator from "./TypingIndicator";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full ${isAI ? "justify-start" : "justify-end"} mb-5`}
    >
      <div
        className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${isAI ? "flex-row" : "flex-row-reverse"}`}
      >
        <div
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 shadow-sm ${
            isAI
              ? "bg-linear-to-br from-blue-500 to-violet-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          {isAI ? <Bot size={16} /> : <User size={16} />}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          {isAI ? (
            <div className="group relative">
              {content === "" ? (
                <div className="pt-1">
                  <TypingIndicator />
                </div>
              ) : (
                <>
                  <div className="markdown-body text-gray-800 dark:text-gray-200 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isBlock = match !== null;
                          if (isBlock) {
                            return (
                              <pre className="relative group/code">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>

                  <motion.button
                    onClick={handleCopy}
                    initial={false}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    title={copied ? "Copied!" : "Copy response"}
                    className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-green-500" />
                        <span className="text-green-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>

                  {sources && sources.length > 0 && (
                    <Sources sources={sources} />
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm shadow-blue-500/20">
              {content}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
