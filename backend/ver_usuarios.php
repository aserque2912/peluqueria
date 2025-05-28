<?php
session_start();
include_once ('config.php');

// Solo admin puede acceder
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$conexion = obtenerConexion();

$sql = "SELECT id, nombre, email FROM usuarios ORDER BY id";
$result = $conexion->query($sql);

$usuarios = [];
if ($result) {
    while ($fila = $result->fetch_assoc()) {
        $usuarios[] = $fila;
    }
}

header('Content-Type: application/json');
echo json_encode($usuarios);
