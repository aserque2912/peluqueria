<?php
session_start();
include_once ('config.php'); // incluye la función obtenerConexion()

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    header('HTTP/1.1 403 Forbidden');
    exit('Acceso no autorizado');
}

// Obtener la conexión usando la función que tienes
$conexion = obtenerConexion();

$sql = "SELECT c.*, u.nombre AS nombre_cliente, u.telefono 
        FROM citas c
        JOIN usuarios u ON c.user_id = u.id
        ORDER BY c.fecha DESC, c.hora DESC";
$resultado = mysqli_query($conexion, $sql);

if (!$resultado) {
    die("Error en la consulta: " . mysqli_error($conexion));
}

// Recolectar las citas
$citas = [];
while ($fila = mysqli_fetch_assoc($resultado)) {
    $citas[] = $fila;
}

mysqli_close($conexion);

// Ahora devuelve JSON o muestra HTML (según tu elección)
// Por ejemplo, JSON para consumir en frontend:
header('Content-Type: application/json');
echo json_encode($citas);
