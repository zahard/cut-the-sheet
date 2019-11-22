
function Rect(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

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

class Node {
  constructor(rect) {
    this.rect = rect || null;
    this.left = null;
    this.right = null;
    this.tileId = null;
  }

  insert(tile) {
  //   if we're not a leaf then
  //     (try inserting into first child)
  //     newNode = child[0]->Insert( img )
  //     if newNode != NULL return newNode
      
  //     (no room, insert into second)
  //     return child[1]->Insert( img )
  // else
  //     (if there's already a lightmap here, return)
  //     if imageID != NULL return NULL

  //     (if we're too small, return)
  //     if img doesn't fit in pnode->rect
  //         return NULL

  //     (if we're just right, accept)
  //     if img fits perfectly in pnode->rect
  //         return pnode
      
  //     (otherwise, gotta split this node and create some kids)
      this.left = new Node()
      this.right = new Node()


  //     (decide which way to split)
    var dw = this.rect.w - tile.width;
    var dh = this.rect.h - tile.height;

    console.log(dw, dh)

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
    **/
    var cuts = dw > dh 
      ? this.rect.cutVertical(tile.width)
      : this.rect.cutHorizontal(tile.height);

    this.left.rect = cuts[0];
    this.right.rect = cuts[1];

    //return this.left.insert(tile);
  }
}

function Tile(id, width, height) {
  this.id = id;
  this.width = width;
  this.height = height;
}

var basePlate = new Rect(0, 0, 200, 100);
var tiles = [
  new Tile('0', 150, 40),
  new Tile('1', 100, 30),
  new Tile('2', 100, 30),
  new Tile('3', 50, 30),
];


var root = new Node(basePlate);

var next = root.insert(tiles[0])
console.log(next);
console.log(root);


function tile(width, height) {


}

