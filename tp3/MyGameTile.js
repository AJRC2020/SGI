import { CGFobject, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyRectangle } from "./MyRectangle.js";


export class MyGameTile extends CGFobject {
    constructor(scene, id, row, col, color, textures) {
        super(scene);
        this.row = row;
        this.col = col;
        this.piece = null;
        this.id = id;
        this.textures = textures;
        this.text = false;

        if (color[0] == 0.0)
            this.color = "BLACK";
        else
            this.color = "WHITE";

        this.tile = new MyRectangle(this.scene, "", 0.0, 0.5, 0.0, 0.5);

        this.material = new CGFappearance(this.scene);
        this.material.setShininess(1.0);
        this.material.setAmbient(color[0], color[1], color[2], 1.0);
        this.material.setDiffuse(color[0], color[1], color[2], 1.0);
        this.material.setSpecular(color[0] / 2, color[1] / 2, color[2] / 2, 1.0);
        this.material.setEmission(color[0] / 2, color[1] / 2, color[2] / 2, 1.0);

        this.possible = new CGFappearance(this.scene);
        this.possible.setShininess(1.0);
        this.possible.setAmbient(0.0, 1.0, 0.0, 1.0);
        this.possible.setDiffuse(0.0, 1.0, 0.0, 1.0);
        this.possible.setSpecular(0.0, 0.5, 0.0, 1.0);
        this.possible.setEmission(0.0, 0.5, 0.0, 1.0);

        this.impossible = new CGFappearance(this.scene);
        this.impossible.setShininess(1.0);
        this.impossible.setAmbient(1.0, 0.0, 0.0, 1.0);
        this.impossible.setDiffuse(1.0, 0.0, 0.0, 1.0);
        this.impossible.setSpecular(0.5, 0.0, 0.0, 1.0);
        this.impossible.setEmission(0.5, 0.0, 0.0, 1.0);

        this.selected = new CGFappearance(this.scene);
        this.selected.setShininess(1.0);
        this.selected.setAmbient(0.0, 0.0, 1.0, 1.0);
        this.selected.setDiffuse(0.0, 0.0, 1.0, 1.0);
        this.selected.setSpecular(0.0, 0.0, 0.5, 1.0);
        this.selected.setEmission(0.0, 0.0, 0.5, 1.0);

        this.shader = new CGFshader(this.scene.gl, "shader/fill.vert", "shader/fill.frag");
    }

    assignPiece(piece) {
        this.piece = piece;
    }

    removePiece() {
        var piece = this.piece;
        this.piece = null;
        return piece;
    }

    get_loc() {
        return [this.row, this.col];
    }

    checkCollision(coords, orientation_x, orientation_y) {
        let check1 = null;
        let check2 = null;
        if (orientation_x)
            check1 = coords[0] > this.col && coords[0] < this.col + 1;
        else
            check1 = coords[0] < this.col && coords[0] > this.col - 1;

        if (orientation_y)
            check2 = coords[1] > this.row && coords[1] < this.row + 1;
        else
        check2 = coords[1] < this.row && coords[1] > this.row - 1;

        return check1 && check2;
    }

    updateScene(scene) {
        switch(scene) {
            case 0:
                if (this.color == "BLACK") {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.0, 0.0, 0.0, 1.0);
                    this.material.setDiffuse(0.0, 0.0, 0.0, 1.0);
                    this.material.setSpecular(0.0, 0.0, 0.0, 1.0);
                    this.material.setEmission(0.0, 0.0, 0.0, 1.0);
                }
                else {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(1.0, 1.0, 1.0, 1.0);
                    this.material.setDiffuse(1.0, 1.0, 1.0, 1.0);
                    this.material.setSpecular(0.5, 0.5, 0.5, 1.0);
                    this.material.setEmission(0.5, 0.5, 0.5, 1.0); 
                }
                this.text = false;
                this.material.setTexture(null);
                this.impossible.setTexture(null);
                this.possible.setTexture(null);
                this.selected.setTexture(null);
                break;
            case 1:
                if (this.color == "BLACK") {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.0, 0.0, 0.0, 1.0);
                    this.material.setDiffuse(0.0, 0.0, 0.0, 1.0);
                    this.material.setSpecular(0.0, 0.0, 0.0, 1.0);
                    this.material.setEmission(0.0, 0.0, 0.0, 1.0);

                    this.material.setTexture(this.textures[0]);
                    this.impossible.setTexture(this.textures[0]);
                    this.possible.setTexture(this.textures[0]);
                    this.selected.setTexture(this.textures[0]);
                }
                else {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(1.0, 0.0, 1.0, 1.0);
                    this.material.setDiffuse(1.0, 0.0, 1.0, 1.0);
                    this.material.setSpecular(0.5, 0.0, 0.5, 1.0);
                    this.material.setEmission(0.5, 0.0, 0.5, 1.0);

                    this.material.setTexture(this.textures[1]);
                    this.impossible.setTexture(this.textures[1]);
                    this.possible.setTexture(this.textures[1]);
                    this.selected.setTexture(this.textures[1]);
                }
                this.text = true;
                break;
            case 2:
                if (this.color == "BLACK") {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(0.0, 0.0, 0.0, 1.0);
                    this.material.setDiffuse(0.0, 0.0, 0.0, 1.0);
                    this.material.setSpecular(0.0, 0.0, 0.0, 1.0);
                    this.material.setEmission(0.0, 0.0, 0.0, 1.0);
                }
                else {
                    this.material = new CGFappearance(this.scene);
                    this.material.setShininess(1.0);
                    this.material.setAmbient(1.0, 1.0, 1.0, 1.0);
                    this.material.setDiffuse(1.0, 1.0, 1.0, 1.0);
                    this.material.setSpecular(1.0, 1.0, 1.0, 1.0);
                    this.material.setEmission(1.0, 1.0, 1.0, 1.0); 
                }
                
                //this.batmanText.unbind();
                //this.riddlerText.unbind();
                break;
        }

        if (this.piece != null) {
            this.piece.updateScene(scene);
        }
    }

    display(special) {
        if (this.text) {
            this.scene.setActiveShaderSimple(this.shader);
        }
        switch(special) {
            case "nothing":
                this.material.apply();
                //if (this.text)
                //    this.shader.setUniformsValues({"colorMat" : this.material.ambient});
                break;
            case "selected":
                this.selected.apply();
                //if (this.text)
                //    this.shader.setUniformsValues({"colorMat" : this.selected.ambient});
                break;
            case "possible":
                this.possible.apply();
                //if (this.text)
                //    this.shader.setUniformsValues({"colorMat" : this.possible.ambient});
                break;
            case "impossible":
                this.impossible.apply();
                //if (this.text)
                //    this.shader.setUniformsValues({"colorMat" : this.impossible.ambient});
                break;
        }
        this.scene.pushMatrix();
        this.scene.translate(0.5 * this.col, 0.5 * this.row, 1.26);
        this.tile.display();
        if (this.text) {
            this.scene.setActiveShaderSimple(this.scene.defaultShader);
        }
        if (this.piece != null) {
            this.scene.pushMatrix();
            this.scene.translate(0.25, 0.25, 0.01);
            this.scene.scale(0.1, 0.1, 0.25);
            this.scene.registerForPick(this.piece.id, this.piece);
            this.piece.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }
}