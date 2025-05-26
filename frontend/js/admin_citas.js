fetch('../backend/admin_citas.php')
  .then(response => {
    if (!response.ok) throw new Error('No autorizado o error en la consulta');
    return response.json();
  })
  .then(data => {
    const tbody = document.querySelector('#tabla-citas tbody');
    tbody.innerHTML = '';

    data.forEach(cita => {
      const tr = document.createElement('tr');

      // ID Cliente
      const tdIdCliente = document.createElement('td');
      tdIdCliente.textContent = cita.user_id;
      tr.appendChild(tdIdCliente);

      // Cliente
      const tdCliente = document.createElement('td');
      tdCliente.textContent = cita.nombre_cliente;
      tr.appendChild(tdCliente);

      // Teléfono
      const tdTelefono = document.createElement('td');
      tdTelefono.textContent = cita.telefono;
      tr.appendChild(tdTelefono);

      // Fecha
      const tdFecha = document.createElement('td');
      tdFecha.textContent = cita.fecha;
      tr.appendChild(tdFecha);

      // Hora
      const tdHora = document.createElement('td');
      tdHora.textContent = cita.hora;
      tr.appendChild(tdHora);

      // Servicio
      const tdServicio = document.createElement('td');
      tdServicio.textContent = cita.servicio;
      tr.appendChild(tdServicio);

      // Estado
      const tdEstado = document.createElement('td');
      tdEstado.textContent = cita.estado;
      tr.appendChild(tdEstado);

      // Acción - botón editar
      const tdAccion = document.createElement('td');
      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.classList.add('btn-editar');
      btnEditar.setAttribute('data-id', cita.id);
      tdAccion.appendChild(btnEditar);
      tr.appendChild(tdAccion);

      tbody.appendChild(tr);
    });

    // Listener para los botones editar
    tbody.addEventListener('click', e => {
      if (e.target.classList.contains('btn-editar')) {
        const citaId = e.target.getAttribute('data-id');
        window.location.href = `editar_cita.html?id=${citaId}`;
      }
    });

  })
  .catch(error => {
    alert(error.message);
  });
