let id = 0;
const TIEMPO_COMPRA = 10 * 60 * 1000;
let carrito = [];


class recital {
    constructor(banda, precio, stock, flyer, info) {
        this.banda = banda;
        this.precio = precio;
        this.stock = stock;
        this.bloqueado = 0;
        this.flyer = flyer;
        this.info = info;
        this.id = ++id;
    }

    disponible(){
        return this.stock - this.bloqueado;
    }

    vender(cantidad){
        return this.stock-=cantidad;
    }

    toString() {
        return `Banda: ${this.banda}, Precio: ${this.precio}, Entradas Disponibles: ${this.stock}`;
    }
    
}

const recital1 = new recital("GEDE", 25000, 10, "gede.png", "GEDE es una banda de rock formada en Mar del Plata a fines de 2024. Con influencias del rock nacional y del sonido alternativo contemporáneo, propone una experiencia artística que fusiona energía cruda en su estilo, imagen y música, con letras cargadas de emociones y vivencias contemporáneas. Su propuesta va más allá de lo musical: está acompañada por una estética y un sonido propios que buscan dejar en claro que GEDE no es solo una banda, sino una identidad con la que invitan a sus oyentes a sentirse parte. El 31 de agosto de 2025 estrenaron su primer single, Cristales Rotos, marcando el inicio de un camino donde la intensidad y la autenticidad son bandera, con la intención de renovar la escena del rock argentino desde una actitud provocadora y arrolladora.");
const recital2 = new recital("Este Verano", 23000, 15, "gede.png", "Recital de Rock");


let recitales = [recital1, recital2];


const recitalesLS = localStorage.getItem("recitales");
if(recitalesLS){
    const data = JSON.parse(recitalesLS);
    recitales = data.map(r=>{
        const rec = new recital (r.banda, r.precio, r.stock, r.flyer, r.info);
        rec.id = r.id;
        rec.bloqueado = 0;
        return rec;
    });
    id = Math.max(...recitales.map(r =>id));
}

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



////CARRITO DE COMPRAS////

function agregarAlCarrito(recital, cantidad) {
    if (recital.disponible() < cantidad) {
        alert("No hay entradas disponibles")
        return;
    }

    recital.bloqueado += cantidad;

    const item = carrito.find(i => i.id === recital.id);
    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({
            id: recital.id,
            banda: recital.banda,
            cantidad: cantidad,
            precio: recital.precio
        })
    }
    guardarRecitales();
    actualizarEstadoCard(recital);
}

function eliminarDelCarrito(id){
    const index = carrito.findIndex(item => item.id === id);
    
    if(index !== -1){
        liberarStock(id, carrito[index].cantidad);
        carrito.splice(index, 1);

        const rec = recitales.find(r=>r.id === id);
        actualizarEstadoCard(rec);
    }
}


function vaciarCarrito() {
    for (const item of carrito) {
        liberarStock(item.id, item.cantidad);
    }
    carrito = [];
    localStorage.removeItem("carrito");
    recitales.forEach(actualizarEstadoCard);

    clearInterval(intervaloTimer);
    timerCarrito.textContent="";
    mostrarCarrito();
    actualizarContador();
}


const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");


function mostrarCarrito(){
    listaCarrito.innerHTML = "";
    let total = 0;

    if(carrito.length===0){
        totalCarrito.textContent="Total: $0";
    }

    for (const item of carrito) {
        const li = document.createElement("li");
        li.dataset.id = item.id;

        li.innerHTML = `
            <span>${item.banda}</span>
            <button class="carrito-restar">-</button> 
            <span>${item.cantidad}</span>
            <button class="carrito-sumar">+</button> 
            <span>$${item.precio * item.cantidad}</span>
            <button class="carrito-eliminar">❌</button>    
        `;
        listaCarrito.appendChild(li);
        total += item.precio*item.cantidad;

    }

    totalCarrito.textContent = `Total: $${total}`

    console.log(recitales);
}

listaCarrito.addEventListener("click", (e) =>{
    
    const li = e.target.closest("li");
    if(!li)return;

    const id = Number(li.dataset.id);
    const item = carrito.find(p => p.id === id);

    if(e.target.classList.contains("carrito-sumar")){
        const rec = recitales.find(r=>r.id===item.id)   
        if(rec){
            agregarAlCarrito(rec, 1);
        } 
        actualizarEstadoCard(rec);

    }


    if(e.target.classList.contains("carrito-restar")){
        const rec = recitales.find(r=>r.id === item.id);
        if(!rec)return;

        if(item.cantidad>1){
            item.cantidad--;
            liberarStock(item.id, 1);
        }else{
            eliminarDelCarrito(id);
        }
        actualizarEstadoCard(rec);

        if(carrito.length===0){
            vaciarCarrito(); 
        }
    }

    if(e.target.classList.contains("carrito-eliminar")){
        eliminarDelCarrito(id);
        if(carrito.length===0){
            vaciarCarrito();
        }
    }

    guardarCarrito();
    mostrarCarrito();
    actualizarContador();

})

const btnCerrar = document.getElementById("btnCerrar");
btnCerrar.addEventListener("click", () =>
    carritoDiv.classList.toggle("oculto")
)

const btnVaciar = document.getElementById("btnVaciar");
btnVaciar.addEventListener("click", vaciarCarrito);

const btnCarrito = document.getElementById("btnCarrito");
const carritoDiv = document.getElementById("carrito");

const btnComprar = document.getElementById("btnComprar");
btnComprar.addEventListener("click", comprar);

btnCarrito.addEventListener("click", () => {
    mostrarCarrito();
    carritoDiv.classList.toggle("oculto")
})

