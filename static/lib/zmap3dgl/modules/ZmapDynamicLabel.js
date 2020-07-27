
var RealTimeMarker = (function () {

    var rtm = function (viewer, options) {
        this.viewer = viewer;
        this._method = options.method || 'get';
        this._url = options.url;
        this._params = options.params || [];
        this._layer = options.layer;
        this._fieldX = options.fieldX || 'X';
        this._fieldY = options.fieldY || 'Y';
        this._fieldZ = options.fieldZ || 'Z';
        this._fieldID = options.fieldID || 'ID';
        this._fieldIcon = options.fieldIcon;
        this._fieldText = options.fieldText;
        this._icon = options.icon;
        this._color = options.color;
        this._fontSize = options.fontSize || 24;
        this._rate = options.rate || 5000;
        this._click = options.click;
        this.labels = [];
        this._showPath = options.showPath;
        this._pathWidth = options.pathWidth || 5;
        this._pathColor = options.pathColor || "red";

        this._count = 0;
        this._labels = {};
    };

    rtm.prototype.start = function () {
        if (this._loop) return;

        var self = this;
        this._loop = setInterval(function () {
            self.update();
        }, this._rate);

        this.update();
    };

    rtm.prototype.update = function () {
        var self = this;
        $.ajax({
            url: (typeof this._url === 'function') ? this._url(this._count++) : this._url,
            type: this._method,
            data: this._params,
            datatype: 'json',
            success: function (data) {
                data.rows.forEach(function (e) {
                    self.updatePOI(e);
                });
            }
        });
    };

    rtm.prototype.clear = function () {
        var viewer = this.viewer;
        if (this.labels) {
            this.labels.forEach(function (e) {
                viewer.labels.remove(e.labelObj);
                if (e.path)
                    viewer._czdata.viewer.entities.remove(e.path);
            });
        }
        clearInterval(this._loop);
    };

    rtm.prototype.updatePOI = function (data) {

        var czviewer = this.viewer._czdata.viewer;
        var id = data[this._fieldID];
        var x = data[this._fieldX];
        var y = data[this._fieldY];
        var z = data[this._fieldZ];
        var icon = this._fieldIcon ? data[this._fieldIcon] : this._icon;
        var text = data[this._fieldText];
        var label = this._labels[data[this._fieldID]];
        if (!label) {
            label = this._labels[id] = {};

            var param = {
                name: id,
                layer: this._layer,
                pos: [x, y, z]
            };

            if (text) {
                param.text = {
                    title: text,
                    size: this._fontSize,
                    color: this._color
                };
            }

            if (icon)
                param.icon = { img: icon };

            if (this._click)
                param.labelevent = { onclick: this._click };

            label.labelObj = this.viewer.labels.add(param);
            label.points = [Cesium.Cartesian3.fromDegrees(x, y, z)];

            if (this._showPath) {
                label.path = czviewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(function () {
                            return label.points;
                        }, false),
                        width: this._pathWidth,
                        followSurface: true,
                        show: true,
                        material: new Cegore.Color(this._pathColor).toCZColor()
                    }
                });
            }
            this.labels.push(label);
        }
        else {
            label.labelObj.position = [x, y, z];
            label.points.push(Cesium.Cartesian3.fromDegrees(x, y, z));
        }
    };

    return rtm;
})();

export default RealTimeMarker;