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
        console.log("Years data:", data);
        if (!data.years || data.years.length === 0) {
            yearSelect.disabled = true;
            return;
        }

        data.years.forEach(y => yearSelect.add(new Option(y, y)));
        yearSelect.disabled = false;
    } catch (err) {
        console.error("Failed to load years:", err);
        yearSelect.disabled = true;
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
            makeSelect.disabled = true;
            return;
        }

        const data = await res.json();
        if (!data.makes || data.makes.length === 0) {
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
            modelSelect.disabled = true;
            return;
        }

        const data = await res.json();
        if (!data.models || data.models.length === 0) {
            modelSelect.disabled = true;
            return;
        }

        // Populate model dropdown
        data.models.forEach(m => modelSelect.add(new Option(m, m)));
        modelSelect.disabled = false;

        // Auto-select first model and enable calculate button
        modelSelect.selectedIndex = 0;
        calculateBtn.disabled = false;

    } catch (err) {
        modelSelect.disabled = true;
        console.error(err);
    }
});

// Optional: allow manual selection to enable button
modelSelect.addEventListener("change", () => {
    calculateBtn.disabled = !modelSelect.value;
});

// Calculate price
calculateBtn.addEventListener("click", async () => {
    const year = parseInt(yearSelect.value);
    const make = makeSelect.value;
    const model = modelSelect.value;

    if (!year || !make || !model) {
        priceResult.innerText = "Please select a year, make, and model.";
        return;
    }

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
