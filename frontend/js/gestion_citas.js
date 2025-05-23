// Verificar si el usuario está autenticado al cargar la página
fetch('../backend/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('authLinks').style.display = 'none';
            document.getElementById('userLinks').style.display = 'block';
            document.getElementById('userName').textContent = data.usuario.nombre;
        } else {
            window.location.href = 'login.html';
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error de sesión',
            text: 'Error al verificar la sesión. Por favor inicia sesión de nuevo.',
            confirmButtonColor: '#d33'
        }).then(() => window.location.href = 'login.html');
    });

// Limita la fecha mínima al día de hoy en el selector
document.addEventListener('DOMContentLoaded', function () {
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) {
        inputFecha.min = new Date().toISOString().split('T')[0];
    }
});

document.getElementById('fecha').addEventListener('change', function () {
    const fecha = this.value;
    const servicio = document.getElementById('servicio').value;

    if (fecha) {
        fetch(`../backend/obtener_horas_disponibles.php?fecha=${fecha}`)
            .then(response => response.json())
            .then(data => {
                const horaSelect = document.getElementById('hora');
                horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';

                const horasDisponibles = data.horas_disponibles;

                if (servicio === 'tinte') {
                    const bloqueadas = new Set();

                    horasDisponibles.forEach(hora => {
                        const base = new Date(`1970-01-01T${hora}`);
                        for (let i = -4; i <= 0; i++) {
                            const h = new Date(base.getTime() + i * 30 * 60 * 1000);
                            const bloque = h.toTimeString().slice(0, 5);
                            if (!horasDisponibles.includes(bloque)) {
                                bloqueadas.add(hora);
                            }
                        }
                    });

                    horasDisponibles.forEach(hora => {
                        if (bloqueadas.has(hora)) return;
                        const option = document.createElement('option');
                        option.value = hora;
                        option.textContent = hora;
                        horaSelect.appendChild(option);
                    });
                } else {
                    horasDisponibles.forEach(hora => {
                        const option = document.createElement('option');
                        option.value = hora;
                        option.textContent = hora;
                        horaSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener horas disponibles.',
                    confirmButtonColor: '#d33'
                });
            });
    }
});

document.getElementById('citaForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const servicio = document.getElementById('servicio').value;

    // ----------- VALIDACIÓN DE FECHA/HORA PASADA -----------
    const fechaHora = new Date(`${fecha}T${hora}`);
    const ahora = new Date();

    if (fechaHora < ahora) {
        Swal.fire({
            icon: 'error',
            title: 'Fecha/Hora inválida',
            text: 'No puedes reservar en una hora pasada.',
            confirmButtonColor: '#d33'
        });
        return; // Bloquea el envío
    }
    // -------------------------------------------------------

    if (!fecha || !hora || !servicio) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Completa todos los campos antes de continuar.',
            confirmButtonColor: '#f1c40f'
        });
        return;
    }

    if (servicio === 'tinte') {
        const horaDateTime = new Date(`${fecha}T${hora}`);
        const horaPlus1 = new Date(horaDateTime.getTime() + 60 * 60 * 1000);
        const horaPlus2 = new Date(horaDateTime.getTime() + 120 * 60 * 1000);

        const h1 = horaPlus1.toTimeString().slice(0, 5);
        const h2 = horaPlus2.toTimeString().slice(0, 5);

        const url = `../backend/verificar_horas.php?fecha=${encodeURIComponent(fecha)}&hora1=${encodeURIComponent(h1)}&hora2=${encodeURIComponent(h2)}&nocache=${Date.now()}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Tinte no disponible',
                        html: `Error en <b>${data.debug?.script || 'verificar_horas.php'}</b>:<br>${data.error}`,
                        confirmButtonColor: '#d33'
                    });
                    return;
                }
                enviarReserva(fecha, hora, servicio);
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error verificando la disponibilidad. Intenta de nuevo.',
                    confirmButtonColor: '#d33'
                });
            });
    } else {
        enviarReserva(fecha, hora, servicio);
    }
});

function enviarReserva(fecha, hora, servicio) {
    fetch('../backend/reservar_cita.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, hora, servicio })
    })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Cita reservada!',
                        text: 'Tu cita ha sido registrada correctamente.',
                        confirmButtonColor: '#3085d6'
                    }).then(() => {
                        window.location.href = '../frontend/index.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al reservar',
                        html: `Ocurrió un problema:<br><b>${data.error}</b>`,
                        confirmButtonColor: '#d33'
                    });
                }
            } catch (e) {
                console.error("Error al parsear JSON:", e);
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'Ocurrió un error inesperado. Revisa consola.',
                    confirmButtonColor: '#d33'
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Sin conexión',
                text: 'No se pudo contactar con el servidor.',
                confirmButtonColor: '#d33'
            });
        });
}
