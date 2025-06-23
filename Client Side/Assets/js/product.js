document.addEventListener("DOMContentLoaded",function(){
    fetchProducts();
})

async function fetchProducts() {
  const response = await fetch("http://localhost:5000/client_get_addProduct", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to get Product from Database");
  }
  const data = await response.json();
  displayProducts_client(data);

  // console.log("Data:", data);
}

function displayProducts_client(data) {
  // console.log("test",data);

  const container = document.querySelector(".food");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p>No Product Found</p>";
    return;
  }
  data.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className = "menu";

    productElement.innerHTML = `
            <img class="fimg" src="${product.p_image}" alt="" />
              <div class="fdetail">
                <div class="fname">${product.p_name}</div>
                <div class="price_order">
                  <div>
                    <span class="price">${product.p_price}</span>
                  </div>
                  <button onclick="addToCart(event)" class="order_btn">Order</button>
                </div>
              </div>
        `;
    container.appendChild(productElement);
  });
}


function filterProducts() {
  const searchTerm = document.querySelector("#productSearch").value.toLowerCase();
  const products = document.querySelectorAll(".menu");

  products.forEach((product) => {
    const name = product.querySelector(".fname").textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      product.style.display = "flex"; // or whatever your display style is
    } else {
      product.style.display = "none";
    }
  });
}