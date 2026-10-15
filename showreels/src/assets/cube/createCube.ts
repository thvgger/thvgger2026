import { Matrix } from "./math";
import { createCubeStripes } from "./createStripes";
import { isFaceFacingCamera, type Face } from "./Face";

const STRIPES = createCubeStripes();

export function createCube(transform: Matrix): Face[] {
  return STRIPES.map(
    (stripe) => stripe.map((vector) => vector.multiplyByMatrix(transform)) as Face,
  ).filter(isFaceFacingCamera);
}
