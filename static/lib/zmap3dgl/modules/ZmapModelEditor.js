import Calc from './ZmapCompute.js';

export default class {

    constructor(viewer, opts = {}) {
        if (!(viewer instanceof Cegore.Viewer)) throw '必须传入viewer参数！';
        this.opts = opts;

        this.calc = new Calc(viewer);
        this.trackedEntity = null;
        this.czviewer = viewer._czdata.viewer;
        this.selectedModel = null;
        this.palette = document.getElementById('palette');
        this.showPanel = opts.showPanel ? true : false;
    }

    startPickModel() {
        const { silhouetteColor, silhouetteSize, isTrack } = this.opts;
        const { viewer, czviewer } = this;

        const needTrack = Cegore.TypeCheck.defaultValue(isTrack, true);
        const that = this;

        //设置模型选中样式
        let color = null;
        let size = 0;
        this.listener = this.czviewer.selectedEntityChanged.addEventListener(e => {
            if (e && e.model && e.model instanceof Cesium.ModelGraphics) {//选中模型
                if (this.trackeModel) {
                    this.trackeModel.silhouetteSize = size;
                    this.trackeModel.silhouetteColor = color;
                }
                this.trackeModel = e.model;
                color = e.model.silhouetteColor;
                size = e.model.silhouetteSize;
                e.model.silhouetteColor = Cegore.TypeCheck.defaultValue(silhouetteColor, Cesium.Color.YELLOW);
                e.model.silhouetteSize = Cegore.TypeCheck.defaultValue(silhouetteSize, 2);
                if (needTrack) {
                    czviewer.trackedEntity = e;
                    this.trackedEntity = e;
                }
                if (this.showPanel) {
                    this.bindModel(e.model);
                    this.palette.style.display = 'block';
                }
                czviewer.scene.screenSpaceCameraController.enableInputs = false;
            }
            else {//未选中模型
                czviewer.scene.screenSpaceCameraController.enableInputs = true;
                this.trackeModel.silhouetteSize = size;
                this.trackeModel.silhouetteColor = color;
                if (needTrack && this.trackedEntity === czviewer.trackedEntity)
                    czviewer.trackedEntity = null;
                if (this.showPanel) {
                    this.unbindModel([this.colorE, this.alphaE, this.silhouetteColorE, this.silhouetteSizeE, this.silhouetteAlphaE, this.scaleE]);
                    this.palette.style.display = 'none';
                }
            }
        });
        this.registerActions();
    }

    //绑定dom和模型属性
    bindModel(model) {
        this.colorE = document.getElementsByName('color')[0];
        this.alphaE = document.getElementsByName('alpha')[0];
        this.silhouetteColorE = document.getElementsByName('silhouetteColor')[0];
        this.silhouetteSizeE = document.getElementsByName('silhouetteSize')[0];
        this.silhouetteAlphaE = document.getElementsByName('silhouetteAlpha')[0];
        this.scaleE = document.getElementsByName('scale')[0];

        bindProperty('color', this.colorE, this.colorRGB2Hex, Cesium.Color.fromCssColorString);
        bindProperty('color', this.alphaE, e => {
            if (!e) return;
            return e.getValue().alpha;
        }, e => {
            if (!model.color) return;
            return this.getColorByAlpha(model.color, e);
        });
        bindProperty('silhouetteColor', this.silhouetteColorE, this.colorRGB2Hex, Cesium.Color.fromCssColorString);
        bindProperty('silhouetteSize', this.silhouetteSizeE);
        bindProperty('silhouetteColor', this.silhouetteAlphaE, e => {
            if (!e) return;
            return e.getValue().alpha;
        }, e => {
            if (!model.silhouetteColor) return;
            return this.getColorByAlpha(model.silhouetteColor, e);
        });
        bindProperty('scale', this.scaleE, parseFloat, parseFloat);

        //绑定input标签和模型属性
        function bindProperty(property, el, translator, reverse) {
            const elValue = typeof translator === 'function' ? translator(model[property]) : model[property];
            if (elValue) el.value = elValue;
            el.onchange = e => {
                model[property] = typeof reverse === 'function' ? reverse(el.value) : el.value;
            }
        }
    }

    //监听鼠标拖动操作
    registerActions() {
        const { viewer, czviewer, calc } = this;
        const sceneHandler = this.sceneHandler = new Cesium.ScreenSpaceEventHandler(this.czviewer.canvas);

        let f = false;//记录左键是否按下
        sceneHandler.setInputAction(e => {
            f = true;
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        sceneHandler.setInputAction(e => {
            if (!f || !czviewer.selectedEntity) return;
            const model = czviewer.selectedEntity.model;
            if (!(model instanceof Cesium.ModelGraphics)) return;
            const endpoint = calc.getendpt(e.endPosition, 0);
            if (endpoint) czviewer.selectedEntity.position = endpoint;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        sceneHandler.setInputAction(e => {
            f = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

    }

    //取消绑定
    unbindModel(els) {
        els.forEach(e => e.onchange = null);
    }

    //rgb转16进制
    colorRGB2Hex(color) {
        if (!color) return null;
        if (color instanceof Cesium.ConstantProperty) color = color.getValue();
        if (!(color instanceof Cesium.Color)) throw "只支持Cesium.Color对象的转换";
        const rgb = color.toBytes();
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }

    getColorByAlpha(color, alpha) {
        if (!color) return null;
        if (color instanceof Cesium.ConstantProperty) color = color.getValue();
        if (!(color instanceof Cesium.Color)) throw "只支持Cesium.Color对象的转换";
        return Cesium.Color.fromAlpha(color, parseFloat(alpha));
    }

    destroy() {
        this.czviewer.selectedEntityChanged.removeEventListener(this.listener);
    }
}