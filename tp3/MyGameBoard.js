import { CGFappearance, CGFobject, CGFtexture } from "../lib/CGF.js";
import { MyCube } from "./MyCube.js";
import { MyGamePiece } from "./MyGamePiece.js";
import { MyGameTile } from "./MyGameTile.js";

export class MyGameBoard extends CGFobject {
    constructor(scene, orchestrator) {
        super(scene);
        this.cube = new MyCube(this.scene);
        this.orchestrator = orchestrator;
        this.tiles = [];
        this.dict = {};
        this.moves = [];

        this.boardMaterial = new CGFappearance(this.scene);
        this.boardMaterial.setShininess(1.0);
        this.boardMaterial.setAmbient(0.0, 0.5, 1.0, 1.0);
        this.boardMaterial.setDiffuse(0.0, 0.5, 1.0, 1.0);
        this.boardMaterial.setSpecular(0.0, 0.25, 0.5, 1.0);
        this.boardMaterial.setEmission(0.0, 0.25, 0.5, 1.0);

        this.createBoard();
    }

    createBoard() {
        var idTiles = 1;
        var idPieces = 65;
        var texture1 = new CGFtexture(this.scene, "textures/batman.png");
        var texture2 = new CGFtexture(this.scene, "textures/riddler.png");
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 == 1) {
                    var tile = new MyGameTile(this.scene, idTiles, i, j, [0.0, 0.0, 0.0], [texture1, texture2]);
                    idTiles++;
                    if (i > 4) {
                        var piece = new MyGamePiece(this.scene, idPieces, [0.0, 0.12, 0.33], "BLACK");
                        idPieces++;
                        tile.assignPiece(piece);
                    }
                    if (i < 3) {
                        var piece = new MyGamePiece(this.scene, idPieces, [0.8, 0.9, 0.95], "WHITE");
                        idPieces++;
                        tile.assignPiece(piece);
                    }
                    this.tiles.push(tile);
                }
                else {
                    var tile = new MyGameTile(this.scene, idTiles, i, j, [1.0, 1.0, 1.0], [texture1, texture2]);
                    idTiles++;
                    this.tiles.push(tile);
                }
            }
        }
    }

    recreateBoard(scene) {
        this.tiles = [];
        this.dict = {};
        this.moves = [];
        this.createBoard();
        this.updateScene(scene);
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

    getById(id) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].id == id)
                return this.tiles[i];
            if (this.tiles[i].piece != null) {
                if (this.tiles[i].piece.id == id)
                    return this.tiles[i];
            }
        }
    }

    setDict(moves, tile) {
        this.dict = {};
        if (moves.length == 0) {
            this.dict[tile.id] = "impossible";
        }
        else {
            this.dict[tile.id] = "selected";
            for (let i = 0; i < moves.length; i++) {
                this.dict[moves[i].id] = "possible";
            }
        }
    }

    getPossibleMoves(tile, onlyCaps) {
        var possibleMoves = [];
        if (tile.piece.isKing) {
            var id = tile.id;
            if (id > 7) {
                let temp = this.tiles[id - 7 - 1];
                if (tile.row - 1 == temp.row && tile.col + 1 == temp.col)
                    possibleMoves.push(temp);
            } 
            if (id > 9) {
                let temp = this.tiles[id - 9 - 1];
                if (tile.row - 1 == temp.row && tile.col - 1 == temp.col)
                    possibleMoves.push(temp);
            }
            if (id < 58) {
                let temp = this.tiles[id + 7 - 1];
                if (tile.row + 1 == temp.row && tile.col - 1 == temp.col)
                    possibleMoves.push(temp);
            } 
            if (id < 56) {
                let temp = this.tiles[id + 9 - 1];
                if (tile.row + 1 == temp.row && tile.col + 1 == temp.col)
                    possibleMoves.push(temp);
            }
        }
        else if (tile.piece.type == "BLACK") {
            var id = tile.id;
            if (id > 7) {
                let temp = this.tiles[id - 7 - 1];
                if (tile.row - 1 == temp.row && tile.col + 1 == temp.col)
                    possibleMoves.push(temp);
            } 
            if (id > 9) {
                let temp = this.tiles[id - 9 - 1];
                if (tile.row - 1 == temp.row && tile.col - 1 == temp.col)
                    possibleMoves.push(temp);
            }
        }
        else {
            var id = tile.id;
            if (id < 58) {
                let temp = this.tiles[id + 7 - 1];
                if (tile.row + 1 == temp.row && tile.col - 1 == temp.col)
                    possibleMoves.push(temp);
            } 
            if (id < 56) {
                let temp = this.tiles[id + 9 - 1];
                if (tile.row + 1 == temp.row && tile.col + 1 == temp.col)
                    possibleMoves.push(temp);
            }
        }
    
        return this.furtherWork(possibleMoves, tile, onlyCaps);
    }

    furtherWork(moves, tile, onlyCaps) {
        if (moves.length == 0) {
            return moves;
        }
        var possibleMoves = [];
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].piece != null) {
                if (moves[i].piece.type != tile.piece.type) {
                    var row_diff = moves[i].row - tile.row;
                    var col_diff = moves[i].col - tile.col;
                    var row_check = row_diff + moves[i].row;
                    var col_check = col_diff + moves[i].col;
                    for (let j = 0; j < this.tiles.length; j++) {
                        if (this.tiles[j].row == row_check && this.tiles[j].col == col_check && this.tiles[j].piece == null) 
                            possibleMoves.push(this.tiles[j]);
                        
                    }
                }
            }
        }

        if (possibleMoves.length != 0 || onlyCaps) return possibleMoves;

        for (let i = 0; i < moves.length; i++) {
            if (moves[i].piece == null) {
                possibleMoves.push(moves[i]);
            }
        }
        return possibleMoves;
    }

    checkBoardForCaptures(type) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece != null) {
                if (this.tiles[i].piece.type == type) {
                    var arr = this.getPossibleMoves(this.tiles[i], true);
                    if (arr.length != 0) return true;
                }
            }
        }

        return false;
    }

    checkForPossibleMoves(type) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].piece != null) {
                if (this.tiles[i].piece.type == type) {
                    var arr = this.getPossibleMoves(this.tiles[i], false);
                    if (arr.length != 0) return true;
                }
            }
        }

        for (let i = 0; i < this.moves.length; i++) {
            if (this.moves[i].piece.type == type)
                return true;
        }

        return false;
    }

    hasMovement() {
        for (let i = 0; i < this.moves.length; i++) {
            if (!this.moves[i].isFinished)
                return true;
        }
        return false;
    }

    update(t) {
        for (let i = 0; i < this.moves.length; i++) {
            if (!this.moves[i].isFinished) {
                this.moves[i].update(t);
                if (!this.moves[i].captured && this.moves[i].type == "PLAY"){
                    var coords = this.moves[i].getCoor();
                    var orientation_x = this.moves[i].getOriX();
                    var orientation_y = this.moves[i].getOriY();
                    for (let j = 0; j < this.tiles.length; j++) {
                        if (this.tiles[j].piece != null) {
                            if (this.tiles[j].checkCollision(coords, orientation_x, orientation_y) && this.tiles[j].id != this.moves[i].endingTile.id) {
                                this.orchestrator.createCaptureAnim(this.tiles[j]);
                                this.moves[i].captured = true;
                            }
                        }
                    }
                }
            }
        }
    }

    display() {
        this.boardMaterial.apply();
        this.scene.pushMatrix();
        this.scene.scale(4.0, 4.0, 1.25);
        this.scene.translate(0.5, 0.5, 0.5);
        this.cube.display();
        this.scene.popMatrix();

        for (let i = 0; i < this.tiles.length; i++) {
            this.scene.registerForPick(this.tiles[i].id, this.tiles[i]);
            if (this.tiles[i].id in this.dict)
                this.tiles[i].display(this.dict[this.tiles[i].id]);
            else
                this.tiles[i].display("nothing");
        }

        for (let i = 0; i < this.moves.length; i++) {
            this.moves[i].display();
        }
    }
}