//import {VectorTile} from "../libs/vectortiles/vectortile.js";
//import {Pbf} from "../libs/vectortiles/pbf.js";

var Color = Cesium.Color;
var defined = Cesium.defined;
var defineProperties = Cesium.defineProperties;
var Event = Cesium.Event;
var createPropertyDescriptor = Cesium.createPropertyDescriptor;
var Property = Cesium.Property;
var Material = Cesium.Material;

/**
 * 
 * @param {*} color 
 */
function PolylineDynMaterialProperty(options) {
    options = options || {};
    this._definitionChanged = new Event();
    this.color = options.color;
    this.color2 = options.color2 || Color.RED;
    
    this.lineLength = 1.0;
    this.lineSpeed = 1.0;
    this.startPos = 0;
    this.endPos = 1;
    this.moveTime = Delay + 2;
    this.stopTime = 1;
}

PolylineDynMaterialProperty.MaterialType = 'PolylineDyn';

PolylineDynMaterialProperty.MaterialShader = 
"uniform vec4 color;\
uniform vec4 color2;\
uniform float startPos;\
uniform float endPos;\
uniform float moveTime;\
uniform float stopTime;\
uniform float tranDelay;\
uniform float lineLength;\
uniform float lineSpeed;\
czm_material czm_getMaterial(czm_materialInput materialInput)\
{\
    czm_material material = czm_getDefaultMaterial(materialInput);\
    vec2 st = materialInput.st;\
    vec4 c;\
    float cl = 0.01;\
    float s = st.s * lineLength;\
    float t = st.t * lineLength;\
    if(endPos<=cl){\
        if (s < startPos) c = color;\
        else if (s < endPos) {\
            float h = 0.04*t*t-0.04*t+cl;\
            float h_s = endPos-s;\
            if(h_s<h){\
                c = color;\
            }else{\
                c = color2;\
            }\
        }\
        else c = color;\
    }else{\
        if (s < startPos) c = color;\
        else if (s < endPos) {\
            float st_l = endPos-cl;\
            float st_l2 = endPos-0.2;\
            if(s>=st_l){\
                float h = 0.04*t*t-0.04*t+cl;\
                float h_s = endPos-s;\
                if(h_s<h){\
                    c = color;\
                }else{\
                    c = color2;\
                }\
            }else{\
                if(s>=st_l2){\
                    if(t<0.2||t>0.8){\
                        c = color;\
                    }else{\
                        float t_t = (s - startPos) / lineSpeed;\
                        float d = (tranDelay - moveTime + t_t) / tranDelay;\
                        if (d < 0.0) d = 0.0;\
                        c = mix(color, color2, d);\
                    }\
                }else{\
                    c = color;\
                }\
            }\
        }\
        else c = color;\
    }\
    material.emission = c.rgb;\
    material.alpha = c.a;\
    return material;\
}\
";

// PolylineDynMaterialProperty.MaterialShader = 
// "uniform vec4 color;\
// uniform vec4 color2;\
// uniform float startPos;\
// uniform float endPos;\
// uniform float moveTime;\
// uniform float stopTime;\
// uniform float tranDelay;\
// uniform float lineLength;\
// uniform float lineSpeed;\
// czm_material czm_getMaterial(czm_materialInput materialInput)\
// {\
//     czm_material material = czm_getDefaultMaterial(materialInput);\
//     vec2 st = materialInput.st;\
//     vec4 c;\
//     float s = st.s * lineLength;\
//     if (s < startPos) c = color;\
//     else if (s < endPos) {\
//         float t = (s - startPos) / lineSpeed;\
//         float d = (tranDelay - moveTime + t) / tranDelay;\
//         if (d < 0.0) d = 0.0;\
//         c = mix(color, color2, d);\
//     }\
//     else c = color;\
//     if (st.t < 0.3 || st.t > 0.7) c.a = c.a * 0.5; \
//     material.emission = c.rgb;\
//     material.alpha = c.a;\
//     return material;\
// }\
// ";

defineProperties(PolylineDynMaterialProperty.prototype, {
    /**
     * Gets a value indicating if this property is constant.  A property is considered
     * constant if getValue always returns the same result for the current definition.
     * @memberof PolylineArrowMaterialProperty.prototype
     *
     * @type {Boolean}
     * @readonly
     */
    isConstant: {
        get: function () {
           return false;
        }
    },
    /**
     * Gets the event that is raised whenever the definition of this property changes.
     * The definition is considered to have changed if a call to getValue would return
     * a different result for the same time.
     * @memberof PolylineArrowMaterialProperty.prototype
     *
     * @type {Event}
     * @readonly
     */
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    }
});

/**
 * Gets the {@link Material} type at the provided time.
 *
 * @param {JulianDate} time The time for which to retrieve the type.
 * @returns {String} The type of material.
 */
PolylineDynMaterialProperty.prototype.getType = function (time) {
    return PolylineDynMaterialProperty.MaterialType;
};

/**
 * Gets the value of the property at the provided time.
 *
 * @param {JulianDate} time The time for which to retrieve the value.
 * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
 * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
 */
