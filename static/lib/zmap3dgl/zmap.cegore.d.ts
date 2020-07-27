/**
 * Cegore
 *
 * 根命名空间，所有Cegore库都会存在于该命名空间
 */
declare namespace Cegore {
    var Version: number;
}
/**
 * end of file
 */
declare namespace Cegore {
    /**
     * 类 TypeCheck
     *
     * 用于JavaScript 类型检查
     *
     */
    class TypeCheck {
        /**
         * 返回值或者默认值
         *
         * 判断一个值是否定义，如果定义则，返回这个值，否则返回默认值
         *
         * @param value 待判断的值
         * @param default 默认值
         */
        static defaultValue(value: any, defaut: any): any;
        /**
         * 判断一个变量是否定义
         *
         * @param value 代判断的值
         * @returns 是否定义
         */
        static isDefined(value: any): boolean;
        /**
         * 判断一个变量是否为null
         */
        static isNull(value: any): boolean;
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
        static typeOf(value: any): string;
        /**
         * 判断是否为函数
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个函数，否则false.
         */
        static isFunction(value: any): boolean;
        /**
         * 判断是否为函数
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        static isString(value: any): boolean;
        /**
         * 判断是否为数字
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        static isNumber(value: any): boolean;
        /**
         * 判断是否为对象
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        static isObject(value: any): boolean;
        /**
         * 判断是否为布尔值
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        static isBool(value: any): boolean;
        /**
         * 判断是否为数组
         *
         * @param value 要测试的对象
         * @returns 返回true表测试对象是一个字符串对象，否则false.
         */
        static isArray(value: any): boolean;
        /**
         * 判断是否为某类型
         *
         * @param val
         * @param type
         */
        static isInstanceOf(val: any, type: any): boolean;
        private static _freezeObject;
        /**
         * 冻结对象
         *
         * 同Object.freeze，兼容不支持该接口的浏览器
         * @param o 要冻结的对象
         * @return 冻结后的对象
         */
        static freezeObject(o: any): any;
    }
}
declare namespace Cegore {
    /**
     * 提供Map容器的基本功能
     */
    class HashMap<T> {
        private _data;
        private _creator;
        /**
         * 构造一个新的Map<T>对象
         * @param creator 构造器，当获取的值不存在时，且没有指定默认值，则通过构造器创建默认值
         */
        constructor(creator?: any);
        /**
         * 获取值
         *
         * @param {string} key 要获取的key值
         * @param {T} def 当获取的值为null时，指定默认值
         *
         * @return {T} 返回获取到的值或者 undefined
         */
        getOrCreate(key: string, def?: T): T;
        /**
         * 获取 Map 中键为 key的对象
         * @param key 键值
         * @return {any|undefined}
         */
        get(key: string): T;
        /**
         * 设置值
         *
         * @param {string} key 设置的key值
         * @param {T} val 设置的val值
         */
        put(key: string, val: T): void;
        /**
         * 根据值获取对应的key
         *
         * @param {T} val 要获取key 的值对象
         */
        key(val: T): string;
        /**
         * 获取所有的key
         */
        keys(): any[];
        /**
         * 判断指定的元素是否存在
         */
        exist(key: string): boolean;
        /**
         * 移除指定的元素
         */
        remove(key: string): void;
        /**
         * 移除所有元素
         */
        clear(): void;
        /**
         * 移除所有元素
         */
        removeAll(): void;
    }
}
declare namespace Cegore {
    /**
     * 字符串处理辅助类
     */
    class StringUtil {
        /**
         * 判断一个字符串是否以指定的字符串开始
         *
         * @param str 待判断的字符串
         * @param pattern 字符串样式
         * @param ignoreCase 是否忽略大小写
         */
        static startsWidth(str: string, pattern: string, ignoreCase?: boolean): boolean;
        /**
         * 判断一个字符串是否以指定的字符串结束
         *
         * @param str 待判断的字符串
         * @param pattern 字符串样式
         * @param ignoreCase 是否忽略大小写
         */
        static endsWidth(str: string, pattern: string, ignoreCase?: boolean): boolean;
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
        static parseInt(value: any, def?: any, radix?: any): any;
        /**
         * 解析整数，js parseFloat函数的增强版
         *      解析输入数据为一个整数
         *      如果输入值不是一个数值，则返回默认值
         *      如果未指定默认值，则返回0
         *
         * @param {String} value 要解析的对象
         * @param {Number} def 默认值
         */
        static parseFloat(value: any, def?: any): any;
    }
}
/**
 * End of file
 */ 
