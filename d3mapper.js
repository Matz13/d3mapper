

//defines the configuration of the map

	var primary_duration_config = {mapTitle : "Duration of Mandatory primary school (2011)", fileToLoad : "se_prm_durs.csv", datatype : "quantitative", colorscale : colorbrewer.RdYlGn[7], legendScaleRange : [3,9], mapScaleDomain : [3,4,5,6,7,8,9]};
	var population_2010_config = {mapTitle : "Population (2010)", fileToLoad : "population2010.csv", datatype : "quantitative", colorscale : colorbrewer.Purples[6], legendScaleRange : [0,200000000], mapScaleDomain : [5000000,10000000,25000000,50000000,100000000]}
	var outofschool_prm_2011_config = {mapTitle : "Measures of children out of school (2011)", fileToLoad : "outofschoolprimary2011.csv", datatype : "qualitative", colorscale : colorbrewer.Reds[6], legendScaleRange : [0,.63], mapScaleDomain : [.01,.05,.1,.2,.30]};

if(!config){
	var config = outofschool_prm_2011_config;
}


//var config = population2010_config;
//var config = OOSC2011_config;


// add links to load the different datasets
d3.select("#controls")
	.append("a")
	.attr("href","javascript:void(0)")
	.attr("onclick","draw(outofschool_prm_2011_config)")
	.text("Out of School Children 2011");

d3.select("#controls")
	.append("a")
	.attr("href","javascript:void(0)")
	.attr("onclick","draw(population_2010_config)")
	.text("Population 2010");

d3.select("#controls")
	.append("a")
	.attr("href","javascript:void(0)")
	.attr("onclick","draw(primary_duration_config)")
	.text("Primary school duration 2011");

var w = $('#d3mapper').width();        //width of the div
var h = $('#d3mapper').height();        //height of the div
var r = 2.12; 	//ratio width/height of the coutries display

var mapSize ={};	//calculate the size of the svg element to fit the window
if(w/(h-35) < r){mapSize.w = w; mapSize.h = d3.round(w/r)+35;}
else{mapSize.w = d3.round(h*r); mapSize.h = h;}


// define a projection and initial scale and position

var projection = d3.geo.naturalEarth()
	.scale(mapSize.w/5.5)
	.translate([mapSize.w/2, (mapSize.h/2)*1.08]);

var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
	.translate(projection.translate())
	.scale(projection.scale())
	.scaleExtent([w/5.5, w])
	.on("zoom", mapZoom);

function mapZoom() {
  projection.translate(d3.event.translate)
	.scale(d3.event.scale);
  countries.selectAll("path")
	.attr("d", path);
}

function move() { // attempt at a function that constraint the zoom to the limits of the map
  var t = d3.event.translate,
      s = d3.event.scale;
	  cx = mapSize.w/2;
	  cy = mapSize.h/2;
	  
	  console.log("t.in= "+t+" - s= "+s);
	  
  t[0] = Math.min(cx *(s-1), Math.max(cx *(1-s), t[0]));
  t[1] = Math.min(cy *(s-1), Math.max(cy *(1-s), t[1]));
  zoom.translate(t);
  countries.attr("transform", "translate(" + t + ")scale(" + s + ")");

}

// -------------------------- creates the svg elements
var svg = d3.select("#d3mapper").append("svg")
	.attr("width", w)
	.attr("height", mapSize.h)
	.call(zoom);

var countries = svg.append("g")
	.attr("id", "countries");
	
var legend2 = svg.append("g")
	.attr("id", "legend2")
	.attr("transform","translate("+d3.round(mapSize.w*.025)+","+d3.round(mapSize.h-25)+")");

// create the striped pattern for unavailable data
svg.append("defs")
	.append("pattern")
		.attr("id","striped")
		.attr("width", 5)
		.attr("height", 5)
		.attr("x", 0)
		.attr("y", 0)
		.attr("patternUnits","userSpaceOnUse")
		.append("rect")
		.attr("width", 5)
		.attr("height", 5)
		.attr("fill","#ccc");
		
	d3.select("#striped")
		.append("path")
			.attr("d","M0,0 L5,5")
			.attr("stroke","black")
			.attr("stroke-width","1");

var cVal = {};
var dVal = {};
var valScale = d3.scale.threshold();

//----------------------- Loading values from the CSV
function draw(config){

d3.csv(config.fileToLoad, function(error,rawPop){
	d3.json("world_countries.json", function(json) {
		
		cVal = {};
		rawPop.forEach(function(d, i){
			if(d.val !== undefined){
				cVal[d.countryCode] = d.val;
			}
		});
		dVal = rawPop;
	
		valScale
			.domain(config.mapScaleDomain)
			.range(config.colorscale);
			
		var legScale = d3.scale.linear()
			.domain(config.legendScaleRange?config.legendScaleRange:d3.extent(d3.values(cVal)))
			.range([0,d3.round(mapSize.w*.95)]);
		
		var xAxis = d3.svg.axis()
			.scale(legScale)
			.orient("bottom")
			.tickSize(11)
			.tickValues(valScale.domain())
			.tickFormat(function(d){return formatScaleVal(d)});
			
		if (config.datatype == "quantitative"){ // adapts the coloring and scale to use integers	
			var formatScaleVal = d3.format("s");
			var formatMapVal = d3.format(",");
		}else if (config.datatype == "qualitative"){ // adapts the coloring and scale to use percentages
			var formatScaleVal = d3.format("%");
			var formatMapVal = d3.format("%");
		}
		
		legend2.selectAll("*").remove();
//		countries.selectAll("title").remove();
		
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
				.style("fill",function(d){return d.z;})
				.transition()
					.duration(1000)
					.attr("width",function(d){return d.x1 - d.x0;})
					.attr("x",function(d){return d.x0;})
;

		
		legend2.append("g")
			.transition()
			.duration(1000)
			.call(xAxis);
			
		legend2	
			.append("text")
			.attr("class","caption")
			.attr("y", -6)
			.text(config.mapTitle+". (Hover a country to get more information)");
// end of legend
		var oldColor;
				
		countries.selectAll("path")
			.data(json.features)
			.enter().append("path")
				.attr("name", function (d) {return d.properties.name;})
				.attr("id", function (d) {return d.id;})
				.attr("d", path)
				.on('mouseover',function(d){
					oldColor = this.style.fill;
					if(cVal[d.id] !== "" && cVal[d.id] !== undefined){ 
						this.style.fill = d3.rgb(this.style.fill).brighter()
					}
				})
					
				.on('mouseout', function(d){
					if(cVal[d.id] !== "" && cVal[d.id] !== undefined){ 
						this.style.fill = oldColor
					}	
				})	
				.append("title");
	
		countries.selectAll("path")
				.transition()
				.duration(1000)
				.style("fill", function(d){
					if(cVal[d.id] == undefined || cVal[d.id] == ""){return "url(#striped)";}
					else{ return valScale(cVal[d.id]);}
				})
				.select("title").text(function (d) {
					if(cVal[d.id] == undefined || cVal[d.id] == ""){
						return d.properties.name+"\nValue not available ";
					}else{
						return d.properties.name+"\nValue: "+formatMapVal(cVal[d.id]);
					}
				})
				;
	});
});
}
draw(config);



