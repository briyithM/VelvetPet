/* VelvetPet - calendario y agendamiento */
const MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

// Disponibilidad simulada (sincronizada con equipo veterinario)
// Días no disponibles: domingos y, además, ciertos días del mes ocupados.
function isUnavailable(date){
  if (date.getDay() === 0) return true; // domingos cerrados a agenda en línea
  const unavailableDays = [5, 12, 18, 26]; // mock de disponibilidad sincronizada
  return unavailableDays.includes(date.getDate());
}

let viewYear, viewMonth, selectedDate = null;

function renderCalendar(){
  const title = document.getElementById('cal-title');
  const grid = document.getElementById('cal-grid');
  title.textContent = `${MES[viewMonth]} ${viewYear}`;
  grid.innerHTML = '';
  DIAS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name';
    el.textContent = d;
    grid.appendChild(el);
  });
  const first = new Date(viewYear, viewMonth, 1);
  const last = new Date(viewYear, viewMonth+1, 0);
  const today = new Date(); today.setHours(0,0,0,0);

  for (let i=0; i<first.getDay(); i++){
    const e = document.createElement('div'); e.className='cal-day empty'; grid.appendChild(e);
  }
  for (let d=1; d<=last.getDate(); d++){
    const dayDate = new Date(viewYear, viewMonth, d);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cal-day';
    cell.textContent = d;
    if (dayDate < today){ cell.classList.add('past'); cell.disabled = true; }
    else if (isUnavailable(dayDate)){ cell.classList.add('unavailable'); cell.disabled = true; cell.title='No disponible'; }
    else { cell.classList.add('available'); }
    if (selectedDate && dayDate.getTime() === selectedDate.getTime()){
      cell.classList.add('selected');
    }
    cell.addEventListener('click', () => {
      if (cell.disabled) return;
      selectedDate = dayDate;
      renderCalendar();
      const lbl = document.getElementById('selected-date');
      lbl.style.display = 'block';
      lbl.textContent = 'Fecha seleccionada: ' + VP.formatDate(dayDate);
    });
    grid.appendChild(cell);
  }
}

function nav(delta){
  viewMonth += delta;
  if (viewMonth < 0){ viewMonth = 11; viewYear--; }
  if (viewMonth > 11){ viewMonth = 0; viewYear++; }
  renderCalendar();
}

(function init(){
  const now = new Date();
  viewYear = now.getFullYear(); viewMonth = now.getMonth();
  renderCalendar();
  document.getElementById('cal-prev').addEventListener('click', () => nav(-1));
  document.getElementById('cal-next').addEventListener('click', () => nav(1));

  document.getElementById('appt-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedDate){ alert('Selecciona una fecha disponible en el calendario.'); return; }
    const user = VP.requireAuth('agendar-cita');
    if (!user) return;
    const data = {
      id: VP.uid(),
      email: user.email,
      vet: document.getElementById('vet').value,
      pet: document.getElementById('pet').value.trim(),
      breed: document.getElementById('breed').value.trim(),
      sex: document.getElementById('sex').value,
      species: document.getElementById('species').value,
      time: document.getElementById('time').value,
      reason: document.getElementById('reason').value.trim(),
      date: selectedDate.toISOString(),
      createdAt: new Date().toISOString()
    };
    const list = VP.get(VP.STORAGE.APPTS, []);
    list.push(data);
    VP.set(VP.STORAGE.APPTS, list);
    alert(`Cita confirmada con ${data.vet} el ${VP.formatDate(selectedDate)} a las ${data.time}.`);
    e.target.reset();
    selectedDate = null;
    document.getElementById('selected-date').style.display='none';
    renderCalendar();
  });
})();
