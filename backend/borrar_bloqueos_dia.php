<?php
include_once("config.php");

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
$fecha = $input['fecha'] ?? null;

if (!$fecha) {
    echo json_encode(['ok' => false, 'error' => 'Fecha no proporcionada']);
    exit;
}

$conexion = obtenerConexion();
$stmt = $conexion->prepare("DELETE FROM horas_bloqueadas WHERE fecha = ?");
$stmt->bind_param("s", $fecha);

if ($stmt->execute()) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => 'Error al eliminar']);
}

$stmt->close();
$conexion->close();
?>
