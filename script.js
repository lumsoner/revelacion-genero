/* =========================================================
   1. CONFIGURACIÓN DEL EVENTO
   Editá acá la fecha, el horario, la dirección y el WhatsApp.
   ========================================================= */
const CONFIGURACION_EVENTO = {
    fecha: "2026-11-14T14:00:00",
    fechaVisible: "14 DE NOVIEMBRE",
    diaVisible: "SÁBADO",
    horarioVisible: "14:00 HS",
    direccion: "Belgrano 871",
    enlaceMapa: "https://maps.app.goo.gl/Y6sqUNUkSPF4omcJ9?g_st=iw",
    numeroWhatsApp: "5491132115959",
    mensajeWhatsApp: "¡Hola! Confirmo mi asistencia a la revelación de género.",
    nombresNino: ["Gregorio", "Tadeo", "Ignacio", "Fausto", "Teo", "Mateo"],
    nombresNina: ["Olivia", "Malena", "Emilia", "Adhara", "Amira", "Alice"]
};

/* Estado temporal de confirmación */
const CLAVE_CONFIRMACION = "revelacion_confirmacion_iniciada";
const CLAVE_WHATSAPP_ABIERTO = "revelacion_whatsapp_abierto";
let numeroInvitado = 2;


/* =========================================================
   2. APERTURA ANIMADA DEL SOBRE
   ========================================================= */
function configurarAperturaSobre() {
    const portada = obtenerElemento("portadaSobre");
    const botonAbrir = obtenerElemento("abrirSobre");
    const invitacion = obtenerElemento("invitacion");

    if (!portada || !botonAbrir || !invitacion) return;

    botonAbrir.addEventListener("click", () => {
        if (portada.classList.contains("sobre-abriendose")) return;

        botonAbrir.disabled = true;
        portada.classList.add("sobre-abriendose");

        const movimientoReducido =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const tiempoApertura = movimientoReducido ? 20 : 2550;
        const tiempoTransicion = movimientoReducido ? 20 : 850;

        window.setTimeout(() => {
            portada.classList.add("sobre-abierto");

            invitacion.hidden = false;
            invitacion.classList.remove("apareciendo");
            void invitacion.offsetWidth;
            invitacion.classList.add("apareciendo");
            portada.classList.add("saliendo");

            window.setTimeout(() => {
                portada.hidden = true;
                invitacion.classList.remove("apareciendo");
                window.scrollTo({ top: 0, behavior: "auto" });
            }, tiempoTransicion);

        }, tiempoApertura);
    });
}


/* =========================================================
   3. ESTADO DEL JUEGO
   ========================================================= */
let prediccionElegida = "";
let nombreElegido = "";
let pasoActual = 1;

const obtenerElemento = (id) => document.getElementById(id);


/* =========================================================
   4. CARGAR LOS DATOS VISIBLES DEL EVENTO
   ========================================================= */
function cargarDatosDelEvento() {
    obtenerElemento("fechaEvento").textContent =
        CONFIGURACION_EVENTO.fechaVisible;

    obtenerElemento("diaEvento").textContent =
        CONFIGURACION_EVENTO.diaVisible;

    obtenerElemento("horarioEvento").textContent =
        CONFIGURACION_EVENTO.horarioVisible;

    obtenerElemento("direccionEvento").textContent =
        CONFIGURACION_EVENTO.direccion;

    obtenerElemento("botonUbicacion").href =
        CONFIGURACION_EVENTO.enlaceMapa;

    const fechaFinal = obtenerElemento("fechaFinal");

    if (fechaFinal) {
        fechaFinal.textContent =
            `${CONFIGURACION_EVENTO.diaVisible} · ` +
            `${CONFIGURACION_EVENTO.fechaVisible} · ` +
            `${CONFIGURACION_EVENTO.horarioVisible}`;
    }
}


/* =========================================================
   5. CUENTA REGRESIVA
   ========================================================= */
