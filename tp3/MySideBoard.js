import { CGFobject, CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyCube } from "./MyCube.js";
import { MyGameTile } from "./MyGameTile.js";

export class MySideBoard extends CGFobject {
    constructor(scene, x, color) {
        super(scene);
        this.cube = new MyCube(scene);
        this.tiles = [];
        this.x = x;

        this.boardMaterial = new CGFappearance(this.scene);
        this.boardMaterial.setShininess(1.0);
        this.boardMaterial.setAmbient(0.0, 0.5, 1.0, 1.0);
        this.boardMaterial.setDiffuse(0.0, 0.5, 1.0, 1.0);
        this.boardMaterial.setSpecular(0.0, 0.25, 0.5, 1.0);
        this.boardMaterial.setEmission(0.0, 0.25, 0.5, 1.0);

        this.createTiles(color);
    }

    createTiles(color) {
        var texture1 = new CGFtexture(this.scene, "textures/batman.png");
        var texture2 = new CGFtexture(this.scene, "textures/riddler.png");
        for (let i = 0; i < 12; i++) {
            var tile = new MyGameTile(this.scene, 0, i - 2, this.x, color, [texture1, texture2]);
            this.tiles.push(tile);
        }
    }

    recreateTiles(color, scene) {
        this.tiles = [];
        this.createTiles(color);
        this.updateScene(scene);
    }

    insertPiece(piece) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece == null)
                this.tiles[i].assignPiece(piece);
                return;
        }
    }

    currentTile() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece == null)
                return this.tiles[i];
        }
    }

    getNumber() {
        var sum = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece != null)
                sum++;
        }
        return 12 - sum;
    }

    complete() {
        var sum = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece != null)
                sum++;
        }

        if (sum == 12)
            return true;
        else
            return false;
    }

    getById(id) {
        var i = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece != null) {
                if (this.tiles[i].piece.id == id)
                    return this.tiles[i];
            }
        }

        return null;
    }

    updateScene(scene) {
        switch(scene) {
            case 0:
                this.boardMaterial = new CGFappearance(this.scene);
                this.boardMaterial.setShininess(1.0);
                this.boardMaterial.setAmbient(0.0, 0.5, 1.0, 1.0);
                this.boardMaterial.setDiffuse(0.0, 0.5, 1.0, 1.0);
                this.boardMaterial.setSpecular(0.0, 0.25, 0.5, 1.0);
                this.boardMaterial.setEmission(0.0, 0.25, 0.5, 1.0);

                break;
            case 1:
                this.boardMaterial = new CGFappearance(this.scene);
                this.boardMaterial.setShininess(1.0);
                this.boardMaterial.setAmbient(0.25, 0.25, 0.25, 1.0);
                this.boardMaterial.setDiffuse(0.25, 0.25, 0.25, 1.0);
                this.boardMaterial.setSpecular(0.125, 0.125, 0.125, 1.0);
                this.boardMaterial.setEmission(0.125, 0.125, 0.125, 1.0);
                break;
            case 2:
                this.boardMaterial = new CGFappearance(this.scene);
                this.boardMaterial.setShininess(1.0);
                this.boardMaterial.setAmbient(0.0, 0.5, 1.0, 1.0);
                this.boardMaterial.setDiffuse(0.0, 0.5, 1.0, 1.0);
                this.boardMaterial.setSpecular(0.0, 0.25, 0.5, 1.0);
                this.boardMaterial.setEmission(0.0, 0.25, 0.5, 1.0);
                break;
        }

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].updateScene(scene);
        }
    }

    display() {
        this.boardMaterial.apply();
        this.scene.pushMatrix();
        this.scene.scale(0.5, 6.0, 1.25);
        this.scene.translate(0.5 + this.x, 1/3, 0.5);
        this.cube.display();
        this.scene.popMatrix();

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].display("nothing")
        }
    }
}