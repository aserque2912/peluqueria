<?php
// backend/config.php

// Reportar sólo errores fatales (en producción)
error_reporting(E_ERROR);
mysqli_report(MYSQLI_REPORT_OFF);

/**
 * Obtiene una conexión a la base de datos MySQL usando las vars de entorno de Railway.
 * Lanza un error HTTP 500 y detiene el script si falta alguna var o la conexión falla.
 *
 * @return mysqli
 */
function obtenerConexion() {
    // 1) Leer vars de entorno (Railway / Docker inyectan estas)
    $dbHost = getenv('MYSQLHOST')     ?: getenv('MYSQL_HOST');
    $dbName = getenv('MYSQLDATABASE') ?: getenv('MYSQL_DATABASE');
    $dbUser = getenv('MYSQLUSER')     ?: getenv('MYSQL_USER');
    $dbPass = getenv('MYSQLPASSWORD') ?: getenv('MYSQL_PASSWORD');
    $dbPort = getenv('MYSQLPORT')     ?: getenv('MYSQL_PORT') ?: 3306;

    // 2) Validar
    if (!$dbHost || !$dbName || !$dbUser || $dbPass === false) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
          'success' => false,
          'message' => 'Faltan variables de entorno de la DB',
          'debug' => [
            'MYSQL_HOST'     => $dbHost,
            'MYSQL_DATABASE' => $dbName,
            'MYSQL_USER'     => $dbUser,
            'MYSQL_PASSWORD' => $dbPass,
            'MYSQL_PORT'     => $dbPort,
          ],
        ]);
        exit;
    }

    // 3) Conectar
    $mysqli = new mysqli($dbHost, $dbUser, $dbPass, $dbName, (int)$dbPort);
    if ($mysqli->connect_errno) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
          'success' => false,
          'message' => "Error de conexión ({$mysqli->connect_errno}): {$mysqli->connect_error}"
        ]);
        exit;
    }

    // 4) Asegurar UTF-8
    $mysqli->set_charset('utf8');
    return $mysqli;
}
