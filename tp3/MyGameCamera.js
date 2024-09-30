import { CGFcamera, CGFcameraOrtho } from "../lib/CGF.js";

export class MyGameCamera {
    constructor(scene) {
        this.scene = scene;
        this.camera = new CGFcamera(45 * Math.PI / 180, 0.1, 500, [4.5, 40, 30], [4.5, 5, 2]);
        this.camera._up = [0, -0.5, 1];
        this.turn = "BLACK";
        this.isMoving = false;
        this.elapsedTime = 0;
        this.currentTime = 0;
        this.startingTime = null;
    }

    update(t) {
        if (!this.isMoving) return;

        this.currentTime += t;
        if (this.startingTime == null) {
            this.startingTime = t;
        }
        else {
            this.elapsedTime = this.currentTime - this.startingTime;
            if (this.elapsedTime > 1.0) {
                if (this.turn == "BLACK") {
                    this.turn = "WHITE";
                    this.isMoving = false;
                    this.camera.setPosition([4.5, -30, 30]); 
                    this.startingTime = null;
                    this.currentTime = 0;
                    this.elapsedTime = 0;
                }
                else {
                    this.turn = "BLACK";
                    this.isMoving = false;
                    this.camera.setPosition([4.5, 40, 30]);
                    this.startingTime = null;
                    this.currentTime = 0;
                    this.elapsedTime = 0;
                }
            }
            else {
                if (this.turn == "BLACK" && this.elapsedTime <= 0.5) {
                    var x = 70 * this.elapsedTime;
                    var y = Math.sqrt(1225 - Math.pow(x, 2));
                    this.camera.setPosition([x + 4.5, y + 5, 30]);
                }
                else if (this.turn == "BLACK") {
                    var x = 35 - 70 * (this.elapsedTime - 0.5);
                    var y = Math.sqrt(1225 - Math.pow(x, 2));
                    this.camera.setPosition([x + 4.5, 5 - y, 30]);
                }
                else if (this.turn == "WHITE" && this.elapsedTime <= 0.5) {
                    var x = 70 * this.elapsedTime;
                    var y = Math.sqrt(1225 - Math.pow(x, 2));
                    this.camera.setPosition([4.5 - x, 5 - y, 30]);
                }
                else {
                    var x = 35 - 70 * (this.elapsedTime - 0.5);
                    var y = Math.sqrt(1225 - Math.pow(x, 2));
                    this.camera.setPosition([4.5 - x, 5 + y, 30]);
                }
            }
        }
    }

    startMoving() {
        this.isMoving = true;
    }
}