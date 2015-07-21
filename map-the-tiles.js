// map-the-tiles.js
var TransformMatrix = require('transformatrix'),
  intersect = require('rectangles-intersect');
var MapTheTiles = function (viewportSize,projExtent,tileSize) {
  this.vpSize = viewportSize || {width: 256, height: 256};
  // default spherical mercator project extent
  this.projExtent = projExtent || { 
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  };
  this.tSize = tileSize || 256;
  this.maxRes = Math.min(
    Math.abs(this.projExtent.right - this.projExtent.left)/this.tSize,
    Math.abs(this.projExtent.top - this.projExtent.bottom)/this.tSize);
}
MapTheTiles.prototype.getTiles = function(ctr, z, rot) {
  // all calculation are in pixel coordinates i.e. project extent devied by 
  // resolution at that zoom level
  if(!Array.isArray(ctr)) {
    ctr = [ctr.x,ctr.y];
  }
  var vpExtPx = this._getExtentPx(ctr,z), //view port extent in pixel
    ctrPx = this._pointToPx(ctr,z), //center in pixel
    tr, // instance of TransformMatrix used for rotated view calculation
    rotViewportPx, // rotated view port corner coordinates in pixel
    // expandedExtPx: rotated view port extent (MBR) in pixel, if rotation 
    // is 0 then equals to view port extent
    expandedExtPx = vpExtPx,
    xLeft, xRight, yBottom, yTop, top, left,
    tiles = [];
  if(rot && rot !=0) {
    rot = -rot; //to follow the HTML (transform) convention clockwise positive
    tr = new TransformMatrix();
    tr.translate(ctrPx[0], ctrPx[1]);
    tr.rotate(Math.PI/180 * rot); //as rot is in deg
    tr.translate(-ctrPx[0], -ctrPx[1]);
    rotViewportPx = [
      tr.transformPoint(vpExtPx.left,vpExtPx.bottom),
      tr.transformPoint(vpExtPx.right,vpExtPx.bottom),
      tr.transformPoint(vpExtPx.right,vpExtPx.top),
      tr.transformPoint(vpExtPx.left,vpExtPx.top)
    ];
    expandedExtPx = getBBox(rotViewportPx);
  }
  // tile numbers
  xLeft = Math.floor(expandedExtPx.left/this.tSize);
  xRight = Math.floor(expandedExtPx.right/this.tSize);
  yBottom = Math.floor(expandedExtPx.bottom/this.tSize);
  yTop = Math.floor(expandedExtPx.top/this.tSize);
  //top left tile position of top-left tile with respect to window/div 
  top = topStart = Math.round((yTop * this.tSize) - vpExtPx.top);
  left = Math.round((xLeft * this.tSize) - vpExtPx.left);
  for (var i=xLeft; i<=xRight; i++) {
    top = topStart;
    for(var j=yTop; j<=yBottom; j++) {
      tiles.push({x:i, y:j, z:z, top: top, left: left});
      top += this.tSize;
    }
    left += this.tSize;
  }
  if(rot && rot != 0) {
    // filters out tiles (from expanded view port) that do not intersect with
    // view port 
    tiles = tiles.filter(function(t) {
      return intersect(rotViewportPx,this._getTileBoundingRect(t));
    },this);
  }
  return tiles;
};

MapTheTiles.prototype._getExtentPx = function(ctr,z) {
  var res = this.maxRes/Math.pow(2,z);
  return {
    left: (ctr[0] - this.projExtent.left)/res - this.vpSize.width/2,
    right: (ctr[0] - this.projExtent.left)/res + this.vpSize.width/2,
    bottom: (this.projExtent.top - ctr[1])/res + this.vpSize.height/2,
    top: (this.projExtent.top - ctr[1])/res - this.vpSize.height/2
  };
};
MapTheTiles.prototype._pointToPx = function(pt,z) {
  var res = this.maxRes/Math.pow(2,z);
  return [
    (pt[0] - this.projExtent.left)/res,
    (this.projExtent.top - pt[1])/res
  ];
};
MapTheTiles.prototype._getTileBoundingRect = function(t) {
  var res, l, r, t, b;
  res = this.maxRes/Math.pow(2,t.z);
  l = t.x * this.tSize;
  r = l + this.tSize;
  t = t.y * this.tSize;
  b = t + this.tSize;
  return [[l,b], [r,b], [r,t], [l,t]];
};
function getBBox(points) {
  var xArray = points.map(function(p) {return p[0];});
  var yArray = points.map(function(p) {return p[1];});
  return {
    left: Math.min.apply(this,xArray),
    right: Math.max.apply(this,xArray),
    bottom: Math.max.apply(this,yArray),
    top: Math.min.apply(this,yArray)
  };
}
module.exports = MapTheTiles;
