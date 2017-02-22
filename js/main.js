/*global cuadro*/
(function() {
    "use strict";
    
    window.addEventListener("popstate", function() {
        if(window.location.hash == "") {
            document.body.className = "";
        } else {
            cargar_hash();
        }
    });
    
    window.addEventListener("load", function() {
        if(window.location.hash != "") {
            cargar_hash();
        }
        document.body.style.display = ""; 
    });
    
    function cargar_hash() {
        var partes = window.location.hash.substring(1).split('-');
        cargar_resultado(parseInt(partes[0], 10), partes[1], parseInt(partes[2], 10));
    }
    
    function calcular(consumo,  compania, ivacomputar) {
        var totales = [];
        var base = 0;
        cuadro.forEach(function(periodo) {
            var i = 0;
            var computar = periodo.bimestral ? consumo : consumo / 2;
            var categoria;
            
            periodo.companias[compania].forEach(function(cat, ind) {
               if(computar >= cat.desde && computar <= cat.hasta) {
                   categoria = cat;
                   i = ind + 1;
               }
            });
            
            
            var fijo = categoria.fijo;
            var variable = computar * categoria.variable;
            
            if(periodo.bimestral) {
                fijo = fijo * 32 / 61;
                variable = variable * 31 / 65;
            }
            
            var subtotal = fijo + variable;
            subtotal += periodo.resEnre;
            
            var contr = subtotal * 0.06383;
            
            var iva =  subtotal * (ivacomputar / 100);
            
            var total = subtotal + contr + iva;

            var aumento;

            if(base == 0) {
                aumento = 0;
                base = total;
            } else {
                aumento = Math.floor(((total - base) /  base) *100) + '%';
            }
            
            total =  (Math.floor(total * 100) /100).toFixed(2) +'$';
            
            totales.push({
               periodo: periodo.nombre,
               monto: total,
               categoria: "R" + i,
               aumento: aumento
            });
        });
        return totales;
    }
    
    function cargar_resultado(consumo, compania, iva) {
        var output = document.getElementsByTagName("tbody")[0];
        while(output.firstChild) {
            output.removeChild(output.firstChild);
        }

        calcular(consumo, compania, iva).forEach(function(item) {
            var tdPeriodo = document.createElement("td");
            tdPeriodo.appendChild(document.createTextNode(item.periodo));
            
            var tdCat = document.createElement("td");
            tdCat.appendChild(document.createTextNode(item.categoria));
            
            var tdMonto = document.createElement("td");
            tdMonto.appendChild(document.createTextNode(item.monto));
            
            var tdAum = document.createElement("td");
            if(item.aumento != 0) {
                tdAum.appendChild(document.createTextNode(item.aumento + "(*)(**)"));
            }
            
            var trEntrada = document.createElement("tr");
            trEntrada.appendChild(tdPeriodo);
            trEntrada.appendChild(tdCat);
            trEntrada.appendChild(tdMonto);
            trEntrada.appendChild(tdAum);
            
            output.appendChild(trEntrada);
        });
        document.body.className = "complete";
    }


    window.consultar = function(form) {
        try {
            
            var consumo = parseInt(form.consumo.value, 10);
            var compania = form.compania.value;
            var iva = parseInt(form.iva.value, 10);
            
            cargar_resultado(consumo, compania, iva);

            window.history.pushState(null, null, "#" + consumo + "-" + compania + "-" + iva);
            return false;
        } catch(error) {
            console.error(error.message);
            return false;
        }
    };
    
}());