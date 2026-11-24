const PRODUCTS = [
  {id:1,name:'Halo noise-cancelling headphones',cat:'Tech',price:249,icon:'🎧',a:'#6f6bff',b:'#241c6b',tag:'New',desc:'Adaptive noise cancelling, 40-hour battery and a fold-flat aluminium frame.'},
  {id:2,name:'Pulse smartwatch',cat:'Tech',price:199,icon:'⌚',a:'#2fa3c7',b:'#0f3b52',tag:'Bestseller',desc:'Sleep, heart and training tracking in a scratch-resistant sapphire case.'},
  {id:3,name:'Orbit portable speaker',cat:'Tech',price:129,icon:'🔊',a:'#e0527a',b:'#4a1230',tag:'',desc:'360° sound, IP67 waterproofing and 20 hours of playtime.'},
  {id:4,name:'Drift technical jacket',cat:'Apparel',price:189,icon:'🧥',a:'#5a7d6a',b:'#16261e',tag:'New',desc:'Three-layer shell with taped seams, packable into its own pocket.'},
  {id:5,name:'Stride running shoes',cat:'Apparel',price:149,icon:'👟',a:'#e08a3c',b:'#4a2208',tag:'Bestseller',desc:'Responsive foam, breathable knit upper and a 6 mm drop.'},
  {id:6,name:'Signal heavyweight tee',cat:'Apparel',price:49,icon:'👕',a:'#8a8fa8',b:'#272a3a',tag:'',desc:'Organic cotton at 280 gsm, pre-washed so it stays the size you bought.'},
  {id:7,name:'Lens polarised sunglasses',cat:'Accessories',price:99,icon:'🕶️',a:'#c9a24b',b:'#3b2d0c',tag:'',desc:'Lightweight acetate frames with UV400 polarised lenses.'},
  {id:8,name:'Carry-all daypack',cat:'Accessories',price:119,icon:'🎒',a:'#4f6bd6',b:'#151d4a',tag:'New',desc:'22 L water-resistant pack with a padded 16-inch laptop sleeve.'},
  {id:9,name:'Cap fitted cap',cat:'Accessories',price:39,icon:'🧢',a:'#b94a4a',b:'#3a1111',tag:'',desc:'Six-panel cap in washed twill with an adjustable back strap.'}
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const save = () => { try { localStorage.setItem('ks-cart', JSON.stringify(cart)); } catch (e) {} };
let cart = {};
try { cart = JSON.parse(localStorage.getItem('ks-cart') || '{}'); } catch (e) {}
const state = {cat: 'All', q: ''};

/* ---------- product grid ---------- */
const grid = $('#grid');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold: .12});

function renderGrid() {
  const q = state.q.trim().toLowerCase();
  const list = PRODUCTS.filter(p => (state.cat === 'All' || p.cat === state.cat) && (p.name + ' ' + p.cat).toLowerCase().includes(q));
  grid.innerHTML = list.map((p, i) => `
    <article class="card" data-id="${p.id}" style="transition-delay:${reduce ? 0 : i * 60}ms">
      <div class="tilt">
        <div class="art" style="--a:${p.a};--b:${p.b}">
          ${p.tag ? `<span class="badge">${p.tag}</span>` : ''}<span class="icon">${p.icon}</span>
        </div>
        <div class="info">
          <small>${p.cat}</small><h3>${p.name}</h3>
          <div class="row"><b>${money(p.price)}</b>
            <div><button class="btn ghost" data-act="view">Quick view</button><button class="btn" data-act="add">Add</button></div>
          </div>
        </div>
      </div>
    </article>`).join('');
  $('#empty').hidden = list.length > 0;
  $$('.card', grid).forEach(c => { io.observe(c); bindTilt(c); });
}

function bindTilt(card) {
  const t = $('.tilt', card);
  if (reduce || matchMedia('(hover: none)').matches) return;
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    t.classList.add('live');
    t.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
    t.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
  });
  card.addEventListener('pointerleave', () => {
    t.classList.remove('live');
    t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg');
  });
}

grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const id = btn.closest('.card').dataset.id;
  if (btn.dataset.act === 'view') openQuickView(id);
  else addToCart(id, btn);
});

$('#tabs').addEventListener('click', e => {
  const t = e.target.closest('.tab'); if (!t) return;
  $$('.tab').forEach(b => b.classList.toggle('active', b === t));
  state.cat = t.dataset.cat; renderGrid();
});
$('#search').addEventListener('input', e => { state.q = e.target.value; renderGrid(); });

/* ---------- cart ---------- */
const drawer = $('#drawer'), scrim = $('#scrim');

function addToCart(id, btn) {
  cart[id] = (cart[id] || 0) + 1; save(); renderCart();
  const badge = $('#badge'); badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
  if (btn) {
    const old = btn.textContent; btn.textContent = 'Added ✓';
    setTimeout(() => btn.textContent = old, 1000);
    if (!reduce) fly(btn);
  }
}

function fly(from) {
  const a = from.getBoundingClientRect(), b = $('#cartBtn').getBoundingClientRect();
  const d = document.createElement('div'); d.className = 'fly'; document.body.appendChild(d);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  d.style.left = a.left + a.width / 2 + 'px'; d.style.top = a.top + a.height / 2 + 'px';
  d.animate([{transform: 'translate(0,0) scale(1)'}, {transform: `translate(${dx * .5}px,${dy * .5 - 60}px) scale(1.4)`, offset: .5}, {transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: .4}],
    {duration: 700, easing: 'cubic-bezier(.5,0,.3,1)'}).onfinish = () => d.remove();
}

