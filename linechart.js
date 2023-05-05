var resultArray, result;

document.body.onmousemove = function (e) {
  document.documentElement.style.setProperty(
    "--x",
    e.clientX + window.scrollX + "px"
  );
  document.documentElement.style.setProperty(
    "--y",
    e.clientY + window.scrollY + "px"
  );
};

d3.csv("./data/tv_shows.csv")
  .then(function (data) {
    var huluData = data.filter(function (d) {
      return d.Hulu !== "0" && +d.Year > 1989;
    });

    var primeData = data.filter(function (d) {
      return d["Prime Video"] !== "0" && +d.Year > 1989;
    });

    var huluDataByAge = d3.group(huluData, function (d) {
      return d.Age;
    });

    var primeDataByAge = d3.group(primeData, function (d) {
      return d.Age;
    });

    // Convert huluDataByAge and primeDataByAge to arrays for further data manipulation
    var huluDataByAgeArray = Array.from(huluDataByAge, function ([key, value]) {
      return { Age: key, data: value };
    });

    var primeDataByAgeArray = Array.from(
      primeDataByAge,
      function ([key, value]) {
        return { Age: key, data: value };
      }
    );

    console.log(huluData, primeData, huluDataByAge, primeDataByAge);

    // Group huluDataByAgeArray by "Age" and calculate the count
    var huluDataByAgeCount = huluDataByAgeArray.map(function (d) {
      return { Age: d.Age, count: d.data.length };
    });

    var primeDataByAgeCount = primeDataByAgeArray.map(function (d) {
      return { Age: d.Age, count: d.data.length };
    });

    var platformByAgeCount = [
      {
        group: "Hulu",
        ...huluDataByAgeCount.reduce(function (acc, curr) {
          acc[curr.Age] = curr.count;
          return acc;
        }, {}),
      },
      {
        group: "Prime Video",
        ...primeDataByAgeCount.reduce(function (acc, curr) {
          acc[curr.Age] = curr.count;
          return acc;
        }, {}),
      },
    ];

    console.log(platformByAgeCount);

    // Group huluDataByAgeArray by "Age" and calculate the count
    var huluDataByAgeCount = huluDataByAgeArray.map(function (d) {
      return { Age: d.Age, count: d.data.length };
    });

    // Group primeDataByAgeArray by "Age" and calculate the count
    var primeDataByAgeCount = primeDataByAgeArray.map(function (d) {
      return { Age: d.Age, count: d.data.length };
    });

    // Get all unique ages from both Hulu and Prime Video
    var allAges = [
      ...new Set([
        ...huluDataByAgeCount.map(function (d) {
          return d.Age;
        }),
        ...primeDataByAgeCount.map(function (d) {
          return d.Age;
        }),
      ]),
    ];

    // Create an object to store age and count for Hulu and Prime Video
    var ageByPlatformsCount = allAges.map(function (age) {
      var huluCount =
        huluDataByAgeCount.find(function (d) {
          return d.Age === age;
        })?.count || 0;
      var primeCount =
        primeDataByAgeCount.find(function (d) {
          return d.Age === age;
        })?.count || 0;
      return { Age: age, Hulu: huluCount, "Prime Video": primeCount };
    });

    console.log(ageByPlatformsCount);

    // Calculate the mean of IMDb ratings for Hulu
    var huluRatings = huluData.map(function (d) {
      return parseFloat(d.IMDb.split("/")[0]); // Assuming IMDb ratings are in format "X/Y"
    });
    var huluMeanRating = d3.mean(huluRatings);

    // Calculate the mean of IMDb ratings for Prime Video
    var primeRatings = primeData.map(function (d) {
      return parseFloat(d.IMDb.split("/")[0]); // Assuming IMDb ratings are in format "X/Y"
    });
    var primeMeanRating = d3.mean(primeRatings);

    // Store the results in an object
    var meanIMDbRatings = {
      hulu: huluMeanRating,
      prime: primeMeanRating,
    };

    console.log("meanIMDbRatings", meanIMDbRatings);

    // Calculate mean of Rotten Tomatoes ratings for Hulu
    var huluRatingsMean = d3.mean(huluData, function (d) {
      return +d["Rotten Tomatoes"].split("/")[0];
    });

    // Calculate mean of Rotten Tomatoes ratings for Prime Video
    var primeRatingsMean = d3.mean(primeData, function (d) {
      return +d["Rotten Tomatoes"].split("/")[0];
    });

    // Store means in an object
    var ratingsMeans = {
      hulu: huluRatingsMean,
      prime: primeRatingsMean,
    };

    console.log("ren tomatoes ratingsMeans", ratingsMeans); // Print the object to console

    // Calculate count of Hulu ratings by year
    var huluRatingsCountByYear = d3.rollup(
      huluData,
      function (v) {
        return v.length;
      },
      function (d) {
        return d.Year;
      }
    );

    // Calculate count of Prime Video ratings by year
    var primeRatingsCountByYear = d3.rollup(
      primeData,
      function (v) {
        return v.length;
      },
      function (d) {
        return d.Year;
      }
    );

    // Store counts in an object with sorted years
    var ratingsCountsByYear = {
      hulu: new Map([...huluRatingsCountByYear].sort()),
      prime: new Map([...primeRatingsCountByYear].sort()),
    };

    console.log("ratingsCountsByYear", ratingsCountsByYear); // Print the object to console

    // Function to calculate diversity index
    function calculateDiversityIndex(data, columnName) {
      var columnValues = data.map(function (d) {
        return parseFloat(d[columnName]);
      });

      var uniqueValues = [...new Set(columnValues)];
      var frequencyCounts = uniqueValues.map(function (value) {
        return columnValues.filter(function (d) {
          return d === value;
        }).length;
      });

      var total = d3.sum(frequencyCounts);
      var probabilities = frequencyCounts.map(function (count) {
        return count / total;
      });

      var diversityIndex =
        1 -
        d3.sum(
          probabilities.map(function (p) {
            return p * p;
          })
        );

      return diversityIndex;
    }

    // Calculate diversity index for each column
    var diversityIndexHulu = {
      Year: calculateDiversityIndex(huluData, "Year"),
      Age: calculateDiversityIndex(huluData, "Age"),
      IMDb: calculateDiversityIndex(huluData, "IMDb"),
      "Rotten Tomatoes": calculateDiversityIndex(huluData, "Rotten Tomatoes"),
    };

    var diversityIndexPrime = {
      Year: calculateDiversityIndex(primeData, "Year"),
      Age: calculateDiversityIndex(primeData, "Age"),
      IMDb: calculateDiversityIndex(primeData, "IMDb"),
      "Rotten Tomatoes": calculateDiversityIndex(primeData, "Rotten Tomatoes"),
    };

    // Store diversity index in an object
    var diversityIndex = {
      Hulu: diversityIndexHulu,
      Prime: diversityIndexPrime,
    };

    console.log(diversityIndex);

    // -------------------------------------------------------------------

    // Define the dimensions of the chart
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = innerWidth / 2 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Create an SVG container
    var svg = d3
      .select("#prime")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define the x and y scales
    var xScale = d3.scaleBand().range([0, width]).padding(0.1);

    var yScale = d3.scaleLinear().range([height, 0]);

    // Define the line generator
    var line = d3
      .line()
      .x(function (d) {
        return xScale(d[0]);
      })
      .y(function (d) {
        return yScale(d[1]);
      });

    // Get the data for Hulu and Prime Video
    var huluData = Array.from(ratingsCountsByYear.hulu);
    var primeData = Array.from(ratingsCountsByYear.prime);

    // Extract the years for the x-axis domain
    var years = huluData.map(function (d) {
      return d[0];
    });

    // Set the domains of the x and y scales
    xScale.domain(years);
    yScale.domain([
      0,
      d3.max(huluData.concat(primeData), function (d) {
        return d[1];
      }),
    ]);

    // Add x-axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).tickFormat((d) => "'" + String(d).slice(-2)));

    // // Add y-axis
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    // Add Hulu line
    svg
      .append("path")
      .datum(huluData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "rgb(28, 231, 131)")
      .attr("stroke-width", 5)
      .attr("d", line);

    // Add Prime Video line
    svg
      .append("path")
      .datum(primeData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "rgb(0, 168, 225)")
      .attr("stroke-width", 5)
      .attr("d", line);

    // Add x-axis label
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .text("Year");

    // Add y-axis label
    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", -margin.left * 4)
      .attr("y", -margin.left + 5)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Counts");

    // Add legend
    svg
      .append("text")
      .attr("class", "legend")
      .attr("x", width - 80)
      .attr("y", 10)
      .attr("fill", "#1ce783")
      .text("Hulu");

    // Add legend for Prime Video line
    svg
      .append("text")
      .attr("class", "legend")
      .attr("x", width - 80)
      .attr("y", 30)
      .attr("fill", "#00A8E1")
      .text("Prime Video");

    // Define the line generators for Hulu and Prime Video lines
    const lineHulu = d3
      .line()
      .x((d) => xScale(d.Year))
      .y((d) => yScale(d.Hulu))
      .curve(d3.curveMonotoneX);

    const linePrime = d3
      .line()
      .x((d) => xScale(d.Year))
      .y((d) => yScale(d["Prime Video"]))
      .curve(d3.curveMonotoneX);

    // Animate the lines
    d3.selectAll(".line")
      .attr("stroke-dasharray", function () {
        return this.getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(2000)
  .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // -------------------------------------------------------------------

    // Create SVG container
    var svgHulu = d3
      .select("#hulu")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Data transformation
    var columns = Object.keys(diversityIndex["Hulu"]);
    var groups = Object.keys(diversityIndex);
    var dataset = columns.map(function (column) {
      return {
        column: column,
        values: groups.map(function (group) {
          return { group: group, value: diversityIndex[group][column] };
        }),
      };
    });

    // Scales
    var xScale1 = d3.scaleBand().domain(columns).range([0, width]).padding(0.2);

    var yScale1 = d3
      .scaleLinear()
      .domain([
        0.6,
        d3.max(dataset, function (d) {
          return d3.max(d.values, function (v) {
            return v.value;
          });
        }),
      ])
      .range([height, 0]);

    // Create y-axis generator with tickSizeInner for grid lines
    var yAxis = d3.axisLeft(yScale1).tickSizeInner(-width).tickFormat(""); // Empty tick labels

    // Append y-axis grid to the SVG
    svgHulu
      .append("g")
      .attr("class", "y-axis-grid")
      .call(yAxis)
      .selectAll("line") // Select all the grid lines
      .style("stroke", "rgb(28, 231, 131)") // Set the stroke color to grey
      .style("stroke-opacity", 0.2); // Set the stroke opacity to 0.5

    // Colors
    var color = d3
      .scaleOrdinal()
      .domain(groups)
      .range(["rgb(28, 231, 131)", "#0077c1"]);

    // Select all the bars
    var bars = svgHulu
      .selectAll(".bar")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function (d) {
        return "translate(" + xScale1(d.column) + ",0)";
      });

    // Draw the initial bars
    bars
      .selectAll("rect")
      .data(function (d) {
        return d.values;
      })
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return (xScale1.bandwidth() / groups.length) * groups.indexOf(d.group);
      })
      .attr("width", xScale1.bandwidth() / groups.length)
      .attr("y", height) // Set initial height to the bottom of the chart
      .attr("height", 0) // Set initial height to 0
      .attr("fill", function (d) {
        return color(d.group);
      })
      .attr("rx", 5) // Set border radius for top left corner
      .attr("ry", 5) // Set border radius for top right corner
      .transition() // Add transition effect
      .duration(1000) // Set duration for the transition
      .attr("y", function (d) {
        return yScale1(d.value);
      })
      .attr("height", function (d) {
        return height - yScale1(d.value);
      });

    // Draw x-axis
    svgHulu
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale1));

    // Draw y-axis
    svgHulu.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale1));

    // Draw legend
    var legend = svgHulu
      .selectAll(".legend")
      .data(groups)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("fill", "#fff")
      .style("text-anchor", "end")
      .text(function (d) {
        return d;
      });

    document
      .getElementById("animateBtn")
      .addEventListener("click", function () {
        d3.selectAll(".line")
          .attr("stroke-dasharray", function () {
            return this.getTotalLength();
          })
          .attr("stroke-dashoffset", function () {
            return this.getTotalLength();
          })
          .transition()
          .duration(2000)
          .attr("stroke-dashoffset", 0);
      });
  })
  .catch(function (error) {
    console.error("Error loading CSV file:", error);
  });
