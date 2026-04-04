import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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
    <div className="mt-4 pb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium mb-3"
      >
        {sources.length} sources{" "}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2">
          {sources.map((source, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {index + 1}
                  </span>
                  {source.title}
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 md:pr-4">
                {source.preview}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
