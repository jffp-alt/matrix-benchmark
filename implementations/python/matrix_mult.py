"""
Multiplicación naive de matrices NxN en Python.
Generador LCG idéntico al usado en C++, Go y Java para reproducibilidad.
"""

import argparse
import time
import os


class LCG:
    """Generador lineal congruencial multiplataforma."""

    def __init__(self, seed: int):
        self.state = seed & 0xFFFFFFFFFFFFFFFF

    def next(self) -> float:
        self.state = (
            (self.state * 6364136223846793005 + 1442695040888963407)
            & 0xFFFFFFFFFFFFFFFF
        )
        return float(((self.state >> 33) % 10000)) / 100.0


def generate_matrix(n: int, rng: LCG) -> list[list[float]]:
    return [[rng.next() for _ in range(n)] for _ in range(n)]


def multiply(A: list[list[float]], B: list[list[float]], n: int) -> list[list[float]]:
    C = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            s = 0.0
            for k in range(n):
                s += A[i][k] * B[k][j]
            C[i][j] = s
    return C


def main():
    parser = argparse.ArgumentParser(description="Benchmark multiplicación de matrices")
    parser.add_argument("--n", type=int, default=500, help="Tamaño de la matriz")
    parser.add_argument("--reps", type=int, default=10, help="Número de repeticiones")
    parser.add_argument("--seed", type=int, default=42, help="Semilla del generador")
    parser.add_argument("--output", type=str, default="python.csv", help="Archivo de salida")
    args = parser.parse_args()

    # Generar matrices antes de medir
    rng_a = LCG(args.seed)
    A = generate_matrix(args.n, rng_a)
    rng_b = LCG(args.seed + 1)
    B = generate_matrix(args.n, rng_b)

    # Abrir archivo en modo append
    with open(args.output, "a") as f:
        for r in range(1, args.reps + 1):
            start = time.perf_counter()
            C = multiply(A, B, args.n)
            elapsed = time.perf_counter() - start

            f.write(f"python,{args.n},{r},{elapsed:.6f}\n")
            print(f"python,N={args.n},rep={r},time={elapsed:.6f}s", file=__import__('sys').stderr)


if __name__ == "__main__":
    main()
