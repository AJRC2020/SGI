#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vFinalColor;
uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);

	if (color.a < 0.5)
		gl_FragColor = vFinalColor;
	else
		gl_FragColor = color;
}


