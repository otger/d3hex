///////////////////////////////////////////
// Helper constants
///////////////////////////////////////////
var sin60 = Math.sin(Math.PI / 3);
var sin30 = Math.sin(Math.PI / 6);
var cos60 = Math.cos(Math.PI / 3);
var cos30 = Math.cos(Math.PI / 6);
var rotangle = Math.atan(Math.cos(Math.PI / 6) / (3 * (1 + Math.sin(Math.PI / 6))));
var rotangle2 = Math.atan((1 + Math.sin(Math.PI / 6)) / (5.5 * Math.cos(Math.PI / 6)));

///////////////////////////////////////////
// Helper Functions
///////////////////////////////////////////
function rotatePoint(p, angle) {
  var m = [
    [Math.cos(angle), -Math.sin(angle)],
    [Math.sin(angle), Math.cos(angle)]
  ];
  pr = [p[0] * m[0][0] + p[1] * m[0][1], p[0] * m[1][0] + p[1] * m[1][1]];
  return pr;
}

function calcHexVertex(r) {
  // in d3 positive is down (0,0) is top left corner
  // This forces to invert signs
  var initPoint = [r, 0];
  var hexPoints = [];
  hexPoints.push(initPoint);
  for (var i = 1; i < 6; i++) {
    hexPoints.push(rotatePoint(initPoint, Math.PI * i / 3));
  }
  return hexPoints;
}


function getDivWidth(div) {
  var width = d3.select(div)
    // get the width of div element
    .style('width')
    // take of 'px'
    .slice(0, -2)
  // return as an integer
  return Math.round(Number(width))
}

function getDivHeight(div) {
  var width = d3.select(div)
    // get the width of div element
    .style('height')
    // take of 'px'
    .slice(0, -2)
  // return as an integer
  return Math.round(Number(width))
}

function lineFromPoints() {}

///////////////////////////////////////////
// The class of the Modules Charts
///////////////////////////////////////////
class ModuleChart {
  constructor(title, id, parentId, urlDataUpdate) {
  	this.title = title;
  	this.sizes = {
    	'width': 1000,
      'height': 1200,
      'barHeight': 800
    }
    this.id = id;
    this.parentId = parentId;
    this.urlDataUpdate = urlDataUpdate;
    this.urlConfigModules = "https://raw.githubusercontent.com/otger/d3hex/master/data/json/modules.json";
    this.hexRadius = 31;
    this.hexVertex = calcHexVertex(this.hexRadius);
    this.modules = [];
    this.svgId = 'svg' + this.id;
    this.modulesGroupId = 'svgModulesGroup' + this.id;
    this.scaleGroupId = 'svgScaleGroup' + this.id;
    this.titleGroupId = 'svgTitleGroup' + this.id;
    this.dateGroupId = 'svgDateGroup' + this.id;
    this.colorScale = {
      'scale': d3.scaleLinear()
        .domain([-20, 5, 40, 60])
        .range(['rgb(14, 14, 214)', 'rgb(14, 214, 141)', 'rgb(4, 165, 77)', 'rgb(188, 1, 1)']),
      'valuesArray': [-20, 5, 40, 60],
      'colorsArray': ['rgb(14, 14, 214)', 'rgb(14, 214, 141)', 'rgb(4, 165, 77)', 'rgb(188, 1, 1)']
    }

    this.lineFromPoints = d3.line()
      .x(function(d) {
        return d[0];
      })
      .y(function(d) {
        return d[1];
      });


    this.createSvgGroups();

    this.modsSvg = null; //Svg select of all paths
    this.createModules();
    this.createColorScale();
    this.createTitle();
    this.createDate();
  }
	
  createTitle(){
  	this.svgTitleGroup.append("text")
        .attr("x", (this.sizes.width / 2))             
        .attr("y", 95)
        .attr("class", "chartTitle")
        .attr("text-anchor", "middle")  
        .text(this.title);
  }
  createDate(){
  	this.svgDateGroup.append("text")
        .attr("x", 30)             
        .attr("y", 1150)
        .attr("class", "chartDate")
        .text('Not available');
  }
  createSvgGroups() {
    this.svg = d3.select(this.parentId).append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
      .attr('id', this.svgId)
      .attr('viewBox', '0 0 '+this.sizes.width+' '+this.sizes.height);
    //    .attr('preserveAspectRatio', 'xMinYMin')
    this.svgModulesGroup = this.svg
      .append("g")
      .attr("id", this.modulesGroupId)
      .attr("transform", "translate( 450, 600)");
    this.svgColorScaleGroup = this.svg
      .append("g")
      .attr("id", this.scaleGroupId)
      .attr("transform", "translate( 910, 0)");
    this.svgTitleGroup = this.svg
    	.append("g")
      .attr("id", this.titleGroupId);
    this.svgDateGroup = this.svg
    	.append("g")
      .attr("id", this.dateGroupId);  }

