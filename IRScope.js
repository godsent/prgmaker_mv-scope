//=============================================================================
// IRScope.js V 0.0.1
//=============================================================================

/*:
 * @plugindesc Changes game screen resolution and scale.
 * @author IrenRin
 *
 * @help You'll find no help here.
 */

let IRScope = {};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// PREFERENCES
// edit following lines according to your game requirements.
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Following folders should be present in several scales,
// e.g. img/tilesets32, img/tilesets, ing/tilesets64.
// For not-listed below folders standard tile size (48x48) will be applied.
IRScope.imgDirsToScale = [
    // "img/animations",
    // "img/characters",
    // "img/parallaxes",
    // "img/sv_enemies",
    // "img/battlebacks1",
    // "img/enemies",
    // "img/pictures",
    // "img/system",
    // "img/titles1",
    // "img/battlebacks2",
    // "img/faces",
    // "img/sv_actors",
    "img/tilesets",
    // "img/titles2"
];

// Suggested scale (tile size) options.
IRScope.applySuggestedScale = true; // according to the matrix below

// By default rpgmaker fails to work with tile size above 64x64.
// In order to enable bigger scales download newer pixi-tilemap plugin
// from https://raw.githubusercontent.com/pixijs/tilemap/v4.x/dist/pixi-tilemap.js
// and install it as a usual plugin ABOVE this plugin.
IRScope.suggestedScales = [
    [
        1600, // if device screen is larger than this number
        64    // this tile width and tile height will be applied to the game
    ],
    [
        600,  // if device screen is larger than this number
        48    // this tile width and tile height will be applied to the game
    ],
    [
        0,   // if device screen is larger than this number
        32   // this tile width and tile height will be applied to the game
    ]
];
IRScope.startUpTileWidth = 48; // Will be ignored if applySuggestedScale is true
IRScope.startUpTileHeight = 48; // Will be ignored if applySuggestedScale is true

