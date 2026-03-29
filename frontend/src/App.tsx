import ChatWindow from "./components/ChatWindow";
import DocumentUpload from "./components/DocumentUpload";

function App() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <DocumentUpload />
      <hr style={{ margin: "20px 0" }} />
      <ChatWindow />
    </div>
  );
}

export default App;
