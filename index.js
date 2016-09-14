let height = 500,
    width = 800;

let padding = 20;

let defaultRadius = 5;

let xScale = d3.scaleTime().range([0, width]);
let yScale = d3.scaleLinear().range([height, 0]);



let viz = d3.select("#viz-wrapper")
                    .append('svg')
                    .attr('height', height +2*padding)
                    .attr('width', width + 2*padding)
                    .append('g')
                    .attr('id', 'viz').attr('transform', 'translate(' + padding + ',' + padding + ')');

// Set up the x axis
let xAxis = d3.axisBottom(xScale).ticks(5);
let yAxis = d3.axisLeft(yScale).ticks(5);
// Setup the y axis
// let xAxis = d3.svg.axis().scale(xScale)
//                           .orient("bottom")
//                           .ticks(8);
// Set up the y axis 
// let yAxis = d3.svg.axis().scale(yScale)
//                           .orient("left")
//                           .ticks(20);

//Function: padTimeScale(array,number)
//takes min value of array and pads by "padding" which is a number of hours
//does opposite for max value
let padTimeScale = function(domain, padding){
	if(domain.length !== 2){
		return;
	}
	domain[0].setTime(domain[0].getTime()-(padding*60*60*1000));
	domain[1].setTime(domain[1].getTime()+(padding*60*60*1000));
	return domain;
};

//Function: padDataScale(array,number)
//takes min value of array and pads by "padding" which is a percentage of the min value
//does opposite for max value
let padDataScale = function(domain, padding){
	if(domain.length !== 2){
		return;
	}
	domain[0] *= (1-(padding/100));
	domain[1] *= (1+(padding/100));
	return domain;
}

d3.json('mock/data.json', function(error, data) {
	data=data.dataPoints;

	// Setup the domains
  let xDomain = padTimeScale(d3.extent(data, function(data){
  	return d3.isoParse(data.date);
  }),1);

  let yDomain = padDataScale(d3.extent(data, function(data){
  	return data.value;
  }),1);

  xScale.domain(xDomain);
  yScale.domain(yDomain);

  // Add the axes
  viz.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  viz.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  
  // Add the dots

  let dots = viz.selectAll('circle')
              .data(data)
              .enter()
              .append('circle');

  dots.attr('r', defaultRadius)
			        .attr('cx', function(d) {
			        	return xScale(d3.isoParse(d.date));
			        })
			        .attr('cy', function(d){
			        	return yScale(d.value);
			        })
			        .style('stroke', 'none')
			        .style('fill', 'blue');
});









// var viz = d3.select("#viz-wrapper")
//                     .append('svg')
//                     .attr('height', height + padding * 2 )
//                     .attr('width', width + padding * 2)
//                     .append('g')
//                     .attr('id', 'viz')
//                     .attr('transform', 
//                       'translate(' + padding + ',' + padding + ')');

//     var yScale = d3.scale.linear()
//                           .range([height, 0]);

//     var xScale = d3.time.scale()
//                           .range([0, width]);

//     // Set up the x axis
//     var xAxis = d3.svg.axis().scale(xScale)
//                               .orient("bottom")
//                               .ticks(8);
//     // Set up the y axis 
//     var yAxis = d3.svg.axis().scale(yScale)
//                               .orient("left")
//                               .ticks(20);

//     var parseTime = d3.time.format("%Y%m%d");

//     d3.csv('climate_data.csv', function(data) {
//       yDomain = d3.extent(data, function(element){
//         return parseInt(element.TMAX)
//       });

//       xDomain = d3.extent(data, function(element) {
//         return parseTime.parse(element.DATE)
//       });
      
//       yScale.domain(yDomain);
//       xScale.domain(xDomain);

//       // Add the X Axis
//       viz.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(xAxis);
      
//       viz.append("g")
//           .attr("class", "y axis")
//           .call(yAxis);

//       dots = viz.selectAll('circle')
//                    .data(data)
//                    .enter()
//                   .append('circle');

//       dots.attr('r', 5)
//           .attr('cx', function(d) {
//             date = parseTime.parse(d.DATE);
//             return xScale(date)
//           })
//           .attr('cy', function(d) {
//             return yScale(d.TMAX)
//           })
//           .style('stroke', '#00ffd2')
//           .style('fill', '#006bff');
//     });