import { useMemo } from 'react'
import { FrontSide } from 'three'

const GlyphMaterial = {
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
      float dist = texture2D(uTexture, vUv).r;
      float alpha = calculateAlpha(dist);
      if (alpha < alphaThreshold) discard;
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `
}

function TextMesh({ text, fontSize, fontAtlas }) {
  const [textVertices, textUVs] = useMemo(() => {
    let vertices = []
    let UVs = []
    var alignmentX = -text.length / 2.0
    var alignmentY = -0.5
    for (let i = 0; i < text.length; i++) {
      vertices.push(
        (1.0 + alignmentX + i) * fontSize,
        (1.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (0.0 + alignmentX + i) * fontSize,
        (1.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (0.0 + alignmentX + i) * fontSize,
        (0.0 + alignmentY) * fontSize,
        +0.0
      )

      vertices.push(
        (0.0 + alignmentX + i) * fontSize,
        (0.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (1.0 + alignmentX + i) * fontSize,
        (0.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (1.0 + alignmentX + i) * fontSize,
        (1.0 + alignmentY) * fontSize,
        +0.0
      )
      const { map, size } = fontAtlas.layout
      if (map.has(text[i])) {
        const { x, y } = map.get(text[i])
        const ds = 1.0 / size
        UVs.push(ds * (x + 64), 1.0 - ds * y)        // right-top
        UVs.push(ds * x, 1.0 - ds * y)               // left-top
        UVs.push(ds * x, 1.0 - ds * (y + 64))        // left-bottom

        UVs.push(ds * x, 1.0 - ds * (y + 64))        // left-bottom
        UVs.push(ds * (x + 64), 1.0 - ds * (y + 64)) // right-bottom
        UVs.push(ds * (x + 64), 1.0 - ds * y)        // right-top
      } else {
        // when the glyph is not in the atlas, draw a blank quad
        UVs.push(0.0, 0.0)
        UVs.push(0.0, 0.0)
        UVs.push(0.0, 0.0)

        UVs.push(0.0, 0.0)
        UVs.push(0.0, 0.0)
        UVs.push(0.0, 0.0)
      }
    }
    return [new Float32Array(vertices), new Float32Array(UVs)]
  }, [text, fontSize])

  return (
    <mesh>
      <bufferGeometry key={`L${text.length}S${fontSize}`} attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={textVertices}
          count={textVertices.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-uv"
          array={textUVs}
          count={textUVs.length / 2}
          itemSize={2}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        side={FrontSide}
        args={[
          {
            ...GlyphMaterial,
            uniforms: {
              buffer: { value: 0.75 },
              alphaThreshold: { value: 0 },
              uTexture: { value: fontAtlas.texture }
            }
          }
        ]}
      />
    </mesh>
  )
}

function InstancedTextMesh({ text, fontSize, atlasTexture }) {
  const [textVertices, textUVs] = useMemo(() => {
    let vertices = []
    let UVs = []
    var alignmentX = -text.length / 2.0
    var alignmentY = -0.5
    for (let i = 0; i < text.length; i++) {
      vertices.push(
        (1.0 + alignmentX + i) * fontSize,
        (1.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (0.0 + alignmentX + i) * fontSize,
        (1.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (0.0 + alignmentX + i) * fontSize,
        (0.0 + alignmentY) * fontSize,
        +0.0
      )

      vertices.push(
        (0.0 + alignmentX + i) * fontSize,
        (0.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (1.0 + alignmentX + i) * fontSize,
        (0.0 + alignmentY) * fontSize,
        +0.0
      )
      vertices.push(
        (1.0 + alignmentX + i) * fontSize,
        (1.0 + alignmentY) * fontSize,
        +0.0
      )

      UVs.push(1.0, 1.0)
      UVs.push(0.0, 1.0)
      UVs.push(0.0, 0.0)

      UVs.push(0.0, 0.0)
      UVs.push(1.0, 0.0)
      UVs.push(1.0, 1.0)
    }
    return [new Float32Array(vertices), new Float32Array(UVs)]
  }, [text, fontSize])

  return (
    <instancedMesh key={text.length} args={[null, null, text.length]}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={textVertices}
          count={6}
          itemSize={3}
          meshPerAttribute={1}
        />
        <bufferAttribute
          attach="attributes-uv"
          array={textUVs}
          count={6}
          itemSize={2}
          meshPerAttribute={1}
        />
      </bufferGeometry>
      <rawShaderMaterial transparent side={FrontSide} args={[]} />
      <meshBasicMaterial color="hotpink" />
    </instancedMesh>
  )
}

export { TextMesh, InstancedTextMesh }
