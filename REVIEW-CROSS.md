# Evaluacion Cruzada - ACM Artifact Review & Badging

Guia para que el evaluador reproduzca el experimento desde cero.

## Requisitos
- Docker >= 24.0
- Snakemake >= 8.0
- Python >= 3.10 con: pip install -r analysis/requirements.txt

## Pasos

### 1. Clonar
git clone https://github.com/jffp-alt/matrix-benchmark.git
cd matrix-benchmark

### 2. Construir imagenes Docker
# Linux/macOS:
chmod +x build_docker.sh && ./build_docker.sh
# Windows:
.\build_docker.ps1

### 3. Ejecutar pipeline
snakemake --cores 1

### 4. Verificar resultados esperados
- results/cpp.csv, go.csv, java.csv, python.csv generados
- results/benchmark.csv con 120 filas
- results/anova_results.txt con p-value < 0.05
- Al menos 5 graficos PNG en results/

## Que registrar
1. Entorno: SO, CPU, RAM, versiones de Docker y Snakemake
2. Errores o dependencias faltantes encontradas
3. Modificaciones necesarias para ejecutar
4. Comparacion de tiempos obtenidos vs reportados
5. Veredicto: Functional / Reusable / no reproducible

## Criterios ACM
- Functional: el artifact se ejecuta y produce resultados consistentes
- Reusable: bien documentado, adaptable a otros contextos

## Nota sobre reproducibilidad
Los tiempos absolutos varian segun hardware. Lo reproducible es el flujo
completo y la tendencia relativa: C++ < Go < Java < Python.
