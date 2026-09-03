/* =========================================================
   Whiskey & More — House of Fine Spirits
   Catalog, cart, WhatsApp ordering
   ========================================================= */

/* -------- Settings -------- */
// Replace with the final WhatsApp number if needed (country code included, no "+" or spaces)
const WHATSAPP_NUMBER = "96176385630";

// Paste your YouTube video link here (any format: youtube.com/watch?v=..., youtu.be/..., or just the ID)
const YOUTUBE_URL = "https://www.youtube.com/watch?v=-WxiEkMYqK8";

function getYouTubeId(url){
  if(!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if(match) return match[1];
  if(/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

function forceTopQuality(player){
  // YouTube auto-throttles muted background loops (esp. on mobile data).
  // Nudge it back up to the best available level whenever it drops.
  try{
    const levels = player.getAvailableQualityLevels();
    if(levels && levels.length) player.setPlaybackQuality(levels[0]);
  } catch(e){}
}

function mountHeroVideo(){
  const wrap = document.getElementById("heroVideoWrap");
  if(!wrap) return;
  const id = getYouTubeId(YOUTUBE_URL);
  if(!id) return; // no link set yet — hero keeps its dark background

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  let hideCoverTimer = null;

  window.onYouTubeIframeAPIReady = function(){
    const player = new YT.Player("heroVideoWrap", {
      videoId: id,
      playerVars: {
        autoplay: 1, mute: 1, loop: 1, playlist: id,
        controls: 0, showinfo: 0, rel: 0, modestbranding: 1,
        playsinline: 1, iv_load_policy: 3, disablekb: 1,
        cc_load_policy: 0, cc_lang_pref: "none",
        vq: "hd1080", origin: window.location.origin,
      },
      events: {
        onReady: (e)=>{ e.target.mute(); forceTopQuality(e.target); e.target.playVideo(); },
        onPlaybackQualityChange: (e)=> forceTopQuality(e.target),
        onStateChange: (e)=>{
          // Only reveal the video while it's actually playing smoothly — this
          // hides YouTube's own loading/buffering UI (title, logo, prev/next
          // arrows) so it reads as a normal background video instead of an
          // embed. Any other state (buffering after a quality switch, cued,
          // paused, ended...) brings the cover back rather than flashing chrome.
          const cover = document.getElementById("heroVideoCover");
          if(!cover) return;
          clearTimeout(hideCoverTimer);
          if(e.data === YT.PlayerState.PLAYING){
            forceTopQuality(e.target);
            // Give YouTube's own title/logo overlay time to auto-fade
            // before we reveal the frame underneath.
            hideCoverTimer = setTimeout(()=> cover.classList.add("is-hidden"), 4000);
          } else {
            cover.classList.remove("is-hidden");
          }
        },
      }
    });
  };
}

/* -------- Catalog (Supabase) --------
   Products are managed by the client on the /admin.html page — nothing
   is hardcoded here anymore. This just reads what's in the database. */
const SUPABASE_URL = "https://jpxlqismhmgwhkrzqcvc.supabase.co";
const SUPABASE_KEY = "sb_publishable_oNU9YVWCPeJQrE4wJbeHvA_ihyg3m2h";

let PRODUCTS = [];

async function fetchProducts(){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if(!res.ok) throw new Error("Failed to load products");
  return res.json();
}

const CATEGORIES = [
  { key:"all",       label:"Whole Cellar" },
  { key:"whisky",    label:"Whisky" },
  { key:"vodka",     label:"Vodka" },
  { key:"tequila",   label:"Tequila" },
  { key:"cognac",    label:"Cognac" },
  { key:"champagne", label:"Champagne" },
  { key:"vins",      label:"Wines" },
  { key:"rhum",      label:"Rum" },
  { key:"gin",       label:"Gin" },
];

const CATEGORY_TINT = {
  whisky:"#a9752c", vodka:"#9aa7ae", tequila:"#8f7a2c", cognac:"#8a4a1f",
  champagne:"#cdb987", vins:"#7a1f2b", rhum:"#8a5a2c", gin:"#4c6b4c",
};

/* -------- Illustrated placeholder (bottle) --------
   Shown until the client uploads a real photo for a product. */
function bottleSVG(product){
  const tint = CATEGORY_TINT[product.category] || "#a9752c";
  const words = product.name.split(" ");
  let lines = [], current = "";
  words.forEach(w=>{
    if((current + " " + w).trim().length > 15){ lines.push(current.trim()); current = w; }
    else{ current = (current + " " + w).trim(); }
  });
  if(current) lines.push(current);
  lines = lines.slice(0,3);
  const startY = 235 - (lines.length-1)*9;
  const tspans = lines.map((l,i)=>`<tspan x="150" y="${startY + i*18}">${l.toUpperCase()}</tspan>`).join("");

  return `
  <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg-${product.id}" cx="50%" cy="15%" r="90%">
        <stop offset="0%" stop-color="${tint}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#0b0a09" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="glass-${product.id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e4c988" stop-opacity="0.08"/>
        <stop offset="50%" stop-color="#e4c988" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#e4c988" stop-opacity="0.06"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#bg-${product.id})"/>
    <rect x="136" y="18" width="28" height="16" rx="2" fill="#e4c988" opacity="0.55"/>
    <path d="M138,34 h24 v40 c0,12 20,20 20,38 v210 c0,16 -12,28 -28,28 h-8 c-16,0 -28,-12 -28,-28 V112 c0,-18 20,-26 20,-38 z"
          fill="url(#glass-${product.id})" stroke="#c8a862" stroke-width="1.2"/>
    <rect x="112" y="205" width="76" height="66" fill="#0b0a09" stroke="#c8a862" stroke-width="1" opacity="0.9"/>
    <line x1="122" y1="218" x2="178" y2="218" stroke="#c8a862" stroke-width="0.6" opacity="0.6"/>
    <text text-anchor="middle" font-family="Playfair Display, serif" font-size="9.5" letter-spacing="0.5" fill="#e4c988">${tspans}</text>
    <line x1="122" y1="258" x2="178" y2="258" stroke="#c8a862" stroke-width="0.6" opacity="0.6"/>
  </svg>`;
}

/* -------- Wishlist state -------- */
let wishlist = JSON.parse(localStorage.getItem("xxx_wishlist") || "[]");

function isWished(id){ return wishlist.includes(id); }

function saveWishlist(){
  localStorage.setItem("xxx_wishlist", JSON.stringify(wishlist));
  renderWishlist();
}

function toggleWishlist(id){
  wishlist = isWished(id) ? wishlist.filter(w=>w!==id) : [...wishlist, id];
  saveWishlist();
}

function renderWishlist(){
  const wrap = document.getElementById("wishlistItems");
  const countEl = document.getElementById("wishlistCount");
  if(!wrap || !countEl) return;

  countEl.textContent = wishlist.length;
  const items = wishlist.map(id => PRODUCTS.find(p=>p.id===id)).filter(Boolean);

  if(items.length === 0){
    wrap.innerHTML = `<p class="cart-empty">Your wishlist is empty for now.</p>`;
    return;
  }

  wrap.innerHTML = items.map(p => `
    <div class="cart-item">
      <div class="cart-item__thumb">${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">` : bottleSVG(p)}</div>
      <div class="cart-item__info">
        <p class="cart-item__name">${p.name}</p>
        <p class="cart-item__price">$${p.price}</p>
        <div class="cart-item__qty">
          <button class="cart-item__remove" data-action="wish-add-cart" data-id="${p.id}" style="color:var(--gold);">Add to cart</button>
          <button class="cart-item__remove" data-action="wish-remove" data-id="${p.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join("");
}

/* -------- Cart state -------- */
let cart = JSON.parse(localStorage.getItem("xxx_cart") || "[]");

function saveCart(){
  localStorage.setItem("xxx_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id){
  const p = PRODUCTS.find(p=>p.id===id);
  if(!p) return;
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty += 1;
  else cart.push({ id:p.id, name:p.name, price:p.price, qty:1 });
  saveCart();
}

function changeQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(i=>i.id!==id);
  saveCart();
}

function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart();
}

function cartTotal(){
  return cart.reduce((sum,i)=> sum + i.price*i.qty, 0);
}

function renderCart(){
  const wrap = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");

  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  countEl.textContent = totalQty;

  if(cart.length === 0){
    wrap.innerHTML = `<p class="cart-empty">Your cart is empty for now.</p>`;
  } else {
    wrap.innerHTML = cart.map(item=>{
      const product = PRODUCTS.find(p=>p.id===item.id);
      return `
      <div class="cart-item">
        <div class="cart-item__thumb">${product ? bottleSVG(product) : ""}</div>
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__price">$${item.price} × ${item.qty}</p>
          <div class="cart-item__qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="cart-item__remove" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  totalEl.textContent = `$${cartTotal()}`;
}

/* -------- Catalog rendering -------- */
function renderFilters(){
  const wrap = document.getElementById("filters");
  wrap.innerHTML = CATEGORIES.map(c=>
    `<button class="filter-btn ${c.key==='all' ? 'is-active' : ''}" data-cat="${c.key}">${c.label}</button>`
  ).join("");
}

let currentCategory = "all";
let currentSearch = "";
let currentSort = "default";

function isNewProduct(p){
  if(!p.created_at) return false;
  return (Date.now() - new Date(p.created_at).getTime()) / 86400000 <= 14;
}

function getVisibleProducts(){
  let list = currentCategory === "all" ? PRODUCTS : PRODUCTS.filter(p=>p.category===currentCategory);

  if(currentSearch){
    const q = currentSearch.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    );
  }

  list = [...list];
  if(currentSort === "price-asc") list.sort((a,b)=> a.price - b.price);
  if(currentSort === "price-desc") list.sort((a,b)=> b.price - a.price);
  if(currentSort === "name-asc") list.sort((a,b)=> a.name.localeCompare(b.name));
  return list;
}

function renderProducts(){
  const grid = document.getElementById("productGrid");
  const list = getVisibleProducts();

  if(list.length === 0){
    grid.innerHTML = `<p class="catalog-empty">${
      PRODUCTS.length === 0
        ? "New bottles are being added to this selection — check back soon."
        : "No bottles match your search."
    }</p>`;
    return;
  }

  grid.innerHTML = list.map(p=>{
    const outOfStock = p.in_stock === false;
    const badge = outOfStock
      ? `<span class="product-badge product-badge--out">Sold out</span>`
      : (isNewProduct(p) ? `<span class="product-badge">New</span>` : "");
    return `
    <article class="product-card">
      <div class="product-card__img">
        ${badge}
        <button class="wishlist-heart ${isWished(p.id) ? "is-active" : ""}" data-id="${p.id}" aria-label="Add to wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.8 2.3 4.3 5.7 4c2-.2 3.6.9 4.8 2.6.4.5.6.8 1.5 2.2.9-1.4 1.1-1.7 1.5-2.2C14.7 4.9 16.3 3.8 18.3 4c3.4.3 5.1 3.8 3.5 7.3-2.3 4.6-9.8 9.2-9.8 9.2Z"/></svg>
        </button>
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" data-id="${p.id}">` : bottleSVG(p)}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__note">${p.description || ""}</p>
        <div class="product-card__foot">
          <span class="product-card__price">$${p.price}</span>
          <button class="product-card__add ${outOfStock ? "is-disabled" : ""}" data-id="${p.id}">${outOfStock ? "Sold out" : "Add"}</button>
        </div>
      </div>
    </article>
  `;}).join("");

  grid.querySelectorAll(".product-card__img img").forEach(img=>{
    img.addEventListener("error", ()=>{
      const product = PRODUCTS.find(p=>p.id===img.dataset.id);
      if(product) img.outerHTML = bottleSVG(product);
    }, { once:true });
  });

  observeReveal(grid.querySelectorAll(".product-card"));
}

/* -------- Reveal on scroll -------- */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
},{ threshold:0.12 });

function observeReveal(nodes){
  nodes.forEach(n=> revealObserver.observe(n));
}

/* -------- WhatsApp ordering -------- */
function buildOrderMessage(name, phone, address, note){
  let msg = `Hello Whiskey & More, I'd like to place the following order:\n\n`;
  cart.forEach(item=>{
    msg += `• ${item.name} — x${item.qty} — $${item.price*item.qty}\n`;
  });
  msg += `\nTotal: $${cartTotal()}\n\n`;
  msg += `Name: ${name}\nPhone: ${phone}\nDelivery address: ${address}\n`;
  if(note) msg += `Note: ${note}\n`;
  return msg;
}

function sendOrderToWhatsapp(name, phone, address, note){
  const text = encodeURIComponent(buildOrderMessage(name, phone, address, note));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
}

/* =========================================================
   Init
   ========================================================= */
document.addEventListener("DOMContentLoaded", ()=>{

  mountHeroVideo();

  /* Age gate */
  const ageGate = document.getElementById("ageGate");
  if(sessionStorage.getItem("xxx_age_ok") === "1"){
    ageGate.hidden = true;
  }
  document.getElementById("ageConfirm").addEventListener("click", ()=>{
    sessionStorage.setItem("xxx_age_ok", "1");
    ageGate.hidden = true;
  });

  /* Header scroll state */
  const header = document.getElementById("siteHeader");
  const onScroll = ()=> header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll);

  /* Mobile menu + cart drawer elements */
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const overlay = document.getElementById("overlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const wishlistDrawer = document.getElementById("wishlistDrawer");
  const wishlistToggle = document.getElementById("wishlistToggle");
  const wishlistClose = document.getElementById("wishlistClose");

  /* Shared body scroll lock — prevents the classic mobile "fixed panel
     jumps/flickers while the page scrolls behind it" glitch, and restores
     the exact scroll position on close instead of snapping to top. */
  let lockedScrollY = 0;
  function lockBodyScroll(){
    if(document.body.classList.contains("no-scroll")) return;
    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.classList.add("no-scroll");
  }
  function unlockBodyScroll(){
    if(!document.body.classList.contains("no-scroll")) return;
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo(0, lockedScrollY);
  }
  function syncBodyLock(){
    const anyOpen = mainNav.classList.contains("is-open")
      || cartDrawer.classList.contains("is-open")
      || wishlistDrawer.classList.contains("is-open");
    if(anyOpen) lockBodyScroll(); else unlockBodyScroll();
  }

  function openMenu(){
    mainNav.classList.add("is-open");
    menuToggle.classList.add("is-open");
    overlay.classList.add("is-active");
    syncBodyLock();
  }
  function closeMenu(){
    mainNav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    overlay.classList.remove("is-active");
    syncBodyLock();
  }
  menuToggle.addEventListener("click", ()=>{
    mainNav.classList.contains("is-open") ? closeMenu() : openMenu();
  });
  mainNav.querySelectorAll("a").forEach(a=> a.addEventListener("click", closeMenu));

  function openCart(){ cartDrawer.classList.add("is-open"); overlay.classList.add("is-active"); syncBodyLock(); }
  function closeCart(){ cartDrawer.classList.remove("is-open"); overlay.classList.remove("is-active"); syncBodyLock(); }
  function openWishlist(){ wishlistDrawer.classList.add("is-open"); overlay.classList.add("is-active"); syncBodyLock(); }
  function closeWishlist(){ wishlistDrawer.classList.remove("is-open"); overlay.classList.remove("is-active"); syncBodyLock(); }

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  wishlistToggle.addEventListener("click", openWishlist);
  wishlistClose.addEventListener("click", closeWishlist);
  overlay.addEventListener("click", ()=>{ closeCart(); closeWishlist(); closeMenu(); });

  document.getElementById("wishlistItems").addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.dataset.action === "wish-add-cart"){ addToCart(id); closeWishlist(); openCart(); }
    if(btn.dataset.action === "wish-remove") toggleWishlist(id);
  });

  /* Keep things sane if the viewport crosses the mobile breakpoint
     (e.g. rotating a tablet, or resizing a browser window) while open. */
  window.addEventListener("resize", ()=>{
    if(window.innerWidth > 760) closeMenu();
  });

  /* Filters + grid */
  renderFilters();
  document.getElementById("productGrid").innerHTML = `<p class="catalog-empty">Loading the cellar…</p>`;
  fetchProducts()
    .then(data=>{ PRODUCTS = data; renderProducts(); renderCart(); renderWishlist(); })
    .catch(()=>{
      document.getElementById("productGrid").innerHTML =
        `<p class="catalog-empty">The cellar couldn't be loaded right now — please refresh the page.</p>`;
    });

  document.getElementById("filters").addEventListener("click", (e)=>{
    const btn = e.target.closest(".filter-btn");
    if(!btn) return;
    document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentCategory = btn.dataset.cat;
    renderProducts();
  });

  document.getElementById("searchInput").addEventListener("input", (e)=>{
    currentSearch = e.target.value.trim();
    renderProducts();
  });

  document.getElementById("sortSelect").addEventListener("change", (e)=>{
    currentSort = e.target.value;
    renderProducts();
  });

  /* Add to cart / wishlist toggle */
  document.getElementById("productGrid").addEventListener("click", (e)=>{
    const addBtn = e.target.closest(".product-card__add");
    if(addBtn){
      addToCart(addBtn.dataset.id);
      addBtn.textContent = "Added ✓";
      addBtn.classList.add("is-added");
      openCart();
      setTimeout(()=>{ addBtn.textContent = "Add"; addBtn.classList.remove("is-added"); }, 1400);
      return;
    }
    const heartBtn = e.target.closest(".wishlist-heart");
    if(heartBtn){
      toggleWishlist(heartBtn.dataset.id);
      heartBtn.classList.toggle("is-active", isWished(heartBtn.dataset.id));
    }
  });

  /* Cart actions (qty / remove) */
  document.getElementById("cartItems").addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.dataset.action === "inc") changeQty(id, 1);
    if(btn.dataset.action === "dec") changeQty(id, -1);
    if(btn.dataset.action === "remove") removeFromCart(id);
  });

  /* Checkout */
  document.getElementById("orderForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    if(cart.length === 0){
      alert("Your cart is empty. Add at least one item before ordering.");
      return;
    }
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const note = document.getElementById("custNote").value.trim();
    sendOrderToWhatsapp(name, phone, address, note);
  });

  /* Contact section + floating WhatsApp links */
  const whatsappGenericLink =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Whiskey & More, I'd like more information about your selection.")}`;
  document.getElementById("whatsappContact").href = whatsappGenericLink;
  document.getElementById("whatsappFloat").href = whatsappGenericLink;

  /* Newsletter */
  document.getElementById("newsletterForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const emailInput = document.getElementById("newsletterEmail");
    const statusEl = document.getElementById("newsletterStatus");
    const email = emailInput.value.trim();
    statusEl.textContent = "Subscribing…";
    try{
      const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json", Prefer: "return=minimal",
        },
        body: JSON.stringify({ email }),
      });
      if(!res.ok) throw new Error("subscribe failed");
      statusEl.textContent = "✓ Thank you, you're subscribed!";
      emailInput.value = "";
    } catch(err){
      statusEl.textContent = "Something went wrong — please try again later.";
    }
  });

  /* Reveal sections */
  observeReveal(document.querySelectorAll(".intro, .maison__visual, .maison__content, .promise__item"));
  document.querySelectorAll(".intro, .maison__visual, .maison__content, .promise__item")
    .forEach(el=> el.classList.add("reveal"));

  renderCart();
});
