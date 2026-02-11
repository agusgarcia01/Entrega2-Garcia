const TIEMPO_COMPRA = 10 * 60 * 1000;
const id = Number(localStorage.getItem("recitalInfo"));
let recitales = [];


const recitalesLS = localStorage.getItem("recitales");
if(recitalesLS){
    const data = JSON.parse(recitalesLS);
    recitales = data.map(r=>{
        const rec = new recital (r.banda, r.precio, r.stock, r.flyer, r.info);
        rec.id = r.id;
        rec.bloqueado = 0;
        return rec;
    });
    if (recitales.length > 0) {
    recital.ultimoId = Math.max(...recitales.map(r => r.id));
    }
}

const recitalId = Number(localStorage.getItem("recitalInfo"));
const recitalSeleccionado = recitales.find(r => r.id === recitalId);



if(!recitalSeleccionado)alert("No se econtro el recital");


document.getElementById("titulo").textContent = recitalSeleccionado.banda;
document.getElementById("flyer").src = `./img/${recitalSeleccionado.flyer}`;
document.getElementById("info").textContent = recitalSeleccionado.info;
document.getElementById("precio").textContent = `Tickets dede: $${recitalSeleccionado.precio}`;

const div = document.getElementById("infoContainer");

function createHtml(el){
    const comprar = document.createElement("div");
    comprar.classList.add("comprar");
    comprar.dataset.id = el.id;

    comprar.innerHTML = `
        <div class="agotadoInfo">AGOTADO</div>
        <p class="disponibilidad"></p>

        <div class="contador">
            <button class="btn-restar">-</button>
            <span class="cantidad">1</span>
            <button class="btn-sumar">+</button>
        </div>

        <div class="card-action">
            <button class="btn-agregar">Comprar</button>
        </div>

    `;

    div.appendChild(comprar);
}


const infoContainer = document.getElementById("infoContainer");

infoContainer.addEventListener("click", (e)=>{
    const comprar = e.target.closest(".comprar");
    if(!comprar)return;

    const spanCantidad = comprar.querySelector(".cantidad");
    let cantidad = Number(spanCantidad.textContent);

    if(e.target.classList.contains("btn-sumar")){
        if(cantidad < recitalSeleccionado.disponible()){
            spanCantidad.textContent = cantidad+1;
            actualizarControlesCantidad(comprar, recitalSeleccionado);
            actualizarEstadoInfo(recitalSeleccionado);
        }
    }

    if(e.target.classList.contains("btn-restar")){
        if(cantidad > 1){
            spanCantidad.textContent = cantidad-1;
            actualizarControlesCantidad(comprar, recitalSeleccionado);
            actualizarEstadoInfo(recitalSeleccionado);
        }
    }

    if(e.target.classList.contains("btn-agregar")){
        
        const estabaVacio = carrito.length === 0;
        
        agregarAlCarrito(recitalSeleccionado, cantidad);
        guardarCarrito();
        

        if(estabaVacio){
            iniciarTimerVisual();
        }

        mostrarCarrito();
        actualizarContador();
        spanCantidad.textContent = 1;
        actualizarControlesCantidad(comprar, recitalSeleccionado);
        actualizarEstadoInfo(recitalSeleccionado); 
        carritoDiv.classList.remove("oculto")
    }
    
})

function actualizarEstadoInfo(recitalSeleccionado){
    const comprarDiv = document.querySelector('.comprar');
    if (!comprarDiv) {
        console.error("No hay ningún elemento .comprar en la página");
        return;
    }
    
    const disponibilidad = comprarDiv.querySelector('.disponibilidad');
    if (!disponibilidad) {
        console.error("No se encontró .disponibilidad dentro de .comprar");
        return;
    }
    
    const disponibles = recitalSeleccionado.disponible();
    console.log("Disponibles:", disponibles);
    
    if (disponibles <= 5 && disponibles > 0) {
        disponibilidad.textContent = `Quedan ${disponibles} entradas!`;
        disponibilidad.classList.add('ultimas');
        console.log("Texto establecido en:", disponibilidad.textContent);
    } else {
        disponibilidad.textContent = "";
        disponibilidad.classList.remove('ultimas');
    }
}

const btnVolver = document.getElementById("volver");
if(btnVolver){
    btnVolver.addEventListener("click", function() {
        window.location.href = `index.html`;
    })
}


createHtml(recitalSeleccionado);
actualizarEstadoCard(recitalSeleccionado);
actualizarEstadoInfo(recitalSeleccionado); 