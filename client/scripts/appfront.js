'use strict';

/* Asynchronously Bootstrapping AngularJS Applications with Server-Side Data */
/* To do that, eliminate 'ng-app' attribute from my HTML! <body ng-app="promotorApp">
/*
(function() {
  var myApplication = angular.module("promotorApp", [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate', 
    'angularUtils.directives.dirPagination'])
*/

// Declare app level module which depends on filters, and services
angular.module('promotorApp', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate', 
    'angularUtils.directives.dirPagination'
]) 
   //Pensar en "Run" como el controlador inicial (para el index.html) donde se fijan variables en tiempo de inicio de la aplicacion.
   //Only instances and constants can be injected into run blocks: This is to prevent further system configuration during application run time.
   //Run blocks are the closest thing in Angular to the main method. A run block is the code which needs to run to kickstart the application. 
  .run(function($rootScope, $log, $location, authFactory) { 
      console.log("Se esta ejecutando el metodo de arranque RUN");
      $rootScope.appAlreadyRun = false;
      $rootScope.administrator = false;
      $rootScope.authenticated = false;
      $rootScope.current_user = '';

      // La llamada al back-end devolvera una promesa (.then devuelve una promesa) 
      // que debo forzar que se ejecute ANTES que el "resolve" del enrutado (debo encadenarlas)
      // Para eso crear promesa y añadirla al $rootScope dentro del 'root' controller (el .run)
      
      $rootScope.currentUserPromise = authFactory.isLoggedIn().then(    
          function(response) {

            var sessionUsername = response.data;

            //Comprobado: Se ejecuta 1 sola vez, al arrancar la app 
            console.log('Promesa dentro del RUN, se ejecuta 1 sola vez');

            // * si ya existe propiedad 'user' en la sesion -> user ya logeado
            // * si NO existe propiedad 'user' en la sesion -> user NO logeado
            if (sessionUsername && sessionUsername != '') {
              $rootScope.current_user = sessionUsername; 
              $rootScope.authenticated = true;

              if (sessionUsername === 'admin') 
                  $rootScope.administrator = true;

              console.log('El usuario ' + sessionUsername + ' ya se encontraba previamente logeado!');
            } 
            //la promesa puede devolver algo para enlazar como parametro a la sgte promesa
            return sessionUsername; 
        },
        function(err) {
            $log.error(err);
      });
      

      /*
      $rootScope.$on('$routeChangeStart', function(e, curr, prev) {
        if (curr.$$route && curr.$$route.resolve) {
          console.log("Metodo RUN con $routeChangeStart");
          // Show a loading message until promises aren't resolved
          //$rootScope.loadingView = true;
        }
      });

      $rootScope.$on('$routeChangeSuccess', function(e, curr, prev) {
        console.log("Metodo RUN con $routeChangeSuccess");
        // Hide loading message
        //$rootScope.loadingView = false;
      });
      */

      //El método para logout lo hace global para que podamos acceder a el en todo momento
      $rootScope.signout = function(){
        //$http.get('/auth/logout'); //Podemos llamar directo sin usar factoria no tenemos una pantalla y controlador propios
        
        authFactory.logout().then(
          function(res, err) {
              //$cookies.loggedInUser = res.data;
              $rootScope.administrator = false;
              $rootScope.authenticated = false;
              $rootScope.current_user = '';
              $rootScope.appAlreadyRun = false;
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
      }; //end signout 


  })
  //to inject a service in config you just need to call the Provider of the service by adding 'Provider' to it's name
 .config(function ($routeProvider, authFactoryProvider, $locationProvider) {

    //$locationProvider.html5Mode(true);

    //Run controllers only after initialization (RUN method) is complete in AngularJS
    var chainedCheck = function($rootScope){
        $rootScope.currentUserPromise.then(function(sessUsername) {
          console.log("ENTRA DENTRO del THEN para encadenar promesa con usuario " + sessUsername);
          authFactoryProvider.$get().checkAccess();
        });
    }

    var chainedCheckForRole = function($rootScope){
        $rootScope.currentUserPromise.then(function(sessUsername) {
          authFactoryProvider.$get().checkAccessWithRole();
        });
    }
 
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
           //PROBLEM: if the user is NOT logged in the http request still happens (in Chrome dev tools we can see data)
           //check: authFactoryProvider.$get().checkPermissions

           //PROBLEM: if the user is logged and we open this route directly in a new browser tab 
           // it will redirect to the login although we are already logged (because this executes BEFORE
           // the call to the back-end in the "run" method finishes
           //check: authFactoryProvider.$get().checkAccess

           //Para forzar que se ejecute DESPUES de la consulta al backend que hacemos en el RUN 
           check: chainedCheck 
         }   
      })
      .when('/promotor/create', {
        templateUrl: 'views/promotor-add.html',
        controller: 'PromotorAddCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        }  
      })
      .when('/promotor/detail/:id', {
        templateUrl: 'views/promotor-detail.html',
        controller: 'PromotorDetailCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        }  
      })
      .when('/promotor/delete/:id', {
        templateUrl: 'views/promotor-delete.html',
        controller: 'PromotorDeleteCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        }  
      })
      .when('/promotor/edit/:id', {
        templateUrl: 'views/promotor-edit.html',
        controller: 'PromotorEditCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        } 
      })
      //Rutas front-end OBRAS ***********************
      .when('/obrasAll', {
        templateUrl: 'views/obras-all.html',
        controller: 'ObrasCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        }  
      })
      .when('/obraspromotor/:id', {
        templateUrl: 'views/obras.html',
        controller: 'ObrasPromotorCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        }  
      })
      .when('/obrapromotor/:id/create', {
        templateUrl: 'views/obra-add.html',
        controller: 'ObraAddCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions
           //check: authFactoryProvider.$get().checkAccess 
           check: chainedCheck 
        }
      })
      .when('/obrapromotor/:id/detail/:cod', {
        templateUrl: 'views/obra-detail.html',
        controller: 'ObraDetailCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions 
           //check: authFactoryProvider.$get().checkAccess
           check: chainedCheck 
        }
      })
      .when('/obrapromotor/:id/delete/:cod', {
        templateUrl: 'views/obra-delete.html',
        controller: 'ObraDeleteCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions
           //check: authFactoryProvider.$get().checkAccess 
           check: chainedCheck 
        }
      })
      .when('/obrapromotor/:id/edit/:cod', {
        templateUrl: 'views/obra-edit.html',
        controller: 'ObraEditCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkPermissions
           //check: authFactoryProvider.$get().checkAccess 
           check: chainedCheck 
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
           //check: authFactoryProvider.$get().checkPermissions 
          // check: authFactoryProvider.$get().checkAccessWithUser($routeParams.username)  //No permite injectar $routeParams aqui
          // check: authFactoryProvider.$get().checkAccessWithUser
          check: function($rootScope){
            $rootScope.currentUserPromise.then(function(sessUsername) {
              authFactoryProvider.$get().checkAccessWithUser();
            });
          }
        }
      })
      .when('/admin', { //Ruta al panel de administracion
        templateUrl: 'views/user-admin.html',
        controller: 'UserAdminCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkUserRole
           //check: authFactoryProvider.$get().checkAccessWithRole 
           check: chainedCheckForRole
        }
      })
      .when('/user/delete/:username', { 
        templateUrl: 'views/user-delete.html',
        controller: 'UserDeleteCtrl',
        resolve:{
           //check: authFactoryProvider.$get().checkUserRole 
           //check: authFactoryProvider.$get().checkAccessWithRole 
           check: chainedCheckForRole
        }
      })
      .otherwise({
        redirectTo: '/'
      });
      
    }) //config(function ($routeProvider)



/* Asynchronously Bootstrapping AngularJS Applications with Server-Side Data */
/*  ;
    
  fetchData().then(bootstrapApplication);

  function fetchData() {
      var initInjector = angular.injector(["ng"]);
      var $http = initInjector.get("$http");

      // store it in an Angular constant called 'config' which we can access later 
      // within all of our controllers, services, and so on
      return $http.get("/auth/sessionUsername").then(function(response) {
          myApplication.constant("config", response.data);
        }, function(errorResponse) {
          // Handle error case
        });
  }

  function bootstrapApplication() {
      angular.element(document).ready(function() {
          angular.bootstrap(document, ["promotorApp"]);
      });
  }
}());
*/
