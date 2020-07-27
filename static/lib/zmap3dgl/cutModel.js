
var ip = window.location.origin;//'http://192.168.8.97:9080';
var ModelCut = function (map3dView,zmapgitf){
    this._cutTool = map3dView;
    this._modelTool = zmapgitf;
    this._models = []; //被切割模型
    this._modelentities = []; //被切割模型
    this._cutmodel = [];//切割后模型
    this.htmlid = "movex";
    this._cutlinePlane = null;
    this._cutAxisPlane = null;
    this.trackflag = false;
    this.appWizard = null;
}

ModelCut.prototype.cutModelAdd = function(obj){

    this.cutModelDele();
    
    if(obj.baseFile){
        this._cutTool.AddModel(obj.id,obj,true);
        this._models.push(obj);
    }else {
        this._cutTool.urlTransform(obj,callbacCut);
        var _this = this;  
        function callbacCut(modelmes){
            if(obj.id == modelmes.modelid){
                _this._models.push(modelmes);
                modelmes.drotate = [0,0,0];
                _this._cutTool.AddModel(obj.id,modelmes,true);
            }
        }
    }
}

ModelCut.prototype.cutModelDele = function(){
    for(var z=0 ;z<this._models.length;z++){
        this._modelTool.removeModelById(this._models[z].modelid);
    }
}

ModelCut.prototype.unshow = function(modedId){
    var model = this._modelTool.getModel(modedId);
    this._modelTool.unshow(model);
}

ModelCut.prototype.show = function(modedId){
    var model = this._modelTool.getModel(modedId);
    this._modelTool.show(model);
}

ModelCut.prototype.cutStart = function(){
    this._modelentities = [];
    for(var i=0;i< this._models.length ;i++){
        var dmodel = this._modelTool.getModel(this._models[i].modelid);
        this._modelentities.push(dmodel);
    }
}

ModelCut.prototype.cutAxle = function(cutp){
    
    if(!this.appWizard){
        this.appWizard = new APPWZARD(this._cutTool,this._modelentities);
    }
    if(this.appWizard){
        this.updateAxiePosition(this.htmlid,cutp);
    }
}

ModelCut.prototype.updateAxiePosition = function(htmlid,cutp){
    this.htmlid = htmlid;
    var rparam = this.getNewPlane(cutp);
    var view = this._cutTool.GetView();
    if(this._cutAxisPlane){
        this._cutAxisPlane.position = rparam.offsetPoint;
        this._cutAxisPlane.plane.plane = rparam.plane;
        this._cutAxisPlane.plane.dimensions = new Cesium.Cartesian2(rparam.length,rparam.width);
        return;
    }
    var dxyzplan = view.entities.add({
        id : "testplane",
        name : "testplane",
        position: rparam.offsetPoint,
        plane : {
            plane : rparam.plane,
            dimensions : new GmMap3D.Cartesian2(rparam.length,rparam.width),
            material : GmMap3D.Color.RED.withAlpha(0.5),
            fill : true,
            outline :  true,
            outlineColor :  GmMap3D.Color.PURPLE.withAlpha(0.5),
            outlineWidth : 1
        }
    });

    this._cutAxisPlane = dxyzplan;
}

ModelCut.prototype.getNewPlane = function(cutp){
    var dparallelPlane = null;
    var doffsetSize = 0;
    var offsetCoordinate = null;
    if(this.htmlid=="movex"){
        var pva = cutp.x;
        dparallelPlane = "x";
        offsetCoordinate = "-x";
        if(pva>=0){offsetCoordinate = "x";}
        doffsetSize = Math.abs(this.appWizard._ballRadius/1000*pva);
    }
    if(this.htmlid=="movey"){
        var pva = cutp.y;
        dparallelPlane = "y";
        offsetCoordinate = "-y";
        if(pva>=0){offsetCoordinate = "y";}
        doffsetSize = Math.abs(this.appWizard._ballRadius/1000*pva);
    }
    if(this.htmlid=="movez"){
        var pva = cutp.z;
        dparallelPlane = "z";
        offsetCoordinate = "-z";
        if(pva>=0){offsetCoordinate = "z"};
        doffsetSize = Math.abs(this.appWizard._ballRadius/1000*pva);
    }
    var options ={
        dparallelPlane :dparallelPlane,
        doffsetSize : doffsetSize,
        doffsetCoordinate : offsetCoordinate
    };
    return this.appWizard.createProfilePlane(options);
}


