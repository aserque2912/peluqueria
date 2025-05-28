fetch('../backend/ver_usuarios.php')
    .then(res => {
        if (!res.ok) throw new Error('No autorizado o error en la consulta');
        return res.json();
    })
    .then(usuarios => {
        const tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td>
          <button class="btn btn-sm btn-eliminar" data-id="${usuario.id}" title="Eliminar usuario">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </td>
      `;
            tbody.appendChild(tr);
        });

        // Añadir evento a botones eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                if (confirm('¿Seguro que quieres eliminar este usuario?')) {
                    fetch('../backend/eliminar_usuario.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: userId })
                        })
                        .then(res => res.json())
                        .then(resp => {
                            if (resp.ok) {
                                alert('Usuario eliminado correctamente');
                                btn.closest('tr').remove();
                            } else {
                                alert('Error al eliminar usuario: ' + resp.mensaje);
                            }
                        })
                        .catch(err => alert('Error al eliminar usuario: ' + err.message));
                }
            });
        });
    })
    .catch(err => {
        alert(err.message);
    });