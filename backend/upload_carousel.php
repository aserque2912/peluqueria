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

// 4) Validar tipo MIME (opcional, pero recomendado)
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

// Carpeta donde queremos guardar las imágenes: 
//   asumimos que este script está en /peluqueria/backend/upload_carousel.php
//   y las imágenes van a /peluqueria/frontend/img/carousel/
$carpetaDestino = __DIR__ . '/../frontend/img/carousel/';
$rutaArchivo    = $carpetaDestino . $nombreUnico;

// 6) Verificar que la carpeta destino existe y se puede escribir
if (!is_dir($carpetaDestino)) {
    // Intentamos crearla automáticamente (con permisos 0755)
    if (!mkdir($carpetaDestino, 0755, true)) {
        echo json_encode([
            'success' => false,
            'error'   => "La carpeta destino no existe y no pudo crearse: $carpetaDestino"
        ]);
        exit;
    }
}

// Verificar permisos de escritura
if (!is_writable($carpetaDestino)) {
    echo json_encode([
        'success' => false,
        'error'   => "Sin permisos para escribir en la carpeta: $carpetaDestino"
    ]);
    exit;
}

// 7) Mover el archivo temporal a la carpeta destino
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

    // Calculamos el siguiente display_order (máximo + 1)
    $sqlMaxOrder = "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_ord FROM carousel_images";
    $res         = $conexion->query($sqlMaxOrder);
    if (!$res) {
        // Si falla la consulta, borramos el archivo físico y reportamos
        if (file_exists($rutaArchivo)) unlink($rutaArchivo);
        throw new Exception('Error al calcular display_order: ' . $conexion->error);
    }
    $row       = $res->fetch_assoc();
    $nextOrder = (int)$row['next_ord'];

    // Preparamos el INSERT
    $sqlInsert = "INSERT INTO carousel_images (filename, caption, display_order) VALUES (?, ?, ?)";
    $stmt      = $conexion->prepare($sqlInsert);
    if (!$stmt) {
        if (file_exists($rutaArchivo)) unlink($rutaArchivo);
        throw new Exception('Error en prepare INSERT: ' . $conexion->error);
    }

    $caption = trim($_POST['caption'] ?? '');
    $stmt->bind_param('ssi', $nombreUnico, $caption, $nextOrder);
    if (!$stmt->execute()) {
        // Si falla el INSERT, borramos el archivo y reportamos
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
