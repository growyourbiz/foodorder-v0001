// script.js

// Global variables to store current order
let currentOrder = {}; // Object to store items in the cart: { itemId_size: { item, size, quantity, calculatedPrice, note } }

// --- Helper Functions ---

// Formats a number as Thai currency (e.g., 1,234.50)
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

// Converts a string to a valid HTML ID (removes spaces, special chars)
function createValidId(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// --- Render Functions ---

// Renders the food menu from data.js
function renderFoodMenu() {
    const foodMenuContainer = document.getElementById('food-menu');
    foodMenuContainer.innerHTML = ''; // Clear existing items

    menuItems.forEach(item => {
        const hasSizes = Object.keys(item.prices).length > 1; // Check if there are multiple sizes

        // Generate size options HTML
        const sizeOptionsHtml = hasSizes
            ? `<div class="mt-2 text-sm text-gray-600">
                   ขนาด:
                   ${Object.keys(item.prices).map(size => `
                       <label class="inline-flex items-center ml-2">
                           <input type="radio" name="size-${item.id}" value="${size}"
                               class="form-radio text-red-600" ${size === item.defaultSize ? 'checked' : ''}
                               onchange="updateItemPrice('${item.id}')">
                           <span class="ml-1 capitalize">${size === 'small' ? 'เล็ก' : size === 'medium' ? 'กลาง' : 'ใหญ่'}</span>
                       </label>
                   `).join('')}
               </div>`
            : `<input type="hidden" name="size-${item.id}" value="${item.defaultSize}">`; // Hidden input for single size items

        // Get initial price based on default size
        const initialPrice = item.prices[item.defaultSize];

        const foodCardHtml = `
            <div id="food-card-${item.id}" class="food-card">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-24 sm:w-36 sm:h-36 rounded-lg object-cover mb-4 sm:mb-0 sm:mr-6">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-800">${item.name}</h3> <p class="text-sm text-gray-600 mb-2">${item.description}</p>
                    ${sizeOptionsHtml}
                    <div class="flex items-center justify-between mt-3">
                        <span id="price-${item.id}" class="text-xl font-bold text-red-600">${formatCurrency(initialPrice)} บาท</span>
                        <button class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 add-to-cart-btn"
                                data-item-id="${item.id}"
                                data-default-size="${item.defaultSize}">
                            เพิ่ม </button>
                    </div>
                </div>
            </div>
        `;
        foodMenuContainer.insertAdjacentHTML('beforeend', foodCardHtml);
    });
}

// Renders the order summary in the cart
function renderOrderSummary() {
    const orderSummaryContainer = document.getElementById('order-summary');
    orderSummaryContainer.innerHTML = ''; // Clear existing items
    
    let subtotal = 0;
    let hasItems = false;

    for (const key in currentOrder) {
        if (currentOrder.hasOwnProperty(key)) {
            hasItems = true;
            const orderItem = currentOrder[key];
            const displayPrice = orderItem.calculatedPrice; // Price for one unit of selected size
            const itemTotal = orderItem.quantity * displayPrice;
            subtotal += itemTotal;

            const orderItemHtml = `
                <div id="order-item-${key}" class="order-item">
                    <div class="order-item-details">
                        <h4 class="text-base font-medium">${orderItem.item.name} (${orderItem.size === 'small' ? 'เล็ก' : orderItem.size === 'medium' ? 'กลาง' : 'ใหญ่'})</h4>
                        <p class="text-sm text-gray-600">ราคา: ${formatCurrency(displayPrice)} x <span class="font-bold">${orderItem.quantity}</span> = <span class="font-bold">${formatCurrency(itemTotal)}</span> บาท</p>
                        <div class="mt-1">
                            <span class="note-toggle" data-item-key="${key}">
                                ${orderItem.note ? 'แก้ไขหมายเหตุ' : 'ใส่หมายเหตุ (กดที่นี่)'}
                            </span>
                            <textarea class="note-input hidden" rows="2" placeholder="ใส่หมายเหตุ (ถ้ามี)"
                                data-item-key="${key}">${orderItem.note || ''}</textarea>
                        </div>
                    </div>
                    <div class="order-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn decrease-qty-btn" data-item-key="${key}">-</button>
                            <input type="number" class="quantity-input" value="${orderItem.quantity}" min="1" readonly>
                            <button class="quantity-btn increase-qty-btn" data-item-key="${key}">+</button>
                        </div>
                        <button class="remove-item-btn" data-item-key="${key}">ลบ</button>
                    </div>
                </div>
            `;
            orderSummaryContainer.insertAdjacentHTML('beforeend', orderItemHtml);
        }
    }

    // Show/hide empty cart message
    const emptyOrderMessage = document.getElementById('empty-order-message');
    if (hasItems) {
        emptyOrderMessage.classList.add('hidden');
    } else {
        emptyOrderMessage.classList.remove('hidden');
    }

    // Calculate delivery fee
    let deliveryFee = 0;
    let deliveryFeeText = '0.00 บาท';
    const deliveryFeeElement = document.getElementById('delivery-fee');

    // เงื่อนไขค่าส่ง: ยอดสั่ง >= 100 ส่งฟรี ถ้า <100 ค่าส่ง 10 บาท
    if (subtotal >= deliveryConditions.freeDeliveryThreshold) {
        deliveryFeeText = 'ส่งฟรีค่ะ';
        deliveryFeeElement.classList.remove('text-red-500');
        deliveryFeeElement.classList.add('text-green-600');
    } else if (subtotal > 0 && subtotal < deliveryConditions.freeDeliveryThreshold) {
        deliveryFee = deliveryConditions.deliveryFee;
        deliveryFeeText = `${formatCurrency(deliveryFee)} บาท`;
        deliveryFeeElement.classList.remove('text-green-600');
        deliveryFeeElement.classList.add('text-red-500');
    } else { // subtotal is 0
        deliveryFeeText = '0.00 บาท';
        deliveryFeeElement.classList.remove('text-green-600');
        deliveryFeeElement.classList.add('text-red-500');
    }
    
    const totalAmount = subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal) + ' บาท';
    document.getElementById('delivery-fee').textContent = deliveryFeeText;
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount) + ' บาท';

    // Re-attach event listeners for newly rendered elements
    attachOrderSummaryEventListeners();
}

