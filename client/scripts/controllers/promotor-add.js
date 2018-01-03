'use strict';

/**
 * @ngdoc function
 * @name promotorApp.controller:PromotorAddCtrl
 * @description
 * # PromotorAddCtrl
 * Controller of the promotorApp
 */
angular.module('promotorApp')

   .controller('PromotorAddCtrl', ['$scope', '$log', 'promotoresFactory', '$location',
    	//Llama al "savePromotor" de la API del front (en "factorias.js") que se comunicarse con el backend mediante servicio REST a la ruta adecuada
        function($scope, $log, promotoresFactory, $location) {

            $scope.promotorDatos = {};              //Creamos el objeto promotor y lo adjuntamos a $scope
            $scope.promotorDatos.direcp = {}; 
            $scope.pantallaAddP = true;
            
            $scope.isError = false;      
            $scope.errorMsg = '';   
                  
        
            $scope.guardarPromotor = function() {   //Crear un nuevo promotor
              /*
              if ($scope.promotorDatos  && $scope.promotorDatos.codigop !== "" 
                                        && $scope.promotorDatos.nombrep !== "" 
                                        && $scope.promotorDatos.emailp  !== ""
                                        && $scope.promotorDatos.direcp.provincia !== "") { 

                  console.log("ENTRA EN IF para dar de alta un promotor"); */
                  console.log($scope.promotorDatos);
                  
                  promotoresFactory.savePromotor($scope.promotorDatos).then(
                    function() {
                        $location.path('/promotores'); //Una vez guardado el promotor redirigimos al listado de los promotores
                    },
                    function(err) {
                        $scope.isError = true;
                        $scope.errorMsg = err; 
                        $log.error('error en guardarPromotor');
                    }
                  ); 

            /*  }  *///end if

            }; //guadarPromotor
        
            
			//Redirigimos al listado de promotores
			$scope.back = function () {
				$location.path('/promotores'); 
			};

        }
    ]);
