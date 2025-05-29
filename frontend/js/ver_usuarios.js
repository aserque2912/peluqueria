fetch('../backend/ver_usuarios.php')
    .then(res => {
        if (!res.ok) throw new Error('No autorizado o error en la consulta');
        return res.json();
    })
    .then(usuarios => {
        const tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td>
          <button class="btn btn-sm btn-eliminar" data-id="${usuario.id}" title="Eliminar usuario">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </td>
      `;
            tbody.appendChild(tr);
        });

        // Evento eliminar con SweetAlert2 animado
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');

                Swal.fire({
                    title: '¿Seguro que quieres eliminar este usuario?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#aaa',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Eliminando...',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: () => Swal.showLoading()
                        });

                        fetch('../backend/eliminar_usuario.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: userId })
                            })
                            .then(res => res.json())
                            .then(resp => {
                                Swal.close();
                                if (resp.ok) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Usuario eliminado',
                                        showClass: {
                                            popup: 'animate__animated animate__fadeInDown'
                                        },
                                        hideClass: {
                                            popup: 'animate__animated animate__fadeOutUp'
                                        }
                                    });
                                    btn.closest('tr').remove();
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: resp.mensaje || 'Error desconocido',
                                        confirmButtonColor: '#d33',
                                        showClass: {
                                            popup: 'animate__animated animate__fadeInDown'
                                        },
                                        hideClass: {
                                            popup: 'animate__animated animate__fadeOutUp'
                                        }
                                    });
                                }
                            })
                            .catch(err => {
                                Swal.close();
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error de conexión',
                                    text: err.message,
                                    confirmButtonColor: '#d33',
                                    showClass: {
                                        popup: 'animate__animated animate__fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animate__animated animate__fadeOutUp'
                                    }
                                });
                            });
                    }
                });
            });
        });
    })
    .catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar usuarios',
            text: err.message,
            confirmButtonColor: '#d33',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    });