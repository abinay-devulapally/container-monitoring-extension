import React from "react";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <svg
      className="animate-spin h-8 w-8 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.53 1.003 4.843 2.636 6.364l1.364-1.073z"
      ></path>
    </svg>
    <p className="text-zinc-300 italic ml-2">Loading...</p>
  </div>
);

export default LoadingSpinner;
