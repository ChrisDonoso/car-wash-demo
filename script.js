const apiBase = "https://car-wash-api-513104733626.us-east1.run.app";

const yearSelect = document.getElementById("year");
const makeSelect = document.getElementById("make");
const modelSelect = document.getElementById("model");
const calculateBtn = document.getElementById("calculateBtn");
const priceResult = document.getElementById("priceResult");
const pricingContainer = document.getElementById("pricingInfo");

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

    // Collect selected conditions
    const conditions = [];
    if (document.getElementById("bugFee").checked) conditions.push("bug_buildup");
    if (document.getElementById("mudFee").checked) conditions.push("mud");
    if (document.getElementById("petHairFee").checked) conditions.push("pet_hair");

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
            body: JSON.stringify({ year, make, model, conditions })
        });

        const data = await res.json();

        if (!res.ok || data.total_price === undefined) {
            priceResult.innerText = data.detail || "Price not available";
            return;
        }

        // Show total price at top
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

        if (data.condition_fees && data.condition_fees.length > 0) {
            data.condition_fees.forEach(f => {
                breakdownHTML += `<li>${f.name}: $${f.fee.toFixed(2)}</li>`;
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

async function loadPricingInfo() {
    try {
        const res = await fetch(`${apiBase}/pricing/`);
        if (!res.ok) throw new Error("Failed to fetch pricing info");
        const data = await res.json();

        let html = "";

        // Base pricing
        if (data?.base_pricing) {
            html += `<div class="section-title">Base Prices</div><ul>`;
            for (const [size, price] of Object.entries(data.base_pricing)) {
                html += `<li><span class="name">${size.charAt(0).toUpperCase() + size.slice(1)}</span><span class="price">$${price.toFixed(2)}</span></li>`;
            }
            html += "</ul>";
        }

        // Feature fees
        if (data?.feature_fees) {
            html += `<div class="section-title">Feature Fees</div><ul>`;
            for (const [feature, fee] of Object.entries(data.feature_fees)) {
                const name = feature.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
                html += `<li><span class="name">${name}</span><span class="price">$${fee.toFixed(2)}</span></li>`;
            }
            html += "</ul>";
        }

        // Condition fees
        if (data?.condition_fees) {
            html += `<div class="section-title">Condition Fees</div><ul>`;
            for (const [condition, fee] of Object.entries(data.condition_fees)) {
                const name = condition.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
                html += `<li><span class="name">${name}</span><span class="price">$${fee.toFixed(2)}</span></li>`;
            }
            html += "</ul>";
        }

        pricingContainer.innerHTML = html;

    } catch (err) {
        console.error(err);
        pricingContainer.innerText = "Unable to load pricing info.";
    }
}

// Initialize years dropdown
loadPricingInfo();
loadYears();