ModelCut.prototype.onDrawLine = function(options){
    
    if(!this.appWizard){
        this.appWizard = new APPWZARD(this._cutTool,this._modelentities);
    }

    if(this._cutlinePlane){
        this._modelTool.removeModel(this._cutlinePlane);
    }
    this.appWizard.drawplane(options,createCutPlane)

    var _this = this;
    function createCutPlane(lineplane){
        _this._cutlinePlane = lineplane;
    }
}

ModelCut.prototype.reductionModel = function(){

    if(this._cutAxisPlane){
        this._modelTool.removeModel(this._cutAxisPlane);
        this._cutAxisPlane = null;
    }

    if(cutplane._cutlinePlane){
        this._modelTool.removeModel(this._cutlinePlane);
        this._cutlinePlane = null;
    }

    for(var t=0 ;t<this._cutmodel.length ;t++){
        var cutenty = this._modelTool.getModel(this._cutmodel[t].modelid)
        if(cutenty){
            this._modelTool.removeModel(cutenty);
        }
    }
    this._cutmodel = [];

    for(var k=0 ;k<this._modelentities.length ;k++){
        this.show(this._modelentities[k]._id);
    }
}

ModelCut.prototype.lineCutModel = function (options){

    var _this = this;
    var opdata = {
        method: options.method,
        name: options.name,
        pathlist : JSON.stringify(this.appWizard._createWallPoint)
    };
    if(options.axis&&options.axisparam)
    {
        opdata['axis'] = options.axis;
        opdata['axisparam'] = options.axisparam;
    }
    if(options.process!=undefined)
    {
        opdata['process'] = options.process?true:false;
        if(options.workname==undefined&&opdata['process'])
        {
            alert('process为true是需传入workname!')
            return;
        }
    }
    if(options.workname)
    {
        opdata['workname'] = options.workname
    }
    $.ajax({
        url: options.url,
        dataType: 'json',
        data:opdata,
        success: function(data){
            if(data.success){
                if(data.status&&data.status=='prcessing')
                {
                    setTimeout(_this.lineCutModel(options),500);
                    return;
                }
                 var requrl = data.format;
                 var relUrl = ip + requrl.substring(requrl.indexOf("ip:port")+7,requrl.length);
                 var po = data.position.split(",");
                 if(po.length==3)
                 {
                    po[0] = parseFloat(po[0]);
                    po[1] = parseFloat(po[1]);
                    po[2] = parseFloat(po[2]);
                 }
                 var opt = {
                    modelid:options.id,
                    position : options.position ? options.position : po,
                    url : relUrl,
                    drotate : [0,0,0],
                    initq : new ZMAP3D.Quaternion(-0.5, -0.5, -0.5, 0.5)      
                 }
                 for(var k=0 ;k<_this._modelentities.length ;k++){
                     _this.unshow(_this._modelentities[k]._id);
                 }
                 _this._cutmodel.push(opt);
                 _this._cutTool.AddModel(options.id,opt,true);
            }else {
                console.log("切割失败！");
            }
        }
    })
}

ModelCut.prototype.axieCutModel = function (options){
    
    var _this = this;
    $.ajax({
        url: options.url,
        dataType: 'json',
        data:{
            method: options.method,
            name: options.name,
            pathlist : JSON.stringify(this.appWizard._createWallPoint)
        },
        success: function(data){
            if(data.success){
                var requrl = data.format;
                var relUrl = ip + requrl.substring(requrl.indexOf("ip:port")+7,requrl.length);
                var po = data.position.split(",");
                if(po.length==3)
                {
                po[0] = parseFloat(po[0]);
                po[1] = parseFloat(po[1]);
                po[2] = parseFloat(po[2]);
                }
                var opt = {
                modelid:options.id,
                position : options.position ? options.position : po,
                url : relUrl,
                drotate : [0,0,0],
                initq : new ZMAP3D.Quaternion(-0.5, -0.5, -0.5, 0.5)      
                }
                for(var k=0 ;k<_this._modelentities.length ;k++){
                    _this.unshow(_this._modelentities[k]._id);
                }
                _this._cutmodel.push(opt);
                _this._modelTool.addModel(opt,true);
            }else {
                console.log("切割失败！");
            }
        }
    })
}



