
/**
 * Enunciado:
 * Hay que combinar 2 graficas
 * Representar la edad de Leonardo Di Caprio en una gráfica de línea
 * Representar la edad de sus ex en una gráfica de barras, usando la misma scala, para poder comparar ambos valores
 * Cada chica debe tener un color distinto
 * Cuando se pase el cursor por encima, debemos representar en algún sitio el nombre de ella, su edad y la diferencia de edad con Di Caprio
 */

// ----------------------------------------------------------
// Utils
// ----------------------------------------------------------

 const diCaprioBirthYear = 1974;
 const age = function(year) { return year - diCaprioBirthYear}
 const today = new Date().getFullYear()
 const ageToday = age(today)

 const colours = ["#255C66", "#9ADEEA", "#52D0E6", "#436166", "#40A1B3", "#288899", "#E66AA1", "#52D0E6", "#E6D43C", "#998E2F"];
 
 function getTheColor(girlfriends, name) {
    let index = girlfriends.indexOf(name);
     return colours[index];
 }

 function getDataToltip(d) {
     let text = `${d.name} tiene ${d.age} años, ${d.ageD - d.age} menos que DiCaprio`;
    return text;
 }
 
// ----------------------------------------------------------
// ----------------------------------------------------------

const width = 800;
const height = 600;
const margin = {
    top: 10,
    right: 10,
    botton: 40,
    left: 40
}
let ageDicaprio = [];
let girlfriends = [];

const svg = d3.select("#chart").append("svg")
                .attr("id", "svg")
                .attr("width", width)
                .attr("height", height);
const elementGroup = svg.append("g")
                        .attr("id", "elementGroup")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Definir la escala
let x = d3.scaleBand().range([0, width - margin.left - margin.right])
            .paddingInner(0.5)
            .paddingOuter(0.5);
let y = d3.scaleLinear().range([height - margin.top - margin.botton, 0]);

// Definir los ejes
const axisGroup = svg.append("g").attr("id", "axisGroup");
const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup")
                                        .attr("transform", `translate(${margin.left}, ${height - margin.botton})`);
const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup")
                                        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Aplicamos las escalas a los ejes
const xAxis = d3.axisBottom().scale(x);
const yAxis = d3.axisLeft().scale(y);

// Generamos la grafica
d3.csv("data.csv").then(data => {

    //obtenemos las novias de DiCaprio
    data.map(d => {
        if (girlfriends.indexOf(d.name) === -1) {
            girlfriends.push(d.name);
          }
    });

    // adapatamos los datos a las necesidades del gráfico
    var data2 = data
    data2.map(d => {
        d.year = +d.year;
        d.age = +d.age;
        d.ageD = age(d.year);
        d.color = getTheColor(girlfriends, d.name);
    })

    // generamos los limites de los ejes
    x.domain(data2.map(d => d.year));
    y.domain([
        0,
        d3.max(data2.map(d => d.ageD))
    ]);
  
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);


    // tooltip para mostrar datos
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("padding", "2px 5px 2px 5px")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#000")
    .style("color", "#F0FFFF")
    .text("a simple tooltip");


    // grafica de barras con las novias de DiCaprio
    var elements = elementGroup.selectAll("rect").data(data2);
    elements.enter().append("rect")
                        .attr("id", d => d.name)
                        .attr("fill", d => d.color)
                        .attr("width", x.bandwidth())
                        .attr("height", d => height - margin.top - margin.botton - y(d.age))
                        .attr("x", d => x(d.year))
                        .attr("y", d => y(d.age))
                        .on("mouseover", function(d){tooltip.text(getDataToltip(d)); return tooltip.style("visibility", "visible");})
                        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
                        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

                        
    // grafica de linea con la edad de DiCaprio
    elementGroup.datum(data2).append("path")
        .attr("id", "Dicaprio")
        .attr("d", d3.line()
        .x(d => (x.bandwidth()/2) + x(d.year))
        .y(d => y(d.ageD)));
    elementGroup.selectAll("dot").data(data2)
        .enter().append("circle")
          .attr("cx", d => (x.bandwidth()/2) + x(d.year))
          .attr("cy", d => y(d.ageD))
          .attr("r", 3);
});