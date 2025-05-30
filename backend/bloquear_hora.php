<?php
header('Content-Type: application/json; charset=utf-8');
include_once('config.php');
session_start();

// Verificar sesión y permisos
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
    exit;
}

// Leer datos JSON enviados
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['fecha'], $data['hora'])) {
    echo json_encode(['ok' => false, 'mensaje' => 'Faltan datos']);
    exit;
}

$fecha = $data['fecha'];
$hora = $data['hora'];
$motivo = $data['motivo'] ?? '';

// Obtener conexión
$conexion = obtenerConexion();

// Insertar bloqueo, asumiendo que la tabla es `horas_bloqueadas` con columnas `fecha`, `hora`, `motivo`
$sql = "INSERT INTO horas_bloqueadas (fecha, hora, motivo) VALUES (?, ?, ?)";
$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode(['ok' => false, 'mensaje' => 'Error en la consulta: ' . $conexion->error]);
    exit;
}
$stmt->bind_param("sss", $fecha, $hora, $motivo);
$ok = $stmt->execute();

if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'mensaje' => 'Error al guardar bloqueo: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
