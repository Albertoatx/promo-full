'use strict';


// Declare app level module which depends on filters, and services
angular.module('promotorApp', [
    'ngRoute',
    'ui.bootstrap'
]) //Pensar en "Run" como el controlador inicial (para el index.html) donde se fijan variables en tiempo de inicio de la aplicacion.
   //Only instances and constants can be injected into run blocks: This is to prevent further system configuration during application run time.
   //Run blocks are the closest thing in Angular to the main method. A run block is the code which needs to run to kickstart the application. 
  .run(function($rootScope, $log, $location, authFactory) { 
      console.log("Se esta ejecutando el metodo de arranque RUN");
      $rootScope.administrator = false;
      $rootScope.authenticated = false;
      $rootScope.current_user = '';
    
      //El método para logout lo hace global para que podamos acceder a el en todo momento
      $rootScope.signout = function(){
        //$http.get('/auth/logout'); //Podemos llamar directo sin usar factoria no tenemos una pantalla y controlador propios
        
        authFactory.logout().then(
          function(res, err) {
              //$cookies.loggedInUser = res.data;
              $rootScope.administrator = false;
              $rootScope.authenticated = false;
              $rootScope.current_user = '';
              $location.path('/');
          },
          function(err) {
              console.log('Entra por la RAMA del error en el logout');
              //$rootScope.authenticated = false;
              //$rootScope.current_user = '';
              $log.log(err);
              //flashMessageService.setMessage(err.data);
          }
        );
      };
  })
  //to inject a service in config you just need to call the Provider of the service by adding 'Provider' to it's name
 .config(function ($routeProvider, authFactoryProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      }) 
      //Rutas front-end PROMOTORES *******************
      .when('/promotores', {
        templateUrl: 'views/promotores.html',
        controller: 'PromotoresCtrl',
        resolve:{
           /* Avoid repeating the same code in every route so be better try to centralize it in a factory service
           "check":function($rootScope, $location){   //function to be resolved, accessFac and $location Injected
              //check if the user has permission -- This happens before the page loads
              if($rootScope.authenticated === true){    
                console.log("User has access");
              }else{
                alert("You don't have access here! You must log in before");
                $location.path('user/login');                
              }
            } */

            //If you define a Factory recipe, an empty Provider type with the $get method set to your factory function is automatically created
           check: authFactoryProvider.$get().checkPermissions 
         }   
      })
      .when('/promotor/create', {
        templateUrl: 'views/promotor-add.html',
        controller: 'PromotorAddCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }  
      })
      .when('/promotor/detail/:id', {
        templateUrl: 'views/promotor-detail.html',
        controller: 'PromotorDetailCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }  
      })
      .when('/promotor/delete/:id', {
        templateUrl: 'views/promotor-delete.html',
        controller: 'PromotorDeleteCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }  
      })
      .when('/promotor/edit/:id', {
        templateUrl: 'views/promotor-edit.html',
        controller: 'PromotorEditCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        } 
      })
      //Rutas front-end OBRAS ***********************
      .when('/obrasAll', {
        templateUrl: 'views/obras-all.html',
        controller: 'ObrasCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }  
      })
      .when('/obraspromotor/:id', {
        templateUrl: 'views/obras.html',
        controller: 'ObrasPromotorCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }  
      })
      .when('/obrapromotor/:id/create', {
        templateUrl: 'views/obra-add.html',
        controller: 'ObraAddCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }
      })
      .when('/obrapromotor/:id/detail/:cod', {
        templateUrl: 'views/obra-detail.html',
        controller: 'ObraDetailCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }
      })
      .when('/obrapromotor/:id/delete/:cod', {
        templateUrl: 'views/obra-delete.html',
        controller: 'ObraDeleteCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }
      })
      .when('/obrapromotor/:id/edit/:cod', {
        templateUrl: 'views/obra-edit.html',
        controller: 'ObraEditCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }
      })
      //Rutas front-end USUARIOS ***********************
      .when('/user/create', {
        templateUrl: 'views/user-register.html',
        controller: 'UserAddCtrl',
      })
      .when('/user/login', {
        templateUrl: 'views/user-login.html',
        controller: 'UserLoginCtrl'
      })
      .when('/user/:username', { //lo usamos para detalle y borrado.
        templateUrl: 'views/user-detail.html',
        controller: 'UserDetailCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkPermissions 
        }
      })
      .when('/admin', { //Ruta al panel de administracion
        templateUrl: 'views/user-admin.html',
        controller: 'UserAdminCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkUserRole 
        }
      })
      .when('/user/delete/:username', { 
        templateUrl: 'views/user-delete.html',
        controller: 'UserDeleteCtrl',
        resolve:{
           check: authFactoryProvider.$get().checkUserRole 
        }
      })
      .otherwise({
        redirectTo: '/home'
      });
      
    }) //config(function ($routeProvider)


  /*
  .config(function ($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      }) 
      //Rutas front-end PROMOTORES *******************
      .when('/promotores', {
        templateUrl: 'views/promotores.html',
        controller: 'PromotoresCtrl'
      })
      .when('/promotor/create', {
        templateUrl: 'views/promotor-add.html',
        controller: 'PromotorAddCtrl'
      })
      .when('/promotor/detail/:id', {
        templateUrl: 'views/promotor-detail.html',
        controller: 'PromotorDetailCtrl'
      })
      .when('/promotor/delete/:id', {
        templateUrl: 'views/promotor-delete.html',
        controller: 'PromotorDeleteCtrl' 
      })
      .when('/promotor/edit/:id', {
        templateUrl: 'views/promotor-edit.html',
        controller: 'PromotorEditCtrl'
      })
      //Rutas front-end OBRAS ***********************
      .when('/obrasAll', {
        templateUrl: 'views/obras-all.html',
        controller: 'ObrasCtrl'
      })
      .when('/obraspromotor/:id', {
        templateUrl: 'views/obras.html',
        controller: 'ObrasPromotorCtrl'
      })
      .when('/obrapromotor/:id/create', {
        templateUrl: 'views/obra-add.html',
        controller: 'ObraAddCtrl'
      })
      .when('/obrapromotor/:id/detail/:cod', {
        templateUrl: 'views/obra-detail.html',
        controller: 'ObraDetailCtrl'
      })
      .when('/obrapromotor/:id/delete/:cod', {
        templateUrl: 'views/obra-delete.html',
        controller: 'ObraDeleteCtrl' 
      })
      .when('/obrapromotor/:id/edit/:cod', {
        templateUrl: 'views/obra-edit.html',
        controller: 'ObraEditCtrl'
      })
      //Rutas front-end USUARIOS ***********************
      .when('/user/create', {
        templateUrl: 'views/user-register.html',
        controller: 'UserAddCtrl'
      })
      .when('/user/login', {
        templateUrl: 'views/user-login.html',
        controller: 'UserLoginCtrl'
      })
      .when('/user/:username', { //lo usamos para detalle y borrado.
        templateUrl: 'views/user-detail.html',
        controller: 'UserDetailCtrl'
      })
      .when('/admin', { //Ruta al panel de administracion
        templateUrl: 'views/user-admin.html',
        controller: 'UserAdminCtrl'
      })
      .when('/user/delete/:username', { 
        templateUrl: 'views/user-delete.html',
        controller: 'UserDeleteCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });
      
    })
    */  