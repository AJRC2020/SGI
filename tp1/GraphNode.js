export class GraphNode {
    constructor (graph, nodeID) {
        this.graph = graph;
        this.nodeID = nodeID;
        this.transformMatrix = mat4.create();
        mat4.identity(this.transformMatrix);
        this.children = []
        this.materials = [];
        this.textures = [];
    }

    addChild(childID) {
        this.children.push(childID);
    } 
}