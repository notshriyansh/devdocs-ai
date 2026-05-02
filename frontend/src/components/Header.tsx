import { Moon, Sun, FileText, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  useAuth,
} from "@clerk/clerk-react";

interface HeaderProps {
  title: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
}

export default function Header({
  title,
  isDarkMode,
  onToggleTheme,
  onOpenMobileSidebar,
}: HeaderProps) {
  const { isSignedIn } = useAuth();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onOpenMobileSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </motion.button>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <FileText size={16} className="text-blue-500 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.span
              key={title}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="truncate max-w-40 md:max-w-xs"
            >
              {title}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          onClick={onToggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: 15 }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDarkMode ? "sun" : "moon"}
              initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {isSignedIn ? (
          <div className="flex items-center gap-2">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal" forceRedirectUrl="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Sign In
              </motion.button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Sign Up
              </motion.button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}
