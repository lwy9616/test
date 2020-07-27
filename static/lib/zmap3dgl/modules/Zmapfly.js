export default class Zmapfly {
    constructor(czviewer, opts = {}) {
        if (!(czviewer instanceof Cesium.Viewer)) throw '请传入Cesium.Viewer!';

        let { amount } = opts;
        amount = defaultVal(amount, .005);

        this.czviewer = czviewer;
        const camera = czviewer.camera;
        const keys = {};

        this.addKey = e => {
            keys[e.key] = 0;
        };
        this.deleteKey = e => {
            if (keys.hasOwnProperty(e.key))
                delete keys[e.key];
        };

        czviewer.scene.screenSpaceCameraController.enableInputs = false;

        document.addEventListener('keydown', this.addKey);

        document.addEventListener('keyup', this.deleteKey);

        this.removeCallback = czviewer.clock.onTick.addEventListener(e => {
            const dis = camera.positionCartographic.height * amount;

            if (keys.hasOwnProperty('a')) {
                camera.moveLeft(dis);
            }
            if (keys.hasOwnProperty('d')) {
                camera.moveRight(dis);
            }
            if (keys.hasOwnProperty('w')) {
                camera.moveForward(dis);
            }
            if (keys.hasOwnProperty('s')) {
                camera.moveBackward(dis);
            }
            if (keys.hasOwnProperty('c')) {
                camera.moveUp(dis);
            }
            if (keys.hasOwnProperty('z')) {
                camera.moveDown(dis);
            }
        });
        this.registerVieweMoveAction();
    }

    registerVieweMoveAction() {
        const czviewer = this.czviewer;
        const amount = 1;

        let isDown = false;
        this.pointerdown = e => {
            isDown = true;
        };

        this.pointerup = e => {
            isDown = false;
        }
        this.mouseMove = e => {
            if (!isDown) return;
            const mx = -e.movementX;
            const my = -e.movementY;
            czviewer.camera.lookDown(Cesium.Math.toRadians(my / czviewer.canvas.height * 180 * amount));
            czviewer.camera.lookRight(Cesium.Math.toRadians(mx / czviewer.canvas.width * 180 * amount));
            czviewer.camera.setView({
                orientation: {
                    heading: czviewer.camera.heading,
                    pitch: czviewer.camera.pitch,
                    roll: 0
                }
            });
        }
        czviewer.canvas.addEventListener('pointermove', this.mouseMove);
        czviewer.canvas.addEventListener('pointerdown', this.pointerdown);
        czviewer.canvas.addEventListener('pointerup', this.pointerup);
    }

    closeFly() {
        const czviewer = this.czviewer;

        this.removeCallback();
        document.removeEventListener('keydown', this.addKey);
        document.removeEventListener('keyup', this.deleteKey);
        czviewer.scene.screenSpaceCameraController.enableInputs = true;
        czviewer.canvas.removeEventListener('pointermove', this.mouseMove);
        czviewer.canvas.removeEventListener('pointerdown', this.pointerdown);
        czviewer.canvas.removeEventListener('pointerup', this.pointerup);

    }

}

function defaultVal(val, deflt) {
    if (val == null || val == undefined || val == NaN) return deflt;
    return val;
}