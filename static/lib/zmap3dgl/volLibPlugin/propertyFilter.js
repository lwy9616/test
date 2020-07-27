//option {split_X:6,split_Y:5,tolerance:3,max_X:45,min_X:-33,max_Y:255,min_Y:0}
var ppFilter = function (divid,option,moveCallback,overCallback)
{
	//var pri = vol._volpri;
	var param = {};
	if(option != undefined){
		param["split_X"] = option["split_X"] == undefined ? 6 : option["split_X"];
		param["split_Y"] = option["split_Y"] == undefined ? 5 : option["split_Y"];
		param["tolerance"] = option["tolerance"] == undefined ? 3 : option["tolerance"];
		param["max_X"] = option["max_X"] == undefined ? 45 : option["max_X"];
		param["min_X"] = option["min_X"] == undefined ? -33 : option["min_X"];
		param["max_Y"] = option["max_Y"] == undefined ? 255 : option["spmax_Ylit_X"];
		param["min_Y"] = option["min_Y"] == undefined ? 0 : option["min_Y"];
	}else{
		param={split_X:6,split_Y:5,tolerance:3,max_X:45,min_X:-33,max_Y:255,min_Y:0};
	}
    var newfilter=new FilterEdit(param);
    newfilter._init(document.getElementById(divid));//加载一个div
    newfilter._draw();//绘制
    newfilter.onchangestatus=function(position,line) 
    {  
    	if(moveCallback != undefined)
    	{
    		var temLine = [];
	        for(var i=0; i<line.length; i++)
	        {
	            temLine[2*i] = line[i][0];
	            temLine[2*i + 1] = line[i][1];
	        }
	        moveCallback(temLine);
    	} 
    }
    newfilter.onchangestatus_over=function(position,line) 
    {
        if(overCallback != undefined)
        {
        	var temLine = [];
	        for(var i=0; i<line.length; i++)
	        {
	            temLine[2*i] = line[i][0];
	            temLine[2*i + 1] = line[i][1];
	        }
        	overCallback(temLine);
        }
    }
}