document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#bloqueosTable tbody');
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroHora = document.getElementById('filtroHora');

    function cargarBloqueos() {
        fetch('../backend/ver_horas_bloqueadas.php')
            .then(res => res.json())
            .then(data => {
                if ($.fn.DataTable.isDataTable('#bloqueosTable')) {
                    $('#bloqueosTable').DataTable().destroy();
                }
                tbody.innerHTML = '';

                if (!data || data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay horarios bloqueados.</td></tr>`;
                    return;
                }

                const fechaSeleccionada = filtroFecha.value;
                const horaSeleccionada = filtroHora.value;

                const filtrados = data.filter(b => {
                    const coincideFecha = !fechaSeleccionada || b.fecha === fechaSeleccionada;
                    const coincideHora = !horaSeleccionada || b.hora === horaSeleccionada;
                    return coincideFecha && coincideHora;
                });

                if (filtrados.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay coincidencias.</td></tr>`;
                    return;
                }

                filtrados.forEach(b => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
            <td>${b.fecha}</td>
            <td>${b.hora}</td>
            <td>${b.motivo || '-'}</td>
            <td>
              <button class="btn btn-outline-danger btn-sm eliminar-btn" title="Eliminar">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          `;

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
                                            row.remove();
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
                $('#bloqueosTable').DataTable({
                    pageLength: 6,
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
                    }
                });

            })
            .catch(err => {
                console.error(err);
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
            });
    }

    filtroFecha.addEventListener('change', cargarBloqueos);
    filtroHora.addEventListener('change', cargarBloqueos);

    cargarBloqueos();

    // Botón para borrar todos los bloqueos de una fecha
    const btnBorrarTodos = document.getElementById('btnBorrarBloqueos');
    if (btnBorrarTodos) {
        btnBorrarTodos.addEventListener('click', () => {
            const fecha = document.getElementById('fechaBorrar').value;

            if (!fecha) {
                Swal.fire("Error", "Debes seleccionar una fecha", "warning");
                return;
            }

            Swal.fire({
                title: "¿Eliminar todos los bloqueos?",
                text: `Se eliminarán todos los horarios bloqueados del día ${fecha}.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, borrar",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch("../backend/borrar_bloqueos_dia.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ fecha })
                        })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.ok) {
                                Swal.fire("Eliminado", "Los bloqueos fueron eliminados.", "success").then(() => {
                                    cargarBloqueos();
                                });
                            } else {
                                Swal.fire("Error", data.error || "No se pudieron eliminar los bloqueos.", "error");
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            Swal.fire("Error", "Ocurrió un error en la solicitud.", "error");
                        });
                }
            });
        });
    }
});