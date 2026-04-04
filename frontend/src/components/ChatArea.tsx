import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import type { MessageProps } from './MessageBubble';

interface ChatAreaProps {
  messages: MessageProps[];
  isStreaming: boolean;
  documentName: string;
  onSuggestionClick: (text: string) => void;
}

export default function ChatArea({ messages, isStreaming, documentName, onSuggestionClick }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const suggestions = [
    "How does this work?",
    "Summarize the key concepts",
    "Show me an example"
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto text-center h-full">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-2xl mb-6 shadow-sm">
          <Sparkles size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Ask anything
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-[15px] leading-relaxed">
          Ask questions about <span className="font-semibold text-gray-700 dark:text-gray-300">{documentName}</span> and get AI-powered answers with source references.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors border border-gray-200/50 dark:border-gray-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 custom-scrollbar relative h-full" ref={scrollRef}>
      <div className="max-w-4xl mx-auto flex flex-col pt-4 pb-8">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
          />
        ))}
        {isStreaming && (
          <div className="flex gap-2 items-center text-sm text-gray-400 dark:text-gray-500 py-2 ml-14">
            <Sparkles size={14} className="animate-pulse text-blue-500" />
            AI is typing...
          </div>
        )}
      </div>
    </div>
  );
}
