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
        console.error('Error al verificar la sesión:', error);
        window.location.href = 'login.html';
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
                console.error('Error al obtener horas disponibles:', error);
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
        alert('No puedes reservar una cita en una fecha/hora pasada.');
        return; // Bloquea el envío
    }
    // -------------------------------------------------------

    console.log("Fecha:", fecha);
    console.log("Hora:", hora);
    console.log("Servicio:", servicio);

    if (servicio === 'tinte') {
        const horaDateTime = new Date(`${fecha}T${hora}`);
        const horaPlus1 = new Date(horaDateTime.getTime() + 60 * 60 * 1000);
        const horaPlus2 = new Date(horaDateTime.getTime() + 120 * 60 * 1000);

        const h1 = horaPlus1.toTimeString().slice(0, 5);
        const h2 = horaPlus2.toTimeString().slice(0, 5);

        const url = `../backend/verificar_horas.php?fecha=${encodeURIComponent(fecha)}&hora1=${encodeURIComponent(h1)}&hora2=${encodeURIComponent(h2)}&nocache=${Date.now()}`;
        console.log("URL verificar horas:", url);

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Respuesta verificación:", data);
                if (!data.success) {
                    alert(`Error en ${data.debug?.script || 'verificar_horas.php'}: ${data.error}`);
                    return;
                }
                enviarReserva(fecha, hora, servicio);
            })
            .catch(error => {
                console.error("Error al verificar horas:", error);
                alert("Error verificando la disponibilidad. Intenta de nuevo.");
            });
    } else {
        enviarReserva(fecha, hora, servicio);
    }
});

function enviarReserva(fecha, hora, servicio) {
    console.log("Llamando a reservar_cita.php con:", { fecha, hora, servicio });
    fetch('../backend/reservar_cita.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, hora, servicio })
    })
        .then(response => response.text())
        .then(text => {
            console.log("Respuesta cruda:", text);
            try {
                const data = JSON.parse(text);

                if (data.success) {
                    alert("Cita reservada con éxito.");
                    window.location.href = '../frontend/index.html';
                } else {
                    if (data.debug && data.debug.script) {
                        alert(`Error en ${data.debug.script}: ${data.error}`);
                    } else {
                        alert(`Error: ${data.error}`);
                    }
                    console.error("Depuración:", data.debug);
                }
            } catch (e) {
                console.error("Error al parsear JSON:", e);
                alert("Ocurrió un error inesperado. Revisa consola.");
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            alert("No se pudo contactar con el servidor.");
        });
}