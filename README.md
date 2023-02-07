# WebGL Font Rendering

An experiment with font rendering techniques. ([Olle Alvin (2020)](https://lup.lub.lu.se/luur/download?func=downloadFile&recordOId=9024910&fileOId=9024911) did an awesome literature review for this topic.)

The current implementation is based on the signed distance field text rendering technique introduced by [Chirs Green (2007)](https://steamcdn-a.akamaihd.net/apps/valve/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf). I would also like to implement the multi-channel signed distance field text rendering method proposed by [Viktor Chlumský (2015)](https://github.com/Chlumsky/msdfgen/files/3050967/thesis.pdf) later.

## [Live Demo](https://webgl-font-rendering.onrender.com)

- Use mouse wheel to zoom in/out
- Use mouse drag to pan around

  > **Note**<br>
  > Only supports displaying Extended ASCII characters for the moment

## To-Do

1. Move the font texture generation procedure into a worker thread
2. Replace tinySDF with [msdfgen-wasm](https://github.com/painfulexistence/msdfgen-wasm) to get better rendering result

## Building

```bash
yarn
yarn build
yarn preview --port 8080 # Check out http://localhost:8080
```

## Testing

```bash
yarn test
```

## Further Reading

Resolution-independent font rendering:

- [Easy Scalable Text Rendering on the GPU](https://medium.com/@evanwallace/easy-scalable-text-rendering-on-the-gpu-c3f4d782c5ac)
- [GPU Text Rendering with Vector Textures](https://wdobbie.com/post/gpu-text-rendering-with-vector-textures/)
- [GPU-Centered Font Rendering Directly from Glyph Outlines](https://jcgt.org/published/0006/02/02/)
