importScripts('../../libs/axios.min.js');

const TO_RADIANS = Math.PI / 180.0;
const TO_DEGREES = 180.0 / Math.PI;

class Position {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

async function requestFloat64Array(rec, size) {
    const url = getUrl(rec, size);
    const resp = await axios.get(url, { responseType: 'arraybuffer' });

    return new Float64Array(resp.data);
}

const getUrl = function (rectangle, size) {
    //return `http://${location.hostname}:9081/zs/data/Terrain/lyg/tile/dem?=&origin=left%7Ctop&id=16%2C20129%2C109019&size=${size[0]}%2C${size[1]}&range=${rectangle.west}%2C${rectangle.south}%2C${rectangle.east}%2C${rectangle.north}`;
    return `http://192.168.8.97:9080/zs/data/DEMO/DEM/tile/dem?=&origin=left%7Ctop&id=16%2C20129%2C109019&size=${size[0]}%2C${size[1]}&range=${rectangle.west}%2C${rectangle.south}%2C${rectangle.east}%2C${rectangle.north}`;

}

onmessage = async function (e) {
    const data = e.data;
    const type = data.type;
    if (!type) throw '未指定计算类型！';
    const compute = dispatchCompute(type);
    if (typeof compute === 'function') compute(data);
};

function dispatchCompute(type) {
    switch (type) {
        case 'submerged': return submergedCompute;
        case 'viewCompute': return viewCompute;
        case 'dominantCompute': return dominantCompute;
        default: return e => { console.error('未找到指定计算类型方法！') };
    }
}

//最高点分析
async function dominantCompute(data) {
    const pots = data.positions;
    const density = data.interpolationDensity;//插值密度
    const size = [density, density];

    const rec = getRectangle(pots);
    const f64a = await requestFloat64Array(rec, size);
    let hightest = 0;
    let hightestPos;

    for (let i = 0; i < f64a.byteLength; i++) {
        const row = Math.floor(i / density);
        const col = i % density;
        const pos = win2pos({ left: col, top: row }, { width: density, height: density }, rec);
        const h = f64a[i];
        pos.z = h;
        if (h > hightest && isInnerPoint(pos, pots)) {
            hightest = h;
            hightestPos = pos;
        }
    }
    self.postMessage(hightestPos);
}


//可视域分析
async function viewCompute(data) {
    const pots = data.positions;
    const center = data.center;
    const density = data.interpolationDensity;//插值密度
    const height = center.z;
    const size = [density, density];

    const rec = getRectangle(pots);
    const f64a = await requestFloat64Array(rec, size);

    const vpos = [];

    for (let i = 0; i < pots.length; i++) {
        const pos = pots[i];
        for (let j = 1; j - 1 < density; j++) {
            const x = (pos.x - center.x) * j / density + center.x;
            const y = (pos.y - center.y) * j / density + center.y;
            const z = (pos.z - center.z) * j / density + center.z;
            const offset = pos2win({ x: x, y: y, z: z }, { width: density, height: density }, rec);
            const i64 = offset.top * density + offset.left;
            const h = f64a[i64];
            if (h > height) {
                vpos.push({ x: x, y: y, z: z });
                break;
            }
        }
        if (vpos.length < i + 1)
            vpos.push(pos);
    }
    self.postMessage(vpos);

}

//淹没分析计算
async function submergedCompute(data) {
    const pots = data.positions;
    const height = data.height;
    const size = data.canvasSize;
    const imgData = data.imgData;
    const dt = imgData.data;

    const rec = getRectangle(pots);

    const f64a = await requestFloat64Array(rec, size);

    const col = size[0];
    const row = size[1];

    for (let i = 0; i < dt.length; i += 4) {
        const left = i / 4 % col;
        const top = Math.floor(i / col / 4);
        const offset = {
            left: left,
            top: top
        };
        const recc = {
            width: col,
            height: row
        };
        const i64 = i / 4;
        const pos = win2pos(offset, recc, rec);

        if (isInnerPoint(pos, pots) && f64a[i64] < height) {
            dt[i + 3] = 255;
            dt[i + 2] = 255;
            dt[i + 1] = 255;
            dt[i] = 255;
        }
    }
    self.postMessage(imgData);
}

//地理坐标转换到画布坐标
function pos2win(pos, recc, rec) {
    const x = pos.x;
    const y = pos.y;
    const left = recc.width * (x - rec.west) / (rec.east - rec.west);
    const top = recc.height * (rec.north - y) / (rec.north - rec.south);
    return { left: parseInt(left), top: parseInt(top) };
}

//画布坐标转换到地理坐标
function win2pos(offset, recc, rec) {
    var x = rec.east * offset.left / recc.width + rec.west * (recc.width - offset.left) / recc.width;
    var y = rec.north * (recc.height - offset.top) / recc.height + rec.south * offset.top / recc.height;
    return new Position(x, y, 0);
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
function isInnerPoint(testpt, points) {

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

