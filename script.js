document.getElementById("test").addEventListener("click", async () => {
  const response = await fetch("https://YOUR-CLOUD-RUN-URL", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Optional demo key later
      // "X-API-Key": "demo-key"
    }
  });

  const data = await response.json();
  document.getElementById("output").textContent =
    JSON.stringify(data, null, 2);
});
