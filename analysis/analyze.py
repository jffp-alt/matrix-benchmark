"""
Análisis estadístico del benchmark de multiplicación de matrices.

Genera:
  - Estadísticas descriptivas (descriptive_stats.csv)
  - ANOVA de dos factores con interacción (anova_results.txt)
  - Comparaciones post-hoc Tukey HSD (tukey_results.txt)
  - Boxplot por lenguaje agrupado por tamaño (boxplot_by_language.png)
  - Gráfico de interacción Lenguaje × Tamaño (interaction_plot.png)
  - Comparación de barras de tiempos promedio (bar_chart_comparison.png)
  - Boxplot comparativo por tamaño (boxplot_comparison.png)
  - Mapa de calor de tiempos promedio (heatmap_times.png)
  - Speedup relativo a Python (speedup_chart.png)
  - Gráfico de interacción alternativo (interaction_chart.png)
"""

import argparse
import os

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm
from statsmodels.stats.multicomp import pairwise_tukeyhsd


# Orden y paleta consistentes para todos los gráficos
LANG_ORDER = ["cpp", "go", "java", "python"]
LANG_LABELS = {"cpp": "C++", "go": "Go", "java": "Java", "python": "Python"}
PALETTE = {"cpp": "#4C72B0", "go": "#55A868", "java": "#C44E52", "python": "#8172B2"}


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    df["language"] = df["language"].str.strip()
    df["N"] = df["N"].astype(int)
    df["repetition"] = df["repetition"].astype(int)
    df["time_seconds"] = df["time_seconds"].astype(float)
    return df


def descriptive_stats(df: pd.DataFrame, output_dir: str):
    desc = (
        df.groupby(["language", "N"])["time_seconds"]
        .agg(["count", "mean", "std", "min", "median", "max"])
        .round(6)
        .reset_index()
    )
    path = os.path.join(output_dir, "descriptive_stats.csv")
    desc.to_csv(path, index=False)
    print(f"Estadísticas descriptivas guardadas en {path}")
    return desc


def run_anova(df: pd.DataFrame, output_dir: str):
    df = df.copy()
    df["N_cat"] = df["N"].astype(str)

    model = ols("time_seconds ~ C(language) * C(N_cat)", data=df).fit()
    anova_table = anova_lm(model, typ=2)

    path = os.path.join(output_dir, "anova_results.txt")
    with open(path, "w") as f:
        f.write("=" * 70 + "\n")
        f.write("ANOVA DE DOS FACTORES CON INTERACCIÓN\n")
        f.write("Factores: language (lenguaje), N (tamaño de matriz)\n")
        f.write("Variable dependiente: time_seconds\n")
        f.write("=" * 70 + "\n\n")
        f.write(anova_table.to_string())
        f.write("\n\n")
        f.write("-" * 70 + "\n")
        f.write("Interpretación:\n")
        for idx, row in anova_table.iterrows():
            if pd.notna(row.get("PR(>F)")):
                sig = "***" if row["PR(>F)"] < 0.001 else (
                    "**" if row["PR(>F)"] < 0.01 else (
                    "*" if row["PR(>F)"] < 0.05 else "ns"))
                f.write(f"  {idx}: F={row['F']:.4f}, p={row['PR(>F)']:.2e} [{sig}]\n")
        f.write("-" * 70 + "\n")

    print(f"Resultados ANOVA guardados en {path}")
    return anova_table


def run_tukey(df: pd.DataFrame, output_dir: str):
    df = df.copy()
    tukey_lang = pairwise_tukeyhsd(
        df["time_seconds"], df["language"], alpha=0.05
    )

    df["group"] = df["language"] + "_N" + df["N"].astype(str)
    tukey_full = pairwise_tukeyhsd(
        df["time_seconds"], df["group"], alpha=0.05
    )

    path = os.path.join(output_dir, "tukey_results.txt")
    with open(path, "w") as f:
        f.write("=" * 70 + "\n")
        f.write("COMPARACIONES POST-HOC: TUKEY HSD\n")
        f.write("=" * 70 + "\n\n")
        f.write("--- Por lenguaje (colapsando tamaño) ---\n\n")
        f.write(str(tukey_lang))
        f.write("\n\n")
        f.write("--- Por combinación lenguaje × tamaño ---\n\n")
        f.write(str(tukey_full))
        f.write("\n")

    print(f"Resultados Tukey HSD guardados en {path}")


# ---------------------------------------------------------------------------
# Gráficos
# ---------------------------------------------------------------------------

