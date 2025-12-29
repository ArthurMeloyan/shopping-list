let items = JSON.parse(localStorage.getItem("shopping_list")) || [];
let editId = null;
let usdRate = null;
const url = 'https://open.er-api.com/v6/latest/AMD';

const nameInput = document.querySelector("#name-input");
const priceInput = document.querySelector("#price-input");
const qtyInput = document.querySelector("#qty-input");
const mainBtn = document.querySelector(".add-btn");
const tBody = document.querySelector("#table-body");
const totalSumAmd = document.querySelector("#total-sum-display");
const totalSumUsd = document.querySelector("#total-sum-usd");
const searchInput = document.querySelector("#search-input");
const sortOption = document.querySelector("#sort");

let searchTerm = '';
let sortOrder = 'date';

// Listeners
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
});

sortOption.addEventListener('change', (e) => {
    sortOrder = e.target.value;
    render();
});

function clearInput() {
    nameInput.value = ''; priceInput.value = ''; qtyInput.value = '';
}

function render() {
    tBody.innerHTML = '';
    let totalAmd = 0;

    // 1. Filtration
    let filtered = items.filter(item => item.name.toLowerCase().includes(searchTerm));

    // 2. Sorting
    if (sortOrder === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'price') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'quantity') {
        filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (sortOrder === 'date') {
        filtered.sort((a, b) => a.id - b.id);
    }

    // 3. Render
    filtered.forEach((item, index) => {
        const rowSumAmd = item.price * item.quantity;
        totalAmd += rowSumAmd;
        
        const tr = document.createElement('tr');
        if (item.id === editId) tr.style.backgroundColor = '#fff9db';
        
        const rowSumUsd = usdRate ? (rowSumAmd * usdRate).toFixed(2) : "0.00";

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.price} ֏</td>
            <td>${item.quantity} հատ</td>
            <td>${rowSumAmd} ֏ / $${rowSumUsd}</td>
            <td>
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            </td>
        `;
        tBody.appendChild(tr);
    });

    // 4. Total
    totalSumAmd.textContent = totalAmd + ' amd';
    if (usdRate) {
        totalSumUsd.textContent = (totalAmd * usdRate).toFixed(2) + " usd";
    }

    localStorage.setItem("shopping_list", JSON.stringify(items));
}

function addItem() {
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const quantity = parseInt(qtyInput.value);

    if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
        alert("Լրացրեք տվյալները ճիշտ:");
        return;
    }

    if (editId === null) {
        items.push({ name, price, quantity, id: Date.now() });
    } else {
        const index = items.findIndex(it => it.id === editId);
        items[index] = { ...items[index], name, price, quantity };
        editId = null;
        mainBtn.textContent = 'Ավելացնել';
    }
    clearInput();
    render();
}

tBody.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('delete-btn')) {
        items = items.filter(it => it.id !== id);
        if (editId === id) { editId = null; mainBtn.textContent = "Ավելացնել"; }
        render();
    }

    if (e.target.classList.contains('edit-btn')) {
        if (editId === id) {
            editId = null; mainBtn.textContent = 'Ավելացնել'; clearInput();
        } else {
            const item = items.find(it => it.id === id);
            nameInput.value = item.name;
            priceInput.value = item.price;
            qtyInput.value = item.quantity;
            editId = id;
            mainBtn.textContent = 'Փոփոխել';
        }
        render();
    }
});

async function getExchangeRate() {
    try {
        const res = await fetch(url);
        const data = await res.json();
        usdRate = data.rates.USD;
        render();
    } catch (err) { console.log("Курс не загружен", err); }
}

mainBtn.onclick = addItem;
getExchangeRate();
render();