function renderCart() {
  const ids = Object.keys(cart).filter(id => cart[id] > 0 && byId(id));
  let count = 0, total = 0;
  $('#items').innerHTML = ids.length ? ids.map(id => {
    const p = byId(id), q = cart[id]; count += q; total += q * p.price;
    return `<li class="item" data-id="${id}">
      <div class="thumb" style="--a:${p.a};--b:${p.b}">${p.icon}</div>
      <div><h4>${p.name}</h4><div class="qty"><button data-d="-1" aria-label="Decrease quantity">−</button><span>${q}</span><button data-d="1" aria-label="Increase quantity">+</button></div></div>
      <div style="text-align:right"><b>${money(p.price * q)}</b><br><button class="rm" data-rm>Remove</button></div></li>`;
  }).join('') : '<li class="cart-empty">Your cart is empty. Add something from the collection.</li>';
  $('#badge').textContent = count;
  $('#subtotal').textContent = money(total);
  $('#checkout').disabled = !ids.length;
}

$('#items').addEventListener('click', e => {
  const li = e.target.closest('.item'); if (!li) return;
  const id = li.dataset.id;
  if (e.target.dataset.d) cart[id] = Math.max(0, cart[id] + Number(e.target.dataset.d));
  if (e.target.hasAttribute('data-rm')) cart[id] = 0;
  if (!cart[id]) delete cart[id];
  save(); renderCart();
});

function setDrawer(open) {
  drawer.classList.toggle('open', open); scrim.classList.toggle('on', open);
  drawer.setAttribute('aria-hidden', !open);
  if (open) $('#closeCart').focus(); else $('#cartBtn').focus();
}
$('#cartBtn').onclick = () => setDrawer(true);
$('#closeCart').onclick = scrim.onclick = () => setDrawer(false);

/* ---------- modal ---------- */
const modal = $('#modal');
function setModal(html) {
  if (html) $('#modalBody').innerHTML = html;
  const open = !!html; modal.classList.toggle('on', open); modal.setAttribute('aria-hidden', !open);
  if (open) $('#closeModal').focus();
}
function openQuickView(id) {
  const p = byId(id);
  setModal(`<div class="qv">
    <div class="art" style="--a:${p.a};--b:${p.b}"><span class="icon" style="transform:none">${p.icon}</span></div>
    <div><small class="dim">${p.cat}</small><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="row"><b>${money(p.price)}</b><button class="btn" id="qvAdd">Add to cart</button></div></div></div>`);
  $('#qvAdd').onclick = e => { addToCart(id, e.target); };
}
$('#closeModal').onclick = () => setModal(null);
modal.addEventListener('click', e => { if (e.target === modal) setModal(null); });
addEventListener('keydown', e => { if (e.key === 'Escape') { setModal(null); setDrawer(false); } });

$('#checkout').onclick = () => {
  const total = $('#subtotal').textContent, order = 'KS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  cart = {}; save(); renderCart(); setDrawer(false);
  setModal(`<div class="done"><div class="tick">✅</div><h3>Order confirmed</h3>
    <p class="dim">Order ${order} for ${total} is on its way. This is a demo, so no payment was taken.</p></div>`);
};

$('#news').addEventListener('submit', e => {
  e.preventDefault();
  $('#newsMsg').textContent = 'Subscribed. Check ' + $('#email').value + ' for a confirmation.';
  e.target.reset();
});

/* ---------- 3D hero (Three.js) ---------- */
(function hero() {
  const cvs = $('#stage');
  if (!window.THREE) { cvs.parentElement.style.display = 'none'; return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas: cvs, antialias: true, alpha: true}); }
  catch (e) { cvs.parentElement.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, 1, .1, 50); cam.position.z = 7;
  const group = new THREE.Group(); scene.add(group);
  group.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, .44, 180, 28),
    new THREE.MeshStandardMaterial({color: 0x20212c, metalness: .95, roughness: .22})));
  group.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, .455, 90, 14),
    new THREE.MeshBasicMaterial({color: 0xcfe3ff, wireframe: true, transparent: true, opacity: .12})));
  scene.add(new THREE.AmbientLight(0xffffff, .4));
  const l1 = new THREE.PointLight(0x6f6bff, 2.2, 0, 2); l1.position.set(4, 3, 5); scene.add(l1);
  const l2 = new THREE.PointLight(0xcfe3ff, 1.6, 0, 2); l2.position.set(-5, -2, 3); scene.add(l2);

  let tx = 0, ty = 0, spinX = 0, spinY = 0, drag = false, lx = 0, ly = 0, enter = reduce ? 1 : 0, visible = true;
  const stage = cvs.parentElement;
  stage.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointerup', () => drag = false);
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5) * .6; ty = ((e.clientY - r.top) / r.height - .5) * .5;
    if (drag) { spinY += (e.clientX - lx) * .01; spinX += (e.clientY - ly) * .01; lx = e.clientX; ly = e.clientY; }
  });
  stage.addEventListener('pointerleave', () => { tx = ty = 0; });

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    if (reduce) draw(0);
  }
  function draw(t) {
    const e = 1 - Math.pow(1 - enter, 3);
    group.scale.setScalar(.15 + .85 * e);
    group.position.y = reduce ? 0 : Math.sin(t * 1.2) * .15;
    group.rotation.x += (ty + spinX - group.rotation.x) * .08;
    group.rotation.y += (tx + spinY - group.rotation.y) * .08;
    renderer.render(scene, cam);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    enter = Math.min(1, enter + .018);
    if (!drag) spinY += .004;
    draw(now / 1000);
  }
  new ResizeObserver(size).observe(stage);
  new IntersectionObserver(es => visible = es[0].isIntersecting).observe(stage);
  size();
  if (!reduce) requestAnimationFrame(loop);
})();

renderGrid();
renderCart();
