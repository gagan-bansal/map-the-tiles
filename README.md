# map-the-tiles
Calculate map tiles for given map center, zoom and rotation. The instance need to be initiated with maps viewport size, projection's map extent and the tile size.
## installation

```
npm install map-the-tiles
```

## API
```javascript
var MapTheTiles = require('map-the-tiles'),
  tiler = new MapTheTiles(viewportSize,projectionExtent,tileSize);  
``` 
Parameters are as follows:
#### viewportSize
maps viewport (map's div) size as an object of width and height in pixel 
```
{
  width: 600,
  height: 400
}
```
#### projectionExtent
projected full map extent in projected coordinate system. Default is spherical mercator map extent i.e.

```
{
  left: -20037508.342789244,
  right: 20037508.342789244,
  bottom: -20037508.342789244,
  top: 20037508.342789244
}
```

#### tileSize
Size of the map tile, default is 256.

### getTiles(center, zoom [,rotation])
**center**: map center in projected map coordinates, array of x and y coordinate 
```
[
  float x coordinate,
  float y coordinate
]
```
center as object of x and y is also acceptable.

**zoom**: zoom level as integer

**rotation**: map rotation in degree, clockwise positive as per CSS's transform convention 

output: array of tiles, where tile object is 
```
{
  X: tile number in x direction
  Y: tile number in y direction 
  Z: tile number for zoom
  top: CSS top of tile image position with respect to viwport's top
  left: CSS left of tile image position with respect to viwport's left
}
```
### example
```javascript
var MapTheTiles = require('map-the-tiles');
// create spherical mercator tiler
var tiler = new MapTheTiles({width:600,height:400});
var tiles = tiler.getTiles(
  [-7920047.8103666, 5231947.0858175],
  12   
);
// tiles are
/*
[
  {"x":1237,"y":1512,"z":12,"top":-120,"left":-85},
  {"x":1237,"y":1513,"z":12,"top":136,"left":-85},
  {"x":1237,"y":1514,"z":12,"top":392,"left":-85},
  {"x":1238,"y":1512,"z":12,"top":-120,"left":171},
  {"x":1238,"y":1513,"z":12,"top":136,"left":171},
  {"x":1238,"y":1514,"z":12,"top":392,"left":171},
  {"x":1239,"y":1512,"z":12,"top":-120,"left":427},
  {"x":1239,"y":1513,"z":12,"top":136,"left":427},
  {"x":1239,"y":1514,"z":12,"top":392,"left":427}
]
*/
// if we want to rotate the map 
tiles = tiler.getTiles(
  [-7920047.8103666, 5231947.0858175],
  12,
  30 //rotation in degree
);

// and tiles for rotated view are
/*
[
  {"x":1237,"y":1512,"z":12,"top":-120,"left":-85},
  {"x":1237,"y":1513,"z":12,"top":136,"left":-85},
  {"x":1237,"y":1514,"z":12,"top":392,"left":-85},
  {"x":1238,"y":1512,"z":12,"top":-120,"left":171},
  {"x":1238,"y":1513,"z":12,"top":136,"left":171},
  {"x":1238,"y":1514,"z":12,"top":392,"left":171},
  {"x":1239,"y":1511,"z":12,"top":-376,"left":427},
  {"x":1239,"y":1512,"z":12,"top":-120,"left":427},
  {"x":1239,"y":1513,"z":12,"top":136,"left":427}
]
*/
```
 
## developing
Once you run
 
```npm isntall```

then for running test 

```npm run test```

to create build

```npm run build```

## license
This project is licensed under the terms of the MIT license.