function actualizarCuentaRegresiva() {
    const fechaObjetivo =
        new Date(CONFIGURACION_EVENTO.fecha).getTime();

    const diferencia = fechaObjetivo - Date.now();

    if (!Number.isFinite(fechaObjetivo)) {
        obtenerElemento("mensajeCuentaRegresiva").textContent =
            "Pronto compartiremos los detalles del gran día.";
        return;
    }

    if (diferencia <= 0) {
        obtenerElemento("dias").textContent = "00";
        obtenerElemento("horas").textContent = "00";
        obtenerElemento("minutos").textContent = "00";

        obtenerElemento("mensajeCuentaRegresiva").textContent =
            "¡Llegó el gran día!";

        return;
    }

    obtenerElemento("dias").textContent =
        String(Math.floor(diferencia / 86400000)).padStart(2, "0");

    obtenerElemento("horas").textContent =
        String(Math.floor((diferencia % 86400000) / 3600000))
            .padStart(2, "0");

    obtenerElemento("minutos").textContent =
        String(Math.floor((diferencia % 3600000) / 60000))
            .padStart(2, "0");

    obtenerElemento("mensajeCuentaRegresiva").textContent =
        "Cada vez falta menos para compartir este momento.";
}


/* =========================================================
   6. ABRIR Y CERRAR LA VENTANA DEL JUEGO
   ========================================================= */
function abrirJuego() {
    reiniciarEstadoDelJuego();

    obtenerElemento("modalJuego").hidden = false;
    document.body.classList.add("juego-abierto");

    obtenerElemento("seccionPrediccion").hidden = false;
    obtenerElemento("seccionNombres").hidden = true;

    obtenerElemento("pasoJuego").textContent = "JUEGO 1 DE 2";
    obtenerElemento("tituloModalJuego").textContent = "¿Niño o niña?";

    obtenerElemento("modalJuego")
        .querySelector(".contenido-modal")
        .focus({ preventScroll: true });
}


function cerrarJuego() {
    obtenerElemento("modalJuego").hidden = true;
    document.body.classList.remove("juego-abierto");

    obtenerElemento("botonEmpezarJuego")
        .focus({ preventScroll: true });
}


/* =========================================================
   7. REINICIAR EL ESTADO DEL JUEGO
   ========================================================= */
function reiniciarEstadoDelJuego() {
    prediccionElegida = "";
    nombreElegido = "";
    pasoActual = 1;

    document.body.classList.remove("tema-nino", "tema-nina");

        // Volver a mostrar las dos imágenes al iniciar una nueva partida.
    const contenedorEquipos = obtenerElemento("equiposBebe");

    if (contenedorEquipos) {
        contenedorEquipos.classList.remove("equipo-elegido");

        contenedorEquipos.querySelectorAll(".imagen-equipo").forEach((imagen) => {
            imagen.hidden = false;
        });
    }

    document.querySelectorAll("[data-prediccion]").forEach((boton) => {
        boton.classList.remove("seleccionado");
        boton.setAttribute("aria-pressed", "false");
    });

    obtenerElemento("resultadoPrediccion").textContent = "";
    obtenerElemento("resultadoNombre").textContent = "";

    obtenerElemento("botonSiguienteJuego").disabled = true;
    obtenerElemento("botonFinalizarJuego").disabled = true;
}


/* =========================================================
   8. ELEGIR LA PREDICCIÓN: NIÑO O NIÑA
   ========================================================= */
function elegirPrediccion(prediccion) {
    prediccionElegida = prediccion;
    nombreElegido = "";

    document.body.classList.remove("tema-nino", "tema-nina");

    document.body.classList.add(
        prediccion === "nino" ? "tema-nino" : "tema-nina"
    );

        // Mostrar solamente la imagen del equipo elegido.
    const contenedorEquipos = obtenerElemento("equiposBebe");

    if (contenedorEquipos) {
        const imagenes = contenedorEquipos.querySelectorAll(".imagen-equipo");

        imagenes.forEach((imagen) => {
            imagen.hidden = imagen.dataset.equipo !== prediccion;
        });

        contenedorEquipos.classList.add("equipo-elegido");
    }

    document.querySelectorAll("[data-prediccion]").forEach((boton) => {
        const seleccionado =
            boton.dataset.prediccion === prediccion;

        boton.classList.toggle("seleccionado", seleccionado);
        boton.setAttribute("aria-pressed", String(seleccionado));
    });

    mostrarResultadoDePrediccion(prediccion);
    mostrarJuegoDeNombres(prediccion);

    obtenerElemento("botonSiguienteJuego").disabled = false;

    lanzarConfeti();
}


function mostrarResultadoDePrediccion(prediccion) {
    const resultado = obtenerElemento("resultadoPrediccion");

    resultado.innerHTML = prediccion === "nino"
        ? '<p class="icono-resultado" aria-hidden="true">🩵</p>' +
          '<p class="texto-resultado"><strong>¡Team Niño!</strong></p>' +
          '<p class="texto-resultado">¡Anotamos tu predicción!</p>'
        : '<p class="icono-resultado" aria-hidden="true">🩷</p>' +
          '<p class="texto-resultado"><strong>¡Team Niña!</strong></p>' +
          '<p class="texto-resultado">¡Anotamos tu predicción!</p>';
}


