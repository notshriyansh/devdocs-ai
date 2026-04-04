import { FileText, Plus, MessageSquare, Link } from "lucide-react";

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
}

export default function Sidebar({
  documents,
  history,
  activeDocumentId,
  onSelectDocument,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  onOpenModal,
  onSelectHistory,
}: SidebarProps) {
  return (
    <div
      className={`h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      <button
        onClick={onToggleCollapse}
        className="absolute top-4 right-2 text-gray-400"
      >
        {isCollapsed ? "→" : "←"}
      </button>

      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <FileText size={16} />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            DevDocs AI
          </span>
        )}
      </div>

      <button
        onClick={onNewChat}
        className="mx-2 mb-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition"
      >
        <Plus size={16} />
        {!isCollapsed && "New Chat"}
      </button>

      <div className="px-2">
        <div className="flex items-center justify-between mb-2">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400">DOCUMENTS</p>
          )}

          <button onClick={onOpenModal}>
            <Plus size={16} />
          </button>
        </div>

        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelectDocument(doc.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
              activeDocumentId === doc.id
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Link size={14} />
            {!isCollapsed && <span className="truncate">{doc.title}</span>}
          </button>
        ))}
      </div>

      <div className="px-2 mt-6">
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-400 mb-2">HISTORY</p>
        )}

        <div className="flex flex-col gap-1">
          {history.map((h) => (
            <div
              key={h.id}
              onClick={() => onSelectHistory(h.id)}
              className="flex items-center gap-2 text-sm px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
            >
              <MessageSquare size={14} />
              {!isCollapsed && <span className="truncate">{h.title}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
