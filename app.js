const API_URL = 'http://localhost:8080/api/turnos';

function renderizarTabla(lista) {
    const tbody = document.getElementById('tablaTurnos');
    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="mensaje-vacio">No hay turnos registrados</td></tr>';
        return;
    }

    lista.forEach(turno => {
        tbody.innerHTML += `
            <tr>
                <td>${turno.id ?? '-'}</td>
                <td><strong>${turno.codigo}</strong></td>
                <td>${turno.cliente}</td>
                <td>${turno.tipoOperacion}</td>
                <td>${turno.estado}</td>
                <td>
                    <div class="acciones-box">
                        <button type="button" class="btn-editar" onclick="prepararEdicion(${turno.id})">Editar</button>
                        <button type="button" class="btn-eliminar" onclick="eliminarTurno(${turno.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

async function cargarTodos() {
    try {
        const respuesta = await fetch(API_URL);
        const turnos = await respuesta.json();
        renderizarTabla(turnos);
    } catch (error) {
        console.error('Error al listar turnos:', error);
    }
}

document.getElementById('formTurno').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('turnoId').value;
    const datosTurno = {
        codigo: document.getElementById('codigo').value.trim(),
        cliente: document.getElementById('cliente').value.trim(),
        tipoOperacion: document.getElementById('tipoOperacion').value,
        estado: document.getElementById('estado').value
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const metodo = id ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTurno)
        });

        if (respuesta.ok) {
            cancelarEdicion();
            cargarTodos();
        } else {
            alert('Error al guardar el turno. Verifica los datos.');
        }
    } catch (error) {
        console.error(`Error en ${metodo}:`, error);
    }
});

async function prepararEdicion(id) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}`);
        if (!respuesta.ok) {
            return alert('No se pudo cargar la información del turno.');
        }

        const turno = await respuesta.json();
        document.getElementById('turnoId').value = turno.id;
        document.getElementById('codigo').value = turno.codigo;
        document.getElementById('cliente').value = turno.cliente;
        document.getElementById('tipoOperacion').value = turno.tipoOperacion;
        document.getElementById('estado').value = turno.estado;

        document.getElementById('tituloFormulario').textContent = `Editar Turno #${turno.id}`;
        document.getElementById('btnGuardar').textContent = 'Actualizar Turno';
        document.getElementById('btnCancelar').style.display = 'inline-block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error al cargar turno para editar:', error);
    }
}

function cancelarEdicion() {
    document.getElementById('formTurno').reset();
    document.getElementById('turnoId').value = '';
    document.getElementById('tituloFormulario').textContent = 'Registrar Nuevo Turno';
    document.getElementById('btnGuardar').textContent = 'Guardar Turno';
    document.getElementById('btnCancelar').style.display = 'none';
}

async function eliminarTurno(id) {
    if (!confirm(`¿Estás seguro de eliminar el turno con ID ${id}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            if (document.getElementById('turnoId').value == id) {
                cancelarEdicion();
            }
            cargarTodos();
        } else {
            alert('No se pudo eliminar el turno.');
        }
    } catch (error) {
        console.error('Error en DELETE:', error);
    }
}

cargarTodos();

