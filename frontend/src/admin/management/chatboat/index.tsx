import { useEffect, useRef, useState } from "react";
import { chatBoat } from "../../../service/api";
import { MdAutoDelete } from "react-icons/md";
import './chat.css';

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ type: "user" | "bot"; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChat(prev => [...prev, { type: "user", text: userMsg }]);
    setMessage("");

    try {
      const { data } = await chatBoat({ message: userMsg });
      if (data.success) {
        setChat(prev => [...prev, { type: "bot", text: data.reply }]);
      }
    } catch (error: any) {
      setChat(prev => [...prev, { type: "bot", text: error?.response?.data?.message || "Something went wrong" }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="floating-btn-animated"
        title="AI Support"
      >
        🤖
      </button>

      {/* Chat Box */}
      {open && (
        <div className="chat-box">
          {/* Header */}
          <div className="header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                title="Clear chat"
                className="icon-btn"
                onClick={() => {
                  if (chat.length && window.confirm("Clear conversation?")) {
                    setChat([]);
                  }
                }}
              >
                <MdAutoDelete />
              </button>
              <span>AI Assistant</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="body mt-5">
            <div className="text-center border-5 fw-bold border-bottom">I am your AI and Robotics Assistant. <br />Have a nice day !</div>
            {chat.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: c.type === "user" ? "flex-end" : "flex-start",
                  marginBottom: "12px"
                }}
              >
                <div className={`message ${c.type === "user" ? "user-msg" : "bot-msg"}`}>
                  {c.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Footer */}
          <div className="footer">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="input"
            />
            <button onClick={sendMessage} className="send-btn">➤</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
