/*
 * param参数 *为空则为默认值
 * name_X:x轴名称
 * split_X:x轴分段数
 * max_X:x轴最大值
 * min_X:x轴最小值
 * tolerance:点击容差
 * ...
 * line:二维数组,[[x1,y1],[x2,y2],...]
 * */
var FilterEdit = function(param)
{
	if(param){
		this._name_X= param.name_X ? param.name_X : "属性值";
	    this._split_X= param.split_X ? param.split_X : 4;
	    this._max_X = param.max_X ? param.max_X : 1000;
	    this._min_X = param.min_X ? param.min_X : 0;
	    
	    this._name_Y= param.name_Y ? param.name_Y : "透明度";
	    this._split_Y= param.split_Y ? param.split_Y : 5;
	    this._max_Y = param.max_Y ? param.max_Y : 1000;
	    this._min_Y = param.min_Y ? param.min_Y : 0;
	    
	    this.tolerance = param.tolerance ? param.tolerance : 3;
	    this._line = param.line ? param.line : [[this._min_X,this._min_Y],[this._max_X,this._max_Y]];
    }
	else{
		this._name_X=  "属性值";
	    this._split_X= 4;
	    this._max_X =1000;
	    this._min_X = 0;
	    this._name_Y="透明度";
	    this._split_Y= 5;
	    this._max_Y =1000;
	    this._min_Y = 0;
	    this.tolerance=3;
	    this._line =[[0,0],[this._max_X,this._max_Y]];
	}
    ///
   
}
FilterEdit.prototype = {
		 constructor:FilterEdit,
		 _init:function(div)
		 {		
			 	this.x_axis=30;
			  this.y_axis=40;
			  this._width = div.offsetWidth;
			  this._height = div.offsetHeight;
			  this.painter= document.createElement('canvas');
			  this.painter.width=this._width;
			  this.painter.height=this._height;
			  var lbtn_down=0;
			  var thisobj=this;
			  var point_line;
			  this.parse_line();
			  var highlight_status=-1;
			  this.painter.addEventListener('mousedown',function(e){
				
				  if(point_line.relation==1)
					  lbtn_down=1;
				  else if(point_line.relation==2)
				  {
					  //插入点
					  thisobj.trans_line.splice(point_line.position,0,point_line.point);
					  lbtn_down=1;
					  highlight_status=point_line.position;
					  thisobj._draw(highlight_status);
					  thisobj.reverse_parse_line();
				}
			  })
			  this.painter.addEventListener('mousemove',function(e){
				 if(lbtn_down==1){
					var yposition;
					if(e.offsetY<=50)
						yposition=50;
					else if(e.offsetY>thisobj._height-thisobj.x_axis)
						yposition=thisobj._height-thisobj.x_axis;
					else
						yposition=e.offsetY;
					
						if(point_line.position==0)
							thisobj.trans_line[point_line.position]=[thisobj.y_axis,yposition];
						else if(point_line.position==thisobj.trans_line.length-1)
							thisobj.trans_line[point_line.position]=[thisobj._width-50,yposition];
						else
							{
								thisobj.trans_line[point_line.position]=[e.offsetX,yposition];
								
								for(var i=1;i<thisobj.trans_line.length-1-point_line.position;i++){
									if(thisobj.trans_line[point_line.position+i][0]<=e.offsetX)
										thisobj.trans_line[point_line.position+i][0]=e.offsetX;
								}
								for(var i=0;i<point_line.position;i++){
									if(thisobj.trans_line[i][0]>=e.offsetX)
										thisobj.trans_line[i][0]=e.offsetX;
								}
								if(e.offsetX>=thisobj._width-50)
								{
									thisobj.trans_line.splice(point_line.position+1,thisobj.trans_line.length-1-point_line.position);
									thisobj.trans_line[point_line.position]=[thisobj._width-50,yposition];
								}
								if(e.offsetX<=thisobj.y_axis)
								{
									thisobj.trans_line.splice(0,point_line.position);
									point_line.position=0;
									thisobj.trans_line[0]=[thisobj.y_axis,yposition];
								}
							}
						highlight_status=point_line.position;
						thisobj._draw(point_line.position);
						thisobj.reverse_parse_line();
					thisobj.onchangestatus(point_line.position,thisobj._line);
				 }
				 else{
					 //mouseon
					  var point=[e.offsetX,e.offsetY];
					  point_line=relation(point, thisobj.trans_line,thisobj.tolerance);
					 
					  if(point_line.relation==1)
						  {
						  	thisobj.highlight(point_line.position);
						  	highlight_status=point_line.position;
						  }
					  else
					  {
						  if(highlight_status>=0)
						  {	  thisobj._draw();
						  highlight_status=-1;
						  }
					  }
				 }
			  })
			   this.painter.addEventListener('mouseup',function(e){
				   if(lbtn_down==1){lbtn_down=0;
				   thisobj.onchangestatus_over(point_line.position,thisobj._line);}
			  })
			  this.painter.addEventListener('mouseout',function(e){
				  if(lbtn_down==1){lbtn_down=0;
				   thisobj.onchangestatus_over(point_line.position,thisobj._line);}
			  })
		       div.appendChild(this.painter);
		 },
		 _draw:function(i)
		 {
			 this.clearCanvas();
			 this._draw_arrow();
			 this._draw_line(i);
		 },
		 _draw_arrow:function()
		 {
			 var context = this.painter.getContext("2d");
			 context.beginPath();
			    context.lineWidth = "1";
			    context.strokeStyle = "#272727";
			    context.font = "12px Courier New";
			    context.fillStyle = "black";
			   //y
			    context.moveTo(this.y_axis,this._height-this.x_axis);
			    context.lineTo(this.y_axis,30);
			    context.lineTo(this.y_axis-4,34);
			    context.moveTo( this.y_axis,30);
			    context.lineTo( this.y_axis+4,34);
			    //x
			    context.moveTo( this.y_axis,this._height-this.x_axis);
			    context.lineTo(this._width-30,this._height-this.x_axis);
			    context.lineTo(this._width-34,this._height-this.x_axis-4);
			    context.moveTo(this._width-30,this._height-this.x_axis);
			    context.lineTo(this._width-34,this._height-this.x_axis+4);
			    //x刻度
			    var cell_x=(this._width-50-this.y_axis)/this._split_X;
			    var cell_x_value=((this._max_X-this._min_X)/this._split_X).toFixed(0);
			    for(var i=1;i<=this._split_X;i++)
			    	{
			    	 	context.moveTo(cell_x*i+this.y_axis,this._height-this.x_axis);
					    context.lineTo(cell_x*i+this.y_axis,this._height-this.x_axis+5);
					    context.fillText(this._min_X+cell_x_value*i,cell_x*i+this.y_axis-12,this._height-this.x_axis+15);
			    	}
			    context.moveTo(this._width-50,this._height-30);
			    context.lineTo(this._width-50,50);
			    context.fillText(this._name_X,this._width-40,this._height-this.x_axis-11);
			    context.fillText(this._name_Y,this.y_axis-15,20);
			    context.stroke();
			    context.beginPath();
			    //y刻度
			    context.strokeStyle = "#4DFFFF";
			    context.lineWidth = "1";
			    var cell_y=(this._height-this.x_axis-50)/this._split_Y;
			    var cell_y_value=((this._max_Y-this._min_Y)/this._split_Y).toFixed(0);
			    for(var i=0;i<this._split_Y;i++)
			    	{
			    	 	context.moveTo(this.y_axis,cell_y*i+50);
					    context.lineTo(this._width-50,cell_y*i+50);
					    context.fillText(this._max_Y-cell_y_value*i,this.y_axis-30,cell_y*i+55);
			    	}
			    context.stroke();
		 },
		 _draw_line:function(position)
		 {
			 var context = this.painter.getContext("2d");
			 context.beginPath();
			 context.lineWidth = "1";
			 context.strokeStyle = "#272727";
			 context.moveTo(this.trans_line[0][0],this.trans_line[0][1]);
			 for(var i=1;i<this.trans_line.length;i++){
				 context.lineTo(this.trans_line[i][0],this.trans_line[i][1]);
			 }
			 context.stroke();
			 for(var i=0;i<this.trans_line.length;i++){
				 context.beginPath();
				 context.arc(this.trans_line[i][0],this.trans_line[i][1],4,0,Math.PI*2); 
				 context.fill();
			 }
			 if(position)
				 {
				 	this.highlight(position);
				 }
		 },
		 highlight:function(i){
			 var context = this.painter.getContext("2d");
			 context.beginPath();
			 context.lineWidth = "1";
			 context.strokeStyle = "#271616";
			 context.arc(this.trans_line[i][0],this.trans_line[i][1],6,0,Math.PI*2); 
			 context.fill();
		 },
		 clearCanvas:function() {
			 var context = this.painter.getContext("2d");
			 context.beginPath(); 
			 context.fillStyle="#fff";  
			 context.fillRect(0,0,this._width,this._height);  
			 context.closePath();
		 },
		 parse_line:function()
		 {
			 this.trans_line=[];
			 for(var i=0;i<this._line.length;i++){
				 var re=[];
				 re[0]=(this._line[i][0]-this._min_X)/ (this._max_X-this._min_X)*(this._width-this.y_axis-50)+this.y_axis;
				 re[1]=this._height-this.x_axis-((this._line[i][1]-this._min_Y)/ (this._max_Y-this._min_Y)*(this._height-this.x_axis-50));
				 this.trans_line.push(re);
			 }
			
		 },
		 reverse_parse_line:function()
		 {
			 this._line=[];
			 for(var i=0;i<this.trans_line.length;i++){
				 var re=[];
				 re[0]=((this.trans_line[i][0]-this.y_axis)/(this._width-this.y_axis-50)*(this._max_X-this._min_X)+this._min_X).toFixed(1);
				 re[1]=((this._height-this.x_axis-this.trans_line[i][1])/(this._height-this.x_axis-50)*(this._max_Y-this._min_Y)+this._min_Y).toFixed(1);
				 this._line.push(re);
			 }
			
		 },
		 onchangestatus:function()
		 {
			 
		 },
		 onchangestatus_over:function()
		 {
			 
		 }
}
function relation(point,line,tole)
{
	var obj={};
	for(var i=0;i<line.length;i++)
	{
		if(pp_distance(point,line[i])<=tole+2)
			{obj.relation=1;
			obj.position=i;
			return obj;}
	}
	for(var i=0;i<line.length-1;i++)
	{
		if(PointLine_Disp(point[0],point[1],line[i][0],line[i][1],line[i+1][0],line[i+1][1])<=tole)
			{obj.relation=2;
			obj.point=point;
			obj.position=i+1;
			return obj;}
	}
	obj.relation=0;
	return obj;
}
function pp_distance(point1,point2)
{
	var xdiff =point1[0]-point2[0];            // 计算两个点的横坐标之差
	var ydiff = point1[1]-point2[1];  
	return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5); 
}
function PointLine_Disp(xx, yy, x1, y1, x2, y2)  
{  
   var a, b, c, ang1, ang2, ang, m;  
       var result = 0;  
       //分别计算三条边的长度  
       a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));  
       if (a == 0)  
           return -1;  
       b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));  
       if (b == 0)  
           return -1;  
       c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));  
       //如果线段是一个点则退出函数并返回距离  
       if (c == 0)  
       {  
           result = a;  
           return result;  
       }  
       //如果点(xx,yy到点x1,y1)这条边短  
       if (a < b)  
       {  
           //如果直线段AB是水平线。得到直线段AB的弧度  
           if (y1 == y2)  
           {  
               if (x1 < x2)  
                   ang1 = 0;  
               else  
                   ang1 = Math.PI;  
           }  
           else  
           {  
               m = (x2 - x1) / c;  
               if (m - 1 > 0.00001)  
                   m = 1;  
               ang1 = Math.acos(m);  
               if (y1 >y2)  
                   ang1 = Math.PI*2  - ang1;//直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度  
           }  
           m = (xx - x1) / a;  
           if (m - 1 > 0.00001)  
               m = 1;  
           ang2 = Math.acos(m);  
           if (y1 > yy)  
               ang2 = Math.PI * 2 - ang2;//直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度  
            
           ang = ang2 - ang1;  
           if (ang < 0) ang = -ang;  
            
           if (ang > Math.PI) ang = Math.PI * 2 - ang;  
           //如果是钝角则直接返回距离  
           if (ang > Math.PI / 2)  
               return a;  
           else  
               return a * Math.sin(ang);  
       }  
       else//如果(xx,yy)到点(x2,y2)这条边较短  
       {  
           //如果两个点的纵坐标相同，则直接得到直线斜率的弧度  
           if (y1 == y2)  
               if (x1 < x2)  
                   ang1 = Math.PI;  
               else  
                   ang1 = 0;  
           else  
           {  
               m = (x1 - x2) / c;  
               if (m - 1 > 0.00001)  
                   m = 1;  
               ang1 = Math.acos(m);  
               if (y2 > y1)  
                   ang1 = Math.PI * 2 - ang1;  
           }  
           m = (xx - x2) / b;  
           if (m - 1 > 0.00001)  
               m = 1;  
           ang2 = Math.acos(m);//直线(x2-x1)-(xx,yy)斜率的弧度  
           if (y2 > yy)  
               ang2 = Math.PI * 2 - ang2;  
           ang = ang2 - ang1;  
           if (ang < 0) ang = -ang;  
           if (ang > Math.PI) ang = Math.PI * 2 - ang;//交角的大小  
           //如果是对角则直接返回距离  
           if (ang > Math.PI / 2)  
               return b;  
           else  
               return b * Math.sin(ang);//如果是锐角，返回计算得到的距离  
       }  
}  