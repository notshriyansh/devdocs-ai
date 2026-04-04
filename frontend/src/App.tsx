import { useState, useEffect } from "react";
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

export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [...prev, doc]);
    setActiveDocId(doc.id);
    setMessages([]);
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/history`);
      const data = await res.json();

      setHistory(
        data.history.map((h: any, i: number) => ({
          id: i.toString(),
          title: h.query.slice(0, 40),
        })),
      );
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async (text: string) => {
    const userMsg: MessageProps = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg, { role: "ai", content: "" }]);
    setIsStreaming(true);

    try {
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: text,
          doc_id: activeDocId,
        }),
      });

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
              sources: sources.map((s: any) => ({
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
    } finally {
      setIsStreaming(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === activeDocId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0B0F19]">
      <Sidebar
        documents={documents}
        history={history}
        activeDocumentId={activeDocId}
        onSelectDocument={(id) => {
          setActiveDocId(id);
          setMessages([]);
        }}
        onNewChat={() => setMessages([])}
        onUpload={handleAddDocument}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenModal={() => setIsModalOpen(true)}
        onSelectHistory={async (id) => {
          try {
            const res = await fetch(`${apiUrl}/history`);
            const data = await res.json();

            const selected = data.history[parseInt(id)];

            setMessages([
              { role: "user", content: selected.query },
              { role: "ai", content: selected.response },
            ]);
          } catch (e) {
            console.error(e);
          }
        }}
      />

      <div className="flex-1 flex flex-col">
        <Header
          title={activeDoc?.title || "DevDocs AI"}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        />

        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          documentName={activeDoc?.title || "Active Document"}
          onSuggestionClick={handleSend}
        />

        <InputBox onSend={handleSend} isStreaming={isStreaming} />
      </div>

      <AddDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleAddDocument}
      />
    </div>
  );
}
