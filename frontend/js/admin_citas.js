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

let tabla; // Referencia al objeto DataTable

document.addEventListener('DOMContentLoaded', () => {
    cargarAdminCitas();
    configurarImprimir();
});

function cargarAdminCitas() {
    const tbody = document.querySelector('#tabla-citas tbody');

    // Mostrar mensaje “Cargando citas…” mientras llega la respuesta
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center loading">Cargando citas...</td>
        </tr>
    `;

    fetch('../backend/admin_citas.php')
        .then(response => {
            if (!response.ok) throw new Error('No autorizado o error en la consulta');
            return response.json();
        })
        .then(data => {
            // Limpiar las filas previas (o mensaje de carga)
            tbody.innerHTML = '';

            // Recolectar todas las horas únicas para el filtro de hora
            const conjuntoHoras = new Set();

            data.forEach(cita => {
                const tr = document.createElement('tr');

                // --- ID Cliente ---
                const tdIdCliente = document.createElement('td');
                tdIdCliente.textContent = cita.user_id;
                tr.appendChild(tdIdCliente);

                // --- Cliente ---
                const tdCliente = document.createElement('td');
                tdCliente.textContent = cita.nombre_cliente;
                tr.appendChild(tdCliente);

                // --- Teléfono ---
                const tdTelefono = document.createElement('td');
                tdTelefono.textContent = cita.telefono;
                tr.appendChild(tdTelefono);

                // --- Fecha ---
                const tdFecha = document.createElement('td');
                tdFecha.textContent = cita.fecha;
                tr.appendChild(tdFecha);

                // --- Hora ---
                const tdHora = document.createElement('td');
                tdHora.textContent = cita.hora;
                tr.appendChild(tdHora);

                // Guardar la hora en el conjunto (para poblar el filtro)
                if (cita.hora) {
                    conjuntoHoras.add(cita.hora);
                }

                // --- Servicio ---
                const tdServicio = document.createElement('td');
                tdServicio.textContent = cita.servicio;
                tdServicio.classList.add('td-servicio');
                tr.appendChild(tdServicio);

                // --- Estado (badge) ---
                const tdEstado = document.createElement('td');
                const spanBadge = document.createElement('span');
                const textoEstado =
                    cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1).toLowerCase();
                spanBadge.textContent = textoEstado;
                spanBadge.className = claseBadgePorEstado(cita.estado);
                tdEstado.appendChild(spanBadge);
                tr.appendChild(tdEstado);

                // --- Acción (editar / eliminar) ---
                const tdAccion = document.createElement('td');

                // Calcular si la cita es futura o pasada para mostrar “Editar”
                let fechaHoraCita;
                if (cita.fecha.includes('/')) {
                    // Formato dd/mm/aaaa
                    const partes = cita.fecha.split('/');
                    fechaHoraCita = new Date(
                        `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}T${cita.hora}`
                    );
                } else {
                    // Formato yyyy-mm-dd
                    fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);
                }
                const ahora = new Date();

                if (fechaHoraCita >= ahora) {
                    // Botón Editar (solo icono)
                    const btnEditar = document.createElement('button');
                    btnEditar.classList.add('btn', 'btn-sm', 'btn-editar', 'me-2');
                    btnEditar.setAttribute('data-id', cita.id);
                    btnEditar.title = 'Editar cita';
                    btnEditar.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
                    tdAccion.appendChild(btnEditar);
                }

                // Botón Eliminar (siempre visible)
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-sm', 'btn-eliminar');
                btnEliminar.setAttribute('data-id', cita.id);
                btnEliminar.title = 'Eliminar cita';
                btnEliminar.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
                tdAccion.appendChild(btnEliminar);

                tr.appendChild(tdAccion);
                tbody.appendChild(tr);
            });

            // Tras poblar filas, inicializar DataTable junto con filtros
            inicializarDataTable(Array.from(conjuntoHoras).sort());
        })
        .catch(error => {
            tbody.innerHTML = '';
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
}

function inicializarDataTable(listaHoras) {
    // Si ya existe una instancia previa de DataTable, la destruimos
    if ($.fn.DataTable.isDataTable('#tabla-citas')) {
        $('#tabla-citas').DataTable().destroy();
    }

    // Poblar el select de horas con las horas únicas
    const filterHora = $('#filter-hora');
    filterHora.empty();
    filterHora.append('<option value="">Todas</option>');
    listaHoras.forEach(hora => {
        // Mostrar en el desplegable solo "HH:MM", p. ej. "10:00"
        const horaDisplay = hora.substring(0, 5); // corta los segundos
        // El value conservamos la cadena completa ("HH:MM:SS") para que el filtro compare correctamente
        filterHora.append(`<option value="${hora}">${horaDisplay}</option>`);
    });

    // Filtro personalizado: combinando fecha y hora
    $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
        const fechaFiltro = $('#filter-fecha').val(); // YYYY-MM-DD
        const horaFiltro = $('#filter-hora').val(); // p. ej. "10:00:00" o ""
        const fechaRow = data[3] || ''; // columna “Fecha”
        const horaRow = data[4] || ''; // columna “Hora”

        // Filtrar por fecha
        if (fechaFiltro) {
            if (fechaRow !== fechaFiltro) {
                return false;
            }
        }

        // Filtrar por hora
        if (horaFiltro) {
            if (horaRow !== horaFiltro) {
                return false;
            }
        }

        return true; // si pasa ambos filtros (o están vacíos)
    });

    // Inicializar DataTable
    tabla = $('#tabla-citas').DataTable({
        destroy: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
        // Puedes añadir más opciones (dom, buttons, etc.) si lo deseas
    });

    // Al cambiar cualquiera de los filtros, volver a dibujar la tabla
    $('#filter-fecha, #filter-hora').on('change', () => {
        tabla.draw();
    });

    // Botón “Limpiar filtros”
    $('#btn-reset-filtros').on('click', () => {
        $('#filter-fecha').val('');
        $('#filter-hora').val('');
        tabla.draw();
    });

    // Delegar eventos de clic dentro del tbody para Editar / Eliminar
    $('#tabla-citas tbody').off('click').on('click', 'button', function() {
        const $btn = $(this);
        if ($btn.hasClass('btn-editar')) {
            const citaId = $btn.data('id');
            window.location.href = `editar_cita.html?id=${citaId}&origen=admin_citas.html`;
        }
        if ($btn.hasClass('btn-eliminar')) {
            const citaId = $btn.data('id');
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
                                }).then(() => {
                                    // Eliminar fila de DataTable y volver a dibujar
                                    tabla
                                        .row($btn.closest('tr'))
                                        .remove()
                                        .draw();
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: resp.mensaje || 'Error desconocido',
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
        }
    });
}

function configurarImprimir() {
    const btnImprimir = document.getElementById('btn-imprimir');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            window.print();
        });
    }
}