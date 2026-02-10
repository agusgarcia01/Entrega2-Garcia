const id = Number(localStorage.getItem("recitalInfo"));
const recitales = JSON.parse(localStorage.getItem("recitales"));

const recital = recitales.find(r => r.id === id);

document.getElementById("titulo").textContent = recital.banda;
document.getElementById("flyer").src = `./img/${recital.flyer}`;
document.getElementById("info").textContent = recital.info;
document.getElementById("precio").textContent = `Tickets dede: $${recital.precio}`;

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

createHtml(recital.id);