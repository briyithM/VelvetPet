/* VelvetPet - utilidades comunes (cuenta, sesión, navegación) */
const VP = {
  STORAGE: {
    USERS: 'vp_users',
    SESSION: 'vp_session',
    APPTS: 'vp_appointments',
    RESERVES: 'vp_reserves',
    INSURANCE: 'vp_insurance',
    HISTORY: 'vp_history'
  },

  get(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); },

  currentUser(){
    const s = VP.get(VP.STORAGE.SESSION, null);
    if (!s) return null;
    const users = VP.get(VP.STORAGE.USERS, []);
    return users.find(u => u.email === s.email) || null;
  },

  requireAuth(actionLabel){
    const u = VP.currentUser();
    if (u) return u;
    sessionStorage.setItem('vp_redirect_after_login', location.pathname + (actionLabel ? '?accion=' + encodeURIComponent(actionLabel) : ''));
    location.href = 'cuenta.html?registro=1';
    return null;
  },

  logout(){
    localStorage.removeItem(VP.STORAGE.SESSION);
    location.href = 'index.html';
  },

  initNav(){
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links){
      toggle.addEventListener('click', () => links.classList.toggle('open'));
    }
    // Mostrar enlace cuenta/sesión
    const navAccount = document.querySelector('[data-nav-account]');
    if (navAccount){
      const u = VP.currentUser();
      navAccount.textContent = u ? 'Mi cuenta' : 'Ingresar';
    }
  },

  formatDate(d){
    const date = (d instanceof Date) ? d : new Date(d);
    return date.toLocaleDateString('es-EC', { year:'numeric', month:'long', day:'numeric' });
  },

  uid(){ return Math.random().toString(36).slice(2,10); }
};

document.addEventListener('DOMContentLoaded', VP.initNav);
