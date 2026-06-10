/* VelvetPet - cuenta cliente: registro, login, dashboard, LOPDP */
function showDashboard(user){
  document.getElementById('auth-view').style.display = 'none';
  document.getElementById('dash-view').style.display = 'block';
  document.getElementById('dash-name').textContent = `${user.nombre} ${user.apellido}`;
  document.getElementById('dash-email').textContent = user.email;

  const fmt = d => VP.formatDate(d);
  const empty = '<p style="color:var(--color-muted);font-size:.9rem">Sin registros aún.</p>';

  const appts = VP.get(VP.STORAGE.APPTS, []).filter(a => a.email === user.email);
  document.getElementById('appt-list').innerHTML = appts.length ? `
    <table class="table"><thead><tr><th>Fecha</th><th>Hora</th><th>Veterinario</th><th>Mascota</th><th>Raza</th><th>Sexo</th></tr></thead><tbody>
    ${appts.map(a => `<tr><td>${fmt(a.date)}</td><td>${a.time}</td><td>${a.vet}</td><td>${a.pet}</td><td>${a.breed || ''}</td><td>${a.sex || ''}</td></tr>`).join('')}
    </tbody></table>` : empty;

  const res = VP.get(VP.STORAGE.RESERVES, []).filter(r => r.email === user.email);
  document.getElementById('res-list').innerHTML = res.length ? `
    <table class="table"><thead><tr><th>Producto</th><th>Precio</th><th>Estado</th></tr></thead><tbody>
    ${res.map(r => `<tr><td>${r.producto}</td><td>$${r.precio.toFixed(2)}</td><td>${r.estado}</td></tr>`).join('')}
    </tbody></table>` : empty;

  const ins = VP.get(VP.STORAGE.INSURANCE, []).filter(i => i.email === user.email);
  document.getElementById('ins-list').innerHTML = ins.length ? `
    <table class="table"><thead><tr><th>Plan</th><th>Monto</th><th>Proveedor</th><th>Estado</th></tr></thead><tbody>
    ${ins.map(i => `<tr><td>${i.plan}</td><td>$${i.monto.toFixed(2)}/mes</td><td>${i.proveedor}</td><td>${i.estado}</td></tr>`).join('')}
    </tbody></table>` : empty;

  const historyRecords = buildHistoryRecords(user);
  initHistoryControls(historyRecords);
}

function buildHistoryRecords(user){
  const appts = VP.get(VP.STORAGE.APPTS, []).filter(a => a.email === user.email);
  const history = VP.get(VP.STORAGE.HISTORY, []).filter(h => h.email === user.email);
  const records = [
    ...appts.map(a => ({
      id: a.id || VP.uid(),
      date: a.date,
      pet: a.pet,
      category: classifyHistoryType(a),
      title: a.reason || 'Consulta general',
      description: `Atención con ${a.vet}`,
      source: 'Cita agendada'
    })),
    ...history.map(h => ({
      id: h.id || VP.uid(),
      date: h.date || h.createdAt || new Date().toISOString(),
      pet: h.pet,
      category: h.type || 'solicitudes',
      title: h.title || h.description || 'Registro clínico',
      description: h.notes || h.description || h.source || 'Registro guardado',
      source: h.source || 'Registro guardado'
    }))
  ];
  return records.sort((a,b) => new Date(b.date) - new Date(a.date));
}

function classifyHistoryType(record){
  const reason = (record.reason || record.title || '').toString().toLowerCase();
  if (reason.includes('vacun')) return 'vacunas';
  if (reason.includes('diagnos') || reason.includes('diagnóstico') || reason.includes('consulta')) return 'diagnosticos';
  if (reason.includes('solicitud') || reason.includes('pedido') || reason.includes('receta') || reason.includes('orden')) return 'solicitudes';
  return 'diagnosticos';
}

function initHistoryControls(records){
  const petSelect = document.getElementById('history-pet');
  const filterSelect = document.getElementById('history-filter');
  const pets = [...new Set(records.map(r => r.pet).filter(Boolean))];
  petSelect.innerHTML = `<option value="all">Todas</option>${pets.map(p => `<option value="${p}">${p}</option>`).join('')}`;
  const update = () => renderHistoryList(records, petSelect.value, filterSelect.value);
  petSelect.addEventListener('change', update);
  filterSelect.addEventListener('change', update);
  update();
}

