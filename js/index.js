var interval; // main timer
var interval2; // backtracking timer

var gridVisual = {
  rows: 40,
  cols: 60,
  total: 2400,
  deletedCount: 0,
  nodes: new Array(this.total),
  g: document.getElementById("grid"),
  speed: 0,
  init: function() { // initializes the grid
    const total = this.total;
    const cols = this.cols;
    document.getElementById("visited").innerHTML = "Visited: 0/" + (this.total - this.deletedCount) + " cells";
    document.getElementById("distance").innerHTML = "Distance: 0 cells";
    var newGrid = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
      var node = makeCell(Math.floor(i / cols), i % cols);
      if (i >= cols) {
        this.nodes[i - cols].adj.push(node);
        node.adj.push(this.nodes[i - cols]);
      }
      if (i % cols >= 1) {
        this.nodes[i - 1].adj.push(node);
        node.adj.push(this.nodes[i - 1]);
      }
      //node.innerHTML = Math.floor(i / rows) + " " + (i) % cols;
      this.nodes[i] = node;
      newGrid.appendChild(node.element);
    }
    this.g.appendChild(newGrid);
    this.startNode = this.nodes[0];
    this.endNode = this.nodes[1];
    this.setStart(0);
    this.setEnd(2399);
  },
  setStart: function(start) { // change start node
    this.startNode.element.id = "";
    this.startNode.isStart = false;
    this.nodes[start].element.id = "cell-start";
    this.nodes[start].isStart = true;
    this.startNode = this.nodes[start];
    this.startNode.deleted = false;
    for (let node of this.nodes)
      node.element.classList.remove("start-hover");
  },
  setEnd: function(end) { // change end node
    this.endNode.element.id = "";
    this.endNode.isEnd = false;
    this.nodes[end].element.id = "cell-end";
    this.nodes[end].isEnd = true;
    this.endNode = this.nodes[end];
    this.endNode.deleted = false;
    for (let node of this.nodes)
      node.element.classList.remove("end-hover");
    if (this.endNode.element.className == "visiting cell")
      backTrack();
  },
  setSpeed: function(updateTime) {
    this.speed = updateTime;
  }
};
var currentEvent = { // event handler
  click: false,
  erase: false,
  start: false,
  end: false,
  going: false,
  handleClick: function(cell) { // handle cell click
    const e = this.getEvent();
    if (e == "none") {
      this.click = true;
      this.modifyCell(cell);
    } else if (e == "click") {
      this.modifyCell(cell);
    } else if (e == "start") {
      gridVisual.setStart(indexOfCell(cell));
    } else if (e == "end") {
      gridVisual.setEnd(indexOfCell(cell));
    }
  },
  modifyCell: function(cell) { // delete/restore cell
    if (!this.erase)
      deleteCell(cell);
    else
      restoreCell(cell);
  },
  handleOver: function(cell) { // handle cell hover
    if (this.getEvent() == "click")
      this.modifyCell(cell);
  },
  handleUp: function() { // handle mouse up
    this.resetEvents();
  },
  handleStart: function() { // handle change start click
    if (this.getEvent() == "none") {
      this.start = true;
      for (let node of gridVisual.nodes) {
        if (node.element.className == "shortest-path cell")
          node.element.className = "visiting cell";
        node.parent = -1;
        node.element.className += " start-hover";
      }
      gridVisual.startNode.element.id = "";
    }
  },
  handleEnd: function() { // handle change end click
    if (this.getEvent() == "none") {
      this.end = true;
      for (let node of gridVisual.nodes) {
        if (node.element.className == "shortest-path cell")
          node.element.className = "visiting cell";
        node.element.className += " end-hover";
      }
      gridVisual.endNode.element.id = "";
    }
  },
  handleErase: function(button) { // handle erase/draw click
    if (this.getEvent() == "none") {
      this.erase = !this.erase;
      button.innerHTML = (this.erase) ? "Draw" : "Erase";
    }
  },
  handleGo: function() { // handle go click
    this.resetEvents();
    this.going = true;
    go();
  },
  resetEvents: function() {
    this.click = false;
    this.start = false;
    this.end = false;
    this.going = false;
  },
  getEvent: function() {
    if (this.going)
      return "going";
    if (this.start)
      return "start";
    if (this.end)
      return "end";
    if (this.click)
      return "click";
    return "none";
  }
};

function setSpeed() { // handle speed change
  var options = document.getElementsByName("speed");
  var selection;
  for (var choice of options) {
    if (choice.checked)
      selection = choice.value;
  }
  if (selection == "slow")
    gridVisual.setSpeed(50);
  else if (selection == "med")
    gridVisual.setSpeed(10);
  else if (selection == "fast")
    gridVisual.setSpeed(2);
  else {
    gridVisual.setSpeed(0);
  }
}

function resetAll() { // clear grid except start and end nodes
  currentEvent.resetEvents();
  clearInterval(interval);
  clearInterval(interval2);
  document.getElementById("visited").innerHTML = "Visited: 0/" + (gridVisual.total) + " cells";
  document.getElementById("distance").innerHTML = "Distance: 0 cells";
  for (var node of gridVisual.nodes) {
    restoreCell(node);
    node.effect.className = "";
    node.element.className = "cell";
  }
  gridVisual.startNode.element.id = "cell-start";
  gridVisual.endNode.element.id = "cell-end";
};

