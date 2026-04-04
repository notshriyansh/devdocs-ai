import { useState } from "react";

interface Props {
  onUploadSuccess: (doc: { id: string; title: string }) => void;
}

export default function DocumentUpload({ onUploadSuccess }: Props) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleUpload = async () => {
    if (!url && !text && !file) {
      setStatus("❌ Provide URL, text, or file");
      return;
    }

    setLoading(true);
    setStatus("Uploading...");

    try {
      let response;
      let data;
      if (url) {
        const formData = new FormData();
        formData.append("url", url);

        response = await fetch(`${apiUrl}/upload-url`, {
          method: "POST",
          body: formData,
        });

        data = await response.json();

        if (response.ok) {
          onUploadSuccess({
            id: data.doc_id,
            title: url,
          });
          setUrl("");
        } else {
          setStatus(`❌ ${data.detail}`);
          return;
        }
      } else {
        const formData = new FormData();
        if (text) formData.append("text", text);
        if (file) formData.append("file", file);

        response = await fetch(`${apiUrl}/upload-documents`, {
          method: "POST",
          body: formData,
        });

        data = await response.json();

        if (response.ok) {
          onUploadSuccess({
            id: data.doc_id,
            title: file?.name || "Manual Input",
          });

          setText("");
          setFile(null);
        } else {
          setStatus(`❌ ${data.detail}`);
          return;
        }
      }

      setStatus(`✅ ${data.message}`);
    } catch (error: any) {
      setStatus(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter documentation URL"
        className="w-full p-2 text-sm rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text..."
        className="w-full p-2 text-sm rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-2"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-xs mb-2"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {status && <p className="text-xs mt-2 text-gray-500">{status}</p>}
    </div>
  );
}
