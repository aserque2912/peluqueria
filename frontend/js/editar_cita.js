function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const form = document.getElementById('form-editar-cita');
const mensajeDiv = document.getElementById('mensaje');
const inputFecha = document.getElementById('fecha');
const selectHora = document.getElementById('hora');

document.addEventListener('DOMContentLoaded', () => {
  // Botón Volver
  const btnVolver = document.getElementById('btnVolver');
  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      window.location.href = 'admin_citas.html';
    });
  }

  // Limitar la fecha mínima a hoy
  const hoy = new Date();
  // Descomenta si quieres que sea a partir de mañana
  // hoy.setDate(hoy.getDate() + 1);
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const fechaMinima = `${yyyy}-${mm}-${dd}`;
  inputFecha.min = fechaMinima;

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

      fetch(`../backend/obtener_horas_disponibles.php?fecha=${data.fecha}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener horas disponibles');
          return res.json();
        })
        .then(dataHoras => {
          const horas = dataHoras.horas_disponibles || [];
          selectHora.innerHTML = '';

          if (horas.length === 0) {
            const option = document.createElement('option');
            option.text = 'No hay horas disponibles';
            option.disabled = true;
            selectHora.add(option);
            return;
          }

          horas.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.text = hora;
            selectHora.add(option);
          });

          selectHora.value = data.hora;
        });

      document.getElementById('servicio').value = data.servicio;
      document.getElementById('estado').value = data.estado;
    })
    .catch(err => {
      mensajeDiv.textContent = err.message;
      mensajeDiv.className = 'error-message';
      form.style.display = 'none';
    });
});

inputFecha.addEventListener('change', () => {
  const fecha = inputFecha.value;
  if (!fecha) return;

  fetch(`../backend/obtener_horas_disponibles.php?fecha=${fecha}`)
    .then(res => {
      if (!res.ok) throw new Error('Error al obtener horas disponibles');
      return res.json();
    })
    .then(dataHoras => {
      const horas = dataHoras.horas_disponibles || [];
      selectHora.innerHTML = '';

      if (horas.length === 0) {
        const option = document.createElement('option');
        option.text = 'No hay horas disponibles';
        option.disabled = true;
        selectHora.add(option);
        return;
      }

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.text = '-- Selecciona una hora --';
      selectHora.add(defaultOption);

      horas.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.text = hora;
        selectHora.add(option);
      });
    })
    .catch(err => {
      alert(err.message);
    });
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;

  const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);
  const ahora = new Date();

  if (fechaHoraSeleccionada <= ahora) {
    alert('La fecha y hora seleccionadas no pueden ser pasadas.');
    return;
  }

  if (!hora) {
    alert('Por favor, selecciona una hora válida.');
    return;
  }

  const citaId = document.getElementById('cita-id').value;
  const datos = {
    id: citaId,
    fecha: fecha,
    hora: hora,
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