/* =========================================================
   9. PASAR AL JUEGO DE LOS NOMBRES
   ========================================================= */
function irAlJuegoDeNombres() {
    if (!prediccionElegida) return;

    pasoActual = 2;

    obtenerElemento("seccionPrediccion").hidden = true;
    obtenerElemento("seccionNombres").hidden = false;

    obtenerElemento("pasoJuego").textContent = "JUEGO 2 DE 2";
    obtenerElemento("tituloModalJuego").textContent =
        "¿Qué nombre tendrá?";

    obtenerElemento("introduccionNombres").textContent =
        prediccionElegida === "nino"
            ? "¿Cuál de estos nombres te imaginás para el bebé? Elegí tu favorito para dejar registrada tu apuesta."
            : "¿Cuál de estos nombres te imaginás para la bebé? Elegí tu favorito para dejar registrada tu apuesta.";

    obtenerElemento("resultadoNombre").textContent = "";
    obtenerElemento("botonFinalizarJuego").disabled = true;
    obtenerElemento("listaNombres").scrollTop = 0;
}


/* =========================================================
   10. MOSTRAR LAS OPCIONES DE NOMBRES
   ========================================================= */
function mostrarJuegoDeNombres(prediccion) {
    const nombres = prediccion === "nino"
        ? CONFIGURACION_EVENTO.nombresNino
        : CONFIGURACION_EVENTO.nombresNina;

    const listaNombres = obtenerElemento("listaNombres");

    listaNombres.replaceChildren();

    nombres.forEach((nombre) => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "opcion-nombre";
        boton.textContent = nombre;

        boton.addEventListener("click", () => {
            elegirNombre(nombre, boton);
        });

        listaNombres.appendChild(boton);
    });
}


/* =========================================================
   11. GUARDAR EL NOMBRE ELEGIDO
   ========================================================= */
function elegirNombre(nombre, botonSeleccionado = null) {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) return;

    nombreElegido = nombreLimpio;

    document
        .querySelectorAll("#listaNombres .opcion-nombre")
        .forEach((boton) => {
            boton.classList.toggle(
                "seleccionado",
                boton === botonSeleccionado
            );
        });

    obtenerElemento("resultadoNombre").textContent =
        `Tu apuesta es ${nombreElegido}. `;

    obtenerElemento("botonFinalizarJuego").disabled = false;
}


/* =========================================================
   12. RESUMEN FINAL DEL JUEGO
   Mensaje breve con la predicción y la misión de cada equipo.
   ========================================================= */
