const nav = document.querySelector('.nav');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const filters = document.querySelectorAll('.filter');
const items = document.querySelectorAll('.menu-item');
filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    items.forEach(item => {
      item.classList.toggle('hidden', category !== 'all' && item.dataset.category !== category);
    });
  });
});

const toast = document.getElementById('toast');

/* =========================
   FAVORITES
   ========================= */
const favoritesGrid = document.getElementById('favoritesGrid');
const favoritesEmpty = document.getElementById('favoritesEmpty');
const FAVORITES_KEY = 'velouraFavorites';
const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');

const menuFavoriteImages = {
  'Veloura Latte':'assets/latte.jpg',
  'Almond Caramel':'assets/almond-latte.jpg',
  'Classic Iced Coffee':'assets/latte.jpg',
  'Hot Americano':'assets/latte.jpg',
  'Iced Matcha':'assets/iced-matcha.jpg',
  'Matcha Latte':'assets/iced-matcha.jpg',
  'Matcha Coconut':'assets/iced-matcha.jpg',
  'Matcha Espresso Fusion':'assets/iced-matcha.jpg',
  'Strawberry Tart':'assets/croissant.jpg',
  'Chocolate Dream':'assets/latte.jpg',
  'Hojicha Latte':'assets/latte.jpg',
  'Lemonade Sparkle':'assets/latte.jpg'
};

function favoriteId(name){
  return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function saveFavorites(){ localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}
function isFavorite(id){ return favorites.some(item => item.id === id); }
function syncFavoriteButtons(){
  document.querySelectorAll('.heart, .favorite-btn').forEach(button => {
    const id = button.dataset.favId || favoriteId(button.closest('.menu-item')?.querySelector('h4')?.textContent.trim() || '');
    const saved = isFavorite(id);
    button.classList.toggle('saved', saved);
    button.textContent = saved ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(saved));
  });
}
function renderFavorites(){
  if(!favorites.length){
    favoritesGrid.innerHTML = '';
    favoritesGrid.appendChild(favoritesEmpty);
    favoritesEmpty.hidden = false;
    return;
  }
  favoritesEmpty.hidden = true;
  favoritesGrid.innerHTML = favorites.map(item => `
    <article class="favorite-card">
      <div class="favorite-image">
        <img src="${item.image}" alt="${item.name}">
        <button class="favorite-remove" type="button" data-fav-remove="${item.id}" aria-label="Remove ${item.name} from favorites">♥</button>
      </div>
      <div class="favorite-card-body">
        <p class="shop-type">${item.type || 'VELOURA FAVORITE'}</p>
        <h3>${item.name}</h3>
        <div class="favorite-bottom">
          <strong>$${Number(item.price).toFixed(2)}</strong>
          ${item.orderable ? `<button class="favorite-cart" type="button" data-fav-cart="${item.id}">Add to cart</button>` : `<a class="favorite-link" href="#menu">View menu →</a>`}
        </div>
      </div>
    </article>`).join('');
}
function toggleFavorite(data){
  const id = data.id;
  const index = favorites.findIndex(item => item.id === id);
  if(index >= 0){
    favorites.splice(index,1);
    showToast(`${data.name} removed from favorites`);
  } else {
    favorites.push(data);
    showToast(`${data.name} saved to favorites ♡`);
  }
  saveFavorites();
  syncFavoriteButtons();
  renderFavorites();
}

function favoriteFromMenu(button){
  const item = button.closest('.menu-item');
  const name = item.querySelector('h4').textContent.trim();
  const price = Number(item.querySelector('strong').textContent.replace('$',''));
  const category = item.dataset.category;
  toggleFavorite({
    id: favoriteId(name), name, price,
    image: menuFavoriteImages[name] || 'assets/veloura-cafe.jpg',
    type: category === 'matcha' ? 'MATCHA' : category === 'noncoffee' ? 'NON-COFFEE' : 'COFFEE',
    orderable: false
  });
}

document.querySelectorAll('.heart').forEach(button => {
  button.addEventListener('click', () => favoriteFromMenu(button));
});
document.querySelectorAll('.favorite-btn').forEach(button => {
  button.addEventListener('click', () => toggleFavorite({
    id: button.dataset.favId,
    name: button.dataset.favName,
    price: Number(button.dataset.favPrice),
    image: button.dataset.favImage,
    type: 'AT HOME · VELOURA',
    orderable: true
  }));
});
favoritesGrid.addEventListener('click', event => {
  const remove = event.target.closest('[data-fav-remove]');
  if(remove){
    const index = favorites.findIndex(item => item.id === remove.dataset.favRemove);
    if(index >= 0){
      const name = favorites[index].name;
      favorites.splice(index,1); saveFavorites(); renderFavorites(); syncFavoriteButtons(); showToast(`${name} removed from favorites`);
    }
    return;
  }
  const add = event.target.closest('[data-fav-cart]');
  if(add){
    const item = favorites.find(item => item.id === add.dataset.favCart);
    if(item) addToCart(item.name, Number(item.price));
  }
});

