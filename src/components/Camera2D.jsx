
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

function Camera2D({translate, scale, onCameraReady}) {
  const ref = useRef()
  const set = useThree(state => state.set)

  useEffect(() => {
    set({camera: ref.current})
    onCameraReady()
  }, [])

  useFrame(() => {
    ref.current.updateProjectionMatrix()
  })

  return (
    <orthographicCamera
      ref={ref}
      zoom={Math.max(0, scale)}
      top={100}
      bottom={-100}
      left={-100}
      right={100}
      near={1}
      far={100}
      position={[translate.x, translate.y, 10]}
      rotation={[0, 0, 0]}
    />
  )
}

export { Camera2D }