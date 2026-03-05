import React, { useState, useRef, useEffect } from "react";
import "./Component1.css";
import "../bootstrap-5.3.3-dist/css/bootstrap.min.css";
import Audio from "../image/audio.png";
import Logo from "../image/download.jfif";
import copy from "../image/copy.png";
import tick from "../image/check-mark.png";

const EdgeDocument = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [messageLimitExceeded, setMessageLimitExceeded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText) => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/normal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }), // Send the query in the request body
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json(); // Get the response from the API
      const botText = (data && data.response ? String(data.response) : "").trim();
      const finalText = botText || "Sorry, I couldn't generate a response.";
      setResponse(finalText); // Store API response

      // Append bot response to the message list
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { text: finalText, fromUser: false, createdAt: new Date() }, // Response from the API
        ];
        return newMessages.slice(-10); // Keep only the last 5 user/bot pairs
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          {
            text: "Couldn't reach the server. Is the Python API running on 127.0.0.1:8000?",
            fromUser: false,
            createdAt: new Date(),
          },
        ];
        return newMessages.slice(-10);
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle sending a message and integrating with the API
  const handleSendMessage = async () => {
    if (query.trim()) {
      const userText = query;
      setQuery(""); // Clear immediately
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { text: userText, fromUser: true, createdAt: new Date() },
        ];
        return newMessages.slice(-10);
      });
      await handleSend(userText); // Call the API to send the message and get a response
      setMessageLimitExceeded(false); // Reset limit warning
    }
  };
  const handleCopyMessage = (messageText, index) => {
    navigator.clipboard
      .writeText(messageText)
      .then(() => {
        setCopiedIndex(index);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="container1">
      <div className="message-section" style={{ overflowY: "auto" }}>
        {messages.map((message, index) => (
          <div key={index}>
            {!message.fromUser && (
              <div
                style={{
                  marginBottom: "5px",
                  color: "#999",
                  fontSize: "15px",
                  marginLeft: "300px",
                }}
              >
                Created at: {message.createdAt.toLocaleTimeString()}{" "}
              </div>
            )}
            <div
              className={`message ${
                message.fromUser ? "user-message" : "admin-message"
              }`}
            >
              <p
                style={{
                  margin: "0",
                  color: "#555",
                  width: "auto",
                  maxWidth: "100%",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {message.text}
              </p>
            </div>
            {!message.fromUser && (
              <div className="button-group" style={{ marginLeft: "300px" }}>
                {copiedIndex !== index ? (
                  <img
                    src={copy}
                    alt="copy button"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginTop: "-20px",
                      marginLeft: "15px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleCopyMessage(message.text, index)}
                  />
                ) : (
                  <img
                    src={tick}
                    alt="tick button"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginTop: "-20px",
                      marginLeft: "15px",
                    }}
                  />
                )}
                {/* <div style={{marginLeft:'110px',marginTop: "-30px"}}>Reference</div> */}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message admin-message typing-indicator">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      {/* Footer Section */}
      <div
        className="footer d-flex align-items-center shadow-lg"
      >
        <img
          src={Logo}
          alt="audio-image"
          style={{ width: "30px", height: "25px", borderRadius: "20px" }}
        />
        <button className="add-button" style={{ fontSize: "35px" }}>
          +
        </button>
        <input
          type="text"
          className="border-0"
          placeholder="Message Copilot"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          style={{
            paddingLeft: "20px",
            borderRadius: "20px",
            height: "40px",
            outline: "none",
          }}
        />
        <img
          src={Audio}
          alt="audio-image"
          style={{ width: "30px", height: "25px" }}
        />
      </div>
    </div>
  );
};

export default EdgeDocument;

