'use strict';

/**
 * @ngdoc function
 * @name promotorApp.controller:ObrasPromotorCtrl
 * @description
 * # ObrasPromotorCtrl
 * Controller of the promotorApp
 */
angular.module('promotorApp')

  .controller('ObrasPromotorCtrl', ['$scope', '$log', 'promotoresFactory', '$location', '$routeParams','$rootScope',

      function($scope, $log, promotoresFactory, $location, $routeParams, $rootScope) {

          console.log($rootScope);
          
          $scope.promotorid = $routeParams.id;
          /*$scope.promotorname= $routeParams.nombre;*/

          //Llama al método "getObrasPromotor" de la API del front definido en "factorias.js"
          promotoresFactory.getObrasPromotor($routeParams.id).then(      
              function(response) {  
                  //En el $scope estarán los datos devueltos por el servicio REST a la factoria.       
                  $scope.obras = response.data; 
              },
              function(err) {
                  $log.error(err);
          });


          //Cuando se pinche en el boton "No" redirigimos al listado de promotores
          $scope.back = function() {
            $location.path('/promotores'); 
            //$location.path('/obraspromotor/' + $routeParams.id);  
          };

      }
  ]);