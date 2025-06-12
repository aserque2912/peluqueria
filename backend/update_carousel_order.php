<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
include_once('config.php');

// 1) Solo administradores pueden reordenar
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

// 2) Leer JSON de la petición
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;
$direction = isset($input['direction']) ? $input['direction'] : '';

if ($id <= 0 || !in_array($direction, ['up', 'down'])) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

try {
    $conexion = obtenerConexion();

    // 3) Obtener el display_order actual de esta imagen
    $sql = "SELECT display_order FROM carousel_images WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->bind_result($currentOrder);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Imagen no encontrada']);
        exit;
    }
    $stmt->close();

    // 4) Según la dirección, buscamos al vecino:
    if ($direction === 'up') {
        // Queremos el registro con mayor display_order menor a este
        $sql2 = "SELECT id, display_order 
                 FROM carousel_images 
                 WHERE display_order < ? 
                 ORDER BY display_order DESC LIMIT 1";
    } else {
        // direction === 'down'
        // Queremos el registro con menor display_order mayor a este
        $sql2 = "SELECT id, display_order 
                 FROM carousel_images 
                 WHERE display_order > ? 
                 ORDER BY display_order ASC LIMIT 1";
    }

    $stmt2 = $conexion->prepare($sql2);
    $stmt2->bind_param('i', $currentOrder);
    $stmt2->execute();
    $stmt2->bind_result($otherId, $otherOrder);
    if (!$stmt2->fetch()) {
        // No hay vecino: ya era primero (up) o último (down)
        echo json_encode(['success' => false, 'error' => 
            $direction === 'up' 
                ? 'La imagen ya está en la primera posición' 
                : 'La imagen ya está en la última posición'
        ]);
        exit;
    }
    $stmt2->close();

    // 5) Hacemos swap de display_order entre $id y $otherId
    $sqlUpd = "UPDATE carousel_images SET display_order = ? WHERE id = ?";
    // Primero actualizamos al vecino con el orden actual
    $stmt3 = $conexion->prepare($sqlUpd);
    $stmt3->bind_param('ii', $currentOrder, $otherId);
    $stmt3->execute();
    $stmt3->close();

    // Luego actualizamos esta imagen con el orden del vecino
    $stmt4 = $conexion->prepare($sqlUpd);
    $stmt4->bind_param('ii', $otherOrder, $id);
    $stmt4->execute();
    $stmt4->close();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al cambiar el orden: ' . $e->getMessage()
    ]);
}

$conexion->close();
