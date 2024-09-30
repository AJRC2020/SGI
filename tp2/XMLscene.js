import { CGFcameraOrtho, CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera, CGFshader } from '../lib/CGF.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(15);

        this.counterMaterial = 0;

        this.demo = true;
        this.omni1 = true;
        this.spot1 = true;
        this.spot2 = true;
        this.spot3 = true;

        this.selectedCamera = 0;
        this.cameras = { 'Default' : 0 , 'View1' : 1, 'Ortho1' : 2, 'Ortho2' : 3, 'View2' : 4, 'Ortho3' : 5};

        this.highlightShader = new CGFshader(this.gl, "shader/highlight.vert", "shader/highlight.frag");
        this.highlightShader.setUniformsValues({red : 1.0, green : 1.0, blue : 1.0, scale : 1.0, timeFactor: 0});
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        var def = this.graph.default;

        var cam = this.graph.views[def];

        this.camera = cam;

        this.interface.setActiveCamera(this.camera);
        //this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                this.lights[i].setConstantAttenuation(light[6]);
                this.lights[i].setLinearAttenuation(light[7]);
                this.lights[i].setQuadraticAttenuation(light[8]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[9]);
                    this.lights[i].setSpotExponent(light[10]);
                    this.lights[i].setSpotDirection(light[11][0] - light[2][0], light[11][1] - light[2][1], light[11][2] - light[2][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;

        this.initCameras();
    }

    checkKeys(t) {
        if (this.gui.isKeyPressed("KeyM")) {
            this.counterMaterial++;
        }
    }

    update(t) {
        this.checkKeys(t);

        this.lastTime = this.lastTime || 0.0;
        this.deltaTime = t - this.lastTime || 0.0;
        this.deltaTime = this.deltaTime / 1000;
        this.currentTime = (this.currentTime + this.deltaTime) || 0.0;

        this.ani = this.graph.animations;
        for (var key in this.ani) {
            this.ani[key].update(this.deltaTime);
        }
        this.lastTime = t;

        let timeFactor = Math.cos(t / 250 % 1000);

        this.highlightShader.setUniformsValues({ timeFactor: timeFactor });
    }

    updateCamera(i){
        var viewID = this.graph.viewsID[i];

        this.camera = this.graph.views[viewID];

        this.interface.setActiveCamera(this.camera);
    }

    updateShader(red, green, blue, scale) {
        this.highlightShader.setUniformsValues({red : red, green : green, blue : blue, scale : scale});
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        /*for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(true);
            this.lights[i].enable();
        }*/

        if (this.demo) this.lights[0].enable();
        else this.lights[0].disable();

        if (this.omni1) this.lights[1].enable();
        else this.lights[1].disable();

        if (this.spot1) this.lights[2].enable();
        else this.lights[2].disable();

        if (this.spot2) this.lights[3].enable();
        else this.lights[3].disable()

        if (this.spot3) this.lights[4].enable();
        else this.lights[4].disable();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].update();
        }

        this.updateCamera(this.selectedCamera);

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}