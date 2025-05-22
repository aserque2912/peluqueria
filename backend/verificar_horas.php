<?php
header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once("config.php");

// Debug info para ver el contenido de la query string y $_GET
error_log("QUERY_STRING: " . ($_SERVER['QUERY_STRING'] ?? 'no-set'));
error_log("RAW_URI: " . ($_SERVER['REQUEST_URI'] ?? 'no-set'));
error_log("GET antes de parse_str: " . print_r($_GET, true));

// Parsear manualmente los parámetros GET de la query string
parse_str($_SERVER['QUERY_STRING'] ?? '', $queryParams);

error_log("Parsed query params: " . print_r($queryParams, true));

// Validar que usuario esté logueado
if (!isset($_SESSION['usuario'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Debes iniciar sesión para realizar esta acción.',
        'debug' => ['script' => 'verificar_horas.php']
    ]);
    exit;
}

// Validar parámetros usando $queryParams
$fecha = $queryParams['fecha'] ?? null;
$hora1 = $queryParams['hora1'] ?? null;
$hora2 = $queryParams['hora2'] ?? null;

if (!$fecha || !$hora1 || !$hora2) {
    error_log("verificar_horas.php: faltan parámetros: " . print_r($queryParams, true));
    echo json_encode([
        'success' => false,
        'error' => 'Faltan parámetros.',
        'debug' => [
            'script' => 'verificar_horas.php',
            'fecha' => $fecha,
            'hora1' => $hora1,
            'hora2' => $hora2,
            '_queryParams' => $queryParams
        ]
    ]);
    exit;
}

// Función para obtener horas ocupadas
function obtenerHorasOcupadas($fecha) {
    $conexion = obtenerConexion();
    $sql = "SELECT hora FROM citas WHERE fecha = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $fecha);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $horasOcupadas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $horaNormalizada = (new DateTime("1970-01-01 " . $fila['hora']))->format('H:i');
        $horasOcupadas[] = $horaNormalizada;
    }

    $stmt->close();
    $conexion->close();

    return $horasOcupadas;
}


$horasOcupadas = obtenerHorasOcupadas($fecha);

if (in_array($hora1, $horasOcupadas) || in_array($hora2, $horasOcupadas)) {
    echo json_encode([
        'success' => false,
        'error' => 'Las 2 horas seleccionadas no están disponibles.',
        'debug' => [
            'script' => 'verificar_horas.php',
            'hora1' => $hora1,
            'hora2' => $hora2,
            'ocupadas' => $horasOcupadas
        ]
    ]);
    exit;
} else {
    echo json_encode([
        'success' => true,
        'debug' => ['script' => 'verificar_horas.php']
    ]);
    exit;
}
