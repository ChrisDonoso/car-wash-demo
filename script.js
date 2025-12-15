const API_BASE_URL = "https://car-wash-api-513104733626.us-east1.run.app";

document
  .getElementById("loadPricing")
  .addEventListener("click", async () => {
    const output = document.getElementById("output");
    output.textContent = "Loading...";

    try {
      const response = await fetch(`${API_BASE_URL}/pricing/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
          // Demo API key later if needed
          // "X-API-Key": "demo-key"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = `Error: ${err.message}`;
    }
  });
