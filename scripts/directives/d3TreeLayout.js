(function () {
  'use strict';

  angular.module('myApp.directives')
    .directive('d3TreeLayout', ['d3', function(d3) {

      //### Start Return Directive  ###
      return {
      restrict: 'EA',
      scope: {
        data: "=",
        nodeTitle: "@",
        nodeDescription: "@",
        nodeClass: "@",
        nodeWidth: "@",
        nodeHeight: "@",
        nodeTextLength: "@",
        nodeNumbersOfLines: "@",
        onClick: "&"
      },
      link: function(scope, iElement, iAttrs) {

        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 20;

        //count id Generated
        var count = 0;

        //duration of effect 
        var duration = 750;

        //control click duplicated events
        var lastClick = false;

        var root;

        //necessary to calculate links 
        var sourceLastId;

        // size of the diagonalgram
        var viewerWidth = iElement.parent()[0].offsetWidth != "0" ? iElement.parent()[0].offsetWidth : "100%" ;
        var viewerHeight = iElement.parent()[0].offsetHeight != "0" ? iElement.parent()[0].offsetHeight : ($(window).outerHeight(true) - $("header").outerHeight(true) - $(".navbar").outerHeight(true) - $("footer").outerHeight(true) - 9 );

        var tree = d3.layout.tree()
            .size([viewerHeight, viewerWidth]);

        // define a d3 diagonal projection for use by the node paths later on.
        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            });

        // A recursive helper function for performing some setup by walking through all nodes
        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        };

        // Define the zoom function for the zoomable tree
        function zoom() {
            svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }


        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 2]).on("zoom", function(d){
            zoom();
        });

        // Function to align to left and center node when clicked.
        function leftCenterNode(source) {
            var scale = zoomListener.scale();
            var x = -source.y0;
            var y = -source.x0;
            x = x * scale + (10);
            y = y * scale + viewerHeight / 2;
            d3.select('g').transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        };

        // Function to align to center node when clicked.
        function centerNode(source) {
            var scale = zoomListener.scale();
            var x = -source.y0;
            var y = -source.x0;
            x = x * scale + viewerWidth / 2;
            y = y * scale + viewerHeight / 2;
            d3.select('g').transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
            source.x = x;
            source.y = y;
            return source;
        };

        // Toggle children function

        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }

        function markSelected(item){
            var rect = svgGroup.selectAll("rect")
                .attr('class', function(d){
                    if (item && d.uniqueId === item.uniqueId){
                        return 'nodeRect '+ d[scope.nodeClass] +' nodeSelected';
                    } else {
                        return 'nodeRect '+ d[scope.nodeClass];
                    }
                });
        }

        //necessary to guarantee only click per second
        function verifyDuplicatedClick(event){
            if (lastClick){
                var actualDate = new Date(event.timeStamp);
                var diff = ((actualDate - lastClick) / 1000);
                if ( diff <= 0.5 ) return true;    
            }

            //set date of last click
            lastClick = new Date(event.timeStamp);

            return false
        }

        //click and center node
        function click(d) {
            d3.event.stopPropagation();
            if (verifyDuplicatedClick(d3.event)) return;

            var itemCenter = centerNode(d);
            markSelected(itemCenter);
            return scope.onClick({item: itemCenter});
        };

        //click to expand childrens
        function click_btn(d) {
            d3.event.stopPropagation();
            if (verifyDuplicatedClick(d3.event)) return;

            if (d.status && d.status !== 'disabled'){
                d = toggleChildren(d);
                update(d);
                var parent_node = d.parent;
                if (d.status === 'closed'){
                    if (parent_node){
                        if(!parent_node.parent) parent_node.y0 = 0;
                        leftCenterNode(parent_node);
                    } else {
                        leftCenterNode(d);
                    }
                } else if(d.status === 'opened') {
                    leftCenterNode(d);
                } else if(parent_node && d.status === 'opened') {
                    leftCenterNode(d);
                }
            }
        };

        //generate unique id to garantee an identify to each node 
        function generateUUID(){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return uuid;
        }

        //calculate number of lines and delimiter to the description
        function insertSpanDescription(nodeTxt, j){
          var newTspan = nodeTxt.append('tspan')
            .attr("x", 5)
            .attr('class', 'nodeDescription')
            .attr("dy", "15")
            .text(function(d, i){
                if (!d[scope.nodeDescription]) return "";
                if (!d.actualStartIndex) d.actualStartIndex = 0;

                var word = d[scope.nodeDescription].substring(d.actualStartIndex).trim();

                var words = word.split(" ");
                var new_word = words[0].trim();
                for (var x = 1; x < words.length; x++) {
                    var verify_word = new_word + " " + words[x].trim();

                    if (verify_word.length <= scope.nodeTextLength) {
                        new_word = verify_word;
                    } else {
                        break;
                    }
                }

                //truncate
                if (new_word !== "" &&
                    scope.nodeNumbersOfLines == j &&
                    d[scope.nodeDescription].length > (scope.nodeTextLength*j) ){
                    new_word = new_word + "...";
                }

                if (j >= scope.nodeNumbersOfLines){
                    d.actualStartIndex = 0;
                } else {
                    d.actualStartIndex = (d.actualStartIndex+new_word.length+1);
                }

                return new_word;
          });
        }

        function update(source) {

            // If we don't pass any data, return out of the element
            if (!root) return;

            scope.nodeWidth = scope.nodeWidth ? parseInt(scope.nodeWidth) : 100;
            scope.nodeHeight = scope.nodeHeight ? parseInt(scope.nodeHeight) : 100;

            scope.nodeTextLength = scope.nodeTextLength ? parseInt(scope.nodeTextLength) : 11;
            scope.nodeNumbersOfLines = scope.nodeNumbersOfLines ? parseInt(scope.nodeNumbersOfLines) : 3;

            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.

            var levelWidth = [1];
            var dDepth = [1];
            var childCount = function(level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);
                    dDepth[level + 1] = n.depth+1;
                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function(d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            var maxDepth = d3.max(dDepth);
            var maxNodeChild = d3.max(levelWidth);
            var newHeight = maxNodeChild * (scope.nodeHeight * (maxDepth + 0.1));
            tree = tree.size([newHeight, viewerWidth]);

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Set widths between levels based on node width.
            nodes.forEach(function(d) {
                d.y = (d.depth * (scope.nodeWidth * 2));
            });

            // Update the nodes…
            var node = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.uniqueId || (d.uniqueId = ++count);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    //verify if has one unique ID, else create one

                    if (!d.uniqueId) d.uniqueId = generateUUID();

                    return "translate(" + source.y0  + "," + source.x0 + ")";
                })
                .on("dblclick", function() { d3.event.stopPropagation(); })
                .on("mousedown", function() { d3.event.stopPropagation(); })
                .on('click', click);

            //set tooltip with title and description
            nodeEnter.append("svg:title")
              .text(function(d, i) {
                var tooltip = d[scope.nodeTitle];
                if(d[scope.nodeDescription]) tooltip = tooltip+"\n"+d[scope.nodeDescription];
                return tooltip;
              });

            //add node
            var nodeRect = nodeEnter.append("rect")
                .attr('class', function(d){
                  return 'nodeRect '+ d[scope.nodeClass];
                })
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("y", function (d) {
                  return -(scope.nodeHeight/2);
                })
                .attr("width", function (d) {
                  return scope.nodeWidth;
                })
                .attr("height", function (d) {
                  return scope.nodeHeight;
                });

            //set title
            var nodeTxt = nodeEnter.append("text")
                .attr("x", function(d) {
                  return 5;
                })
                .attr("dy", function(d, i){
                  return -(scope.nodeHeight/4);
                })
                .attr('class', 'nodeText')
                .style("fill-opacity", 0);

            //Title
            nodeTxt.append('tspan')
              .attr("x", function(d) {
                return 5;
              })
              .attr('class', 'nodeTitle')
              .text(function(d, i) {
                if (!d[scope.nodeTitle]) d[scope.nodeTitle] = "";
                if (d[scope.nodeTitle].length > scope.nodeTextLength){
                  if (!d[scope.nodeTitle]) d[scope.nodeTitle] = "";
                  var word = d[scope.nodeTitle].substring(0, scope.nodeTextLength);
                  word = word + "...";
                  return word;
                } else {
                  return d[scope.nodeTitle];
                }

              });

            //Description
            for (var j=1; j <= scope.nodeNumbersOfLines; j++){
                insertSpanDescription(nodeTxt, j);
            }

            //add button to collapse and expand a node
            var swi = node.append('svg:switch');
            swi.append('svg:foreignObject')
                .style("cursor", "default")
                .attr("rx", 1)
                .attr("ry", 1)
                .attr("x", function (d) {
                    return scope.nodeWidth + 4;
                })
                .attr("y", function (d) {
                    return -(15);
                })
                .attr("width", function (d) {
                    return 24;
                })
                .attr("height", function (d) {
                    return 32;
                })
                .append("xhtml:body")
                .attr("class", "overlay")
                .html(function(d){
                    d.status = null;
                    if (d.children && d.children.length > 0){
                        d.status = "opened";
                    } else if(d._children && d._children.length > 0){
                        d.status = "closed";
                    }
                    if (d.status){
                        return '<button class="btn btn-default btn-xs nodeButton '+d.status+'"></button>';
                    }
                })
                .on("dblclick", function() { d3.event.stopPropagation(); })
                .on("mousedown", function() { d3.event.stopPropagation(); })
                .on('click', click_btn);
            
            //recalculate attributes of nodeRect 
            node.select("rect.nodeRect")
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("y", function (d) {
                  return -(scope.nodeHeight/2);
                })
                .attr("width", function (d) {
                  return scope.nodeWidth;
                })
                .attr("height", function (d) {
                  return scope.nodeHeight;
                });

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("rect")
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 0)
                .attr("height", 0);

            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Update the links…
            var link = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.uniqueId;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", function(d, i) {
                    if (i === 0) sourceLastId = undefined;
                    var new_source = d.source;
                    if (sourceLastId === undefined || sourceLastId !== new_source.uniqueId){
                      new_source.y = new_source.y + scope.nodeWidth;
                      sourceLastId = new_source.uniqueId;
                    }
                    var new_target = d.target;
                    if (new_target.children && new_target.children.length > 0){
                      new_target.y = d.target.y - scope.nodeWidth;
                    }
                    return diagonal({
                        source: new_source,
                        target: new_target
                    });
                });

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            markSelected(null);

            // Stash the old positions for transition.
            nodes.forEach(function(d, i) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        };

        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = d3.select(iElement[0]).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
            .attr("class", "overlay")
            .call(zoomListener);

        // Append a group which holds all nodes and which the zoom Listener can act upon.
        var svgGroup = baseSvg.append("g");

          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };
          scope.$watch(function(){
              return angular.element(window)[0].innerWidth;
            }, function(){
              return update(scope.data);
            }
          );

          // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {

            if (!newVals) return;

            // Call visit function to establish maxLabelLength
            visit(newVals, function(d) {
                totalNodes++;
            }, function(d) {
                return d.children && d.children.length > 0 ? d.children : null;
            });

            // Define the root
            root = newVals;

            root.x0 = viewerHeight / 2;
            root.y0 = 0;

            // Layout the tree initially and center on the root node.
            var result = update(root);
            leftCenterNode(root);

            return result;

          }, false);
        }
    };
    //### End Return Directive  ###

    }]);

}());
