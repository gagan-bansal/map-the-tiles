# map-the-tiles
Calculate map tiles for given map extent and zoom level. The instance can be initiated with projection's map extent and the tile size.
## installation

```
npm install map-the-tiles
```

## API
```javascript
var MapTheTiles = require('map-the-tiles'),
  tiler = new MapTheTiles(projectionExtent, tileSize);  
``` 
Parameteres are as follows:

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

### getTiles(extent, zoom)
extent: map extent of window (map's div) in spherical mercator projeection (meters)
```
{
  left: coordinate in meter,
  right: coordinate in meter,
  bottom: coordinate in meter,
  top: coordinate in meter
}
```
zoom: zoom level as integer

output: array of tiles, where tile object is 
```
{
  X: tile number in x direction
  Y: tile number in y direction 
  Z: tile number for zoom
  top: top of tile image position in window as pixel
  left: left of tile image position in window as pixel
}
```
### example
````javascript
var MapTheTiles = require('map-the-tiles'),
  tiler = new MapTheTiles(projectionExtent, tileSize),
  mapExtent = {
    left:-7929831.7499857,
    bottom:5227055.1160079,
    right:-7910263.8707475,
    top:5236839.0556271
  },
  zoom = 12;
tiles = tiles.getTiles(mapExtent,zoom);
// tiles are
/*
[ { X: 1237, Y: 1512, Z: 12, top: -192, left: -129 },
  { X: 1237, Y: 1513, Z: 12, top: 64, left: -129 },
  { X: 1238, Y: 1512, Z: 12, top: -192, left: 127 },
  { X: 1238, Y: 1513, Z: 12, top: 64, left: 127 },
  { X: 1239, Y: 1512, Z: 12, top: -192, left: 383 },
  { X: 1239, Y: 1513, Z: 12, top: 64, left: 383 } ]
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
