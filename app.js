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

let historialTransacciones = [];

// Inicializar la aplicación
function inicializar() {
    cargarDesdeLocalStorage();
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

// Funciones del modal de pago
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

    // Agregar al historial
    agregarAlHistorial({
        origen: pagoActual.origen,
        destino: pagoActual.destino,
        monto: monto,
        concepto: concepto
    });

    // Mostrar confirmación
    const nombreDestino = pagoActual.destino === 'banco' ? 'el Banco' : 
                         jugadores.find(j => j.id === pagoActual.destino).nombre;
    alert(`✅ Pago realizado\n${jugadorOrigen.nombre} pagó ${CONFIG.SIMBOLO}${monto.toLocaleString()} a ${nombreDestino}\nConcepto: ${concepto}`);

    // Verificar si hay ganador
    verificarGanador();

    // Actualizar interfaz
    renderizarJugadores();
    cerrarModalPago();
}

// Historial de transacciones
function agregarAlHistorial(transaccion) {
    historialTransacciones.unshift({
        ...transaccion,
        fecha: new Date().toLocaleString(),
        id: Date.now()
    });
    
    if (historialTransacciones.length > 50) {
        historialTransacciones = historialTransacciones.slice(0, 50);
    }
    
    guardarEnLocalStorage();
}

function mostrarHistorialModal() {
    const container = document.getElementById('historialContainer');
    
    if (historialTransacciones.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">No hay transacciones registradas</p>';
    } else {
        const historialHTML = historialTransacciones.map(trans => {
            const jugadorOrigen = jugadores.find(j => j.id === trans.origen);
            let destinoTexto = trans.destino === 'banco' ? '🏦 Banco' : 
                              jugadores.find(j => j.id === trans.destino)?.nombre;
            
            return `
                <div class="transaccion-item">
                    <div class="transaccion-fecha">${trans.fecha}</div>
                    <div class="transaccion-detalle">
                        ${jugadorOrigen?.nombre} → ${destinoTexto}
                    </div>
                    <div class="transaccion-monto">${CONFIG.SIMBOLO}${trans.monto.toLocaleString()}</div>
                    <div class="transaccion-concepto">${trans.concepto}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = historialHTML;
    }
    
    document.getElementById('modalHistorial').style.display = 'block';
}

function cerrarModalHistorial() {
    document.getElementById('modalHistorial').style.display = 'none';
}

// Estadísticas
function mostrarEstadisticas() {
    const totalTransacciones = historialTransacciones.length;
    const totalMovido = historialTransacciones.reduce((sum, trans) => sum + trans.monto, 0);
    const transaccionMasGrande = historialTransacciones.length > 0 ? 
        Math.max(...historialTransacciones.map(t => t.monto)) : 0;
    
    const transaccionesBanco = historialTransacciones.filter(t => t.destino === 'banco').length;
    const totalBanco = historialTransacciones.filter(t => t.destino === 'banco')
        .reduce((sum, trans) => sum + trans.monto, 0);
    
    alert(`📊 Estadísticas del Juego:

• Transacciones realizadas: ${totalTransacciones}
• Total movido: ${CONFIG.SIMBOLO}${totalMovido.toLocaleString()}
• Transacción más grande: ${CONFIG.SIMBOLO}${transaccionMasGrande.toLocaleString()}
• Pagos al banco: ${transaccionesBanco} (${CONFIG.SIMBOLO}${totalBanco.toLocaleString()})
• Jugadores activos: ${jugadores.filter(j => j.saldo > 0).length}
`);
}

// Local Storage
function guardarEnLocalStorage() {
    const datos = {
        jugadores,
        historialTransacciones,
        ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('trustBancaDigital', JSON.stringify(datos));
}

function cargarDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem('trustBancaDigital');
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            jugadores = datos.jugadores || jugadores;
            historialTransacciones = datos.historialTransacciones || [];
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }
}

// Verificar ganador
function verificarGanador() {
    const jugadoresConDinero = jugadores.filter(j => j.saldo > 0);
    
    if (jugadoresConDinero.length === 1) {
        const ganador = jugadoresConDinero[0];
        
        if (ganador.alianza.toLowerCase().includes('financista')) {
            setTimeout(activarEventoEspecial, 1000);
        }
        
        setTimeout(() => {
            alert(`🎉 ¡${ganador.nombre} (${ganador.alianza}) ha ganado el juego! 🏆\nSaldo final: ${CONFIG.SIMBOLO}${ganador.saldo.toLocaleString()}`);
        }, 500);
    }
}

function activarEventoEspecial() {
    const audio = new Audio('assets/audio/bella-ciao.mp3');
    audio.volume = 0.5;
    
    const easterEgg = document.createElement('div');
    easterEgg.className = 'easter-egg';
    easterEgg.innerHTML = '🎵 ¡Bella Ciao! 🎵';
    document.body.appendChild(easterEgg);
    
    setTimeout(() => {
        document.body.removeChild(easterEgg);
    }, 5000);
    
    audio.play().catch(e => console.log('Audio no disponible'));
}

// QR Scanner (placeholder)
function iniciarEscaneoQR() {
    alert('🔍 Escáner QR - Función en desarrollo\n\nPor ahora, usa el sistema de pagos manual.');
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', inicializar);
