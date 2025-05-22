<?php
session_start();

// Verifica si la sesión está activa
if (isset($_SESSION['usuario'])) {
    echo json_encode(['loggedIn' => true, 'usuario' => $_SESSION['usuario']]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
