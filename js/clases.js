
class recital {
    static ultimoId = 0;
    
    constructor(banda, precio, stock, flyer, info) {
        this.banda = banda;
        this.precio = precio;
        this.stock = stock;
        this.bloqueado = 0;
        this.id = ++recital.ultimoId;
        this.flyer = flyer;
        this.info = info;
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
    
};