// --- Event Handlers and Logic ---

// Updates the displayed price of a food item when size is changed
function updateItemPrice(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const selectedSizeInput = document.querySelector(`input[name="size-${itemId}"]:checked`);
    const selectedSize = selectedSizeInput ? selectedSizeInput.value : item.defaultSize;
    const price = item.prices[selectedSize];
    
    if (price !== undefined) {
        document.getElementById(`price-${itemId}`).textContent = formatCurrency(price) + ' บาท';
    }
}

// Adds an item to the current order or updates its quantity
function addItemToCart(itemId, defaultSize) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    // Get selected size from radio buttons (if available)
    const selectedSizeInput = document.querySelector(`input[name="size-${itemId}"]:checked`);
    const selectedSize = selectedSizeInput ? selectedSizeInput.value : defaultSize;

    // Validate selected size
    if (!item.prices[selectedSize]) {
        console.error(`Invalid size selected for item ${itemId}: ${selectedSize}`);
        alert('กรุณาเลือกขนาดอาหารที่ถูกต้อง');
        return;
    }

    const calculatedPrice = item.prices[selectedSize];
    const key = `${itemId}_${selectedSize}`;

    if (currentOrder[key]) {
        // Item already in cart, just increment quantity
        currentOrder[key].quantity += 1;
    } else {
        // Add new item to cart
        currentOrder[key] = {
            item: item,
            size: selectedSize,
            quantity: 1, // Default quantity = 1
            calculatedPrice: calculatedPrice,
            note: '' // Initialize with empty note
        };
    }
    renderOrderSummary();
}

// Removes an item from the cart
function removeItemFromCart(key) {
    if (confirm('คุณต้องการลบรายการนี้ออกจากตะกร้าใช่หรือไม่?')) {
        delete currentOrder[key];
        renderOrderSummary();
    }
}

// Adjusts quantity of an item in the cart
function adjustQuantity(key, change) {
    if (currentOrder[key]) {
        currentOrder[key].quantity += change;
        if (currentOrder[key].quantity <= 0) {
            removeItemFromCart(key); // Remove if quantity drops to 0 or below
        } else {
            renderOrderSummary();
        }
    }
}

// Handles note input
function handleNoteToggle(event) {
    const toggleSpan = event.target;
    const itemKey = toggleSpan.dataset.itemKey;
    const noteInput = document.querySelector(`#order-item-${itemKey} .note-input`);

    if (noteInput) {
        noteInput.classList.toggle('hidden');
        if (!noteInput.classList.contains('hidden')) {
            noteInput.focus(); // Focus on the textarea when it appears
        }
    }
}

