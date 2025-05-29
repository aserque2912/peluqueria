<?php
session_start();
include_once 'config.php';

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(['ok' => false, 'mensaje' => 'ID no proporcionado']);
    exit;
}

$id = intval($data['id']);
$confirmar = isset($data['confirmar']) && $data['confirmar'] === true;

$conexion = obtenerConexion();

// Comprobar si tiene citas
$stmt = $conexion->prepare("SELECT COUNT(*) FROM citas WHERE user_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->bind_result($total);
$stmt->fetch();
$stmt->close();

if ($total > 0 && !$confirmar) {
    // Avisar que tiene citas y necesita confirmación extra
    echo json_encode(['ok' => false, 'tiene_citas' => true, 'mensaje' => 'El usuario tiene citas asociadas. ¿Seguro que quieres borrarlo junto con todas sus citas?']);
    $conexion->close();
    exit;
}

// Si confirmó o no tiene citas, elimina usuario (y se borran citas por ON DELETE CASCADE)
$stmt = $conexion->prepare("DELETE FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $id);
$ok = $stmt->execute();
$stmt->close();
$conexion->close();

echo json_encode(['ok' => $ok, 'mensaje' => $ok ? 'Usuario eliminado correctamente' : 'Error al eliminar usuario']);
