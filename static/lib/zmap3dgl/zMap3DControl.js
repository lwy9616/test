//鼠标移动控件
GmMap3D.MousePositionCtl = function(opt_options) {
    
   var map    = opt_options.map;
   this.map3d = map;
   this.cesium= map.GetMap();
   this.style = opt_options.style ? opt_options.style : {top: 0, left: 0};
   
   //    
   this.Init();
}

GmMap3D.MousePositionCtl.prototype = {

    //
    Init: function()
    {
        this._createBar();
        this._registerEvent();
    },
    
    _createBar: function()
    {
        var style = this.style;
        var top = style.top;
        var left = style.left;
        var height = parseInt($("canvas").css("height")) + top - 20;
        height = height + "px";
        var html = '<div id="bottom" class="gmap-mouse-position" style="height:18px; bottom:'+0+'; left:'+left+'px;" border="0" cellspacing="0" cellpadding="0"></div>'
        $('#'+this.map3d.divID).append(html);
    },
    
    _registerEvent: function()
    {
        var cesium  = this.cesium;
        var handler = new GmMap3D.ScreenSpaceEventHandler(cesium.scene._canvas);  
        handler.setInputAction(function (movement){                    
           var pickRay   = cesium.scene.camera.getPickRay(movement.endPosition);
           var cartesian = cesium.scene.globe.pick(pickRay, cesium.viewer.scene);
           if (!cartesian)
           {
              $("#bottom").html('');                     
              return;  
           }
           var geo = cesium.ellipsoid.cartesianToCartographic(cartesian);           
           var lon = (geo.longitude / Math.PI * 180).toFixed(6);
           var lat = (geo.latitude / Math.PI * 180).toFixed(6);
           var height = geo.height.toFixed(2);
           
         //  alert(lon + "," + lat);
         var text = "经度: " + lon + " ";
             text+= "纬度: " + lat + " ";
             text+= "高度: " + height + " （米）";
             
         $("#bottom").html(text);          
        }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);         
    }
        
}   


