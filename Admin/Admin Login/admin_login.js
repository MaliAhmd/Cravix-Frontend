document.querySelector(".form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const response = await fetch("http://localhost:5000/admin_login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        console.log(data);
        // console.log(data.token);
        localStorage.setItem("Token", data.token);
        window.location.href = "../Admin Dashboard/admin_dashboard.html";
    } catch (error) {
        console.log("Error occur", error);
    }

})
