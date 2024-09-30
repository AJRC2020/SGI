import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        var lights = this.gui.addFolder('Lights');

        lights.add(this.scene, 'demo').name('Demo Light');
        lights.add(this.scene, 'omni1').name('Omni 1 Light');
        lights.add(this.scene, 'spot1').name('Spot 1 Light');
        lights.add(this.scene, 'spot2').name('Spot 2 Light');
        lights.add(this.scene, 'spot3').name('Spot 3 Lights');

        // add a group of controls (and open/expand by defult)

        //this.gui.add(this.scene, 'selectedCamera', this.scene.cameras).name('Select View');

        this.gui.add(this.scene, "selectedScene", this.scene.scenes).name('Select Scene');

        this.gui.add(this.scene, 'undo').name('Undo');

        this.gui.add(this.scene, 'playFilm').name('Play Film');
        
        this.gui.add(this.scene, 'forfeit').name('Forfeit');

        this.initKeys();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}