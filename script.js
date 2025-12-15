const apiBase = "https://car-wash-api-513104733626.us-east1.run.app";

// Load distinct years
const years = [2025, 2024, 2023, 2022, 2021, 2020]; // or fetch dynamically

const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const calculateBtn = document.getElementById("calculateBtn");
const priceResult = document.getElementById("priceResult");

// Populate year dropdown
years.forEach(y => yearSelect.add(new Option(y, y)));

// Event listeners
yearSelect.addEventListener("change", async (e) => {
    const year = e.target.value;
    makeSelect.innerHTML = "";
    modelSelect.innerHTML = "";
    modelSelect.disabled = true;
    calculateBtn.disabled = true;

    if (!year) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/makes/${year}`);
        const data = await res.json();
        data.makes.forEach(m => makeSelect.add(new Option(m, m)));
        makeSelect.disabled = false;
    } catch (err) {
        makeSelect.disabled = true;
        console.error(err);
    }
});

makeSelect.addEventListener("change", async (e) => {
    const year = yearSelect.value;
    const make = e.target.value;
    modelSelect.innerHTML = "";
    calculateBtn.disabled = true;

    if (!year || !make) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/models/${year}/${make}`);
        const data = await res.json();
        data.models.forEach(m => modelSelect.add(new Option(m, m)));
        modelSelect.disabled = false;
    } catch (err) {
        modelSelect.disabled = true;
        console.error(err);
    }
});

modelSelect.addEventListener("change", () => {
    calculateBtn.disabled = !modelSelect.value;
});

calculateBtn.addEventListener("click", async () => {
    const year = parseInt(yearSelect.value);
    const make = makeSelect.value;
    const model = modelSelect.value;

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
});
