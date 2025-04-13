//////////////////////////////// Treant ///////////////////////////////////////
//Datos de matriz a datos de tabla
matrixToTable = (matriz) => {
  const tabla = document.createElement("table");
  tabla.classList.add("matrix-table");

  matriz.forEach((fila) => {
    const tr = document.createElement("tr");
    fila.forEach((columna) => {
      const td = document.createElement("td");
      td.textContent = columna;
      tr.appendChild(td);
    });
    tabla.appendChild(tr);
  });
  return tabla;
};

// Convertir del mapa a datos para Treant (Recursivo)
mapToTreantNodes = (map) => {
  const { nivel, matriz, heuristica, estado, hijos } = map;

  const div = document.createElement("div");
  div.classList.add("matrix-node");

  div.appendChild(matrixToTable(matriz));

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
  // Add heuristic if available
  /* if (node.heuristic && node.heuristic.length > 0) {
    matrixHtml += `<div class="heuristic-value">h=${node.heuristic.join(
      ", "
    )}</div>`;
  } */

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

let map;
let autoID;
let simulationStatus = "clear";

////////////////////////////////// Funciones //////////////////////////////////
const render = () => {
  console.log("rendering");

  new Treant(createTreantConfig(map.solucion));
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

const startAuto = (timer = 1000) => {
  if (simulationStatus === "standby") {
    updateSimulationStatus("auto");
    autoID = setInterval(singleStep, timer);
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
  }
  if (status === "standby") {
    next_btn.disabled = false;
    auto_btn.disabled = false;
    stop_btn.disabled = false;
    finish_btn.disabled = false;
  }
  if (status === "auto") {
    next_btn.disabled = true;
    auto_btn.disabled = true;
    stop_btn.disabled = false;
    finish_btn.disabled = true;
  }
  simulationStatus = status;
};

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
newMap_btn.addEventListener('click', createNewMap);

////////////////////////////////// Simulacion /////////////////////////////////
updateSimulationStatus(simulationStatus);
