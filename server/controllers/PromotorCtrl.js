//A controller have all the app logic


//provide a callback function passing the "app" and the "route" of this controller, passing to the Resource the model that
// we are trying to connect to (in our case the movie model "app.models.movie")
/*module.exports = function(app, route) {

  // Setup the controller for REST;
  Resource(app, '', route, app.models.movie).rest(); //Takes a mongoose model and converts it into a REST API

  // Return middleware (to provide custom features on a per request basis)
  return function(req, res, next) {
    next();
  };
}; */

//In this file we will build a series of ROUTES that will provide CRUD operations on our MongoDB database
//Para crear estas rutas definidas aquí ir a "app.js" y añadir la siguientes 2 lineas:
//      var api = require('./routes/api');)
//      app.use('/api', api);
//-------------------------------------------------------------------------------------------------------
var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var mongoose = require('mongoose');

//Nuestros objetos del modelo (MongoDB)
var Promotor = require('../models/Promotor.js');


// Escribimos nuestra función para comprobar las sesiones de usuario (es Middleware)
// Para hacer seguras las rutas habrá que llamar a esta función pasandola como argumento en cada ruta del backend que queramos 
// Normalmente querremos hacer seguras las rutas que permiten modificar datos. 
function sessionCheck(request, response, next) {
    console.log('Comprobando la sesion del usuario: ' + request.session.user );

    //next();
    if (request.session.user) 
        next();
    else 
        response.status(401).send('Autorización fallida: No ha iniciado sesión para poder realizar esta operación');
        //response.status(401).send('sessionCheck: authorization failed');
}


function trackSession(operativa, request) {
    /*
    console.log("En '" + operativa + "' - VALOR request.session es: " );
    console.log(request.session);
    console.log("VALOR request.sessionID: "     + request.sessionID);
    console.log("VALOR request.session.user: "  + request.session.user);
    console.log("--------------------------------------------------------------");
    console.log(""); 
    */
}


/* ---------------------------------------------------------------------------------------------------------------------------------
/* RUTAS ExpressJS para el BACK-END, proporcionamos API REST para realizar operaciones CRUD sobre nuestro Modelo (Promotores)
/* Comandos Mongoose: Save, Remove, Update, Find, FindById, FindOne,.
/* ---------------------------------------------------------------------------------------------------------------------------------

/* Esto es lo que se devolvera cuando el usuario pida la ruta: http://localhost:3000/api */
router.get('/', function(req, res) {
    res.send('Bienvenido a la API de mantenimiento de Promotores');
});


/* RUTAS para nuestras operaciones CRUD sobre la colección PROMOTORES de Mongo. Proporcionamos el siguiente API *********/
//
//  Operacion                      Comando              Http Method    Ruta
//  ---------                      -------              -----------    ----
//  Listado de promotores          find                 Get            http://localhost:3000/api/promotores 
//  Creacion de un promotor        save                 Post           http://localhost:3000/api/promotores/add
//  Borrado de un promotor         remove               Delete         http://localhost:3000/api/promotores/id
//  Actualizacion de un promotor   findById + save      Put            http://localhost:3000/api/promotores/id
//  Detalle de un promotor         findById             Get            http://localhost:3000/api/promotores/id
//  Busqueda por nombre            findById             Get            http://localhost:3000/api/promotores/find/name
//  Contador de promotores         count                Get            count
/* **********************************************************************************************************************/

//Listado de promotores
router.get('/promotores', function(request, response) {
    trackSession("PROMOTORES CONSULTA", request);
    return Promotor.find({}, function(err, promotores) {  
        if (!err) {
            return response.send(promotores);
        } else {
            //return response.send(500, err);
            return response.status(500).send(err);
        }
    });
});


