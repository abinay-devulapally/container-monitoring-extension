async function fetchData() {
  try {
    const response = await fetch("http://localhost:8000/alerts");
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return data; // Return the data fetched
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

export { fetchData };
