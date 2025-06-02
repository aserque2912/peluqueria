document.addEventListener('DOMContentLoaded', () => {
    fetch('../backend/ver_horas_bloqueadas.php')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-bloqueos');
            const errorDiv = document.getElementById('mensaje-error');

            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay horarios bloqueados.</td></tr>`;
                return;
            }

            data.forEach(b => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${b.fecha}</td>
          <td>${b.hora}</td>
          <td>${b.motivo || '-'}</td>
        `;
                tbody.appendChild(row);
            });
        })
        .catch(err => {
            document.getElementById('mensaje-error').classList.remove('d-none');
            document.getElementById('mensaje-error').textContent = 'Error al cargar los datos.';
            console.error(err);
        });
});