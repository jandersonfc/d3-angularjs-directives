(function () {
  'use strict';

  angular.module('myApp.directives')
    .directive('d3MatrixIpChart', ['d3', function(d3) {
      return {
        restrict: 'EA',
        scope: {
          data: "=",
          label: "@",
          valuex: "@",
          valuey: "@",
          bubbleClass: "@",
          connectDuplicatedBy: "@",
          onClick: "&"
        },
        link: function(scope, iElement, iAttrs) {
          var margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom,
          color = d3.scale.category20(),
          size_bubbles = 15;

          var svg = d3.select(iElement[0])
              .append("svg")
              .attr("width", "100%")
              .attr("height", height)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };
          scope.$watch(function(){
              return angular.element(window)[0].innerWidth;
            }, function(){
              return scope.render(scope.data);
            }
          );

          // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          function contains(a, obj) {
              var i = a.length;
              while (i--) {
                 if (a[i] === obj) {
                     return true;
                 }
              }
              return false;
          }

          // define render function
          scope.render = function(data){

            scope.connectDuplicatedBy = scope.connectDuplicatedBy || false;

            if (scope.connectDuplicatedBy){
              var ids = [];
              var data_duclicated = [];
              var data_without_duplicated = [];
              if (data && data.length > 0 ){
                for (var i = 0; i < data.length; i++) {
                  if (contains(ids, data[i][scope.connectDuplicatedBy])){
                    data_duclicated.push(data[i]);
                  } else {
                    ids.push(data[i][scope.connectDuplicatedBy]);
                    data_without_duplicated.push(data[i]);
                  }
                };  
              }  
            }

            svg.selectAll("*").remove();

            //sample axis with min and max domain dynamically 
            var xRange = d3.scale.linear()
              .range([margin.left, width])
              .domain(
                [d3.min(data, function (d) {
                  return d[scope.valuex] * -1;
                }),
                d3.max(data, function (d) {
                return d[scope.valuex];
                })
                ]
              );

            //var xRange = d3.scale.linear()
            //  .range([margin.left, width])
            //  .domain([0,100]);
            
             var yRange = d3.scale.linear()
              .range([height - margin.bottom - margin.top, 0])
              .domain([0,100]);
            
            var xAxis = d3.svg.axis()
              .scale(xRange)
              .orient("bottom");
            
            var yAxis = d3.svg.axis()
              .scale(yRange)
              .orient("left")
              .tickFormat(function (d){
                if (d !== 0){
                  return d;
                } else {
                  return "";
                }
              });

            var positionLabelX = d3.max(data, function (d) {
              return (xRange(d[scope.valuex]) / 2) + margin.left + margin.right;
            }); 

            var positionLabelY = d3.max(data, function (d) {
              return (yRange(d[scope.valuey]) / 2) - margin.top;
            });

            var positionYAxis = d3.max(data, function (d) {
              return (xRange(d[scope.valuex]) / 2) + margin.left - margin.right;
            });   

            svg.append("g")
              .attr("class", "x axis")
              .call(xAxis)
              .attr("transform", "translate(0,"+(height - margin.bottom - margin.top)+")")
            .append("text")
              .attr("x", positionLabelX)
              .attr("y", margin.bottom)
              .attr("dy", "-.71em")
              .style("text-anchor", "end")
              .text(scope.valuex);

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .attr("transform", "translate("+positionYAxis+",0)")
            .append("text")
              .attr("x", margin.right)
              .attr("y", -margin.top)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(scope.valuey);
           
            if (scope.connectDuplicatedBy){
              // define arrow markers for graph links
              var defs = svg.append('svg:defs');
              defs.append('svg:marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', size_bubbles+9)
                .attr('markerWidth',7)
                .attr('markerHeight', 7)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5');
              
              // add new paths
              for (var i = 0; i <  data_without_duplicated.length; i++) {
                for (var j = 0; j < data_duclicated.length; j++) {
                  if (data_without_duplicated[i][scope.connectDuplicatedBy] === data_duclicated[j][scope.connectDuplicatedBy]){
                    
                    data_without_duplicated[i].x = xRange(data_without_duplicated[i][scope.valuex]);
                    data_without_duplicated[i].y = yRange(data_without_duplicated[i][scope.valuey]);

                    data_duclicated[j].x = xRange(data_duclicated[j][scope.valuex]);
                    data_duclicated[j].y = yRange(data_duclicated[j][scope.valuey]);

                    /*if (data_without_duplicated[i].x < data_duclicated[j].x){
                      data_without_duplicated[i].x0 = size_bubbles;
                      data_duclicated[j].x0 = -size_bubbles;
                    } else if (data_without_duplicated[i].x > data_duclicated[j].x){
                      data_without_duplicated[i].x0 = -size_bubbles;
                      data_duclicated[j].x0 = size_bubbles;
                    } else {
                      data_without_duplicated[i].x0 = 0;
                      data_duclicated[j].x0 = 0;
                    }

                    if (data_without_duplicated[i].y < data_duclicated[j].y && data_without_duplicated[i].x0 == 0){
                      data_without_duplicated[i].y0 = size_bubbles;
                      data_duclicated[j].y0 = -size_bubbles;
                    } else if (data_without_duplicated[i].y > data_duclicated[j].y && data_without_duplicated[i].x0 == 0){
                      data_without_duplicated[i].y0 = -size_bubbles;
                      data_duclicated[j].y0 = size_bubbles;
                    } else {
                      data_without_duplicated[i].y0 = 0;
                      data_duclicated[j].y0 = 0;
                    }*/

                    var o = {
                        source: {
                          x: (data_without_duplicated[i].x),
                          y: (data_without_duplicated[i].y)
                        },
                        target: {
                          x: (data_duclicated[j].x),
                          y: (data_duclicated[j].y)
                        }
                    }

                    var line = svg.append("svg:path")
                      .attr("class", "link")
                      .style('marker-end', 'url(#end-arrow)')
                      .attr("d", "M" + o.source.x + "," + o.source.y + " L" + o.target.x +","+ o.target.y );
                  }
                }
              }
            }

           var node = svg.selectAll(".node")
              .data(data)
              .enter().append("g")
              .attr("class", "node")
              .attr("x", function(d) {
                return xRange (d[scope.valuex]); 
              })
              .attr("y", function(d) {
                return yRange (d[scope.valuey]); 
              })
              .attr("transform", function(d){
                return "translate("+xRange(d[scope.valuex])+","+yRange(d[scope.valuey])+")";
              });

            node.append("title")
              .text(function(d) { 
                return d[scope.label] + '\n' +
                  scope.valuex +':'+ d[scope.valuex] + '\n' +
                  scope.valuey +':'+ d[scope.valuey]; 
              });

            node.append("circle")
              .attr("class", function(d){
                return "bubble "+ d[scope.bubbleClass];
              })
              .attr("r", size_bubbles);

            node.append("text")
              .attr("dy", ".3em")
              .style("text-anchor", "middle")
              .text(function(d) {
                return d[scope.label].substring(0, size_bubbles / 3); 
              });   
            
          };
        }
      };
    }]);

}());
