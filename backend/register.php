<?php
session_start();
include_once("config.php");

// Verificar si se ha enviado el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre']);
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $telefono = trim($_POST['telefono']);
    $password = password_hash(trim($_POST['password']), PASSWORD_DEFAULT);

    // Validar que los campos no estén vacíos
    if (empty($nombre) || empty($email) || empty($telefono) || empty($password)) {
        echo "Por favor, completa todos los campos.";
        exit;
    }

    // Comprobar si el email ya está registrado
    $conexion = obtenerConexion();
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "El correo electrónico ya está registrado.";
    } else {
        // Insertar nuevo usuario
        $sql = "INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES (?, ?, ?, ?, 'cliente')";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ssss", $nombre, $email, $telefono, $password);
        if ($stmt->execute()) {
            // Redirigir a la página de inicio de sesión
            header("Location: ../frontend/login.html");
            exit; // Asegúrate de salir después de la redirección
        } else {
            echo "Error al registrar el usuario: " . $stmt->error;
        }
    }
}
?>