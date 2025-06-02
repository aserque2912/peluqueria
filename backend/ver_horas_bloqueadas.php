<?php
include_once("config.php");

$conexion = obtenerConexion();

$sql = "SELECT fecha, hora, motivo FROM horas_bloqueadas ORDER BY fecha DESC, hora ASC";
$resultado = $conexion->query($sql);

$bloqueos = [];

while ($fila = $resultado->fetch_assoc()) {
    $bloqueos[] = $fila;
}

header('Content-Type: application/json');
echo json_encode($bloqueos);

$conexion->close();
?>
