/**
 * Computes per-file and repo-wide metrics
 */
export const computeMetrics = (parsedFiles) => {
  const perFile = new Map();
  const importMap = new Map(); // How many times each file is imported

  // First pass: basic metrics and build import map
  parsedFiles.forEach(file => {
    const metrics = {
      loc: file.loc,
      importCount: file.imports.length,
      exportCount: file.exports.length,
      functionCount: file.functions.length + file.classes.length,
      couplingScore: 0, // Will be updated in second pass
      complexityScore: 0
    };
    perFile.set(file.path, metrics);

    // Track imports for coupling
    file.imports.forEach(imp => {
      // Normalize import path (very basic normalization)
      const normalized = imp.replace(/^(\.\/|\.\.\/)+/, '');
      importMap.set(normalized, (importMap.get(normalized) || 0) + 1);
    });
  });

  // Second pass: compute coupling and complexity
  let totalLOC = 0;
  let totalComplexity = 0;
  const hotspots = [];

  parsedFiles.forEach(file => {
    const metrics = perFile.get(file.path);
    
    // Find coupling by checking if this file is imported by others
    // We check if any import in the map matches the end of this file's path
    let coupling = 0;
    for (const [imp, count] of importMap.entries()) {
      if (file.path.endsWith(imp) || imp.includes(file.path.split('/').pop())) {
        coupling += count;
      }
    }
    metrics.couplingScore = coupling;

    // Complexity formula: (loc / 50) + (importCount * 2) + (functionCount * 1.5) + (couplingScore * 3)
    const rawComplexity = (metrics.loc / 50) + (metrics.importCount * 2) + (metrics.functionCount * 1.5) + (metrics.couplingScore * 3);
    metrics.complexityScore = Math.min(100, Math.round(rawComplexity));

    metrics.isHotspot = metrics.complexityScore > 60 || metrics.loc > 300 || metrics.importCount > 15;
    
    if (metrics.isHotspot) {
      hotspots.push({ path: file.path, score: metrics.complexityScore });
    }

    totalLOC += metrics.loc;
    totalComplexity += metrics.complexityScore;
  });

  const avgComplexity = parsedFiles.length > 0 ? Math.round(totalComplexity / parsedFiles.length) : 0;

  // Language detection summary
  const topLanguages = {};
  parsedFiles.forEach(f => {
    const ext = f.path.split('.').pop();
    topLanguages[ext] = (topLanguages[ext] || 0) + 1;
  });

  return {
    perFile: Object.fromEntries(perFile),
    repoSummary: {
      totalFiles: parsedFiles.length,
      totalLOC,
      avgComplexity,
      topLanguages,
      hotspotCount: hotspots.length,
      hotspots: hotspots.sort((a, b) => b.score - a.score).slice(0, 10)
    }
  };
};
