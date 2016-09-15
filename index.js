let height = 500,
    width = 800;

let padding = 30;

let defaultRadius = 5;

let xScale = d3.scaleTime().range([0, width]);
let yScale = d3.scaleLinear().range([height, 0]);



// Create the SVG object with nested group
let viz = d3.select("#viz-wrapper")
                    .append('svg')
                    .attr('height', height +2*padding)
                    .attr('width', width + 2*padding)
                    .append('g')
                    .attr('id', 'viz')
                    .attr('transform', 'translate(' + padding + ',' + padding + ')');

// Set up the x axis
let xAxis = d3.axisBottom(xScale).ticks(5);
let yAxis = d3.axisLeft(yScale).ticks(5);

// Setup the drag behavior
let dataDrag = d3.drag()
								.on('start', dragStart)
								.on('drag', dragging)
								.on('end', dragEnd);

// Add Data to the SVG
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
  let dataPoints = viz.selectAll('g.data-point')
              .data(data)
              .enter()
              .append('g')
              .attr('class', 'foo');
  dataPoints.attr('transform', function(d){
	  	x = xScale(d3.isoParse(d.date));
	  	y = yScale(d.value);
	  	return 'translate(' + x + ',' + y + ')'
	  })
  	.style('stroke', 'none')
		.style('fill', 'blue');
	dataPoints.append('circle').attr('r', defaultRadius);
	dataPoints.append('text')
		.text(function(d){return d.value})
		.attr('transform','translate(5,5)')
		.style('fill', 'green')
		.style('display', 'none');

// Display text on hover
	dataPoints.on("mouseenter", function(d, i) {
    d3.select(this)
    	.select('text')
      .style('display', 'block');
  });

  dataPoints.on("mouseleave", function(d, i) {
    d3.select(this)
      .select('text')
      .style('display', 'none');
  });

// Attach the drag behavior to the data points
	dataPoints.call(dataDrag);
});


//Function: dragStart()
//Makes the circle radius 15% larger while dragging
function dragStart(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this)
     .select('circle')
     .attr('r', defaultRadius*1.15);

 console.log(d);
};

//Function: dragging(d)
//Takes the datum and applies the new event coordinates
//Moves the dataPoint to the new datum and calculates
//the new data value and date, updating the text in the group
function dragging(d) {
  d.x = d3.event.x;
  d.y = d3.event.y;
  d3.select(this)
     .attr("transform", 
      'translate(' + d.x + ',' +
                     d.y + ')');
  date = xScale.invert(d3.event.x);
  d.date = d3.isoFormat(date);
  d.value = yScale.invert(d3.event.y);
  d3.select(this)
 		.select('text')
 		.text(d.value);
};

//Function: dragEnd(d)
//Takes the new data point and sends it to the server(TODO) or console(CURRENT)
//Reduces the circle radius back to its original size
function dragEnd(d){
	d3.select(this)
		.select('circle')
		.attr('r',defaultRadius);
 console.log(d);
}


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