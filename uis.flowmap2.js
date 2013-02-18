
var w = window.innerWidth;        //width of the svg image
var h = window.innerWidth/900*460;        //hight of the svg
var centerX = (w)/2;    //center screen of the svg X
var centerY = (h-50)/2;    //center screen of the svg Y

var originColor = "#834f67";
var destCountryColor = "#315441";//"#71ac8d";

var countrySelection = [
{"id":"AUS","color":"red","val":"254"},
{"id":"FRA","color":"blue","val":"7425"},
{"id":"AFG","color":"green","val":"12"}
];

d3.geo.regular = function () {
	var scale = 1, translate = [0, -50];
	function regular(coordinates) {
		var x = coordinates[0] / 360, y = -coordinates[1] / 360;
		return [scale * x + translate[0], scale * Math.max(-.5, Math.min(.5, y)) + translate[1]];
	}
	regular.invert = function (coordinates) {
		var x = (coordinates[0] - translate[0]) / scale, y = (coordinates[1] - translate[1]) / scale;
		return [360 * x, 2 * Math.atan(Math.exp(-360 * y * d3_geo_radians)) / d3_geo_radians - 90];
	};
	regular.scale = function (x) {
		if (!arguments.length) return scale;
		scale = +x;
		return regular;
	};
	regular.translate = function (x) {
		if (!arguments.length) return translate;
		translate = [+x[0], +x[1]];
		return regular;
	};
	return regular;
};

var projection = d3.geo.regular()
    .scale(w)
    .translate([centerX, centerY]);

var path = d3.geo.path()
	.projection(projection);
/*
var zoom = d3.behavior.zoom()
	.translate(projection.translate())
	.scale(projection.scale())
	.scaleExtent([2*h, 24 * h])
	.on("zoom", zoom);

function zoom() {
  projection.translate(d3.event.translate)
	.scale(d3.event.scale);
  countries.selectAll("path")
	.attr("d", path);
}
*/

var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h);
//    .call(zoom)

	var cColors = {};
	var cValues = {};

	countrySelection.forEach(function(d){
		cColors[d.id] = +d.color;
		cValues[d.id] = +d.val;
	})

	svg.append("g")
			.attr("class", "countries")
		.selectAll("path")
			.data(world_countries.features)
		.enter().append("path")
//			.attr("class", function(d) { return quantize(rateById[d.id]); })
			.attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
      .attr("class", "states")
      .attr("d", path);



d3.json("world_countries.json", function(json) {
	countries.selectAll("path")
		.data(json.features)
		.enter().append("path")
			.attr("svg:name", function (d) {return d.properties.name;})
			.attr("id", function (d) {return d.id;})
			.attr("d", path)
			.append("title").text(function (d) {return d.properties.name;})
//			.on("click", click);
			
	d3.select("path#AUS").style("fill","green");[]
});
/*
function click(d) {
	var centroid = path.centroid(d),
		translate = projection.translate();
	
	projection.translate([
		translate[0] - centroid[0] + w / 2,
		translate[1] - centroid[1] + h / 2
	]);
	
	zoom.translate(projection.translate());
	
	countries.selectAll("path").transition()
		.duration(1000)
		.attr("d", path);
}

function highlightC(countryId){
	d3.select("path#"+countryId).style("fill","green");
	if (Hcolor){
		d3.selectAll(countryId).style("fill", Hcolor);	
	}	
}
*/