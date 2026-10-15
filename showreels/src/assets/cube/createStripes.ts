import { Matrix, Vector } from "./math";
import type { Face } from "./Face";

export function createCubeStripes(
  STRIPES_COUNT = 3,
  MARGIN_RATIO = 0.11,
  INNER_MARGIN_RATIO = 0.27,
): Face[] {
  const WIDTH = 1 - MARGIN_RATIO;
  const STRIPE_WIDTH = (WIDTH / STRIPES_COUNT) * (1 - INNER_MARGIN_RATIO);
  const INNER_MARGIN =
    (WIDTH - STRIPE_WIDTH * STRIPES_COUNT) / (STRIPES_COUNT - 1);

  const EDGE = WIDTH / 2;

  const FACE_STRIPES: Face[] = [...new Array(STRIPES_COUNT)].map((_, stripe) => {
    const y1 = -EDGE + (STRIPE_WIDTH + INNER_MARGIN) * stripe;
    const y2 = y1 + STRIPE_WIDTH;
    return [
      new Vector([-EDGE, y1, 0.5, 1]),
      new Vector([EDGE, y1, 0.5, 1]),
      new Vector([EDGE, y2, 0.5, 1]),
      new Vector([-EDGE, y2, 0.5, 1]),
    ] as Face;
  });

  return [
    [-0.5, 0.0, 0.0],
    [0.5, 0.0, 0.0],
    [0.0, 0.5, 0.0],
    [0.0, -0.5, 0.0],
    [0.0, 0.0, -0.5],
    [1.0, 0.0, 0.5],
  ]
    .map(([angleX, angleY, angleZ]) => {
      const transformMatrix = Matrix.rotationX(Math.PI * angleX)
        .dot(Matrix.rotationY(Math.PI * angleY))
        .dot(Matrix.rotationZ(Math.PI * angleZ));

      return FACE_STRIPES.map((face) =>
        face.map((_) => _.multiplyByMatrix(transformMatrix)) as Face,
      );
    })
    .reduce((a, b) => a.concat(b));
}
