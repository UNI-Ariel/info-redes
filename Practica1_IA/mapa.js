class Mapa {
  #filas;
  #columnas;
  #colores;
  #colorIndex;
  #metodo;
  #camino;
  #terminado;
  #solucion;

  #metodos = ["avaro", "reparacion"];
  #caminos = ["abajo", "izquierda"];

  /**
   *
   * @param {*} filas Numero de filas
   * @param {*} columnas Numero de columnas
   * @param {*} colores Los colores con los que pintar, debe ser una sola letra sin repetir
   * @param {*} metodo Algoritmo a utilizar: construccion | reparacion
   * @param {*} camino 1: De Arriba a Abajo, Izquierda a Derecha | 2: Izquierda a Derecha, Arriba a Abajo
   */
  constructor(
    filas = 4,
    columnas = 4,
    colores = ["R", "G", "B"],
    metodo = "avaro",
    camino = "abajo"
  ) {
    this.#filas = filas;
    this.#columnas = columnas;
    this.#colores = colores;
    this.#metodo = metodo;
    this.#camino = camino;
    this.#terminado = false;

    //console.log(filas,columnas,colores,metodo,camino);

    if (filas < 4 || filas > 6) this.#filas = filas < 4 ? 4 : 6;

    if (columnas < 4 || columnas > 6) this.#columnas = columnas < 4 ? 4 : 6;

    if (
      colores.length < 2 ||
      colores.filter((c) => c.length === 1).length !== colores.length
    )
      this.#colores = ["R", "G", "B"];

    const unicos = new Set(colores);
    if (unicos.size !== this.#colores.length) this.#colores = [...unicos];

    if (!this.#metodos.includes(metodo)) this.#metodo = "avaro";

    if (!this.#caminos.includes(camino)) this.#camino = "abajo";

    this.#solucion = this.nuevoNodo();

    if (this.#metodo === "reparacion")
      this.#solucion.matriz = this.generarDatosMatriz();

    this.#colorIndex = this.#colores.reduce(
      (acc, curr, idx) => ({ ...acc, [curr]: idx }),
      {}
    );
  }

  nuevoNodo() {
    return {
      nivel: 0,
      matriz: this.construirMatriz(),
      pos: { x: 0, y: 0 },
      heuristica: [],
      estado: "verificar",
      hijos: [],
      pintados: [],
      bloqueados: [],
      color: 0,
    };
  }

  construirMatriz() {
    const m = [];

    for (let f = 0; f < this.#filas; f++) {
      m[f] = [];
      for (let c = 0; c < this.#columnas; c++) {
        m[f][c] = [""];
      }
    }

    return m;
  }

  generarDatosMatriz() {
    const matriz = this.construirMatriz();
    const numeroDatos = (this.#filas * this.#columnas) / 2;

    let posiciones = [];

    for (let i = 0; i < this.#filas; i++) {
      for (let j = 0; j < this.#columnas; j++) {
        posiciones.push([i, j]);
      }
    }

    for (let n = 0; n < numeroDatos; n++) {
      const p = Math.floor(Math.random() * posiciones.length);
      const c = Math.floor(Math.random() * this.#colores.length);

      const [x, y] = posiciones.at(p);

      matriz[x][y] = this.#colores[c];

      posiciones = posiciones.filter((v, i) => i !== p);
    }

    return matriz;
  }

  encontrarPosSig(pos) {
    let { x, y } = pos;

    const camino = this.#camino === "abajo" ? 1 : 2;

    //Arriba -> Abajo -> Izquierda -> Derecha
    if (camino === 1) {
      x += 1;
      if (x === this.#filas) {
        y += 1;
        x = 0;
        if (y === this.#columnas) return { x: this.#filas, y };
      }
    }

    //Izquierda -> Derecha -> Arriba -> Abajo
    if (camino === 2) {
      y += 1;
      if (y === this.#columnas) {
        x += 1;
        y = 0;
        if (x === this.#filas) return { x, y: this.#columnas };
      }
    }

    return { x, y };
  }

  avaro() {
    if (this.#terminado) return;
    if (this.#metodo !== "avaro") return;

    //Leer el ultimo estado generado
    let estadoActual = this.#solucion;
    //console.log(estadoActual);

    while (estadoActual.hijos.length) {
      estadoActual = estadoActual.hijos[0];
    }
    const { nivel, matriz, pos, estado } = estadoActual;

    if (estado === "verificar") {
      //Verificar y contar los colores alrededor de la posicion actual
      const heuristica = this.contarColoresAlrededor(pos, matriz);
      //Acualizar heuristica (cuenta de colores alrededor de esta posicion)
      estadoActual.heuristica = heuristica;
      estadoActual.estado = "pintar";
    }

    if (estado === "pintar") {
      //Seleccionar el color menos repetido
      let menosRepetido = 0;
      for (let i = 1; i < this.#colores.length; i++) {
        if (estadoActual.heuristica[i] < estadoActual.heuristica[menosRepetido])
          menosRepetido = i;
      }

      //Pintar el color
      matriz[pos.x][pos.y] = this.#colores[menosRepetido];

      estadoActual.estado = "pintado";
    }

    if (estado === "pintado") {
      //Buscar la siguiente posicion a colorear
      const sig = this.encontrarPosSig(pos);

      //Si la nueva posicion sale del mapa se termino de pintar
      if (sig.x === this.#filas || sig.y === this.#columnas) {
        this.#terminado = true;
      } else {
        //Generar nuevo estado partiendo del estado actual
        const nuevoEstado = this.nuevoNodo();
        nuevoEstado.pos = sig;
        nuevoEstado.nivel = nivel + 1;
        nuevoEstado.matriz = JSON.parse(JSON.stringify(matriz));
        //Agregar el siguiente estado a analizar a la solucion
        estadoActual.hijos.push(nuevoEstado);
      }
    }
  }

  contarColoresAlrededor(pos, matriz) {
    const repetidos = this.#colores.map((c) => 0);
    const { x, y } = pos;

    //Arriba
    if (this.enRango(x - 1, y) && matriz[x - 1][y] !== "") {
      repetidos[this.#colorIndex[matriz[x - 1][y]]] += 1;
    }
    //Abajo
    if (this.enRango(x + 1, y) && matriz[x + 1][y] !== "") {
      repetidos[this.#colorIndex[matriz[x + 1][y]]] += 1;
    }
    //Izquierda
    if (this.enRango(x, y - 1) && matriz[x][y - 1] !== "") {
      repetidos[this.#colorIndex[matriz[x][y - 1]]] += 1;
    }
    //Derecha
    if (this.enRango(x, y + 1) && matriz[x][y + 1] !== "") {
      repetidos[this.#colorIndex[matriz[x][y + 1]]] += 1;
    }

    return repetidos;
  }

  enRango(x, y) {
    return x >= 0 && x < this.#filas && y >= 0 && y < this.#columnas;
  }

  verificarFila(matriz, pos, color) {
    const cuenta = [];
    const { x, y } = pos;

    for (let i = x; i < this.#filas; i++) {
      const p = {};
      p.x = i;
      p.y = y;
      cuenta.push(this.contarColoresIguales(p, matriz, color));
    }

    return cuenta;
  }

  contarColoresIguales(pos, matriz, color) {
    const { x, y } = pos;
    let cuenta = 0;

    //Arriba
    if (this.enRango(x - 1, y) && matriz[x - 1][y] === color) {
      cuenta++;
    }
    //Abajo
    if (this.enRango(x + 1, y) && matriz[x + 1][y] === color) {
      cuenta++;
    }
    //Izquierda
    if (this.enRango(x, y - 1) && matriz[x][y - 1] === color) {
      cuenta++;
    }
    //Derecha
    if (this.enRango(x, y + 1) && matriz[x][y + 1] === color) {
      cuenta++;
    }

    return cuenta;
  }

  reparar() {
    if (this.#terminado) return;
    if (this.#metodo !== "reparacion") return;

    //Recuperar ultimo estado
    let estadoActual = this.#solucion;

    while (estadoActual.hijos.length) {
      estadoActual = estadoActual.hijos[0];
    }
    const {
      nivel,
      matriz,
      pos,
      estado,
      heuristica,
      bloqueados,
      pintados,
      color,
    } = estadoActual;

    if (estado === "verificar") {
      //Verificar fila para un color y contar los repetidos
      const heurFilaColor = this.verificarFila(
        matriz,
        pos,
        this.#colores[color]
      );

      //Acualizar heuristica (cuenta de colores alrededor de esta posicion)
      estadoActual.heuristica = heurFilaColor;
      estadoActual.estado = "pintar";
    }

    if (estado === "pintar") {
      //Seleccionar el color menos repetido
      let menosRepetido = 0;
      let pintarPos = [menosRepetido];
      for (let i = 1; i < heuristica.length; i++) {
        if (heuristica[i] < heuristica[menosRepetido]) {
          menosRepetido = i;
          pintarPos = [i];
        } else if (heuristica[i] === heuristica[menosRepetido]) {
          pintarPos.push(i);
        }
      }

      console.log("para pintar:", pintarPos);

      //Pintar el color
      for (let i = 0; i < pintarPos.length; i++) {
        console.log("=============================================");
        
        console.log("posicion pintar:", pintarPos[i]);
        console.log("posiciones pintadas:", pintados.join(","));
        console.log("posiciones bloqueadas:", bloqueados.join(","));

        if (
          !pintados.includes(pintarPos[i]) &&
          !bloqueados.includes(pintarPos[i])
        ) {
          if (pos.y - 1 < 0) {
            this.pintarYBloquearColor(
              pintarPos[i],
              pos.y,
              matriz,
              this.#colores[color],
              pintados,
              bloqueados
            );
          } else if (
            pos.y - 1 >= 0 &&
            matriz[pintarPos[i]][pos.y - 1] !== this.#colores[color]
          ) {
            this.pintarYBloquearColor(
              pintarPos[i],
              pos.y,
              matriz,
              this.#colores[color],
              pintados,
              bloqueados
            );
          }
        }
      }

      estadoActual.estado = "pintado";
    }

    if (estado === "pintado") {
      //Buscar el color o la siguiente columna a colorear
      if (color + 1 === this.#colores.length && pos.y + 1 === this.#columnas) {
        this.#terminado = true;
      } else {
        const nuevoEstado = this.nuevoNodo();
        nuevoEstado.nivel = nivel + 1;
        nuevoEstado.matriz = JSON.parse(JSON.stringify(matriz));
        if (color + 1 === this.#colores.length) {
          nuevoEstado.pos.y = pos.y + 1;
        } else {
          nuevoEstado.pintados = JSON.parse(JSON.stringify(pintados));
          nuevoEstado.color = color + 1;
          nuevoEstado.pos.y = pos.y;
        }

        //Agregar el siguiente estado a analizar a la solucion
        estadoActual.hijos.push(nuevoEstado);
      }
    }
  }

  pintarYBloquearColor(x, y, matriz, color, pintados, bloqueados) {
    console.log("pintando:", x, y, color);

    matriz[x][y] = color;
    pintados.push(x);
    if (x + 1 < this.#filas) {
      bloqueados.push(x + 1);
    }
  }

  siguienteEstado() {
    if (this.#terminado) return;
    if (this.#metodo === "reparacion") {
      this.reparar();
    }
    if (this.#metodo === "avaro") {
      this.avaro();
    }
  }

  resolver() {
    while (!this.#terminado) {
      this.siguienteEstado();
    }
  }

  get terminado() {
    return this.#terminado;
  }

  get solucion() {
    return this.#solucion;
  }

  get metodo() {
    return this.#metodo;
  }

  get colores() {
    return this.#colores;
  }
}
