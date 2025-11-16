// Configuración del juego
const CONFIG = {
    MONEDA: 'Dólar Trust',
    SIMBOLO: '$',
    DINERO_INICIAL: 1505000,
    BILLETES: [
        { valor: 500000, cantidad: 1, color: '#8B0000' },
        { valor: 100000, cantidad: 5, color: '#228B22' },
        { valor: 50000, cantidad: 7, color: '#1E90FF' },
        { valor: 10000, cantidad: 12, color: '#FFD700' },
        { valor: 5000, cantidad: 6, color: '#800080' },
        { valor: 1000, cantidad: 5, color: '#A52A2A' }
    ],
    COLORES: ['🔵', '🔴', '🟢', '🟡', '🟣', '🟠']
};

// Estado del juego
let jugadores = [
    { id: 1, nombre: 'Ana', color: '🔵', saldo: CONFIG.DINERO_INICIAL, alianza: 'Los Financistas' },
    { id: 2, nombre: 'Luis', color: '🔴', saldo: CONFIG.DINERO_INICIAL, alianza: 'Capitalistas' },
    { id: 3, nombre: 'María', color: '🟢', saldo: CONFIG.DINERO_INICIAL, alianza: 'Los Financistas' },
    { id: 4, nombre: 'Carlos', color: '🟡', saldo: CONFIG.DINERO_INICIAL, alianza: 'Trust Busters' }
];

let pagoActual = {
    origen: null,
    destino: null,
    monto: 0,
    concepto: ''
};

// Inicializar la aplicación
function inicializar() {
    renderizarJugadores();
    actualizarOpcionesPago();
}

// Renderizar jugadores en la pantalla
function renderizarJugadores() {
    const grid = document.getElementById('jugadoresGrid');
    grid.innerHTML = '';

    jugadores.forEach(jugador => {
        const saldoClase = jugador.saldo < 500000 ? 'saldo-bajo' : '';
        
        const jugadorHTML = `
            <div class="jugador-card">
                <div class="jugador-header">
                    <span class="emoji">${jugador.color}</span>
                    <div>
                        <div class="jugador-nombre">${jugador.nombre}</div>
                        <div class="jugador-alianza">${jugador.alianza}</div>
                    </div>
                </div>
                <div class="jugador-saldo ${saldoClase}">
                    ${CONFIG.SIMBOLO}${jugador.saldo.toLocaleString()}
                </div>
            </div>
        `;
        grid.innerHTML += jugadorHTML;
    });
}

// Actualizar opciones en el modal de pago
function actualizarOpcionesPago() {
    const opcionesOrigen = document.getElementById('opcionesOrigen');
    const opcionesDestino = document.getElementById('opcionesDestino');
    
    opcionesOrigen.innerHTML = '';
    opcionesDestino.innerHTML = '';

    jugadores.forEach(jugador => {
        // Opciones para origen
        const opcionOrigen = document.createElement('div');
        opcionOrigen.className = 'opcion-jugador';
        opcionOrigen.innerHTML = `
            ${jugador.color} ${jugador.nombre} (${CONFIG.SIMBOLO}${jugador.saldo.toLocaleString()})
        `;
        opcionOrigen.onclick = () => seleccionarOrigen(jugador.id);
        opcionesOrigen.appendChild(opcionOrigen);

        // Opciones para destino (excluyendo el origen seleccionado)
        if (jugador.id !== pagoActual.origen) {
            const opcionDestino = document.createElement('div');
            opcionDestino.className = 'opcion-jugador';
            opcionDestino.innerHTML = `${jugador.color} ${jugador.nombre}`;
            opcionDestino.onclick = () => seleccionarDestino(jugador.id);
            opcionesDestino.appendChild(opcionDestino);
        }
    });
}

// Funciones del modal
function abrirModalPago() {
    document.getElementById('modalPago').style.display = 'block';
    pagoActual = { origen: null, destino: null, monto: 0, concepto: '' };
    actualizarOpcionesPago();
    resetearSelecciones();
}

function cerrarModalPago() {
    document.getElementById('modalPago').style.display = 'none';
}

function seleccionarOrigen(jugadorId) {
    pagoActual.origen = jugadorId;
    resetearSelecciones();
    
    // Marcar como seleccionado
    const opciones = document.querySelectorAll('#opcionesOrigen .opcion-jugador');
    opciones.forEach((opcion, index) => {
        if (index === jugadorId - 1) {
            opcion.classList.add('seleccionado');
        }
    });
    
    actualizarOpcionesPago();
}

function seleccionarDestino(destinoId) {
    pagoActual.destino = destinoId;
    resetearSelecciones();
    
    // Marcar como seleccionado
    if (destinoId === 'banco') {
        document.getElementById('opcionBanco').classList.add('seleccionado');
    } else {
        const opciones = document.querySelectorAll('#opcionesDestino .opcion-jugador');
        opciones.forEach((opcion, index) => {
            const jugador = jugadores.find(j => j.id !== pagoActual.origen);
            if (jugador && jugador.id === destinoId) {
                opcion.classList.add('seleccionado');
            }
        });
    }
}

function resetearSelecciones() {
    document.querySelectorAll('.opcion-jugador').forEach(opcion => {
        opcion.classList.remove('seleccionado');
    });
}

function confirmarPago() {
    const monto = parseInt(document.getElementById('montoPago').value);
    const concepto = document.getElementById('conceptoPago').value;

    // Validaciones
    if (!pagoActual.origen) {
        alert('Selecciona el jugador que paga');
        return;
    }
    if (!pagoActual.destino) {
        alert('Selecciona el destinatario');
        return;
    }
    if (!monto || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
    }
    if (!concepto.trim()) {
        alert('Ingresa un concepto para el pago');
        return;
    }

    const jugadorOrigen = jugadores.find(j => j.id === pagoActual.origen);
    
    if (jugadorOrigen.saldo < monto) {
        alert('❌ No tiene suficiente dinero para realizar este pago');
        return;
    }

    // Realizar el pago
    jugadorOrigen.saldo -= monto;
    
    if (pagoActual.destino !== 'banco') {
        const jugadorDestino = jugadores.find(j => j.id === pagoActual.destino);
        jugadorDestino.saldo += monto;
    }

    // Mostrar confirmación
    const nombreDestino = pagoActual.destino === 'banco' ? 'el Banco' : jugadores.find(j => j.id === pagoActual.destino).nombre;
    alert(`✅ Pago realizado\n${jugadorOrigen.nombre} pagó ${CONFIG.SIMBOLO}${monto.toLocaleString()} a ${nombreDestino}\nConcepto: ${concepto}`);

    // Actualizar interfaz
    renderizarJugadores();
    cerrarModalPago();
}

// Easter Egg para Financistas
function verificarFinancistas() {
    const financistas = jugadores.filter(j => 
        j.alianza.toLowerCase().includes('financista')
    );
    
    if (financistas.length > 0) {
        console.log('🎵 Easter Egg desbloqueado: Bella Ciao para Financistas!');
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', inicializar);