document.addEventListener('DOMContentLoaded', () => {
    fetch('../backend/ver_horas_bloqueadas.php')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#bloqueosTable tbody');
            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay horarios bloqueados.</td></tr>`;
                return;
            }

            data.forEach(b => {
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
                    }).then((result) => {
                        if (result.isConfirmed) {
                            fetch('../backend/desbloquear_hora.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: b.id }) // 👈 aquí usamos el ID correctamente
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
        })
        .catch(err => {
            console.error(err);
            const tbody = document.querySelector('#bloqueosTable tbody');
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
        });
});