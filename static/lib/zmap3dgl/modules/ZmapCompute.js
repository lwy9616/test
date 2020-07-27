export default class {
    constructor(viewer) {
        this.viewer = viewer;
        this.czviewer = viewer._czdata.viewer;
    }

    ////将视窗二维坐标换算到三位空间指定高度坐标
    getendpt(wc2, height) {
        const { viewer, czviewer } = this;
        var ray = czviewer.camera.getPickRay(wc2);
        if (height == undefined) {//未定义高度时先取模型高度,高度低于水平面时计算地形的高度
            const car3 = czviewer.scene.pickPosition(wc2);
            if (car3 && Cesium.Cartographic.fromCartesian(car3).height > 0 ) return car3;
            return czviewer.scene.globe.pick(ray, czviewer.scene);
        }
        //获取圆所在椭球体表面
        var radii = czviewer.scene.globe.ellipsoid.radii.clone();
        var offsetHeight = height;
        radii.x += offsetHeight;
        radii.y += offsetHeight;
        radii.z += offsetHeight;
        var ellipsoid = new Cesium.Ellipsoid(radii.x, radii.y, radii.z);
        var interval = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
        if (interval)
            return Cesium.Ray.getPoint(ray, interval.start);
        return new Cesium.Cartesian3();
    }

    /**
     * 计算圆上插值坐标点
     * @param {*} start 圆心坐标
     * @param {*} semi 圆半径（米）
     * @param {*} num 插值点数
     */
    getCircleLinepoints(start, semi, num = 360) {
        //将距离米按照地球的半径换算成弧度
        var semi = semi / 6371e3;
        var points = [];
        for (var i = 0; i < num; i++) {
            var radians = 2 * i * Math.PI / num;
            var point = this.getCirclePoint(start, radians, semi);
            points.push(point);
        }
        return points;
    }

    /**
     * 按照弧度计算圆上点的坐标
     * @param {*} start Cesium.Cartographic
     * @param {*} radians 
     * @param {*} semi 偏转弧度
     */
    getCirclePoint(start, radians, semi) {

        var sinlat1 = Math.sin(start.latitude);
        var coslat1 = Math.cos(start.latitude);
        var sindis = Math.sin(semi);
        var cosdis = Math.cos(semi);
        var sinazi = Math.sin(radians);
        var cosazi = Math.cos(radians);

        var latitude = Math.asin(sinlat1 * cosdis + coslat1 * sindis * cosazi);
        var longitude = start.longitude + Math.atan2(sinazi * sindis * coslat1, cosdis - sinlat1 * Math.sin(latitude));

        return Cesium.Cartographic.toCartesian(new Cesium.Cartographic(longitude, latitude, start.height));
    }

    /**
     * 计算直线上最高地形的点
     * @param {Cesium.Cartesian3} p1 直线的一个端点
     * @param {Cesium.Cartesian3} p2 直线的另一个端点
     */
    getHeightestByRay(p1, p2) {
        const { viewer, czviewer } = this;
        p1 = Cesium.Cartographic.fromCartesian(p1);
        p2 = Cesium.Cartographic.fromCartesian(p2);
        var points = [p2];
        var lon = [p1.longitude], lat = [p1.latitude], height = [p1.height];
        var flag = true;   //true:高于地平线,false:低于地平线
        for (var i = 0; i < 100; i++) {
            lon[i + 1] = Cesium.Math.lerp(p1.longitude, p2.longitude, 0.01 * (i + 1));
            lat[i + 1] = Cesium.Math.lerp(p1.latitude, p2.latitude, 0.01 * (i + 1));
            height[i + 1] = Cesium.Math.lerp(p1.height, p2.height, 0.01 * (i + 1));
            var cartographic = new Cesium.Cartographic(lon[i + 1], lat[i + 1], height[i + 1]);
            var theight = czviewer.scene.globe.getHeight(cartographic);//当前位置地形高度
            if (theight > points[0].height) {
                points = [new Cesium.Cartographic(lon[i + 1], lat[i + 1], theight)];
            } else if (theight == points[0].height) {
                points.push(new Cesium.Cartographic(lon[i + 1], lat[i + 1], theight));
            }
        }
        return points;
    }

    /**
     * 计算地形切割直线
     * @param {直线起点} p1 
     * @param {直线终点} p2 
     */
    calcLines(p1, p2) {
        const { viewer, czviewer } = this;
        var points = [p1];
        var lon = [p1.longitude], lat = [p1.latitude], height = [p1.height];
        var flag = true;   //true:高于地平线,false:低于地平线
        for (var i = 0; i < 100; i++) {
            lon[i + 1] = Cesium.Math.lerp(p1.longitude, p2.longitude, 0.01 * (i + 1));
            lat[i + 1] = Cesium.Math.lerp(p1.latitude, p2.latitude, 0.01 * (i + 1));
            height[i + 1] = Cesium.Math.lerp(p1.height, p2.height, 0.01 * (i + 1));
            var cartographic = new Cesium.Cartographic(lon[i + 1], lat[i + 1], height[i + 1]);
            var theight = czviewer.scene.globe.getHeight(cartographic);//当前位置地形高度
            if ((height[i + 1] > theight) ^ flag == 1) {
                flag = !flag;
                points.push(cartographic);
            }
        }
        return points;
    }

    async getTV(rectangle) {
        const resp = await axios.get(url, { responseType: 'arraybuffer' });
        const f64a = new Float64Array(resp.data);
        return new TerrainView(rectangle, f64a);
    }

    async pots2tv(pots) {
        const rec = getRectangle(pots);
        return this.getTV(rec);
    }

}

