import { CGFappearance, CGFobject, CGFshader, CGFtexture } from "../lib/CGF.js";
import { MyQuad } from "./MyQuad.js";

export class MyHUD extends CGFobject {
    constructor(scene, player1, player2, orchestrator) {
        super(scene);
        this.scene = scene;
        this.quad = new MyQuad(this.scene);
        this.player1 = player1;
        this.player2 = player2;
        this.isFinished = false;
        this.orchestrator = orchestrator;
        this.dict = {
            0 : [0, 3], 1 : [1, 3], 2 : [2, 3], 3 : [3, 3], 4 : [4, 3],
            5 : [5, 3], 6 : [6, 3], 7 : [7, 3], 8 : [8, 3], 9 : [9, 3], 'A' : [1, 4], 
            'B' : [2, 4], 'C' : [3, 4], 'D' : [4, 4], 'E' : [5, 4], 'F' : [6, 4], 'G' : [7, 4],
            'H' : [8, 4], 'I' : [9, 4], 'J' : [10, 4], 'K' : [11, 4], 'L' : [12, 4], 'M' : [13, 4],
            'N' : [14, 4], 'O' : [15, 4], 'P' : [0, 5], 'Q' : [1, 5], 'R' : [2, 5], 'S' : [3, 5], 
            'T' : [4, 5], 'U' : [5, 5], 'V' : [6, 5], 'W' : [7, 5], 'X' : [8, 5], 'Y' : [9, 5],
            'Z' : [10, 5], ':' : [10, 3], "star" : [8, 0], 'star 2' : [8, 1], '!' : [1, 2], ' ' : [0, 2]
        };

        this.material = new CGFappearance(this.scene);
        this.material.setShininess(1.0);
        this.material.setAmbient(0.5, 0.5, 0.5, 0.1);
        this.material.setDiffuse(0.5, 0.5, 0.5, 0.1);
        this.material.setSpecular(0.25, 0.25, 0.25, 0.1);
        this.material.setEmission(0.25, 0.25, 0.25, 0.1);

        this.material2 = new CGFappearance(this.scene);
        this.material2.setShininess(1.0);
        this.material2.setAmbient(1.0, 1.0, 1.0, 1.0);
        this.material2.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.material2.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.material2.setEmission(1.0, 1.0, 1.0, 1.0);
    
        this.text = new CGFtexture(this.scene, "textures/oolite-font.trans.png");
        this.material.setTexture(this.text);
    
        this.shader = new CGFshader(this.scene.gl, "shader/font2.vert", "shader/font2.frag");
        this.shader.setUniformsValues({"dims" : [16, 16]});

        var texture1 = new CGFtexture(this.scene, "textures/effect1.png");
        var texture2 = new CGFtexture(this.scene, "textures/effect2.png");
        var texture3 = new CGFtexture(this.scene, "textures/effect3.png");

        this.textures = [texture1, texture2, texture3];
        this.textIndex = 0;
        this.hasCaptured = false;
        this.shaderEffects = new CGFshader(this.scene.gl, "shader/effect.vert", "shader/effect.frag");
            
        this.startingTime = null;
        this.currentTime = 0;
        this.elapsedTime = 0;
        this.timer = [];
        this.timerPlayer1 = [2, 0, ":", 0, 0];
        this.timerPlayer2 = [2, 0, ":", 0, 0];
        this.player1Time = 1200.0;
        this.player2Time = 1200.0;
    }

    update(t) {
        if (this.orchestrator.STATE == "FINISHED") return;
        this.currentTime += t;
        if (this.startingTime == null) {
            this.startingTime = t;
        }
        else {
            this.elapsedTime = this.currentTime - this.startingTime;
            this.makeTimer("NONE");
            if (this.orchestrator.turn == "BLACK" && (this.orchestrator.STATE == "NOT_SELECTED" || this.orchestrator.STATE == "SELECTED")){
                this.player1Time -= t;
                this.makeTimer("BLACK");
            }
            else if (this.orchestrator.turn == "WHITE" && (this.orchestrator.STATE == "NOT_SELECTED" || this.orchestrator.STATE == "SELECTED")){
                this.player2Time -= t;
                this.makeTimer("WHITE");
            }
        }
            
    }

    finished() {
        this.isFinished = true;
        if (this.orchestrator.turn != "BLACK")
            this.winner = this.player1 + " WINS!";
        else
            this.winner = this.player2 + " WINS!";
    }

    updateScene(scene) {
        switch(scene) {
            case 0:
                this.player1 = "BLACK";
                this.player2 = "WHITE";
                break;
            case 1:
                this.player1 = "BATMAN";
                this.player2 = "RIDDLER";
                break;
        }
    }

