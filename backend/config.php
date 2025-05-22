<?php
/*
Este fichero hay que incluirlo en cada script del proyecto.
De esta manera:
 - podrás usar la información que aparece aquí en cualquier parte
 - sólo necesitas actualizar este fichero para reflejar cualquier
   cambio en toda la aplicación
*/

/* Array asociativo con la configuración de conexión a la base de datos */
$basedatos = array(
    "basedatos" => "peluqueria",
    "usuario" => "root",
    "password" => "test",
    "servidor" => "db",
    "puerto" => 3306
);

/* ERROR REPORTING */
error_reporting(E_ERROR);
mysqli_report(MYSQLI_REPORT_OFF);

/* FUNCIONES COMUNES */

// Función para obtener la conexión a la base de datos
function obtenerConexion()
{
    global $basedatos; // recuperamos el array con la conexión

    $conexion = new mysqli($basedatos["servidor"], $basedatos["usuario"], $basedatos["password"], $basedatos["basedatos"], $basedatos["puerto"]);

    if ($conexion->connect_errno) {
        die("Error al conectar a la base de datos: " . $conexion->connect_error);
    }

    mysqli_set_charset($conexion, "utf8");
    return $conexion;
}

// Función para enviar la respuesta al cliente
function responder($datos, $ok, $mensaje, $conexion)
{
    $respuesta["ok"] = $ok; 
    $respuesta["datos"] = $datos; 
    $respuesta["mensaje"] = $mensaje; 

    echo json_encode($respuesta);
    mysqli_close($conexion);

    if ($ok == false) {
        exit(1);
    } else {
        exit(0);
    }
}

// Función para obtener las citas de una fecha
function obtenerCitas($fecha) {
    $conexion = obtenerConexion();  // Obtener la conexión

    $sql = "SELECT * FROM citas WHERE fecha = ? ORDER BY hora";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $fecha); // 's' es para string
    $stmt->execute();

    $result = $stmt->get_result();
    $citas = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $citas[] = $row;
        }
    }
    $conexion->close();
    return $citas;
}

// Función para agregar una cita
function agregarCita($nombre, $telefono, $fecha, $hora, $servicio) {
    $conexion = obtenerConexion();  // Obtener la conexión

    // Validar y sanitizar los datos
    $nombre = htmlspecialchars(strip_tags($nombre));
    $telefono = htmlspecialchars(strip_tags($telefono));
    $fecha = htmlspecialchars(strip_tags($fecha));
    $hora = htmlspecialchars(strip_tags($hora));
    $servicio = htmlspecialchars(strip_tags($servicio));

    $sql = "INSERT INTO citas (nombre_cliente, telefono_cliente, fecha, hora, servicio) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sssss", $nombre, $telefono, $fecha, $hora, $servicio);  // 'sssss' para cinco cadenas de texto
    if ($stmt->execute()) {
        $mensaje = "Cita agregada correctamente.";
    } else {
        $mensaje = "Error: " . $stmt->error;
    }
    $conexion->close();
    return $mensaje;
}

?>
