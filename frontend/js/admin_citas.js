// Función para mapear el estado a la clase de badge de Bootstrap
function claseBadgePorEstado(estado) {
    switch (estado.toLowerCase()) {
        case 'pendiente':
            return 'badge bg-warning'; // amarillo
        case 'confirmada':
            return 'badge bg-success'; // verde
        case 'cancelada':
            return 'badge bg-danger'; // rojo
        default:
            return 'badge bg-secondary'; // gris para cualquier otro caso
    }
}

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
            tdServicio.classList.add('td-servicio');
            tr.appendChild(tdServicio);

            // Estado (con badge)
            const tdEstado = document.createElement('td');
            const spanBadge = document.createElement('span');
            // Poner la primera letra en mayúscula
            const textoEstado = cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1).toLowerCase();
            spanBadge.textContent = textoEstado;
            spanBadge.className = claseBadgePorEstado(cita.estado);
            tdEstado.appendChild(spanBadge);
            tr.appendChild(tdEstado);

            // Acción - botones editar y eliminar
            const tdAccion = document.createElement('td');

            // Calcular si la cita es actual o futura para mostrar botón editar
            let fechaHoraCita;
            if (cita.fecha.includes('/')) {
                const partes = cita.fecha.split('/');
                fechaHoraCita = new Date(`${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}T${cita.hora}`);
            } else {
                fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
            }
            const ahora = new Date();

            if (fechaHoraCita >= ahora) {
                // Botón editar
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-sm', 'btn-editar', 'me-2');
                btnEditar.setAttribute('data-id', cita.id);
                btnEditar.title = 'Editar cita';
                btnEditar.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
                tdAccion.appendChild(btnEditar);
            }

            // Botón eliminar siempre visible
            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-sm', 'btn-eliminar');
            btnEliminar.setAttribute('data-id', cita.id);
            btnEliminar.title = 'Eliminar cita';
            btnEliminar.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
            tdAccion.appendChild(btnEliminar);

            tr.appendChild(tdAccion);
            tbody.appendChild(tr);
        });

        // Listener para botones editar y eliminar
        tbody.addEventListener('click', e => {
            if (e.target.closest('.btn-editar')) {
                const btn = e.target.closest('.btn-editar');
                const citaId = btn.getAttribute('data-id');
                window.location.href = `editar_cita.html?id=${citaId}&origen=admin_citas.html`;
            } else if (e.target.closest('.btn-eliminar')) {
                const btn = e.target.closest('.btn-eliminar');
                const citaId = btn.getAttribute('data-id');

                Swal.fire({
                    title: '¿Seguro que quieres eliminar esta cita?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#aaa',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
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
                                        showClass: {
                                            popup: 'animate__animated animate__fadeInDown'
                                        },
                                        hideClass: {
                                            popup: 'animate__animated animate__fadeOutUp'
                                        }
                                    });
                                    btn.closest('tr').remove();
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: resp.mensaje || 'Error desconocido',
                                        confirmButtonColor: '#d33',
                                        showClass: {
                                            popup: 'animate__animated animate__fadeInDown'
                                        },
                                        hideClass: {
                                            popup: 'animate__animated animate__fadeOutUp'
                                        }
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
                                    showClass: {
                                        popup: 'animate__animated animate__fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animate__animated animate__fadeOutUp'
                                    }
                                });
                            });
                    }
                });
            }
        });

    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar citas',
            text: error.message,
            confirmButtonColor: '#d33',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    });