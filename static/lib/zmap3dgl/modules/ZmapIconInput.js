import CALC from './ZmapCompute.js';

export default class {
    constructor(viewer, opts = {}) {
        const { bottom, top, left, right, padding, width, height } = opts;

        this.viewer = viewer;
        this.czviewer = viewer._czdata.viewer;
        this.calc = new CALC(viewer);
        this.entities = [];

        this.mainPanel = document.createElement('div');
        // mainPanel.className = 'policeresourece';
        this.mainPanel.style.position = 'absolute';
        this.mainPanel.style.padding = defaultValue(padding, '2vh');
        this.mainPanel.style.bottom = defaultValue(bottom, '1vh');
        this.mainPanel.style.top = defaultValue(top);
        this.mainPanel.style.left = defaultValue(left, '.5vw');
        this.mainPanel.style.right = defaultValue(right);
        this.mainPanel.style.width = defaultValue(width, '25vh');
        this.mainPanel.style.height = defaultValue(height, '15vh');
        this.mainPanel.style.backgroundColor = 'rgb(7,28,93)';
        document.body.appendChild(this.mainPanel);
        this.registerCegoreActions();
        this.registerCegoreActions();
    }

    add(img, infos) {
        let imgEl;
        if (img instanceof Element) imgEl = img;
        if (typeof img === 'string') {
            imgEl = document.createElement('img');
            imgEl.src = img;
        }
        imgEl.draggable = false;
        // imgEl.style.position = 'absolute';
        this.mainPanel.appendChild(imgEl);

        const strs = [];
        for (const e in infos) {
            strs.push(e.concat('：').concat(infos[e]));
        }
        const infoStr = strs.join('  \n');
        this.registerDomActions(imgEl, infoStr);
    }

    /**
     * 注册事件监听
     * @param {img元素} imgEl 
     */
    registerDomActions(imgEl, infoStr) {
        const oDiv = imgEl;
        const that = this;
        oDiv.onmousedown = function (ev) {
            if ($(oDiv).css('position') != 'absolute') $(oDiv).css('position', 'absolute');
            const oEvent = ev;
            const disX = oEvent.clientX - oDiv.offsetLeft;
            const disY = oEvent.clientY - oDiv.offsetTop;
            const mouseDisX = disX - oDiv.parentElement.offsetLeft - oDiv.clientWidth / 2;
            const mouseDisY = disY - oDiv.parentElement.offsetTop - oDiv.clientHeight;
            document.onmousemove = function (ev) {
                const oEvent = ev;
                oDiv.style.left = oEvent.clientX - disX + "px";
                oDiv.style.top = oEvent.clientY - disY + "px";
            }
            document.onmouseup = function (eve) {
                document.onmousemove = null;
                document.onmouseup = null;
                const car3 = that.calc.getendpt(new Cesium.Cartesian2((eve.clientX - mouseDisX), (eve.clientY - mouseDisY)));
                const ee = that.czviewer.entities.add({
                    id: 'policeman_' + Math.random(),
                    position: car3,
                    billboard: {
                        image: oDiv,
                        pixelOffset: new Cesium.Cartesian2(0, -27),
                    },
                    label: {
                        text: infoStr,
                        font: '2.5vh -apple-system',
                        show: false,
                        fillColor: Cesium.Color.BLUE,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -53),
                        // showBackground: true,
                        backgroundColor: new Cesium.Color(174 / 255, 238 / 255, 238 / 255, .7)
                    }
                });
                that.entities.push(ee);
                that.mainPanel.removeChild(oDiv);
            }

        }
    }


    //注册三维场景点击事件
    registerCegoreActions() {
        const { viewer, czviewer, calc } = this;
        const sceneHandler = this.sceneHandler = new Cesium.ScreenSpaceEventHandler(this.czviewer.canvas);

        /** 三维场景拖拽图标 **/
        let pickedEntity;//拾取到的实体
        let canvasOffset = new Cesium.Cartesian2();//鼠标拖拽起点位置与实体位置像素偏差
        sceneHandler.setInputAction(e => {
            const primitive = czviewer.scene.pick(e.position);
            if (!primitive) return;
            const entity = primitive.id;
            if (entity && entity.id.substr(0, 10) == 'policeman_' && entity.billboard instanceof Cesium.BillboardGraphics && entity.label instanceof Cesium.LabelGraphics) {
                pickedEntity = entity;
                czviewer.scene.screenSpaceCameraController.enableInputs = false;
                const offset = czviewer.scene.cartesianToCanvasCoordinates(entity.position.getValue(new Cesium.JulianDate()));
                Cesium.Cartesian2.add(offset, Cesium.Cartesian2.negate(e.position, e.position), canvasOffset);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        sceneHandler.setInputAction(e => {
            if (!pickedEntity) return;
            const endpoint = calc.getendpt(Cesium.Cartesian2.add(e.endPosition, canvasOffset, e.endPosition));
            if (endpoint) pickedEntity.position = endpoint;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        sceneHandler.setInputAction(e => {
            pickedEntity = null;
            czviewer.scene.screenSpaceCameraController.enableInputs = true;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        //选中显示信息
        let lastSelectedEntity;
        this.listener = this.czviewer.selectedEntityChanged.addEventListener(entity => {
            if (lastSelectedEntity) lastSelectedEntity.label.show = false;
            if (entity && entity.id.substr(0, 10) == 'policeman_' && entity.billboard instanceof Cesium.BillboardGraphics && entity.label instanceof Cesium.LabelGraphics) {
                entity.label.show = true;
                lastSelectedEntity = entity;
            } else czviewer.trackedEntity = null;
        });
    }
}

function defaultValue(value, defaut) {
    if (value !== undefined && value !== null) {
        return value;
    }
    return defaut;
}