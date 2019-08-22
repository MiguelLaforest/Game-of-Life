class Cell {
  isAlive: boolean = false;
  // body: HTMLDivElement = document.createElement("div");
  position = {
    X: 0,
    Y: 0
  };
  grid: Cell[][];

  constructor(X: number, Y: number, grid) {
    this.position = {
      X,
      Y
    };
    this.grid = grid;
  }

  body(): HTMLDivElement {
    const body = document.createElement("div");
    body.className = "cell";

    if (this.isAlive) {
      body.classList.add("alive");
    }
    return body;
  }

  // TODO: make better
  countNeighbours(): number {
    const { X, Y } = this.position;

    const neighbors: Cell[] = [
      this.isInGrid(X - 1, Y - 1),
      this.isInGrid(X - 1, Y),
      this.isInGrid(X - 1, Y + 1),
      this.isInGrid(X, Y - 1),
      this.isInGrid(X, Y + 1),
      this.isInGrid(X + 1, Y - 1),
      this.isInGrid(X + 1, Y),
      this.isInGrid(X + 1, Y + 1)
    ]
      .filter(cell => cell)
      .filter(cell => cell.isAlive);

    return neighbors.length;
  }

  isInGrid(X: number, Y: number): Cell {
    let cell;
    if (typeof this.grid[X] !== "undefined") {
      if (typeof this.grid[X][Y] !== "undefined") cell = this.grid[X][Y];
    } else {
      cell = new Cell(X, Y, this.grid);
    }
    return cell;
  }
}

class GameOfLife {
  deltas: number[] = [];
  running;
  GRID_SIZE = 20;
  MAX_BOARD_SIZE = 120;
  MIN_BOARD_SIZE = 5;
  SPEED = 1;
  grid: Cell[][] = Array<Array<Cell>>();
  lastGeneration: Cell[][] = Array<Array<Cell>>();
  nextGeneration: Cell[][] = Array<Array<Cell>>();
  density: number = 30;

  constructor() {
    this.createGrid();
    this.displayGrid();
  }

  createGrid() {
    this.grid = [];

    for (let row = 0; row < this.GRID_SIZE; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const cell = new Cell(row, col, this.grid);
        if (Math.random() < this.density / 100) cell.isAlive = true;
        this.grid[row].push(cell);
      }
    }
  }

  displayGrid() {
    const board = document.getElementById("game-of-life");

    if (board) {
      board.innerHTML = "";

      this.grid.forEach(row => {
        const container = document.createElement("div");
        container.className = "row";

        row.forEach(cell => {
          container.appendChild(cell.body());
        });

        board.append(container);
      });
    }
  }

  stable(): boolean {
    console.log(this.deltas);
    return this.deltas.length >= 3
      ? this.deltas.every(delta => delta === this.deltas[0])
      : false;
  }

  /* Create the next generation following the set of rules */
  reproduce(): void {
    /* RULES
    1.	Any live cell with fewer than 2 live neighbours dies, as if caused by under-population.
    2.	Any live cell with more than 3 live neighbours dies, as if by overcrowding.
    3.	Any live cell with 2 or 3 live neighbours lives on to the next generation.
    4.	Any dead cell with exactly 3 live neighbours becomes a live cell, as if by reproduction.
   */

    this.lastGeneration = [];
    this.nextGeneration = [];
    for (let i = 0; i < this.GRID_SIZE; i++) {
      this.lastGeneration.push([]);
      this.nextGeneration.push([]);
      for (let j = 0; j < this.GRID_SIZE; j++) {
        const cell = new Cell(i, j, this.grid);
        const neighbours = this.grid[i][j].countNeighbours();
        this.lastGeneration[i].push(this.grid[i][j]);

        /* Current cell is alive */
        if (this.grid[i][j].isAlive) {
          if (neighbours == 2 || neighbours == 3) cell.isAlive = true;
          else cell.isAlive = false;
        } else {
          if (neighbours == 3) cell.isAlive = true;
          else cell.isAlive = false;
        }
        this.nextGeneration[i].push(cell);
      }
    }

    this.delta();
  }

  delta(): void {
    let delta = 0;

    this.lastGeneration.forEach(row =>
      row.forEach(cell => {
        const { X, Y } = cell.position;
        if (cell.isAlive !== this.nextGeneration[X][Y].isAlive) delta++;
      })
    );

    if (this.deltas.length >= 3) this.deltas.shift();

    this.deltas.push(delta);
  }

  /* Verify that there is at least one cell alive */
  allDead(): boolean {
    for (let i = 1; i < this.GRID_SIZE; i++) {
      for (let j = 1; j < this.GRID_SIZE; j++) {
        if (this.grid[i][j].isAlive) {
          return false;
        }
      }
    }

    return true;
  }

  update(): void {
    if (this.stable()) {
      clearInterval(this.running);
    } else {
      this.reproduce();
      this.grid.forEach(row => {
        row.forEach(cell => {
          const { X, Y } = cell.position;
          cell.isAlive = this.nextGeneration[X][Y].isAlive;
        });
      });

      this.displayGrid();
    }
  }

  start(): void {
    document.getElementById("start")!.classList.add("hidden");
    document.getElementById("pause")!.classList.remove("hidden");
    document.getElementById("stop")!.classList.remove("hidden");

    this.running = setInterval(() => {
      this.update();
    }, this.SPEED * 1000);
  }

  pause(): void {
    document.getElementById("start")!.classList.remove("hidden");
    document.getElementById("pause")!.classList.add("hidden");

    clearInterval(this.running);
  }

  reset(): void {
    document.getElementById("start")!.classList.remove("hidden");
    document.getElementById("pause")!.classList.add("hidden");
    document.getElementById("stop")!.classList.add("hidden");

    this.pause();
    this.createGrid();
    this.displayGrid();
    this.deltas = [];
  }

  increaseSize(): void {
    if (this.GRID_SIZE < this.MAX_BOARD_SIZE) {
      this.GRID_SIZE++;
      this.createGrid();
      this.displayGrid();
      document.getElementById("start")!.classList.remove("hidden");
      document.getElementById("pause")!.classList.add("hidden");
      document.getElementById("stop")!.classList.add("hidden");
    }
  }

  decreaseSize(): void {
    if (this.GRID_SIZE > this.MIN_BOARD_SIZE) {
      this.GRID_SIZE--;
      this.createGrid();
      this.displayGrid();
      document.getElementById("start")!.classList.remove("hidden");
      document.getElementById("pause")!.classList.add("hidden");
      document.getElementById("stop")!.classList.add("hidden");
    }
  }

  increaseSpeed(): void {
    this.pause();
    this.SPEED -= 0.25;
    this.start();
  }

  decreaseSpeed(): void {
    this.pause();
    this.SPEED += 0.25;
    this.start();
  }
}

const gameOfLife = new GameOfLife();

document.getElementById("start")!.addEventListener("click", () => {
  gameOfLife.start();
});

document.getElementById("pause")!.addEventListener("click", () => {
  gameOfLife.pause();
});

document.getElementById("stop")!.addEventListener("click", () => {
  gameOfLife.reset();
});

document.getElementById("size+")!.addEventListener("click", () => {
  gameOfLife.increaseSize();
});

document.getElementById("size-")!.addEventListener("click", () => {
  gameOfLife.decreaseSize();
});

document.getElementById("speed+")!.addEventListener("click", () => {
  gameOfLife.increaseSpeed();
});

document.getElementById("speed-")!.addEventListener("click", () => {
  gameOfLife.decreaseSpeed();
});
