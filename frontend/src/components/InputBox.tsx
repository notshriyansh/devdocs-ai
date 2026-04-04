import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Send, StopCircle } from "lucide-react";

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

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 transition-colors duration-200 shrink-0">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-[#F3F4F6] dark:bg-gray-800 rounded-2xl p-2 pl-4 border border-transparent dark:border-gray-700/50 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your documentation..."
          className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-none focus:outline-none focus:ring-0 resize-none py-2 text-[15px] max-h-37.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          rows={1}
          disabled={isStreaming}
        />

        {isStreaming ? (
          <button
            onClick={onStop}
            className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors mb-0.5"
          >
            <StopCircle size={18} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-blue-600 text-white disabled:bg-blue-400 dark:disabled:bg-blue-800/50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors mb-0.5 shadow-sm"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        )}
      </div>
      <div className="text-center mt-3 text-xs text-gray-400 dark:text-gray-500">
        AI responses are generated from your uploaded documentation.
      </div>
    </div>
  );
}
