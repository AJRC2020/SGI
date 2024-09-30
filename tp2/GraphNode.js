export class GraphNode {
    constructor (graph, nodeID) {
        this.graph = graph;
        this.nodeID = nodeID;
        this.transformMatrix = mat4.create();
        mat4.identity(this.transformMatrix);
        this.children = []
        this.materials = [];
        this.textures = [];
        this.hasShader = false;
        this.shader = [];
        this.animationID = [];
    }

    addChild(childID) {
        this.children.push(childID);
    } 
}