import { useState } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const userMessage = { role: "user", content: input };

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);

    const response = await fetch("http://127.0.0.1:8000/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: input }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let aiMessage = "";

    while (true) {
      const { done, value } = await reader!.read();

      if (done) break;

      aiMessage += decoder.decode(value);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: aiMessage,
        };
        return updated;
      });
    }

    setInput("");
  };

  return (
    <div>
      <h2>DevDocs AI</h2>

      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      <input value={input} onChange={(e) => setInput(e.target.value)} />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
