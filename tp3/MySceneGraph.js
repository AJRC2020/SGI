import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyRectangle } from './MyRectangle.js';
import { MyCylinder } from './myCylinder.js';
import { MyTriangle } from './MyTriangle.js';
import { MySphere } from './MySphere.js';
import { MyTorus } from './MyTorus.js';
import { MyPatch } from './MyPatch.js';
import { GraphNode } from "./GraphNode.js";
import { KeyFrameAnimation } from "./KeyFrameAnimation.js";

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;

        var grandChildren = [];

        this.views = [];
        this.viewsID = [];
        this.default = this.reader.getString(viewsNode, "default");

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            var viewID = this.reader.getString(children[i], "id");
            if (viewID == null) {
                return "no id defined for view";
            }

            if (this.views[viewID] != null) {
                return "ID must be unique for each light (conflict: ID = " + viewID + ")";
            }

            this.viewsID.push(viewID);

            switch(children[i].nodeName) {
                case "perspective":
                    var near = this.reader.getFloat(children[i], "near");
                    var far = this.reader.getFloat(children[i], "far");
                    var angle = this.reader.getFloat(children[i], "angle");

                    if (!(near != null && !isNaN(near))) {
                        return "near attribute in views is not well defined";
                    }
                    if (!(far != null && !isNaN(far)) && far < near) {
                        return "far attribute in views is not well defined";
                    }
                    if (!(angle != null && !isNaN(angle))) {
                        return "angle attribute in views is not well defined";
                    }

                    break;
                case "ortho":
                    var near = this.reader.getFloat(children[i], "near");
                    var far = this.reader.getFloat(children[i], "far");
                    var left = this.reader.getFloat(children[i], "left");
                    var right = this.reader.getFloat(children[i], "right");
                    var top = this.reader.getFloat(children[i], "top");
                    var bottom = this.reader.getFloat(children[i], "bottom");

                    if (!(near != null && !isNaN(near))) {
                        return "near attribute in views is not well defined";
                    }
                    if (!(far != null && !isNaN(far)) && far < near) {
                        return "far attribute in views is not well defined";
                    }
                    if (!(left != null && !isNaN(left))) {
                        return "left attribute in views is not well defined";
                    }
                    if (!(right != null && !isNaN(right))) {
                        return "right attribute in views is not well defined";
                    }
                    if (!(top != null && !isNaN(top))) {
                        return "top attribute in views is not well defined";
                    }
                    if (!(bottom != null && !isNaN(bottom))) {
                        return "bottom attribute in views is not well defined";
                    }
                    break;
            }

            grandChildren = children[i].children;

            var fromVector = [];
            var toVector = [];
            if (children[i].nodeName == "ortho" && grandChildren.length == 2) {
                var upVector = [0, 1, 0];
            }
            else if (children[i].nodeName == "ortho") {
                var upVector = [];
            }

            for (var j = 0; j < grandChildren.length; j++) {
                switch(grandChildren[j].nodeName) {
                    case "from":
                        fromVector = this.parseCoordinates3D(grandChildren[j], "from attribute of <view>");
                        break;
                    case "to":
                        toVector = this.parseCoordinates3D(grandChildren[j], "to attribute of <view>");
                        break;
                    case "up":
                        upVector = this.parseCoordinates3D(grandChildren[j], "up attribute of <view>");
                        break;
                }
            }

            if (children[i].nodeName == "perspective") {
                this.views[viewID] = new CGFcamera(angle * DEGREE_TO_RAD, near, far, fromVector, toVector);
                //this.views.push(new CGFcamera(angle * DEGREE_TO_RAD, near, far, fromVector, toVector));
            }
            else {
                this.views[viewID] = new CGFcameraOrtho(left, right, bottom, top, near, far, fromVector, toVector, upVector);
                //this.views.push(new CGFcameraOrtho(left, right, bottom, top, near, far, fromVector, toVector, upVector));
            }

        }

        //this.onXMLMinorError("To do: Parse views and create cameras.");

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            var constant, linear, quadratic;

            for (var m = 0; m < grandChildren.length; m++) {
                if (grandChildren[m].nodeName == "attenuation") {
                    constant = this.reader.getFloat(grandChildren[m], 'constant');
                    linear = this.reader.getFloat(grandChildren[m], 'linear');
                    quadratic = this.reader.getFloat(grandChildren[m], 'quadratic');
                }
            }

            global.push(... [constant, linear, quadratic]);

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle * DEGREE_TO_RAD, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;

        this.textures = [];

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var textureID = this.reader.getString(children[i], 'id');
            if (textureID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each light (conflict: ID = " + textureID + ")";

            var path = this.reader.getString(children[i], 'file');

            if (path == null || !this.validFileType(path))
                this.onXMLMinorError("Error parsing path to file " + textureID);

            var newTex = new CGFtexture(this.scene, "/tp3/" + path);
            this.textures[textureID] = newTex;

            //Continue here
            //this.onXMLMinorError("To do: Parse materials.");
        }

        //For each texture in textures block, check ID and file URL
        //this.onXMLMinorError("To do: Parse textures.");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        // Any number of materials.
        for (var i = 0; i < children.length; i++) {
            var nodeNames = [];

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            //Continue here
            //this.onXMLMinorError("To do: Parse materials.");

            var shine = this.reader.getFloat(children[i], "shininess");

            grandChildren = children[i].children;
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var emission = [];
            var ambient = [];
            var diffuse = [];
            var specular = [];


            for (var q = 0; q < nodeNames.length; q++) {
                switch(nodeNames[q]) {
                    case 'emission':
                        emission = this.parseColor(grandChildren[q], materialID);
                        break;

                    case 'ambient':
                        ambient = this.parseColor(grandChildren[q], materialID);
                        break;

                    case 'diffuse':
                        diffuse = this.parseColor(grandChildren[q], materialID);
                        break;

                    case 'specular':
                        specular = this.parseColor(grandChildren[q], materialID);
                        break;
                }


            }

            var material = new CGFappearance(this.scene);
            material.setShininess(shine);
            material.setEmission(emission[0], emission[1], emission[2], emission[3]);
            material.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
            material.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
            material.setSpecular(specular[0], specular[1], specular[2], specular[3]);

            this.materials[materialID] = material;
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                            
                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        //this.onXMLMinorError("To do: Parse scale transformations.");
                        break;
                    case 'rotate':
                        var node = grandChildren[j];
                        var axis = this.reader.getString(node, "axis");
                        var vector = []
                        if (axis == "x")  vector = [1, 0, 0];
                        else if (axis == "y") vector = [0, 1, 0];
                        else vector = [0, 0, 1];

                        var angle = this.reader.getFloat(node, "angle");
                        angle *= DEGREE_TO_RAD;
                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle, vector);
                        //this.onXMLMinorError("To do: Parse rotate transformations.");
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    parseAnimations(animationsNode) {
        this.animations = {};
        var children = animationsNode.children;
        var keyFrames;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "keyframeanim") {
                this.onXMLError("unknown tag <" + children[i].nodeName + ">");
            }

            var animationID = this.reader.getString(children[i], 'id');
            if (animationID == null)
                return "no ID defined for animation";
            if (this.animations[animationID] != null)
                return "ID must be unique for each animation";

            this.animations[animationID] = new KeyFrameAnimation(this.scene);
            keyFrames = children[i].children;

            for (var j = 0; j < keyFrames.length; j++) {
                var frame = [];

                var instant = this.reader.getFloat(keyFrames[j], 'instant');
                frame.push(instant);

                var transformations = keyFrames[j].children;

                var trans = [];
                trans.push(this.reader.getFloat(transformations[0], 'x'));
                trans.push(this.reader.getFloat(transformations[0], 'y'));
                trans.push(this.reader.getFloat(transformations[0], 'z'));
                frame.push(trans);

                var rot = [];
                rot.push(this.reader.getFloat(transformations[3], 'angle'));
                rot.push(this.reader.getFloat(transformations[2], 'angle'));
                rot.push(this.reader.getFloat(transformations[1], 'angle'));
                frame.push(rot);

                var scale = [];
                scale.push(this.reader.getFloat(transformations[4], 'sx'));
                scale.push(this.reader.getFloat(transformations[4], 'sy'));
                scale.push(this.reader.getFloat(transformations[4], 'sz'));
                frame.push(scale);

                this.animations[animationID].keyFrames.push(frame);
            }
        }
       
        this.log("Parsed animation");
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'patch')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == "triangle") {
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;
                
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;
    
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;

                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var tri = new MyTriangle(this.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3);
                this.primitives[primitiveId] = tri;
            }
            else if (primitiveType == "cylinder") {
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height) && height > 0))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var cyl = new MyCylinder(this.scene, base, top, height, slices, stacks);
                this.primitives[primitiveId] = cyl;
            }
            else if (primitiveType == "sphere") {
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius) && radius > 0))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                    
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;
                
                var sph = new MySphere(this.scene, radius, slices, stacks);
                this.primitives[primitiveId] = sph;
            }
            else if (primitiveType == "torus") {
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner) && inner > 0))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;
                
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer) && outer > 0 && outer > inner))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;
                
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;
                    
                var tor = new MyTorus(this.scene, inner, outer, slices, loops);
                this.primitives[primitiveId] = tor;
            }
            else if (primitiveType == "patch") {
                var degree_u = this.reader.getInteger(grandChildren[0], 'degree_u');
                if (!(degree_u != null && !isNaN(degree_u) && degree_u <= 3 && degree_u > 0))
                    return "unable to parse degree_u of the primitive coordinates for ID = " + primitiveId;

                var parts_u = this.reader.getInteger(grandChildren[0], 'parts_u');
                if (!(parts_u != null && !isNaN(parts_u) && parts_u > 0))
                    return "unable to parse parts_u of the primitive coordinates for ID = " + primitiveId;

                var degree_v = this.reader.getInteger(grandChildren[0], 'degree_v');
                if (!(degree_v != null && !isNaN(degree_v) && degree_v <= 3 && degree_v > 0))
                    return "unable to parse degree_v of the primitive coordinates for ID = " + primitiveId;

                var parts_v = this.reader.getInteger(grandChildren[0], 'parts_v');
                if (!(parts_v != null && !isNaN(parts_v) && parts_v > 0))
                    return "unable to parse parts_v of the primitive coordinates for ID = " + primitiveId;

                var controlPoints = [];
                var grandSire = grandChildren[0].children;

                for (var k = 0; k < grandSire.length; k++) {
                    let controlPoint = [];

                    var x = this.reader.getFloat(grandSire[k], "x");
                    if (!(x != null && !isNaN(x)))
                        return "unable to parse x of the primitive coordinates for ID = " + primitiveId;

                    var y = this.reader.getFloat(grandSire[k], "y");
                    if (!(y != null && !isNaN(y)))
                        return "unable to parse y of the primitive coordinates for ID = " + primitiveId;

                    var z = this.reader.getFloat(grandSire[k], "z");
                    if (!(z != null && !isNaN(z)))
                        return "unable to parse z of the primitive coordinates for ID = " + primitiveId;

                    controlPoint.push(x);
                    controlPoint.push(y);
                    controlPoint.push(z);

                    controlPoints.push(controlPoint);
                }

                var patch = new MyPatch(this.scene, degree_u, parts_u, degree_v, parts_v, controlPoints);
                this.primitives[primitiveId] = patch;
            }
            else {
                console.warn("To do: Parse other primitives.");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            this.nodes[componentID] = new GraphNode(this, componentID);

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            var shaderIndex = nodeNames.indexOf("highlighted");
            var animationIndex = nodeNames.indexOf("animation");
            //this.onXMLMinorError("To do: Parse components.");


            // Transformations
            var compTransf = grandChildren[transformationIndex].children;
            for (var j = 0; j < compTransf.length; j++) {
                var vals = []
                switch (compTransf[j].nodeName) {
                    case 'translate':
                        vals = this.parseCoordinates3D(compTransf[j], "error parsing coordinates for translate tranformation");
                        mat4.translate(this.nodes[componentID].transformMatrix, this.nodes[componentID].transformMatrix, vals);
                        break;
                    case 'scale':
                        vals = this.parseCoordinates3D(compTransf[j], "error parsing coordinates for scale transformation");
                        mat4.scale(this.nodes[componentID].transformMatrix, this.nodes[componentID].transformMatrix, vals);
                        break;
                    case 'rotate':
                        var angle = this.reader.getFloat(compTransf[j], "angle");
                        var axis = this.reader.getString(compTransf[j], "axis");
                        if (axis == "x")  vals = [1, 0, 0];
                        else if (axis == "y") vals = [0, 1, 0];
                        else vals = [0, 0, 1];
                        mat4.rotate(this.nodes[componentID].transformMatrix, this.nodes[componentID].transformMatrix, angle * DEGREE_TO_RAD, vals);
                        break;
                    case 'transformationref' :
                        var id = this.reader.getString(compTransf[j], "id");
                        mat4.multiply(this.nodes[componentID].transformMatrix, this.nodes[componentID].transformMatrix, this.transformations[id]);
                        break;
                }
            }

            // Materials
            var compMaterials = grandChildren[materialsIndex].children;
            var matIDlist = [];
            for (var m = 0; m < compMaterials.length; m++) {
                matIDlist.push(this.reader.getString(compMaterials[m], "id"));
            }
            this.nodes[componentID].materials = matIDlist;

            // Texture
            var compTexture = grandChildren[textureIndex];
            var idTexture = this.reader.getString(compTexture, "id");
            var length_s, length_t;
            if (idTexture == "inherit" || idTexture == "none") {
                length_s = 1;
                length_t = 1;
            }
            else {
                length_s = this.reader.getFloat(compTexture, "length_s");
                length_t = this.reader.getFloat(compTexture, "length_t");
            }

            this.nodes[componentID].textures.push(idTexture);
            this.nodes[componentID].textures.push(length_s);
            this.nodes[componentID].textures.push(length_t);


            // Children
            var compChildren = grandChildren[childrenIndex].children;
            for (var c = 0; c < compChildren.length; c++) {
                var childID = this.reader.getString(compChildren[c], "id");
                this.nodes[componentID].addChild(childID);
            }

            // Animation
            if (animationIndex != -1) {
                var compAnimation = grandChildren[animationIndex];
                var animationID = this.reader.getString(compAnimation, 'id');
                this.nodes[componentID].animationID.push(animationID);
            }

            // Shader
            if (shaderIndex != -1) {
                var compShader = grandChildren[shaderIndex];
                var red = this.reader.getFloat(compShader, "r");
                var green = this.reader.getFloat(compShader, "g");
                var blue = this.reader.getFloat(compShader, "b");
                var scale_h = this.reader.getFloat(compShader, "scale_h");

                //this.scene.updateShader(red, green, blue, scale_h)
                this.nodes[componentID].shader = [red, green, blue, scale_h]
                this.nodes[componentID].hasShader = true;
            }
        }
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    validFileType(path) {
        var extension = ['jpg', 'png', 'jpeg'];

        return extension.indexOf(path.split(".").pop()) > -1;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.recursiveDisplay(this.idRoot, this.nodes[this.idRoot].materials, this.nodes[this.idRoot].textures);
    }

    recursiveDisplay(nodeID, matParent, texParent) {
        var node = this.nodes[nodeID];
        var children = node.children;
        var mats = matParent;
        var text = texParent;
        //this.textureBinded = null;
        this.isBind = false;

        if (node.materials[0] != "inherit") {
            mats = node.materials;
        }

        if (node.textures[0] != "inherit") {
            text = node.textures;
        }
        
        var currentText = this.textures[text[0]];
        var s = text[1];
        var t = text[2];

        this.scene.multMatrix(node.transformMatrix);
        var anime = this.animations[node.animationID[0]];
        if (anime != undefined) {
            anime.apply();
        }
        var materialID = mats[this.scene.counterMaterial % mats.length];
        var currentMaterial = this.materials[materialID];

        if (node.hasShader) {
            this.scene.updateShader(node.shader[0], node.shader[1], node.shader[2], node.shader[3]);
            this.scene.setActiveShader(this.scene.highlightShader);
        }
        for (var i = 0; i < children.length; i++) {
            if (this.primitives[children[i]] != null) {
                if (this.primitives[children[i]] instanceof MyRectangle || this.primitives[children[i]] instanceof MyTriangle) {
                    this.primitives[children[i]].updateTexCoords([s, t]);
                }
                if (text[0] == "none" && this.idBind == true) {
                    //this.textureBinded.unbind();
                    this.idBind = false;
                }
                if (text[0] != "inherit" && text[0] != "none") {
                    //currentText.bind();
                    //this.textureBinded = currentText;
                    this.isBind = true;
                }

                currentMaterial.setTexture(currentText);
                currentMaterial.apply();
                this.primitives[children[i]].display();
            }
            else {
                this.scene.pushMatrix();
                this.recursiveDisplay(children[i], mats, text);
                this.scene.popMatrix();
            }
        }
        if (node.hasShader) {
            this.scene.setActiveShader(this.scene.defaultShader);
        }
    }

}