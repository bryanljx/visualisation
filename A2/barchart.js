d3.csv("dataset/gdp.csv", (r) => {
  return {
    country: r.country,
    region: r.state,
    year: Number(r.year),
    gdp: Math.round(Number(r.gdp) / 1000000),
  };
}).then(function (data) {
  console.log(data);

  const barHeight = 25;
  const marginTop = 30;
  const marginRight = 100;
  const marginBottom = 10;
  const marginLeft = 160;

  const width = 1280;
  const height =
    Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

  // Create the scales.
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.gdp)])
    .range([marginLeft, width - marginRight])
    .nice();

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.country))
    .rangeRound([marginTop, height - marginBottom])
    .padding(0.15);

  const svg = d3
    .select("#barchart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append('g')
    .attr("fill", "steelblue")
    .selectAll(".bar")
    .data(data)
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.gdp) - marginLeft)
    .attr("x", d => x(0))
    .attr("y", d => y(d.country));

  svg
    .append('g')
    .selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .text(d => d.gdp.toLocaleString())
    .attr('y', d => y(d.country) + y.bandwidth() / 2)
    .attr('x', d => x(d.gdp) + 10)
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '12px')
    .classed('label', true);

    svg.append('g')
        .call(d3.axisLeft(y))
        .attr('transform', `translate(${marginLeft}, 0)`);

    svg.append('g')
        .call(d3.axisTop(x))
        .attr('transform', `translate(0, ${marginTop})`);
});
