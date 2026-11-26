export const ROWS = 10;
export const COLUMNS = 10;
export const NORTH = 0;
export const EAST = 1;
export const SOUTH = 2;
export const WEST = 3;

export const SOURCE = { row: 4, column: 1, side: WEST };
export const OUTLET = { row: 9, column: 10, side: EAST };
export const PORTS = { straight: [EAST, WEST], elbow: [NORTH, EAST] };
export const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

// S = straight, E = elbow. The digit is the starting number of clockwise quarter turns.
const GRID = [
  'E2 S1 -- E3 -- E1 -- -- E0 S1',
  'E1 -- E3 S1 S1 E0 S1 E3 -- E1',
  '-- E0 S2 E1 -- S2 E0 S0 E2 --',
  'S1 S1 E2 S1 E2 S2 -- E0 -- S0',
  'S1 E2 -- E2 S1 E1 S0 -- E3 --',
  '-- S0 E1 S2 E0 -- E0 S1 E0 E2',
  'E3 E1 -- S2 S0 -- S2 E1 S2 S1',
  '-- S1 -- E1 S1 S1 E0 E3 S2 E2',
  'S0 -- -- E1 -- E3 E0 -- E2 S1',
  '-- E0 -- -- S1 -- E2 S0 -- E3',
];

export const TILES = GRID.flatMap((line, row) => line.split(' ').flatMap(([shape, turns], column) =>
  shape === '-' ? [] : [{
    row: row + 1,
    column: column + 1,
    shape: shape === 'S' ? 'straight' : 'elbow',
    turns: Number(turns),
  }]));

export const cellKey = (row, column) => (row - 1) * COLUMNS + column - 1;

export function tracePath(portsAt) {
  const visited = new Set();
  const path = [];
  let { row, column, side: incoming } = SOURCE;

  while (row >= 1 && row <= ROWS && column >= 1 && column <= COLUMNS) {
    const key = cellKey(row, column);
    const ports = portsAt(row, column);
    if (!ports?.includes(incoming) || visited.has(key)) return null;

    visited.add(key);
    path.push({ row, column });
    const outgoing = ports.find(port => port !== incoming);
    if (row === OUTLET.row && column === OUTLET.column && outgoing === OUTLET.side) return path;

    const [dr, dc] = DIRECTIONS[outgoing];
    row += dr;
    column += dc;
    incoming = (outgoing + 2) % 4;
  }
  return null;
}
