// admin_carousel.js

document.addEventListener('DOMContentLoaded', () => {
    const formUpload = document.getElementById('formUpload');
    const tableBody = document.querySelector('#tableCarousel tbody');

    // 1) Función para cargar todas las imágenes y mostrarlas en la tabla
    function loadCarouselImages() {
        fetch('../backend/get_carousel.php')
            .then(res => res.json())
            .then(resp => {
                if (!resp.success) {
                    console.error('Error al listar imágenes del carrusel:', resp.error);
                    return;
                }
                const imgs = resp.data;
                tableBody.innerHTML = '';

                if (imgs.length === 0) {
                    tableBody.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-muted">No hay imágenes en el carrusel.</td>
            </tr>`;
                    return;
                }

                imgs.forEach((img, index) => {
                    const tr = document.createElement('tr');

                    // 1. Vista previa (thumbnail)
                    const tdThumb = document.createElement('td');
                    const imgTag = document.createElement('img');
                    // Construimos la URL absoluta a la carpeta img/carousel/
                    const baseURL = `${window.location.origin}/${window.location.pathname.split('/')[1]}/frontend`;
                    imgTag.src = `${baseURL}/img/carousel/${img.filename}`;
                    imgTag.alt = img.caption || '';
                    imgTag.classList.add('thumb');
                    tdThumb.appendChild(imgTag);
                    tr.appendChild(tdThumb);

                    // 2. Caption
                    const tdCaption = document.createElement('td');
                    tdCaption.textContent = img.caption || '-';
                    tr.appendChild(tdCaption);

                    // 3. Orden
                    const tdOrder = document.createElement('td');
                    tdOrder.textContent = img.display_order;
                    tr.appendChild(tdOrder);

                    // 4. Acciones (subir, bajar, eliminar)
                    const tdAcciones = document.createElement('td');

                    // --- Botón "Subir" (▲) ---
                    const btnUp = document.createElement('button');
                    btnUp.classList.add('btn', 'btn-sm', 'btn-secondary', 'me-1');
                    btnUp.innerHTML = '&#9650;'; // flecha hacia arriba
                    btnUp.title = 'Subir posición';
                    // Si es la primera fila, deshabilitamos
                    btnUp.disabled = (index === 0);
                    btnUp.dataset.id = img.id;
                    tdAcciones.appendChild(btnUp);
                    btnUp.addEventListener('click', () => {
                        reorderImage(img.id, 'up');
                    });

                    // --- Botón "Bajar" (▼) ---
                    const btnDown = document.createElement('button');
                    btnDown.classList.add('btn', 'btn-sm', 'btn-secondary', 'me-1');
                    btnDown.innerHTML = '&#9660;'; // flecha hacia abajo
                    btnDown.title = 'Bajar posición';
                    // Si es la última fila, deshabilitamos
                    btnDown.disabled = (index === imgs.length - 1);
                    btnDown.dataset.id = img.id;
                    tdAcciones.appendChild(btnDown);
                    btnDown.addEventListener('click', () => {
                        reorderImage(img.id, 'down');
                    });

                    // --- Botón "Eliminar" con icono de FontAwesome igual que en el resto del proyecto ---
                    const btnDelete = document.createElement('button');
                    btnDelete.classList.add('btn', 'btn-sm', 'btn-danger');
                    // Aquí usamos la misma clase que aparece en el resto del proyecto:
                    btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    btnDelete.title = 'Eliminar imagen';
                    btnDelete.dataset.id = img.id;
                    tdAcciones.appendChild(btnDelete);
                    btnDelete.addEventListener('click', () => {
                        Swal.fire({
                            title: '¿Eliminar esta imagen?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar'
                        }).then(result => {
                            if (result.isConfirmed) {
                                deleteImage(img.id);
                            }
                        });
                    });

                    tr.appendChild(tdAcciones);
                    tableBody.appendChild(tr);
                });
            })
            .catch(err => {
                console.error('Error en loadCarouselImages():', err);
            });
    }

    // 2) Función para subir una nueva imagen (idéntica a la que ya tenías)
    formUpload.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(formUpload);

        fetch('../backend/upload_carousel.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Imagen subida',
                        text: resp.message || 'La imagen se ha subido correctamente.',
                        confirmButtonColor: '#3085d6'
                    });
                    formUpload.reset();
                    loadCarouselImages(); // Recargar tabla tras subir
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al subir',
                        text: resp.error || 'Ocurrió un error al subir la imagen.',
                        confirmButtonColor: '#d33'
                    });
                }
            })
            .catch(err => {
                console.error('Error en upload:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'No se pudo comunicar con el servidor.',
                    confirmButtonColor: '#d33'
                });
            });
    });

    // 3) Función para borrar una imagen por su ID (idéntica a la que ya tenías)
    function deleteImage(id) {
        fetch('../backend/delete_carousel.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminada',
                        text: resp.message || 'Imagen eliminada correctamente.',
                        confirmButtonColor: '#3085d6'
                    });
                    loadCarouselImages(); // Recargar tabla tras eliminar
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al eliminar',
                        text: resp.error || 'No se pudo eliminar la imagen.',
                        confirmButtonColor: '#d33'
                    });
                }
            })
            .catch(err => {
                console.error('Error en deleteImage():', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'No se pudo comunicar con el servidor.',
                    confirmButtonColor: '#d33'
                });
            });
    }

    // 4) Función para reordenar la imagen (subir o bajar)
    function reorderImage(id, direction) {
        fetch('../backend/update_carousel_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, direction })
            })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    loadCarouselImages(); // Recargar tabla tras reordenar
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al reordenar',
                        text: resp.error || 'No se pudo cambiar el orden.',
                        confirmButtonColor: '#d33'
                    });
                }
            })
            .catch(err => {
                console.error('Error en reorderImage():', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'No se pudo comunicar con el servidor.',
                    confirmButtonColor: '#d33'
                });
            });
    }

    // 5) Al cargar la página, traemos las imágenes existentes
    loadCarouselImages();
});