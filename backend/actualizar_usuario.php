<?php
session_start();
include_once ('config.php');

// Solo admin puede actualizar
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (
    !isset($data['id']) || !is_numeric($data['id']) ||
    !isset($data['nombre']) || empty(trim($data['nombre'])) ||
    !isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL) ||
    !isset($data['rol']) || !in_array($data['rol'], ['cliente', 'administrador'])
) {
    echo json_encode(['ok' => false, 'mensaje' => 'Datos inválidos']);
    exit;
}

$id = intval($data['id']);
$nombre = htmlspecialchars(trim($data['nombre']));
$email = htmlspecialchars(trim($data['email']));
$rol = $data['rol'];

$conexion = obtenerConexion();

$sql = "UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sssi", $nombre, $email, $rol, $id);

if ($stmt->execute()) {
    echo json_encode(['ok' => true, 'mensaje' => 'Usuario actualizado']);
} else {
    echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
