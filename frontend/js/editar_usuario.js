function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const form = document.getElementById('form-editar-usuario');
const mensajeDiv = document.getElementById('mensaje');

document.addEventListener('DOMContentLoaded', () => {
    // Botón Volver
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.location.href = 'ver_usuarios.html'; // Ajusta si hace falta
        });
    }

    const usuarioId = getQueryParam('id');
    if (!usuarioId) {
        mensajeDiv.textContent = 'ID de usuario no proporcionado';
        mensajeDiv.className = 'error-message';
        form.style.display = 'none';
        return;
    }
    document.getElementById('usuario-id').value = usuarioId;

    // Cargar datos usuario
    fetch(`../backend/obtener_usuario.php?id=${usuarioId}`)
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener datos del usuario');
            return res.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('rol').value = data.rol || 'cliente';
        })
        .catch(err => {
            mensajeDiv.textContent = err.message;
            mensajeDiv.className = 'error-message';
            form.style.display = 'none';
        });
});

form.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const rol = document.getElementById('rol').value;

    if (!nombre || !email) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, rellena todos los campos.',
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
        });
        return;
    }

    const datos = { id, nombre, email, rol };

    fetch('../backend/actualizar_usuario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al actualizar usuario');
            return res.json();
        })
        .then(resp => {
            if (resp.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario actualizado',
                    text: 'Los datos del usuario se han guardado correctamente.',
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                }).then(() => {
                    window.location.href = 'ver_usuarios.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: resp.mensaje || 'Error desconocido',
                    showClass: { popup: 'animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
                });
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                showClass: { popup: 'animate__animated animate__fadeInDown' },
                hideClass: { popup: 'animate__animated animate__fadeOutUp' }
            });
        });
});