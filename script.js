const apiBase = "https://car-wash-api-513104733626.us-east1.run.app";

const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const calculateBtn = document.getElementById("calculateBtn");
const priceResult = document.getElementById("priceResult");

// Initialize dropdowns
makeSelect.disabled = true;
modelSelect.disabled = true;
calculateBtn.disabled = true;

// Load years dynamically
async function loadYears() {
    try {
        const res = await fetch(`${apiBase}/vehicles/years`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        if (!data.years || data.years.length === 0) return;

        // Add placeholder first
        yearSelect.innerHTML = `<option value="" disabled selected>Select a year</option>`;
        data.years.forEach(y => yearSelect.add(new Option(y, y)));

    } catch (err) {
        console.error("Failed to load years:", err);
    }
}

// Populate makes for selected year
yearSelect.addEventListener("change", async () => {
    const year = yearSelect.value;
    makeSelect.innerHTML = `<option value="" disabled selected>Select a make</option>`;
    modelSelect.innerHTML = `<option value="" disabled selected>Select a model</option>`;
    makeSelect.disabled = true;
    modelSelect.disabled = true;
    calculateBtn.disabled = true;

    if (!year) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/makes/${year}`);
        if (!res.ok) return;

        const data = await res.json();
        if (!data.makes || data.makes.length === 0) return;

        data.makes.forEach(m => makeSelect.add(new Option(m, m)));
        makeSelect.disabled = false;

    } catch (err) {
        console.error(err);
    }
});

// Populate models for selected make
makeSelect.addEventListener("change", async () => {
    const year = yearSelect.value;
    const make = makeSelect.value;
    modelSelect.innerHTML = `<option value="" disabled selected>Select a model</option>`;
    modelSelect.disabled = true;
    calculateBtn.disabled = true;

    if (!year || !make) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/models/${year}/${make}`);
        if (!res.ok) return;

        const data = await res.json();
        if (!data.models || data.models.length === 0) return;

        data.models.forEach(m => modelSelect.add(new Option(m, m)));
        modelSelect.disabled = false;

    } catch (err) {
        console.error(err);
    }
});

// Enable calculate button only when a model is selected
modelSelect.addEventListener("change", () => {
    calculateBtn.disabled = !modelSelect.value;
});

// Calculate price
calculateBtn.addEventListener("click", async () => {
    const year = parseInt(yearSelect.value);
    const make = makeSelect.value;
    const model = modelSelect.value;

    if (!year || !make || !model) {
        priceResult.innerText = "Please select year, make, and model.";
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

// Initialize years dropdown
loadYears();
