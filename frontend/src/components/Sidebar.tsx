import {
  X,
  FileText,
  Plus,
  MessageSquare,
  Link,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DocumentItem {
  id: string;
  title: string;
}

export interface HistoryItem {
  id: string;
  title: string;
}

interface SidebarProps {
  documents: DocumentItem[];
  history: HistoryItem[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onNewChat: () => void;
  onUpload: (doc: DocumentItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenModal: () => void;
  onSelectHistory: (id: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

function SidebarContent({
  documents,
  history,
  activeDocumentId,
  onSelectDocument,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  onOpenModal,
  onSelectHistory,
  onMobileClose,
}: Omit<SidebarProps, "isMobileOpen">) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <FileText size={15} />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden"
              >
                DevDocs AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </motion.button>
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-3 mb-4 shrink-0">
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm shadow-blue-500/20"
        >
          <Plus size={16} className="shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                key="new-chat-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="px-3 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.p
                  key="docs-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase"
                >
                  Documents
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              onClick={onOpenModal}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-md text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Add document"
            >
              <Plus size={15} />
            </motion.button>
          </div>

          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            {documents.length === 0 && !isCollapsed && (
              <p className="text-xs text-gray-400 dark:text-gray-600 italic px-2 py-1">
                No documents yet
              </p>
            )}
            {documents.map((doc) => (
              <motion.button
                key={doc.id}
                variants={itemVariants}
                onClick={() => onSelectDocument(doc.id)}
                whileHover={{ x: 2 }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors relative ${
                  activeDocumentId === doc.id
                    ? "bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                {activeDocumentId === doc.id && (
                  <motion.span
                    layoutId="active-doc-indicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r bg-blue-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Link size={14} className="shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key={`doc-title-${doc.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {doc.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </motion.div>
        </div>

        <div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.p
                key="history-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2 px-1"
              >
                History
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-0.5"
          >
            {history.map((h) => (
              <motion.div
                key={h.id}
                variants={itemVariants}
                onClick={() => onSelectHistory(h.id)}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer transition-colors"
              >
                <MessageSquare size={13} className="shrink-0 text-gray-400" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key={`hist-title-${h.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate text-xs"
                    >
                      {h.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { isCollapsed, isMobileOpen, onMobileClose } = props;

  return (
    <>
      <motion.div
        animate={{ width: isCollapsed ? 64 : 272 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:block h-full shrink-0 overflow-hidden"
      >
        <SidebarContent {...props} />
      </motion.div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed top-0 left-0 h-full w-72 z-50 md:hidden shadow-2xl"
            >
              <SidebarContent {...props} isCollapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
