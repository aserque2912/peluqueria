<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
include_once('config.php');

// 1) Verificar que el usuario es administrador
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    echo json_encode([
        'success' => false,
        'error'   => 'No autorizado'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error'   => 'Método no permitido. Use POST.'
    ]);
    exit;
}

// 2) Validar que el archivo llegó
if (!isset($_FILES['file'])) {
    echo json_encode([
        'success' => false,
        'error'   => 'No se recibió ningún archivo.'
    ]);
    exit;
}

// 3) Revisar errores en la carga
$fileError = $_FILES['file']['error'];
if ($fileError !== UPLOAD_ERR_OK) {
    $mensajeError = '';
    switch ($fileError) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $mensajeError = 'El archivo es demasiado grande.';
            break;
        case UPLOAD_ERR_PARTIAL:
            $mensajeError = 'El archivo se subió parcialmente.';
            break;
        case UPLOAD_ERR_NO_FILE:
            $mensajeError = 'No se seleccionó ningún archivo.';
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $mensajeError = 'Falta la carpeta temporal.';
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $mensajeError = 'Error al escribir el archivo en disco.';
            break;
        case UPLOAD_ERR_EXTENSION:
            $mensajeError = 'La subida fue detenida por extensión.';
            break;
        default:
            $mensajeError = 'Error desconocido al subir.';
            break;
    }
    echo json_encode([
        'success' => false,
        'error'   => "Error en la carga: $mensajeError (código $fileError)"
    ]);
    exit;
}

// 4) Validar tipo MIME
$permitidos = ['image/jpeg', 'image/png', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $_FILES['file']['tmp_name']);
finfo_close($finfo);
if (!in_array($mime, $permitidos)) {
    echo json_encode([
        'success' => false,
        'error'   => "Formato no permitido: $mime"
    ]);
    exit;
}

// 5) Preparar nombre único y ruta final
$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
$nombreUnico = uniqid('carousel_') . '.' . $ext;

// Carpeta donde guardar las imágenes en producción:
// asumimos que la carpeta pública es /img/carousel/ en la raíz del proyecto
$carpetaDestino = __DIR__ . '/../img/carousel/';
$rutaArchivo    = $carpetaDestino . $nombreUnico;

// 6) Verificar carpeta destino
if (!is_dir($carpetaDestino)) {
    if (!mkdir($carpetaDestino, 0755, true)) {
        echo json_encode([
            'success' => false,
            'error'   => "La carpeta destino no existe y no pudo crearse: $carpetaDestino"
        ]);
        exit;
    }
}
if (!is_writable($carpetaDestino)) {
    echo json_encode([
        'success' => false,
        'error'   => "Sin permisos para escribir en la carpeta: $carpetaDestino"
    ]);
    exit;
}

// 7) Mover el archivo
if (!move_uploaded_file($_FILES['file']['tmp_name'], $rutaArchivo)) {
    echo json_encode([
        'success' => false,
        'error'   => "No se pudo mover el archivo a destino. Ruta final: $rutaArchivo"
    ]);
    exit;
}

// 8) Insertar registro en la base de datos
try {
    $conexion = obtenerConexion();

    // calcular siguiente display_order
    $sqlMaxOrder = "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_ord FROM carousel_images";
    $res         = $conexion->query($sqlMaxOrder);
    if (!$res) {
        if (file_exists($rutaArchivo)) unlink($rutaArchivo);
        throw new Exception('Error al calcular display_order: ' . $conexion->error);
    }
    $row       = $res->fetch_assoc();
    $nextOrder = (int)$row['next_ord'];

    // insertar
    $sqlInsert = "INSERT INTO carousel_images (filename, caption, display_order) VALUES (?, ?, ?)";
    $stmt      = $conexion->prepare($sqlInsert);
    if (!$stmt) {
        if (file_exists($rutaArchivo)) unlink($rutaArchivo);
        throw new Exception('Error en prepare INSERT: ' . $conexion->error);
    }
    $caption = trim($_POST['caption'] ?? '');
    $stmt->bind_param('ssi', $nombreUnico, $caption, $nextOrder);
    if (!$stmt->execute()) {
        if (file_exists($rutaArchivo)) unlink($rutaArchivo);
        throw new Exception('Error al ejecutar INSERT: ' . $stmt->error);
    }

    $stmt->close();
    $conexion->close();

    echo json_encode([
        'success' => true,
        'message' => 'Imagen subida correctamente'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error'   => 'Error al guardar la imagen: ' . $e->getMessage()
    ]);
}
