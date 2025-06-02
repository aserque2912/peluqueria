document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async(e) => {
        e.preventDefault();
        const formData = new FormData(form);

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