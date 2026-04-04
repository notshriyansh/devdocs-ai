import { Moon, Sun, FileText } from "lucide-react";

interface HeaderProps {
  title: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function Header({
  title,
  isDarkMode,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0F19] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <FileText size={18} className="text-blue-500" />
        <span className="truncate max-w-75">{title}</span>
      </div>

      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
