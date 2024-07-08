import React, { useState } from "react";
import ReactDOM from "react-dom";

function Button({ handleShowKey, showKey }) {
  return (
    <button type="button" className="text-red-600" onClick={handleShowKey}>
      {!showKey ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </button>
  );
}

const ChatAPIModal = ({ isOpen, onClose, onSubmit }) => {
  const [chatGPTApiKey, setChatGPTApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showChatGptKey, setshowChatGptKey] = useState(false);
  const [showGeminiKey, setshowGeminiKey] = useState(false);
  function handleShowGeminiKey() {
    return setshowGeminiKey((prevState) => !prevState);
  }

  function handleShowChatGptKey() {
    return setshowChatGptKey((prevState) => !prevState);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ chatGPTApiKey, geminiApiKey });
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative m-4 w-full max-w-md">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-gray-800 text-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-700 rounded-t">
            <h3 className="text-2xl font-semibold">Enter Your Key</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="form-group">
              <label htmlFor="chatgpt-api-key" className="block mb-1">
                ChatGPT API Key
              </label>
              <div className="flex space-x-1 justify-end items-center p-2">
                <input
                  type={showChatGptKey ? "text" : "password"}
                  id="chatgpt-api-key"
                  value={chatGPTApiKey}
                  onChange={(e) => setChatGPTApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <Button
                  handleShowKey={handleShowChatGptKey}
                  showKey={showChatGptKey}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gemini-api-key" className="block mb-1">
                Gemini API Key
              </label>
              <div className="flex space-x-1 justify-end items-center p-2">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  id="gemini-api-key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <Button
                  handleShowKey={handleShowGeminiKey}
                  showKey={showGeminiKey}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 focus:outline-none"
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 focus:outline-none"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default ChatAPIModal;
