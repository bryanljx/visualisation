d3.csv("dataset/genre_per_year.csv", (r) => {
    return {
      year: Number(r['Release_year']),
      genre: r['Tags'],
      count: Number(r['0']),
    };
  }).then(function (data) {

    function mergeObjects(arr) {
        const mergedObjects = {};

        let minYear;
        let maxYear;
        let minCount;
        let maxCount;
    
        arr.forEach(obj => {
            const key = obj.genre;
            if (!mergedObjects[key]) {
                mergedObjects[key] = {};
            }

            if (!mergedObjects[key][obj.year]) {
              mergedObjects[key][obj.year] = 0;
            }

            mergedObjects[key][obj.year] += obj.count;

            minYear = minYear <= obj.year ? minYear : obj.year;
            maxYear= maxYear >= obj.year ? maxYear : obj.year;
            minCount = minCount <= mergedObjects[key][obj.year]
              ? minCount 
              : mergedObjects[key][obj.year];
            maxCount = maxCount >= mergedObjects[key][obj.year]
              ? maxCount
              : mergedObjects[key][obj.year];
        });
    
        return {
          genres: mergedObjects,
          year: [minYear, maxYear],
          count: [minCount, maxCount]
        }
    }
  
    data = mergeObjects(data);
    console.log(data);
  
  // Declare the chart dimensions and margins.
  const width = 928;
  const height = 500;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 20;
  const marginLeft = 40;

  // Create the scales.
  const x = d3
  .scaleLinear()
  .domain([2000, data.year[1]])
  .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([data.count[1], 0])
    .range([marginTop, height - marginBottom])
    .nice();

  // Create the SVG container.
  const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  // Add the x-axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("Count per genre"));

  // Append a path for each line
  genres = [
    "Drama",
    "Action",
    "Shounen",
    "Fantasy",
    "Comedy",
    "Violence",
    "Supernatural",
    "Adventure",
    "Mature Themes",
    "Romance", 
  ]

  const colors = new Map([
    ["Drama", '#FF0000'],        // Red
    ["Action", '#0000FF'],       // Blue
    ["Shounen", '#00FF00'],      // Green
    ["Fantasy", '#FFA500'],      // Orange
    ["Comedy", '#800080'],       // Purple
    ["Violence", '#FFFF00'],     // Yellow
    ["Supernatural", '#00FFFF'], // Cyan
    ["Adventure", '#FF00FF'],    // Magenta
    ["Mature Themes", '#008080'],// Teal
    ["Romance", '#800000']       // Maroon
  ]);

  genres.forEach(g => {
    counts = data.genres[g]
    yearCount = []

    for (let i = 2000; i <= 2022; i++) {
      yearCount.push([x(i), y(counts[i] ?? 0)])
    }

    const line = d3.line()(yearCount);

    svg.append("path")
    .attr("fill", "none")
    .attr("stroke", colors.get(g))
    .attr("stroke-width", 1.5)
    .attr("d", line);
  })
});
  