IRScope.applySuggestedResolution = true; // according to the device resolution
IRScope.startUpScreenWidth = 816; // Will be ignored if applySuggestedResolution is true
IRScope.startUpScreenHeight = 624; // Will be ignored if applySuggestedResolution is true
IRScope.fullScreenRequried = false; // Will switch the game to full screen automatically
IRScope.deviceWidth = window.screen.width * window.devicePixelRatio; // auto detecting device width
IRScope.deviceHeight = window.screen.height * window.devicePixelRatio; // auto detecting device height


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// PRIVATE code
// following code is not intended to be edited
// unless you are sure what you are doing.
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
(() => {
    IRScope.resize = (screenWidth, screenHeight, resizeGraphics = true) => {
        IRScope.resizer = new IRResolution(
            parseInt(screenWidth),
            parseInt(screenHeight)
        );
        IRScope.resizer.resizeSceneManager();
        IRScope.resizer.resizeWindow();

        if (resizeGraphics) {
            IRScope.resizer.resizeGrpahics();
        }

        IRScope.resizer.centerScreen();
    };

    IRScope.scale = (
        tileWidth,
        tileHeight,
        replaceDirs = IRScope.imgDirsToScale
    ) => {
        if (PIXI.tilemap.Constant) {
            // Updated pixi-tilemap lib was downloaded from
            // https://raw.githubusercontent.com/pixijs/tilemap/v4.x/dist/pixi-tilemap.js

            if (tileWidth > 64) {
                PIXI.tilemap.Constant.bufferSize = 4096;
                PIXI.tilemap.Constant.boundSize = 2048;
            }
        }

        IRScope.scaler = new IRScale(
            parseInt(tileWidth),
            parseInt(tileHeight),
            replaceDirs
         );

        if (IRScope.resizer) {
            IRScope.resizer.centerScreen();
        }
    };

    IRScope.scaledPath = (path) => {
        if (IRScope.scaler) {
            return IRScope.scaler.scaledPath(path);
        } else {
            return path;
        }
    };

    IRScope.withScaled = (pathes) => {
        if (IRScope.scaler) {
            return IRScope.scaler.withScaled(pathes);
        } else {
            return pathes;
        }
    };

    IRScope.suggestResolution = (
        deviceWidth = IRScope.deviceWidth,
        deviceHeight = IRScope.deviceHeight,
        resizeGraphics = true
    ) => {
        IRScope.resize(deviceWidth, deviceHeight, resizeGraphics);
    };

    IRScope.suggestScale = (
        deviceWidth = IRScope.deviceWidth,
        deviceHeight = IRScope.deviceHeight
    ) => {
        const scales = IRScope.suggestedScales;

        for (let i = 0; i < scales.length; i++) {
            rules = scales[i];
            let ruleDeviseWidth = rules[0];
            let ruleTileScale = rules[1];

            if (deviceWidth >= ruleDeviseWidth) {
                IRScope.scale(ruleTileScale, ruleTileScale);
                return;
            }
        }
    };

    IRScope.requestFullScreen = function() {
        if (Graphics._isFullScreen()) { // Maker core has this logical error too.
            Graphics._requestFullScreen();
        }
    };

    IRScope.cancelFullScreen = function() {
        if (!Graphics._isFullScreen()) { // Maker core has this logical error too.
            Graphics._cancelFullScreen();
        }
    };

    function IRResolution() {
        this.initialize.apply(this, arguments);
    };

    Object.defineProperties(IRResolution.prototype, {
        screenWidth: {
            get: function() {
                return this._screenWidth;
            }
        },
        screenHeight: {
            get: function() {
                return this._screenHeight;
            }
        }
   });

   IRResolution.prototype.initialize = function(width, height) {
       this._screenWidth = width;
       this._screenHeight = height;
   };

   IRResolution.prototype.resizeSceneManager = function() {
       SceneManager._screenWidth  = this.screenWidth;
       SceneManager._screenHeight = this.screenHeight;
       SceneManager._boxWidth = this.screenWidth;
       SceneManager._boxHeight = this.screenHeight;
   };

   IRResolution.prototype.resizeWindow = function() {
       if (Utils.isNwjs()) {
           const dW = this.screenWidth - window.innerWidth;
           const dH = this.screenHeight - window.innerHeight;
           window.moveBy(-dW / 2, -dH / 2);
           window.resizeBy(dW, dH);
       }
   };

   IRResolution.prototype.resizeGrpahics = function() {
       Graphics.width = this.screenWidth;
       Graphics.height = this.screenHeight;
       Graphics.boxWidth = this.screenWidth;
       Graphics.boxHeight = this.screenHeight;
   };

   IRResolution.prototype.centerScreen = function() {
       const currentScene = SceneManager._scene;
       if (!currentScene) return;

       if (currentScene.constructor.name !== "Scene_Title") {
           $gamePlayer.center($gamePlayer._realX, $gamePlayer._realY);
       };

       SceneManager.goto(currentScene.constructor);
   };

   function IRScale() {
       this.initialize.apply(this, arguments);
   };

   Object.defineProperties(IRScale.prototype, {
       tileWidth: {
           get: function() {
               return this._tileWidth;
           }
       },
       tileHeight: {
           get: function() {
               return this._tileHeight;
           }
       },
       maxAltitude: {
           get: function() {
               return this._maxAltitude;
           }
       }
   });

   IRScale.prototype.initialize = function(width, height, replaceDirs) {
       this._tileWidth = width;
       this._tileHeight = height;
       this._maxAltitude = width;
       this._replaceDirs = replaceDirs;
       this._scaleRequired = width !== 48;
   };

   IRScale.prototype.scaledPath = function(imgFullPath) {
       if (!this._scaleRequired) return imgFullPath;

       for (let i = 0; i < this._replaceDirs.length; i++) {
           let dirPath = this._replaceDirs[i];

           if (imgFullPath.includes(dirPath)) {
               return imgFullPath.replace(dirPath, `${dirPath}${this.tileWidth}`);
           }
       }

       return imgFullPath;
   }

   IRScale.prototype.withScaled = function(list) {
       let result = [];

       list.forEach((imgFullPath) => {
           result.push(imgFullPath);
           let scaled = this.scaledPath(imgFullPath);

           if (scaled !== imgFullPath) {
               result.push(scaled);
           }
       });

       return result;
   }

   if (IRScope.applySuggestedResolution) {
       IRScope.suggestResolution(
           IRScope.deviceWidth,
           IRScope.deviceHeight,
           false
       );
   } else {
       IRScope.resize(
           IRScope.startUpScreenWidth,
           IRScope.startUpScreenHeight,
           false
       );
   }

   if (IRScope.applySuggestedScale) {
       IRScope.suggestScale();
   } else {
       IRScope.scale(
           IRScope.startUpTileWidth,
           IRScope.startUpTileHeight
       );
   }

   if (IRScope.fullScreenRequried) {
       IRScope.requestFullScreen();
   }

   // Patches
   Decrypter._ignoreList = IRScope.withScaled(Decrypter._ignoreList);

   const originalSetLoadingImage = Graphics.setLoadingImage;
   Graphics.setLoadingImage = function(src, ...rest) {
       return originalSetLoadingImage.call(
           this,
           IRScope.scaledPath(src),
           ...rest
       );
   };

   const originalLoadNormalBitmap = ImageManager.loadNormalBitmap;
   ImageManager.loadNormalBitmap = function(path, ...rest) {
       return originalLoadNormalBitmap.call(
           this,
           IRScope.scaledPath(path),
           ...rest
       );
   };

   const originalReserveNormalBitmap = ImageManager.reserveNormalBitmap;
   ImageManager.reserveNormalBitmap = function(path, ...rest) {
       return originalReserveNormalBitmap.call(
           this,
           IRScope.scaledPath(path),
           ...rest
       );
   };

   const originalRequestNormalBitmap = ImageManager.requestNormalBitmap;
   ImageManager.requestNormalBitmap = function(path, ...rest){
       return originalRequestNormalBitmap.call(
           this,
           IRScope.scaledPath(path),
           ...rest
       );
   };

   Game_Map.prototype.tileWidth = function() {
       return IRScope.scaler.tileWidth;
   };

   Game_Map.prototype.tileHeight = function() {
       return IRScope.scaler.tileHeight;
   };

   Game_Vehicle.prototype.maxAltitude = function() {
       return IRScope.scaler.maxAltitude;
   };
})();
