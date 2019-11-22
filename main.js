
function Rect(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

 /*
  *  Vertical cut of current node 
  *  Current Node is ABCD
  *  Select AE distance as a width of tile that we try to fit.
  *  And cut node all the way by EF line (EF <= tile height)
  *  After we will form two area AECF and EBFD
  *  And current tile will be inserter in first one - AECF, 
  *  since it already match width and we need just to adjust height in next recursion cycle
  * 
  *      A----E-------B
  *      |    |       |  
  *      |    |       |
  *      |    |       |
  *      |    |       |
  *      |    |       |
  *      C----F-------D
  * 
  */
Rect.prototype.cutVertical = function(cutPosX) {
  return [
    new Rect(this.x, this.y, cutPosX, this.h),
    new Rect(this.x + cutPosX, this.y, this.w - cutPosX, this.h)
  ];
}

Rect.prototype.cutHorizontal = function(cutPosY) {
  return [
    new Rect(this.x, this.y, this.w, cutPosY),
    new Rect(this.x, this.y + cutPosY, this.w, this.h - cutPosY)
  ];
}

Rect.prototype.fit = function(tile) {
  return this.w >= tile.width && this.h >= tile.height
}
Rect.prototype.fitExactly = function(tile) {
  return this.w === tile.width && this.h === tile.height;
}

class Node {
  constructor(rect) {
    this.rect = rect || null;
    this.left = null;
    this.right = null;
    this.tileId = null;
  }

  insert(tile) {
    // If node not leaf itself
    if (this.left) {
      // Try to fit to first child
      var newNode = this.left.insert(tile);
      if (newNode) return newNode;

      // If no space there insert in second
      return this.right.insert(tile);
    }
    
    // If node if leaf without children yet

    // Tile already setted for this node, return up
    if (this.tileId) return null;
    
    // if we're too small, return)
    if (!this.rect.fit(tile)) return null;

    // If node already match exactly target tile - return it
    // this is SUCCESS point of insertion
    if (this.rect.fitExactly(tile)) {
      this.tileId = tile.id;
      return this;
    }
      
    // otherwise split this node
    this.left = new Node();
    this.right = new Node();

    // decide which way to split
    var dw = this.rect.w - tile.width;
    var dh = this.rect.h - tile.height;

    var cuts = dw > dh 
      ? this.rect.cutVertical(tile.width)
      : this.rect.cutHorizontal(tile.height);

    this.left.rect = cuts[0];
    this.right.rect = cuts[1];

    return this.left.insert(tile);
  }
}

function Tile(id, width, height) {
  this.id = id;
  this.width = width;
  this.height = height;
}

function sortTiles(tiles) {
  var tmp = tiles.slice();
  tmp.sort((a, b) => {
    return Math.max(b.width, b.height) - Math.max(a.width, a.height);
  });
  return tmp;
}

function main() {
  var basePlate = new Rect(0, 0, 200, 120);
  var tilez = [
    new Tile('T2', 90, 25),
    new Tile('T0', 150, 40),
    new Tile('T1', 30, 100),
    new Tile('T3', 50, 30),
    new Tile('T3', 80, 40),
  ];
  
  tiles = sortTiles(tilez);

  var root = new Node(basePlate);
  tiles.forEach(tile => {
    var res = root.insert(tile);
    if (!res) {
      // Try to rotate tile
      var tmp = tile.width;
      tile.width = tile.height;
      tile.height = tmp;
      root.insert(tile);
    }
  });

  var wrap = document.getElementById('wrap');
  var vw = root.rect.w / 100;
  var vh = root.rect.h / 100;


  function drawNode(node) {
    createSheet(wrap,vw, vh, node);
    if (node.left) {
      drawNode(node.left);
    }
    if (node.right) {
      drawNode(node.right);
    }
  }

  drawNode(root);
}


function createSheet(parent,vw, vh, node) {  
  if (!node.tileId) {
    //return;
  }
  var d = document.createElement('div');
  d.classList.add('sheet');
  if (node.tileId) {
    d.classList.add('used');
    d.innerText = node.tileId;
  }
  if (node.left || node.right) {
    d.classList.add('contais');
  }
  d.style.left = node.rect.x / vw + '%';
  d.style.top = node.rect.y / vh + '%';
  d.style.width = node.rect.w / vw + '%';
  d.style.height = node.rect.h / vh + '%';
  parent.appendChild(d);
}

main();
