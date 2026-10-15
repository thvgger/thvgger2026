export class Vector {
  values: number[];

  constructor(values: number[]) {
    this.values = values;
  }

  get [0](): number {
    return this.values[0];
  }
  get [1](): number {
    return this.values[1];
  }
  get [2](): number {
    return this.values[2];
  }
  get [3](): number {
    return this.values[3];
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }

  multiplyByMatrix(matrix: Matrix): Vector {
    const v = this.values;
    const m = matrix.values;
    return new Vector([
      v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + (v[3] ?? 1) * m[3][0],
      v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + (v[3] ?? 1) * m[3][1],
      v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + (v[3] ?? 1) * m[3][2],
      v[0] * m[0][3] + v[1] * m[1][3] + v[2] * m[2][3] + (v[3] ?? 1) * m[3][3],
    ]);
  }

  static subtract(a: Vector, b: Vector): Vector {
    return new Vector([a[0] - b[0], a[1] - b[1], a[2] - b[2], 1]);
  }

  static cross(a: Vector, b: Vector): Vector {
    return new Vector([
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
      1,
    ]);
  }

  static dot(a: Vector, b: Vector): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  rotateZ(angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector([
      this.values[0] * cos - this.values[1] * sin,
      this.values[0] * sin + this.values[1] * cos,
      this.values[2],
      this.values[3],
    ]);
  }

  norm(): number {
    return Math.hypot(this.values[0], this.values[1], this.values[2]);
  }

  normalize(): Vector {
    const n = this.norm();
    if (n === 0) return new Vector([0, 0, 0, 1]);
    return new Vector([this.values[0] / n, this.values[1] / n, this.values[2] / n, 1]);
  }
}

export class Matrix {
  values: number[][];

  constructor(values: number[][]) {
    this.values = values;
  }

  static identity(): Matrix {
    return new Matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }

  static scale(s: number): Matrix {
    return new Matrix([
      [s, 0, 0, 0],
      [0, s, 0, 0],
      [0, 0, s, 0],
      [0, 0, 0, 1],
    ]);
  }

  static scaleX(s: number): Matrix {
    return new Matrix([
      [s, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }

  static scaleY(s: number): Matrix {
    return new Matrix([
      [1, 0, 0, 0],
      [0, s, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }

  static translation(x: number, y: number, z: number): Matrix {
    return new Matrix([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [x, y, z, 1],
    ]);
  }

  static translationY(y: number): Matrix {
    return Matrix.translation(0, y, 0);
  }

  static rotationX(angle: number): Matrix {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix([
      [1, 0, 0, 0],
      [0, c, s, 0],
      [0, -s, c, 0],
      [0, 0, 0, 1],
    ]);
  }

  static rotationY(angle: number): Matrix {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix([
      [c, 0, -s, 0],
      [0, 1, 0, 0],
      [s, 0, c, 0],
      [0, 0, 0, 1],
    ]);
  }

  static rotationZ(angle: number): Matrix {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Matrix([
      [c, s, 0, 0],
      [-s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]);
  }

  static rotation(axis: Vector, angle: number): Matrix {
    const x = axis[0];
    const y = axis[1];
    const z = axis[2];
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    return new Matrix([
      [t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0],
      [t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0],
      [t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0],
      [0, 0, 0, 1],
    ]);
  }

  dot(other: Matrix): Matrix {
    const a = this.values;
    const b = other.values;
    const res: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        res[i][j] =
          a[i][0] * b[0][j] +
          a[i][1] * b[1][j] +
          a[i][2] * b[2][j] +
          a[i][3] * b[3][j];
      }
    }
    return new Matrix(res);
  }
}
