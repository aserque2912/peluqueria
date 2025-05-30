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

    // Obtener horas bloqueadas para la fecha
    fetch(`../backend/obtener_horas_bloqueadas.php?fecha=${fecha}`)
        .then(res => res.json())
        .then(data => {
            horasBloqueadas.clear();
            data.forEach(h => horasBloqueadas.add(h.hora));
            mostrarHoras(fecha);
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudieron cargar las horas bloqueadas', 'error');
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
        // Bloquear día completo: bloqueamos todas las horas posibles
        Swal.fire({
            title: '¿Seguro que quieres bloquear todo el día?',
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
        // Bloquear horas específicas
        if (horasBloqueadas.size === 0) {
            Swal.fire('Atención', 'Selecciona al menos una hora para bloquear.', 'info');
            return;
        }
        bloquearHorasFuncion(fecha, motivo, Array.from(horasBloqueadas));
    }
});

function bloquearDiaCompletoFuncion(fecha, motivo) {
    // Para bloquear el día completo, primero borramos todos los bloqueos y creamos bloqueos para cada hora
    Swal.fire({
        title: 'Bloqueando todo el día...',
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
            // Añadimos bloqueos para todas las horas del día (08:00 a 20:00 cada 30 min)
            const horas = [];
            let inicio = new Date(`${fecha}T08:00:00`);
            const fin = new Date(`${fecha}T20:00:00`);
            while (inicio <= fin) {
                horas.push(inicio.toTimeString().slice(0, 5));
                inicio = new Date(inicio.getTime() + 30 * 60000);
            }

            const promesas = horas.map(hora => {
                return fetch('../backend/bloquear_hora.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fecha, hora, motivo })
                });
            });

            return Promise.all(promesas);
        })
        .then(() => {
            Swal.close();
            Swal.fire('Bloqueado', 'El día completo ha sido bloqueado.', 'success');
            cargarHoras();
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
                    })
                    .then(async res => {
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