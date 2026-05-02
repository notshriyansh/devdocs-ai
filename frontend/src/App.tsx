import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatArea from "./components/ChatArea";
import InputBox from "./components/InputBox";
import AddDocumentModal from "./components/AddDocumentModal";
import type { MessageProps } from "./components/MessageBubble";

interface DocumentItem {
  id: string;
  title: string;
}

interface HistoryItem {
  id: string;
  title: string;
}

interface HistoryResponseItem {
  id: string;
  query: string;
  response: string;
}

export default function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to add auth headers
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (isSignedIn) {
      const token = await getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setIsMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [...prev, doc]);
    setActiveDocId(doc.id);
    setMessages([]);
  };

  const loadHistory = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiUrl}/history`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setHistory(
        data.history.map((h: HistoryResponseItem) => ({
          id: h.id,
          title: h.query.slice(0, 42),
        })),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const loadDocuments = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiUrl}/documents`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setDocuments(data.documents);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadHistory();
      loadDocuments();
    } else if (isLoaded && !isSignedIn) {
      setDocuments([]);
      setHistory([]);
      setMessages([]);
      setActiveDocId(null);
    }
  }, [isLoaded, isSignedIn]);

  const handleSend = async (text: string) => {
    const userMsg: MessageProps = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg, { role: "ai", content: "" }]);
    setIsStreaming(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: text, doc_id: activeDocId }),
      });

      if (!response.ok || !response.body) {
        const error = await response.text();
        throw new Error(error || "Chat request failed");
      }

      const sourcesHeader = response.headers.get("X-Sources");
      const sources = sourcesHeader ? JSON.parse(sourcesHeader) : [];

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiText += decoder.decode(value);

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "ai",
              content: aiText,
              sources: sources.map((s: { url: string; text: string }) => ({
                title: s.url,
                preview: s.text,
                url: s.url,
              })),
            };
            return updated;
          });
        }
      }

      loadHistory();
    } catch (e) {
      console.error(e);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === activeDocId);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0B0F19]">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4 dark:bg-[#0B0F19]">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-[#0F172A]">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            DevDocs AI
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in to access your documents and chat history.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <SignInButton mode="modal" forceRedirectUrl="/">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0B0F19]"
    >
      <Sidebar
        documents={documents}
        history={history}
        activeDocumentId={activeDocId}
        onSelectDocument={(id) => {
          setActiveDocId(id);
          setMessages([]);
          setIsMobileSidebarOpen(false);
        }}
        onNewChat={() => {
          setMessages([]);
          setIsMobileSidebarOpen(false);
        }}
        onUpload={handleAddDocument}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenModal={() => {
          setIsModalOpen(true);
          setIsMobileSidebarOpen(false);
        }}
        onSelectHistory={async (id) => {
          try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${apiUrl}/history`, { headers });
            const data = await res.json();
            const selected = data.history.find((item: HistoryResponseItem) => item.id === id);
            if (!selected) return;
            setMessages([
              { role: "user", content: selected.query },
              { role: "ai", content: selected.response },
            ]);
            setIsMobileSidebarOpen(false);
          } catch (e) {
            console.error(e);
          }
        }}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={activeDoc?.title || "DevDocs AI"}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          documentName={activeDoc?.title || "your documentation"}
          onSuggestionClick={handleSend}
        />

        <InputBox onSend={handleSend} isStreaming={isStreaming} />
      </div>

      <AddDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleAddDocument}
        getAuthHeaders={getAuthHeaders}
      />
    </motion.div>
  );
}
