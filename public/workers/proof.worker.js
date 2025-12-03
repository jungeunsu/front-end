/**
 * Web Worker — vote proof generator
 *
 * Input:
 *   { input, wasmPath, zkeyPath }
 *
 * Result:
 *   { ok: true, ms, proof, publicSignals }
 *   { ok: false, ms, error }
 */

// snarkjs 브라우저 번들 로드 (빌드 영향 없음)
self.importScripts(
  'https://cdn.jsdelivr.net/npm/snarkjs@latest/dist/snarkjs.min.js'
)

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
