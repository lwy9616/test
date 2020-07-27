/**
 * 相机状态工具 <br>
 * 简单使用（创建ui界面并且初始化）：CameraTool.createDefaultUI().init(GmMap3D,map3DView,document.getElementById('toolbar'))
 * 拍照：CameraTool。save()
 * 获取全部相机对象：CameraTool。getAll()
 * 下载文件：
 * 	var obj = CameraTool。getAll()	//获取全部相机对象
 * 	var str = JSON.stringify(obj)	//转换成字符串
 * 	CameraTool.download(str,'test.json')	//下载
 * 导入：可以传入对象或者字符串
 * 	对象：CameraTool.imports(obj)		//使用上面定义的对象
 * 	字符串：字符串形式需要对通过一定的方式获取到标准格式的字符串然后
 * 	CameraTool.imports(str)			//str的来源可以使下载过文件 也可以是任意方式得到的字符串，只要内容格式符合要求
 * 获取标准数据：CameraTool。formaterData()
 * 清空：CameraTool.clean()	//清空的同时会停止播放
 * 自动播放：CameraTool。autofly()
 * 停止播放：CameraTool。autofly()
 * 获取某个相机：var camera = CameraTool.get(0)	//获取第0个相机对象
 * 移动到某个相机：CameraTool。fly(camera)			//使用上面的camera 移动到某个相机状态
 * 	
 * 	
 * 
 * CameraTool。save()
 * CameraTool。save()
 * CameraTool。save()
 * CameraTool。save()
 */
