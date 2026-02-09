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

const recital1 = new recital("GEDE", 25000, 150, "gede.png", "Recital de Rock");
const recital2 = new recital("Este Verano", 23000, 150, "gede.png", "Recital de Rock");


const recitales = [recital1, recital2];

const contenedor = document.getElementById("contenedor");


document.addEventListener("DOMContentLoaded", () =>{
    cargarCarrito();
})

function createHtml(el) {

    const card = document.createElement("div");
    card.classList.add("card")
    card.dataset.id = el.id;

    card.innerHTML = `    
        <img src="./img/${el.flyer}" alt="${el.banda}">
        <hr>
        <h3>${el.banda}</h3>
        <p>Precio: $${el.precio}</p>

        <div class="contador">
            <button class="btn-restar">-</button>
            <span class="cantidad">1</span>
            <button class="btn-sumar">+</button>
        </div>

        <div class="card-action">
            <button class="btn-agregar">Comprar</button>
            <button class="btn">Info</button>
        </div>
        
    `;

    contenedor.appendChild(card);
/*
    const btnSumar = card.querySelector(".btn-sumar");
    const btnRestar = card.querySelector(".btn-restar");
    const spanCantidad = card.querySelector(".cantidad");
    
    let cantidad = 1;
*/
  
    /*

    btnSumar.addEventListener("click", () => {
        if (cantidad < el.stock) {
            cantidad++;
            spanCantidad.textContent = cantidad;
        }
    });

    btnRestar.addEventListener("click", () => {
        if (cantidad > 1) {
            cantidad--;
            spanCantidad.textContent = cantidad
        }
    })

    const btnAgregar = card.querySelector(".btn-agregar");
    btnAgregar.addEventListener("click", () => {
        agregarAlCarrito(el, cantidad);
        
    })
*/

}


  contenedor.addEventListener("click", (e) =>{
    const card = e.target.closest(".card");
    if(!card)return;

    const id = Number(card.dataset.id);
    const recital = recitales.find(r=>r.id === id);

    const spanCantidad = card.querySelector(".cantidad");
    let cantidad = Number(spanCantidad.textContent);

    if(e.target.classList.contains("btn-sumar")){
        if(cantidad < recital.stock){
            spanCantidad.textContent = cantidad+1;
        }
    }

    if(e.target.classList.contains("btn-restar")){
        if(cantidad >= 1){
            spanCantidad.textContent = cantidad-1;
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
        spanCantidad.textContent = 1;
        carritoDiv.classList.remove("oculto")
    }
    
})



recitales.forEach(r => createHtml(r));


function mostrarRecital(recital) {
    createHtml(recital)
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

}

function eliminarDelCarrito(id){
    const index = carrito.findIndex(item => item.id === id);
    
    if(index !== -1){
        liberarStock(id, carrito[index].cantidad);
        carrito.splice(index, 1);
    }
}

function restarDelCarrito(id){
    const index = carrito.findIndex(item => item.id == id);

    if(!item)return;

    item.cantidad--;

    if(item.cantidad===0){
        guardarCarrito();
        eliminarDelCarrito(id);
    }

}


function vaciarCarrito() {
    carrito = [];
    localStorage.removeItem("carrito");
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

    console.log(recitales[1]);
}

listaCarrito.addEventListener("click", (e) =>{
    
    const li = e.target.closest("li");
    if(!li)return;

    const id = Number(li.dataset.id);
    const item = carrito.find(p => p.id === id);

    if(e.target.classList.contains("carrito-sumar")){
        const rec = recitales.find(r=>r.id===item.id)   
        if(rec){
            item.cantidad++;
            rec.bloqueado++;
        } 
    }


    if(e.target.classList.contains("carrito-restar")){
        if(item.cantidad>1){
            item.cantidad--;
            liberarStock(item.id, 1);
        }else{
            eliminarDelCarrito(id)
        }
    }

    if(e.target.classList.contains("carrito-eliminar")){
        eliminarDelCarrito(id);
    }

    guardarCarrito();
    mostrarCarrito();

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

    alert("Compra realizada con exito!");
    carrito=[];
    mostrarCarrito();
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
            })

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

/// STOCk

function liberarStock(recitalId, cantidad){
    const rec = recitales.find(r=> r.id === recitalId);
    if(rec) {
        rec.bloqueado -= cantidad;
        if(rec.bloqueado < 0) rec.bloqueado =0;
    }
}