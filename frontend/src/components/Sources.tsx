import { useState } from "react";
import { ChevronDown, ExternalLink, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Source {
  title: string;
  preview: string;
  url?: string;
}

interface SourcesProps {
  sources: Source[];
}

export default function Sources({ sources }: SourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
      >
        <BookOpen size={13} />
        <span>
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={13} />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="sources-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              variants={{
                show: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2 pt-1"
            >
              {sources.map((source, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  }}
                  className="group bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-xl p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-linear-to-br from-blue-500 to-violet-500 text-white text-[10px] font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="truncate">{source.title}</span>
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {source.preview}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
