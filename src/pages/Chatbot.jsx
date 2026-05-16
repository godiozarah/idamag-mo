import {
  useState,
  useRef,
  useEffect
} from "react";

import {
  GoogleGenerativeAI
} from "@google/generative-ai";

const genAI =
  new GoogleGenerativeAI(
    import.meta.env
      .VITE_GEMINI_API_KEY
  );

const model =
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
  });

export default function Chatbot() {

  const [message, setMessage] =
    useState("");

  const [chat, setChat] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // AUTO SCROLL
  const chatEndRef = useRef(null);

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [chat, loading]);

  // SEND MESSAGE
  const sendMessage = async () => {

    if (message.trim() === "")
      return;

    // USER MESSAGE
    const userMessage = {
      sender: "You",
      text: message
    };

    setChat((prev) => [
      ...prev,
      userMessage
    ]);

    setLoading(true);

    const currentMessage =
      message;

    setMessage("");

    try {

      const result =
        await model.generateContent(
          `
You are the official AI assistant of Barangay Ucab in Itogon, Benguet, Philippines.

Your purpose is to help residents with barangay-related concerns and local information.

Rules:
- Always answer politely, warmly, and professionally.
- Focus only on Barangay Ucab concerns.
- Use English unless the user speaks Filipino.
- Keep responses concise, friendly, and easy to read.
- Add proper spacing between ideas.
- Never use markdown symbols like ** or ##.
- Make responses conversational and human-like.
- Avoid overly long responses.

User Question:
${currentMessage}
`
        );

      const response =
        await result.response;

      const text =
        response.text();

      // BOT MESSAGE
      const botMessage = {
        sender: "Barangay AI",
        text: text
      };

      setChat((prev) => [
        ...prev,
        botMessage
      ]);

    } catch (error) {

      console.error(error);

      setChat((prev) => [
        ...prev,
        {
          sender: "Barangay AI",
          text:
            "Sorry, something went wrong."
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5"
      }}
    >

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px"
        }}
      >

        {/* WELCOME */}
        {chat.length === 0 && (

          <div
            style={{
              textAlign: "center",
              marginTop: "80px",
              color: "#666"
            }}
          >

            <h2>
              Barangay AI Assistant
            </h2>

            <p>
              Ask anything about
              Barangay Ucab.
            </p>

          </div>

        )}

        {/* CHAT MESSAGES */}
        {chat.map((msg, index) => (

          <div
            key={index}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "You"
                  ? "flex-end"
                  : "flex-start",
              marginBottom: "12px"
            }}
          >

            <div
              style={{
                maxWidth: "80%",
                backgroundColor:
                  msg.sender === "You"
                    ? "#2E7D32"
                    : "white",
                color:
                  msg.sender === "You"
                    ? "white"
                    : "black",
                padding: "12px",
                borderRadius: "18px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.1)",
                whiteSpace:
                  "pre-wrap",
                lineHeight: "1.5"
              }}
            >

              <strong>
                {msg.sender}
              </strong>

              <div
                style={{
                  marginTop: "6px"
                }}
              >
                {msg.text}
              </div>

            </div>

          </div>

        ))}

        {/* TYPING */}
        {loading && (

          <div
            style={{
              marginBottom: "10px"
            }}
          >

            <div
              style={{
                backgroundColor:
                  "white",
                padding: "12px",
                borderRadius: "18px",
                width: "fit-content",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              Barangay AI is typing...
            </div>

          </div>

        )}

        {/* AUTO SCROLL TARGET */}
        <div ref={chatEndRef} />

      </div>

      {/* INPUT AREA */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "12px",
          backgroundColor: "white",
          borderTop:
            "1px solid #ddd"
        }}
      >

        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border:
              "1px solid #ccc",
            outline: "none"
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            background:
              "linear-gradient(90deg,#1B5E20,#43A047)",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Send
        </button>

      </div>

    </div>
  );
}