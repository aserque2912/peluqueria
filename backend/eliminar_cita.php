<?php
header('Content-Type: application/json');

session_start();
include_once("config.php");

file_put_contents('log.txt', "Session ID: " . session_id() . "\n", FILE_APPEND);
file_put_contents('log.txt', "Session usuario_id: " . ($_SESSION['usuario_id'] ?? 'NO') . "\n", FILE_APPEND);

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de cita no recibido']);
    exit;
}

$idCita = intval($data['id']);
$usuarioId = $_SESSION['usuario_id'];

// Preparar y ejecutar el DELETE asegurando que el usuario solo borre sus citas
$sql = "DELETE FROM citas WHERE id = ? AND usuario_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $idCita, $usuarioId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró la cita o no tienes permiso para eliminarla']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar la cita']);
}

$stmt->close();
$conn->close();
