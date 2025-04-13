const datos = {
  nivel: 0,
  matriz: [
    ["R", "G", "B"],
    ["R", "G", "B"],
    ["R", "G", "B"],
  ],
  heuristica: [5],
  estado: "done",
  hijos: [
    {
      nivel: 1,
      matriz: [
        ["G", "R", "B"],
        ["R", "G", "B"],
        ["R", "G", "B"],
      ],
      heuristica: [3],
      estado: "done",
      hijos: [
        {
          nivel: 2,
          matriz: [
            ["G", "R", "B"],
            ["G", "R", "B"],
            ["R", "G", "B"],
          ],
          heuristica: [1],
          estado: "done",
          hijos: [],
        },
        {
          nivel: 2,
          matriz: [
            ["G", "R", "B"],
            ["R", "G", "B"],
            ["G", "R", "B"],
          ],
          heuristica: [2],
          estado: "done",
          hijos: [],
        },
      ],
    },
    {
      nivel: 1,
      matriz: [
        ["B", "G", "R"],
        ["R", "G", "B"],
        ["R", "G", "B"],
      ],
      heuristica: [4],
      estado: "done",
      hijos: [
        {
          nivel: 2,
          matriz: [
            ["B", "G", "R"],
            ["B", "G", "R"],
            ["R", "G", "B"],
          ],
          heuristica: [0],
          estado: "done",
          hijos: [],
        },
      ],
    },
  ],
};