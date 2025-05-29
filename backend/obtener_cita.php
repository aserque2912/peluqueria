<?php
session_start();
include_once ('config.php');

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta id']);
    exit;
}

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
