d3.csv("dataset/top_studios.csv", (r) => {
    return {
      studio: r['Studio'],
      count: Number(r['0']),
    };
  }).then(function (data) {
    console.log(data)

    const merged = data.filter(d => d.count === 1)
      .reduce((acc, obj) => {
        acc.count += obj.count 
        return acc; 
      }, {count: 0, studio: 'Others'})
    console.log(merged)

    data = data.filter(d => d.count > 1)
    data.unshift(merged)
    console.log(data)

    const width = 1280;
    const height = Math.min(width, 960);
    const radius = Math.min(width, height) / 2;
  
    const arc = d3.arc()
        .innerRadius(radius * 0.67)
        .outerRadius(radius - 1);
  
    const pie = d3.pie()
        .padAngle(1 / radius)
        .sort(null)
        .value(d => d.count);
  
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.studio))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
  
    const svg = d3.select('#chart')
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");
  
    svg.append("g")
      .selectAll()
      .data(pie(data))
      .join("path")
        .attr("fill", d => color(d.data.studio))
        .attr("d", arc)
      .append("title")
        .text(d => `${d.data.studio}: ${d.data.count.toLocaleString()}`);
  
    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
      .selectAll()
      .data(pie(data))
      .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.studio))
        .call(text => text.filter(d => (d.endAngle - d.startAngle)).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.count.toLocaleString("en-US")));
  });
  