function makeCell(row, col) { // returns a cell object
  var cell = {
    row: row, // also in element data-row field
    col: col, // also in element data-col field
    deleted: false,
    visited: false,
    dist: 0,
    adj: [],
    parent: -1,
    isStart: false,
    isEnd: false
  };
  var element = document.createElement("div");
  element.setAttribute("data-row", row);
  element.setAttribute("data-col", col);
  element.className = "cell";
  cell.element = element;
  cell.effect = document.createElement("div");
  element.appendChild(cell.effect);
  return cell;
}

function deleteCell(cell) { // colors a cell black
  if (!cell.isStart && !cell.isEnd && !cell.deleted) {
    cell.deleted = true;
    cell.element.className = "deleted cell";
    gridVisual.deletedCount++;
    const visited = gridVisual.total - gridVisual.deletedCount;
    document.getElementById("visited").innerHTML = "Visited: 0/" + visited + " cells";
  }
}

function restoreCell(cell) { // colors cell white
  if (!cell.isStart && !cell.isEnd && cell.deleted) {
    cell.deleted = false;
    cell.element.className = "cell";
    gridVisual.deletedCount--;
    const visited = gridVisual.total - gridVisual.deletedCount;
    document.getElementById("visited").innerHTML = "Visited: 0/" + visited + " cells";
  }
}

function indexOfCell(cell) { // get index of cell from cell object
  const row = parseInt(cell.element.getAttribute("data-row"));
  const col = parseInt(cell.element.getAttribute("data-col"));
  return row * gridVisual.cols + col;
}

function visit(cell) { // visited cell (blue)
  cell.effect.className = "";
  cell.element.className = "visiting cell";
}

function queued(cell) { // added to queue (circle animation)
  cell.effect.className = "expand-circle";
}

function addToPath(cell) { // on shortest path (orange)
  if (!cell.deleted)
    cell.element.className = "shortest-path cell";
}

function backTrack() { // backtrack from end to draw shortest path
  var curr = gridVisual.endNode;
  var len = 0; // length of path
  document.getElementById("distance").innerHTML = "Distance: 0 cells";
  var interval2 = setInterval(
    function() {
      curr = curr.parent;
      if (curr == -1 || curr == gridVisual.startNode) clearInterval(interval2);
      else addToPath(curr);
      len++;
      document.getElementById("distance").innerHTML = "Distance: " + len + " cells";
    }, gridVisual.speed);
}

function updateNav(visited, distance) {
  document.getElementById("visited").innerHTML = "Visited: " + visited + "/" + (gridVisual.total - gridVisual.deletedCount) + " cells";
  document.getElementById("distance").innerHTML = "Distance: " + distance + " cells";
}

function unvisitAll() { // uncolor all undeleted nodes
  for (var node of gridVisual.nodes) {
    if (!node.deleted)
      node.element.className = "cell";
    node.effect.className = "";
    node.visited = false;
    node.dist = gridVisual.total;
  }
}

function go() { // BFS from start until end
  clearInterval(interval);
  clearInterval(interval2);
  setSpeed();
  gridVisual.startNode.element.id = "cell-start"; // if user clicks go without setting start/end
  gridVisual.endNode.element.id = "cell-end";
  unvisitAll();
  let q = [];
  q.push(gridVisual.startNode); // start with source
  gridVisual.startNode.dist = 0;
  gridVisual.startNode.visited = true;
  var visitCount = 0; // total nodes visited
  var status = true; // 1 = going, 0 = ended
  if (gridVisual.speed > 0) {
    interval = setInterval( // color node every gridVisual.speed seconds
      function() {
        visitCount++;
        updateNav(visitCount, q[0].dist);
        status = bfs(q);
        if (!status) {
          currentEvent.going = false;
          backTrack();
          clearInterval(interval);
        }
      }, gridVisual.speed);
  } else { // if speed is instant, don't set interval
    while (status) {
      visitCount++;
      updateNav(visitCount, q[0].dist);
      status = bfs(q);
    }
    currentEvent.going = false;
    backTrack();
  }
}

function bfs(q) {
  const top = q[0];
  q.shift();
  visit(top); // colors the node
  if (top.isEnd) // if found end, draw path and exit
    return false;
  for (const neighbor of top.adj) {
    if (!neighbor.visited && !neighbor.deleted) {
      neighbor.parent = top;
      neighbor.dist = top.dist + 1;
      q.push(neighbor);
      neighbor.visited = true; // add to queue exactly once
      queued(neighbor);
    }
  }
  if (q.length == 0)
    return false;
  return true
}

gridVisual.init();

document.getElementById("go").onmousedown = function(event) {
  currentEvent.handleGo();
};
document.getElementById("reset").onmousedown = function(event) {
  currentEvent.resetEvents();
  resetAll();
};
document.getElementById("draw-erase").onmousedown = function(event) {
  currentEvent.handleErase(document.getElementById("draw-erase"));
};
document.getElementById("choose-start").onmousedown = function(event) {
  currentEvent.handleStart();
};
document.getElementById("choose-end").onmousedown = function(event) {
  currentEvent.handleEnd();
};

for (let cell of gridVisual.nodes) {
  cell.element.addEventListener("mouseover", function(event) {
    currentEvent.handleOver(cell);
  });
  cell.element.addEventListener("mousedown", function(event) {
    currentEvent.handleClick(cell);
  });
};
gridVisual.g.onmouseup = function(event) {
  currentEvent.handleUp();
};
