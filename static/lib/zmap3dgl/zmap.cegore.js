var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Cegore
 *
 * 根命名空间，所有Cegore库都会存在于该命名空间
 */
var Cegore;
(function (Cegore) {
    Cegore.Version = 103;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */
/*
 * File of Class TypeCheck
 */
var Cegore;
(function (Cegore) {
    /**
     * 类 TypeCheck
     *
     * 用于JavaScript 类型检查
     *
     */
    var TypeCheck = /** @class */ (function () {
        function TypeCheck() {
        }
        /**
         * 返回值或者默认值
         *
         * 判断一个值是否定义，如果定义则，返回这个值，否则返回默认值
         *
         * @param value 待判断的值
         * @param default 默认值
         */
        TypeCheck.defaultValue = function (value, defaut) {
            if (value !== undefined && value !== null) {
                return value;
            }
            return defaut;
        };
        /**
         * 判断一个变量是否定义
         *
         * @param value 代判断的值
         * @returns 是否定义
         */
        TypeCheck.isDefined = function (value) {
            return value !== undefined && value !== null;
        };
        /**
         * 判断一个变量是否为null
         */
        TypeCheck.isNull = function (value) {
            return value === null;
        };
        /**
         * 这是一个修正的 typeof运算符
         *
         * Undefined 返回 'undefined'
         * null 返回 'null'
         * Boolean 返回 'boolean'
         * Number 返回 'number'
         * String 返回 'string'
         * Symbol 返回 'symbol'
         * 函数   返回  'function'
         * 数组   返回 'array'
         * Object 返回  'object'
         * @param value 带判断类型的值
         * @return 类型名称
         */
        TypeCheck.typeOf = function (value) {
            var s = typeof value;
            if (s == 'object') {
                if (value) {
                    // Check these first, so we can avoid calling Object.prototype.toString if
                    // possible.
                    //
                    // IE improperly marshals typeof across execution contexts, but a
                    // cross-context object will still return false for "instanceof Object".
                    if (value instanceof Array) {
                        return 'array';
                    }
                    else if (value instanceof Object) {
                        return s;
                    }
                    // HACK: In order to use an Object prototype method on the arbitrary
                    //   value, the compiler requires the value be cast to type Object,
                    //   even though the ECMA spec explicitly allows it.
                    var className = Object.prototype.toString.call(/** @type {!Object} */ (value));
                    // In Firefox 3.6, attempting to access iframe window objects' length
                    // property throws an NS_ERROR_FAILURE, so we need to special-case it
                    // here.
                    if (className == '[object Window]') {
                        return 'object';
                    }
                    // We cannot always use constructor == Array or instanceof Array because
                    // different frames have different Array objects. In IE6, if the iframe
                    // where the array was created is destroyed, the array loses its
                    // prototype. Then dereferencing val.splice here throws an exception, so
                    // we can't use isFunction. Calling typeof directly returns 'unknown'
                    // so that will work. In this case, this function will return false and
                    // most array functions will still work because the array is still
                    // array-like (supports length and []) even though it has lost its
                    // prototype.
                    // Mark Miller noticed that Object.prototype.toString
                    // allows access to the unforgeable [[Class]] property.
                    //  15.2.4.2 Object.prototype.toString ( )
                    //  When the toString method is called, the following steps are taken:
                    //      1. Get the [[Class]] property of this object.
                    //      2. Compute a string value by concatenating the three strings
                    //         "[object ", Result(1), and "]".
                    //      3. Return Result(2).
                    // and this behavior survives the destruction of the execution context.
                    if ((className == '[object Array]' ||
                        // In IE all non value types are wrapped as objects across window
                        // boundaries (not iframe though) so we have to do object detection
                        // for this edge case.
                        typeof value.length == 'number' &&
                            typeof value.splice != 'undefined' &&
                            typeof value.propertyIsEnumerable != 'undefined' &&
                            !value.propertyIsEnumerable('splice'))) {
                        return 'array';
                    }
                    // HACK: There is still an array case that fails.
                    //     function ArrayImpostor() {}
                    //     ArrayImpostor.prototype = [];
                    //     var impostor = new ArrayImpostor;
                    // this can be fixed by getting rid of the fast path
                    // (value instanceof Array) and solely relying on
                    // (value && Object.prototype.toString.vall(value) === '[object Array]')
                    // but that would require many more function calls and is not warranted
                    // unless closure code is receiving objects from untrusted sources.
                    // IE in cross-window calls does not correctly marshal the function type
                    // (it appears just as an object) so we cannot use just typeof val ==
                    // 'function'. However, if the object has a call property, it is a
                    // function.
                    if ((className == '[object Function]' ||
                        typeof value.call != 'undefined' &&
                            typeof value.propertyIsEnumerable != 'undefined' &&
                            !value.propertyIsEnumerable('call'))) {
                        return 'function';
                    }
                }
                else {
                    return 'null';
                }
            }
            else if (s == 'function' && typeof value.call == 'undefined') {
                // In Safari typeof nodeList returns 'function', and on Firefox typeof
                // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
                // would like to return object for those and we can detect an invalid
                // function by making sure that the function object has a call method.
                return 'object';
            }
            return s;
        };
        /**
         * 判断是否为函数
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个函数，否则false.
         */
        TypeCheck.isFunction = function (value) {
            return (typeof value === 'function');
        };
        /**
         * 判断是否为函数
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        TypeCheck.isString = function (value) {
            return (typeof value === 'string');
        };
        /**
         * 判断是否为数字
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        TypeCheck.isNumber = function (value) {
            return (typeof value === 'number');
        };
        /**
         * 判断是否为对象
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        TypeCheck.isObject = function (value) {
            var type = typeof value;
            return type == 'object' && value != null || type == 'function';
        };
        /**
         * 判断是否为布尔值
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        TypeCheck.isBool = function (value) {
            return (typeof value === 'boolean');
        };
        /**
         * 判断是否为数组
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        TypeCheck.isArray = function (value) {
            return TypeCheck.typeOf(value) == 'array';
        };
        /**
         * 判断是否为某类型
         *
         * @param val
         * @param type
         */
        TypeCheck.isInstanceOf = function (val, type) {
            return val instanceof type;
        };
        /**
         * 冻结对象
         *
         * 同Object.freeze，兼容不支持该接口的浏览器
         * @param o 要冻结的对象
         * @return 冻结后的对象
         */
        TypeCheck.freezeObject = function (o) {
            return TypeCheck._freezeObject(o);
        };
        /// 
        TypeCheck._freezeObject = Object.freeze ? Object.freeze : function (o) { return o; };
        return TypeCheck;
    }());
    Cegore.TypeCheck = TypeCheck;
})(Cegore || (Cegore = {}));
/*
 * File of Class Map<T>
 */
var Cegore;
(function (Cegore) {
    /**
     * 提供Map容器的基本功能
     */
    var HashMap = /** @class */ (function () {
        /**
         * 构造一个新的Map<T>对象
         * @param creator 构造器，当获取的值不存在时，且没有指定默认值，则通过构造器创建默认值
         */
        function HashMap(creator) {
            this._data = {};
            this._creator = null;
            this._creator = creator;
        }
        /**
         * 获取值
         *
         * @param {string} key 要获取的key值
         * @param {T} def 当获取的值为null时，指定默认值
         *
         * @return {T} 返回获取到的值或者 undefined
         */
        HashMap.prototype.getOrCreate = function (key, def) {
            var item = this._data[key];
            if (Cegore.TypeCheck.isDefined(item)) {
                return item.val;
            }
            /// 当指定了默认值def时，添加并返回默认值
            if (Cegore.TypeCheck.isDefined(def)) {
                item = { val: def };
                ///
                this._data[key] = item;
                return item.val;
            }
            if (Cegore.TypeCheck.isDefined(this._creator)) {
                item = { val: this._creator() };
                ///
                this._data[key] = item;
                return item.val;
            }
            ///
            return undefined;
        };
        /**
         * 获取 Map 中键为 key的对象
         * @param key 键值
         * @return {any|undefined}
         */
        HashMap.prototype.get = function (key) {
            var item = this._data[key];
            if (Cegore.TypeCheck.isDefined(item)) {
                return item.val;
            }
            return;
        };
        /**
         * 设置值
         *
         * @param {string} key 设置的key值
         * @param {T} val 设置的val值
         */
        HashMap.prototype.put = function (key, val) {
            this._data[key] = { val: val };
        };
        /**
         * 根据值获取对应的key
         *
         * @param {T} val 要获取key 的值对象
         */
        HashMap.prototype.key = function (val) {
            for (var key in this._data) {
                if (this._data[key].val === val) {
                    return key;
                }
            }
            ///
            return;
        };
        /**
         * 获取所有的key
         */
        HashMap.prototype.keys = function () {
            var keys = [];
            for (var key in this._data) {
                keys.push(key);
            }
            return keys;
        };
        /**
         * 判断指定的元素是否存在
         */
        HashMap.prototype.exist = function (key) {
            return Cegore.TypeCheck.isDefined(this._data[key]);
        };
        /**
         * 移除指定的元素
         */
        HashMap.prototype.remove = function (key) {
            delete this._data[key];
        };
        /**
         * 移除所有元素
         */
        HashMap.prototype.clear = function () {
            this._data = {};
        };
        /**
         * 移除所有元素
         */
        HashMap.prototype.removeAll = function () {
            this.clear();
        };
        return HashMap;
    }());
    Cegore.HashMap = HashMap;
})(Cegore || (Cegore = {}));
/*
 * File LongEx.ts
 */
var Cegore;
(function (Cegore) {
    /**
     * 字符串处理辅助类
     */
    var StringUtil = /** @class */ (function () {
        function StringUtil() {
        }
        /**
         * 判断一个字符串是否以指定的字符串开始
         *
         * @param str 待判断的字符串
         * @param pattern 字符串样式
         * @param ignoreCase 是否忽略大小写
         */
        StringUtil.startsWidth = function (str, pattern, ignoreCase) {
            /// 线比较字符串长度
            var thisLen = this.length;
            var patternLen = pattern.length;
            if (thisLen < patternLen || patternLen == 0)
                return false;
            /// 获取和 匹配字符串等长的字符
            var startOfThis = str.substr(0, patternLen);
            /// 是否转为小写
            if (ignoreCase) {
                startOfThis = startOfThis.toLowerCase();
                pattern = pattern.toLowerCase();
            }
            ///
            return (startOfThis === pattern);
        };
        /**
         * 判断一个字符串是否以指定的字符串结束
         *
         * @param str 待判断的字符串
         * @param pattern 字符串样式
         * @param ignoreCase 是否忽略大小写
         */
        StringUtil.endsWidth = function (str, pattern, ignoreCase) {
            /// 线比较字符串长度
            var thisLen = this.length;
            var patternLen = pattern.length;
            if (thisLen < patternLen || patternLen == 0)
                return false;
            /// 获取和 匹配字符串等长的字符
            var endOfThis = str.substr(thisLen - patternLen, patternLen);
            /// 是否转为小写
            if (ignoreCase) {
                endOfThis = endOfThis.toLowerCase();
                pattern = pattern.toLowerCase();
            }
            ///
            return (endOfThis === pattern);
        };
        /**
         * 解析整数，js parseInt函数的增强版
         *      解析输入数据为一个整数
         *      如果输入值不是一个数值，则返回默认值
         *      如果未指定默认值，则返回0
         *
         * @param {String} value 要解析的对象
         * @param {Number} def 默认值
         * @param [Number] radix 可选。表示要解析的数字的基数。
         */
        StringUtil.parseInt = function (value, def, radix) {
            var ret = parseInt(value, radix);
            if (!isNaN(ret))
                return ret;
            if (Cegore.TypeCheck.isDefined(def))
                return def;
            return 0;
        };
        /**
         * 解析整数，js parseFloat函数的增强版
         *      解析输入数据为一个整数
         *      如果输入值不是一个数值，则返回默认值
         *      如果未指定默认值，则返回0
         *
         * @param {String} value 要解析的对象
         * @param {Number} def 默认值
         */
        StringUtil.parseFloat = function (value, def) {
            var ret = parseFloat(value);
            if (!isNaN(ret))
                return ret;
            if (Cegore.TypeCheck.isDefined(def))
                return def;
            return 0;
        };
        return StringUtil;
    }());
    Cegore.StringUtil = StringUtil;
})(Cegore || (Cegore = {}));
/**
 * End of file
 */ 
/*
 * File of class ArrayUtil
 */
var Cegore;
(function (Cegore) {
    /**
     * @class
     */
    var ArrayUtil = /** @class */ (function () {
        function ArrayUtil() {
        }
        /**
         * 查找数组，但可以自定义比较函数
         * @param item 查询的对象
         * @param array 查询到数组
         * @param cmp 比较函数
         */
        ArrayUtil.indexOf = function (item, array, cmp) {
            if (!Cegore.TypeCheck.isFunction(cmp)) {
                throw "cmp must be function.";
            }
            for (var i = 0; i < array.length; ++i) {
                if (cmp(array[i], item)) {
                    return i;
                }
            }
            return -1;
        };
        /**
         * 一个空的数组，不可修改
         */
        ArrayUtil.EmptyArray = Cegore.TypeCheck.freezeObject([]);
        return ArrayUtil;
    }());
    Cegore.ArrayUtil = ArrayUtil;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class LoadWithXhr
 */
var Cegore;
(function (Cegore) {
    /**
     * 使用 xhr 加载数据
     */
    var LoadWithXhr = /** @class */ (function () {
        function LoadWithXhr() {
        }
        LoadWithXhr.loadWithXhr = function (options) {
            LoadWithXhr.onPromise(Cesium.Resource.fetch(options), options);
        };
        /**
         * 使用xhr加载json数据
         *
         * @param options
         */
        LoadWithXhr.loadJSON = function (options) {
            LoadWithXhr.onPromise(Cesium.Resource.fetchJson(options.url), options);
        };
        LoadWithXhr.onPromise = function (promise, options) {
            if (!Cegore.TypeCheck.isDefined(promise))
                return;
            if (Cegore.TypeCheck.isFunction(options.success))
                promise.then(options.success);
            if (Cegore.TypeCheck.isFunction(options.error))
                promise.otherwise(options.error);
        };
        return LoadWithXhr;
    }());
    Cegore.LoadWithXhr = LoadWithXhr;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
var Cegore;
(function (Cegore) {
    var DOM = /** @class */ (function () {
        function DOM() {
        }
        DOM.createContext2D = function (width, height) {
            var canvas = document.createElement('CANVAS');
            ///
            if (width)
                canvas.width = width;
            if (height)
                canvas.height = height;
            return canvas.getContext('2d');
        };
        return DOM;
    }());
    Cegore.DOM = DOM;
})(Cegore || (Cegore = {}));
/*
 * File of class Vector2
 */
var Cegore;
(function (Cegore) {
    /**
     * 一个二维的点或者向量
     */
    var Vector2 = /** @class */ (function () {
        function Vector2(v0, v1) {
            /**
             * x坐标值
             */
            this.x = 0.0;
            /**
             * y坐标值
             */
            this.y = 0.0;
            this.set(v0, v1);
        }
        Object.defineProperty(Vector2.prototype, "length", {
            /**
             * 获取当前向量的长度（点到原点的距离）
             */
            get: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "magnitude", {
            /**
             * 向量的权重，同length
             */
            get: function () { return this.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "squaredLength", {
            /**
             * 获取向量长度的平方，用于不需要知道实际长度的情况下，避免进行开方运算
             */
            get: function () { return this.x * this.x + this.y * this.y; },
            enumerable: true,
            configurable: true
        });
        Vector2.prototype.set = function (v0, v1) {
            var x, y;
            switch (Cegore.TypeCheck.typeOf(v0)) {
                case 'number':
                    x = v0;
                    y = v1;
                    break;
                case 'array':
                    x = v0[0];
                    y = v0[1];
                    break;
                case 'object':
                    x = v0.x;
                    y = v0.y;
                    break;
            }
            this.x = Cegore.StringUtil.parseFloat(x);
            this.y = Cegore.StringUtil.parseFloat(y);
        };
        /**
         * 复制当前对象
         * @param result 一个可选的参数，用来存储输出结果
         * @returns 复制的对象
         */
        Vector2.prototype.clone = function (result) {
            return Vector2.clone(this, result);
        };
        /**
         * 判断当前对象和指定的对象是否相等
         * @param right
         */
        Vector2.prototype.equals = function (right) {
            return Vector2.equals(this, right);
        };
        /**
         * 返回如下格式的字符串 '(x,y)'
         */
        Vector2.prototype.toString = function () {
            return '(' + this.x + ',' + this.y + ')';
        };
        /**
         * @private
         */
        Vector2.prototype._asCzVector2 = function () {
            return new Cesium.Cartesian2(this.x, this.y);
        };
        /**
         * 计算两个向量的距离
         * @param left
         * @param right
         */
        Vector2.distance = function (left, right) {
            return Math.sqrt(Vector2.squaredDistance(left, right));
        };
        /**
         * 计算两个向量距离的平方
         * @param left
         * @param right
         */
        Vector2.squaredDistance = function (left, right) {
            var x = left.x - right.x;
            var y = left.y - right.y;
            return x * x + y * y;
        };
        /**
         * 复制传入的对象
         * @param target 要复制的对象
         * @param result 可选的对象，用于存储复制结果
         */
        Vector2.clone = function (target, result) {
            return Vector2.newOrResult(target.x, target.y, result);
        };
        /**
         * 比较两个对象是否相等
         */
        Vector2.equals = function (left, right) {
            return (left === right) ||
                ((Cegore.TypeCheck.isDefined(left)) &&
                    (Cegore.TypeCheck.isDefined(right)) &&
                    (left.x === right.x) &&
                    (left.y === right.y));
        };
        /**
         * 计算两个向量的和
         * @param left
         * @param right
         * @param result
         */
        Vector2.add = function (left, right, result) {
            return Vector2.newOrResult(left.x + right.x, left.y + right.y, result);
        };
        /**
         * 计算两个向量的差
         * @param left
         * @param right
         * @param result
         */
        Vector2.sub = function (left, right, result) {
            return Vector2.newOrResult(left.x - right.x, left.y - right.y, result);
        };
        Vector2.mul = function (left, right, result) {
            if (Cegore.TypeCheck.isNumber(right))
                return Vector2.newOrResult(left.x * right, left.y * right, result);
            if (Cegore.TypeCheck.isInstanceOf(right, Vector2))
                return Vector2.newOrResult(left.x * right.x, left.y * right.y, result);
            throw "unknown param right.";
        };
        Vector2.div = function (left, right, result) {
            if (Cegore.TypeCheck.isNumber(right))
                return Vector2.newOrResult(left.x / right, left.y / right, result);
            if (Cegore.TypeCheck.isInstanceOf(right, Vector2))
                return Vector2.newOrResult(left.x / right.x, left.y / right.y, result);
            throw "unknown param right.";
        };
        /**
         * 对当前向量取反
         * @param target
         * @param result
         */
        Vector2.negate = function (target, result) {
            return Vector2.newOrResult(-target.x, -target.y, result);
        };
        /**
         * 计算两个向量的点积（点乘）
         * @param left
         * @param right
         */
        Vector2.dot = function (left, right) {
            return left.x * right.x + left.y * right.y;
        };
        /**
         * 计算两个向量的叉积（叉乘）
         * @param left
         * @param right
         */
        Vector2.cross = function (left, right, result) {
            return Vector2.newOrResult(-right.y, right.x, result);
        };
        /**
         * 归一化向量
         * @param target
         * @param result
         */
        Vector2.normalize = function (target, result) {
            var fLength = target.length;
            // Will also work for zero-sized vectors, but will change nothing
            var x = target.x, y = target.y;
            if (fLength > 1e-08) {
                fLength = 1.0 / fLength;
                x *= fLength;
                y *= fLength;
            }
            return Vector2.newOrResult(x, y, result);
        };
        /**
         * 计算两个点的中点
         * @param left
         * @param right
         * @param result
         */
        Vector2.middle = function (left, right, result) {
            return Vector2.newOrResult((left.x + right.x) * 0.5, (left.y + right.y) * 0.5, result);
        };
        /**
         * 计算两个向量每个分量的最小值
         * @param left
         * @param right
         * @param result
         */
        Vector2.floor = function (left, right, result) {
            var x = left.x < right.x ? left.x : right.x;
            var y = left.y < right.y ? left.y : right.y;
            return Vector2.newOrResult(x, y, result);
        };
        /**
         * 计算两个向量每个分量的最大值
         * @param left
         * @param right
         * @param result
         */
        Vector2.ceil = function (left, right, result) {
            var x = left.x > right.x ? left.x : right.x;
            var y = left.y > right.y ? left.y : right.y;
            return Vector2.newOrResult(x, y, result);
        };
        /**
         * 对两个向量进行插值
         * @param start 起点
         * @param end 终点
         * @param t 插值参数，介于[0,1]之间
         * @param result
         */
        Vector2.lerp = function (start, end, t, result) {
            t = Cegore.GeoMath.clamp(t, 0, 1);
            Vector2.mul(start, 1 - t, Vector2._LerpStart);
            Vector2.mul(end, t, Vector2._LerpEnd);
            return Vector2.add(Vector2._LerpStart, Vector2._LerpEnd, result);
        };
        /**
         * 计算两个向量之间的夹角，返回弧度
         * @param start
         * @param end
         */
        Vector2.angle = function (start, end) {
            Vector2.normalize(start, Vector2._AngleStart);
            Vector2.normalize(end, Vector2._AngleEnd);
            return Cegore.GeoMath.acosClamped(Vector2.dot(Vector2._AngleStart, Vector2._AngleEnd));
        };
        /**
         * 构造新对象或者使用旧对象
         * @param x
         * @param y
         * @param result
         */
        Vector2.newOrResult = function (x, y, result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Vector2)) {
                return new Vector2(x, y);
            }
            result.x = x;
            result.y = y;
            return result;
        };
        Vector2._LerpStart = new Vector2();
        Vector2._LerpEnd = new Vector2();
        /**
         * 向量（0,0）
         */
        Vector2.ZERO = Cegore.TypeCheck.freezeObject(new Vector2(0, 0));
        /**
         * 向量（1,1），单位向量
         */
        Vector2.UNIT = Cegore.TypeCheck.freezeObject(new Vector2(1, 1));
        /**
         * 向量（1,0）
         */
        Vector2.UNIT_X = Cegore.TypeCheck.freezeObject(new Vector2(1, 0));
        /**
         * 向量（0,1）
         */
        Vector2.UNIT_Y = Cegore.TypeCheck.freezeObject(new Vector2(0, 1));
        return Vector2;
    }());
    Cegore.Vector2 = Vector2;
})(Cegore || (Cegore = {}));
/*
 * File of class Vector3
 */
var Cegore;
(function (Cegore) {
    /**
     * 一个三维的点或者向量
     */
    var Vector3 = /** @class */ (function () {
        function Vector3(v0, v1, v2) {
            /**
             * x坐标值
             */
            this.x = 0.0;
            /**
             * y坐标值
             */
            this.y = 0.0;
            /**
             * z坐标值
             */
            this.z = 0.0;
            this.set(v0, v1, v2);
        }
        Object.defineProperty(Vector3.prototype, "length", {
            /**
             * 获取当前向量的长度（点到原点的距离）
             */
            get: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "magnitude", {
            /**
             * 向量的权重，同length
             */
            get: function () { return this.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "squaredLength", {
            /**
             * 获取向量长度的平方，用于不需要知道实际长度的情况下，避免进行开方运算
             */
            get: function () { return this.x * this.x + this.y * this.y + this.z * this.z; },
            enumerable: true,
            configurable: true
        });
        Vector3.prototype.set = function (v0, v1, v2) {
            var x, y, z;
            switch (Cegore.TypeCheck.typeOf(v0)) {
                case 'number':
                    x = v0;
                    y = v1;
                    z = v2;
                    break;
                case 'array':
                    x = v0[0];
                    y = v0[1];
                    z = v0[2];
                    break;
                case 'object':
                    x = v0.x;
                    y = v0.y;
                    z = v0.z;
                    break;
            }
            this.x = Cegore.StringUtil.parseFloat(x);
            this.y = Cegore.StringUtil.parseFloat(y);
            this.z = Cegore.StringUtil.parseFloat(z);
        };
        /**
         * 复制当前对象
         * @param result 一个可选的参数，用来存储输出结果
         * @returns 复制的对象
         */
        Vector3.prototype.clone = function (result) {
            return Vector3.clone(this, result);
        };
        /**
         * 判断当前对象和指定的对象是否相等
         * @param right
         */
        Vector3.prototype.equals = function (right) {
            return Vector3.equals(this, right);
        };
        /**
         * 返回如下格式的字符串 '(x,y,z)'
         */
        Vector3.prototype.toString = function () {
            return '(' + this.x + ',' + this.y + ',' + this.z + ')';
        };
        /**
         * @private
         */
        Vector3.prototype._asCzVector3 = function () {
            return new Cesium.Cartesian3(this.x, this.y, this.z);
        };
        /**
         * 计算两个向量的距离
         * @param left
         * @param right
         */
        Vector3.distance = function (left, right) {
            return Math.sqrt(Vector3.squaredDistance(left, right));
        };
        /**
         * 计算两个向量距离的平方
         * @param left
         * @param right
         */
        Vector3.squaredDistance = function (left, right) {
            var x = left.x - right.x;
            var y = left.y - right.y;
            var z = left.z - right.z;
            return x * x + y * y + z * z;
        };
        /**
         * 复制传入的对象
         * @param target 要复制的对象
         * @param result 可选的对象，用于存储复制结果
         */
        Vector3.clone = function (target, result) {
            return Vector3.newOrResult(target.x, target.y, target.z, result);
        };
        /**
         * 比较两个对象是否相等
         */
        Vector3.equals = function (left, right) {
            return (left === right) ||
                ((Cegore.TypeCheck.isDefined(left)) &&
                    (Cegore.TypeCheck.isDefined(right)) &&
                    (left.x === right.x) &&
                    (left.y === right.y) &&
                    (left.z === right.z));
        };
        /**
         * 计算两个向量的和
         * @param left
         * @param right
         * @param result
         */
        Vector3.add = function (left, right, result) {
            return Vector3.newOrResult(left.x + right.x, left.y + right.y, left.z + right.z, result);
        };
        /**
         * 计算两个向量的差
         * @param left
         * @param right
         * @param result
         */
        Vector3.sub = function (left, right, result) {
            return Vector3.newOrResult(left.x - right.x, left.y - right.y, left.z - right.z, result);
        };
        Vector3.mul = function (left, right, result) {
            if (Cegore.TypeCheck.isNumber(right))
                return Vector3.newOrResult(left.x * right, left.y * right, left.z * right, result);
            if (Cegore.TypeCheck.isInstanceOf(right, Vector3))
                return Vector3.newOrResult(left.x * right.x, left.y * right.y, left.z * right.z, result);
            throw "unknown param right.";
        };
        Vector3.div = function (left, right, result) {
            if (Cegore.TypeCheck.isNumber(right))
                return Vector3.newOrResult(left.x / right, left.y / right, left.z / right, result);
            if (Cegore.TypeCheck.isInstanceOf(right, Vector3))
                return Vector3.newOrResult(left.x / right.x, left.y / right.y, left.z / right.z, result);
            throw "unknown param right.";
        };
        /**
         * 对当前向量取反
         * @param target
         * @param result
         */
        Vector3.negate = function (target, result) {
            return Vector3.newOrResult(-target.x, -target.y, -target.z, result);
        };
        /**
         * 计算两个向量的点积（点乘）
         * @param left
         * @param right
         */
        Vector3.dot = function (left, right) {
            return left.x * right.x + left.y * right.y + left.z * right.z;
        };
        /**
         * 计算两个向量的叉积（叉乘）
         * @param left
         * @param right
         */
        Vector3.cross = function (left, right, result) {
            var x = left.y * right.z - left.z * right.y;
            var y = left.z * right.x - left.x * right.z;
            var z = left.x * right.y - left.y * right.x;
            return Vector3.newOrResult(x, y, z, result);
        };
        /**
         * 归一化向量
         * @param target
         * @param result
         */
        Vector3.normalize = function (target, result) {
            var fLength = target.length;
            // Will also work for zero-sized vectors, but will change nothing
            var x = target.x, y = target.y, z = target.z;
            if (fLength > 1e-08) {
                fLength = 1.0 / fLength;
                x *= fLength;
                y *= fLength;
                z *= fLength;
            }
            return Vector3.newOrResult(x, y, z, result);
        };
        /**
         * 计算两个点的中点
         * @param left
         * @param right
         * @param result
         */
        Vector3.middle = function (left, right, result) {
            return Vector3.newOrResult((left.x + right.x) * 0.5, (left.y + right.y) * 0.5, (left.z + right.z) * 0.5, result);
        };
        /**
         * 计算两个向量每个分量的最小值
         * @param left
         * @param right
         * @param result
         */
        Vector3.floor = function (left, right, result) {
            var x = left.x < right.x ? left.x : right.x;
            var y = left.y < right.y ? left.y : right.y;
            var z = left.z < right.z ? left.z : right.z;
            return Vector3.newOrResult(x, y, z, result);
        };
        /**
         * 计算两个向量每个分量的最大值
         * @param left
         * @param right
         * @param result
         */
        Vector3.ceil = function (left, right, result) {
            var x = left.x > right.x ? left.x : right.x;
            var y = left.y > right.y ? left.y : right.y;
            var z = left.z > right.z ? left.z : right.z;
            return Vector3.newOrResult(x, y, z, result);
        };
        /**
         * 对两个向量进行插值
         * @param start 起点
         * @param end 终点
         * @param t 插值参数，介于[0,1]之间
         * @param result
         */
        Vector3.lerp = function (start, end, t, result) {
            t = Cegore.GeoMath.clamp(t, 0, 1);
            Vector3.mul(start, 1 - t, Vector3._LerpStart);
            Vector3.mul(end, t, Vector3._LerpEnd);
            return Vector3.add(Vector3._LerpStart, Vector3._LerpEnd, result);
        };
        /**
         * 计算两个向量之间的夹角，返回弧度
         * @param start
         * @param end
         */
        Vector3.angle = function (start, end) {
            Vector3.normalize(start, Vector3._AngleStart);
            Vector3.normalize(end, Vector3._AngleEnd);
            var cosine = Vector3.dot(Vector3._AngleStart, Vector3._AngleEnd);
            var cross = Vector3.cross(Vector3._AngleStart, Vector3._AngleEnd, Vector3._AngleCross);
            var sine = cross.length;
            return Math.atan2(sine, cosine);
        };
        /**
         * 构造新对象或者使用旧对象
         * @param x
         * @param y
         * @param result
         */
        Vector3.newOrResult = function (x, y, z, result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Vector3)) {
                return new Vector3(x, y, z);
            }
            result.x = x;
            result.y = y;
            result.z = z;
            return result;
        };
        Vector3._LerpStart = new Vector3();
        Vector3._LerpEnd = new Vector3();
        /**
         * 向量（0,0）
         */
        Vector3.ZERO = Cegore.TypeCheck.freezeObject(new Vector3(0, 0, 0));
        /**
         * 向量（1,1），单位向量
         */
        Vector3.UNIT = Cegore.TypeCheck.freezeObject(new Vector3(1, 1, 1));
        /**
         * 向量（1,0）
         */
        Vector3.UNIT_X = Cegore.TypeCheck.freezeObject(new Vector3(1, 0, 0));
        /**
         * 向量（0,1）
         */
        Vector3.UNIT_Y = Cegore.TypeCheck.freezeObject(new Vector3(0, 1, 0));
        /**
         * 向量（0,0,1）
         */
        Vector3.UNIT_Z = Cegore.TypeCheck.freezeObject(new Vector3(0, 0, 1));
        return Vector3;
    }());
    Cegore.Vector3 = Vector3;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Position
 */
var Cegore;
(function (Cegore) {
    /**
     * 表示一个位置
     *
     * 该类封装了一个位置信息，表示空间上的一个某一点
     */
    var Position = /** @class */ (function () {
        /**
         * 构造一个新的LongLat对象
         * @param any
         */
        function Position(p0, p1, p2) {
            this.set(p0, p1, p2);
        }
        Object.defineProperty(Position.prototype, "lon", {
            /**
             * 获取经度值
             */
            get: function () { return this._x; },
            /**
             * 设置经度
             */
            set: function (value) { this._x = Cegore.StringUtil.parseFloat(value); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "lat", {
            /**
             * 获取纬度值
             */
            get: function () { return this._y; },
            /**
             * 设置纬度
             */
            set: function (value) { this._y = Cegore.StringUtil.parseFloat(value); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "altitude", {
            /**
             * 获取高程
             */
            get: function () { return this._z; },
            /**
             * 设置高程
             */
            set: function (value) { this._z = Cegore.StringUtil.parseFloat(value); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "x", {
            /**
             * 获取x坐标，同lon
             */
            get: function () { return this.lon; },
            /**
             * 设置x坐标，同lon=val
             */
            set: function (val) { this.lon = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "y", {
            /**
             * 获取y坐标，同lat
             */
            get: function () { return this.lat; },
            /**
             * 设置y坐标，同lat=val
             */
            set: function (val) { this.lat = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "z", {
            /**
             * 获取z坐标，同altitude
             */
            get: function () { return this.altitude; },
            /**
             * 设置z坐标，同altitude=val
             */
            set: function (val) { this.altitude = val; },
            enumerable: true,
            configurable: true
        });
        Position.prototype.set = function (p0, p1, p2) {
            var x, y, z;
            if (Cegore.TypeCheck.isInstanceOf(p0, Cesium.Cartographic)) {
                x = Cegore.GeoMath.toDegree(p0.longitude);
                y = Cegore.GeoMath.toDegree(p0.latitude);
                z = p0.height;
            }
            else {
                switch (Cegore.TypeCheck.typeOf(p0)) {
                    case 'array': {
                        x = p0[0];
                        y = p0[1];
                        z = p0[2];
                        break;
                    }
                    case 'object': {
                        x = p0.x;
                        y = p0.y;
                        z = p0.z;
                        break;
                    }
                    case 'number':
                    case 'string': {
                        x = p0;
                        y = p1;
                        z = p2;
                        break;
                    }
                }
            }
            this.lon = Cegore.TypeCheck.defaultValue(x, 0);
            this.lat = Cegore.TypeCheck.defaultValue(y, 0);
            this.altitude = Cegore.TypeCheck.defaultValue(z, 0);
            ;
        };
        Position.from = function (p0, p1, p2) {
            if (Cegore.TypeCheck.isInstanceOf(p0, Position))
                return p0;
            return new Position(p0, p1, p2);
        };
        /**
         * 解析点字符串
         * @param lineStr 点位字符串，格式 'x,y,z|x,y,z|...';
         */
        Position.parsePoints = function (lineStr) {
            var lonlats = [];
            var pts = lineStr.split('|');
            for (var i = 0; i < pts.length; ++i) {
                var pt = pts.split(',');
                lonlats.push(pt[0], pt[1], pt[2]);
            }
            ///
            return lonlats;
        };
        return Position;
    }());
    Cegore.Position = Position;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Rectangle
 */
var Cegore;
(function (Cegore) {
    /**
     * 一个二维的矩形区域
     *
     * Rectangle可以表述一个地理坐标（经纬度），也可以表示一个二维平面坐标
     * 在表示地理坐标的时候和二维平面坐标的时候某些行为有些不同，
     * 因为地理坐标系在经度方向上是循环连续的（-180和180的位置重合），
     * 所以在使用上需要注意。
     */
    var Rectangle = /** @class */ (function () {
        function Rectangle(v1, v2, v3, v4, v5) {
            /**
             * x 的最小值
             */
            this._minx = 0.0;
            /**
             * y 的最小值
             */
            this._miny = 0.0;
            /**
             * x 的最大值
             */
            this._maxx = 0.0;
            /**
             * y 的最大值
             */
            this._maxy = 0.0;
            /**
             * 是否为空矩形
             */
            this._isEmpty = true;
            /**
             * 是否地理坐标
             */
            this._isGeographical = true;
            var type = Cegore.TypeCheck.typeOf(v1);
            if (type === 'number') {
            }
            else if (type === 'array') {
                var array = v1;
                v5 = v2;
                v1 = array[0];
                v2 = array[1];
                v3 = array[2];
                v4 = array[3];
            }
            else if (Cegore.TypeCheck.isInstanceOf(v1, Cesium.Rectangle)) {
                var rc = v1;
                v1 = Cegore.GeoMath.toDegree(rc.west);
                v2 = Cegore.GeoMath.toDegree(rc.south);
                v3 = Cegore.GeoMath.toDegree(rc.east);
                v4 = Cegore.GeoMath.toDegree(rc.north);
            }
            else if (type === 'object') {
                var obj = v1;
                v5 = v2;
                if (Cegore.TypeCheck.isDefined(v1.minx)) {
                    v1 = obj.minx;
                    v2 = obj.miny;
                    v3 = obj.maxx;
                    v4 = obj.maxy;
                }
                else if (Cegore.TypeCheck.isDefined(v1.west)) {
                    v1 = obj.west;
                    v2 = obj.south;
                    v3 = obj.east;
                    v4 = obj.north;
                }
                else if (Cegore.TypeCheck.isDefined(v1.left)) {
                    v1 = obj.left;
                    v2 = obj.bottom;
                    v3 = obj.right;
                    v4 = obj.top;
                }
            }
            else if (type === 'boolean') {
                v5 = v1;
            }
            else {
                /// empty
                return;
            }
            this._minx = Cegore.TypeCheck.defaultValue(v1, 0.0);
            this._miny = Cegore.TypeCheck.defaultValue(v2, 0.0);
            this._maxx = Cegore.TypeCheck.defaultValue(v3, 0.0);
            this._maxy = Cegore.TypeCheck.defaultValue(v4, 0.0);
            this._isGeographical = Cegore.TypeCheck.defaultValue(v5, true);
            this._isEmpty = false;
        }
        Object.defineProperty(Rectangle.prototype, "minx", {
            /**
             * 获取minx
             */
            get: function () { return this._isEmpty ? 0.0 : this._minx; },
            /**
             * 设置minx，如果当前是地理坐标，则只能设置为 [-180,180] 之间
             */
            set: function (val) {
                this._minx = this._isGeographical ? Rectangle.normalizeLongitude(val) : val;
                this._isEmpty = false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "maxx", {
            /**
             * 获取maxx
             */
            get: function () { return this._isEmpty ? 0.0 : this._maxx; },
            /**
             * 设置maxx，如果当前是地理坐标，则只能设置为 [-180,180] 之间
             */
            set: function (val) {
                this._maxx = this._isGeographical ? Rectangle.normalizeLongitude(val) : val;
                this._isEmpty = false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "miny", {
            /**
             * 获取miny
             */
            get: function () { return this._isEmpty ? 0.0 : this._miny; },
            /**
             * 设置miny，如果当前是地理坐标，则只能设置为 [-90,90] 之间
             */
            set: function (val) {
                this._miny = this._isGeographical ? Rectangle.normalizeLatitude(val) : val;
                this._isEmpty = false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "maxy", {
            /**
             * 获取maxy
             */
            get: function () { return this._isEmpty ? 0.0 : this._maxy; },
            /**
             * 设置maxy，如果当前是地理坐标，则只能设置为 [-90,90] 之间
             */
            set: function (val) {
                this._maxy = this._isGeographical ? Rectangle.normalizeLatitude(val) : val;
                this._isEmpty = false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "empty", {
            /**
             * 获取当前矩形是否为<空>
             */
            get: function () { return this._isEmpty; },
            /**
             * 设置当前矩形是否为<空>
             */
            set: function (empty) { this._isEmpty = empty; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "isGeographical", {
            /**
             * 返回当前对象是否是表示的是地理坐标
             */
            get: function () { return this._isGeographical; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "width", {
            /**
             * 获取矩形的宽度
             */
            get: function () {
                return this.maxx - this.minx;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "height", {
            /**
             * 获取矩形的高度
             */
            get: function () { return this.maxy - this.miny; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "west", {
            /**
             * 获取最西边的值，等同于minx
             */
            get: function () { return this.minx; },
            /**
             * 设置最西边的值，等永远minx = val
             */
            set: function (val) { this.minx = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "east", {
            /**
             * 获取最东边的值，等永远maxx
             */
            get: function () { return this.maxx; },
            /**
             * 设置最东边的值，等永远maxx = val
             */
            set: function (val) { this.maxx = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "south", {
            /**
             * 获取最南边的值，等永远miny
             */
            get: function () { return this.miny; },
            /**
             * 设置最南边的值，等同于miny = val
             */
            set: function (val) { this.miny = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "north", {
            /**
             * 获取最北边的值，等同于maxy
             */
            get: function () { return this.maxy; },
            /**
             * 设置最北边的值，等同于maxy = val
             */
            set: function (val) { this.maxy = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "left", {
            /**
             * 获取最左边的值，等同于minx
             */
            get: function () { return this.minx; },
            /**
             * 设置最左边的值，等永远minx = val
             */
            set: function (val) { this.minx = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "right", {
            /**
             * 获取最右边的值，等永远maxx
             */
            get: function () { return this.maxx; },
            /**
             * 设置最右边的值，等永远maxx = val
             */
            set: function (val) { this.maxx = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            /**
             * 获取最下边的值，等永远miny
             */
            get: function () { return this.miny; },
            /**
             * 设置最下边的值，等同于miny = val
             */
            set: function (val) { this.miny = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "top", {
            /**
             * 获取最上边的值，等同于maxy
             */
            get: function () { return this.maxy; },
            /**
             * 设置最上边的值，等同于maxy = val
             */
            set: function (val) { this.maxy = val; },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取矩形的中心点
         * @param result 一个可选的对象，用来存储矩形的中心点
         * @returns 返回矩形的中心点
         */
        Rectangle.prototype.center = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Cegore.Position)) {
                result = new Cegore.Position();
            }
            ///
            if (this._isGeographical) {
                var minx = this.minx;
                var maxx = this.maxx;
                if (maxx < minx)
                    maxx += 360.0;
                result.x = Cegore.GeoMath.stdAngle((maxx + minx) / 2.0);
            }
            else {
                result.x = (this.minx + this.maxx) / 2.0;
            }
            ///
            result.y = (this.miny + this.maxy) / 2.0;
            return result;
        };
        /**
         * 获取最小点
         * @param result
         */
        Rectangle.prototype.min = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Cegore.Position)) {
                result = new Cegore.Position();
            }
            result.x = this.minx;
            result.y = this.miny;
            return result;
        };
        /**
         * 获取最大点
         * @param result
         */
        Rectangle.prototype.max = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Cegore.Position)) {
                result = new Cegore.Position();
            }
            result.x = this.maxx;
            result.y = this.maxy;
            return result;
        };
        /**
         * 获取左下角
         * @param result
         */
        Rectangle.prototype.leftBottom = function (result) {
            return this.min(result);
        };
        /**
         * 获取左上角
         * @param result
         */
        Rectangle.prototype.leftTop = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Cegore.Position)) {
                result = new Cegore.Position();
            }
            result.x = this.minx;
            result.y = this.maxy;
            return result;
        };
        /**
         * 获取右上角
         * @param result
         */
        Rectangle.prototype.rightTop = function (result) {
            return this.max(result);
        };
        /**
         * 获取右下角
         * @param result
         */
        Rectangle.prototype.rightBottom = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Cegore.Position)) {
                result = new Cegore.Position();
            }
            result.x = this.maxx;
            result.y = this.miny;
            return result;
        };
        /**
         * 获取西南角
         * @param result
         */
        Rectangle.prototype.southWest = function (result) { return this.leftBottom(result); };
        /**
         * 获取东南角
         * @param result
         */
        Rectangle.prototype.southEast = function (result) { return this.rightBottom(result); };
        /**
         * 获取西北角
         * @param result
         */
        Rectangle.prototype.northWest = function (result) { return this.leftTop(result); };
        /**
         * 获取东北角
         * @param result
         */
        Rectangle.prototype.northEast = function (result) { return this.rightTop(result); };
        Rectangle.prototype.inflate = function (v1, v2) {
            if (Cegore.TypeCheck.isNumber(v1)) {
                if (!Cegore.TypeCheck.isNumber(v2))
                    v2 = v1;
            }
            else if (Cegore.TypeCheck.isInstanceOf(v1, Cegore.Vector2)) {
                var pt = v1;
                v1 = pt.x;
                v2 = pt.y;
            }
            else if (Cegore.TypeCheck.isInstanceOf(v1, Cegore.Position)) {
                var pt = v1;
                v1 = pt.x;
                v2 = pt.y;
            }
            this.minx -= v1;
            this.maxx += v1;
            this.miny -= v2;
            this.maxy += v2;
        };
        Rectangle.prototype.merge = function (v, w) {
            /// 数组
            if (Cegore.TypeCheck.isArray(v)) {
                for (var i = 0; i < v.length; ++i) {
                    this.merge(v[i]);
                }
                return;
            }
            if (Cegore.TypeCheck.isNumber(v)) {
                var x = v;
                var y = w;
                if (this.empty) {
                    this.minx = this.maxx = x;
                    this.miny = this.maxy = y;
                    this.empty = false;
                    return;
                }
                if (this._isGeographical) {
                    var sminx = Cegore.GeoMath.innerAngle(x, this.minx);
                    var smaxx = Cegore.GeoMath.innerAngle(x, this.maxx);
                    /// 对于地理坐标模式，使用最近的边进行判断
                    if (sminx <= smaxx && x < this.minx)
                        this.minx = x;
                    if (sminx >= smaxx && x > this.maxx)
                        this.maxx = x;
                }
                else {
                    /// 
                    if (x < this.minx)
                        this.minx = x;
                    if (x > this.maxx)
                        this.maxx = x;
                }
                //
                if (y < this.miny)
                    this.miny = y;
                if (y > this.maxy)
                    this.maxy = y;
                return;
            }
            /// 点
            if (Cegore.TypeCheck.isInstanceOf(v, Cegore.Position)) {
                this.merge(v.x, v.y);
                return;
            }
            if (Cegore.TypeCheck.isInstanceOf(v, Rectangle)) {
                var rc = v;
                if (this.empty) {
                    this.minx = rc.minx;
                    this.miny = rc.miny;
                    this.maxx = rc.maxx;
                    this.maxy = rc.maxy;
                    this.empty = false;
                    return;
                }
                if (this._isGeographical) {
                    var ct = this.center();
                    var sminx = Cegore.GeoMath.innerAngle(ct.x, this.minx);
                    var smaxx = Cegore.GeoMath.innerAngle(ct.x, this.maxx);
                    /// 对于地理坐标模式，使用最近的边进行判断
                    if (sminx <= smaxx && rc.minx < this.minx)
                        this.minx = rc.minx;
                    if (sminx >= smaxx && rc.maxx > this.maxx)
                        this.maxx = rc.maxx;
                }
                else {
                    if (rc.minx < this.minx)
                        this.minx = rc.minx;
                    if (rc.maxx > this.maxx)
                        this.maxx = rc.maxx;
                }
                if (rc.miny < this.miny)
                    this.miny = rc.miny;
                if (rc.maxy > this.maxy)
                    this.maxy = rc.maxy;
                return;
            }
        };
        /**
         * 将当前矩形对象转换成一个数组对象
         *
         * @param result 一个可选的对象，用于存储输出结果
         * @return 一个数组包含矩形的最小值最大值，如：[minx,miny,maxx,maxy]。
         */
        Rectangle.prototype.asArray = function (result) {
            if (!Cegore.TypeCheck.isArray(result)) {
                result = [];
            }
            result[0] = this.minx;
            result[1] = this.miny;
            result[2] = this.maxx;
            result[3] = this.maxy;
            return result;
        };
        /**
         * 复制当前对象
         * @param result 一个可选的对象，用于存储复制结果
         * @returns 复制的结果
         */
        Rectangle.prototype.clone = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Rectangle)) {
                result = new Rectangle();
            }
            result.minx = this.minx;
            result.miny = this.miny;
            result.maxx = this.maxx;
            result.maxy = this.maxy;
            return result;
        };
        Rectangle.prototype.contains = function (v) {
            if (Cegore.TypeCheck.isInstanceOf(v, Cegore.Position)) {
                var p = v;
                if (this.isGeographical) {
                    var x = p.x;
                    var minx = this.miny;
                    var maxx = this.maxx;
                    if (maxx < minx)
                        maxx += 360.0;
                    if (x < minx)
                        x += 360.0;
                    if (x < minx || x > maxx)
                        return false;
                }
                else {
                    if (p.x < this.minx || p.x > this.maxx)
                        return false;
                }
                if (p.y < this.miny || p.y > this.maxy)
                    return false;
                ///
                return true;
            }
            else if (Cegore.TypeCheck.isInstanceOf(v, Rectangle)) {
                var rc = v;
                return this.contains(rc.min()) && this.contains(rc.max());
            }
            throw "unknow param v, v must be a Position or Rectangle.";
        };
        /**
         * 求取两个矩形的交集，如果两个矩形不相交，返回undefined
         * @param rc
         * @param result
         */
        Rectangle.prototype.intersection = function (rc, result) {
            var x1, x2;
            if (this._isGeographical) {
                var minx1 = this.minx;
                var maxx1 = this.maxx;
                var minx2 = rc.minx;
                var maxx2 = rc.maxx;
                if (maxx1 < minx1) {
                    if (maxx2 < minx2)
                        minx2 += 360;
                    else if (minx2 < maxx1) {
                        minx2 += 360;
                        maxx2 += 360;
                    }
                    maxx1 += 360;
                }
                else if (maxx2 < minx2) {
                    if (minx1 < maxx2) {
                        minx1 += 360;
                        maxx1 += 360;
                    }
                    maxx2 += 360;
                }
                x1 = minx1 > minx2 ? minx1 : minx2;
                x2 = maxx1 < maxx2 ? maxx1 : maxx2;
                if (x1 > x2)
                    return undefined;
            }
            else {
                x1 = this.minx > rc.minx ? this.minx : rc.minx;
                x2 = this.maxx < rc.maxx ? this.maxx : rc.maxx;
                if (x1 > x2)
                    return undefined;
            }
            var y1, y2;
            y1 = this.miny > rc.miny ? this.miny : rc.miny;
            y2 = this.maxy < rc.maxy ? this.maxy : rc.maxy;
            if (y1 > y2)
                return undefined;
            if (!Cegore.TypeCheck.isInstanceOf(result, Rectangle)) {
                result = new Rectangle();
            }
            result.minx = x1;
            result.maxx = x2;
            result.miny = y1;
            result.maxy = y2;
            return result;
        };
        /**
         * @private
         */
        Rectangle.prototype.toCZRectangle = function () {
            return Cesium.Rectangle.fromDegrees(this._minx, this.miny, this.maxx, this.maxy);
        };
        /**
         * 标准化经度，使输入的经度处于[-180,180]之间
         * @param lon 待处理的经度
         * @return 返回标准化后的经度
         */
        Rectangle.normalizeLongitude = function (lon) {
            return Cegore.GeoMath.stdAngle(lon);
        };
        /**
         * 标准化纬度，使输入的纬度处于[-90,90]之间
         * @param lat 待处理的纬度
         * @return 返回标准化后的纬度
         */
        Rectangle.normalizeLatitude = function (lat) {
            return Cegore.GeoMath.clamp(lat, -90, 90);
        };
        return Rectangle;
    }());
    Cegore.Rectangle = Rectangle;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class HeadingPitchRoll
 */
var Cegore;
(function (Cegore) {
    /**
     * 表述模型的姿态信息
     */
    var HeadingPitchRoll = /** @class */ (function () {
        /**
         * 构造函数
         */
        function HeadingPitchRoll(v0, v1, v2) {
            /// 方位角，绕Z轴旋转，单位：度
            this._heading = 0.0;
            /// 俯仰角，绕Y轴旋转，单位：度
            this._pitch = 0.0;
            /// 滚转角，绕X轴旋转，单位：度
            this._roll = 0.0;
            this.set(v0, v1, v2);
        }
        Object.defineProperty(HeadingPitchRoll.prototype, "heading", {
            /**
             * 获取 方位角，绕Z轴旋转，单位：度
             */
            get: function () { return this._heading; },
            /**
             * 设置 方位角，绕Z轴旋转，单位：度
             */
            set: function (heading) { this._heading = heading; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HeadingPitchRoll.prototype, "pitch", {
            /**
             * 获取 俯仰角，绕Y轴旋转，单位：度
             */
            get: function () { return this._pitch; },
            /**
             * 设置 俯仰角，绕Y轴旋转，单位：度
             */
            set: function (pitch) { this._pitch = pitch; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HeadingPitchRoll.prototype, "roll", {
            /**
             * 获取 滚转角，绕X轴旋转，单位：度
             */
            get: function () { return this._roll; },
            /**
             * 设置 滚转角，绕X轴旋转，单位：度
             */
            set: function (roll) { this._roll = roll; },
            enumerable: true,
            configurable: true
        });
        HeadingPitchRoll.prototype.set = function (v0, v1, v2) {
            var h, p, r;
            if (Cegore.TypeCheck.isArray(v0)) {
                var hpr = v0;
                h = hpr[0];
                p = hpr[1];
                r = hpr[2];
            }
            else if (Cegore.TypeCheck.isObject(v0)) {
                var hpr = v0;
                h = hpr.heading;
                p = hpr.pitch;
                r = hpr.roll;
            }
            else if (Cegore.TypeCheck.isNumber(v0)) {
                h = v0;
                p = v1;
                r = v2;
            }
            this.heading = Cegore.TypeCheck.defaultValue(h, 0);
            this.pitch = Cegore.TypeCheck.defaultValue(p, 0);
            this.roll = Cegore.TypeCheck.defaultValue(r, 0);
        };
        HeadingPitchRoll.prototype.setFromRadius = function (v0, v1, v2) {
            var h, p, r;
            if (Cegore.TypeCheck.isArray(v0)) {
                var hpr = v0;
                h = hpr[0];
                p = hpr[1];
                r = hpr[2];
            }
            else if (Cegore.TypeCheck.isObject(v0)) {
                var hpr = v0;
                h = hpr.heading;
                p = hpr.pitch;
                r = hpr.roll;
            }
            else if (Cegore.TypeCheck.isNumber(v0)) {
                h = v0;
                p = v1;
                r = v2;
            }
            this.heading = Cegore.GeoMath.toDegree(Cegore.TypeCheck.defaultValue(h, 0));
            this.pitch = Cegore.GeoMath.toDegree(Cegore.TypeCheck.defaultValue(p, 0));
            this.roll = Cegore.GeoMath.toDegree(Cegore.TypeCheck.defaultValue(r, 0));
        };
        return HeadingPitchRoll;
    }());
    Cegore.HeadingPitchRoll = HeadingPitchRoll;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
var Cegore;
(function (Cegore) {
    /**
     * 定义了一个局部坐标下的方位角，高度角和距离
     */
    var HeadingPitchDistance = /** @class */ (function () {
        function HeadingPitchDistance(v0, v1, v2) {
            /**
             * 相对于正北方向的方位角
             */
            this.heading = 0.0;
            /**
             * 相对于xy平面的高度角
             */
            this.pitch = 0.0;
            /**
             * 局部坐标下相对于的中心的距离
             */
            this.distance = 0.0;
            this.set(v0, v1, v2);
        }
        HeadingPitchDistance.prototype.set = function (v0, v1, v2) {
            var h, p, d;
            var type = Cegore.TypeCheck.typeOf(v0);
            switch (type) {
                case 'number':
                    h = v0;
                    p = v1;
                    d = v2;
                    break;
                case 'array':
                    h = v0[0];
                    p = v0[1];
                    d = v0[2];
                    break;
                case 'object':
                    h = v0.heading;
                    p = v0.pitch;
                    d = v0.distance;
                    break;
            }
            this.heading = Cegore.TypeCheck.defaultValue(h, 0);
            this.pitch = Cegore.TypeCheck.defaultValue(p, 0);
            this.distance = Cegore.TypeCheck.defaultValue(d, 0);
        };
        /**
         * @private
         */
        HeadingPitchDistance.prototype._asCzObject = function (result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Cesium.HeadingPitchRange)) {
                result = new Cesium.HeadingPitchRange();
            }
            result.heading = Cegore.GeoMath.toRadian(this.heading);
            result.pitch = Cegore.GeoMath.toRadian(this.pitch);
            result.range = this.distance;
            return result;
        };
        return HeadingPitchDistance;
    }());
    Cegore.HeadingPitchDistance = HeadingPitchDistance;
})(Cegore || (Cegore = {}));
/*
 * File of class GeoMath
 */
var Cegore;
(function (Cegore) {
    /**
     * 地理计算
     *
     * 地理计算类主要提供一些工具函数，用于常用的地理计算函数
     */
    var GeoMath = /** @class */ (function () {
        function GeoMath() {
        }
        /**
         * 度转弧度
         * @param degree
         */
        GeoMath.toRadian = function (degree) {
            return degree * this._degree2radian;
        };
        /**
         * 弧度转度
         * @param radian
         */
        GeoMath.toDegree = function (radian) {
            return radian * this._radian2degree;
        };
        /**
         * 限制val的取值范围，如果val小于min则返回min，如果val大于max则返回max，否则返回val
         *
         * @param val 输入值
         * @param min 最小值
         * @param max 最大值
         */
        GeoMath.clamp = function (val, min, max) {
            if (val < min)
                val = min;
            if (val > max)
                val = max;
            return val;
        };
        /**
         * 同 Math.acos，计算之前先 clamp值到 [-1.0,1.0] 之间，避免返回NaN
         * @param val
         */
        GeoMath.acosClamped = function (value) {
            return Math.acos(GeoMath.clamp(value, -1.0, 1.0));
        };
        /**
         * 同 Math.asin，计算之前先 clamp值到 [-1.0,1.0] 之间，避免返回NaN
         * @param val
         */
        GeoMath.asinClamped = function (value) {
            return Math.asin(GeoMath.clamp(value, -1.0, 1.0));
        };
        GeoMath.random = function (v1, v2) {
            var r = Math.random();
            var min = Cegore.TypeCheck.defaultValue(v1, 0.0);
            var max = Cegore.TypeCheck.defaultValue(v2, 1.0);
            ///
            return min + (max - min) * r;
        };
        GeoMath.surfaceDistance = function (p0, p1, radius) {
            if (Cegore.TypeCheck.isArray(p0)) {
                var sum = 0;
                for (var i = 1; i < p0.length; ++i) {
                    sum += GeoMath.surfaceDistance(p0[i - 1], p0[i], radius);
                }
                return sum;
            }
            if (!Cegore.TypeCheck.isInstanceOf(p0, Cegore.Position))
                p0 = new Cegore.Position(p0);
            if (!Cegore.TypeCheck.isInstanceOf(p1, Cegore.Position))
                p1 = new Cegore.Position(p1);
            if (!Cegore.TypeCheck.isDefined(radius))
                radius = 6378137.0;
            var radLatA = GeoMath.toRadian(p0.lat);
            var radLatB = GeoMath.toRadian(p1.lat);
            var radLonA = GeoMath.toRadian(p0.lon);
            var radLonB = GeoMath.toRadian(p1.lon);
            var ac = Math.cos(radLatA) * Math.cos(radLatB) * Math.cos(radLonA - radLonB);
            var as = Math.sin(radLatA) * Math.sin(radLatB);
            /// ac + as 有可能微微大于1或者小于-1,会导致acos计算出错
            var a = GeoMath.clamp(ac + as, -1, 1);
            ///
            return (Math.acos(a) * radius);
        };
        /**
         * 计算两个角度之间的夹角
         * @param a1
         * @param a2
         */
        GeoMath.innerAngle = function (a1, a2) {
            a1 = GeoMath.stdAngle(a1);
            a2 = GeoMath.stdAngle(a2);
            var s = Math.abs(a1 - a2);
            if (s > 180)
                s = 360 - s;
            return s;
        };
        /**
         * 标准化角度，使输入的角度处于[-180,180]之间
         * @param angle 待处理的角度
         * @return 返回标准化后的角度
         */
        GeoMath.stdAngle = function (angle) {
            var n = angle % 360.0;
            if (n > 180.0)
                n -= 360.0;
            if (n < -180.0)
                n += 360.0;
            return n;
        };
        /**
         * 计算地球表面上多边形的投影面积
         * @param polygon 多边形，定点序列，坐标为经纬度坐标
         * @param radius 地球半径
         */
        GeoMath.surfaceArea = function (polygon, radius) {
            var outs = [];
            var rect = new Cegore.Rectangle();
            for (var i = 0; i < polygon.length; ++i) {
                rect.merge(polygon[i]);
            }
            var ori = rect.min();
            for (var i = 0; i < polygon.length; ++i) {
                var pt = new Cegore.Position(polygon[i]);
                var x = GeoMath.surfaceDistance(new Cegore.Position(pt.x, pt.y), new Cegore.Position(pt.x, ori.y), radius);
                var y = GeoMath.surfaceDistance(new Cegore.Position(pt.x, pt.y), new Cegore.Position(ori.x, pt.y), radius);
                outs.push(new Cegore.Position(x, y));
            }
            return GeoMath.area(outs);
        };
        /**
         * 计算多边形的面积
         * @param polygon 多边形的点序列，输入坐标为笛卡尔坐标系下的二维坐标
         */
        GeoMath.area = function (polygon) {
            return Math.abs(GeoMath.signedArea(polygon));
        };
        /**
         * 计算带方向的面积
         * @param pts 多边形点序列
         */
        GeoMath.signedArea = function (pts) {
            if (pts == null || pts.length < 3)
                return 0;
            var point_num = pts.length;
            var p0 = pts[point_num - 1];
            var p1 = pts[0];
            var p2 = pts[1];
            var s = p1.y * (p0.x - p2.x);
            for (var i = 1; i < point_num; ++i) {
                p0 = p1;
                p1 = p2;
                p2 = pts[(i + 1) % point_num];
                ///
                s += p1.y * (p0.x - p2.x);
            }
            ///
            return s / 2.0;
        };
        GeoMath._degree2radian = Math.PI / 180.0;
        GeoMath._radian2degree = 180.0 / Math.PI;
        return GeoMath;
    }());
    Cegore.GeoMath = GeoMath;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
var Cegore;
(function (Cegore) {
    /**
     * 线段，支持插值
     */
    var Segment = /** @class */ (function () {
        function Segment(begin, end) {
            this._begin = begin;
            this._end = end;
            this._interp = new Cegore.Vector2();
        }
        /**
         * 插值
         * @param amount
         */
        Segment.prototype.interp = function (amount) {
            return Cegore.Vector2.lerp(this._begin, this._end, amount, this._interp);
        };
        return Segment;
    }());
    /**
     * 由多个线段并排构成的桥
     */
    var LineBridge = /** @class */ (function () {
        /**
         * 构造一个桥对象
         * @param begins
         * @param ends
         */
        function LineBridge(begins, ends) {
            this._segments = [];
            var num = begins.length < ends.length ? begins.length : ends.length;
            for (var i = 0; i < num; ++i) {
                this._segments[i] = new Segment(begins[i], ends[i]);
            }
            this._interp = [];
        }
        /**
         * 插值桥中间的点
         * @param amount
         */
        LineBridge.prototype.interp = function (amount) {
            for (var i = 0; i < this._segments.length; ++i) {
                this._interp[i] = this._segments[i].interp(amount);
            }
            ///
            return this._interp;
        };
        return LineBridge;
    }());
    var InterpTool = /** @class */ (function () {
        function InterpTool() {
        }
        /**
         * 计算最近的点
         * @param p
         * @param pts
         */
        InterpTool.nearPoint = function (p, pts) {
            var index = 0;
            var length = Cegore.Vector2.squaredDistance(p, pts[0]);
            for (var i = 1; i < pts.length; ++i) {
                var l = Cegore.Vector2.squaredDistance(p, pts[i]);
                if (l < length) {
                    length = l;
                    index = i;
                }
            }
            return index;
        };
        return InterpTool;
    }());
    /**
     * 在多条线段间进行形插值
     */
    var MultiLineInterp = /** @class */ (function () {
        /// 
        function MultiLineInterp(options) {
            var lines = options.lines.slice();
            for (var i = 0; i < lines.length; ++i) {
                var pts = lines[i];
                for (var j = 0; j < pts.length; ++j) {
                    if (!Cegore.TypeCheck.isInstanceOf(pts[j], Cegore.Vector2))
                        pts[j] = new Cegore.Vector2(pts[j]);
                }
            }
            this._bridges = [];
            for (var i = 1; i < lines.length; ++i) {
                var pts0 = lines[i - 1];
                var pts1 = lines[i];
                this._bridges.push(new LineBridge(pts0, pts1));
            }
        }
        /**
         * 插值折线或者多边形
         * @param amount
         */
        MultiLineInterp.prototype.interp = function (amount) {
            amount = Cegore.GeoMath.clamp(amount, 0, 1);
            var tamount = amount * this._bridges.length;
            var bri, ba;
            if (amount == 1) {
                bri = this._bridges.length - 1;
                ba = 1;
            }
            else {
                bri = Math.floor(tamount);
                ba = tamount - bri;
            }
            ///
            return this._bridges[bri].interp(ba);
        };
        return MultiLineInterp;
    }());
    Cegore.MultiLineInterp = MultiLineInterp;
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    /**
     * 基于Canvas的绘制类，提供基础的功能
     */
    var CanvasDraw = /** @class */ (function () {
        /**
         * 构造函数
         * @param options 一个可选的参数
         * @param options.canvas 一个可选的参数，指定使用的canvas dom 或者 id
         * @param options.width 指定画布的宽度，默认值：512
         * @param options.heigth 指定画布的高度，默认值：512
         */
        function CanvasDraw(options) {
            var width = Cegore.TypeCheck.defaultValue(options.width, 512);
            var height = Cegore.TypeCheck.defaultValue(options.height, 512);
            this._ctx = this.createCanvasContext2D(options.canvas, width, height);
            this._canvas = this._ctx.canvas;
        }
        Object.defineProperty(CanvasDraw.prototype, "canvas", {
            /**
             * 获取输出的Canvas
             */
            get: function () { return this._canvas; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasDraw.prototype, "context", {
            /**
             * 获取 Context2D
             */
            get: function () { return this._ctx; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasDraw.prototype, "rect", {
            /**
             * 获取数据的范围
             */
            get: function () { return this._rect; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasDraw.prototype, "width", {
            /**
             * 获取画布的宽度
             */
            get: function () { return this._canvas.width; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(CanvasDraw.prototype, "height", {
            /**
             * 获取画布的高度
             */
            get: function () { return this._canvas.height; },
            enumerable: true,
            configurable: true
        });
        /**
         * 清空画布
         */
        CanvasDraw.prototype.clear = function () { this._ctx.clearRect(0, 0, this.width, this.height); };
        /**
         * 计算数据的范围
         * @param lines
         */
        CanvasDraw.prototype.calcRect = function (lines) {
            if (!Cegore.TypeCheck.isDefined(this._rect))
                this._rect = new Cegore.Rectangle();
            else
                this._rect.empty = true;
            /// 递归函数
            function calc(lines, rect) {
                for (var i = 0; i < lines.length; ++i) {
                    var line = lines[i];
                    if (Cegore.TypeCheck.isInstanceOf(line, Cegore.Vector2))
                        rect.merge(line.x, line.y);
                    else if (Cegore.TypeCheck.isNumber(line[0])) {
                        lines[i] = new Cegore.Vector2(line);
                        rect.merge(line[0], line[1]);
                    }
                    else
                        calc(line, rect);
                }
            }
            ///
            calc(lines, this._rect);
            ///
            this._geoWidth = this._rect.width;
            this._getHeight = this._rect.height;
        };
        /**
         * X坐标转画布坐标
         * @param x
         */
        CanvasDraw.prototype.convertX = function (x) {
            return (x - this._rect.minx) / this._geoWidth * this.width;
        };
        /**
         * Y坐标转画布坐标
         * @param y
         */
        CanvasDraw.prototype.convertY = function (y) {
            return (this._rect.maxy - y) / this._getHeight * this.height;
        };
        /**
         * 创建或者使用输入的Canvas
         * @param canvas 一个可选的参数，指定使用的Canvas
         */
        CanvasDraw.prototype.createCanvasContext2D = function (canvas, width, height) {
            var result;
            if (Cegore.TypeCheck.isDefined(canvas)) {
                if (Cegore.TypeCheck.isString(canvas))
                    result = document.getElementById(canvas);
                else if (Cegore.TypeCheck.isInstanceOf(canvas, HTMLCanvasElement))
                    result = canvas;
            }
            if (!result) {
                result = document.createElement('CANVAS');
            }
            ///
            if (width)
                result.width = width;
            if (height)
                result.height = height;
            return result.getContext('2d');
        };
        return CanvasDraw;
    }());
    Cegore.CanvasDraw = CanvasDraw;
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    /**
     * 多边形掩码
     */
    var PolygonMask = /** @class */ (function (_super) {
        __extends(PolygonMask, _super);
        /**
         * 构造一个多边形掩码对象
         * @param lines 多边形的点
         * @param options
         */
        function PolygonMask(lines, options) {
            var _this = _super.call(this, options) || this;
            ///
            _this.calcRect(lines);
            ///
            _this._interp = new Cegore.MultiLineInterp({ lines: lines });
            return _this;
        }
        /**
         * 绘制指定时刻的多边形掩码
         * @param amount
         */
        PolygonMask.prototype.draw = function (amount) {
            var ctx = this.context;
            ctx.fillStyle = '#FF0000';
            var pts = this._interp.interp(amount);
            this.clear();
            ctx.beginPath();
            ctx.moveTo(this.convertX(pts[0].x), this.convertY(pts[0].y));
            for (var i = 1; i < pts.length; ++i) {
                ctx.lineTo(this.convertX(pts[i].x), this.convertY(pts[i].y));
            }
            ctx.closePath();
            ctx.fill();
        };
        return PolygonMask;
    }(Cegore.CanvasDraw));
    Cegore.PolygonMask = PolygonMask;
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    /**
     * 折线，多边形渐变
     */
    var PolylineGradual = /** @class */ (function (_super) {
        __extends(PolylineGradual, _super);
        function PolylineGradual(lines, options) {
            var _this = _super.call(this, options) || this;
            _this._fill = true;
            _this._ctx1 = _this.createCanvasContext2D(null, _this.width, _this.height);
            _this._canvas1 = _this._ctx1.canvas;
            _this._ctx2 = _this.createCanvasContext2D(null, _this.width, _this.height);
            _this._canvas2 = _this._ctx2.canvas;
            //this._fadein = TypeCheck.defaultValue(options.fadein, 0.5);
            //this._fadeout = TypeCheck.defaultValue(options.fadeout, 0.5);
            _this._lines = lines;
            ///
            _this.calcRect(lines);
            return _this;
        }
        PolylineGradual.prototype.draw = function (amount) {
            this.clear();
            this.context.fillStyle = '#FF0000';
            this.context.strokeStyle = "#FF0000";
            amount = Cegore.GeoMath.clamp(amount, 0, 1);
            var tamount = amount * (this._lines.length - 1);
            var bri1 = Math.floor(tamount);
            if (bri1 === this._lines.length - 1)
                bri1--;
            ///
            var bri2 = bri1 + 1;
            var ba = tamount - bri1;
            this.drawLine(this._ctx1, this._lines[bri1]);
            this.drawLine(this._ctx2, this._lines[bri2]);
            ///
            this.drawMix(this._ctx1, this._ctx2, ba);
        };
        PolylineGradual.prototype.drawLine = function (ctx, line) {
            var fill = this._fill;
            //let cbyte = Math.floor(alpha * 255);
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#FFFFFF';
            ctx.clearRect(0, 0, this.width, this.height);
            //
            //ctx.globalAlpha = alpha;
            ctx.beginPath();
            ///
            var self = this;
            function draw(line) {
                if (!Cegore.TypeCheck.isInstanceOf(line[0], Cegore.Vector2)) {
                    for (var i_1 = 0; i_1 < line.length; ++i_1) {
                        draw(line[i_1]);
                    }
                }
                ///
                ctx.moveTo(self.convertX(line[0].x), self.convertY(line[0].y));
                for (var i = 1; i < line.length; ++i) {
                    ctx.lineTo(self.convertX(line[i].x), self.convertY(line[i].y));
                }
            }
            ///
            draw(line);
            if (this._fill)
                ctx.fill();
            else
                ctx.stroke();
        };
        PolylineGradual.prototype.drawMix = function (ctx1, ctx2, alpha) {
            var width = this.width;
            var height = this.height;
            var imgdata1 = ctx1.getImageData(0, 0, width, height);
            var imgdata2 = ctx2.getImageData(0, 0, width, height);
            var imgdatat = this.context.getImageData(0, 0, width, height);
            var d1 = imgdata1.data;
            var d2 = imgdata2.data;
            var dt = imgdatat.data;
            var length = width * height * 4;
            for (var i = 0; i < length; i += 4) {
                dt[i] = 255;
                dt[i + 1] = dt[i + 2] = 0;
                if (d1[i + 3] != 0 && d2[i + 3] != 0) {
                    dt[i + 3] = (d1[i] + d2[i]) / 2;
                }
                else if (d1[i + 3] != 0) {
                    dt[i + 3] = (1.0 - alpha) * d1[i + 3];
                }
                else if (d2[i + 3] != 0) {
                    dt[i + 3] = alpha * d2[i + 3];
                }
                else {
                    dt[i + 3] = 0;
                }
                dt[i] = dt[i + 3];
            }
            this.context.putImageData(imgdatat, 0, 0);
        };
        return PolylineGradual;
    }(Cegore.CanvasDraw));
    Cegore.PolylineGradual = PolylineGradual;
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    var DynamicArea = /** @class */ (function () {
        function DynamicArea(options) {
            this._viewer = options.viewer;
            var size = Cegore.TypeCheck.defaultValue(options.textureSize, {});
            function initLines(lines, level, result) {
                if (lines.length == 0)
                    return;
                ///
                var equel = true;
                var length = lines[0].length;
                for (var i = 0; i < lines.length; ++i) {
                    var line = lines[i];
                    if (Cegore.TypeCheck.isNumber(line[0])) {
                        lines[i] = new Cegore.Vector2(line);
                    }
                    else {
                        initLines(line, level + 1, result);
                    }
                    if (length != line.length)
                        equel = false;
                }
                if (level == 0)
                    result.isEquel = equel;
                if (level > 1)
                    result.isSimple = false;
            }
            var result = { isEquel: false, isSimple: true };
            var lines = options.lines.slice();
            initLines(lines, 0, result);
            if (result.isEquel && result.isSimple) {
                this._polygonMask = new Cegore.PolygonMask(lines, {
                    canvas: options.canvas,
                    width: size.width,
                    height: size.height
                });
            }
            else {
                this._polygonMask = new Cegore.PolylineGradual(lines, {
                    canvas: options.canvas,
                    width: size.width,
                    height: size.height
                });
            }
            ///
            this._material = new Cesium.Material({
                fabric: {
                    type: 'Water',
                    uniforms: {
                        specularMap: this._polygonMask.canvas,
                        normalMap: '../../build/dep.debug/Assets/Textures/waterNormals.jpg',
                        frequency: 10000.0,
                        animationSpeed: 0.01,
                        amplitude: 1.0
                    }
                }
            });
            this._appearance = new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: true,
                faceForward: false,
                material: this._material,
                renderState: {
                    fog: { enabled: true, density: 0.01 }
                }
            });
            this._geometry = new Cesium.RectangleGeometry({
                rectangle: this._polygonMask.rect.toCZRectangle(),
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                height: options.height,
                extrudedHeight: options.extrudedHeight,
                granularity: Math.PI / 5000
            });
            ///
            this._primitive = options.viewer._czdata.viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: this._geometry
                }),
                appearance: this._appearance,
                show: true
            }));
        }
        DynamicArea.prototype.draw = function (amount) {
            this._polygonMask.draw(amount);
            var tex = this._material._textures.specularMap;
            var canvas = this._polygonMask.canvas;
            if (tex && tex.width == canvas.width && tex.height == canvas.height) {
                tex.copyFrom(canvas);
            }
        };
        Object.defineProperty(DynamicArea.prototype, "visible", {
            get: function () { return this._primitive ? this._primitive.show : false; },
            set: function (visible) {
                if (this._primitive)
                    this._primitive.show = visible;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 删除该对象
         */
        DynamicArea.prototype.remove = function () {
            this._viewer._czdata.viewer.scene.primitives.remove(this._primitive);
            this._primitive = this._primitive.destroy();
            this._appearance = null;
            this._material = this._material.destroy();
            this._geometry = null;
            this._polygonMask = null;
        };
        return DynamicArea;
    }());
    Cegore.DynamicArea = DynamicArea;
})(Cegore || (Cegore = {}));
/*
 * File of class Color
 */
var Cegore;
(function (Cegore) {
    /**
     * 颜色类
     *
     * 使用 red，green，blue和alpha四个[0.0, 1.0]之间的浮点数分量描述颜色信息
     */
    var Color = /** @class */ (function () {
        function Color(r, g, b, a) {
            this._r = 0.0;
            this._g = 0.0;
            this._b = 0.0;
            this._a = 0.0;
            this.set(r, g, b, a);
        }
        Color.prototype.set = function (r, g, b, a) {
            if (Cegore.TypeCheck.isInstanceOf(r, Cesium.Color)) {
                var c = r;
                r = c.red;
                g = c.green;
                b = c.blue;
                a = c.alpha;
            }
            else if (Cegore.TypeCheck.isString(r)) {
                var c = Color.fromCssColor(r);
                r = c.r;
                g = c.g;
                b = c.b;
                a = c.a;
            }
            else if (Cegore.TypeCheck.isArray(r)) {
                var arr = r;
                r = arr[0];
                g = arr[1];
                b = arr[2];
                a = arr[3];
            }
            else if (Cegore.TypeCheck.isObject(r)) {
                var obj = r;
                r = obj.r;
                g = obj.g;
                b = obj.b;
                a = obj.a;
            }
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        };
        Object.defineProperty(Color.prototype, "red", {
            /**
             * 获取红色分量
             */
            get: function () { return this._r; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "green", {
            /**
             * 获取绿色分量
             */
            get: function () { return this._g; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "blue", {
            /**
             * 获取蓝色分量
             */
            get: function () { return this._b; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "alpha", {
            /**
             * 获取透明度分量
             */
            get: function () { return this._a; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "r", {
            /**
             * 获取红色分量
             */
            get: function () { return this._r; },
            /**
             * 设置红色分量
             */
            set: function (value) { this._r = Cegore.GeoMath.clamp(Cegore.TypeCheck.defaultValue(value, 0.0), 0.0, 1.0); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            /**
             * 获取绿色分量
             */
            get: function () { return this._g; },
            /**
             * 设置绿色分量
             */
            set: function (value) { this._g = Cegore.GeoMath.clamp(Cegore.TypeCheck.defaultValue(value, 0.0), 0.0, 1.0); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            /**
             * 获取蓝色分量
             */
            get: function () { return this._b; },
            /**
             * 设置蓝色分量
             */
            set: function (value) { this._b = Cegore.GeoMath.clamp(Cegore.TypeCheck.defaultValue(value, 0.0), 0.0, 1.0); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            /**
             * 获取透明度分量
             */
            get: function () { return this._a; },
            /**
             * 设置透明度分量
             */
            set: function (value) { this._a = Cegore.GeoMath.clamp(Cegore.TypeCheck.defaultValue(value, 0.0), 0.0, 1.0); },
            enumerable: true,
            configurable: true
        });
        /**
         * 从CSS格式颜色字符构造颜色对象
         *
         * @param css CSS格式的颜色字符串
         */
        Color.fromCssColor = function (css) {
            return new Color(Cesium.Color.fromCssColorString(css));
        };
        /**
         * 通过 0-255的 RGBA分量构造颜色对象
         * @param r [0-255]的红色分量
         * @param g [0-255]的的绿分量
         * @param b [0-255]的的蓝分量
         * @param a [0-255]的的透明分量
         * @param result 用于存储结果的对象
         */
        Color.fromBytes = function (r, g, b, a, result) {
            if (!Cegore.TypeCheck.isInstanceOf(result, Color)) {
                result = Color.BLACK;
            }
            result.r = (r / 255);
            result.g = (g / 255);
            result.b = (b / 255);
            result.a = (a / 255);
            return result;
        };
        /**
         * 从一个32位的 RGBA 构造颜色
         * @param rgba 32位的RGBA颜色
         * @param result 用于存储结果的对象
         */
        Color.fromRGBA32 = function (rgba, result) {
            /// unionUint32 和 unionUint8 共享内存
            Color.UnionUint32[0] = rgba;
            return Color.fromBytes(Color.UnionUint8[0], Color.UnionUint8[1], Color.UnionUint8[2], Color.UnionUint8[3], result);
        };
        /**
         * 根据指定的参数随机生成颜色
         *
         * @param options 用于生成随机颜色的参数
         * @param options.red 如果指定该参数，则是用该参数代替随机值
         * @param options.minRed 指定随机颜色的最小值，默认为0.0
         * @param options.maxRed 指定随机颜色的最大值，默认为1.0
         * @param options.blue 如果指定该参数，则是用该参数代替随机值
         * @param options.minBlue 指定随机颜色的最小值，默认为0.0
         * @param options.maxBlue 指定随机颜色的最大值，默认为1.0
         * @param options.green 如果指定该参数，则是用该参数代替随机值
         * @param options.minGreen 指定随机颜色的最小值，默认为0.0
         * @param options.maxGreen 指定随机颜色的最大值，默认为1.0
         * @param options.alpha 如果指定该参数，则是用该参数代替随机值
         * @param options.minAlpha 指定随机颜色的最小值，默认为0.0
         * @param options.maxAlpha 指定随机颜色的最大值，默认为1.0
         * @param result 一个可选的颜色对象，用于输出存储结果
         */
        Color.fromRandom = function (options, result) {
            function random(v, min, max) {
                if (Cegore.TypeCheck.isNumber(v)) {
                    return v;
                }
                else {
                    min = Cegore.TypeCheck.defaultValue(min, 0.0);
                    max = Cegore.TypeCheck.defaultValue(max, 1.0);
                    return Cegore.GeoMath.random(min, max);
                }
            }
            if (!Cegore.TypeCheck.isInstanceOf(result, Color)) {
                result = Color.BLACK;
            }
            result.r = random(options.red, options.minRed, options.maxRed);
            result.g = random(options.green, options.minGreen, options.maxGreen);
            result.b = random(options.blue, options.minBlue, options.maxBlue);
            result.a = random(options.alpha, options.minAlpha, options.maxAlpha);
            return result;
        };
        /**
         * 将当前颜色转成 CSS 颜色字符串
         * @return 返回一个表示的颜色的CSS字符串
         */
        Color.prototype.toCssColor = function () {
            return new Cesium.Color(this._r, this._g, this._b, this._a).toCssColorString();
        };
        /**
         * 将当前颜色转成 字节数组 [r, g, b, a] , 颜色值为 [0,255]
         * @param result 一个可选的数组对象，用来存储输出值
         * @return 返回一个数组，存储颜色字节
         */
        Color.prototype.toBytes = function (result) {
            if (!Cegore.TypeCheck.isArray(result)) {
                result = [];
            }
            result[0] = Math.floor(this._r * 255);
            result[1] = Math.floor(this._g * 255);
            result[2] = Math.floor(this._b * 255);
            result[3] = Math.floor(this._a * 255);
            return result;
        };
        /**
         * 将当前的颜色转为一个32位的 RGBA 整数
         */
        Color.prototype.toRGBA32 = function () {
            var bytes = this.toBytes();
            Color.UnionUint8[0] = bytes[0];
            Color.UnionUint8[1] = bytes[1];
            Color.UnionUint8[2] = bytes[2];
            Color.UnionUint8[3] = bytes[3];
            return Color.UnionUint32[0];
        };
        /**
         * @private
         */
        Color.prototype.toCZColor = function () {
            return new Cesium.Color(this._r, this._g, this._b, this._a);
        };
        /**
         * 红色 <span class="colorSwath" style="background: #FF0000;"></span>
         */
        Color.RED = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#FF0000'));
        /**
         * 绿色 <span class="colorSwath" style="background: #00FF00;"></span>
         */
        Color.GREEN = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#00FF00'));
        /**
         * 蓝色 <span class="colorSwath" style="background: #0000FF;"></span>
         */
        Color.BLUE = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#0000FF'));
        /**
         * 黑色 <span class="colorSwath" style="background: #000000;"></span>
         */
        Color.BLACK = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#000000'));
        /**
         * 白色 <span class="colorSwath" style="background: #FFFFFF;"></span>
         */
        Color.WHITE = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#FFFFFF'));
        /**
         * 黄色 <span class="colorSwath" style="background: #FFFF00;"></span>
         */
        Color.YELLOW = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#FFFF00'));
        /**
         * 青色 <span class="colorSwath" style="background: #00FFFF;"></span>
         */
        Color.AUQA = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#00FFFF'));
        /**
         * 品红 <span class="colorSwath" style="background: #FF00FF;"></span>
         */
        Color.FUCHSIA = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#FF00FF'));
        /**
         * 灰色 <span class="colorSwath" style="background: #808080;"></span>
         */
        Color.GRAY = Cegore.TypeCheck.freezeObject(Color.fromCssColor('#808080'));
        /// 共享内存的 32位整数和 8位整数，用于颜色格式转换
        Color.ScratchArrayBuffer = new ArrayBuffer(4);
        Color.UnionUint32 = new Uint32Array(Color.ScratchArrayBuffer);
        Color.UnionUint8 = new Uint8Array(Color.ScratchArrayBuffer);
        return Color;
    }());
    Cegore.Color = Color;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Material
 */
var Cegore;
(function (Cegore) {
    /**
     * 材质
     */
    var Material = /** @class */ (function () {
        function Material() {
        }
        return Material;
    }());
    Cegore.Material = Material;
    /**
     * 颜色材质
     */
    var ColorMaterial = /** @class */ (function (_super) {
        __extends(ColorMaterial, _super);
        /**
         * 构造一个颜色材质
         * @param color
         */
        function ColorMaterial(color) {
            var _this = _super.call(this) || this;
            _this._color = new Cegore.Color(Cegore.Color.WHITE);
            if (!Cegore.TypeCheck.isInstanceOf(color, Cegore.Color)) {
                color = new Cegore.Color(color);
            }
            ///
            _this._czmat = new Cesium.ColorMaterialProperty(color.toCZColor());
            return _this;
        }
        Object.defineProperty(ColorMaterial.prototype, "type", {
            /**
             * 获取类型
             */
            get: function () { return 'Color'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorMaterial.prototype, "czmat", {
            /**
             * 获取材质
             * @private
             */
            get: function () { return this._czmat; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorMaterial.prototype, "color", {
            /**
             * 获取颜色
             */
            get: function () { return this._color; },
            /**
             * 设置颜色
             */
            set: function (val) {
                this._color.set(val);
                this._czmat.color = this._color.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        return ColorMaterial;
    }(Material));
    Cegore.ColorMaterial = ColorMaterial;
    /**
     * 图片材质
     *
     * 支持 URL，Image，Canvas，Video
     */
    var ImageMaterial = /** @class */ (function (_super) {
        __extends(ImageMaterial, _super);
        /**
         * 构造一个图像材质
         * @param options 一个可选的参数
         * @param options.image 指定显示的图像，可以是URL，Image，Canvas和Video
         * @param options.repeat 指定图像重复显示的次数，默认值：[1.0, 1.0]
         * @param options.color 指定显示时叠加的颜色，默认值：Color.WHITE
         * @param options.transparent 指定材质是否透明显示，当图片包含透明信息是设置为true
         */
        function ImageMaterial(options) {
            var _this = _super.call(this) || this;
            _this._color = new Cegore.Color(Cegore.Color.WHITE);
            _this._repeat = new Cegore.Vector2(1, 1);
            _this._transparent = false;
            _this._czmat = new Cesium.ImageMaterialProperty();
            _this.color = options.color;
            _this.image = options.image;
            _this.repeat = options.repeat;
            _this.transparent = options.transparent;
            return _this;
        }
        Object.defineProperty(ImageMaterial.prototype, "type", {
            /**
             * 获取类型
             */
            get: function () { return 'Image'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageMaterial.prototype, "czmat", {
            /**
             * 获取材质
             * @private
             */
            get: function () { return this._czmat; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageMaterial.prototype, "color", {
            /**
             * 获取颜色
             */
            get: function () { return this._color; },
            /**
             * 设置颜色
             */
            set: function (val) {
                this._color.set(val);
                this._czmat.color = this._color.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageMaterial.prototype, "image", {
            /**
             * 获取该材质使用的 Image,URL,Canvas,Video
             */
            get: function () { return this._image; },
            /**
             * 设置该材质使用的 Image,URL,Canvas,Video
             */
            set: function (img) {
                this._image = img;
                this._czmat.image = img;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageMaterial.prototype, "repeat", {
            /**
             * 获取图像重复显示的次数，默认值：[1, 1]
             */
            get: function () { return this._repeat; },
            /**
             * 设置图像重复显示的次数，默认值：[1, 1]
             */
            set: function (repeat) {
                this._repeat.set(repeat);
                this._czmat.repeat = this._repeat._asCzVector2();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageMaterial.prototype, "transparent", {
            /**
             * 返回当前材质是否透明
             */
            get: function () { return this._transparent; },
            /**
             * 设置当前材质是否透明
             */
            set: function (val) {
                this._transparent = val;
                this._czmat.transparent = val;
            },
            enumerable: true,
            configurable: true
        });
        return ImageMaterial;
    }(Material));
    Cegore.ImageMaterial = ImageMaterial;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */
/**
 * end of file
 */ 
/*
 * File of class Event
 */
var Cegore;
(function (Cegore) {
    /**
     * 事件监听器，同事记录回调函数和回调this
     */
    var EventListener = /** @class */ (function () {
        /**
         * 构造一个事件监听器
         *
         * @param callback 回调函数，当事件触发时调用的函数
         * @param self 回调函数的this，
         */
        function EventListener(callback, self) {
            this._callback = callback;
            this._self = self;
        }
        /**
         * 判断两个事件是否相同
         * @param e1 待判断的对象
         * @param e2 待判断的对象
         */
        EventListener.equal = function (e1, e2) {
            return (e1._callback === e2._callback &&
                e1._self === e2._self);
        };
        /**
         * 触发事件
         *
         * @param arg 事件参数
         */
        EventListener.prototype.fire = function (args) {
            try {
                this._callback.apply(this._self, args);
            }
            catch (error) {
                console.error('fire event error.');
            }
        };
        return EventListener;
    }());
    /**
     * 事件类
     *
     * 一个通用的工具类，用于管理一个特别的事件。
     *
     * @example
     *
     * 示例1
     *
     * function callback(arg1, arg2){
     * }
     *
     * var evt = new Event();
     * evt.on(callback);
     * evt.fire(1, 2);
     * evt.off(callback);
     *
     * 示例2
     * function MyObject(){
     * }
     *
     * MyObject.prototype.callback = function(arg1, arg2){
     *      this.mArg1 = arg1;
     *      this.mArg2 = arg2;
     * }
     *
     * var obj = new MyObject();
     * var evt = new Event();
     * evt.on(obj.callback, obj);
     * evt.fire(1, 2);
     * evt.off(obj.callback, obj);
     *
     */
    var Event = /** @class */ (function () {
        function Event() {
            /**
             * 事件监听器列表
             */
            this._listeners = [];
        }
        /**
         * 注册事件
         *
         * 当事件触发时，回调函数将会被调用，当指定self是，self将作为回调函数的<code>this</code>
         *
         * @param callback 事件回调函数，当事件触发时被调用
         * @param self 一个可选的对象，当回调函数被调用时，作为回调函数的 <code>this</code> 指针。
         */
        Event.prototype.on = function (callback, self) {
            if (!Cegore.TypeCheck.isFunction(callback))
                throw "need param 'callback' is Function.";
            var event = new EventListener(callback, self);
            var index = Cegore.ArrayUtil.indexOf(event, this._listeners, EventListener.equal);
            if (index === -1)
                this._listeners.push(event);
        };
        /**
         * 反注册事件
         *
         * 移除之前注册的事件回调函数
         *
         * @param callback 使用 on 注册时传入的 callback
         * @param self 使用 on 注册时传入的 self
         */
        Event.prototype.off = function (callback, self) {
            var event = new EventListener(callback, self);
            var index = Cegore.ArrayUtil.indexOf(event, this._listeners, EventListener.equal);
            if (index !== -1)
                this._listeners.splice(index);
        };
        /**
         * 触发事件，调用所有注册的回调函数
         *
         * @param args 传给事件回调函数的参数列表
         */
        Event.prototype.fire = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            for (var i = 0; i < this._listeners.length; ++i) {
                this._listeners[i].fire(args);
            }
        };
        /**
         * 同函数 <code>on</code>
         * @see
         * Event.on
         */
        Event.prototype.addEventListener = function (callback, self) {
            this.on(callback, self);
        };
        /**
         * 同函数 <code>off</code>
         * @see
         * Event.off
         */
        Event.prototype.removeEventListener = function (callback, self) {
            this.off(callback, self);
        };
        return Event;
    }());
    Cegore.Event = Event;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class EventHandle
 */
var Cegore;
(function (Cegore) {
    /**
     * 事件句柄
     */
    var EventHandle = /** @class */ (function () {
        /**
         * 构造函数
         * @param options
         */
        function EventHandle(options) {
            this._events = new Cegore.HashMap(function () { return new Cegore.Event; });
            if (Cegore.TypeCheck.isArray(options)) {
                for (var i = 0; i < options.length; ++i) {
                    var ev = options[i];
                    if (Cegore.TypeCheck.isString(ev.type) &&
                        Cegore.TypeCheck.isFunction(ev.callback)) {
                        this.on(ev.type, ev.callback, ev.self);
                    }
                }
            }
            else if (Cegore.TypeCheck.isObject(options)) {
                for (var type in options) {
                    var callback = options[type];
                    if (Cegore.TypeCheck.isFunction(callback))
                        this.on(type, callback);
                }
            }
        }
        /**
         * 注册事件
         * @param type 事件类型
         * @param callback 事件回调
         * @param self 回调的this
         */
        EventHandle.prototype.on = function (type, callback, self) {
            if (!Cegore.TypeCheck.isString(type))
                throw "need param 'type' is string.";
            if (!Cegore.TypeCheck.isFunction(callback))
                throw "need param 'callback' is Function.";
            this._events.getOrCreate(type).on(callback, self);
        };
        /**
         * 反注册事件
         * @param type 事件类型
         * @param callback 事件回调
         * @param self 回调的this
         */
        EventHandle.prototype.off = function (type, callback, self) {
            var handles = this._events.get(type);
            if (!Cegore.TypeCheck.isDefined(handles))
                return;
            handles.off(callback, self);
        };
        /**
         * 触发事件
         * @param type 事件类型
         * @param arg 事件参数
         */
        EventHandle.prototype.fire = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var handles = this._events.get(type);
            if (!Cegore.TypeCheck.isDefined(handles))
                return;
            handles.fire.apply(handles, args);
        };
        return EventHandle;
    }());
    Cegore.EventHandle = EventHandle;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class AutoNames
 */
var Cegore;
(function (Cegore) {
    /**
     * 自动名称
     *
     * 用于自动生成不重复的名称字符串
     */
    var AutoNames = /** @class */ (function () {
        function AutoNames() {
        }
        /**
         * 生成一个名称
         *
         * 如果指定了名称则使用该名称，未指定则自动使用前缀加序号生成名称
         *
         * @param name 如果指定了名称，则使用该名称
         * @param prefix 自动生成名称的前缀
         */
        AutoNames.genName = function (name, prefix) {
            if (Cegore.TypeCheck.isDefined(name))
                return name;
            if (Cegore.TypeCheck.isDefined(prefix))
                return prefix + '-' + AutoNames.NextIndex++;
            else
                return 'AutoName-' + AutoNames.NextIndex++;
        };
        /**
         * 下一个名称的序号
         */
        AutoNames.NextIndex = 0;
        return AutoNames;
    }());
    Cegore.AutoNames = AutoNames;
})(Cegore || (Cegore = {}));
/*
 * File of class Clock
 */
var Cegore;
(function (Cegore) {
    /**
     * 一个简单的时钟类，用来模拟时间
     *
     * 该类还记录了一个时间区间，用来指导时间轴的显示
     */
    var Clock = /** @class */ (function () {
        /**
         * 构造一个新的时钟类
         * @param viewer
         */
        function Clock(viewer) {
            var _this = this;
            this._onTick = new Cegore.Event();
            this._czClock = viewer._czdata.viewer.clock;
            this._czClock.onTick.addEventListener(function () { _this._onTick.fire(_this); });
        }
        Object.defineProperty(Clock.prototype, "onTick", {
            /**
             * tick 事件，当时间改变时调用
             * @event
             */
            get: function () {
                return this._onTick;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "currentTime", {
            /**
             * 获取当前时间
             */
            get: function () {
                return Cesium.JulianDate.toDate(this._czClock.currentTime);
            },
            /**
             * 设置当前时间
             */
            set: function (value) {
                this._czClock.currentTime = Cesium.JulianDate.fromDate(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "startTime", {
            /**
             * 获取开始时间
             */
            get: function () {
                return Cesium.JulianDate.toDate(this._czClock.startTime);
            },
            /**
             * 设置开始时间
             */
            set: function (value) {
                this._czClock.startTime = Cesium.JulianDate.fromDate(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Clock.prototype, "stopTime", {
            /**
             * 获取停止时间
             */
            get: function () {
                return Cesium.JulianDate.toDate(this._czClock.stopTime);
            },
            /**
             * 设置停止时间
             */
            set: function (value) {
                this._czClock.stopTime = Cesium.JulianDate.fromDate(value);
            },
            enumerable: true,
            configurable: true
        });
        return Clock;
    }());
    Cegore.Clock = Clock;
})(Cegore || (Cegore = {}));
/**
 * End of file
 */ 
/*
 * File of class Camera
 */
var Cegore;
(function (Cegore) {
    /**
     * 相机类
     *
     * 通过该接口可以控制相机的位置和方向
     *
     * @example
     * <pre>
     * 移动相机
     * camera.flyTo({
     *     position : [117.16, 32.71, 15000.0]
     * });
     *
     * 使用事件
     * camera.moveStart.on(function() { console.log('moveStart');  });
     * </pre>
     */
    var Camera = /** @class */ (function () {
        /**
         * 构造函数
         *
         * 不要调用此构造函数，通过viewer对象获取相机类
         *
         * @param viewer
         */
        function Camera(viewer) {
            var _this = this;
            /// 用于输出位置的内部变量，避免重复new
            this._position = new Cegore.Position();
            this._orientation = new Cegore.HeadingPitchRoll();
            /// 事件绑定
            this._eventChanged = new Cegore.Event;
            this._eventMoveStart = new Cegore.Event;
            this._eventMoveEnd = new Cegore.Event;
            this._viewer = viewer;
            this._czData = viewer._czdata;
            this._czCamera = this._czData.camera;
            /// 绑定事件
            this._czCamera.changed.addEventListener(function () { _this._eventChanged.fire(_this); });
            this._czCamera.moveStart.addEventListener(function () { _this._eventMoveStart.fire(_this); });
            this._czCamera.moveEnd.addEventListener(function () { _this._eventMoveEnd.fire(_this); });
        }
        Object.defineProperty(Camera.prototype, "position", {
            /**
             * 获取当前相机的位置
             */
            get: function () {
                this._position.set(this._czData.camera.positionCartographic);
                return this._position;
            },
            /**
             * 设置相机的当前位置
             */
            set: function (pos) {
                if (!Cegore.TypeCheck.isInstanceOf(pos, Cegore.Position)) {
                    this._position.set(pos);
                    pos = this._position;
                }
                this.setView({ position: pos });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "orientation", {
            /**
             * 获取相机的当前姿态
             */
            get: function () {
                this._orientation.setFromRadius(this._czData.camera.heading, this._czData.camera.pitch, this._czData.camera.roll);
                return this._orientation;
            },
            /**
             * 设置相机的当前姿态
             */
            set: function (hpr) {
                if (!Cegore.TypeCheck.isInstanceOf(hpr, Cegore.HeadingPitchRoll)) {
                    this._orientation.set(hpr);
                    hpr = this._orientation;
                }
                this.setView({ orientation: hpr });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "changed", {
            /**
             * 相机改变事件
             *
             * 该事件仅在相机发生一定变化后出发，如有其他需求，请使用 moveStart 和 moveEnd 事件
             * 事件原型 <code> function (camera) {}; </code>
             * @event
             */
            get: function () { return this._eventChanged; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "moveStart", {
            /**
             * 相机开始移动事件
             *
             * 事件原型 <code> function (camera) {}; </code>
             * @event
             */
            get: function () { return this._eventMoveStart; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "moveEnd", {
            /**
             * 相机结束移动事件
             *
             * 事件原型 <code> function (camera) {}; </code>
             * @event
             */
            get: function () { return this._eventMoveEnd; },
            enumerable: true,
            configurable: true
        });
        /**
         * 设置相机的从当前位置飞行到目标点
         *
         * @param options 包含如下属性
         * @param options.position 指定飞行的目标位置
         * @param options.rect 指定飞行目标矩形范围信息
         * @param options.orientation 指定飞行时的姿态
         * @param options.duration 指定飞行的时长，单位：秒。如果不指定，则自动计算
         * @param options.complete 指定飞行完成后的回调函数
         * @param options.cancel 指定飞行取消后的回调函数
         *
         * @description
         * options.position 和 options.rect 任选一个，如果都没有指定则抛出异常
         *
         * @example
         *
         * <pre>
         * // 1. 飞行到一个位置
         * camera.flyTo({
         *     position : [117.16, 32.71, 15000.0]
         * });
         *
         * // 2. 飞行到一个矩形区域
         * camera.flyTo({
         *     rect : [west, south, east, north]
         * });
         *
         * // 3. 飞行到一个位置并带有角度
         * camera.flyTo({
         *     position : [117.16, 32.71, 15000.0],
         *     heading : Cesium.Math.toRadians(175.0),
         *     pitch : Cesium.Math.toRadians(-35.0),
         *     roll : 0.0
         * });
         * </pre>
         */
        Camera.prototype.flyTo = function (options) {
            /// 构建目标
            var destination;
            var orientation;
            /// 指定坐标
            if (Cegore.TypeCheck.isDefined(options.position))
                destination = this.fromPosition(options.position);
            /// 指定范围
            else if (Cegore.TypeCheck.isDefined(options.rect))
                destination = this.fromRectange(options.rect);
            /// 没有指定坐标或者范围
            else
                throw 'position or rect is need.';
            if (Cegore.TypeCheck.isDefined(options.orientation))
                orientation = this.fromOrientation(options.orientation);
            /// 调用内部对象的接口
            return this._czCamera.flyTo({
                destination: destination,
                orientation: orientation,
                duration: options.duration,
                complete: options.complete,
                cancel: options.cancel,
                endTransform: Cesium.Matrix4.IDENTITY
            });
        };
        /**
         * 飞行到一个位置使当前视图刚好包含整个球
         * @param options 参数
         * @param options.center 球的中心点
         * @param options.radius 球的半径
         * @param options.offset 相机的相对方位
         * @param options.duration 指定飞行的时长，单位：秒。如果不指定，则自动计算
         * @param options.complete 指定飞行完成后的回调函数
         * @param options.cancel 指定飞行取消后的回调函数
         *
         *
         */
        Camera.prototype.flyToSphere = function (options) {
            var center = options.center;
            var offset = options.offset;
            if (!Cegore.TypeCheck.isInstanceOf(center, Cegore.Position))
                center = new Cegore.Position(center);
            if (!Cegore.TypeCheck.isInstanceOf(offset, Cegore.HeadingPitchDistance))
                offset = new Cegore.HeadingPitchDistance(offset);
            var bs = new Cesium.BoundingSphere(this.fromPosition(center), options.radius);
            var czoffset;
            if (Cegore.TypeCheck.isDefined(options.offset)) {
                czoffset = offset._asCzObject();
            }
            ///
            this._czCamera.flyToBoundingSphere(bs, {
                offset: czoffset,
                duration: options.duration,
                complete: options.complete,
                cancel: options.cancel,
                endTransform: Cesium.Matrix4.IDENTITY
            });
        };
        /**
         * 停止飞行，相机停止在当前位置
         */
        Camera.prototype.stopFly = function () {
            this._czData.camera.cancelFlight();
        };
        /**
         * 设置相机的位置信息
         *
         * 该接口同flyTo类似，不过没有飞行过程
         *
         * @param options 包含如下属性
         * @param options.position 指定一个坐标位置 [lon, lat, height]，分别是经度（度），纬度（度），高度（米）
         * @param options.rect 指定一个矩形范围信息 [west,south,east,north]，单位：度
         * @param options.orientation 指定姿态
         *
         * @description
         * options.position 和 options.rect 任选一个，如果都没有指定则抛出异常
         *
         * @example
         * <pre>
         * // 1. 飞行到一个位置
         * camera.setView({
         *     position : [117.16, 32.71, 15000.0]
         * });
         *
         * // 2. 飞行到一个矩形区域
         * camera.setView({
         *     rect : [west, south, east, north]
         * });
         *
         * // 3. 飞行到一个位置并带有角度
         * camera.setView({
         *     position : [117.16, 32.71, 15000.0],
         *     heading : Cesium.Math.toRadians(175.0),
         *     pitch : Cesium.Math.toRadians(-35.0),
         *     roll : 0.0
         * });
         * </pre>
         */
        Camera.prototype.setView = function (options) {
            /// 构建目标
            var destination;
            var orientation;
            /// 指定坐标
            if (Cegore.TypeCheck.isDefined(options.position))
                destination = this.fromPosition(options.position);
            /// 指定范围
            else if (Cegore.TypeCheck.isDefined(options.rect))
                destination = this.fromRectange(options.rect);
            /// 没有指定坐标或者范围
            else
                throw 'position or rect is need.';
            if (Cegore.TypeCheck.isDefined(options.orientation))
                orientation = this.fromOrientation(options.orientation);
            /// 调用内部对象的接口
            return this._czData.camera.setView({
                destination: destination,
                orientation: orientation,
                endTransform: Cesium.Matrix4.IDENTITY
            });
        };
        /**
         * 获取当前相机的位置信息
         *
         * @return
         */
        Camera.prototype.getView = function () {
            return {
                position: this.position,
                orientation: this.orientation
            };
        };
        /**
         *
         * 通过目标点和相对位置设置相机的位置和方向
         *
         * lookAt操作会锁定交互中心为目标点，恢复地心交互请使用clearLookAt()
         *
         * @param target
         * @param offset
         */
        Camera.prototype.lookAt = function (target, offset) {
            if (!Cegore.TypeCheck.isInstanceOf(target, Cegore.Position))
                target = new Cegore.Position(target);
            if (!Cegore.TypeCheck.isInstanceOf(offset, Cegore.HeadingPitchDistance))
                offset = new Cegore.HeadingPitchDistance(offset);
            this._czCamera.lookAt(this.fromPosition(target), offset._asCzObject());
        };
        /**
         * 通过视点和目标点设置相机的位置和方向
         *
         * lookAt操作会锁定交互中心为目标点，恢复地心交互请使用clearLookAt()
         *
         * @param eye 视点
         * @param target 目标点
         */
        Camera.prototype.lookAtFromTo = function (eye, target) {
            if (!Cegore.TypeCheck.isInstanceOf(target, Cegore.Position))
                target = new Cegore.Position(target);
            if (!Cegore.TypeCheck.isInstanceOf(eye, Cegore.Position))
                eye = new Cegore.Position(eye);
            var ceye = this.fromPosition(eye);
            var ctar = this.fromPosition(target);
            /// 计算变换矩阵
            var trans = Cesium.Transforms.eastNorthUpToFixedFrame(ctar, Cesium.Ellipsoid.WGS84);
            var invTrans = Cesium.Matrix4.inverse(trans, new Cesium.Matrix4());
            /// 通过逆矩阵计算偏移信息
            var offset = Cesium.Matrix4.multiplyByPoint(invTrans, ceye, new Cesium.Cartesian3());
            this._czCamera.lookAtTransform(trans, offset);
        };
        /**
         * 清除lookAt
         */
        Camera.prototype.clearLookAt = function () {
            this._czCamera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        };
        /**
         * xyz 转 Cesium.Cartesian3
         * @param pos
         */
        Camera.prototype.fromRectange = function (rect) {
            if (!Cegore.TypeCheck.isInstanceOf(rect, Cegore.Rectangle))
                rect = new Cegore.Rectangle(rect);
            return Cesium.Rectangle.fromDegrees(rect.minx, rect.miny, rect.maxx, rect.maxy);
        };
        /**
         * Position 转 Cesium.Cartesian3
         * @param pos
         */
        Camera.prototype.fromPosition = function (pos) {
            if (!Cegore.TypeCheck.isInstanceOf(pos, Cegore.Position))
                pos = new Cegore.Position(pos);
            return Cesium.Cartesian3.fromDegrees(pos.x, pos.y, pos.z, this._czData.ellipsoid);
        };
        /**
         * @private
         * @param ori
         */
        Camera.prototype.fromOrientation = function (ori) {
            if (!Cegore.TypeCheck.isInstanceOf(ori, Cegore.HeadingPitchRoll))
                ori = new Cegore.HeadingPitchRoll(ori);
            return {
                heading: Cegore.GeoMath.toRadian(ori.heading),
                pitch: Cegore.GeoMath.toRadian(ori.pitch),
                roll: Cegore.GeoMath.toRadian(ori.roll),
            };
        };
        return Camera;
    }());
    Cegore.Camera = Camera;
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    /**
     * 相机控制器
     * @alias CameraController
     * @constructor
     *
     * @param {Scene} scene The scene.
     */
    var CameraController = /** @class */ (function () {
        function CameraController(scene) {
            /**
             * 是否启用交互操作
             * @default true
             */
            this.enableInputs = true;
            /**
             * 是否启用平移操作
             * @default true
             */
            this.enableTranslate = true;
            /**
             * 是否启用缩放操作
             * @default true
             */
            this.enableZoom = true;
            /**
             * 是否启用旋转操作
             * @default true
             */
            this.enableRotate = true;
            /**
             * 是否启用倾斜操作
             * @default true
             */
            this.enableTilt = true;
            /**
             * 是否启用升降
             */
            this.enableUpDown = true;
            /**
             * 是否启用自由操作
             * @default true
             */
            this.enableLook = true;
            /**
             * 旋转惯性 <code>[0, 1)</code>
             * @default 0.9
             */
            this.inertiaSpin = 0.9;
            /**
             * 平移惯性 <code>[0, 1)</code>
             * @default 0.9
             */
            this.inertiaTranslate = 0.9;
            /**
             * 缩放惯性 <code>[0, 1)</code>
             * @default 0.8
             */
            this.inertiaZoom = 0.8;
            /**
             * A parameter in the range <code>[0, 1)</code> used to limit the range
             * of various user inputs to a percentage of the window width/height per animation frame.
             * This helps keep the camera under control in low-frame-rate situations.
             * @default 0.1
             */
            this.maximumMovementRatio = 0.1;
            /**
             * Sets the duration, in seconds, of the bounce back animations in 2D and Columbus view.
             * @default 3.0
             */
            this.bounceAnimationTime = 3.0;
            /**
             * 缩放时的最小距离，单位：米
             * @default 1.0
             */
            this.minimumZoomDistance = 1.0;
            /**
             * 缩放时的最大距离：单位：米
             * @default {@link Number.POSITIVE_INFINITY}
             */
            this.maximumZoomDistance = 20000000;
            /**
             * 倾斜时最小弧度，单位：弧度
             * @default 1.0
             */
            this.minimumPitch = Cesium.Math.toRadians(0);
            /**
             * 倾斜时最大弧度：单位：弧度
             * @default {@link Number.POSITIVE_INFINITY}
             */
            this.maximumPitch = Cesium.Math.toRadians(90);
            /**
             * 倾斜时最小弧度，单位：弧度
             * @default 1.0
             */
            this.lookViewMinimumPitch = Cesium.Math.toRadians(0);
            /**
             * 倾斜时最大弧度：单位：弧度
             * @default {@link Number.POSITIVE_INFINITY}
             */
            this.lookViewMaximumPitch = Cesium.Math.toRadians(90);
            /**
             * 平移操作事件
             * @default {@link CameraEventType.LEFT_DRAG}
             */
            this.translateEventTypes = Cesium.CameraEventType.LEFT_DRAG;
            /**
             * 缩放操作事件
             * @default [{@link CameraEventType.RIGHT_DRAG}, {@link CameraEventType.WHEEL}, {@link CameraEventType.PINCH}]
             */
            this.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
            /**
             * 旋转操作的事件
             * @default {@link CameraEventType.LEFT_DRAG}
             */
            this.rotateEventTypes = Cesium.CameraEventType.LEFT_DRAG;
            /**
             * 倾斜操作事件
             */
            this.tiltEventTypes = [
                Cesium.CameraEventType.RIGHT_DRAG,
                Cesium.CameraEventType.PINCH,
                { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL }
            ];
            /**
             * 升降事件
             */
            this.upDownEventTypes = { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.ALT };
            /**
             * 自由观看事件
             * @default { eventType : {@link CameraEventType.LEFT_DRAG}, modifier : {@link KeyboardEventModifier.SHIFT} }
             */
            this.lookEventTypes = {
                eventType: Cesium.CameraEventType.LEFT_DRAG,
                modifier: Cesium.KeyboardEventModifier.SHIFT
            };
            /**
             * Enables or disables camera collision detection with terrain.
             * @default true
             */
            this.enableCollisionDetection = true;
            /**
             * 是否启用平面模式
             */
            this.enableFlatMode = false;
            /**
             * 平面交互高程
             */
            this.flatModeHeight = 0;
            /**
             * 交互平面偏移值
             */
            this.flatModeOffset = 0;
            ///
            this._lastInertiaSpinMovement = undefined;
            this._lastInertiaZoomMovement = undefined;
            this._lastInertiaTranslateMovement = undefined;
            this._lastInertiaTiltMovement = undefined;
            this._horizontalRotationAxis = undefined;
            ///
            this._tiltCenterMousePosition = new Cesium.Cartesian2(-1.0, -1.0);
            this._tiltCenter = new Cesium.Cartesian3();
            // Constants, Make any of these public?
            this._zoomFactor = 5.0;
            this._maximumRotateRate = 1.77;
            this._minimumRotateRate = 1.0 / 5000.0;
            this._minimumZoomRate = 20.0;
            this._maximumZoomRate = 5906376272000.0; // distance from the Sun to Pluto in meters.
            if (!Cesium.defined(scene)) {
                throw new Cesium.DeveloperError('scene is required.');
            }
            /// 事件聚合
            this._scene = scene;
            this._aggregator = new Cesium.CameraEventAggregator(scene.canvas);
        }
        /**
         *
         */
        CameraController.prototype.isDestroyed = function () {
            return false;
        };
        /**
         * @example
         * controller = controller && controller.destroy();
         */
        CameraController.prototype.destroy = function () {
            this._aggregator = this._aggregator && this._aggregator.destroy();
            return Cesium.destroyObject(this);
        };
        /**
         * 更新交互状态
         */
        CameraController.prototype.update = function () {
            /// 
            var scene = this._scene;
            var mode = scene.mode;
            ///
            if (mode === Cegore.SceneMode.SCENE2D) {
                this.update2D();
            }
            else if (mode === Cegore.SceneMode.COLUMBUS_VIEW) {
                this._horizontalRotationAxis = Cesium.Cartesian3.UNIT_Z;
                this.updateCV();
            }
            else if (mode === Cegore.SceneMode.SCENE3D) {
                this._horizontalRotationAxis = undefined;
                this.update3D();
            }
            ///
            this._aggregator.reset();
        };
        CameraController.prototype._checkLimit = function (pos, oldHpr, newHpr) {
            var globe = this._scene.globe;
            if (this.enableCollisionDetection && globe && globe.show) {
                var ray = checkLimitRay;
                var dir = pos.clone(ray.direction);
                Cesium.Cartesian3.normalize(dir, dir);
                var coll = globe.pick(ray, this._scene, checkLimitHist);
                if (Cesium.defined(coll) && Cesium.Cartesian3.magnitudeSquared(pos) < Cesium.Cartesian3.magnitudeSquared(coll)) {
                    return false;
                }
            }
            return true;
        };
        /**
         * 获取系统椭球体
         */
        CameraController.prototype.getEllipsoid = function () {
            return Cesium.defined(this._scene.globe) ? this._scene.globe.ellipsoid : this._scene.mapProjection.ellipsoid;
        };
        CameraController.prototype.update2D = function () { };
        CameraController.prototype.updateCV = function () { };
        CameraController.prototype.update3D = function () {
            this.reactToInput(this.enableRotate, this.rotateEventTypes, this.spin3D, this.inertiaSpin, '_lastInertiaSpinMovement');
            this.reactToInput(this.enableZoom, this.zoomEventTypes, this.zoom3D, this.inertiaZoom, '_lastInertiaZoomMovement');
            this.reactToInput(this.enableTilt, this.tiltEventTypes, this.tilt3D, this.inertiaSpin, '_lastInertiaTiltMovement');
            this.reactToInput(this.enableLook, this.lookEventTypes, this.look3D);
            this.reactToInput(this.enableUpDown, this.upDownEventTypes, this.upDown);
        };
        /// 根据输入事件分发操作到对应的处理程序
        CameraController.prototype.reactToInput = function (enabled, eventTypes, action, inertiaConstant, inertiaStateName) {
            /// 未指定事件
            if (!Cesium.defined(eventTypes))
                return;
            /// 操作被禁用
            if (!this.enableInputs || !enabled)
                return;
            /// 事件聚合
            var aggregator = this._aggregator;
            var scene = this._scene;
            var camera = scene.camera;
            /// 事件类型
            var eventTypeArray = eventTypes;
            if (!Cesium.isArray(eventTypeArray)) {
                scratchEventTypeArray[0] = eventTypes;
                eventTypeArray = scratchEventTypeArray;
            }
            /// 
            var pos = Cesium.Cartesian3.clone(camera.positionWC, checkLimitCameraPos);
            var hpr = getViewPose(scene, camera, checkLimitCameraHPR);
            ///
            var length = eventTypeArray.length;
            for (var i = 0; i < length; ++i) {
                var eventType = eventTypeArray[i];
                var type = (Cesium.defined(eventType.eventType) ? eventType.eventType : eventType);
                var modifier = eventType.modifier;
                ///
                var movement = aggregator.isMoving(type, modifier) && aggregator.getMovement(type, modifier);
                var startPosition = aggregator.getStartMousePosition(type, modifier);
                ////
                if (movement) {
                    try {
                        action.call(this, startPosition, movement);
                    }
                    catch (e) { }
                }
                else if (inertiaConstant < 1.0) {
                    maintainInertia(aggregator, type, modifier, inertiaConstant, action, this, inertiaStateName);
                }
            }
            /// 
            var pos2 = Cesium.Cartesian3.clone(camera.positionWC, checkLimitCameraPos2);
            var hpr2 = getViewPose(scene, camera, checkLimitCameraHPR2);
            if (!this._checkLimit(pos2, hpr, hpr2)) {
                camera.setView({ destination: pos, orientation: hpr });
            }
        };
        CameraController.prototype.pickReal = function (mousePosition, result) {
            var scene = this._scene;
            var globe = scene.globe;
            var camera = scene.camera;
            var ray = camera.getPickRay(mousePosition, scratch_PickGlobe_Ray);
            /// 
            var depthPick, rayPick;
            /// 拾取场景
            if (scene.pickPositionSupported) {
                depthPick = scene.pickPosition(mousePosition, scratch_PickGlobe_DepthIntersection);
            }
            /// 拾取地球
            if (globe && globe.show) {
                rayPick = globe.pick(ray, scene, scratch_PickGlobe_RayIntersection);
            }
            /// 
            var pickDistance = Cesium.defined(depthPick) ? Cesium.Cartesian3.distance(depthPick, camera.positionWC) : Number.POSITIVE_INFINITY;
            var rayDistance = Cesium.defined(rayPick) ? Cesium.Cartesian3.distance(rayPick, camera.positionWC) : Number.POSITIVE_INFINITY;
            /// 返回比较近的
            if (pickDistance < rayDistance) {
                return Cesium.Cartesian3.clone(depthPick, result);
            }
            if (rayDistance != Number.POSITIVE_INFINITY) {
                return Cesium.Cartesian3.clone(rayPick, result);
            }
            ///
            return undefined;
        };
        CameraController.prototype.pickFlat = function (mousePosition, result) {
            var scene = this._scene;
            var camera = scene.camera;
            var ray = camera.getPickRay(mousePosition, scratch_PickGlobe_Ray);
            /// 
            var ellipsoid = this.getEllipsoid();
            var scale = 1 + (this.flatModeHeight + this.flatModeOffset) / ellipsoid.maximumRadius;
            var radii = Cesium.Cartesian3.multiplyByScalar(ellipsoid.radii, scale, scratch_PickGlobe_Radii);
            var newEllipsoid = Cesium.Ellipsoid.fromCartesian3(radii, scratch_PickGlobe_Ellipsoid);
            var intersection = Cesium.IntersectionTests.rayEllipsoid(ray, newEllipsoid);
            if (!Cesium.defined(intersection))
                return undefined;
            ///
            if (intersection.start > 0.0) {
                return Cesium.Ray.getPoint(ray, intersection.start, result);
            }
            if (intersection.start == 0) {
                return Cesium.Ray.getPoint(ray, 1, result);
            }
            return undefined;
        };
        /// 拾取
        CameraController.prototype.pickPosition = function (mousePosition, result) {
            if (this.enableFlatMode) {
                return this.pickFlat(mousePosition, result);
            }
            else {
                return this.pickReal(mousePosition, result);
            }
        };
        CameraController.prototype.rotate3D = function (startPosition, movement, options) {
            options = Cesium.defaultValue(options, {});
            var rotateOnlyVertical = Cesium.defaultValue(options.onlyVertical, false);
            var rotateOnlyHorizontal = Cesium.defaultValue(options.onlyHorizontal, false);
            var minimumPitch = Cesium.defaultValue(options.minimumPitch, -180);
            var maximumPitch = Cesium.defaultValue(options.maximumPitch, 180);
            var scene = this._scene;
            var camera = scene.camera;
            var canvas = scene.canvas;
            ///
            var dir = camera.direction;
            var front = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, camera.right, new Cesium.Cartesian3());
            ///
            var acos = Cesium.Cartesian3.dot(front, dir);
            var rr = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
            if (acos < 0)
                rr = -rr;
            ///
            var pitch = -Math.atan2(dir.z, rr);
            var rotateRate = this._maximumRotateRate;
            ///
            var phiWindowRatio = (movement.startPosition.x - movement.endPosition.x) / canvas.clientWidth;
            var thetaWindowRatio = (movement.startPosition.y - movement.endPosition.y) / canvas.clientHeight;
            phiWindowRatio = Math.min(phiWindowRatio, this.maximumMovementRatio);
            thetaWindowRatio = Math.min(thetaWindowRatio, this.maximumMovementRatio);
            var deltaPhi = rotateRate * phiWindowRatio * Math.PI * 2.0;
            var deltaTheta = rotateRate * thetaWindowRatio * Math.PI;
            ///
            if (pitch - deltaTheta > maximumPitch) {
                deltaTheta = pitch - maximumPitch;
            }
            if (pitch - deltaTheta < minimumPitch) {
                deltaTheta = pitch - minimumPitch;
            }
            if (!rotateOnlyVertical) {
                //camera.rotateRight(deltaPhi);
                camera.rotate(Cesium.Cartesian3.UNIT_Z, -deltaPhi);
            }
            if (!rotateOnlyHorizontal) {
                //camera.rotateUp(deltaTheta);
                camera.rotate(camera.right, -deltaTheta);
            }
        };
        CameraController.prototype.spin3D = function (startPosition, movement) {
            var scene = this._scene;
            var camera = scene.camera;
            /// lookAt
            if (!Cesium.Matrix4.equals(camera.transform, Cesium.Matrix4.IDENTITY)) {
                this.rotate3D(startPosition, movement, { minimumPitch: this.lookViewMinimumPitch, maximumPitch: this.lookViewMaximumPitch });
                return;
            }
            this.pan3D(startPosition, movement);
        };
        CameraController.prototype.pan3D = function (startPosition, movement) {
            var scene = this._scene;
            var camera = scene.camera;
            ///
            var startMousePosition = Cesium.Cartesian2.clone(movement.startPosition, pan3DStartMousePosition);
            var endMousePosition = Cesium.Cartesian2.clone(movement.endPosition, pan3DEndMousePosition);
            var p0, p1;
            ///
            p0 = this.pickPosition(startMousePosition, pan3DP0);
            if (!Cesium.defined(p0))
                return;
            ///
            var ray = camera.getPickRay(endMousePosition, pan3DPickRay);
            p1 = pickBySimilar(Cesium.Cartesian3.magnitude(p0), ray, pan3DP1);
            if (!Cesium.defined(p1))
                return;
            ///
            p0 = camera.worldToCameraCoordinates(p0, p0);
            p1 = camera.worldToCameraCoordinates(p1, p1);
            if (!Cesium.defined(camera.constrainedAxis)) {
                Cesium.Cartesian3.normalize(p0, p0);
                Cesium.Cartesian3.normalize(p1, p1);
                var dot = Cesium.Cartesian3.dot(p0, p1);
                var axis = Cesium.Cartesian3.cross(p0, p1, pan3DTemp0);
                /// dot is in [0, 1]
                if (dot < 1.0 && !Cesium.Cartesian3.equalsEpsilon(axis, Cesium.Cartesian3.ZERO, Cesium.Math.EPSILON14)) {
                    var angle = Math.acos(dot);
                    camera.rotate(axis, angle);
                }
            }
            else {
                var basis0 = camera.constrainedAxis;
                var basis1 = Cesium.Cartesian3.mostOrthogonalAxis(basis0, pan3DTemp0);
                Cesium.Cartesian3.cross(basis1, basis0, basis1);
                Cesium.Cartesian3.normalize(basis1, basis1);
                var basis2 = Cesium.Cartesian3.cross(basis0, basis1, pan3DTemp1);
                var startRho = Cesium.Cartesian3.magnitude(p0);
                var startDot = Cesium.Cartesian3.dot(basis0, p0);
                var startTheta = Math.acos(startDot / startRho);
                var startRej = Cesium.Cartesian3.multiplyByScalar(basis0, startDot, pan3DTemp2);
                Cesium.Cartesian3.subtract(p0, startRej, startRej);
                Cesium.Cartesian3.normalize(startRej, startRej);
                var endRho = Cesium.Cartesian3.magnitude(p1);
                var endDot = Cesium.Cartesian3.dot(basis0, p1);
                var endTheta = Math.acos(endDot / endRho);
                var endRej = Cesium.Cartesian3.multiplyByScalar(basis0, endDot, pan3DTemp3);
                Cesium.Cartesian3.subtract(p1, endRej, endRej);
                Cesium.Cartesian3.normalize(endRej, endRej);
                var startPhi = Math.acos(Cesium.Cartesian3.dot(startRej, basis1));
                if (Cesium.Cartesian3.dot(startRej, basis2) < 0) {
                    startPhi = Cesium.Math.TWO_PI - startPhi;
                }
                var endPhi = Math.acos(Cesium.Cartesian3.dot(endRej, basis1));
                if (Cesium.Cartesian3.dot(endRej, basis2) < 0) {
                    endPhi = Cesium.Math.TWO_PI - endPhi;
                }
                var deltaPhi = startPhi - endPhi;
                var east = void 0;
                if (Cesium.Cartesian3.equalsEpsilon(basis0, camera.position, Cesium.Math.EPSILON2)) {
                    east = camera.right;
                }
                else {
                    east = Cesium.Cartesian3.cross(basis0, camera.position, pan3DTemp0);
                }
                var planeNormal = Cesium.Cartesian3.cross(basis0, east, pan3DTemp0);
                var side0 = Cesium.Cartesian3.dot(planeNormal, Cesium.Cartesian3.subtract(p0, basis0, pan3DTemp1));
                var side1 = Cesium.Cartesian3.dot(planeNormal, Cesium.Cartesian3.subtract(p1, basis0, pan3DTemp1));
                var deltaTheta = void 0;
                if (side0 > 0 && side1 > 0) {
                    deltaTheta = endTheta - startTheta;
                }
                else if (side0 > 0 && side1 <= 0) {
                    if (Cesium.Cartesian3.dot(camera.position, basis0) > 0) {
                        deltaTheta = -startTheta - endTheta;
                    }
                    else {
                        deltaTheta = startTheta + endTheta;
                    }
                }
                else {
                    deltaTheta = startTheta - endTheta;
                }
                ///
                camera.rotateRight(deltaPhi);
                camera.rotateUp(deltaTheta);
            }
        };
        CameraController.prototype.zoom3D = function (startPosition, movement) {
            if (Cesium.defined(movement.distance)) {
                movement = movement.distance;
            }
            var scene = this._scene;
            var camera = scene.camera;
            var canvas = scene.canvas;
            ///
            var intersection;
            var lookAtCenter = Cesium.Matrix4.equals(camera.transform, Cesium.Matrix4.IDENTITY);
            if (lookAtCenter) {
                intersection = this.pickReal(startPosition, zoomIntersection);
                if (this.enableFlatMode) {
                    if (intersection) {
                        var ellipsoid = this.getEllipsoid();
                        var c = Cesium.Cartographic.fromCartesian(intersection, ellipsoid, zoomCartographic);
                        this.flatModeHeight = c.height;
                    }
                    else {
                        intersection = this.pickFlat(startPosition, zoomIntersection);
                    }
                }
            }
            else {
                intersection = Cesium.Matrix4.getTranslation(camera.transform, zoomIntersection);
            }
            ///
            if (!intersection)
                return;
            ///
            var dir = Cesium.Cartesian3.subtract(intersection, camera.positionWC, zoomDirection);
            Cesium.Cartesian3.normalize(dir, dir);
            var distanceMeasure = Cesium.Cartesian3.distance(camera.positionWC, intersection);
            ///
            var minHeight = this.minimumZoomDistance;
            var maxHeight = this.maximumZoomDistance;
            var minDistance = distanceMeasure - minHeight;
            var zoomRate = this._zoomFactor * minDistance;
            zoomRate = Cesium.Math.clamp(zoomRate, this._minimumZoomRate, this._maximumZoomRate);
            var diff = movement.endPosition.y - movement.startPosition.y;
            var rangeWindowRatio = Math.min(diff / canvas.clientHeight, this.maximumMovementRatio);
            var distance = zoomRate * rangeWindowRatio;
            /// 
            if (distanceMeasure - distance < this.minimumZoomDistance) {
                distance = distanceMeasure - this.minimumZoomDistance;
            }
            if (distanceMeasure - distance > this.maximumZoomDistance) {
                distance = distanceMeasure - this.maximumZoomDistance;
            }
            /// 
            if (lookAtCenter) {
                /// 
                Cesium.Cartesian3.multiplyByScalar(dir, distance, zoomTargePosition);
                var target = Cesium.Cartesian3.add(zoomTargePosition, camera.positionWC, zoomTargePosition);
                var pose = getViewPose(scene, camera, zoomHeadingPitchRool);
                camera.setView({ destination: target, orientation: pose, endTransform: camera.transform });
            }
            else
                camera.zoomIn(distance);
        };
        CameraController.prototype.tilt3D = function (startPosition, movement) {
            var scene = this._scene;
            var camera = scene.camera;
            if (!Cesium.Matrix4.equals(camera.transform, Cesium.Matrix4.IDENTITY)) {
                return;
            }
            if (Cesium.defined(movement.angleAndHeight)) {
                movement = movement.angleAndHeight;
            }
            var canvas = scene.canvas;
            var ellipsoid = this.getEllipsoid();
            /// 
            var center;
            if (Cesium.Cartesian2.equals(this._tiltCenterMousePosition, startPosition)) {
                center = this._tiltCenter;
            }
            else {
                var sc = tilt3DScreenCenter;
                sc.x = canvas.width * 0.5;
                sc.y = canvas.height * 0.5;
                center = this.pickPosition(sc, this._tiltCenter);
                if (!Cesium.defined(center))
                    center = this.pickPosition(startPosition, this._tiltCenter);
                if (Cesium.defined(center))
                    startPosition.clone(this._tiltCenterMousePosition);
            }
            if (!Cesium.defined(center)) {
                return;
            }
            /// 锁定
            var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center, ellipsoid, tilt3DTransform);
            var oldTransform = Cesium.Matrix4.clone(camera.transform, tilt3DOldTransform);
            camera._setTransform(transform);
            /// 
            /*
            const dir = camera.direction
            const front = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, camera.right, new Cesium.Cartesian3());
            
            ///
            const acos = Cesium.Cartesian3.dot(front, dir);
            let rr = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
            if (acos < 0) rr = -rr;

            ///
            const pitch = -Math.atan2(dir.z, rr);
            const rotateRate = this._maximumRotateRate;

            //console.info(`acos:${acos}, pitch:${Cesium.Math.toDegrees(pitch)}`);
    
            ///
            let phiWindowRatio = (movement.startPosition.x - movement.endPosition.x) / canvas.clientWidth;
            let thetaWindowRatio = (movement.startPosition.y - movement.endPosition.y) / canvas.clientHeight;
            phiWindowRatio = Math.min(phiWindowRatio, this.maximumMovementRatio);
            thetaWindowRatio = Math.min(thetaWindowRatio, this.maximumMovementRatio);
    
            let deltaPhi = rotateRate * phiWindowRatio * Math.PI * 2.0;
            let deltaTheta = rotateRate * thetaWindowRatio * Math.PI;
            if (pitch - deltaTheta > this.maximumPitch)
            {
                deltaTheta = pitch - this.maximumPitch;
            }
            if (pitch - deltaTheta < this.minimumPitch)
            {
                deltaTheta = pitch - this.minimumPitch;
            }

            ///
            camera.rotate(Cesium.Cartesian3.UNIT_Z, -deltaPhi);
            camera.rotate(camera.right, -deltaTheta);

            //camera.rotateRight(deltaPhi);
            //camera.rotateUp(deltaTheta);
            */
            this.rotate3D(startPosition, movement, { minimumPitch: this.minimumPitch, maximumPitch: this.maximumPitch });
            /// 还原
            camera._setTransform(oldTransform);
        };
        CameraController.prototype.look3D = function (startPosition, movement, rotationAxis) {
            var scene = this._scene;
            var camera = scene.camera;
            var startPos = look3DStartPos;
            startPos.x = movement.startPosition.x;
            startPos.y = 0.0;
            var endPos = look3DEndPos;
            endPos.x = movement.endPosition.x;
            endPos.y = 0.0;
            var startRay = camera.getPickRay(startPos, look3DStartRay);
            var endRay = camera.getPickRay(endPos, look3DEndRay);
            var angle = 0.0;
            var start, end;
            if (camera.frustum instanceof Cesium.OrthographicFrustum) {
                start = startRay.origin;
                end = endRay.origin;
                Cesium.Cartesian3.add(camera.direction, start, start);
                Cesium.Cartesian3.add(camera.direction, end, end);
                Cesium.Cartesian3.subtract(start, camera.position, start);
                Cesium.Cartesian3.subtract(end, camera.position, end);
                Cesium.Cartesian3.normalize(start, start);
                Cesium.Cartesian3.normalize(end, end);
            }
            else {
                start = startRay.direction;
                end = endRay.direction;
            }
            var dot = Cesium.Cartesian3.dot(start, end);
            if (dot < 1.0) { // dot is in [0, 1]
                angle = Math.acos(dot);
            }
            angle = (movement.startPosition.x > movement.endPosition.x) ? -angle : angle;
            var horizontalRotationAxis = this._horizontalRotationAxis;
            if (Cesium.defined(rotationAxis)) {
                camera.look(rotationAxis, -angle);
            }
            else if (Cesium.defined(horizontalRotationAxis)) {
                camera.look(horizontalRotationAxis, -angle);
            }
            else {
                camera.lookLeft(angle);
            }
            startPos.x = 0.0;
            startPos.y = movement.startPosition.y;
            endPos.x = 0.0;
            endPos.y = movement.endPosition.y;
            startRay = camera.getPickRay(startPos, look3DStartRay);
            endRay = camera.getPickRay(endPos, look3DEndRay);
            angle = 0.0;
            if (camera.frustum instanceof Cesium.OrthographicFrustum) {
                start = startRay.origin;
                end = endRay.origin;
                Cesium.Cartesian3.add(camera.direction, start, start);
                Cesium.Cartesian3.add(camera.direction, end, end);
                Cesium.Cartesian3.subtract(start, camera.position, start);
                Cesium.Cartesian3.subtract(end, camera.position, end);
                Cesium.Cartesian3.normalize(start, start);
                Cesium.Cartesian3.normalize(end, end);
            }
            else {
                start = startRay.direction;
                end = endRay.direction;
            }
            dot = Cesium.Cartesian3.dot(start, end);
            if (dot < 1.0) { // dot is in [0, 1]
                angle = Math.acos(dot);
            }
            angle = (movement.startPosition.y > movement.endPosition.y) ? -angle : angle;
            rotationAxis = Cesium.defaultValue(rotationAxis, horizontalRotationAxis);
            if (Cesium.defined(rotationAxis)) {
                var direction = camera.direction;
                var negativeRotationAxis = Cesium.Cartesian3.negate(rotationAxis, look3DNegativeRot);
                var northParallel = Cesium.Cartesian3.equalsEpsilon(direction, rotationAxis, Cesium.Math.EPSILON2);
                var southParallel = Cesium.Cartesian3.equalsEpsilon(direction, negativeRotationAxis, Cesium.Math.EPSILON2);
                if ((!northParallel && !southParallel)) {
                    dot = Cesium.Cartesian3.dot(direction, rotationAxis);
                    var angleToAxis = Cesium.Math.acosClamped(dot);
                    if (angle > 0 && angle > angleToAxis) {
                        angle = angleToAxis - Cesium.Math.EPSILON4;
                    }
                    dot = Cesium.Cartesian3.dot(direction, negativeRotationAxis);
                    angleToAxis = Cesium.Math.acosClamped(dot);
                    if (angle < 0 && -angle > angleToAxis) {
                        angle = -angleToAxis + Cesium.Math.EPSILON4;
                    }
                    var tangent = Cesium.Cartesian3.cross(rotationAxis, direction, look3DTan);
                    camera.look(tangent, angle);
                }
                else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
                    camera.look(camera.right, -angle);
                }
            }
            else {
                camera.lookUp(angle);
            }
        };
        CameraController.prototype.upDown = function (startPosition, movement) {
            if (Cesium.defined(movement.distance)) {
                movement = movement.distance;
            }
            var scene = this._scene;
            var camera = scene.camera;
            var canvas = scene.canvas;
            if (!Cesium.Matrix4.equals(camera.transform, Cesium.Matrix4.IDENTITY)) {
                return;
            }
            ///
            var intersection;
            var lookAtCenter = Cesium.Matrix4.equals(camera.transform, Cesium.Matrix4.IDENTITY);
            if (lookAtCenter) {
                intersection = this.pickPosition(startPosition, zoomIntersection);
            }
            else {
                intersection = Cesium.Matrix4.getTranslation(camera.transform, zoomIntersection);
            }
            ///
            if (!intersection)
                return;
            var rayUpDwon = upDownRay;
            camera.positionWC.clone(rayUpDwon.origin);
            var dirUpDown = rayUpDwon.direction;
            Cesium.Cartesian3.subtract(Cesium.Cartesian3.ZERO, camera.positionWC, dirUpDown);
            Cesium.Cartesian3.normalize(dirUpDown, dirUpDown);
            ///
            var minHeight = this.minimumZoomDistance;
            var maxHeight = this.maximumZoomDistance;
            var dir = Cesium.Cartesian3.subtract(intersection, camera.positionWC, zoomDirection);
            Cesium.Cartesian3.normalize(dir, dir);
            var distanceMeasure = Cesium.Cartesian3.distance(camera.positionWC, intersection);
            ///
            var minDistance = distanceMeasure - minHeight;
            var zoomRate = this._zoomFactor * minDistance;
            zoomRate = Cesium.Math.clamp(zoomRate, this._minimumZoomRate, this._maximumZoomRate);
            var diff = movement.endPosition.y - movement.startPosition.y;
            var rangeWindowRatio = Math.min(diff / canvas.clientHeight, this.maximumMovementRatio);
            var distance = zoomRate * rangeWindowRatio;
            ///
            camera.move(dirUpDown, -distance);
            /// 
            if (this.enableFlatMode) {
                this.flatModeHeight += distance;
            }
        };
        return CameraController;
    }());
    Cegore.CameraController = CameraController;
    /// for reactToInput
    var scratchEventTypeArray = [];
    /// 拾取
    var scratch_PickGlobe_Ray = new Cesium.Ray();
    var scratch_PickGlobe_Radii = new Cesium.Cartesian3();
    var scratch_PickGlobe_Ellipsoid = new Cesium.Ellipsoid();
    var scratch_PickGlobe_Intersection = new Cesium.Interval();
    var scratch_PickGlobe_DepthIntersection = new Cesium.Cartesian3();
    var scratch_PickGlobe_RayIntersection = new Cesium.Cartesian3();
    /// 衰减函数
    function decay(time, coefficient) {
        if (time < 0) {
            return 0.0;
        }
        var tau = (1.0 - coefficient) * 25.0;
        return Math.exp(-tau * time);
    }
    function sameMousePosition(movement) {
        return Cesium.Cartesian2.equalsEpsilon(movement.startPosition, movement.endPosition, Cesium.Math.EPSILON14);
    }
    // If the time between mouse down and mouse up is not between
    // these thresholds, the camera will not move with inertia.
    // This value is probably dependent on the browser and/or the
    // hardware. Should be investigated further.
    var inertiaMaxClickTimeThreshold = 0.4;
    function maintainInertia(aggregator, type, modifier, decayCoef, action, object, lastMovementName) {
        var movementState = object[lastMovementName]; // as MovementState;
        if (!Cesium.defined(movementState)) {
            movementState = object[lastMovementName] = {
                startPosition: new Cesium.Cartesian2(),
                endPosition: new Cesium.Cartesian2(),
                motion: new Cesium.Cartesian2(),
                active: false
            };
        }
        var ts = aggregator.getButtonPressTime(type, modifier);
        var tr = aggregator.getButtonReleaseTime(type, modifier);
        var threshold = ts && tr && ((tr.getTime() - ts.getTime()) / 1000.0);
        var now = new Date();
        var fromNow = tr && ((now.getTime() - tr.getTime()) / 1000.0);
        ///
        if (ts && tr && threshold < inertiaMaxClickTimeThreshold) {
            var d = decay(fromNow, decayCoef);
            if (!movementState.active) {
                var lastMovement = aggregator.getLastMovement(type, modifier);
                if (!Cesium.defined(lastMovement) || sameMousePosition(lastMovement)) {
                    return;
                }
                movementState.motion.x = (lastMovement.endPosition.x - lastMovement.startPosition.x) * 0.5;
                movementState.motion.y = (lastMovement.endPosition.y - lastMovement.startPosition.y) * 0.5;
                movementState.startPosition = Cesium.Cartesian2.clone(lastMovement.startPosition, movementState.startPosition);
                movementState.endPosition = Cesium.Cartesian2.multiplyByScalar(movementState.motion, d, movementState.endPosition);
                movementState.endPosition = Cesium.Cartesian2.add(movementState.startPosition, movementState.endPosition, movementState.endPosition);
                movementState.active = true;
            }
            else {
                movementState.startPosition = Cesium.Cartesian2.clone(movementState.endPosition, movementState.startPosition);
                movementState.endPosition = Cesium.Cartesian2.multiplyByScalar(movementState.motion, d, movementState.endPosition);
                movementState.endPosition = Cesium.Cartesian2.add(movementState.startPosition, movementState.endPosition, movementState.endPosition);
                movementState.motion = Cesium.Cartesian2.clone(Cesium.Cartesian2.ZERO, movementState.motion);
            }
            // If value from the decreasing exponential function is close to zero,
            // the end coordinates may be NaN.
            if (isNaN(movementState.endPosition.x) || isNaN(movementState.endPosition.y) || Cesium.Cartesian2.distance(movementState.startPosition, movementState.endPosition) < 0.5) {
                movementState.active = false;
                return;
            }
            if (!aggregator.isButtonDown(type, modifier)) {
                var startPosition = aggregator.getStartMousePosition(type, modifier);
                action.call(object, startPosition, movementState);
            }
        }
        else {
            movementState.active = false;
        }
    }
    function getHeading(direction, up) {
        var heading = 0;
        if (!Cesium.Math.equalsEpsilon(Math.abs(direction.z), 1.0, Cesium.Math.EPSILON3)) {
            heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
        }
        else {
            heading = Math.atan2(up.y, up.x) - Cesium.Math.PI_OVER_TWO;
        }
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
    }
    function getPitch(direction) {
        return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
    }
    function getRoll(direction, up, right) {
        var roll = 0.0;
        if (!Cesium.Math.equalsEpsilon(Math.abs(direction.z), 1.0, Cesium.Math.EPSILON3)) {
            roll = Math.atan2(-right.z, up.z);
            roll = Cesium.Math.zeroToTwoPi(roll + Cesium.Math.TWO_PI);
        }
        return roll;
    }
    ///
    var scratchViewPoseMatrix1 = new Cesium.Matrix4();
    var scratchViewPoseMatrix2 = new Cesium.Matrix4();
    function getViewPose(scene, camera, hpr) {
        if (scene.mode !== Cegore.SceneMode.MORPHING) {
            var ellipsoid = scene.mapProjection.ellipsoid;
            var oldTransform = Cesium.Matrix4.clone(camera.transform, scratchViewPoseMatrix1);
            var transform = Cesium.Transforms.eastNorthUpToFixedFrame(camera.positionWC, ellipsoid, scratchViewPoseMatrix2);
            camera._setTransform(transform);
            /// 
            if (!(hpr instanceof Cesium.HeadingPitchRoll)) {
                hpr = new Cesium.HeadingPitchRoll();
            }
            ///
            hpr.heading = getHeading(camera.direction, camera.up);
            hpr.pitch = getPitch(camera.direction);
            hpr.roll = getRoll(camera.direction, camera.up, camera.right);
            ///
            camera._setTransform(oldTransform);
            ///
            return hpr;
        }
        return undefined;
    }
    var pickBySimilarSphere = new Cesium.BoundingSphere();
    function pickBySimilar(radius, ray, result) {
        ///
        ///
        var sphere = pickBySimilarSphere;
        sphere.radius = radius;
        var intersection = Cesium.IntersectionTests.raySphere(ray, sphere);
        if (!Cesium.defined(intersection))
            return undefined;
        ///
        if (intersection.start > 0.0) {
            return Cesium.Ray.getPoint(ray, intersection.start, result);
        }
        if (intersection.start == 0) {
            return Cesium.Ray.getPoint(ray, 1, result);
        }
        return undefined;
    }
    var checkLimitRay = new Cesium.Ray();
    var checkLimitHist = new Cesium.Cartesian3();
    var checkLimitCameraPos = new Cesium.Cartesian3();
    var checkLimitCameraPos2 = new Cesium.Cartesian3();
    var checkLimitCameraHPR = new Cesium.HeadingPitchRoll();
    var checkLimitCameraHPR2 = new Cesium.HeadingPitchRoll();
    ///
    var pan3DP0 = Cesium.Cartesian4.clone(Cesium.Cartesian4.UNIT_W);
    var pan3DP1 = Cesium.Cartesian4.clone(Cesium.Cartesian4.UNIT_W);
    var pan3DPickRay = new Cesium.Ray();
    var pan3DTemp0 = new Cesium.Cartesian3();
    var pan3DTemp1 = new Cesium.Cartesian3();
    var pan3DTemp2 = new Cesium.Cartesian3();
    var pan3DTemp3 = new Cesium.Cartesian3();
    var pan3DStartMousePosition = new Cesium.Cartesian2();
    var pan3DEndMousePosition = new Cesium.Cartesian2();
    ///
    var zoomTargePosition = new Cesium.Cartesian3();
    var zoomIntersection = new Cesium.Cartesian3();
    var zoomDirection = new Cesium.Cartesian3();
    var zoomCartographic = new Cesium.Cartographic();
    var zoomHeadingPitchRool = new Cesium.HeadingPitchRoll();
    //
    var tilt3DTransform = new Cesium.Matrix4();
    var tilt3DOldTransform = new Cesium.Matrix4();
    var tilt3DScreenCenter = new Cesium.Cartesian2();
    //
    var look3DStartPos = new Cesium.Cartesian2();
    var look3DEndPos = new Cesium.Cartesian2();
    var look3DStartRay = new Cesium.Ray();
    var look3DEndRay = new Cesium.Ray();
    var look3DNegativeRot = new Cesium.Cartesian3();
    var look3DTan = new Cesium.Cartesian3();
    var upDownRay = new Cesium.Ray();
    var upDownDir = new Cesium.Ray();
    var upDonwPosition = new Cesium.Cartesian3();
    ///
    //Cesium.New_ScreenSpaceCameraController = ScreenSpaceCameraController;
})(Cegore || (Cegore = {}));
/*
 * File of class Renderable
 */
var Cegore;
(function (Cegore) {
    /**
     * 可绘制对象
     */
    var Renderable = /** @class */ (function () {
        /**
         * 构造函数
         * @param options
         */
        function Renderable() {
            /// 位置
            this._position = new Cegore.Position();
            /// 方位
            this._orientation = new Cegore.HeadingPitchRoll();
        }
        /**
         * 应用属性
         * @param o 设置属性的对象
         * @param keys 属性名列表
         * @param props 属性值对象
         */
        Renderable.applyProps = function (o, keys, props) {
            for (var i = 0; i < keys.length; ++i) {
                var val = props[keys[i]];
                if (Cegore.TypeCheck.isDefined(val))
                    o[keys[i]] = val;
            }
        };
        /**
         * 应用属性给当前对象
         *
         * @param options 属性列表
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        Renderable.prototype.applyProps = function (options) {
            Renderable.applyProps(this, Renderable.RenderablePropList, options);
        };
        Object.defineProperty(Renderable.prototype, "id", {
            /**
             * 获取对象的id
             */
            get: function () {
                return this._czRenderable.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Renderable.prototype, "visible", {
            /**
             * 获取当前对象是否可见
             */
            get: function () { return this._czRenderable.show; },
            /**
             * 设置标准是否可见
             */
            set: function (visible) { this._czRenderable.show = visible; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Renderable.prototype, "position", {
            /**
             * 获取位置信息
             */
            get: function () { return this._position; },
            /**
             * 设置位置信息
             */
            set: function (pos) { this._position.set(pos); this.applyPose(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Renderable.prototype, "orientation", {
            /**
             * 获取模型的方位
             */
            get: function () { return this._orientation; },
            /**
             * 设置模型的方位
             */
            set: function (o) { this._orientation.set(o); this.applyPose(); },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新模型的姿态信息
         * @private
         */
        Renderable.prototype.applyPose = function () {
            /// 计算位置
            var position = Cesium.Cartesian3.fromDegrees(this._position.lon, this._position.lat, this._position.altitude);
            /// 计算 HeadingPitchRoll
            var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(this._orientation.heading), Cesium.Math.toRadians(this._orientation.pitch), Cesium.Math.toRadians(this._orientation.roll));
            /// 计算旋转
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            /// 应用更新
            this._czRenderable.position = position;
            this._czRenderable.orientation = orientation;
        };
        /**
         * 可设置的属性
         */
        Renderable.RenderablePropList = ['visible', 'position', 'orientation'];
        return Renderable;
    }());
    Cegore.Renderable = Renderable;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Provider
 */
var Cegore;
(function (Cegore) {
    /**
     * Provide 提供器集合
     */
    var ProviderCollection = /** @class */ (function () {
        function ProviderCollection(def) {
            this.mFactories = new Cegore.HashMap();
            this.mDefaultFac = def;
        }
        /**
         * 注册提供器工厂
         * @param provider
         */
        ProviderCollection.prototype.regFactory = function (type, provider) {
            this.mFactories.put(type, provider);
        };
        /**
         * 反注册提供器工厂
         * @param provider
         */
        ProviderCollection.prototype.unregFactory = function (type) {
            this.mFactories.remove(type);
        };
        /**
         * 创建提供器
         * @param options
         */
        ProviderCollection.prototype.createProvider = function (type, options) {
            type = Cegore.TypeCheck.defaultValue(type, this.mDefaultFac);
            var provider = this.mFactories.get(type);
            if (provider)
                return provider.createProvider(options);
            //// 
            return;
        };
        return ProviderCollection;
    }());
    Cegore.ProviderCollection = ProviderCollection;
    /**
     *
     */
    var Providers = /** @class */ (function () {
        function Providers() {
        }
        /**
         * 地形提供器集合
         */
        Providers.TerrainProviders = new ProviderCollection('ZMapTerrain');
        /**
         * 影像提供器集合
         */
        Providers.ImageProviders = new ProviderCollection('ZMapImage');
        return Providers;
    }());
    Cegore.Providers = Providers;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class ImageLayer
 */
var Cegore;
(function (Cegore) {
    /**
     * 影像图层
     */
    var ImageLayer = /** @class */ (function () {
        /**
         * 构造影像图层
         *
         * @param {Object} options 包含如下属性
         * @param {String} [options.name] 指定图层的名称
         * @param {String} {options.type} 指定地形数据类型，包括（ZMapImage等）
         *
         * @example
         *  new ImageLayer({
         *  	name: 'GoogleLayer',
         *  	type: 'ZMapImage',
         *  	// 数据的地址
         *  	url :'http://localhost:9081/zs/data/tdtonline/image',
         *  	// 设置最大显示层级
         *  	minimumLevel: 0,
         *  	maximumLevel: 18
         *  });
         */
        function ImageLayer(options) {
            /// 判断是否为一个对象
            if (!Cegore.TypeCheck.isObject(options)) {
                throw 'Invalid iamge info';
            }
            var provider = this.createProvider(options);
            if (!Cegore.TypeCheck.isDefined(provider)) {
                throw 'Can not create image layer by type : "' + options.type + '"';
            }
            this._name = Cegore.AutoNames.genName(options.name, "ImageLayer");
            this._type = options.type;
            this._czLayer = new Cesium.ImageryLayer(provider);
            this._czLayer.brightness = Cegore.TypeCheck.defaultValue(options.brightness, 1);
            this._czLayer._ZMapLayer = this;
            ///
            this.visible = Cegore.TypeCheck.defaultValue(options.visible, true);
            this.alpha = Cegore.TypeCheck.defaultValue(options.alpha, 1.0);
        }
        Object.defineProperty(ImageLayer.prototype, "_czlayer", {
            /**
             * @private
             */
            get: function () { return this._czLayer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageLayer.prototype, "name", {
            /**
             * 图层名称
             */
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageLayer.prototype, "type", {
            /**
             * Provider的类型
             */
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageLayer.prototype, "visible", {
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
        Object.defineProperty(ImageLayer.prototype, "alpha", {
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
        ImageLayer.prototype.createProvider = function (options) {
            var copy = {};
            for (var key in options) {
                if (this.hasOwnProperty(key))
                    continue;
                copy[key] = options[key];
            }
            return Cegore.Providers.ImageProviders.createProvider(options.type, copy);
        };
        return ImageLayer;
    }());
    Cegore.ImageLayer = ImageLayer;
})(Cegore || (Cegore = {}));
/*
 * File of class ImageLayerCollection
 */
var Cegore;
(function (Cegore) {
    /**
     * 影像图层集合
     */
    var ImageLayerCollection = /** @class */ (function () {
        /**
         * 构造函数，构造一个新的图层管理器
         *
         * @param viewer 主视图
         */
        function ImageLayerCollection(globe) {
            this._layers = new Cegore.HashMap();
            this._globe = globe;
            this._czLayers = this._globe._czglobe.imageryLayers;
        }
        Object.defineProperty(ImageLayerCollection.prototype, "length", {
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
         * @param {ImageLayer} layer 影像图层
         * @param {Number} [index] 索引
         */
        ImageLayerCollection.prototype.add = function (layer, index) {
            if (!Cegore.TypeCheck.isInstanceOf(layer, Cegore.ImageLayer)) {
                layer = new Cegore.ImageLayer(layer);
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
        ImageLayerCollection.prototype.get = function (id) {
            if (Cegore.TypeCheck.isNumber(id)) {
                var czlayer = this._czLayers.get(id);
                if (czlayer)
                    return czlayer._ZMapLayer;
            }
            else if (Cegore.TypeCheck.isString(id)) {
                return this._layers.get(id);
            }
            else
                throw "id must be string or number";
        };
        /**
         * 移除影像图层
         *
         * @param {Number|String|ImageLayer} id 可以是图层的索引、名称或者图层对象
         */
        ImageLayerCollection.prototype.remove = function (id) {
            if (Cegore.TypeCheck.isNumber(id) || Cegore.TypeCheck.isString(id)) {
                this.remove(this.get(id));
            }
            else if (Cegore.TypeCheck.isInstanceOf(id, Cegore.ImageLayer)) {
                var layer = id;
                this._czLayers.remove(layer._czlayer);
                this._layers.remove(id.name);
            }
            else
                throw "id must be string or number or ImageLayer";
        };
        /**
         * 移除所有图层
         */
        ImageLayerCollection.prototype.removeAll = function () {
            this._czLayers.removeAll();
            this._layers.removeAll();
        };
        /**
         * 移除所有图层
         */
        ImageLayerCollection.prototype.clear = function () {
            this.removeAll();
        };
        return ImageLayerCollection;
    }());
    Cegore.ImageLayerCollection = ImageLayerCollection;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Globe
 */
var Cegore;
(function (Cegore) {
    /**
     * 地球类
     */
    var Globe = /** @class */ (function () {
        /**
         * 构造函数
         * @param viewer
         */
        function Globe(scene) {
            this._scene = scene;
            this._czData = scene._czdata;
            this._czGlobe = this._czData.globe;
            this._images = new Cegore.ImageLayerCollection(this);
        }
        /**
         * 设置地形数据源
         *
         * @param options 包含如下属性
         * @param options.type 指定地形数据类型，包括（ZMapTerrain等）
         * @param options.data 指定地形数据
         */
        Globe.prototype.setTerrain = function (options) {
            var provider = this.createProvider(options);
            if (provider == null) {
                throw 'Invalid terrain info';
            }
            ///
            this._czData.globe.terrainProvider = provider;
        };
        Object.defineProperty(Globe.prototype, "_czglobe", {
            /**
             * @private
             */
            get: function () { return this._czGlobe; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "images", {
            /**
             * 获取影像图层集合
             */
            get: function () { return this._images; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "baseColor", {
            /**
             * 地球上没有影像时的基本颜色
             */
            get: function () { return new Cegore.Color(this._czGlobe.baseColor); },
            /**
             * 地球上没有影像时的基本颜色
             */
            set: function (val) {
                if (!Cegore.TypeCheck.isInstanceOf(val, Cegore.Color))
                    val = new Cegore.Color(val);
                this._czGlobe.baseColor = val.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "enableDepthTest", {
            /**
             * 是否启用深度监测
             */
            get: function () { return this._czGlobe.depthTestAgainstTerrain; },
            /**
             * 设置是否启用深度监测
             */
            set: function (val) { this._czGlobe.depthTestAgainstTerrain = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "enableLighting", {
            /**
             * 获取是否启用光照
             */
            get: function () { return this._czGlobe.enableLighting; },
            /**
             * 设置是否启用光照
             */
            set: function (enable) { this._czGlobe.enableLighting = enable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "enableWaterEffect", {
            /**
             * 获取是否启用水体效果
             */
            get: function () { return this._czGlobe.showWaterEffect; },
            /**
             * 设置是否启用水体效果
             */
            set: function (enable) { this._czGlobe.showWaterEffect = enable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "tileCacheSize", {
            /**
             * 瓦片缓存大小，默认值：100
             */
            get: function () { return this._czGlobe.tileCacheSize; },
            /**
             * 瓦片缓存大小，默认值：100
             */
            set: function (val) { this._czGlobe.tileCacheSize = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Globe.prototype, "tileLoadProgress", {
            /**
             * 瓦片加载事件，当瓦片队列发生变化（增加或者减少）时触发事件。事件传递出瓦片队列的长度。
             * 事件原型 <code> function(length) {} </code>
             */
            get: function () {
                var _this = this;
                if (!Cegore.TypeCheck.isDefined(this._tileLoadProgress)) {
                    this._tileLoadProgress = new Cegore.Event();
                    this._czGlobe.tileLoadProgressEvent.addEventListener(function (length) {
                        _this._tileLoadProgress.fire(length);
                    });
                }
                ///
                return this._tileLoadProgress;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 根据options 创建provider
         * @param options
         */
        Globe.prototype.createProvider = function (options) {
            return Cegore.Providers.TerrainProviders.createProvider(options.type, options);
        };
        return Globe;
    }());
    Cegore.Globe = Globe;
    (function () {
        var scale = 1.001;
        var scratchCartesian = new Cesium.Cartesian3();
        Cesium.EllipsoidalOccluder.prototype.isScaledSpacePointVisibleOld = Cesium.EllipsoidalOccluder.prototype.isScaledSpacePointVisible;
        Cesium.EllipsoidalOccluder.prototype.isScaledSpacePointVisible = function (occludeeScaledSpacePosition) {
            Cesium.Cartesian3.multiplyByScalar(occludeeScaledSpacePosition, scale, scratchCartesian);
            return this.isScaledSpacePointVisibleOld(scratchCartesian);
        };
    })();
})(Cegore || (Cegore = {}));
/*
 * File of class Model
 */
var Cegore;
(function (Cegore) {
    /**
     * 抽象模型管理类，不能直接构造该对象
     */
    var Model = /** @class */ (function (_super) {
        __extends(Model, _super);
        /**
         * 构造函数，构造一个新的Model对象
         */
        function Model() {
            return _super.call(this) || this;
        }
        /**
         * 应用属性给当前对象
         */
        Model.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
        };
        Object.defineProperty(Model.prototype, "name", {
            /**
             * 获取模型的名称
             */
            get: function () { return this._name; },
            /**
             * 设置模型的名称
             */
            set: function (name) { this._name = name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "parent", {
            /**
             * 获取父对象
             */
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "children", {
            /**
             * 获取子对象列表，始终返回空数组
             */
            get: function () { return Cegore.ArrayUtil.EmptyArray; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "isLeaf", {
            /**
             * 是否叶子对象，始终返回ture
             */
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        /**
         * 当被添加到ModelGroup中时调用，内部接口不要再外部调用
         * @private
         */
        Model.prototype.onAdded = function (parent) {
            this._parent = parent;
        };
        /**
         * 当被添从ModelGroup中移除时调用，内部接口不要再外部调用
         * @private
         */
        Model.prototype.onRemoved = function () {
            this._parent = null;
        };
        /**
         * 当连接到根节点时调用，内部接口不要再外部调用
         * @private
         */
        Model.prototype.onAttachRoot = function () {
            this._parent.models._onAddModel(this);
        };
        /**
         * 当与根节点断开时调用，内部接口不要再外部调用
         * @private
         */
        Model.prototype.onDetachRoot = function () {
            this._parent.models._onRemoveModel(this);
        };
        /**
         * 模型可设置的属性
         */
        Model.ModelPropList = ['name'];
        return Model;
    }(Cegore.Renderable));
    Cegore.Model = Model;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class ModelGroup
 */
var Cegore;
(function (Cegore) {
    /**
     * 模型组
     *
     * 管理模型分组
     */
    var ModelGroup = /** @class */ (function () {
        /**
         * 构造一个新的模型组
         * @param modelCollection
         */
        function ModelGroup(options) {
            this._children = [];
            options = Cegore.TypeCheck.defaultValue(options, {});
            this._name = Cegore.TypeCheck.defaultValue(options.name, '未命名');
        }
        Object.defineProperty(ModelGroup.prototype, "models", {
            /**
             * 获取模型集合
             */
            get: function () { return this._models; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelGroup.prototype, "name", {
            /**
             * 获取模型名称
             */
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelGroup.prototype, "parent", {
            /**
             * 获取父节点
             */
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelGroup.prototype, "children", {
            /**
             * 获取子节点列表
             */
            get: function () { return this._children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelGroup.prototype, "isLeaf", {
            /**
             * 返回是否叶子节点，对于模型组，该返回值总是 false
             */
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加模型到该模型组中
         * @param m
         */
        ModelGroup.prototype.add = function (m) {
            if (m.parent === this)
                return;
            if (m.parent)
                m.parent.remove(m);
            this._children.push(m);
            m.onAdded(this);
            if (this._models)
                m.onAttachRoot();
        };
        /**
         * 从模型组中移除该模型
         * @param m
         */
        ModelGroup.prototype.remove = function (m) {
            if (m.parent !== this)
                return;
            var index = this._children.indexOf(m);
            this._children.splice(index);
            m.onDetachRoot();
            m.onRemoved();
        };
        /**
         * 移除该模型组中所有模型
         */
        ModelGroup.prototype.removeAll = function () {
            for (var i = 0; i < this._children.length; ++i) {
                this._children[i].onDetachRoot();
                this._children[i].onRemoved();
            }
            this._children = [];
        };
        /**
         * @private
         * @param modelCollection
         */
        ModelGroup.prototype.setModelCollection = function (modelCollection) {
            this._models = modelCollection;
        };
        /**
         * @private
         * @param parent
         */
        ModelGroup.prototype.onAdded = function (parent) {
            this._parent = parent;
            this._models = parent._models;
            ///
            if (this._models)
                this.onAttachRoot();
        };
        /**
         * @private
         */
        ModelGroup.prototype.onRemoved = function () {
            if (this._models)
                this.onDetachRoot();
            ///
            this._parent = null;
            this._models = null;
        };
        /**
         * @private
         * 与根节点断开
         */
        ModelGroup.prototype.onAttachRoot = function () {
            for (var i = 0; i < this._children.length; ++i) {
                this._children[i].onAttachRoot();
            }
        };
        /**
         * @private
         * 连接到根节点
         */
        ModelGroup.prototype.onDetachRoot = function () {
            for (var i = 0; i < this._children.length; ++i) {
                this._children[i].onDetachRoot();
            }
        };
        /**
         *
         * @param mg
         * @param ms
         */
        ModelGroup.getAllModels = function (mg, ms) {
            for (var i = 0; i < mg.children.length; ++i) {
                var ti = mg.children[i];
                if (Cegore.TypeCheck.isInstanceOf(ti, ModelGroup))
                    ModelGroup.getAllModels(ti, ms);
                else
                    ms.push(ti);
            }
            return ms;
        };
        return ModelGroup;
    }());
    Cegore.ModelGroup = ModelGroup;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class ModelCollection.ts
 */
var Cegore;
(function (Cegore) {
    /**
     * 模型集合
     */
    var ModelCollection = /** @class */ (function () {
        /**
         * 构造函数
         * @param scene
         */
        function ModelCollection(scene) {
            this._models = new Cegore.HashMap();
            this._czData = scene._czdata;
            this._DataSource = new Cesium.CustomDataSource("ModelCollection");
            this._czData.viewer.dataSources.add(this._DataSource);
            this._entities = this._DataSource.entities;
            this._root = new Cegore.ModelGroup({ name: '根节点' });
            this._root.setModelCollection(this);
        }
        Object.defineProperty(ModelCollection.prototype, "root", {
            /**
             * 获取根节点
             */
            get: function () { return this._root; },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加模型到根节点
         * @param m
         */
        ModelCollection.prototype.add = function (m) {
            this._root.add(m);
        };
        /**
         * 从根节点删除模型
         */
        ModelCollection.prototype.remove = function (m) {
            this._root.remove(m);
        };
        /**
         * private
         * @param model
         */
        ModelCollection.prototype._onAddModel = function (model) {
            this._models.put(model.id, model);
            this._entities.add(model._czRenderable);
        };
        /**
         * private
         * @param model
         */
        ModelCollection.prototype._onRemoveModel = function (model) {
            this._models.remove(model.id);
            this._entities.remove(model._czRenderable);
        };
        return ModelCollection;
    }());
    Cegore.ModelCollection = ModelCollection;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class GltfModel
 */
var Cegore;
(function (Cegore) {
    /**
     * Gltf模型
     */
    var GltfModel = /** @class */ (function (_super) {
        __extends(GltfModel, _super);
        /**
         * 构造函数，构造一个新的 GltfModel 对象
         * @param options 模型的参数
        
         * @param options.name 模型的名称，用户自定义，便于识别的标识符
         * @param options.uri 模型数据的uri，必须是gltf格式的
         * @param options.enablePick 是否允许拾取
         * @param options.minPixelSize 最小可见像素大小
         * @param options.color 模型显示的叠加颜色
         * @param options.outlineColor 轮廓线颜色
         * @param options.outlineSize 轮廓线宽度
         *
         * ///
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function GltfModel(options) {
            var _this = _super.call(this) || this;
            _this._enablePcik = true;
            _this._color = new Cegore.Color(Cegore.Color.WHITE);
            _this._outlineColor = new Cegore.Color(Cegore.Color.BLACK);
            _this._outlineSize = 0.0;
            //
            _this._czEntity = new Cesium.Entity();
            _this._czModel = new Cesium.ModelGraphics();
            _this._czEntity.model = _this._czModel;
            /// 应用属性
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        GltfModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, GltfModel.GltfModelPropList, props);
        };
        Object.defineProperty(GltfModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "type", {
            /**
             * 获取类型，返回 Model
             */
            get: function () { return 'GltfModel'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "uri", {
            /**
             * 获取模型的数据的URI
             */
            get: function () { return this._uri; },
            /**
             * 指定模型数据的URI
             */
            set: function (uri) { this._uri = uri; this._czModel.uri = uri; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "enablePick", {
            /**
             * 是否允许拾取
             */
            get: function () { return this._enablePcik; },
            /**
             * 允许拾取
             */
            set: function (enable) { this._enablePcik = enable; this._czModel.allowPicking = enable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "minPixelSize", {
            /**
             * 获取模型显示的最小像素大小，当模型在屏幕上小于该值后将不再显示
             */
            get: function () { return this._minPixelSize; },
            /**
             * 设置模型显示的最小像素大小，当模型在屏幕上小于该值后将不再显示
             */
            set: function (size) { this._minPixelSize = size; this._czModel.minimumPixelSize = size; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "color", {
            /**
             * 获取模型颜色
             */
            get: function () { return this._color; },
            /**
             * 设置模型颜色
             */
            set: function (color) {
                this._color.set(color);
                this._czModel.color = this._color.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "outlineColor", {
            /**
             * 获取模型轮廓线颜色
             */
            get: function () { return this._outlineColor; },
            /**
             * 设置模型轮廓线颜色
             */
            set: function (color) {
                this._outlineColor.set(color);
                this._czModel.silhouetteColor = this._outlineColor.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GltfModel.prototype, "outlineSize", {
            /**
             * 获取模型轮廓线宽度
             */
            get: function () { return this._outlineSize; },
            /**
             * 设置模型轮廓线宽度
             */
            set: function (size) {
                this._outlineSize = size;
                this._czModel.silhouetteSize = size;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 模型可设置的属性
         */
        GltfModel.GltfModelPropList = ['uri', 'enablePick', 'minPixelSize', 'color', 'outlineColor', 'outlineSize'];
        return GltfModel;
    }(Cegore.Model));
    Cegore.GltfModel = GltfModel;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Shape
 */
var Cegore;
(function (Cegore) {
    /**
     * 图形的抽象基类，不能直接构造该对象
     */
    var Shape = /** @class */ (function (_super) {
        __extends(Shape, _super);
        /**
         * 构造一个新的Shape对象
         */
        function Shape() {
            var _this = _super.call(this) || this;
            _this._fill = true;
            _this._outline = false;
            _this._outlineColor = new Cegore.Color(Cegore.Color.BLACK);
            _this._outlineWidth = 1.0;
            _this._shadows = Cegore.ShadowMode.DISABLED;
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        Shape.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, Shape.ShapePropList, props);
        };
        Object.defineProperty(Shape.prototype, "fill", {
            /**
             * 获取是否填充，默认值：true
             */
            get: function () { return this._fill; },
            /**
             * 设置是否填充，默认值：true
             */
            set: function (fill) {
                this._fill = fill;
                this._czShape.fill = fill;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "material", {
            /**
             * 获取当前图形的材质
             */
            get: function () { return this._material; },
            /**
             * 设置当前图形的材质
             */
            set: function (mat) {
                var mm = mat;
                if (Cegore.TypeCheck.isInstanceOf(mm, Cegore.Material))
                    this._material = mm;
                else if (Cegore.TypeCheck.isInstanceOf(mm, Cegore.Color))
                    this._material = new Cegore.ColorMaterial(mm);
                else if (Cegore.TypeCheck.isString(mm) ||
                    Cegore.TypeCheck.isInstanceOf(mm, HTMLImageElement) ||
                    Cegore.TypeCheck.isInstanceOf(mm, HTMLCanvasElement) ||
                    Cegore.TypeCheck.isInstanceOf(mm, HTMLVideoElement))
                    this._material = new Cegore.ImageMaterial({ image: mm });
                else if (Cegore.TypeCheck.isObject(mm))
                    this._material = new Cegore.ImageMaterial(mm);
                this._czShape.material = this._material.czmat;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "outline", {
            /**
             * 获取是否显示轮廓，默认值：false
             */
            get: function () { return this._outline; },
            /**
             * 设置是否显示轮廓，默认值：false
             */
            set: function (val) {
                this._outline = val;
                this._czShape.outline = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "outlineColor", {
            /**
             * 获取轮廓线颜色，默认值：Color.BLACK
             */
            get: function () { return new Cegore.Color(this._czShape.outlineColor); },
            /**
             * 设置轮廓线颜色，默认值：Color.BLACK
             */
            set: function (val) {
                this._outlineColor.set(val);
                this._czShape.outlineColor = this._outlineColor.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "outlineWidth", {
            /**
             * 获取轮廓线宽度，默认值：1.0
             */
            get: function () { return this._czShape.outlineWidth; },
            /**
             * 设置轮廓线宽度，默认值：1.0
             */
            set: function (val) {
                this._outlineWidth = val;
                this._czShape.outlineWidth = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "shadows", {
            /**
             * 获取阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
             */
            get: function () { return this._czShape.shadows; },
            /**
             * 设置阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
             */
            set: function (mode) {
                this._shadows = mode;
                this._czShape.shadows = mode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "displayDistance", {
            get: function () { return this._displayDistance; },
            set: function (distance) {
                this._displayDistance = distance;
                this._czShape.distanceDisplayCondition = distance;
            },
            enumerable: true,
            configurable: true
        });
        Shape.ShapePropList = ['material', 'fill', 'outline', 'outlineColor', 'outlineWidth', 'shadows', 'displayDistance'];
        return Shape;
    }(Cegore.Model));
    Cegore.Shape = Shape;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class Shape
 */
var Cegore;
(function (Cegore) {
    /**
     * 可以挤压成体的图形的抽象基类，不能直接构造该对象
     */
    var ShapeExtruded = /** @class */ (function (_super) {
        __extends(ShapeExtruded, _super);
        /**
         * 构造一个ShapeExtruded对象
         * @param options 一个可选的参数对象
         * @param options.height 距离地表的高度，默认值：0
         * @param options.extrudedHeight 挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
         * @param options.rotation 从正北方向逆时针旋转的角度，默认值：0
         *
         * Shape
         * @param options.fill 是否填充显示，默认值：是
         * @param options.material 填充的材质，默认值：Color.WHITE
         * @param options.outline 是否显示轮廓线，默认值：不显示
         * @param options.outlineColor 轮廓线的颜色，默认值：黑色
         * @param options.outlineWidth 轮廓线的宽度，默认值：1.0
         * @param options.shadows 阴影模式，默认值：ShadowMode.DISABLE
         * @param options.displayDistance 显示距离，控制在多大范围内显示该模型
         *
         * Renderable 的参数
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function ShapeExtruded(options) {
            return _super.call(this) || this;
        }
        /**
         * 应用属性给当前对象
         */
        ShapeExtruded.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, ShapeExtruded.ShapeExtrudedPropList, props);
        };
        Object.defineProperty(ShapeExtruded.prototype, "height", {
            /**
             * 获取椭圆距离地表的高度，默认值：0
             */
            get: function () { return this._height; },
            /**
             * 设置椭圆距离地表的高度，默认值：0
             */
            set: function (height) {
                this._height = height;
                this._czShape.height = height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShapeExtruded.prototype, "extrudedHeight", {
            /**
             * 获取椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
             */
            get: function () { return this._extrudedHeight; },
            /**
             * 设置椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
             */
            set: function (exheight) {
                this._extrudedHeight = exheight;
                this._czShape.extrudedHeight = exheight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShapeExtruded.prototype, "rotation", {
            /**
             * 获取椭圆从正北方向逆时针旋转的角度，默认值：0
             */
            get: function () { return this._rotation; },
            /**
             * 设置椭圆从正北方向逆时针旋转的角度，默认值：0
             */
            set: function (r) {
                this._rotation = r;
                this._czShape.rotation = Cegore.GeoMath.toRadian(r);
            },
            enumerable: true,
            configurable: true
        });
        ShapeExtruded.ShapeExtrudedPropList = ['height', 'extrudedHeight', 'rotation'];
        return ShapeExtruded;
    }(Cegore.Shape));
    Cegore.ShapeExtruded = ShapeExtruded;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * file of class BoxModel
 */
var Cegore;
(function (Cegore) {
    /**
     * 立方体模型对象
     */
    var BoxModel = /** @class */ (function (_super) {
        __extends(BoxModel, _super);
        /**
         * 构造一个立方体对象
         * @param options 一个可选的参数对象
         * @param options.dimensions 模型的尺寸，可以是数组（[x, y, z]）或者对象({x: 1,y:1, z:1})
         *
         * /// Shape 的参数
         * @param options.fill 是否填充显示，默认值：是
         * @param options.material 填充的材质，默认值：Color.WHITE
         * @param options.outline 是否显示轮廓线，默认值：不显示
         * @param options.outlineColor 轮廓线的颜色，默认值：黑色
         * @param options.outlineWidth 轮廓线的宽度，默认值：1.0
         * @param options.shadows 阴影模式，默认值：ShadowMode.DISABLE
         * @param options.displayDistance 显示距离，控制在多大范围内显示该模型
         *
         * /// Renderable 的参数
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function BoxModel(options) {
            var _this = _super.call(this) || this;
            _this._dimensions = new Cegore.Vector3();
            //
            _this._czEntity = new Cesium.Entity();
            _this._czBox = new Cesium.BoxGraphics();
            _this._czEntity.box = _this._czBox;
            /// 
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        BoxModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, BoxModel.BoxPropList, props);
        };
        Object.defineProperty(BoxModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoxModel.prototype, "_czShape", {
            /**
             * @private
             */
            get: function () { return this._czBox; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoxModel.prototype, "type", {
            /**
             * 获取对象的类型
             */
            get: function () { return "BoxModel"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoxModel.prototype, "dimensions", {
            /**
             * 获取模型的尺寸，返回值是一个Vector3，分别是立方体的长宽高，不要再外部修改该对象
             */
            get: function () { return this._dimensions; },
            /**
             * 设置立方体的尺寸
             */
            set: function (dimensions) {
                this._dimensions.set(dimensions);
                this._czBox.dimensions = this._dimensions._asCzVector3();
            },
            enumerable: true,
            configurable: true
        });
        BoxModel.BoxPropList = ['dimensions'];
        return BoxModel;
    }(Cegore.Shape));
    Cegore.BoxModel = BoxModel;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */
/*
 * file of class CylinderModel
 */
var Cegore;
(function (Cegore) {
    /**
     * 圆柱模型对象
     */
    var CylinderModel = /** @class */ (function (_super) {
        __extends(CylinderModel, _super);
        /**
         * 构造一个圆柱体对象
         * @param options 一个可选的参数对象
         * @param options.length 圆柱体的长度
         * @param options.topRadius 圆柱体顶面半径
         * @param options.bottomRadius 圆柱体底面变径
         * @param options.slices 圆柱体边的数目，默认值：128,
         * @param options.verticalLines 垂直线的数目，该参数用于轮廓线显示，默认值：16
         *
         * ///
         * @param options.fill 是否填充显示，默认值：是
         * @param options.material 填充的材质，默认值：Color.WHITE
         * @param options.outline 是否显示轮廓线，默认值：不显示
         * @param options.outlineColor 轮廓线的颜色，默认值：黑色
         * @param options.outlineWidth 轮廓线的宽度，默认值：1.0
         * @param options.shadows 阴影模式，默认值：ShadowMode.DISABLE
         * @param options.displayDistance 显示距离，控制在多大范围内显示该模型
         *
         * /// Renderable 的参数
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function CylinderModel(options) {
            var _this = _super.call(this) || this;
            //
            _this._czEntity = new Cesium.Entity();
            _this._czCylinder = new Cesium.CylinderGraphics();
            _this._czEntity.cylinder = _this._czCylinder;
            /// 
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        CylinderModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, CylinderModel.CylinderPropList, props);
        };
        Object.defineProperty(CylinderModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "_czShape", {
            /**
             * @private
             */
            get: function () { return this._czCylinder; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "type", {
            /**
             * 获取对象的类型
             */
            get: function () { return "CylinderModel"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "length", {
            /**
             * 获取圆柱体的长度
             */
            get: function () { return this._length; },
            /**
             * 设置圆柱体的长度
             */
            set: function (length) {
                this._length = length;
                this._czCylinder.length = length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "topRadius", {
            /**
             * 获取圆柱体的顶面变径
             */
            get: function () { return this._topRadius; },
            /**
             * 设置圆柱体的顶面半径
             */
            set: function (radius) {
                this._topRadius = radius;
                this._czCylinder.topRadius = radius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "bottomRadius", {
            /**
             * 获取圆柱体的底面变径
             */
            get: function () { return this._bottomRadius; },
            /**
             * 设置圆柱体的底面半径
             */
            set: function (radius) {
                this._bottomRadius = radius;
                this._czCylinder.bottomRadius = radius;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "slices", {
            /**
             * 获取圆柱体边的数量，默认值：128
             */
            get: function () { return this._slices; },
            /**
             * 设置圆柱体边的数量，默认值：128
             */
            set: function (slices) {
                this._slices = slices;
                this._czCylinder.slices = slices;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CylinderModel.prototype, "verticalLines", {
            /**
             * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
             */
            get: function () { return this._verticalLines; },
            /**
             * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
             */
            set: function (num) {
                this._verticalLines = num;
                this._czCylinder.numberOfVerticalLines = num;
            },
            enumerable: true,
            configurable: true
        });
        CylinderModel.CylinderPropList = ['length', 'topRadius', 'bottomRadius', 'slices', 'verticalLines'];
        return CylinderModel;
    }(Cegore.Shape));
    Cegore.CylinderModel = CylinderModel;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */
/*
 * file of class EllipseModel
 */
var Cegore;
(function (Cegore) {
    /**
     * 椭圆模型对象
     */
    var EllipseModel = /** @class */ (function (_super) {
        __extends(EllipseModel, _super);
        /**
         * 构造一个椭圆对象
         * @param options 一个可选的参数对象
         * @param options.semiMajorAxis 椭圆长半轴长度
         * @param options.semiMinorAxis 椭圆短半轴长度
         * @param options.slices 椭圆边的数目，默认值：128,
         * @param options.verticalLines 垂直线的数目，该参数用于轮廓线显示，默认值：16
         *
         * Extruded
         * @param options.height 椭圆距离地表的高度，默认值：0
         * @param options.extrudedHeight 椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
         * @param options.rotation 椭圆从正北方向逆时针旋转的角度，默认值：0
         *
         * Shape
         * @param options.fill 是否填充显示，默认值：是
         * @param options.material 填充的材质，默认值：Color.WHITE
         * @param options.outline 是否显示轮廓线，默认值：不显示
         * @param options.outlineColor 轮廓线的颜色，默认值：黑色
         * @param options.outlineWidth 轮廓线的宽度，默认值：1.0
         * @param options.shadows 阴影模式，默认值：ShadowMode.DISABLE
         * @param options.displayDistance 显示距离，控制在多大范围内显示该模型
         *
         * Renderable 的参数
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function EllipseModel(options) {
            var _this = _super.call(this) || this;
            //
            _this._czEntity = new Cesium.Entity();
            _this._czEllipse = new Cesium.EllipseGraphics();
            _this._czEntity.ellipse = _this._czEllipse;
            /// 
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        EllipseModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, EllipseModel.EllipsePropList, props);
        };
        Object.defineProperty(EllipseModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipseModel.prototype, "_czShape", {
            /**
             * @private
             */
            get: function () { return this._czEllipse; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipseModel.prototype, "type", {
            /**
             * 获取对象的类型
             */
            get: function () { return "EllipseModel"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipseModel.prototype, "semiMajorAxis", {
            /**
             * 获取椭圆的长半轴长度
             */
            get: function () { return this._semiMajorAxis; },
            /**
             * 设置椭圆的长半轴长度
             */
            set: function (len) {
                this._semiMajorAxis = len;
                this._czEllipse.semiMajorAxis = len;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipseModel.prototype, "semiMinorAxis", {
            /**
             * 获取椭圆的短半轴长度
             */
            get: function () { return this._semiMinorAxis; },
            /**
             * 设置椭圆的短半轴长度
             */
            set: function (len) {
                this._semiMinorAxis = len;
                this._czEllipse.semiMinorAxis = len;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipseModel.prototype, "slices", {
            /**
             * 获取圆柱体边的数量，默认值：128
             */
            get: function () { return this._slices; },
            /**
             * 设置圆柱体边的数量，默认值：128
             */
            set: function (slices) {
                this._slices = slices;
                this._czEllipse.granularity = (Math.PI / 4.0) / slices;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipseModel.prototype, "verticalLines", {
            /**
             * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
             */
            get: function () { return this._verticalLines; },
            /**
             * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
             */
            set: function (num) {
                this._verticalLines = num;
                this._czEllipse.numberOfVerticalLines = num;
            },
            enumerable: true,
            configurable: true
        });
        EllipseModel.EllipsePropList = ['semiMajorAxis', 'semiMinorAxis', 'slices', 'verticalLines'];
        return EllipseModel;
    }(Cegore.ShapeExtruded));
    Cegore.EllipseModel = EllipseModel;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */
/*
 * file of class EllipsoidModel
 */
var Cegore;
(function (Cegore) {
    /**
     * 椭球模型对象
     */
    var EllipsoidModel = /** @class */ (function (_super) {
        __extends(EllipsoidModel, _super);
        /**
         * 构造一个圆柱体对象
         * @param options 一个可选的参数对象
         * @param options.semiMajorAxis 椭圆长半轴长度
         * @param options.semiMinorAxis 椭圆短半轴长度
         * @param options.height 椭圆距离地表的高度，默认值：0
         * @param options.extrudedHeight 椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
         * @param options.rotation 椭圆从正北方向逆时针旋转的角度，默认值：0
         * @param options.slices 椭圆边的数目，默认值：128,
         * @param options.verticalLines 垂直线的数目，该参数用于轮廓线显示，默认值：16
         *
         * ///
         * @param options.fill 是否填充显示，默认值：是
         * @param options.material 填充的材质，默认值：Color.WHITE
         * @param options.outline 是否显示轮廓线，默认值：不显示
         * @param options.outlineColor 轮廓线的颜色，默认值：黑色
         * @param options.outlineWidth 轮廓线的宽度，默认值：1.0
         * @param options.shadows 阴影模式，默认值：ShadowMode.DISABLE
         * @param options.displayDistance 显示距离，控制在多大范围内显示该模型
         *
         * /// Renderable 的参数
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function EllipsoidModel(options) {
            var _this = _super.call(this) || this;
            //
            _this._czEntity = new Cesium.Entity();
            _this._czEllipsoid = new Cesium.EllipsoidGraphics();
            _this._czEntity.ellipsoid = _this._czEllipsoid;
            /// 
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        EllipsoidModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, EllipsoidModel.EllipsoidPropList, props);
        };
        Object.defineProperty(EllipsoidModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "_czShape", {
            /**
             * @private
             */
            get: function () { return this._czEllipsoid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "type", {
            /**
             * 获取对象的类型
             */
            get: function () { return "EllipsoidModel"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "semiMajorAxis", {
            /**
             * 获取椭圆的长半轴长度
             */
            get: function () { return this._semiMajorAxis; },
            /**
             * 设置椭圆的长半轴长度
             */
            set: function (len) {
                this._semiMajorAxis = len;
                this._czEllipsoid.semiMajorAxis = len;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "semiMinorAxis", {
            /**
             * 获取椭圆的短半轴长度
             */
            get: function () { return this._semiMinorAxis; },
            /**
             * 设置椭圆的短半轴长度
             */
            set: function (len) {
                this._semiMinorAxis = len;
                this._czEllipsoid.semiMinorAxis = len;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "height", {
            /**
             * 获取椭圆距离地表的高度，默认值：0
             */
            get: function () { return this._height; },
            /**
             * 设置椭圆距离地表的高度，默认值：0
             */
            set: function (height) {
                this._height = height;
                this._czEllipsoid.height = height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "extrudedHeight", {
            /**
             * 获取椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
             */
            get: function () { return this._extrudedHeight; },
            /**
             * 设置椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
             */
            set: function (exheight) {
                this._extrudedHeight = exheight;
                this._czEllipsoid.extrudedHeight = exheight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "rotation", {
            /**
             * 获取椭圆从正北方向逆时针旋转的角度，默认值：0
             */
            get: function () { return this._rotation; },
            /**
             * 设置椭圆从正北方向逆时针旋转的角度，默认值：0
             */
            set: function (r) {
                this._rotation = r;
                this._czEllipsoid.rotation = Cegore.GeoMath.toRadian(r);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "slices", {
            /**
             * 获取圆柱体边的数量，默认值：128
             */
            get: function () { return this._slices; },
            /**
             * 设置圆柱体边的数量，默认值：128
             */
            set: function (slices) {
                this._slices = slices;
                this._czEllipsoid.granularity = (Math.PI / 4.0) / slices;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EllipsoidModel.prototype, "verticalLines", {
            /**
             * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
             */
            get: function () { return this._verticalLines; },
            /**
             * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
             */
            set: function (num) {
                this._verticalLines = num;
                this._czEllipsoid.numberOfVerticalLines = num;
            },
            enumerable: true,
            configurable: true
        });
        EllipsoidModel.EllipsoidPropList = ['semiMajorAxis', 'semiMinorAxis', 'height', 'extrudedHeight', 'slices', 'rotation', 'verticalLines'];
        return EllipsoidModel;
    }(Cegore.Shape));
    Cegore.EllipsoidModel = EllipsoidModel;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */
/*
 * file of class PolylineModel
 */
var Cegore;
(function (Cegore) {
    /**
     * 多边形样式类型
     */
    var PolylineStyle;
    (function (PolylineStyle) {
        /**
         * 普通样式
         */
        PolylineStyle[PolylineStyle["NONE"] = 0] = "NONE";
        /**
         * 炽热样式
         */
        PolylineStyle[PolylineStyle["GLOW"] = 1] = "GLOW";
        /**
         * 轮库线样式
         */
        PolylineStyle[PolylineStyle["OUTLINE"] = 2] = "OUTLINE";
        /**
         * 点划线样式
         */
        PolylineStyle[PolylineStyle["DASH"] = 3] = "DASH";
        /**
         * 箭头样式
         */
        PolylineStyle[PolylineStyle["ARROW"] = 4] = "ARROW";
    })(PolylineStyle = Cegore.PolylineStyle || (Cegore.PolylineStyle = {}));
    /**
     * 折线对象
     */
    var PolylineModel = /** @class */ (function (_super) {
        __extends(PolylineModel, _super);
        /**
         *
         * @param options 折线参数列表
         * @param options.positions 折线顶点列表
         * @param options.dynamic 是否动态线
         * @param options.followSuface 是否贴在地表
         * @param options.color 颜色
         * @param options.width 宽度
         * @param options.style 样式
         * @param options.glow 炽热度，仅用于GLOW样式
         * @param options.outlineWidth 轮廓线宽度，仅用于OUTLINE样式
         * @param options.outlineColor 轮廓线颜色，仅用于OUTLINE样式
         * @param options.shadows 阴影模式
         * @param options.displayDistance 显示距离
         */
        function PolylineModel(options) {
            var _this = _super.call(this) || this;
            _this._dynamic = false;
            _this._color = new Cegore.Color(Cegore.Color.WHITE);
            _this._style = PolylineStyle.NONE;
            _this._outlineColor = new Cegore.Color(Cegore.Color.BLACK);
            _this._outlineWidth = 1.0;
            _this._shadows = Cegore.ShadowMode.DISABLED;
            //
            _this._czEntity = new Cesium.Entity();
            _this._czPolyline = new Cesium.PolylineGraphics();
            _this._czEntity.polyline = _this._czPolyline;
            _this._dynamic = Cegore.TypeCheck.defaultValue(options.dynamic, false);
            /// 
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        PolylineModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, PolylineModel.PolylinePropList, props);
        };
        Object.defineProperty(PolylineModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "_czShape", {
            /**
             * @private
             */
            get: function () { return this._czPolyline; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "type", {
            /**
             * 获取对象的类型
             */
            get: function () { return "PolylineModel"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "positions", {
            /**
             * 获取顶点列表
             */
            get: function () { return this._positions; },
            /**
             * 设置顶点列表
             */
            set: function (points) {
                this._positions = [];
                this._czPositions = [];
                for (var i = 0; i < points.length; ++i) {
                    var pt = new Cegore.Position(points[i]);
                    this._positions.push(pt);
                    this._czPositions.push(Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, pt.altitude));
                }
                var pos = this._czPositions;
                if (this._dynamic && !Cegore.TypeCheck.isInstanceOf(this._czShape.positions, Cesium.CallbackProperty))
                    this._czShape.positions = new Cesium.CallbackProperty(function (time, result) { return pos; }, false);
                else
                    this._czShape.positions = pos;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "followSurface", {
            /**
             * 获取是否贴附地表
             */
            get: function () { return this._followSurface; },
            /**
             * 设置是否贴附地表
             */
            set: function (follow) { this._followSurface = follow; this._czShape.followSuface = follow; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "color", {
            /**
             * 获取颜色
             */
            get: function () { return this._color; },
            /**
             * 设置颜色
             */
            set: function (color) {
                this._color.set(color);
                if (this._style == PolylineStyle.NONE)
                    this._czShape.material = color.toCZColor();
                else
                    this._czShape.material.color = color.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "color2", {
            /**
             * 获取颜色
             */
            get: function () { return this._color2; },
            /**
             * 设置颜色
             */
            set: function (color) {
                if (!this._color2) {
                    this._color2 = new Cegore.Color(Cegore.Color.WHITE);
                }
                this._color2.set(color);
                //if (this._style == PolylineStyle.NONE)
                this._czShape.depthFailMaterial = color.toCZColor();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "width", {
            /**
             * 设置线宽
             */
            get: function () { return this._width; },
            /**
             * 获取线宽
             */
            set: function (width) { this._width = width; this._czShape.width = width; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "style", {
            /**
             * 获取样式
             */
            get: function () { return this._style; },
            /**
             * 设置样式
             */
            set: function (style) {
                if (this._style == style)
                    return;
                ///
                this._style = style;
                var czColor = this._color.toCZColor();
                switch (style) {
                    case PolylineStyle.GLOW:
                        this._czShape.material = new Cesium.PolylineGlowMaterialProperty({
                            color: czColor, glowPower: this._glow
                        });
                        break;
                    case PolylineStyle.DASH:
                        this._czShape.material = new Cesium.PolylineDashMaterialProperty({ color: czColor });
                        break;
                    case PolylineStyle.ARROW:
                        this._czShape.material = new Cesium.PolylineArrowMaterialProperty(czColor);
                        break;
                    case PolylineStyle.OUTLINE:
                        this._czShape.material = new Cesium.PolylineOutlineMaterialProperty({
                            color: czColor,
                            outlineWidth: this._outlineWidth,
                            outlineColor: this._outlineColor.toCZColor()
                        });
                        break;
                    case PolylineStyle.NONE:
                    default:
                        this._czShape.material = this._color.toCZColor();
                        break;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "glow", {
            /**
             * 获取炽热度
             */
            get: function () { return this._glow; },
            /**
             * 设置炽热度
             */
            set: function (glow) {
                if (this._style == PolylineStyle.GLOW) {
                    this._czShape.material.glowPower = glow;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "outlineColor", {
            /**
             * 获取轮廓线颜色，默认值：Color.BLACK
             */
            get: function () { return this._outlineColor; },
            /**
             * 设置轮廓线颜色，默认值：Color.BLACK
             */
            set: function (val) {
                this._outlineColor.set(val);
                if (this._style == PolylineStyle.OUTLINE) {
                    this._czShape.material.outlineColor = this._outlineColor.toCZColor();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "outlineWidth", {
            /**
             * 获取轮廓线宽度，默认值：1.0
             */
            get: function () { return this._outlineWidth; },
            /**
             * 设置轮廓线宽度，默认值：1.0
             */
            set: function (val) {
                this._outlineWidth = val;
                if (this._style == PolylineStyle.OUTLINE)
                    this._czShape.material.outlineWidth = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "shadows", {
            /**
             * 获取阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
             */
            get: function () { return this._shadows; },
            /**
             * 设置阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
             */
            set: function (mode) {
                this._shadows = mode;
                this._czShape.shadows = mode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolylineModel.prototype, "displayDistance", {
            get: function () { return this._displayDistance; },
            set: function (distance) {
                this._displayDistance = distance;
                this._czShape.distanceDisplayCondition = distance;
            },
            enumerable: true,
            configurable: true
        });
        PolylineModel.PolylinePropList = ['positions', 'followSurface', 'width',
            'style', 'color', 'color2', 'glow', 'outlineWidth', 'outlineColor', 'shadows', 'displayDistance'
        ];
        return PolylineModel;
    }(Cegore.Model));
    Cegore.PolylineModel = PolylineModel;
})(Cegore || (Cegore = {}));
/*
 * file of class PolygonModel
 */
var Cegore;
(function (Cegore) {
    /**
     * 多边形的结构
     */
    var PolygonHierarchy = /** @class */ (function () {
        function PolygonHierarchy() {
        }
        return PolygonHierarchy;
    }());
    Cegore.PolygonHierarchy = PolygonHierarchy;
    /**
     * 多边形对象
     */
    var PolygonModel = /** @class */ (function (_super) {
        __extends(PolygonModel, _super);
        /**
         * 构造一个多边形对象
         *
         * @param options 一个可选的参数对象
         * @param options.positions 多边形的顶点
         * @param options.dynamic 是否为动态对象，默认值：false
         * @param options.usePositionHeight 是否使用每一个顶点的高程信息，默认值：false
         * @param options.closeTop 是否封闭顶面，默认值：true
         * @param options.closeBottom 是否封闭底面，默认值：true
         *
         * ShapeExtruded
         * @param options.height 距离地表的高度，默认值：0
         * @param options.extrudedHeight 挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
         * @param options.rotation 从正北方向逆时针旋转的角度，默认值：0
         *
         * Shape
         * @param options.fill 是否填充显示，默认值：是
         * @param options.material 填充的材质，默认值：Color.WHITE
         * @param options.outline 是否显示轮廓线，默认值：不显示
         * @param options.outlineColor 轮廓线的颜色，默认值：黑色
         * @param options.outlineWidth 轮廓线的宽度，默认值：1.0
         * @param options.shadows 阴影模式，默认值：ShadowMode.DISABLE
         * @param options.displayDistance 显示距离，控制在多大范围内显示该模型
         *
         * Renderable 的参数
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        function PolygonModel(options) {
            var _this = _super.call(this) || this;
            _this._dynamic = false;
            _this._usePositionHeight = false;
            _this._closeTop = true;
            _this._closeBottom = true;
            //
            _this._czEntity = new Cesium.Entity();
            _this._czPolygon = new Cesium.PolygonGraphics();
            _this._czEntity.polygon = _this._czPolygon;
            _this._dynamic = Cegore.TypeCheck.defaultValue(options.dynamic, false);
            /// 
            _this.applyProps(options);
            return _this;
        }
        /**
         * 应用属性给当前对象
         */
        PolygonModel.prototype.applyProps = function (props) {
            _super.prototype.applyProps.call(this, props);
            Cegore.Renderable.applyProps(this, PolygonModel.PolygonPropList, props);
        };
        Object.defineProperty(PolygonModel.prototype, "_czRenderable", {
            /**
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolygonModel.prototype, "_czShape", {
            /**
             * @private
             */
            get: function () { return this._czPolygon; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolygonModel.prototype, "type", {
            /**
             * 获取对象的类型
             */
            get: function () { return "PolygonModel"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolygonModel.prototype, "positions", {
            /**
             * 获取顶点列表
             */
            get: function () { return this._positions; },
            /**
             * 设置顶点列表
             */
            set: function (polygon) {
                this._positions = [];
                var pts, holes = [];
                for (var i = 0; i < polygon.length; ++i) {
                    var ring = polygon[i];
                    var sring = [], czring = [];
                    for (var j = 0; j < ring.length; ++j) {
                        var pt = new Cegore.Position(ring[j]);
                        sring.push(pt);
                        ///
                        czring.push(Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, pt.altitude));
                    }
                    this._positions(sring);
                    if (i == 0)
                        pts = czring;
                    else
                        holes.push(new Cesium.PolygonHierarchy(czring));
                }
                this._czPositions = new Cesium.PolygonHierarchy(pts, holes);
                var pos = this._czPositions;
                if (this._dynamic && !Cegore.TypeCheck.isInstanceOf(this._czShape.positions, Cesium.CallbackProperty))
                    this._czShape.positions = new Cesium.CallbackProperty(function (time, result) { return pos; }, false);
                else
                    this._czShape.positions = pos;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolygonModel.prototype, "usePositionHeight", {
            /**
             * 获取是否使用顶点的高程值，默认值：false
             */
            get: function () { return this._usePositionHeight; },
            /**
             * 设置是否使用定点高程值
             */
            set: function (use) { this._usePositionHeight = use; this._czShape.perPositionHeight = use; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolygonModel.prototype, "closeTop", {
            /**
             * 获取是否封闭顶面
             */
            get: function () { return this._closeTop; },
            /**
             * 设置是否封闭顶面
             */
            set: function (close) { this._closeTop = close; this._czShape.closeTop = close; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PolygonModel.prototype, "closeBottom", {
            /**
             * 获取是否封闭底面
             */
            get: function () { return this._closeBottom; },
            /**
             * 设置是否封闭底面
             */
            set: function (close) { this._closeBottom = close; this._czShape.closeBottom = close; },
            enumerable: true,
            configurable: true
        });
        PolygonModel.PolygonPropList = ['positions', 'usePositionHeight', 'closeTop', 'closeBottom'];
        return PolygonModel;
    }(Cegore.ShapeExtruded));
    Cegore.PolygonModel = PolygonModel;
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    var PrimitiveModel = /** @class */ (function (_super) {
        __extends(PrimitiveModel, _super);
        function PrimitiveModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return PrimitiveModel;
    }(Cegore.Renderable));
    Cegore.PrimitiveModel = PrimitiveModel;
})(Cegore || (Cegore = {}));
/*
 * File of class Label
 */
var Cegore;
(function (Cegore) {
    /**
     * 标注类
     */
    var Label = /** @class */ (function (_super) {
        __extends(Label, _super);
        /**
         * 构建一个新的标注对象
         *
         * @param options
         */
        function Label(options) {
            var _this = _super.call(this) || this;
            _this._layer = "";
            /// 
            _this.mAutoOffset = true;
            if (!Cegore.TypeCheck.isDefined(options.text) && !Cegore.TypeCheck.isDefined(options.icon))
                throw "need options.text or options.icon";
            /// 
            _this._name = Cegore.AutoNames.genName(options.name, 'Label');
            _this._layer = Cegore.TypeCheck.defaultValue(options.layer, '');
            _this._events = new Cegore.EventHandle(options.labelevent);
            /// 构建 entity
            _this._czEntity = new Cesium.Entity({ name: _this._layer + ' ' + _this._name });
            _this._czEntity._zMapRenderable = _this;
            /// 文字
            _this.setText(options.text);
            /// 图标
            _this.setIcon(options.icon);
            ///
            _super.prototype.applyProps.call(_this, {
                position: options.pos,
                visible: options.visible
            });
            return _this;
        }
        Object.defineProperty(Label.prototype, "_czRenderable", {
            /**
             * 内部接口
             * @private
             */
            get: function () { return this._czEntity; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "type", {
            /**
             * 返回类型，返回‘Type’
             */
            get: function () { return 'Label'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "name", {
            /**
             * 获取标注的名称
             */
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "layer", {
            /**
             * 获取标注所在图层
             */
            get: function () { return this._layer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "text", {
            /**
             * 获取标注文本
             */
            get: function () {
                if (Cegore.TypeCheck.isDefined(this._czText))
                    return this._czText.text;
            },
            /**
             * 设置标注文本
             */
            set: function (value) {
                this.setText({ title: value });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "icon", {
            /**
             * 获取图标
             */
            get: function () {
                if (Cegore.TypeCheck.isDefined(this._czIcon))
                    return this._czIcon.image.src;
            },
            /**
             * 设置图标
             */
            set: function (value) {
                this.setIcon({ img: value });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "events", {
            /**
             * 获取事件
             */
            get: function () { return this._events; },
            enumerable: true,
            configurable: true
        });
        /**
         * 应用属性
         * @param val 属性值
         * @param tar 目标
         * @param name 目标属性名
         * @param type 属性类型
         */
        Label.prototype._applyProp = function (val, tar, name, type) {
            if (!Cegore.TypeCheck.isDefined(val))
                return;
            var propval;
            switch (type) {
                case 'Cartesian2':
                    propval = new Cesium.Cartesian2(val[0], val[1]);
                    break;
                case 'Color':
                    propval = Cesium.Color.fromCssColorString(val);
                    break;
                default: propval = val;
            }
            tar[name] = propval;
        };
        /**
         * 应用文本属性
         * @private
         *
         * @param val
         * @param name
         * @param type
         */
        Label.prototype._applyTextProp = function (val, name, type) {
            this._applyProp(val, this._czText, name, type);
        };
        /**
         * 应用文本属性
         * @private
         *
         * @param val
         * @param name
         * @param type
         */
        Label.prototype._applyIconProp = function (val, name, type) {
            this._applyProp(val, this._czIcon, name, type);
        };
        /**
         * 设置文字
         * @param text 文本信息
         */
        Label.prototype.setText = function (text) {
            if (!Cegore.TypeCheck.isDefined(text))
                return;
            if (!Cegore.TypeCheck.isDefined(this._czText)) {
                this._czText = new Cesium.LabelGraphics();
                this._czEntity.label = this._czText;
            }
            if (Cegore.TypeCheck.isDefined(text.font) || Cegore.TypeCheck.isDefined(text.size)) {
                var fontname = Cegore.TypeCheck.defaultValue(text.font, 'sans-serif');
                var fontsize = Cegore.TypeCheck.defaultValue(text.size, '10');
                this._czText.font = fontsize + 'px ' + fontname;
            }
            this._applyTextProp(text.title, 'text');
            this._applyTextProp(text.color, 'fillColor', 'Color');
            if (Cegore.TypeCheck.isDefined(text.border)) {
                this._applyTextProp(text.border.color, 'outlineColor', 'Color');
                this._applyTextProp(text.border.width, 'outlineWidth');
            }
            /// 
            if (Cegore.TypeCheck.isDefined(text.unit)) {
                this._applyTextProp(text.unit.offset, 'pixelOffset', 'Cartesian2');
                if (Cegore.TypeCheck.isDefined(text.unit.offset))
                    this.mAutoOffset = false;
            }
        };
        /**
         * 设置图标
         * @param icon
         */
        Label.prototype.setIcon = function (icon) {
            if (!Cegore.TypeCheck.isDefined(icon))
                return;
            if (!Cegore.TypeCheck.isDefined(this._czIcon)) {
                this._czIcon = new Cesium.BillboardGraphics();
                this._czEntity.billboard = this._czIcon;
            }
            var imgurl;
            if (Cegore.TypeCheck.isString(icon.img)) {
                imgurl = icon.img;
            }
            else if (Cegore.TypeCheck.isArray(icon.img) && icon.img.length > 0) {
                imgurl = icon.img[0];
                ;
            }
            if (Cegore.TypeCheck.isDefined(imgurl)) {
                var _self_1 = this;
                var img_1 = new Image();
                img_1.src = imgurl;
                img_1.onload = function () {
                    _self_1._czIcon.image = img_1;
                    /// 自动根据图标的大小计算文字偏移
                    if (_self_1.mAutoOffset && Cegore.TypeCheck.isDefined(_self_1._czText)) {
                        var scale = _self_1._czIcon.scale ? _self_1._czIcon.scale.getValue() : 1;
                        var off = img_1.height * scale;
                        _self_1._czText.pixelOffset = new Cesium.Cartesian2(0, -off);
                    }
                };
            }
            this._applyIconProp(icon.scale, 'scale');
            this._applyIconProp(icon.color, 'color', 'Color');
            /// 
            if (Cegore.TypeCheck.isDefined(icon.unit)) {
                this._applyIconProp(icon.unit.offset, 'pixelOffset', 'Cartesian2');
            }
        };
        return Label;
    }(Cegore.Renderable));
    Cegore.Label = Label;
})(Cegore || (Cegore = {}));
/*
 * File of class LabelCollection
 */
var Cegore;
(function (Cegore) {
    /**
     * 标注集合
     */
    var LabelCollection = /** @class */ (function () {
        /**
         * 构造函数
         *
         * @param viewer
         */
        function LabelCollection(scene) {
            var _this = this;
            this._layers = new Cegore.HashMap(function () { return new Cegore.HashMap(); });
            this.mLabelEvent = new Cegore.EventHandle();
            this._scene = scene;
            this._czData = scene._czdata;
            this._czDataSource = new Cesium.CustomDataSource("LabelCollection");
            this._czData.viewer.dataSources.add(this._czDataSource);
            this._czEntities = this._czDataSource.entities;
            var self = this;
            this.mCZHandle = new Cesium.ScreenSpaceEventHandler(this._czData.scene.canvas);
            this.mCZHandle.setInputAction(function (movement) { _this.onLabelMoveEvent(movement); }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.mCZHandle.setInputAction(function (movement) { _this.onLabelClickEvent(movement); }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        // 标注鼠标移动事件
        LabelCollection.prototype.onLabelMoveEvent = function (movement) {
        };
        // 标注点击事件
        LabelCollection.prototype.onLabelClickEvent = function (movement) {
            var label = this.pick(movement.position);
            if (!Cegore.TypeCheck.isDefined(label))
                return;
            ///
            label.events.fire('onclick', label, movement.position);
            this.mLabelEvent.fire('onclick', label, movement.position);
        };
        /**
         * 获取对象
         * @private
         */
        LabelCollection.prototype._getOrCreateLayer = function (layerName) {
            return this._layers.getOrCreate(layerName, null);
        };
        /**
         * 获取对象
         * @private
         */
        LabelCollection.prototype._getLayer = function (layerName) {
            return this._layers.get(layerName);
        };
        Object.defineProperty(LabelCollection.prototype, "events", {
            /**
             * 获取全局标注事件
             */
            get: function () { return this.mLabelEvent; },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加标注
         * @param label 标注对象
         */
        LabelCollection.prototype.add = function (label) {
            /// 删除旧的标注图层
            this.remove(label);
            if (!Cegore.TypeCheck.isInstanceOf(label, Cegore.Label)) {
                label = new Cegore.Label(label);
            }
            this._getOrCreateLayer(label.layer).put(label.name, label);
            this._czEntities.add(label._czRenderable);
            return label;
        };
        /**
         * 获取标注对象
         *
         * @param {String} name 标注的名称
         * @param {String} layer 标注的图层
         */
        LabelCollection.prototype.get = function (name, layer) {
            layer = Cegore.TypeCheck.defaultValue(layer, '');
            var lyr = this._getLayer(layer);
            if (!Cegore.TypeCheck.isDefined(lyr))
                return;
            return lyr.get(name);
        };
        LabelCollection.prototype.pick = function (p1, p2) {
            var pt;
            /// 传入的是数组 pick([1, 2]);
            if (Cegore.TypeCheck.isArray(p1)) {
                var arr = p1;
                pt = new Cesium.Cartesian2(arr[0], arr[1]);
            }
            /// 传入的是 Cesium.Cartesian2
            else if (p1 instanceof Cesium.Cartesian2) {
                pt = p1;
            }
            /// 传入的是对象 pick({x:1, y:2})
            else if (Cegore.TypeCheck.isObject(p1)) {
                var obj = p1;
                pt = new Cesium.Cartesian2(obj.x, obj.y);
            }
            else {
                pt = new Cesium.Cartesian2(p1, p2);
            }
            ///
            var pickObj = this._czData.scene.pick(pt);
            if (Cegore.TypeCheck.isDefined(pickObj)) {
                var id = Cegore.TypeCheck.defaultValue(pickObj.id, pickObj.primitive.id);
                if ((id instanceof Cesium.Entity) && (id['_zMapRenderable'] instanceof Cegore.Label)) {
                    return id['_zMapRenderable'];
                }
            }
        };
        LabelCollection.prototype.remove = function (p1, p2) {
            var label;
            if (Cegore.TypeCheck.isString(p1)) {
                label = this.get(p1, p2);
            }
            else if (Cegore.TypeCheck.isInstanceOf(p1, Cegore.Label)) {
                label = p1;
            }
            else if (Cegore.TypeCheck.isObject(p1)) {
                label = this.get(p1.name, p1.layer);
            }
            else {
                throw "invaild param!";
            }
            if (!Cegore.TypeCheck.isInstanceOf(label, Cegore.Label)) {
                return;
            }
            /// 
            var entity = label._czRenderable;
            this._czEntities.remove(entity);
            ///
            var layer = this._getLayer(label.layer);
            if (Cegore.TypeCheck.isDefined(layer)) {
                layer.remove(label.name);
            }
        };
        /**
         * 移除标注图层
         *
         * @param {String} layerName 图层的名称
         */
        LabelCollection.prototype.removeLayer = function (layerName) {
            var layer = this._getLayer(layerName);
            if (!Cegore.TypeCheck.isDefined(layer))
                return;
            var labels = layer.keys();
            for (var i = 0; i < labels.length; ++i) {
                var entity = layer.get(labels[i]);
                this._czEntities.remove(entity);
            }
            this._layers.remove(layerName);
        };
        /**
         * 移除所有标注
         */
        LabelCollection.prototype.removeAll = function () {
            this._czEntities.removeAll();
            this._layers.clear();
        };
        /**
         * 移除所有标注
         */
        LabelCollection.prototype.clear = function () {
            this.removeAll();
        };
        return LabelCollection;
    }());
    Cegore.LabelCollection = LabelCollection;
})(Cegore || (Cegore = {}));
/**
 * end of file LabelCollection
 */
/*
 * File of class Scene
 */
var Cegore;
(function (Cegore) {
    /**
     * 场景的显示模式模式
     */
    var SceneMode;
    (function (SceneMode) {
        /**
         * 哥伦布视图模式。
         * 一个2.5D透视视图。
         */
        SceneMode[SceneMode["COLUMBUS_VIEW"] = Cesium.SceneMode.COLUMBUS_VIEW] = "COLUMBUS_VIEW";
        /**
         * 正在变形中
         */
        SceneMode[SceneMode["MORPHING"] = Cesium.SceneMode.MORPHING] = "MORPHING";
        /**
         * 2D模式，使用从上向下的正射投影
         */
        SceneMode[SceneMode["SCENE2D"] = Cesium.SceneMode.SCENE2D] = "SCENE2D";
        /**
         * 3D模式，一个传统的三维透视视图和地球
         */
        SceneMode[SceneMode["SCENE3D"] = Cesium.SceneMode.SCENE3D] = "SCENE3D";
    })(SceneMode = Cegore.SceneMode || (Cegore.SceneMode = {}));
    /**
     * 阴影模式
     */
    var ShadowMode;
    (function (ShadowMode) {
        /**
         * 禁用阴影，不产生也不接受阴影
         */
        ShadowMode[ShadowMode["DISABLED"] = Cesium.ShadowMode.DISABLED] = "DISABLED";
        /**
         * 启用阴影，产生和接受阴影
         */
        ShadowMode[ShadowMode["ENABLED"] = Cesium.ShadowMode.ENABLED] = "ENABLED";
        /**
         * 仅产生阴影
         */
        ShadowMode[ShadowMode["CAST_ONLY"] = Cesium.ShadowMode.CAST_ONLY] = "CAST_ONLY";
        /**
         * 仅接受阴影
         */
        ShadowMode[ShadowMode["RECEIVE_ONLY"] = Cesium.ShadowMode.RECEIVE_ONLY] = "RECEIVE_ONLY";
    })(ShadowMode = Cegore.ShadowMode || (Cegore.ShadowMode = {}));
    /**
     * 场景管理器
     *
     * 场景管理器负责管理所有的三维图形对象和状态，场景管理器不需要直接创建，通过 Viewer.scene 获取场景管理器对象
     *
     * @see
     * Viewer
     */
    var Scene = /** @class */ (function () {
        /**
         * 构造函数，构造一个新的场景对象
         *
         * 不要自己构造 Scene 对象，通过Viewer.scene获取场景对象
         *
         * @param viewer 视图类
         */
        function Scene(viewer) {
            this._isUnderWater = false;
            this._viewer = viewer;
            this._czData = viewer._czdata;
            this._czScene = this._czData.scene;
            this._globe = new Cegore.Globe(this);
            this._labels = new Cegore.LabelCollection(this);
            this._models = new Cegore.ModelCollection(this);
        }
        Object.defineProperty(Scene.prototype, "_czdata", {
            /**
             * @private
             */
            get: function () { return this._czData; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "mode", {
            /**
             * 获取当前场景的显示模式
             */
            get: function () { return this._czScene.mode; },
            /**
             * 设置当前场景的显示模式
             */
            set: function (mode) { this._czScene.mode = mode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "globe", {
            /**
             * 获取全球对象
             */
            get: function () { return this._globe; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "models", {
            /**
             * 获取模型集合
             */
            get: function () { return this._models; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "labels", {
            /**
             * 获取标注集合
             */
            get: function () { return this._labels; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "enableFog", {
            /**
             * 是否启用雾效，默认值：true
             */
            get: function () { return this._czScene.fog.enabled; },
            /**
             * 是否启用雾效，默认值：true
             */
            set: function (enable) { this._czScene.fog.enabled = enable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "fogDensity", {
            /**
             * 雾的浓度，默认值：2.0e-4
             */
            get: function () { return this._czScene.fog.density; },
            /**
             * 雾的浓度，默认值：2.0e-4
             */
            set: function (value) { this._czScene.fog.density = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "enableFXAA", {
            /**
             * 是否启用全屏抗锯齿，默认值：true
             */
            get: function () { return this._czScene.fxaa; },
            /**
             * 是否启用全屏抗锯齿，默认值：true
             */
            set: function (enable) { this._czScene.fxaa = enable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "terrainScale", {
            /**
             * 地形缩放系数
             */
            get: function () { return this._czScene.terrainExaggeration; },
            /**
             * 地形缩放系数
             */
            set: function (scale) { this._czScene.terrainExaggeration = scale; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "preRender", {
            /**
             * 准备绘制事件，事件传递出当前时间
             * 事件原型 <code> function(time) {} </code>
             * @event
             */
            get: function () {
                var _this = this;
                if (!Cegore.TypeCheck.isDefined(this._preRender)) {
                    this._preRender = new Cegore.Event();
                    this._czScene.preRender.addEventListener(function (sc, t) { _this._preRender.fire(Cesium.JulianDate.toDate(t)); });
                }
                return this._preRender;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "postRender", {
            /**
             * 绘制后事件，事件传递出当前时间
             * 事件原型 <code> function(time) {} </code>
             * @event
             */
            get: function () {
                var _this = this;
                if (!Cegore.TypeCheck.isDefined(this._poseRender)) {
                    this._poseRender = new Cegore.Event();
                    this._czScene.poseRender.addEventListener(function (sc, t) { _this._poseRender.fire(Cesium.JulianDate.toDate(t)); });
                }
                return this._poseRender;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "underWater", {
            /**
             * 获取是否水下模式
             */
            get: function () {
                return this._isUnderWater;
            },
            /**
             * 设置是否启用水下模式
             */
            set: function (enable) {
                if (!Cegore.TypeCheck.isDefined(this._UnderWaterMaterial)) {
                    this._UnderWaterMaterial = new Cesium.Material({
                        fabric: {
                            type: 'GlobeFog',
                            uniforms: {
                                fogColor: Cesium.Color.fromBytes(44, 59, 103)
                            },
                            source: Scene._GlobeFog
                        },
                        translucent: function (material) {
                            return false;
                        }
                    });
                }
                if (enable) {
                    this._czScene.globe.material = this._UnderWaterMaterial;
                    var globeps = Cesium._shaders.GlobeFS;
                    var pos = globeps.indexOf("czm_material material = czm_getMaterial(materialInput);\n");
                    globeps = globeps.substr(0, pos) +
                        "materialInput.positionToEyeEC = v_positionEC;\n" +
                        globeps.substr(pos);
                    this._czScene.globe._surfaceShaderSet.baseFragmentShaderSource.sources[1] = globeps;
                }
                else {
                    this._czScene.globe.material = undefined;
                }
                /// 水下模式关闭地形雾效
                this.enableFog = !enable;
                this._isUnderWater = enable;
            },
            enumerable: true,
            configurable: true
        });
        Scene.prototype.pick = function (v0, v1) {
            var pt = Scene.asCartesian2(v0, v1);
            var pickObj = this._czScene.pick(pt);
            if (!Cegore.TypeCheck.isDefined(pickObj))
                return undefined;
            var id = Cegore.TypeCheck.defaultValue(pickObj.id, pickObj.primitive.id);
            if ((id instanceof Cesium.Entity) && (id['_zMapRenderable'] instanceof Cegore.Renderable)) {
                return id['_zMapRenderable'];
            }
            return undefined;
        };
        Scene.prototype.pickMulti = function (v0, v1, max) {
            var picks = [];
            var pt = Scene.asCartesian2(v0, v1);
            var objs = this._czScene.pick(pt);
            if (!Cegore.TypeCheck.isArray(objs))
                return picks;
            for (var i = 0; i < objs.length; ++i) {
                var obj = objs[i];
                var id = Cegore.TypeCheck.defaultValue(objs.id, objs.primitive.id);
                if ((id instanceof Cesium.Entity) && (id['_zMapRenderable'] instanceof Cegore.Renderable)) {
                    picks.push(id['_zMapRenderable']);
                }
            }
            return picks;
        };
        Scene.prototype.pickPosition = function (v0, v1) {
            var pos2d = Scene.asCartesian2(v0, v1);
            var pos3d = this._czScene.pickPosition(pos2d);
            var posgeo = Cesium.Cartographic.fromCartesian(pos3d);
            return new Cegore.Position(posgeo);
        };
        /**
         * 计算平面距离
         *
         * @param pts 点列表，数据格式：
         *  [[x1,y1],[x2,y2],...]
         *  [{x:x1, y:y1}, {x:x2, y:y2}, ...]
         *  [Position, Position, Position]
         *  等
         */
        Scene.prototype.calcDistance = function (pts) {
            return Cegore.GeoMath.surfaceDistance(pts, this._czData.ellipsoid.x);
        };
        /**
         * 计算地球表面上多边形的投影面积
         * @param pts 多边形的点序列，数据格式：
         *  [[x1,y1],[x2,y2],...]
         *  [{x:x1, y:y1}, {x:x2, y:y2}, ...]
         *  [Position, Position, Position]
         *  等
         */
        Scene.prototype.calcArea = function (pts) {
            return Cegore.GeoMath.surfaceArea(pts, this._czData.ellipsoid.x);
        };
        /**
         * 解析二维坐标
         * @param p1
         * @param p2
         */
        Scene.asCartesian2 = function (p1, p2) {
            if (Cegore.TypeCheck.isInstanceOf(p1, Cesium.Cartesian2))
                return p1;
            var x, y;
            switch (Cegore.TypeCheck.typeOf(p1)) {
                case 'number':
                    if (Cegore.TypeCheck.isNumber(p2)) {
                        x = p1;
                        y = p2;
                    }
                    break;
                case 'array':
                    x = Cegore.StringUtil.parseFloat(p1[0]);
                    y = Cegore.StringUtil.parseFloat(p1[1]);
                    break;
                case 'object':
                    x = Cegore.StringUtil.parseFloat(p1.x);
                    y = Cegore.StringUtil.parseFloat(p1.y);
                    break;
            }
            if (!Cegore.TypeCheck.isDefined(x) ||
                !Cegore.TypeCheck.isDefined(y) ||
                isNaN(x) || isNaN(y)) {
                throw 'error params!';
            }
            return new Cesium.Cartesian2(x, y);
        };
        Scene._GlobeFog = "\
        uniform vec4 fogColor;\n\
        czm_material czm_getMaterial(czm_materialInput materialInput)\n\
        {\n\
            czm_material material = czm_getDefaultMaterial(materialInput);\n\
            float distanceToCamera = length(materialInput.positionToEyeEC);\n\
            float scalar = distanceToCamera * 0.00005;\n\
            float fog = 1.0 - exp(-(scalar * scalar));\n\
            material.diffuse = fogColor.rgb;\n\
            material.alpha = fog;\n\
            return material;\n\
        }\n";
        return Scene;
    }());
    Cegore.Scene = Scene;
})(Cegore || (Cegore = {}));
/**
 * End of file
 */ 
/*
 * File of class Viewer
 */
var Cegore;
(function (Cegore) {
    /**
     *
     */
    var CesiumData = /** @class */ (function () {
        function CesiumData(viewer) {
            this.mViewer = viewer;
        }
        Object.defineProperty(CesiumData.prototype, "viewer", {
            get: function () { return this.mViewer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CesiumData.prototype, "scene", {
            get: function () { return this.mViewer.scene; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CesiumData.prototype, "camera", {
            get: function () { return this.mViewer.camera; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CesiumData.prototype, "globe", {
            get: function () { return this.mViewer.scene.globe; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CesiumData.prototype, "ellipsoid", {
            get: function () { return this.mViewer.scene.globe.ellipsoid; },
            enumerable: true,
            configurable: true
        });
        return CesiumData;
    }());
    /**
     * 视图类
     *
     * 用来构建应用最基本的类
     *
     * @example
     * <pre>
     *  var viewer = new Cesium.Viewer('Container', {
     *      /// 指定地形数据
     *      terrain: {
     *          url: 'http://localhost:9081/zs/data/tdt/dem'
     *      },
     *      /// 指定影像数据
     *      images:[{
     *              name : 'TdtImage',
     *              url: 'http://localhost:9081/zs/data/tdtonline/image'
     *          }
     *      ],
     *      /// 指定当前的时间
     *      currentTime: new Date(2017,12,26,12,0,0),
     *      /// 指定是否显示全屏按钮
     *      fullscreenButton: true,
     *      /// 指定全屏显示的DOM
     *      fullscreenElement: 'Container',
     *  });
     */
    var Viewer = /** @class */ (function () {
        /**
         *
         * @param container 用做显示的DOM对象的或者ID
         * @param options 可选的参数
         * @param options.terrain 地形数据源，具体定义参见 Globe.setTerrain()
         * @param options.images 地图影像图层数组，具体定义参见 Globe.addImage()
         * @param options.currentTime 当前时间，默认为系统时间
         * @param options.shadows 是否生成阴影，默认值：false
         * @param options.fullscreenButton 是否显示“全屏显示按钮”，默认值为true
         * @param options.fullscreenElement 用作全屏显示的DOM对象或者ID，默认值为container
         * @param
         */
        function Viewer(container, options) {
            if (!options)
                options = {};
            var defOptions = options.czops || {};
            defOptions.shouldAnimate = options.shouldAnimate ? true : false;
            defOptions.animation = options.animation ? true : false;
            defOptions.baseLayerPicker = options.baseLayerPicker ? true : false;
            defOptions.homeButton = options.homeButton ? true : false;
            defOptions.geocoder = options.geocoder ? true : false;
            defOptions.navigationHelpButton = options.navigationHelpButton ? true : false;
            defOptions.imageryProvider = options.imageryProvider ? true : false;
            defOptions.timeline = options.timeline ? true : false;
            defOptions.sceneModePicker = options.sceneModePicker ? true : false;
            defOptions.selectionIndicator = options.selectionIndicator ? true : false;
            defOptions.infoBox = options.infoBox ? true : false;
            defOptions.fullscreenButton = Cegore.TypeCheck.defaultValue(options.fullscreenButton, true);
            defOptions.fullscreenElement = Cegore.TypeCheck.defaultValue(options.fullscreenElement, container);
            var defContextOpts = defOptions.contextOptions || {};
            var defWebGl = defContextOpts.webgl || {};
            ///
            defWebGl.preserveDrawingBuffer = Cegore.TypeCheck.defaultValue(defWebGl.preserveDrawingBuffer, true);
            ///
            defContextOpts.webgl = defWebGl;
            defOptions.contextOptions = defContextOpts;
            /// 构造Cesium的Viewer
            var czviewer = new Cesium.Viewer(container, defOptions);
            czviewer.cesiumWidget._creditContainer.style.display = "none";
            czviewer.scene.highDynamicRange = Cegore.TypeCheck.defaultValue(options.highDynamicRange, false);
            /// 保存一些对象
            this._czData = new CesiumData(czviewer);
            /// 
            this._camera = new Cegore.Camera(this);
            this._clock = new Cegore.Clock(this);
            this._scene = new Cegore.Scene(this);
            this._controller = new Cegore.CameraController(czviewer.scene);
            this._controller.enableFlatMode = false;
            this._controller.enableInputs = false;
            var ctrl = czviewer.scene.screenSpaceCameraController;
            ctrl.minimumCollisionTerrainHeight = 150000;
            /// 倾斜使用右键拖拽，触摸
            ctrl.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.PINCH];
            /// 缩放使用滚轮，触摸，和左键+Ctrl
            ctrl.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH, {
                    eventType: Cesium.CameraEventType.LEFT_DRAG,
                    modifier: Cesium.KeyboardEventModifier.CTRL
                }];
            ///
            this._cesium_controller = ctrl;
            /// 修改默认操作模式
            if (!window['USE_CESIUM_CAMERA_CONTROLLER']) {
                ///
                this._cesium_controller.enableInputs = false;
                this._controller.enableInputs = true;
                czviewer.scene['_screenSpaceCameraController'] = this._controller;
            }
            /// 初始化地形
            if (Cegore.TypeCheck.isObject(options.terrain)) {
                this.globe.setTerrain(options.terrain);
            }
            /// 初始化图层
            if (Cegore.TypeCheck.isArray(options.images)) {
                for (var i = 0; i < options.images.length; ++i) {
                    this.globe.images.add(options.images[i]);
                }
            }
            if (Cegore.TypeCheck.isDefined(options.currentTime)) {
                this._clock.currentTime = options.currentTime;
            }
        }
        Object.defineProperty(Viewer, "version", {
            /**
             * 获取版本信息
             */
            get: function () { return '1.1.0'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "_czdata", {
            /**
             * @private
             * @inner
             */
            get: function () { return this._czData; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "camera", {
            /**
             * 获取相机
             */
            get: function () { return this._camera; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "scene", {
            /**
             * 获取场景管理器
             */
            get: function () { return this._scene; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "models", {
            /**
             * 获取模型集合
             */
            get: function () { return this._scene.models; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "labels", {
            /**
             * 获取标注集合
             */
            get: function () { return this._scene.labels; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "globe", {
            /**
             * 获取球对象
             */
            get: function () { return this._scene.globe; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "images", {
            /**
             * 获取影像图层
             */
            get: function () { return this.globe.images; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "clock", {
            /**
             * 获取时钟对象
             */
            get: function () { return this._clock; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "canvas", {
            /**
             * 获取用于绘图的Canvas元素
             */
            get: function () { return this._czData.viewer.canvas; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Viewer.prototype, "cameraController", {
            /**
             * 获取控制器
             */
            get: function () { return this._controller; },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取根url
         */
        Viewer.getBaseUrlFromScript = function () {
            var scripts = document.getElementsByTagName('script');
            for (var i = 0, len = scripts.length; i < len; ++i) {
                var src = scripts[i].getAttribute('src');
                var result = Viewer.cesiumScriptRegex.exec(src);
                if (result !== null) {
                    return result[1];
                }
            }
            return undefined;
        };
        /**
         * 自定义cesium脚本路径，否则Cesium会初始化失败
         */
        Viewer.cesiumScriptRegex = /((?:.*\/)|^)depmain[\w-]*\.js(?:\W|$)/i;
        return Viewer;
    }());
    Cegore.Viewer = Viewer;
    CESIUM_BASE_URL = Viewer.getBaseUrlFromScript();
})(Cegore || (Cegore = {}));
var Cegore;
(function (Cegore) {
    /**
     * 抽象影像Provider
     */
    var AbstractImageProvider = /** @class */ (function () {
        function AbstractImageProvider() {
            this._readyPromise = Cesium.when.resolve(true);
            this._tileWidth = 256;
            this._tileHeight = 256;
            this._minimumLevel = 0;
            this._maximumLevel = 18;
            this._errorEvent = new Cesium.Event();
            this._hasAlphaChannel = false;
        }
        ;
        Object.defineProperty(AbstractImageProvider.prototype, "ready", {
            /**
             * 表示当前Provider是否准备好了
             */
            get: function () { return this._ready; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "readyPromise", {
            /**
             * Gets a promise that resolves to true when the provider is ready for use.
             * @memberof ImageryProvider.prototype
             * @type {Promise.<Boolean>}
             * @readonly
             */
            get: function () { return this._readyPromise; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "rectangle", {
            /**
             * 获取数据的范围信息
             */
            get: function () {
                if (!Cegore.TypeCheck.isDefined(this._rectangle))
                    this._rectangle = Cesium.Rectangle.MAX_VALUE;
                ///
                return this._rectangle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "tileWidth", {
            /**
             * 获取每个瓦片的像素宽度
             */
            get: function () { return this._tileWidth; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "tileHeight", {
            /**
             * 获取每个瓦片的像素高度
             */
            get: function () { return this._tileHeight; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "minimumLevel", {
            /**
             * 获取当前Provider支持的最笑级别
             */
            get: function () { return this._minimumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "maximumLevel", {
            /**
             * 获取当前Provider支持的最大级别
             */
            get: function () { return this._maximumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "tilingScheme", {
            /**
             * 获取当前瓦片的切片方案
             */
            get: function () {
                if (!Cegore.TypeCheck.isDefined(this._tilingScheme))
                    this._tilingScheme = new Cesium.GeographicTilingScheme();
                ///
                return this._tilingScheme;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "tileDiscardPolicy", {
            get: function () { return this._tileDiscardPolicy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "errorEvent", {
            get: function () { return this._errorEvent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "credit", {
            get: function () { return this._credit; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "proxy", {
            /**
             * 获取代理信息
             */
            get: function () { return this._proxy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractImageProvider.prototype, "hasAlphaChannel", {
            /**
             * 获取当前图层是否包含透明信息
             */
            get: function () { return this._hasAlphaChannel; },
            enumerable: true,
            configurable: true
        });
        /////////////////
        AbstractImageProvider.prototype.getTileCredits = function (x, y, level) { return undefined; };
        /**
         * 拾取要素数据
         * @param x
         * @param y
         * @param level
         * @param longitude
         * @param latitude
         */
        AbstractImageProvider.prototype.pickFeatures = function (x, y, level, longitude, latitude) { return undefined; };
        return AbstractImageProvider;
    }());
    Cegore.AbstractImageProvider = AbstractImageProvider;
})(Cegore || (Cegore = {}));
/**
 *
 */
var Cegore;
(function (Cegore) {
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('ArcGisMapServer', { createProvider: function (options) {
            return new Cesium.ArcGisMapServerImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('BingMaps', { createProvider: function (options) {
            return new Cesium.BingMapsImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('Grid', { createProvider: function (options) {
            return new Cesium.GridImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('Mapbox', { createProvider: function (options) {
            return new Cesium.MapboxImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('SingleTile', { createProvider: function (options) {
            return new Cesium.SingleTileImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('WMS', { createProvider: function (options) {
            return new Cesium.WebMapServiceImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('WMTS', { createProvider: function (options) {
            return new Cesium.WebMapTileServiceImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('UrlTemplate', { createProvider: function (options) {
            return new Cesium.UrlTemplateImageryProvider(options);
        } });
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('TileCoordinates', { createProvider: function (options) {
            return new Cesium.TileCoordinatesImageryProvider(options);
        } });
})(Cegore || (Cegore = {}));
/*
 * File of class ZMapImageProvider
 */
var Cegore;
(function (Cegore) {
    /**
     * 兆图地服务Provider
     */
    var ZMapImageProvider = /** @class */ (function () {
        /**
         * 构造函数
         * @param opt
         */
        function ZMapImageProvider(opt) {
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
                    throw new Cesium.DeveloperError('requestImage must not be called before the imagery provider is ready.');
                }
                var url = ZMapImageProvider.buildImageUrl(this, x, y, level);
                return Cesium.ImageryProvider.loadImage(this, url);
            };
            var trailingSlashRegex = /\/$/;
            var defaultCredit = new Cesium.Credit('WMTS');
            opt = Cesium.defaultValue(opt, {});
            /// 数据url
            var url = Cesium.defaultValue(opt.url, 'http://localhost:88/wmts');
            if (!trailingSlashRegex.test(url)) {
            }
            this._url = url;
            if (this._url.indexOf('?') == -1) {
                if (!Cegore.StringUtil.endsWidth(this._url, '/tile/map', true))
                    this._url += '/tile/map';
                ///
                this._url += '?';
            }
            ///
            this._url += '&origin=left|top';
            this._proxy = opt.proxy;
            this._tileDiscardPolicy = opt.tileDiscardPolicy;
            this._scheme = Cesium.defaultValue(opt.scheme, 'Geographic');
            if (this._scheme === 'WebMercator') {
                this._tilingScheme = new Cesium.WebMercatorTilingScheme({ ellipsoid: opt.ellipsoid });
            }
            else {
                if (this._scheme.endsWith('level-0'))
                    this._tilingScheme = new Cesium.GeographicTilingScheme({ ellipsoid: opt.ellipsoid });
                else
                    this._tilingScheme = new Cesium.GeographicTilingScheme({
                        ellipsoid: opt.ellipsoid,
                        numberOfLevelZeroTilesX: 8,
                        numberOfLevelZeroTilesY: 4
                    });
            }
            this._tileWidth = 256;
            this._tileHeight = 256;
            this._minimumLevel = Cesium.defaultValue(opt.minimumLevel, 0);
            this._maximumLevel = Cesium.defaultValue(opt.maximumLevel, 18);
            this._rectangle = Cesium.defaultValue(opt.rectangle, this._tilingScheme.rectangle);
            this._errorEvent = new Cesium.Event();
            this._ready = true;
            var credit = Cesium.defaultValue(opt.credit, defaultCredit);
            if (typeof credit === 'string') {
                credit = new Cesium.Credit(credit);
            }
            this._credit = credit;
        }
        Object.defineProperty(ZMapImageProvider.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "hasAlphaChannel", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "proxy", {
            get: function () { return this._proxy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "tileWidth", {
            get: function () { return this._tileWidth; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "tileHeight", {
            get: function () { return this._tileHeight; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "maximumLevel", {
            get: function () { return this._maximumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "minimumLevel", {
            get: function () { return this._minimumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "tilingScheme", {
            get: function () { return this._tilingScheme; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "rectangle", {
            get: function () { return this._rectangle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "ileDiscardPolicy", {
            get: function () { return this._tileDiscardPolicy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "errorEvent", {
            get: function () { return this._errorEvent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "ready", {
            get: function () { return this._ready; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapImageProvider.prototype, "credit", {
            get: function () { return this._credit; },
            enumerable: true,
            configurable: true
        });
        ///
        ZMapImageProvider.buildImageUrl = function (provider, x, y, level) {
            var olevel = level;
            var proxy = provider._proxy;
            if (provider._scheme !== 'WebMercator') {
                if (provider._scheme.endsWith('level-0'))
                    level = level + 1;
                else
                    level = level;
            }
            var rect = new Cegore.Rectangle(provider._tilingScheme.tileXYToRectangle(x, y, olevel));
            var url = provider._url +
                '&id=' + level + ',' + y + ',' + x +
                '&range=' + rect.west + ',' + rect.south + ',' + rect.east + ',' + rect.north;
            if (Cesium.defined(proxy)) {
                url = proxy.getURL(url);
            }
            return url;
        };
        return ZMapImageProvider;
    }());
    /**
     * 兆图地图影像数据服务 Provider 工厂
     */
    var ZMapImageProviderFactory = /** @class */ (function () {
        function ZMapImageProviderFactory() {
        }
        ZMapImageProviderFactory.prototype.createProvider = function (options) {
            return new ZMapImageProvider(options);
        };
        return ZMapImageProviderFactory;
    }());
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('ZMapImage', new ZMapImageProviderFactory());
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of class ZMapImageProvider
 */
var Cegore;
(function (Cegore) {
    /**
     * 兆图地服务Provider
     */
    var ZMapDemImageProvider = /** @class */ (function () {
        /**
         * 构造函数
         * @param opt
         */
        function ZMapDemImageProvider(opt) {
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
                    throw new Cesium.DeveloperError('requestImage must not be called before the imagery provider is ready.');
                }
                var url = this.buildImageUrl(this, x, y, level);
                return Cesium.ImageryProvider.loadImage(this, url);
            };
            var trailingSlashRegex = /\/$/;
            var defaultCredit = new Cesium.Credit('WMTS');
            opt = Cegore.TypeCheck.defaultValue(opt, {});
            /// 数据url
            var url = Cesium.defaultValue(opt.url, 'http://localhost:88/wmts');
            if (!trailingSlashRegex.test(url)) {
            }
            this._url = url;
            if (this._url.indexOf('?') == -1) {
                if (!Cegore.StringUtil.endsWidth(this._url, '/tile/dem', true))
                    this._url += '/tile/dem';
                ///
                this._url += '?';
            }
            ///
            this._url += '&origin=left|top';
            this._proxy = opt.proxy;
            this._scheme = Cesium.defaultValue(opt.scheme, 'Geographic');
            if (this._scheme === 'WebMercator') {
                this._tilingScheme = new Cesium.WebMercatorTilingScheme({ ellipsoid: opt.ellipsoid });
            }
            else {
                if (this._scheme.endsWith('level-0'))
                    this._tilingScheme = new Cesium.GeographicTilingScheme({ ellipsoid: opt.ellipsoid });
                else
                    this._tilingScheme = new Cesium.GeographicTilingScheme({
                        ellipsoid: opt.ellipsoid,
                        numberOfLevelZeroTilesX: 8,
                        numberOfLevelZeroTilesY: 4
                    });
            }
            this._tileWidth = Cegore.TypeCheck.defaultValue(opt.tileWidth, 128);
            this._tileHeight = Cegore.TypeCheck.defaultValue(opt.tileHeight, 128);
            this._minVal = Cegore.TypeCheck.defaultValue(opt.minVal, 0);
            this._maxVal = Cegore.TypeCheck.defaultValue(opt.maxVal, 1000);
            this._minimumLevel = Cesium.defaultValue(opt.minimumLevel, 0);
            this._maximumLevel = Cesium.defaultValue(opt.maximumLevel, 18);
            this._extent = Cesium.defaultValue(opt.extent, this._tilingScheme.extent);
            this._rectangle = Cesium.defaultValue(opt.rectangle, this._tilingScheme.rectangle);
            this._errorEvent = new Cesium.Event();
            this._ready = true;
            var credit = Cesium.defaultValue(opt.credit, defaultCredit);
            if (typeof credit === 'string') {
                credit = new Cesium.Credit(credit);
            }
            this._credit = credit;
        }
        Object.defineProperty(ZMapDemImageProvider.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "hasAlphaChannel", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "proxy", {
            get: function () { return this._proxy; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "tileWidth", {
            get: function () { return this._tileWidth; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "tileHeight", {
            get: function () { return this._tileHeight; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "maximumLevel", {
            get: function () { return this._maximumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "minimumLevel", {
            get: function () { return this._minimumLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "tilingScheme", {
            get: function () { return this._tilingScheme; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "extent", {
            get: function () { return this._extent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "rectangle", {
            get: function () { return this._rectangle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "ileDiscardPolicy", {
            get: function () { return undefined; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "errorEvent", {
            get: function () { return this._errorEvent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "ready", {
            get: function () { return this._ready; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapDemImageProvider.prototype, "credit", {
            get: function () { return this._credit; },
            enumerable: true,
            configurable: true
        });
        ///
        ZMapDemImageProvider.prototype.buildImageUrl = function (provider, x, y, level) {
            var proxy = provider._proxy;
            if (provider._scheme !== 'WebMercator') {
                if (provider._scheme.endsWith('level-0'))
                    level = level + 1;
                else
                    level = level;
            }
            var rectangle = this._tilingScheme.tileXYToRectangle(x, y, level);
            var xSpacing = (rectangle.east - rectangle.west) / (this._tileWidth - 1);
            var ySpacing = (rectangle.north - rectangle.south) / (this._tileHeight - 1);
            var bbox = [
                Cesium.Math.toDegrees(rectangle.west),
                Cesium.Math.toDegrees(rectangle.south),
                Cesium.Math.toDegrees(rectangle.east),
                Cesium.Math.toDegrees(rectangle.north)
            ];
            var url = this._url;
            url += '&id=' + level + ',' + y + ',' + x;
            url += '&size=' + this._tileWidth + '%2C' + this._tileHeight;
            url += '&range=' + bbox.join(',');
            url += '&style=image&min=' + this._minVal + '&max=' + this._maxVal;
            ///
            return url;
        };
        return ZMapDemImageProvider;
    }());
    /**
     * 兆图地图影像数据服务 Provider 工厂
     */
    var ZMapImageProviderFactory = /** @class */ (function () {
        function ZMapImageProviderFactory() {
        }
        ZMapImageProviderFactory.prototype.createProvider = function (options) {
            return new ZMapDemImageProvider(options);
        };
        return ZMapImageProviderFactory;
    }());
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('ZMapDemImage', new ZMapImageProviderFactory());
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
/*
 * File of Class
 */
var Cegore;
(function (Cegore) {
    /**
     * 兆图地形数据源
     */
    var ZMapTerrainProvider = /** @class */ (function () {
        ///
        function ZMapTerrainProvider(options) {
            this._tileWidth = 65;
            this._tileHeight = 65;
            this._heightOffset = 0;
            /// 
            this._qmesh = true;
            this._clipHeight = 0;
            this._clipWall = true;
            this._clipFloor = true;
            this._url = options.url;
            if (this._url.indexOf('?') == -1) {
                if (!Cegore.StringUtil.endsWidth(this._url, '/tile/dem', true))
                    this._url += '/tile/dem';
                ///
                this._url += '?';
            }
            ///
            this._url += '&origin=left|top';
            this._token = options.token;
            this._qmesh = Cegore.TypeCheck.defaultValue(options.qmesh, false);
            this._clip = options.clip;
            this._clipHeight = Cegore.TypeCheck.defaultValue(options.clipHeight, 0);
            this._clipFloor = Cegore.TypeCheck.defaultValue(options.clipFloor, true);
            this._clipWall = Cegore.TypeCheck.defaultValue(options.clipWall, true);
            this._waterMask = Cegore.TypeCheck.defaultValue(options.waterMask, false);
            this._waterHeight = Cegore.TypeCheck.defaultValue(options.waterHeight, 0);
            /// 瓦片的高宽
            this._tileWidth = Cegore.TypeCheck.defaultValue(options.tileWidth, 20);
            this._tileHeight = Cegore.TypeCheck.defaultValue(options.tileHeight, 20);
            ///
            this._heightOffset = Cegore.TypeCheck.defaultValue(options.heightOffset, 0);
            this._tilingScheme = options.tilingScheme;
            if (!Cesium.defined(this._tilingScheme)) {
                this._tilingScheme = new Cesium.GeographicTilingScheme({
                    ellipsoid: Cesium.defaultValue(options.ellipsoid, Cesium.Ellipsoid.WGS84)
                });
            }
            this._levelZeroMaximumGeometricError = 62617.21357121639;
            //this._levelZeroMaximumGeometricError = Cesium.TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(
            //    this._tilingScheme.ellipsoid, this._tileWidth, this._tilingScheme.getNumberOfXTilesAtLevel(0));
            this._proxy = options.proxy;
            this._dataStruct = {
                heightScale: 1,
                heightOffset: this._heightOffset,
                elementsPerHeight: 1,
                stride: 1,
                elementMultiplier: 256.0,
                isBigEndian: false
            };
            this._errorEvent = new Cesium.Event();
            var credit = options.credit;
            if (typeof credit === 'string') {
                credit = new Cesium.Credit(credit);
            }
            this._credit = credit;
            this._readyPromise = Cesium.when.resolve(true);
        }
        Object.defineProperty(ZMapTerrainProvider.prototype, "errorEvent", {
            /**
             * Gets an event that is raised when the terrain provider encounters an asynchronous error.  By subscribing
             * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
             * are passed an instance of {@link TileProviderError}.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {Event}
             */
            get: function () { return this._errorEvent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapTerrainProvider.prototype, "credit", {
            /**
             * Gets the credit to display when this terrain provider is active.  Typically this is used to credit
             * the source of the terrain.  This function should not be called before {@link ArcGisImageServerTerrainProvider#ready} returns true.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {Credit}
             */
            get: function () { return this._credit; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapTerrainProvider.prototype, "tilingScheme", {
            /**
             * Gets the tiling scheme used by this provider.  This function should
             * not be called before {@link ArcGisImageServerTerrainProvider#ready} returns true.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {GeographicTilingScheme}
             */
            get: function () { return this._tilingScheme; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapTerrainProvider.prototype, "ready", {
            /**
             * Gets a value indicating whether or not the provider is ready for use.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {Boolean}
             */
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapTerrainProvider.prototype, "readyPromise", {
            /**
             * Gets a promise that resolves to true when the provider is ready for use.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {Promise.<Boolean>}
             * @readonly
             */
            get: function () { return this._readyPromise; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapTerrainProvider.prototype, "hasWaterMask", {
            /**
             * Gets a value indicating whether or not the provider includes a water mask.  The water mask
             * indicates which areas of the globe are water rather than land, so they can be rendered
             * as a reflective surface with animated waves.  This function should not be
             * called before {@link ArcGisImageServerTerrainProvider#ready} returns true.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {Boolean}
             */
            get: function () { return this._waterMask; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZMapTerrainProvider.prototype, "hasVertexNormals", {
            /**
             * Gets a value indicating whether or not the requested tiles include vertex normals.
             * This function should not be called before {@link ArcGisImageServerTerrainProvider#ready} returns true.
             * @memberof ArcGisImageServerTerrainProvider.prototype
             * @type {Boolean}
             */
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        /**
         * Requests the geometry for a given tile.  This function should not be called before
         * {@link ArcGisImageServerTerrainProvider#ready} returns true.  The result includes terrain
         * data and indicates that all child tiles are available.
         *
         * @param {Number} x The X coordinate of the tile for which to request geometry.
         * @param {Number} y The Y coordinate of the tile for which to request geometry.
         * @param {Number} level The level of the tile for which to request geometry.
         * @returns {Promise.<TerrainData>|undefined} A promise for the requested geometry.  If this method
         *          returns undefined instead of a promise, it is an indication that too many requests are already
         *          pending and the request will be retried later.
         */
        ZMapTerrainProvider.prototype.requestTileGeometry = function (x, y, level, request) {
            var _this = this;
            var rectangle = this._tilingScheme.tileXYToRectangle(x, y, level);
            // Each pixel in the heightmap represents the height at the center of that
            // pixel.  So expand the rectangle by half a sample spacing in each direction
            // so that the first height is on the edge of the rectangle we need rather than
            // half a sample spacing into the rectangle.
            var xSpacing = (rectangle.east - rectangle.west) / (this._tileWidth - 1);
            var ySpacing = (rectangle.north - rectangle.south) / (this._tileHeight - 1);
            rectangle.west -= xSpacing * 0.5;
            rectangle.east += xSpacing * 0.5;
            rectangle.south -= ySpacing * 0.5;
            rectangle.north += ySpacing * 0.5;
            var bbox = [
                Cesium.Math.toDegrees(rectangle.west),
                Cesium.Math.toDegrees(rectangle.south),
                Cesium.Math.toDegrees(rectangle.east),
                Cesium.Math.toDegrees(rectangle.north)
            ];
            var url = this._url;
            url += '&id=' + level + ',' + y + ',' + x;
            url += '&size=' + this._tileWidth + '%2C' + this._tileHeight;
            url += '&range=' + bbox.join(',');
            url += '&style=' + (this._qmesh ? 'qmesh' : 'float');
            if (this._qmesh && this._clip) {
                url += '&clip=' + this._clip;
                url += '&clip-h=' + this._clipHeight;
                url += '&clip-wall=' + this._clipWall;
                url += '&clip-floor' + this._clipFloor;
            }
            var proxy = this._proxy;
            if (Cesium.defined(proxy)) {
                url = proxy.getURL(url);
            }
            var promise = Cesium.Resource.fetchArrayBuffer({ url: url, request: request });
            if (!Cesium.defined(promise)) {
                return undefined;
            }
            ///var that = this;
            return Cesium.when(promise, function (image) {
                if (_this._qmesh)
                    return _this.loadQMesh(image, x, y, level);
                return _this.loadHeightmap(image);
            });
        };
        /**
         * Gets the maximum geometric error allowed in a tile at a given level.
         *
         * @param {Number} level The tile level for which to get the maximum geometric error.
         * @returns {Number} The maximum geometric error.
         */
        ZMapTerrainProvider.prototype.getLevelMaximumGeometricError = function (level) {
            return this._levelZeroMaximumGeometricError / (1 << level);
        };
        /**
         * Determines whether data for a tile is available to be loaded.
         *
         * @param {Number} x The X coordinate of the tile for which to request geometry.
         * @param {Number} y The Y coordinate of the tile for which to request geometry.
         * @param {Number} level The level of the tile for which to request geometry.
         * @returns {Boolean} Undefined if not supported, otherwise true or false.
         */
        ZMapTerrainProvider.prototype.getTileDataAvailable = function (x, y, level) {
            return undefined;
        };
        ZMapTerrainProvider.prototype.loadHeightmap = function (image) {
            var length = this._tileWidth * this._tileHeight;
            var byteFloatNum = length * 4;
            var byteDoubelNum = length * 8;
            var water, buffer;
            ///
            if (this._waterMask)
                water = new Uint8Array(length);
            if (image.byteLength == byteFloatNum) {
                buffer = new Float32Array(image);
                for (var i = 0; i < length; ++i) {
                    if (buffer[i] <= -100000)
                        buffer[i] = 0;
                }
            }
            else if (image.byteLength == byteDoubelNum) {
                /// 处理无效值
                buffer = new Float32Array(length);
                var data = new Float64Array(image);
                for (var i = 0; i < length; ++i) {
                    buffer[i] = data[i];
                    if (data[i] <= -100000)
                        buffer[i] = 0;
                }
            }
            else {
                buffer = new Float32Array(length);
            }
            if (this._waterMask) {
                for (var i = 0; i < length; ++i) {
                    if (buffer[i] < this._waterHeight)
                        water[i] = 255;
                    else
                        water[i] = 0;
                }
            }
            return new Cesium.HeightmapTerrainData({
                buffer: buffer,
                width: this._tileWidth,
                height: this._tileWidth,
                childTileMask: 15,
                waterMask: water,
                structure: this._dataStruct
            });
        };
        ZMapTerrainProvider.prototype.loadQMesh = function (image, x, y, level) {
            var pos = 0;
            var cartesian3Elements = 3;
            var boundingSphereElements = cartesian3Elements + 1;
            var cartesian3Length = Float64Array.BYTES_PER_ELEMENT * cartesian3Elements;
            var boundingSphereLength = Float64Array.BYTES_PER_ELEMENT * boundingSphereElements;
            var encodedVertexElements = 3;
            var encodedVertexLength = Uint16Array.BYTES_PER_ELEMENT * encodedVertexElements;
            var triangleElements = 3;
            var bytesPerIndex = Uint16Array.BYTES_PER_ELEMENT;
            var triangleLength = bytesPerIndex * triangleElements;
            var view = new DataView(image);
            /// 中心坐标
            var center = readCartesian3(view, pos);
            pos += cartesian3Length;
            /// 
            var range = [
                view.getFloat64(pos, true),
                view.getFloat64(pos + 8, true),
                view.getFloat64(pos + 16, true),
                view.getFloat64(pos + 24, true),
            ];
            pos += Float64Array.BYTES_PER_ELEMENT * 4;
            /// 最小最大高程
            var minimumHeight = view.getFloat32(pos, true);
            pos += Float32Array.BYTES_PER_ELEMENT;
            var maximumHeight = view.getFloat32(pos, true);
            pos += Float32Array.BYTES_PER_ELEMENT;
            /// 包围球
            var boundingSphere = new Cesium.BoundingSphere(readCartesian3(view, pos), view.getFloat64(pos + cartesian3Length, true));
            pos += boundingSphereLength;
            /// 水平遮挡点
            var horizonOcclusionPoint = readCartesian3(view, pos);
            pos += cartesian3Length;
            /// 顶点数据
            var vertexCount = view.getUint32(pos, true);
            pos += Uint32Array.BYTES_PER_ELEMENT;
            var encodedVertexBuffer = new Uint16Array(image, pos, vertexCount * 3);
            pos += vertexCount * encodedVertexLength;
            /// 索引数据
            var indices = readIndices(view, pos, triangleElements);
            pos += Uint32Array.BYTES_PER_ELEMENT + indices.byteLength;
            /// 边界数据
            var westIndices = readIndices(view, pos, 1);
            pos += Uint32Array.BYTES_PER_ELEMENT + westIndices.byteLength;
            var southIndices = readIndices(view, pos, 1);
            pos += Uint32Array.BYTES_PER_ELEMENT + southIndices.byteLength;
            var eastIndices = readIndices(view, pos, 1);
            pos += Uint32Array.BYTES_PER_ELEMENT + eastIndices.byteLength;
            var northIndices = readIndices(view, pos, 1);
            pos += Uint32Array.BYTES_PER_ELEMENT + northIndices.byteLength;
            var skirtHeight = this.getLevelMaximumGeometricError(level) * 5.0;
            var rectangle = this._tilingScheme.tileXYToRectangle(x, y, level);
            var orientedBoundingBox;
            if (rectangle.width < Cesium.Math.PI_OVER_TWO + Cesium.Math.EPSILON5) {
                // Here, rectangle.width < pi/2, and rectangle.height < pi
                // (though it would still work with rectangle.width up to pi)
                // The skirt is not included in the OBB computation. If this ever
                // causes any rendering artifacts (cracks), they are expected to be
                // minor and in the corners of the screen. It's possible that this
                // might need to be changed - just change to `minimumHeight - skirtHeight`
                // A similar change might also be needed in `upsampleQuantizedTerrainMesh.js`.
                orientedBoundingBox = Cesium.OrientedBoundingBox.fromRectangle(rectangle, minimumHeight, maximumHeight, this._tilingScheme.ellipsoid);
            }
            return new Cesium.QuantizedMeshTerrainData({
                //center : center,
                minimumHeight: minimumHeight,
                maximumHeight: maximumHeight,
                boundingSphere: boundingSphere,
                orientedBoundingBox: orientedBoundingBox,
                horizonOcclusionPoint: horizonOcclusionPoint,
                quantizedVertices: encodedVertexBuffer,
                //encodedNormals : encodedNormalBuffer,
                indices: indices,
                westIndices: westIndices,
                southIndices: southIndices,
                eastIndices: eastIndices,
                northIndices: northIndices,
                westSkirtHeight: skirtHeight,
                southSkirtHeight: skirtHeight,
                eastSkirtHeight: skirtHeight,
                northSkirtHeight: skirtHeight,
                childTileMask: 15 //this.availability.computeChildMaskForTile(level, x, y),
                //waterMask: waterMaskBuffer,
                //credits: this._tileCredits
            });
        };
        return ZMapTerrainProvider;
    }());
    function readCartesian3(view, pos) {
        return new Cesium.Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
    }
    function readIndices(view, pos, elements) {
        var iCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        return new Uint16Array(view.buffer, pos, iCount * elements);
    }
    /**
     * 兆图地形服务Provider工厂
     */
    var ZMapTerrainProviderFactory = /** @class */ (function () {
        function ZMapTerrainProviderFactory() {
        }
        ZMapTerrainProviderFactory.prototype.createProvider = function (options) {
            return new ZMapTerrainProvider(options);
        };
        return ZMapTerrainProviderFactory;
    }());
    /** 注册工厂 */
    Cegore.Providers.TerrainProviders.regFactory('ZMapTerrain', new ZMapTerrainProviderFactory());
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
var Cegore;
(function (Cegore) {
    /**
     * 兆图地服务Provider
     */
    var HeatmapImageProvider = /** @class */ (function (_super) {
        __extends(HeatmapImageProvider, _super);
        /**
         * 构造函数
         * @param options
         * @param options.data 热力图数据，数据中必须包含坐标和热度信息
         * @param options.xField X坐标字段名称
         * @param options.yField Y坐标字段名称
         * @param options.weightField 热度字段
         * @param options.weightScale 热度缩放参数
         * @param options.weightCalc 热度计算器
         */
        function HeatmapImageProvider(options) {
            var _this = _super.call(this) || this;
            _this._weightScale = 1.0;
            _this._shadow = 250;
            ///
            options = Cesium.defaultValue(options, {});
            ///
            _this._xfield = options.xField;
            _this._yfield = options.yField;
            _this._weightField = options.weightField;
            _this._weightScale = Cesium.defaultValue(options.weightScale, 1.0);
            _this._weightCalc = options.weightCalc;
            _this._tilingScheme = new Cesium.GeographicTilingScheme();
            _this._minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
            _this._maximumLevel = Cesium.defaultValue(options.maximumLevel, 18);
            _this._hasAlphaChannel = true;
            ///
            _this.initData(options.data);
            _this.setBlurRadius(options.blur, options.radius);
            _this.setGradient(options.gradient);
            return _this;
        }
        /**
         * 设置模糊半径
         * @param blur
         * @param radius
         */
        HeatmapImageProvider.prototype.setBlurRadius = function (blur, radius) {
            this._blur = Cegore.TypeCheck.defaultValue(blur, 15);
            this._radius = Cegore.TypeCheck.defaultValue(radius, 8);
            this._circleImage = this.createCircle();
        };
        /**
         * 设置色阶
         * @param gradient
         */
        HeatmapImageProvider.prototype.setGradient = function (gradient) {
            this._gradient = Cegore.TypeCheck.defaultValue(gradient, HeatmapImageProvider.DEFAULT_GRADIENT);
            this._colorTable = this.createGradientColorTable(this._gradient);
        };
        /**
         * 初始化数据
         * @param data
         */
        HeatmapImageProvider.prototype.initData = function (data) {
            this._data = [];
            var rect = new Cegore.Rectangle();
            for (var i = 0; i < data.length; ++i) {
                var o = data[i];
                var v = {
                    x: this.xCoord(o),
                    y: this.yCoord(o),
                    v: this.value(o)
                };
                this._data.push(v);
                rect.merge(v.x, v.y);
            }
            this._rectangle = rect.toCZRectangle();
            this._ready = true;
        };
        /**
         * 给定一个字段列表，获取对象的属性
         * @param o
         * @param fields
         * @param def
         */
        HeatmapImageProvider.fieldsValue = function (o, fields, def) {
            var value = Cegore.TypeCheck.defaultValue(def, 0);
            for (var i = 0; i < fields.length; ++i) {
                var f = fields[i];
                if (!Cegore.TypeCheck.isDefined(f))
                    continue;
                value = o[f];
                if (Cegore.TypeCheck.isDefined(value))
                    break;
            }
            if (!Cegore.TypeCheck.isNumber(value))
                value = Cegore.StringUtil.parseFloat(value);
            return value;
        };
        HeatmapImageProvider.prototype.xCoord = function (o) {
            return HeatmapImageProvider.fieldsValue(o, [this._xfield, 'x', 'X']);
        };
        HeatmapImageProvider.prototype.yCoord = function (o) {
            return HeatmapImageProvider.fieldsValue(o, [this._yfield, 'y', 'Y']);
        };
        HeatmapImageProvider.prototype.value = function (o) {
            if (Cegore.TypeCheck.isFunction(this._weightCalc))
                return this._weightCalc(o);
            else
                return HeatmapImageProvider.fieldsValue(o, [this._weightField, 'value', 'Value', 'VALUE']);
        };
        /**
         * 创建色表变化
         */
        HeatmapImageProvider.prototype.createGradientColorTable = function (colors) {
            var width = 1;
            var height = 256;
            var context = Cegore.DOM.createContext2D(width, height);
            var gradient = context.createLinearGradient(0, 0, width, height);
            var step = 1 / (colors.length - 1);
            for (var i = 0, ii = colors.length; i < ii; ++i) {
                gradient.addColorStop(i * step, colors[i]);
            }
            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
            return context.getImageData(0, 0, width, height).data;
        };
        ;
        /**
         * 创建子图
         */
        HeatmapImageProvider.prototype.createCircle = function () {
            var radius = this._radius;
            var blur = this._blur;
            var halfSize = radius + blur + 1;
            var size = 2 * halfSize;
            var context = Cegore.DOM.createContext2D(size, size);
            context.shadowOffsetX = context.shadowOffsetY = this._shadow;
            context.shadowBlur = blur;
            context.shadowColor = '#000';
            context.beginPath();
            var center = halfSize - this._shadow;
            context.arc(center, center, radius, 0, Math.PI * 2, true);
            context.fill();
            return context.canvas;
        };
        ;
        /**
         * 请求图像数据
         */
        HeatmapImageProvider.prototype.requestImage = function (x, y, level) {
            var ctx = Cegore.DOM.createContext2D(this.tileWidth, this.tileHeight);
            var canvas = ctx.canvas;
            var circle = this._circleImage;
            var hw = circle.width / 2;
            var hh = circle.height / 2;
            var pos = new Cegore.Position();
            var rect = new Cegore.Rectangle(this.tilingScheme.tileXYToRectangle(x, y, level));
            var gwidth = rect.width;
            var gheight = rect.height;
            var checkRect = rect.clone();
            checkRect.inflate(rect.width / 2, rect.height / 2);
            for (var i = 0; i < this._data.length; ++i) {
                var o = this._data[i];
                pos.set(o.x, o.y);
                if (!checkRect.contains(pos))
                    continue;
                var ix = (o.x - rect.minx) / gwidth * canvas.width;
                var iy = (rect.maxy - o.y) / gheight * canvas.height;
                ctx.globalAlpha = o.v * this._weightScale;
                ctx.drawImage(circle, ix - hw, iy - hh);
            }
            var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var view8 = image.data;
            var alpha;
            for (var i = 0, ii = view8.length; i < ii; i += 4) {
                alpha = view8[i + 3] * 4;
                if (alpha) {
                    view8[i] = this._colorTable[alpha];
                    view8[i + 1] = this._colorTable[alpha + 1];
                    view8[i + 2] = this._colorTable[alpha + 2];
                }
            }
            ctx.putImageData(image, 0, 0);
            ///
            return canvas;
        };
        HeatmapImageProvider.DEFAULT_GRADIENT = ['#00f', '#0ff', '#0f0', '#ff0', '#f00'];
        return HeatmapImageProvider;
    }(Cegore.AbstractImageProvider));
    /**
     * 兆图地图影像数据服务 Provider 工厂
     */
    var HeatmapImageProviderFactory = /** @class */ (function () {
        function HeatmapImageProviderFactory() {
        }
        HeatmapImageProviderFactory.prototype.createProvider = function (options) {
            return new HeatmapImageProvider(options);
        };
        return HeatmapImageProviderFactory;
    }());
    /** 注册工厂 */
    Cegore.Providers.ImageProviders.regFactory('Heatmap', new HeatmapImageProviderFactory());
})(Cegore || (Cegore = {}));
/*
 * File of class ZMapModelLoader
 */
var Cegore;
(function (Cegore) {
    var ZMapModelLoader = /** @class */ (function () {
        function ZMapModelLoader() {
        }
        ZMapModelLoader.LoadModel = function (url, mg, item, options) {
            var offset = new Cegore.Position(options.offset);
            var pos = item.pos.split(',');
            pos[0] = parseFloat(pos[0]) + offset.x;
            pos[1] = parseFloat(pos[1]) + offset.y;
            pos[2] = parseFloat(pos[2]) + offset.z;
            url = url + '/model?style=glb&id=' + encodeURIComponent(item.model);
            var model = new Cegore.GltfModel({
                name: item.name,
                uri: url,
                position: pos,
                minPixelSize: 10
            });
            mg.add(model);
        };
        /**
         * 加载发布的模型数据
         * @param name
         * @param url
         * @param options
         */
        ZMapModelLoader.LoadFromPubModel = function (name, url, options) {
            var mg = new Cegore.ModelGroup({ name: name });
            Cegore.LoadWithXhr.loadJSON({
                url: url + '/model?filter=detail',
                success: function (data) {
                    for (var i = 0; i < data.items.length; ++i) {
                        ZMapModelLoader.LoadModel(url, mg, data.items[i], options);
                    }
                }
            });
            return mg;
        };
        return ZMapModelLoader;
    }());
    Cegore.ZMapModelLoader = ZMapModelLoader;
})(Cegore || (Cegore = {}));
/**
 * end of file
 */ 
//# sourceMappingURL=zmap.cegore.js.map