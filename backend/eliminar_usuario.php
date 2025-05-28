<?php
session_start();
include_once ('config.php');

// Solo admin puede eliminar usuarios
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id'])) {
    echo json_encode(['ok' => false, 'mensaje' => 'ID no proporcionado']);
    exit;
}

$id = intval($data['id']);
$conexion = obtenerConexion();

$stmt = $conexion->prepare("DELETE FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['ok' => true, 'mensaje' => 'Usuario eliminado']);
} else {
    echo json_encode(['ok' => false, 'mensaje' => 'Error al eliminar: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
