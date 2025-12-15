const apiBase = "https://your-cloud-run-url"; // replace with your actual API base

// DOM elements
const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const calculateBtn = document.getElementById("calculateBtn");
const priceResult = document.getElementById("priceResult");
const priceBreakdown = document.getElementById("priceBreakdown");

// Helper: capitalize first letter of each word
function titleCase(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Populate years dynamically
async function populateYears() {
    try {
        const res = await fetch(`${apiBase}/vehicles/years`);
        const data = await res.json();
        data.years.forEach(year => yearSelect.add(new Option(year, year)));
    } catch (err) {
        console.error("Error fetching years:", err);
    }
}

// Populate makes when year changes
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
        data.makes.forEach(m => makeSelect.add(new Option(titleCase(m), m)));
        makeSelect.disabled = false;
    } catch (err) {
        makeSelect.disabled = true;
        console.error(err);
    }
});

// Populate models when make changes
makeSelect.addEventListener("change", async (e) => {
    const year = parseInt(yearSelect.value);
    const make = e.target.value;
    modelSelect.innerHTML = "";
    calculateBtn.disabled = true;

    if (!make) return;

    try {
        const res = await fetch(`${apiBase}/vehicles/models/${year}/${make}`);
        const data = await res.json();
        data.models.forEach(m => modelSelect.add(new Option(titleCase(m), m)));
        modelSelect.disabled = false;
    } catch (err) {
        modelSelect.disabled = true;
        console.error(err);
    }
});

// Enable calculate button when model selected
modelSelect.addEventListener("change", () => {
    calculateBtn.disabled = !modelSelect.value;
});

// Calculate price and show breakdown
calculateBtn.addEventListener("click", async () => {
    const year = parseInt(yearSelect.value);
    const make = makeSelect.value;
    const model = modelSelect.value;

    priceResult.innerText = "Calculating...";
    priceBreakdown.innerHTML = "";

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

        const data = await res.json();

        if (!res.ok || data.total_price === undefined) {
            priceResult.innerText = data.detail || "Price not available";
            return;
        }

        // Show total price
        priceResult.innerText = `Total Price: $${data.total_price.toFixed(2)}`;

        // Build breakdown
        let breakdownHTML = `<ul>`;
        breakdownHTML += `<li>Base Price (${data.size_category}): $${data.base_price.toFixed(2)}</li>`;

        if (data.features && data.features.length > 0) {
            data.features.forEach(f => {
                if (f.detected) {
                    breakdownHTML += `<li>${f.name}: $${f.fee.toFixed(2)}</li>`;
                }
            });
        }

        breakdownHTML += `<li><strong>Total: $${data.total_price.toFixed(2)}</strong></li>`;
        breakdownHTML += `</ul>`;

        priceBreakdown.innerHTML = breakdownHTML;

    } catch (err) {
        priceResult.innerText = "Error calculating price";
        console.error(err);
    }
});

// Initialize
populateYears();
