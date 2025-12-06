/**
 * Web Worker — vote proof generator
 */

self.importScripts('/workers/snarkjs.min.js') // ← CDN 제거, 로컬 로드

self.onmessage = async (event) => {
  const started = performance.now()
  try {
    const { input, wasmPath, zkeyPath } = event.data

    // @ts-ignore
    const { groth16 } = self.snarkjs

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    )

    postMessage({
      ok: true,
      ms: performance.now() - started,
      proof: JSON.stringify(proof),
      publicSignals,
    })
  } catch (err) {
    postMessage({
      ok: false,
      ms: performance.now() - started,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
