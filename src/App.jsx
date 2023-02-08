import { useState, useReducer, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { ResizeObserver } from '@juggle/resize-observer'
import { TextMesh } from './components/TextMesh'
import { Camera2D } from './components/Camera2D'
import { generateFontAtlas } from './utils/generateFontAtlas'

const defaultFontSize = 32
const defaultFontFamily = 'Courier New'
const defaultInputText = 'The quick brown fox jumps over the lazy dog'

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
  const [cameraReady, setCameraReady] = useState(false)
  const [transform, dispatch] = useReducer(reducer, {
    scale: 1.0,
    translate: { x: 0.0, y: 0.0 }
  })
  const [pointer, setPointer] = useState({ isDown: false, x: NaN, y: NaN })
  const [fontFamily, setFontFamily] = useState(defaultFontFamily)
  const [fontSize, setFontSize] = useState(defaultFontSize)
  const [inputText, setInputText] = useState(defaultInputText)
  const fontAtlas = useMemo(() => generateFontAtlas(fontFamily), [fontFamily])

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

  const handleCameraReady = () => {
    setCameraReady(true)
  }

  return (
    <div id="app">
      <div id="gl-container">
        <Stats showPanel={0} />
        <Canvas
          resize={{ polyfill: ResizeObserver }}
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
            ctx.disable(ctx.DITHER)
            ctx.disable(ctx.DEPTH_TEST)
            ctx.disable(ctx.SCISSOR_TEST)
            ctx.disable(ctx.STENCIL_TEST)
          }}
          style={{ cursor: pointer.isDown ? 'grabbing' : 'auto' }}
        >
          <Camera2D
            translate={transform.translate}
            scale={transform.scale}
            onCameraReady={handleCameraReady}
          />
          <color attach="background" args={['#030303']} />
          {cameraReady && fontAtlas ? (
            <TextMesh
              text={inputText}
              fontSize={fontSize}
              fontAtlas={fontAtlas}
            />
          ) : null}
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
              'Times New Roman',
              'Verdana',
              'Tahoma',
              'Courier New'
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
            value={inputText}
            autoFocus
            onChange={(e) => setInputText(e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default App
