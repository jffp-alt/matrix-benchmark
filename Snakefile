"""
Snakefile - Pipeline reproducible para benchmark de multiplicacion de matrices.
Coordina la ejecucion de contenedores Docker, integracion de resultados y analisis estadistico.

Compatible con Windows (PowerShell) y Linux/macOS.

Prerequisitos:
  Las imagenes Docker deben construirse manualmente antes de ejecutar el pipeline:
    docker build -t matrix-cpp implementations/cpp/
    docker build -t matrix-go implementations/go/
    docker build -t matrix-java implementations/java/
    docker build -t matrix-python implementations/python/
"""

import os
import platform

LANGUAGES = ["cpp", "go", "java", "python"]
SIZES = [500, 1000, 1500]
SEED = 42
REPS = 10

# Detectar ruta absoluta del directorio de trabajo (compatible Windows/Linux)
WORKDIR = os.getcwd().replace("\\", "/")

wildcard_constraints:
    lang="[a-z]+",
    n="[0-9]+"


rule all:
    input:
        "results/benchmark.csv",
        "results/anova_results.txt",
        "results/tukey_results.txt",
        "results/descriptive_stats.csv",
        "results/boxplot_by_language.png",
        "results/interaction_plot.png",
        "results/bar_chart_comparison.png",
        "results/boxplot_comparison.png",
        "results/heatmap_times.png",
        "results/speedup_chart.png",
        "results/interaction_chart.png"


rule run_benchmark:
    """Ejecuta el contenedor Docker para un lenguaje y tamano de matriz especifico."""
    output:
        temp("results/{lang}_N{n}.csv")
    params:
        seed=SEED,
        reps=REPS,
        workdir=WORKDIR
    shell:
        'docker run --rm -v "{params.workdir}/results:/output" '
        'matrix-{wildcards.lang} '
        '--n {wildcards.n} --reps {params.reps} --seed {params.seed} '
        '--output /output/{wildcards.lang}_N{wildcards.n}.csv'


rule merge_language:
    """Integra los resultados parciales de un lenguaje en un unico archivo."""
    input:
        expand("results/{{lang}}_N{n}.csv", n=SIZES)
    output:
        "results/{lang}.csv"
    run:
        with open(output[0], "w") as out:
            out.write("language,N,repetition,time_seconds\n")
            for f in input:
                with open(f, "r") as inp:
                    for line in inp:
                        line = line.strip()
                        if line and not line.startswith("language"):
                            out.write(line + "\n")


rule merge_all:
    """Integra los cuatro archivos por lenguaje en benchmark.csv."""
    input:
        expand("results/{lang}.csv", lang=LANGUAGES)
    output:
        "results/benchmark.csv"
    run:
        with open(output[0], "w") as out:
            out.write("language,N,repetition,time_seconds\n")
            for f in input:
                with open(f, "r") as inp:
                    for line in inp:
                        line = line.strip()
                        if line and not line.startswith("language"):
                            out.write(line + "\n")


rule analysis:
    """Ejecuta el analisis estadistico completo: ANOVA, Tukey HSD, tablas y graficos."""
    input:
        "results/benchmark.csv"
    output:
        "results/anova_results.txt",
        "results/tukey_results.txt",
        "results/descriptive_stats.csv",
        "results/boxplot_by_language.png",
        "results/interaction_plot.png",
        "results/bar_chart_comparison.png",
        "results/boxplot_comparison.png",
        "results/heatmap_times.png",
        "results/speedup_chart.png",
        "results/interaction_chart.png"
    shell:
        'python analysis/analyze.py --input {input} --output-dir results/'
