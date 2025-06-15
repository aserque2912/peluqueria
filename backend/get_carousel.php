<?php
// backend/get_carousel.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

$mysqli = obtenerConexion();

$sql = "SELECT id, filename, caption, display_order
        FROM carousel_images
        ORDER BY display_order ASC, uploaded_at ASC";
$stmt = $mysqli->prepare($sql);
$stmt->execute();
$resultado = $stmt->get_result();

$imagenes = [];
while ($row = $resultado->fetch_assoc()) {
    $imagenes[] = [
      'id'            => (int)$row['id'],
      'filename'      => $row['filename'],
      'caption'       => $row['caption'],
      'display_order' => (int)$row['display_order'],
    ];
}

echo json_encode(['success' => true, 'data' => $imagenes]);
