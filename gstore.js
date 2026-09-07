// ===== Configuration =====
const WHATSAPP_NUMBER = '2349043249252'; // Gstore WhatsApp Business Number

// ===== State Management =====
let cart = [];
let currentTheme = 'dark';

// ===== DOM Elements =====
const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const newsletterForm = document.getElementById('newsletterForm');

// ===== Local Storage =====
function saveCart() {
    localStorage.setItem('gstore-cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('gstore-cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
}

// ===== Theme Management =====
function initTheme() {
    const savedTheme = localStorage.getItem('gstore-theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gstore-theme', theme);
    
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');
    
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

themeToggle.addEventListener('click', () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// ===== Mobile Menu =====
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// ===== Cart Management =====
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${productName} added to cart!`);
    
    setTimeout(() => {
        openCart();
    }, 300);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    
    if (cart.length === 0) {
        showNotification('Cart is empty');
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        saveCart();
        updateCartUI();
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showNotification('Cart cleared');
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function formatPrice(price) {
    return `₦${price.toLocaleString('en-NG')}`;
}

function updateCartUI() {
    const totalItems = getCartItemCount();
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
        cartCount.style.animation = 'none';
        setTimeout(() => {
            cartCount.style.animation = 'pulse 0.3s ease-out';
        }, 10);
    } else {
        cartCount.style.display = 'none';
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; color: var(--muted-foreground);">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p class="cart-empty">Your cart is empty</p>
                <p class="cart-empty-sub">Browse our collection and add items you love</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">${formatPrice(item.price)} each</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="cart-item-subtotal">
                    Subtotal: ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
        `).join('');
        
        const total = getCartTotal();
        cartTotal.textContent = formatPrice(total);
        cartFooter.style.display = 'block';
    }
}

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCart();
        chatBox.classList.remove('active');
    }
});

