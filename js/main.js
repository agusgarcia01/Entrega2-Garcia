const TIEMPO_COMPRA = 10 * 60 * 1000;

const recital1 = new recital("GEDE", 25000, 4, "gede.jpg", "GEDE es una banda de rock formada en Mar del Plata a fines de 2024. Con influencias del rock nacional y del sonido alternativo contemporáneo, propone una experiencia artística que fusiona energía cruda en su estilo, imagen y música, con letras cargadas de emociones y vivencias contemporáneas. Su propuesta va más allá de lo musical: está acompañada por una estética y un sonido propios que buscan dejar en claro que GEDE no es solo una banda, sino una identidad con la que invitan a sus oyentes a sentirse parte. El 31 de agosto de 2025 estrenaron su primer single, Cristales Rotos, marcando el inicio de un camino donde la intensidad y la autenticidad son bandera, con la intención de renovar la escena del rock argentino desde una actitud provocadora y arrolladora.");
const recital2 = new recital("Este Verano No Fui A La Playa", 23000, 15, "este-verano.jpg", "Este Verano No Fui A La Playa es una banda de indie pop y Surf Rock formada en la ciudad costera de Mar Del Plata. Sus canciones relatan la vida cerca de la playa y las historias de un invierno frio marplatense.");
const recital3 = new recital("Aurelio y los Casi Estatua", 22000, 8, "aure.jpg", "Aurelio y los Casi Estatua es una banda de Rock con sonidos que se remiten a las bases del genero , pero pasada por el lente de jovenes artistas con ganas de explorar este universo musical.")
const recital4 = new recital("Mar del Pop", 50000, 0, "mardelpop.jpg", "Reafirmando su lugar como uno de los encuentros musicales más relevantes del verano en la costa atlántica, Mar del Pop anunció su line up para la edición de este 2026. La grilla se destaca por combinar a reconocidos artistas y la nueva escena atravesando los géneros pop, funk, rock, electrónica y nuevas expresiones urbanas.<br><br>En vivo: Dante Spinetta, Six Sex, Buenos Vampiros, Winona Riders, Militantes del Climax, Loquero, Richard Coleman, Pipo Cipolatti, Juana Rozas, Benito Cerati, Fea, Las Tussi, Atrás Hay Truenos, Maniobras, Tomates en Verano, Uma, Chechi de Marcos, Marchitorial, Este Verano No Fui a la Playa, Fiah Miau, Zoot, Placeres, Cartas a Mi, Gilda Manson, Trazar Diamantes, No Te Me Enojes, Rata Viva Muerta")


let recitales = [recital1, recital2,recital3, recital4];


const recitalesLS = localStorage.getItem("recitales");
if(recitalesLS){
    const data = JSON.parse(recitalesLS);
    recitales = data.map(r=>{
        const rec = new recital (r.banda, r.precio, r.stock, r.flyer, r.info);
        rec.id = r.id;
        rec.bloqueado = r.bloqueado || 0;
        return rec;
    });
    if (recitales.length > 0) {
        recital.ultimoId = Math.max(...recitales.map(r => r.id));
    }
} else {
    recitales = [recital1, recital2, recital3, recital4];
    
    recitales.forEach((r, index) => {
        r.id = index + 1;
    });
    
    const recitalesParaGuardar = recitales.map(r => ({
        id: r.id,
        banda: r.banda,
        precio: r.precio,
        stock: r.stock,
        flyer: r.flyer,
        info: r.info,
        bloqueado: r.bloqueado || 0
    }));
    
    localStorage.setItem("recitales", JSON.stringify(recitalesParaGuardar));
    
    recital.ultimoId = Math.max(...recitales.map(r => r.id));
}

console.log("Recitales cargados:", recitales);
console.log("IDs disponibles:", recitales.map(r => r.id));

const contenedor = document.getElementById("contenedor");



function createHtml(el) {
    
    const card = document.createElement("div");
    card.classList.add("card")
    card.dataset.id = el.id;

    card.innerHTML = `    
        <div class="agotado">AGOTADO</div>
        <img src="./img/${el.flyer}" alt="${el.banda}">
        <hr>
        <h3>${el.banda}</h3>
        <p>Precio: $${el.precio}</p>
        <p class="disponibilidad"></p>

        <div class="contador">
            <button class="btn-restar">-</button>
            <span class="cantidad">1</span>
            <button class="btn-sumar">+</button>
        </div>

        <div class="card-action">
            <button class="btn-agregar">Comprar</button>
            <button class="btn-info">Info</button>
        </div>
        
    `;

    contenedor.appendChild(card);
}

contenedor.addEventListener("click", (e) =>{
    const card = e.target.closest(".card");
    if(!card)return;

    if(e.target.classList.contains("btn-info")){
        const id = Number(card.dataset.id);
        localStorage.setItem("recitalInfo", id);
        window.location.href = "info.html"
    }
})

document.addEventListener("DOMContentLoaded", () =>{
    cargarCarrito();
})


  contenedor.addEventListener("click", (e) =>{
    const card = e.target.closest(".card");
    if(!card)return;

    const id = Number(card.dataset.id);
    const recital = recitales.find(r=>r.id === id);

    if(!recital){
        console.error("No se encontro el recital.")
        return;
    }

    const spanCantidad = card.querySelector(".cantidad");
    let cantidad = Number(spanCantidad.textContent);


    if(e.target.classList.contains("btn-sumar")){
        if(cantidad < recital.disponible()){
            spanCantidad.textContent = cantidad+1;
            actualizarControlesCantidad(card, recital);
        }
    }

    if(e.target.classList.contains("btn-restar")){
        if(cantidad > 1){
            spanCantidad.textContent = cantidad-1;
            actualizarControlesCantidad(card, recital);
        }
    }

    if(e.target.classList.contains("btn-agregar")){
        
        const estabaVacio = carrito.length === 0;
        
        agregarAlCarrito(recital, cantidad);
        guardarCarrito();
        

        if(estabaVacio){
            iniciarTimerVisual();
        }

        mostrarCarrito();
        actualizarContador();
        spanCantidad.textContent = 1;
        actualizarControlesCantidad(card, recital);
        carritoDiv.classList.remove("oculto")
    }
    
})



recitales.forEach(r => {
    createHtml(r);
    actualizarEstadoCard(r);
});


function mostrarRecital(recital) {
    createHtml(recital)
    actualizarEstadoCard();
}


function mostrarCartelera(recitales) {

    for (i = 0; i < recitales.length; i++) {
        mostrarRecital(recitales[i]);
    }

}

function comprarEntradas(i, cantidad) {
    if (stock[i - 1] >= cantidad && cantidad >= 1) {
        stock[i - 1] -= cantidad;
        return true;
    }
    return false;
}

