let height = 500,
    width = 800;

let padding = 50;

let defaultRadius = 5;

let xScale = d3.scaleTime().range([0, width]);
let yScale = d3.scaleLinear().range([height, 0]);



let viz = d3.select("#viz-wrapper")
                    .append('svg')
                    .attr('id', 'viz')
                    .attr('height', height)
                    .attr('width', width);

let parseTime = d3.isoParse("2016-09-14T12:49:15Z");

//Function: padTimeScale(array,number)
//takes min value of array and pads lower by padding which is a number of hours
//does opposite for max value
let padTimeScale = function(domain, padding){
	if(domain.length !== 2){
		return;
	}
	let paddingFactor
	domain[0].setTime(domain[0].getTime()-(padding*60*60*1000));
	domain[1].setTime(domain[1].getTime()+(padding*60*60*1000));
	return domain;
}

d3.json('mock/data.json', function(error, data) {
	data=data.dataPoints;
  // do something with the data here
  console.log(error);
  console.log(data);



  let xDomain = padTimeScale(d3.extent(data, function(data){
  	return d3.isoParse(data.date);
  }),1);




  let yMin = d3.min(data, function(data){
  	return data.value;
  })*.99;

  let yMax = d3.max(data, function(data){
  	return data.value;
  })*1.01;



  xScale.domain(xDomain);
  yScale.domain([yMin,yMax]);

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
			        .style('stroke', 'red')
			        .style('fill', 'green');
});









// var parseTime = d3.time.format("%Y-%m-%dT");
// valentinesDay = "2016-09-14T12:49:15Z";
// d3.csv('climate_data.csv', function(data) {
//   yDomain = d3.extent(data, function(element){
//     return parseInt(element.TMAX)
//   });

//   xDomain = d3.extent(data, function(element) {
//     return parseTime.parse(element.DATE)
//   });
  
//   yScale.domain(yDomain);
//   xScale.domain(xDomain);


//   dots = viz.selectAll('circle')
//                .data(data)
//                .enter()
//               .append('circle');

//   dots.attr('r', 5)
//       .attr('cx', function(d) {
//         date = parseTime.parse(d.DATE);
//         return xScale(date)
//       })
//       .attr('cy', function(d) {
//         return yScale(d.TMAX)
//       })
//       .style('stroke', '#00ffd2')
//       .style('fill', '#006bff');
// });