<?php
header('Content-Type: application/json; charset=utf-8');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Zona horaria explícita para coherencia
date_default_timezone_set('Europe/Madrid'); // Cambia si tu negocio no es en España

define('HORA_CIERRE', '20:00'); // Hora de cierre de la peluquería

$input = trim(file_get_contents('php://input'));
$data = json_decode($input, true);

if ($data === null) {
    echo json_encode([
        'success' => false,
        'error' => 'JSON inválido o no recibido.',
        'debug' => ['raw_input' => $input]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Esta ruta requiere una solicitud POST.',
        'debug' => ['method' => $_SERVER['REQUEST_METHOD']]
    ]);
    exit;
}

include_once('config.php');

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

$fecha    = $data['fecha']    ?? null;
$hora     = $data['hora']     ?? null;
$servicio = $data['servicio'] ?? null;

if (!$fecha || !$hora || !$servicio) {
    echo json_encode([
        'success' => false,
        'error' => 'Faltan parámetros.',
        'debug' => [
            'fecha' => $fecha,
            'hora' => $hora,
            'servicio' => $servicio,
            '_data' => $data,
        ]
    ]);
    exit;
}

// --- VALIDACIÓN DE FECHA/HORA PASADA ---
$hora_normalizada = substr($hora, 0, 5); // Quita segundos si hay
$fechaHoraCita = DateTime::createFromFormat('Y-m-d H:i', "$fecha $hora_normalizada");
$ahora = new DateTime();

if (!$fechaHoraCita || $fechaHoraCita <= $ahora) {
    echo json_encode([
        'success' => false,
        'error' => 'No puedes reservar una cita en una fecha/hora pasada'
    ]);
    exit;
}
// --- FIN VALIDACIÓN ---

if ($servicio === 'tinte') {
    $horaDateTime = new DateTime("$fecha $hora_normalizada");
    $horasOcupadas = obtenerHorasOcupadas($fecha);

    $horaCierre = new DateTime("$fecha " . HORA_CIERRE);
    $bloques = [];
    for ($i = 1; $i <= 4; $i++) {
        $bloque = clone $horaDateTime;
        $bloque->modify("+".($i * 30)." minutes");
        $bloques[] = $bloque->format('H:i');

        // ----------- Validar que ningún bloque se pase de la hora de cierre -----------
        if ($bloque > $horaCierre) {
            echo json_encode([
                'success' => false,
                'error' => 'El servicio del tinte dura 2 horas aprox y no puedes hacer una reserva para un servicio que se extienda más allá de la hora de cierre (20:00).',
                'debug' => [
                    'hora_inicial' => $hora,
                    'bloques_bloqueados' => $bloques,
                    'hora_cierre' => HORA_CIERRE,
                    'bloque_fuera_horario' => $bloque->format('H:i')
                ]
            ]);
            exit;
        }
        // ---------------------------------------------------------------------------
    }

    foreach ($bloques as $bloque) {
        if (in_array($bloque, $horasOcupadas)) {
            echo json_encode([
                'success' => false,
                'error' => 'No puedes reservar este tinte porque una de las horas posteriores ya está ocupada.',
                'debug' => [
                    'hora_inicial' => $hora,
                    'bloques_bloqueados' => $bloques,
                    'ocupadas' => $horasOcupadas,
                    'conflicto' => $bloque
                ]
            ]);
            exit;
        }
    }
}

$nombre   = $_SESSION['usuario']['nombre']   ?? 'Anónimo';
$telefono = $_SESSION['usuario']['telefono'] ?? '';
$user_id  = $_SESSION['usuario']['id']       ?? 0;

$conexion = obtenerConexion();

$sqlCheck = 'SELECT * FROM citas WHERE fecha = ? AND hora = ?';
$stmtCheck = $conexion->prepare($sqlCheck);
$stmtCheck->bind_param('ss', $fecha, $hora_normalizada);
$stmtCheck->execute();
$result = $stmtCheck->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'error' => 'La hora ya está ocupada.',
        'debug' => ['fecha' => $fecha, 'hora' => $hora_normalizada]
    ]);
    exit;
}

$sqlInsert = "INSERT INTO citas (user_id, nombre_cliente, telefono, fecha, hora, servicio)
              VALUES (?, ?, ?, ?, ?, ?)";
$stmtInsert = $conexion->prepare($sqlInsert);
$stmtInsert->bind_param('isssss', $user_id, $nombre, $telefono, $fecha, $hora_normalizada, $servicio);

if ($stmtInsert->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar la cita.',
        'debug' => ['error_sql' => $stmtInsert->error]
    ]);
}

$stmtCheck->close();
$stmtInsert->close();
$conexion->close();
?>
