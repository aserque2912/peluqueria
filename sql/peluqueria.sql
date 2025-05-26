-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 26-05-2025 a las 08:18:21
-- Versión del servidor: 8.0.40
-- Versión de PHP: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `peluqueria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int NOT NULL,
  `nombre_cliente` varchar(100) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `servicio` varchar(100) DEFAULT NULL,
  `estado` enum('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  `user_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `nombre_cliente`, `telefono`, `fecha`, `hora`, `servicio`, `estado`, `user_id`) VALUES
(25, 'Adrián', '987654321', '2025-05-13', '17:30:00', 'afeitado', 'pendiente', 1),
(26, 'pepe', '123456789', '2025-05-11', '17:30:00', 'corte', 'pendiente', 2),
(27, 'pepe', '123456789', '2025-05-14', '17:30:00', 'afeitado', 'pendiente', 2),
(28, 'pepe', '123456789', '2025-05-14', '18:00:00', 'barba', 'pendiente', 2),
(29, 'Adrián', '987654321', '2025-05-14', '17:00:00', 'corte', 'pendiente', 1),
(30, 'carlos', '654987321', '2025-05-15', '17:00:00', 'corte', 'pendiente', 3),
(31, 'pepe', '123456789', '2025-05-19', '17:00:00', 'corte', 'pendiente', 2),
(33, 'pepe', '123456789', '2025-05-01', '17:30:00', 'corte', 'pendiente', 2),
(34, 'pepe', '123456789', '2025-05-19', '11:30:00', 'corte', 'pendiente', 2),
(35, 'pepe', '123456789', '2025-05-19', '10:30:00', 'corte', 'pendiente', 2),
(36, 'pepe', '123456789', '2025-05-19', '12:30:00', 'corte', 'pendiente', 2),
(37, 'pepe', '123456789', '2025-05-19', '12:00:00', 'corte', 'pendiente', 2),
(38, 'pepe', '123456789', '2025-05-19', '13:30:00', 'corte', 'pendiente', 2),
(39, 'Jose', '55555555', '2025-05-20', '17:00:00', 'corte', 'pendiente', 4),
(40, 'Jose', '55555555', '2025-05-21', '18:00:00', 'corte', 'pendiente', 4),
(41, 'Jose', '55555555', '2025-05-23', '18:30:00', 'barba', 'pendiente', 4),
(42, 'Jose', '55555555', '2025-05-21', '18:30:00', 'corte', 'pendiente', 4),
(43, 'Jose', '55555555', '2025-05-18', '10:30:00', 'corte', 'pendiente', 4),
(44, 'Adrián', '987654321', '2025-05-20', '11:00:00', 'corte', 'pendiente', 1),
(46, 'Adrián', '987654321', '2025-05-20', '10:00:00', 'corte', 'pendiente', 1),
(47, 'Adrián', '987654321', '2025-05-22', '10:00:00', 'corte', 'pendiente', 1),
(48, 'Adrián', '987654321', '2025-05-25', '10:30:00', 'tinte', 'pendiente', 1),
(49, 'Adrián', '987654321', '2025-05-21', '10:30:00', 'tinte', 'pendiente', 1),
(50, 'pepe', '123456789', '2025-05-28', '17:00:00', 'tinte', 'pendiente', 2),
(51, 'Adrián', '987654321', '2025-05-21', '11:30:00', 'tinte', 'pendiente', 1),
(52, 'Adrián', '987654321', '2025-05-29', '10:30:00', 'tinte', 'pendiente', 1),
(53, 'Adrián', '987654321', '2025-05-21', '13:30:00', 'tinte', 'pendiente', 1),
(54, 'Adrián', '987654321', '2025-05-22', '19:00:00', 'tinte', 'pendiente', 1),
(55, 'Adrián', '987654321', '2025-05-03', '14:30:00', 'tinte', 'pendiente', 1),
(56, 'Adrián', '987654321', '2025-05-21', '10:00:00', 'corte', 'pendiente', 1),
(57, 'Adrián', '987654321', '2025-05-22', '10:30:00', 'corte', 'pendiente', 1),
(58, 'pepe', '123456789', '2025-05-21', '19:30:00', 'corte', 'pendiente', 2),
(59, 'pepe', '123456789', '2025-05-21', '12:00:00', 'corte', 'pendiente', 2),
(60, 'pepe', '123456789', '2025-05-23', '10:00:00', 'corte', 'pendiente', 2),
(61, 'pepe', '123456789', '2025-05-22', '11:00:00', 'corte', 'pendiente', 2),
(62, 'Adrián', '987654321', '2025-05-23', '19:00:00', 'corte', 'pendiente', 1),
(63, 'Adrián', '987654321', '2025-05-23', '10:30:00', 'corte', 'pendiente', 1),
(64, 'Adrián', '987654321', '2025-05-22', '12:00:00', 'corte', 'pendiente', 1),
(66, 'Adrián', '987654321', '2025-05-22', '16:00:00', 'tinte', 'pendiente', 1),
(67, 'Adrián', '987654321', '2025-05-22', '16:30:00', 'tinte', 'pendiente', 1),
(68, 'Adrián', '987654321', '2025-05-22', '14:00:00', 'tinte', 'pendiente', 1),
(69, 'Adrián', '987654321', '2025-05-22', '12:30:00', 'tinte', 'pendiente', 1),
(70, 'Adrián', '987654321', '2025-05-22', '08:00:00', 'tinte', 'pendiente', 1),
(72, 'Adrián', '987654321', '2025-05-22', '11:30:00', 'tinte', 'pendiente', 1),
(74, 'Adrián', '987654321', '2025-05-21', '08:30:00', 'corte', 'pendiente', 1),
(75, 'Adrián', '987654321', '2025-05-21', '08:00:00', 'tinte', 'pendiente', 1),
(81, 'Adrián', '987654321', '2025-05-23', '11:00:00', 'corte', 'pendiente', 1),
(83, 'Adrián', '987654321', '2025-05-23', '20:00:00', 'tinte', 'pendiente', 1),
(84, 'Adrián', '987654321', '2025-05-23', '19:30:00', 'corte', 'pendiente', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `peluqueros`
--

CREATE TABLE `peluqueros` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `disponibilidad` enum('disponible','no disponible') DEFAULT 'disponible',
  `fecha_ingreso` date DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('cliente','administrador') NOT NULL DEFAULT 'cliente',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `telefono`, `password`, `rol`, `fecha_registro`) VALUES
