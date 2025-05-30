const tipoBloqueoSelect = document.getElementById('tipoBloqueo');
const fechaInput = document.getElementById('fecha');
const horasContainer = document.getElementById('horas-container');
const btnGuardar = document.getElementById('btnGuardar');
const motivoInput = document.getElementById('motivo');

let horasBloqueadas = new Set();
let bloquearDiaCompleto = true;

tipoBloqueoSelect.addEventListener('change', () => {
    bloquearDiaCompleto = tipoBloqueoSelect.value === 'dia';
    horasContainer.style.display = bloquearDiaCompleto ? 'none' : 'flex';
    if (!bloquearDiaCompleto && fechaInput.value) {
        cargarHoras();
    }
});

fechaInput.addEventListener('change', () => {
    if (!bloquearDiaCompleto) {
        cargarHoras();
    }
});

function cargarHoras() {
    const fecha = fechaInput.value;
    if (!fecha) {
        horasContainer.innerHTML = '';
        return;
    }

    // Llamamos a obtener_horas_disponibles.php para obtener solo las horas libres (no ocupadas ni bloqueadas)
    fetch(`../backend/obtener_horas_disponibles.php?fecha=${fecha}`)
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener horas disponibles');
            return res.json();
        })
        .then(data => {
            const horasDisponibles = data.horas_disponibles || [];
            horasBloqueadas.clear(); // reiniciamos selección

            horasContainer.innerHTML = '';

            if (horasDisponibles.length === 0) {
                horasContainer.innerHTML = '<p>No hay horas disponibles para esta fecha.</p>';
                return;
            }

            horasDisponibles.forEach(hora => {
                const div = document.createElement('div');
                div.textContent = hora;
                div.classList.add('hora', 'disponible');
                div.addEventListener('click', () => toggleHora(div, hora));
                horasContainer.appendChild(div);
            });
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudieron cargar las horas disponibles', 'error');
        });
}


function mostrarHoras(fecha) {
    horasContainer.innerHTML = '';
    let inicio = new Date(`${fecha}T08:00:00`);
    let fin = new Date(`${fecha}T20:00:00`);

    while (inicio <= fin) {
        const horaStr = inicio.toTimeString().slice(0, 5);
        const div = document.createElement('div');
        div.textContent = horaStr;
        div.classList.add('hora');
        if (horasBloqueadas.has(horaStr)) {
            div.classList.add('bloqueada');
        } else {
            div.classList.add('disponible');
        }
        div.addEventListener('click', () => toggleHora(div, horaStr));
        horasContainer.appendChild(div);

        inicio = new Date(inicio.getTime() + 30 * 60000); // +30 min
    }
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
            title: '¿Seguro que quieres bloquear todo el día? Se cancelarán las citas asociadas a este día.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, bloquear',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then((result) => {
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

    fetch('../backend/bloquear_dia.php', { // Nuevo endpoint para bloqueo día completo
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha, motivo })
        })
        .then(res => res.json())
        .then(resp => {
            Swal.close();
            if (resp.ok) {
                Swal.fire('Bloqueado', resp.mensaje || 'El día completo ha sido bloqueado y citas canceladas.', 'success');
                cargarHoras();
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
                }).then(async res => {
                    const text = await res.text();
                    console.log('Respuesta del servidor para hora ' + hora + ':', text);
                    return JSON.parse(text);
                });
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