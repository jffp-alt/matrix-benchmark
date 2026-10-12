package main

import (
	"flag"
	"fmt"
	"os"
	"time"
)

// LCG - Generador lineal congruencial idéntico al de C++
type LCG struct {
	state uint64
}

func NewLCG(seed uint64) *LCG {
	return &LCG{state: seed}
}

func (l *LCG) Next() float64 {
	l.state = l.state*6364136223846793005 + 1442695040888963407
	return float64((l.state>>33)%10000) / 100.0
}

func generateMatrix(n int, rng *LCG) [][]float64 {
	mat := make([][]float64, n)
	for i := 0; i < n; i++ {
		mat[i] = make([]float64, n)
		for j := 0; j < n; j++ {
			mat[i][j] = rng.Next()
		}
	}
	return mat
}

func multiply(A, B [][]float64, n int) [][]float64 {
	C := make([][]float64, n)
	for i := 0; i < n; i++ {
		C[i] = make([]float64, n)
		for j := 0; j < n; j++ {
			sum := 0.0
			for k := 0; k < n; k++ {
				sum += A[i][k] * B[k][j]
			}
			C[i][j] = sum
		}
	}
	return C
}

func main() {
	n := flag.Int("n", 500, "Tamaño de la matriz")
	reps := flag.Int("reps", 10, "Número de repeticiones")
	seed := flag.Uint64("seed", 42, "Semilla del generador")
	output := flag.String("output", "go.csv", "Archivo de salida")
	flag.Parse()

	rngA := NewLCG(*seed)
	A := generateMatrix(*n, rngA)
	rngB := NewLCG(*seed + 1)
	B := generateMatrix(*n, rngB)

	f, err := os.OpenFile(*output, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error abriendo archivo: %v\n", err)
		os.Exit(1)
	}
	defer f.Close()

	for r := 1; r <= *reps; r++ {
		start := time.Now()
		_ = multiply(A, B, *n)
		elapsed := time.Since(start).Seconds()

		fmt.Fprintf(f, "go,%d,%d,%.6f\n", *n, r, elapsed)
		fmt.Fprintf(os.Stderr, "go,N=%d,rep=%d,time=%.6fs\n", *n, r, elapsed)
	}
}
