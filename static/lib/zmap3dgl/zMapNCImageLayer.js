// JScript 文件
//********************************************************************************************
//                 Map3DSDK 1.0  本版本的接口都为经纬度坐标
//*********************************************************************************************//
/**
 * end of file
 */ 
/*
 * File of class NetCDFImageLayer
 */
var Cegore;
(function (Cegore) {
    /**
     * 影像图层
     */
    var NetCDFImageLayer = /** @class */ (function () {
        /**
         * 构造影像图层
         *
         * @param {Object} options 包含如下属性
         * @param {String} [options.name] 指定图层的名称
         * @param {String} {options.type} 指定地形数据类型，包括（ZMapImage等）
         *
         * @example
         *  new NetCDFImageLayer({
         *  	name: 'GoogleLayer',
         *  	type: 'ZMapNetCDFImage',
         *  	// 数据的地址
         *  	url :'http://10.148.10.152:9088/zs/weather3d/radarcache',
         *  	// 设置最大显示层级
         *  	minimumLevel: 0,
         *  	maximumLevel: 18
         *  });
         */
        function NetCDFImageLayer(options) {
            /// 判断是否为一个对象
            if (!Cegore.TypeCheck.isObject(options)) {
                throw 'Invalid iamge info';
            }
            var provider = this.createProvider(options);
            if (!Cegore.TypeCheck.isDefined(provider)) {
                throw 'Can not create image layer by type : "' + options.type + '"';
            }
            this._name = Cegore.AutoNames.genName(options.name, "NetCDFImageLayer");
            this._type = options.type;
            this._czLayer = new GmMap3D.ImageryLayer(provider);
            this._czLayer._ZMapLayer = this;
            this._params = Cegore.TypeCheck.defaultValue(options.params, {});

            ///
            this.visible = Cegore.TypeCheck.defaultValue(options.visible, true);
            this.alpha = Cegore.TypeCheck.defaultValue(options.alpha, 1.0);
        }
        Object.defineProperty(NetCDFImageLayer.prototype, "_czlayer", {
            /**
             * @private
             */
            get: function () { return this._czLayer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetCDFImageLayer.prototype, "name", {
            /**
             * 图层名称
             */
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetCDFImageLayer.prototype, "type", {
            /**
             * Provider的类型
             */
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetCDFImageLayer.prototype, "visible", {
            /**
             * 设置图层可见性
             */
            get: function () { return this._visible; },
            /**
             * 图层可见性
             */
            set: function (value) { this._visible = value; this._czLayer.show = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetCDFImageLayer.prototype, "alpha", {
            /**
             * 设置透明度
             */
            get: function () { return this._alpha; },
            /**
             * 透明度
             */
            set: function (value) { this._alpha = value; this._czLayer.alpha = value; },
            enumerable: true,
            configurable: true
        });
        /**
         * 根据options 创建provider
         * @param options
         */
        NetCDFImageLayer.prototype.createProvider = function (options) {
            var copy = {};
            for (var key in options) {
                if (this.hasOwnProperty(key))
                    continue;
                copy[key] = options[key];
            }
            return Cegore.Providers.ImageProviders.createProvider(options.type, copy);
        };
        return NetCDFImageLayer;
    }());
    Cegore.NetCDFImageLayer = NetCDFImageLayer;
})(Cegore || (Cegore = {}));
/*
 * File of class NetCDFImageLayerCollection
 */
var Cegore;
(function (Cegore) {
    /**
     * 影像图层集合
     */
    var NetCDFImageLayerCollection = /** @class */ (function () {
        /**
         * 构造函数，构造一个新的图层管理器
         *
         * @param viewer 主视图
         */
        function NetCDFImageLayerCollection(globe) {
            this._layers = new Cegore.HashMap();
            this._globe = globe;
            this._czLayers = this._globe._czglobe.imageryLayers;
        }
        Object.defineProperty(NetCDFImageLayerCollection.prototype, "length", {
            /**
             * 获取影像图层的数量
             *
             * @return {Number}
             */
            get: function () { return this._czLayers.length; },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加影像图层
         *
         * @param {NetCDFImageLayer} layer 影像图层
         * @param {Number} [index] 索引
         */
        NetCDFImageLayerCollection.prototype.add = function (layer, index) {
            if (!Cegore.TypeCheck.isInstanceOf(layer, Cegore.NetCDFImageLayer)) {
                layer = new Cegore.NetCDFImageLayer(layer);
            }
            if (this._layers.exist(layer.name)) {
                throw "image layer named :" + layer.name + " allready exist.";
            }
            this._czLayers.add(layer._czlayer, index);
            this._layers.put(layer.name, layer);
        };
        /**
         * 获取影像图层
         * @param {String|Number} id 指定影像图层的序号或者名称
         */
        NetCDFImageLayerCollection.prototype.get = function (id) {
            if (Cegore.TypeCheck.isNumber(id)) {
                var czlayer = this._czLayers.get(id);
                if (czlayer)
                    return czlayer._ZMapLayer;
            }
            else if (Cegore.TypeCheck.isString(id)) {
                return this._layers.get(id);
            }
            throw "id must be string or number";
        };
        /**
         * 移除影像图层
         *
         * @param {Number|String|NetCDFImageLayer} id 可以是图层的索引、名称或者图层对象
         */
        NetCDFImageLayerCollection.prototype.remove = function (id) {
            if (Cegore.TypeCheck.isNumber(id) && Cegore.TypeCheck.isString(id)) {
                this.remove(this.get(id));
            }
            else if (Cegore.TypeCheck.isInstanceOf(id, Cegore.NetCDFImageLayer)) {
                var layer = id;
                this._czLayers.remove(layer._czlayer);
                this._layers.remove(id.name);
            }
            throw "id must be string or number or NetCDFImageLayer";
        };
        /**
         * 移除所有图层
         */
        NetCDFImageLayerCollection.prototype.removeAll = function () {
            this._czLayers.removeAll();
            this._layers.removeAll();
        };
        /**
         * 移除所有图层
         */
        NetCDFImageLayerCollection.prototype.clear = function () {
            this.removeAll();
        };
        return NetCDFImageLayerCollection;
    }());
    Cegore.NetCDFImageLayerCollection = NetCDFImageLayerCollection;
})(Cegore || (Cegore = {}));



/*
 * File of class ZMapNetCDFImageProvider
 */
var Cegore;
(function (Cegore) {
    /**
     * 兆图地服务Provider
     */
    var ZMapNetCDFImageProvider = /** @class */ (function () {
        /**
         * 构造函数
         * @param opt
         */
        function ZMapNetCDFImageProvider(opt) {
            /**
             *
             */
            this.getTileCredits = function (x, y, level) {
                return undefined;
            };
            /**
             *
             */
            this.requestImage = function (x, y, level) {
                if (!this._ready) {
                    throw new GmMap3D.DeveloperError('requestImage must not be called before the imagery provider is ready.');
                }
                var url = ZMapNetCDFImageProvider.buildImageUrl(this, x, y, level);
                return GmMap3D.ImageryProvider.loadImage(this, url);
            };
            var trailingSlashRegex = /\/$/;
            var defaultCredit = new GmMap3D.Credit('WMTS');
            opt = GmMap3D.defaultValue(opt, {});
            /// 数据url
            var url = GmMap3D.defaultValue(opt.url, 'http://localhost:88/wmts');
            if (!trailingSlashRegex.test(url)) {
            }
            
            ///
            this._initurl  = opt.url;
            this._url      = url;
            this._params   = opt.params;
            
            this._proxy = opt.proxy;
            this._tileDiscardPolicy = opt.tileDiscardPolicy;
            this._scheme = GmMap3D.defaultValue(opt.scheme, 'Geographic');
            if (this._scheme === 'WebMercator') {
                this._tilingScheme = new GmMap3D.WebMercatorTilingScheme({ ellipsoid: opt.ellipsoid });
            }
            else {
                //if (this._scheme.endsWith('level-0'))
                if (this._scheme.indexOf('level-0')>0)
                    this._tilingScheme = new GmMap3D.GeographicTilingScheme({ ellipsoid: opt.ellipsoid });
                else
                    this._tilingScheme = new GmMap3D.GeographicTilingScheme({
                        ellipsoid: opt.ellipsoid,
                        numberOfLevelZeroTilesX: 8,
                        numberOfLevelZeroTilesY: 4
                    });
            }
            this._tileWidth    = 256;
            this._tileHeight   = 256;
            this._minimumLevel = GmMap3D.defaultValue(opt.minimumLevel, 0);
            this._maximumLevel = GmMap3D.defaultValue(opt.maximumLevel, 18);
            this._extent = GmMap3D.defaultValue(opt.extent, this._tilingScheme.extent);
            this._rectangle = GmMap3D.defaultValue(opt.rectangle, this._tilingScheme.rectangle);
            this._errorEvent = new GmMap3D.Event();
            this._ready = true;
            var credit = GmMap3D.defaultValue(opt.credit, defaultCredit);
            if (typeof credit === 'string') {
                credit = new GmMap3D.Credit(credit);
            }
            this._credit = credit;
        }
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "hasAlphaChannel", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "proxy", {
            get: function () { return this._proxy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "tileWidth", {
            get: function () { return this._tileWidth; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "tileHeight", {
            get: function () { return this._tileHeight; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "maximumLevel", {
            get: function () { return this._maximumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "minimumLevel", {
            get: function () { return this._minimumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "tilingScheme", {
            get: function () { return this._tilingScheme; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "extent", {
            get: function () { return this._extent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "rectangle", {
            get: function () { return this._rectangle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "ileDiscardPolicy", {
            get: function () { return this._tileDiscardPolicy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "errorEvent", {
            get: function () { return this._errorEvent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "ready", {
            get: function () { return this._ready; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapNetCDFImageProvider.prototype, "credit", {
            get: function () { return this._credit; },
            enumerable: true,
            configurable: true
        });
        
        //
        ZMapNetCDFImageProvider.getRealUrl = function(urls)
        {
            var url= urls;
            var fp = urls.indexOf('catalogws');
            if (fp < 0)
            {
                return urls;
            }
            else
            {
                var obj = this;
                url = urls.replace("/catalogws", '');
                url = url.replace("/tile/map", '') + "?f=json";
                $.ajax({
                    url: url,
                    dataType: "json",
                    async: false,
                    success: function(data)
                    {
                        if (obj.JudgePower(data) < 2)
                        {
                            url = data['attributes']['url'];                    
                        }
                        else
                        {
                             url = urls;
                        }
                    },
                    error: function(e)
                    {  
                        url = urls;         
                    }            
                });
            }
            return url;
        }
        
        ZMapNetCDFImageProvider.JudgePower = function(data)
        {
            var mode = 1;
            if (data.descriptions.保密模式 == "公开" || data.descriptions.保密模式 == "")
            {
                mode = 1;
            }
            else if (data.descriptions.保密模式 == "普通保密")
            {
                mode = 2;
            }
            else
            {
                mode = 3;
            }
            return mode;
        }
               
        
        ///
        ZMapNetCDFImageProvider.buildImageUrl = function (provider, x, y, level) {
            var proxy = provider._proxy;
            if (provider._scheme !== 'WebMercator') 
            {
//                if (provider._scheme.endsWith('level-0'))
                 if (provider._scheme.indexOf('level-0')>0)
                    level = level + 1;
                else
                    level = level;
            }
            if (provider.realUrl == null)
            {
                provider.realUrl = this.getRealUrl(provider._initurl);
            }
            
            //left|top风格 ranxiutao 2018-03-26
            var rectangle = provider._tilingScheme.tileXYToRectangle(x, y, level-1);
            var bbox = [
                GmMap3D.Math.toDegrees(rectangle.west),
                GmMap3D.Math.toDegrees(rectangle.south),
                GmMap3D.Math.toDegrees(rectangle.east),
                GmMap3D.Math.toDegrees(rectangle.north)
            ];            
            var url = provider.realUrl + '?'
                                       + 'lvl=' + level + '&col=' + y + '&row=' + x
                                       + '&west='+ bbox[0]
                                       + '&south='+ bbox[1]
                                       + '&east=' + bbox[2]
                                       + '&north='+ bbox[3];
                                       
            var params = provider._params;
            for (var key in params)
            {
                url += "&" + key + "=" + params[key];
            }                                       
                                        
            if (GmMap3D.defined(proxy)) {
                url = proxy.getURL(url);
            }       
            return url;
        };
        return ZMapNetCDFImageProvider;
    }());
    /**
     * 兆图地图影像数据服务 Provider 工厂
     */
    var ZMapNetCDFImageProviderFactory = /** @class */ (function () {
        function ZMapNetCDFImageProviderFactory() {
        }
        ZMapNetCDFImageProviderFactory.prototype.createProvider = function (options) {
            return new ZMapNetCDFImageProvider(options);
        };
        return ZMapNetCDFImageProviderFactory;
    }());
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('ZMapNetCDFImage', new ZMapNetCDFImageProviderFactory());
})(Cegore || (Cegore = {}));