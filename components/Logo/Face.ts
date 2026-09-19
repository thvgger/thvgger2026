import { Vector } from "./math";

export type Face = [Vector, Vector, Vector, Vector];

export function normal([a, b, c, d]: Face): Vector {
  return Vector.cross(Vector.subtract(c, a), Vector.subtract(d, b));
}

const visionVector = new Vector([0, 0, -1, 1]);

export function isFaceFacingCamera(shape: Face): boolean {
  return Vector.dot(normal(shape), visionVector) > 0;
}

function round(x: number): number {
  return Math.floor(x * 4) / 4;
}

export function facePath(face: Face): string {
  return face
    .map((v, i) => {
      const x = round(v[0]);
      const y = round(v[1]);
      if (i === 0) {
        return `M${x},${y}`;
      } else if (x === round(face[i - 1][0])) {
        return `V${y}`;
      } else if (y === round(face[i - 1][1])) {
        return `H${x}`;
      } else {
        return `L${x},${y}`;
      }
    })
    .concat("Z")
    .join("");
}
