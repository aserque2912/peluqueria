document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        const password = form.querySelector('input[name="password"]').value;
        const confirmPassword = form.querySelector('input[name="confirm_password"]').value;


        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden'
            });
            return;
        }

        // Crear un FormData nuevo sin el campo confirm_password
        const formData = new FormData(form);
        formData.delete('confirm_password'); // Eliminamos el confirm_password para no enviarlo

        const telefono = formData.get("telefono");
        if (!/^[0-9]{9}$/.test(telefono)) {
            Swal.fire({
                icon: "warning",
                title: "Teléfono inválido",
                text: "El número debe contener exactamente 9 dígitos numéricos"
            });
            return;
        }

        const response = await fetch('../backend/register.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Registro completado!',
                text: result.message || 'Redirigiendo al login...',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = 'login.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'No se pudo registrar'
            });
        }
    });
});