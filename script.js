const apiBase = "https://car-wash-api-513104733626.us-east1.run.app";

const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const calculateBtn = document.getElementById("calculateBtn");
const priceResult = document.getElementById("priceResult");

// Load years dynamically from database
async function loadYears() {
    try {
        const res = await fetch(`${apiBase}/vehicles/years`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (!data.years || data.years.length === 0) return;

        data.years.forEach(y => yearSelect.add(new Option(y, y)));
    } catch (err) {
        console.error("Failed to load years:", err);
    }
}

// Fetch makes for a given year
yearSelect.addEventListener("change", async (e) => {
    const year = e.target.value;
    makeSelect.innerHTML = "";
    modelSelect.innerHTML = "";
    modelSelect.disabled = true;
    calculateBtn.disabled = true;

    if (!year) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/makes/${year}`);
        if (!res.ok) {
            console.warn(`API returned error: ${res.status}`);
            makeSelect.disabled = true;
            return;
        }

        const data = await res.json();
        if (!data.makes || !Array.isArray(data.makes) || data.makes.length === 0) {
            console.warn(`No makes found for year ${year}`);
            makeSelect.disabled = true;
            return;
        }

        data.makes.forEach(m => makeSelect.add(new Option(m, m)));
        makeSelect.disabled = false;
    } catch (err) {
        makeSelect.disabled = true;
        console.error(err);
    }
});

// Fetch models for a given year + make
makeSelect.addEventListener("change", async (e) => {
    const year = yearSelect.value;
    const make = e.target.value;
    modelSelect.innerHTML = "";
    calculateBtn.disabled = true;

    if (!year || !make) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/models/${year}/${make}`);
        if (!res.ok) {
            console.warn(`API returned error: ${res.status}`);
            modelSelect.disabled = true;
            return;
        }

        const data = await res.json();
        if (!data.models || !Array.isArray(data.models) || data.models.length === 0) {
            console.warn(`No models found for year ${year} and make ${make}`);
            modelSelect.disabled = true;
            return;
        }

        data.models.forEach(m => modelSelect.add(new Option(m, m)));
        modelSelect.disabled = false;
    } catch (err) {
        modelSelect.disabled = true;
        console.error(err);
    }
});

// Enable calculate button when a model is selected
modelSelect.addEventListener("change", () => {
    calculateBtn.disabled = !modelSelect.value;
});

// Calculate price
calculateBtn.addEventListener("click", async () => {
    const year = parseInt(yearSelect.value);
    const make = makeSelect.value;
    const model = modelSelect.value;

    try {
        const res = await fetch(`${apiBase}/pricing/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ year, make, model })
        });

        if (!res.ok) {
            priceResult.innerText = "Error calculating price";
            return;
        }

        const data = await res.json();
        priceResult.innerText = `Price: $${data.price.toFixed(2)}`;
    } catch (err) {
        priceResult.innerText = "Error calculating price";
        console.error(err);
    }
});

// Initialize
loadYears();
