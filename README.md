# Benchmark Reproducible de Multiplicación de Matrices NxN

## Descripción

Experimento computacional reproducible que compara el tiempo de ejecución del algoritmo **naive** de multiplicación de matrices cuadradas NxN implementado en **C++**, **Go**, **Java** y **Python**.

El proyecto sigue los principios de reproducibilidad y replicabilidad científica alineados con [ACM Artifact Review & Badging](https://www.acm.org/publications/policies/artifact-review-and-badging-current).

**DOI**: [Pendiente - asignado por Zenodo]

---

## Pregunta de investigación

> ¿Existen diferencias estadísticamente significativas en el tiempo de ejecución del algoritmo naive de multiplicación de matrices NxN entre implementaciones equivalentes desarrolladas en C++, Go, Java y Python, y cómo varían estas diferencias según el tamaño de la matriz?

## Hipótesis

- **H₀**: El lenguaje de implementación no produce diferencias estadísticamente significativas en el tiempo de ejecución del algoritmo de multiplicación de matrices.
- **H₁**: Al menos uno de los lenguajes presenta un tiempo de ejecución significativamente diferente de los demás.

## Variables

| Variable | Tipo | Valores |
|----------|------|---------|
| **Lenguaje de programación** | Independiente (factor) | C++, Go, Java, Python |
| **Tamaño de matriz (N)** | Independiente (factor) | 500, 1000, 1500 |
| **Tiempo de ejecución** | Dependiente | Segundos (float) |
| **Repetición** | Control | 10 por combinación |
| **Semilla del generador** | Control | 42 (fija) |

## Diseño experimental

- **Algoritmo**: Multiplicación naive O(n³) con triple bucle anidado.
- **Generación de datos**: Generador lineal congruencial (LCG) con semilla fija, idéntico en los 4 lenguajes para garantizar las mismas matrices de entrada.
- **Medición**: Solo se cronometra la operación de multiplicación. La generación e inicialización de matrices se excluye del tiempo medido.
- **Repeticiones**: 10 ejecuciones por cada combinación (lenguaje, N).
- **Total de observaciones**: 4 × 3 × 10 = 120 mediciones.
- **Análisis**: ANOVA de dos factores con interacción + comparaciones post-hoc Tukey HSD.

---

## Estructura del repositorio

```
matrix-benchmark/
├── README.md                          # Este archivo
├── LICENSE                            # Licencia MIT
├── FAIR_datasheet.md                  # Mini datasheet FAIR
├── Snakefile                          # Pipeline de automatización
├── implementations/
│   ├── cpp/
│   │   ├── matrix_mult.cpp            # Implementación C++
│   │   └── Dockerfile
│   ├── go/
│   │   ├── matrix_mult.go             # Implementación Go
│   │   └── Dockerfile
│   ├── java/
│   │   ├── MatrixMult.java            # Implementación Java
│   │   └── Dockerfile
│   └── python/
│       ├── matrix_mult.py             # Implementación Python
│       └── Dockerfile
├── analysis/
│   ├── analyze.py                     # Script de análisis estadístico
│   └── requirements.txt               # Dependencias Python
└── results/                           # Resultados generados (no versionados)
    ├── cpp.csv
    ├── go.csv
    ├── java.csv
    ├── python.csv
    ├── benchmark.csv
    ├── descriptive_stats.csv
    ├── anova_results.txt
    ├── tukey_results.txt
    ├── boxplot_by_language.png
    └── interaction_plot.png
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) ≥ 24.0
- [Snakemake](https://snakemake.readthedocs.io/) ≥ 8.0
- Python ≥ 3.10
- Dependencias de análisis: `pip install -r analysis/requirements.txt`

---

## Instrucciones de reproducción

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/<usuario>/matrix-benchmark.git
cd matrix-benchmark
```

### Paso 2: Construir las imágenes Docker (manual)

Las imágenes deben construirse manualmente antes de ejecutar el pipeline:

```bash
docker build -t matrix-cpp implementations/cpp/
docker build -t matrix-go implementations/go/
docker build -t matrix-java implementations/java/
docker build -t matrix-python implementations/python/
```

### Paso 3: Instalar dependencias de análisis

```bash
pip install -r analysis/requirements.txt
```

### Paso 4: Ejecutar el pipeline completo

```bash
snakemake --cores 1
```

Este comando ejecuta automáticamente:

1. Los 4 contenedores Docker para N = 500, 1000 y 1500 (10 repeticiones cada uno).
2. Genera los archivos `cpp.csv`, `go.csv`, `java.csv` y `python.csv`.
3. Integra los resultados en `benchmark.csv`.
4. Ejecuta el análisis estadístico (ANOVA + Tukey HSD).
5. Genera tablas y gráficos en `results/`.

### Ejecución nativa sin Docker (alternativa)

Si Docker no está disponible, se puede ejecutar todo el experimento nativamente (requiere g++, go, javac y python3 instalados):

```bash
chmod +x run_native.sh
./run_native.sh
```

Este script compila, ejecuta los 4 benchmarks, integra los CSVs y corre el análisis estadístico completo.

> **Nota**: La ejecución completa (especialmente Python N=1500) puede tomar más de 1 hora.

### Ejecución paso a paso (alternativa)

Si se prefiere ejecutar cada etapa por separado:

```bash
# Ejecutar un solo lenguaje y tamaño
docker run --rm -v $(pwd)/results:/output matrix-cpp --n 500 --reps 10 --seed 42 --output /output/cpp_N500.csv

# Solo el análisis (si ya existe benchmark.csv)
python analysis/analyze.py --input results/benchmark.csv --output-dir results/
```

---

## Entorno de ejecución

Registrar las características del entorno donde se ejecutó el experimento:

| Componente | Valor |
|------------|-------|
| **Procesador** | Intel(R) Xeon(R) @ 2.80GHz |
| **RAM** | 8 GB |
| **Sistema operativo** | Linux 6.18.44-fc-v114 |
| **Arquitectura** | x86_64 |
| **Docker** | 29.8.2 |
| **GCC (C++)** | 13.x (imagen `gcc:13`) |
| **Go** | 1.22.x (imagen `golang:1.22`) |
| **Java** | 21 (imagen `eclipse-temurin:21`) |
| **Python** | 3.12 (imagen `python:3.12-slim`) |

Para obtener esta información automáticamente:

```bash
echo "CPU: $(lscpu | grep 'Model name' | sed 's/.*: *//')"
echo "RAM: $(free -h | awk '/Mem:/{print $2}')"
echo "OS: $(uname -srm)"
echo "Docker: $(docker --version)"
```

---

## Formato de resultados

Cada archivo CSV sigue la estructura:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `language` | string | Lenguaje (`cpp`, `go`, `java`, `python`) |
| `N` | int | Tamaño de la matriz |
| `repetition` | int | Número de repetición (1-10) |
| `time_seconds` | float | Tiempo de multiplicación en segundos |

---

## Análisis estadístico

El script `analysis/analyze.py` genera:

- **`descriptive_stats.csv`**: Media, desviación estándar, mediana, mín/máx por grupo.
- **`anova_results.txt`**: ANOVA de dos factores (lenguaje × tamaño) con interacción.
- **`tukey_results.txt`**: Comparaciones múltiples post-hoc Tukey HSD.
- **`boxplot_by_language.png`**: Distribución de tiempos por lenguaje y tamaño.
- **`interaction_plot.png`**: Gráfico de interacción lenguaje × tamaño.

---

## Criterios ACM Artifact Review & Badging

Este artifact está diseñado para cumplir con:

- **Functional**: El código se ejecuta correctamente y produce los resultados documentados.
- **Reusable**: Pipeline automatizado (Snakemake), entornos reproducibles (Docker), semilla fija, documentación completa.
- **Available**: Publicado en Zenodo con DOI y licencia abierta (MIT).

---

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

## Bibliografía

- ACM Artifact Review and Badging: https://www.acm.org/publications/policies/artifact-review-and-badging-current
- Reproducibility and Replicability in Science: https://nap.nationalacademies.org/catalog/25303/reproducibility-and-replicability-in-science
- Best Practices for Replicability, Reproducibility and Reusability: https://arxiv.org/pdf/1607.01191.pdf
