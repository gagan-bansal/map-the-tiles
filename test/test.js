var expect = require('chai').expect,
  MapTheTiles = require('../');

describe('Calculate set of tiles for given map extent', function() {
  var webTiles = new MapTheTiles({width:600,height:400});
  it('tiles without rotation', function() {
    var expected = [
      {"x":1237,"y":1512,"z":12,"top":-120,"left":-85},
      {"x":1237,"y":1513,"z":12,"top":136,"left":-85},
      {"x":1237,"y":1514,"z":12,"top":392,"left":-85},
      {"x":1238,"y":1512,"z":12,"top":-120,"left":171},
      {"x":1238,"y":1513,"z":12,"top":136,"left":171},
      {"x":1238,"y":1514,"z":12,"top":392,"left":171},
      {"x":1239,"y":1512,"z":12,"top":-120,"left":427},
      {"x":1239,"y":1513,"z":12,"top":136,"left":427},
      {"x":1239,"y":1514,"z":12,"top":392,"left":427}
    ],
    center = {x: -7920047.8103666, y: 5231947.0858175},
    zoom = 12;
    expect(webTiles.getTiles(center,zoom))
      .to.deep.include.members(expected);
  });
  it('tiles with rotation', function() {
    var expected = [
      {"x":1237,"y":1512,"z":12,"top":-120,"left":-85},
      {"x":1237,"y":1513,"z":12,"top":136,"left":-85},
      {"x":1237,"y":1514,"z":12,"top":392,"left":-85},
      {"x":1238,"y":1512,"z":12,"top":-120,"left":171},
      {"x":1238,"y":1513,"z":12,"top":136,"left":171},
      {"x":1238,"y":1514,"z":12,"top":392,"left":171},
      {"x":1239,"y":1511,"z":12,"top":-376,"left":427},
      {"x":1239,"y":1512,"z":12,"top":-120,"left":427},
      {"x":1239,"y":1513,"z":12,"top":136,"left":427}
    ],
    center = {x: -7920047.8103666, y: 5231947.0858175},
    zoom = 12,
    rotation = 30; //deg clock wise
    expect(webTiles.getTiles(center,zoom,rotation))
      .to.deep.include.members(expected);
  });
});
