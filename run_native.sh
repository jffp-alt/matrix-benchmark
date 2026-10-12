#!/bin/bash
# =============================================================
# run_native.sh - Ejecuta el benchmark sin Docker
# Compila y ejecuta los 4 lenguajes nativamente
# Uso: chmod +x run_native.sh && ./run_native.sh
# =============================================================

set -e

SEED=42
REPS=10
SIZES="500 1000 1500"
RESULTS_DIR="results"

mkdir -p "$RESULTS_DIR"

echo "=== Compilando implementaciones ==="
g++ -O0 -o implementations/cpp/matrix_mult implementations/cpp/matrix_mult.cpp
echo "  C++ OK"
go build -o implementations/go/matrix_mult implementations/go/matrix_mult.go
echo "  Go OK"
javac -d implementations/java implementations/java/MatrixMult.java
echo "  Java OK"
echo "  Python (interpretado)"

echo ""
echo "=== Ejecutando benchmarks ==="

for LANG in cpp go java python; do
  for N in $SIZES; do
    echo "--- $LANG N=$N ---"
    case $LANG in
      cpp)    ./implementations/cpp/matrix_mult --n $N --reps $REPS --seed $SEED --output "$RESULTS_DIR/${LANG}_N${N}.csv" ;;
      go)     ./implementations/go/matrix_mult -n $N -reps $REPS -seed $SEED -output "$RESULTS_DIR/${LANG}_N${N}.csv" ;;
      java)   java -cp implementations/java MatrixMult --n $N --reps $REPS --seed $SEED --output "$RESULTS_DIR/${LANG}_N${N}.csv" ;;
      python) python3 implementations/python/matrix_mult.py --n $N --reps $REPS --seed $SEED --output "$RESULTS_DIR/${LANG}_N${N}.csv" ;;
    esac
  done
done

echo ""
echo "=== Integrando resultados ==="

for LANG in cpp go java python; do
  echo "language,N,repetition,time_seconds" > "$RESULTS_DIR/${LANG}.csv"
  cat "$RESULTS_DIR/${LANG}_N"*.csv >> "$RESULTS_DIR/${LANG}.csv"
  rm -f "$RESULTS_DIR/${LANG}_N"*.csv
done

echo "language,N,repetition,time_seconds" > "$RESULTS_DIR/benchmark.csv"
for LANG in cpp go java python; do
  tail -n +2 "$RESULTS_DIR/${LANG}.csv" >> "$RESULTS_DIR/benchmark.csv"
done

echo "benchmark.csv generado ($(tail -n +2 $RESULTS_DIR/benchmark.csv | wc -l) registros)"

echo ""
echo "=== Ejecutando análisis estadístico ==="
pip install -q -r analysis/requirements.txt
python3 analysis/analyze.py --input "$RESULTS_DIR/benchmark.csv" --output-dir "$RESULTS_DIR/"

echo ""
echo "=== Completado ==="
echo "Resultados en: $RESULTS_DIR/"
ls -la "$RESULTS_DIR/"
