<?php
session_start();
include_once("config.php");

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'administrador') {
    header("Location: ../frontend/login.html");
    exit;
}

// Código para mostrar y gestionar citash
?> 