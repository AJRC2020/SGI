#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
varying vec2 vTextureCoord;
varying vec4 vFinalColor;
uniform bool uUseTexture;

uniform float red;
uniform float green;
uniform float blue;
uniform float scale;
uniform float timeFactor;

void main() {
    vec4 fragColor;

    vec4 shadingColor = vec4(red, green, blue, 1.0);

    if (uUseTexture) {
        fragColor = texture2D(uSampler, vTextureCoord) * vFinalColor;
    }
    else {
        fragColor = vFinalColor;
    }


    gl_FragColor = mix(fragColor, shadingColor, timeFactor);
}