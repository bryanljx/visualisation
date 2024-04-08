d3.csv("dataset/gdp.csv", (r) => {
  return {
    country: r.country,
    region: r.state,
    year: Number(r.year),
    gdp: Math.round(Number(r.gdp) / 1000000),
  };
}).then(function (data) {
  console.log(data);

  const t = data.map(d => d.gdp);
  console.log(
    d3.quantile(t, .25),
    d3.quantile(t, .5),
    d3.quantile(t, .75)
  )

  const tmp = data.map((d) => {
    return {
      ...d,
      region: "All Regions",
    };
  });

  data.push(...tmp);
  const groupedData = d3.group(data, (d) => d.region);

  console.log(groupedData.get("America"));

  const stats = d3.rollups(
    data,
    (g) => {
      // for each region, calc IQR,q1,q2,q3,mean,IQR*1.5
      const gdp = g.map((c) => c.gdp);

      const min = gdp[gdp.length - 1];
      const max = gdp[0];
      const q1 = d3.quantile(gdp, 0.25);
      const q2 = d3.quantile(gdp, 0.5);
      const q3 = d3.quantile(gdp, 0.75);
      const iqr = q3 - q1; // interquartile range
      const r0 = Math.max(min, q1 - iqr * 1.5);
      const r1 = Math.min(max, q3 + iqr * 1.5);

      const quartiles = [q1, q2, q3];
      const range = [r0, r1];
      const outliers = g.filter(
        (country) => country.gdp < r0 || country.gdp > r1
      );

      const stat = {
        quartiles: quartiles,
        range: range,
        outliers: outliers,
        minmax: [min, max],
      };

      return stat;
    },
    (d) => d.region
  );

  console.log(stats);

  // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 100;

  // Prepare the positional scales.
  const x = d3
    .scaleBand()
    .domain(stats.map((s) => s[0]))
    .rangeRound([marginLeft, width - marginRight])
    .padding(0.3);

  const y = d3
  .scaleLinear()
  .domain([
    d3.min(stats, (s) => s[1].range[0]),
    d3.max(stats, (s) => s[1].range[1]),
  ])
  .nice()
  .range([height - marginBottom, marginTop]);

  // Create the SVG container.
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
    .attr("text-anchor", "middle");

  // Create a visual representation for each bin.
  const g = svg.append("g").selectAll("g").data(stats).join("g");

  // Range.
  g.append("path")
    .attr("stroke", "currentColor")
    .attr("d", (d) => {
      // draw range line
      let path = d3.path();
      path.moveTo(x(d[0]) + x.bandwidth() / 2, y(d[1].range[1]));
      path.lineTo(x(d[0]) + x.bandwidth() / 2, y(d[1].range[0]));

      return path;
    });

  // Tooltip 
  var tip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

  // Quartiles.
  g.append("path")
    .attr("fill", "#ddd")
    .attr("d", (d) => {
      // draw box
      let path = d3.path();
      path.moveTo(x(d[0]), y(d[1].quartiles[2]));
      path.lineTo(x(d[0]) + x.bandwidth(), y(d[1].quartiles[2]));
      path.lineTo(x(d[0]) + x.bandwidth(), y(d[1].quartiles[0]));
      path.lineTo(x(d[0]), y(d[1].quartiles[0]));
      path.closePath();

      return path;
    })
    .on('mouseover', (e, d) => {
      console.log(d[1])
      tip.style('opacity', 1)
        .html(
          `
            Low: ${d[1].minmax[0].toLocaleString()}, High: ${d[1].minmax[1].toLocaleString()}</br>
            </br>
            Lower Quartile: ${d[1].quartiles[0].toLocaleString()}</br>
            Median: ${d[1].quartiles[1].toLocaleString()}</br>
            Upper Quartile: ${d[1].quartiles[2].toLocaleString()}</br></br>
            Num of Outliers: ${d[1].outliers.length}</br>
          `
        )
        .style("left", (e.screenX-50) + "px")
        .style("top", (e.screenY-100) + "px")
    })
    .on('mouseout', e => {
      tip.style('opacity', 0)
    });

  // Median.
  g.append("path")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 2)
    .attr("d", (d) => {
      // draw median line
      let path = d3.path();
      path.moveTo(x(d[0]), y(d[1].quartiles[1]));
      path.lineTo(x(d[0]) + x.bandwidth(), y(d[1].quartiles[1]));
      return path;
    });

  // Outliers, with a bit of jitter.
  // g.append("g")
  //   .attr("fill", "currentColor")
  //   .attr("fill-opacity", 0.2)
  //   .attr("stroke", "none")
  //   .attr("transform", (d) => `translate(${x(d[0]) + x.bandwidth() / 2},0)`)
  //   .selectAll("circle")
  //   .data((d) => d[1].outliers)
  //   .join("circle")
  //   .attr("r", 2)
  //   .attr("cx", () => (Math.random() - 0.5) * 4)
  //   .attr("cy", (d) => y(d.gdp));

  // Append the x axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  // Append the y axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
});
