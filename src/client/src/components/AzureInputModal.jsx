import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";

const AzureInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [resourceGroups, setResourceGroups] = useState([]);
  const [selectedResourceGroup, setSelectedResourceGroup] = useState(null);
  const [loadingResourceGroups, setLoadingResourceGroups] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setError("");
        const response = await fetch(
          "http://localhost:8000/api/v1/azure/subscriptions"
        );
        const data = await response.json();
        setSubscriptions(
          data.map((sub) => ({
            value: sub.subscriptionId,
            label: sub.displayName,
          }))
        );
      } catch (error) {
        setError("Failed to fetch subscriptions");
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubscriptionChange = async (selectedOption) => {
    setSelectedSubscription(selectedOption);
    setLoadingResourceGroups(true);
    setResourceGroups([]);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/azure/resourcegroups?subscriptionId=${selectedOption.value}`
      );
      const data = await response.json();
      setResourceGroups(data.map((rg) => ({ value: rg.id, label: rg.name })));
    } catch (error) {
      setError("Failed to fetch resource groups");
    } finally {
      setLoadingResourceGroups(false);
    }
  };

  const handleResourceGroupChange = (selectedOption) => {
    setSelectedResourceGroup(selectedOption);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ selectedSubscription, selectedResourceGroup });
    onClose();
  };

  if (!isOpen) return null;

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#1a202c", // Tailwind's bg-gray-900
      color: "#e2e8f0", // Tailwind's text-gray-300
      borderColor: "#4a5568", // Tailwind's border-gray-600
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#e2e8f0", // Tailwind's text-gray-300
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#2d3748", // Tailwind's bg-gray-800
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#4a5568" : "#2d3748", // Tailwind's bg-gray-700 or bg-gray-800
      color: "#e2e8f0", // Tailwind's text-gray-300
      "&:hover": {
        backgroundColor: "#4a5568", // Tailwind's bg-gray-700
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a0aec0", // Tailwind's text-gray-400
    }),
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative m-4 w-full max-w-md">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-gray-900 text-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-700 rounded-t">
            <h3 className="text-2xl font-semibold">
              Select Azure Subscription and Resource Group
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="form-group">
              <label htmlFor="subscriptions" className="block mb-1">
                Select Subscription
              </label>
              <Select
                id="subscriptions"
                options={subscriptions}
                onChange={handleSubscriptionChange}
                value={selectedSubscription}
                styles={customStyles}
                classNamePrefix="react-select"
              />
            </div>

            <div className="form-group">
              <label htmlFor="resource-groups" className="block mb-1">
                Select Resource Group
              </label>
              <Select
                id="resource-groups"
                options={resourceGroups}
                value={selectedResourceGroup}
                onChange={handleResourceGroupChange}
                isLoading={loadingResourceGroups}
                isDisabled={!selectedSubscription}
                styles={customStyles}
                classNamePrefix="react-select"
              />
            </div>
            <br />
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

export default AzureInputModal;
