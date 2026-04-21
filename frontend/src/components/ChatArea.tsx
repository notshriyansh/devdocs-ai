import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import type { MessageProps } from "./MessageBubble";

interface ChatAreaProps {
  messages: MessageProps[];
  isStreaming: boolean;
  documentName: string;
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  "How does this work?",
  "Summarize the key concepts",
  "Show me a practical example",
  "What are the main features?",
];

export default function ChatArea({
  messages,
  isStreaming,
  documentName,
  onSuggestionClick,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (!showScrollBtn) {
      scrollToBottom("smooth");
    }
  }, [messages, isStreaming, showScrollBtn, scrollToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 120);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center overflow-y-auto">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-150" />
          <div className="relative bg-linear-to-br from-blue-500 to-violet-600 p-4 rounded-2xl shadow-lg shadow-blue-500/25">
            <Sparkles size={32} className="text-white" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3"
        >
          Ask anything
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-[15px] leading-relaxed"
        >
          Get AI-powered answers from{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {documentName}
          </span>{" "}
          with source references.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl"
        >
          {suggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              onClick={() => onSuggestionClick(suggestion)}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto px-4 py-6 md:px-8 custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto pt-2 pb-6">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              sources={msg.sources}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            key="scroll-btn"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setShowScrollBtn(false);
              scrollToBottom("smooth");
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ArrowDown size={13} />
            Scroll to bottom
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
