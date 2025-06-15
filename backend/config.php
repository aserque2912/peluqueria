<?php
// Fuerza JSON y UTF-8 en las respuestas
header('Content-Type: application/json; charset=utf-8');

// 1) Leer vars de entorno (Railway inyecta estas)
$dbHost = getenv('MYSQLHOST')    ?: getenv('MYSQL_HOST')    ?: null;
$dbName = getenv('MYSQLDATABASE')?: getenv('MYSQL_DATABASE')?: null;
$dbUser = getenv('MYSQLUSER')    ?: getenv('MYSQL_USER')    ?: null;
$dbPass = getenv('MYSQLPASSWORD')?: getenv('MYSQL_PASSWORD')?: null;
$dbPort = getenv('MYSQLPORT')    ?: getenv('MYSQL_PORT')    ?: 3306;

// 2) Verificar que todas existan
if (!$dbHost || !$dbName || !$dbUser || $dbPass===false) {
    echo json_encode([
      'success' => false,
      'message' => 'Faltan vars de entorno de la DB',
      'debug' => [
        'dbHost' => $dbHost,
        'dbName' => $dbName,
        'dbUser' => $dbUser,
        'dbPass' => $dbPass,
        'dbPort' => $dbPort,
      ]
    ]);
    exit;
}

// 3) Conectar
$mysqli = @new mysqli($dbHost, $dbUser, $dbPass, $dbName, (int)$dbPort);
if ($mysqli->connect_errno) {
    echo json_encode([
      'success' => false,
      'message' => "Error de conexión ({$mysqli->connect_errno}): {$mysqli->connect_error}"
    ]);
    exit;
}

// 4) Ok
echo json_encode([
  'success' => true,
  'message' => "¡Conexión a {$dbName}@{$dbHost}:{$dbPort} exitosa!"
]);
exit;