    makeTimer(type) {
        switch (type) {
            case "NONE":
                if (this.elapsedTime >= 360000) 
                    this.timer = [9, 9, ":", 9, 9];
                else {
                    var seconds = this.elapsedTime % 60;
                    var seconds_digit_1 = seconds / 10;
                    var seconds_digit_2 = seconds % 10;
                    var minutes = this.elapsedTime / 60;
                    var minutes_digit_1 = (minutes / 10) % 10;
                    var minutes_digit_2 = minutes % 10;

                    this.timer = [Math.floor(minutes_digit_1), Math.floor(minutes_digit_2), ":", Math.floor(seconds_digit_1), Math.floor(seconds_digit_2)];
                }
                break;

            case "BLACK":
                if (this.player1Time <= 0) {
                    this.timerPlayer2 = [0, 0, ":", 0, 0];
                }
                else {
                    var seconds = this.player1Time % 60;
                    var seconds_digit_1 = seconds / 10;
                    var seconds_digit_2 = seconds % 10;
                    var minutes = this.player1Time / 60;
                    var minutes_digit_1 = (minutes / 10) % 10;
                    var minutes_digit_2 = minutes % 10;

                    this.timerPlayer1 = [Math.floor(minutes_digit_1), Math.floor(minutes_digit_2), ":", Math.floor(seconds_digit_1), Math.floor(seconds_digit_2)];
                }
                break;

            case "WHITE":
                if (this.player2Time <= 0) {
                    this.timerPlayer2 = [0,0, ":", 0, 0];
                }
                else {
                    var seconds = this.player2Time % 60;
                    var seconds_digit_1 = seconds / 10;
                    var seconds_digit_2 = seconds % 10;
                    var minutes = this.player2Time / 60;
                    var minutes_digit_1 = (minutes / 10) % 10;
                    var minutes_digit_2 = minutes % 10;

                    this.timerPlayer2 = [Math.floor(minutes_digit_1), Math.floor(minutes_digit_2), ":", Math.floor(seconds_digit_1), Math.floor(seconds_digit_2)];
                }
                break;
        }
    }

    getScore(type) {
        var score = 0;
        if (type == "BLACK") {
            score = this.orchestrator.sideBlack.getNumber();
        }
        else {
            score = this.orchestrator.sideWhite.getNumber(); 
        }

        var digit_1 = (score / 10) % 10;
        var digit_2 = score % 10;
        var scoreDigits = [Math.floor(digit_1), Math.floor(digit_2)];

        return scoreDigits
    }

    display() {
        this.scene.setActiveShaderSimple(this.shader);
        this.shader.setUniformsValues({'colorIN' : [1.0, 1.0, 1.0, 1.0]});
        this.material.apply();
        for (let i = 0; i < this.timer.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[this.timer[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-1 + i / 2,7.75,-20);
            this.quad.display();
            this.scene.popMatrix();
        }
        for (let i = 0; i < this.player1.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[this.player1[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-23 + i,11.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }
        for (let i = 0; i < this.player2.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[this.player2[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-23 + i,10.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }
        for (let i = 0; i < this.timerPlayer1.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[this.timerPlayer1[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-14.5 + i / 2,11.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }
        for (let i = 0; i < this.timerPlayer2.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[this.timerPlayer2[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-14.5 + i / 2,10.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }

        var scoreBlack = this.getScore("BLACK");
        var scoreWhite = this.getScore("WHITE");

        for (let i = 0; i < scoreBlack.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[scoreBlack[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-16 + i / 2,11.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }

        for (let i = 0; i < scoreWhite.length; i++) {
            this.shader.setUniformsValues({'charCoords': this.dict[scoreWhite[i]]});
            this.scene.pushMatrix();
			this.scene.translate(-16 + i / 2,10.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }

        if (this.orchestrator.turn == "BLACK") {
            this.shader.setUniformsValues({'charCoords': this.dict["star"]});
            this.scene.pushMatrix();
			this.scene.translate(-12,11.75,-30);
            this.quad.display();
            this.scene.popMatrix();
            this.shader.setUniformsValues({'charCoords': this.dict["star 2"]});
            this.scene.pushMatrix();
			this.scene.translate(-12,10.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }
        else {
            this.shader.setUniformsValues({'charCoords': this.dict["star 2"]});
            this.scene.pushMatrix();
			this.scene.translate(-12,11.75,-30);
            this.quad.display();
            this.scene.popMatrix();
            this.shader.setUniformsValues({'charCoords': this.dict["star"]});
            this.scene.pushMatrix();
			this.scene.translate(-12,10.75,-30);
            this.quad.display();
            this.scene.popMatrix();
        }

        if (this.isFinished) {
            this.shader.setUniformsValues({'colorIN' : [0.828, 0.684, 0.215, 1.0]});
            for (let i = 0; i < this.winner.length; i++) {
                this.shader.setUniformsValues({'charCoords': this.dict[this.winner[i]]});
                this.scene.pushMatrix();
                this.scene.translate(-5 + i,0.75,-15);
                this.quad.display();
                this.scene.popMatrix();
            }
        }

        if (this.hasCaptured) {
            this.scene.setActiveShaderSimple(this.shaderEffects);
            this.material2.setTexture(this.textures[this.textIndex]);
            this.material2.apply();
            this.scene.pushMatrix();
            this.scene.translate(10,4.5,-30);
            this.scene.scale(7.5, 7.5, 1.0);
            this.quad.display();
            this.scene.popMatrix();
        }

        this.scene.setActiveShaderSimple(this.scene.defaultShader);
    }

}