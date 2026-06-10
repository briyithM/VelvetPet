/* VelvetPet - tienda con reserva */
const PRODUCTS = [
  { id:'p1', nombre:'Alimento Premium Perro Adulto 15 kg', precio:54.90, cat:'Perro', img:'https://supermaxi-225de.kxcdn.com/wp-content/uploads/2025/08/7861032239102-1-19.jpg' },
  { id:'p2', nombre:'Alimento Gato Adulto 7 kg', precio:38.50, cat:'Gato', img:'https://takoo.ec/87-large_default/pro-plan-gato-adulto-con-carne-real-de-pollo-3-kg.jpg' },
  { id:'p3', nombre:'Mezcla para hámster 1 kg', precio:6.20, cat:'Hámster', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb8LPi2UpeDwCTqGk40o6PPmIIdzXQaSYsgw&s' },
  { id:'p4', nombre:'Arena sanitaria 10 kg', precio:11.00, cat:'Gato', img:'https://takoo.ec/302-large_default/arena-nutrapro-18-kg.jpg' },
  { id:'p5', nombre:'Shampoo dermatológico 500 ml', precio:14.80, cat:'Cuidado', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtHoKL3IpWXxI0nlv_SbkNqbm--epDJQDvtA&s' },
  { id:'p6', nombre:'Antiparasitario externo', precio:22.40, cat:'Salud', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmqDNPq-EwoUlCPFDvj_Mbp7iSl9yjUUc0Lw&s' }
];

function renderProducts(){
  const grid = document.getElementById('shop-grid');
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product">
      <div class="thumb"><img src="${p.img}" alt="${p.nombre}"></div>
      <h4>${p.nombre}</h4>
      <p style="font-size:.85rem;color:var(--color-muted);margin:0">${p.cat}</p>
      <div class="price">$ ${p.precio.toFixed(2)}</div>
      <button class="btn btn-secondary" data-reserve="${p.id}">Reservar</button>
    </article>
  `).join('');

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-reserve]');
    if (!btn) return;
    const id = btn.dataset.reserve;
    const user = VP.requireAuth('reservar');
    if (!user) return;
    const product = PRODUCTS.find(p => p.id === id);
    const reserves = VP.get(VP.STORAGE.RESERVES, []);
    reserves.push({
      id: VP.uid(), email: user.email, producto: product.nombre,
      precio: product.precio, fecha: new Date().toISOString(), estado:'Reservado'
    });
    VP.set(VP.STORAGE.RESERVES, reserves);
    alert(`Reservado: ${product.nombre}.\nPasa a retirarlo en clínica. El pago se realiza al retirar.`);
  });
}

renderProducts();