function finalizarJuego() {
    if (!prediccionElegida || !nombreElegido) return;

    // Género y nombre elegidos por la persona.
    const generoElegido =
        prediccionElegida === "nino" ? "niño" : "niña";

    const resumenPrediccion =
        `Tu predicción es que será ${generoElegido} ` +
        `y elegiste el nombre ${nombreElegido}. `;

    // Título de la misión según el equipo elegido.
    const etiquetaEquipo = prediccionElegida === "nino"
        ? "UNA MISIÓN PARA EL TEAM NENE"
        : "UNA MISIÓN PARA EL TEAM NENA";

    // Qué debe traer cada equipo.
    const detalleEquipo = prediccionElegida === "nino"
        ? "¡No te olvides de traer pañales para el bebé! 🩵"
        : "¡No te olvides de traer toallitas para la bebé! 🩷";

    // Actualizar el resumen con la predicción.
    obtenerElemento("textoResumenPrediccion").textContent =
        resumenPrediccion;

    // Cambiar el subtítulo.
    const subtituloResumen = obtenerElemento("resumenFinal")
        .querySelector(".resumen-sobretitulo");

    if (subtituloResumen) {
        subtituloResumen.textContent = "TU PREDICCIÓN";
    }

    // Actualizar la misión del equipo.
    obtenerElemento("etiquetaEquipoQueTraer").textContent =
        etiquetaEquipo;

    obtenerElemento("textoEquipoQueTraer").textContent =
        detalleEquipo;

    // Mostrar la imagen del equipo elegido.
    const imagenMision = obtenerElemento("imagenMision");

    if (imagenMision) {
        if (prediccionElegida === "nino") {
            imagenMision.src = "team-boy.png";
            imagenMision.alt = "Team Boy";
        } else {
            imagenMision.src = "team-girl.png";
            imagenMision.alt = "Team Girl";
        }
    }
    
    // Eliminar el agradecimiento largo que repetía información.
    const cierreResumen = obtenerElemento("resumenFinal")
        .querySelector(".cierre-resumen");

    if (cierreResumen) {
        cierreResumen.remove();
    }

    // Mostrar el resumen y cambiar el título de la sección.
    obtenerElemento("resumenFinal").hidden = false;

    obtenerElemento("tituloJuegoPortada").textContent =
        "¡Gracias por participar!";

    obtenerElemento("textoJuegoPortada").hidden = true;
    obtenerElemento("botonEmpezarJuego").hidden = true;

    cerrarJuego();

    obtenerElemento("juego").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   13. PERMITIR CAMBIAR LA PREDICCIÓN
   ========================================================= */
function volverAJugar() {
    obtenerElemento("resumenFinal").hidden = true;

    obtenerElemento("tituloJuegoPortada").textContent =
        "Adiviná qué soy";

    obtenerElemento("textoJuegoPortada").hidden = false;
    obtenerElemento("botonEmpezarJuego").hidden = false;

    abrirJuego();
}

/* =========================================================
   15. MOSTRAR LA PANTALLA DE GRACIAS
   AL VOLVER DE WHATSAPP
   ========================================================= */
function mostrarPantallaGracias() {
    const portada = obtenerElemento("portadaSobre");
    const invitacion = obtenerElemento("invitacion");
    const pantallaGracias = obtenerElemento("pantallaGracias");
    const modal = obtenerElemento("modalJuego");

    if (portada) portada.hidden = true;
    if (invitacion) invitacion.hidden = true;
    if (modal) modal.hidden = true;

    document.body.classList.remove("juego-abierto");

    pantallaGracias.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
}


function volverALaInvitacion() {
    sessionStorage.removeItem(CLAVE_CONFIRMACION);
    sessionStorage.removeItem(CLAVE_WHATSAPP_ABIERTO);

    obtenerElemento("pantallaGracias").hidden = true;
    obtenerElemento("portadaSobre").hidden = true;
    obtenerElemento("invitacion").hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   16. PREPARAR EL MENSAJE DE CONFIRMACIÓN PARA WHATSAPP
   ========================================================= */
function crearMensajeConfirmacion(nombres) {
    const genero =
        prediccionElegida === "nino" ? "niño" : "niña";

    const nombreSugerido =
        nombreElegido || "Todavía no elegí un nombre";

    const fechaTexto =
        `${CONFIGURACION_EVENTO.diaVisible.toLowerCase()} ` +
        `${CONFIGURACION_EVENTO.fechaVisible.toLowerCase()} ` +
        `a las ${CONFIGURACION_EVENTO.horarioVisible.toLowerCase()}`;

    return [
        "¡Hola! Confirmo mi asistencia a la revelación de género.",
        "",
        `*Invitado:* ${nombres.join(", ")}`,
        "",
        `*Mi predicción:* para mí va a ser ${genero} y se va a llamar ${nombreSugerido}.`,
        "",
        `¡Nos vemos el 14 de noviembre para descubrir la sorpresa! 🎉`
    ].join("\n");
}


/* =========================================================
   17. VALIDAR LA CONFIRMACIÓN Y ABRIR WHATSAPP
   ========================================================= */
function validarConfirmacionPorWhatsApp(evento) {
    evento.preventDefault();

    const estado = obtenerElemento("estadoConfirmacion");

    estado.replaceChildren();
    estado.textContent = "";

    if (!prediccionElegida) {
        estado.textContent =
            "Primero completá los juegos para registrar tu predicción.";

        obtenerElemento("juego").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }

    const campos = Array.from(
        obtenerElemento("invitados")
            .querySelectorAll(".input-invitado")
    );

    const campoVacio = campos.find(
        (campo) => campo.value.trim() === ""
    );

    if (campos.length === 0 || campoVacio) {
        estado.textContent =
            "Completá todos los nombres o quitá los campos que no vayas a usar.";

        if (campoVacio) campoVacio.focus();

        return;
    }

    const nombres = campos.map(
        (campo) => campo.value.trim()
    );

    const numero =
        CONFIGURACION_EVENTO.numeroWhatsApp.replace(/\D/g, "");

    if (
        !numero ||
        numero.includes("XXXXXXXX") ||
        numero.length < 8
    ) {
        estado.textContent =
            "Para activar WhatsApp, agregá el número de contacto en CONFIGURACION_EVENTO, en script.js.";

        return;
    }

    const mensaje = crearMensajeConfirmacion(nombres);

    const urlWhatsApp =
        `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    // La pantalla final aparece cuando la persona vuelve a esta pestaña.
    sessionStorage.setItem(CLAVE_CONFIRMACION, "1");
    sessionStorage.removeItem(CLAVE_WHATSAPP_ABIERTO);

    const ventanaWhatsApp = window.open(urlWhatsApp, "_blank");

    if (ventanaWhatsApp) {
        ventanaWhatsApp.opener = null;

        estado.textContent =
            "WhatsApp se abrió con el mensaje preparado. Revisalo y tocá Enviar para confirmar.";

    } else {
        estado.textContent =
            "El navegador bloqueó la ventana emergente. Abrí WhatsApp desde este enlace: ";

        const enlace = document.createElement("a");

        enlace.href = urlWhatsApp;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "Abrir WhatsApp";

        enlace.addEventListener("click", () => {
            sessionStorage.setItem(CLAVE_CONFIRMACION, "1");
            sessionStorage.removeItem(CLAVE_WHATSAPP_ABIERTO);
        });

        estado.appendChild(enlace);
    }
}


/* =========================================================
   18. DETECTAR EL REGRESO DESDE WHATSAPP
   ========================================================= */
function configurarRetornoDeWhatsApp() {
    if (sessionStorage.getItem(CLAVE_CONFIRMACION) === "1") {
        mostrarPantallaGracias();
    }

    document.addEventListener("visibilitychange", () => {
        if (
            document.visibilityState === "hidden" &&
            sessionStorage.getItem(CLAVE_CONFIRMACION) === "1"
        ) {
            sessionStorage.setItem(CLAVE_WHATSAPP_ABIERTO, "1");
        }

        if (
            document.visibilityState === "visible" &&
            sessionStorage.getItem(CLAVE_CONFIRMACION) === "1" &&
            sessionStorage.getItem(CLAVE_WHATSAPP_ABIERTO) === "1"
        ) {
            mostrarPantallaGracias();
        }
    });
}


/* =========================================================
   19. ANIMACIÓN DE CONFETI
   ========================================================= */
function lanzarConfeti() {
    for (let indice = 0; indice < 36; indice++) {
        const pieza = document.createElement("i");

        pieza.className = "confeti";
        pieza.setAttribute("aria-hidden", "true");

        pieza.style.left = `${Math.random() * 100}vw`;

        pieza.style.animationDuration =
            `${2.4 + Math.random() * 2.2}s`;

        pieza.style.animationDelay =
            `${Math.random() * 0.5}s`;

        document.body.appendChild(pieza);

        window.setTimeout(() => pieza.remove(), 5200);
    }
}


/* =========================================================
   20. CONECTAR LOS BOTONES Y FORMULARIOS
   ========================================================= */
function configurarInteracciones() {
    obtenerElemento("botonEmpezarJuego")
        .addEventListener("click", abrirJuego);

    obtenerElemento("botonCerrarJuego")
        .addEventListener("click", cerrarJuego);

    obtenerElemento("fondoModal")
        .addEventListener("click", cerrarJuego);

    obtenerElemento("botonSiguienteJuego")
        .addEventListener("click", irAlJuegoDeNombres);

    obtenerElemento("botonFinalizarJuego")
        .addEventListener("click", finalizarJuego);

    obtenerElemento("botonVolverAJugar")
        .addEventListener("click", volverAJugar);

    document.querySelectorAll("[data-prediccion]").forEach((boton) => {
        boton.addEventListener("click", () => {
            elegirPrediccion(boton.dataset.prediccion);
        });
    });

    obtenerElemento("formConfirmacion")
        .addEventListener("submit", validarConfirmacionPorWhatsApp);

    obtenerElemento("volverInvitacion")
        .addEventListener("click", volverALaInvitacion);

    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            !obtenerElemento("modalJuego").hidden
        ) {
            cerrarJuego();
        }
    });
}


/* =========================================================
   21. INICIAR LA INVITACIÓN
   ========================================================= */
configurarAperturaSobre();
cargarDatosDelEvento();
actualizarCuentaRegresiva();

window.setInterval(actualizarCuentaRegresiva, 1000);

configurarInteracciones();
configurarRetornoDeWhatsApp();
