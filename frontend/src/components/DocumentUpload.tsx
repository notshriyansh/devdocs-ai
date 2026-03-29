import { useState } from "react";

export default function DocumentUpload() {
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
      if (url) {
        const formData = new FormData();
        formData.append("url", url);

        const response = await fetch(`${apiUrl}/upload-url`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setStatus(`✅ ${data.message}`);
          setUrl("");
        } else {
          setStatus(`❌ ${data.detail}`);
        }

        return;
      }

      const formData = new FormData();

      if (text) formData.append("text", text);
      if (file) formData.append("file", file);

      const response = await fetch(`${apiUrl}/upload-documents`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ ${data.message}`);
        setText("");
        setFile(null);
      } else {
        setStatus(`❌ ${data.detail}`);
      }
    } catch (error: any) {
      setStatus(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-5 border rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Add Knowledge Source</h3>

      <p className="text-sm text-gray-500 mb-4">
        Enter a documentation URL, paste text, or upload a .txt file.
      </p>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://docs.example.com"
        className="w-full p-3 border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-400"
      />

      <p className="text-center text-gray-400 text-sm mb-2">OR</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste documentation text..."
        rows={4}
        className="w-full p-3 border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-400"
      />

      <input
        type="file"
        accept=".txt"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="mb-3"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
      >
        {loading ? "Processing..." : "Upload"}
      </button>

      {status && (
        <p
          className={`mt-3 text-sm ${
            status.startsWith("❌") ? "text-red-500" : "text-green-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
