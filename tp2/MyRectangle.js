import { CGFobject } from '../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.normals = [];
		this.indices = [];
		this.texCoords = [];

		var diff_x = (this.x2 - this.x1) / 100;
		var diff_y = (this.y2 - this.y1) / 100;

		for (var i = 0; i < 101; i++) {
			for (var j = 0; j < 101; j++) {
				this.vertices.push(this.x1 + j * diff_x, this.y1 + i * diff_y, 0);
				this.texCoords.push(j / 100, 1 - i / 100);
				this.normals.push(0, 0, 1);
			}
		}

		var len = this.normals.length / 3;
		var len2 = len - 101;

		for (var k = 0; k < len; k++) {
			this.normals.push(0, 0, -1);
		}

		for (var q = 0; q < len2; q++) {
			if ((q + 1) % 101 != 0) {
				this.indices.push(q, q + 101, q + 102);
				this.indices.push(q, q + 102, q + 1);

				this.indices.push(q + 102, q + 101, q);
				this.indices.push(q + 1, q + 102, q);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [];
		var maxT = (this.x2 - this.x1) / coords[0];
		var maxS = (this.y2 - this.y1) / coords[1];
		
		var divS = maxS / 100;
		var divT = maxT / 100;

		for (var s = 0; s < 101; s++) {
			for (var t = 0; t < 101; t++) {
				this.texCoords.push(t * divT, maxS - s * divS);
			}
		}

		this.updateTexCoordsGLBuffers();
	}
}

