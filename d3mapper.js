

//defines the configuration of the map

var mapTitle = "Measures of children out of school (2011)";
var fileToLoad = "outofschoolprimary2011.csv";
var datatype = "qualitative";
var colorscale = colorbrewer.Blues[6]; //define the colors and the number of steps of the scale
var legendScaleRange = [0,.50];
var mapScaleDomain = [.01,.05,.1,.2,.30]; // auto | [min, max]

/*
var mapTitle = "Population (2010)";
var fileToLoad = "population2010.csv";
var datatype = "quantitative";
var colorscale = colorbrewer.YlOrBr[6]; //define the colors and the number of steps of the scale
var legendScaleRange = [0,200000000];
var mapScaleDomain = [5000000,10000000,25000000,50000000,100000000];
*/

var w = window.innerWidth;        //width of the page
var h = window.innerHeight;        //height of the page
var r = 2.12; 	//ratio width height of the coutries display

var svgSize ={};	//calculate the size of the svg element to fit the window
if(w/(h-35) < r){svgSize.w = w; svgSize.h = d3.round(w/r)+35;}
else{svgSize.w = d3.round(h*r); svgSize.h = h;}

// differentiate map size from svg size to include the legend
var mapSize = {w:svgSize.w,h:svgSize.h-35};

// define a projection and initial scale and position
/* NaturalEarth is broken
var projection = d3.geo.naturalEarth()
    .scale(mapSize.w/5.5)
    .translate([mapSize.w/5.5, (mapSize.h/2)*1.12]);
*/
var projection = d3.geo.mercator()
    .scale(mapSize.w*.9)
    .translate([mapSize.w/2, (mapSize.h/2)*1.12]);


var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
	.translate(projection.translate())
	.scale(projection.scale())
	.scaleExtent([w/2, w])
	.on("zoom", mapZoom);

function mapZoom() {
  projection.translate(d3.event.translate)
	.scale(d3.event.scale);
  countries.selectAll("path")
	.attr("d", path);
}

// -------------------------- creates the svg elements
var svg = d3.select("#d3mapper").append("svg")
    .attr("width", svgSize.w)
    .attr("height", svgSize.h)
	.call(zoom)
	;

var countries = svg.append("g").attr("id", "countries");
	
var legend2 = svg.append("g")
	.attr("id", "legend2")
	.attr("transform","translate("+d3.round(svgSize.w*.025)+","+d3.round(svgSize.h-25)+")");

//----------------------- Loading values from the CSV
function draw(){

d3.csv(fileToLoad, function(error,rawPop){
	d3.json("world_countries.json", function(json) {
	var cVal = {};
	rawPop.forEach(function(d, i){
		cVal[d.countryCode] = +d.val;
	});
	var dVal;
	d3.csv(fileToLoad, function(error,fileData){
		dVal = fileData;
	});


	var valScale = d3.scale.threshold()
		.domain(mapScaleDomain)
		.range(colorscale);
		
	var legScale = d3.scale.linear()
		.domain(legendScaleRange?legendScaleRange:d3.extent(d3.values(cVal)))
		.range([0,d3.round(svgSize.w*.95)]);
	
	var xAxis = d3.svg.axis()
		.scale(legScale)
		.orient("bottom")
		.tickSize(11)
		.tickValues(valScale.domain())
		.tickFormat(function(d){return formatScaleVal(d)});
		
	if (datatype == "quantitative"){ // adapts the coloring and scale to use integers	
		var formatScaleVal = d3.format("s");
		var formatMapVal = d3.format(",");
	}else if (datatype == "qualitative"){ // adapts the coloring and scale to use percentages
		var formatScaleVal = d3.format("%");
		var formatMapVal = d3.format("%");
	}
	
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
	// end of legend
			
			
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
//			.on('mouseup',function(d){alert(d.properties.name+': '+formatMapVal(cVal[d.id]));})
			.append("title").text(function (d) {return d.properties.name+"\nValue: "+formatMapVal(cVal[d.id]);});

	});
	

});
}
draw();



