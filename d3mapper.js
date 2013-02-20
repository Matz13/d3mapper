
var w = window.innerWidth;        //width of the svg image
var h = d3.round(window.innerWidth/2);        //height of the svg
var centerX = (w)/2;    //center screen of the svg X
var centerY = (h)/2;    //center screen of the svg Y

var mapsChoices = [
{id:"POP",file:"population2010.csv",name:"Population"},
{id:"MAN",}
];

var fileToLoad = "population2010.csv";

var projection = d3.geo.naturalEarth()
    .scale(w/5.1)
    .translate([centerX, centerY+30]);

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

// Loading values from the CSV
var cVal = {};

d3.csv(fileToLoad, function(error,rawPop){
	rawPop.forEach(function(d, i){
		cVal[d.id] = +d.val;
	});
});
	
//creating the scale for the coloring
var valScale = d3.scale.threshold()
	.domain([5000000,10000000,25000000,50000000])
	.range(colorbrewer.YlOrBr[5]);

// create the legend placeholders
var legend2 = svg.append("g")
	.attr("id", "legend2")
	.attr("transform","translate("+d3.round(w*.025)+","+d3.round(h-25)+")");
	
var maxVal = d3.round(d3.max(d3.values(cVal)));
	
var legScale = d3.scale.sqrt()
	.domain([9827,1337825000])
	.range([0,d3.round(w*.95)]);

var formatMillion = d3.format("s");
var formatMillionMap = d3.format(",");
	
var xAxis = d3.svg.axis()
	.scale(legScale)
	.orient("bottom")
	.tickSize(11)
	.tickValues(valScale.domain())
	.tickFormat(function(d){return formatMillion(d)});
	
legend2.selectAll("rect")
	.data(valScale.range().map(function(d, i){
		return{
			x0: i ? d3.round(legScale(valScale.domain()[i - 1])) : legScale.range()[0],
			x1: i < 4 ? d3.round(legScale(valScale.domain()[i])) : legScale.range()[1],
			z: d
		}
	}))
	.enter().append("rect")
		.attr("height",8)
		.attr("x",function(d){return d.x0;})
		.attr("width",function(d){return d.x1 - d.x0;})
		.style("fill",function(d){return d.z;});

legend2.call(xAxis).append("text")
	.attr("class","caption")
	.attr("y", -6)
	.text("Population per country. (Hover a county to get more information)");
		
/*/---------- creating the legend based on the color range and domain defined
var legend = svg.append("g").attr("id", "legend");
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
//------------------------ end of Legend --------------------------------------/*/

/*/ bar chart
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
			.append("title").text(function (d) {return d.properties.name+"\nPop: "+formatMillionMap(cVal[d.id]);})
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

