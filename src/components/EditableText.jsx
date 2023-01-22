import { useState, useEffect, useMemo } from 'react'
import { TextMesh } from './TextMesh'

const showCursor = true

function EditableText({text, fontSize, atlasTexture}) {
  const [cursorIdx, setCursorIdx] = useState(0)

  useEffect(() => {
    setCursorIdx((prev) => Math.min(Math.max(0, prev), text.length))
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
          setCursorIdx((prev) => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
          setCursorIdx((prev) => Math.min(text.length, prev + 1))
          break
        case 'Delete':
        case 'Backspace':

      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [text])

  return (
    <group>
      <TextMesh text={text} fontSize={fontSize} atlasTexture={atlasTexture} />
      {
        showCursor
        ? (
          <mesh position={[(-text.length / 2 + cursorIdx) * fontSize, 0, 0]}>
            <planeGeometry args={[0.5, fontSize]} />
            <meshBasicMaterial color="white" />
          </mesh>
        ) : null
      }
    </group>
  )
}

export { EditableText }