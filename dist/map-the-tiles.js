!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MapTheTiles=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    tr.translate(ctrPx.x, ctrPx.y);
    tr.rotate(Math.PI/180 * rot); //as rot is in deg
    tr.translate(-ctrPx.x, -ctrPx.y);
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
    left: (ctr.x - this.projExtent.left)/res - this.vpSize.width/2,
    right: (ctr.x - this.projExtent.left)/res + this.vpSize.width/2,
    bottom: (this.projExtent.top - ctr.y)/res + this.vpSize.height/2,
    top: (this.projExtent.top - ctr.y)/res - this.vpSize.height/2
  };
};
MapTheTiles.prototype._pointToPx = function(pt,z) {
  var res = this.maxRes/Math.pow(2,z);
  return {
    x: (pt.x - this.projExtent.left)/res,
    y: (this.projExtent.top - pt.y)/res
  };
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

},{"rectangles-intersect":4,"transformatrix":5}],2:[function(require,module,exports){
// check-point-in-rectangle.js
// check point intersects with rectangle
// http://martin-thoma.com/how-to-check-if-a-point-is-inside-a-rectangle/
function pointInRect(pt,rect,precision) {
  var p = precision || 6;
  var rectArea = 0.5*Math.abs(
    (rect[0][1] - rect[2][1]) * (rect[3][0] - rect[1][0])
    + (rect[1][1] - rect[3][1]) * (rect[0][0] - rect[2][0])
  );
  var triangleArea = rect.reduce(function(prev,cur, i, arr) {
    var j = i == arr.length-1 ? 0 : i+1;
    return prev + 0.5*Math.abs(
      pt[0] * (arr[i][1] - arr[j][1])
      + arr[i][0] * (arr[j][1] - pt[1])
      + arr[j][0] * (pt[1] - arr[i][1])
    );
  }, 0);
  return fix(triangleArea,p) == fix(rectArea,p);
}
// fix to the precision
function fix(n,p) {
  return parseInt(n * Math.pow(10,p));
};

module.exports = pointInRect;

},{}],3:[function(require,module,exports){
// line-segments-intersect.js 
// intersection point https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
// line 1: x1,y1,x2,y2
// line 2: x3,y3,x4,y4
// for comparing the float number, fixing the number to int to required 
// precision
function linesIntersect(seg1, seg2, precision) {
  var x1 = seg1[0][0],
    y1 = seg1[0][1],
    x2 = seg1[1][0],
    y2 = seg1[1][1],
    x3 = seg2[0][0],
    y3 = seg2[0][1],
    x4 = seg2[1][0],
    y4 = seg2[1][1],
    intPt,x,y,result = false, 
    p = precision || 6,
    denominator = (x1 - x2)*(y3 - y4) - (y1 -y2)*(x3 - x4);
  if (denominator == 0) {
    // check both segments are Coincident, we already know 
    // that these two are parallel 
    if (fix((y3 - y1)*(x2 - x1),p) == fix((y2 -y1)*(x3 - x1),p)) {
      // second segment any end point lies on first segment
      result = intPtOnSegment(x3,y3,x1,y1,x2,y2,p) ||
        intPtOnSegment(x4,y4,x1,y1,x2,y2,p);
    }
  } else {
    x = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/denominator;
    y = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/denominator;
    // check int point (x,y) lies on both segment 
    result = intPtOnSegment(x,y,x1,y1,x2,y2,p) 
      && intPtOnSegment(x,y,x3,y3,x4,y4,p);
  }
  return result;
} 

function intPtOnSegment(x,y,x1,y1,x2,y2,p) {
  return fix(Math.min(x1,x2),p) <= fix(x,p) && fix(x,p) <= fix(Math.max(x1,x2),p) 
    && fix(Math.min(y1,y2),p) <= fix(y,p) && fix(y,p) <= fix(Math.max(y1,y2),p); 
}

// fix to the precision
function fix(n,p) {
  return parseInt(n * Math.pow(10,p));
}

module.exports = linesIntersect;

},{}],4:[function(require,module,exports){
// rectangles-intersect.js
// two rectangles (non aligned to axis) intersects or not
var linesIntersect = require('line-segments-intersect'),
  pointInside = require('check-point-in-rectangle');

function intersects(rect1,rect2) {
  var intersect = rect1.some(function(pt1,i,r1) {
    //check intersection of any seg or rect1 to any seg of rect2
    var j = i == r1.length-1 ? 0 : i+1;
    return rect2.some(function(pt2,k,r2) {
      var l = k == r2.length-1 ? 0 : k+1;
      return linesIntersect([r1[i], r1[j]], [r2[k], r2[l]]);
    });
  });
  if(!intersect) {
    // check one rectangle contains another
    intersect = rect2.some(function(pt) {
      return pointInside(pt, rect1);
    }) ||
    rect1.some(function(pt) {
      return pointInside(pt, rect2);
    });
  }
  return intersect;
}

module.exports = intersects;

},{"check-point-in-rectangle":2,"line-segments-intersect":3}],5:[function(require,module,exports){
var Matrix = function() {
    this.reset();
};
Matrix.prototype.reset = function() {
    this.m = [1, 0, 0, 1, 0, 0];
    return this;
};
Matrix.prototype.multiply = function(matrix) {
    var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1],
        m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1],
        m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3],
        m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

    var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4],
        dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this.m[4] = dx;
    this.m[5] = dy;
    return this;
};
Matrix.prototype.inverse = function() {
    var inv = new Matrix();
    inv.m = this.m.slice(0);
    var d = 1 / (inv.m[0] * inv.m[3] - inv.m[1] * inv.m[2]),
        m0 = inv.m[3] * d,
        m1 = -inv.m[1] * d,
        m2 = -inv.m[2] * d,
        m3 = inv.m[0] * d,
        m4 = d * (inv.m[2] * inv.m[5] - inv.m[3] * inv.m[4]),
        m5 = d * (inv.m[1] * inv.m[4] - inv.m[0] * inv.m[5]);
    inv.m[0] = m0;
    inv.m[1] = m1;
    inv.m[2] = m2;
    inv.m[3] = m3;
    inv.m[4] = m4;
    inv.m[5] = m5;
    return inv;
};
Matrix.prototype.rotate = function(rad) {
    var c = Math.cos(rad),
        s = Math.sin(rad),
        m11 = this.m[0] * c + this.m[2] * s,
        m12 = this.m[1] * c + this.m[3] * s,
        m21 = this.m[0] * -s + this.m[2] * c,
        m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    return this;
};
Matrix.prototype.translate = function(x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
    return this;
};
Matrix.prototype.scale = function(sx, sy) {
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
    return this;
};
Matrix.prototype.transformPoint = function(px, py) {
    var x = px,
        y = py;
    px = x * this.m[0] + y * this.m[2] + this.m[4];
    py = x * this.m[1] + y * this.m[3] + this.m[5];
    return [px, py];
};
Matrix.prototype.transformVector = function(px, py) {
    var x = px,
        y = py;
    px = x * this.m[0] + y * this.m[2];
    py = x * this.m[1] + y * this.m[3];
    return [px, py];
};
if(typeof module !== "undefined") {
    module.exports = Matrix;
}
else {
    window.Matrix = Matrix;
}

},{}]},{},[1])(1)
});


//# sourceMappingURL=map-the-tiles.js.map