function handleNoteInput(event) {
    const noteInput = event.target;
    const itemKey = noteInput.dataset.itemKey;
    const toggleSpan = document.querySelector(`#order-item-${itemKey} .note-toggle`);

    if (currentOrder[itemKey]) {
        currentOrder[itemKey].note = noteInput.value;
        // Update toggle text based on note presence
        toggleSpan.textContent = noteInput.value ? 'แก้ไขหมายเหตุ' : 'ใส่หมายเหตุ (กดที่นี่)';
    }
}

// Function to capture the order summary section
function captureOrderSummary() {
    const summarySection = document.getElementById('summary-section'); // The entire summary card

    // Temporarily hide elements that shouldn't be in the screenshot
    const elementsToHide = [
        document.getElementById('checkout-button'),
        document.getElementById('capture-summary-button'),
        ...document.querySelectorAll('.note-toggle'),
        ...document.querySelectorAll('.note-input'), // Hide note inputs even if visible
        ...document.querySelectorAll('.quantity-control'),
        ...document.querySelectorAll('.remove-item-btn')
    ];

    elementsToHide.forEach(el => { if(el) el.style.display = 'none'; });

    // Store original display state of notes to restore later
    const originalNoteDisplayStates = [];

    // Make sure notes are visible if they have content before screenshot
    // Also display quantities more clearly for screenshot
    document.querySelectorAll('.order-item-details').forEach(itemDetailsDiv => {
        const itemKey = itemDetailsDiv.querySelector('.note-toggle').dataset.itemKey;
        const orderItem = currentOrder[itemKey];

        // Ensure quantities are visible and bold in the summary
        const qtySpan = itemDetailsDiv.querySelector('.text-gray-600 span.font-bold');
        if (qtySpan) qtySpan.textContent = orderItem.quantity; // Make sure it's the raw number

        // Ensure total for item is bold
        const itemTotalSpan = itemDetailsDiv.querySelector('.text-gray-800 span.font-bold');
        if (itemTotalSpan) itemTotalSpan.textContent = formatCurrency(orderItem.quantity * orderItem.calculatedPrice);


        // Handle notes for screenshot
        const noteToggle = itemDetailsDiv.querySelector('.note-toggle');
        const noteInput = itemDetailsDiv.querySelector('.note-input');
        
        if (orderItem.note) {
            // Store original state and hide toggle
            originalNoteDisplayStates.push({ toggle: noteToggle, input: noteInput, originalToggleDisplay: noteToggle.style.display });
            noteToggle.style.display = 'none';

            // Create a temporary span to display the note for screenshot
            const tempNoteSpan = document.createElement('span');
            tempNoteSpan.className = 'text-sm text-gray-700 block mt-1 screenshot-note'; // Add a class for easy removal
            tempNoteSpan.textContent = `หมายเหตุ: ${orderItem.note}`;
            noteInput.parentNode.insertBefore(tempNoteSpan, noteInput.nextSibling); // Insert after input (which is hidden)
        } else {
             // If no note, hide the "ใส่หมายเหตุ" toggle for screenshot
            if (noteToggle) noteToggle.style.display = 'none';
        }
    });

    // Use html2canvas to capture the element
    html2canvas(summarySection, {
        scale: 2, // Increase scale for better resolution
        logging: false, // Disable console logs from html2canvas
        useCORS: true // Required if images are from external domains (like Unsplash)
    }).then(canvas => {
        // Show the modal
        const modal = document.getElementById('capture-modal');
        const imgContainer = document.getElementById('captured-image-container');
        const downloadLink = document.getElementById('download-image-button');

        imgContainer.innerHTML = ''; // Clear previous image
        canvas.style.maxWidth = '100%'; // Ensure canvas fits within container
        canvas.style.height = 'auto';
        imgContainer.appendChild(canvas);

        // Set download link
        downloadLink.href = canvas.toDataURL('image/png'); // Get image data as PNG
        downloadLink.download = `order-summary_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.png`; // Suggest a filename

        modal.classList.remove('hidden'); // Show the modal

        // Restore hidden elements after capturing
        elementsToHide.forEach(el => {
            if (el) {
                // Special handling for quantity-control which should be flex
                if (el.classList.contains('quantity-control')) {
                    el.style.display = 'flex';
                } else {
                    el.style.display = ''; // Restore default display
                }
            }
        });

        // Restore notes display
        originalNoteDisplayStates.forEach(state => {
            if (state.toggle) state.toggle.style.display = state.originalToggleDisplay;
            if (state.input) state.input.classList.add('hidden'); // Ensure input is hidden
        });
        document.querySelectorAll('.screenshot-note').forEach(el => el.remove()); // Remove temporary note spans
        
    }).catch(error => {
        console.error('Error capturing summary:', error);
        alert('เกิดข้อผิดพลาดในการสร้างภาพสรุปออเดอร์');
        // Ensure buttons are restored even if there's an error
        elementsToHide.forEach(el => {
            if (el) {
                 if (el.classList.contains('quantity-control')) {
                    el.style.display = 'flex';
                } else {
                    el.style.display = '';
                }
            }
        });
        document.querySelectorAll('.screenshot-note').forEach(el => el.remove());
    });
}


