# Mini Datasheet FAIR

## 1. Identificación del dataset

| Campo | Valor |
|-------|-------|
| **Nombre** | Benchmark reproducible de multiplicación de matrices NxN |
| **Versión** | 1.0 |
| **Fecha de creación** | 2026-10 |
| **Autores** | [Nombre del estudiante] |
| **Licencia** | MIT |
| **DOI** | [Pendiente - asignado por Zenodo] |

## 2. Descripción

Este dataset contiene mediciones de tiempo de ejecución del algoritmo naive de multiplicación de matrices cuadradas NxN, implementado en cuatro lenguajes de programación: C++, Go, Java y Python. El objetivo es comparar el rendimiento entre lenguajes bajo condiciones controladas y reproducibles.

## 3. Procedencia (Provenance)

- **Método de generación**: Ejecución automatizada mediante pipeline Snakemake con contenedores Docker.
- **Matrices de entrada**: Generadas con un generador lineal congruencial (LCG) con semilla fija (seed=42 para matriz A, seed=43 para matriz B).
- **Entorno**: Contenedores Docker aislados por lenguaje, ejecutados secuencialmente.
- **Medición**: Solo se mide el tiempo de la operación de multiplicación; la generación de matrices se excluye.

## 4. Estructura de los datos

### Archivos individuales: `cpp.csv`, `go.csv`, `java.csv`, `python.csv`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `language` | string | Lenguaje de implementación (`cpp`, `go`, `java`, `python`) |
| `N` | int | Tamaño de la matriz cuadrada (500, 1000, 1500) |
| `repetition` | int | Número de repetición (1-10) |
| `time_seconds` | float | Tiempo de ejecución de la multiplicación en segundos |

### Archivo consolidado: `benchmark.csv`

Contiene la unión de los cuatro archivos anteriores con la misma estructura.

- **Registros totales**: 120 (4 lenguajes × 3 tamaños × 10 repeticiones)

## 5. Limitaciones

- El algoritmo utilizado es el naive O(n³); no refleja el rendimiento de librerías optimizadas (BLAS, NumPy, etc.).
- Los tiempos dependen del hardware del entorno de ejecución; la comparación es relativa, no absoluta.
- La ejecución secuencial de contenedores puede verse afectada por la carga del sistema.
- No se incluye warm-up explícito para la JVM de Java.
- Python ejecuta en el intérprete CPython sin optimizaciones.

## 6. Condiciones de reutilización

- **Findable**: Publicado en Zenodo con DOI persistente.
- **Accessible**: Descarga libre desde Zenodo y GitHub.
- **Interoperable**: Formato CSV estándar, código fuente en lenguajes ampliamente utilizados.
- **Reusable**: Pipeline Snakemake automatizado, entornos Docker reproducibles, semilla fija para datos de entrada, documentación completa en README.md.

## 7. Consideraciones éticas

No aplica. El dataset no contiene información personal ni sensible.
