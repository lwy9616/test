/**
 * 路径编辑工具
 */
;(function(){
	var Tool = function (GmMap3D,map3DView,toolbar,defaultHeight) {
		if(GmMap3D && map3DView && toolbar){
            this.GmMap3D = GmMap3D;
            this.map3DView = map3DView;
            this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);
            this.viewer = map3DView.cesium.viewer;
            this._toolbar = toolbar;

            this._redPoint = null,	//红色（选中的点位）
                this._nowPoint = null,	//当前编辑的点
                this._positions = [],	//所有点位的信息,
                this.defaultHeight = null,
                this.scale = 1,
                this.p = {	//供调整点位和方向的一些参数信息
                    x:0.0,
                    y:0.0,
                    z:0.0,		//经纬度和高度相对偏移量
                    lng:0.0,
                    lat:0.0,
                    hei:0.0,	//供交互工具展示经纬度高度信息
                    typex:1,
                    typey:1,
                    typez:1,	//经纬度和高度相对偏移量权重
                    heading:0,
                    pitch:0,	//当前编辑点位的航角和仰角
                    speed:0,	//速度
                    size:100000,//箭头线长度的默认值
                },

                this.GmMap3D.knockout.track(this.p);
            if(defaultHeight !== undefined) this.defaultHeight = defaultHeight
            this.GmMap3D.knockout.applyBindings(this.p, toolbar);
            this.inited = true;

		}else{
            this.inited = false;
		}
    }
	Tool.prototype = {
		/**
		 * 工具初始化（初始化之后才能使用）
		 * @param {Object} GmMap3D Cesium实例
		 * @param {Object} viewer Viewer实例
		 */
		init:function(GmMap3D,map3DView,toolbar,defaultHeight){
			if(!this.inited){
				this.GmMap3D = GmMap3D;
				this.map3DView = map3DView;
				this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);
				this.viewer = map3DView.cesium.viewer;
				this._toolbar = toolbar;

				this._redPoint = null,	//红色（选中的点位）
				this._nowPoint = null,	//当前编辑的点
				this._positions = [],	//所有点位的信息,
				this.defaultHeight = null,
				this.scale = 1,
				this.p = {	//供调整点位和方向的一些参数信息
					x:0.0,
					y:0.0,
					z:0.0,		//经纬度和高度相对偏移量
					lng:0.0,
					lat:0.0,
					hei:0.0,	//供交互工具展示经纬度高度信息
					typex:1,
					typey:1,
					typez:1,	//经纬度和高度相对偏移量权重
					heading:0,
					pitch:0,	//当前编辑点位的航角和仰角
					speed:0,	//速度
					size:100000,//箭头线长度的默认值
				},

				this.GmMap3D.knockout.track(this.p);
				if(defaultHeight !== undefined) this.defaultHeight = defaultHeight
				this.GmMap3D.knockout.applyBindings(this.p, toolbar);
				this.inited = true;
			}
			return this;
		},
		clean:function(){
			this.viewer.entities.removeAll()
			return this
		},
		/*更新折线*/
		_updatePolyline: function(){
			var _this = this;
			return function(){
				return _this._positions;
			}
		},
		/*更新点位*/
		_updatePoint: function(item){
			var _this = this;
			return function(){

				if(_this._nowPoint && item === _this.getSelf(_this._nowPoint)){	//当前编辑点存在，而且当前点位和当前编辑点位相同的情况
					var point = _this._cartographic(item)
					_this.p.lng = point.lng
					_this.p.lat = point.lat
					_this.p.hei = point.hei
					item.heading = _this.p.heading
					item.pitch = _this.p.pitch
					item.speed = _this.p.speed
					if(_this.p.x === 0 && _this.p.y === 0 && _this.p.z === 0){	//尚未编辑

						return item;
					}
					//更新点位
					var newCartesian3 = new GmMap3D.Cartesian3.fromDegrees(point.lng + Number(_this.p.x)*_this.p.typex/100000,
						point.lat + Number(_this.p.y)*_this.p.typey/100000,
						point.hei + Number(_this.p.z)*_this.p.typez)
					item.x = newCartesian3.x
					item.y = newCartesian3.y
					item.z = newCartesian3.z
					return item;
				}else{	//不相同直接返回
					return item;
				}

			}
		},
		/*更新箭头线*/
		_updateArrowPolyline: function(item){
			var _this = this;
			return function(){

				return [item,_this.rotate(item)]

			}
		},
		/*重设正在编辑的点位（移除红色点）*/
		_resetEditing:function(){
			if(this._redPoint){
				this.viewer.entities.remove(this._redPoint)
			}
			return this;
		},
		/*显示编辑工具*/
		_showToolbar:function(){
			this._toolbar.style.display = 'block';
		},
		/*隐藏显示工具*/
		_hideToolbar:function(){
			this._toolbar.style.display = 'none';
		},
		/**
		 * 自定义对象类型检测
		 */
		typeCheck:function(obj, type){
			return obj.constructor.toString().substr(9,type.length) === type
		},
		/**
		 * 清除所有实体
		 */
		cleanEntity:function(){
			this.viewer.entities.removeAll();
			return this;
		},
		/*默认点样式*/
		_pointStyle:function(){
			return {
				pixelSize : 8,
				color : GmMap3D.Color.YELLOW,
				outlineColor : GmMap3D.Color.BROWN,
				outlineWidth : 3
			}
		},
		/*选中的点样式*/
		_checkedPointStyle:function(){
			return {
				pixelSize : 12,
				color : GmMap3D.Color.RED,
				outlineColor : GmMap3D.Color.BROWN,
				outlineWidth : 8
			}
		},
		/*获取下一个点*/
		getNext:function(a){
			var target = null;
			this._positions.forEach(function(b,i,arr){
				if(a.x == b.x && a.y == b.y && a.z == b.z){
					target = i === (arr.length - 1) ? arr[i-1] : arr[i+1]	//返回下一个点。如果依据点位最后一个点 返回前一个点
				}
			},this)
			return target;
		},
		/*获取本点（点击事件获取的实体和entities里面存放的不属于同一个对象，点位信息相同而已）*/
		getSelf:function(a){
			var target = null;
			this._positions.forEach(function(b,i,arr){
				if(a.x == b.x && a.y == b.y && a.z == b.z){
					target = arr[i]	//返回此点。如果依据点位最后一个点 返回前一个点
				}
			},this)
			return target;
	   },
		/*获取旋转后的的坐标*/
		rotate:function(base){
			var viewer = this.viewer;
			var B = base;
			var X = B.heading
			var Y = B.pitch
			target = this.getNext(base);
			var heading = GmMap3D.Math.toRadians(X);
			var pitch = GmMap3D.Math.toRadians(Y);
			var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);

			var m = GmMap3D.Transforms.headingPitchRollToFixedFrame(B, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());

			var A1 = new GmMap3D.Cartesian3(this.p.size,0, 0);
			return GmMap3D.Matrix4.multiplyByPoint(m, A1, new GmMap3D.Cartesian3());

	   },
		/*笛卡尔三维转经纬度高度*/
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
		 * 鼠标划线
		 * @param {Function} callback 回调方法（当前实例绑定this，回调一个参数positions[3D笛卡尔坐标数组]）
		 */
		getLine:function(callback){
			var _this = this;
			var GmMap3D = this.GmMap3D;


			var line = "";
			function drawStart(e){
			}

			function drawEnd(e){
				var pts = e.geometry;
				if (pts)
				{
					// line  = pts[0].join(",") + ";";
					// line += pts[1].join(",");
					//AddFlashTip("结束画线", 1000);
					var positions = [];
					pts.forEach(function(it){
						positions.push(GmMap3D.Cartesian3.fromDegrees(it[0],it[1],(_this.defaultHeight !== null ? _this.defaultHeight : it[2])))
					})
					_this._nowPoint = null;
					var lenarr = [];	//线段长度的数组
					positions.forEach(function(item,index,arr){	//扩展点位实体属性
						item['target'] = null;
						item['speed'] = 0;
						item['pitch'] = 0;
						if(index !== arr.length-1){
							lenarr.push(Math.abs(Number(GmMap3D.Cartesian3.distance(item,positions[index+1]))))
							var first = _this._cartographic(item);
							var next = _this._cartographic(arr[index+1])
							var y = next.lat - first.lat
							var x = next.lng - first.lng
							item['heading'] = -Math.atan2(y,x)/Math.PI*180
						}else{
							item['heading'] = arr[index-1]['heading']
						}
					})
					var zoom = _this.getZoom() || 10;
					var level = 1;
					if(zoom < 7){
						level = 100
					}else if(zoom < 9){
						level = 10
					}else if(zoom < 14){
						level = 1
					}else if(zoom < 18){
						level = 0.1
					}else{
						level = 0.01
					}
					_this.p.typex = level
					_this.p.typey = level
					_this.p.typez = level
					_this.scale = level
					//设置箭头线长度为倒数第二短短线段长度的1/2
					_this.p.size = lenarr.sort()[1]/2

					_this._positions = positions;
					callback.call(_this,positions);
				}
			}
			//AddFlashTip("左键单击开始画线，双击结束画线", 2000);
			//设置返回高度
			_this.map3DTool._returnZ = true
			_this.map3DTool.StartLineTool(drawStart, drawEnd);

		},
		/*重置范围输入框*/
		resetRange:function(){
			this.p.x = 0.0;
			this.p.y = 0.0;
			this.p.z = 0.0;
		},
		/**
		 * 编辑点信息
		 * @param {Array} positions 3D笛卡尔坐标数组
		 */
		editPoint: function(positions){
			//Enable lighting based on sun/moon positions
			var viewer = this.viewer;
			var GmMap3D = this.GmMap3D;
			var _this = this;

			//set Polyline
			viewer.entities.add({
				polyline: {
					show: true,
					positions: new GmMap3D.CallbackProperty(_this._updatePolyline(), false),
					material : new GmMap3D.PolylineGlowMaterialProperty({
						glowPower : 0.1,
						color : GmMap3D.Color.YELLOW
					}),
					width : 5
				}
			});
			//set point
			this._positions.forEach(function(item){
				this.viewer.entities.add({
					position : new GmMap3D.CallbackProperty(_this._updatePoint(item), false),
					point : this._pointStyle()
				});
				this.viewer.entities.add({
					polyline: {
						show: true,
						positions: new GmMap3D.CallbackProperty(_this._updateArrowPolyline(item), false),
						material: new GmMap3D.PolylineArrowMaterialProperty(new GmMap3D.Color(255,255,255,.1)),
						followSurface: false,
						width : 10
					}
				})
			},this)
			//set Arrow Polyline
			//this._setPoint(positions);

			//set listener
			var handler = new GmMap3D.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(function(click) {
				// 处理鼠标按下事件
				// 获取鼠标当前位置
				var pick = viewer.scene.pick(click.position);
				var pickedObjects = viewer.scene.drillPick(click.position);
				//console.info(pick.primitive.constructor,pick.primitive);
				if(pick && pick.primitive && _this.typeCheck(pick.primitive,'PointPrimitive')){
					_this._showToolbar();
					_this._nowPoint = pick.primitive.position;
					var p = _this.getSelf(pick.primitive.position);
					_this.p.heading = p.heading;
					_this.p.pitch = p.pitch;
					_this.p.speed = p.speed;
					_this._resetEditing()
					_this.setReferenceFrame(pick.primitive.position)
					//_this._checkPoint(pick.primitive.position)
					_this._redPoint = _this.viewer.entities.add({
						position : new GmMap3D.CallbackProperty(_this._updatePoint(_this.getSelf(pick.primitive.position)), false),
						point : _this._checkedPointStyle(),
					})
					return ;
				}

			}, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);
		},
		/**
		 * 设置三维坐标参考框架（调试的时候使用）
		 * @param {Cartesian3} center 框架中心点位置
		 */
		setReferenceFrame: function(center) {

			return ;
			var GmMap3D = this.GmMap3D;
			var viewer = this.viewer;
			var transform = this.GmMap3D.Transforms.eastNorthUpToFixedFrame(center);
			var referenceFramePrimitive = viewer.scene.primitives.add(new GmMap3D.DebugModelMatrixPrimitive({
				modelMatrix : transform,
				length : 100000.0
			}));

		},
		/*获取格式化的数据  供漫游工具使用*/
		getFormatData:function(){
			var _this = this;
			return this._positions.map(function(item){
				var point = this._cartographic(item);
				var point2 = this._cartographic(this.rotate(item))
				return {
					targetPoint:[point2.lng,point2.lat,point2.hei],
					cameraPoint:[point.lng,point.lat,point.hei],
					speed:function(){
						if(item.speed === 0){
							return _this.scale*100
						}else{
							return item.speed/3.6
						}
					}()
				}
			},this)
		},
		getZoom:function(){
			return this.map3DView.GetZoom()
		}

	}
    window.MapTool = new Tool();
    window.MapToolPrototype = Tool;
})();