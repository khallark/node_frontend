let InitVals = [];

function disCont(section) {
    const currentPath = window.location.pathname;
    window.location.href = `/${section}.html`;
}

function showUpdateTemplate() {
    let update = document.getElementById("no-show");
    let main = document.getElementById("main-wrapper");
    main.classList.add("wrapper-blur");
    update.id = "show";
}

function removeUpdateTemplate() {
    setTimeout(() => {
        let update = document.getElementById("show");
        let main = document.getElementById("main-wrapper");
        main.classList.remove("wrapper-blur");
        update.id = "no-show";
    }, 200);
}

function preventRefresh(event) {
    event.preventDefault();
}

function dash_toggle(bool) {
    let dashboard = document.getElementById('dboard');
    if(bool) {
        dashboard.style.transform = 'translateX(0px)';
        dashboard.style.overflow = 'visible';
    } else {
        dashboard.style.transform = 'translateX(-170px)';
        dashboard.style.overflow = 'hidden';
    }
}

const mediaQuery = window.matchMedia("(min-width: 900px)");
function handleMediaChange(event) {
    if (event.matches) {
        dash_toggle(true);
    } else {
        dash_toggle(false);
    }
}
mediaQuery.addEventListener("change", handleMediaChange);


const optionsBox = document.getElementById("optionsBox");
const table = document.getElementById("tablediv");
function clearAll() {
    optionsBox.style.display = "none";
    const type_fetch = menuOptions[2].textContent;
    const type_text = menuOptions[3].textContent;
    optionsBox.innerHTML = '';
    optionsBox.innerHTML = `
        <ul>
            <li>Update</li>
            <li>Delete</li>
            <li style="display: none;">${type_fetch}</li>
            <li style="display: none;">${type_text}</li>
        </ul>
    `
    menuOptions = Array.from(optionsBox.querySelectorAll("li"));
}
let menuOptions = Array.from(optionsBox.querySelectorAll("li"));
table.addEventListener("contextmenu", (event) => {
    clearAll()
    const isRow = event.target.tagName === 'TD';
    if (!isRow) return;
    event.preventDefault();
    
    menuOptions[0].addEventListener("click", function() {
        showUpdateTemplate();
        fillGlobalArrayWithInitVals(event.target);
    })
    menuOptions[1].addEventListener("click", function() {
        delete_row(event.target, menuOptions[2].textContent, menuOptions[3].textContent);
    })
    const tableBounds = table.getBoundingClientRect();
    const menuWidth = 170;
    const menuHeight = 88;
    let x;
    if(menuOptions[2].textContent === 'search' || window.innerWidth < 900) x = Math.min(event.pageX, tableBounds.right - menuWidth);
    else x = Math.min(event.pageX - 170, tableBounds.right - menuWidth - 170);
    const y = Math.min(event.pageY, tableBounds.bottom - menuHeight);
    optionsBox.style.left = `${x}px`;
    optionsBox.style.top = `${y}px`;
    optionsBox.style.display = "block";
});
document.addEventListener("click", clearAll);


async function __addORsearch(type_fetch) {
    if(type_fetch === 'searchStringPref') return await __fetchSearched();
    else return await __fetchProducts(type_fetch);
}

