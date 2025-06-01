fetch('../backend/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('authLinks').style.display = 'none'; // Ocultamos links login/registro

            if (data.usuario.rol === 'administrador') {
                const dropdownMenu = document.querySelector('#userLinks ul.dropdown-menu');

                // Enlace "Ver todas las citas"
                if (dropdownMenu && !document.getElementById('adminCitasLink')) {
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="dropdown-item" href="../frontend/admin_citas.html" id="adminCitasLink">Ver todas las citas</a>`;

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
                    liUsuarios.innerHTML = `<a class="dropdown-item" href="../frontend/ver_usuarios.html" id="verUsuariosLink">Ver Usuarios</a>`;

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

                // Enlace "Bloquear Horas" (nuevo)
                if (dropdownMenu && !document.getElementById('bloquearHorasLink')) {
                    const liBloquearHoras = document.createElement('li');
                    liBloquearHoras.innerHTML = `<a class="dropdown-item" href="../frontend/bloquear_horas.html" id="bloquearHorasLink">Bloquear Horas</a>`;

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

// Resto del código carousel ...
const carousel = document.querySelector(".carousel");
const slides = document.querySelectorAll(".carousel-slide");
const nextBtn = document.querySelector(".carousel-btn.next");
const prevBtn = document.querySelector(".carousel-btn.prev");

let index = 0;

function showSlide(i) {
    if (i >= slides.length) index = 0;
    if (i < 0) index = slides.length - 1;
    carousel.style.transform = `translateX(-${index * 100}%)`;
}

nextBtn.addEventListener("click", () => {
    index++;
    showSlide(index);
});

prevBtn.addEventListener("click", () => {
    index--;
    showSlide(index);
});

let autoPlay = setInterval(() => {
    index++;
    showSlide(index);
}, 4000);

carousel.addEventListener("mouseover", () => clearInterval(autoPlay));
carousel.addEventListener("mouseleave", () => {
    autoPlay = setInterval(() => {
        index++;
        showSlide(index);
    }, 4000);
});