# 1. Parte base: PHP + Apache
FROM php:8.1-apache

# 2. Extensiones de MySQL que usas
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 3. Copia tu carpeta de frontend al DocumentRoot
COPY frontend/ /var/www/html/

# 4. (Opcional) Si tienes scripts PHP aparte, cópialos en una subcarpeta:
#    COPY backend/ /var/www/html/backend/

# 5. Configura Apache para que busque landing.html primero
RUN echo "DirectoryIndex landing.html index.html" \
  >> /etc/apache2/apache2.conf

# 6. Asegúrate de que los permisos están bien
RUN chown -R www-data:www-data /var/www/html

# 7. Expone el puerto 80
EXPOSE 80

# 8. Arranca Apache en primer plano
CMD ["apache2-foreground"]
