// admin_horas_bloqueadas.js

const tipoBloqueoSelect = document.getElementById('tipoBloqueo');
const fechaInput = document.getElementById('fecha');
const horasContainer = document.getElementById('horas-container');
const btnGuardar = document.getElementById('btnGuardar');
const motivoInput = document.getElementById('motivo');

let horasBloqueadas = new Set();
let bloquearDiaCompleto = true;

// 1) Al cargar la página, impedimos seleccionar días pasados
document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    fechaInput.min = hoyStr; // no deja elegir fechas < hoy
    horasContainer.style.display = 'none';
});

// 2) Cambio entre bloquear día completo / horas sueltas
tipoBloqueoSelect.addEventListener('change', () => {
    bloquearDiaCompleto = tipoBloqueoSelect.value === 'dia';
    horasContainer.style.display = bloquearDiaCompleto ? 'none' : 'flex';
    if (!bloquearDiaCompleto && fechaInput.value) {
        cargarHoras();
    }
});

// 3) Cuando cambie fecha (y estemos en modo horas), recargamos
fechaInput.addEventListener('change', () => {
    if (!bloquearDiaCompleto) {
        cargarHoras();
    }
});

function cargarHoras() {
    const fecha = fechaInput.value;
    horasBloqueadas.clear();
    horasContainer.innerHTML = '';

    if (!fecha) {
        return;
    }

    fetch(`../backend/obtener_horas_disponibles.php?fecha=${fecha}`)
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener horas disponibles');
            return res.json();
        })
        .then(data => {
            const horasDisponibles = data.horas_disponibles || [];
            if (horasDisponibles.length === 0) {
                horasContainer.innerHTML = '<p class="text-muted">No hay horas disponibles para esta fecha.</p>';
                return;
            }

            const hoyStr = new Date().toISOString().split('T')[0];
            const isToday = fecha === hoyStr;
            const ahora = new Date();

            horasDisponibles.forEach(hora => {
                // Si es hoy y la hora ya pasó o es la misma, la saltamos
                if (isToday) {
                    const [h, m] = hora.split(':').map(x => parseInt(x, 10));
                    if (h < ahora.getHours() || (h === ahora.getHours() && m <= ahora.getMinutes())) {
                        return;
                    }
                }
                // Creamos el bloque de hora
                const div = document.createElement('div');
                div.textContent = hora;
                div.classList.add('hora', 'disponible');
                div.addEventListener('click', () => toggleHora(div, hora));
                horasContainer.appendChild(div);
            });

            if (!horasContainer.querySelector('.hora')) {
                horasContainer.innerHTML = '<p class="text-muted">No hay horas disponibles para esta fecha.</p>';
            }
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudieron cargar las horas disponibles', 'error');
        });
}

function toggleHora(div, horaStr) {
    if (div.classList.contains('bloqueada')) {
        div.classList.remove('bloqueada');
        div.classList.add('disponible');
        horasBloqueadas.delete(horaStr);
    } else {
        div.classList.remove('disponible');
        div.classList.add('bloqueada');
        horasBloqueadas.add(horaStr);
    }
}

btnGuardar.addEventListener('click', () => {
    const fecha = fechaInput.value;
    const motivo = motivoInput.value.trim();

    if (!fecha) {
        Swal.fire('Error', 'Selecciona una fecha primero', 'error');
        return;
    }

    if (bloquearDiaCompleto) {
        Swal.fire({
            title: '¿Seguro que quieres bloquear todo el día? Se cancelarán las citas asociadas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, bloquear',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then(result => {
            if (result.isConfirmed) {
                bloquearDiaCompletoFuncion(fecha, motivo);
            }
        });
    } else {
        if (horasBloqueadas.size === 0) {
            Swal.fire('Atención', 'Selecciona al menos una hora para bloquear.', 'info');
            return;
        }
        bloquearHorasFuncion(fecha, motivo, Array.from(horasBloqueadas));
    }
});

function bloquearDiaCompletoFuncion(fecha, motivo) {
    Swal.fire({
        title: 'Bloqueando todo el día y cancelando citas...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    fetch('../backend/bloquear_dia.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha, motivo })
        })
        .then(res => res.json())
        .then(resp => {
            Swal.close();
            if (resp.ok) {
                Swal.fire('Bloqueado', resp.mensaje || 'Día bloqueado y citas canceladas.', 'success');
                if (!bloquearDiaCompleto) cargarHoras();
            } else {
                Swal.fire('Error', resp.mensaje || 'Error al bloquear el día completo.', 'error');
            }
        })
        .catch(() => {
            Swal.close();
            Swal.fire('Error', 'Error al bloquear el día completo.', 'error');
        });
}

function bloquearHorasFuncion(fecha, motivo, horas) {
    Swal.fire({
        title: 'Guardando bloqueos...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    fetch('../backend/desbloquear_hora.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha })
        })
        .then(res => res.json())
        .then(() => {
            const promesas = horas.map(hora => {
                return fetch('../backend/bloquear_hora.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fecha, hora, motivo })
                }).then(r => r.json());
            });
            return Promise.all(promesas);
        })
        .then(() => {
            Swal.close();
            Swal.fire('Guardado', 'Las horas bloqueadas se han actualizado correctamente', 'success');
            cargarHoras();
        })
        .catch(() => {
            Swal.close();
            Swal.fire('Error', 'Error al guardar los cambios', 'error');
        });
}