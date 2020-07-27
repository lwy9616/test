
export default function Entity2GeoJSON(entity) {

    const geometry = {};
    const GeoJSON = {
        type: 'Feature',
        geometry: geometry,
    };

    if (!(entity instanceof Cesium.Entity)) throw '只支持entity对象实力转换';

    //点
    if (entity.point && entity.point instanceof Cesium.PointGraphics) {
        geometry.type = "Point";
        geometry.coordinates = cartesian2arr(entity.position);
        return GeoJSON;
    }

    //线
    if (entity.polyline && entity.polyline instanceof Cesium.PolylineGraphics) {
        geometry.type = "LineString";
        const coordinates = geometry.coordinates = [];
        entity.positions.forEach(e => {
            coordinates.push(cartesian2arr(e));
        });
        return GeoJSON;
    }

    //多边形
    if (entity.polygon && entity.polygon instanceof Cesium.PolygonGraphics) {
        geometry.type = "Polygon";
        const coordinates = geometry.coordinates = [];
        const polygonHierarchy = entity.polygon.hierarchy;
        const outPots = [];
        polygonHierarchy.positions.forEach(e => {
            outPots.push(cartesian2arr(e));
        });
        coordinates[0] = outPots;
        polygonHierarchy.holes.forEach(h => {
            const hole = [];
            h.positions.forEach(e => {
                hole.push(cartesian2arr(e));
            });
            coordinates.push(hole);
        });
        return GeoJSON;
    }

    function cartesian2arr(cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(e);
        const position = new Cegore.Position(cartographic);
        return [position.x, position.y];
    }
}