;(function($){

	var Tool = function (GmMap3D,map3DView,toolbar) {
		if(GmMap3D && map3DView && toolbar){
            this.GmMap3D = GmMap3D
            this.map3DView = map3DView;
            this.viewer = map3DView.cesium.viewer;
            this._toolbar = toolbar
            this.cameras = []		//所有相机的状态信息,
			this.count = 0		//保存的次数，用来存储某个场景的名字,
			this.loopTimer = null
            this.GmMap3D.knockout.track(this)
            this.GmMap3D.knockout.applyBindings(this, toolbar)

            this.inited = true
		}else{
            this.inited = false
		}

    }
    Tool.prototype = {
			call:function(){

			},
			/**
			 * 工具初始化（初始化之后才能使用）
			 * @param {Object} GmMap3D Cesium实例
			 * @param {Object} viewer Viewer实例
			 * @param {Node} toolbar 一个DOM节点  用于界面的展示，自定义展示界面可以为空
			 */
			init:function(GmMap3D,map3DView,toolbar){
				if(!this.inited){
					this.GmMap3D = GmMap3D
					this.map3DView = map3DView;
					this.viewer = map3DView.cesium.viewer;
					this._toolbar = toolbar
                    this.cameras = []	//所有相机的状态信息,
					this.count = 0	//保存的次数，用来存储某个场景的名字,
					this.loopTimer = null
                    this.GmMap3D.knockout.track(this)
                    this.GmMap3D.knockout.applyBindings(this, toolbar)

					this.inited = true
				}
				return this
			},
			/**
			 * 显示显示工具
			 * @return {Object} 当前工具本身
			 */
			_showToolbar:function(){
				this._toolbar.style.display = 'block';
				return this
			},
			/**
			 * 隐藏显示工具
			 * @return {Object} 当前工具本身
			 */
			_hideToolbar:function(){
				this._toolbar.style.display = 'none';
				return this
			},
			/**
			 * 保存当前相机姿态信息
			 * @return {Obj} 当前保存的相机对象
			 */
			save:function(){
				var scene = this.viewer.scene
				var camera = scene.camera;
				var canvas = this.viewer.canvas
				var clone = this.GmMap3D.Cartesian3.clone
				this.count++
				var obj = {
					id:Date.now(),
					name:"相片"+this.count,
					photo:canvas.toDataURL("image/jpeg",300/canvas.width),	//jpeg可以实现有损压缩，目标宽度300，通过此决定压缩质量
					destination : clone(camera.position),	//需要克隆相机位置，镜头（scene）的位置会时刻改变
					orientation : {
						heading : camera.heading,
						pitch : camera.pitch,
						roll : camera.roll
					}
				}
				this.cameras.push(obj)
				return obj
			},
			/**
			 * 获取图片（对应页面上面的保存按钮）
			 * @param {Number} id 相片id
			 * @param {Function} callback 回调函数（获取到的相片对象）
			 */
			getImg:function(id,callback){

			},
			setImgCall:function(call){
				this.call = typeof call === 'function' ? call : function(){}
			},
			/**
			 * 获取一个相机对象
			 * @param {Number} index 相机对象数组的索引 或者 相机对象的id
			 * @return {Object} 一个相机对象
			 */
			get:function(index){
				var c = this.cameras
				if(c.length === 0) return null
				index = Number(index)
				return index < 10000 ? c[index] : function(){		//相机的id通过当前的毫秒数 这里通过一个较大的数（10000）来判断数字是数字下标还是对象的id
					var tmp = null
					c.forEach(function(item){
						if(item.id === index) tmp = item
					})
					return tmp
				}();
			},
			/**
			 * 移除一个相机对象
			 * @param {Object || Number} item 相机对象 或者 相机对象数组的索引 或者 相机对象的id
			 * @return 工具对象本身
			 */
			remove:function(item){

				var t = typeof item
				var c = this.cameras
				var index = null
				if(t === 'number'){	//对象的id或者数组的index
					index = item < 10000 ? item : function(){
						c.forEach(function(i,j){
							if(i.id === item) index = j
						})
						return index
					}();
				}else if(t === 'object'){	//该对象
					c.forEach(function(i,j){
						if(i === item) index = j
					})
				}
				if(index !== null) c.splice(index,1)
				return this
			},
			/**
			 * 获取所有相机对象
			 * @return 相机对象数组
			 */
			getAll:function(){
				return this.cameras
			},
			/**
			 * 飞行
			 * @param {Object} camera 某个相机对象
			 * @return 工具对象本身
			 */
			fly:function(camera){
				this.viewer.camera.flyTo(camera)
				return this
			},
			/**
			 * 自动播放 <br>
			 * @param {Number} begin 开始播放的位置（未设置默认值 从0开始计数）
			 * @param {Number} mill 动画间隔时长（毫秒），默认六秒（为了播放效果 请勿小于3秒）
			 * @return 工具对象本身
			 */
			autofly:function(begin,mill){
				var _this = this
				var len = _this.cameras.length
				clearInterval(_this.loopTimer)
				_this.viewer.camera.flyTo(_this.get(begin))
				_this.loopTimer = setInterval(function(){
					_this.viewer.camera.flyTo(_this.get((begin++)%len))
				},mill || 6000)
				return this
			},
			/**
			 * 停止播放
			 * @return 工具对象本身
			 */
			stop:function(){
				clearInterval(this.loopTimer)
				return this
			},
			/**
			 * 停止正在进行的自动播放，清除所有相机和计数信息
			 * @return 工具对象本身
			 */
			clean:function(){
				this.stop()
				this.cameras = []
				this.count = 0
				return this
			},
			/**
			 * 获取标准数据<br>
			 * @return 标准数据对象
			 */
			formaterData:function(){
				return {
					data:this.cameras,
					count:this.count
				}
			},
			/**
			 * 导入 <br>
			 * ex:CameraTool.imports({标准格式的字符串或者标准格式的对象})
			 * @param {Object || string} content json格式的字符串或者一个对象数组
			 * @return undefined
			 * @throw 浏览器不支持导入(一般是字符串格式不正确，请使用下载后的文件内容)
			 */
			imports:function(content){
				try {
					content = typeof content === 'string' ? JSON.parse(content) : content
					this.cameras = content.data
					this.count = content.count
				} catch (error) {
					alert("浏览器不支持导入")
				}
			},
			/**
			 * 下载（默认编码为页面编码，示例页面均为utf-8） <br>
			 * ex:CameraTool.download("123","test.txt")
			 * @param {String} content 文本内容
			 * @param {String} filename 目标文件名
			 * @return undefined
			 * @throw 浏览器不支持直接下载
			 */
			download:function (content, filename) {    // 下载
				try {
					var eleLink = document.createElement('a');
					eleLink.download = filename;
					eleLink.style.display = 'none';    // 字符内容转变成blob地址
					var blob = new Blob([content]);
					eleLink.href = URL.createObjectURL(blob);    // 触发点击
					document.body.appendChild(eleLink);
					eleLink.click();    // 然后移除
					document.body.removeChild(eleLink);
				} catch (error) {
					console.error('浏览器不支持直接下载')
					alert("浏览器不支持直接下载")
				}
			},
			/**
			 *
			 * 下载图片
			 * @param {Number} id 相片id
			 * @return undefined
			 * @throw 浏览器不支持直接下载
			 */
			downloadImg:function (id) {    // 下载
				try {
					var c = this.get(id)
					var eleLink = document.createElement('a');
					eleLink.download = c.name+'.jpg';
					eleLink.style.display = 'none';
					eleLink.href = c.photo;//this.base64ToBlob(c.photo);    // 触发点击
					document.body.appendChild(eleLink);
					eleLink.click();    // 然后移除
					document.body.removeChild(eleLink);
				} catch (error) {
					console.error('浏览器不支持直接下载')
					alert("浏览器不支持直接下载")
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
					'<div class="zmap-cameraStatus">',
					'		    <div id="toolbar">',
					'			    <ul data-bind="foreach: cameras">',
					'			    	<li data-bind="attr: { \'data-id\': id }">',
					'						<div class="control download"></div>',
					'						<div class="control save"></div>',
					'						<div class="control close"></div>',
					'				        <input type="text" data-bind="value: name, valueUpdate: \'input\'" />',
					'				        <img data-bind="attr: { src: photo }" />',
					'				    </li>',
					'				</ul>',
					'			</div>',
					'			',
					'			<div class="bottom">',
					'				<input type="file" name="file" id="file" style="display:none">',
					'			    <input type="button" value="拍照" onclick="javascript:CameraTool.save()"/>',
					'				<input type="button" value="获取全部相机对象" onclick="javascript:console.info(CameraTool.getAll())"/>',
					'			    <input type="button" value="自动播放" onclick="javascript:CameraTool.autofly(0)._hideToolbar();"/>',
					'			    <input type="button" value="停止播放" onclick="javascript:CameraTool.stop()._showToolbar()"/>',
					'			    <input type="button" value="下载标准文件" onclick="javascript:CameraTool.download(JSON.stringify(CameraTool.formaterData()),\'未命名.json\')"/>',
					'			    <input type="button" value="导入文件" onclick="javascript:$(\'#file\').click()"/>',
					'			</div>',
					'		</div>'
				].join("");
				$('body').append(htmlCodes)
				return this
			},
			/**
			 * 【私有】 创建默认的样式 <br>
			 * @return 工具本身
			 */
			_createDefaultStyle:function(){
				var cssCodes = [
					'<style>',
					'        .zmap-cameraStatus #toolbar {',
					'			background: rgba(42, 42, 42, 0.8);',
					'		    padding: 4px;',
					'		    border-radius: 4px;',
					'		    position: absolute;',
					'		    top: 3%;',
					'		    color: white;',
					'		    right: 7%;',
					'			max-height: 90%;',
					'			overflow: auto;',
					'			opacity: .4;',
					'			transition: opacity .4s ease;',
					'	    }',
					'	    .zmap-cameraStatus #toolbar:hover{',
					'	    	opacity: 1;',
					'	    }',
					'	    .zmap-cameraStatus #toolbar input {',
					'			vertical-align: middle;',
					'			padding-top: 2px;',
					'			padding-bottom: 2px;',
					'			width: 100%;',
					'			box-sizing: border-box;',
					'			outline: none;',
					'			background: rgba(0,0,0,.5);',
					'			color: white;',
					'			text-align: center;',
					'			border: none;',
					'			position: absolute;',
					'			bottom: 0;',
					'	    }',
					'		.control{',
					'		    background-repeat: no-repeat;',
					'		    background-position: center;',
					'		    background-size: 20px;',
					'		    position: absolute;',
					'		    width: 20px;',
					'		    height: 20px;',
					'		    top: 0;',
					'		    display: none;',
					'		}',
					'		.control:nth-child(1){',
					'			right: 50px;',
					'		}',
					'		.control:nth-child(2){',
					'			right: 25px;',
					'		}',
					'		.control:nth-child(3){',
					'			right: 0;',
					'		}',
					'		.save{',
					'			background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADlklEQVR4Xu2bS6hNURjHf3+Tez0mJAMlpORRQhkKA0kGJgrdlJkrlJky8CoZGhkw8kooMTC6I68hcktuopuUiLzJKz59dU6dTvecvda+e92zz2NNTt37re/xW99a69trry26vKnL46cHoJcBAQTMrB9YCMwIEJ8IkVFJL4swlDkFzGwLcBaYWoTBgnT8Bc4AByR9HY/OpgDMbBNwczwGEve9C6yV9C+vnSwAnmZz8iqfoH6HJR3La6shADObDbzKq3gC+/nor5L0MI/NZgAWA0/yKG1Bn1FgqaSfsbbzAPgO3I81VLD8KmBKnc7TkgZj7eQBMCxpeayhIuXNzDPTM7S+bZA0FGOr0wC8q0wF/w1qnQbAgx6StCEoemj8LGBmjRbBMk+Baty7JHmhlNk6MQM8aF+ol0ny3aFpKzUAM9sJzAXOSXpRjaTJIlgbrNcFXh80rRJLC8DMjgCHKxF9AuZL8l8CAbjoUUmup2ErM4BbwJoaz9dJ8r/FAMisEjsdgPN6XlkPfoyVBt0AwOM+IelgNwN4L2lmNwPw2Psk/a6H0C1TwOPul/SrCAAjkpZkFRjj/X/dNvgZmFezDfrCtiDSRmEAfGtxZX8iHYgWrxRC8/xMsloImdlk4BswKVJhYQDc7l5JpyIdKETczI4DY67oGQYKBeAjsFvSxUKiClBiZn426Wd/Xh7naYUCqDrwERgBUk+HacDKZk+vAUSSAAiwWxqRHoCitsHSDGmkI70M6GVAQZVgZOaVRrw3BVJNgevAZeBtC8baT673+LuAANtJMuCypO0BxpOJmFkf8CzgLXYSAGsk3UkWXaBiMzvkB6AT+SxQteWXE24H+plMrO7RuZGdJBlwRdK2ZJEFKG71FHAXrwFXW7gI7mvwprgeX5IMCBij0oj0AKSqA0ozxK3YBdolePcz6RTwU6FWVYKzAkchCYDXwEZJw4FOFC5mZgPAhYDjsiQAgm9iFB55jUIzuwRkleRJAKyQ9ChlcCG6zWw/cLIVi+CgpNMhTqaUMTN/Gt3aCgBvgPWSHqcMsJluM9sBnA+wn2QKVO127S4QAL40IkkzoDRRNnEkGkC7XJcPge+v7vyChNULZ30w4d8LOIh2b/ckrR4riCwAm4EbbR69j7pfmHwQDcA7VD6a8m3GLya0W/sCDEhq+N1T5ldjFQh+8roImN5GBD4AT8c6A6iNIQhAGwUd7WoPQDSyDuvQ9RnwH17V71DKxd5sAAAAAElFTkSuQmCC);',
					'		}',
					'		.download{',
					'			background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEUklEQVR4Xu2aS8hVVRTHf/+KqIZR0KSalBlBFA56UBliVGoOMiroQQ/BiaRiDiokC4sgoSwFMawIhISKKLOiB0Rlgj0JehgNtKEZNJGQasWC88luu8/jnnu+c47fPXt2zz1n7/X/rbWfa4sJL5pw/QwAhgiYcAJDF5jwAOhuEDSzE4HbMgfskPRPF87opAtk4j8Ers1E75R00yQBuAD4KRJ8nqRf24bQVQTMAb6MxM6R9PUAoGUCQwQUATez04GlwD3Ahdm7PwJzJR2s6ywza7wLmNkpwEbgTuA04A/gA2CNpN/ybM2NADO7F9gMnJr4+ClJD/UMwBPAwwmbDgOrJG1N2ZsEYGbu9RcKBG6UtLJnAJ4EipzynKQVsc3HADCz2cB3wMk5An8Grpe0v2cAzgQ+BXyKzSvzJX0U/pkC4P3ogaiGz4G3swb2SPq3rnj/bjrGgKzeE4DLgauBBcA1kZ3bJfkYcbSkAHwDXBK884VX2ORSdboAxE4xM3faouD595IuLgNwADg7eGm9pLXjeDxhWOOzQMo+M1sPPBL8d0DSuQOAki4wRMDQBYYxYBgER5oFzOwc4LCk36vMFuNOg2Z2hq/3Jfl4lVtamQWCRv7ONh7PlkEYB4CZ+RL8aeAk4BlgtSTrZBo0s/OBfVHjvvvaUOKZWusAM3swEx9Wf6mkb7sC4CtGXznGpRBCnQgws3XAo4m2Zkn6pSsAvpR+MTsviG14TJIbfUwZFYCZeci79+OyWdLyvGhrawzwDcgrwB0JQzZIWhM/HwVAgfjtwF15/d/bbAVA1tBIEKoCKBF/d9mutDUAAYQdwC1lkVAFQIH41zyhUia+1QiYEpwlPF4tg1AGwMyeB1J928XfXnVr3moERBDeABbnRUIRgALxbwE3VxXfSQQEEHyR8noOhE3Ay6nECOAHsSnPu/glknyxVbl0EgERhJ1+fpiw+D3ghuj5+znv1hLfaQQEEPxg1QWkIFTxpENZNKrng/a7PxEys7oQXPxiSUeqkEq902kXCA3KILwLzKso5mPgxnHE96ILRBA8dfVOBQgufqGkvyrCyn2tNxEQ9EmH4Pm6q3Ks/gy4rgnxvYuAAIInLr1/xxBcvGecPJfXSOldBEQQdnmWOXv2iWdymhTf2wiI1glXZr93153qikKltxHQSHxXqGQA0NfUWAXnNfLKEAFDBNTLDvsNkFlBDG6VtKyRmGy5EjPzw5mp67je+j5J/7tBkrog4ctVv10xVXwz4vdvfAv71XRMV01yMTM/i/C8g1+9De8GeDO7JC0M20sBuA/Y1qRRParrfkl+jH+0pAD4Ce9u4LIeGd6EKXv9/lB8mJp3Tc7X6y8BtzbRcg/q8MzRFZIOxbYUXpU1syWAn+Gd1QMRdUz4E9gCPJ63zyi9K2xm3iUuyq7K+uzgg8zxUH4A3iw7VCkFcDwoHcfGAcA49GbCt0MEzAQvjqNhiIBx6M2Eb/8DoBrmX+csKL0AAAAASUVORK5CYII=);',
					'		}',
					'		.close{',
					'			background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAC40lEQVR4Xu3aoW8UQRTH8d/PERICgX8FBYSQIBAIDAqDw5GAIKEKUFSQgMAhUTgUCoXC1GAQCEgQCJKSkoaSBhgy5JY0zd3Oe2/em2nvdk3FTTf7/ezs7Pa6xIpvXPF+TADTDFhxgekSWPEJMC2CxUsgpbQD4MicmbJOcu0gzKCU0kMAd+ccyw7Jo2PHWAOQ99sdYSQ+H184QFeEQnwzgC4IgvimAE0RhPHNAZogKOLdAG4BeKxY7cMWRmV8PuTbJJ9U3QXyL6eUuiNExOe24m1w0OuJEBWvApjNhPywkR86pFv15RAZrwZojRAdbwJohdAi3gwQjdAqvgrAiHCf5IOxBaRlfDWAEWGN5Po8hNbxLgBeCIb4hZDSW5QbQC1Cr3hXACsCgOMLvsxYdCJdzvywc/GToHRapZS0D0vSXedxrvHuM2DPY3MEgnt8GIDxchibCSHxoQCOCGHx4QAOCKHxTQAqEMLjDzrAHZKPNLcIy1j32+D+g6i8Ld4k+dQSJv2dUIDK+KHhBsln0iDtuDAAp/h/SwiA6ySfa+Mk40MAHOOHhj8ArpF8IYnSjHEHCIgfen4DuErypSawNNYVwBA/fDlyr3Sgs89/AbhC8pVwfHGYG4Ah/v83xso/h3cBXCb5ulgnGOACUBM/HKMS4SeASyTfCBpHh1QDeMQbEX4AuEjybQ1CFYBnvBFhG8AFkhtWBDNARLwRYQvAeZLvLAgmgMh4I8ImgHMk32sR1AAt4o0IXwGcJflBg6ACaBlvRPgyQ/goRRAD9Ig3InyeIeSfxU0E0DPeiPAJwBmSeUbUPQcchHgjQl4L8pqQ14aFW3EGjLwpOm+n1S9ElM6Y8olxg+TpVgDh8YaZsEnyVAuAZvFKhG8kT0YDNI9XIGyRPBEJ0C1eiPCdZP7na8gi2D1+D0J+kTO/y7h/2yZ5rAqgtCof9s+Lt8HDHlg6/gmgJLTsn08zYNnPcKlvmgEloWX//C97lKtQkiI67wAAAABJRU5ErkJggg==);',
					'		}',
					'		.zmap-cameraStatus li{',
					'			width: 300px;',
					'			border: 1px solid white;',
					'			box-sizing: border-box;',
					'			position: relative;',
					'			margin: 0 0 10px 0;',
					'			border-radius: 5px;',
					'			overflow: hidden;',
					'		}',
					'		.zmap-cameraStatus li:hover{',
					'			cursor: pointer;',
					'		}',
					'		.zmap-cameraStatus li:hover .control{',
					'			display: block;',
					'		}',
					'		.zmap-cameraStatus li img{',
					'			width: 100%;',
					'		}',
					'		.zmap-cameraStatus .bottom{',
					'			position: absolute;',
					'    		top: 3%;',
					'		}',
					'		.zmap-cameraStatus .bottom input[type=\'button\']{',
					'			border: 1px solid white;',
					'			background: rgba(0,0,0,.5);',
					'			color: white;',
					'			padding: 3px 5px 4px 5px;',
					'			cursor: pointer;',
					'		}',
					'</style>'
				].join("");
				$('head').append(cssCodes)
				return this
			},
			/**
			 * 【私有】 创建默认的事件绑定 <br>
			 * @return 工具本身
			 */
			_createDefaultBinding:function(){
				/*选定一个相机*/
				$("#toolbar").on("click","li",function(){
					var id = $(this).attr("data-id")
					CameraTool.fly(CameraTool.get(id))
				})
				/*移除一个相机*/
				$("#toolbar").on("click",".close",function(){
					var id = $(this).parent("li").attr("data-id")
					CameraTool.remove(Number(id))
					return false
				})
				/*保存*/
				$("#toolbar").on("click",".save",function(){
					var id = $(this).parent("li").attr("data-id")
					var camera = CameraTool.get(id);
					CameraTool.call(camera);

					/*设置保存的回调函数（放在call之前）
					CameraTool.call = function(){

					}
					或者使用
					CameraTool.setImgCall(function(){

					})*/
					return false
				})
				/*下载*/
				$("#toolbar").on("click",".download",function(){
					var id = $(this).parent("li").attr("data-id")
					CameraTool.downloadImg(Number(id))
					return false
				})
				/*文件域变化的时候 读取里面的文件*/
				$("#file").change(function(){
					try{
						var file = this.files[0];
						var reader = new FileReader();

						//将文件以文本形式读入页面
						reader.readAsText(file, "utf-8");
						reader.onload = function(e){
							CameraTool.imports(e.target.result)
						}

					}catch(e){
						alert("文件读取失败，请检查是否为纯文本")
					}
				})
				return this
			}
	}
    window.CameraTool = new Tool();
    window.CameraToolPrototype = Tool;
})(jQuery);