// ===== Global Popup Functions =====
function popup() {
    document.querySelector(".login_popup").style.display = "block";
    document.querySelector(".overlay").style.display = "block";
    document.querySelector(".signup_popup").style.display = "none";
}

function closePopup() {
    document.querySelector(".login_popup").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
}

function signup_Popup() {
    document.querySelector(".signup_popup").style.display = "block";
    document.querySelector(".overlay").style.display = "block";
    document.querySelector(".login_popup").style.display = "none";
}

function signup_closePopup() {
    document.querySelector(".signup_popup").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
}

function cart_Open() {
    const cart = document.querySelector(".cart_slide");
    if (cart.classList.contains('active')) {
        cart.classList.remove('active');
        document.querySelector(".overlay").style.display = "none";
    } else {
        cart.classList.add('active');
        document.querySelector(".overlay").style.display = "block";
    }
}

// ===== DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', function () {
    // Menu items & section switching
    const menuItems = document.querySelectorAll('.sub_items[data-target]');
    const defaultSection = document.getElementById('order-section');
    
    if (defaultSection) defaultSection.classList.add('active');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', function () {
        alert('Logout clicked');
    });

    // Overlay click handler (closes ALL popups & cart)
    document.querySelector('.overlay')?.addEventListener('click', function () {
        document.querySelector(".cart_slide")?.classList.remove('active');
        document.querySelector(".login_popup").style.display = "none";
        document.querySelector(".signup_popup").style.display = "none";
        this.style.display = "none";
    });

    // Prevent clicks inside popups/cart from closing them
    document.querySelector('.cart_slide')?.addEventListener('click', (e) => e.stopPropagation());
    document.querySelector('.login_popup')?.addEventListener('click', (e) => e.stopPropagation());
    document.querySelector('.signup_popup')?.addEventListener('click', (e) => e.stopPropagation());
});


