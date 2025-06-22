function addToCart(event) {
  // Get the menu item container
  const menuItem = event.target.closest(".menu");

  // Extract item details
  const itemName = menuItem.querySelector(".fname").textContent;
  const itemPriceText = menuItem.querySelector(".price").textContent;
  const itemPrice = parseInt(itemPriceText.replace(/\D/g, ""));
  const itemImage = menuItem.querySelector(".fimg").src;

  // Get or initialize cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex((item) => item.name === itemName);

  if (existingItemIndex >= 0) {
    // Increment quantity and update price
    cart[existingItemIndex].quantity += 1;
    cart[existingItemIndex].updatedPrice =
      cart[existingItemIndex].quantity * cart[existingItemIndex].price;
  } else {
    // Add new item to cart
    cart.push({
      name: itemName,
      price: itemPrice,
      updatedPrice: itemPrice,
      image: itemImage,
      quantity: 1,
    });
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update the cart UI
  updateCartUI();
  // Open cart
  cart_Open();
}

function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartMiddle = document.querySelector(".middle");
  const cartHead = document.querySelector(".head");
  const clearCart = document.querySelector(".cart_text_2");
  const order_Bill = document.querySelector(".total_price");
  const cartContainer = document.querySelector(".cart_items");

  // Handle .middle and clear cart text visibility
  if (cartMiddle) {
    cartMiddle.style.display = cart.length > 0 ? "none" : "flex";
  }
  if (clearCart) {
    clearCart.style.display = cart.length > 0 ? "block" : "none";
  }

  // Handle order bill visibility
  if (order_Bill) {
    order_Bill.style.display = cart.length > 0 ? "flex" : "none";
  }

  // Handle cart items container
  const itemsContainer = document.querySelector(".cart-items-container");
  if (cart.length > 0) {
    // Create container if it doesn't exist
    if (!itemsContainer) {
      const newContainer = document.createElement("div");
      newContainer.className = "cart-items-container";
      cartContainer.insertBefore(newContainer, cartHead.nextSibling);
    }
    // Populate with items
    updateCartItems();
  } else {
    // Remove container if it exists
    if (itemsContainer) {
      itemsContainer.remove();
    }
  }

  // Update payment summary
  updatePaymentSummary();
}

function updateCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.querySelector(".cart-items-container");

  if (!container) return;

  container.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart_slide_item";
    cartItem.innerHTML = `
      <div class="cart_detail">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">Rs ${item.updatedPrice}</span>
        </div>
      </div>
      <div class="qc-btn">
        <div class="quantity-controls">
          <button class="qc_btn decrement-btn">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="qc_btn increment-btn">+</button>
        </div>
        <div class="del">
          <img src="./images/delete.png" alt="" class="delete-img">
        </div>
      </div>
      <hr>
    `;
    container.appendChild(cartItem);
  });
}

// // Clear cart handler
// document.getElementById('confirm-clear').addEventListener('click', function() {
//   localStorage.removeItem('cart');
//   updateCartUI(); // This will handle showing .middle automatically
//   document.querySelector('.clear-cart-popup').style.display = 'none';
// });

function updatePaymentSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const subtotal = cart.reduce((sum, item) => sum + item.updatedPrice, 0);
  const gst = subtotal * 0.1; // 10% GST
  const total = subtotal + gst;

  const subtotalElement = document.querySelector(
    ".subtotal_items:first-child .subtotal_price"
  );
  const gstElement = document.querySelector(
    ".subtotal_items:nth-child(2) .subtotal_price"
  );
  const totalElement = document.getElementById("subtotal_total");

  if (subtotalElement)
    subtotalElement.textContent = `Rs ${subtotal.toFixed(2)}`;
  if (gstElement) gstElement.textContent = `Rs ${gst.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `Rs ${total.toFixed(2)}`;

  // Add event listener for amount paid input
  const amountPaidInput = document.getElementById("amountPaid");
  if (amountPaidInput) {
    console.log("total", total);

    amountPaidInput.addEventListener("input", function () {
      const paidAmount = parseFloat(this.value) || 0;
      const balance = paidAmount - total;
      const balanceDisplay = document.querySelector(".balance-display");
      const balanceAmount = document.getElementById("balanceAmount");

      if (balanceAmount) {
        balanceAmount.textContent = `Rs ${balance.toFixed(2)}`;
      }

      if (balanceDisplay) {
        balanceDisplay.style.display = paidAmount > 0 ? "flex" : "none";
      }
    });
  }
}

// Call the function when the page loads

// Add event listeners to all order buttons
document.querySelectorAll(".order_btn").forEach((button) => {
  button.addEventListener("click", addToCart);
});

// Initialize cart UI when page loads
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();

  // Add event delegation for increment/decrement buttons
  document.querySelector(".cart_items").addEventListener("click", (e) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (
      e.target.classList.contains("increment-btn") ||
      e.target.classList.contains("decrement-btn")
    ) {
      const cartItem = e.target.closest(".cart_slide_item");
      const itemName = cartItem.querySelector(".cart-item-name").textContent;
      const itemIndex = cart.findIndex((item) => item.name === itemName);

      if (itemIndex >= 0) {
        if (e.target.classList.contains("increment-btn")) {
          cart[itemIndex].quantity += 1;
        } else if (
          e.target.classList.contains("decrement-btn") &&
          cart[itemIndex].quantity > 1
        ) {
          cart[itemIndex].quantity -= 1;
        }

        cart[itemIndex].updatedPrice =
          cart[itemIndex].quantity * cart[itemIndex].price;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartUI();
      }
    }

    // Handle delete button
    if (e.target.classList.contains("delete-img")) {
      const cartItem = e.target.closest(".cart_slide_item");
      const itemName = cartItem.querySelector(".cart-item-name").textContent;
      const updatedCart = cart.filter((item) => item.name !== itemName);

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      updateCartUI();
    }
  });

  // Add this event listener to your existing code
  document
    .querySelector(".charge_btn")
    .addEventListener("click", async function () {
      // Get current cart and calculate totals
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const subtotal = cart.reduce((sum, item) => sum + item.updatedPrice, 0);
      const gst = subtotal * 0.1;
      const total = subtotal + gst;

      // Get amount paid and calculate balance
      const amountPaid =
        parseFloat(document.getElementById("amountPaid").value) || 0;
      const balance = amountPaid - total;

      try {
        // Send transaction to backend
        const response = await fetch(
          "http://localhost:5000/process-transaction",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: cart,
              subtotal: subtotal,
              gst: gst,
              total: total,
              amountPaid: amountPaid,
              balance: balance,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to process transaction");
        }

        const result = await response.json();
        console.log("Transaction processed:", result);

        printReceipt(cart,subtotal,gst,total,amountPaid,balance,result.orderNumber);

        // Clear the current cart
        localStorage.removeItem("cart");

        // Update UI
        updateCartUI();

        // Reset amount paid input
        document.getElementById("amountPaid").value = "";

        // Hide balance display
        document.querySelector(".balance-display").style.display = "none";

        // Show success message
        alert("Transaction completed successfully!");
      } catch (error) {
        console.error("Error processing transaction:", error);
        alert("Failed to process transaction. Please try again.");
      }
    });
  // filterProducts();
});

// document.querySelector('.clear-cart-popup').style.display = 'flex';
document.querySelector(".cart_text_2").addEventListener("click", function () {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length > 0) {
    document.querySelector(".clear-cart-popup").style.display = "flex";
  }
});

// Confirm Clear Cart
document.getElementById("confirm-clear").addEventListener("click", function () {
  localStorage.removeItem("cart");
  updateCartUI();
  document.querySelector(".clear-cart-popup").style.display = "none";
  // document.querySelector('.middle').style.display="flex"
  // console.log("test",container);
});

// Cancel Clear Cart
document.getElementById("cancel-clear").addEventListener("click", function () {
  document.querySelector(".clear-cart-popup").style.display = "none";
});

function printReceipt(
  items,
  subtotal,
  gst,
  total,
  amountPaid,
  balance,
  orderNumber
) {
  // Create a new window for printing
  const receiptWindow = window.open("", "_blank");

  // Build receipt HTML using your template
  const receiptHTML = `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cravix - Receipt</title>
    <link rel="icon" type="image/x-icon" href="./images/logo.png" />
    <style>

