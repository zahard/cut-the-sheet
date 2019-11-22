
function Rect(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

var cuts = [];

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
Rect.prototype.cutVertical = function(cutPosX, cutWidth) {
  cuts.push(this.h)
  cutWidth = cutWidth || 0;
  return [
    new Rect(this.x, this.y, cutPosX, this.h),
    new Rect(this.x + cutPosX + cutWidth, this.y, this.w - cutPosX - cutWidth, this.h)
  ];
}

Rect.prototype.cutHorizontal = function(cutPosY, cutWidth) {
  cuts.push(this.w)
  cutWidth = cutWidth || 0;
  return [
    new Rect(this.x, this.y, this.w, cutPosY),
    new Rect(this.x, this.y + cutPosY + cutWidth, this.w, this.h - cutPosY - cutWidth)
  ];
}

Rect.prototype.fit = function(tile) {
  return this.w >= tile.width && this.h >= tile.height
}
Rect.prototype.fitAny = function(tile) {
  return this.w >= tile.width && this.h >= tile.height || this.w >= tile.height && this.h >= tile.width;
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
    
    // if we're too small, return
    if (!this.rect.fit(tile)) {
      if (this.rect.fit(tile.rotated())) {
        tile.rotate();
      } else {
        return null;
      }
    }

    // If node already match exactly target tile - return it
    // this is SUCCESS point of insertion
    if (this.rect.fitExactly(tile)) {
      this.tileId = tile.id;
      return this;
    }

    if (this.rect.fitExactly(tile.rotated())) {
      tile.rotate();
      this.tileId = tile.id;
      return this;
    }
      
    // otherwise split this node
    this.left = new Node();
    this.right = new Node();

    // decide which way to split
    var dw = this.rect.w - tile.width;
    var dh = this.rect.h - tile.height;

    var cutWidth = 0.2

    var cuts = dw > dh 
      ? this.rect.cutVertical(tile.width, cutWidth)
      : this.rect.cutHorizontal(tile.height, cutWidth);

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

Tile.prototype.rotated = function() {
  return new Tile(this.id, this.height, this.width);
}

Tile.prototype.rotate = function() {
  var tmp = this.width;
  this.width = this.height;
  this.height = tmp;
}

function sortTiles(tiles) {
  var tmp = tiles.slice();
  tmp.sort((a, b) => {
    //var d = Math.max(b.width, b.height) - Math.max(a.width, a.height);
    var d = (b.width + b.height) - (a.width + a.height);
    if (d == 0) {
      return b.width * b.height - a.width * a.height;
    } else {
      return d;
    }
  });
  return tmp;
}

function main() {
  var basePlate = new Rect(0, 0, 202, 120);
  var tiles = sortTiles([
    new Tile('T0', 150, 40),
    new Tile('T1', 100, 30),
    new Tile('T2', 70, 30),
    new Tile('T4', 70, 40),
    new Tile('T3', 80, 40),
  ]);
  
  var sourceTiles = tiles;

  var groupTiles = false;
  if (groupTiles) {
    var groups = [];
    // Group Similar
    for (var i = 0; i < tiles.length; i++) {
      if (tiles[i].grouped) continue;
      
      var group = {
        tiles: [tiles[i]],
        h: tiles[i].height,
        w: tiles[i].width,
      };
      
      for (var j = i + 1; j < tiles.length; j++) {
        if (tiles[j].height === group.h) {
          if (tiles[j].width + group.w <= basePlate.w) {
            group.tiles.push(tiles[j]);
            group.w += tiles[j].width;
            tiles[j].grouped = true;
          }
        }
      }
      
      groups.push(group);
    }

    // Collect groups 
    var groupsNotSingle = [];
    for (var i=0;i < groups.length; i++) {
      if (groups[i].tiles.length > 1) {
        groupsNotSingle.push(i);
      }
    }

    // Ungroup one by one withall possible variations
    var ungroupIndex = 1;
    var groupIndex = groupsNotSingle[ungroupIndex];
    var groupsRoll = [];

    for (var i = 0; i < groups.length; i++) {
      if (i !== groupIndex) {
        groupsRoll.push(groups[i]);
      } else {
        groups[i].tiles.forEach(t => {
          groupsRoll.push({
            tiles: [t],
            h: t.height,
            w: t.width,
          });
        });
      }
    }
    
    groupsRoll.sort((a, b) => {
      var d = (b.w + b.h) - (a.w + a.h);
      if (d == 0) {
        return b.w * b.h - a.w * a.h;
      } else {
        return d;
      }
    });
    
    // Create tiles based on groups
    tiles = groupsRoll.map((g,i) => {
      return new Tile('Group-'+i, g.w, g.h);
    });

    console.log(tiles)
  }
    
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
    d.classList.add('contains');
  }
  d.style.left = node.rect.x / vw + '%';
  d.style.top = node.rect.y / vh + '%';
  d.style.width = node.rect.w / vw + '%';
  d.style.height = node.rect.h / vh + '%';
  parent.appendChild(d);
}

main();