// ===== WhatsApp Order =====
function orderOnWhatsApp(productName, price) {
    const message = `Hello Gstore! 👋\n\nI want to order:\n\n*Product:* ${productName}\n*Price:* ${formatPrice(price)}\n*Quantity:* 1\n\nPlease confirm availability. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

function checkoutCart() {
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    let message = '🛍️ *New Order - Gstore* 🛍️\n\n';
    message += '━━━━━━━━━━━━━━━━━━\n\n';
    
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        message += `*${index + 1}. ${item.name}*\n`;
        message += `   • Quantity: ${item.quantity}\n`;
        message += `   • Unit Price: ${formatPrice(item.price)}\n`;
        message += `   • Subtotal: ${formatPrice(subtotal)}\n\n`;
    });
    
    message += '━━━━━━━━━━━━━━━━━━\n';
    message += `*Total Items:* ${getCartItemCount()}\n`;
    message += `*Total Amount:* ${formatPrice(getCartTotal())}\n\n`;
    message += 'Please confirm my order and provide payment details. Thank you! 🙏';
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
    showNotification('Order sent on WhatsApp! ✅');
}

// ===== Chat Widget =====
chatToggle.addEventListener('click', () => {
    chatBox.classList.toggle('active');
    
    if (chatBox.classList.contains('active')) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
});

function sendQuickMessage(message) {
    chatMessages.innerHTML += `
        <div class="message user" style="background-color: var(--accent); color: #000; align-self: flex-end;">
            ${message}
        </div>
    `;
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
        chatMessages.innerHTML += `
            <div class="message assistant typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 300);
    
    setTimeout(() => {
        const typingIndicator = document.querySelector('.message.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        let response = '';
        
        if (message.includes('delivery')) {
            response = '🚚 We deliver nationwide!\n\n• Lagos: 24-48 hours\n• Other states: 3-5 business days\n• Free delivery on orders above ₦50,000';
        } else if (message.includes('size')) {
            response = '📏 Size Guide:\n\n• Trousers: S-XXL\n• Shoes: EU 40-46\n• Bags: Standard/Large\n\nContact us for personalized sizing help!';
        } else if (message.includes('order')) {
            response = '🛍️ How to Order:\n\n1. Browse products\n2. Add to cart\n3. Adjust quantities\n4. Checkout via WhatsApp\n\nWe\'ll confirm your order immediately!';
        } else if (message.includes('return')) {
            response = '↩️ Return Policy:\n\n• 7-day returns\n• Unused items in original packaging\n• Contact us within 48 hours of delivery';
        } else {
            response = 'Thank you for your message! Our team will respond shortly. You can also reach us at +234 904 324 9252.';
        }
        
        chatMessages.innerHTML += `
            <div class="message assistant">
                ${response}
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
}

// ===== Newsletter Form =====
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (email) {
        showNotification('Thank you for subscribing! 🎉');
        emailInput.value = '';
        
        const subscribers = JSON.parse(localStorage.getItem('gstore-subscribers') || '[]');
        subscribers.push({ email, date: new Date().toISOString() });
        localStorage.setItem('gstore-subscribers', JSON.stringify(subscribers));
    }
});

// ===== Notification System =====
function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
        icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            ${icon}
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translate(-50%, 20px);
        background-color: var(--accent);
        color: #000;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 2000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 90vw;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
    }
    
    .notification-error {
        background-color: #ef4444;
        color: #fff;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
    
    .cart-empty-state {
        text-align: center;
        padding: 40px 20px;
    }
    
    .cart-empty {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--muted-foreground);
    }
    
    .cart-empty-sub {
        font-size: 0.85rem;
        color: var(--muted-foreground);
        opacity: 0.7;
    }
    
    .cart-item {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border: 1px solid var(--border);
        border-radius: 8px;
        margin-bottom: 12px;
        background-color: var(--card-bg);
        transition: all 0.3s ease;
    }
    
    .cart-item:hover {
        border-color: var(--accent);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .cart-item-info {
        flex: 1;
    }
    
    .cart-item-name {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 4px;
        color: var(--foreground);
    }
    
    .cart-item-price {
        color: var(--muted-foreground);
        font-size: 0.85rem;
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .quantity-control {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: var(--muted);
        border-radius: 8px;
        padding: 4px;
    }
    
    .qty-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--background);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--foreground);
        font-size: 1.2rem;
        font-weight: 600;
        transition: all 0.2s ease;
        cursor: pointer;
    }
    
    .qty-btn:hover {
        background-color: var(--accent);
        color: #000;
        border-color: var(--accent);
    }
    
    .qty-btn:active {
        transform: scale(0.9);
    }
    
    .qty-display {
        min-width: 30px;
        text-align: center;
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .cart-item-remove {
        background: none;
        border: none;
        color: #ef4444;
        transition: all 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
    }
    
    .cart-item-remove:hover {
        background-color: rgba(239, 68, 68, 0.1);
        transform: scale(1.1);
    }
    
    .cart-item-subtotal {
        font-weight: 700;
        color: var(--accent);
        font-size: 0.95rem;
        text-align: right;
        padding-top: 8px;
        border-top: 1px solid var(--border);
    }
    
    .typing-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        background-color: var(--muted-foreground);
        border-radius: 50%;
        margin: 0 2px;
        animation: typingAnimation 1s infinite;
    }
    
    .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typingAnimation {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
        }
        30% {
            transform: translateY(-4px);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ===== Header Scroll Effect =====
let lastScroll = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(() => {
        if (currentScroll > lastScroll && currentScroll > 150) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadCart();
    updateCartUI();
    
    // Keyboard shortcut for cart (Ctrl/Cmd + K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (cartSidebar.classList.contains('active')) {
                closeCart();
            } else {
                openCart();
            }
        }
    });
});

// ===== Global Functions =====
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.orderOnWhatsApp = orderOnWhatsApp;
window.checkoutCart = checkoutCart;
window.sendQuickMessage = sendQuickMessage;
window.openCart = openCart;
window.closeCart = closeCart;