import { CGFappearance, CGFobject } from "../lib/CGF.js";
import { MyPatch } from "./MyPatch.js";

export class MyGamePiece extends CGFobject {
    constructor(scene, id, color, type) {
        super(scene);
        this.id = id;
        this.isKing = false;
        this.type = type;

        let controlpoints = [
                [0.0, -2.0, 0.0],
                [-2.0, -2.0, 0.0],
                [-2.0, 2.0, 0.0],
                [0.0, 2.0, 0.0],
                [0.0, -2.0, 0.5],
                [-2.0, -2.0, 0.5],
                [-2.0, 2.0, 0.5],
                [0.0, 2.0, 0.5],
                [0.0, -2.0, 1.0],
                [-2.0, -2.0, 1.0],
                [-2.0, 2.0, 1.0],
                [0.0, 2.0, 1.0]
        ] 
        this.patch1 = new MyPatch(this.scene, 2, 20, 3, 20, controlpoints);

        let controlpoints2 = [
            [0.0, 2.0, 1.0],
            [2.0, 2.0, 1.0],
            [2.0, -2.0, 1.0],
            [0.0, -2.0, 1.0],
            [0.0, 0.0, 1.0],
            [0.0, 0.0, 1.0],
            [0.0, 0.0, 1.0],
            [0.0, 0.0, 1.0]
        ];
        this.patch2 = new MyPatch(this.scene, 1, 20, 3, 20, controlpoints2);

        this.material = new CGFappearance(this.scene);
        this.material.setShininess(1.0);
        this.material.setAmbient(color[0], color[1], color[2], 1.0);
        this.material.setDiffuse(color[0], color[1], color[2], 1.0);
        this.material.setSpecular(color[0] / 2, color[1] / 2, color[2] / 2, 1.0);
        this.material.setEmission(color[0] / 2, color[1] / 2, color[2] / 2, 1.0);

    } 

    turnKing() {
        this.isKing = true;
    }

    removeKing() {
        this.isKing = false;
    }

    updateScene(scene) {
        switch(scene) {
            case 0:
                if (this.type == "BLACK") {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.0, 0.12, 0.33, 1.0);
                    this.material.setDiffuse(0.0, 0.12, 0.33, 1.0);
                    this.material.setSpecular(0.0, 0.06, 0.165, 1.0);
                    this.material.setEmission(0.0, 0.06, 0.165, 1.0); 
                }
                else {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.8, 0.9, 0.95, 1.0);
                    this.material.setDiffuse(0.8, 0.9, 0.95, 1.0);
                    this.material.setSpecular(0.4, 0.45, 0.475, 1.0);
                    this.material.setEmission(0.4, 0.45, 0.475, 1.0); 
                }
                break;
            
            case 1:
                if (this.type == "BLACK") {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.8, 0.7, 0.0, 1.0);
                    this.material.setDiffuse(0.8, 0.7, 0.0, 1.0);
                    this.material.setSpecular(0.4, 0.35, 0.0, 1.0);
                    this.material.setEmission(0.4, 0.35, 0.0, 1.0); 
                }
                else {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.0, 1.0, 0.0, 1.0);
                    this.material.setDiffuse(0.0, 1.0, 0.0, 1.0);
                    this.material.setSpecular(0.0, 0.5, 0.0, 1.0);
                    this.material.setEmission(0.0, 1.0, 0.0, 1.0); 
                }
                break;
        }
    }

    display() {
        this.material.apply();
        this.scene.scale(1.0, 1.0, 0.5);
        if (this.isKing) {
            this.scene.pushMatrix();
            this.scene.scale(1.0, 1.0, 2.0);
        }
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 0, 1);
        this.patch1.display();
        this.patch2.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.patch1.display();
        this.patch2.display();
        if (this.isKing) {
            this.scene.popMatrix();
        }
        this.scene.popMatrix()
    }
}