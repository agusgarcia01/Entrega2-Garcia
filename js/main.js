
const recitales = ["Guns'n Roses", "AC/DC", "Megadeath"]
const precios = [20000, 25000, 18000];
const stock = [50, 30, 8];


let opcion;

do{
    opcion = menu()
    
    if(opcion == 1){
        let mensaje = mostrarCartelera();
        do{
            opcion = prompt(mensaje + "\nIngrese 1 para Volver");
        }while(opcion !=1)
        
    } else if(opcion == 2){
        let cantidad=0;
        let recital = -1;
        do{
            recital = parseInt(prompt("---BOLETERIA---\n" + mostrarCartelera() + "\n"+ "0. Volver\n" +"Seleccione un recital: "))
            if(recital>0 && recital<=recitales.length){
                cantidad = parseInt(prompt("Ingrese la cantidad de entradas que desea comprar: "))
                
                if(comprarEntradas(recital, cantidad)){
                    alert("Compra exitosa!")
                }else{
                    alert("No contamos con esa cantidad de entradas disponibles")
                }
                opcion = menu()
            }

        }while(recital!=0);

    }   else if(opcion == 3){
            alert("Muchas gracias por su visita!")
    }


}while(opcion!=3)



function menu(){
    opcion = prompt("Elije una opcion: \n1. Ver cartelera \n2. Comprar entradas \n3. Salir");
    return opcion
}

function mostrarCartelera(){
    let mensaje = "   RECITALES 2026   \n"
    let i;

    for(i=0; i < recitales.length; i++){
        mensaje += i+1 + ". " + recitales[i] + ". Precio: $" + precios[i] + ". Tickets disponibles: " + stock[i] + "\n";
    }

    return(mensaje)
}

function comprarEntradas(i, cantidad){
    if(stock[i-1]>=cantidad && cantidad>=1 ){
        stock[i-1]-=cantidad;
        return true;
    }
    return false;
}