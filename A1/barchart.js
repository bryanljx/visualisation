d3.csv("dataset/top100_genres.csv", (r) => {
    return {
      genre: r['Genre'],
      count: Number(r['0']),
    };
  }).then(function (data) {

    function mergeObjects(arr) {
        const mergedObjects = {};
    
        arr.forEach(obj => {
            const key = obj.genre;
            if (!mergedObjects[key]) {
                mergedObjects[key] = { genre: key, count: 0 };
            }
            mergedObjects[key].count += obj.count;
        });
    
        return Object.values(mergedObjects);
    }
  
    genres = mergeObjects(data);
    genres.sort((a,b) => d3.descending(a.count,b.count))
    console.log(genres);
  
    const barHeight = 25;
    const marginTop = 30;
    const marginRight = 100;
    const marginBottom = 10;
    const marginLeft = 160;
  
    const width = 1280;
    const height =
      Math.ceil((genres.length + 0.1) * barHeight) + marginTop + marginBottom;
  
    // Create the scales.
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(genres, (d) => d.count)])
      .range([marginLeft, width - marginRight])
      .nice();

    const y = d3
      .scaleBand()
      .domain(genres.map((d) => d.genre))
      .rangeRound([marginTop, height])
      .padding(0.15);
  
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    svg
      .append('g')
      .attr("fill", "steelblue")
      .selectAll(".bar")
      .data(genres)
      .enter()
      .append('rect')
      .classed('bar', true)
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.count) - marginLeft)
      .attr("x", d => x(0))
      .attr("y", d => y(d.genre));
  
    svg
      .append('g')
      .selectAll('.label')
      .data(genres)
      .enter()
      .append('text')
      .text(d => d.count.toLocaleString())
      .attr('y', d => y(d.genre) + y.bandwidth() / 2)
      .attr('x', d => x(d.count) + 10)
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
  