declare namespace Cegore {
    /**
     * @class
     */
    class ArrayUtil {
        /**
         * 查找数组，但可以自定义比较函数
         * @param item 查询的对象
         * @param array 查询到数组
         * @param cmp 比较函数
         */
        static indexOf(item: any, array: any[], cmp: any): number;
        /**
         * 一个空的数组，不可修改
         */
        static readonly EmptyArray: any;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 使用 xhr 加载数据
     */
    class LoadWithXhr {
        static loadWithXhr(options: any): void;
        /**
         * 使用xhr加载json数据
         *
         * @param options
         */
        static loadJSON(options: any): void;
        private static onPromise;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    class DOM {
        static createContext2D(width: number, height: number): CanvasRenderingContext2D;
    }
}
declare namespace Cegore {
    /**
     * 一个二维的点或者向量
     */
    class Vector2 {
        /**
         * x坐标值
         */
        x: number;
        /**
         * y坐标值
         */
        y: number;
        /**
         * 构造一个新的对象
         */
        constructor();
        /**
         * 通过x和y构造Vector2
         * @param x x坐标
         * @param y y坐标
         */
        constructor(x: number, y: number);
        /**
         * 通过数组构建Vector2
         * @param xyArray xy坐标数组
         */
        constructor(xyArray: number[]);
        /**
         * 通过包含x和y属性的对象构建Vector2
         * @param xyObj 包含x和y属性的对象
         */
        constructor(xyObj: {
            x: number;
            y: number;
        });
        /**
         * 获取当前向量的长度（点到原点的距离）
         */
        readonly length: number;
        /**
         * 向量的权重，同length
         */
        readonly magnitude: number;
        /**
         * 获取向量长度的平方，用于不需要知道实际长度的情况下，避免进行开方运算
         */
        readonly squaredLength: number;
        /**
         * 通过x和y设置Vector2对象
         * @param x x坐标
         * @param y y坐标
         */
        set(x: number, y: number): any;
        /**
         * 通过数组设置Vector2
         * @param xyArray xy坐标数组
         */
        set(xyArray: number[]): any;
        /**
         * 通过包含x和y属性的对象设置Vector2
         * @param xyObj 包含x和y属性的对象
         */
        set(xyObj: {
            x: number;
            y: number;
        }): any;
        /**
         * 复制当前对象
         * @param result 一个可选的参数，用来存储输出结果
         * @returns 复制的对象
         */
        clone(result?: Vector2): Vector2;
        /**
         * 判断当前对象和指定的对象是否相等
         * @param right
         */
        equals(right?: Vector2): boolean;
        /**
         * 返回如下格式的字符串 '(x,y)'
         */
        toString(): string;
        /**
         * @private
         */
        _asCzVector2(): any;
        /**
         * 计算两个向量的距离
         * @param left
         * @param right
         */
        static distance(left: Vector2, right: Vector2): number;
        /**
         * 计算两个向量距离的平方
         * @param left
         * @param right
         */
        static squaredDistance(left: Vector2, right: Vector2): number;
        /**
         * 复制传入的对象
         * @param target 要复制的对象
         * @param result 可选的对象，用于存储复制结果
         */
        static clone(target: Vector2, result?: Vector2): Vector2;
        /**
         * 比较两个对象是否相等
         */
        static equals(left: Vector2, right: Vector2): boolean;
        /**
         * 计算两个向量的和
         * @param left
         * @param right
         * @param result
         */
        static add(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 计算两个向量的差
         * @param left
         * @param right
         * @param result
         */
        static sub(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 计算向量与标量的乘积
         * @param left
         * @param scalar
         * @param result
         */
        static mul(left: Vector2, scalar: number, result?: Vector2): Vector2;
        /**
         * 计算两个向量的乘积
         * @param left
         * @param right
         * @param result
         */
        static mul(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 计算向量与标量的商
         * @param left
         * @param scalar
         * @param result
         */
        static div(left: Vector2, scalar: number, result?: Vector2): Vector2;
        /**
         * 计算两个向量的商
         * @param left
         * @param right
         * @param result
         */
        static div(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 对当前向量取反
         * @param target
         * @param result
         */
        static negate(target: Vector2, result?: Vector2): Vector2;
        /**
         * 计算两个向量的点积（点乘）
         * @param left
         * @param right
         */
        static dot(left: Vector2, right: Vector2): number;
        /**
         * 计算两个向量的叉积（叉乘）
         * @param left
         * @param right
         */
        static cross(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 归一化向量
         * @param target
         * @param result
         */
        static normalize(target: Vector2, result?: Vector2): Vector2;
        /**
         * 计算两个点的中点
         * @param left
         * @param right
         * @param result
         */
        static middle(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 计算两个向量每个分量的最小值
         * @param left
         * @param right
         * @param result
         */
        static floor(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        /**
         * 计算两个向量每个分量的最大值
         * @param left
         * @param right
         * @param result
         */
        static ceil(left: Vector2, right: Vector2, result?: Vector2): Vector2;
        private static _LerpStart;
        private static _LerpEnd;
        /**
         * 对两个向量进行插值
         * @param start 起点
         * @param end 终点
         * @param t 插值参数，介于[0,1]之间
         * @param result
         */
        static lerp(start: Vector2, end: Vector2, t: number, result?: Vector2): Vector2;
        private static _AngleStart;
        private static _AngleEnd;
        /**
         * 计算两个向量之间的夹角，返回弧度
         * @param start
         * @param end
         */
        static angle(start: Vector2, end: Vector2): number;
        /**
         * 向量（0,0）
         */
        static ZERO: Vector2;
        /**
         * 向量（1,1），单位向量
         */
        static UNIT: Vector2;
        /**
         * 向量（1,0）
         */
        static UNIT_X: Vector2;
        /**
         * 向量（0,1）
         */
        static UNIT_Y: Vector2;
        /**
         * 构造新对象或者使用旧对象
         * @param x
         * @param y
         * @param result
         */
        private static newOrResult;
    }
}
declare namespace Cegore {
    /**
     * 一个三维的点或者向量
     */
    class Vector3 {
        /**
         * x坐标值
         */
        x: number;
        /**
         * y坐标值
         */
        y: number;
        /**
         * z坐标值
         */
        z: number;
        /**
         * 构造一个新的对象
         */
        constructor();
        /**
         * 通过x,y和z构造Vector3
         * @param x x坐标
         * @param y y坐标
         * @param z z坐标
         */
        constructor(x: number, y: number, z: number);
        /**
         * 通过数组构建Vector3
         * @param xyzArray xyz坐标数组
         */
        constructor(xyzArray: number[]);
        /**
         * 通过包含x,y和z属性的对象构建Vector3
         * @param xyzObj 包含x,y和z属性的对象
         */
        constructor(xyzObj: {
            x: number;
            y: number;
            z: number;
        });
        /**
         * 获取当前向量的长度（点到原点的距离）
         */
        readonly length: number;
        /**
         * 向量的权重，同length
         */
        readonly magnitude: number;
        /**
         * 获取向量长度的平方，用于不需要知道实际长度的情况下，避免进行开方运算
         */
        readonly squaredLength: number;
        /**
         * 通过x,y和z设置Vector3对象
         * @param x x坐标
         * @param y y坐标
         * @param z z坐标
         */
        set(x: number, y: number, z: number): any;
        /**
         * 通过数组设置Vector3
         * @param xyzArray xyz坐标数组
         */
        set(xyzArray: number[]): any;
        /**
         * 通过包含x,y和z属性的对象设置Vector3
         * @param xyzObj 包含x,y和z属性的对象
         */
        set(xyzObj: {
            x: number;
            y: number;
            z: number;
        }): any;
        /**
         * 复制当前对象
         * @param result 一个可选的参数，用来存储输出结果
         * @returns 复制的对象
         */
        clone(result?: Vector3): Vector3;
        /**
         * 判断当前对象和指定的对象是否相等
         * @param right
         */
        equals(right?: Vector3): boolean;
        /**
         * 返回如下格式的字符串 '(x,y,z)'
         */
        toString(): string;
        /**
         * @private
         */
        _asCzVector3(): any;
        /**
         * 计算两个向量的距离
         * @param left
         * @param right
         */
        static distance(left: Vector3, right: Vector3): number;
        /**
         * 计算两个向量距离的平方
         * @param left
         * @param right
         */
        static squaredDistance(left: Vector3, right: Vector3): number;
        /**
         * 复制传入的对象
         * @param target 要复制的对象
         * @param result 可选的对象，用于存储复制结果
         */
        static clone(target: Vector3, result?: Vector3): Vector3;
        /**
         * 比较两个对象是否相等
         */
        static equals(left: Vector3, right: Vector3): boolean;
        /**
         * 计算两个向量的和
         * @param left
         * @param right
         * @param result
         */
        static add(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 计算两个向量的差
         * @param left
         * @param right
         * @param result
         */
        static sub(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 计算向量与标量的乘积
         * @param left
         * @param scalar
         * @param result
         */
        static mul(left: Vector3, scalar: number, result?: Vector3): Vector3;
        /**
         * 计算两个向量的乘积
         * @param left
         * @param right
         * @param result
         */
        static mul(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 计算向量与标量的商
         * @param left
         * @param scalar
         * @param result
         */
        static div(left: Vector3, scalar: number, result?: Vector3): Vector3;
        /**
         * 计算两个向量的商
         * @param left
         * @param right
         * @param result
         */
        static div(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 对当前向量取反
         * @param target
         * @param result
         */
        static negate(target: Vector3, result?: Vector3): Vector3;
        /**
         * 计算两个向量的点积（点乘）
         * @param left
         * @param right
         */
        static dot(left: Vector3, right: Vector3): number;
        /**
         * 计算两个向量的叉积（叉乘）
         * @param left
         * @param right
         */
        static cross(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 归一化向量
         * @param target
         * @param result
         */
        static normalize(target: Vector3, result?: Vector3): Vector3;
        /**
         * 计算两个点的中点
         * @param left
         * @param right
         * @param result
         */
        static middle(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 计算两个向量每个分量的最小值
         * @param left
         * @param right
         * @param result
         */
        static floor(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        /**
         * 计算两个向量每个分量的最大值
         * @param left
         * @param right
         * @param result
         */
        static ceil(left: Vector3, right: Vector3, result?: Vector3): Vector3;
        private static _LerpStart;
        private static _LerpEnd;
        /**
         * 对两个向量进行插值
         * @param start 起点
         * @param end 终点
         * @param t 插值参数，介于[0,1]之间
         * @param result
         */
        static lerp(start: Vector3, end: Vector3, t: number, result?: Vector3): Vector3;
        private static _AngleStart;
        private static _AngleEnd;
        private static _AngleCross;
        /**
         * 计算两个向量之间的夹角，返回弧度
         * @param start
         * @param end
         */
        static angle(start: Vector3, end: Vector3): number;
        /**
         * 向量（0,0）
         */
        static ZERO: Vector3;
        /**
         * 向量（1,1），单位向量
         */
        static UNIT: Vector3;
        /**
         * 向量（1,0）
         */
        static UNIT_X: Vector3;
        /**
         * 向量（0,1）
         */
        static UNIT_Y: Vector3;
        /**
         * 向量（0,0,1）
         */
        static UNIT_Z: Vector3;
        /**
         * 构造新对象或者使用旧对象
         * @param x
         * @param y
         * @param result
         */
        private static newOrResult;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 表示一个位置
     *
     * 该类封装了一个位置信息，表示空间上的一个某一点
     */
    class Position {
        private _x;
        private _y;
        private _z;
        /**
         * 构造一个新的LongLat对象
         * @param any
         */
        constructor(p0?: any, p1?: any, p2?: any);
        /**
         * 获取经度值
         */
        /**
        * 设置经度
        */
        lon: number;
        /**
         * 获取纬度值
         */
        /**
        * 设置纬度
        */
        lat: number;
        /**
         * 获取高程
         */
        /**
        * 设置高程
        */
        altitude: number;
        /**
         * 获取x坐标，同lon
         */
        /**
        * 设置x坐标，同lon=val
        */
        x: number;
        /**
         * 获取y坐标，同lat
         */
        /**
        * 设置y坐标，同lat=val
        */
        y: number;
        /**
         * 获取z坐标，同altitude
         */
        /**
        * 设置z坐标，同altitude=val
        */
        z: number;
        /**
         * 通过一个字符串数组设置
         * @param xyz
         */
        set(xyz: number[]): any;
        /**
         * 通过一个对象设置
         * @param xyz
         */
        set(xyz: {
            x?: number;
            y?: number;
            z?: number;
        }): any;
        /**
         * 通过数字设置
         * @param x
         * @param y
         * @param z
         */
        set(x: number, y: number, z?: number): any;
        /**
         * 通过字符串设置
         * @param x
         * @param y
         * @param z
         */
        set(x: string, y: string, z?: number): any;
        /**
         * 通过一个字符串数组构建
         * @param xyz
         */
        static from(xyz: number[]): Position;
        /**
         * 通过一个对象构建
         * @param xyz
         */
        static from(xyz: {
            x?: number;
            y?: number;
            z?: number;
        }): Position;
        /**
         * 通过数字构建
         * @param x
         * @param y
         * @param z
         */
        static from(x: number, y: number, z?: number): Position;
        /**
         * 通过字符串构建
         * @param x
         * @param y
         * @param z
         */
        static from(x: string, y: string, z?: number): Position;
        /**
         * 解析点字符串
         * @param lineStr 点位字符串，格式 'x,y,z|x,y,z|...';
         */
        static parsePoints(lineStr: any): any[];
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 一个二维的矩形区域
     *
     * Rectangle可以表述一个地理坐标（经纬度），也可以表示一个二维平面坐标
     * 在表示地理坐标的时候和二维平面坐标的时候某些行为有些不同，
     * 因为地理坐标系在经度方向上是循环连续的（-180和180的位置重合），
     * 所以在使用上需要注意。
     */
    class Rectangle {
        /**
         * x 的最小值
         */
        private _minx;
        /**
         * y 的最小值
         */
        private _miny;
        /**
         * x 的最大值
         */
        private _maxx;
        /**
         * y 的最大值
         */
        private _maxy;
        /**
         * 是否为空矩形
         */
        private _isEmpty;
        /**
         * 是否地理坐标
         */
        private _isGeographical;
        /**
         * 构造一个新的空矩形对象
         * @param isGeographical 表示当前对象是否表示的是地理坐标，默认值：<code>true</code>
         */
        constructor(isGeographical?: boolean);
        /**
         * 通过指定最大最小值构造矩形
         * @param minx x坐标最小值
         * @param miny y坐标最小值
         * @param maxx x坐标最大值
         * @param maxy y坐标最大值
         * @param isGeographical 表示当前对象是否表示的是地理坐标，默认值：<code>true</code>
         */
        constructor(minx: number, miny: number, maxx: number, maxy: number, isGeographical?: boolean);
        /**
         * 通过一个数组构造矩形
         * @param rectArray 一个包含4个数字的数组
         * @param isGeographical 表示当前对象是否表示的是地理坐标，默认值：<code>true</code>
         */
        constructor(rectArray: number[]);
        /**
         * 通过一个对象构造矩形
         * @param rectMinMax 一个包含 minx,miny,maxx,maxy属性的对象
         * @param isGeographical 表示当前对象是否表示的是地理坐标，默认值：<code>true</code>
         */
        constructor(rectMinMax: {
            minx: number;
            miny: number;
            maxx: number;
            maxy: number;
        }, isGeographical?: boolean);
        /**
         * 通过一个对象构造矩形
         * @param rectWSEN 一个包含 west,south,east,north属性的对象
         * @param isGeographical 表示当前对象是否表示的是地理坐标，默认值：<code>true</code>
         */
        constructor(rectWSEN: {
            west: number;
            south: number;
            east: number;
            north: number;
        }, isGeographical?: boolean);
        /**
         * 通过一个对象构造矩形
         * @param rectLBTR 一个包含 left,bottom,right,top属性的对象
         * @param isGeographical 表示当前对象是否表示的是地理坐标，默认值：<code>true</code>
         */
        constructor(rectLBTR: {
            left: number;
            bottom: number;
            right: number;
            top: number;
        }, isGeographical?: boolean);
        /**
         * 获取minx
         */
        /**
        * 设置minx，如果当前是地理坐标，则只能设置为 [-180,180] 之间
        */
        minx: number;
        /**
         * 获取maxx
         */
        /**
        * 设置maxx，如果当前是地理坐标，则只能设置为 [-180,180] 之间
        */
        maxx: number;
        /**
         * 获取miny
         */
        /**
        * 设置miny，如果当前是地理坐标，则只能设置为 [-90,90] 之间
        */
        miny: number;
        /**
         * 获取maxy
         */
        /**
        * 设置maxy，如果当前是地理坐标，则只能设置为 [-90,90] 之间
        */
        maxy: number;
        /**
         * 获取当前矩形是否为<空>
         */
        /**
        * 设置当前矩形是否为<空>
        */
        empty: boolean;
        /**
         * 返回当前对象是否是表示的是地理坐标
         */
        readonly isGeographical: boolean;
        /**
         * 获取矩形的宽度
         */
        readonly width: number;
        /**
         * 获取矩形的高度
         */
        readonly height: number;
        /**
         * 获取最西边的值，等同于minx
         */
        /**
        * 设置最西边的值，等永远minx = val
        */
        west: number;
        /**
         * 获取最东边的值，等永远maxx
         */
        /**
        * 设置最东边的值，等永远maxx = val
        */
        east: number;
        /**
         * 获取最南边的值，等永远miny
         */
        /**
        * 设置最南边的值，等同于miny = val
        */
        south: number;
        /**
         * 获取最北边的值，等同于maxy
         */
        /**
        * 设置最北边的值，等同于maxy = val
        */
        north: number;
        /**
         * 获取最左边的值，等同于minx
         */
        /**
        * 设置最左边的值，等永远minx = val
        */
        left: number;
        /**
         * 获取最右边的值，等永远maxx
         */
        /**
        * 设置最右边的值，等永远maxx = val
        */
        right: number;
        /**
         * 获取最下边的值，等永远miny
         */
        /**
        * 设置最下边的值，等同于miny = val
        */
        bottom: number;
        /**
         * 获取最上边的值，等同于maxy
         */
        /**
        * 设置最上边的值，等同于maxy = val
        */
        top: number;
        /**
         * 获取矩形的中心点
         * @param result 一个可选的对象，用来存储矩形的中心点
         * @returns 返回矩形的中心点
         */
        center(result?: Position): Position;
        /**
         * 获取最小点
         * @param result
         */
        min(result?: Position): Position;
        /**
         * 获取最大点
         * @param result
         */
        max(result?: Position): Position;
        /**
         * 获取左下角
         * @param result
         */
        leftBottom(result?: Position): Position;
        /**
         * 获取左上角
         * @param result
         */
        leftTop(result?: Position): Position;
        /**
         * 获取右上角
         * @param result
         */
        rightTop(result?: Position): Position;
        /**
         * 获取右下角
         * @param result
         */
        rightBottom(result?: Position): Position;
        /**
         * 获取西南角
         * @param result
         */
        southWest(result?: Position): Position;
        /**
         * 获取东南角
         * @param result
         */
        southEast(result?: Position): Position;
        /**
         * 获取西北角
         * @param result
         */
        northWest(result?: Position): Position;
        /**
         * 获取东北角
         * @param result
         */
        northEast(result?: Position): Position;
        inflate(f: number): any;
        inflate(x: number, y: number): any;
        inflate(pt: Vector2): any;
        /**
         * 合并指定的点到当前矩形中
         * @param x 要合并到矩形中的点x坐标
         * @param y 要合并到矩形中的点y坐标
         */
        merge(x: number, y: number): void;
        /**
         * 合并指定的点到当前矩形中
         * @param pos 要合并到矩形中的点
         */
        merge(pos: Position): void;
        /**
         * 合并指定的矩形到当前矩形中
         * @param rect 要合并的矩形
         */
        merge(rect: Rectangle): void;
        /**
         * 合并指定的点数组到当前矩形中
         * @param posList 要合并的点数组
         */
        merge(posList: Position[]): void;
        /**
         * 合并指定的矩形数组到当前矩形中
         * @param rectList 要合并的矩形数组
         */
        merge(rectList: Rectangle[]): void;
        /**
         * 将当前矩形对象转换成一个数组对象
         *
         * @param result 一个可选的对象，用于存储输出结果
         * @return 一个数组包含矩形的最小值最大值，如：[minx,miny,maxx,maxy]。
         */
        asArray(result?: number[]): number[];
        /**
         * 复制当前对象
         * @param result 一个可选的对象，用于存储复制结果
         * @returns 复制的结果
         */
        clone(result?: Rectangle): Rectangle;
        /**
         * 判断是否包含点
         * @param rc
         */
        contains(rc: Position): boolean;
        /**
         * 判断是否包含矩形
         */
        contains(rc: Rectangle): boolean;
        /**
         * 求取两个矩形的交集，如果两个矩形不相交，返回undefined
         * @param rc
         * @param result
         */
        intersection(rc: Rectangle, result?: Rectangle): Rectangle;
        /**
         * @private
         */
        toCZRectangle(): any;
        /**
         * 标准化经度，使输入的经度处于[-180,180]之间
         * @param lon 待处理的经度
         * @return 返回标准化后的经度
         */
        static normalizeLongitude(lon: number): number;
        /**
         * 标准化纬度，使输入的纬度处于[-90,90]之间
         * @param lat 待处理的纬度
         * @return 返回标准化后的纬度
         */
        static normalizeLatitude(lat: number): number;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 表述模型的姿态信息
     */
    class HeadingPitchRoll {
        private _heading;
        private _pitch;
        private _roll;
        /**
         * 构造函数
         */
        constructor(v0?: any, v1?: any, v2?: any);
        /**
         * 获取 方位角，绕Z轴旋转，单位：度
         */
        /**
        * 设置 方位角，绕Z轴旋转，单位：度
        */
        heading: number;
        /**
         * 获取 俯仰角，绕Y轴旋转，单位：度
         */
        /**
        * 设置 俯仰角，绕Y轴旋转，单位：度
        */
        pitch: number;
        /**
         * 获取 滚转角，绕X轴旋转，单位：度
         */
        /**
        * 设置 滚转角，绕X轴旋转，单位：度
        */
        roll: number;
        /**
         * 设置 heading pitch roll
         * @param heading 方位角
         * @param pitch 俯仰角
         * @param roll 滚转角
         */
        set(heading: number, pitch: number, roll: number): any;
        /**
         * 使用数组设置 heading pitch roll
         * @param hpr[0] 方位角
         * @param hpr[1] 俯仰角
         * @param hpr[2] 滚转角
         */
        set(hpr: number[]): any;
        /**
         * 使用对象设置 heading pitch roll
         * @param hpr.heading 方位角
         * @param hpr.pitch 俯仰角
         * @param hpr.roll 滚转角
         */
        set(hpr: {
            heading: number;
            pitch: number;
            roll: number;
        }): any;
        /**
         * 使用 HeadingPitchRoll 对象设置 heading pitch roll
         * @param hpr 姿态信息
         */
        set(hpr: HeadingPitchRoll): any;
        /**
         * 使用弧度设置 heading pitch roll
         * @param heading 方位角
         * @param pitch 俯仰角
         * @param roll 滚转角
         */
        setFromRadius(heading: number, pitch: number, roll: number): any;
        /**
         * 使用弧度数组设置 heading pitch roll
         * @param hpr[0] 方位角
         * @param hpr[1] 俯仰角
         * @param hpr[2] 滚转角
         */
        setFromRadius(hpr: number[]): any;
        /**
         * 使用弧度对象设置 heading pitch roll
         * @param hpr.heading 方位角
         * @param hpr.pitch 俯仰角
         * @param hpr.roll 滚转角
         */
        setFromRadius(hpr: {
            heading: number;
            pitch: number;
            roll: number;
        }): any;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 定义了一个局部坐标下的方位角，高度角和距离
     */
    class HeadingPitchDistance {
        /**
         * 相对于正北方向的方位角
         */
        heading: number;
        /**
         * 相对于xy平面的高度角
         */
        pitch: number;
        /**
         * 局部坐标下相对于的中心的距离
         */
        distance: number;
        /**
         * 构造一个默认的 HeadingPitchDistance
         */
        constructor();
        /**
         * 通过 heading，pitch，distance三个参数构造 HeadingPitchDistance
         * @param heading
         * @param pitch
         * @param distance
         */
        constructor(heading: number, pitch: number, distance: number);
        /**
         * 通过一个包含三个成员的数组构造 HeadingPitchDistance
         * @param hpdArray
         */
        constructor(hpdArray: number[]);
        /**
         * 通过包含 heading，pitch，distance三个属性的对象构造 HeadingPitchDistance
         * @param hpdObj
         */
        constructor(hpdObj: {
            heading: number;
            pitch: number;
            distance: number;
        });
        /**
         * 通过 heading，pitch，distance三个参数设置当前对象
         * @param heading
         * @param pitch
         * @param distance
         */
        set(heading: number, pitch: number, distance: number): any;
        /**
         * 通过一个包含三个成员的数组设置当前对象
         * @param hpdArray
         */
        set(hpdArray: number[]): any;
        /**
         * 通过包含 heading，pitch，distance三个属性的对象设置当前对象
         * @param hpdObj
         */
        set(hpdObj: {
            heading: number;
            pitch: number;
            distance: number;
        }): any;
        /**
         * @private
         */
        _asCzObject(result?: any): any;
    }
}
declare namespace Cegore {
    /**
     * 地理计算
     *
     * 地理计算类主要提供一些工具函数，用于常用的地理计算函数
     */
    class GeoMath {
        private static _degree2radian;
        private static _radian2degree;
        /**
         * 度转弧度
         * @param degree
         */
        static toRadian(degree: any): number;
        /**
         * 弧度转度
         * @param radian
         */
        static toDegree(radian: any): number;
        /**
         * 限制val的取值范围，如果val小于min则返回min，如果val大于max则返回max，否则返回val
         *
         * @param val 输入值
         * @param min 最小值
         * @param max 最大值
         */
        static clamp(val: number, min: number, max: number): number;
        /**
         * 同 Math.acos，计算之前先 clamp值到 [-1.0,1.0] 之间，避免返回NaN
         * @param val
         */
        static acosClamped(value: number): number;
        /**
         * 同 Math.asin，计算之前先 clamp值到 [-1.0,1.0] 之间，避免返回NaN
         * @param val
         */
        static asinClamped(value: number): number;
        /**
         * 返回一个[0,1)之间的随机数
         */
        static random(): any;
        /**
         * 返回一个[0,max)之间的随机数
         */
        static random(max: number): any;
        /**
         * 返回一个[min,max)之间的随机数
         */
        static random(min: number, max: number): any;
        /**
         * 计算多个点之间的距离
         * @param pts 点列表
         * @param radius 地球半径
         */
        static surfaceDistance(pts: any[], radius?: number): any;
        /**
         * 计算两点之间的距离
         * @param pt0
         * @param pt1
         */
        static surfaceDistance(p0: any, p1?: any, radius?: number): any;
        /**
         * 计算两个角度之间的夹角
         * @param a1
         * @param a2
         */
        static innerAngle(a1: number, a2: number): number;
        /**
         * 标准化角度，使输入的角度处于[-180,180]之间
         * @param angle 待处理的角度
         * @return 返回标准化后的角度
         */
        static stdAngle(angle: number): number;
        /**
         * 计算地球表面上多边形的投影面积
         * @param polygon 多边形，定点序列，坐标为经纬度坐标
         * @param radius 地球半径
         */
        static surfaceArea(polygon: Position[], radius?: number): number;
        /**
         * 计算多边形的面积
         * @param polygon 多边形的点序列，输入坐标为笛卡尔坐标系下的二维坐标
         */
        static area(polygon: any[]): number;
        /**
         * 计算带方向的面积
         * @param pts 多边形点序列
         */
        static signedArea(pts: any[]): number;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 在多条线段间进行形插值
     */
    class MultiLineInterp {
        private _bridges;
        constructor(options: {
            lines: any[];
        });
        /**
         * 插值折线或者多边形
         * @param amount
         */
        interp(amount: number): Vector2[];
    }
}
declare namespace Cegore {
    /**
     * 基于Canvas的绘制类，提供基础的功能
     */
    class CanvasDraw {
        private _canvas;
        private _ctx;
        private _rect;
        private _geoWidth;
        private _getHeight;
        /**
         * 构造函数
         * @param options 一个可选的参数
         * @param options.canvas 一个可选的参数，指定使用的canvas dom 或者 id
         * @param options.width 指定画布的宽度，默认值：512
         * @param options.heigth 指定画布的高度，默认值：512
         */
        constructor(options?: {
            canvas?: HTMLCanvasElement | string;
            width?: number;
            height?: number;
        });
        /**
         * 获取输出的Canvas
         */
        readonly canvas: HTMLCanvasElement;
        /**
         * 获取 Context2D
         */
        readonly context: any;
        /**
         * 获取数据的范围
         */
        readonly rect: Rectangle;
        /**
         * 获取画布的宽度
         */
        readonly width: number;
        /**
         * 获取画布的高度
         */
        readonly height: number;
        /**
         * 清空画布
         */
        clear(): void;
        /**
         * 计算数据的范围
         * @param lines
         */
        protected calcRect(lines: any): void;
        /**
         * X坐标转画布坐标
         * @param x
         */
        protected convertX(x: number): number;
        /**
         * Y坐标转画布坐标
         * @param y
         */
        protected convertY(y: number): number;
        /**
         * 创建或者使用输入的Canvas
         * @param canvas 一个可选的参数，指定使用的Canvas
         */
        protected createCanvasContext2D(canvas: HTMLCanvasElement | string, width: any, height: any): any;
    }
}
declare namespace Cegore {
    /**
     * 多边形掩码
     */
    class PolygonMask extends CanvasDraw {
        private _interp;
        /**
         * 构造一个多边形掩码对象
         * @param lines 多边形的点
         * @param options
         */
        constructor(lines: Vector2[][], options?: {
            canvas?: HTMLCanvasElement | string;
            width?: number;
            height?: number;
        });
        /**
         * 绘制指定时刻的多边形掩码
         * @param amount
         */
        draw(amount: number): void;
    }
}
declare namespace Cegore {
    /**
     * 折线，多边形渐变
     */
    class PolylineGradual extends CanvasDraw {
        private _lines;
        private _fadein;
        private _fadeout;
        private _fill;
        private _canvas1;
        private _ctx1;
        private _canvas2;
        private _ctx2;
        constructor(lines: any, options?: {
            canvas?: HTMLCanvasElement | string;
            width?: number;
            height?: number;
            fadein?: number;
            fadeout?: number;
        });
        draw(amount: number): void;
        private drawLine;
        private drawMix;
    }
}
declare namespace Cegore {
    class DynamicArea {
        private _geometry;
        private _primitive;
        private _appearance;
        private _material;
        private _polygonMask;
        private _viewer;
        constructor(options: {
            viewer: Viewer;
            canvas: HTMLCanvasElement | string;
            lines: Vector2[][];
            textureSize: {
                width: number;
                height: number;
            };
            height: number;
            extrudedHeight: number;
        });
        draw(amount: number): void;
        visible: boolean;
        /**
         * 删除该对象
         */
        remove(): void;
    }
}
declare namespace Cegore {
    /**
     * 颜色类
     *
     * 使用 red，green，blue和alpha四个[0.0, 1.0]之间的浮点数分量描述颜色信息
     */
    class Color {
        private _r;
        private _g;
        private _b;
        private _a;
        /**
         * 通过一个 css 字符串构造颜色对象
         *
         * @param cssColor css格式的颜色字符串：'red', '#rgb', '#rrggbb', 'rgb(r,g,b)', 'rgba(r,g,b,a)', 'hls()', 'hlsa()'
         *
         * @example
         * <pre>
         * var blue = new Color('blue');
         * var green = new Color('#0f0');
         * var red = new Color('rgb(255,0,0)');
         * </pre>
         */
        constructor(cssColor: string);
        /**
         * 通过一个数组构造一个颜色对象
         *
         * @param colorArray 一个包含3个或者4个数字的数组
         * @example
         * <pre>
         * var color = new Color([1.0, 0.5, 0.0]);
         * var color = new Color([1.0, 0.5, 0.0, 1.0]);
         * </pre>
         */
        constructor(colorArray: number[]);
        /**
         * 通过一个对象构造颜色对象
         *
         * @param colorObj 一个包含属性 r，g，b，a的对象
         * @param colorObj.r 红色分量
         * @param colorObj.g 绿色分量
         * @param colorObj.b 蓝色分量
         * @param colorObj.a 透明分量
         *
         * @example
         * <pre>
         * var color = new Color({r:1, g:0, b:0, a:1});
         * </pre>
         */
        constructor(colorObj: {
            r: number;
            g: number;
            b: number;
            a?: number;
        });
        /**
         * 通过 r,g,b,a四个分量构造颜色对象
         * @param r 红色分量
         * @param g 绿色分量
         * @param b 蓝色分量
         * @param a 透明分量
         */
        constructor(r: number, g: number, b: number, a?: number);
        /**
         * 通过一个Color对象设置当前对象
         * @param color
         */
        set(color: Color): any;
        /**
         * 通过 css 颜色字符串设置当前对象
         * @param cssColor
         */
        set(cssColor: string): any;
        /**
         * 通过一个数组构造一个颜色对象
         *
         * @param colorArray 一个包含3个或者4个数字的数组
         */
        set(colorArray: number[]): any;
        /**
         * 通过一个对象设置颜色对象
         *
         * @param colorObj 一个包含属性 r，g，b，a的对象
         * @param colorObj.r 红色分量
         * @param colorObj.g 绿色分量
         * @param colorObj.b 蓝色分量
         * @param colorObj.a 透明分量
         */
        set(colorObj: {
            r: number;
            g: number;
            b: number;
            a?: number;
        }): any;
        /**
         * 通过 r,g,b,a四个分量设置颜色对象
         * @param r 红色分量
         * @param g 绿色分量
         * @param b 蓝色分量
         * @param a 透明分量
         */
        set(r: number, g: number, b: number, a?: number): any;
        /**
         * 获取红色分量
         */
        readonly red: number;
        /**
         * 获取绿色分量
         */
        readonly green: number;
        /**
         * 获取蓝色分量
         */
        readonly blue: number;
        /**
         * 获取透明度分量
         */
        readonly alpha: number;
        /**
         * 获取红色分量
         */
        /**
        * 设置红色分量
        */
        r: number;
        /**
         * 获取绿色分量
         */
        /**
        * 设置绿色分量
        */
        g: number;
        /**
         * 获取蓝色分量
         */
        /**
        * 设置蓝色分量
        */
        b: number;
        /**
         * 获取透明度分量
         */
        /**
        * 设置透明度分量
        */
        a: number;
        /**
         * 红色 <span class="colorSwath" style="background: #FF0000;"></span>
         */
        static readonly RED: Color;
        /**
         * 绿色 <span class="colorSwath" style="background: #00FF00;"></span>
         */
        static readonly GREEN: Color;
        /**
         * 蓝色 <span class="colorSwath" style="background: #0000FF;"></span>
         */
        static readonly BLUE: Color;
        /**
         * 黑色 <span class="colorSwath" style="background: #000000;"></span>
         */
        static readonly BLACK: Color;
        /**
         * 白色 <span class="colorSwath" style="background: #FFFFFF;"></span>
         */
        static readonly WHITE: Color;
        /**
         * 黄色 <span class="colorSwath" style="background: #FFFF00;"></span>
         */
        static readonly YELLOW: Color;
        /**
         * 青色 <span class="colorSwath" style="background: #00FFFF;"></span>
         */
        static readonly AUQA: Color;
        /**
         * 品红 <span class="colorSwath" style="background: #FF00FF;"></span>
         */
        static readonly FUCHSIA: Color;
        /**
         * 灰色 <span class="colorSwath" style="background: #808080;"></span>
         */
        static readonly GRAY: Color;
        /**
         * 从CSS格式颜色字符构造颜色对象
         *
         * @param css CSS格式的颜色字符串
         */
        static fromCssColor(css: any): Color;
        /**
         * 通过 0-255的 RGBA分量构造颜色对象
         * @param r [0-255]的红色分量
         * @param g [0-255]的的绿分量
         * @param b [0-255]的的蓝分量
         * @param a [0-255]的的透明分量
         * @param result 用于存储结果的对象
         */
        static fromBytes(r: number, g: number, b: number, a: number, result?: any): Color;
        /**
         * 从一个32位的 RGBA 构造颜色
         * @param rgba 32位的RGBA颜色
         * @param result 用于存储结果的对象
         */
        static fromRGBA32(rgba: number, result?: Color): Color;
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
        static fromRandom(options?: {
            red?: number;
            minRed?: number;
            maxRed?: number;
            green?: number;
            minGreen?: number;
            maxGreen?: number;
            blue?: number;
            minBlue?: number;
            maxBlue?: number;
            alpha?: number;
            minAlpha?: number;
            maxAlpha?: number;
        }, result?: Color): Color;
        /**
         * 将当前颜色转成 CSS 颜色字符串
         * @return 返回一个表示的颜色的CSS字符串
         */
        toCssColor(): string;
        /**
         * 将当前颜色转成 字节数组 [r, g, b, a] , 颜色值为 [0,255]
         * @param result 一个可选的数组对象，用来存储输出值
         * @return 返回一个数组，存储颜色字节
         */
        toBytes(result?: number[]): number[];
        /**
         * 将当前的颜色转为一个32位的 RGBA 整数
         */
        toRGBA32(): number;
        /**
         * @private
         */
        toCZColor(): any;
        private static ScratchArrayBuffer;
        private static UnionUint32;
        private static UnionUint8;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 材质
     */
    abstract class Material {
        /**
         * 获取类型
         */
        abstract readonly type: string;
        /**
         * 获取材质
         * @private
         */
        abstract readonly czmat: any;
    }
    /**
     * 颜色材质
     */
    class ColorMaterial extends Material {
        private _czmat;
        private _color;
        /**
         * 构造一个颜色材质
         * @param color
         */
        constructor(color: Color);
        /**
         * 获取类型
         */
        readonly type: string;
        /**
         * 获取材质
         * @private
         */
        readonly czmat: any;
        /**
         * 获取颜色
         */
        /**
        * 设置颜色
        */
        color: Color;
    }
    /**
     * 图片材质
     *
     * 支持 URL，Image，Canvas，Video
     */
    class ImageMaterial extends Material {
        private _czmat;
        private _color;
        private _image;
        private _repeat;
        private _transparent;
        /**
         * 构造一个图像材质
         * @param options 一个可选的参数
         * @param options.image 指定显示的图像，可以是URL，Image，Canvas和Video
         * @param options.repeat 指定图像重复显示的次数，默认值：[1.0, 1.0]
         * @param options.color 指定显示时叠加的颜色，默认值：Color.WHITE
         * @param options.transparent 指定材质是否透明显示，当图片包含透明信息是设置为true
         */
        constructor(options?: {
            image?: string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
            repeat?: number[] | {
                x: number;
                y: number;
            };
            color?: Color | string;
            transparent?: boolean;
        });
        /**
         * 获取类型
         */
        readonly type: string;
        /**
         * 获取材质
         * @private
         */
        readonly czmat: any;
        /**
         * 获取颜色
         */
        /**
        * 设置颜色
        */
        color: Color;
        /**
         * 获取该材质使用的 Image,URL,Canvas,Video
         */
        /**
        * 设置该材质使用的 Image,URL,Canvas,Video
        */
        image: any;
        /**
         * 获取图像重复显示的次数，默认值：[1, 1]
         */
        /**
        * 设置图像重复显示的次数，默认值：[1, 1]
        */
        repeat: Vector2;
        /**
         * 返回当前材质是否透明
         */
        /**
        * 设置当前材质是否透明
        */
        transparent: boolean;
    }
}
/**
 * end of file
 */
declare namespace Cegore {
    interface TreeItem {
        /**
         * 获取名称
         */
        readonly name: string;
        /**
         * 获取父对象
         */
        readonly parent: TreeItem;
        /**
         * 是否叶子节点
         */
        readonly isLeaf: boolean;
        /**
         * 获取子对象列表
         */
        readonly children: TreeItem[];
        /**
         * 添加到节点上
         */
        onAdded(parent: TreeItem): any;
        /**
         * 被移除
         */
        onRemoved(): any;
        /**
         * 与根节点断开
         */
        onAttachRoot(): any;
        /**
         * 连接到根节点
         */
        onDetachRoot(): any;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
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
    class Event {
        /**
         * 事件监听器列表
         */
        private _listeners;
        /**
         * 注册事件
         *
         * 当事件触发时，回调函数将会被调用，当指定self是，self将作为回调函数的<code>this</code>
         *
         * @param callback 事件回调函数，当事件触发时被调用
         * @param self 一个可选的对象，当回调函数被调用时，作为回调函数的 <code>this</code> 指针。
         */
        on(callback: (...args: any[]) => any, self?: any): void;
        /**
         * 反注册事件
         *
         * 移除之前注册的事件回调函数
         *
         * @param callback 使用 on 注册时传入的 callback
         * @param self 使用 on 注册时传入的 self
         */
        off(callback: (...args: any[]) => any, self?: any): void;
        /**
         * 触发事件，调用所有注册的回调函数
         *
         * @param args 传给事件回调函数的参数列表
         */
        fire(...args: any[]): void;
        /**
         * 同函数 <code>on</code>
         * @see
         * Event.on
         */
        addEventListener(callback: (...args: any[]) => any, self?: any): void;
        /**
         * 同函数 <code>off</code>
         * @see
         * Event.off
         */
        removeEventListener(callback: (...args: any[]) => any, self?: any): void;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 事件句柄
     */
    class EventHandle {
        private _events;
        /**
         * 构造函数
         * @param options
         */
        constructor(options?: any);
        /**
         * 注册事件
         * @param type 事件类型
         * @param callback 事件回调
         * @param self 回调的this
         */
        on(type: string, callback: any, self?: any): void;
        /**
         * 反注册事件
         * @param type 事件类型
         * @param callback 事件回调
         * @param self 回调的this
         */
        off(type: string, callback: any, self?: any): void;
        /**
         * 触发事件
         * @param type 事件类型
         * @param arg 事件参数
         */
        fire(type: string, ...args: any[]): void;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 自动名称
     *
     * 用于自动生成不重复的名称字符串
     */
    class AutoNames {
        /**
         * 下一个名称的序号
         */
        private static NextIndex;
        /**
         * 生成一个名称
         *
         * 如果指定了名称则使用该名称，未指定则自动使用前缀加序号生成名称
         *
         * @param name 如果指定了名称，则使用该名称
         * @param prefix 自动生成名称的前缀
         */
        static genName(name?: string, prefix?: string): string;
    }
}
declare namespace Cegore {
    /**
     * 一个简单的时钟类，用来模拟时间
     *
     * 该类还记录了一个时间区间，用来指导时间轴的显示
     */
    class Clock {
        private _czClock;
        private _onTick;
        /**
         * 构造一个新的时钟类
         * @param viewer
         */
        constructor(viewer: Viewer);
        /**
         * tick 事件，当时间改变时调用
         * @event
         */
        readonly onTick: Event;
        /**
         * 获取当前时间
         */
        /**
        * 设置当前时间
        */
        currentTime: Date;
        /**
         * 获取开始时间
         */
        /**
        * 设置开始时间
        */
        startTime: Date;
        /**
         * 获取停止时间
         */
        /**
        * 设置停止时间
        */
        stopTime: Date;
    }
}
/**
 * End of file
 */ 
declare namespace Cegore {
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
    class Camera {
        private _viewer;
        private _czData;
        private _czCamera;
        private _position;
        private _orientation;
        private _eventChanged;
        private _eventMoveStart;
        private _eventMoveEnd;
        /**
         * 构造函数
         *
         * 不要调用此构造函数，通过viewer对象获取相机类
         *
         * @param viewer
         */
        constructor(viewer: Viewer);
        /**
         * 获取当前相机的位置
         */
        /**
        * 设置相机的当前位置
        */
        position: Position;
        /**
         * 获取相机的当前姿态
         */
        /**
        * 设置相机的当前姿态
        */
        orientation: HeadingPitchRoll;
        /**
         * 相机改变事件
         *
         * 该事件仅在相机发生一定变化后出发，如有其他需求，请使用 moveStart 和 moveEnd 事件
         * 事件原型 <code> function (camera) {}; </code>
         * @event
         */
        readonly changed: Event;
        /**
         * 相机开始移动事件
         *
         * 事件原型 <code> function (camera) {}; </code>
         * @event
         */
        readonly moveStart: Event;
        /**
         * 相机结束移动事件
         *
         * 事件原型 <code> function (camera) {}; </code>
         * @event
         */
        readonly moveEnd: Event;
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
        flyTo(options: {
            position?: Position | number[];
            rect?: Rectangle | number[];
            orientation?: HeadingPitchRoll;
            duration?: number;
            complete?: () => void;
            cancel?: () => void;
        }): any;
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
        flyToSphere(options: {
            center: Position;
            radius: number;
            offset?: HeadingPitchDistance;
            duration?: number;
            complete?: () => void;
            cancel?: () => void;
        }): void;
        /**
         * 停止飞行，相机停止在当前位置
         */
        stopFly(): void;
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
        setView(options: {
            position?: Position | number[];
            rect?: Rectangle | number[];
            orientation?: HeadingPitchRoll;
        }): any;
        /**
         * 获取当前相机的位置信息
         *
         * @return
         */
        getView(): {
            position: Position;
            orientation: HeadingPitchRoll;
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
        lookAt(target: Position, offset: HeadingPitchDistance): void;
        /**
         * 通过视点和目标点设置相机的位置和方向
         *
         * lookAt操作会锁定交互中心为目标点，恢复地心交互请使用clearLookAt()
         *
         * @param eye 视点
         * @param target 目标点
         */
        lookAtFromTo(eye: Position, target: Position): void;
        /**
         * 清除lookAt
         */
        clearLookAt(): void;
        /**
         * xyz 转 Cesium.Cartesian3
         * @param pos
         */
        private fromRectange;
        /**
         * Position 转 Cesium.Cartesian3
         * @param pos
         */
        private fromPosition;
        /**
         * @private
         * @param ori
         */
        private fromOrientation;
    }
}
declare namespace Cegore {
    /**
     * 可绘制对象
     */
    abstract class Renderable {
        private _position;
        private _orientation;
        /**
         * 可设置的属性
         */
        private static RenderablePropList;
        /**
         * 构造函数
         * @param options
         */
        constructor();
        /**
         * 应用属性
         * @param o 设置属性的对象
         * @param keys 属性名列表
         * @param props 属性值对象
         */
        protected static applyProps(o: any, keys: any, props: any): void;
        /**
         * 应用属性给当前对象
         *
         * @param options 属性列表
         * @param options.visible 是否可见
         * @param options.position 位置
         * @param options.orientation 方向
         */
        protected applyProps(options: {
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        }): void;
        /**
         * @private
         */
        abstract readonly _czRenderable: any;
        /**
         * 获取对象的类型
         */
        abstract readonly type: string;
        /**
         * 获取对象的id
         */
        readonly id: string;
        /**
         * 设置标准是否可见
         */
        /**
        * 获取当前对象是否可见
        */
        visible: any;
        /**
         * 获取位置信息
         */
        /**
        * 设置位置信息
        */
        position: Position;
        /**
         * 获取模型的方位
         */
        /**
        * 设置模型的方位
        */
        orientation: HeadingPitchRoll;
        /**
         * 更新模型的姿态信息
         * @private
         */
        private applyPose;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    interface ProviderFactory {
        /**
         * 创建实例
         */
        createProvider(options: any): any;
    }
    /**
     * Provide 提供器集合
     */
    class ProviderCollection {
        private mDefaultFac;
        private mFactories;
        constructor(def: string);
        /**
         * 注册提供器工厂
         * @param provider
         */
        regFactory(type: string, provider: ProviderFactory): void;
        /**
         * 反注册提供器工厂
         * @param provider
         */
        unregFactory(type: string): void;
        /**
         * 创建提供器
         * @param options
         */
        createProvider(type: string, options: any): any;
    }
    /**
     *
     */
    class Providers {
        /**
         * 地形提供器集合
         */
        static TerrainProviders: ProviderCollection;
        /**
         * 影像提供器集合
         */
        static ImageProviders: ProviderCollection;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 影像图层
     */
    class ImageLayer {
        private _name;
        private _type;
        private _czLayer;
        private _visible;
        private _alpha;
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
        constructor(options?: {
            name?: string;
            type?: string;
            visible?: boolean;
            alpha?: number;
            brightness?: number;
        });
        /**
         * @private
         */
        readonly _czlayer: any;
        /**
         * 图层名称
         */
        readonly name: string;
        /**
         * Provider的类型
         */
        readonly type: string;
        /**
         * 图层可见性
         */
        /**
        * 设置图层可见性
        */
        visible: boolean;
        /**
         * 透明度
         */
        /**
        * 设置透明度
        */
        alpha: any;
        /**
         * 根据options 创建provider
         * @param options
         */
        private createProvider;
    }
}
declare namespace Cegore {
    /**
     * 影像图层集合
     */
    class ImageLayerCollection {
        private _globe;
        private _czLayers;
        private _layers;
        /**
         * 构造函数，构造一个新的图层管理器
         *
         * @param viewer 主视图
         */
        constructor(globe: Globe);
        /**
         * 获取影像图层的数量
         *
         * @return {Number}
         */
        readonly length: any;
        /**
         * 添加影像图层
         *
         * @param {ImageLayer} layer 影像图层
         * @param {Number} [index] 索引
         */
        add(layer: ImageLayer, index?: number): void;
        /**
         * 获取影像图层
         * @param index 影像图层的索引
         */
        get(index: number): any;
        /**
         * 获取影像图层
         * @param name 影像图层的名称
         */
        get(name: string): any;
        /**
         * 移除影像图层
         *
         * @param index 图层的索引
         */
        remove(index: number): any;
        remove(name: string): any;
        remove(layer: ImageLayer): any;
        /**
         * 移除所有图层
         */
        removeAll(): void;
        /**
         * 移除所有图层
         */
        clear(): void;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 地球类
     */
    class Globe {
        private _scene;
        private _czData;
        private _czGlobe;
        private _images;
        private _tileLoadProgress;
        /**
         * 构造函数
         * @param viewer
         */
        constructor(scene: Scene);
        /**
         * 设置地形数据源
         *
         * @param options 包含如下属性
         * @param options.type 指定地形数据类型，包括（ZMapTerrain等）
         * @param options.data 指定地形数据
         */
        setTerrain(options: any): void;
        /**
         * @private
         */
        readonly _czglobe: any;
        /**
         * 获取影像图层集合
         */
        readonly images: ImageLayerCollection;
        /**
         * 地球上没有影像时的基本颜色
         */
        /**
        * 地球上没有影像时的基本颜色
        */
        baseColor: Color;
        /**
         * 是否启用深度监测
         */
        /**
        * 设置是否启用深度监测
        */
        enableDepthTest: boolean;
        /**
         * 获取是否启用光照
         */
        /**
        * 设置是否启用光照
        */
        enableLighting: boolean;
        /**
         * 获取是否启用水体效果
         */
        /**
        * 设置是否启用水体效果
        */
        enableWaterEffect: any;
        /**
         * 瓦片缓存大小，默认值：100
         */
        /**
        * 瓦片缓存大小，默认值：100
        */
        tileCacheSize: boolean;
        /**
         * 瓦片加载事件，当瓦片队列发生变化（增加或者减少）时触发事件。事件传递出瓦片队列的长度。
         * 事件原型 <code> function(length) {} </code>
         */
        readonly tileLoadProgress: Event;
        /**
         * 根据options 创建provider
         * @param options
         */
        private createProvider;
    }
}
declare namespace Cegore {
    /**
     * 抽象模型管理类，不能直接构造该对象
     */
    abstract class Model extends Renderable implements TreeItem {
        private _name;
        private _parent;
        /**
         * 模型可设置的属性
         */
        private static ModelPropList;
        /**
         * 构造函数，构造一个新的Model对象
         */
        constructor();
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * 获取模型的名称
         */
        /**
        * 设置模型的名称
        */
        name: string;
        /**
         * 获取父对象
         */
        readonly parent: ModelGroup;
        /**
         * 获取子对象列表，始终返回空数组
         */
        readonly children: TreeItem[];
        /**
         * 是否叶子对象，始终返回ture
         */
        readonly isLeaf: boolean;
        /**
         * 当被添加到ModelGroup中时调用，内部接口不要再外部调用
         * @private
         */
        onAdded(parent: ModelGroup): void;
        /**
         * 当被添从ModelGroup中移除时调用，内部接口不要再外部调用
         * @private
         */
        onRemoved(): void;
        /**
         * 当连接到根节点时调用，内部接口不要再外部调用
         * @private
         */
        onAttachRoot(): void;
        /**
         * 当与根节点断开时调用，内部接口不要再外部调用
         * @private
         */
        onDetachRoot(): void;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 模型组
     *
     * 管理模型分组
     */
    class ModelGroup implements TreeItem {
        private _name;
        private _parent;
        private _children;
        private _models;
        /**
         * 构造一个新的模型组
         * @param modelCollection
         */
        constructor(options?: any);
        /**
         * 获取模型集合
         */
        readonly models: ModelCollection;
        /**
         * 获取模型名称
         */
        readonly name: string;
        /**
         * 获取父节点
         */
        readonly parent: ModelGroup;
        /**
         * 获取子节点列表
         */
        readonly children: TreeItem[];
        /**
         * 返回是否叶子节点，对于模型组，该返回值总是 false
         */
        readonly isLeaf: boolean;
        /**
         * 添加模型到该模型组中
         * @param m
         */
        add(m: Model | ModelGroup): void;
        /**
         * 从模型组中移除该模型
         * @param m
         */
        remove(m: Model | ModelGroup): void;
        /**
         * 移除该模型组中所有模型
         */
        removeAll(): void;
        /**
         * @private
         * @param modelCollection
         */
        setModelCollection(modelCollection: ModelCollection): void;
        /**
         * @private
         * @param parent
         */
        onAdded(parent: ModelGroup): void;
        /**
         * @private
         */
        onRemoved(): void;
        /**
         * @private
         * 与根节点断开
         */
        onAttachRoot(): void;
        /**
         * @private
         * 连接到根节点
         */
        onDetachRoot(): void;
        /**
         *
         * @param mg
         * @param ms
         */
        private static getAllModels;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 模型集合
     */
    class ModelCollection {
        private _models;
        private _czData;
        private _DataSource;
        private _entities;
        private _root;
        /**
         * 构造函数
         * @param scene
         */
        constructor(scene: Scene);
        /**
         * 获取根节点
         */
        readonly root: ModelGroup;
        /**
         * 添加模型到根节点
         * @param m
         */
        add(m: Model | ModelGroup): void;
        /**
         * 从根节点删除模型
         */
        remove(m: Model | ModelGroup): void;
        /**
         * private
         * @param model
         */
        _onAddModel(model: Model): void;
        /**
         * private
         * @param model
         */
        _onRemoveModel(model: Model): void;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * Gltf模型
     */
    class GltfModel extends Model {
        private _czEntity;
        private _czModel;
        private _uri;
        private _enablePcik;
        private _minPixelSize;
        private _color;
        private _outlineColor;
        private _outlineSize;
        /**
         * 模型可设置的属性
         */
        private static GltfModelPropList;
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
        constructor(options: {
            uri?: string;
            enablePick?: boolean;
            minPixelSize?: number;
            color?: Color;
            outlineColor?: Color;
            outlineSize?: number;
            name?: string;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * 获取类型，返回 Model
         */
        readonly type: string;
        /**
         * 获取模型的数据的URI
         */
        /**
        * 指定模型数据的URI
        */
        uri: string;
        /**
         * 是否允许拾取
         */
        /**
        * 允许拾取
        */
        enablePick: boolean;
        /**
         * 获取模型显示的最小像素大小，当模型在屏幕上小于该值后将不再显示
         */
        /**
        * 设置模型显示的最小像素大小，当模型在屏幕上小于该值后将不再显示
        */
        minPixelSize: number;
        /**
         * 获取模型颜色
         */
        /**
        * 设置模型颜色
        */
        color: Color;
        /**
         * 获取模型轮廓线颜色
         */
        /**
        * 设置模型轮廓线颜色
        */
        outlineColor: Color;
        /**
         * 获取模型轮廓线宽度
         */
        /**
        * 设置模型轮廓线宽度
        */
        outlineSize: number;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 图形的抽象基类，不能直接构造该对象
     */
    abstract class Shape extends Model {
        private _material;
        private _fill;
        private _outline;
        private _outlineColor;
        private _outlineWidth;
        private _shadows;
        private _displayDistance;
        private static ShapePropList;
        /**
         * 构造一个新的Shape对象
         */
        constructor();
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * 获取内部图形
         * @private
         */
        protected abstract readonly _czShape: any;
        /**
         * 获取是否填充，默认值：true
         */
        /**
        * 设置是否填充，默认值：true
        */
        fill: boolean;
        /**
         * 获取当前图形的材质
         */
        /**
        * 设置当前图形的材质
        */
        material: Material;
        /**
         * 获取是否显示轮廓，默认值：false
         */
        /**
        * 设置是否显示轮廓，默认值：false
        */
        outline: boolean;
        /**
         * 获取轮廓线颜色，默认值：Color.BLACK
         */
        /**
        * 设置轮廓线颜色，默认值：Color.BLACK
        */
        outlineColor: Color;
        /**
         * 获取轮廓线宽度，默认值：1.0
         */
        /**
        * 设置轮廓线宽度，默认值：1.0
        */
        outlineWidth: number;
        /**
         * 获取阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
         */
        /**
        * 设置阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
        */
        shadows: ShadowMode;
        displayDistance: number;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 可以挤压成体的图形的抽象基类，不能直接构造该对象
     */
    abstract class ShapeExtruded extends Shape {
        private _height;
        private _extrudedHeight;
        private _rotation;
        private static ShapeExtrudedPropList;
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
        constructor(options?: {
            height?: number;
            extrudedHeight?: number;
            rotation?: number;
            fill?: boolean;
            material?: Material;
            outline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
            shadows?: ShadowMode;
            displayDistance?: number;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * 获取椭圆距离地表的高度，默认值：0
         */
        /**
        * 设置椭圆距离地表的高度，默认值：0
        */
        height: number;
        /**
         * 获取椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
         */
        /**
        * 设置椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
        */
        extrudedHeight: number;
        /**
         * 获取椭圆从正北方向逆时针旋转的角度，默认值：0
         */
        /**
        * 设置椭圆从正北方向逆时针旋转的角度，默认值：0
        */
        rotation: number;
    }
}
/**
 * end of file
 */ 
declare namespace Cegore {
    /**
     * 立方体模型对象
     */
    class BoxModel extends Shape {
        private _czEntity;
        private _czBox;
        private _dimensions;
        private static BoxPropList;
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
        constructor(options?: {
            dimensions?: Vector3 | number[] | {
                x: number;
                y: number;
                z: number;
            };
            fill?: boolean;
            material?: Material;
            outline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
            shadows?: ShadowMode;
            displayDistance?: boolean;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * @private
         */
        protected readonly _czShape: any;
        /**
         * 获取对象的类型
         */
        readonly type: string;
        /**
         * 获取模型的尺寸，返回值是一个Vector3，分别是立方体的长宽高，不要再外部修改该对象
         */
        /**
        * 设置立方体的尺寸
        */
        dimensions: Vector3;
    }
}
/**
 * end of file
 */
declare namespace Cegore {
    /**
     * 圆柱模型对象
     */
    class CylinderModel extends Shape {
        private _czEntity;
        private _czCylinder;
        private _length;
        private _topRadius;
        private _bottomRadius;
        private _slices;
        private _verticalLines;
        private static CylinderPropList;
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
        constructor(options?: {
            length?: number;
            topRadius?: number;
            bottomRadius?: number;
            slices?: number;
            verticalLines?: number;
            fill?: boolean;
            material?: Material;
            outline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
            shadows?: ShadowMode;
            displayDistance?: boolean;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * @private
         */
        protected readonly _czShape: any;
        /**
         * 获取对象的类型
         */
        readonly type: string;
        /**
         * 获取圆柱体的长度
         */
        /**
        * 设置圆柱体的长度
        */
        length: number;
        /**
         * 获取圆柱体的顶面变径
         */
        /**
        * 设置圆柱体的顶面半径
        */
        topRadius: number;
        /**
         * 获取圆柱体的底面变径
         */
        /**
        * 设置圆柱体的底面半径
        */
        bottomRadius: number;
        /**
         * 获取圆柱体边的数量，默认值：128
         */
        /**
        * 设置圆柱体边的数量，默认值：128
        */
        slices: number;
        /**
         * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
         */
        /**
        * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
        */
        verticalLines: number;
    }
}
/**
 * end of file
 */
declare namespace Cegore {
    /**
     * 椭圆模型对象
     */
    class EllipseModel extends ShapeExtruded {
        private _czEntity;
        private _czEllipse;
        private _semiMajorAxis;
        private _semiMinorAxis;
        private _slices;
        private _verticalLines;
        private static EllipsePropList;
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
        constructor(options?: {
            semiMajorAxis?: number;
            semiMinorAxis?: number;
            height?: number;
            extrudedHeight?: number;
            rotation?: number;
            slices?: number;
            verticalLines?: number;
            fill?: boolean;
            material?: Material;
            outline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
            shadows?: ShadowMode;
            displayDistance?: number;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * @private
         */
        protected readonly _czShape: any;
        /**
         * 获取对象的类型
         */
        readonly type: string;
        /**
         * 获取椭圆的长半轴长度
         */
        /**
        * 设置椭圆的长半轴长度
        */
        semiMajorAxis: number;
        /**
         * 获取椭圆的短半轴长度
         */
        /**
        * 设置椭圆的短半轴长度
        */
        semiMinorAxis: number;
        /**
         * 获取圆柱体边的数量，默认值：128
         */
        /**
        * 设置圆柱体边的数量，默认值：128
        */
        slices: number;
        /**
         * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
         */
        /**
        * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
        */
        verticalLines: number;
    }
}
/**
 * end of file
 */
declare namespace Cegore {
    /**
     * 椭球模型对象
     */
    class EllipsoidModel extends Shape {
        private _czEntity;
        private _czEllipsoid;
        private _semiMajorAxis;
        private _semiMinorAxis;
        private _height;
        private _extrudedHeight;
        private _rotation;
        private _slices;
        private _verticalLines;
        private static EllipsoidPropList;
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
        constructor(options?: {
            semiMajorAxis?: number;
            semiMinorAxis?: number;
            height?: number;
            extrudedHeight?: number;
            rotation?: number;
            slices?: number;
            verticalLines?: number;
            fill?: boolean;
            material?: Material;
            outline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
            shadows?: ShadowMode;
            displayDistance?: boolean;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * @private
         */
        protected readonly _czShape: any;
        /**
         * 获取对象的类型
         */
        readonly type: string;
        /**
         * 获取椭圆的长半轴长度
         */
        /**
        * 设置椭圆的长半轴长度
        */
        semiMajorAxis: number;
        /**
         * 获取椭圆的短半轴长度
         */
        /**
        * 设置椭圆的短半轴长度
        */
        semiMinorAxis: number;
        /**
         * 获取椭圆距离地表的高度，默认值：0
         */
        /**
        * 设置椭圆距离地表的高度，默认值：0
        */
        height: number;
        /**
         * 获取椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
         */
        /**
        * 设置椭圆的挤出高度，当设置这个参数后，椭圆将变成一个椭圆柱体
        */
        extrudedHeight: number;
        /**
         * 获取椭圆从正北方向逆时针旋转的角度，默认值：0
         */
        /**
        * 设置椭圆从正北方向逆时针旋转的角度，默认值：0
        */
        rotation: number;
        /**
         * 获取圆柱体边的数量，默认值：128
         */
        /**
        * 设置圆柱体边的数量，默认值：128
        */
        slices: number;
        /**
         * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
         */
        /**
        * 获取垂直线的数目，该参数用于轮廓线显示，默认值：16
        */
        verticalLines: number;
    }
}
/**
 * end of file
 */
declare namespace Cegore {
    /**
     * 多边形样式类型
     */
    enum PolylineStyle {
        /**
         * 普通样式
         */
        NONE = 0,
        /**
         * 炽热样式
         */
        GLOW = 1,
        /**
         * 轮库线样式
         */
        OUTLINE = 2,
        /**
         * 点划线样式
         */
        DASH = 3,
        /**
         * 箭头样式
         */
        ARROW = 4
    }
    /**
     * 折线对象
     */
    class PolylineModel extends Model {
        private _czEntity;
        private _czPolyline;
        private _positions;
        private _czPositions;
        private _dynamic;
        private _followSurface;
        private _color;
        private _color2;
        private _width;
        private _style;
        private _glow;
        private _outlineColor;
        private _outlineWidth;
        private _shadows;
        private _displayDistance;
        private static PolylinePropList;
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
        constructor(options?: {
            positions?: {}[];
            dynamic?: boolean;
            followSurface?: boolean;
            color?: Color;
            width?: number;
            style?: PolylineStyle;
            glow?: number;
            outlineWidth?: number;
            outlineColor?: Color;
            shadows?: ShadowMode;
            displayDistance?: boolean;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * @private
         */
        protected readonly _czShape: any;
        /**
         * 获取对象的类型
         */
        readonly type: string;
        /**
         * 获取顶点列表
         */
        /**
        * 设置顶点列表
        */
        positions: any;
        /**
         * 获取是否贴附地表
         */
        /**
        * 设置是否贴附地表
        */
        followSurface: boolean;
        /**
         * 获取颜色
         */
        /**
        * 设置颜色
        */
        color: Color;
        /**
         * 获取颜色
         */
        /**
        * 设置颜色
        */
        color2: Color;
        /**
         * 设置线宽
         */
        /**
        * 获取线宽
        */
        width: number;
        /**
         * 获取样式
         */
        /**
        * 设置样式
        */
        style: PolylineStyle;
        /**
         * 获取炽热度
         */
        /**
        * 设置炽热度
        */
        glow: number;
        /**
         * 获取轮廓线颜色，默认值：Color.BLACK
         */
        /**
        * 设置轮廓线颜色，默认值：Color.BLACK
        */
        outlineColor: Color;
        /**
         * 获取轮廓线宽度，默认值：1.0
         */
        /**
        * 设置轮廓线宽度，默认值：1.0
        */
        outlineWidth: number;
        /**
         * 获取阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
         */
        /**
        * 设置阴影模式，指出模型是否产生或者接受阴影，默认值：ShadowMode.DISABLE
        */
        shadows: ShadowMode;
        displayDistance: number;
    }
}
declare namespace Cegore {
    /**
     * 多边形的结构
     */
    class PolygonHierarchy {
        private _positions;
        private _holes;
    }
    /**
     * 多边形对象
     */
    class PolygonModel extends ShapeExtruded {
        private _czEntity;
        private _czPolygon;
        private _positions;
        private _czPositions;
        private _dynamic;
        private _usePositionHeight;
        private _closeTop;
        private _closeBottom;
        private static PolygonPropList;
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
        constructor(options?: {
            positions?: {}[];
            dynamic?: boolean;
            usePositionHeight?: boolean;
            closeTop?: boolean;
            closeBottom?: boolean;
            height?: number;
            extrudedHeight?: number;
            rotation?: number;
            fill?: boolean;
            material?: Material;
            outline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
            shadows?: ShadowMode;
            displayDistance?: number;
            visible?: boolean;
            position?: Position;
            orientation?: HeadingPitchRoll;
        });
        /**
         * 应用属性给当前对象
         */
        protected applyProps(props: any): void;
        /**
         * @private
         */
        readonly _czRenderable: any;
        /**
         * @private
         */
        protected readonly _czShape: any;
        /**
         * 获取对象的类型
         */
        readonly type: string;
        /**
         * 获取顶点列表
         */
        /**
        * 设置顶点列表
        */
        positions: any;
        /**
         * 获取是否使用顶点的高程值，默认值：false
         */
        /**
        * 设置是否使用定点高程值
        */
        usePositionHeight: boolean;
        /**
         * 获取是否封闭顶面
         */
        /**
        * 设置是否封闭顶面
        */
        closeTop: boolean;
        /**
         * 获取是否封闭底面
         */
        /**
        * 设置是否封闭底面
        */
        closeBottom: boolean;
    }
}
declare namespace Cegore {
    abstract class PrimitiveModel extends Renderable {
    }
}
declare namespace Cegore {
    /**
     * 标注类
     */
    class Label extends Renderable {
        private _creator;
        private _layer;
        private _name;
        private _events;
        private _czEntity;
        private _czText;
        private _czIcon;
        private mAutoOffset;
        /**
         * 构建一个新的标注对象
         *
         * @param options
         */
        constructor(options: any);
        /**
         * 内部接口
         * @private
         */
        readonly _czRenderable: any;
        /**
         * 返回类型，返回‘Type’
         */
        readonly type: string;
        /**
         * 获取标注的名称
         */
        readonly name: string;
        /**
         * 获取标注所在图层
         */
        readonly layer: string;
        /**
         * 获取标注文本
         */
        /**
        * 设置标注文本
        */
        text: any;
        /**
         * 获取图标
         */
        /**
        * 设置图标
        */
        icon: any;
        /**
         * 获取事件
         */
        readonly events: EventHandle;
        /**
         * 应用属性
         * @param val 属性值
         * @param tar 目标
         * @param name 目标属性名
         * @param type 属性类型
         */
        private _applyProp;
        /**
         * 应用文本属性
         * @private
         *
         * @param val
         * @param name
         * @param type
         */
        private _applyTextProp;
        /**
         * 应用文本属性
         * @private
         *
         * @param val
         * @param name
         * @param type
         */
        private _applyIconProp;
        /**
         * 设置文字
         * @param text 文本信息
         */
        setText(text: {
            title?: string;
            font?: string;
            size?: number;
            color?: string;
            border?: any;
            unit?: any;
        }): void;
        /**
         * 设置图标
         * @param icon
         */
        setIcon(icon?: {
            img?: string;
            scale?: number;
            color?: string;
            unit?: {
                offset?: number[];
            };
        }): void;
    }
}
declare namespace Cegore {
    /**
     * 标注集合
     */
    class LabelCollection {
        private _layers;
        private _scene;
        private _czData;
        private _czDataSource;
        private _czEntities;
        private mLabelEvent;
        private mCZHandle;
        /**
         * 构造函数
         *
         * @param viewer
         */
        constructor(scene: Scene);
        private onLabelMoveEvent;
        private onLabelClickEvent;
        /**
         * 获取对象
         * @private
         */
        private _getOrCreateLayer;
        /**
         * 获取对象
         * @private
         */
        private _getLayer;
        /**
         * 获取全局标注事件
         */
        readonly events: EventHandle;
        /**
         * 添加标注
         * @param label 标注对象
         */
        add(label: Label): Label;
        /**
         * 获取标注对象
         *
         * @param {String} name 标注的名称
         * @param {String} layer 标注的图层
         */
        get(name: string, layer?: string): Label;
        /**
         * 拾取标注
         *
         * @param {Number|Object} X屏幕坐标或者 坐标对象，或者数组
         * @param [Number] Y屏幕坐标
         */
        pick(xy: number[]): Label;
        pick(xy: {}): Label;
        /**
         * 删除标注
         * @param name 标注名称
         * @param layer 标注图层
         */
        remove(name: string, layer: string): any;
        /**
         * 删除标注
         * @param label 待删除的标注对象
         */
        remove(label: Label): any;
        /**
         * 根据名称和图层删除标注
         * @param {Object} label 标注的名称和图层
         */
        remove(label: {
            name: string;
            layer?: string;
        }): any;
        /**
         * 移除标注图层
         *
         * @param {String} layerName 图层的名称
         */
        removeLayer(layerName: any): void;
        /**
         * 移除所有标注
         */
        removeAll(): void;
        /**
         * 移除所有标注
         */
        clear(): void;
    }
}
/**
 * end of file LabelCollection
 */
declare namespace Cegore {
    /**
     * 场景的显示模式模式
     */
    enum SceneMode {
        /**
         * 哥伦布视图模式。
         * 一个2.5D透视视图。
         */
        COLUMBUS_VIEW,
        /**
         * 正在变形中
         */
        MORPHING,
        /**
         * 2D模式，使用从上向下的正射投影
         */
        SCENE2D,
        /**
         * 3D模式，一个传统的三维透视视图和地球
         */
        SCENE3D
    }
    /**
     * 阴影模式
     */
    enum ShadowMode {
        /**
         * 禁用阴影，不产生也不接受阴影
         */
        DISABLED,
        /**
         * 启用阴影，产生和接受阴影
         */
        ENABLED,
        /**
         * 仅产生阴影
         */
        CAST_ONLY,
        /**
         * 仅接受阴影
         */
        RECEIVE_ONLY
    }
    /**
     * 场景管理器
     *
     * 场景管理器负责管理所有的三维图形对象和状态，场景管理器不需要直接创建，通过 Viewer.scene 获取场景管理器对象
     *
     * @see
     * Viewer
     */
    class Scene {
        private _viewer;
        private _czData;
        private _czScene;
        private _globe;
        private _models;
        private _labels;
        /**
         * 构造函数，构造一个新的场景对象
         *
         * 不要自己构造 Scene 对象，通过Viewer.scene获取场景对象
         *
         * @param viewer 视图类
         */
        constructor(viewer: Viewer);
        /**
         * @private
         */
        readonly _czdata: any;
        /**
         * 获取当前场景的显示模式
         */
        /**
        * 设置当前场景的显示模式
        */
        mode: SceneMode;
        /**
         * 获取全球对象
         */
        readonly globe: Globe;
        /**
         * 获取模型集合
         */
        readonly models: ModelCollection;
        /**
         * 获取标注集合
         */
        readonly labels: LabelCollection;
        /**
         * 是否启用雾效，默认值：true
         */
        /**
        * 是否启用雾效，默认值：true
        */
        enableFog: boolean;
        /**
         * 雾的浓度，默认值：2.0e-4
         */
        /**
        * 雾的浓度，默认值：2.0e-4
        */
        fogDensity: number;
        /**
         * 是否启用全屏抗锯齿，默认值：true
         */
        /**
        * 是否启用全屏抗锯齿，默认值：true
        */
        enableFXAA: boolean;
        /**
         * 地形缩放系数
         */
        /**
        * 地形缩放系数
        */
        terrainScale: number;
        private _preRender;
        private _poseRender;
        /**
         * 准备绘制事件，事件传递出当前时间
         * 事件原型 <code> function(time) {} </code>
         * @event
         */
        readonly preRender: Event;
        /**
         * 绘制后事件，事件传递出当前时间
         * 事件原型 <code> function(time) {} </code>
         * @event
         */
        readonly postRender: Event;
        private _isUnderWater;
        private _UnderWaterMaterial;
        private static readonly _GlobeFog;
        /**
         * 获取是否水下模式
         */
        /**
        * 设置是否启用水下模式
        */
        underWater: boolean;
        /**
         * 拾取三维场景中位于指定屏幕坐标处的一个对象，
         *
         * @description
         * 该接口只返回一个最外层的对象，如果需要拾取多个对象，请使用 pickMulti() 接口
         *
         * @see
         * pickMulti()
         *
         * @param x 屏幕坐标x
         * @param y 屏幕坐标y
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pick(x: any, y: any): Renderable | undefined;
        /**
         * 拾取三维场景中位于指定屏幕坐标处的一个对象，
         *
         * @description
         * 该接口只返回一个最外层的对象，如果需要拾取多个对象，请使用 pickMulti() 接口
         *
         * @see
         * pickMulti()
         *
         * @param xyArray 屏幕坐标数组
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pick(xyArray: number[]): Renderable | undefined;
        /**
         * 拾取三维场景中位于指定屏幕坐标处的一个对象，
         *
         * @description
         * 该接口只返回一个最外层的对象，如果需要拾取多个对象，请使用 pickMulti() 接口
         *
         * @see
         * pickMulti()
         *
         * @param xyObj 屏幕坐标对象
         * @param xyObj.x x坐标
         * @param xyObj.y y坐标
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pick(xyObj: {
            x: number;
            y: number;
        }): Renderable | undefined;
        /**
         * 拾取三维场景中位于指定屏幕坐标处的一个对象，
         *
         * @description
         * 该接口只返回一个最外层的对象，如果需要拾取多个对象，请使用 pickMulti() 接口
         *
         * @see
         * pickMulti()
         *
         * @param vector2 屏幕坐标对象
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pick(vector2: Vector2): Renderable | undefined;
        /**
         * 返回位于屏幕坐标处的对象列表
         *
         * @description
         * 该接会返回多个对象，如果只需要一个对象，请使用 pick() 接口
         *
         * @see
         * pick()
         *
         * @param x 屏幕坐标x
         * @param y 屏幕坐标y
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pickMulti(x: any, y: any): Renderable[];
        /**
         * 返回位于屏幕坐标处的对象列表
         *
         * @description
         * 该接会返回多个对象，如果只需要一个对象，请使用 pick() 接口
         *
         * @see
         * pick()
         *
         * @param xyArray 屏幕坐标数组
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pickMulti(xyArray: number[]): Renderable[];
        /**
         * 返回位于屏幕坐标处的对象列表
         *
         * @description
         * 该接会返回多个对象，如果只需要一个对象，请使用 pick() 接口
         *
         * @see
         * pick()
         *
         * @param xyObj 屏幕坐标对象
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pickMulti(xyObj: {
            x: number;
            y: number;
        }): Renderable[];
        /**
         * 返回位于屏幕坐标处的对象列表
         *
         * @description
         * 该接会返回多个对象，如果只需要一个对象，请使用 pick() 接口
         *
         * @see
         * pick()
         *
         * @param vector2 屏幕坐标对象
         * @return 返回拾取到的Renderable对象或者undefined
         */
        pickMulti(vector2: Vector2): Renderable[];
        /**
         * 拾取屏幕位置处的空间坐标
         *
         * @param x 屏幕坐标x
         * @param y 屏幕坐标y
         * @return 返回空间坐标
         */
        pickPosition(x: number, y: number): Position;
        /**
         * 拾取屏幕位置处的空间坐标
         *
         * @param xyArray 屏幕坐标数组
         * @return 返回空间坐标
         */
        pickPosition(xyArray: number[]): Position;
        /**
         * 拾取屏幕位置处的空间坐标
         *
         * @param xyObj 屏幕坐标对象
         * @return 返回空间坐标
         */
        pickPosition(xyObj: {
            x: number;
            y: number;
        }): Position;
        /**
         * 拾取屏幕位置处的空间坐标
         *
         * @param vector2 屏幕坐标对象
         * @return 返回空间坐标
         */
        pickPosition(vector2: Vector2): Position;
        /**
         * 计算平面距离
         *
         * @param pts 点列表，数据格式：
         *  [[x1,y1],[x2,y2],...]
         *  [{x:x1, y:y1}, {x:x2, y:y2}, ...]
         *  [Position, Position, Position]
         *  等
         */
        calcDistance(pts: any[]): number;
        /**
         * 计算地球表面上多边形的投影面积
         * @param pts 多边形的点序列，数据格式：
         *  [[x1,y1],[x2,y2],...]
         *  [{x:x1, y:y1}, {x:x2, y:y2}, ...]
         *  [Position, Position, Position]
         *  等
         */
        calcArea(pts: any[]): number;
        /**
         * 解析二维坐标
         * @param p1
         * @param p2
         */
        private static asCartesian2;
    }
}
/**
 * End of file
 */ 
declare namespace Cegore {
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
    class Viewer {
        private _czData;
        private _camera;
        private _scene;
        private _clock;
        /**
         * 获取版本信息
         */
        static readonly version: string;
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
        constructor(container: string | HTMLDocument, options?: {
            terrain?: any;
            images?: ImageLayer[];
            currentTime?: Date;
            shadows?: boolean;
            fullscreenButton?: boolean;
            fullscreenElement?: HTMLDocument;
            shouldAnimate?: boolean;
            animation?: boolean;
            baseLayerPicker?: boolean;
            homeButton?: boolean;
            geocoder?: boolean;
            navigationHelpButton?: boolean;
            imageryProvider?: boolean;
            timeline?: boolean;
            sceneModePicker?: boolean;
            selectionIndicator?: boolean;
            infoBox?: boolean;
            czops?: any;
        });
        /**
         * @private
         * @inner
         */
        readonly _czdata: any;
        /**
         * 获取相机
         */
        readonly camera: Camera;
        /**
         * 获取场景管理器
         */
        readonly scene: Scene;
        /**
         * 获取模型集合
         */
        readonly models: ModelCollection;
        /**
         * 获取标注集合
         */
        readonly labels: LabelCollection;
        /**
         * 获取球对象
         */
        readonly globe: Globe;
        /**
         * 获取影像图层
         */
        readonly images: ImageLayerCollection;
        /**
         * 获取时钟对象
         */
        readonly clock: Clock;
        /**
         * 获取用于绘图的Canvas元素
         */
        readonly canvas: HTMLCanvasElement;
        /**
         * 自定义cesium脚本路径，否则Cesium会初始化失败
         */
        private static cesiumScriptRegex;
        /**
         * 获取根url
         */
        static getBaseUrlFromScript(): string;
    }
}
declare namespace Cegore {
    /**
     * 抽象影像Provider
     */
    abstract class AbstractImageProvider {
        protected _ready: boolean;
        protected _readyPromise: any;
        protected _rectangle: any;
        protected _tileWidth: number;
        protected _tileHeight: number;
        protected _minimumLevel: number;
        protected _maximumLevel: number;
        protected _tilingScheme: any;
        protected _tileDiscardPolicy: any;
        protected _errorEvent: any;
        protected _credit: any;
        protected _proxy: any;
        protected _hasAlphaChannel: boolean;
        /**
         * 表示当前Provider是否准备好了
         */
        readonly ready: boolean;
        /**
         * Gets a promise that resolves to true when the provider is ready for use.
         * @memberof ImageryProvider.prototype
         * @type {Promise.<Boolean>}
         * @readonly
         */
        readonly readyPromise: any;
        /**
         * 获取数据的范围信息
         */
        readonly rectangle: any;
        /**
         * 获取每个瓦片的像素宽度
         */
        readonly tileWidth: number;
        /**
         * 获取每个瓦片的像素高度
         */
        readonly tileHeight: number;
        /**
         * 获取当前Provider支持的最笑级别
         */
        readonly minimumLevel: number;
        /**
         * 获取当前Provider支持的最大级别
         */
        readonly maximumLevel: number;
        /**
         * 获取当前瓦片的切片方案
         */
        readonly tilingScheme: any;
        readonly tileDiscardPolicy: any;
        readonly errorEvent: any;
        readonly credit: any;
        /**
         * 获取代理信息
         */
        readonly proxy: any;
        /**
         * 获取当前图层是否包含透明信息
         */
        readonly hasAlphaChannel: boolean;
        getTileCredits(x: number, y: number, level: number): any;
        /**
         * 请求图像数据
         * @param x 列号
         * @param y 行号
         * @param level 等级
         * @param request 可以选的请求对象
         */
        abstract requestImage(x: number, y: number, level: number, request?: any): any;
        /**
         * 拾取要素数据
         * @param x
         * @param y
         * @param level
         * @param longitude
         * @param latitude
         */
        pickFeatures(x: number, y: number, level: number, longitude: number, latitude: number): any;
    }
}
/**
 *
 */
declare namespace Cegore {
}
declare namespace Cegore {
}
/**
 * end of file
 */ 
declare namespace Cegore {
}
/**
 * end of file
 */ 
declare namespace Cegore {
}
/**
 * end of file
 */ 
declare namespace Cegore {
}
declare namespace Cegore {
    class ZMapModelLoader {
        private static LoadModel;
        /**
         * 加载发布的模型数据
         * @param name
         * @param url
         * @param options
         */
        static LoadFromPubModel(name: any, url: any, options?: {
            offset?: {};
        }): ModelGroup;
    }
}
/**
 * end of file
 */ 
