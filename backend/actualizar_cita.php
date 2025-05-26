<?php
session_start();
include_once 'config.php';

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

$id = intval($data['id']);
$fecha = htmlspecialchars(strip_tags($data['fecha']));
$hora = htmlspecialchars(strip_tags($data['hora']));
$servicio = htmlspecialchars(strip_tags($data['servicio']));
$estado = htmlspecialchars(strip_tags($data['estado']));

$conexion = obtenerConexion();

// Primero obtenemos los datos actuales de nombre_cliente y telefono para ese id
$stmtSelect = $conexion->prepare("SELECT nombre_cliente, telefono FROM citas WHERE id = ?");
$stmtSelect->bind_param('i', $id);
$stmtSelect->execute();
$result = $stmtSelect->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['ok' => false, 'mensaje' => 'Cita no encontrada']);
    exit;
}

$fila = $result->fetch_assoc();
$nombre = $fila['nombre_cliente'];
$telefono = $fila['telefono'];

// Ahora actualizamos sólo los campos editables (fecha, hora, servicio, estado)
$stmtUpdate = $conexion->prepare(
    "UPDATE citas SET fecha = ?, hora = ?, servicio = ?, estado = ? WHERE id = ?"
);
$stmtUpdate->bind_param('ssssi', $fecha, $hora, $servicio, $estado, $id);

if ($stmtUpdate->execute()) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'mensaje' => $stmtUpdate->error]);
}
