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

      // Usar las propiedades que tienes en el JSON
      const tdCliente = document.createElement('td');
      tdCliente.textContent = cita.nombre_cliente;
      tr.appendChild(tdCliente);

      const tdTelefono = document.createElement('td');
      tdTelefono.textContent = cita.telefono;
      tr.appendChild(tdTelefono);

      const tdFecha = document.createElement('td');
      tdFecha.textContent = cita.fecha;
      tr.appendChild(tdFecha);

      const tdHora = document.createElement('td');
      tdHora.textContent = cita.hora;
      tr.appendChild(tdHora);

      const tdServicio = document.createElement('td');
      tdServicio.textContent = cita.servicio;
      tr.appendChild(tdServicio);

      const tdEstado = document.createElement('td');
      tdEstado.textContent = cita.estado;
      tr.appendChild(tdEstado);

      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    alert(error.message);
  });
