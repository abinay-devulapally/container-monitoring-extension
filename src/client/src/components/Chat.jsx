import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useRef, useState } from "react";

const API_KEY = "sk-proj-VFllVOyZHfLiQ4t0mFnqT3BlbkFJqw2ZqUGEKQYRXnqVMI6n";
const GEMINI_API_KEY = "AIzaSyDHlkYTYMIMabQdFtmXrcAiIZXQ4olKsbA";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const systemMessage = {
  role: "system",
  content:
    "Explain things like you're talking to a software professional with 2 years of experience.",
};

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
            <div className="font-sans m-5">
              <MessageContent content={message.message} />
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator content="Gemini is typing" />}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

const MessageContent = ({ content }) => {
  return (
    <div>
      {content.split("\n").map((line, index) => {
        if (line.startsWith("```")) {
          return (
            <pre key={index} className="bg-gray-900 p-2 rounded my-2">
              <code>{line.replace(/```/g, "")}</code>
            </pre>
          );
        } else if (line.startsWith("**")) {
          return (
            <p key={index} className="font-bold">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        } else {
          return <p key={index}>{line}</p>;
        }
      })}
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

function ChatInput({ onSendMessage }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

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

function OpenAIChat() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role: role, content: messageObject.message };
    });

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
            Authorization: "Bearer " + API_KEY,
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

  const handleSendMessage = (message) => {
    const userMessage = { sender: "user", message: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const newMessages = [...messages, userMessage];

    (async () => {
      setIsTyping(true);
      await processMessageToChatGPT(newMessages);
    })();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">
        Chat Panel
      </h1>
      <div className="flex-grow p-4 overflow-auto">
        <ChatWindow messages={messages} isTyping={isTyping} />
      </div>
      <div className="p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

function Chat({ debug }) {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Gemini! Ask me anything!",
      sentTime: "just now",
      sender: "Gemini",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  async function processMessageToGemini(chatMessages) {
    const error = "Error: 'NoneType' object has no attribute 'group'";
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
      console.error("Error communicating with Gemini API:", error);
    }
  }
  const handleSendMessage = (message) => {
    const userMessage = { sender: "user", message: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const newMessages = [...messages, userMessage];

    (async () => {
      setIsTyping(true);
      await processMessageToGemini(newMessages);
    })();
  };
  return (
    <div className="flex flex-col h-full bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">
        AI Chat Support
      </h1>
      <div className="flex-grow p-4 h-64">
        <ChatWindow messages={messages} isTyping={isTyping} />
      </div>
      <div className="p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default Chat;