renderFavorites();

document.getElementById('newsletterForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.getElementById('email');
  const message = document.getElementById('formMessage');
  message.textContent = `You're on the list, ${email.value.split('@')[0]} ♡`;
  email.value = '';
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav a');
const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, {rootMargin:'-35% 0px -55% 0px'});
sections.forEach(section => activeObserver.observe(section));

/* =========================
   AT-HOME SHOPPING CART
   ========================= */
const cart = JSON.parse(localStorage.getItem('velouraCart') || '[]');
const cartTab = document.getElementById('cartTab');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartCountLabel = document.getElementById('cartCountLabel');
const cartTotalEl = document.getElementById('cartTotal');
const whatsappOrder = document.getElementById('whatsappOrder');

// Add the café's WhatsApp number here when you have it.
// Morocco example format: 2126XXXXXXXX (no +, spaces or leading 0).
const WHATSAPP_NUMBER = '';

const money = value => `$${value.toFixed(2)}`;

function saveCart(){
  localStorage.setItem('velouraCart', JSON.stringify(cart));
}

function openCart(){
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('show');
  cartDrawer.setAttribute('aria-hidden','false');
  cartTab.setAttribute('aria-expanded','true');
  document.body.classList.add('cart-open');
}

function closeCart(){
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('show');
  cartDrawer.setAttribute('aria-hidden','true');
  cartTab.setAttribute('aria-expanded','false');
  document.body.classList.remove('cart-open');
}

function addToCart(product, price){
  const existing = cart.find(item => item.product === product);
  if(existing) existing.quantity += 1;
  else cart.push({product, price, quantity:1});
  saveCart();
  renderCart();
  openCart();
  toast.textContent = `${product} added to your cart ♡`;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function changeQuantity(index, amount){
  cart[index].quantity += amount;
  if(cart[index].quantity <= 0) cart.splice(index,1);
  saveCart();
  renderCart();
}

function removeFromCart(index){
  cart.splice(index,1);
  saveCart();
  renderCart();
}

function renderCart(){
  const totalItems = cart.reduce((sum,item) => sum + item.quantity, 0);
  const total = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
  cartCountEl.textContent = totalItems;
  cartCountLabel.textContent = totalItems;
  cartTotalEl.textContent = money(total);

  if(!cart.length){
    cartItemsEl.innerHTML = `<div class="empty-cart"><span>♡</span><p>Your cart is waiting for something cozy.</p><small>Add something from the shop to get started.</small></div>`;
    return;
  }

  cartItemsEl.innerHTML = cart.map((item,index) => `
    <div class="cart-item">
      <div class="cart-thumb">${item.product.includes('Matcha') ? '抹茶' : item.product.includes('Syrup') || item.product.includes('Drizzle') ? 'V' : '☕'}</div>
      <div class="cart-item-info">
        <h4>${item.product}</h4>
        <p>${money(item.price)} each</p>
        <div class="qty-controls">
          <button type="button" data-cart-action="minus" data-index="${index}" aria-label="Decrease ${item.product}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="plus" data-index="${index}" aria-label="Increase ${item.product}">+</button>
        </div>
      </div>
      <div class="cart-item-price">
        ${money(item.price * item.quantity)}
        <button class="remove-item" type="button" data-cart-action="remove" data-index="${index}">Remove</button>
      </div>
    </div>`).join('');
}

document.querySelectorAll('.add-cart').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.shop-card');
    addToCart(card.dataset.product, Number(card.dataset.price));
  });
});

cartTab.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

document.addEventListener('keydown', event => {
  if(event.key === 'Escape') closeCart();
});

cartItemsEl.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if(!button) return;
  const index = Number(button.dataset.index);
  const action = button.dataset.cartAction;
  if(action === 'plus') changeQuantity(index, 1);
  if(action === 'minus') changeQuantity(index, -1);
  if(action === 'remove') removeFromCart(index);
});

whatsappOrder.addEventListener('click', () => {
  if(!cart.length){
    toast.textContent = 'Your cart is empty ♡';
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
    return;
  }

  const total = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
  const lines = cart.map(item => `• ${item.product} × ${item.quantity} — ${money(item.price * item.quantity)}`);
  const message = `Hello Veloura Café! ♡%0A%0AI'd like to order:%0A${encodeURIComponent(lines.join('\n'))}%0A%0ATotal: ${encodeURIComponent(money(total))}%0A%0AName:%0APick-up / delivery:%0ANotes:`;
  const url = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    : `https://wa.me/?text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

renderCart();
