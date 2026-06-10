/* VelvetPet - suscripción a seguros con PayPhone / Deuna */
let currentPlan = null;
let selectedProvider = null;
const modal = document.getElementById('payModal');
const providerCards = document.querySelectorAll('.pay-provider-card');
const payTotal = document.getElementById('payTotal');
const qrBox = document.getElementById('deuna-qr');
const payContactFields = document.getElementById('pay-contact-fields');
const payPhone = document.getElementById('pay-phone');
const payEmail = document.getElementById('pay-email');
const payTerms = document.getElementById('pay-terms');
const paySubmit = document.getElementById('pay-submit');

function selectProvider(provider) {
  selectedProvider = provider;
  providerCards.forEach(card => card.classList.toggle('selected', card.dataset.provider === provider));
  updatePaymentDetail();
}

function updatePaymentDetail() {
  const provider = selectedProvider;
  if (!provider) {
    payTotal.textContent = '';
    document.getElementById('payNote').textContent = 'Elige PayPhone o Deuna para continuar.';
    document.getElementById('payCommissionNote').textContent = 'Selecciona un método de pago para ver instrucciones.';
    payContactFields.style.display = 'none';
    paySubmit.style.display = 'none';
    qrBox.style.display = 'none';
    document.getElementById('payDetail').textContent = 'Selecciona el método de pago que prefieras.';
    return;
  }
  const isDeuna = provider === 'Deuna - Banco Pichincha';
  const note = provider === 'PayPhone'
    ? 'Serás redirigido a PayPhone para completar la transacción de forma segura. PayPhone cobra comisión aparte.'
    : 'Serás redirigido a Deuna / Banco Pichincha para completar la transacción de forma segura.';
  document.getElementById('payNote').textContent = note;
  document.getElementById('payCommissionNote').textContent = provider === 'PayPhone'
    ? 'Nota: PayPhone cobra una comisión aparte sobre la transacción.'
    : 'Nota: Deuna / Banco Pichincha puede cobrar una comisión aparte sobre la transacción.';
  payContactFields.style.display = isDeuna ? 'none' : 'block';
  paySubmit.style.display = isDeuna ? 'none' : 'inline-block';
  payPhone.required = !isDeuna;
  payEmail.required = !isDeuna;
  payTerms.required = !isDeuna;
  if (isDeuna) {
    payPhone.value = '';
    payEmail.value = '';
    payTerms.checked = false;
  }
  if (currentPlan) {
    const tax = currentPlan.price * 0.12;
    const total = currentPlan.price + tax;
    payTotal.textContent = `Total aproximado con IVA (12%): $${total.toFixed(2)}`;
    qrBox.style.display = isDeuna ? 'block' : 'none';
    document.getElementById('payDetail').textContent =
      `Plan ${currentPlan.name} · $${currentPlan.price.toFixed(2)} + IVA mensuales. Método: ${provider}.`;
  } else {
    payTotal.textContent = '';
    qrBox.style.display = 'none';
  }
}

document.querySelectorAll('[data-plan]').forEach(btn => {
  btn.addEventListener('click', () => {
    const user = VP.requireAuth('seguro');
    if (!user) return;
    currentPlan = { name: btn.dataset.plan, price: parseFloat(btn.dataset.price) };
    selectedProvider = null;
    providerCards.forEach(card => card.classList.remove('selected'));
    updatePaymentDetail();
    document.getElementById('pay-email').value = user.email;
    modal.classList.add('open');
  });
});

document.getElementById('closePay').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

providerCards.forEach(card => card.addEventListener('click', () => selectProvider(card.dataset.provider)));

document.getElementById('payForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = VP.currentUser();
  if (!user || !currentPlan || selectedProvider !== 'PayPhone') return;
  const provider = selectedProvider;
  const phone = document.getElementById('pay-phone').value;
  const list = VP.get(VP.STORAGE.INSURANCE, []);
  list.push({
    id: VP.uid(),
    email: user.email,
    plan: currentPlan.name,
    monto: currentPlan.price,
    telefono: phone,
    proveedor: provider,
    estado: 'Activo',
    fecha: new Date().toISOString()
  });
  VP.set(VP.STORAGE.INSURANCE, list);
  modal.classList.remove('open');
  alert(`Pago procesado con ${provider}.\nPlan ${currentPlan.name} activo. Bienvenido a VelvetPet.`);
});
