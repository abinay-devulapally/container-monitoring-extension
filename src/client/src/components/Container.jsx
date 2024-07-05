import React from "react";

// const containers = [
//   {
//     containerName: "redis",
//     containerDetails: "Is not healthy and needs attention",
//   },
//   {
//     containerName: "mongoDB",
//     containerDetails: "Is not healthy and needs attention",
//   },
// ];

function Container_Element({ containerName, containerDetails, setDebug }) {
  return (
    <div class="bg-zinc-800 text-white shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-4">
        <div class="font-bold text-2xl mb-2">{containerName}</div>
        <p class="text-sm italic">{containerDetails}</p>
      </div>
      <button
        onClick={() => setDebug(containerDetails)}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Debug
      </button>
      <div class="px-6 py-4">
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
          #Tag1
        </span>
        <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
          #Tag2
        </span>
      </div>
    </div>
  );
}

const ContainerList = ({ containers, setDebug }) => (
  <>
    {containers.length === 0 ? (
      <div className="flex justify-center items-center h-screen">
        <p className="text-zinc-300 italic">No containers to display</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {containers.map((container, index) => (
          <Container_Element
            key={index}
            containerName={container.containerName}
            containerDetails={container.containerDetails}
            setDebug={setDebug}
          />
        ))}
      </div>
    )}
  </>
);

function Container({ containerData, setDebug }) {
  return (
    <div>
      <h1 class="text-3xl font-bold mb-4 text-white">Containers Management</h1>
      <ContainerList containers={containerData} setDebug={setDebug} />
    </div>
  );
}

export default Container;
