<?php
header('Content-Type: application/json; charset=utf-8');
include_once('config.php');

try {
    $conexion = obtenerConexion();
    $sql = "SELECT id, filename, caption, display_order
            FROM carousel_images
            ORDER BY display_order ASC, uploaded_at ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $imagenes = [];
    while ($row = $resultado->fetch_assoc()) {
        $imagenes[] = [
            'id'           => (int)$row['id'],
            'filename'     => $row['filename'],
            'caption'      => $row['caption'],
            'display_order'=> (int)$row['display_order']
        ];
    }
    echo json_encode(['success' => true, 'data' => $imagenes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error al listar imágenes']);
}
