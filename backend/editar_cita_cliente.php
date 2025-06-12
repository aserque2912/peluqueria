<?php
// <<< NO HAY NADA DE NADA ANTES DEL <?php

// Desactivar mensajes de warning/notices para no romper el JSON
ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
session_start();

include_once __DIR__ . '/config.php';

$conexion = obtenerConexion();

// Recogemos los datos vía POST (form-data)
$id_cita    = $_POST['id']       ?? null;
$fecha      = $_POST['fecha']    ?? null;
$hora       = $_POST['hora']     ?? null;
$servicio   = $_POST['servicio'] ?? null;
$usuario_id = $_SESSION['usuario']['id']   ?? null;
$rol        = $_SESSION['usuario']['rol']  ?? null;

// 1) Validaciones básicas
if (
    !$id_cita ||
    !$fecha   ||
    !$hora    ||
    !$servicio||
    !$usuario_id 
) {
    echo json_encode([
        'success' => false,
        'message' => 'Acceso denegado o datos incompletos'
    ]);
    exit;
}

// 2) Comprobar que la cita existe y pertenece a este cliente
$stmtChk = $conexion->prepare("SELECT user_id FROM citas WHERE id = ?");
$stmtChk->bind_param('i', $id_cita);
$stmtChk->execute();
$resChk = $stmtChk->get_result();
if ($resChk->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Cita no encontrada']);
    exit;
}
$row = $resChk->fetch_assoc();
if ($row['user_id'] != $usuario_id) {
    echo json_encode(['success' => false, 'message' => 'No puedes editar esta cita']);
    exit;
}
$stmtChk->close();

// 3) Hacer el UPDATE forzando estado = 'pendiente'
$sql = "
    UPDATE citas
       SET fecha    = ?,
           hora     = ?,
           servicio = ?,
           estado   = 'pendiente'
     WHERE id       = ?
       AND user_id = ?
";
$stmtUpd = $conexion->prepare($sql);
$stmtUpd->bind_param('sssii', $fecha, $hora, $servicio, $id_cita, $usuario_id);

if ($stmtUpd->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar la cita: ' . $stmtUpd->error
    ]);
}

$stmtUpd->close();
$conexion->close();
