/* VelvetPet - inicio de sesión separado */
function initLogin(){
  const user = VP.currentUser();
  if (user){ location.href = 'cuenta.html'; return; }

  const params = new URLSearchParams(location.search);
  if (params.get('registro')){
    document.getElementById('login-heading').textContent = 'Inicia sesión para continuar';
    document.getElementById('login-description').textContent = 'Inicia sesión para reservar, agendar citas o contratar un seguro.';
  }

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('l-email').value.trim().toLowerCase();
    const pass = document.getElementById('l-pass').value;
    const users = VP.get(VP.STORAGE.USERS, []);
    const u = users.find(x => x.email === email && x.pass === pass);
    if (!u){ alert('Credenciales incorrectas.'); return; }
    VP.set(VP.STORAGE.SESSION, { email });
    const redirect = sessionStorage.getItem('vp_redirect_after_login');
    if (redirect){ sessionStorage.removeItem('vp_redirect_after_login'); location.href = redirect; }
    else { location.href = 'cuenta.html'; }
  });
}
initLogin();