class TerrainView {
    constructor(rectangle, f64a) {
        this.rectangle = rectangle;
        this.buffer = f64a;
    }

    //根据坐标取高程
    getHeight(pos) {
        if (!(pos instanceof Cegore.Position)) throw new TypeError('坐标类型异常！');
        const i = this.pos2index(pos);
        return this.buffer[i];
    }

    //坐标转数组位置
    pos2index(pos) {
        const col = Math.ceil(size[0] * (pos.x - this.rectangle.west) / (this.rectangle.east - this.rectangle.west));
        const row = Math.ceil(size[1] * (pos.y - this.rectangle.south) / (this.rectangle.north - this.rectangle.south));
        const index = row * size[0] + col - 1;
        return index >= 0 ? index : 0;
    }
}

//获取多边形外包矩形
function getRectangle(pots) {
    var minx = pots[0].x < pots[1].x ? pots[0].x : pots[1].x;
    var miny = pots[0].y < pots[1].y ? pots[0].y : pots[1].y;
    var maxx = pots[0].x > pots[1].x ? pots[0].x : pots[1].x;
    var maxy = pots[0].y > pots[1].y ? pots[0].y : pots[1].y;
    for (var i = 0; i < pots.length; i++) {
        if (i < 2) continue;
        if (pots[i].x > maxx) maxx = pots[i].x;
        if (pots[i].x < minx) minx = pots[i].x;
        if (pots[i].y > maxy) maxy = pots[i].y;
        if (pots[i].y < miny) miny = pots[i].y;
    }
    return { west: minx, south: miny, east: maxx, north: maxy };
}

//判断点是否在多边形内
function isInnerPoint(testpt, points, isDegrees) {
    if (!isDegrees)
        testpt = new Cegore.Position(Cesium.Math.toDegrees(testpt.longitude),
            Cesium.Math.toDegrees(testpt.latitude));
    var iSum, iCount, iIndex, ps = points, ALon = testpt.x, ALat = testpt.y;
    var dLon1 = 0, dLon2 = 0, dLat1 = 0, dLat2 = 0, dLon;
    if (ps.length < 3) {
        return false;
    }
    iSum = 0;
    iCount = ps.length;
    for (iIndex = 0; iIndex < iCount; iIndex++) {
        var nextIndex = iIndex + 1;
        if (nextIndex >= iCount)
            nextIndex = 0;
        dLon1 = ps[iIndex].x;
        dLat1 = ps[iIndex].y;
        dLon2 = ps[nextIndex].x;
        dLat2 = ps[nextIndex].y;
        // 以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上  
        if (((ALat >= dLat1) && (ALat < dLat2)) || ((ALat >= dLat2) && (ALat < dLat1))) {
            if (Math.abs(dLat1 - dLat2) > 0) {
                //得到 A点向左射线与边的交点的x坐标：  
                dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
                // 如果交点在A点左侧（说明是做射线与 边的交点），则射线与边的全部交点数加一：  
                if (dLon < ALon)
                    iSum++;
            }
        }
    }
    if ((iSum % 2) != 0)
        return true;
    return false;
}