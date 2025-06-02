<?php
header('Content-Type: application/json');
session_start();
include_once('config.php');

$conn = obtenerConexion();

if (!$conn || !is_object($conn)) {
    echo json_encode(['error' => 'Conexión a BD no establecida']);
    exit;
}

if (!isset($_SESSION['usuario']['id'])) {
    echo json_encode(['error' => 'No autorizado, usuario no identificado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['error' => 'ID de cita no recibido']);
    exit;
}

$idCita = intval($data['id']);
$usuarioId = $_SESSION['usuario']['id'];
$rolUsuario = $_SESSION['usuario']['rol'] ?? '';

if ($rolUsuario === 'administrador') {
    $sql = "DELETE FROM citas WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['error' => 'Error preparando la consulta: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param('i', $idCita);
} else {
    $sql = "DELETE FROM citas WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['error' => 'Error preparando la consulta: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param('ii', $idCita, $usuarioId);
}

if (!$stmt->execute()) {
    echo json_encode(['error' => 'Error al ejecutar la consulta: ' . $stmt->error]);
    exit;
}

if ($stmt->affected_rows > 0) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => 'No se encontró la cita o no tienes permiso para eliminarla']);
}

$stmt->close();
$conn->close();