function comprar(){
    if(carrito.length === 0)return;

    venderEntradas();
    finalizarCompra();
    
    alert("Compra realizada con exito!");
}


/// FUNCIONES DEL TIMER

let intervaloTimer;
const timerCarrito = document.getElementById("timerCarrito");

function iniciarTimerVisual(){

    clearInterval(intervaloTimer);

    intervaloTimer = setInterval(()=>{
        const data = JSON.parse(localStorage.getItem("carrito"));
        if(!data){
            timerCarrito.textContent='';
            return;
        }

        const restante = TIEMPO_COMPRA - (Date.now() - data.inicio);

        if(restante<= 0){
            clearInterval(intervaloTimer);

            carrito.forEach(item=>{
                liberarStock(item.id, item.cantidad);
            });

            recitales.forEach(actualizarEstadoCard);

            localStorage.removeItem("carrito");
            vaciarCarrito();
            mostrarCarrito();
            actualizarContador();
            timerCarrito.textContent = "Tiempor restante: 00:00";
            alert("Finalizo su tiempo de compra");
        }else{
            timerCarrito.textContent = `Tiempo restante: ${formatearTiempo(restante)}`
        }
    }, 1000);
}

function formatearTiempo(ms){
    const totalSegundos = Math.ceil(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;

    return `${minutos}:${segundos.toString().padStart(2, "0")}`
}

function actualizarContador(){
    let total = 0;

    for (const item of carrito) {
        total += item.cantidad;
    }

    contadorCarrito.textContent = total;
}

function cargarCarrito(){
    const data = JSON.parse(localStorage.getItem("carrito"));

    if(!data)return;

    const tiempoTranscurrido = Date.now() - data.inicio;

    if(tiempoTranscurrido>TIEMPO_COMPRA){
        localStorage.removeItem("carrito");
        carrito = [];
        alert("Se vencio su tiempo para finalizar la compra!");
    }else{
        carrito = data.carrito; 
    }

    restaurarBloqueadoStock();

    recitales.forEach(actualizarEstadoCard)
    mostrarCarrito();
    actualizarContador();
    iniciarTimerVisual();
}


function guardarCarrito(){
    const dataExistente = JSON.parse(localStorage.getItem("carrito"))

    const data = {
        carrito,
        inicio: dataExistente?.inicio || Date.now()
    };

    localStorage.setItem("carrito", JSON.stringify(data));
}

function guardarRecitales(){
    const data = recitales.map(r=>({
        id: r.id,
        banda: r.banda,
        precio: r.precio,
        stock: r.stock,
        flyer: r.flyer,
        info: r.info
    }))
    localStorage.setItem("recitales", JSON.stringify(data));
}

function restaurarBloqueadoStock(){
    for(const item of carrito){
        const recital = recitales.find(r=>r.id===item.id);
        if(recital){
            recital.bloqueado += item.cantidad;
        }
    }
}


/// STOCk

function liberarStock(recitalId, cantidad){
    const rec = recitales.find(r=> r.id === recitalId);
    if(rec) {
        rec.bloqueado -= cantidad;
        guardarRecitales();
        if(rec.bloqueado < 0) rec.bloqueado =0;
    }
}

function finalizarCompra(){
    carrito = [];
    localStorage.removeItem("carrito");

    clearInterval(intervaloTimer);  
    timerCarrito.textContent="";

    mostrarCarrito()
    actualizarContador();

    carritoDiv.classList.add("oculto");
}

function venderEntradas(){
    for (const item of carrito) {
        const rec = recitales.find(r=>r.id === item.id);
        if(rec){
            rec.bloqueado-= item.cantidad;
            rec.stock -= item.cantidad;
            guardarRecitales();
            if(rec.bloqueado<0)rec.bloqueado = 0;
        }        
    }
}

function actualizarControlesCantidad(card, recital){
    const btnSumar = card.querySelector(".btn-sumar");
    const btnRestar = card.querySelector(".btn-restar");
    const spanCantidad = card.querySelector(".cantidad");

    if(!btnSumar||!btnRestar||!spanCantidad)return;

    const cantidad = Number(spanCantidad.textContent);

    btnRestar.disabled = cantidad<=1;
    btnSumar.disabled = cantidad>=recital.disponible();
}

function actualizarEstadoCard(recital){
    const card = document.querySelector(`.card[data-id="${recital.id}"]`)
    if(!card)return;

    const btnAgregar = card.querySelector(".btn-agregar");
    const btnSumar = card.querySelector(".btn-sumar");
    const agotado = card.querySelector(".agotado");
    const disponibilidad = card.querySelector(".disponibilidad");

    const disponibles = recital.disponible();

    if(disponibles===0){
        btnAgregar.disabled = true;
        btnSumar.disabled = true;
        agotado.style.display = "flex";
        disponibilidad.textContent = "";
    }else{
        btnAgregar.disabled = false;
        btnSumar.disabled = false;
        agotado.style.display = "none";

        if(disponibles<=5){
            disponibilidad.textContent = `Quedan ${disponibles} entradas!`
            disponibilidad.className = "disponibilidad ultimas";
        }
        if(disponibles>5){
            disponibilidad.textContent = ""
        }
    }
}

function agregarStock(recitalId, cantidad){
    const rec = recitales.find(r => r.id === recitalId);
    if(!rec) return;

    rec.stock += cantidad;
    guardarRecitales();
    actualizarEstadoCard(rec);
}

function cambiarDescrip(recitalId, descirp){
    const rec = recitales.find(r=> r.id=== recitalId);
    if(!rec)return

    rec.info = descirp;
    guardarRecitales();
}

