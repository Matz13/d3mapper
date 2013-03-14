

//defines the configuration of the map

	var primary_duration_config = {serie : "2009", tickType : "on", mapTitle : "Duration of mandatory primary school", fileToLoad : "se_prm_durs.csv", datatype : "quantitative", colorscale : colorbrewer.RdYlGn[7], legendScaleRange : [3,9], mapScaleDomain : [3,4,5,6,7,8]};
	var population_2010_config = {serie : "val", mapTitle : "Population (2010)", fileToLoad : "population2010.csv", datatype : "quantitative", colorscale : colorbrewer.Purples[6], legendScaleRange : [0,200000000], mapScaleDomain : [5000000,10000000,25000000,50000000,100000000]}
	var outofschool_prm_2011_config = {serie : "total", mapTitle : "Measures of children out of school in 2011", fileToLoad : "outofschoolprimary2011.csv", datatype : "qualitative", colorscale : colorbrewer.Reds[6], legendScaleRange : [0,.63], mapScaleDomain : [.01,.05,.1,.2,.30]};
	var random_highlight_config = {}

if(!config){
	var config = primary_duration_config;
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

// -------------------------- creates the svg elements
var svg = d3.select("#d3mapper").append("svg")
	.attr("width", w)
	.attr("height", mapSize.h)
	.call(zoom);

var countries = svg.append("g")
	.attr("id", "countries");
	
var legend = svg.append("g")
	.attr("id", "legend")
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
var dVal = [];
var valScale = d3.scale.threshold();
var years;




//----------------------- Loading values from the CSV
function draw(config){

d3.json("world_countries.json", function(json) {
	
	countries.selectAll("path")
	.data(json.features)
	.enter().append("path")
		.attr("name", function (d) {return d.properties.name;})
		.attr("id", function (d) {return d.id;})
		.attr("d", path)
		.style("fill", "#CCCCCC");
	
	d3.csv(config.fileToLoad, function(error,rawData){
		
		// Extract years and compute min/max
		years = d3.keys(rawData[0])
            .filter(function(d) { return d.match(/^\d/); })
            .map(   function(d) { return parseInt(d); });
			   
		var min_year = d3.min(years);
		var max_year = d3.max(years);

		// Extract all values from the dataset	
		var values   = d3.merge(
			rawData
                .map(function(d) { return d3.entries(d).filter(function(d) { return d.key.match(/^\d/); }); })
                .map(function(d) { return d.map(function(d) { return d.value; }); })
                .map(function(d) { return d.map(function(d) { return parseFloat(d); }) })
                .map(function(d) { return d.filter(function(d) { return !isNaN(d); }) })
        );
		
		console.log(values);

		
		
		cVal = {};
		rawData.forEach(function(d, i){
			if(d.val !== undefined){
				cVal[d.countryCode] = d.val;
			}
		});
		
		dVal = {};
		rawData.forEach(function(d,i){
			dVal[d.countryCode] = d;
//			console.log(dVal);
		})
		
		eVal = rawData.map(function(d){
			return{
			}
		})
		
	if(config.serie == undefined){
		d3.select("#controls").append("div").attr("id","error").text("No serie has been selected.")
	}

		if (config.datatype == "quantitative"){ // adapts the coloring and scale to use integers	
			var formatScaleVal = d3.format("s");
			var formatMapVal = d3.format(",");
		}else if (config.datatype == "qualitative"){ // adapts the coloring and scale to use percentages
			var formatScaleVal = d3.format("%");
			var formatMapVal = d3.format(".2%");
		}
		
		valScale
			.domain(config.mapScaleDomain)
			.range(config.colorscale);

		var legScale = d3.scale.linear()
			.domain(config.legendScaleRange?config.legendScaleRange:d3.extent(d3.values(cVal)))
			.range([0,d3.round(mapSize.w*.95)]);
		
		legend.selectAll("*").remove(); // removes the previous titles from the country paths
		
		legend.selectAll("rect") // draws the rect for the legend
			.data(valScale.range().map(function(d, i){
				return{	x0: i ? d3.round(legScale(valScale.domain()[i - 1])) : legScale.range()[0],
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
					.attr("x",function(d){return d.x0;});

		var xAxis = d3.svg.axis()
			.orient("bottom")
			.tickValues(valScale.domain())
			.tickFormat(function(d){return formatScaleVal(d)});
					
		if(config.tickType == "on"){
			var tickOffset = d3.round(mapSize.w*.95)/valScale.domain().length/2;
			legScale.range([legScale.range()[0]+tickOffset,legScale.range()[1]+tickOffset]);
		
			xAxis.scale(legScale).tickSize(0).tickPadding(9);
		}else{
			xAxis.scale(legScale).tickSize(11);
		}

		legend.append("g") // adds a group to contain the axis
			.transition()
			.duration(1000)
			.call(xAxis);
			
		legend.append("text") // adds the caption of the legend
			.attr("class","caption")
			.attr("y", -6)
			.text(config.mapTitle+" ("+config.serie+"). (Hover a country to get more information)");
				
		countries.selectAll("path")
			.on('mouseover',function(d){
					if(dVal[d.id][config.serie] !== "" && dVal[d.id][config.serie] !== undefined){ 
						this.style.fill = d3.rgb(this.style.fill).brighter()
					}
				})
					
				.on('mouseout', function(d){
					if(dVal[d.id][config.serie] !== "" && dVal[d.id][config.serie] !== undefined){ 
						this.style.fill = valScale(dVal[d.id][config.serie]);
					}	
				})	
				.append("title");

		d3.select("#striped").transition().duration(1000)
			.style("opacity",0);
		
		// selects precedently striped countries (no data) and apply a color to prepare the transition
		countries.selectAll('path[style*=striped]')
			.style("fill", "#CCCCCC");
	
		
		countries.selectAll("path")
				.transition()
				.duration(1000)
				.style("fill", function(d){
					if(dVal[d.id] == undefined || dVal[d.id][config.serie] == undefined || dVal[d.id][config.serie] == ""){
						return "url(#striped)";
					}else{
						return valScale(dVal[d.id][config.serie]);
					}
				})
				.select("title").text(function (d) {
					if(dVal[d.id] == undefined || dVal[d.id][config.serie] == undefined || dVal[d.id][config.serie] == ""){
						return d.properties.name+"\nValue not available ";
					}else{
						return d.properties.name+"\nValue: "+formatMapVal(dVal[d.id][config.serie]);
					}
				})
				;
	});
});
}
draw(config);



