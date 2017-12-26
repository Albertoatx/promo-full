'use strict';
//angular.module('promotorApp.factorias', [])
 angular.module('promotorApp')

    //Ya que vamos a tratar con datos usando un servicio web en el backend (usando nuestra api definida en "api.js"), creamos factorias para 
    //comunicarnos con dicho servicio web en el backend. 
    //Por tanto aquí crearemos nuestros servicios factoria que harán las operaciones CRUD
    //Ver esta factoria como una API en el frontend para comunicarse con nuestra API definida en el backend con ExpressJS
    // (Normalmente se define 1 funcionalidad en el front para cada funcionalidad en el backend haciendo una petición a la ruta ExpressJS apropiada)
    //NOTA: Los controladores de Angular serán quienes trabajen con estas factorias que definimos aqui.
    .factory('promotoresFactory', ['$http',
        function($http) {

           // Sin salida a Internet esta instruccion google = undefined ya que no ha podido descargar el script
           //   y esto tenia como efecto secundario que no se recuperasen los promotores
           // var geocoder = new google.maps.Geocoder();  
           // var coordenadas = {'latitud':0.0, 'longitud':0.0};

            return {

                //PROMOTORES *********************************************************************************
                getPromotores: function() {  
                    //return $http.get('/api/promotores'); //$http devuelve una promesa
                    return $http.get('/api/promotores');  //Llama al servicio web REST del backend encargado de atender la ruta "/api/pages"
                },
                savePromotor: function(promotorData) {  
                 	return $http.post('/api/promotores/add', promotorData);       
                },
                detailPromotor: function(id) {  
                    return $http.get('/api/promotores/' + id);  
                },
                editPromotor: function(id, promotorData) {  
                    return $http.put('/api/promotores/' + id, promotorData);  
                },
                deletePromotor: function(id) {
                    return $http.delete('/api/promotores/' + id); 
                },
                misPromotores: function(username) {  
                    return $http.get('/api/mispromotores/' + username);  
                },

                //OBRAS *************************************************************************************
                getObrasAll: function() {  
                    return $http.get('/api/promociones');  
                },
                getObrasPromotor: function(id) {  
                    return $http.get('/api/promociones/' + id);  
                },
                saveObra: function(id, obraData) {  
                    return $http.post('/api/promociones/add/' + id, obraData);       
                },
                detailObra: function(id, codObra) {  
                    return $http.get('/api/promociones/' + id + '/' + codObra);  
                },
                editObra: function(id, codObra, obraData) {  
                    return $http.put('/api/promociones/' + id + '/' + codObra, obraData);  
                },  //Ojo, es POST porque el borrado NO es de todo el documento, solo de 1 elemento embebido 
                deleteObra: function(id, codObra) {
                    return $http.post('/api/promociones/' + id + '/' + codObra);
                },

                //GOOGLE MAPS **********************************************************************************
                getMaps: function(address) {   
                    //return $http.get(address); 

                    var geocoder = new google.maps.Geocoder(); 
                    var coordenadas = {'latitud':0.0, 'longitud':0.0};


                    geocoder.geocode( {'address': address}, function(results, status) {

                      if (status == google.maps.GeocoderStatus.OK) {
                          console.log('Resultados en la fatoria de la función getMaps');
                          console.log(results[0].geometry);
                          var latitud  = results[0].geometry.location.lat();
                          var longitud = results[0].geometry.location.lng();       
                          coordenadas.latitud  = results[0].geometry.location.lat();    
                          coordenadas.longitud = results[0].geometry.location.lng();             
                      } 
                      else {
                            alert("Geocode was not successful for the following reason: " + status);
                      }
                    });
                },
                getGeocoder: function() {
                    return geocoder;
                },
                getCoordenadas: function() {
                    return coordenadas;
                },
            };
        }
    ])
    //Creamos una factoria (proporcionará una API en el front) para la autenticacion que comunica con la ruta del backend
    .factory('authFactory', ['$http',
        function($http) {
            return {
                saveUser: function(userData) {  
                    return $http.post('/auth/signup',userData);  
                }, 
                login: function(credentials) {
                    //Llama al servicio web REST del backend encargado de atender la ruta "/api/login"
                    return $http.post('/auth/login', credentials); 
                },
                logout: function() {
                    return $http.get('/auth/logout'); //Se llamara desde el punto de entrada "appback.js" ya que no tiene vista/controlador
                },                                     //asociado y debe poderse cerrar sesion desde cualquier punto de la app
                detailUser: function(username) {  
                    return $http.get('/auth/users/' + username);  
                },
                editUser: function(id, userData) {  
                    return $http.put('/auth/users/' + id, userData);  
                },
                getUsers: function() {  
                    return $http.get('/auth/users');
                },
                deleteUser: function(id) {
                    return $http.delete('/auth/users/' + id); 
                },
                renewPassword: function(data) {
                    return $http.post('/auth/newpassword',data); 
                },
            };                                        

        }
    ]);
