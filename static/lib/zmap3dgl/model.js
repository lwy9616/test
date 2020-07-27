/**
 * 点线面测量工具
 * 
 * 使用的两种方法：
 * 1. 使用本工具加载模型 modelTool.loadModels(obj)
 * 然后采用以下代码进行动画操作
 * var u = modelTool.getUps(ups)
 * modelTool.up(u)
 * 2. 模型已经加载，将模型（数组）载入到工具内
 * models.push(zmapgltf.addModel({
		modelid:file,
		drotate:[0,0,-180],
		fcolor:"rgba(255,0,0,.5)",
		shadows:true,
		url:path+file,
		dminimumPixelSize:1.0,
		dmaximumScale:1.0,
		ifFlyTo:false
	},index == 0))
 * var u = modelTool.setModels(models).getUps(ups)	//model 表示
 * modelTool.up(u)
 */
;(function($){

var Tool = {
    GmMap3D:null,	//GmMap3D
    inited:false,	//加载
    map3DView:null,	//map3DView
    viewer:null,	//视口
    models: [],		//模型实体
    /**
     * 工具初始化（初始化之后才能使用）
     * @param {Object} GmMap3D Cesium实例
     * @param {Object} viewer Viewer实例
     * @param {Node} toolbar 一个DOM节点  用于界面的展示，自定义展示界面可以为空
     */
    init:function(GmMap3D,map3DView){
    	if(!this.inited){
    		this.GmMap3D = GmMap3D
    		this.map3DView = map3DView;
    		this.viewer = map3DView.cesium.viewer;
    		this.zmapgltf = new ZMAPGLTF(map3DView)
    		this.inited = true
    	}
        return this
    },
    /**
     * 加载模型，会使用obj.files各项作为每个模型的id，获取模型方法也通过id来匹配模型
     * @param {Object} obj 具有一定格式的对象{files:'一个所有gltf文件名称的数组',path:'文件夹路径'}
     */
    loadModels: function(obj,position){
    	position = position || [0,0,0]
    	obj.files.sort().forEach(function(item,index){
			var file = item,path = obj.path
			var count = 0
			this.models.push(this.zmapgltf.addModel({
				modelid:file.split('.')[0],	//设置文件名为模型的id（不包括后缀）
				drotate:[0,0,180],
				position:position,
				fcolor:"rgba(255,0,0,.5)",
				shadows:true,
				url:path+file,
				dminimumPixelSize:1.0,
				dmaximumScale:1.0,
				ifFlyTo:false
			},index === 0))
		},this)
    	return this._setOriginHeight()
    },
//  modelLoaded: function(){
//  	return this.models.every(function(i){
//  		return i.ready === true
//  	})
//  },
    /**
     * 设置模型
     * @param {Array} models 模型实体数组
     */
    setModels: function(models){
    	this.models = models
    	return this._setOriginHeight()
    },
    /**
     * 根据模型id获取模型
     * @param {Number || String} id 模型id
     * @return {Object} 模型实体
     */
    getModel: function(id){
    	return this.models.filter(function(item){
    		return item._id === id
    	})[0]
    },
	/**
     * 高亮模型并飞入
     * @param {Object} entity 模型实体
     * @param {Object} color 颜色对象
     */
    flyWithLight:function(entity,color){
    	//this.setColor(entity,color).viewer.zoomTo(entity)
    	this.setColor(entity,color)
    	this.map3DView.lockedModel(entity)
    	var _this = this;
    	setTimeout(function(){		//锁定之后会将视角移到模型上面，延迟解除锁定
    		_this.map3DView.unLockModel()    		
    	},100)
    	return this
    },    /**
     * 给模型设置颜色（只允许设置颜色，模型会有黄色的包围边）
     * @param {Object} entity 模型实体 通过getModel获取
     * @param {Object} color 颜色 Cesuim的颜色对象 默认灰色
     */
    setColor:function(entity,color){
    	entity.model.color = color || Cesium.Color.GRAY
    	entity.model.silhouetteColor = new Cesium.Color(1, 1, 0, 1)
    	entity.model.silhouetteSize = 3
    	return this
    },
    /**
     * 清除某个模型的颜色
     * @param {Object} entity 模型实体
     */
    cleanColor:function(entity){
    	entity.model.color = null
    	entity.model.silhouetteColor = null
    	entity.model.silhouetteSize = 0
    	return this
    },
    /**
     * 清除所有模型的发光效果
     */
    cleanAllColor:function(){
    	this.models.forEach(function(item){
    		this.cleanColor(item)
    	},this)
    },
//  /**
//   * 根据模型获取模型坐标
//   * @param {Object} model 模型实体
//   * @return {Array} [lng,lat,height]
//   */
//  getModelPosition: function(model){
//  	return this._cartographic2(model._position._value)
//  },
    /**
     * 根据模型id获取模型坐标
     * @param {Number || String} id 模型id
     * @return {Array} [lng,lat,height]
     */
//  getModelPosition: function(id){
//  	var model = this.offsets.filter(function(item){
//  		return item.name === id
//  	})[0]
//  	return {
//  		lng:model['x'],
//  		lat:model['y'],
//  		hei:model['z'],
//  	}
//  },
    /**
     * 设置原始高度 绑定到原始对象上面
     */
    _setOriginHeight:function(){
    	this.models.forEach(function(item){
    		if(item.hasOwnProperty('default_hei'))	//已经存在某个默认属性时 不更新所有默认属性
    			return;
    		var p = this._cartographic2(item._position._value)
    		item['default_lng'] = p[0]
    		item['default_lat'] = p[1]
    		item['default_hei'] = p[2]
    	},this)
    	return this
    },
    /**
     * 向上动画（z轴正方向）
     * @param {Array} u 模型数组
     * @param {Number} o 偏移量
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    up:function(u,o,c){
    	return this._animate(u,{z:o||5},c)
    },
    /**
     * 向下动画（z轴负方向）
     * @param {Array} u 模型数组
     * @param {Number} o 偏移量
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    down:function(u,o,c){
    	return this._animate(u,{z:-o||-5},c)
    },
    /**
     * 向左动画（x轴负方向）
     * @param {Array} u 模型数组
     * @param {Number} o 偏移量
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    left:function(u,o,c){
    	return this._animate(u,{x:-o||-5},c)
    },
    /**
     * 向右动画（x轴正方向）
     * @param {Array} u 模型数组
     * @param {Number} o 偏移量
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    right:function(u,o,c){
    	return this._animate(u,{x:o||5},c)
    },
    /**
     * 向前动画（y轴正方向）
     * @param {Array} u 模型数组
     * @param {Number} o 偏移量
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    front:function(u,o,c){
    	return this._animate(u,{y:o||5},c)
    },
    /**
     * 向后动画（y轴负方向）
     * @param {Array} u 模型数组
     * @param {Number} o 偏移量
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    behind:function(u,o,c){
    	return this._animate(u,{y:-o||-5},c)
    },
    /**
     * 动画
     * @param {Array} u 模型数组
     * @param {Object} o 偏移量对象{x:Number,y:Number,z:Number}
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     */
    animate:function(u,o,c){
    	return this._animate(u,o,c)
    },
    /**
     * 还原模型
     * @param {Function} animate 动画特效，默认采用Cubic.easeInOut
     * @param {Array} models 模型数组，可以为空，默认为所有的模型
     */
    revert:function(animate,models){
    	var m = models || this.models;
    	var max = m.map(function(it){
    		return {
    			x: it['default_lng'],
    			y: it['default_lat'],
    			z: it['default_hei'],
    		}
    	})
    	this._animate(m,0,animate,max)
    },
    /**
     * 【私有】动画效果实现
     * @param {Array} u 模型数组
     * @param {Object} o 偏移量对象
     * @param {Function} c 动画特效，默认采用Cubic.easeInOut
     * @param {Array} max 模型目标位置的数组 [{x:110.0000,y:30.000,20},{x:110.0000,y:30.000,20},{x:110.0000,y:30.000,20}] 顺序与u保持一致，使用max的时候 {o} 偏移量对象无效。这个可以实现无序爆炸
     */
    _animate: function(u,o,c,max){
		var start = 0, during = 100;
		var _this = this
		var OFFSETX = o.x || 0;	//整个动画的x偏移量
		var OFFSETY = o.y || 0;	//整个动画的y偏移量
		var OFFSETZ = o.z || 0;	//整个动画的z偏移量100000
		var MAX = max || u.map(function(it){
			var p = _this._cartographic2(it._position._value,0)
			return {
				x:p[0]+OFFSETX/100000,	//除以十万能大概算出偏移的经纬度
				y:p[1]+OFFSETY/100000,
				z:p[2]+OFFSETZ,
			}
		})
		var _run = function() {
	        start++;
	        //var top = Tween.Bounce.easeOut(start, objBall.top, 500 - objBall.top, during);
	        
	        u.forEach(function(item,index){
	        	var pos = _this._cartographic2(item._position._value,0)		//当前点位
	        	var ani = c || Math.tween.Cubic.easeInOut
	        	var offsetx = ani(start, pos[0], MAX[index].x-pos[0], during)
	        	var offsety = ani(start, pos[1], MAX[index].y-pos[1], during)
	        	var offsetz = ani(start, pos[2], MAX[index].z-pos[2], during)
	        	pos[0] = offsetx
	        	pos[1] = offsety
	        	pos[2] = offsetz
    			_this.zmapgltf.changePosition(item,pos,false)
    		})
	        //ball.css("top", top);
	        if (start < during) requestAnimationFrame(_run);
	    };
	    _run();
    },
    /**
     * 获取gltf实体
     * @param {String} file 文件名【'demos.gltf'】
     * @paramt {String} path 文件夹【'./gltf/','d:/demos/gltf'】
     * @return {Object} 构造的模型实体对象，使用ZMAPGLTF中的addModel进行添加模型操作
     */
	getGlObj: function(file,path){
		return {
			modelid:file,
			drotate:[0,0,-180],
			fcolor:"rgba(255,0,0,.5)",
			shadows:true,
			url:path+file,
			dminimumPixelSize:1.0,
			dmaximumScale:1.0,
			ifFlyTo:false
		}
	},
    /**
	 * 获取需要爆炸的模型
	 * @param {Array} 模型id数组
	 * @return {Array} 模型实体数组
	 */
	getUps: function(arr){
		var ups = []
		var seed = 0
		this.models.forEach(function(item,index){
			arr.forEach(function(a){
				if(a == item._id)
					ups.push(item)
			})
		})
		return ups
	},
	/**
     * 在屏幕上显示消息
     * @param {Sting} msg 消息内容
     * @param {Number} delay 延迟消失的时间（毫秒）
     * @return {} Undefined
     */
//	msg:function(msg,delay){
//		var $msg = $('<div class="zmap-msg-panel-wapper"><div class="zmap-msg-panel">'+
//			msg+'</div></div>')
//		$("body").append($msg)
//		var _this = this
//		setTimeout(function(){
//			$msg.addClass('zmap-msg-panel-hide')
//			$msg.on(_this.transitionEnd,function(){
//				$msg.remove()
//			})
//		},delay || 500)
//	},
	/**
	 * 笛卡尔三维转经纬度高度
	 * @param {Object} pos 笛卡尔坐标
	 * @return {Object} 经纬度高度对象
	 */
	_cartographic:function(pos){
		var ellipsoid=this.viewer.scene.globe.ellipsoid;
		var cartographic=ellipsoid.cartesianToCartographic(pos);
		var lat=this.GmMap3D.Math.toDegrees(cartographic.latitude);
		var lng=this.GmMap3D.Math.toDegrees(cartographic.longitude);
		var hei=cartographic.height;
		return {
			lat:lat,
			lng:lng,
			hei:hei,
		}
	},
	/**
	 * 笛卡尔三维转经纬度高度(添加高度偏移量参数)
	 * @param {Object} pos 笛卡尔坐标
	 * @param {Number} offset 高度偏移量
	 * @return {Array} 经纬度高度对象
	 */
	_cartographic2:function(pos,offset){
		var ellipsoid=this.viewer.scene.globe.ellipsoid;
		var cartographic=ellipsoid.cartesianToCartographic(pos);
		var lat=GmMap3D.Math.toDegrees(cartographic.latitude);
		var lng=GmMap3D.Math.toDegrees(cartographic.longitude);
		var hei=cartographic.height;
		return [
			lng,
			lat,
			hei+(offset||0),
		]
	},
	/**
	 * 创建默认的UI界面（会创建默认的DOM 样式 和事件绑定） <br>
	 * 用户使用自定义的UI界面请勿调用 <br>
	 * @return 工具本身
	 */
	createDefaultUI:function(){
		return this._createDefaultDOM()._createDefaultStyle()._createDefaultBinding()
	},
	/**
	 * 【私有】 创建默认的DOM <br>
	 * @return 工具本身
	 */
	_createDefaultDOM:function(){
		 var htmlCodes = [
		 '	<div class="zmap-toolbar">',
		 '		<div class="bottom">',
		 '			<input type="button" name="" id="" value="全部还原" onclick="javascript:modelTool.revert();"/>',
		 '		</div>',
		 '	</div>',
		
		 ].join("");
		 $("body").append(htmlCodes)
		return this
	},
	/**
	 * 【私有】 创建默认的样式 <br>
	 * @return 工具本身
	 */
	_createDefaultStyle:function(){
		var cssCodes = [
		'<style>',
		'    	.zmap-msg-panel-wapper {',
		'			padding: 8px;',
		'		    text-align: center;',
		'		    font-size: 14px;',
		'		    color: white;',
		'		    transition: all .3s ease-in-out;',
		'		    z-index: 200;',
		'		}',
		'		.zmap-msg-panel {',
		'			display: inline-block;',
		'		    pointer-events: all;',
		'		    padding: 8px 16px;',
		'		    border-radius: 4px;',
		'		    box-shadow: 0 1px 6px rgba(0,0,0,.2);',
		'		    background: #00e09e;',
		'		    position: relative;',
		'		}',
		'		.zmap-msg-panel-hide {',
		'			height: 0;',
		'			padding: 0;',
		'			opacity: 0;',
		'		}',
		'</style>',
		].join("");
		var cssCodes2 = [
		'<style>',
		'		.zmap-toolbar #toolbar {',
		'			background: rgba(42, 42, 42, 0.8);',
		'		    padding: 4px;',
		'		    border-radius: 4px;',
		'		    position: absolute;',
		'		    top: 10%;',
		'		    color: white;',
		'		    left: 2%;',
		'		    display: none;',
		'	    }',
		'	    .zmap-toolbar #toolbar input,.zmap-toolbar #toolbar select {',
		'	        vertical-align: middle;',
		'	        padding-top: 2px;',
		'	        padding-bottom: 2px;',
		'	    }',
		'		.zmap-toolbar #toolbar input[type=\'button\']{',
		'		    width: 100%;',
		'		    background: transparent;',
		'		    outline: none;',
		'		    border: 1px solid white;',
		'		    color: white;',
		'		}',
		'		.zmap-toolbar #toolbar select{',
		'			width: 55px;',
		'		}',
		'		.zmap-toolbar [readonly]{',
		'			background: #C3C3C3;',
		'			border:1px solid white;',
		'			outline: none;',
		'		}',
		'		.zmap-toolbar .bottom {',
		'		 	position: absolute;',
		'		 	top: 3%;',
		'		 	left: 2%;',
		'		 }',
		'		 ',
		'		.zmap-toolbar .bottom input[type=\'button\'] {',
		'		 	border: 1px solid white;',
		'		 	background: rgba(0, 0, 0, .5);',
		'		 	color: white;',
		'		 	padding: 3px 5px 4px 5px;',
		'		 	cursor: pointer;',
		'		 }',
		'</style>',
		
		].join("");
		$("head").append(cssCodes)
		$("head").append(cssCodes2)
		return this
	},
	/**
	 * 【私有】 创建默认的事件绑定 <br>
	 * @return 工具本身
	 */
	_createDefaultBinding:function(){
		return this
	}
}
window.modelTool = Tool;
})(jQuery);