// gestion_citas.js

// 1) Verificar si el usuario está autenticado al cargar la página
fetch('/backend/check_session.php')
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

// 2) Limitar la fecha mínima al día de hoy y manejar cambios de fecha/servicio
document.addEventListener('DOMContentLoaded', function() {
    const inputFecha = document.getElementById('fecha');
    const contenedorHoras = document.getElementById('horas-disponibles');

    if (inputFecha) {
        inputFecha.min = new Date().toISOString().split('T')[0];
    }

    // Si cambia la fecha, recargamos horas
    inputFecha.addEventListener('change', () => {
        if (!inputFecha.value) {
            contenedorHoras.innerHTML =
                '<span class="text-muted">Selecciona un día para mostrar las horas disponibles</span>';
            document.getElementById('hora-seleccionada').value = '';
            return;
        }
        cargarHorasComoBloques();
    });

    // Si cambia el servicio, recargamos (solo si ya hay fecha)
    document.getElementById('servicio').addEventListener('change', () => {
        if (!inputFecha.value) {
            contenedorHoras.innerHTML =
                '<span class="text-muted">Selecciona un día para mostrar las horas disponibles</span>';
            document.getElementById('hora-seleccionada').value = '';
            return;
        }
        cargarHorasComoBloques();
    });
});


// 3) Función que carga las horas disponibles y las muestra como “bloques”
//    con la misma interfaz que usas en “bloquear horarios”
function cargarHorasComoBloques() {
    const fecha = document.getElementById('fecha').value;
    const servicio = document.getElementById('servicio').value;
    const contenedor = document.getElementById('horas-disponibles');
    const inputHidden = document.getElementById('hora-seleccionada');

    // Limpiar contenedor y valor seleccionado
    contenedor.innerHTML = '';
    inputHidden.value = '';

    if (!fecha) {
        contenedor.innerHTML =
            '<span class="text-muted">Selecciona un día para mostrar las horas disponibles</span>';
        return;
    }

    fetch(`../backend/obtener_horas_disponibles.php?fecha=${encodeURIComponent(fecha)}`)
        .then(response => response.json())
        .then(data => {
            // Se asume que data.horas_disponibles es un array de strings ["08:00", "08:30", ...]
            const horasDisponibles = data.horas_disponibles || [];
            let horasFiltradas = horasDisponibles.slice();

            // Si el servicio es "Tinte", aplicamos la lógica de bloqueo de las 2 horas siguientes
            if (servicio === 'Tinte') {
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
                horasFiltradas = horasDisponibles.filter(hora => !bloqueadas.has(hora));
            }

            if (horasFiltradas.length === 0) {
                contenedor.innerHTML =
                    '<span class="text-muted">No hay horas disponibles</span>';
                return;
            }

            // Por cada hora filtrada, creamos un “bloque” con clase .hora-disponible
            horasFiltradas.forEach(hora => {
                const bloque = document.createElement('div');
                bloque.classList.add('hora-disponible');
                bloque.textContent = hora;
                bloque.dataset.hora = hora;

                // Al hacer clic, marcamos este bloque y guardamos en el input hidden
                bloque.addEventListener('click', () => {
                    inputHidden.value = hora;
                    // Desmarcar todos
                    contenedor.querySelectorAll('.hora-disponible').forEach(el => {
                        el.classList.remove('seleccionada');
                    });
                    // Marcar el actual
                    bloque.classList.add('seleccionada');
                });

                contenedor.appendChild(bloque);
            });

            // Auto-seleccionar el primer bloque disponible
            const primerBloque = contenedor.querySelector('.hora-disponible');
            if (primerBloque) {
                primerBloque.click();
            }
        })
        .catch(error => {
            console.error(error);
            contenedor.innerHTML =
                '<span class="text-muted">Error al obtener horas disponibles.</span>';
        });
}


// 4) Envío del formulario “Pedir cita”
document.getElementById('citaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora-seleccionada').value;
    const servicio = document.getElementById('servicio').value;

    // Validar que todos los campos estén completos
    if (!fecha || !hora || !servicio) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Completa todos los campos antes de continuar.',
            confirmButtonColor: '#f1c40f'
        });
        return;
    }

    // Validación de fecha/hora pasada
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

    // Si es “Tinte”, verificar las 2 horas siguientes
    if (servicio === 'Tinte') {
        const horaDateTime = new Date(`${fecha}T${hora}`);
        const horaPlus1 = new Date(horaDateTime.getTime() + 60 * 60 * 1000);
        const horaPlus2 = new Date(horaDateTime.getTime() + 120 * 60 * 1000);

        const h1 = horaPlus1.toTimeString().slice(0, 5);
        const h2 = horaPlus2.toTimeString().slice(0, 5);

        const url = `../backend/verificar_horas.php?fecha=${encodeURIComponent(
      fecha
    )}&hora1=${encodeURIComponent(h1)}&hora2=${encodeURIComponent(
      h2
    )}&nocache=${Date.now()}`;

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
                        window.location.href = '/index.html';
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