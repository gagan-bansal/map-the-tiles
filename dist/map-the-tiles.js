!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MapTheTiles=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MapTheTiles = function (projExtent,tileSize) {
  // default spherical mercator project extent
  this.projExtent = projExtent || { 
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  };
  this.size = tileSize || 256;
  this.maxRes = Math.min(
    Math.abs(this.projExtent.right - this.projExtent.left)/this.size,
    Math.abs(this.projExtent.top - this.projExtent.bottom)/this.size);
}
MapTheTiles.prototype.getTiles = function(extent,zoom) {
  var res = this.maxRes/Math.pow(2,zoom),
    //coordinated in pixel
    lx = Math.floor((extent.left - this.projExtent.left)/res),
    rx = Math.floor((extent.right - this.projExtent.left)/res),
    by = Math.floor((this.projExtent.top - extent.bottom )/res),
    ty = Math.floor((this.projExtent.top - extent.top )/res),
    // tile numbers
    lX = Math.floor(lx/this.size),
    rX = Math.floor(rx/this.size),
    bY = Math.floor(by/this.size),
    tY = Math.floor(ty/this.size),
    //top left tile position of top-left tile with respect to window/div 
    top = topStart = (tY * this.size) - ty,
    left = (lX * this.size) - lx,
    tiles = [];
  for (var i=lX; i<=rX; i++) {
    top = topStart;
    for(var j=tY; j<=bY; j++) {
      tiles.push({
        X:i,
        Y:j,
        Z:zoom,
        top: top,
        left: left
      });
      top += this.size;
    }
    left += this.size;
  }
  return tiles;
};

module.exports = MapTheTiles;

},{}]},{},[1])(1)
});


//# sourceMappingURL=map-the-tiles.js.map