function renderHistoryList(records, petFilter, typeFilter){
  const container = document.getElementById('hist-list');
  const filtered = records.filter(r => (petFilter === 'all' || r.pet === petFilter) && (typeFilter === 'all' || r.category === typeFilter));
  if (!filtered.length){
    container.innerHTML = '<p style="color:var(--color-muted);font-size:.9rem">No hay registros que coincidan con los filtros seleccionados.</p>';
    return;
  }
  container.innerHTML = `
    <table class="table"><thead><tr><th>Fecha</th><th>Mascota</th><th>Tipo</th><th>Detalle</th></tr></thead><tbody>
    ${filtered.map(r => `<tr><td>${VP.formatDate(r.date)}</td><td>${r.pet}</td><td>${capitalize(r.category)}</td><td>${r.title}${r.description ? ` · ${r.description}` : ''}</td></tr>`).join('')}
    </tbody></table>`;
}

function capitalize(text){
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function init(){
  const user = VP.currentUser();
  if (user){ showDashboard(user); }

  // Si vienen desde una acción que requiere registro
  const params = new URLSearchParams(location.search);
  if (params.get('registro')){
    document.getElementById('auth-title').textContent = 'Necesitas una cuenta para continuar';
    document.getElementById('auth-sub').textContent = 'Para reservar, agendar citas o contratar un seguro, regístrate aceptando nuestros Términos y Condiciones y nuestras Políticas. Solo solicitamos los datos mínimos necesarios.';
  }

  document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!document.getElementById('r-terms').checked){
      alert('Debes aceptar los Términos y las Políticas para crear la cuenta. Si no estás de acuerdo, el proceso se cancela.');
      return;
    }
    const email = document.getElementById('r-email').value.trim().toLowerCase();
    const users = VP.get(VP.STORAGE.USERS, []);
    const registerMessage = document.getElementById('register-message');
    if (users.find(u => u.email === email)){
      registerMessage.style.display = 'block';
      registerMessage.innerHTML = 'Ya existe una cuenta con ese correo. <a href="login.html">Inicia sesión aquí</a>.';
      return;
    }
    registerMessage.style.display = 'none';
    const newUser = {
      nombre: document.getElementById('r-name').value.trim(),
      apellido: document.getElementById('r-last').value.trim(),
      email,
      telefono: document.getElementById('r-phone').value.trim(),
      pass: document.getElementById('r-pass').value, // demo (no usar en producción)
      consentimiento: { terminos:true, politicas:true, fecha:new Date().toISOString() }
    };
    users.push(newUser);
    VP.set(VP.STORAGE.USERS, users);
    VP.set(VP.STORAGE.SESSION, { email });
    const redirect = sessionStorage.getItem('vp_redirect_after_login');
    if (redirect){ sessionStorage.removeItem('vp_redirect_after_login'); location.href = redirect; }
    else { showDashboard(newUser); }
  });

  document.addEventListener('click', e => {
    if (e.target.id === 'logout-btn'){ VP.logout(); }
    if (e.target.id === 'delete-btn'){
      if (!confirm('¿Eliminar tu cuenta? Tus datos personales serán borrados conforme a la LOPDP. Esta acción es irreversible.')) return;
      const u = VP.currentUser(); if (!u) return;
      // Borrado de datos personales y de registros vinculados
      VP.set(VP.STORAGE.USERS, VP.get(VP.STORAGE.USERS, []).filter(x => x.email !== u.email));
      VP.set(VP.STORAGE.APPTS, VP.get(VP.STORAGE.APPTS, []).filter(x => x.email !== u.email));
      VP.set(VP.STORAGE.RESERVES, VP.get(VP.STORAGE.RESERVES, []).filter(x => x.email !== u.email));
      VP.set(VP.STORAGE.INSURANCE, VP.get(VP.STORAGE.INSURANCE, []).filter(x => x.email !== u.email));
      localStorage.removeItem(VP.STORAGE.SESSION);
      alert('Tu cuenta y datos personales han sido eliminados.');
      location.href = 'index.html';
    }
  });
}
init();
