<?php
include_once 'config.php';
// sólo para test:
responder(true, null, '¡Conexión OK!');

try {
    $db = obtenerConexion();
    echo json_encode([
        'success' => true,
        'message' => 'Conexión establecida correctamente'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ha fallado la conexión: ' . $e->getMessage()
    ]);
}
