import {
  DataTexture,
  UnsignedByteType,
  LinearFilter,
  LinearMipMapLinearFilter,
  RedFormat
} from 'three'
import TinySDF from '@mapbox/tiny-sdf'

function getCodePointsByRange(start, end) {
  return Array(end - start)
    .fill(0)
    .map((n, i) => i + start)
}

const asciiCodePoints = getCodePointsByRange(0x00, 0x7f)
const asciiExtendedCodePoints = getCodePointsByRange(0x00, 0xff)
const cjkCodePoints = getCodePointsByRange(0x4e00, 0x9fff)

function generateFontAtlas(fontFamily) {
  const charSet = String.fromCodePoint(...asciiExtendedCodePoints)
  const textureSize = 1024
  const gridSize = 64

  const sdf = new TinySDF({
    fontSize: 60,
    fontFamily: fontFamily,
    fontWeight: 'bold',
    buffer: 1,
    radius: 2.5,
    cutoff: 0.25
  })

  let alphaData = new Uint8ClampedArray(textureSize * textureSize)
  let map = new Map()
  let i = 0
  for (
    let y = 0;
    y + gridSize <= textureSize && i < charSet.length;
    y += gridSize
  ) {
    for (
      let x = 0;
      x + gridSize <= textureSize && i < charSet.length;
      x += gridSize
    ) {
      const char = charSet[i]
      if (!map.has(char)) {
        const { data, width, height, glyphTop } = sdf.draw(char)
        for (let q = 0; q < height && y + q <= textureSize; q++) {
          for (let p = 0; p < width && x + p <= textureSize; p++) {
            alphaData[(y + q) * textureSize + (x + p)] = data[q * width + p]
          }
        }
        map.set(char, { x, y, w: width, h: height, t: glyphTop })
      }
      i++
    }
  }

  const texture = new DataTexture(
    alphaData,
    textureSize,
    textureSize,
    RedFormat,
    UnsignedByteType
  )
  texture.flipY = true
  texture.minFilter = LinearMipMapLinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true

  return { texture, layout: { map, textureSize, gridSize } }
}

export { generateFontAtlas }
