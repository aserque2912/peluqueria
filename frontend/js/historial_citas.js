document.addEventListener('DOMContentLoaded', () => {
    cargarHistorialCitas();
});

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
            if (!response.ok) throw new Error('No se pudo obtener el historial de citas');
            return response.json();
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

                data.forEach(cita => {
                    let fechaHoraCita;
                    if (cita.fecha.includes('/')) {
                        const partes = cita.fecha.split('/');
                        fechaHoraCita = new Date(`${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}T${cita.hora}`);
                    } else {
                        fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
                    }
                    const ahora = new Date();

                    const fila = document.createElement('tr');
                    fila.innerHTML = `
            <td>${cita.id}</td>
            <td>${cita.nombre_cliente}</td>
            <td>${cita.telefono}</td>
            <td>${cita.fecha}</td>
            <td>${cita.hora}</td>
            <td class="td-servicio">${cita.servicio}</td>
            <td class="td-estado">${cita.estado}</td>
            <td class="accion"></td>
          `;

                    const tdAccion = fila.querySelector('.accion');

                    if (fechaHoraCita >= ahora) {
                        // Botón editar sin recuadro ni fondo, solo icono
                        const btnEditar = document.createElement('button');
                        btnEditar.classList.add('btn-editar', 'btn', 'btn-sm', 'btn-outline-dark', 'me-2');
                        btnEditar.style.background = 'transparent';
                        btnEditar.style.border = 'none';
                        btnEditar.style.padding = '0';
                        btnEditar.style.width = 'auto';
                        btnEditar.title = 'Editar cita';
                        btnEditar.setAttribute('data-id', cita.id);
                        btnEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                        tdAccion.appendChild(btnEditar);

                        // Botón eliminar
                        const btnEliminar = document.createElement('button');
                        btnEliminar.classList.add('btn-eliminar', 'btn', 'btn-sm', 'btn-danger');
                        btnEliminar.title = 'Eliminar cita';
                        btnEliminar.setAttribute('data-id', cita.id);
                        btnEliminar.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
                        tdAccion.appendChild(btnEliminar);
                    }

                    tbody.appendChild(fila);
                });

                // Listeners para editar y eliminar (delegados)
                tbody.querySelectorAll('.btn-editar').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const citaId = btn.getAttribute('data-id');
                        window.location.href = `editar_cita_cliente.html?id=${citaId}&origen=historial_citas.html`;
                    });
                });

                tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const citaId = btn.getAttribute('data-id');

                        Swal.fire({
                            title: '¿Seguro que quieres eliminar esta cita?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#aaa',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar',
                            showClass: { popup: 'animate__animated animate__fadeInDown' },
                            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                        }).then(result => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: 'Eliminando...',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    showConfirmButton: false,
                                    didOpen: () => Swal.showLoading()
                                });

                                fetch('../backend/eliminar_cita.php', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: citaId })
                                    })
                                    .then(res => res.json())
                                    .then(resp => {
                                        Swal.close();
                                        if (resp.ok) {
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Cita eliminada',
                                                showClass: { popup: 'animate__animated animate__fadeInDown' },
                                                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                                            });
                                            btn.closest('tr').remove();
                                        } else {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: resp.error || 'No se pudo eliminar la cita',
                                                confirmButtonColor: '#d33',
                                                showClass: { popup: 'animate__animated animate__fadeInDown' },
                                                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        Swal.close();
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error de conexión',
                                            text: err.message,
                                            confirmButtonColor: '#d33',
                                            showClass: { popup: 'animate__animated animate__fadeInDown' },
                                            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                                        });
                                    });
                            }
                        });
                    });
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
                confirmButtonColor: '#d33',
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
        });
}