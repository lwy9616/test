
import Control from "./modules/Zmapfly.js";
import draw from "./modules/ZmapDrawing.js";
import aly from "./modules/ZmapAlysis.js";

export default function init() {

	//
	var flyControl = null;
 	$("#startControl").click(() => {
 		if(flyControl == null){
 			flyControl = new Control(map3DView.GetView());
        	//flyControl.startFly();
 		}else{
 			flyControl.closeFly();
 			flyControl = null;
 		}
        
    });
	//map.viewer = map3DView.GetCegore()  
 	
 	//距离量算
    $("#distanceMeasure").click(() => {
    	//AddFlashTip("左键点击开始量算，右键结束量算" , 2000);
    	var viewer = map3DView.GetCegore();
    	const al = new aly(viewer);
 		al.startMeasureDistance();
        
    });

    //面积量算
    $("#areaMeasure").click(() => {
    	AddFlashTip("左键点击开始量算，双击结束量算" , 2000);
    	var viewer = map3DView.GetCegore();//map.viewer
    	var czViewer = map3DView.GetView();//map.czviewer
    	const dr = new draw(viewer);
    	map3DView.RemoveEntity("measureArea");//  czViewer.entities.removeById("measureArea");
    	//map.removePolygonEntity();
 		dr.startMeasureArea({
        leftDbClick: (line, entity) => {
            // let area = viewer.scene.calcArea(line);
            // area = area / 1000000;

            var GmapMath = ZMap3DLib.Math;
            var area = GmapMath.CalcAnyPolyArea(line);
            var tip = "";
            if (area >= 10000)
            {
                area /= 1000000;
                tip = "总面积:" + area.toFixed(2) + "平方公里";
            }
            else
            {
                tip = "总面积:" + area.toFixed(2) + "平方米";
            }   



            let x = 0, y = 0, z = 0;
            for (let i = 0; i < line.length; i++) {
                x += line[i].x;
                y += line[i].y;
                z += line[i].z;
            }
            x = x / line.length;
            y = y / line.length;
            z = z / line.length;
            let pos = new GmMap3D.Cartesian3(x, y, z)
            czViewer.entities.add({
                position: pos,
                id: 'measureArea',
                label: {
                    fillColor: new GmMap3D.Color(255 / 255, 25 / 255, 25 / 255),
                    text: tip, //`${area.toFixed(2)}平方千米`,
                    font: '1.5vw arial'
                }
            });
        },
        rightClick: () => {
            czViewer.entities.removeById("measureArea");
        }
    });
        
    });
};

// function simpleline(inLine){
//     var outline = [];
//     if(inLine != undefined){
//         for(let m = 0; m < inLine.length; m++){
//             let coor = {x: inLine[m]['x'], y: inLine[m]['y'], z: inLine[m]['z']};
//             let point = map3DView.cartesianTo2MapCoord(coor);
//             outline.push(point[0]);
//             outline.push(point[1]);
//         }
//         return outline;
//     }
// }

init();