var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatDollars = function(d) { return "$" + d3.format(",")(d);}

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatDollars);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 100)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Importing Data 
d3.csv("roomData.csv", function(error, data) {

  data.forEach(function(d) {
    d.entire = +d.entire;
  });

  var elements = Object.keys(data[0])
		.filter(function(d){
			return ((d != "neighborhood"));
		});
  var selection = elements[0];

  x.domain(data.map(function(d) { return d.neighborhood; }));
  y.domain([0, d3.max(data, function(d) { return d.entire; }) + 20]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll('.x.axis text')
          .attr('transform', 'rotate(-65)') 
          .attr('x', '-15px');
         // .attr('y', '4 px');
     

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("Average Price per Night");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.neighborhood); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(+d[selection]); })
      .attr("fill", function(d) { return "steelblue"; })
      
      .attr("height", function(d) { return height - y(+d[selection]); })
  
      .on("mouseover", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                var valueTest = d[selection.value];
                if (valueTest == undefined) {
                    tooltip.html(" Neighborhood: " + d.neighborhood + "<br/>" + " Average Price: $" + d.price).style("left", (d3.event.pageX ) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                } else {tooltip.html(" Neighborhood: " + d.neighborhood + "<br/>" + " Average Price: $" + d[selection.value]) 
                    .style("left", (d3.event.pageX ) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");}
                })
    .on("mouseout", function(d) {
                tooltip.transition()
                .duration(500)
                .style("opacity", 0)

    });
   
  d3.select("input").on("change", change);
    //console.log(d3.select("input").property("checked"));
  //if input is selected, unselect 
  
//  Animated sorting
  function change() {
    var x0 = x.domain(data.sort(this.checked
        ? function(a, b) { 
            //console.log(selection.value)
            if(selection.value == undefined ) {
                return b.price - a.price;
            } else {
                return +b[selection.value] - +a[selection.value];
            } 
        }
        : function(a, b) { return d3.ascending(a.neighborhood, b.neighborhood); })
        .map(function(d) { return d.neighborhood; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.neighborhood) - x0(b.neighborhood); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.neighborhood); });

    transition.select(".x.axis")
        .call(xAxis)
        .selectAll('.x.axis text') 
            .attr('x', '-15px')   
            .attr('y', '4 px')
      .selectAll("g")
        .delay(delay);  
        //console.log(d3.select("input").property("checked"));   
  }
 
  // Dropdown menu 
  var selector = d3.select("#drop")
    	.append("select")
        .attr("id","dropdown")
        
    	.on("change", function(d){
        	selection = document.getElementById("dropdown");

        	// y.domain([0, d3.max(data, function(d){
			// 	return +d[selection.value];})]);

        	// yAxis.scale(y);
            d3.select("input").property("checked",false);
        	d3.selectAll(".bar")
           		.transition()
	            .attr("height", function(d){
					return height - y(+d[selection.value]);
				})
				.attr("y", function(d){
					return y(+d[selection.value]);
                })
                //console.log(selection.value)
                .attr("fill", function(d) {
                if (selection.value == "price") {
                    return "steelblue";
                } else if (selection.value == "entire") {
                    return "plum";
                } else if (selection.value == "private") {
                    return "seagreen";
                } else { 
                    return "tomato";
                }
                })
           		.ease("linear")
           		.select("title")
           		.text(function(d){
           			return d.State + " : " + d[selection.value];
                });
                   
         	d3.selectAll("g.y.axis")
           		.transition()
                   .call(yAxis);

         });

    selector.selectAll("option")
      .data(elements)
      .enter().append("option")
      .attr("value", function(d){
          //console.log(d)
        return d;
      })
      .text(function(d){
        //return d;
        if (d == "price") {
            return "Overall Averages";
        } else if (d == "shared") {
            return "Shared Room";
        } else if (d == "entire") {
            return "Entire House/Appt"
        } else { return "Private Room" }
      })
});