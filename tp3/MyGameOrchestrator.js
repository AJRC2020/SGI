import { CGFobject } from "../lib/CGF.js";
import { MyGameBoard } from "./MyGameBoard.js";
import { MySideBoard } from "./MySideBoard.js";
import { MyGameMove } from "./MyGameMove.js";
import { MyHUD } from "./MyHUD.js";
import { MyGameCamera } from "./MyGameCamera.js";
import { MySceneGraph } from "./MySceneGraph.js";

export class MyGameOrchestrator extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scenario = 0;
        this.board = new MyGameBoard(scene, this);
        this.sideBlack = new MySideBoard(scene, 9, [1.0, 1.0, 1.0]);
        this.sideWhite = new MySideBoard(scene, -2, [0.0, 0.12, 0.33]);
        this.camera = new MyGameCamera(scene);
        this.STATE = "NOT_SELECTED";
        this.hud = new MyHUD(this.scene, "BLACK", "WHITE", this);
        this.selectedTile = null;
        this.possibleMoves = [];
        this.extraID = null;
        this.gameSequence = [];
        this.turn = "BLACK";
        this.filmMove = 0;
    }

    logPicking() {
		if (this.scene.pickMode == false) {
			// results can only be retrieved when picking mode is false
			if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
				for (var i=0; i< this.scene.pickResults.length; i++) {
					var obj = this.scene.pickResults[i][0];
					if (obj) {
						var customId = this.scene.pickResults[i][1];				
						//console.log("Picked object: " + obj + ", with pick id " + customId);
                        var tile = this.board.getById(customId);
                        if (tile != undefined) {
                            this.checkSelected(tile);
                        }
                        //picking the peça não do tile
					}
				}
				this.scene.pickResults.splice(0,this.scene.pickResults.length);
			}		
		}
	}

    getCamera() {
        return this.camera.camera;
    }

    updateScene(scene) {
        if (this.scenario == parseInt(scene)) return;
        this.scenario = parseInt(scene);
        switch(this.scenario) {
            case 0:
                var newGraph = new MySceneGraph("beach.xml", this.scene);
                break;
            case 1:
                var newGraph = new MySceneGraph("night.xml", this.scene);
                break;
        }
        this.board.updateScene(this.scenario);
        this.sideBlack.updateScene(this.scenario);
        this.sideWhite.updateScene(this.scenario);
        this.hud.updateScene(this.scenario);
    }

    checkSelected(tile) {
        switch(this.STATE) {
            case "NOT_SELECTED":
                if (tile.piece == null) {
                    if (this.extraID != null)
                        delete this.board.dict[this.extraID];
                    this.extraID = null;
                    this.board.setDict([], tile);
                }
                else {
                    if (tile.piece.type != this.turn) {
                        if (this.extraID != null)
                            delete this.board.dict[this.extraID];
                        this.extraID = null;
                        this.board.setDict([], tile);
                    }
                    else {
                        var check = this.board.checkBoardForCaptures(tile.piece.type);
                        var possibleMoves = this.board.getPossibleMoves(tile, check);
                        if (possibleMoves.length != 0) {
                            this.STATE = "SELECTED";
                            this.selectedTile = tile;
                            this.possibleMoves = possibleMoves;
                        }
                        if (this.extraID != null)
                            delete this.board.dict[this.extraID];
                        this.extraID = null;
                        this.board.setDict(possibleMoves, tile);
                    }
                }
                break;

            case "SELECTED":
                if (tile.piece != null) {
                    this.STATE = "NOT_SELECTED";
                    this.checkSelected(tile);
                }
                else {
                    for (let i = 0; i < this.possibleMoves.length; i++) {
                        if (tile.id == this.possibleMoves[i].id) {
                            this.STATE = "ANIMATE";
                            var piece = this.selectedTile.removePiece();
                            var gameMove = new MyGameMove(this.scene, piece, this.selectedTile, tile, this, "PLAY");
                            this.board.moves.push(gameMove);
                            this.board.dict = {};
                            this.selectedTile = null;
                            this.possibleMoves = [];
                            this.extraID = null;
                            return;
                        }
                    }
                    if (this.extraID != null)
                        delete this.board.dict[this.extraID];
                    this.board.dict[tile.id] = "impossible";
                    this.extraID = tile.id;
                }
                break;
        }
    }

    addCompleteMove(move) {
        if (this.STATE == "FILM") return;
        if (move.type == "REVERSE" && this.turn != this.lastTurn && this.STATE != "PREFILM")
            this.camera.startMoving();
        if (this.STATE == "PREFILM" && move.piece.id == 88)
            this.playFilm();
        if (move.type == "PLAY" || move.type == "CAPTURE")
            this.gameSequence.push(move);
        if (move.type == "PLAY") {
            if (this.turn == "BLACK" && move.captured) {
                if (!this.board.checkBoardForCaptures(this.turn)) {
                    if (this.STATE != "FILM" && this.STATE != "PREFILM")
                        this.camera.startMoving();
                    this.turn = "WHITE";
                }
            }
            else if (this.turn == "WHITE" && move.captured) {
                if (!this.board.checkBoardForCaptures(this.turn)) {
                    if (this.STATE != "FILM" && this.STATE != "PREFILM")
                        this.camera.startMoving();
                    this.turn = "BLACK"
                }
            }
            else {
                if (this.turn == "BLACK") { 
                    this.turn = "WHITE";
                    if (this.STATE != "FILM" && this.STATE != "PREFILM")
                        this.camera.startMoving();
                }
                else {
                    if (this.STATE != "FILM" && this.STATE != "PREFILM")
                        this.camera.startMoving();
                    this.turn = "BLACK";
                }
            }
            if (this.hud.hasCaptured) {
                this.hud.hasCaptured = false;
                this.hud.textIndex = (this.hud.textIndex + 1) % 3;
            }
        }
    }

    createCaptureAnim(tile) {
        if (this.STATE == "FILM")
            this.filmMove++;
        var endingTile = null;
        if (tile.piece.type == "BLACK") {
            endingTile = this.sideBlack.currentTile();
        }
        else {
            endingTile = this.sideWhite.currentTile();
        }
        var piece = tile.removePiece();
        var gameMove = new MyGameMove(this.scene, piece, tile, endingTile, this, "CAPTURE");
        this.board.moves.push(gameMove);
        if (this.scenario == 1 && this.STATE != "FILM") 
            this.hud.hasCaptured = true;
    }

    checkFinished() {
        if (((this.sideBlack.complete() || !this.board.checkForPossibleMoves("BLACK")) && this.turn == "BLACK") || this.hud.player1Time <= 0) {
            this.STATE = "FINISHED";
            this.hud.finished();
        }
        else if (((this.sideWhite.complete() || !this.board.checkForPossibleMoves("WHITE")) && this.turn == "WHITE") || this.hud.player2Time <= 0) {
            this.STATE = "FINISHED";
            this.hud.finished();
        }
    }

    undoMove() {
        this.lastTurn = this.turn;
        if (this.gameSequence.length == 0 || this.STATE == "ANIMATE" || this.STATE == "FILM") return;
        this.STATE = "ANIMATE";
        var lastMove = this.gameSequence.pop();
        if (lastMove.type == "CAPTURE") {
            var piece = lastMove.endingTile.removePiece(); 
            var reverseMove = new MyGameMove(this.scene, piece, lastMove.endingTile, lastMove.startingTile, this, "REV_CAPTURE");
            this.board.moves.push(reverseMove);
            var otherLastMove = this.gameSequence.pop();
            var piece_2 = otherLastMove.endingTile.removePiece();
            if (piece_2.type == "BLACK") this.turn = "BLACK";
            else this.turn = "WHITE";
            var reverse = new MyGameMove(this.scene, piece_2, otherLastMove.endingTile, otherLastMove.startingTile, this, "REVERSE");
            this.board.moves.push(reverse);
        }
        else {
            var piece = lastMove.endingTile.removePiece();
            if (piece.type == "BLACK") this.turn = "BLACK";
            else this.turn = "WHITE"; 
            var reverseMove = new MyGameMove(this.scene, piece, lastMove.endingTile, lastMove.startingTile, this, "REVERSE");
            this.board.moves.push(reverseMove);
        }
    }

    playFilm() {
        this.STATE = "FILM";
        this.board.recreateBoard(this.scenario);
        this.sideBlack.recreateTiles([1.0, 1.0, 1.0], this.scenario);
        this.sideWhite.recreateTiles([0.0, 0.12, 0.33], this.scenario);
        var firstMove = this.gameSequence[0];
        var starting = this.board.getById(firstMove.startingTile.id);
        var ending = this.board.getById(firstMove.endingTile.id);
        var piece = starting.removePiece();
        var newMove = new MyGameMove(this.scene, piece, starting, ending, this, firstMove.type); 
        this.board.moves.push(newMove);
    }

    preFilm() {
        if (this.gameSequence.length == 0 || this.STATE == "ANIMATE" || this.STATE == "FILM") return;
        this.STATE = "PREFILM";
        this.board.dict = {};
        let localDict = {65 : 2, 66 : 4, 67 : 6, 68 : 8, 69 : 9, 70 : 11, 71 : 13, 72 : 15, 73 : 18, 74 : 20, 75 : 22, 76 : 24, 77 : 41, 
        78 : 43, 79 : 45, 80 : 47, 81 : 50, 82 : 52, 83 : 54, 84 : 56, 85 : 57, 86 : 59, 87 : 61, 88 : 63};
        for (let id = 65; id < 89; id++) {
            var startingTile = this.getById(id);
            var endingTile = this.board.getById(localDict[id]);
            var piece = startingTile.removePiece();
            var move = new MyGameMove(this.scene, piece, startingTile, endingTile, this, "REVERSE");
            this.board.moves.push(move);
        }
    }

    forfeit() {
        this.STATE = "FINISHED";
        this.hud.finished();
    }

    getById(id) {
        var tile = this.board.getById(id);
        if (tile == null) {
            tile = this.sideBlack.getById(id);
            if (tile == null) {
                tile = this.sideWhite.getById(id);
                return tile;
            }
            else
                return tile;
        }
        else
            return tile;
    }

    playAnotherMove() {
        var move = this.gameSequence[this.filmMove];
        var pastMove = this.gameSequence[this.filmMove - 1];
        var starting = this.board.getById(move.startingTile.id);
        var ending = this.board.getById(move.endingTile.id);
        var piece = starting.removePiece();
        if (!pastMove.piece.isKing && piece.isKing)
            piece.removeKing();
        var newMove = new MyGameMove(this.scene, piece, starting, ending, this, move.type);
        this.board.moves.push(newMove);
    }

    update(t) {
        this.hud.update(t);
        this.camera.update(t);
        this.checkFinished();
        if (!this.board.hasMovement() && this.STATE == "ANIMATE")
            this.STATE = "NOT_SELECTED";
        if (!this.board.hasMovement() && this.STATE == "FILM") {
            if (this.filmMove == this.gameSequence.length) {
                this.STATE = "NOT_SELECTED";
                this.filmMove = 0;
            }
            else {
                this.filmMove++;
                this.playAnotherMove();
            }
        }
        this.board.update(t);
    }

    display() {
        this.scene.pushMatrix();
        //this.scene.rotate(Math.PI, 1, 0, 0);
        this.scene.scale(3.0, 3.0, 3.0);
        this.board.display();
        this.sideBlack.display();
        this.sideWhite.display();
        this.scene.popMatrix();
    }
}