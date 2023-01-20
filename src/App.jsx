import { useState, useReducer, useRef, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Stats } from '@react-three/drei'
import { FrontSide } from 'three'
import { SDFGlyphMaterial } from './materials/SDFGlyph'
import GlyphAtlasTexture from './GlyphAtlasTexture'

const defaultFontSize = 32
const defaultFontFamily = 'Arial'

const reducer = (state, action) => {
  switch (action.type) {
    case 'zoom':
      return { ...state, scale: state.scale + action.payload }
    case 'pan':
      return {
        ...state,
        translate: {
          x: state.translate.x + action.payload.offsetX,
          y: state.translate.y + action.payload.offsetY
        }
      }
    default:
      throw new Error('Unknown action type')
  }
}

function App() {
  const [transform, dispatch] = useReducer(reducer, {
    scale: 1.0,
    translate: { x: 0.0, y: 0.0 }
  })
  const [pointer, setPointer] = useState({ isDown: false, x: NaN, y: NaN })
  const [text, setText] = useState('人無一物以報天')
  const [cursorIdx, setCursorIdx] = useState(0)
  const [fontSize, setFontSize] = useState(defaultFontSize)
  const [fontFamily, setFontFamily] = useState(defaultFontFamily)
  const texture = useMemo(
    () => new GlyphAtlasTexture(text, fontSize, fontFamily),
    [text, fontFamily]
  )
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
          setCursorIdx((prev) => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
          setCursorIdx((prev) => Math.min(text.length, prev + 1))
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleWheel = (e) => {
    dispatch({ type: 'zoom', payload: e.deltaY / 100.0 })
  }

  const handlePointerDown = (e) => {
    setPointer({ ...pointer, isDown: true })
  }

  const handlePointerMove = (e) => {
    if (pointer.isDown && pointer.x && pointer.y) {
      const movementX = e.clientX - pointer.x
      const movementY = e.clientY - pointer.y
      dispatch({
        type: 'pan',
        payload: {
          offsetX: -movementX / transform.scale,
          offsetY: movementY / transform.scale
        }
      })
    }
    setPointer({ ...pointer, x: e.clientX, y: e.clientY })
  }

  const handlePointerUp = (e) => {
    if (pointer.isDown) {
      setPointer({ isDown: false, x: NaN, y: NaN })
    }
  }

  return (
    <div id="app">
      <div id="gl-container">
        <Stats showPanel={0} />
        <Canvas
          dpr={window.devicePixelRatio}
          flat
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerOut={handlePointerUp}
          onCreated={(state) => {
            const ctx = state.gl.getContext()
            ctx.disable(ctx.DEPTH_TEST)
          }}
          style={{ cursor: pointer.isDown ? 'grabbing' : 'auto' }}
        >
          <OrthographicCamera
            makeDefault
            zoom={Math.max(0, transform.scale)}
            top={100}
            bottom={-100}
            left={-100}
            right={100}
            near={1}
            far={100}
            position={[transform.translate.x, transform.translate.y, 10]}
            rotation={[0, 0, 0]}
          />
          <color attach="background" args={['#030303']} />
          <mesh>
            <bufferGeometry
              key={`L${textVertices.length}S${fontSize}`}
              attach="geometry"
            >
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
                  ...SDFGlyphMaterial,
                  uniforms: {
                    buffer: { value: 0.75 },
                    alphaThreshold: { value: 0 },
                    uTexture: { value: texture }
                  }
                }
              ]}
            />
          </mesh>
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
          <mesh position={[(-text.length / 2 + cursorIdx) * fontSize, 0, 0]}>
            <planeGeometry args={[0.5, fontSize]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </Canvas>
      </div>
      <div id="overlay-ui">
        <label>
          Font Family
          <br />
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {[
              'Arial',
              'Verdana',
              'Times New Roman',
              'Georgia',
              'Monaco',
              'Courier New',
              'Papyrus'
            ].map((font) => (
              <option
                key={font}
                value={font}
                defaultValue={font === defaultFontSize}
              >
                {font}
              </option>
            ))}
          </select>
        </label>
        <label>
          Font Size
          <br />
          <input
            type="range"
            value={fontSize}
            min={1}
            max={256}
            step={1}
            onChange={(e) => setFontSize(e.target.value)}
          />
        </label>
        <label>
          Text Input
          <br />
          <input
            type="text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default App
