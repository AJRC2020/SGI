import { CGFobject } from "../lib/CGF.js";
import { KeyFrameAnimation } from "./KeyFrameAnimation.js";

export class MyGameMove extends CGFobject {
    constructor(scene, piece, starting, ending, orchestrator, type) {
        super(scene);
        this.piece = piece;
        this.startingTile = starting;
        this.endingTile = ending;
        this.orchestrator = orchestrator;
        this.type = type;
        this.animation = new KeyFrameAnimation(scene);
        this.elapsedTime = 0;
        this.currentTime = 0;
        this.startingTime = null;
        this.isFinished = false;
        this.captured = false;
        
        this.createAnim();
    }

    createAnim() {
        let startingVec = this.startingTile.get_loc();
        let endingVec = this.endingTile.get_loc();
        switch(this.type) {
            case "PLAY":
            case "REVERSE":
                this.animation.keyFrames.push([0, [startingVec[1], startingVec[0], 0], [0, 0, 0], [1.0, 1.0, 1.0]]);
                this.animation.translate = [startingVec[1], startingVec[0], 0];
                this.animation.keyFrames.push([1, [endingVec[1], endingVec[0], 0.0], [0.0, 0.0, 0.0], [1.0, 1.0, 1.0]]);
                break;

            case "CAPTURE":
            case "REV_CAPTURE":
                this.animation.keyFrames.push([0, [startingVec[1], startingVec[0], 0], [0, 0, 0], [1.0, 1.0, 1.0]]);
                this.animation.translate = [startingVec[1], startingVec[0], 0];
                var midX = (endingVec[1] + startingVec[1]) / 2;
                var midY = (endingVec[0] + startingVec[0]) / 2;
                this.animation.keyFrames.push([1, [midX, midY, 2.0], [0.0, 0.0, 0.0], [1.0, 1.0, 1.0]]);
                this.animation.keyFrames.push([2, [endingVec[1], endingVec[0], 0], [0.0, 0.0, 0.0], [1.0, 1.0, 1.0]]);
                break;
        }
        if (this.type == "PLAY") {
            this.scene.lights[7].setPosition(this.startingTile.col * 1.5 + 0.75, this.startingTile.row * 1.5 + 0.75, 5.0, 1.0);
            this.scene.lights[7].setAmbient(0.0, 0.0, 0.0, 1.0);
            this.scene.lights[7].setDiffuse(1.0, 0.0, 1.0, 1.0);
            this.scene.lights[7].setSpecular(0.2, 0.2, 0.2, 1.0);
            this.scene.lights[7].setConstantAttenuation(1.0);
            this.scene.lights[7].setLinearAttenuation(0.25);
            this.scene.lights[7].setQuadraticAttenuation(0.0);
            this.scene.lights[7].setSpotCutOff(90);
            this.scene.lights[7].setSpotExponent(10);
            this.scene.lights[7].setSpotDirection(0, 0, -8.73);
            //this.scene.lights[7].setVisible(true);
            this.scene.lights[7].enable();
            this.scene.lights[7].update();
        }
    }

    finishAnim() {
        if ((this.endingTile.row == 0 && this.piece.type == "BLACK" && this.type == "PLAY") || (this.endingTile.row == 7 && this.piece.type == "WHITE" && this.type == "PLAY"))
            this.piece.turnKing();
        if ((this.startingTile.row == 0 && this.piece.type == "BLACK" && this.type == "REVERSE") || (this.startingTile.row == 7 && this.piece.type == "WHITE" && this.type == "REVERSE"))
            this.piece.removeKing();
        
        this.scene.lights[7].setPosition(this.endingTile.col * 1.5 + 0.75, this.endingTile.row * 1.5 + 0.75, 5.0, 1.0);
        this.scene.lights[7].disable();
        this.scene.lights[7].update();

        this.endingTile.assignPiece(this.piece);
        this.isFinished = true;
        this.orchestrator.addCompleteMove(this);
    }

    getCoor() {
        var trans = this.animation.translate;
        return [trans[0], trans[1]];
    }

    getOriX() {
        return this.endingTile.col - this.startingTile.col > 0;
    }

    getOriY() {
        return this.endingTile.row - this.startingTile.row > 0;
    }

    update(t) {
        //this.scene.lights[7].enable();
        this.currentTime += t;
        if (!this.isFinished) {
            if (this.startingTime == null) {
                this.startingTime = t;
            }
            else {
                this.elapsedTime = this.currentTime - this.startingTime;
                if (this.type == "PLAY" || this.type == "REVERSE") {
                    if (this.elapsedTime < 1) {
                        this.animation.update(t);
                    }
                    else {
                        this.finishAnim();
                    }
                }
                else {
                    if (this.elapsedTime < 2) {
                        this.animation.update(t);
                    }
                    else {
                        this.finishAnim();
                    } 
                }
                if (this.type == "PLAY" && !this.isFinished) {
                    this.scene.lights[7].setPosition(this.animation.translate[0] * 1.5 + 0.75, this.animation.translate[1] * 1.5 + 0.75, 5.0, 1.0);
                    this.scene.lights[7].enable();
                    this.scene.lights[7].update();
                }
            }
        }
    }

    display() {
        if (!this.isFinished) {
            this.scene.pushMatrix();
            this.scene.translate(0.5 * this.animation.translate[0] + 0.25, 0.25 + 0.5 * this.animation.translate[1], 1.27 + this.animation.translate[2]);
            this.scene.scale(0.1, 0.1, 0.25);
            this.piece.display();
            this.scene.popMatrix();
        }
    }
}