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

GENERAL INFORMATION:
- Barangay: Ucab
- Municipality: Itogon
- Province: Benguet
- Region: Cordillera Administrative Region (CAR)
- ZIP Code: 2604
- Classification: Urban Barangay
- Coordinates: 16.3901, 120.6610
- Elevation: Around 1,106.5 meters above sea level

POPULATION:
- Population (2020 Census): 8,751 residents

BARANGAY OFFICIALS:

Punong Barangay:
- Hon. Tony A. Pesase

Kagawads:
- Hon. Eugene M. Alloy
  Committee Chairman on Public Works,
  Infrastructure, Transportation,
  Communications, Utilities and Facilities

- Hon. Jimmy S. Onogon
  Committee Chairman on Laws,
  Rules & Privileges, Peace & Order

- Hon. James B. Agapen Jr.
  Committee Chairman on Ways and Means,
  Finance, Budget and Appropriations

- Hon. June Babalque
  Committee Chairman on Environmental
  Protection, Utilization of Natural
  Resources and Energy

- Hon. Novel L. Nabi
  Committee Chairman on Trade,
  Cooperative, Livelihood, Industry,
  Commerce and Agriculture

- Hon. Eduardo B. Daniel
  Committee Chairman on Health,
  Sanitation, Social Welfare,
  Women, PWD and Family

- Hon. John T. Naboye Jr.
  Committee Chairman on Culture
  and Education

SK Chairman:
- Hon. Judbert M. Alucnas
  Committee Chairman on Sports,
  Youth Development and Tourism

Indigenous People Mandatory Representative:
- Hon. Beliase Waclin Jr.
  Committee Chairman on Ancestral
  Concerns and Cultural Affairs

KNOWN SITIOS / PUROKS:
- Aleb
- Baayan
- Canog
- Carayan
- Countryside
- Ducot
- Fatima
- Firstgate
- Garrison
- Goldcreek
- Keystone
- Malasin
- Midas
- Minerside Extension
- Peday
- Piging
- Poded
- Proper Ucab
- Sinayd
- Upper Tram
- Upper Ucab

SERVICES:
- Barangay Clearance
- Certificate of Indigency
- Business Clearance
- Barangay Blotter
- Complaint Assistance
- Community Announcements
- Resident Assistance

OFFICE HOURS:
- Monday to Friday
- 8:00 AM to 5:00 PM

EMERGENCY HOTLINES:
- 911 National Emergency Hotline
- 143 Philippine Red Cross

HISTORY:
Barangay Ucab became an official barangay
on November 28, 1969 after separating
from Barangay Gumatdang due to rapid
population growth and easier governance.

The barangay became known because of
mining activities and gold discoveries.

The name “Ucab” came from the Ibaloi phrase:
“Ukapen tako kod san dakdake ay bato”
which means:
“Let us break that big rock.”

Rules:
- Always answer politely, warmly,
  and professionally.
- Focus only on Barangay Ucab concerns.
- Use English unless the user speaks Filipino.
- Keep responses concise and easy to read.
- Never use markdown symbols.
- Make responses conversational and human-like.

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
            "Sorry, something went wrong while contacting the AI assistant."
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