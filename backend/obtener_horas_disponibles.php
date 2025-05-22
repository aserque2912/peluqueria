<?php
header('Content-Type: application/json; charset=utf-8');
include_once("config.php");

$fecha = $_GET['fecha'] ?? null;
if (!$fecha) {
    echo json_encode(['success' => false, 'error' => 'Falta la fecha.']);
    exit;
}

$conexion = obtenerConexion();
$sql = "SELECT hora, servicio FROM citas WHERE fecha = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $fecha);
$stmt->execute();
$result = $stmt->get_result();

$horasOcupadas = [];

while ($row = $result->fetch_assoc()) {
    $hora = (new DateTime("1970-01-01 {$row['hora']}"))->format('H:i');
    $horasOcupadas[] = $hora;

    if ($row['servicio'] === 'tinte') {
        $base = new DateTime("1970-01-01 $hora");
        for ($i = 1; $i <= 4; $i++) {
            $bloque = clone $base;
            $bloque->modify("+".($i * 30)." minutes");
            $horasOcupadas[] = $bloque->format('H:i');
        }
    }
}

$horasOcupadas = array_unique($horasOcupadas);

$stmt->close();
$conexion->close();

// Generar todas las horas posibles del día
$inicio = new DateTime("08:00");
$fin = new DateTime("20:00");

$horasDisponibles = [];
while ($inicio <= $fin) {
    $horaStr = $inicio->format('H:i');
    if (!in_array($horaStr, $horasOcupadas)) {
        $horasDisponibles[] = $horaStr;
    }
    $inicio->modify("+30 minutes");
}

echo json_encode(['success' => true, 'horas_disponibles' => $horasDisponibles]);