def plot_boxplot(df: pd.DataFrame, output_dir: str):
    """Boxplot agrupado por lenguaje y tamaño (boxplot_by_language.png)."""
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.boxplot(
        data=df, x="N", y="time_seconds", hue="language",
        hue_order=LANG_ORDER, palette=PALETTE, ax=ax
    )
    ax.set_title("Tiempo de ejecución por lenguaje y tamaño de matriz", fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Tiempo (segundos)", fontsize=12)
    handles, labels = ax.get_legend_handles_labels()
    ax.legend(handles, [LANG_LABELS.get(l, l) for l in labels],
              title="Lenguaje", fontsize=10)
    plt.tight_layout()
    path = os.path.join(output_dir, "boxplot_by_language.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Boxplot guardado en {path}")


def plot_interaction(df: pd.DataFrame, output_dir: str):
    """Gráfico de interacción Lenguaje × Tamaño (interaction_plot.png)."""
    means = df.groupby(["language", "N"])["time_seconds"].mean().reset_index()

    fig, ax = plt.subplots(figsize=(10, 6))
    for lang in LANG_ORDER:
        subset = means[means["language"] == lang]
        ax.plot(
            subset["N"], subset["time_seconds"],
            marker="o", linewidth=2, label=LANG_LABELS[lang],
            color=PALETTE[lang]
        )

    ax.set_title("Gráfico de interacción: Lenguaje × Tamaño de matriz", fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Tiempo promedio (segundos)", fontsize=12)
    ax.set_xticks(sorted(means["N"].unique()))
    ax.legend(title="Lenguaje", fontsize=10)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    path = os.path.join(output_dir, "interaction_plot.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Gráfico de interacción guardado en {path}")


def plot_bar_chart(df: pd.DataFrame, output_dir: str):
    """Comparación de barras de tiempos promedio (bar_chart_comparison.png)."""
    means = df.groupby(["language", "N"])["time_seconds"].mean().reset_index()
    sizes = sorted(means["N"].unique())

    x = np.arange(len(sizes))
    width = 0.18
    fig, ax = plt.subplots(figsize=(12, 6))

    for i, lang in enumerate(LANG_ORDER):
        subset = means[means["language"] == lang].sort_values("N")
        bars = ax.bar(x + i * width, subset["time_seconds"].values,
                      width, label=LANG_LABELS[lang], color=PALETTE[lang])
        # Etiquetas de valor sobre cada barra
        for bar in bars:
            h = bar.get_height()
            ax.annotate(f"{h:.1f}",
                        xy=(bar.get_x() + bar.get_width() / 2, h),
                        xytext=(0, 4), textcoords="offset points",
                        ha="center", va="bottom", fontsize=8)

    ax.set_title("Tiempo promedio de ejecución por lenguaje y tamaño de matriz",
                 fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Tiempo promedio (segundos)", fontsize=12)
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels([str(s) for s in sizes])
    ax.legend(title="Lenguaje", fontsize=10)
    ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    path = os.path.join(output_dir, "bar_chart_comparison.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Gráfico de barras guardado en {path}")


def plot_boxplot_comparison(df: pd.DataFrame, output_dir: str):
    """Boxplots separados por tamaño de matriz (boxplot_comparison.png)."""
    sizes = sorted(df["N"].unique())
    fig, axes = plt.subplots(1, len(sizes), figsize=(5 * len(sizes), 6),
                             sharey=False)
    if len(sizes) == 1:
        axes = [axes]

    for ax, n in zip(axes, sizes):
        subset = df[df["N"] == n]
        sns.boxplot(
            data=subset, x="language", y="time_seconds",
            order=LANG_ORDER, hue="language", hue_order=LANG_ORDER,
            palette=PALETTE, legend=False, ax=ax
        )
        ax.set_title(f"N = {n}", fontsize=13)
        ax.set_xlabel("Lenguaje", fontsize=11)
        ax.set_ylabel("Tiempo (segundos)" if n == sizes[0] else "", fontsize=11)
        ax.set_xticks(range(len(LANG_ORDER)))
        ax.set_xticklabels([LANG_LABELS[l] for l in LANG_ORDER])

    fig.suptitle("Distribución de tiempos de ejecución por tamaño de matriz",
                 fontsize=14, y=1.02)
    plt.tight_layout()
    path = os.path.join(output_dir, "boxplot_comparison.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"Boxplot comparativo guardado en {path}")


def plot_heatmap(df: pd.DataFrame, output_dir: str):
    """Mapa de calor de tiempos promedio (heatmap_times.png)."""
    pivot = (
        df.groupby(["language", "N"])["time_seconds"]
        .mean()
        .reset_index()
        .pivot(index="language", columns="N", values="time_seconds")
    )
    # Reordenar filas
    pivot = pivot.reindex(LANG_ORDER)
    pivot.index = [LANG_LABELS[l] for l in pivot.index]

    fig, ax = plt.subplots(figsize=(8, 5))
    sns.heatmap(pivot, annot=True, fmt=".2f", cmap="YlOrRd",
                linewidths=0.5, ax=ax,
                cbar_kws={"label": "Tiempo promedio (s)"})
    ax.set_title("Mapa de calor: tiempo promedio de ejecución (segundos)",
                 fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Lenguaje", fontsize=12)
    plt.tight_layout()
    path = os.path.join(output_dir, "heatmap_times.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Mapa de calor guardado en {path}")


def plot_speedup(df: pd.DataFrame, output_dir: str):
    """Speedup relativo a Python (speedup_chart.png)."""
    means = df.groupby(["language", "N"])["time_seconds"].mean().reset_index()
    sizes = sorted(means["N"].unique())

    python_times = means[means["language"] == "python"].set_index("N")["time_seconds"]

    x = np.arange(len(sizes))
    width = 0.22
    fig, ax = plt.subplots(figsize=(10, 6))

    for i, lang in enumerate(LANG_ORDER):
        if lang == "python":
            continue
        subset = means[means["language"] == lang].sort_values("N")
        speedups = [python_times[n] / t for n, t in
                    zip(subset["N"].values, subset["time_seconds"].values)]
        bars = ax.bar(x + i * width, speedups, width,
                      label=LANG_LABELS[lang], color=PALETTE[lang])
        for bar, sp in zip(bars, speedups):
            ax.annotate(f"{sp:.1f}x",
                        xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
                        xytext=(0, 4), textcoords="offset points",
                        ha="center", va="bottom", fontsize=9, fontweight="bold")

    ax.set_title("Speedup relativo a Python", fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Speedup (veces más rápido que Python)", fontsize=12)
    ax.set_xticks(x + width)
    ax.set_xticklabels([str(s) for s in sizes])
    ax.legend(title="Lenguaje", fontsize=10)
    ax.axhline(y=1, color="gray", linestyle="--", alpha=0.5, label="_nolegend_")
    ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    path = os.path.join(output_dir, "speedup_chart.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Gráfico de speedup guardado en {path}")


def plot_interaction_chart(df: pd.DataFrame, output_dir: str):
    """Gráfico de interacción con barras de error (interaction_chart.png)."""
    stats_df = (
        df.groupby(["language", "N"])["time_seconds"]
        .agg(["mean", "std"])
        .reset_index()
    )

    fig, ax = plt.subplots(figsize=(10, 6))
    for lang in LANG_ORDER:
        subset = stats_df[stats_df["language"] == lang].sort_values("N")
        ax.errorbar(
            subset["N"], subset["mean"], yerr=subset["std"],
            marker="s", linewidth=2, capsize=4,
            label=LANG_LABELS[lang], color=PALETTE[lang]
        )

    ax.set_title("Interacción Lenguaje × Tamaño (media ± desviación estándar)",
                 fontsize=14)
    ax.set_xlabel("Tamaño de matriz (N)", fontsize=12)
    ax.set_ylabel("Tiempo promedio (segundos)", fontsize=12)
    ax.set_xticks(sorted(df["N"].unique()))
    ax.legend(title="Lenguaje", fontsize=10)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    path = os.path.join(output_dir, "interaction_chart.png")
    fig.savefig(path, dpi=150)
    plt.close(fig)
    print(f"Gráfico de interacción (con error) guardado en {path}")


def main():
    parser = argparse.ArgumentParser(description="Análisis estadístico del benchmark")
    parser.add_argument("--input", required=True, help="Ruta a benchmark.csv")
    parser.add_argument("--output-dir", default="results/", help="Directorio de salida")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    print("Cargando datos...")
    df = load_data(args.input)
    print(f"Registros cargados: {len(df)}")

    print("\n--- Estadísticas descriptivas ---")
    descriptive_stats(df, args.output_dir)

    print("\n--- ANOVA de dos factores ---")
    run_anova(df, args.output_dir)

    print("\n--- Tukey HSD ---")
    run_tukey(df, args.output_dir)

    print("\n--- Generando gráficos ---")
    plot_boxplot(df, args.output_dir)
    plot_interaction(df, args.output_dir)
    plot_bar_chart(df, args.output_dir)
    plot_boxplot_comparison(df, args.output_dir)
    plot_heatmap(df, args.output_dir)
    plot_speedup(df, args.output_dir)
    plot_interaction_chart(df, args.output_dir)

    print("\nAnálisis completado.")


if __name__ == "__main__":
    main()
