import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Send, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InputBoxProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop?: () => void;
}

export default function InputBox({
  onSend,
  isStreaming,
  onStop,
}: InputBoxProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isStreaming) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-3 md:p-4 transition-colors duration-200 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-[#1E293B] rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700/60 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/20 dark:focus-within:ring-blue-500/20 transition-all duration-200 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documentation..."
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none focus:outline-none focus:ring-0 resize-none py-0.5 text-[15px] leading-relaxed max-h-37.5 overflow-y-auto custom-scrollbar"
            rows={1}
            disabled={isStreaming}
          />

          <AnimatePresence mode="wait" initial={false}>
            {isStreaming ? (
              <motion.button
                key="stop"
                onClick={onStop}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="shrink-0 p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Stop"
              >
                <StopCircle size={18} />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                onClick={handleSend}
                disabled={!canSend}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                whileHover={canSend ? { scale: 1.05 } : {}}
                whileTap={canSend ? { scale: 0.9 } : {}}
                transition={{ duration: 0.15 }}
                className="shrink-0 p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-500/20"
                title="Send"
              >
                <Send size={17} className="ml-0.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-2.5 text-[11px] text-gray-400 dark:text-gray-600">
          AI responses are generated from your uploaded documentation ·{" "}
          <kbd className="font-sans">Enter</kbd> to send ·{" "}
          <kbd className="font-sans">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