//Prueba para ordenar y limitar resultados
router.get('/promotores/limit', function(request, response) {

    //Puede consultarse de 2 formas con Mongoose:
    //A) Sin pasar una funcion de callback (la query se ejecuta más tarde al hacer el "exec")
    //   se devuelve una instancia de Query que proporciona una interfaz especial para construir consultas
    /*Promotor.find({}).
             limit(3).
             sort({ nombrep: -1 }).
             select({ nombrep: 1, }).
             //where('age').gt(17).lt(66).
             exec(function(err, promotores) {  
                    if (!err) {
                        return response.send(promotores);
                    } else {
                        return response.send(500, err);
                    }
                }); */

    //B) Pasando una funcion de callback (la operacion se ejecuta INMEDIATAMENTE y los resultados se pasan al callback)
    //   en ese caso se especifica la consulta como si fuese un documento JSON, igual que en MongoDB shell con 3 param: query+projeccion+objeto definiendo sorts,etc 
    return Promotor.find({}, {'nombrep': 1}, {sort: {'nombrep': -1}, limit: 3}, function(err, promotores) {  
        if (!err) {
            return response.send(promotores);
        } else {
            //return response.send(500, err);
            return response.status(500).send(err);
        }
    }); 
});


//Busqueda por "name" recibido por argumento: usar expresion regular (i para que busque mayusculas y minusculas)
router.get('/promotores/find/:name', function(req, res) {

    //return Promotor.find({ nombrep: new RegExp('^'+ req.params.name, "i") }, function(err, promotores) { 
    return Promotor.find({ nombrep: new RegExp(req.params.name, "i") }, function(err, promotores) {  
        if (!err) {
            return res.send(promotores);
        } else {
            //return res.send(500, err);
            return res.status(500).send(err);
        }
    });
});

//Busqueda por "name" recibido por argumento: usar expresion regular (i para que busque mayusculas y minusculas)
router.get('/mispromotores/:username', function(req, res) {

    //return Promotor.find({ nombrep: new RegExp('^'+ req.params.name, "i") }, function(err, promotores) { 
    return Promotor.find({ creado_por: req.params.username }, function(err, promotores) {  
        if (!err) {
            return res.send(promotores);
        } else {
            return res.status(500).send(err);
        }
    });
});


//Contador del numero total de promotores (esto mejor sería una función interna que no un metodo del API)
router.get('/promotores/count', function(req, res) {

    //return Promotor.count({ type: 'jungle' }, function (err, count) {
    return Promotor.count(function (err, count) {
        if (!err) {
            //console.log('there are %s promoters', count);
            //return res.send(count);
            return res.json(count);

        } else {
            //return res.send(500, err);
            return res.status(500).send(err);
        }
    });
});


//Creacion de un promotor
router.post('/promotores/add', sessionCheck, function(request, response) { 
//router.post('/promotores/add', function(request, response) {  //Sin validar sesión de usuario para probar fácil

    /*var direccion = {     //Esto no funcionaba ya que no existen, lo que hay es request.body.direcp.xxxxxx
            callep : request.body.callep,
            pueblo  : request.body.pueblo,
            provincia: request.body.provincia,
            codpostal: request.body.codpostal
    }; */

    var codpromo = request.body.codigop;

    // find a user in mongo with provided username
	Promotor.findOne({ 'codigop' :  codpromo }, function(err, promotor) {
				
		if (err){
			return response.status(500).send("Error al intentar crear un nuevo promotor " + err);
		}

		// if the promotor already exists we must not create it
		if (promotor) {
			return response.status(401).send("Ese código de promotor ya existe en el sistema");
		} else {

            trackSession("PROMOTOR ALTA", request);
            //console.log(request.body);

            var promotor = new Promotor({
                codigop: request.body.codigop,
                nombrep: request.body.nombrep,
                creado_por: request.session.user,
                actualizado_por: '',
                cifp: request.body.cifp,
                telefp: request.body.telefp,
                emailp: request.body.emailp,
                direcp: request.body.direcp,
                //direcp: direccion,                   //Guardaba objeto vacio
                //direcp.callep: request.body.callep,  //Esto da error de compilacion
                creado_el: new Date(Date.now())
            });
            
            promotor.save(function(err) {  //save the data into the Promotor collection
                if (!err) {
                    //return response.send(200, promotor);
                    return response.status(200).send(promotor);
                } else {
                    //console.log('Intento guardado: entra rama error');
                    //return response.send(500, err);
                    return response.status(500).send(err);
                }
            });
        } //else
    });
});