(1, 'Adrián', 'adriantecn789@gmail.com', '987654321', '$2y$10$BxQk4y8dzbwp0kFAqQMtXOJ/mbLj3doLmZNuBKnfsIXrZQEX121qO', 'administrador', '2025-04-08 09:15:11'),
(2, 'pepe', 'pepe@gmail.com', '123456789', '$2y$10$TFVFUHHLTtMNMg5O8s6dru2pvJW7G5FnJvPHkDSTzg9lYFsP35uXa', 'cliente', '2025-04-08 09:17:08'),
(3, 'carlos', 'carlos@gmail.com', '654987321', '$2y$10$z9NIXmsymwffQW3Gg/UWTOiptF1RI7i7bu3W7L0fGqmoRuQHnggwO', 'cliente', '2025-04-08 09:41:43'),
(4, 'Jose', 'jose@gmail.com', '55555555', '$2y$10$KzTgQPicrRIW1BRXVP7TGOsdsaN5IoAY1h4jW5Mkf3QOcJNzUz6ja', 'cliente', '2025-04-08 10:40:50'),
(5, 'Roberto', 'roberto@gmail.com', '885522113', '$2y$10$I2h3wtY8KcALKYvQOMlMseQ0vpOQcE.0MjqkHr8qTQzYEtCoOP.uS', 'cliente', '2025-04-09 10:33:44'),
(6, 'Luis', 'luis@gmail.com', '856474312', '$2y$10$OHYJedImANNPSWfE/SpfNOEzMeC0VkBZW2qcEFo.z2HTIBj0i.wRO', 'cliente', '2025-04-23 12:24:31'),
(7, 'Ana', 'ana@gmail.com', '647327831', '$2y$10$h5iNXGntb3OwW5sYsM444ekZg38qemG85j0V2J8bXmfsuc/wVXjxm', 'cliente', '2025-04-23 13:08:00'),
(8, 'almudena', 'almudena@gmail.com', '5646464646', '$2y$10$fNvpVGvRVvnHp6FxdFXlOOCd397wPAhZ0W0AuF1/kbV54LFNWoC9K', 'cliente', '2025-05-13 07:51:34'),
(9, 'Manolito Pérez', 'erjohann@hotmail.es', '667575576', '$2y$10$vSg4AWcRtXAwnB6xiIYnjurKO5KzojGdtFtBu4CUknvScyY0G5K/O', 'cliente', '2025-05-21 16:32:25');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- Indices de la tabla `peluqueros`
--
ALTER TABLE `peluqueros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT de la tabla `peluqueros`
--
ALTER TABLE `peluqueros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
