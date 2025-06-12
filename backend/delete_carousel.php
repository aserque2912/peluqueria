<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
include_once('config.php');

// 1) Solo administrador
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;
if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}

try {
    $conexion = obtenerConexion();

    // 2) Obtener filename
    $sqlGet = "SELECT filename FROM carousel_images WHERE id = ?";
    $stmtGet = $conexion->prepare($sqlGet);
    $stmtGet->bind_param('i', $id);
    $stmtGet->execute();
    $stmtGet->bind_result($filename);
    if (!$stmtGet->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Imagen no encontrada']);
        exit;
    }
    $stmtGet->close();

    // 3) Borrar el registro
    $sqlDel = "DELETE FROM carousel_images WHERE id = ?";
    $stmtDel = $conexion->prepare($sqlDel);
    $stmtDel->bind_param('i', $id);
    $stmtDel->execute();
    $stmtDel->close();

    // 4) Eliminar archivo físico
    $rutaArchivo = __DIR__ . '/../frontend/img/carousel/' . $filename;
    if (file_exists($rutaArchivo)) {
        unlink($rutaArchivo);
    }

    echo json_encode(['success' => true, 'message' => 'Imagen eliminada correctamente']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error al eliminar']);
}
