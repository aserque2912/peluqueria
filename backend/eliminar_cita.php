<?php
header('Content-Type: application/json');
session_start();
include_once('config.php');

$conn = obtenerConexion();

$response = [];

$response['session_id'] = session_id();
$response['session_usuario_id'] = $_SESSION['usuario']['id'] ?? null;
$response['conn_is_object'] = is_object($conn);

if (!$conn || !is_object($conn)) {
    $response['error'] = 'Conexión a BD no establecida';
    echo json_encode($response);
    exit;
}

if (!isset($_SESSION['usuario']['id'])) {
    $response['error'] = 'No autorizado, usuario no identificado';
    echo json_encode($response);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    $response['error'] = 'ID de cita no recibido';
    echo json_encode($response);
    exit;
}

$idCita = intval($data['id']);
$usuarioId = $_SESSION['usuario']['id'];

$sql = "DELETE FROM citas WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    $response['error'] = 'Error preparando la consulta: ' . $conn->error;
    echo json_encode($response);
    exit;
}

$stmt->bind_param('ii', $idCita, $usuarioId);

if (!$stmt->execute()) {
    $response['error'] = 'Error al ejecutar la consulta: ' . $stmt->error;
    echo json_encode($response);
    exit;
}

if ($stmt->affected_rows > 0) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['error'] = 'No se encontró la cita o no tienes permiso para eliminarla';
}

echo json_encode($response);

$stmt->close();
$conn->close();
