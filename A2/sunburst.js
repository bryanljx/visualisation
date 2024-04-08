function autoBox() {
  document.body.appendChild(this);
  const {x, y, width, height} = this.getBBox();
  document.body.removeChild(this);
  console.log([x,y,width,height])
  console.log(0 + ' ' + 0 + ' ' + width + ' ' + height)
  return x + ' ' + y + ' ' + width + ' ' + height;
} 

d3.csv("dataset/gdp.csv", (r) => {
  return {
    country: r.country,
    region: r.state,
    year: Number(r.year),
    gdp: Math.round(Number(r.gdp) / 1000000),
  };
}).then(function (data) {
  console.log(data);
  
  // Prepare data for d3 straify and hierarchy
  regions = Array.from(new Set(data.map(d => d.region)));
  for (let i = 0; i < regions.length; i++) {
    data.push({
      country: regions[i],
      region: "Global",
    })
  }

  data.push({country: 'Global', region:''});

  const tmp = d3.stratify()
    .id(d => d.country)
    .parentId(d => d.region)(data);

  // Specify the chart’s colors and approximate radius (it will be adjusted at the end).
  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, 6)
  );
  const radius = 928 / 2;

  // Prepare the layout.
  const partition = (data) =>
    d3.partition().size([2 * Math.PI, radius])(
      d3
        .hierarchy(tmp)
        .sum((d) => d.data.gdp)
        .sort((a, b) => b.gdp - a.gdp)
    );

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  const root = partition(data);
  console.log(root);

  const width = 1280;
  const height = 960;
  // Create the SVG container.
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", '-650 -500 ' + width + ' ' + height);

  // Add an arc for each element, with a title for tooltips.
  const format = d3.format(",d");
  svg
    .append("g")
    .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(root.descendants().filter((d) => d.depth))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      console.log(d)
      console.log(color(d.value))
      return color(d.value);
    })
    .attr("d", arc)
    .append("title")
    .text(
      (d) => `${d
        .ancestors()
        .map((d) => d.data.data.country)
        .reverse()
        .join("/")}\n${format(d.value)}`
    );

  // Add a label for each element.
  svg
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(
      root
        .descendants()
        .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
    )
    .join("text")
    .attr("transform", function (d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr("dy", "0.35em")
    .text((d) => d.data.data.country);

  // The autoBox function adjusts the SVG’s viewBox to the dimensions of its contents.
  // svg.attr("viewBox", autoBox);
});