@media print {
            body * {
                visibility: hidden;
                margin: 0;
                padding: 0;
            }
            .container, .container * {
                visibility: visible;
            }
            .container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 10px;
                border: none;
                box-shadow: none;
            }
        }

        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');

:root {
    --primary: #FF6B00;
    --dark: #1F1F1F;
    --gray-dark: #555555;
    --gray-light: #fff;
    --accent-green: #38B000;
    --accent-red: #E63946;
    --light-bg: #F6F6F6;
    /* Corrected from your palette (F2F2FF2 was likely a typo) */
}

* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

body {
    font-family: "Open Sans", sans-serif;
    background-color: #F6F6F6;
    margin: 0;
    padding: 0;
}

.container {
     width: 80mm;
    min-height: 90vh;
    margin: 5% auto 20px; /* top | horizontal | bottom */
    position: relative; /* Changed from absolute */
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    display: flex;
    flex-direction: column;
    padding: 10px;
    background-color: #fff;
    gap: 10px;
}

.img_container {
    width: 100%;
    height: 10vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.logo {
    width: 50%;
    height: 100%;
}

.contact_container {
    width: 100%;
    height: 10vh;
    padding: 0 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
}

.heading {
    font-size: 1rem;
    font-weight: bold;
}

.details {
    font-size: .7em;
    color: #666;
}

.table_container {
    width: 100%;
    height: auto;
    min-height: 50vh;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-grow: 1;
}

#customers {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed; /* Added for consistent column widths */
}
#customers th:nth-child(1) { /* Items Name column */
    width: 50%;
}

#customers th:nth-child(2) { /* Qty column - made narrower */
    width: 15%;
}

#customers th:nth-child(3) { /* Price column */
    width: 35%;
}
#customers tr {
    height: 30px; /* Fixed row height */
}
#customers td:nth-child(1),
#customers td:nth-child(2),
#customers td:nth-child(3) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


#customers td,
#customers th {
    border: 1px solid #ddd;
    padding: 2px 8px;
    font-size: 0.8rem;
}

#customers tr:nth-child(even) {
    background-color: #f2f2f2;
}

#customers tr:hover {
    background-color: #ddd;
}

#customers th {
    padding: 10px;
    text-align: left;
    background-color: #FF6B00;
    color: white;
}

.total_detail {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: end;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 10px;
    background-color: #EEE;
}

.total_detail p span {
    margin-left: 20px;
}

.thanks_container {
    width: 100%;
    height: 10vh;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    
}
    </style>
</head>

<body>
    <div class="container">
        <div class="img_container">
            <img class="logo" src="./images/logo0.png" alt="">
        </div>
        <div class="contact_container">
            <span class="heading">Contact Info:</span>
            <p class="details">
                Address : street city, state 0000</br>
                Email : Cravix@gmail.com</br>
                Phone : 555-555-5555</br>
            </p>
        </div>
        <div class="table_container">
            <p class="heading">No.: ${orderNumber}</p>
            <table id="customers">
                <tr>
                    <th>Items Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
                 ${items
      .map(
        (item) => `
                <tr class="service">
                  <td class="tableitem">${item.name}</td>
                  <td class="tableitem">${item.quantity || 1}</td>
                  <td class="tableitem">Rs ${item.updatedPrice.toFixed(2)}</td>
                </tr>
              `
      )
      .join("")}
               
            </table>
            <div class="total_detail">
                <p>Subtotal: <span>Rs ${subtotal.toFixed(2)}</span></p>
                <p>GST(10%): <span>Rs ${gst.toFixed(2)}</span></p>
                <p>Total: <span>Rs ${total.toFixed(2)}</span></p>
                <p>Amount Paid: <span>Rs ${amountPaid.toFixed(2)}</span></p>
                <p>Balance Remain: <span>Rs ${balance.toFixed(2)}</span></p>
            </div>
        </div>
        <div class="thanks_container">
            <p class="legal"><strong>Thank you for your Order!</strong><br>
            <p class="Legal">${new Date().toLocaleString()}</p>
                
        </div>
    </div>
    <script>
         // Automatically trigger print dialog when the window loads
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Optionally close the window after printing
                window.onafterprint = function() {
                    window.close();
                };
            }, 200);
        };
    </script>
</body>

</html>
  `;

  // Write the receipt content to the new window
  receiptWindow.document.open();
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
}
