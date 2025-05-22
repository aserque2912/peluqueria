fetch('../backend/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            // Si el usuario está logueado
            document.getElementById('authLinks').style.display = 'none'; // Ocultamos los links de autenticación

            // Forzamos la visibilidad de #userLinks
            const userLinks = document.getElementById('userLinks');
            if (userLinks) {
                userLinks.style.display = 'flex'; // Aseguramos que el contenedor de usuario se muestre
            }

            // Asignamos el nombre al contenedor userName después de un pequeño retraso
            const userName = document.getElementById('userName');
            if (userName) {
                setTimeout(() => {
                    userName.textContent = data.usuario.nombre; // Asignamos el nombre
                    console.log("Nombre del usuario:", data.usuario.nombre);  // Imprimimos el nombre en la consola
                }, 50);  // Retraso de 50ms para asegurar que el DOM esté listo
            }

            // Configurar el enlace de cierre de sesión
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    window.location.href = '../backend/logout.php'; // Redirige a logout.php
                });
            }
        } else {
            // Si el usuario NO está logueado, mostramos los enlaces de login y registro
            document.getElementById('authLinks').style.display = 'flex'; // Mostramos los links de autenticación
            document.getElementById('userLinks').style.display = 'none'; // Ocultamos los links del usuario
        }
    })
    .catch(error => {
        console.error('Error al verificar la sesión:', error); // Mostramos el error en la consola
        // En caso de error, mostramos los enlaces de autenticación por defecto
        document.getElementById('authLinks').style.display = 'flex';
        document.getElementById('userLinks').style.display = 'none';
    });

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

// Autoplay
let autoPlay = setInterval(() => {
    index++;
    showSlide(index);
}, 4000);

// Pausar autoplay al pasar el ratón
carousel.addEventListener("mouseover", () => clearInterval(autoPlay));
carousel.addEventListener("mouseleave", () => {
    autoPlay = setInterval(() => {
        index++;
        showSlide(index);
    }, 4000);
});

