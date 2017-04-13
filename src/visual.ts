

module powerbi.extensibility.visual {

    interface BarChartViewModel {
        dataPoints :  BarChartDataPoint[];
        dataMax: number;
        measure0: string;
        measure1: string;
        measure2: string;
    }


    interface BarChartDataPoint {
        value0: PrimitiveValue;
        value1: PrimitiveValue;
        value2: PrimitiveValue;
        category: string;          
    }



    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): BarChartViewModel {
        let dataViews = options.dataViews;
       
        let viewModel: BarChartViewModel = {
            dataPoints: [],
            dataMax: 0,
            measure0: "",
            measure1: "",
            measure2 : "",
         };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values)
            return viewModel;

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];

        //stores values

        let dataValue0 = categorical.values[0];
        let dataValue1 = categorical.values[1];
        let dataValue2 = categorical.values[2];

        //stores measures name

        let value0Name = dataValue0.source.displayName;
        let value1Name = dataValue1.source.displayName;
        let value2Name = dataValue2.source.displayName;
       
        let barChartDataPoints: BarChartDataPoint[] = [];
        let dataMax: number;

        
        let objects = dataViews[0].metadata.objects;
        
        for (let i = 0, len = Math.max(category.values.length, dataValue0.values.length); i < len; i++) {
            
            barChartDataPoints.push({
                category: category.values[i] + '',
                value0 : dataValue0.values[i],
                value1 : dataValue1.values[i],
                value2 : dataValue2.values[i]
            })
           
        }
        dataMax = <number>dataValue0.maxLocal;

        return {
            dataPoints: barChartDataPoints,
            dataMax: dataMax,
            measure0: value0Name,
            measure1: value1Name,
            measure2 : value2Name,
            
        };
    }





   
    export class Visual implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private xAxis : d3.Selection<SVGElement>;
        private yAxis: d3.Selection<SVGElement>;
        private target: HTMLElement;
        private viewport: IViewport;
        private barDataPoints: BarChartDataPoint[];
        private host: IVisualHost;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            let svg = this.svg = d3.select(options.element).append('svg').classed('barVisual', true);
        }

        public update(options: VisualUpdateOptions) {


            this.svg.selectAll("*").remove();

            let viewModel: BarChartViewModel = visualTransform(options, this.host);
            this.barDataPoints = viewModel.dataPoints;

            this.viewport = options.viewport;
            let width = this.viewport.width;
            let height = this.viewport.height;
            var margins = {
                top: 0,
                right: 0,
                bottom: 100,
                left:150,
            }

            width = width - margins.right - margins.left;
            height = height - margins.top - margins.bottom;

            this.svg.attr({
                width: width  + margins.right + margins.left ,
                height: height + margins.top + margins.bottom
            })
              ;


           
                        
            var gWidth = width - 30;
           // this.svg.style("background-color", 'yellow');
         this.svg
            .append("g")
                .attr("transform", "translate(" + margins.left + "," + margins.right + ")");
               
            var xScale = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.2, 0.2);

            var yScale = d3.scale.linear()
                .range([height, 0]);


            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            let yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

        

            xScale.domain(viewModel.dataPoints.map(d => d.category));

            yScale.domain([0, viewModel.dataMax]);


            

            //Outer Bar : represents data for measure 1
                this.svg.selectAll('rect')
                    .data(viewModel.dataPoints)
                    .enter()
                    .append('rect')
                    .attr("height", 0)
                    .attr("y", height)
                    .transition().duration(3000)
                .delay(function (d, i) { return i * 200; })
                .attr({
                    "x": function (d) { return xScale(d.category) + 50; },
                    "y": function (d) { return yScale(<number>d.value0); },
                    "width": xScale.rangeBand(),
                    "height": function (d) { return height - yScale(<number>d.value0); }
                })
                    .style("fill", '#DDD1E7'); //light purple

            //Inner Bar : represents data for 2nd measure

                this.svg.selectAll('rect2')
                    .data(viewModel.dataPoints)
                    .enter()
                    .append('rect')
                    .attr("height", 0)
                    .attr("y", height)
                    .transition().duration(3000)
                    .delay(function (d, i) { return i * 200; })
                    .attr({
                        "x": function (d) { return xScale(d.category) + 60; },
                        "y": function (d) { return yScale(<number>d.value1); },
                        "width": xScale.rangeBand() - 20,
                        "height": function (d) { return height - yScale(<number>d.value1); }
                    })
                    .style("fill", '#885EAD'); //Dark purple

            //Round rectangle : Displays data for 3rd measure
                this.svg.selectAll('roundrect')  
                    .data(viewModel.dataPoints)
                    .enter()
                    .append('rect')
                    .attr("height", 0)
                    .attr("y", height)
                    .transition().duration(3000)
                    .delay(function (d, i) { return i * 200; })
                    .attr({
                        "x": function (d) {
                            return xScale(d.category) + 60;
                        },
                        "y" : function (d) {
                            return yScale(<number>d.value2);
                        },
                        "width": xScale.rangeBand() - 20,
                        "height": 10,
                        "rx": 5,
                        "ry" : 5
                    })
                    .style("fill", '#F4C430');          //yellow
                 


            //rect symbol for measure 1
                this.svg.append('rect') //value1
                    .attr("x", width + 50)
                    .attr("y", 50)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill", '#DDD1E7'); 

            //rect symbor for measure 2

                this.svg.append('rect') //value2
                    .attr("x", width + 50)
                    .attr("y", 70)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill", '#885EAD'); 

            //round rect symbol for measure 3

                this.svg.append('rect') //value3
                    .attr("x", width + 50)
                    .attr("y", 90)
                    .attr("rx", 5)
                    .attr("ry",5)
                    .attr("width", 20)
                    .attr("height", 10)
                    .style("fill", '#F4C430');


               
            //Displays name for measure 1

                this.svg.append('text')             //measure1
                    .attr("x", width + 50 + 25)
                    .attr("y", 60)
                    .text(viewModel.measure0);

            //Displays name for measure 2


                this.svg.append('text')         //measure2
                    .attr("x", width + 50 + 25)
                    .attr("y", 80)
                    .text(viewModel.measure1);


            //Displays name for measure 3
                this.svg.append('text')         //measure3
                    .attr("x", width + 50 + 25)
                    .attr("y", 100)
                    .text(viewModel.measure2);

                

              


            /*
                this.svg.selectAll('text')
                    .data(viewModel.dataPoints)
                    .enter()
                    .append('text')
                    .text(function (d) { return d.category; })
                    .attr('x', function (d) { return xScale(d.category) + xScale.rangeBand() / 2 ; })
                    .attr('y', function (d) { return yScale(<number>d.value) + 12; })
                    .style("fill", "white")
                    .style("text-anchor", "middle");
            */
                var gHeight = height - 100;

            this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(50, " + height + ")")
                .call(xAxis)
                .selectAll('text')
                .attr("transform", "rotate(-60)")
                .attr("dx", "-.8em")
                .attr("dy", ".25em")
                .style("text-anchor", "end")
                .style("font-size", "12px");
                
           this.svg.append("g")
               .attr("class", "y axis")
               .attr("transform", "translate(50, " + 0 + ")")
               .call(yAxis)
                .style("font-size", "12px");



                
        }
    }
}
