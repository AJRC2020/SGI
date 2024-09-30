import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from "../lib/CGF.js";

export class MyPatch extends CGFobject {
    constructor(scene, degree_u, parts_u, degree_v, parts_v, controlPoints) {
        super(scene);
        this.degree_u = degree_u+1;
        this.parts_u = parts_u;
        this.degree_v = degree_v+1;
        this.parts_v = parts_v;
        this.controlPoints = controlPoints;

        this.surfaces = this.makeSurface();
    }

    makeSurface() {
        let vertices = [];

        for (let i = 0; i < this.degree_u; i++) {
            let empty = [];
            vertices.push(empty);
        }

        let k = 0;
        for (let j = 0; j < this.controlPoints.length; j++) {
            this.controlPoints[j].push(1);
            vertices[k].push(this.controlPoints[j]);
            if (((j + 1) % this.degree_v ) == 0) {
                k++;
            }
        }

        console.log(vertices);

        var nurbsSurface = new CGFnurbsSurface(this.degree_u - 1, this.degree_v - 1, vertices);
        var patch = new CGFnurbsObject(this.scene, this.parts_u, this.parts_v, nurbsSurface);

        return patch;
    }

    display() {

        this.scene.pushMatrix();
        this.surfaces.display();
        this.scene.popMatrix();
    }
}