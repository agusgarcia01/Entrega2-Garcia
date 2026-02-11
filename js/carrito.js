let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

document.addEventListener("DOMContentLoaded", ()=>{
    cargarCarrito();
})

///FUNCIONES CARRITO///

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
    guardarCarrito();
}

function eliminarDelCarrito(id){
    const index = carrito.findIndex(item => item.id === id);
    
    if(index !== -1){
        liberarStock(id, carrito[index].cantidad);
        carrito.splice(index, 1);

        const rec = recitales.find(r=>r.id === id);
        actualizarEstadoCard(rec);
    }
    guardarCarrito();
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
    if(!listaCarrito)return;

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
    if(!timerCarrito)return;

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
    if(!contadorCarrito)return;

    let total = 0;

    for (const item of carrito) {
        total += item.cantidad;
    }

    contadorCarrito.textContent = total;
}

function cargarCarrito(){
    const data = JSON.parse(localStorage.getItem("carrito"));

    if(!data){
        carrito=[];
        return; 
    }

    const tiempoTranscurrido = Date.now() - data.inicio;

    if(tiempoTranscurrido>TIEMPO_COMPRA){

        if(data.carrito){
            data.carrito.forEach(item=>{
                liberarStock(item.id, item.cantidad);
            })
        }
        localStorage.removeItem("carrito");
        carrito = [];
        alert("Se vencio su tiempo para finalizar la compra!");
        return;
    }

    carrito = data.carrito || []; 

    recitales.forEach(r=>r.bloqueado=0);
    restaurarBloqueadoStock();

    recitales.forEach(actualizarEstadoCard)
    mostrarCarrito();
    actualizarContador();
    iniciarTimerVisual();
}


function guardarCarrito(){
    const dataExistente = JSON.parse(localStorage.getItem("carrito"))

    const data = {
        carrito: carrito,
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

function actualizarControlesCantidad(container, recital){
    const btnSumar = container.querySelector(".btn-sumar");
    const btnRestar = container.querySelector(".btn-restar");
    const spanCantidad = container.querySelector(".cantidad");

    if(!btnSumar||!btnRestar||!spanCantidad)return;

    const cantidad = Number(spanCantidad.textContent);

    btnRestar.disabled = cantidad<=1;
    btnSumar.disabled = cantidad>=recital.disponible();
}



function actualizarEstadoCard(recital) {
    const card = document.querySelector(`.card[data-id="${recital.id}"]`);
    
    if (card) {
        const btnAgregar = card.querySelector(".btn-agregar");
        const btnSumar = card.querySelector(".btn-sumar");
        const agotado = card.querySelector(".agotado");
        const disponibilidad = card.querySelector(".disponibilidad");

        const disponibles = recital.disponible();

        if (disponibles === 0) {
            btnAgregar.disabled = true;
            btnSumar.disabled = true;
            agotado.style.display = "flex";
            disponibilidad.textContent = "";
        } else {
            btnAgregar.disabled = false;
            btnSumar.disabled = false;
            agotado.style.display = "none";

            if (disponibles <= 5) {
                disponibilidad.textContent = `Quedan ${disponibles} entradas!`;
                disponibilidad.className = "disponibilidad ultimas";
            } else {
                disponibilidad.textContent = "";
                disponibilidad.className = "disponibilidad";
            }
        }
    }

    const comprarDiv = document.querySelector(`.comprar[data-id="${recital.id}"]`);
    
    if (comprarDiv) {
        const btnAgregar = comprarDiv.querySelector(".btn-agregar");
        const btnSumar = comprarDiv.querySelector(".btn-sumar");
        const agotadoInfo = comprarDiv.querySelector(".agotadoInfo");
        const disponibilidad = comprarDiv.querySelector(".disponibilidad");

        const disponibles = recital.disponible();

        if (disponibles === 0) {
            btnAgregar.disabled = true;
            btnSumar.disabled = true;
            if (agotadoInfo) agotadoInfo.style.display = "block";
            if (disponibilidad) disponibilidad.textContent = "";
        } else {
            btnAgregar.disabled = false;
            btnSumar.disabled = false;
            if (agotadoInfo) agotadoInfo.style.display = "none";

            if (disponibles <= 5) {
                if (disponibilidad) {
                    disponibilidad.textContent = `Quedan ${disponibles} entradas!`;
                    disponibilidad.className = "disponibilidad ultimas";
                }
            } else {
                if (disponibilidad) {
                    disponibilidad.textContent = "";
                    disponibilidad.className = "disponibilidad";
                }
            }
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