PolylineDynMaterialProperty.prototype.getValue = function (time, result) {
    if (!defined(result)) {
        result = {};
    }
    result.color = this.color;
    result.color2 = this.color2;
    result.startPos = this.startPos;
    result.endPos = this.endPos;
    result.moveTime = this.moveTime;
    result.stopTime = this.stopTime;
    result.tranDelay = Delay;
    result.lineLength = this.lineLength;
    result.lineSpeed = this.lineSpeed;
    return result;
};

var Delay = 1;

PolylineDynMaterialProperty.prototype.update = function(passed){

    this.moveTime += passed;

    
    if (this.stopTime)
    {
        if (this.moveTime - this.stopTime > Delay)
        {
            //this.startPos = Math.random() / 2 * this.lineLength;
            //this.endPos = this.startPos;
            this.startPos = 0;
            this.endPos = this.startPos;
            this.moveTime = 0;
            this.stopTime = 0;
        }
    }
    else
    {
        //  || (this.endPos - this.startPos > this.lineLength * 0.5 && Math.random() > 0.8)
        if (this.endPos > this.lineLength)
        {
            this.stopTime = this.moveTime;
        }
        else
        {
            this.endPos += (passed * this.lineSpeed);
        }
    }
    
};

/**
 * Compares this property to the provided property and returns
 * <code>true</code> if they are equal, <code>false</code> otherwise.
 *
 * @param {Property} [other] The other property.
 * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
 */
PolylineDynMaterialProperty.prototype.equals = function (other) {
    return this === other;
};


/// 
Material._materialCache.addMaterial(PolylineDynMaterialProperty.MaterialType, {
    fabric : {
        type : PolylineDynMaterialProperty.MaterialType,
        uniforms : {
            color : new Color(1.0, 1.0, 1.0, 1.0),
            color2 : Color.RED,
            startPos: 0,
            endPos: 0,
            stopTime: 0,
            moveTime: 0,
            tranDelay: Delay,
            lineSpeed: 1.0,
            lineLength: 1.0
        },
        source : PolylineDynMaterialProperty.MaterialShader
    },
    translucent : true
});

/*
uig.defineUI('动态线条', function(ui, viewer){

    var czviewer = viewer._czdata.viewer;
    ui.defineButton('测试线', function(){
        
        Cesium.PolylineGeometry.createGeometry(new Cesium.PolylineGeometry({
            positions : Cesium.Cartesian3.fromDegreesArray([0, 0, 1, 0, 2, 0]),
            width : 10,
            material : Color.RED,
            followSurface : false
        }));

        
    });

    ui.defineButton('创建动态线', function(){
        var mat = new PolylineDynMaterialProperty({
            color: Cesium.Color.BLUE,
            color2: Cesium.Color.RED,
            lineLength : 2.0,
            lineSpeed : 1.0    
        });

        var glowingLine = czviewer.entities.add({
            name : 'Glowing blue line on the surface',
            polyline : {
                positions : Cesium.Cartesian3.fromDegreesArrayHeights(
                    [-75, 37, 200000, -125, 37, 200000, -125, 47, 200000]),
                width : 20,
                material : mat,
                followSurface: false
            }
        });

        viewer.scene.preRender.on(function(t){
            mat.update(0.01);
        });
    });
    ui.defineButton('创建多条动态线', function(){

        var mats = [];
        Cegore.LoadWithXhr.loadJSON({
            url : 'assets/road.geojson',
            success: function(data) {
                

                for (var i = 0; i < data.features.length; ++i)
                {
                    var f = data.features[i];
                    var g = f.geometry;
                    var coo = g.coordinates;

                    var pts = [];
                    pts.length = coo.length;

                    for (var k = 0; k < coo.length; ++k)
                    {
                        var c = coo[k];
                        pts[k] = Cesium.Cartesian3.fromDegrees(c[0], c[1]);
                    }

                    var mat = new PolylineDynMaterialProperty({
                        color: Cesium.Color.BLUE,
                        color2: Cesium.Color.RED,
                        lineLength : 2.0,
                        lineSpeed : 1.0    
                    });

                    var glowingLine = czviewer.entities.add({
                        name : 'Glowing blue line on the surface',
                        polyline : {
                            positions : pts,
                            width : 4,
                            material : mat
                        }
                    });

                    // polylines.add({
                    //     positions : pts,
                    //     width : 4,
                    //     material : mat
                    // });

                    mats.push(mat);
                }

                viewer.scene.preRender.on(function(t){
                    for (var i = 0; i < mats.length; ++i)
                    {
                        mats[i].update(0.01);
                    }
                });
            }
        });
        

        // var glowingLine = czviewer.entities.add({
        //     name : 'Glowing blue line on the surface',
        //     polyline : {
        //         positions : Cesium.Cartesian3.fromDegreesArray([-75, 37,
        //                                                         -125, 37]),
        //         width : 10,
        //         material : mat
        //     }
        // });
    });
});*/