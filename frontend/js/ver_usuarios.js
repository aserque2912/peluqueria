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
        <td>-</td>
      `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        alert(err.message);
    });