async function __fetchProducts(type_fetch) {
    try {
        const response = await fetch(`https://prods-exp-server.onrender.com/${type_fetch}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}


function formattedSearch(str) {
    str = str.trim();
    if(!str) return '*&!$%@@*%^&&$#^@%$';
    return str;
}

let searchTimeout;
let currentController;
function debounceSearch(callback, delay = 300) {
    return (...args) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => callback(...args), delay);
    };
}

async function __fetchSearched() {
    if (currentController) {
        currentController.abort();
    }
    currentController = new AbortController();

    try {
        const string = encodeURIComponent(formattedSearch(document.getElementById('search-input').value));
        const response = await fetch(
            `https://prods-exp-server.onrender.com/searchStringPref/${string}`,
            { signal: currentController.signal }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch expiring products: ${response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error fetching products:', error);
        }
        return new Array();
    }
}

async function __deleteTuple(category, product_n, batch_no, qty, price, manufacturer_n, bill_no, exp_date) {
    const baseUrl = 'https://prods-exp-server.onrender.com/delete';
    const params = new URLSearchParams({
        category: category,
        product_name: product_n,
        batch_number: batch_no,
        qty: qty,
        price: price,
        manufacturer_name: manufacturer_n,
        bill_number: bill_no,
        expiry_date: exp_date
    }).toString();
    const fullUrl = `${baseUrl}?${params}`;
    try {
        const response = await fetch(fullUrl, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete product: ${response.statusText}`);
        }

        const data = await response.text();

    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

async function __addTuple(productDetails) {
    const [cat, product_n, batch_no, qty, price, manufacturer_n, bill_no, exp_date, is_sold] = productDetails;

    const baseUrl = 'https://prods-exp-server.onrender.com/addproduct';
    const bodyData = {
        category: cat,
        product_name: product_n,
        batch_number: batch_no,
        qty: qty,
        price: price,
        manufacturer_name: manufacturer_n,
        bill_number: bill_no,
        expiry_date: exp_date,
        is_sold: is_sold
    };

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to add product: ${response.statusText}`);
        }
        const data = await response.text();
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}


async function __fetch_hard_searched_products(string) {
    try {
        string = formattedSearch(string)
        const response = await fetch(`https://prods-exp-server.onrender.com/searchStringHard/${encodeURIComponent(string)}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch expiring products: ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}

function deleteAllChildren(parentDiv) {
    const children = parentDiv.children;
    const numberOfChildren = children.length;

    for (let i = numberOfChildren - 1; i >= 0; i--) {
        parentDiv.removeChild(children[i]);
    }
}

function convertDateFormat(dateString) {
    if(dateString == '') return '';

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function TexualDateFormat(_date) {
    if(_date === '') return '';
    const date = new Date(_date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
function normalizeSpaces(str) {
    return str.trim().replace(/\s+/g, ' ');
}

async function delete_row(button, type_fetch, type_text) {
    const row = button.parentNode.children;
    await __deleteTuple(row[0].textContent, row[1].textContent, row[2].textContent, row[3].textContent, row[4].textContent, row[5].textContent, row[6].textContent, convertDateFormat(row[7].textContent));

    if(type_fetch === type_text) await searchString('');
    else await addProducts(type_fetch, type_text);
}

async function addProducts(type_fetch, type_text) {
    document.getElementById('reset-bttn').style.display = 'none';
    let load = document.getElementById('reset-not-loading');
    if(load) load.id = 'reset-loading';
    const products = await __addORsearch(type_fetch);
    document.getElementById('reset-bttn').style.display = 'block';
    load = document.getElementById('reset-loading');
    if(load) load.id = 'reset-not-loading';
    const prods_sec = document.getElementById('content-table');
    deleteAllChildren(prods_sec);
    document.getElementById('num').textContent = `${type_text} Items (${products.length})`;
    for (let i = 0; i < products.length; i++) {
        const productArray = Object.values(products[i]);
        let newRow = prods_sec.insertRow();
        if(productArray[8] === true) newRow.style.backgroundColor = 'rgb(78, 78, 105)';
        for(let i = 0; i < 7; i++) {
            let cell = newRow.insertCell(i);
            cell.innerHTML = `${productArray[i]}`;
        }
        cell = newRow.insertCell(7);
        cell.innerHTML = `${TexualDateFormat(productArray[7])}`;
    }
}

async function searchString(event) {
    const products = await __addORsearch('searchStringPref');
    const search_sec = document.getElementById('content-table');
    deleteAllChildren(search_sec);
    document.getElementById('num').textContent = `Items (${products.length})`;
    for (let i = 0; i < products.length; i++) {
        const productArray = Object.values(products[i]);
        let newRow = search_sec.insertRow();
        if(productArray[8] === true) newRow.style.backgroundColor = 'rgb(78, 78, 105)';
        for(let i = 0; i < 7; i++) {
            let cell = newRow.insertCell(i);
            cell.innerHTML = `${productArray[i]}`;
        }
        cell = newRow.insertCell(7);
        cell.innerHTML = `${TexualDateFormat(productArray[7])}`;
    }
}


function loading(submit_text) {
    document.getElementById(submit_text).style.display = 'none';
    let load = document.getElementById('not-loading');
    if(load) load.id = 'loading';
}
function notLoading(submit_text) {
    document.getElementById(submit_text).style.display = 'block';
    let load = document.getElementById('loading');
    if(load) load.id = 'not-loading';
}
function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

async function addRow() {
    loading('submit-text');
    const Pdate = document.getElementById('purchase-date').value;
    if(Pdate != '' && !isValidDateFormat(Pdate)) {
        notLoading('submit-text');
        console.error('invalid purchase-date error');
        return;
    }
    const vals = [
        document.getElementById('create-cat').value,
        normalizeSpaces(document.getElementById('inp-1').value),
        normalizeSpaces(document.getElementById('inp-2').value),
        normalizeSpaces(document.getElementById('inp-3').value),
        normalizeSpaces(document.getElementById('inp-4').value),
        normalizeSpaces(document.getElementById('inp-5').value),
        normalizeSpaces(document.getElementById('inp-6').value + ' (' + TexualDateFormat(Pdate) + ')'),
        normalizeSpaces(document.getElementById('inp-7').value),
        document.getElementById('create-sold').value
    ];
    
    if(vals[0] === 'none') {
        notLoading('submit-text');
        console.error('None is not a valid category.');
        return;
    }
    if(vals[1] === '') {
        notLoading('submit-text');
        console.error('Product name cannot be empty.');
        return;
    }
    if(!isValidDateFormat(vals[7])) {
        notLoading('submit-text');
        console.error('invalid date format error');
        return;
    }
    
    const product = await __fetch_hard_searched_products(vals[1]);
    
    if(product.length > 0) {
        notLoading('submit-text');
        console.error('product name should be unique');
        return;
    }
    try {
        await __addTuple(vals);
    } catch (error) {
        notLoading('submit-text');
        console.error("Error in adding row:", error);
        return;
    }
    notLoading('submit-text');
    document.getElementById('create-cat').value = 'none';
    document.getElementById('inp-1').value =
    document.getElementById('inp-2').value =
    document.getElementById('inp-3').value =
    document.getElementById('inp-4').value =
    document.getElementById('inp-5').value =
    document.getElementById('inp-6').value =
    document.getElementById('purchase-date').value =
    document.getElementById('inp-7').value = '';
    document.getElementById('create-sold').value = 'FALSE';
}



async function fillGlobalArrayWithInitVals(button) {
    const row = button.parentNode.children;
    const sold_colour = (window.getComputedStyle(button.parentNode).backgroundColor === 'rgb(78, 78, 105)') ? 'TRUE' : 'FALSE';
    InitVals = [row[0].textContent, row[1].textContent, row[2].textContent, row[3].textContent, row[4].textContent,
    row[5].textContent, row[6].textContent, convertDateFormat(row[7].textContent), sold_colour];

    document.getElementById('update-cat').value = `${InitVals[0]}`;
    document.getElementById('inp-8').value = `${InitVals[1]}`;
    document.getElementById('inp-9').value = `${InitVals[2]}`;
    document.getElementById('inp-10').value = `${InitVals[3]}`;
    document.getElementById('inp-11').value = `${InitVals[4]}`;
    document.getElementById('inp-12').value = `${InitVals[5]}`;
    document.getElementById('inp-13').value = `${InitVals[6].match(/^(.*?)\s*\(.*\)$/)[1]}`;
    document.getElementById('purchase-date').value = `${convertDateFormat(InitVals[6].match(/\((.*?)\)/)[1])}`;
    document.getElementById('inp-14').value = `${InitVals[7]}`;
    document.getElementById('update-sold').value = `${InitVals[8]}`;
}

async function emptyUpdateInputs() {
    InitVals.length = 0;
    document.getElementById('update-cat').value = 'none';
    document.getElementById('inp-8').value =
    document.getElementById('inp-9').value =
    document.getElementById('inp-10').value =
    document.getElementById('inp-11').value =
    document.getElementById('inp-12').value =
    document.getElementById('inp-13').value =
    document.getElementById('purchase-date').value =
    document.getElementById('inp-14').value = '';
    document.getElementById('update-sold').value = 'FALSE';
}


async function updateRow(type_fetch, type_text) {
    loading('submit-text');
    const Pdate = document.getElementById('purchase-date').value;
    if(Pdate != '' && !isValidDateFormat(Pdate)) {
        notLoading('submit-text');
        console.error('invalid purchase-date error');
        return;
    }
    const vals = [
        document.getElementById('update-cat').value,
        normalizeSpaces(document.getElementById('inp-8').value),
        normalizeSpaces(document.getElementById('inp-9').value),
        normalizeSpaces(document.getElementById('inp-10').value),
        normalizeSpaces(document.getElementById('inp-11').value),
        normalizeSpaces(document.getElementById('inp-12').value),
        normalizeSpaces(document.getElementById('inp-13').value + ' (' + TexualDateFormat(Pdate) + ')'),
        normalizeSpaces(document.getElementById('inp-14').value),
        document.getElementById('update-sold').value
    ];
    if(vals[0] === 'none') {
        notLoading('submit-text');
        console.error('None is not a valid category.');
        return;
    }
    if(vals[1] === '') {
        notLoading('submit-text');
        console.error('Product name cannot be empty.');
        return;
    }
    if(!isValidDateFormat(vals[7])) {
        notLoading('submit-text');
        console.error('invalid date format error');
        return;
    }


    await __deleteTuple(InitVals[0], InitVals[1], InitVals[2], InitVals[3], InitVals[4], InitVals[5], InitVals[6], convertDateFormat(InitVals[7]));
    try {
        await __addTuple(vals);
    } catch (error) {
        notLoading('submit-text');
        console.error("Error in adding row:", error);
        return;
    }
    notLoading('submit-text');
    let update = document.getElementById("show");
    let main = document.getElementById("main-wrapper");
    main.classList.remove("wrapper-blur");
    update.id = "no-show";
    await emptyUpdateInputs();

    if(type_fetch === type_text) await searchString('');
    else await addProducts(type_fetch, type_text);
}