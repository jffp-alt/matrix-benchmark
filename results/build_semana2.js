const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/07c9eb15-97a4-4d16-99ba-753588263510_37400ccf-4cab-4d2f-a839-cfa24d7fccfc/pptx/scripts/apply_theme.js");

(async () => {
  const pres = new pptxgen();

  // ── Theme: FORMATO.pptx colors ──
  const THEME = {
    name: "Benchmark Matrices USACH",
    headFontFace: "Calibri",
    bodyFontFace: "Calibri",
    colors: {
      dk1: "002D6B",   // navy titles
      lt1: "FFFFFF",   // white bg
      dk2: "333333",   // dark gray body
      lt2: "EBF0F7",   // light blue card bg
      accent1: "002D6B", // navy
      accent2: "E97500", // orange
      accent3: "878787", // gray
      accent4: "FCEDDC", // light peach
      accent5: "AFAFAF", // med gray
      accent6: "4F81BD", // blue
      hlink: "002D6B",
      folHlink: "878787",
    },
  };

  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.layout = "LAYOUT_16x9";
  pres.author = "Jorge Fornes - USACH";
  pres.subject = "Benchmark Multiplicacion de Matrices - Semana 2";

  // Colors
  const NAVY = "002D6B";
  const ORANGE = "E97500";
  const GRAY = "878787";
  const DGRAY = "333333";
  const LTBLUE = "EBF0F7";
  const PEACH = "FCEDDC";
  const WHITE = "FFFFFF";
  const MGRAY = "AFAFAF";

  const RESULTS = "/home/claude/matrix-benchmark/results";
  const LOGO = "/tmp/claude-0/-home-claude/40f3c46b-f058-549d-8e96-c37d0c7b3694/scratchpad/usach_logo.png";
  const TOTAL_SLIDES = 23;

  // Helper: footer text
  function addFooter(s, num) {
    s.addText("Octubre 2026", {
      x: 0.3, y: 5.15, w: 2.0, h: 0.4,
      fontSize: 8, color: GRAY, isTextBox: true, margin: 0, valign: "middle",
    });
    s.addText("Benchmark reproducible", {
      x: 6.5, y: 5.15, w: 2.5, h: 0.4,
      fontSize: 8, color: GRAY, isTextBox: true, margin: 0, valign: "middle", align: "right",
    });
    s.addText(num + " /" + TOTAL_SLIDES, {
      x: 9.1, y: 5.15, w: 0.7, h: 0.4,
      fontSize: 8, color: GRAY, isTextBox: true, margin: 0, valign: "middle", align: "right",
    });
  }

  // ── Layouts ──
  pres.defineSlideMaster({
    title: "COVER",
    background: { color: WHITE },
    objects: [
      { rect: { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: WHITE } } },
    ],
  });

  pres.defineSlideMaster({
    title: "SECTION",
    background: { color: WHITE },
    objects: [
      { rect: { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: WHITE } } },
    ],
  });

  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: WHITE },
    objects: [
      { rect: { x: 0.3, y: 0.75, w: 9.4, h: 0.015, fill: { color: MGRAY } } },
      { rect: { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: WHITE } } },
    ],
  });

  let slide;
  let slideNum = 0;

  // ═══════════════════════════════════════════════════════
  // SLIDE 1: Portada
  // ═══════════════════════════════════════════════════════
  pres.addSection({ title: "Portada" });
  slideNum++;
  slide = pres.addSlide({ masterName: "COVER", sectionTitle: "Portada" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.2, w: 1.6, h: 0.5 });

  slide.addText("BENCHMARK REPRODUCIBLE", {
    x: 0.3, y: 1.2, w: 9.0, h: 0.7,
    fontSize: 34, bold: true, color: NAVY, isTextBox: true, margin: 0,
    charSpacing: 3,
  });

  slide.addText([
    { text: "Multiplicación de Matrices NxN\n", options: { fontSize: 18, bold: true, color: DGRAY } },
    { text: "C++  |  Go  |  Java  |  Python", options: { fontSize: 16, color: ORANGE, bold: true } },
  ], {
    x: 0.3, y: 2.0, w: 9.0, h: 0.9, isTextBox: true, margin: 0,
  });

  slide.addText([
    { text: "Experimento Computacional Reproducible\n", options: { fontSize: 12, color: DGRAY } },
    { text: "ACM Artifact Review &amp; Badging", options: { fontSize: 12, color: DGRAY } },
  ], {
    x: 0.3, y: 3.0, w: 5.0, h: 0.7, isTextBox: true, margin: 0,
  });

  slide.addText([
    { text: "Profesor: Alcides Quispe\n", options: { fontSize: 14, bold: true, color: NAVY } },
    { text: "Alumno: Jorge Fornés Pavez", options: { fontSize: 14, color: DGRAY } },
  ], {
    x: 0.3, y: 3.9, w: 5.0, h: 0.7, isTextBox: true, margin: 0,
  });

  slide.addText("Octubre 2026", {
    x: 0.3, y: 4.7, w: 3.0, h: 0.35,
    fontSize: 10, color: GRAY, isTextBox: true, margin: 0,
  });

  slide.addNotes("Bienvenidos. En esta presentación mostramos el trabajo de Semana 2: la implementación y ejecución del experimento de benchmark de multiplicación de matrices. Partimos con un breve resumen de lo definido en Semana 1 y luego entramos de lleno en el código, las decisiones de diseño y los primeros resultados.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 2: Section – Introducción
  // ═══════════════════════════════════════════════════════
  pres.addSection({ title: "Introduccion" });
  slideNum++;
  slide = pres.addSlide({ masterName: "SECTION", sectionTitle: "Introduccion" });

  slide.addImage({ path: LOGO, x: 4.2, y: 0.2, w: 1.6, h: 0.5 });

  slide.addText("01", {
    x: 0.5, y: 1.5, w: 2.0, h: 0.8,
    fontSize: 52, bold: true, color: ORANGE, isTextBox: true, margin: 0,
  });

  slide.addText("Introducción", {
    x: 0.5, y: 2.3, w: 8.0, h: 0.7,
    fontSize: 36, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });

  slide.addText("¿Qué es este proyecto y por qué es importante?", {
    x: 0.5, y: 3.1, w: 8.0, h: 0.5,
    fontSize: 14, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Estos son los 5 bloques que vamos a recorrer. Primero un resumen rápido de Semana 1 para dar contexto, después las implementaciones, las decisiones que tomamos para que la comparación sea justa, el entorno donde corrimos todo, y finalmente los primeros resultados con gráficos y observaciones.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 3: ¿Qué se realizó? (4 stat cards)
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduccion" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("¿Qué se realizó?", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const statCards = [
    { icon: "{ }", value: "4 Lenguajes", desc: "C++, Go, Java,\nPython" },
    { icon: "NxN", value: "3 Tamaños", desc: "N = 500, 1000,\n1500" },
    { icon: "x10", value: "10 Repeticiones", desc: "Por combinación" },
    { icon: "120", value: "120 Mediciones", desc: "Total de\nobservaciones" },
  ];

  statCards.forEach((c, i) => {
    const x = 0.4 + i * 2.35;
    // Card bg
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.2, w: 2.15, h: 3.4,
      fill: { color: LTBLUE }, rectRadius: 0.12,
    });
    // Orange circle icon
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.6, y: 1.5, w: 0.95, h: 0.95,
      fill: { color: ORANGE },
    });
    slide.addText(c.icon, {
      x: x + 0.6, y: 1.5, w: 0.95, h: 0.95,
      fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    // Value
    slide.addText(c.value, {
      x: x + 0.1, y: 2.7, w: 1.95, h: 0.55,
      fontSize: 16, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0,
    });
    // Description
    slide.addText(c.desc, {
      x: x + 0.1, y: 3.3, w: 1.95, h: 1.0,
      fontSize: 12, color: DGRAY, align: "center", isTextBox: true, margin: 0,
    });
  });

  addFooter(slide, slideNum);

  slide.addNotes("Antes de entrar en la implementación, recordemos brevemente qué definimos en Semana 1: la pregunta de investigación, las hipótesis y las variables del experimento. Cuatro lenguajes, tres tamaños, diez repeticiones, 120 mediciones totales.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 4: Pregunta de investigación
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduccion" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Pregunta de investigación", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  // Question box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.1, w: 9.0, h: 1.3,
    fill: { color: LTBLUE }, rectRadius: 0.1,
    line: { color: NAVY, width: 1.5 },
  });

  slide.addText("¿Existen diferencias estadísticamente significativas en el tiempo de ejecución del algoritmo naive de multiplicación de matrices NxN entre implementaciones equivalentes en C++, Go, Java y Python?", {
    x: 0.8, y: 1.2, w: 8.4, h: 1.1,
    fontSize: 14, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  // H0 card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 2.8, w: 4.2, h: 1.8,
    fill: { color: LTBLUE }, rectRadius: 0.1,
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 2.2, y: 2.95, w: 0.65, h: 0.65,
    fill: { color: NAVY },
  });
  slide.addText("H₀", {
    x: 2.2, y: 2.95, w: 0.65, h: 0.65,
    fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
  });
  slide.addText("No hay diferencias significativas\nentre lenguajes", {
    x: 0.8, y: 3.7, w: 3.6, h: 0.7,
    fontSize: 13, color: DGRAY, align: "center", isTextBox: true, margin: 0,
  });

  // H1 card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 2.8, w: 4.2, h: 1.8,
    fill: { color: PEACH }, rectRadius: 0.1,
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7.0, y: 2.95, w: 0.65, h: 0.65,
    fill: { color: ORANGE },
  });
  slide.addText("H₁", {
    x: 7.0, y: 2.95, w: 0.65, h: 0.65,
    fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
  });
  slide.addText("Al menos un lenguaje es\nsignificativamente diferente", {
    x: 5.6, y: 3.7, w: 3.6, h: 0.7,
    fontSize: 13, color: DGRAY, align: "center", isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Nuestra pregunta es si existen diferencias significativas entre los 4 lenguajes. H₀ dice que no hay diferencias, H₁ dice que al menos un lenguaje es significativamente diferente. Con esto claro, pasemos a ver la metodología.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 5: Section – Metodología
  // ═══════════════════════════════════════════════════════
  pres.addSection({ title: "Metodologia" });
  slideNum++;
  slide = pres.addSlide({ masterName: "SECTION", sectionTitle: "Metodologia" });

  slide.addImage({ path: LOGO, x: 4.2, y: 0.2, w: 1.6, h: 0.5 });

  slide.addText("02", {
    x: 0.5, y: 1.5, w: 2.0, h: 0.8,
    fontSize: 52, bold: true, color: ORANGE, isTextBox: true, margin: 0,
  });
  slide.addText("Metodología", {
    x: 0.5, y: 2.3, w: 8.0, h: 0.7,
    fontSize: 36, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  slide.addText("¿Cómo se diseñó y ejecutó el experimento?", {
    x: 0.5, y: 3.1, w: 8.0, h: 0.5,
    fontSize: 14, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Entramos en el corazón de Semana 2: qué algoritmo implementamos, en qué lenguajes y cómo garantizamos que las matrices sean idénticas en todos.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 6: Diseño experimental (3 numbered cards)
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Metodologia" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Diseño experimental", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const designCards = [
    {
      num: "1", title: "Algoritmo",
      lines: ["Multiplicación naive", "O(n³)", "", "Triple bucle anidado", "idéntico en los 4", "lenguajes"],
    },
    {
      num: "2", title: "Datos de entrada",
      lines: ["Generador LCG con", "semilla fija (seed=42 y", "seed=43)", "", "Matrices idénticas en", "todos"],
    },
    {
      num: "3", title: "Medición",
      lines: ["Solo se cronometra la", "multiplicación", "", "Generación e", "inicialización excluidas"],
    },
  ];

  designCards.forEach((c, i) => {
    const x = 0.4 + i * 3.15;
    // Card
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.1, w: 2.95, h: 3.8,
      fill: { color: LTBLUE }, rectRadius: 0.12,
    });
    // Orange circle with number
    slide.addShape(pres.shapes.OVAL, {
      x: x + 1.05, y: 1.3, w: 0.85, h: 0.85,
      fill: { color: ORANGE },
    });
    slide.addText(c.num, {
      x: x + 1.05, y: 1.3, w: 0.85, h: 0.85,
      fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    // Title
    slide.addText(c.title, {
      x: x + 0.15, y: 2.3, w: 2.65, h: 0.5,
      fontSize: 16, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0,
    });
    // Content
    slide.addText(c.lines.join("\n"), {
      x: x + 0.15, y: 2.85, w: 2.65, h: 1.8,
      fontSize: 11, color: DGRAY, align: "center", isTextBox: true, margin: 0,
    });
  });

  addFooter(slide, slideNum);

  slide.addNotes("Usamos el algoritmo naive de triple bucle: complejidad O(n³), sin optimizaciones. El LCG con semilla fija garantiza matrices idénticas en todos los lenguajes. Solo se mide la multiplicación pura, excluyendo generación e inicialización.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 7: Herramientas de reproducibilidad (3 cols)
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Metodologia" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Herramientas de reproducibilidad", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const tools = [
    {
      title: "Docker",
      lines: "Contenedores aislados\npor lenguaje\ngcc:13 | golang:1.22\neclipse-temurin:21 |\npython:3.12",
    },
    {
      title: "Snakemake",
      lines: "Pipeline de\nautomatización\nEjecuta los 120\nbenchmarks y el análisis\nestadístico",
    },
    {
      title: "Git + GitHub",
      lines: "Control de versiones\nRepositorio público\ngithub.com/jffp-alt/matrix-\nbenchmark",
    },
  ];

  tools.forEach((t, i) => {
    const x = 0.4 + i * 3.15;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.1, w: 2.95, h: 3.6,
      fill: { color: LTBLUE }, rectRadius: 0.12,
    });
    slide.addText(t.title, {
      x: x + 0.15, y: 1.3, w: 2.65, h: 0.5,
      fontSize: 18, bold: true, color: NAVY, isTextBox: true, margin: 0,
    });
    slide.addText(t.lines, {
      x: x + 0.15, y: 1.9, w: 2.65, h: 2.5,
      fontSize: 12, color: DGRAY, isTextBox: true, margin: 0,
    });
  });

  addFooter(slide, slideNum);

  slide.addNotes("Tres pilares de reproducibilidad. Docker aísla cada lenguaje en su imagen oficial. Snakemake automatiza los 120 benchmarks. Y Git + GitHub dan control de versiones y acceso público al código.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 8: Section – Resultados
  // ═══════════════════════════════════════════════════════
  pres.addSection({ title: "Resultados" });
  slideNum++;
  slide = pres.addSlide({ masterName: "SECTION", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 4.2, y: 0.2, w: 1.6, h: 0.5 });

  slide.addText("03", {
    x: 0.5, y: 1.5, w: 2.0, h: 0.8,
    fontSize: 52, bold: true, color: ORANGE, isTextBox: true, margin: 0,
  });
  slide.addText("Resultados", {
    x: 0.5, y: 2.3, w: 8.0, h: 0.7,
    fontSize: 36, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  slide.addText("¿Qué encontramos?", {
    x: 0.5, y: 3.1, w: 8.0, h: 0.5,
    fontSize: 14, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Llegamos a los primeros resultados. Todo lo que mostraremos aquí es análisis descriptivo: medias, desviaciones, gráficos de distribución. El análisis inferencial con ANOVA y Tukey lo haremos en Semana 4.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 9: Tiempos promedio (table + callouts)
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Tiempos promedio de ejecución (segundos)", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 22, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const hdrStyle = { fontSize: 12, bold: true, color: WHITE, fill: { color: NAVY }, align: "center", valign: "middle" };
  const cellOdd = (v) => ({ text: v, options: { fontSize: 12, color: DGRAY, fill: { color: LTBLUE }, align: "center", valign: "middle" } });
  const cellEven = (v) => ({ text: v, options: { fontSize: 12, color: DGRAY, fill: { color: WHITE }, align: "center", valign: "middle" } });
  const langCell = (v, bg) => ({ text: v, options: { fontSize: 12, bold: true, color: NAVY, fill: { color: bg }, align: "center", valign: "middle" } });

  const tRows = [
    [
      { text: "Lenguaje", options: hdrStyle },
      { text: "N=500", options: hdrStyle },
      { text: "N=1000", options: hdrStyle },
      { text: "N=1500", options: hdrStyle },
    ],
    [langCell("C++", LTBLUE), cellOdd("2.73"), cellOdd("28.00"), cellOdd("97.83")],
    [langCell("Go", WHITE), cellEven("0.32"), cellEven("4.72"), cellEven("21.42")],
    [langCell("Java", LTBLUE), cellOdd("0.26"), cellOdd("4.65"), cellOdd("27.80")],
    [langCell("Python", WHITE), cellEven("12.46"), cellEven("101.88"), cellEven("342.08")],
  ];

  slide.addTable(tRows, {
    x: 0.5, y: 1.1, w: 9.0,
    rowH: [0.5, 0.45, 0.45, 0.45, 0.45],
    border: { type: "solid", pt: 0.5, color: "CCCCCC" },
    colW: [2.0, 2.33, 2.33, 2.34],
  });

  // Callout boxes
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 3.8, w: 4.2, h: 1.1,
    fill: { color: LTBLUE }, rectRadius: 0.08,
  });
  slide.addText([
    { text: "Más rápidos\n", options: { fontSize: 14, bold: true, color: NAVY } },
    { text: "Go y Java: ~0.3s para N=500\nPrácticamente equivalentes", options: { fontSize: 11, color: DGRAY } },
  ], {
    x: 0.7, y: 3.85, w: 3.8, h: 1.0, isTextBox: true, margin: 0,
  });

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 3.8, w: 4.2, h: 1.1,
    fill: { color: PEACH }, rectRadius: 0.08,
  });
  slide.addText([
    { text: "Más lento\n", options: { fontSize: 14, bold: true, color: ORANGE } },
    { text: "Python: 342s para N=1500\n16x más lento que Go", options: { fontSize: 11, color: DGRAY } },
  ], {
    x: 5.5, y: 3.85, w: 3.8, h: 1.0, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Aquí tenemos la tabla completa con los tiempos promedio por cada combinación lenguaje-tamaño. Go y Java son los más rápidos, C++ con -O0 queda en el medio, y Python es muy lento. Las desviaciones estándar son pequeñas, lo que indica mediciones estables.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 10: Boxplot
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Distribución de tiempos (Boxplot)", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  slide.addImage({
    path: RESULTS + "/boxplot_comparison.png",
    x: 0.3, y: 0.9, w: 9.4, h: 3.5,
  });

  slide.addText("Python domina los tiempos altos. Go y Java son los más rápidos con baja variabilidad.", {
    x: 0.5, y: 4.5, w: 9.0, h: 0.5,
    fontSize: 12, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Los boxplots confirman lo que dijimos: baja dispersión en todos los grupos, medianas representativas y prácticamente sin outliers. Esto nos da confianza en que los datos son de buena calidad para un análisis estadístico posterior.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 11: Interaction chart
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Gráfico de interacción: Lenguaje × Tamaño", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 22, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  slide.addImage({
    path: RESULTS + "/interaction_chart.png",
    x: 0.3, y: 0.9, w: 9.4, h: 3.5,
  });

  slide.addText("Las líneas no son paralelas → interacción significativa. Python crece mucho más rápido con N.", {
    x: 0.5, y: 4.5, w: 9.0, h: 0.5,
    fontSize: 12, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Este gráfico es clave: muestra cómo el efecto del lenguaje cambia según el tamaño de la matriz. Las curvas NO son paralelas — la brecha entre Python y los demás se amplifica al crecer N. Esto sugiere una interacción entre los factores lenguaje y tamaño, que confirmaremos formalmente con ANOVA de dos factores en Semana 4.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 12: Heatmap + Speedup
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Mapa de calor y Speedup vs Python", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  slide.addImage({
    path: RESULTS + "/heatmap_times.png",
    x: 0.1, y: 0.9, w: 4.8, h: 4.1,
  });

  slide.addImage({
    path: RESULTS + "/speedup_chart.png",
    x: 5.1, y: 0.9, w: 4.8, h: 4.1,
  });

  addFooter(slide, slideNum);

  slide.addNotes("A la izquierda, el mapa de calor muestra los tiempos absolutos — los colores oscuros indican tiempos altos. Python en N=1500 alcanza 342 segundos. A la derecha, el speedup relativo a Python: Go llega a casi 40x más rápido en N=500.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 13: Bar chart comparison
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Comparación con barras de error", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  slide.addImage({
    path: RESULTS + "/bar_chart_comparison.png",
    x: 0.3, y: 0.9, w: 9.4, h: 4.1,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Finalmente, este gráfico con barras de error muestra media más/menos una desviación estándar. Las barras de error son pequeñas en todos los casos, confirmando la estabilidad del experimento.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 14: Native bar chart
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Tiempo medio por lenguaje y tamaño", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  slide.addChart(pres.charts.BAR, [
    { name: "C++", labels: ["N=500", "N=1000", "N=1500"], values: [2.73, 28.00, 97.83] },
    { name: "Go", labels: ["N=500", "N=1000", "N=1500"], values: [0.32, 4.72, 21.42] },
    { name: "Java", labels: ["N=500", "N=1000", "N=1500"], values: [0.26, 4.65, 27.80] },
    { name: "Python", labels: ["N=500", "N=1000", "N=1500"], values: [12.46, 101.88, 342.08] },
  ], {
    x: 0.5, y: 0.9, w: 9.0, h: 4.2,
    showTitle: false,
    showLegend: true,
    legendPos: "b",
    legendFontSize: 11,
    legendFontFace: "+mn-lt",
    chartColors: [NAVY, "3498DB", "2ECC71", ORANGE],
    catAxisLabelColor: DGRAY,
    catAxisLabelFontSize: 12,
    catAxisLabelFontFace: "+mn-lt",
    valAxisLabelColor: GRAY,
    valAxisLabelFontSize: 10,
    valAxisLabelFontFace: "+mn-lt",
    valAxisTitle: "Tiempo (segundos)",
    valAxisTitleColor: GRAY,
    valAxisTitleFontSize: 10,
    showValAxisTitle: true,
    valGridLine: { color: "E0E0E0", size: 0.5 },
    catGridLine: { style: "none" },
    barGapWidthPct: 100,
    barGroupGapPct: 50,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Este gráfico de barras nativo de PowerPoint muestra visualmente lo que vimos en la tabla. Noten cómo Python domina la escala, haciendo que las barras de Go y Java casi no se vean en N=1500.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 15: Observaciones clave N=1500
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Observaciones clave (N=1500)", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const keyStats = [
    { value: "16x", label: "Python vs Go", bg: PEACH, numColor: ORANGE },
    { value: "4.6x", label: "C++ (-O0) vs Go", bg: LTBLUE, numColor: NAVY },
    { value: "1.3x", label: "Java vs Go", bg: LTBLUE, numColor: NAVY },
  ];

  keyStats.forEach((s, i) => {
    const x = 0.4 + i * 3.15;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.1, w: 2.95, h: 2.2,
      fill: { color: s.bg }, rectRadius: 0.12,
    });
    slide.addText(s.value, {
      x: x, y: 1.2, w: 2.95, h: 1.1,
      fontSize: 52, bold: true, color: s.numColor, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    slide.addText("más lento", {
      x: x, y: 2.2, w: 2.95, h: 0.3,
      fontSize: 12, color: GRAY, align: "center", isTextBox: true, margin: 0,
    });
    slide.addText(s.label, {
      x: x, y: 2.55, w: 2.95, h: 0.5,
      fontSize: 14, bold: true, color: DGRAY, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
  });

  slide.addText([
    { text: "Baja variabilidad: ", options: { fontSize: 13, bold: true, color: NAVY } },
    { text: "coeficientes de variación < 5% en todos los lenguajes.\n", options: { fontSize: 12, color: DGRAY } },
    { text: "Escalamiento O(n³): ", options: { fontSize: 13, bold: true, color: NAVY } },
    { text: "al triplicar N (500→1500), los tiempos crecen ~27x.", options: { fontSize: 12, color: DGRAY } },
  ], {
    x: 0.5, y: 3.6, w: 9.0, h: 1.2, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Aquí cuantificamos las diferencias para N=1500. Python es 16 veces más lento que Go, C++ sin optimizaciones es 4.6 veces más lento, y Java solo 1.3 veces. Además, todos los coeficientes de variación están bajo el 5%, confirmando que nuestras mediciones son estables.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 16: Estadísticas descriptivas completas
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Resultados" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Estadísticas descriptivas completas", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 22, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const fullHdr = { fontSize: 10, bold: true, color: WHITE, fill: { color: NAVY }, align: "center", valign: "middle" };
  const fc1 = (v) => ({ text: v, options: { fontSize: 10, color: DGRAY, fill: { color: LTBLUE }, align: "center", valign: "middle" } });
  const fc2 = (v) => ({ text: v, options: { fontSize: 10, color: DGRAY, fill: { color: WHITE }, align: "center", valign: "middle" } });
  const fl = (v, bg) => ({ text: v, options: { fontSize: 10, bold: true, color: NAVY, fill: { color: bg }, align: "center", valign: "middle" } });

  const fullRows = [
    [
      { text: "Lenguaje", options: fullHdr }, { text: "N", options: fullHdr },
      { text: "n", options: fullHdr }, { text: "Media", options: fullHdr },
      { text: "Std", options: fullHdr }, { text: "Min", options: fullHdr },
      { text: "Mediana", options: fullHdr }, { text: "Max", options: fullHdr },
    ],
    [fl("C++", LTBLUE), fc1("500"), fc1("10"), fc1("2.73"), fc1("0.28"), fc1("2.05"), fc1("2.73"), fc1("3.15")],
    [fl("C++", WHITE), fc2("1000"), fc2("10"), fc2("28.00"), fc2("0.37"), fc2("27.39"), fc2("27.99"), fc2("28.56")],
    [fl("C++", LTBLUE), fc1("1500"), fc1("10"), fc1("97.83"), fc1("1.18"), fc1("95.62"), fc1("98.27"), fc1("99.11")],
    [fl("Go", WHITE), fc2("500"), fc2("10"), fc2("0.32"), fc2("0.02"), fc2("0.28"), fc2("0.31"), fc2("0.35")],
    [fl("Go", LTBLUE), fc1("1000"), fc1("10"), fc1("4.72"), fc1("0.08"), fc1("4.59"), fc1("4.73"), fc1("4.82")],
    [fl("Go", WHITE), fc2("1500"), fc2("10"), fc2("21.42"), fc2("0.63"), fc2("20.54"), fc2("21.50"), fc2("22.60")],
    [fl("Java", LTBLUE), fc1("500"), fc1("10"), fc1("0.26"), fc1("0.03"), fc1("0.22"), fc1("0.26"), fc1("0.30")],
    [fl("Java", WHITE), fc2("1000"), fc2("10"), fc2("4.65"), fc2("0.20"), fc2("4.43"), fc2("4.65"), fc2("5.06")],
    [fl("Java", LTBLUE), fc1("1500"), fc1("10"), fc1("27.80"), fc1("0.34"), fc1("27.16"), fc1("27.84"), fc1("28.38")],
    [fl("Python", WHITE), fc2("500"), fc2("10"), fc2("12.46"), fc2("0.26"), fc2("12.00"), fc2("12.49"), fc2("12.89")],
    [fl("Python", LTBLUE), fc1("1000"), fc1("10"), fc1("101.88"), fc1("1.82"), fc1("98.14"), fc1("102.30"), fc1("104.09")],
    [fl("Python", WHITE), fc2("1500"), fc2("10"), fc2("342.08"), fc2("4.55"), fc2("336.72"), fc2("340.02"), fc2("350.62")],
  ];

  slide.addTable(fullRows, {
    x: 0.3, y: 0.9, w: 9.4,
    rowH: [0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
    border: { type: "solid", pt: 0.3, color: "CCCCCC" },
    colW: [1.1, 0.7, 0.5, 1.2, 1.1, 1.1, 1.1, 1.1],
  });

  addFooter(slide, slideNum);

  slide.addNotes("Aquí tenemos la tabla completa con media, desviación estándar, mín, mediana y máx por cada combinación lenguaje-tamaño. Las desviaciones estándar son pequeñas en relación a las medias, indicando mediciones estables.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 17: Entorno (section)
  // ═══════════════════════════════════════════════════════
  pres.addSection({ title: "Entorno" });
  slideNum++;
  slide = pres.addSlide({ masterName: "SECTION", sectionTitle: "Entorno" });

  slide.addImage({ path: LOGO, x: 4.2, y: 0.2, w: 1.6, h: 0.5 });

  slide.addText("04", {
    x: 0.5, y: 1.5, w: 2.0, h: 0.8,
    fontSize: 52, bold: true, color: ORANGE, isTextBox: true, margin: 0,
  });
  slide.addText("Entorno de ejecución", {
    x: 0.5, y: 2.3, w: 8.0, h: 0.7,
    fontSize: 36, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  slide.addText("Hardware, software y contenedores Docker", {
    x: 0.5, y: 3.1, w: 8.0, h: 0.5,
    fontSize: 14, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Documentar el entorno es requisito para la reproducibilidad. Cualquier persona que quiera replicar debe saber exactamente en qué hardware y software se ejecutó.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 18: Entorno detalle
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Entorno" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Características del entorno", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  // Hardware card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 1.0, w: 4.4, h: 3.8,
    fill: { color: LTBLUE }, rectRadius: 0.12,
  });
  slide.addText("Hardware / Sistema", {
    x: 0.6, y: 1.15, w: 4.0, h: 0.4,
    fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });

  const hw = [
    ["Equipo", "Notebook"],
    ["Procesador", "Intel Core i7-1255U @ 2.60 GHz"],
    ["RAM", "16 GB DDR4"],
    ["Sistema operativo", "Ubuntu 22.04.4 LTS"],
    ["Arquitectura", "x86_64"],
    ["Docker", "29.8.2"],
  ];

  hw.forEach((h, i) => {
    const y = 1.65 + i * 0.5;
    slide.addText([
      { text: h[0] + "\n", options: { fontSize: 9, color: GRAY } },
      { text: h[1], options: { fontSize: 12, bold: true, color: DGRAY } },
    ], {
      x: 0.6, y: y, w: 4.0, h: 0.48, isTextBox: true, margin: 0,
    });
  });

  // Docker images card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 1.0, w: 4.4, h: 3.8,
    fill: { color: LTBLUE }, rectRadius: 0.12,
  });
  slide.addText("Imágenes Docker", {
    x: 5.4, y: 1.15, w: 4.0, h: 0.4,
    fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });

  const sw = [
    { lang: "C++", image: "gcc:13", flag: "-O0 -std=c++17" },
    { lang: "Go", image: "golang:1.22", flag: "go build" },
    { lang: "Java", image: "eclipse-temurin:21", flag: "javac + java" },
    { lang: "Python", image: "python:3.12-slim", flag: "CPython puro" },
  ];

  sw.forEach((s, i) => {
    const y = 1.7 + i * 0.75;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.4, y: y, w: 4.0, h: 0.6,
      fill: { color: WHITE }, rectRadius: 0.06,
    });
    slide.addText([
      { text: s.lang + "  ", options: { fontSize: 13, bold: true, color: NAVY } },
      { text: s.image + "\n", options: { fontSize: 11, color: DGRAY, fontFace: "Courier New" } },
      { text: s.flag, options: { fontSize: 9, color: GRAY } },
    ], {
      x: 5.55, y: y, w: 3.7, h: 0.6, isTextBox: true, margin: 0, valign: "middle",
    });
  });

  addFooter(slide, slideNum);

  slide.addNotes("Un notebook con i7-1255U y 16 GB de RAM corriendo Ubuntu. Cada lenguaje usa su imagen Docker oficial con versiones fijas: gcc 13 para C++, golang 1.22, eclipse-temurin 21 para Java, y python 3.12-slim. Esto asegura que cualquiera pueda replicar el experimento con el mismo entorno.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 19: Pipeline CSV
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Entorno" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Pipeline y formato CSV", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const pipeSteps = ["Docker Build", "Benchmark\nN=500,1000,1500", "Merge CSVs", "Análisis\nEstadístico"];
  pipeSteps.forEach((s, i) => {
    const x = 0.4 + i * 2.35;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.0, w: 2.15, h: 0.85,
      fill: { color: NAVY }, rectRadius: 0.08,
    });
    slide.addText(s, {
      x: x, y: 1.0, w: 2.15, h: 0.85,
      fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    if (i < pipeSteps.length - 1) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x + 2.2, y: 1.35, w: 0.1, h: 0.04, fill: { color: ORANGE },
      });
    }
  });

  // CSV example
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 2.2, w: 6.0, h: 2.4,
    fill: { color: LTBLUE }, rectRadius: 0.1,
  });

  slide.addText([
    { text: "language,N,repetition,time_seconds\n", options: { fontSize: 12, color: NAVY, bold: true, fontFace: "Courier New" } },
    { text: "cpp,500,1,2.051323\n", options: { fontSize: 12, color: DGRAY, fontFace: "Courier New" } },
    { text: "go,500,1,0.277601\n", options: { fontSize: 12, color: DGRAY, fontFace: "Courier New" } },
    { text: "java,500,1,0.216690\n", options: { fontSize: 12, color: DGRAY, fontFace: "Courier New" } },
    { text: "python,500,1,11.996717", options: { fontSize: 12, color: DGRAY, fontFace: "Courier New" } },
  ], {
    x: 0.6, y: 2.4, w: 5.6, h: 2.0, isTextBox: true, margin: 0,
  });

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 2.2, w: 2.8, h: 2.4,
    fill: { color: LTBLUE }, rectRadius: 0.1,
  });
  slide.addText([
    { text: "4 columnas\n\n", options: { fontSize: 14, bold: true, color: NAVY } },
    { text: "language – N –\nrepetition – time\n\n", options: { fontSize: 11, color: DGRAY } },
    { text: "120 observaciones\n", options: { fontSize: 13, bold: true, color: ORANGE } },
    { text: "4 × 3 × 10", options: { fontSize: 11, color: DGRAY } },
  ], {
    x: 7.0, y: 2.4, w: 2.4, h: 2.0, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Todo el flujo está automatizado con Snakemake: desde construir las imágenes Docker hasta generar el CSV consolidado. El formato de salida es simple: 4 columnas, 120 filas.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 20: Repositorio
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Entorno" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Repositorio GitHub y estructura", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  // Repo URL
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 1.0, w: 9.2, h: 0.5,
    fill: { color: NAVY }, rectRadius: 0.06,
  });
  slide.addText("github.com/jffp-alt/matrix-benchmark", {
    x: 0.6, y: 1.0, w: 8.8, h: 0.5,
    fontSize: 15, bold: true, color: WHITE, isTextBox: true, margin: 0, valign: "middle",
    fontFace: "Courier New",
  });

  // Tree
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 1.7, w: 4.4, h: 3.0,
    fill: { color: LTBLUE }, rectRadius: 0.1,
  });

  slide.addText([
    { text: "matrix-benchmark/\n", options: { fontSize: 11, color: NAVY, bold: true, fontFace: "Courier New" } },
    { text: "├─ README.md\n", options: { fontSize: 11, color: DGRAY, fontFace: "Courier New" } },
    { text: "├─ LICENSE (MIT)\n", options: { fontSize: 11, color: DGRAY, fontFace: "Courier New" } },
    { text: "├─ FAIR_datasheet.md\n", options: { fontSize: 11, color: DGRAY, fontFace: "Courier New" } },
    { text: "├─ Snakefile\n", options: { fontSize: 11, color: DGRAY, fontFace: "Courier New" } },
    { text: "├─ implementations/\n", options: { fontSize: 11, color: NAVY, fontFace: "Courier New" } },
    { text: "│   ├─ cpp/ go/ java/ python/\n", options: { fontSize: 11, color: GRAY, fontFace: "Courier New" } },
    { text: "├─ analysis/\n", options: { fontSize: 11, color: NAVY, fontFace: "Courier New" } },
    { text: "└─ results/", options: { fontSize: 11, color: NAVY, fontFace: "Courier New" } },
  ], {
    x: 0.6, y: 1.85, w: 4.0, h: 2.7, isTextBox: true, margin: 0,
  });

  // README content
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 1.7, w: 4.4, h: 3.0,
    fill: { color: LTBLUE }, rectRadius: 0.1,
  });

  slide.addText([
    { text: "README.md incluye\n\n", options: { fontSize: 14, bold: true, color: NAVY } },
    { text: "• Pregunta de investigación e hipótesis\n", options: { fontSize: 11, color: DGRAY } },
    { text: "• Variables y diseño experimental\n", options: { fontSize: 11, color: DGRAY } },
    { text: "• Instrucciones de reproducción\n", options: { fontSize: 11, color: DGRAY } },
    { text: "• Entorno de ejecución documentado\n", options: { fontSize: 11, color: DGRAY } },
    { text: "• Formato de resultados CSV\n", options: { fontSize: 11, color: DGRAY } },
    { text: "• Criterios ACM Artifact Review\n\n", options: { fontSize: 11, color: DGRAY } },
    { text: "Functional → Reusable → Available", options: { fontSize: 12, bold: true, color: ORANGE } },
  ], {
    x: 5.4, y: 1.85, w: 4.0, h: 2.7, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Todo el proyecto vive en GitHub. El README documenta el diseño experimental completo, las instrucciones de reproducción y el entorno. Seguimos el marco ACM Artifact Review and Badging para ir hacia los badges Functional, Reusable y Available.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 21: Section – Conclusiones
  // ═══════════════════════════════════════════════════════
  pres.addSection({ title: "Conclusiones" });
  slideNum++;
  slide = pres.addSlide({ masterName: "SECTION", sectionTitle: "Conclusiones" });

  slide.addImage({ path: LOGO, x: 4.2, y: 0.2, w: 1.6, h: 0.5 });

  slide.addText("05", {
    x: 0.5, y: 1.5, w: 2.0, h: 0.8,
    fontSize: 52, bold: true, color: ORANGE, isTextBox: true, margin: 0,
  });
  slide.addText("Conclusiones", {
    x: 0.5, y: 2.3, w: 8.0, h: 0.7,
    fontSize: 36, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  slide.addText("Hallazgos y criterios de reproducibilidad", {
    x: 0.5, y: 3.1, w: 8.0, h: 0.5,
    fontSize: 14, color: DGRAY, isTextBox: true, margin: 0,
  });

  addFooter(slide, slideNum);

  slide.addNotes("Llegamos a las conclusiones. Resumimos los hallazgos descriptivos y los próximos pasos hacia el análisis inferencial.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 22: Hallazgos principales
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Conclusiones" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Hallazgos principales", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  // Main statement
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 1.0, w: 9.2, h: 0.6,
    fill: { color: LTBLUE }, rectRadius: 0.08,
  });
  slide.addText("Descriptivamente se observan diferencias claras entre lenguajes", {
    x: 0.6, y: 1.0, w: 8.8, h: 0.6,
    fontSize: 14, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const findings = [
    "Go y Java son los más rápidos, sin diferencias apreciables entre ellos",
    "C++ sin optimizaciones (-O0) tiene rendimiento intermedio",
    "Python (CPython) es ~16x más lento que Go/Java para N=1500",
    "La brecha de rendimiento se amplifica con matrices más grandes",
  ];

  findings.forEach((f, i) => {
    const y = 1.85 + i * 0.7;
    slide.addShape(pres.shapes.OVAL, {
      x: 0.6, y: y + 0.08, w: 0.35, h: 0.35,
      fill: { color: ORANGE },
    });
    slide.addText(String(i + 1), {
      x: 0.6, y: y + 0.08, w: 0.35, h: 0.35,
      fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    slide.addText(f, {
      x: 1.15, y: y, w: 8.3, h: 0.5,
      fontSize: 13, color: DGRAY, isTextBox: true, margin: 0, valign: "middle",
    });
  });

  // Next steps box
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 4.1, w: 9.2, h: 0.8,
    fill: { color: PEACH }, rectRadius: 0.08,
  });
  slide.addText([
    { text: "Próximos pasos (Semana 4): ", options: { fontSize: 12, bold: true, color: ORANGE } },
    { text: "ANOVA de dos factores con interacción + Tukey HSD post-hoc para confirmar significancia estadística", options: { fontSize: 12, color: DGRAY } },
  ], {
    x: 0.6, y: 4.1, w: 8.8, h: 0.8, isTextBox: true, margin: 0, valign: "middle",
  });

  addFooter(slide, slideNum);

  slide.addNotes("Para cerrar: descriptivamente, Go y Java lideran, C++ sin optimizaciones queda en medio, y Python es consistentemente el más lento. Pero estas son observaciones descriptivas. Para poder afirmar que las diferencias son estadísticamente significativas necesitamos ANOVA de dos factores y Tukey HSD. Eso viene en Semana 4.");

  // ═══════════════════════════════════════════════════════
  // SLIDE 23: Criterios ACM
  // ═══════════════════════════════════════════════════════
  slideNum++;
  slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Conclusiones" });

  slide.addImage({ path: LOGO, x: 0.3, y: 0.15, w: 1.4, h: 0.45 });
  slide.addText("Criterios ACM Artifact", {
    x: 2.0, y: 0.15, w: 7.5, h: 0.55,
    fontSize: 24, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "middle",
  });

  const acmCards = [
    {
      title: "Functional",
      desc: "El código se ejecuta y\nproduce los resultados\ndocumentados",
    },
    {
      title: "Reusable",
      desc: "Docker + Snakemake\nSemilla fija\nDocumentación\ncompleta",
    },
    {
      title: "Available",
      desc: "GitHub público\nLicencia MIT\nZenodo (pendiente DOI)",
    },
  ];

  acmCards.forEach((c, i) => {
    const x = 0.4 + i * 3.15;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.1, w: 2.95, h: 2.8,
      fill: { color: LTBLUE }, rectRadius: 0.12,
    });
    // Title bar
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.15, y: 1.25, w: 2.65, h: 0.5,
      fill: { color: NAVY }, rectRadius: 0.06,
    });
    slide.addText(c.title, {
      x: x + 0.15, y: 1.25, w: 2.65, h: 0.5,
      fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    slide.addText(c.desc, {
      x: x + 0.25, y: 1.95, w: 2.45, h: 1.7,
      fontSize: 12, color: DGRAY, align: "center", isTextBox: true, margin: 0,
    });
  });

  // Repo link
  slide.addText("github.com/jffp-alt/matrix-benchmark", {
    x: 2.0, y: 4.2, w: 6.0, h: 0.4,
    fontSize: 13, color: NAVY, align: "center", isTextBox: true, margin: 0,
    fontFace: "Courier New",
  });

  addFooter(slide, slideNum);

  slide.addNotes("Finalmente, los criterios ACM. Functional: el código produce los resultados documentados. Reusable: Docker, Snakemake y semilla fija garantizan la reproducibilidad. Available: repositorio público con licencia MIT. El DOI de Zenodo viene en Semana 5. Gracias.");

  // ── Write ──
  const outPath = "/home/claude/matrix-benchmark/results/Semana2_Benchmark_Matrices.pptx";
  await pres.writeFile({ fileName: outPath });
  await applyTheme(outPath, THEME);
  console.log("Deck written to " + outPath);
})();
