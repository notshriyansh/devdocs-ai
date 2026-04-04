import { useState } from "react";
import { X, Link as LinkIcon, FileText, Upload, PlayIcon } from "lucide-react";

type Tab = "url" | "text" | "file" | "youtube";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (doc: { id: string; title: string }) => void;
}

export default function AddDocumentModal({ isOpen, onClose, onUpload }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("url");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  if (!isOpen) return null;

  const handleUpload = async () => {
    setLoading(true);

    try {
      let res;
      let data;

      if (activeTab === "url") {
        const formData = new FormData();
        formData.append("url", url);

        res = await fetch(`${apiUrl}/upload-url`, {
          method: "POST",
          body: formData,
        });

        data = await res.json();
      }

      if (activeTab === "text" || activeTab === "file") {
        const formData = new FormData();
        if (text) formData.append("text", text);
        if (file) formData.append("file", file);

        res = await fetch(`${apiUrl}/upload-documents`, {
          method: "POST",
          body: formData,
        });

        data = await res.json();
      }

      if (activeTab === "youtube") {
        const formData = new FormData();
        formData.append("url", youtubeUrl);

        res = await fetch(`${apiUrl}/upload-url`, {
          method: "POST",
          body: formData,
        });

        data = await res.json();
      }

      if (res && res.ok) {
        onUpload({
          id: data.doc_id,
          title: title || url || youtubeUrl || "New Document",
        });
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({
    id,
    icon,
    label,
  }: {
    id: Tab;
    icon: React.ReactNode;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
        activeTab === id
          ? "bg-white dark:bg-gray-700 shadow-sm"
          : "text-gray-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Add Documentation
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 p-3 bg-gray-100 dark:bg-gray-800 mx-6 mt-4 rounded-xl">
          <TabButton id="url" icon={<LinkIcon size={14} />} label="URL" />
          <TabButton id="text" icon={<FileText size={14} />} label="Text" />
          <TabButton id="file" icon={<Upload size={14} />} label="File" />
          <TabButton
            id="youtube"
            icon={<PlayIcon size={14} />}
            label="YouTube"
          />
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-sm text-gray-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Documentation"
              className="w-full mt-1 p-2 rounded-md border dark:bg-gray-800"
            />
          </div>

          {activeTab === "url" && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.example.com"
              className="w-full p-2 rounded-md border dark:bg-gray-800"
            />
          )}

          {activeTab === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your content..."
              className="w-full p-2 rounded-md border dark:bg-gray-800"
            />
          )}

          {activeTab === "file" && (
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          )}

          {activeTab === "youtube" && (
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-2 rounded-md border dark:bg-gray-800"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t dark:border-gray-800">
          <button onClick={onClose} className="text-sm">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
