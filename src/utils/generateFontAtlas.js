import {
  DataTexture,
  UnsignedByteType,
  LinearFilter,
  LinearMipMapLinearFilter,
  RedFormat,
} from 'three'
import TinySDF from '@mapbox/tiny-sdf'

function generateFontAtlas(inputText, fontFamily) {
  const textureSize = 1024
  const gridSize = 64

  const sdf = new TinySDF({
    fontSize: 60,
    fontFamily: fontFamily,
    fontWeight: 'bold',
    buffer: 2,
    radius: 2,
    cutoff: 0.25
  })

  let alphaData = new Uint8ClampedArray(textureSize * textureSize)
  let map = new Map()
  let i = 0
  for (let y = 0; y + gridSize <= textureSize && i < inputText.length; y += gridSize) {
    for (let x = 0; x + gridSize <= textureSize && i < inputText.length; x += gridSize) {
      const char = inputText[i]
      if (!map.has(char)) {
        const { data, width, height, glyphTop } = sdf.draw(char)
        for (let q = 0; q < height && y + q <= textureSize; q++) {
          for (let p = 0; p < width && x + p <= textureSize; p++) {
            alphaData[(y + q) * textureSize + (x + p)] = data[q * width + p]
          }
        }
        map.set(char, { x, y, w: width, h: height, t: glyphTop})
      }
      i++
    }
  }

  const texture = new DataTexture(alphaData, textureSize, textureSize, RedFormat, UnsignedByteType)
  texture.flipY = true
  texture.minFilter = LinearMipMapLinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true

  return ({ texture, layout: { map, textureSize, gridSize } })
}

export { generateFontAtlas }