<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
include_once('config.php');

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$fecha = $data['fecha'] ?? null;
$motivo = $data['motivo'] ?? '';

if (!$fecha) {
    echo json_encode(['ok' => false, 'mensaje' => 'Fecha no proporcionada']);
    exit;
}

$conexion = obtenerConexion();

// Primero, eliminar bloqueos previos de esa fecha
$stmtDel = $conexion->prepare("DELETE FROM horas_bloqueadas WHERE fecha = ?");
$stmtDel->bind_param("s", $fecha);
$stmtDel->execute();
$stmtDel->close();

// Insertar bloqueos para todas las horas del día
$inicio = new DateTime("$fecha 08:00:00");
$fin = new DateTime("$fecha 20:00:00");

$stmtInsert = $conexion->prepare("INSERT INTO horas_bloqueadas (fecha, hora, motivo) VALUES (?, ?, ?)");

if (!$stmtInsert) {
    echo json_encode(['ok' => false, 'mensaje' => 'Error al preparar inserción: ' . $conexion->error]);
    $conexion->close();
    exit;
}

$ok = true;
while ($inicio <= $fin) {
    $horaStr = $inicio->format('H:i');
    $stmtInsert->bind_param("sss", $fecha, $horaStr, $motivo);
    if (!$stmtInsert->execute()) {
        $ok = false;
        break;
    }
    $inicio->modify("+30 minutes");
}
$stmtInsert->close();

if (!$ok) {
    echo json_encode(['ok' => false, 'mensaje' => 'Error al insertar bloqueos']);
    $conexion->close();
    exit;
}

// Actualizar estado de las citas de esa fecha a 'cancelada'
$stmtUpdate = $conexion->prepare("UPDATE citas SET estado = 'cancelada' WHERE fecha = ?");
$stmtUpdate->bind_param("s", $fecha);
if (!$stmtUpdate->execute()) {
    echo json_encode(['ok' => false, 'mensaje' => 'Error al cancelar citas']);
    $stmtUpdate->close();
    $conexion->close();
    exit;
}
$stmtUpdate->close();

$conexion->close();

echo json_encode(['ok' => true, 'mensaje' => 'Día bloqueado y citas canceladas correctamente']);
