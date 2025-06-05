document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#bloqueosTable tbody');
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroHora = document.getElementById('filtroHora');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    const btnBorrarTodos = document.getElementById('btnBorrarBloqueos');

    // Función que carga y filtra los bloqueos, luego inicializa / actualiza DataTable
    function cargarBloqueos() {
        fetch('../backend/ver_horas_bloqueadas.php')
            .then(res => res.json())
            .then(data => {
                // Si ya había DataTable inicializado, lo destruimos para poder volver a crearlo
                if ($.fn.DataTable.isDataTable('#bloqueosTable')) {
                    $('#bloqueosTable').DataTable().destroy();
                }

                tbody.innerHTML = '';

                if (!data || data.length === 0) {
                    tbody.innerHTML = `
            <tr>
              <td colspan="4" class="text-center">No hay horarios bloqueados.</td>
            </tr>
          `;
                    return;
                }

                const fechaSel = filtroFecha.value;
                const horaSel = filtroHora.value;

                // Filtrar el array según fecha y hora seleccionadas (si existen)
                const filtrados = data.filter(b => {
                    const coincideFecha = !fechaSel || b.fecha === fechaSel;
                    const coincideHora = !horaSel || b.hora === horaSel;
                    return coincideFecha && coincideHora;
                });

                if (filtrados.length === 0) {
                    tbody.innerHTML = `
            <tr>
              <td colspan="4" class="text-center">No hay coincidencias.</td>
            </tr>
          `;
                    return;
                }

                // Para cada bloqueo, crear fila con sus celdas
                filtrados.forEach(b => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
            <td>${b.fecha}</td>
            <td>${b.hora}</td>
            <td>${b.motivo || '-'}</td>
            <td>
              <button class="btn btn-eliminar eliminar-btn" title="Eliminar">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </td>
          `;

                    // Cuando se haga clic en “Eliminar” de esa fila:
                    row.querySelector('.eliminar-btn').addEventListener('click', () => {
                        Swal.fire({
                            title: '¿Eliminar bloqueo?',
                            text: `¿Deseas eliminar el horario bloqueado del ${b.fecha} a las ${b.hora}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar'
                        }).then(result => {
                            if (result.isConfirmed) {
                                fetch('../backend/desbloquear_hora.php', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: b.id })
                                    })
                                    .then(res => res.json())
                                    .then(resp => {
                                        if (resp.ok) {
                                            Swal.fire('Eliminado', 'El horario ha sido desbloqueado.', 'success');
                                            // Volver a cargar la tabla para actualizarla
                                            cargarBloqueos();
                                        } else {
                                            Swal.fire('Error', resp.error || 'No se pudo eliminar.', 'error');
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        Swal.fire('Error', 'Ocurrió un error en la solicitud.', 'error');
                                    });
                            }
                        });
                    });

                    tbody.appendChild(row);
                });

                // Una vez insertadas las filas, inicializar DataTable
                $('#bloqueosTable').DataTable({
                    pageLength: 6,
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
                    }
                });
            })
            .catch(err => {
                console.error(err);
                tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-danger">Error al cargar los datos.</td>
          </tr>
        `;
            });
    }

    // Al cambiar cualquiera de los filtros, recargar la tabla
    filtroFecha.addEventListener('change', cargarBloqueos);
    filtroHora.addEventListener('change', cargarBloqueos);

    // Botón “Limpiar filtros”: deja ambos filtros vacíos y recarga la tabla
    btnLimpiar.addEventListener('click', () => {
        filtroFecha.value = '';
        filtroHora.value = '';
        cargarBloqueos();
    });

    // Botón “Borrar todos” (ya existente)
    if (btnBorrarTodos) {
        btnBorrarTodos.addEventListener('click', () => {
            const fechaParaBorrar = document.getElementById('fechaBorrar').value;

            if (!fechaParaBorrar) {
                Swal.fire('Error', 'Debes seleccionar una fecha', 'warning');
                return;
            }

            Swal.fire({
                title: '¿Eliminar todos los bloqueos?',
                text: `Se eliminarán todos los horarios bloqueados del día ${fechaParaBorrar}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, borrar',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    fetch('../backend/borrar_bloqueos_dia.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fecha: fechaParaBorrar })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.ok) {
                                Swal.fire('Eliminado', 'Los bloqueos fueron eliminados.', 'success').then(() => {
                                    cargarBloqueos();
                                });
                            } else {
                                Swal.fire('Error', data.error || 'No se pudieron eliminar los bloqueos.', 'error');
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            Swal.fire('Error', 'Ocurrió un error en la solicitud.', 'error');
                        });
                }
            });
        });
    }

    // Cargar la tabla por primera vez
    cargarBloqueos();
});