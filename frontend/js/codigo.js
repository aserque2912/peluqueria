// Función para cargar las opciones de hora (cada media hora)
// Función para cargar las opciones de hora desde el backend
function cargarHoras(fecha) {
    let horasSelect = document.getElementById('hora'); // Asumiendo que el ID del select es 'hora'
    horasSelect.innerHTML = ''; // Limpiar las opciones actuales

    // Añadir la opción por defecto
    let optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = 'Seleccione una hora';
    horasSelect.appendChild(optionDefault);

    // Hacer la petición al backend para obtener las horas disponibles
    fetch(`backend/obtener_horas_disponibles.php?fecha=${fecha}`)
        .then(response => response.json())
        .then(data => {
            // Si hay horas disponibles, cargarlas en el select
            if (data.horas && data.horas.length > 0) {
                data.horas.forEach(hora => {
                    let option = document.createElement('option');
                    option.value = hora;
                    option.textContent = hora;
                    horasSelect.appendChild(option);
                });
            } else {
                // Si no hay horas disponibles, mostrar un mensaje en el select
                let optionNoDisponible = document.createElement('option');
                optionNoDisponible.value = '';
                optionNoDisponible.textContent = 'No hay horas disponibles';
                horasSelect.appendChild(optionNoDisponible);
            }
        })
        .catch(error => {
            console.error('Error al cargar las horas:', error);
        });
}


// Función para cargar las citas desde la base de datos
function cargarCitas(fecha) {
    fetch(`obtener_citas.php?fecha=${fecha}`)
        .then(response => response.json())
        .then(data => {
            let tabla = document.getElementById('tablaCitas').getElementsByTagName('tbody')[0];
            tabla.innerHTML = '';
            data.forEach(cita => {
                let fila = tabla.insertRow();
                fila.innerHTML = `
                    <td>${cita.hora}</td>
                    <td>${cita.nombre_cliente}</td>
                    <td>${cita.servicio}</td>
                    <td>${cita.estado}</td>
                `;
            });
        });
}

// Función para enviar el formulario de la cita
document.getElementById('formCita').addEventListener('submit', function(event) {
    event.preventDefault();
    let nombre = document.getElementById('nombre_cliente').value;
    let telefono = document.getElementById('telefono_cliente').value;
    let fecha = document.getElementById('fecha_cita').value;
    let hora = document.getElementById('hora_cita').value;
    let servicio = document.getElementById('servicio').value;

    fetch('agregar_cita.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `nombre_cliente=${nombre}&telefono_cliente=${telefono}&fecha_cita=${fecha}&hora_cita=${hora}&servicio=${servicio}`
    })
    .then(response => response.text())
    .then(message => {
        alert(message);
        cargarCitas(fecha); // Recargar citas
    });
});

// Cargar las horas y las citas del día actual
window.onload = function() {
    cargarHoras();
    let fechaHoy = new Date().toISOString().split('T')[0];
    cargarCitas(fechaHoy);
};

// codigo.js

// Función para verificar si el usuario está autenticado
function verificarSesion() {
    return fetch('../backend/check_session.php')
        .then(response => response.json())
        .then(data => {
            return data.loggedIn;
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
            return false;
        });
}

// Función para mostrar un mensaje de alerta
function mostrarAlerta(mensaje) {
    alert(mensaje);
}

// Función para redirigir a una URL
function redirigir(url) {
    window.location.href = url;
}
