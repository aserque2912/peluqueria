<?php
session_start();
include_once('config.php');

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = intval($data['id'] ?? 0);

if (!$id) {
    echo json_encode(['error' => 'ID no válido']);
    exit;
}

$conexion = obtenerConexion();

$stmt = $conexion->prepare("DELETE FROM horas_bloqueadas WHERE id = ?");
$stmt->bind_param("i", $id);
$ok = $stmt->execute();

echo json_encode(['ok' => $ok]);

$stmt->close();
$conexion->close();
?>
