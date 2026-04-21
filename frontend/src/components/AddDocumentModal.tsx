import { useState } from "react";
import {
  X,
  Link as LinkIcon,
  FileText,
  Upload,
  PlayIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "url" | "text" | "file" | "youtube";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (doc: { id: string; title: string }) => void;
}

const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "url", icon: <LinkIcon size={14} />, label: "URL" },
  { id: "text", icon: <FileText size={14} />, label: "Text" },
  { id: "file", icon: <Upload size={14} />, label: "File" },
  { id: "youtube", icon: <PlayIcon size={14} />, label: "YouTube" },
];

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500 transition-all";

export default function AddDocumentModal({ isOpen, onClose, onUpload }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("url");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [dragOver, setDragOver] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const isValid = (() => {
    if (activeTab === "url") return url.trim().length > 0;
    if (activeTab === "text") return text.trim().length > 0;
    if (activeTab === "file") return file !== null;
    if (activeTab === "youtube") return youtubeUrl.trim().length > 0;
    return false;
  })();

  const handleClose = () => {
    if (loading) return;
    setStatus("idle");
    onClose();
  };

  const handleUpload = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setStatus("idle");

    try {
      let res: Response | undefined;
      let data: { doc_id: string };

      if (activeTab === "url") {
        const fd = new FormData();
        fd.append("url", url);
        res = await fetch(`${apiUrl}/upload-url`, { method: "POST", body: fd });
        data = await res.json();
      } else if (activeTab === "youtube") {
        const fd = new FormData();
        fd.append("url", youtubeUrl);
        res = await fetch(`${apiUrl}/upload-url`, { method: "POST", body: fd });
        data = await res.json();
      } else {
        const fd = new FormData();
        if (text) fd.append("text", text);
        if (file) fd.append("file", file);
        res = await fetch(`${apiUrl}/upload-documents`, {
          method: "POST",
          body: fd,
        });
        data = await res.json();
      }

      if (res && res.ok) {
        setStatus("success");
        onUpload({
          id: data.doc_id,
          title: title || url || youtubeUrl || file?.name || "New Document",
        });
        setTimeout(() => {
          setStatus("idle");
          setTitle("");
          setUrl("");
          setText("");
          setFile(null);
          setYoutubeUrl("");
          onClose();
        }, 900);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0F172A] w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-base">
                Add Documentation
              </h2>
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={17} />
              </motion.button>
            </div>

            <div className="px-6 pt-4">
              <div className="relative flex gap-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors z-10 ${
                      activeTab === tab.id
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {tab.icon}
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Title (optional)
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. React Documentation"
                  className={inputCls}
                />
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "url" && (
                  <motion.div
                    key="url-field"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      URL *
                    </label>
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://docs.example.com"
                      className={inputCls}
                    />
                  </motion.div>
                )}

                {activeTab === "text" && (
                  <motion.div
                    key="text-field"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Content *
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your content here..."
                      rows={5}
                      className={`${inputCls} resize-none`}
                    />
                  </motion.div>
                )}

                {activeTab === "file" && (
                  <motion.div
                    key="file-field"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
                      File * (PDF or TXT)
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const dropped = e.dataTransfer.files[0];
                        if (dropped) setFile(dropped);
                      }}
                      className={`relative border-2 border-dashed rounded-xl px-4 py-8 text-center transition-colors cursor-pointer ${
                        dragOver
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload
                        size={22}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      {file ? (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {file.name}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Drag & drop or click to select
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            .pdf or .txt
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "youtube" && (
                  <motion.div
                    key="yt-field"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      YouTube URL *
                    </label>
                    <input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className={inputCls}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle size={13} />
                    Upload failed. Please check the URL or file and try again.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleUpload}
                disabled={!isValid || loading}
                whileHover={isValid && !loading ? { scale: 1.02 } : {}}
                whileTap={isValid && !loading ? { scale: 0.97 } : {}}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-sm ${
                  !isValid || loading
                    ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed opacity-60"
                    : status === "success"
                      ? "bg-green-500 shadow-green-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Uploading...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 size={15} /> Done!
                  </>
                ) : (
                  "Upload"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