router.route('/promotores/:id')
    //gets specified promoter
    .get(function(req, res){
        trackSession("PROMOTOR DETALLE", req);
        Promotor.findById(req.params.id, function(err, promotor){
            if(err)
                res.send(err);
            res.json(promotor);
        });
    }) 
    //updates specified promoter
    .put(sessionCheck, function(req, res){
    //.put(function(req, res){
        trackSession("PROMOTOR ACTUALIZAR", req);
        Promotor.findById(req.params.id, function(err, promotor){
            if(err)
                res.send(err);

            //console.log(req.body);
            promotor.codigop = req.body.codigop;
            promotor.nombrep = req.body.nombrep;
            promotor.actualizado_el = new Date(Date.now());
            promotor.actualizado_por = req.session.user;
            promotor.cifp   = req.body.cifp;
            promotor.telefp = req.body.telefp;
            promotor.emailp = req.body.emailp,
            promotor.direcp = req.body.direcp,

            promotor.save(function(err, promotor){
                if(err)
                    res.send(err);

                res.json(promotor);
            });
        });
    })
    //deletes the promoter
    .delete(sessionCheck, function(req, res) {
    //.delete(function(req, res) {
        trackSession("PROMOTOR BORRADO", req);
        Promotor.remove({
            _id: req.params.id
        }, function(err) {
            if (err)
                res.send(err);
            res.json("deleted :(");
        });
    });


/* RUTAS para nuestras operaciones CRUD sobre PROMOCIONES (array embebido en Promotores). Proporcionamos el siguiente API *********/
//
//  Operacion                             Comandos                    Http Method   Ruta
//  ---------                             --------                    -----------   ----
//  Listado de obras de 1 promotor        findById                    Get           http://localhost:3000/api/promociones/id
//  Detalle de una obra de 1 promotor     FindOne                     Get           http://localhost:3000/api/promociones/id/cod
//  Asignarle una obra de 1 promotor      findById + push + save      Post          http://localhost:3000/api/promociones/add/id
//  Eliminar una obra de 1 promotor       findById + pull + save      Post          http://localhost:3000/api/promociones/id/cod
//  Actualizar una obra de 1 promotor     findById + id   + save      Put           http://localhost:3000/api/promociones/id/cod
//  Eliminar todas las obras del promotor findById + new Array+ save  Post          http://localhost:3000/api/promociones/id
/* ********************************************************************************************************************************/

//Listado de todas las obras existentes, sea cual sea su promotor 
router.get('/promociones', function(request, response) {

    trackSession("OBRAS LISTADO", request);

    //db.Users.aggregate( [{$unwind:"$Photos"},{$sort: {"Photos.created":-1},{$limit: 10}] );

    return Promotor.aggregate([{$unwind:"$promociones"}], function(err, data) {  
        if (!err) {
            return response.send(data);  //Las obras de ese promotor
        } else {
            //return response.send(500, err);
            return response.status(500).send(err);
        }
    });
});

//OK - Listar todas las obras de un promotor
router.get('/promociones/:id', function(request, response) {
    trackSession("OBRA DETALLE", request);
    return Promotor.findById(request.params.id, function(err, promotor) {  
        if (!err) {
            return response.send(promotor.promociones);  //Las obras de ese promotor
        } else {
            //return response.send(500, err);
            return response.status(500).send(err);
        }
    });
});


//OK - Mostrar solo 1 determinada obra de un promotor (an embedded document by id)
router.get('/promociones/:id/:cod', function(req, res) { 
    trackSession("OBRA de un determinado PROMOTOR", req);
    var promo_id = req.params.id,
        obra_id = req.params.cod;

    //console.log('Detalle de la obra concreta: ' + obra_id);
    //Hacemos una proyeccion para que se quede solo con la obra especificada
    Promotor.findOne({_id: promo_id, 'promociones.codigoobra': obra_id}, {'promociones.$': 1}, function(err, promocion){ 

        if(err)
            res.send(err);

        res.json(promocion);
    });   
});


//OK - Añadir 1 obra a 1 promotor (Adding an embedded document to an array)
router.post('/promociones/add/:id', sessionCheck, function(req, res) { 
//router.post('/promociones/add/:id', function(req, res) { 
    trackSession("OBRA ALTA", req);
    Promotor.findById(req.params.id, function(err, promotor){

        if(err)
            res.send(err);

        var promocion = {
            codigoobra: req.body.codigoobra,
            nombreobra: req.body.nombreobra,
            creada: new Date(Date.now())
        };

        promotor.promociones.push(promocion);

        promotor.save(function(err, promotor){
            if(err)
                res.send(err);

            //console.log('Obra incluida en el promotor exitosamente');
            res.json(promotor);
        });
    });
});


