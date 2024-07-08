import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

import ChatAPIModal from "./ChatAPIModal";

sessionStorage.removeItem("chatgptApiKey");
sessionStorage.removeItem("geminiApiKey");

const ChatWindow = ({ messages, isTyping }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-md h-full flex flex-col overflow-y-auto">
      <div className="flex-grow">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`my-2 p-2 rounded-lg ${
              message.sender === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-700 text-white self-start"
            }`}
          >
            <div className="p-3 prose prose-lg text-sm">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={okaidia}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.message}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator content="Typing..." />}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

const TypingIndicator = ({ content }) => {
  return (
    <div className="flex justify-center items-center text-gray-200 italic">
      {content}
    </div>
  );
};

function ChatInput({ onSendMessage, debug }) {
  const initialInput = debug.debug ? debug.debugDetails : "";
  const [input, setInput] = useState(initialInput);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (debug.debug && initialInput.trim()) {
      onSendMessage(initialInput);
      setInput("");
    }
  }, []);

  return (
    <div className="flex">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        className="flex-grow p-2 rounded-l-lg bg-gray-700 text-white border-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
}

function Chat({ activePanel, debug }) {
  const [chatType, setChatType] = useState("Gemini");
  const [reload, setReload] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  let chatgptApiKey, geminiApiKey;

  if (!window.chatgptApiKey || !window.geminiApiKey) {
    chatgptApiKey = sessionStorage.getItem("chatgptApiKey");
    geminiApiKey = sessionStorage.getItem("geminiApiKey");
  } else {
    chatgptApiKey = window.chatgptApiKey;
    geminiApiKey = window.geminiApiKey;
  }

  const ChatGPT_API_KEY = chatgptApiKey;
  const GEMINI_API_KEY = geminiApiKey;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (keys) => {
    console.log("Submitted API Keys:", keys);
    sessionStorage.setItem("chatgptApiKey", keys.chatgptApiKey);
    sessionStorage.setItem("geminiApiKey", keys.geminiApiKey);
  };

  useEffect(() => {
    setMessages([
      {
        message: `Hello, I'm ${chatType}! Ask me anything!`,
        sentTime: "just now",
        sender: chatType,
      },
    ]);
  }, [chatType, activePanel, reload]);

  const [isTyping, setIsTyping] = useState(false);

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role: role, content: messageObject.message };
    });
    const systemMessage = {
      role: "system",
      content: debug.prompt,
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + ChatGPT_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error communicating with ChatGPT API:", data.error);
        setMessages([
          ...chatMessages,
          {
            message: "Please try again later or check your API key.",
            sender: "ChatGPT",
            sentTime: "just now",
          },
        ]);
        setIsTyping(false);
        throw new Error("Failed to fetch data");
      }
      setMessages([
        ...chatMessages,
        {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
        },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error communicating with ChatGPT API:", error);
    }
  }

  async function processMessageToGemini(chatMessages) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = debug.prompt;
    const updatedPrompt =
      prompt + chatMessages.map((message) => message.message).join(" ");

    try {
      const result = await model.generateContent(updatedPrompt);
      const response = await result.response;
      setMessages([
        ...chatMessages,
        {
          message: response.text(),
          sender: "Gemini",
          sentTime: "just now",
        },
      ]);
      setIsTyping(false);
    } catch (error) {
      const errorMessage =
        (error.response &&
          error.response.data &&
          error.response.data.error &&
          error.response.data.error.message) ||
        "Please try again later or check your API key.";
      setMessages([
        ...chatMessages,
        {
          message: `Error communicating with Gemini API: ${errorMessage}`,
          sender: "Gemini",
          sentTime: "just now",
        },
      ]);
      setIsTyping(false);
      console.error("Error communicating with Gemini API:", error);
    }
  }

  const handleSendMessage = (message) => {
    const userMessage = { sender: "user", message: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const newMessages = [...messages, userMessage];

    (async () => {
      setIsTyping(true);
      if (chatType === "Chatgpt") {
        await processMessageToChatGPT(newMessages);
      } else {
        await processMessageToGemini(newMessages);
      }
    })();
  };
  function handleReload() {
    setReload((prev) => !prev);
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg">
      <div className="justify-center flex space-x-3 text-3xl font-bold mb-4 text-white">
        <p>AI Chat Support</p>
        <span>
          <button
            className="flex items-center px-2 py-1 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-200 focus:ring-opacity-80"
            onClick={handleReload}
          >
            <svg
              className="w-4 h-4 mx-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
            </svg>
            <span className="mx-1">Reset Chat</span>
          </button>
        </span>
        <span>
          <button
            className="flex items-center px-2 py-1 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-black rounded-lg hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-200 focus:ring-opacity-80"
            onClick={handleOpenModal}
          >
            <span className="mx-1">API keys</span>
          </button>
          <ChatAPIModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
          />
        </span>
      </div>
      <div className="flex justify-center space-x-4">
        <label htmlFor="chatSupport" className="text-white text-sm">
          {chatType ? "Selected Chat Support:" : "Select AI Chat Support"}
        </label>
        <select
          id="chatSupport"
          name="chatSupport"
          onChange={(event) => setChatType((prev) => event.target.value)}
        >
          <option value="Gemini">Gemini</option>
          <option value="Chatgpt">ChatGPT</option>
        </select>
      </div>
      <div className="flex-grow p-4 h-64">
        <ChatWindow messages={messages} isTyping={isTyping} />
      </div>
      <div className="p-4">
        <ChatInput onSendMessage={handleSendMessage} debug={debug} />
      </div>
    </div>
  );
}

export default Chat;
