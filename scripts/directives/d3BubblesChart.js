(function () {
  'use strict';

  angular.module('myApp.directives')
    .directive('d3BubblesChart', ['d3', function(d3) {
      return {
        restrict: 'EA',
        scope: {
          data: "=",
          label: "@",
          valuex: "@",
          valuey: "@",
          values: "@",
          bubbleClass: "@",
          onClick: "&"
        },
        link: function(scope, iElement, iAttrs) {
          var margin = {top: 40, right: 40, bottom: 40, left: 40},
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom,
          color = d3.scale.category20();

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

          // define render function
          scope.render = function(data){
          
            svg.selectAll("*").remove();

            //sample axis with min and max domain dynamically 
            var xRange = d3.scale.linear()
              .range([margin.left, width])
              .domain(
                [d3.min(data, function (d) {
                  return d[scope.valuex];
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
              .domain(
                [d3.min(data, function (d) {
                  return d[scope.valuey];
                }),
                d3.max(data, function (d) {
                return d[scope.valuey];
                })
                ]
              );

             //var yRange = d3.scale.linear()
             // .range([height - margin.bottom - margin.top, 0])
             // .domain([0,100]);
            
            var xAxis = d3.svg.axis()
              .scale(xRange)
              .orient("bottom");
            
            var yAxis = d3.svg.axis()
              .scale(yRange)
              .orient("left");

            var positionX = d3.max(data, function (d) {
                return (xRange(d[scope.valuex]) / 2) + margin.left;
              }); 

            svg.append("g")
              .attr("class", "x axis")
              .call(xAxis)
              .attr("transform", "translate(0,"+(height - margin.bottom - margin.top)+")")
            .append("text")
              .attr("x", positionX)
              .attr("y", margin.bottom)
              .attr("dy", "-.71em")
              .style("text-anchor", "end")
              .text(scope.valuex);

             var positionY = d3.max(data, function (d) {
                return (yRange(d[scope.valuey]) / 2) - margin.top;
              }); 

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .attr("transform", "translate("+margin.left+",0)")
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", -positionY)
              .attr("y", -margin.left)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(scope.valuey);

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
                  scope.valuey +':'+ d[scope.valuey] + '\n' +
                  scope.values +':'+ d[scope.values];
              });

            node.append("circle")
              .attr("class", function(d){
                return "bubble "+ d[scope.bubbleClass];
              })
              .attr("r", function(d){
                return d[scope.values];
              });

            node.append("text")
              .attr("dy", ".3em")
              .style("text-anchor", "middle")
              .text(function(d) {
                return d[scope.label].substring(0, d[scope.values] / 3); 
              });   
            
          };
        }
      };
    }]);

}());
