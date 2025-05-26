function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const form = document.getElementById('form-editar-cita');
const mensajeDiv = document.getElementById('mensaje');

document.addEventListener('DOMContentLoaded', () => {
  const citaId = getQueryParam('id');
  if (!citaId) {
    mensajeDiv.textContent = "ID de cita no proporcionado";
    mensajeDiv.className = 'error-message';
    form.style.display = 'none';
    return;
  }
  document.getElementById('cita-id').value = citaId;

  fetch(`../backend/obtener_cita.php?id=${citaId}`)
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener la cita');
      return res.json();
    })
    .then(data => {
      document.getElementById('nombre_cliente').value = data.nombre_cliente;
      document.getElementById('telefono').value = data.telefono;
      document.getElementById('fecha').value = data.fecha;
      document.getElementById('hora').value = data.hora;
      document.getElementById('servicio').value = data.servicio;
      document.getElementById('estado').value = data.estado;
    })
    .catch(err => {
      mensajeDiv.textContent = err.message;
      mensajeDiv.className = 'error-message';
      form.style.display = 'none';
    });
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const citaId = document.getElementById('cita-id').value;
  const datos = {
    id: citaId,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    servicio: document.getElementById('servicio').value,
    estado: document.getElementById('estado').value,
  };

  fetch('../backend/actualizar_cita.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(datos)
  })
  .then(res => {
    if (!res.ok) throw new Error('Error al actualizar la cita');
    return res.json();
  })
  .then(resp => {
    if (resp.ok) {
      mensajeDiv.textContent = 'Cita actualizada correctamente';
      mensajeDiv.className = 'success-message';
    } else {
      throw new Error(resp.mensaje || 'Error desconocido');
    }
  })
  .catch(err => {
    mensajeDiv.textContent = err.message;
    mensajeDiv.className = 'error-message';
  });
});
