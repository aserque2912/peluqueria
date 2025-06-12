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

    const capitalizeFirstLetter = str =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

    function cargarHorasDisponibles(fecha, servicio, horaActual = null) {
        if (!fecha || !servicio) {
            horaSelect.innerHTML = '<option value="">Selecciona fecha y servicio</option>';
            return;
        }
        fetch(`../backend/obtener_horas_disponibles.php?fecha=${fecha}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(resp => {
                let horas = resp.horas_disponibles || [];
                if (horaActual && !horas.includes(horaActual.slice(0, 5))) {
                    horas.unshift(horaActual.slice(0, 5));
                }
                horaSelect.innerHTML = horas.length ?
                    horas.map(h => `<option value="${h}">${h}</option>`).join('') :
                    '<option value="">No hay horas disponibles</option>';
                if (horaActual) horaSelect.value = horaActual.slice(0, 5);
            })
            .catch(err => {
                console.error('Error al cargar horas:', err);
                horaSelect.innerHTML = '<option value="">Error al cargar horas</option>';
            });
    }

    if (!citaId) {
        Swal.fire('Error', 'ID de cita no especificado.', 'error')
            .then(() => window.location.href = 'historial_citas.html');
        return;
    }

    // 1) Cargar datos de la cita
    fetch(`../backend/obtener_cita.php?id=${citaId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.error) {
                Swal.fire('Error', data.error, 'error')
                    .then(() => window.location.href = 'historial_citas.html');
                return;
            }
            nombreInput.value = data.nombre_cliente || '';
            telefonoInput.value = data.telefono || '';
            estadoInput.value = capitalizeFirstLetter(data.estado || '');

            for (let opt of servicioSelect.options) {
                if (opt.value.toLowerCase() === (data.servicio || '').toLowerCase()) {
                    servicioSelect.value = opt.value;
                    break;
                }
            }
            fechaInput.value = data.fecha || '';

            // 2) Cargar horas (incluyendo la actual)
            cargarHorasDisponibles(data.fecha, data.servicio, data.hora);
        })
        .catch(err => {
            console.error('Error al obtener cita:', err);
            Swal.fire('Error', 'No se pudo cargar la cita.', 'error')
                .then(() => window.location.href = 'historial_citas.html');
        });

    // 3) Envío del formulario con FormData
    form.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.set('id', citaId);
        formData.set('servicio', servicioSelect.value);
        formData.set('fecha', fechaInput.value);
        formData.set('hora', horaSelect.value);

        Swal.fire({
            title: 'Guardando cambios...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        fetch('../backend/editar_cita_cliente.php', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) throw new Error(`Servidor respondió ${res.status}`);
                return res.json();
            })
            .then(resp => {
                Swal.close();
                if (resp.success) {
                    Swal.fire('Actualizado', 'La cita se actualizó correctamente', 'success')
                        .then(() => window.location.href = 'historial_citas.html');
                } else {
                    Swal.fire('Error', resp.message || 'No se pudo actualizar la cita', 'error');
                }
            })
            .catch(err => {
                console.error('Error al enviar formulario:', err);
                Swal.close();
                Swal.fire('Error', `Ha fallado la petición: ${err.message}`, 'error');
            });
    });
});