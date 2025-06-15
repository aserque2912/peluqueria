# Dockerfile

# 1) Partimos de la imagen oficial de PHP + Apache
FROM php:8.2-apache

# 2) Configuramos zona horaria
ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
 && echo $TZ > /etc/timezone

# 3) Instala dependencias del sistema y extensiones PHP
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libzip-dev zip \
 && docker-php-ext-install \
      mysqli \
      pdo_mysql \
      zip \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# 4) Habilita mod_rewrite de Apache
RUN a2enmod rewrite

# 5) Copia tu frontend y backend dentro del webroot
COPY frontend/ /var/www/html/
COPY backend/  /var/www/html/backend/

# 6) Ajusta permisos y define el directorio de trabajo
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 /var/www/html

# 7) Prioriza landing.html como página de inicio
RUN echo "DirectoryIndex landing.html index.html" \
    >> /etc/apache2/apache2.conf

# 8) Expone el puerto 80 y arranca Apache
EXPOSE 80
CMD ["apache2-foreground"]
