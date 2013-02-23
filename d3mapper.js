

//defines the configuration of the map

var mapTitle = "Measures of children out of school (2011)";
var fileToLoad = "outofschoolprimary2011.csv";
var datatype = "qualitative";
var colorscale = colorbrewer.Blues[5]; //define the colors and the number of steps of the scale
var mapScaleDomain = [0,.3];

/*
var mapTitle = "Population (2010)";
var fileToLoad = "population2010.csv";
var datatype = "quantitative";
var colorscale = colorbrewer.YlOrBr[7]; //define the colors and the number of steps of the scale
var mapScaleDomain = [0,5000000,10000000,25000000,50000000,100000000];
*/

var w = window.innerWidth;        //width of the page
var h = window.innerHeight;        //height of the page
/*
if (document.getElementById("d3mapper").style.width == ""){
	document.getElementById("d3mapper").style.width = "1%";
}
w = document.getElementById("d3mapper").style.width;

if (document.getElementById("d3mapper").style.height == ""){
	document.getElementById("d3mapper").style.height = "100%"
}
h = document.getElementById("d3mapper").style.height;
*/

var r = 2.12; 	//ratio width/height of the coutries display

var svgSize ={};	//calculate the size of the svg element to fit the window
if(w/(h-35) < r){svgSize.w = w; svgSize.h = d3.round(w/r)+35;}
else{svgSize.w = d3.round(h*r); svgSize.h = h;}

// differentiate map size from svg size to include the legend
var mapSize = {w:svgSize.w,h:svgSize.h-35};

// define a projection and initial scale and position
var projection = d3.geo.naturalEarth()
    .scale(mapSize.w/5.5)
    .translate([mapSize.w/2, (mapSize.h/2)*1.12]);

var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
	.translate(projection.translate())
	.scale(projection.scale())
	.scaleExtent([w/5.5, w])
	.on("zoom", zoom);

function zoom() {
  projection.translate(d3.event.translate)
	.scale(d3.event.scale);
  countries.selectAll("path")
	.attr("d", path);
}

// creates the svg element
var svg = d3.select("#d3mapper").append("svg")
    .attr("width", svgSize.w)
    .attr("height", svgSize.h)
    .call(zoom)

//----------------------- Loading values from the CSV
var cVal = {};
d3.csv(fileToLoad, function(error,rawPop){
	rawPop.forEach(function(d, i){
		cVal[d.countryCode] = +d.val;
	});
});
	
var dVal = {};
d3.csv(fileToLoad, function(error,rawPop){
	rawPop.forEach(function(d, i){
		dVal[i] = {countryCode:d.countryCode,val:+d.val};
	});
});
	
//----------------creating the scale for the coloring
if (datatype == "quantitative"){  
	var valScale = d3.scale.threshold()
		.domain(mapScaleDomain)
		.range(colorscale);
		var formatScaleVal = d3.format("s");
		var formatMapVal = d3.format(",");
var legScale = d3.scale.sqrt()
	.domain([9827,1337825000])
	.range([0,d3.round(svgSize.w*.95)]);

}else{
	var valScale = d3.scale.quantize()
		.domain([0,.3])
		.range(colorscale);
		var formatScaleVal = d3.format("%");
		var formatMapVal = d3.format("%");
		
var legScale = d3.scale.linear()
	.domain(valScale.domain())
	.range([0,d3.round(svgSize.w*.95)]);
}

//--------------------- create the legend placeholders
var legend2 = svg.append("g")
	.attr("id", "legend2")
	.attr("transform","translate("+d3.round(svgSize.w*.025)+","+d3.round(svgSize.h-25)+")");
	
var extVal = d3.round(d3.extent(d3.values(cVal)));
	

var xAxis = d3.svg.axis()
	.scale(legScale)
	.orient("bottom")
	.tickSize(11)
	.tickValues(valScale.domain())
	.tickFormat(function(d){return formatScaleVal(d)});
	
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
	.text(mapTitle+". (Hover a country to get more information)");


// Draws the countries and applies the coloring according to the CSV and scale defined
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
			.append("title").text(function (d) {return d.properties.name+"\nValue: "+formatMapVal(cVal[d.id]);})
			.on("click", click);
});

	
// create the dropdown for color choosing	
var cbColors = [];
for(var k in colorbrewer) cbColors.push(k);
d3.select("control_form").append("select");

	
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


