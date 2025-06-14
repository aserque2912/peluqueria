-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 13-06-2025 a las 14:32:08
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
-- Estructura de tabla para la tabla `carousel_images`
--

CREATE TABLE `carousel_images` (
  `id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `carousel_images`
--

INSERT INTO `carousel_images` (`id`, `filename`, `caption`, `display_order`, `uploaded_at`) VALUES
(4, 'carousel_6842e9742e84e.jpg', '', 1, '2025-06-06 13:13:24'),
(5, 'carousel_6842e97b36e6e.jpg', '', 3, '2025-06-06 13:13:31'),
(6, 'carousel_6842e9831853e.jpg', '', 5, '2025-06-06 13:13:39'),
(7, 'carousel_6842e98eb1dae.jpg', '', 4, '2025-06-06 13:13:50'),
(9, 'carousel_6846db5a525bd.jpg', 'niño choca mano', 6, '2025-06-09 13:02:18');

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
(26, 'pepe', '123456789', '2025-05-11', '17:30:00', 'corte', 'pendiente', 2),
(27, 'pepe', '123456789', '2025-05-14', '17:30:00', 'afeitado', 'pendiente', 2),
(28, 'pepe', '123456789', '2025-05-14', '18:00:00', 'barba', 'pendiente', 2),
(30, 'carlos', '654987321', '2025-05-15', '17:00:00', 'corte', 'pendiente', 3),
(31, 'pepe', '123456789', '2025-05-19', '17:00:00', 'corte', 'pendiente', 2),
(33, 'pepe', '123456789', '2025-05-01', '17:30:00', 'corte', 'pendiente', 2),
(34, 'pepe', '123456789', '2025-05-19', '11:30:00', 'corte', 'pendiente', 2),
(35, 'pepe', '123456789', '2025-05-19', '10:30:00', 'corte', 'pendiente', 2),
(36, 'pepe', '123456789', '2025-05-19', '12:30:00', 'corte', 'pendiente', 2),
(37, 'pepe', '123456789', '2025-05-19', '12:00:00', 'corte', 'pendiente', 2),
(38, 'pepe', '123456789', '2025-05-19', '13:30:00', 'corte', 'pendiente', 2),
(46, 'Adrián', '987654321', '2025-05-20', '10:00:00', 'corte', 'pendiente', 1),
(47, 'Adrián', '987654321', '2025-05-22', '10:00:00', 'corte', 'pendiente', 1),
(49, 'Adrián', '987654321', '2025-05-21', '10:30:00', 'tinte', 'pendiente', 1),
(51, 'Adrián', '987654321', '2025-05-21', '11:30:00', 'tinte', 'pendiente', 1),
(53, 'Adrián', '987654321', '2025-05-21', '13:30:00', 'tinte', 'pendiente', 1),
(55, 'Adrián', '987654321', '2025-05-03', '14:30:00', 'tinte', 'pendiente', 1),
(56, 'Adrián', '987654321', '2025-05-21', '10:00:00', 'corte', 'pendiente', 1),
(57, 'Adrián', '987654321', '2025-05-22', '10:30:00', 'corte', 'pendiente', 1),
(58, 'pepe', '123456789', '2025-05-21', '19:30:00', 'corte', 'pendiente', 2),
(59, 'pepe', '123456789', '2025-05-21', '12:00:00', 'corte', 'pendiente', 2),
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
(99, 'Adrián', '987654321', '2025-06-01', '16:00:00', 'corte', 'cancelada', 1),
(101, 'Ruben', '693938197', '2025-06-05', '20:00:00', 'corte', 'cancelada', 10),
(110, 'Adrián', '', '2025-06-02', '19:30:00', 'corte', 'confirmada', 1),
(113, 'Adrián', '', '2025-06-04', '16:00:00', 'tinte', 'pendiente', 1),
(115, 'Adrián', '', '2025-06-04', '08:00:00', 'barba', 'pendiente', 1),
(116, 'Adrián', '', '2025-06-04', '19:30:00', 'corte', 'pendiente', 1),
(117, 'Adrián', '', '2025-06-12', '10:00:00', 'Tinte', 'cancelada', 1),
(118, 'Adrián', '', '2025-06-04', '16:30:00', 'Tinte', 'pendiente', 1),
(120, 'Adrián', '', '2025-06-06', '17:30:00', 'corte', 'pendiente', 1),
(121, 'Adrián', '', '2025-06-06', '18:30:00', 'corte', 'pendiente', 1),
(122, 'Adrián', '', '2025-06-06', '14:30:00', 'corte', 'pendiente', 1),
(123, 'Adrián', '', '2025-06-07', '08:30:00', 'corte', 'pendiente', 1),
(124, 'Adrián', '', '2025-06-06', '19:30:00', 'corte', 'pendiente', 1),
(125, 'Adrián', '', '2025-06-20', '08:30:00', 'corte', 'pendiente', 1),
(126, 'Adrián', '', '2025-06-20', '19:30:00', 'corte', 'pendiente', 1),
(127, 'Adrián', '', '2025-06-12', '09:30:00', 'corte', 'pendiente', 1),
(128, 'Adrián', '', '2025-06-15', '09:00:00', 'corte', 'pendiente', 1),
(129, 'Adrián', '', '2025-06-07', '10:30:00', 'corte', 'pendiente', 1),
(130, 'Adrián', '', '2025-06-06', '19:00:00', 'corte', 'pendiente', 1),
(131, 'Adrián', '', '2025-06-22', '10:30:00', 'corte', 'pendiente', 1),
(132, 'Adrián', '', '2025-06-07', '10:00:00', 'corte', 'pendiente', 1),
(133, 'Adrián', '', '2025-06-07', '19:00:00', 'corte', 'pendiente', 1),
(134, 'Adrián', '', '2025-06-13', '19:30:00', 'corte', 'pendiente', 1),
(135, 'Adrián', '', '2025-06-29', '15:00:00', 'barba', 'confirmada', 1),
(136, 'Adrián', '', '2025-06-26', '16:00:00', 'corte', 'pendiente', 1),
(137, 'Adrián', '', '2025-06-08', '09:00:00', 'corte', 'pendiente', 1),
(138, 'pepe', '', '2025-06-20', '10:30:00', 'Tinte', 'pendiente', 2),
(139, 'noelia', '', '2025-06-20', '20:00:00', 'corte', 'pendiente', 15),
(141, 'Adrián', '', '2025-06-12', '19:30:00', 'corte', 'pendiente', 1),
(142, 'Adrián', '', '2025-06-12', '20:00:00', 'corte', 'pendiente', 1),
(143, 'Adrián', '', '2025-06-13', '20:00:00', 'corte', 'pendiente', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horas_bloqueadas`
--

CREATE TABLE `horas_bloqueadas` (
  `id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `horas_bloqueadas`
--

INSERT INTO `horas_bloqueadas` (`id`, `fecha`, `hora`, `motivo`, `created_at`) VALUES
(3, '2025-09-25', '10:00:00', '', '2025-05-30 11:02:44'),
(4, '2025-09-25', '09:00:00', '', '2025-05-30 11:02:44'),
(6, '2025-09-25', '09:30:00', '', '2025-05-30 11:02:44'),
(7, '2025-09-25', '11:00:00', '', '2025-05-30 11:02:44'),
(8, '2025-09-25', '11:30:00', '', '2025-05-30 11:02:44'),
(9, '2025-09-25', '12:00:00', '', '2025-05-30 11:02:44'),
(10, '2025-09-25', '12:30:00', '', '2025-05-30 11:02:44'),
(11, '2025-09-25', '13:00:00', '', '2025-05-30 11:02:44'),
(12, '2025-09-25', '13:30:00', '', '2025-05-30 11:02:44'),
(13, '2025-09-25', '14:00:00', '', '2025-05-30 11:02:44'),
(14, '2025-09-25', '14:30:00', '', '2025-05-30 11:02:44'),
(15, '2025-09-25', '15:00:00', '', '2025-05-30 11:02:44'),
(16, '2025-09-25', '15:30:00', '', '2025-05-30 11:02:44'),
(17, '2025-09-25', '16:00:00', '', '2025-05-30 11:02:44'),
(18, '2025-09-25', '16:30:00', '', '2025-05-30 11:02:44'),
(19, '2025-09-25', '17:00:00', '', '2025-05-30 11:02:44'),
(20, '2025-09-25', '17:30:00', '', '2025-05-30 11:02:44'),
(21, '2025-09-25', '18:00:00', '', '2025-05-30 11:02:45'),
(22, '2025-09-25', '18:30:00', '', '2025-05-30 11:02:45'),
(23, '2025-09-25', '19:00:00', '', '2025-05-30 11:02:45'),
(24, '2025-09-25', '19:30:00', '', '2025-05-30 11:02:45'),
(25, '2025-09-25', '20:00:00', '', '2025-05-30 11:02:45'),
(92, '2025-05-31', '09:30:00', '', '2025-05-30 12:19:40'),
(97, '2025-05-31', '12:00:00', '', '2025-05-30 12:19:40'),
(98, '2025-05-31', '12:30:00', '', '2025-05-30 12:19:40'),
(99, '2025-05-31', '13:00:00', '', '2025-05-30 12:19:40'),
(100, '2025-05-31', '13:30:00', '', '2025-05-30 12:19:40'),
(101, '2025-05-31', '14:00:00', '', '2025-05-30 12:19:40'),
(102, '2025-05-31', '14:30:00', '', '2025-05-30 12:19:41'),
(103, '2025-05-31', '15:00:00', '', '2025-05-30 12:19:41'),
(104, '2025-05-31', '15:30:00', '', '2025-05-30 12:19:41'),
(105, '2025-05-31', '16:00:00', '', '2025-05-30 12:19:41'),
(106, '2025-05-31', '16:30:00', '', '2025-05-30 12:19:41'),
(107, '2025-05-31', '17:00:00', '', '2025-05-30 12:19:41'),
(108, '2025-05-31', '17:30:00', '', '2025-05-30 12:19:41'),
(110, '2025-05-31', '18:30:00', '', '2025-05-30 12:19:41'),
(111, '2025-05-31', '19:00:00', '', '2025-05-30 12:19:41'),
(112, '2025-05-31', '19:30:00', '', '2025-05-30 12:19:41'),
(113, '2025-05-31', '20:00:00', '', '2025-05-30 12:19:41'),
(114, '2025-06-01', '08:00:00', '', '2025-05-30 12:19:47'),
(115, '2025-06-01', '08:30:00', '', '2025-05-30 12:19:47'),
(116, '2025-06-01', '09:00:00', '', '2025-05-30 12:19:47'),
(117, '2025-06-01', '09:30:00', '', '2025-05-30 12:19:47'),
(118, '2025-06-01', '10:00:00', '', '2025-05-30 12:19:47'),
(119, '2025-06-01', '10:30:00', '', '2025-05-30 12:19:47'),
(120, '2025-06-01', '11:00:00', '', '2025-05-30 12:19:47'),
(121, '2025-06-01', '11:30:00', '', '2025-05-30 12:19:47'),
(122, '2025-06-01', '12:00:00', '', '2025-05-30 12:19:47'),
(123, '2025-06-01', '12:30:00', '', '2025-05-30 12:19:47'),
(124, '2025-06-01', '13:00:00', '', '2025-05-30 12:19:47'),
(125, '2025-06-01', '13:30:00', '', '2025-05-30 12:19:47'),
(126, '2025-06-01', '14:00:00', '', '2025-05-30 12:19:47'),
(127, '2025-06-01', '14:30:00', '', '2025-05-30 12:19:47'),
(128, '2025-06-01', '15:00:00', '', '2025-05-30 12:19:47'),
(129, '2025-06-01', '15:30:00', '', '2025-05-30 12:19:47'),
(130, '2025-06-01', '16:00:00', '', '2025-05-30 12:19:47'),
(131, '2025-06-01', '16:30:00', '', '2025-05-30 12:19:47'),
(132, '2025-06-01', '17:00:00', '', '2025-05-30 12:19:47'),
(133, '2025-06-01', '17:30:00', '', '2025-05-30 12:19:47'),
(134, '2025-06-01', '18:00:00', '', '2025-05-30 12:19:47'),
(135, '2025-06-01', '18:30:00', '', '2025-05-30 12:19:47'),
(136, '2025-06-01', '19:00:00', '', '2025-05-30 12:19:48'),
(137, '2025-06-01', '19:30:00', '', '2025-05-30 12:19:48'),
(138, '2025-06-01', '20:00:00', '', '2025-05-30 12:19:48'),
(164, '2025-06-08', '17:30:00', '', '2025-05-30 12:26:32'),
(165, '2025-06-04', '12:00:00', 'Médico', '2025-05-30 13:26:06'),
(167, '2025-06-04', '14:30:00', 'Médico', '2025-05-30 13:26:06'),
(168, '2025-06-04', '14:00:00', 'Médico', '2025-05-30 13:26:07'),
(169, '2025-06-04', '12:30:00', 'Médico', '2025-05-30 13:26:07'),
(170, '2025-06-04', '13:30:00', 'Médico', '2025-05-30 13:26:07'),
(171, '2025-06-04', '15:00:00', 'Médico', '2025-05-30 13:26:07'),
(202, '2025-06-04', '11:30:00', 'porque si', '2025-06-03 06:07:47'),
(203, '2025-06-04', '13:00:00', 'porque si', '2025-06-03 06:07:47'),
(229, '2025-06-07', '20:00:00', 'médico', '2025-06-03 08:01:11'),
(230, '2025-06-05', '08:00:00', '', '2025-06-12 10:38:43'),
(231, '2025-06-05', '08:30:00', '', '2025-06-12 10:38:43'),
(232, '2025-06-05', '09:00:00', '', '2025-06-12 10:38:43'),
(233, '2025-06-05', '09:30:00', '', '2025-06-12 10:38:43'),
(234, '2025-06-05', '10:00:00', '', '2025-06-12 10:38:43'),
(235, '2025-06-05', '10:30:00', '', '2025-06-12 10:38:43'),
(236, '2025-06-05', '11:00:00', '', '2025-06-12 10:38:43'),
(237, '2025-06-05', '11:30:00', '', '2025-06-12 10:38:43'),
(238, '2025-06-05', '12:00:00', '', '2025-06-12 10:38:43'),
(239, '2025-06-05', '12:30:00', '', '2025-06-12 10:38:43'),
(240, '2025-06-05', '13:00:00', '', '2025-06-12 10:38:43'),
(241, '2025-06-05', '13:30:00', '', '2025-06-12 10:38:43'),
(242, '2025-06-05', '14:00:00', '', '2025-06-12 10:38:43'),
(243, '2025-06-05', '14:30:00', '', '2025-06-12 10:38:43'),
(244, '2025-06-05', '15:00:00', '', '2025-06-12 10:38:44'),
(245, '2025-06-05', '15:30:00', '', '2025-06-12 10:38:44'),
(246, '2025-06-05', '16:00:00', '', '2025-06-12 10:38:44'),
(247, '2025-06-05', '16:30:00', '', '2025-06-12 10:38:44'),
(248, '2025-06-05', '17:00:00', '', '2025-06-12 10:38:44'),
(249, '2025-06-05', '17:30:00', '', '2025-06-12 10:38:44'),
(250, '2025-06-05', '18:00:00', '', '2025-06-12 10:38:44'),
(251, '2025-06-05', '18:30:00', '', '2025-06-12 10:38:44'),
(252, '2025-06-05', '19:00:00', '', '2025-06-12 10:38:44'),
(253, '2025-06-05', '19:30:00', '', '2025-06-12 10:38:44'),
(254, '2025-06-05', '20:00:00', '', '2025-06-12 10:38:44'),
(255, '2025-06-12', '13:00:00', '', '2025-06-12 10:45:02'),
(256, '2025-06-12', '13:30:00', '', '2025-06-12 10:45:16'),
(257, '2025-06-12', '14:00:00', '', '2025-06-12 10:45:16'),
(258, '2025-06-12', '14:30:00', '', '2025-06-12 10:45:16'),
(259, '2025-06-12', '15:00:00', '', '2025-06-12 10:45:16'),
(285, '2025-06-12', '18:30:00', '', '2025-06-12 15:19:03');

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
(1, 'Adrián', 'adriantecn789@gmail.com', '111111111', '$2y$10$BxQk4y8dzbwp0kFAqQMtXOJ/mbLj3doLmZNuBKnfsIXrZQEX121qO', 'administrador', '2025-04-08 09:15:11'),
(2, 'pepe', 'pepe@gmail.com', '123456789', '$2y$10$TFVFUHHLTtMNMg5O8s6dru2pvJW7G5FnJvPHkDSTzg9lYFsP35uXa', 'cliente', '2025-04-08 09:17:08'),
(3, 'carlos', 'carlos@gmail.com', '654987321', '$2y$10$z9NIXmsymwffQW3Gg/UWTOiptF1RI7i7bu3W7L0fGqmoRuQHnggwO', 'administrador', '2025-04-08 09:41:43'),
(10, 'Ruben', 'ruben@gmail.com', '693938197', '$2y$10$yXhbcxheAwe2mEtuDU6jze55hpSJrQ3nzz95.4L7sboiy5NfxFJya', 'administrador', '2025-05-30 16:24:37'),
(13, 'Eugenia', 'eugenia@gmail.com', '888888888', '$2y$10$leN7lROs5uMP0eLQL/XSleZ0tfmd7Jm16CexJgkDaHosEAn19dGxu', 'cliente', '2025-06-02 11:18:44'),
(14, 'Godofredo', 'godofredo@gmail.com', '321654987', '$2y$10$5igiMj133muVBnzQv.LbJOb4ZGFALIMa43g3a4fXOqc1Y4Nau/FHu', 'cliente', '2025-06-02 12:26:38'),
(15, 'noelia', 'noelia@gmail.com', '123465789', '$2y$10$kyewpp/dWRYsRgU9Wb/2guzW/gzexFNMui/L.vFGCJoKEWykJEP8G', 'administrador', '2025-06-12 14:25:18');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carousel_images`
--
ALTER TABLE `carousel_images`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- Indices de la tabla `horas_bloqueadas`
--
ALTER TABLE `horas_bloqueadas`
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
-- AUTO_INCREMENT de la tabla `carousel_images`
--
ALTER TABLE `carousel_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT de la tabla `horas_bloqueadas`
--
ALTER TABLE `horas_bloqueadas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=286;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
