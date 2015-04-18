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
