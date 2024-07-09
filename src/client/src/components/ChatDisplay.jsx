import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

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

export { ChatWindow, ChatInput };
