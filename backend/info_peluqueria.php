<?php
include_once("config.php");

$conexion = obtenerConexion();
$sql = "SELECT * FROM info_peluqueria LIMIT 1";
$result = $conexion->query($sql);
$info = $result->fetch_assoc();

echo json_encode($info);
?> 