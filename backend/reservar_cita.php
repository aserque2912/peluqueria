<?php
header( 'Content-Type: application/json; charset=utf-8' );
if ( session_status() === PHP_SESSION_NONE ) {
    session_start();
}

$input = trim( file_get_contents( 'php://input' ) );
$data = json_decode( $input, true );

if ( $data === null ) {
    echo json_encode( [
        'success' => false,
        'error' => 'JSON inválido o no recibido.',
        'debug' => [ 'raw_input' => $input ]
    ] );
    exit;
}

if ( $_SERVER[ 'REQUEST_METHOD' ] !== 'POST' ) {
    echo json_encode( [
        'success' => false,
        'error' => 'Esta ruta requiere una solicitud POST.',
        'debug' => [ 'method' => $_SERVER[ 'REQUEST_METHOD' ] ]
    ] );
    exit;
}

include_once( 'config.php' );

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


$fecha    = $data[ 'fecha' ] ?? null;
$hora     = $data[ 'hora' ] ?? null;
$servicio = $data[ 'servicio' ] ?? null;

if ( !$fecha || !$hora || !$servicio ) {
    echo json_encode( [
        'success' => false,
        'error' => 'Faltan parámetros.',
        'debug' => [
            'fecha' => $fecha,
            'hora' => $hora,
            'servicio' => $servicio,
            '_data' => $data,
        ]
    ] );
    exit;
}

if ($servicio === 'tinte') {
    $horaDateTime = new DateTime("$fecha $hora");
    $horasOcupadas = obtenerHorasOcupadas($fecha);

    $bloques = [];
    for ($i = 1; $i <= 4; $i++) {
        $bloque = clone $horaDateTime;
        $bloque->modify("+".($i * 30)." minutes");
        $bloques[] = $bloque->format('H:i');
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


$nombre   = $_SESSION[ 'usuario' ][ 'nombre' ]   ?? 'Anónimo';
$telefono = $_SESSION[ 'usuario' ][ 'telefono' ] ?? '';
$user_id  = $_SESSION[ 'usuario' ][ 'id' ]       ?? 0;

$conexion = obtenerConexion();

$sqlCheck = 'SELECT * FROM citas WHERE fecha = ? AND hora = ?';
$stmtCheck = $conexion->prepare( $sqlCheck );
$stmtCheck->bind_param( 'ss', $fecha, $hora );
$stmtCheck->execute();
$result = $stmtCheck->get_result();

if ( $result->num_rows > 0 ) {
    echo json_encode( [
        'success' => false,
        'error' => 'La hora ya está ocupada.',
        'debug' => [ 'fecha' => $fecha, 'hora' => $hora ]
    ] );
    exit;
}

$sqlInsert = "INSERT INTO citas (user_id, nombre_cliente, telefono, fecha, hora, servicio)
              VALUES (?, ?, ?, ?, ?, ?)";
$stmtInsert = $conexion->prepare( $sqlInsert );
$stmtInsert->bind_param( 'isssss', $user_id, $nombre, $telefono, $fecha, $hora, $servicio );

if ( $stmtInsert->execute() ) {
    echo json_encode( [ 'success' => true ] );
} else {
    echo json_encode( [
        'success' => false,
        'error' => 'Error al guardar la cita.',
        'debug' => [ 'error_sql' => $stmtInsert->error ]
    ] );
}

$stmtCheck->close();
$stmtInsert->close();
$conexion->close();
