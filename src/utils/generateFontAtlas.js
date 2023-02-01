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
  const size = 64

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
  for (let y = 0; y + size <= textureSize && i < inputText.length; y += size) {
    for (let x = 0; x + size <= textureSize && i < inputText.length; x += size) {
      const char = inputText[i]
      if (!map.has(char)) {
        const { data, width, height } = sdf.draw(char)
        for (let q = 0; q < height && y + q <= textureSize; q++) {
          for (let p = 0; p < width && x + p <= textureSize; p++) {
            alphaData[(y + q) * textureSize + (x + p)] = data[q * width + p]
          }
        }
        map.set(char, { x, y })
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

  return ({ texture, layout: { map, size: textureSize } })
}

export { generateFontAtlas }