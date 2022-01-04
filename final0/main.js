function numFormatter(num) {
    if(num > 999 && num < 1000000){
        return (num/1000).toFixed(1) + 'K';
    }else if(num > 1000000){
        return (num/1000000).toFixed(1) + 'M'; 
    }else if(num < 900){
        return num;
    }
}
function getDataToltip(d) {
    let text = `${d.date} 
                Open: ${numFormatter(d.open)} 
                High: ${numFormatter(d.high)} 
                Low: ${numFormatter(d.low)} 
                Close: ${numFormatter(d.close)} 
                Vol: ${numFormatter(d.volume*1000000)}`;
   return text;
}

const width = 1250;
const height = 600;
const margin = {
    top: 10,
    right: 50,
    botton: 40,
    left: 40
};
const formatDate = d3.timeParse('%d/%m/%Y');

const svg = d3.select("#chart").append("svg")
                .attr("id", "svg")
                .attr("width", width)
                .attr("height", height);
const elementGroup = svg.append("g")
                        .attr("id", "elementGroup")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Definimos la escala
//let x = d3.scaleTime().range([0, width - margin.left - margin.right]);
let x = d3.scaleBand().range([0, width - margin.left - margin.right])
            .paddingInner(0.5)
            .paddingOuter(0.5);
let y = d3.scaleLinear().range([height - margin.top - margin.botton, 0]);
let yRight = d3.scaleLinear().range([height - margin.top - margin.botton, 0]);

// Definimos los ejes
const axisGroup = svg.append("g").attr("id", "axisGroup");
const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup")
                                        .attr("transform", `translate(${margin.left},${height - margin.botton})`);
const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup")
                                        .attr("transform", `translate(${margin.left},${margin.top})`);
const yRightAxisGroup = axisGroup.append("g").attr("id", "yRightAxisGroup")
                                        .attr("transform", `translate(${width - margin.right},${margin.top})`);

// Aplicamos las escalas a los ejes
;
const yAxis = d3.axisLeft().scale(y);
const yRigthAxis = d3.axisRight().scale(yRight);

//Generamos la gráfica
d3.csv('ibex.csv').then (data => {

    let data2 = data
    data2.map(d => {
        d.date = d.date;
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = d.volume/1000000;
    })

    var totalVolume = 0;
    data2.map(d => {
        totalVolume = totalVolume + d.volume;
    });
    var totalVolumeElement = data2.map(d => d.volume).length;

    // aplicamos los limites
    x.domain(data2.map(d => d.date));

    const xAxis = d3.axisBottom().scale(x).tickValues(x.domain().filter(function(d,i){ return !(i%10)}));

    y.domain(d3.extent(data2.map(d => d.close)));
    yRight.domain([
        d3.min(data2.map(d => d.volume)),
        d3.max(data2.map(d => d.volume*3))
    ]);

    xAxisGroup.call(xAxis).selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-40)" );;
    yAxisGroup.call(yAxis);
    yRightAxisGroup.call(yRigthAxis);
   

    elementGroup.datum(data).append('path')
        .style("stroke-width", 1.5)
        .attr('id', 'close')
        .attr('d', d3.line()
        .x(d => x(d.date))
        .y(d => y(d.close))
    );

    // tooltip para mostrar datos
    var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

    var elementos = elementGroup.selectAll('rect').data(data2);
    elementos.enter().append('rect')
            .attr('id', d => numFormatter(d.volume*1000000))
            .attr("fill", d => {
                if(d.volume > (totalVolume/totalVolumeElement)) {
                    return "green"
                } else {
                    return "red"
                }
            })
            .attr('width', x.bandwidth()) 
            .attr('height', d => height - margin.top - margin.botton - yRight(d.volume))
            .attr('x', d => x(d.date))
            .attr('y', d => yRight(d.volume))
            .on("mouseover", function(d){tooltip.text(getDataToltip(d)); return tooltip.style("visibility", "visible");})
            .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    console.log(data);
});