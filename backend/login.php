<?php
session_start();
include_once("config.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $password = trim($_POST['password']);

    // Validar que el email y la contraseña no estén vacíos
    if (empty($email) || empty($password)) {
        echo "Por favor, completa todos los campos.";
        exit;
    }

    // Validar usuario
    $conexion = obtenerConexion();
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conexion->prepare($sql);

    if ($stmt === false) {
        die("Error en la preparación de la consulta: " . $conexion->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
        if (password_verify($password, $usuario['password'])) {
            // Almacenar información del usuario en la sesión
            $_SESSION['usuario'] = $usuario; // Almacena toda la información del usuario
            header("Location: ../frontend/index.html");
            exit;
        } else {
            echo "Contraseña incorrecta.";
        }
    } else {
        echo "Usuario no encontrado.";
    }
}
?> 