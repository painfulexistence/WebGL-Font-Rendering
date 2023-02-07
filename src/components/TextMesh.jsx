import { useEffect } from 'react'
import { useMemo } from 'react'
import {
  FrontSide,
  Vector3,
  DataTexture,
  UnsignedByteType,
  LinearFilter,
  LinearMipMapLinearFilter,
  RedFormat,
} from 'three'

const GlyphMaterial = {
  extensions: {
    derivatives: true //To make it work in Safari
  },
  vertexShader: `
    precision mediump float;

    varying vec2 vUv;
    uniform vec3 uAlignment;

    void main() {
      vUv = position.xy;
      int i = gl_VertexID % 6;
      float x = (i== 1 || i == 2 || i == 3) ? 0.0 : 1.0;
      float y = (i == 2 || i == 3 || i == 4) ? 0.0 : 1.0;
      vec2 pos = vec2(x + float(gl_VertexID / 6), y + position.z);
      pos += uAlignment.xy;                                                             // Offset by text alignment
      pos *= uAlignment.z;                                                              // Scale by font size
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x, pos.y, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    const float buffer = 0.75;
    const float alphaThreshold = 0.0;

    float calculateAlpha(float dist) {
      float edgeWidth = 0.707 * length(vec2(dFdx(dist), dFdy(dist)));
      return smoothstep(buffer - edgeWidth, buffer + edgeWidth, dist);
    }

    void main() {
      float dist = texture2D(uTexture, vUv).r;
      float alpha = calculateAlpha(dist);
      if (alpha < alphaThreshold) discard;
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `
}

function TextMesh({ text, fontSize, fontAtlas }) {
  const textVertexData = useMemo(() => {
    let vertexData = []
    for (let i = 0; i < text.length; i++) {
      const { map, textureSize, gridSize } = fontAtlas.layout
      if (map.has(text[i])) {
        // when the glyph is in the atlas, put vec3(texture_coord_u, texture_coord_v, glyph_top) in the array for each vertex
        const { x, y, t } = map.get(text[i])
        const ds = 1.0 / textureSize
        vertexData.push(ds * (x + gridSize), 1.0 - ds * y, t / gridSize)              // right-top corner
        vertexData.push(ds * x, 1.0 - ds * y, t / gridSize)                           // left-top corner
        vertexData.push(ds * x, 1.0 - ds * (y + gridSize), t / gridSize)              // left-bottom corner

        vertexData.push(ds * x, 1.0 - ds * (y + gridSize), t / gridSize)              // left-bottom corner
        vertexData.push(ds * (x + gridSize), 1.0 - ds * (y + gridSize), t / gridSize) // right-bottom corner
        vertexData.push(ds * (x + gridSize), 1.0 - ds * y, t / gridSize)              // right-top corner
      } else {
        // when the glyph is not in the atlas, just draw a untextured quad
        vertexData.push(0.0, 0.0, 0.0)
        vertexData.push(0.0, 0.0, 0.0)
        vertexData.push(0.0, 0.0, 0.0)

        vertexData.push(0.0, 0.0, 0.0)
        vertexData.push(0.0, 0.0, 0.0)
        vertexData.push(0.0, 0.0, 0.0)
      }
    }
    return new Float32Array(vertexData)
  }, [text])

  const textAlignment = useMemo(() => {
    return new Vector3(-text.length / 2, -0.5, fontSize)
  }, [text, fontSize])

  useEffect(() => {
    return (() => {
      fontAtlas.texture.dispose()
    })
  }, [fontAtlas])

  return (
    <mesh frustumCulled={false}>
      <bufferGeometry key={`L${text.length}`} attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={textVertexData}
          count={textVertexData.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        side={FrontSide}
        args={[
          {
            ...GlyphMaterial,
            uniforms: {
              uTexture: { value: fontAtlas.texture },
              uAlignment: { value: textAlignment },
            }
          }
        ]}
      />
    </mesh>
  )
}

export { TextMesh }