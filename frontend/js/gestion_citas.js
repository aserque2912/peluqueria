// gestion_citas.js

// Verificar si el usuario está autenticado al cargar la página
fetch('../backend/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('authLinks').style.display = 'none';
            document.getElementById('userLinks').style.display = 'flex';
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
document.addEventListener('DOMContentLoaded', function() {
    const inputFecha = document.getElementById('fecha');
    const contenedorHoras = document.getElementById('horas-disponibles');

    if (inputFecha) {
        inputFecha.min = new Date().toISOString().split('T')[0];
    }

    // Estado inicial: placeholder ya está en el HTML
    // Cuando cambie la fecha o el servicio, recargamos horas como botones
    inputFecha.addEventListener('change', cargarHorasComoBotones);
    document.getElementById('servicio').addEventListener('change', () => {
        // Si no hay fecha, mostramos placeholder
        if (!inputFecha.value) {
            contenedorHoras.innerHTML = '<span class="text-muted">Selecciona un día para mostrar las horas disponibles</span>';
            document.getElementById('hora-seleccionada').value = '';
            return;
        }
        cargarHorasComoBotones();
    });
});

function cargarHorasComoBotones() {
    const fecha = document.getElementById('fecha').value;
    const servicio = document.getElementById('servicio').value;
    const contenedor = document.getElementById('horas-disponibles');
    const inputHidden = document.getElementById('hora-seleccionada');

    contenedor.innerHTML = '';
    inputHidden.value = '';

    if (!fecha) {
        contenedor.innerHTML = '<span class="text-muted">Selecciona un día para mostrar las horas disponibles</span>';
        return;
    }

    fetch(`../backend/obtener_horas_disponibles.php?fecha=${encodeURIComponent(fecha)}`)
        .then(response => response.json())
        .then(data => {
            const horasDisponibles = data.horas_disponibles || [];
            let horasFiltradas = horasDisponibles.slice();


            if (horasFiltradas.length === 0) {
                contenedor.innerHTML = '<span class="text-muted">No hay horas disponibles</span>';
                return;
            }

            horasFiltradas.forEach(hora => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.classList.add('btn', 'btn-outline-primary', 'm-1');
                btn.textContent = hora;
                btn.dataset.hora = hora;

                btn.addEventListener('click', () => {
                    // Guardar la hora en el input oculto
                    inputHidden.value = hora;

                    // Marcar este botón y desmarcar los demás
                    contenedor.querySelectorAll('button').forEach(b => {
                        b.classList.remove('btn-primary');
                        b.classList.add('btn-outline-primary');
                    });
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-primary');
                });

                contenedor.appendChild(btn);
            });

            // Auto-seleccionar la primera hora disponible
            contenedor.querySelector('button').click();
        })
        .catch(error => {
            console.error(error);
            contenedor.innerHTML = '<span class="text-muted">Error al obtener horas disponibles.</span>';
        });
}

document.getElementById('citaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora-seleccionada').value;
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
        return;
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

    if (servicio === 'Tinte') {
        const horaDateTime = new Date(`${fecha}T${hora}`);
        const horaPlus1 = new Date(horaDateTime.getTime() + 60 * 60 * 1000);
        const horaPlus2 = new Date(horaDateTime.getTime() + 120 * 60 * 1000);

        const h1 = horaPlus1.toTimeString().slice(0, 5);
        const h2 = horaPlus2.toTimeString().slice(0, 5);

        const url = `../backend/verificar_horas.php?fecha=${encodeURIComponent(fecha)}&hora1=${encodeURIComponent(
      h1
    )}&hora2=${encodeURIComponent(h2)}&nocache=${Date.now()}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Tinte no disponible',
                        html: data.error ||
                            'No puedes reservar un Tinte porque las 2 horas siguientes a la cita no están disponibles.',
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
                        icon: 'warning',
                        title: 'Horario no disponible',
                        html: `<b>${data.error}</b>`,
                        confirmButtonColor: '#d33'
                    });
                }
            } catch (e) {
                console.error('Error al parsear JSON:', e);
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