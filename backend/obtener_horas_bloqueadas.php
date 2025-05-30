<?php
session_start();
include_once('config.php');

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if (!isset($_GET['fecha'])) {
    echo json_encode(['error' => 'Fecha no proporcionada']);
    exit;
}

$fecha = $_GET['fecha'];
$conexion = obtenerConexion();

$stmt = $conexion->prepare("SELECT hora, motivo FROM horas_bloqueadas WHERE fecha = ?");
$stmt->bind_param("s", $fecha);
$stmt->execute();
$result = $stmt->get_result();

$horasBloqueadas = [];
while ($row = $result->fetch_assoc()) {
    $horasBloqueadas[] = $row;
}

echo json_encode($horasBloqueadas);

$stmt->close();
$conexion->close();
?>
