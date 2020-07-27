/**
 * 点线面测量工具
 */
 function addPoint(id, point, dcolor, lcolor) {
            var pointParam = {
                id: "" + id + "",
                position: point,
                show: true,
                dcolor: dcolor,
                dpixelSize: 5,
                doutlineColor: lcolor,
                doutlineWidth: 1
            }
            return pointParam;
        }
;(function($){

    var Tool = function (GmMap3D,map3DView,toolbar,dragable,dragopt,drawOpt) {
        if(GmMap3D && map3DView){
            this.GmMap3D = GmMap3D
            this.map3DView = map3DView;
            this.viewer = map3DView.cesium.viewer;
            this._toolbar = toolbar
            if(toolbar) {
                Cesium.knockout.track(this.p)
                Cesium.knockout.applyBindings(this.p, toolbar)
            }
            this.inited = true;
            this.dragable = dragable
            this.dragopt = dragopt
            this.drawOpt = drawOpt || {}
            this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);//注册工具类
        } else {
            this.inited = false;
        }
        this.animationEnd = (function(el) {
            var animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
                MSAnimationEnd:'MSAnimationEnd',
            };

            for (var t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        })(document.createElement('div'));
        this.transitionEnd = (function(el) {
            var transitions = {
                'transition':'transitionend',
                'OTransition':'oTransitionEnd',
                'MozTransition':'transitionend',
                'WebkitTransition':'webkitTransitionEnd'
            };

            for (var t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        })(document.createElement('div'));
	this.pick = 0,		//用于控制加减坐标的点,
   	this.pts1 = [],		//用于加减坐标,
        this.lines = [],		//所有高程测量的线,
        this.points = [],		//所有的面积测量的点,
        this.polygons = [],	//所有面积测量的面,
        this.polylines = [],	//所有面积测量的范围线
        this.labels = [],		//所有面积的label标签,
        this.lineLabels = [],		//所有线段的label标签,
        this.editing = false,	//是否测量中（用来控制两点测量的初始化）
        this.p = {	//供调整点位和方向的一些参数信息
            lng1 : 0,
            lat1 : 0,
            hei1 : 0,
            lng2 : 0,
            lat2 : 0,
            hei2 : 0,
            diff : 0,
            len  : 0,
        }

    }
    Tool.prototype = {
        /**
         * 工具初始化（初始化之后才能使用）
         * @param {Object} GmMap3D Cesium实例
         * @param {Object} viewer Viewer实例
         * @param {Node} toolbar 一个DOM节点  用于界面的展示，自定义展示界面可以为空
         * @param {Boolean} dragable 是否启用编辑，启用编辑，默认会在编辑完成时进入编辑（拖拽）状态，否则请使用this.adjust方法手动启用编辑，或者使用dragEntity工具使用更高级的拖拽功能
         */
        init:function(GmMap3D,map3DView,toolbar,dragable,dragopt,drawOpt){
            if(!this.inited){
                this.GmMap3D = GmMap3D
                this.map3DView = map3DView;
                this.viewer = map3DView.cesium.viewer;
                this._toolbar = toolbar
                if(toolbar) {
                    Cesium.knockout.track(this.p)
                    Cesium.knockout.applyBindings(this.p, toolbar)
                }
                this.inited = true;
                this.dragable = dragable
                this.dragopt = dragopt
                this.drawOpt = drawOpt || {}
                this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);//注册工具类
            }
            return this
        },
        getOption:function(){
            return {
                GmMap3D:this.GmMap3D,
                map3DView:this.map3DView,
                viewer:this.viewer,
            }
        },
        /*显示编辑工具*/
        _showToolbar:function(){
            this._toolbar.style.display = 'block';
            return this
        },
        /*隐藏编辑工具*/
        _hideToolbar:function(){
            this._toolbar.style.display = 'none';
            return this
        },
        /**
         * 清除所有实体
         * @return 工具本身
         */
        cleanAll:function(){
	    map3dView.RemoveEntity("起点");//移除实际上一个点
            map3dView.RemoveEntity("终点");//移除实际上一个点
            this.dragDone()
            return this._cleanType([
                'points',
                'polygons',
                'labels',
                'lines',
                'polylines',
                'lineLabels',
            ])
        },
        /**
         * 清除面实体
         * @return 工具本身
         */
        cleanArea:function(){
            return this._cleanType('points')._cleanType('polygons')._cleanType('labels')
        },
        /**
         * 调整点位
         * @param entity
         * @param opt
         */
        adjust:function(opt,entity){
            if(!dragToolPrototype) {
                console.error("没有发现拖动工具，请引入entityDrag.js")
            }else{
                this.dragTool = new dragToolPrototype(this.GmMap3D,this.map3DView,this.dragopt)
                this.dragTool.adjustEntity(entity || this.nowpolyline,opt)
            }
        },
        /**
         * 拖拽点位完成
         * @param entity
         * @param opt
         */
        dragDone:function(opt,entity){
            return this.dragTool && this.dragTool.destroy()
        },
        /**
         * 清除线实体
         * @return 工具本身
         */
        cleanLines:function(){
            return this._cleanType(['lineLabels','lines'])
        },
        /**
         * 清除面积测量线实体
         * @return 工具本身
         */
        cleanPolylines:function(){
            return this._cleanType('polylines')
        },
        /**
         * 移除一种类型的实体
         * @param {String || Array} type 类型[points,lines,polyons,labels]
         * @return 工具本身
         */
        _cleanType:function(type){
            if(type.forEach){
                type.forEach(function(t){
                    this[t].forEach(function(item){
                        this.viewer.entities.remove(item)
                    },this)
                },this)
            }else{
                this[type].forEach(function(item){
                    this.viewer.entities.remove(item)
                },this)
            }
            return this
        },
        /**
         * 两点量算
         * @return undefined
         */
        measuring:function(callback){	//通过editing判断是否处于画线状态
            this.end();
            var map3DView = this.map3DView;
            this.editing = true;
            var _this = this
            var drawEnd = function(e){
                var pts = e.geometry;
                if (pts){
                    _this.editing = false;
                    _this.msg("结束画线", 1000);
		    console.log(pts);
                    console.log(map3dView);
		    map3dView.RemoveEntity("起点");//移除实际上一个点
           	    map3dView.RemoveEntity("终点");//移除实际上一个点
		    map3dView.addPoint(addPoint("起点", pts[0], "RED", "RED"), false);
		    map3dView.addPoint(addPoint("终点", pts[1], "RED", "RED"), false);
		    pts1=e.geometry;
		console.log(pts1);
                    var pt = pts.map(function(it){
			console.log(it);
                        return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
                    })
			
                    var polyline = _this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
                    _this.lines.push(polyline)
                    var result = _this._compute(pt)
		    console.log(result);
                    var label = _this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
                    _this.lineLabels.push(label);
                    var p = _this.p
                    _this.nowpolyline = polyline
                    if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
                    if(_this.dragable) _this.adjust({
                        step:function (data) {
                            _this._updateP(data.points)
                            var points = data.points
				console.log(points)
                            var result = _this.compute(points)
                            // console.info(testLabel)
                            // console.info(result)
                            label.position = new Cesium.ConstantPositionProperty(result.position)
                            label.label.text.setValue(result.msg)
                        }
                    })
                }
            }
            _this.msg("左键单击开始画线，再次单击结束画线");
            this.map3DTool._returnZ = true;
            this.map3DTool.StartSingleLineTool(function(){}, drawEnd,_this._updateP.bind(_this),_this.drawOpt);
        },
cheng: function(obj){
		if (this.pick == 0) {
                $(obj).text('控制起点');
                this.pick = 1;
            }
            else {
                $(obj).text('控制终点');
                this.pick = 0;
            }
        },
	addx: function(){
		this._cleanType(['lineLabels','lines']);
		map3dView.RemoveEntity("起点");//移除实际上一个点
	        map3dView.RemoveEntity("终点");//移除实际上一个点
		map3dView.addPoint(addPoint("起点", pts1[0], "RED", "RED"), false);
		map3dView.addPoint(addPoint("终点", pts1[1], "RED", "RED"), false);
 		console.log(pts1);
		pts1[this.pick][0]+=0.000008983152841195214;
		var pt = pts1.map(function(it){
				console.log(it);
       		               return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
          	          })	
		//pts1[this.pick].x+=1;
 		console.log(pt)
            	var result = this.compute(pt);
 		
		console.log(result);
 		var label = this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
	this.lineLabels.push(label);
      var polyline = this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
	this.lines.push(polyline);
	this.lineLabels.push(label);
                    var p = this.p
                    this.nowpolyline = polyline;
	if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
        },
addy: function(){
		this._cleanType(['lineLabels','lines']);
		map3dView.RemoveEntity("起点");//移除实际上一个点
	        map3dView.RemoveEntity("终点");//移除实际上一个点
		map3dView.addPoint(addPoint("起点", pts1[0], "RED", "RED"), false);
		map3dView.addPoint(addPoint("终点", pts1[1], "RED", "RED"), false);
 		console.log(pts1);
		pts1[this.pick][1]+=0.000009405717451407729;
		var pt = pts1.map(function(it){
				console.log(it);
       		               return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
          	          })	
		//pts1[this.pick].y+=1;
 		console.log(pt)
            	var result = this.compute(pt);
 		
		console.log(result);
 		var label = this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
	this.lineLabels.push(label);
      var polyline = this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
	this.lines.push(polyline);
	this.lineLabels.push(label);
                    var p = this.p
                    this.nowpolyline = polyline;
	if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
        },
addz: function(){
		this._cleanType(['lineLabels','lines']);
		map3dView.RemoveEntity("起点");//移除实际上一个点
	        map3dView.RemoveEntity("终点");//移除实际上一个点
		map3dView.addPoint(addPoint("起点", pts1[0], "RED", "RED"), false);
		map3dView.addPoint(addPoint("终点", pts1[1], "RED", "RED"), false);
 		console.log(pts1);
		pts1[this.pick][2]+=0.1;
		var pt = pts1.map(function(it){
				console.log(it);
       		               return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
          	          })	
		//pts1[this.pick].y+=1;
 		console.log(pt)
            	var result = this.compute(pt);
 		
		console.log(result);
 		var label = this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
	this.lineLabels.push(label);
      var polyline = this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
	this.lines.push(polyline);
	this.lineLabels.push(label);
                    var p = this.p
                    this.nowpolyline = polyline;
	if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
        },
	minusx: function(){
		this._cleanType(['lineLabels','lines']);
		map3dView.RemoveEntity("起点");//移除实际上一个点
	        map3dView.RemoveEntity("终点");//移除实际上一个点
		map3dView.addPoint(addPoint("起点", pts1[0], "RED", "RED"), false);
		map3dView.addPoint(addPoint("终点", pts1[1], "RED", "RED"), false);
 		console.log(pts1);
		pts1[this.pick][0]-=0.000008983152841195214;
		var pt = pts1.map(function(it){
				console.log(it);
       		               return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
          	          })	
		//pts1[this.pick].y+=1;
 		console.log(pt)
            	var result = this.compute(pt);
 		
		console.log(result);
 		var label = this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
	this.lineLabels.push(label);
      var polyline = this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
	this.lines.push(polyline);
	this.lineLabels.push(label);
                    var p = this.p
                    this.nowpolyline = polyline;
	if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
        },
minusy: function(){
		this._cleanType(['lineLabels','lines']);
		map3dView.RemoveEntity("起点");//移除实际上一个点
	        map3dView.RemoveEntity("终点");//移除实际上一个点
		map3dView.addPoint(addPoint("起点", pts1[0], "RED", "RED"), false);
		map3dView.addPoint(addPoint("终点", pts1[1], "RED", "RED"), false);
 		console.log(pts1);
		pts1[this.pick][1]-=0.000009405717451407729;
		var pt = pts1.map(function(it){
				console.log(it);
       		               return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
          	          })	
		//pts1[this.pick].y+=1;
 		console.log(pt)
            	var result = this.compute(pt);
 		
		console.log(result);
 		var label = this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
	this.lineLabels.push(label);
      var polyline = this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
	this.lines.push(polyline);
	this.lineLabels.push(label);
                    var p = this.p
                    this.nowpolyline = polyline;
	if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
        },
minusz: function(){
			this._cleanType(['lineLabels','lines']);
		map3dView.RemoveEntity("起点");//移除实际上一个点
	        map3dView.RemoveEntity("终点");//移除实际上一个点
		map3dView.addPoint(addPoint("起点", pts1[0], "RED", "RED"), false);
		map3dView.addPoint(addPoint("终点", pts1[1], "RED", "RED"), false);
 		console.log(pts1);
		pts1[this.pick][2]-=0.1;
		var pt = pts1.map(function(it){
				console.log(it);
       		               return Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2])
          	          })	
		//pts1[this.pick].y+=1;
 		console.log(pt)
            	var result = this.compute(pt);
 		
		console.log(result);
 		var label = this.viewer.entities.add({
                        position: result.position,
                        id: Date.now(),
                        label: {
                            fillColor: new Cesium.Color(0,255,0),
                            text: result.msg,
                            font: '1.2vw arial',
                        }
                    })
	this.lineLabels.push(label);
      var polyline = this.viewer.entities.add({
                        polyline: {
                            show: true,
                            positions: pt,
                            material : new Cesium.PolylineGlowMaterialProperty({
                                glowPower : 0.1,
                                color : Cesium.Color.YELLOW
                            }),
                            followSurface: true,
                            width : 10
                        }
                    })
	this.lines.push(polyline);
	this.lineLabels.push(label);
                    var p = this.p
                    this.nowpolyline = polyline;
	if(typeof callback === 'function') callback.call(_this,{
                        point1:{	//初始点位
                            longitude:p.lng1,
                            latitude:p.lat1,
                            height:p.hei1
                        },
                        point2:{	//结束点位
                            longitude:p.lng2,
                            latitude:p.lat2,
                            height:p.hei2
                        },
                        center:result.position,
                        height:p.diff,  //高程差
                        distance:p.len,	//两点距离
                        polyline:polyline,
                        label:label
                    });
        },
        _updateP: function(positions){
            var a = this._cartographic(positions[0])
            var b = this._cartographic(positions[1])
            this.p.lng1 = a.lng
            this.p.lat1 = a.lat
            this.p.hei1 = a.hei
            this.p.lng2 = b.lng
            this.p.lat2 = b.lat
            this.p.hei2 = b.hei
            this.p.diff = b.hei - a.hei
            this.p.len = Cesium.Cartesian3.distance(positions[0],positions[1])
        },
        _compute:function(pt,l,d){
            //添加labels
            var x = 0, y = 0, z = 0;
            for (var i = 0; i < pt.length; i++) {
                x += pt[i].x;
                y += pt[i].y;
                z += pt[i].z;
            }
            x = x / pt.length;
            y = y / pt.length;
            z = z / pt.length;
            var pos = new Cesium.Cartesian3(x, y, z)
            var czViewer = this.map3DView.GetView();//map.czviewer
            var len = l || this.p.len
            var diff = d || this.p.diff
            if(len>1000){
                len = (len/1000).toFixed(2)+'千米'
            }else{
                len = len.toFixed(2) + '米'
            }
            if(diff>1000){
                diff = (diff/1000).toFixed(2)+'千米'
            }else{
                diff = diff.toFixed(2) + '米'
            }
            var tip = "线长度："+len+"\n高程差："+diff
            return {
                position:pos,
                msg:tip+"\n\n", //加了换行 避免被多边形覆盖（俯视还是会被覆盖）,
            }
        },
        compute:function(positions){
            var a = this._cartographic(positions[0])
            var b = this._cartographic(positions[1])
            var diff = b.hei - a.hei
            return this._compute(positions,Cesium.Cartesian3.distance(positions[0],positions[1]),diff)
        },
        /**
         * 鼠标划线
         * @param {Function} callback 回调方法（当前实例绑定this，回调一个参数positions[3D笛卡尔坐标数组]）
         */
        getLine:function(callback){
            this.end();
            this.editing = true;
            var _this = this;
            var GmMap3D = this.GmMap3D;

            var drawEnd = function(e){
                _this.editing = false;
                var pts = e.geometry;
                if (pts){
                    var positions = [];
                    _this.msg("画线完毕");
                    pts.forEach(function(it){
                        positions.push(Cesium.Cartesian3.fromDegrees(it[0],it[1],it[2]))
                    })
                    if(typeof callback === 'function') callback.call(_this,pts);
                }
            }
            _this.msg("左键单击开始画线，右键结束画线");
            //设置返回高度
            this.map3DTool._returnZ = true
            this.map3DTool.StartLineTool(function(){}, drawEnd)//,this.drawOpt);
        },
        /**
         * 结束所有事件监听
         */
        end: function(){
            this.map3DTool.ClearAll();
        },
        /**
         * 绘制多边形
         * @param {Array} positions 大地坐标系数组（经度、纬度、高度）
         * @return {Object} 工具本身
         */
        drawFlat:function(positions){
            var geo = new ZMAPGEOMETRY(this.map3DView)
            var _this = this;
            this.polygons.push(geo.Addpolygon({
                id:Date.now()+''+this.randomNum(),
                position:positions.map(function(pos){
                    var pot = Cesium.Cartesian3.fromDegrees(pos[0],pos[1],pos[2]+1)
                    return [pos[0],pos[1],pos[2]+1]
                },this),
                doutline : true,
                dperPositionHeight :true,
                doutlineColor : "rgb(255,255,0,1)",
                dmaterial : {
                    materialName : "dGridMaterial",
                    dcolor:"rgba(255,255,0,0.3)",
                    dcellAlpha : 0.5,
                    dlineThickness : [1.0,1.0]
                }
            }))
            return this
        },
        /**
         * 计算多边形面积 通过label显示在多边形的中心
         * @param {Array} positions 大地坐标系数组（经度、纬度、高度）
         * @return {Object} 工具本身
         */
        area:function(positions,callback){
            var line = positions.map(function(e){
                return Cesium.Cartesian3.fromDegrees(e[0],e[1],e[2]+1)
            },this)
            var viewer = this.viewer
            var czViewer = this.map3DView.GetView();//map.czviewer
            var GmapMath = ZMap3DLib.Math;
            var area = GmapMath.CalcAnyPolyArea(line,this.map3DView);
            var tip = "";
            if (area >= 10000){
                area /= 1000000;
                tip = "总面积:" + area.toFixed(2) + "平方公里";
            }else{
                tip = "总面积:" + area.toFixed(2) + "平方米";
            }

            var x = 0, y = 0, z = 0;
            for (var i = 0; i < line.length; i++) {
                x += line[i].x;
                y += line[i].y;
                z += line[i].z;
            }
            x = x / line.length;
            y = y / line.length;
            z = z / line.length;
            var pos = new Cesium.Cartesian3(x, y, z)
            var _this = this
            _this.labels.push(czViewer.entities.add({
                position: pos,
                id: Date.now(),
                label: {
                    fillColor: new Cesium.Color(0,255,0),
                    text: tip+"\n\n", //加了换行 避免被多边形覆盖（俯视还是会被覆盖）,
                    font: '1.25vw arial',
                }
            }));
            if(typeof callback === 'function') callback.call(_this,{	//中心点和面积
                center:pos,
                area:area
            });
            return this;
        },
        /**
         * 面积测量方法合并
         * @param {Function} callback
         */
        areaMeasuring:function(callback){
            var _this = this
            this.getLine(function(positions){

                _this.drawFlat(positions).area(positions,function(obj){
                    if(typeof callback === 'function') callback.call(_this,{	//中心点和面积
                        positions:positions,
                        center:obj.center,
                        area:obj.area,
                    });
                })
            })
        },
        /**
         * 在屏幕上显示消息
         * @param {Sting} msg 消息内容
         * @param {Number} delay 延迟消失的时间（毫秒）
         * @return {} Undefined
         */
        msg:function(msg,delay){
            var $msg = $('<div class="zmap-msg-panel-wapper"><div class="zmap-msg-panel">'+
                msg+'</div></div>')
            $("body").append($msg)
            var _this = this
            setTimeout(function(){
                $msg.addClass('zmap-msg-panel-hide')
                $msg.on(_this.transitionEnd,function(){
                    $msg.remove()
                })
            },delay || 1500)
        },
        randomNum: function(){
            return Math.floor(Math.random()*(999-100+1))+100	//获取100~999之间的随机数
        },
        /**
         * 笛卡尔三维转经纬度高度
         * @param {Object} pos 笛卡尔坐标
         * @return {Object} 经纬度高度对象
         */
        _cartographic:function(pos){
            var ellipsoid=this.viewer.scene.globe.ellipsoid;
            var cartographic=ellipsoid.cartesianToCartographic(pos);
            var lat=Cesium.Math.toDegrees(cartographic.latitude);
            var lng=Cesium.Math.toDegrees(cartographic.longitude);
            var hei=cartographic.height;
            return {
                lat:lat,
                lng:lng,
                hei:hei,
            }
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
            '	    <div id="toolbar">',
            '	    <table>',
            '		    <tbody>',
            '		    <tr>',
            '		        <td>起点</td>',
            '		        <td>',
            '		            <input type="text" size="10" readonly data-bind="value: lng1">',
            '		            <input type="text" size="10" readonly data-bind="value: lat1">',
            '		            <input type="text" size="10" readonly data-bind="value: hei1">',
            '		        </td>',
            '		    </tr>',
            '		    <tr>',
            '		        <td>终点</td>',
            '		        <td>',
            '		            <input type="text" size="10" readonly data-bind="value: lng2">',
            '		            <input type="text" size="10" readonly data-bind="value: lat2">',
            '		            <input type="text" size="10" readonly data-bind="value: hei2">',
            '		        </td>',
            '		    </tr>',
            '		    <tr>',
            '		        <td>线长度（米）</td>',
            '		        <td>',
            '		            <input type="text" style="width: 100%;" readonly data-bind="value: len">',
            '		        </td>',
            '		    </tr>',
            '		    <tr>',
            '		        <td>高程差（米）</td>',
            '		        <td>',
            '		            <input type="text" style="width: 100%;" readonly data-bind="value: diff">',
            '		        </td>',
            '		    </tr>',
            '			</tbody>',
            '		</table>',
            '		</div>',
            '		<div  id="toolbar1"  class="bottom">',
            '			<input type="button" name="" id="" value="两点测量" onclick="javascript:drawTool._showToolbar().measuring(function(call){});"/>',
            '			<input type="button" name="" id="" value="测量面积" onclick="javascript:drawTool._hideToolbar().getLine(function(positions){drawTool.drawFlat(positions).area(positions,function(call){})});"/>',
            '			<input type="button" name="" id="" value="清空线段" onclick="javascript:drawTool.cleanLines();"/>',
            '			<input type="button" name="" id="" value="清空面积" onclick="javascript:drawTool.cleanArea();"/>',
            '			<input type="button" name="" id="" value="清空所有" onclick="javascript:drawTool.cleanAll();"/>',
            '			<input type="button" name="" id="" value="切换控制点" onclick="javascript:drawTool.cheng(this);"/>',
            '			<input type="button" name="" id="" value="控制点x+" onclick="javascript:drawTool.addx();"/>',
            '			<input type="button" name="" id="" value="控制点x-" onclick="javascript:drawTool.minusx();"/>',
            '			<input type="button" name="" id="" value="控制点y+" onclick="javascript:drawTool.addy();"/>',
            '			<input type="button" name="" id="" value="控制点y-" onclick="javascript:drawTool.minusy();"/>',
            '			<input type="button" name="" id="" value="控制点z+" onclick="javascript:drawTool.addz();"/>',
            '			<input type="button" name="" id="" value="控制点z-" onclick="javascript:drawTool.minusz();"/>',
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
            '		    top: 80px;',
            '		    color: white;',
            '		    left: 2%;',
            '		    position: absolute;',
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
    window.drawTool = new Tool();
    window.drawToolPrototype = Tool;
})(jQuery);