//OK - Removing an embedded document (no es un "delete" puro ya que no se borra el documento exterior)
//OJO, este borrado es un POST
router.post('/promociones/:id/:cod', sessionCheck, function(req, res) {
//router.post('/promociones/:id/:cod', function(req, res) {  

    trackSession("BORRADO DE UNA OBRA DE UN PROMOTOR", req);
    var promo_id = req.params.id,
        obra_id = req.params.cod;

    //console.log('Intentando borrar la obra ' + obra_id + ' del promotor ' + promo_id );

     Promotor.findByIdAndUpdate(promo_id, {$pull: {promociones: {codigoobra: obra_id}}}, function(err, data){

            if(err) {
              return res.status(500).json({'error' : 'error in deleting address'});
            } 

            res.json(data);
      });

    /* VERSION ANTIGUA, solo borraba con "_id" en obras ----------------------------------------
    Promotor.findById(promo_id, function(err, promotor){

        if(err)
            res.send(err);

        promotor.promociones.pull({'codigoobra': obra_id}); //OJO, pull no funciona con otros campos que no sean "_id"

        //OJO, "pull" solo funciona con el campo "_id", sino lo encuentra seguira adelante y no quita nada.
        //Por tanto para eso el esquema de "promociones" ha de admitir '_id' sino esto nunca borrara.
    /*    promotor.promociones.pull({'_id': obra_id});  
        console.log(promotor.promociones); */

    /*    promotor.save(function(err, promotor){
            if(err)
                res.send(err);

            res.json(promotor);
        });       
    });   */
});


//OK - UPDATE an embedded document
router.put('/promociones/:id/:cod', sessionCheck, function(req, res) { 
//router.put('/promociones/:id/:cod', function(req, res) { 

    trackSession("ACTUALIZAR UNA OBRA DE UN PROMOTOR", req);
    
    var promo_id = req.params.id,
        obra_id  = req.params.cod;

    //console.log('Codigo de la obra a actualizar: ' + obra_id);
    //console.log(req.body);

    Promotor.findOneAndUpdate({_id: promo_id, 'promociones.codigoobra': obra_id},
    {
        $set: {
         //  NO ACTUALIZAR EL CAMPO que se usa como parametro de enrutamiento, sino luego no vemos el detalle
         // 'promociones.$.codigoobra' : req.body.codigoobra, 
            'promociones.$.nombreobra' : req.body.nombreobra,
            'promociones.$.creada' : new Date(Date.now())
        }
    }, function(err, promotor){
        // Response
        if(err)
            res.send(err);
        res.json(promotor);
    });

    /* VERSION ANTIGUA, editaba si teniamos "_id" en obras (el array embebido) -------------------------------
    Promotor.findById(promo_id, function(err, promotor){
    
        if(err)
            res.send(err);

        //Encontrar la obra concreta en el array buscando con el metodo especial "id" de DocumentArrays 
        //OJO: Esta funcion "id" solo se puede llamar sobre el campo "_id" (no vale para los otros campos)
        var promocion = promotor.promociones.id(obra_id);
       
        promocion.codigoobra = req.body.codigoobra;
        promocion.nombreobra = req.body.nombreobra;
        promocion.creada = new Date(Date.now());

        promotor.save(function(err, promotor){
            if(err)
                res.send(err);

            console.log('Obra actualizada en el promotor exitosamente');
            res.json(promotor);
        });     
    });   */
});


//Borrar todos las obras de un promotor.
router.post('/promociones/:id/', sessionCheck, function(req, res) { 
//router.post('/promociones/:id/', function(req, res) {

    var promo_id = req.params.id;

    //Promotor.findByIdAndUpdate(promo_id, function(err, promotor){
    Promotor.findById(promo_id, function(err, promotor){

        if(err)
            res.send(err);

        promotor.promociones = new Array(); //con esto nos evitamos recorrer un bucle e ir eliminando 1 a 1.

        promotor.save(function(err, promotor){
            if(err)
                res.send(err);

            //console.log('Obras borradas exitosamente');
            res.json(promotor);
        });       
    });   
});

module.exports = router;
