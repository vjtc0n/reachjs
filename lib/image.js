"use strict";

var image = {};

// export request for node or the browser
if( typeof module !== "undefined" && module.exports )
  exports.image = module.exports = image; // node
else
  exports.image = image;

image.supportedMimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".jpeg": "image/jpg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  "image/png": ".png",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "video/mp4": ".mp4"
};

try{ // for node webkit
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      value: function (callback, type, quality) {

        var binStr = atob( this.toDataURL(type, quality).split(",")[1] ),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i=0; i<len; i++ ) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback( new Blob( [arr], {type: type || "image/png"} ) );
      }
    });
  }
}catch(e){}
/**
 * Get image buffer from html <canvas/> element
 * @param {object} canvas `document.getElementByTagName("canvas')[0];`
 * @return {Buffer}
 */
image.fromCanvas = function(canvas, type, callback){

  if( typeof type === "function" ){
    callback = type;
    type = "image/png";
  }

  var filename = uuid() + image.supportedMimeTypes[type];
  try{
    // browser
    canvas.toBlob(function(blob){
      callback(null, {name: filename, type: type, data: blob});
    }, type);
  }catch(e){
    // node
    setTimeout(function(){
      var regex = new RegExp("data:"+type+ ";base64,");
      var buffer = new Buffer(canvas.toDataURL(type).replace(regex,''), 'base64');
      callback(null, {name: filename, type: type, data: buffer});
    }, 1);
  }


};
/**
 * Get image buffer from html <img/> element
 * @param {object} img `document.getElementByTagName('img')[0];`
 * @return {Buffer}
 */
image.fromImage = function(img, type, callback){

  if( typeof type === "function" ){
    callback = type;
    type = "image/png";
  }

  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var filename = uuid() + image.supportedMimeTypes[type];

  ctx.toBlob(function(blob){
    callback(null, {name: filename, type: type, data: blob});
  }, type);

};
/**
 * Read file data to buffer from file input
 * @param {object} file input element `document.getElementByTagName('input')[0];`
 * @callback callback
 * @param {object|null} error
 * @param {Buffer} data
 * @returns {*}
 */
image.fromFileInput = function(file, callback){

  if( typeof FileReader === "undefined" ){
    throw new Error("reach.image.fromFileInput not supported in node. If you are using node " +
        "webkit make sure you are running in window context. Use fromLocalPath or create your own data object.");
  }
  // FileReader not supported in node webkit
  var reader = new FileReader();
  reader.onload = function (event) {
    // TODO: preserve mimetype
    var filename = uuid() + ".png";
    callback(null, {name: filename, type: "image/png", data: event.target.result});
  };
  reader.onerror = reader.onabort = callback;
  reader.readAsArrayBuffer(file);

  return file;
};
/**
 * Read a local file to buffer for uploading to reach
 * @param {string} path
 * @callback callback
 * @param {object|null} error
 * @param {Buffer} data
 * @returns {*}
 */
image.fromLocalPath = function(path, callback){

  try{
    require("fs").readFile(path, function(err, data){
      var extension = "." +  path.split(".").pop();
      var filename = uuid() + extension;
      callback(err, data && {name: filename, type: image.supportedMimeTypes[extension], data: data});
    });
  }catch(e){
    throw new Error("reach.image.fromLocalPath only supported in node.");
  }
  return path;
};
/**
 * Generate uuid for filenames
 * @returns {string}
 */
function uuid(){
  var d = new Date().getTime();
  if(window && window.performance && typeof window.performance.now === "function"){
    d += window.performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c === "x" ? r : (r&0x3|0x8)).toString(16);
  });
}