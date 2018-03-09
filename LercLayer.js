var LercLayer = L.GridLayer.extend({
  createTile: function (coords, done) {
    var error;
    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;

    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    var url = 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/' + 'Terrain3D/ImageServer/tile/' + coords.z + '/' + coords.y + '/' + coords.x;

    xhr.open("Get", url, true);
    xhr.send();

    // var that = this;

    xhr.onreadystatechange = function (evt) {
      if (evt.target.readyState == 4 && evt.target.status == 200) {
        tile.decodedPixels = Lerc.decode(xhr.response);
        this.draw(tile);
        done(error, tile);
      }
    }.bind(this);
    
    return tile;
  },

  draw: function (tile) {
    var width = tile.decodedPixels.width - 1;
    var height = tile.decodedPixels.height - 1;
    var min = slider.noUiSlider.get()[0];
    var max = slider.noUiSlider.get()[1];
    var pixels = tile.decodedPixels.pixels[0];
    var mask = tile.decodedPixels.maskData;

    var ctx = tile.getContext('2d');
    var imageData = ctx.createImageData(width, height);
    var data = imageData.data;
    var f = 256 / (max - min);
    var pv = 0;
    for (var i = 0; i < width * height; i++) {
      // Skip the last pixel in each input line
      var j = i + Math.floor(i / width);
      pv = (pixels[j] - min) * f;
      data[i * 4] = pv;
      data[i * 4 + 1] = pv;
      data[i * 4 + 2] = pv;
      // Mask only gets returned when missing data exists
      data[i * 4 + 3] = (mask && !mask[j]) ? 0 : 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
})
