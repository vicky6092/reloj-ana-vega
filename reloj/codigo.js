const SEGUNDOS_POR_DIA = 24 * 60 * 60;

const formulario = document.getElementById("formulario");
const botonLimpiar = document.getElementById("limpiar");
const campoHoraResultado = document.getElementById("hr");
const campoMinutosResultado = document.getElementById("mr");
const campoSegundosResultado = document.getElementById("sr");
const resumen = document.getElementById("resumen");
const mensaje = document.getElementById("mensaje");

const MENSAJE_INICIAL = "Aquí aparecerá la diferencia de horas.";

/* ---------- Utilidades ---------- */

function dosDigitos(numero) {
    return String(numero).padStart(2, "0");
}

function plural(cantidad, singular, pluralTexto) {
    return cantidad + " " + (cantidad === 1 ? singular : pluralTexto);
}

function formatear12(tiempo) {
    return dosDigitos(tiempo.hora) + ":" + dosDigitos(tiempo.minutos) + ":" +
        dosDigitos(tiempo.segundos) + " " + tiempo.periodo;
}

/* ---------- Lectura y validación ---------- */

// sufijo: "i" (inicial) o "f" (final). nombre: texto para los mensajes de error.
function leerTiempo(sufijo, nombre) {
    const textoHora = document.getElementById("h" + sufijo).value.trim();
    const textoMinutos = document.getElementById("m" + sufijo).value.trim();
    const textoSegundos = document.getElementById("s" + sufijo).value.trim();
    const periodo = document.querySelector(
        'input[name="periodo-' + (sufijo === "i" ? "inicial" : "final") + '"]:checked'
    ).value;

    const hora = Number(textoHora);
    const minutos = textoMinutos === "" ? 0 : Number(textoMinutos);
    const segundos = textoSegundos === "" ? 0 : Number(textoSegundos);

    if (textoHora === "" || !Number.isInteger(hora) || hora < 1 || hora > 12) {
        return { error: "La hora " + nombre + " debe ser un número entero de 1 a 12." };
    }
    if (!Number.isInteger(minutos) || minutos < 0 || minutos > 59) {
        return { error: "Los minutos de la hora " + nombre + " deben estar entre 0 y 59." };
    }
    if (!Number.isInteger(segundos) || segundos < 0 || segundos > 59) {
        return { error: "Los segundos de la hora " + nombre + " deben estar entre 0 y 59." };
    }

    // Conversión a formato de 24 horas: 12 AM = 0 h, 12 PM = 12 h
    const hora24 = (hora % 12) + (periodo === "PM" ? 12 : 0);

    return {
        hora: hora,
        minutos: minutos,
        segundos: segundos,
        periodo: periodo,
        totalSegundos: hora24 * 3600 + minutos * 60 + segundos
    };
}

/* ---------- Cálculo ---------- */

function calcularDiferencia(inicial, final) {
    let diferencia = final.totalSegundos - inicial.totalSegundos;
    const diaSiguiente = diferencia < 0;

    // Si la hora final es menor, se toma como del día siguiente
    if (diaSiguiente) {
        diferencia += SEGUNDOS_POR_DIA;
    }

    return {
        horas: Math.floor(diferencia / 3600),
        minutos: Math.floor((diferencia % 3600) / 60),
        segundos: diferencia % 60,
        diaSiguiente: diaSiguiente
    };
}

/* ---------- Pantalla ---------- */

function limpiarResultado() {
    campoHoraResultado.value = "";
    campoMinutosResultado.value = "";
    campoSegundosResultado.value = "";
    resumen.textContent = "";
    mensaje.classList.remove("error");
    mensaje.textContent = MENSAJE_INICIAL;
}

function mostrarError(texto) {
    campoHoraResultado.value = "";
    campoMinutosResultado.value = "";
    campoSegundosResultado.value = "";
    resumen.textContent = "";
    mensaje.classList.add("error");
    mensaje.textContent = texto;
}

function procesar(evento) {
    evento.preventDefault();

    const inicial = leerTiempo("i", "inicial");
    if (inicial.error) {
        mostrarError(inicial.error);
        return;
    }

    const final = leerTiempo("f", "final");
    if (final.error) {
        mostrarError(final.error);
        return;
    }

    const resultado = calcularDiferencia(inicial, final);

    campoHoraResultado.value = resultado.horas;
    campoMinutosResultado.value = resultado.minutos;
    campoSegundosResultado.value = resultado.segundos;

    resumen.textContent = "Desde las " + formatear12(inicial) + " hasta las " +
        formatear12(final) + (resultado.diaSiguiente ? " (del día siguiente)" : "");

    mensaje.classList.remove("error");
    mensaje.textContent = "La diferencia de horas es " +
        plural(resultado.horas, "hora", "horas") + ", " +
        plural(resultado.minutos, "minuto", "minutos") + " y " +
        plural(resultado.segundos, "segundo", "segundos") + ".";
}

// Ajusta cada campo a su rango cuando se escribe un valor fuera de límites
function ajustarRango(campo) {
    if (campo.value === "") return;

    const minimo = Number(campo.min);
    const maximo = Number(campo.max);
    let valor = Math.trunc(Number(campo.value));

    if (Number.isNaN(valor)) {
        campo.value = "";
        return;
    }
    if (valor > maximo) valor = maximo;
    if (valor < minimo) valor = minimo;
    campo.value = valor;
}

/* ---------- Eventos ---------- */

formulario.addEventListener("submit", procesar);

botonLimpiar.addEventListener("click", function () {
    formulario.reset();
    limpiarResultado();
    document.getElementById("hi").focus();
});

["hi", "mi", "si", "hf", "mf", "sf"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function (evento) {
        ajustarRango(evento.target);
    });
});
