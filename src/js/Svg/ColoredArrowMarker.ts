// todo: replace any here with actual type
function arrowColoredMarkerClosure(svgDefs: any) {
  const usedColors = new Set();

  return (color: string) => {
    const colorWithoutHash = color.replace("#", "");
    if (!usedColors.has(color)) {
      svgDefs
        .append("svg:marker")
        .attr("id", "arrowColoredMarker" + colorWithoutHash)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .style("fill", color);
      usedColors.add(color);
    }
    return `url(#arrowColoredMarker${colorWithoutHash})`;
  };
}
