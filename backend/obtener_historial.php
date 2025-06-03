<?php
session_start();
include_once( 'config.php' );

// Verificar si el user_id está disponible en la sesión dentro de 'usuario'
if ( !isset( $_SESSION[ 'usuario' ][ 'id' ] ) ) {
    echo json_encode( [ 'error' => 'No estás autenticado' ] );
    exit();
}

$user_id = $_SESSION[ 'usuario' ][ 'id' ];

// Obtener conexión usando la función de config.php
$conn = obtenerConexion();

$sql = "SELECT c.id, u.nombre AS nombre_cliente, u.telefono, c.fecha, c.hora, c.servicio, c.estado 
        FROM citas c
        INNER JOIN usuarios u ON c.user_id = u.id
        WHERE u.id = ?
        ORDER BY c.fecha DESC, c.hora DESC";


$stmt = $conn->prepare( $sql );
if ( !$stmt ) {
    echo json_encode( [ 'error' => 'Error en la consulta SQL: ' . $conn->error ] );
    exit();
}

$stmt->bind_param( 'i', $user_id );
$stmt->execute();

$result = $stmt->get_result();

if ( $result->num_rows > 0 ) {
    $citas = [];
    while ( $row = $result->fetch_assoc() ) {
        $citas[] = $row;
    }
    echo json_encode( $citas );
} else {
    echo json_encode( [ 'error' => 'No se encontraron citas' ] );
}

$stmt->close();
$conn->close();
?>
