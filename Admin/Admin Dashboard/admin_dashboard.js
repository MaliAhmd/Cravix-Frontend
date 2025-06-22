document.addEventListener("DOMContentLoaded", function () {
  // Menu items & section switching
  const menuItems = document.querySelectorAll(".sub_items[data-target]");
  const defaultSection = document.getElementById("order-section");

  if (defaultSection) defaultSection.classList.add("active");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.remove("active");
      });
      const targetId = this.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add("active");
    });
  });

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", async ()=> {
      const token = localStorage.getItem("Token");
      // console.log("Token on dashboard load:", token);
      try {
        
        const response = await fetch("http://localhost:5000/admin-logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Logout failed");
        }
        localStorage.removeItem("Token");
        window.location.href = "../Admin login/admin_login.html";
      } catch (error) {
        console.error("Logout error:", error);
      }
    });

  fetchProducts();
  const searchInput = document.getElementById("productSearch");
  searchInput.addEventListener("input", filterProducts);
});

document.getElementById("file-input").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const preview = document.getElementById("image-preview");
      preview.src = event.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

document
  .querySelector("#product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("Token");

    const loader = document.querySelector(".loader-overlay ");
    loader.style.display = "flex";

    const p_image = document.querySelector("#file-input").files[0];
    const p_name = document.querySelector("#product-name").value;
    const p_price = document.querySelector("#product-price").value;

    if (!p_image || !p_name || !p_price) {
      alert("Please fill all fields and select an image");
      return;
    }
    const formData = new FormData();
    formData.append("p_image", p_image);
    formData.append("p_name", p_name);
    formData.append("p_price", p_price);

    try {
      const response = await fetch("http://localhost:5000/add_product", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      fetchProducts();
      // console.log("Data", data);

      if (response.ok) {
        document.querySelector("#product-form").reset();
        document.querySelector("#image-preview").style.display = "none";
      } else {
        console.log("Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // Hide loader when request is complete (success or error)
      loader.style.display = "none";
    }
  });

function filterProducts() {
  const searchTerm = document
    .getElementById("productSearch")
    .value.toLowerCase();
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

async function fetchProducts() {
  const token = localStorage.getItem("Token");
  const response = await fetch("http://localhost:5000/get_addProduct", {
    method: "GET",
    headers: { 
      "Authorization": `Bearer ${token}`
  }
});
  if (!response.ok) {
    throw new Error("Failed to get Product from Database");
  }
  const data = await response.json();
  displayProducts(data);

  // console.log("Data:" ,data);
}

function displayProducts(data) {
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
                  <button onclick="open_updateContainer(${JSON.stringify(
                    product
                  ).replace(
                    /"/g,
                    "&quot;"
                  )})" id="updateBtn" class="order_btn">Update</button>
                  <button id="deleteBtn" class="order_btn" onclick="deleteProduct('${
                    product.id
                  }')" >Delete</button>
                </div>
              </div>
        `;
    container.appendChild(productElement);
  });
}

function open_updateContainer(productData) {
  //  console.log("Data",productData);
  if (typeof productData === "string") {
    productData = JSON.parse(productData.replace(/&quot;/g, '"'));
  }

  const imagePreview = document.getElementById("upt-image-preview");
  imagePreview.src = productData.p_image;
  imagePreview.style.display = "block";

  document.querySelector("#upt-product-name").value = productData.p_name;
  document.querySelector("#upt-product-price").value = productData.p_price;

  document.getElementById("upt-file-input").value = "";
  document.querySelector(".update_form").dataset.productId = productData.id;

  // console.log("Hello");
  document.querySelector(".update_container").style.display = "block";
  document.querySelector(".overlay").style.display = "block";
  document.body.classList.add("no-scroll");
}

function close_updateContainer() {
  document.querySelector(".update_container").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
  document.body.classList.remove("no-scroll");

  document.querySelector(".update_form").reset();
  document.getElementById("upt-image-preview").style.display = "none";
}

document
  .getElementById("upt-file-input")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById("upt-image-preview").src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

async function handleUpdate(event) {
  event.preventDefault();
  const token = localStorage.getItem("Token");
  const loader = document.querySelector(".loader-overlay ");
  loader.style.display = "flex";


  const form = event.target;
  const p_id = form.dataset.productId;
  const update_p_img = document.querySelector("#upt-file-input").files[0];
  const update_p_name = document.querySelector("#upt-product-name").value;
  const update_p_price = document.querySelector("#upt-product-price").value;

  const formData = new FormData();
  if (update_p_img) {
    formData.append("p_image", update_p_img);
  }
  formData.append("p_name", update_p_name);
  formData.append("p_price", update_p_price);

  try {
    const responce = await fetch(
      `http://localhost:5000/update_product/${p_id}`,
      {
        method: "PUT",
        headers:{
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      }
    );
    if (!responce.ok) {
      throw new Error("Failed to update product");
    }

    const result = await responce.json();
    console.log("Result", result);
    close_updateContainer();
    fetchProducts();
  } catch (error) {
    console.error("Error updating product:", error);
  } finally {
    // Hide loader when request is complete (success or error)
    loader.style.display = "none";
  }
}

async function deleteProduct(productId) {
  const loader = document.querySelector(".loader-overlay ");
  loader.style.display = "flex";
  const token = localStorage.getItem("Token");
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  try {
    const responce = await fetch(
      `http://localhost:5000/delete_product/${productId}`,
      {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" },
      }
    );
    if (!responce.ok) {
      throw new Error("Failed to Deleted from front end");
    }

    const result = await responce.json();
    console.log("Successfully deleted from frontend");
    fetchProducts();
  } catch (error) {
    console.error("Error deleting product:", error);
  } finally {
    // Hide loader when request is complete (success or error)
    loader.style.display = "none";
  }
}
