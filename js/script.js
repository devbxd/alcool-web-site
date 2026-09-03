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

/* -------- Catalog --------
   Indicative prices in line with typical market rates (USD).
   Adjust freely to match your real pricing. */
const PRODUCTS = [
  // Whisky
  { id:"w1",  cat:"whisky",   name:"Macallan 12 Double Cask",        origin:"Scotland",  price:75,   note:"Single malt with notes of vanilla and dried fruit." },
  { id:"w2",  cat:"whisky",   name:"Macallan 18 Sherry Oak",         origin:"Scotland",  price:450,  note:"Matured in Spanish sherry seasoned oak casks." },
  { id:"w3",  cat:"whisky",   name:"Macallan Rare Cask",             origin:"Scotland",  price:650,  note:"Rare edition, intense woody profile." },
  { id:"w4",  cat:"whisky",   name:"Johnnie Walker Blue Label",      origin:"Scotland",  price:220,  note:"A rare blend of exceptional whiskies." },
  { id:"w5",  cat:"whisky",   name:"Johnnie Walker Black Label",     origin:"Scotland",  price:45,   note:"Aged 12 years, smoky and smooth." },
  { id:"w6",  cat:"whisky",   name:"Chivas Regal 18 Years",          origin:"Scotland",  price:85,   note:"Rich, silky blend." },
  { id:"w7",  cat:"whisky",   name:"Glenfiddich 21 Gran Reserva",    origin:"Scotland",  price:260,  note:"Finished in Caribbean rum casks." },
  { id:"w8",  cat:"whisky",   name:"The Glenlivet 18",               origin:"Scotland",  price:130,  note:"Fruity, spiced, long finish." },
  { id:"w9",  cat:"whisky",   name:"Hibiki Harmony",                 origin:"Japan",     price:150,  note:"Japanese blend, floral balance." },
  { id:"w10", cat:"whisky",   name:"Yamazaki 12",                    origin:"Japan",     price:180,  note:"Iconic Japanese single malt." },
  { id:"w11", cat:"whisky",   name:"Lagavulin 16",                   origin:"Scotland",  price:95,   note:"Peated, intense, pure Islay." },
  { id:"w12", cat:"whisky",   name:"The Dalmore 15",                 origin:"Scotland",  price:140,  note:"Notes of leather and candied orange." },
  { id:"w13", cat:"whisky",   name:"Royal Salute 21",                origin:"Scotland",  price:220,  note:"A royal blend, aged 21 years." },
  { id:"w14", cat:"whisky",   name:"Balvenie 14 Caribbean Cask",     origin:"Scotland",  price:90,   note:"Rum-cask sweetness, round finish." },
  { id:"w15", cat:"whisky",   name:"Jack Daniel's Single Barrel",    origin:"USA",       price:55,   note:"Tennessee whiskey, single barrel." },

  // Vodka
  { id:"v1",  cat:"vodka",    name:"Grey Goose",                     origin:"France",       price:45,  note:"French wheat, pure distillation." },
  { id:"v2",  cat:"vodka",    name:"Belvedere",                      origin:"Poland",       price:48,  note:"Polish rye, silky texture." },
  { id:"v3",  cat:"vodka",    name:"Beluga Noble",                   origin:"Russia",       price:55,  note:"Milk thistle filtered, exceptionally pure." },
  { id:"v4",  cat:"vodka",    name:"Crystal Head",                   origin:"Canada",       price:60,  note:"Iconic skull bottle, quadruple distilled." },
  { id:"v5",  cat:"vodka",    name:"Cîroc",                          origin:"France",       price:42,  note:"Distilled from fine grapes." },
  { id:"v6",  cat:"vodka",    name:"Absolut Elyx",                   origin:"Sweden",       price:50,  note:"Crafted in vintage copper stills." },
  { id:"v7",  cat:"vodka",    name:"Ketel One",                      origin:"Netherlands",  price:38,  note:"Traditional method, remarkably smooth." },
  { id:"v8",  cat:"vodka",    name:"Chopin Potato",                  origin:"Poland",       price:45,  note:"100% potato, creamy texture." },
  { id:"v9",  cat:"vodka",    name:"Stolichnaya Elit",               origin:"Russia",       price:65,  note:"Extreme cold filtration." },
  { id:"v10", cat:"vodka",    name:"Russian Standard Platinum",      origin:"Russia",       price:40,  note:"Triple distilled, clean finish." },

  // Tequila
  { id:"t1",  cat:"tequila",  name:"Don Julio 1942",                 origin:"Mexico", price:180, note:"Exceptional añejo, prestige box." },
  { id:"t2",  cat:"tequila",  name:"Don Julio Blanco",               origin:"Mexico", price:55,  note:"Pure agave, intense freshness." },
  { id:"t3",  cat:"tequila",  name:"Patrón Silver",                  origin:"Mexico", price:50,  note:"Smooth agave, no additives." },
  { id:"t4",  cat:"tequila",  name:"Patrón Añejo",                   origin:"Mexico", price:75,  note:"Aged in oak barrels." },
  { id:"t5",  cat:"tequila",  name:"Casamigos Blanco",               origin:"Mexico", price:48,  note:"Soft, round profile." },
  { id:"t6",  cat:"tequila",  name:"Clase Azul Reposado",            origin:"Mexico", price:220, note:"Hand-painted artisanal decanter." },
  { id:"t7",  cat:"tequila",  name:"1800 Añejo",                     origin:"Mexico", price:60,  note:"Vanilla and oak notes." },

  // Cognac
  { id:"c1",  cat:"cognac",   name:"Hennessy XO",                    origin:"France", price:220,  note:"Rare blend, candied fruit notes." },
  { id:"c2",  cat:"cognac",   name:"Hennessy VS",                    origin:"France", price:50,   note:"Bold and intense." },
  { id:"c3",  cat:"cognac",   name:"Rémy Martin XO",                 origin:"France", price:210,  note:"Grande Champagne, floral notes." },
  { id:"c4",  cat:"cognac",   name:"Louis XIII",                     origin:"France", price:3800, note:"A blend of eaux-de-vie up to 100 years old — a true masterpiece." },
  { id:"c5",  cat:"cognac",   name:"Courvoisier VSOP",               origin:"France", price:55,   note:"Balance of fruit and oak." },
  { id:"c6",  cat:"cognac",   name:"Martell Cordon Bleu",            origin:"France", price:150,  note:"Classic elegance since 1912." },

  // Champagne
  { id:"ch1", cat:"champagne", name:"Dom Pérignon 2013",             origin:"France", price:220, note:"Prestige vintage, absolute finesse." },
  { id:"ch2", cat:"champagne", name:"Moët & Chandon Impérial",       origin:"France", price:60,  note:"Iconic brut, fruity and vibrant." },
  { id:"ch3", cat:"champagne", name:"Veuve Clicquot Brut",           origin:"France", price:65,  note:"Pinot noir led, ample structure." },
  { id:"ch4", cat:"champagne", name:"Cristal Louis Roederer",        origin:"France", price:320, note:"Legendary cuvée in a gold-hued bottle." },
  { id:"ch5", cat:"champagne", name:"Ruinart Blanc de Blancs",       origin:"France", price:95,  note:"Pure chardonnay, great finesse." },

  // Wines
  { id:"vin1", cat:"vins", name:"Château Musar 2015",                origin:"Lebanon", price:55,  note:"A Lebanese icon, cellar-worthy red." },
  { id:"vin2", cat:"vins", name:"Château Ksara Réserve du Couvent",  origin:"Lebanon", price:35,  note:"A blend from Lebanon's oldest winery." },
  { id:"vin3", cat:"vins", name:"Château Margaux 2015",              origin:"France",  price:650, note:"First growth grand cru, Bordeaux." },
  { id:"vin4", cat:"vins", name:"Opus One 2018",                     origin:"USA",     price:420, note:"Napa Valley, prestige blend." },
  { id:"vin5", cat:"vins", name:"Château Lafite Rothschild",         origin:"France",  price:850, note:"One of the five first growths." },
  { id:"vin6", cat:"vins", name:"Sassicaia 2019",                    origin:"Italy",   price:250, note:"Super Tuscan, power and elegance." },

  // Rum
  { id:"r1",  cat:"rhum",     name:"Diplomático Reserva Exclusiva",  origin:"Venezuela", price:50, note:"Round, notes of cocoa and raisin." },
  { id:"r2",  cat:"rhum",     name:"Zacapa 23",                      origin:"Guatemala", price:70, note:"Aged at altitude, exceptionally smooth." },
  { id:"r3",  cat:"rhum",     name:"Plantation XO 20th Anniversary", origin:"Barbados",  price:65, note:"Spiced, oaky finish." },

  // Gin
  { id:"g1",  cat:"gin",      name:"Hendrick's",                     origin:"Scotland", price:42,  note:"Cucumber and rose, highly aromatic." },
  { id:"g2",  cat:"gin",      name:"The Botanist",                   origin:"Scotland", price:48,  note:"22 wild Islay botanicals." },
  { id:"g3",  cat:"gin",      name:"Monkey 47",                      origin:"Germany",  price:55,  note:"47 botanicals, rare intensity." },
];

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
   Until real product photography is ready: drop images into
   assets/products/<id>.jpg — they will automatically replace this visual. */
