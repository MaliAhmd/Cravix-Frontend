document.addEventListener("DOMContentLoaded", function () {
  const transactionsTable = document.getElementById("transactions-table");
  const transactionDetails = document.getElementById("transaction-details");
  const closeDetailsBtn = document.getElementById("close-details");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const clearSearchBtn = document.getElementById("clear-search");

  let allTransactions = []; // Store all transactions for client-side filtering

  // Load transactions when page loads
  loadTransactions();

  // Close transaction details
  closeDetailsBtn.addEventListener("click", function () {
    transactionDetails.classList.remove("active");
  });

  // Search functionality
  searchBtn.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
      const filtered = allTransactions.filter((transaction) =>
        transaction.order_number.toLowerCase().includes(searchTerm)
      );
      renderTransactions(filtered);
    }
  });

  // Clear search functionality
  clearSearchBtn.addEventListener("click", function () {
    searchInput.value = "";
    renderTransactions(allTransactions);
  });

  // Allow search on Enter key
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  // Function to load transactions
  async function loadTransactions() {
    transactionsTable.innerHTML =
      '<tr><td colspan="4" class="loading">Loading transactions...</td></tr>';

    try {
      const response = await fetch("http://localhost:5000/transactions");
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const transactions = await response.json();
      allTransactions = transactions; // Store for client-side filtering

      if (transactions.length === 0) {
        transactionsTable.innerHTML =
          '<tr><td colspan="4" class="no-transactions">No transactions found</td></tr>';
        return;
      }

      renderTransactions(transactions);
    } catch (error) {
      console.error("Error:", error);
      transactionsTable.innerHTML =
        '<tr><td colspan="4" class="error">Failed to load transactions. Please try again.</td></tr>';
    }
  }

  // Function to render transactions in the table
  function renderTransactions(transactions) {
    transactionsTable.innerHTML = "";

    if (transactions.length === 0) {
      transactionsTable.innerHTML =
        '<tr><td colspan="4" class="no-transactions">No matching transactions found</td></tr>';
      return;
    }

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.dataset.id = transaction.id;

      const orderNumberCell = document.createElement("td");
      orderNumberCell.textContent = transaction.order_number;

      const dateCell = document.createElement("td");
      dateCell.textContent = new Date(transaction.date).toLocaleString();

      const itemsCell = document.createElement("td");
      itemsCell.textContent = transaction.item_count;

      const totalCell = document.createElement("td");
      totalCell.textContent = "Rs " + parseFloat(transaction.total).toFixed(2);

      row.appendChild(orderNumberCell);
      row.appendChild(dateCell);
      row.appendChild(itemsCell);
      row.appendChild(totalCell);

      row.addEventListener("click", () =>
        loadTransactionDetails(transaction.id)
      );

      transactionsTable.appendChild(row);
    });
  }

  // Function to load transaction details
  async function loadTransactionDetails(transactionId) {
    const detailOrderNumber = document.getElementById("detail-order-number");
    const detailDate = document.getElementById("detail-date");
    const detailItemCount = document.getElementById("detail-item-count");
    const detailTotal = document.getElementById("detail-total");
    const itemsContainer = document.getElementById("items-container");

    itemsContainer.innerHTML = '<div class="loading">Loading items...</div>';

    try {
      const response = await fetch(
        `http://localhost:5000/transactions/${transactionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction details");
      }

      const transaction = await response.json();

      // Update header info
      detailOrderNumber.textContent = transaction.order_number;
      detailDate.textContent = new Date(transaction.date).toLocaleString();
      detailItemCount.textContent = transaction.items.length;
      detailTotal.textContent = "Rs " + parseFloat(transaction.total).toFixed(2);

      // Render items
      renderItems(transaction.items);

      // Show details panel
      transactionDetails.classList.add("active");
    } catch (error) {
      console.error("Error:", error);
      itemsContainer.innerHTML =
        '<div class="error">Failed to load transaction details. Please try again.</div>';
    }
  }

  // Function to render items in the details view
  function renderItems(items) {
    const itemsContainer = document.getElementById("items-container");
    itemsContainer.innerHTML = "";

    if (items.length === 0) {
      itemsContainer.innerHTML =
        '<div class="no-transactions">No items found</div>';
      return;
    }

    items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";

      const nameDiv = document.createElement("div");
      nameDiv.className = "item-name";
      nameDiv.textContent = item.name || `Item ${item.id}`;

      const priceDiv = document.createElement("div");
      priceDiv.className = "item-price";
      priceDiv.textContent = "Rs " + parseFloat(item.price).toFixed(2);

      const quantityDiv = document.createElement("div");
      quantityDiv.className = "item-quantity";
      quantityDiv.textContent = `Qty: ${item.quantity}`;

      itemDiv.appendChild(nameDiv);
      itemDiv.appendChild(quantityDiv);
      itemDiv.appendChild(priceDiv);

      itemsContainer.appendChild(itemDiv);
    });
  }

  // Print receipt functionality
  const printReceiptBtn = document.getElementById("print-receipt");

  printReceiptBtn.addEventListener("click", function () {
    // Clone the transaction details to avoid modifying the original
    const detailsClone = transactionDetails.cloneNode(true);

    // Remove the close button from the clone
    const cloneCloseBtn = detailsClone.querySelector(".close-btn");
    if (cloneCloseBtn) cloneCloseBtn.remove();

    // Remove the print button from the clone
    const clonePrintBtn = detailsClone.querySelector(".print-btn");
    if (clonePrintBtn) clonePrintBtn.remove();

    // Create a new window for printing
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Receipt</title>");

    // Add styles
    printWindow.document.write("<style>");
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .receipt-header { text-align: center; margin-bottom: 20px; }
      .receipt-logo { max-width: 150px; height: auto; margin-bottom: 10px; }
      .receipt-title { font-size: 1.5em; font-weight: bold; margin: 10px 0; }
      .receipt-subtitle { font-size: 1em; color: #555; margin-bottom: 20px; }
      .transaction-header h2 { margin: 0; }
      .transaction-meta { display: flex; justify-content: space-between; margin: 20px 0; }
      .meta-item { flex: 1; }
      .meta-label { font-weight: bold; margin-bottom: 5px; }
      .items-list { margin: 20px 0; }
      .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
      .item-name{ width: 30%; }
      .item-quantity{ width: 25%; text-align: center; }
      .item-price{ width: 25%; text-align: end;}
      .total-amount { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 20px; }
      .thank-you { text-align: center; margin-top: 30px; font-style: italic; }
      @page { size: auto; margin: 10mm; }
    `);
    printWindow.document.write("</style>");
    printWindow.document.write("</head><body>");

    // Add receipt header with logo
    printWindow.document.write(`
      <div class="receipt-header">
        <img src="./Assets/images/logo.png" class="receipt-logo" alt="Company Logo">
        <div class="receipt-title">ORDER RECEIPT</div>
        <div class="receipt-subtitle">Thank you for your purchase!</div>
      </div>
    `);

    // Add the transaction content
    printWindow.document.write(detailsClone.innerHTML);

    // Add thank you message
    printWindow.document.write(
      '<div class="thank-you">Thank you for shopping with us!</div>'
    );

    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = function () {
      // Ensure the logo is loaded before printing
      const img = printWindow.document.querySelector(".receipt-logo");
      if (img.complete) {
        printWindow.print();
        printWindow.close();
      } else {
        img.onload = function () {
          printWindow.print();
          printWindow.close();
        };
      }
    };
  });
});
