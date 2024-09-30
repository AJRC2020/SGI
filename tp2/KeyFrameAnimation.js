export class KeyFrameAnimation {
    constructor(scene) {
        this.scene = scene;
        this.keyFrames = [];
        this.translate = [0.0, 0.0, 0.0];
        this.rotate = [0.0, 0.0, 0.0];
        this.scale = [1.0, 1.0, 1.0];
        this.currentTime = 0;
        this.lastTime = 0;
        this.stage = 0;
        this.loopDuration = 0;
    }

    update(t) {
        this.lastTime += t;
        this.currentTime = this.lastTime - this.keyFrames[0][0] - this.loopDuration;

        if(this.currentTime < 0) {
            return;
        }

        else if(this.lastTime - this.loopDuration > this.keyFrames[this.keyFrames.length - 1][0]) {
            this.translate[0] = this.keyFrames[this.keyFrames.length - 1][1][0];
            this.translate[1] = this.keyFrames[this.keyFrames.length - 1][1][1];
            this.translate[2] = this.keyFrames[this.keyFrames.length - 1][1][2];

            this.rotate[0] = this.keyFrames[this.keyFrames.length - 1][2][0];
            this.rotate[1] = this.keyFrames[this.keyFrames.length - 1][2][1];
            this.rotate[2] = this.keyFrames[this.keyFrames.length - 1][2][2];

            this.scale[0] = this.keyFrames[this.keyFrames.length - 1][3][0];
            this.scale[1] = this.keyFrames[this.keyFrames.length - 1][3][1];
            this.scale[2] = this.keyFrames[this.keyFrames.length - 1][3][2];
            this.stage = 0
            this.loopDuration += this.keyFrames[this.keyFrames.length - 1][0] - this.keyFrames[0][0]; 
        }
        else {
            let breakTime = this.keyFrames[this.stage + 1][0] - this.keyFrames[this.stage][0];
            if (this.currentTime + this.keyFrames[0][0] - this.keyFrames[this.stage][0] > breakTime) this.stage++;
            let timeDiff = (this.currentTime + this.keyFrames[0][0] -this.keyFrames[this.stage][0]) / breakTime;
            let transX = (this.keyFrames[this.stage + 1][1][0] - this.keyFrames[this.stage][1][0]) * timeDiff;
            let transY = (this.keyFrames[this.stage + 1][1][1] - this.keyFrames[this.stage][1][1]) * timeDiff;
            let transZ = (this.keyFrames[this.stage + 1][1][2] - this.keyFrames[this.stage][1][2]) * timeDiff;
            let rotX = (this.keyFrames[this.stage + 1][2][0] - this.keyFrames[this.stage][2][0]) * timeDiff;
            let rotY = (this.keyFrames[this.stage + 1][2][1] - this.keyFrames[this.stage][2][1]) * timeDiff;
            let rotZ = (this.keyFrames[this.stage + 1][2][2] - this.keyFrames[this.stage][2][2]) * timeDiff;
            let scaleX = (this.keyFrames[this.stage + 1][3][0] - this.keyFrames[this.stage][3][0]) * timeDiff;
            let scaleY = (this.keyFrames[this.stage + 1][3][1] - this.keyFrames[this.stage][3][1]) * timeDiff;
            let scaleZ = (this.keyFrames[this.stage + 1][3][2] - this.keyFrames[this.stage][3][2]) * timeDiff;

            this.translate[0] = this.keyFrames[this.stage][1][0] + transX;
            this.translate[1] = this.keyFrames[this.stage][1][1] + transY;
            this.translate[2] = this.keyFrames[this.stage][1][2] + transZ;

            this.rotate[0] = this.keyFrames[this.stage][2][0] + rotX;
            this.rotate[1] = this.keyFrames[this.stage][2][1] + rotY;
            this.rotate[2] = this.keyFrames[this.stage][2][2] + rotZ;

            this.scale[0] = this.keyFrames[this.stage][3][0] + scaleX;
            this.scale[1] = this.keyFrames[this.stage][3][1] + scaleY;
            this.scale[2] = this.keyFrames[this.stage][3][2] + scaleZ;
        }
    }

    apply() {
        var tranformMatrix = mat4.create();
        mat4.identity(tranformMatrix)

        mat4.translate(tranformMatrix, tranformMatrix, this.translate);
        mat4.rotate(tranformMatrix, tranformMatrix, this.rotate[2] * Math.PI / 180, [0, 0, 1]);
        mat4.rotate(tranformMatrix, tranformMatrix, this.rotate[1] * Math.PI / 180, [0, 1, 0]);
        mat4.rotate(tranformMatrix, tranformMatrix, this.rotate[0] * Math.PI / 180, [1, 0, 0]);
        mat4.scale(tranformMatrix, tranformMatrix, this.scale);

        this.scene.multMatrix(tranformMatrix);
    }
}