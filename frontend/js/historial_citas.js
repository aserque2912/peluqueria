// Esperamos que la página cargue completamente
document.addEventListener('DOMContentLoaded', function () {
    cargarHistorialCitas();
});

// Función para cargar el historial de citas
function cargarHistorialCitas() {
    const tbody = document.getElementById('historial-citas');
    const mensajeError = document.getElementById('mensaje-error');

    mensajeError.style.display = 'none';
    mensajeError.textContent = '';
    tbody.innerHTML = `<tr><td colspan="8" class="loading">Cargando citas...</td></tr>`;

    fetch('../backend/obtener_historial.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('No se pudo obtener el historial de citas');
        })
        .then(data => {
            if (data.error) {
                tbody.innerHTML = '';
                mensajeError.style.display = 'block';
                mensajeError.textContent = data.error;
                return;
            }

            if (Array.isArray(data) && data.length > 0) {
                tbody.innerHTML = '';
                const ahora = new Date();

                data.forEach(cita => {
                    let fechaCita;
                    if (cita.fecha.includes('/')) {
                        const partes = cita.fecha.split('/');
                        fechaCita = new Date(`${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}T${cita.hora}`);
                    } else if (cita.fecha.includes('-')) {
                        fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
                    } else {
                        console.error('Formato de fecha inesperado:', cita.fecha);
                        return;
                    }

                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${cita.id}</td>
                        <td>${cita.nombre_cliente}</td>
                        <td>${cita.telefono}</td>
                        <td>${cita.fecha}</td>
                        <td>${cita.hora}</td>
                        <td>${cita.servicio}</td>
                        <td>${cita.estado}</td>
                        <td class="accion"></td>
                    `;

                    if (fechaCita > ahora) {
                        const tdAccion = fila.querySelector('.accion');
                        const btnEliminar = document.createElement('button');
                        btnEliminar.classList.add('btn-eliminar');
                        btnEliminar.title = 'Eliminar cita';
                        btnEliminar.innerHTML = `
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zM5 4v9h6V4H5z"/>
                          </svg>
                        `;
                        btnEliminar.addEventListener('click', () => eliminarCita(cita.id));
                        tdAccion.appendChild(btnEliminar);
                    }
                    tbody.appendChild(fila);
                });
            } else {
                tbody.innerHTML = '';
                mensajeError.style.display = 'block';
                mensajeError.textContent = 'No tienes citas registradas.';
            }
        })
        .catch(error => {
            tbody.innerHTML = '';
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar',
                text: `Error al cargar las citas: ${error.message}`,
                confirmButtonColor: '#d33'
            });
        });
}

function eliminarCita(idCita) {
    Swal.fire({
        title: '¿Seguro que quieres eliminar esta cita?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('../backend/eliminar_cita.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ id: idCita })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'Cita eliminada correctamente.',
                            confirmButtonColor: '#3085d6'
                        }).then(() => {
                            cargarHistorialCitas();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'Error desconocido',
                            confirmButtonColor: '#d33'
                        });
                    }
                })
                .catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: err.message,
                        confirmButtonColor: '#d33'
                    });
                });
        }
    });
}
