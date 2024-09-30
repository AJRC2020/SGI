import { CGFobject } from "../lib/CGF.js";

export class MyCylinder extends CGFobject {
    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var radiusDiff = (this.top - this.base) / this.stacks;
        var angDiff = 2 * Math.PI / this.slices;
        var heightDiff = this.height / this.stacks;
        var size = 0;

        for (var i = 0; i < this.stacks + 1; i++) {
            var ang = 0;

            for (var t = 0; t < this.slices + 1; t++) {
                var x = this.base * Math.cos(ang);
                var y = this.base * Math.sin(ang);
                var z = size;

                this.vertices.push(x, y, z);
                this.normals.push(Math.cos(ang), Math.sin(ang), 0);
                this.texCoords.push(t / this.slices, 1 - i / this.stacks);

                ang += angDiff;
            }

            size += heightDiff;
            this.base += radiusDiff;
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
