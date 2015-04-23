(function () {
  'use strict';

  angular.module('myApp.controllers')
    .controller('DemoChartCtrl', ['$scope', function($scope){
      
      $scope.d3DataBubble = [
        {
          "id": 1,
          "name": "R1",  
          "impacto": -20,
          "probabilidade": 10,
          "tamanho": 15,
          "sinal": "verde"
        }, 
        {
          "id": 2,
          "name": "R2",  
          "impacto": 25,
          "probabilidade": 20,
          "tamanho": 16
        }, 
        {
          "id": 2,
          "name": "R2",  
          "impacto": 45,
          "probabilidade": 20,
          "tamanho": 17
        }, 
        {
          "id": 3,
          "name": "R3",  
          "impacto": 40,
          "probabilidade": 10,
          "sinal": "amarelo",
          "tamanho": 10
        }, 
        {
          "id": 3,
          "name": "R3",  
          "impacto": 60,
          "probabilidade": 40,
          "sinal": "amarelo",
          "tamanho": 19
        }, 
        {
          "id": 5,
          "name": "R5",  
          "impacto": 80,
          "probabilidade": 5,
          "sinal": "verde",
          "tamanho": 20
        },
        {
          "id": 7,
          "name": "R7",  
          "impacto": 55,
          "probabilidade": 60,
          "sinal": "vermelho",
          "tamanho": 21
        },
        {
          "id": 7,
          "name": "R7",  
          "impacto": -30,
          "probabilidade": 80,
          "sinal": "vermelho",
          "tamanho": 22
        },
        {
          "id": 1,
          "name": "R1",  
          "impacto": 30,
          "probabilidade": 30,
          "sinal": "verde",
          "tamanho": 30
        },
      ];

    }]);
}());
