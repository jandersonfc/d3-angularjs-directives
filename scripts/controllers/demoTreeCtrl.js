(function () {
  'use strict';

  angular.module('myApp.controllers')
    .controller('DemoTreeCtrl', ['$scope', function($scope){
      
      $scope.showObj = function(item){
        $scope.item = item;
        console.log($scope.item);
      }

      $scope.d3Data = 
        { id:1,
          name: "flare teste para quebrar linha até eu enjoar",
          size: "Codigo ou algo assim vamos que vamos",
          type: "pai",
          _children: [
          {
            id:2,
            name: "analytics",
            type: "filho",
            size: 743,
            _children: [
              {
                id:2,
                name: "cluster",
                type: "neto",
                size: 744,
                _children: [
                {
                    id:3,
                    name: "Primeilinha secondalinh terceiralin quartalinha",
                    size: 3938,
                    type: "neto",
                    _children:[]
                }, 
                {
                    id:4,
                    name: "CommunityStructure",
                    size: 3812,
                    type: "neto",
                    _children:[]
                }, 
                {
                    id:5,
                    name: "HierarchicalCluster",
                    size: 6714,
                    type: "neto",
                    _children:[]
                }, 
                {
                    id:6,
                    name: "MergeEdge",
                    size: 743,
                    type: "neto",
                    _children:[]
                }]
              }, 
              {
                id:7,
                name: "graph",
                size: 743,
                type: "neto",
                _children: [{
                    id:8,
                    name: "BetweennessCentrality",
                    size: 3534,
                    type: "neto",
                    _children: [
                        {
                            id:9,
                            name: "vamos lá testar isso aí",
                            size: 309803424,
                            type: "neto",
                            _children: [
                                {
                                    id:10,
                                    name: "vamos lá testar isso aí",
                                    size: 309803425,
                                    type: "neto",
                                    _children: [
                                        {
                                            id:11,
                                            name: "vamos lá testar isso aí",
                                            size: 309803426,
                                            type: "neto",
                                            _children: [
                                                {
                                                    id:12,
                                                    name: "vamos lá testar isso aí",
                                                    size: 309803427,
                                                    type: "neto",
                                                    _children: [
                                                        {
                                                            id:13,
                                                            name: "vamos lá testar isso aí",
                                                            size: 309803428,
                                                            type: "neto",
                                                            _children:[]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }, {
                    id:14,
                    name: "LinkDistance",
                    size: 5731,
                    type: "neto",
                    _children:[]
                }, {
                    id:15,
                    name: "MaxFlowMinCut",
                    size: 7840,
                    type: "neto",
                    _children:[]
                }, {
                    id:16,
                    name: "ShortestPaths",
                    size: 5914,
                    type: "neto",
                    _children:[]
                }, {
                    id:17,
                    name: "SpanningTree",
                    size: 3416,
                    type: "neto-folha",
                    _children:[]
                }]
              }
            ]
        }]
      };

    }]);
}());
