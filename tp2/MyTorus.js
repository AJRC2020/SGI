import { CGFobject } from "../lib/CGF.js";

export class MyTorus extends CGFobject {
    constructor(scene, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = []
        this.indices = []
        this.normals = []
        this.texCoords = []

        var alpha = 0;
        var beta = 0;
        var alphaDiff = (2 * Math.PI) / this.loops;
        var betaDiff = (2 * Math.PI) / this.slices;

        var widthDiff = 1 / this.loops;
        var heightDiff = 1 / this.slices;

        var tempWidth = 0;

        for (var i = 0; i < this.loops + 1; i++) {
            var x_original = this.outer * Math.cos(alpha);
            var y_original = this.outer * Math.sin(alpha);
            var tempHeight = 1;

            for (var t = 0; t < this.slices + 1; t++) {
                var x = x_original + this.inner * Math.cos(beta) * Math.cos(alpha);
                var y = y_original + this.inner * Math.cos(beta) * Math.sin(alpha);
                var z = this.inner * Math.sin(beta);

                this.vertices.push(x, y, z);
                this.normals.push(Math.cos(beta) * Math.cos(alpha), Math.cos(beta) * Math.sin(alpha), Math.sin(beta));
                this.texCoords.push(tempWidth + widthDiff, tempHeight - heightDiff);

                tempHeight -= heightDiff;
                beta += betaDiff;
            }

            alpha += alphaDiff;
            tempWidth += widthDiff;
        }

        var n_vertices = this.vertices.length / 3 - (this.slices + 1);

        for (var i = 0; i < n_vertices; i++) {
            if ((i + 1) % (this.slices + 1) != 0) {
                this.indices.push(i, i + this.slices + 1, i + this.slices + 2);
                this.indices.push(i, i + this.slices + 2, i + 1);

                this.indices.push(i + this.slices + 2, i + this.slices + 1, i);
                this.indices.push(i + 1, i + this.slices + 2, i);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}