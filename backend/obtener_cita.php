<?php
session_start();
include_once ('config.php');

$id = intval($_GET['id']);
$conexion = obtenerConexion();

$stmt = $conexion->prepare("SELECT * FROM citas WHERE id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Cita no encontrada']);
    exit;
}

$cita = $result->fetch_assoc();
echo json_encode($cita);