function bottleSVG(product){
  const tint = CATEGORY_TINT[product.cat] || "#a9752c";
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

function renderProducts(filter="all"){
  const grid = document.getElementById("productGrid");
  const list = filter==="all" ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);

  grid.innerHTML = list.map(p=>`
    <article class="product-card">
      <div class="product-card__img">
        <img src="assets/products/${p.id}.jpg" alt="${p.name}" data-id="${p.id}">
      </div>
      <div class="product-card__body">
        <p class="product-card__origin">${p.origin}</p>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__note">${p.note}</p>
        <div class="product-card__foot">
          <span class="product-card__price">$${p.price}</span>
          <button class="product-card__add" data-id="${p.id}">Add</button>
        </div>
      </div>
    </article>
  `).join("");

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
    const anyOpen = mainNav.classList.contains("is-open") || cartDrawer.classList.contains("is-open");
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

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  overlay.addEventListener("click", ()=>{ closeCart(); closeMenu(); });

  /* Keep things sane if the viewport crosses the mobile breakpoint
     (e.g. rotating a tablet, or resizing a browser window) while open. */
  window.addEventListener("resize", ()=>{
    if(window.innerWidth > 760) closeMenu();
  });

  /* Filters + grid */
  renderFilters();
  renderProducts("all");

  document.getElementById("filters").addEventListener("click", (e)=>{
    const btn = e.target.closest(".filter-btn");
    if(!btn) return;
    document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderProducts(btn.dataset.cat);
  });

  /* Add to cart */
  document.getElementById("productGrid").addEventListener("click", (e)=>{
    const btn = e.target.closest(".product-card__add");
    if(!btn) return;
    addToCart(btn.dataset.id);
    btn.textContent = "Added ✓";
    btn.classList.add("is-added");
    openCart();
    setTimeout(()=>{ btn.textContent = "Add"; btn.classList.remove("is-added"); }, 1400);
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

  /* Contact section WhatsApp link */
  document.getElementById("whatsappContact").href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Whiskey & More, I'd like more information about your selection.")}`;

  /* Reveal sections */
  observeReveal(document.querySelectorAll(".intro, .maison__visual, .maison__content, .promise__item"));
  document.querySelectorAll(".intro, .maison__visual, .maison__content, .promise__item")
    .forEach(el=> el.classList.add("reveal"));

  renderCart();
});
