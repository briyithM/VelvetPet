# VelvetPet - Sitio web

Sitio estático (HTML/CSS/JS) para la clínica veterinaria VelvetPet en Cumbayá, Quito.

## Estructura
- `index.html` — Página principal (menú, misión/visión, servicios, ubicación)
- `tienda.html` — Tienda con reserva (pago al retirar)
- `citas.html` — Agendamiento con calendario sincronizado
- `seguros.html` — Suscripción mensual con pago PayPhone
- `cuenta.html` — Registro/login, dashboard, historial, derechos LOPDP
- `css/styles.css` — Estilos (paleta de la imagen de referencia)
- `js/common.js` — Utilidades (sesión, requireAuth)
- `js/tienda.js`, `js/citas.js`, `js/seguros.js`, `js/cuenta.js`
- `docs/` — Aquí coloca tus PDFs:
  - `terminos-condiciones.pdf`
  - `politicas-empresa.pdf`

## Notas
- Persistencia con `localStorage` (demo). En producción reemplaza por backend real.
- Integración PayPhone como stub: invocar SDK/Checkout en `js/seguros.js`.
- Antes de cada acción (reservar, citar, contratar seguro) se solicita registro y consentimiento de Términos y Políticas.

Créditos: Montenegro S, Gavilanez M, Mera S.
