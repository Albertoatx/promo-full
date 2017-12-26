'use strict';

/**
 * @ngdoc function
 * @name promotorApp.controller:PromotorDetailCtrl
 * @description
 * # PromotorDetailCtrl
 * Controller of the promotorApp
 */
angular.module('promotorApp')
    .controller('PromotorDetailCtrl', ['$scope', '$log', 'promotoresFactory', '$routeParams','$location',
	    function ($scope, $log, promotoresFactory, $routeParams, $location) {

			  $scope.viewPromotor = true; //Vamos a usar "tabs" para la navegación
			  $scope.coordenadas = {};
			  $scope.resultados = {};
			  $scope.promotorDatos = {}; //Vaciamos el objeto movie del $scope
			  $scope.promotorDatos._id = $routeParams.id;
			  console.log($scope.promotorDatos._id);

			  //TRAER EL DETALLE
			  promotoresFactory.detailPromotor($scope.promotorDatos._id).then(
		            function(response) {
		                $scope.promotorDatos = response.data;
		                $log.info($scope.promotorDatos);

		                if ($scope.promotorDatos.direcp !== undefined) { //Solo mostramos el mapa si hay una dirección

					        var address = $scope.promotorDatos.direcp.callep + "," + $scope.promotorDatos.direcp.pueblo;
					         
					         /* Cannot read property 'then' of undefined
					         promotoresFactory.getMaps(address).then(
						            function(data) {
						                $scope.resultados = data;
						                console.log($scope.resultados);
						                //$log.info($scope.promotorDatos);
						            },
						            function(err) {
						                $log.error(err);
						            }
					         ); */

				         
					         promotoresFactory.getMaps(address);
					         //console.log(promotoresFactory.geocoder); //undefined
					         console.log(promotoresFactory.getGeocoder());
					         console.log(promotoresFactory.getCoordenadas());
					         $scope.coordenadas = promotoresFactory.getCoordenadas();
					         console.log($scope.coordenadas);
				         }
		            },
		            function(err) {
		                $log.error(err);
		            }
	          );




	        //Cuando se pinche en el boton "Back" redirigimos al listado de promotores
            $scope.back = function() {
              $location.path('/promotores');  
            };

            $scope.mostrarMapav2 = function() {

            	var address = $scope.promotorDatos.direcp.callep + "," + $scope.promotorDatos.direcp.pueblo;
            	console.log('Dentro de mostrarMapav2');
            	//console.log($scope.resultados);

/*
            	promotoresFactory.getMaps(address).then(
		            function(response) {
		                $scope.resultados = response;
		                console.log($scope.resultados);
		                //$log.info($scope.promotorDatos);
		            },
		            function(err) {
		                $log.error(err);
		            }
	            );*/

	            $scope.rutaImagen = "http://maps.google.com/maps/api/staticmap?sensor=false&center="
							+ promotoresFactory.getCoordenadas().latitud
							+ ","
							+ promotoresFactory.getCoordenadas().longitud
							+ "&zoom=4&size=300x400&markers=color:red|label:P|"
							+ promotoresFactory.getCoordenadas().latitud + "," + promotoresFactory.getCoordenadas().longitud; 
            	
            };


            $scope.mostrarMapa = function() {

            	console.log('Dentro de MOSTRAR mapa');

            	var geocoder = new google.maps.Geocoder();	
            	var address = $scope.promotorDatos.direcp.callep + "," + $scope.promotorDatos.direcp.pueblo;
            	var latitud, longitud;

            	//geocoder.geocode( {'address': address, 'key':AIzaSyAYPE5eUENmWQ4ci3EkbTBR3C1c45qb9tA}, function(results, status) {
            	$scope.resultados = 
            	geocoder.geocode( {'address': address}, function(results, status) {
			      if (status == google.maps.GeocoderStatus.OK) {

			      	  console.log('Resultados DENTRO de la función Geocode');
			      	  console.log(results[0].geometry);
			      	  $scope.coordenadas.latitud  = results[0].geometry.location.lat();
			      	  $scope.coordenadas.longitud = results[0].geometry.location.lng();

			      	  //AQUI no dibuja nada (aunque las coordenadas las recupera OK)
				      /*$scope.rutaImagen = "http://maps.google.com/maps/api/staticmap?sensor=false&center="
							+ $scope.coordenadas.latitud
							+ ","
							+ $scope.coordenadas.longitud
							+ "&zoom=4&size=300x400&markers=color:red|label:P|"
							+ $scope.coordenadas.latitud + "," + $scope.coordenadas.longitud; */
					  return results;
			      } 

			      else {
			        	alert("Geocode was not successful for the following reason: " + status);
			        	return results;
			      }
			    });

            	console.log('Resultados FUERA de la función Geocode');
            	console.log($scope.coordenadas);
            	console.log($scope.resultados);
            	latitud  = $scope.resultados.location.lat();
			    longitud = $scope.resultados.location.lng();
			    console.log('latitud: ' + latitud);
			    console.log('longitud: ' + longitud);


			    //console.log(longitud);
			   $scope.rutaImagen = "http://maps.google.com/maps/api/staticmap?sensor=false&center="
							+ latitud
							+ ","
							+ longitud
							+ "&zoom=4&size=300x400&markers=color:red|label:P|"
							+ latitud + "," + longitud; 

			};

            $scope.verMapa = function() {
            	
            	//var latitud = 43.305173;
            	//var longitud = -8.506325;

            	/*var url = 'http://maps.googleapis.com/maps/api/geocode/OUTPUT?address='
            			 + $scope.promotorDatos.direcp.callep
            			 + ","
            			 + $scope.promotorDatos.direcp.pueblo
            			 +'&sensor=true';

                console.log(results[0].geometry); */

				/*  $scope.itemTerremoto = terremotosFactory.getTerremoto($routeParams.id);
				  var latitud  =  $scope.itemTerremoto.geometry.coordinates[1];
				  var longitud =  $scope.itemTerremoto.geometry.coordinates[0]; */
				  
				 /* $scope.rutaImagen = "http://maps.google.com/maps/api/staticmap?sensor=false&center="
							+ latitud
							+ ","
							+ longitud
							+ "&zoom=4&size=300x400&markers=color:red|label:P|"
							+ latitud + "," + longitud; */
            };
		}
	]);