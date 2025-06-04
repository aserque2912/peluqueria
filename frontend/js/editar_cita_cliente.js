document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const citaId = params.get('id');
    const form = document.getElementById('formEditarCita');
    const horaSelect = document.getElementById('hora');
    const fechaInput = document.getElementById('fecha');
    const servicioSelect = document.getElementById('servicio');
    const nombreInput = document.getElementById('nombre_cliente');
    const telefonoInput = document.getElementById('telefono_cliente');
    const estadoInput = document.getElementById('estado');

    // Función para capitalizar la primera letra del estado
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function cargarHorasDisponibles(fecha, servicio, citaId, horaActual = null) {
        if (!fecha || !servicio) {
            horaSelect.innerHTML = '<option value="">Selecciona fecha y servicio</option>';
            return;
        }
        fetch(`../backend/obtener_horas_disponibles.php?fecha=${fecha}`)
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    let horas = resp.horas_disponibles || [];
                    // Asegura que la hora de la cita se pueda seleccionar (aunque esté ocupada)
                    if (horaActual && !horas.includes(horaActual.slice(0, 5))) {
                        horas.unshift(horaActual.slice(0, 5));
                    }
                    horaSelect.innerHTML = horas.map(hora => {
                        return `<option value="${hora}">${hora}</option>`;
                    }).join('');

                    // Selecciona la hora exacta de la cita
                    if (horaActual) horaSelect.value = horaActual.slice(0, 5);
                } else {
                    horaSelect.innerHTML = '<option value="">No hay horas disponibles</option>';
                }
            });
    }

    if (!citaId) {
        Swal.fire('Error', 'ID de cita no especificado.', 'error')
            .then(() => window.location.href = 'historial_citas.html');
        return;
    }

    // Cargar datos de la cita
    fetch(`../backend/obtener_cita.php?id=${citaId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error')
                    .then(() => window.location.href = 'historial_citas.html');
            } else {
                if (nombreInput) nombreInput.value = data.nombre_cliente || '';
                if (telefonoInput) telefonoInput.value = data.telefono || '';
                if (estadoInput) {
                    // Asignamos el estado con la primera letra en mayúscula
                    estadoInput.value = capitalizeFirstLetter(data.estado || '');
                }

                for (let option of servicioSelect.options) {
                    if (option.value.toLowerCase() === (data.servicio || '').toLowerCase()) {
                        servicioSelect.value = option.value;
                        break;
                    }
                }
                fechaInput.value = data.fecha || '';
                // Cargar horas disponibles, usando la hora exacta de la cita
                cargarHorasDisponibles(data.fecha, data.servicio, citaId, data.hora);
            }
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo cargar la cita', 'error');
        });

    form.addEventListener('submit', e => {
        e.preventDefault();

        const updatedServicio = servicioSelect.value;
        const updatedFecha = fechaInput.value;
        const updatedHora = horaSelect.value;
        // El estado se mantiene (readonly), no se envía para cambiar
        const datos = {
            id: citaId,
            servicio: updatedServicio,
            fecha: updatedFecha,
            hora: updatedHora
        };

        fetch('../backend/actualizar_cita.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    Swal.fire('Actualizado', 'La cita se actualizó correctamente', 'success')
                        .then(() => window.location.href = 'historial_citas.html');
                } else {
                    Swal.fire('Error', resp.message || 'No se pudo actualizar la cita', 'error');
                }
            })
            .catch(() => {
                Swal.fire('Error', 'No se pudo actualizar la cita', 'error');
            });
    });
});