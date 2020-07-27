
/**
 * 三维接口对象
 */
// var zMapglCtrl;

/**
 * 通用操作接口
 */
var zMapGLAPI = function (view3D)
{
	this.viewer = view3D;
	this.vol = null;
}

/**
 * 通用操作对象
 */
//var zMapGLCtrl = new zMapGLAPI();

/*
 * 生成体模型
 *
 * @param type 操作类型
 * @param param1 生成模型的参数，不可空
 * @param param2 附加参数，可空
 */
zMapGLAPI.prototype.newVol = function (type, param1, param2)
{
    if (this.viewer != undefined)
    {
    	// var paramArr = param1.split("|");
    	// var modelUrl  = paramArr[0].split("url:")[1].split("?")[0];
    	// paramArr = paramArr.splice(1,paramArr.length - 1);
    	//var raderParam = maxView;
    	//raderParam["url"] = modelUrl;
    	// for(var i = 0; i < paramArr.length; i++)
    	// {
    	// 	var data = paramArr[i];
    	// 	raderParam[data.split(":")[0]] = data.split(":")[1] ;
    	// }
	    var vol = new ZMap3D.MapVolume(this.viewer, {box: param1.box, scale: [1, 1, 1], offset: [0, 0, 10000], url: param1.url});
	    vol.InitShader();
	    vol.ShowVolume();
	    this.vol = vol;
    }  
}

/*
 * 设置模型偏移
 *
 * @param offsetParam array 偏移参数 传空时默认为[0,0,0]
 */
zMapGLAPI.prototype.setupOffset = function (offsetH)
{
    var vol = this.vol;
    if(vol != undefined)
    {
        vol.SetOffset([0, 0, offsetH]);
    }
    else
    {
    	return;
    }  
}

/*
 * 设置模型高程缩放
 *
 * @param scaleParam object 缩放参数 传空时默认为{zscale: 1} 只设置z方向的缩放
 * @param param1 生成模型的参数
 * @param param2 附加参数，可空
 */
zMapGLAPI.prototype.setupScale = function (scaleParam)
{
    var vol = this.vol;
    if(vol != undefined)
    {
        vol.SetScale([1, 1, scaleParam]);
    }
    else
    {
    	return;
    }  
}

/*
 * 设置模型清晰度
 *
 * @param clarityParam int 清晰度参数 传空时默认为3 流畅，1为极速，4为清晰
 * @param param1 生成模型的参数
 * @param param2 附加参数，可空
 */
zMapGLAPI.prototype.setupClarity = function (clarityParam, param1, param2)
{
    var vol = this.vol;
    if(vol != undefined)
    {

    }
    else
    {
    	return;
    }  
}

/*
 * 清除体模型
 *
 */
zMapGLAPI.prototype.claerVol = function ()
{
    var vol = this.vol;
    if(vol != undefined)
    {
    	vol.Destroy();
    }
    else
    {
    	return;
    }  
}  

zMapGLAPI.prototype.getVol = function ()
{
    return this.vol;
}


