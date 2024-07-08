import React from "react";

function ErrorComponent() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center max-w-sm mx-auto text-center">
        <p className="p-3 text-sm font-medium text-blue-500 rounded-full bg-blue-50 dark:bg-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
          Something Went Wrong
        </h1>
        <div className="bg-red-100 p-4 rounded-md border border-red-400">
          <p className="mt-4 text-blue-600">
            Failed to fetch data from the backend server. Please try again
            later.
          </p>
          <p className="text-blue-700">
            Or check if the backend port: 8000 is available for listening.
          </p>
          <p className="text-blue-700">
            You can also check the following:
            <ul className="list-disc list-inside ml-4">
              <li>Ensure the backend server is running.</li>
              <li>
                Verify network connectivity between the frontend and backend.
              </li>
              <li>Check browser console for detailed error messages.</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorComponent;
