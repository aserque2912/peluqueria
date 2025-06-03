<?php
session_start();
header('Content-Type: application/json');
include_once("config.php");

$conexion = obtenerConexion();

$id_cita = $_POST['id'] ?? null;
$fecha = $_POST['fecha'] ?? null;
$hora = $_POST['hora'] ?? null;
$servicio = $_POST['servicio'] ?? null;
$usuario_id = $_SESSION['usuario']['id'] ?? null;
$rol = $_SESSION['usuario']['rol'] ?? null;

if (!$id_cita || !$fecha || !$hora || !$servicio || !$usuario_id) {
    echo json_encode(['success' => false, 'message' => 'Acceso denegado o datos incompletos']);
    exit;
}

$sql = "UPDATE citas SET fecha = ?, hora = ?, servicio = ? WHERE id = ? AND user_id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sssii", $fecha, $hora, $servicio, $id_cita, $usuario_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'No se pudo actualizar la cita']);
}
?>
