// index.js

// 1) Verificar si el usuario está autenticado al cargar la página
fetch('/backend/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('authLinks').style.display = 'none'; // Ocultamos links login/registro

            if (data.usuario.rol === 'administrador') {
                const dropdownMenu = document.querySelector('#userLinks ul.dropdown-menu');

                // Enlace "Ver todas las citas"
                if (dropdownMenu && !document.getElementById('adminCitasLink')) {
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="dropdown-item" href="/admin_citas.html" id="adminCitasLink">Ver todas las citas</a>`;

                    const misCitasLi = dropdownMenu.querySelector('li');
                    if (misCitasLi && misCitasLi.nextSibling) {
                        dropdownMenu.insertBefore(li, misCitasLi.nextSibling);
                    } else {
                        dropdownMenu.appendChild(li);
                    }
                }

                // Enlace "Ver Usuarios"
                if (dropdownMenu && !document.getElementById('verUsuariosLink')) {
                    const liUsuarios = document.createElement('li');
                    liUsuarios.innerHTML = `<a class="dropdown-item" href="/ver_usuarios.html" id="verUsuariosLink">Ver Usuarios</a>`;

                    const adminCitasLi = document.getElementById('adminCitasLink');
                    if (adminCitasLi && adminCitasLi.parentElement) {
                        const nextSibling = adminCitasLi.parentElement.nextSibling;
                        if (nextSibling) {
                            adminCitasLi.parentElement.parentElement.insertBefore(liUsuarios, nextSibling);
                        } else {
                            adminCitasLi.parentElement.parentElement.appendChild(liUsuarios);
                        }
                    } else {
                        dropdownMenu.appendChild(liUsuarios);
                    }
                }

                // Enlace "Bloquear Horas"
                if (dropdownMenu && !document.getElementById('bloquearHorasLink')) {
                    const liBloquearHoras = document.createElement('li');
                    liBloquearHoras.innerHTML = `<a class="dropdown-item" href="/bloquear_horas.html" id="bloquearHorasLink">Bloquear Horas</a>`;

                    const verUsuariosLi = document.getElementById('verUsuariosLink');
                    if (verUsuariosLi && verUsuariosLi.parentElement) {
                        const nextSibling = verUsuariosLi.parentElement.nextSibling;
                        if (nextSibling) {
                            verUsuariosLi.parentElement.parentElement.insertBefore(liBloquearHoras, nextSibling);
                        } else {
                            verUsuariosLi.parentElement.parentElement.appendChild(liBloquearHoras);
                        }
                    } else {
                        dropdownMenu.appendChild(liBloquearHoras);
                    }
                }

                // Enlace "Horarios Bloqueados"
                if (dropdownMenu && !document.getElementById('verBloqueosLink')) {
                    const liBloqueos = document.createElement('li');
                    liBloqueos.innerHTML = `<a class="dropdown-item" href="/ver_bloqueos.html" id="verBloqueosLink">Horarios Bloqueados</a>`;

                    const logoutLink = document.getElementById('logoutLink');
                    if (logoutLink && logoutLink.parentElement) {
                        dropdownMenu.insertBefore(liBloqueos, logoutLink.parentElement);
                    } else {
                        dropdownMenu.appendChild(liBloqueos);
                    }
                }

                // ** Nuevo: Enlace "Imágenes del Carrusel" **
                if (dropdownMenu && !document.getElementById('adminCarouselLink')) {
                    const liCarousel = document.createElement('li');
                    liCarousel.innerHTML = `
                        <a class="dropdown-item" href="/admin_carousel.html" id="adminCarouselLink">
                            Imágenes del Carrusel
                        </a>
                    `;
                    const logoutLink = document.getElementById('logoutLink');
                    if (logoutLink && logoutLink.parentElement) {
                        dropdownMenu.insertBefore(liCarousel, logoutLink.parentElement);
                    } else {
                        dropdownMenu.appendChild(liCarousel);
                    }
                }
            }

            // Mostrar links usuario
            const userLinks = document.getElementById('userLinks');
            if (userLinks) userLinks.style.display = 'flex';

            // Asignar nombre usuario
            const userName = document.getElementById('userName');
            if (userName) {
                setTimeout(() => {
                    userName.textContent = data.usuario.nombre;
                }, 50);
            }

            // Configurar logout
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', e => {
                    e.preventDefault();
                    window.location.href = '../backend/logout.php';
                });
            }
        } else {
            // Mostrar links login y registro si no está logueado
            document.getElementById('authLinks').style.display = 'flex';
            document.getElementById('userLinks').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error al verificar la sesión:', error);
        document.getElementById('authLinks').style.display = 'flex';
        document.getElementById('userLinks').style.display = 'none';
    });


// --------------------------------------
// Resto del código: carrusel dinámico
// --------------------------------------

// Referencias al carrusel y sus controles
const carouselContainer = document.querySelector(".carousel"); // contenedor donde inyectaremos los slides
const nextBtn = document.querySelector(".carousel-btn.next");
const prevBtn = document.querySelector(".carousel-btn.prev");

let slides = []; // Array de elementos .carousel-slide creados
let index = 0;
let autoPlay = null;

function showSlide(i) {
    if (!slides.length) return;
    if (i >= slides.length) index = 0;
    if (i < 0) index = slides.length - 1;
    carouselContainer.style.transform = `translateX(-${index * 100}%)`;
}

// 1) Cargar las imágenes desde el backend y generar los slides en el DOM
function loadCarouselImages() {
    if (!carouselContainer) return;

    fetch('../backend/get_carousel.php')
        .then(res => res.json())
        .then(resp => {
            console.log('get_carousel response:', resp);

            if (!resp.success) {
                console.error('Backend error:', resp.error);
                return;
            }

            // resp.data es tu array de imágenes
            const total = resp.data?.length??resp.count;
            console.log('Imágenes recibidas:', total);

            carouselContainer.innerHTML = '';
            slides = [];

            resp.data.forEach(item => {
                const slideDiv = document.createElement('div');
                slideDiv.classList.add('carousel-slide');

                const img = document.createElement('img');
                img.src = `/img/carousel/${item.filename}`;
                img.alt = item.caption || '';
                img.style.width = '100%';
                img.style.display = 'block';

                slideDiv.appendChild(img);
                carouselContainer.appendChild(slideDiv);
                slides.push(slideDiv);
            });

            setupCarouselControls();
            showSlide(0);
        })
        .catch(err => {
            console.error('Error al cargar imágenes del carrusel:', err);
        });
}



// 2) Asociar listeners a botones "next"/"prev" y configurar autoplay
function setupCarouselControls() {
    // Reiniciar autoplay si ya existía
    if (autoPlay) {
        clearInterval(autoPlay);
        autoPlay = null;
    }

    // Next
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            index++;
            showSlide(index);
        });
    }

    // Prev
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            index--;
            showSlide(index);
        });
    }

    // Autoplay cada 4 segundos
    if (carouselContainer && slides.length > 0) {
        autoPlay = setInterval(() => {
            index++;
            showSlide(index);
        }, 4000);

        carouselContainer.addEventListener('mouseover', () => {
            if (autoPlay) clearInterval(autoPlay);
        });
        carouselContainer.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                index++;
                showSlide(index);
            }, 4000);
        });
    }
}

// Invocar la carga al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadCarouselImages();
});