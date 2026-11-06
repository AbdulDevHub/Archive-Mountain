// The small slice of face-api.js (loaded as a global from public/face-api.min.js) that Face Emotions uses

interface FaceApiNet {
  loadFromUri(uri: string): Promise<void>
}

interface FaceApiResult {
  expressions: Record<string, number>
}

interface FaceApiTask extends PromiseLike<FaceApiResult[]> {
  withFaceLandmarks(): FaceApiTask
  withFaceExpressions(): FaceApiTask
}

declare const faceapi: {
  nets: { tinyFaceDetector: FaceApiNet; faceLandmark68Net: FaceApiNet; faceExpressionNet: FaceApiNet }
  TinyFaceDetectorOptions: new () => object
  detectAllFaces(input: HTMLVideoElement, options: object): FaceApiTask
  resizeResults<T>(results: T, size: { width: number; height: number }): T
  draw: {
    drawDetections(canvas: HTMLCanvasElement, results: FaceApiResult[]): void
    drawFaceLandmarks(canvas: HTMLCanvasElement, results: FaceApiResult[]): void
  }
}
