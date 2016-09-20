let height = 500,
    width = 800;

let padding = 30;

let defaultRadius = 5;

let xScale = d3.scaleTime().range([0, width]);
let yScale = d3.scaleLinear().range([height, 0]);



// Create the SVG object with nested group
let svg = d3.select("#viz-wrapper")
              .append('svg')
              .attr('height', height +2*padding)
              .attr('width', width + 2*padding)

let viz = svg.append('g')
              .attr('id', 'viz')
              .attr('transform', 'translate(' + padding + ',' + padding + ')');

// Set up the x axis
let xAxis = d3.axisBottom(xScale).ticks(5);
let yAxis = d3.axisLeft(yScale).ticks(5);

// Setup the trendline
let trendline = d3.line()
  .x(function(d) { return xScale(d3.isoParse(d.date)); })
  .y(function(d) { return yScale(d.value); })
  .curve(d3.curveMonotoneX);


// Setup the drag behavior
let dataDrag = d3.drag()
								.on('start', dragStart)
								.on('drag', dragging)
								.on('end', dragEnd);

let wasDraggedFLAG = false;

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

// Add the trendline
	viz.append('path')
		.data([data])
		.attr('class', 'trendline')
		.attr('d', trendline)
		.style('fill', 'none')
		.style('stroke', 'black');
  
// Add the dots
  let dataPoints = viz.selectAll('g.data-point')
              .data(data)
              .enter()
              .append('g')
              .attr('class', 'data-point')
  
  dataPoints.attr('transform', function(d){
	  	x = xScale(d3.isoParse(d.date));
	  	y = yScale(d.value);
	  	return 'translate(' + x + ',' + y + ')'
	  })
  	.style('stroke', 'none')
		.style('fill', 'blue');
	
	dataPoints.append('circle').attr('r', defaultRadius);

	let tooltip = dataPoints.append('g')
													.attr('class', 'tooltip hide')
													.attr('transform','translate(5,5)');
	tooltip.append('text')
					.text(function(d){return d.value});

// Display text on hover
	dataPoints.on("mouseenter", function(d, i) {
    d3.select(this)
    	.select('g.tooltip')
      .classed('show', true)
      .classed('hide', false);
  });

  dataPoints.on("mouseleave", function(d, i) {
    d3.select(this)
      .select('g.tooltip')
      .classed('show', false)
      .classed('hide', true);
  });

// Add click event handlers
	svg.on("click", function(){
		console.log('viz clicked');
		d3.selectAll('g.data-point')
			.select('circle')
			.classed('selected', false);
    d3.select('#updator').attr('class', 'hide');
	});
	dataPoints.on("click", function(d, i){
		if (d3.event.defaultPrevented) return;
		d3.event.stopPropagation();
		d3.selectAll('g.data-point')
			.select('circle')
			.classed('selected', false);
		d3.select(this)
			.select('circle')
			.classed('selected', true);
		d3.select("#updator")
			.attr('class', 'show')
			.attr('dataPoint', i);
		d3.select("#value")
			.attr('placeholder', d.value);
	});

// Attach the drag behavior to the data points
	dataPoints.call(dataDrag);

// Add #updator submit handler
	d3.select('#updator')
		.on('submit', function(){
			d3.event.preventDefault();

			console.log();

			//get the new value
			let newValue = parseInt(document.getElementById('value').value)
			
			//select the corresponding data point and upate it's value and location
			let i = parseInt(d3.select(this).attr('dataPoint'));
			data[i].value = newValue;
			let newPositionY = yScale(data[i].value);
			d3.select(dataPoints._groups[0][i])
				.attr("transform", 
      				'translate(436,' +
                     newPositionY + ')');

			//recalculate trendline
		 	d3.select('.trendline')
		 		.attr('d', trendline);

			//hide the updator
			d3.select(this)
				.attr('class', 'hide');
		});
});


//Function: dragStart()
//Makes the circle radius 15% larger while dragging
function dragStart(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.event.sourceEvent.preventDefault();
  d3.select(this)
     .select('circle')
     .attr('r', defaultRadius*1.15);
};

//Function: dragging(d)
//Takes the datum and applies the new event coordinates
//Moves the dataPoint to the new datum and calculates
//the new data value and date, updating the text in the group,
//and recalculating the fit line
function dragging(d) {
	wasDraggedFLAG = true;
  d.x = d3.event.x;
  d.y = d3.event.y;
  d3.select(this)
     .attr("transform", 
      'translate(' + d.x + ',' +
                     d.y + ')');
  date = xScale.invert(d3.event.x);
  d.date = d3.isoFormat(date);
  d.value = yScale.invert(d3.event.y);
  //update text
  d3.select(this)
 		.select('text')
 		.text(d.value);
 	//recalculate trendline
 	d3.select('.trendline')
 		.attr('d', trendline);
};

//Function: dragEnd(d)
//Takes the new data point and sends it to the server(TODO) or console(CURRENT)
//Reduces the circle radius back to its original size
function dragEnd(d){
	d3.select(this)
		.select('circle')
		.attr('r',defaultRadius);
	
	// Send new data if dataPoint wasDragged
	if(wasDraggedFLAG){
		console.log(d);
		wasDraggedFLAG = false;
	}
 	
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