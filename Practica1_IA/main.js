//////////////////////////////// Treant ///////////////////////////////////////
//Datos de matriz a datos de tabla
matrixToTable = (matriz, pos = null) => {
  const tabla = document.createElement("table");
  tabla.classList.add("matrix-table");

  matriz.forEach((fila, ix) => {
    const tr = document.createElement("tr");
    fila.forEach((columna, ij) => {
      const td = document.createElement("td");
      td.textContent = columna;
      if (pos && pos.x === -1 && pos.y === ij) {
        td.classList.add("marked");
      } else if (pos && pos.x === ix && pos.y === ij) {
        td.classList.add("marked");
      }

      tr.appendChild(td);
    });
    tabla.appendChild(tr);
  });
  return tabla;
};

listToTable = (list) => {
  const tabla = document.createElement("table");

  list.forEach((i) => {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = i;
    tr.appendChild(td);
    tabla.appendChild(tr);
  });
  return tabla;
};

// Convertir del mapa a datos para Treant (Recursivo)
mapToTreantNodes = (mapData) => {
  const { nivel, matriz, heuristica, estado, hijos } = mapData;

  //Nodo de la matriz
  const div = document.createElement("div");
  div.classList.add("matrix-node");

  //Titulo del Nodo
  const h5 = document.createElement("h5");
  h5.innerText = `Heuristica: ${
    map?.metodo === "avaro" ? "Colores Alrededor" : map.colores[mapData.color]
  }`;

  const titulo = document.createElement("div");
  titulo.appendChild(h5);
  div.appendChild(titulo);

  //Contenido del Nodo
  const contenido = document.createElement("div");
  const markPos = JSON.parse(JSON.stringify(mapData.pos));
  if (map?.metodo === "reparacion") markPos.x = -1;
  contenido.classList.add("node-content");
  contenido.appendChild(matrixToTable(matriz, markPos));
  contenido.appendChild(listToTable(heuristica));
  div.appendChild(contenido);

  const datos = {
    innerHTML: div.outerHTML,
    collapsable: true,
    children: [],
  };

  if (hijos.length) {
    for (const hijo of hijos) {
      datos.children.push(mapToTreantNodes(hijo));
    }
  }

  return datos;
};

// Configuracion para Treant
const createTreantConfig = (data) => {
  return {
    chart: {
      container: "#tree-container",
      connectors: {
        style: {
          stroke: "#ccc",
          "stroke-width": 2,
        },
      },
      node: {
        collapsable: true,
      },
      animation: {
        nodeAnimation: "easeOutBounce",
        nodeSpeed: 400,
        connectorsAnimation: "bounce",
        connectorsSpeed: 400,
      },
    },
    nodeStructure: mapToTreantNodes(data),
  };
};

////////////////////////////////// Variables //////////////////////////////////
const next_btn = document.getElementById("next");
const auto_btn = document.getElementById("auto");
const stop_btn = document.getElementById("stop");
const finish_btn = document.getElementById("finish");
const newMap_btn = document.getElementById("newMap");
const speed_select = document.getElementById("speed");

let map;
let autoID;
let simulationStatus = "clear";
let simulationSpeed = 500;

////////////////////////////////// Funciones //////////////////////////////////
const render = () => {
  console.log("rendering");

  new Treant(createTreantConfig(map.solucion));
  focusLastNode();
};

const focusLastNode = () => {
  const node = document.getElementById("tree-container").querySelector("div");
  node.scrollIntoView();
};

const singleStep = () => {
  if (simulationStatus !== "clear" || simulationStatus !== "ended") {
    map?.siguienteEstado();
    render();

    if (map?.terminado) {
      updateSimulationStatus("done");
      if (autoID) clearInterval(autoID);
    }
  }
};

const startAuto = () => {
  if (simulationStatus === "standby") {
    updateSimulationStatus("auto");
    autoID = setInterval(singleStep, simulationSpeed);
  }
};

const stopAuto = () => {
  if (simulationStatus === "auto") {
    clearInterval(autoID);
    updateSimulationStatus("standby");
  }
};

const endSimulation = () => {
  if (simulationStatus === "standby") {
    updateSimulationStatus("done");
    while (map?.terminado !== true) {
      map?.siguienteEstado();
    }
    render();
  }
};

const updateSimulationStatus = (status) => {
  if (status === "clear" || status === "done") {
    next_btn.disabled = true;
    auto_btn.disabled = true;
    stop_btn.disabled = true;
    finish_btn.disabled = true;
    speed_select.disabled = true;
  }
  if (status === "standby") {
    next_btn.disabled = false;
    auto_btn.disabled = false;
    stop_btn.disabled = false;
    finish_btn.disabled = false;
    speed_select.disabled = false;
  }
  if (status === "auto") {
    next_btn.disabled = true;
    auto_btn.disabled = true;
    stop_btn.disabled = false;
    finish_btn.disabled = true;
    speed_select.disabled = true;
  }
  simulationStatus = status;
};

const updateSimulationSpeed = () => {
  const speedRanges = [2000, 1500, 1000, 500];
  simulationSpeed = speedRanges[speed_select.value];
  console.log("new Speed:", simulationSpeed);
  
}

const createNewMap = () => {
  const filas = parseInt(document.getElementById("rows").value);
  const columnas = parseInt(document.getElementById("cols").value);
  const colores = document
    .getElementById("colors")
    .value.toUpperCase()
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length === 1)
    .filter((c) => /^[A-Z]+$/.test(c));
  const metodo = document.querySelector("input[name='metodo']:checked").value;
  const camino = document.querySelector("input[name='camino']:checked").value;

  if (colores.length === 0) {
    alert("Ingresa colores, una letra por color separado por coma");
    return;
  }
  document.getElementById("colors").value = colores.join(",");
  //console.log(filas,columnas,colores,metodo,camino);

  map = new Mapa(filas, columnas, colores, metodo, camino);
  render();
  updateSimulationStatus("standby");
};

////////////////////////////////// Eventos ////////////////////////////////////
next_btn.addEventListener("click", singleStep);
auto_btn.addEventListener("click", startAuto);
stop_btn.addEventListener("click", stopAuto);
finish_btn.addEventListener("click", endSimulation);
newMap_btn.addEventListener("click", createNewMap);
speed_select.addEventListener("input", updateSimulationSpeed);

////////////////////////////////// Simulacion /////////////////////////////////
updateSimulationStatus(simulationStatus);
