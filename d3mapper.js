
var w = window.innerWidth;        //width of the svg image
var h = window.innerWidth/2;        //hight of the svg
var centerX = (w)/2;    //center screen of the svg X
var centerY = (h)/2;    //center screen of the svg Y

var mapsChoices = [
{id:"POP",file:"population2010.csv",name:"Population"},
{id:"MAN",}
];

var fileToLoad = "population2010.csv";

//preparing the map
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

var projection = d3.geo.naturalEarth()
    .scale(w/5.1)
    .translate([centerX, centerY+40]);

var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
	.translate(projection.translate())
	.scale(projection.scale())
	.scaleExtent([w/5.1, w])
	.on("zoom", zoom);

function zoom() {
  projection.translate(d3.event.translate)
	.scale(d3.event.scale);
  countries.selectAll("path")
	.attr("d", path);
}

var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h)
    .call(zoom)



	
/*
	var cColors = {};
	var cValues = {};

countrySelection.forEach(function(d){
	cColors[d.id] = d.color;
	cValues[d.id] = +d.val;
})
*/


// Loading values from the CSV
var cVal = {};

d3.csv(fileToLoad, function(error,rawPop){
	rawPop.forEach(function(d){
		cVal[d.id] = +d.val;
	});
});
	
//creating the scale for the coloring
var valScale = d3.scale.threshold()
	.domain([5000000,10000000,25000000,50000000])
	.range(colorbrewer.YlOrBr[5]);

// create the legend placeholders
var legend = svg.append("g").attr("id", "legend");
var legend2 = svg.append("g").attr("id", "legend2");
	
	var maxVal = d3.max(d3.values(cVal));
	
var legScale = d3.scale.linear()
	.domain([+d3.min(d3.values(cVal)),d3.max(d3.values(cVal))])
	.range([0,300]);
	
var xAxis = d3.svg.axis()
	.scale(legScale)
	.orient("bottom")
	.tickSize(13)
	.tickValues(valScale.domain());
	
legend2.selectAll("rect")
	.data(valScale.range().map(function(d, i){
		return{
			x0: i ? legScale(valScale.domain()[i - 1]) : legScale.range()[0],
			x1: i < 4 ? legScale(valScale.domain()[i]) : legScale.range()[1],
			z: d
		}
	}))
	.enter().append("rect")
		.attr("height",8)
		.attr("x",function(d){return d.x0;})
		.attr("width",function(d){return d.x1 - d.x0;})
		.style("fill",function(d){return d.z;});
		
		
//---------- creating the legend based on the color range and domain defined
var valLegend = d3.values(valScale.range());
var valLabel = d3.values(valScale.domain());

legend.selectAll("rect")
	.data(d3.keys(valScale.range()))
	.enter().append("rect")
		.attr("width","20")
		.attr("height","20")
		.attr("x","20")
		.attr("y",function(d){return h-20-(20*d)})
		.style("fill", function(d){ return valLegend[d];})
		.append("title").text(function(d){return valLegend[d]});
	
legend.selectAll("text")
	.data(d3.keys(valScale.range()))
	.enter().append("text")
		.attr("x","40")
		.attr("y",function(d){return h-17-(20*d)})
		.text(function(d){
			var lbl = "";
			if (valLabel[d] === undefined){return lbl}
			else {
				if (valLabel[d] > 1000000){lbl = valLabel[d]/1000000+" M"}
				else{lbl = valLabel[d]}
				
				return "- "+lbl;}
		});
		
legend.append("text")
	.attr("x", -h)
	.attr("y", 15)
	.attr("transform","rotate(-90 0,0)")
	.text("Legend");
//------------------------ end of Legend --------------------------------------

// bar chart


var graph = svg.append("g").attr("id", "graph");
d3.csv(fileToLoad, function(error,rawPop,i){
	graph.selectAll("rect")
	.data(rawPop)
	.enter().append("rect")
		.attr("x",function(d,i){return 100+(+i*4) })
		.attr("y",function(d){return h-Math.sqrt(d.val/1000000)})
		.attr("width","4")
		.attr("height",function(d){return Math.sqrt(d.val/1000000) })
		.text(function(d){return d.val})
		.style("fill",function(d){return valScale(d.val)})
		.append("title").text(function(d){return d.id+": "+d.val});
});
/*
var alacon = d3.select("body").append("div").attr("id","alacon");
alacon.selectAll("div")
	.data([1,2,3,4,5,6,7,8,9,0])
	.enter().append("div")
		.text("ho");
*/

//Draws the countries and applies the coloring according to the CSV and scale defined
var countries = svg.append("g").attr("id", "countries");
d3.json("world_countries.json", function(json) {
	countries.selectAll("path")
		.data(json.features)
		.enter().append("path")
			.attr("svg:name", function (d) {return d.properties.name;})
			.attr("id", function (d) {return d.id;})
			.attr("d", path)
			.style("fill", function(d){
				
				if(cVal[d.id] === undefined){return "#666666";}
				else{ return valScale(cVal[d.id]);}
			})
			.append("title").text(function (d) {return d.properties.name+"\nPop: "+cVal[d.id];})
			.on("click", click);
});

	
function click(d) {
/*
	var centroid = path.centroid(d),
		translate = projection.translate();

	projection.translate([
		translate[0] - centroid[0] + w / 2,
		translate[1] - centroid[1] + h / 2
	]);
*/
	zoom.translate(projection.translate());
	
	countries.selectAll("path").transition()
		.duration(1000)
		.attr("d", path);
}

