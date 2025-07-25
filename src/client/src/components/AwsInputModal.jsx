import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";

const AwsInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hardcoded list of AWS regions
    const awsRegions = [
      "us-east-1",
      "us-east-2",
      "us-west-1",
      "us-west-2",
      "af-south-1",
      "ap-east-1",
      "ap-south-1",
      "ap-southeast-1",
      "ap-southeast-2",
      "ap-southeast-3",
      "ap-northeast-1",
      "ap-northeast-2",
      "ap-northeast-3",
      "ca-central-1",
      "eu-central-1",
      "eu-west-1",
      "eu-west-2",
      "eu-west-3",
      "eu-north-1",
      "eu-south-1",
      "me-south-1",
      "me-central-1",
      "sa-east-1",
    ];

    setRegions(
      awsRegions.map((region) => ({
        value: region,
        label: region,
      }))
    );
  }, []);

  const handleRegionChange = async (selectedOption) => {
    setSelectedRegion(selectedOption);
    setLoadingClusters(true);
    setClusters([]);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/aws/clusters?awsRegion=${selectedOption.value}`
      );
      const data = await response.json();
      setClusters(
        data.map((cluster) => ({
          value: cluster.clusterName,
          label: cluster.clusterName,
        }))
      );
    } catch (error) {
      setError("Failed to fetch clusters");
    } finally {
      setLoadingClusters(false);
    }
  };

  const handleClusterChange = (selectedOption) => {
    setSelectedCluster(selectedOption);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ selectedRegion, selectedCluster });
    onClose();
  };

  if (!isOpen) return null;

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#1a202c",
      color: "#e2e8f0",
      borderColor: "#4a5568",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#e2e8f0",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#2d3748",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#4a5568" : "#2d3748",
      color: "#e2e8f0",
      "&:hover": {
        backgroundColor: "#4a5568",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a0aec0",
    }),
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative m-4 w-full max-w-md">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-gray-900 text-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-700 rounded-t">
            <h3 className="text-2xl font-semibold">
              Select AWS Region and Cluster
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="form-group">
              <label htmlFor="regions" className="block mb-1">
                Regions
              </label>
              <Select
                id="regions"
                options={regions}
                onChange={handleRegionChange}
                value={selectedRegion}
                styles={customStyles}
                classNamePrefix="react-select"
                placeholder={
                  localStorage.getItem("lastAwsRegion") || "Select Region"
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="clusters" className="block mb-1">
                Clusters
              </label>
              <Select
                id="clusters"
                options={clusters}
                value={selectedCluster}
                onChange={handleClusterChange}
                isLoading={loadingClusters}
                isDisabled={!selectedRegion}
                styles={customStyles}
                classNamePrefix="react-select"
                placeholder={
                  localStorage.getItem("lastClusterName") || "Select Cluster"
                }
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

export default AwsInputModal;
