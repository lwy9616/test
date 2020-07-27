/**
 *
 * 模型透视功能
 * @author flake
 * @description 对发布的模型进行透视处理，只有部分两面材质的模型支持此功能
 */
;(function(){
    var errorCode = {
        1:'初始化参数错误，请检查类型',
        2:'请确认传入的是函数',
        3:'请确认传进来的是数组'
    }
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
    if (!Array.prototype.filter){
        Array.prototype.filter = function(func, thisArg) {
            'use strict';
            if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
                throw new TypeError();

            var len = this.length >>> 0,
                res = new Array(len), // preallocate array
                t = this, c = 0, i = -1;
            if (thisArg === undefined){
                while (++i !== len){
                    if (i in this){
                        if (func(t[i], i, t)){
                            res[c++] = t[i];
                        }
                    }
                }
            }
            else{
                while (++i !== len){
                    if (i in this){
                        if (func.call(thisArg, t[i], i, t)){
                            res[c++] = t[i];
                        }
                    }
                }
            }

            res.length = c; // shrink down array to proper size
            return res;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {

            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
    function Perspective(map3dView,range) {

        if(!(typeof map3dView === 'object' && map3dView.constructor.name === 'Init3DView')){
            throw new Error(errorCode[1])
        }
        this.map3dView = map3dView      //公司封装之后的视图对象，类型为Init3DView
        this.viewer = map3dView.cesium.viewer //对应Cesium框架内的Viewer类实例 ，类型为Viewer
        this.scene = map3dView.cesium.scene //对应Cesium框架内的Scene类实例 ，类型为Scene
        this.range = Array.isArray(range) ? range : []
    }
    var prop = Perspective.prototype

    /**
     * 【私有】基于回调的模型透视<br>
     * @param call 回调返回为真值，即给模型可见性赋值为visible
     * @param visible true:模型可见，即不透视；false:模型不可见，即透视；
     * @returns {Perspective}
     * @private
     */
    prop._togglePerspectiveCall = function(call,visible){
        if(typeof call !== 'function'){
            throw new Error(errorCode[2])
        }
        var priCollection = this.scene.primitives
        priCollection._primitives.forEach(function (pri,index,collection) {
            if(!this._includeRange(pri.id && pri.id.id)){
                return
            }
            var isTarget = call(pri,index,collection)        //这里获取高阶函数的返回值(返回的值会被转换的Boolean)，是否显示
            if(!!isTarget) {
                pri._nodeCommands && pri._nodeCommands.length > 0 && (pri._nodeCommands[0].show = visible)
            }
        },this)
        return this
    }
    /**
     * 【私有】基于模型id的模型透视<br>
     * @param entityId 将模型id为entityId的模型的可见性设置为visible
     * @param visible true:模型可见，即不透视；false:模型不可见，即透视；
     * @returns {Perspective}
     * @private
     */
    prop._togglePerspective = function(entityId,visible){
        var pri = this.getPrimitive(entityId)
        if(pri && pri._nodeCommands.length > 0) {
            pri._nodeCommands[0].show = visible
        }
        return this;
    }

    /**
     * 判断某个id是否在透视范围内(range长度为0的时候 不检测，即返回0)
     * @param id 模型id
     * @return {boolean} 存在：true；反之false
     * @private
     */
    prop._includeRange = function(id){
        if(this.range.length === 0){
            return true
        }
        for(var i=0,length=this.range.length;i<length;i++){
            if(id === this.range[i]) return true
        }
        return false
    }
    /**
     * 获取primitive 会先检测range里面是否存在
     * @param id 模型id
     * @return {NULL | primitive}
     */
    prop.getPrimitive = function(id){
        if(this._includeRange(id)){
            var priColleation = this.scene.primitives._primitives
            for(var i=0,length=priColleation.length;i<length;i++){
                var pri = priColleation[i],
                    isTarget = pri.id && pri.id.id && (pri.id.id === id)

                if(isTarget) return pri
            }
        }
        return null
    }

    /**
     * 设置哪些模型会被透视，不设置默认会使用所有的模型
     * @param range Array.[String] entity id数组
     * @return {Perspective} this
     * @throws 传递进来的不是数组会报错
     */
    prop.setRange = function(range){
        if(Array.isArray(range)){
            this.range = range
            return this
        } else {
            throw new Error(errorCode[3])
        }
    }
    /**
     * 被透视的模型  添加
     * @param ids {Number | String | Array.[Number] | Array.[String]} 一个或者多个模型id
     * @return {Perspective} this
     */
    prop.addRange = function(ids){
        if(Array.isArray(range)){
            //TODO 去重
            this.range = this.range.concat(ids)
        } else {
            if(typeof ids === 'string' || typeof ids === 'number'){
                this.range.push(ids)
            }
        }
        return this
    }
    /**
     * 从range里面移除某些id
     * @param ids {String | Array.[String]} 一个或者多个id
     * @return {Perspective} this
     */
    prop.removeRange = function(ids){
        if(!Array.isArray(ids)){
            ids = [ids]
        }
        this.range = this.range.filter(function(v){ return ids.indexOf(v) === -1 })
        return this
    }
    prop.cleanRange = function(){
        this.range = []
        return this
    }

    /**
     * 模型透视
     * @param entityId {String} 模型id
     */
    prop.perspectiveById = function(entityId){
        this._togglePerspective(entityId,false)
    }
    /**
     * 关闭模型透视
     * @param entityId {String} 模型id
     */
    prop.closePerspectiveById = function(entityId){
        this._togglePerspective(entityId,true)
    }
    /**
     * 模型透视
     * @param call {Function} 回调函数返回值为true的时候，透视模型
     */
    prop.perspectiveCall = function(call){
        this._togglePerspectiveCall(call,false)
    }

    /**
     * 关闭模型透视
     * @param call {Function} 回调函数返回值为true的时候，关闭模型透视
     */
    prop.closePerspectiveCall = function(call){
        this._togglePerspectiveCall(call,false)
    }

    /**
     * 关闭所有模型的透视
     * @param call
     */
    prop.closeAll = function(){
        this._togglePerspectiveCall(function () {
            return true
        },true)
    }
    /**
     * 打开所有模型的透视
     * @param call
     */
    prop.openAll = function(){
        this._togglePerspectiveCall(function () {
            return true
        },false)
    }

    prop.__debug_half_open = function(){
        this._togglePerspectiveCall(function (primitive,index) {
            return index%2 === 0
        },false)
    }
    prop.__debug_random_half_open = function(){
        this._togglePerspectiveCall(function (primitive,index) {
            return Math.random() > 0.5
        },false)
    }
    window.Perspective = Perspective
}());
