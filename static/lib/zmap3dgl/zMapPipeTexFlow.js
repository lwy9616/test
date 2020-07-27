
var Map3DSDK = Map3DSDK || {};

(function(){

    /// 
    var isDef = function(value){
        return value !== undefined && value !== null;
    };

    var defVal = function(value, defaut) {
        if (value !== undefined && value !== null) {
            return value;
        }
        return defaut;
    };

    /// 
    var width = 512;
    var height = 512;

    /// 基于巷道的纹理动画
    var PipeTexFlow = function(options){

        if (!isDef(options.scene)) throw "no scene param!";
        if (!isDef(options.dirs)) throw "no dirs param!";
        if (!isDef(options.model)) throw "no model param!";

        /// 
        var that = this;

        /// 贴图
        var url = defVal(options.image, 'images/arrow.png');
        
        /// 
        this.scene = options.scene;
        this.dirs = options.dirs;
        this.models = options.model;
        if (!(this.models instanceof Array)) 
        {
            this.models = [options.model];
        }

        /// 
        this.canvas = createCanvas();
        this.ctx = this.canvas.getContext('2d');

        ///  
        /// 创建纹理
        this.tex1 = createTexture(this.scene._context);
        this.tex2 = createTexture(this.scene._context);

        /// 
        this.image = new Image();
        this.image.onload = function() {
            drawStep(that, 0);
        };

        this.image.src = url;
        this.pos = 0;

        /// 
        this.uniforms = [];
    };

    /**
     * 显示动态纹理
     */
    PipeTexFlow.prototype.show = function()
    {
        if (this.uniforms.length > 0) return;

        var that = this;

        function get_1 () { return that.tex1; }
        function get_2 () { return that.tex2; }
        
        forEachPri(this.scene.primitives, function(p){
            if (indexOf(that.models, p.id) != -1)
            {
                var cmds = p._nodeCommands;
                for (var i = 0; i < cmds.length; ++i)
                {
                    var c = cmds[i].command;
                    that.uniforms.push([c._uniformMap, c._uniformMap.u_baseColorTexture]);
                    cmds[i].command._uniformMap.u_baseColorTexture = that.dirs[c.owner.mesh.name] ? get_1 : get_2;
                }
            }
        });
    };

    /**
     * 隐藏动态纹理（还原）
     */
    PipeTexFlow.prototype.hide = function(){
        if (this.uniforms.length == 0) return;

        var un = this.uniforms;
        for (var i = 0; i < un.length; ++i)
        {
            var u = un[i];
            u[0].u_baseColorTexture = u[1];
        }

        un.length = 0;
    };

    /**
     * 开始动画
     */
    PipeTexFlow.prototype.start = function() {
        if (this.loopHandle) return;

        var that = this;
        this.loopHandle = setInterval(() => {
            drawStep(that, 30);
        }, 50);
    };

    /**
     * 停止动画
     */
    PipeTexFlow.prototype.stop = function() {
        if (!this.loopHandle) return;

        clearInterval(this.loopHandle);
        this.loopHandle = 0;
    };

    /**
     * 遍历所有Primitive
     * @param {PrimitiveCollection} ps 
     * @param {function} cb 回调函数
     */
    function forEachPri(ps, cb)
    {
        var p,i = 0;
        for (; i < ps.length; ++i)
        {
            p = ps.get(i);
            if (p instanceof Cesium.PrimitiveCollection)
            {
                forEachPri(p, cb);
            }
            else
            {
                cb(p);
            }
        }
    }

    function indexOf(ar, it)
    {
        for (var i = 0; i < ar.length; ++i)
        {
            if (ar[i] === it) return i;
        }

        return -1;
    }

    /**
     * 绘制一帧动画
     * @param {PipeTexFlow} ptf 
     * @param {Number} step 步长 
     */
    function drawStep(ptf, step)
    {
        var img = ptf.image;
        var ctx = ptf.ctx;
        var pos = ptf.pos = (ptf.pos + step) % width;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, pos - width, 0, width, height);
        ctx.drawImage(img, pos, 0, width, height);
        ptf.tex1.copyFrom(ptf.canvas);

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, 0);
        ctx.scale(-1, 1);
        ctx.translate(-width / 2, 0);
        ctx.drawImage(img, pos + width, 0, -width, height);
        ctx.drawImage(img, pos, 0, -width, height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ptf.tex2.copyFrom(ptf.canvas);
    }

    /**
     * 创建画布
     */
    function createCanvas(){
        var canvas = document.createElement('CANVAS');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };

    /**
     * 创建纹理对象
     * @param {*} ctx 
     */
    function createTexture(ctx)
    {
        return new Cesium.Texture({
            context: ctx,
            width : width,
            height : height,
            preMultiplyAlpha: false,
            flipY : false,
            sampler: new Cesium.Sampler({
                wrapS: Cesium.TextureWrap.REPEAT,
                wrapT: Cesium.TextureWrap.REPEAT,
            })
        });
    }

    Map3DSDK.PipeTexFlow = PipeTexFlow;

})();