// --- Event Listener Attachments ---

// Attaches event listeners for dynamically loaded elements in order summary
function attachOrderSummaryEventListeners() {
    document.querySelectorAll('.increase-qty-btn').forEach(button => {
        button.onclick = (e) => adjustQuantity(e.target.dataset.itemKey, 1);
    });
    document.querySelectorAll('.decrease-qty-btn').forEach(button => {
        button.onclick = (e) => adjustQuantity(e.target.dataset.itemKey, -1);
    });
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.onclick = (e) => removeItemFromCart(e.target.dataset.itemKey);
    });
    document.querySelectorAll('.note-toggle').forEach(span => {
        span.onclick = handleNoteToggle;
    });
    document.querySelectorAll('.note-input').forEach(textarea => {
        textarea.oninput = handleNoteInput; // Use oninput to save changes as user types
    });
}

// --- Initial Setup & Main Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    renderFoodMenu(); // Render menu when page loads

    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            const defaultSize = e.target.dataset.defaultSize; // Pass default size to function
            addItemToCart(itemId, defaultSize);
        });
    });

    // Checkout button (for demonstration, just logs the order)
    document.getElementById('checkout-button').addEventListener('click', () => {
        if (Object.keys(currentOrder).length === 0) {
            alert('ยังไม่มีรายการในตะกร้า กรุณาเลือกอาหารก่อนยืนยันการสั่งซื้อค่ะ');
            return;
        }
        
        let orderDetails = 'รายการสั่งซื้อของคุณ:\n';
        let finalTotal = 0;
        let finalSubtotal = 0;

        for (const key in currentOrder) {
            const item = currentOrder[key];
            const itemTotal = item.quantity * item.calculatedPrice;
            finalSubtotal += itemTotal;
            orderDetails += `- ${item.item.name} (${item.size === 'small' ? 'เล็ก' : item.size === 'medium' ? 'กลาง' : 'ใหญ่'}) x ${item.quantity} = ${formatCurrency(itemTotal)} บาท`;
            if (item.note) {
                orderDetails += ` (หมายเหตุ: ${item.note})`;
            }
            orderDetails += '\n';
        }

        let deliveryFee = 0;
        if (finalSubtotal >= deliveryConditions.freeDeliveryThreshold) {
            orderDetails += `\nค่าจัดส่ง: ส่งฟรี\n`;
        } else if (finalSubtotal > 0 && finalSubtotal < deliveryConditions.freeDeliveryThreshold) {
            deliveryFee = deliveryConditions.deliveryFee;
            orderDetails += `\nค่าจัดส่ง: ${formatCurrency(deliveryFee)} บาท\n`;
        } else {
             orderDetails += `\nค่าจัดส่ง: 0.00 บาท\n`; // Case of empty cart
        }
        
        finalTotal = finalSubtotal + deliveryFee;
        orderDetails += `\nยอดรวมทั้งหมด: ${formatCurrency(finalTotal)} บาท\n`;

        alert(orderDetails + '\n\n**ฟังก์ชันนี้เป็นแค่ตัวอย่าง คุณสามารถเชื่อมต่อไปยังระบบสั่งซื้อจริงได้**');
        console.log('Final Order:', currentOrder);
        console.log('Total Amount:', finalTotal);
    });

    // Event listener for the Capture Summary button
    document.getElementById('capture-summary-button').addEventListener('click', captureOrderSummary);

    // Event listener for closing the modal
    document.getElementById('close-modal-button').addEventListener('click', () => {
        document.getElementById('capture-modal').classList.add('hidden');
    });
});
