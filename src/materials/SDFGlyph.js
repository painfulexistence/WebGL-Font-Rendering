export const SDFGlyphMaterial = {
  extensions: {
    derivatives: true //To make it work in Safari
  },
  vertexShader: `
    precision mediump float;

    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float buffer;
    uniform float alphaThreshold;

    float calculateAlpha(float dist) {
      float edgeWidth = 0.707 * length(vec2(dFdx(dist), dFdy(dist)));
      return smoothstep(buffer - edgeWidth, buffer + edgeWidth, dist);
    }

    void main() {
      float dist = texture2D(uTexture, vUv).a;
      float alpha = calculateAlpha(dist);
      if (alpha < alphaThreshold) discard;
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `
}
