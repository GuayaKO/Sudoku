// by Manuel Velarde

const INPUTS = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);

const COLOR = {
  primary: "#a0a0a0",
  secondary: "#808080",
  tertiary: "#727272",
  inactive: "#505050",
  white: "#ffffff",
  black: "#000000",
  locked: "#454545",
};

let STATE = {
  DIFFICULTY: 0.6,
  EDGES: [],
  OPTIONS: [],
  SOLUTION: [],
  COUNT: 0,
  SELECTED: null,
  START: null,
}

function buildEdges() {
  let edges = [];
  const d = [-10, -9, -8, -1, 0, 1, 8, 9, 10];
  let middle = (n) => {
    if (n < 3) {
      return 1;
    } else {
      if (n < 6) {
        return 4;
      } else {
        return 7;
      }
    }
  };
  for (let n = 0; n <= 80; n++) {
    edges.push({
      below: {},
      above: {},
    })
    let anchor = {
      row: Math.floor(n / 9) * 9,
      col: n % 9,
      box: (middle(Math.floor(n / 9)) * 9) + middle(n % 9),
    }
    for (let i = 0; i < 9; i++) {
      let r = anchor.row + i;
      let c = (i * 9) + anchor.col;
      let b = anchor.box + d[i];
      if (r < n) { edges[n].below[r] = true; }
      if (c < n) { edges[n].below[c] = true; }
      if (b < n) { edges[n].below[b] = true; }
      if (r > n) { edges[n].above[r] = true; }
      if (c > n) { edges[n].above[c] = true; }
      if (b > n) { edges[n].above[b] = true; }
    }
  }
  STATE.EDGES = edges;
}

function listBelow(n) {
  return Object.getOwnPropertyNames(STATE.EDGES[n].below);
}

function listAbove(n) {
  return Object.getOwnPropertyNames(STATE.EDGES[n].above);
}

function buildOptions() {
  let options = [];
  for (let i = 0; i <= 80; i++) {
    options.push({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
    })
  }
  STATE.OPTIONS = options;
}

function listOptions(n) {
  return Object.getOwnPropertyNames(STATE.OPTIONS[n]);
}

function checkOption(n, x) {
  return STATE.OPTIONS[n].hasOwnProperty(x)
}

function removeOption(n, x) {
  delete STATE.OPTIONS[n][x]
}

function printBoard(b) {
  console.log("-----------------");
  for (let i = 0; i < 80; i += 9) {
    console.log(
      b[i],
      b[i + 1],
      b[i + 2],
      b[i + 3],
      b[i + 4],
      b[i + 5],
      b[i + 6],
      b[i + 7],
      b[i + 8]
    );
  }
  console.log("-----------------");
}

function buildSolution() {
  buildEdges();
  buildOptions();
  let board = new Array(81).fill(0);
  let randomIndex = (n) => {
    return Math.floor(Math.random() * n);
  };
  for (let n = 0; n <= 80; n++) {
    let options = listOptions(n);
    let x = options[randomIndex(options.length)];
    if (x === undefined) {
      return buildSolution();
    }
    listAbove(n).forEach((i) => {
      removeOption(i, x);
    });
    board[n] = x;
  }
  STATE.SOLUTION = board;
}

function buildBoard() {
  buildSolution();
  buildOptions();
  STATE.COUNT = 0;
  for (let n = 0; n <= 80; n++) {
    let x = STATE.SOLUTION[n];
    let box = document.getElementById(n);
    if (Math.random() >= STATE.DIFFICULTY) {
      STATE.OPTIONS[n] = {}
      STATE.OPTIONS[n][x] = true;
      listBelow(n).forEach((e) => {
        removeOption(e, x);
      });
      listAbove(n).forEach((e) => {
        removeOption(e, x);
      });
      box.replaceChild(document.createTextNode(x), box.childNodes[0]);
			box.setAttribute("onclick", "");
			box.style.backgroundColor = COLOR.locked;
			box.style.color = COLOR.primary;
      box.value = "x"
    } else {
      STATE.OPTIONS[n][x] = true;
      STATE.COUNT++;
      box.replaceChild(document.createTextNode(" "), box.childNodes[0]);
			box.setAttribute("onclick", "update(this)");
			box.style.backgroundColor = COLOR.inactive;
			box.style.color = COLOR.white;
      box.value = "";
    }
  }
  STATE.START = new Date();
}

function newGame() {
  buildBoard();
  printBoard(STATE.SOLUTION);
  let difficulty = STATE.COUNT / 81;
  console.log("Difficulty: ", difficulty.toFixed(2));
}

function unselectBox(i) {
  let box = document.getElementById(i);
  if (box.value === "x") {
    box.style.backgroundColor = COLOR.locked;
    box.style.color = COLOR.primary;
  } else {
    box.style.backgroundColor = COLOR.inactive;
    box.style.color = COLOR.white;
  }
}

function selectBox(i) {
  let box = document.getElementById(i);
  if (box.value === "x") {
    box.style.backgroundColor = COLOR.tertiary;
    box.style.color = COLOR.black;
  } else {
    box.style.backgroundColor = COLOR.secondary;
    box.style.color = COLOR.black;
  }
}

function keypress(event) {
  let x = event.key;
  let n = event.target.id;
  let box = event.target;
  if (INPUTS.has(x) && checkOption(n, x)) {
    box.replaceChild(
      document.createTextNode(x),
      box.childNodes[0]
    );
    if (checkSolved()) {
      let end = new Date();
      let difference = (end.getTime() - STATE.START.getTime()) / 1000;
      let minutes = Math.floor(difference / 60);
      let seconds = Math.floor(difference % 60);
      console.log(minutes + ":" + seconds);
    }
  } else {
    if (x === '0') {
      box.replaceChild(
        document.createTextNode(" "),
        box.childNodes[0]
      );
    } else {
      // TODO
      // add visual bell for invalid input
    }
  }
}

function update(current) {
  console.log('box', current.id, 'selected');
  console.log(STATE.OPTIONS[current.id])
  if (STATE.SELECTED === current.id) {
    current.removeEventListener("keypress", keypress);
    listBelow(STATE.SELECTED).forEach((i) => unselectBox(i));
    listAbove(STATE.SELECTED).forEach((i) => unselectBox(i));
    unselectBox(STATE.SELECTED);
    STATE.SELECTED = null;
  } else {
    if (STATE.SELECTED !== null) {
      previous = document.getElementById(STATE.SELECTED);
      previous.removeEventListener("keypress", keypress);
      listBelow(STATE.SELECTED).forEach((i) => unselectBox(i));
      listAbove(STATE.SELECTED).forEach((i) => unselectBox(i));
      unselectBox(STATE.SELECTED);
    }
    current.addEventListener("keypress", keypress);
    listBelow(current.id).forEach((i) => selectBox(i));
    listAbove(current.id).forEach((i) => selectBox(i));
    current.style.backgroundColor = COLOR.primary;
    current.style.color = COLOR.black;
    STATE.SELECTED = current.id;
  }
}

function checkSolved() {
  for (let n = 0; n <= 80; n++) {
    let box = document.getElementById(n);
    let x = box.childNodes[0].data;
    if (INPUTS.has(x)) {
      if (!STATE.OPTIONS[n][x]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}