  createColorScale() {
    var mods = this;
    var offset = (this.sizes.height - this.sizes.barHeight) / 2; //1000 of the viewbox
    var a = (Math.min(...mods.colorScale.valuesArray) - Math.max(...mods.colorScale.valuesArray)) / this.sizes.barHeight;
    var b = Math.max(...mods.colorScale.valuesArray);
    var a2 = this.sizes.barHeight / (Math.min(...mods.colorScale.valuesArray) - Math.max(...mods.colorScale.valuesArray));
    var b2 = -Math.max(...mods.colorScale.valuesArray) * a2;
    this.barsColorScale = this.svgColorScaleGroup.selectAll(".barsColorScale")
      .data(d3.range(this.sizes.barHeight), function(d) {
        return d;
      })
      .enter().append("rect")
      .attr("class", "barsColorScale")
      .attr("width", 15)
      .attr("height", 1)
      .attr("x", 0)
      .attr("y", function(d) {
        return d + offset;
      })
      .attr("fill", function(d, i) {
        return mods.colorScale.scale(a * d + b);
      })
    this.svgColorScaleGroup.selectAll(".barsColorScaleText")
      .data(mods.colorScale.valuesArray)
      .enter().append("text")
      .attr("text-anchor", "end")
      .attr("x", 90)
      .attr("y", function(d) {
        return a2 * d + b2 + offset + 20;
      })
      .text(function(d) {
        return d;
      })
      .attr("class", "barsColorScaleText");

  }
  changeColorScale(valuesArray, colorsArray) {
    this.colorScale.scale = d3.scaleLinear()
      .domain(valuesArray)
      .range(colorsArray);
    this.colorScale.valuesArray = valuesArray;
    this.colorScale.colorsArray = colorsArray;
    
    this.svgColorScaleGroup.selectAll(".barsColorScale").remove();
    this.svgColorScaleGroup.selectAll(".barsColorScaleText").remove();
    this.createColorScale();
  }

  calcHexVertexAtPosition(i, j) {
    var dx = i * this.hexRadius * (1 + sin30);
    var dy = -j * this.hexRadius * cos30;

    var p = [];
    for (var i = 0; i < this.hexVertex.length; i++) {
      p.push([dx + this.hexVertex[i][0], dy + this.hexVertex[i][1]])
    }

    //console.log(p);
    return p;
  }


  createModules() {
    var modspromise = d3.json(this.urlConfigModules);
    var mods = this;
    var whatever = modspromise.then(function(jsondata) {
      console.log("promise mods:", mods);
      for (var i = 0; i < jsondata.modules_location.length; i++) {
        mods.modules.push({
          "module_num": i,
          "bp_temperature": 0,
          "x": jsondata.modules_location[i].x,
          "y": jsondata.modules_location[i].y
        });
        //console.log(mods.translateHex(jsondata.modules_location[i].x, jsondata.modules_location[i].y));
      }
      mods.modsSvg = mods.svgModulesGroup
        .selectAll("path")
        .data(mods.modules)
        .enter()
        .append("path")
        .attr("class", "hexagon")
        .attr("d", function(d) {
          return mods.lineFromPoints(mods.calcHexVertexAtPosition(d.x, d.y));
        })
        .attr("id", function(d) {
          return "i" + d.x + "j" + d.y;
        })
        .attr("fill", "rgb(50,50,50)");
    });

  }

  updateCB(jsondata, mods) {
    //this should be callback of d3.json whatever
    // expect an array of 265 values on jsondata.bp_temperatures
    //  console.log("updating");
    //  console.log(jsondata);
    var len = Math.min(jsondata.values.length, mods.modules.length)
    for (var i = 0; i < len; i++) {
      mods.modules[i].value = jsondata.values[i];
    }
    mods.heatmap = mods.svgModulesGroup.selectAll(".hexagon")
      .data(mods.modules)
      .transition()
      .duration(1000)
      .attr("fill", function(d) {
        //console.log(mods.colorscale(d.bp_temperature));
        return mods.colorScale.scale(d.value);
      })
    var updateDt = moment.utc(jsondata.timestamp, 'X');
    console.log(updateDt, jsondata);
    mods.svgDateGroup.selectAll("text")
    	.text(updateDt.format());

  }

  fakeValues(mods, rangeValues) {
    var t = {}
    t.timestamp = Math.floor((new Date()).getTime() / 1000);
    t.values = []
    var x = rangeValues[1] - rangeValues[0];
    var y = rangeValues[0];
    for (var i = 0; i < 265; i++) {
      t.values.push(Math.random() * x - y);
    }
    console.log(rangeValues,x, y, t);
    mods.updateCB(t, mods);
  }

}

///////////////////////////////////////////
// Try things
///////////////////////////////////////////


let m1 = new ModuleChart("BackPlanes Temperature", "bp_temp", "#container1", null);
let m2 = new ModuleChart("BackPlanes Humidity", "bp_temp2", "#container2", null);

m2.changeColorScale([0,20,80,100], ['rgb(160,46,160)','rgb(31,193,79)', 'rgb(94,132,105)', 'rgb(224,17,17)'])
console.log(m1.svgId);

var timer = setInterval(m1.fakeValues, 5000, m1, [-20, 40]);
var timer = setInterval(m2.fakeValues, 5000, m2, [0, 100]);

