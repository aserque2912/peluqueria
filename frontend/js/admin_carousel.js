// admin_carousel.js

document.addEventListener('DOMContentLoaded', () => {
  const formUpload    = document.getElementById('formUpload');
  const tableBody     = document.querySelector('#tableCarousel tbody');

  // **AJUSTA ESTOS DOS PATHS** según tu despliegue:
  // Ruta absoluta al directorio backend (sin slash final)
  const BACKEND_URL       = `${window.location.origin}/backend`;
  // Ruta pública a la carpeta de imágenes del carrusel (sin slash final)
  const CAROUSEL_IMG_PATH = `${window.location.origin}/img/carousel`;

  // 1) Carga y muestra todas las imágenes en la tabla
  function loadCarouselImages() {
    fetch(`${BACKEND_URL}/get_carousel.php`)
      .then(res => res.json())
      .then(resp => {
        if (!resp.success) {
          console.error('Error al listar imágenes del carrusel:', resp.error);
          tableBody.innerHTML = `
            <tr><td colspan="4" class="text-center text-danger">
              Error cargando imágenes
            </td></tr>`;
          return;
        }

        const imgs = resp.data;
        tableBody.innerHTML = '';

        if (!Array.isArray(imgs) || imgs.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-muted">
                No hay imágenes en el carrusel.
              </td>
            </tr>`;
          return;
        }

        imgs.forEach((img, index) => {
          const tr = document.createElement('tr');

          // 1️⃣ Vista previa
          const tdThumb = document.createElement('td');
          const imgTag  = document.createElement('img');
          imgTag.src    = `${CAROUSEL_IMG_PATH}/${img.filename}`;
          imgTag.alt    = img.caption || '';
          imgTag.classList.add('thumb');
          tdThumb.appendChild(imgTag);
          tr.appendChild(tdThumb);

          // 2️⃣ Caption
          const tdCap = document.createElement('td');
          tdCap.textContent = img.caption || '-';
          tr.appendChild(tdCap);

          // 3️⃣ Orden
          const tdOrd = document.createElement('td');
          tdOrd.textContent = img.display_order;
          tr.appendChild(tdOrd);

          // 4️⃣ Acciones
          const tdAcc = document.createElement('td');

          // ▲ Subir
          const btnUp = document.createElement('button');
          btnUp.className = 'btn btn-sm btn-secondary me-1';
          btnUp.innerHTML = '&#9650;';
          btnUp.disabled  = index === 0;
          btnUp.title     = 'Subir posición';
          btnUp.addEventListener('click', () => reorderImage(img.id, 'up'));
          tdAcc.appendChild(btnUp);

          // ▼ Bajar
          const btnDown = document.createElement('button');
          btnDown.className = 'btn btn-sm btn-secondary me-1';
          btnDown.innerHTML = '&#9660;';
          btnDown.disabled  = index === imgs.length - 1;
          btnDown.title     = 'Bajar posición';
          btnDown.addEventListener('click', () => reorderImage(img.id, 'down'));
          tdAcc.appendChild(btnDown);

          // 🗑️ Eliminar
          const btnDel = document.createElement('button');
          btnDel.className = 'btn btn-sm btn-danger';
          btnDel.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
          btnDel.title     = 'Eliminar imagen';
          btnDel.addEventListener('click', () => {
            Swal.fire({
              title: '¿Eliminar esta imagen?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#6c757d',
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar'
            }).then(result => {
              if (result.isConfirmed) deleteImage(img.id);
            });
          });
          tdAcc.appendChild(btnDel);

          tr.appendChild(tdAcc);
          tableBody.appendChild(tr);
        });
      })
      .catch(err => {
        console.error('Error en loadCarouselImages():', err);
      });
  }

  // 2) Subir nueva imagen
  formUpload.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(formUpload);

    fetch(`${BACKEND_URL}/upload_carousel.php`, {
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
        }).then(() => {
          formUpload.reset();
          loadCarouselImages();
        });
      } else {
        Swal.fire('Error al subir', resp.error || 'Ha ocurrido un error.', 'error');
      }
    })
    .catch(err => {
      console.error('Error en upload:', err);
      Swal.fire('Error inesperado','No se pudo comunicar con el servidor.','error');
    });
  });

  // 3) Borrar imagen
  function deleteImage(id) {
    fetch(`${BACKEND_URL}/delete_carousel.php`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(resp => {
      if (resp.success) {
        Swal.fire('Eliminada','Imagen eliminada correctamente.','success')
          .then(loadCarouselImages);
      } else {
        Swal.fire('Error al eliminar', resp.error || 'No se pudo eliminar.','error');
      }
    })
    .catch(err => {
      console.error('Error en deleteImage():', err);
      Swal.fire('Error inesperado','No se pudo comunicar con el servidor.','error');
    });
  }

  // 4) Reordenar imagen
  function reorderImage(id, direction) {
    fetch(`${BACKEND_URL}/update_carousel_order.php`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ id, direction })
    })
    .then(res => res.json())
    .then(resp => {
      if (resp.success) {
        loadCarouselImages();
      } else {
        Swal.fire('Error al reordenar', resp.error || 'No se pudo cambiar el orden.','error');
      }
    })
    .catch(err => {
      console.error('Error en reorderImage():', err);
      Swal.fire('Error inesperado','No se pudo comunicar con el servidor.','error');
    });
  }

  // 5) Inicializamos
  loadCarouselImages();
});
