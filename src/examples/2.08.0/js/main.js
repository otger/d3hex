/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/
var chart = d3.select('#chart-area')
            .append("svg:svg")
            .attr("id", "chart")
            .attr("width", 300)
            .attr("height", 400);


function add_rect(svg, x, y, width, height, color="blue"){
    var rect = svg.append("rect");
    rect.attr("width", width)
    .attr("height", height)
    .attr("x", x)
    .attr("y", y)
    .attr("fill", color);
}

add_rect(chart, 10, 0, 15, 119);