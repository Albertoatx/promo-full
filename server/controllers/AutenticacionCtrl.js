var express = require('express');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');

var User = require('../models/Usuario.js');

var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
};

// Generates hash using bCrypt
var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};


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


router.get('/sessionUsername', function (request, response){
	if (request.session.user) {
		return response.status(200).send(request.session.user);
	} else
	    return response.status(200).send('');
});


/* RUTAS para nuestras operaciones CRUD sobre la colección USUARIO DE Mongo. Proporcionamos el siguiente API */
//  SAVE    -> Post('add-user')
//  FindONE -> Get ('login')
/* ********************************************************************************************************/
router.post('/signup', function(request, response) {
   /* var salt, hash, password;
    password = request.body.password;
    salt = bcrypt.genSaltSync(10);
    hash = bcrypt.hashSync(password, salt); */

    var username = request.body.username;

    // find a user in mongo with provided username
	User.findOne({ 'username' :  username }, function(err, user) {
				
		if (err){
			return response.status(500).send("Error al intentar registarse (signup)" + err);
			//return response.send(500, "Error in Signup" + err);
		}

		// if the user already exists we must not create it
		if (user) {
			//console.log('User already exists with username: '+ username);
			return response.status(401).send("Ese usuario ya existe en el sistema");
			//return response.send(401, "User already exist");
		} else {

			// if there is no user, create the user
			var newUser = new User({
		        username: 	request.body.username,
		        password: 	createHash(request.body.password),
		        firstname: 	request.body.firstname,
		        lastname: 	request.body.lastname,
		        datebirth: 	request.body.datebirth,
		        //datebirth: 	request.body.datebirth.substring(0, 10),
				phone: 		request.body.phone,
				email: 		request.body.email       
		    });

			// save the user
			newUser.save(function(err) {

		        if (!err) {
					
					request.session.user = newUser.username;
					trackSession("SIGN UP", request);
					return response.status(200).send(newUser.username);
					
		        	//return response.status(200).send(newUser.username, "usuario creado ok"); //para que aparezca en pantalla el usuario
					//return response.send('User successfully created');
					/*
			        request.session.regenerate(function() { 
			        	console.log('Entra en regenerate para crear la sesion al registrar usuario');
						request.session.user = newUser.username;
						trackSession("SIGN UP", request);
			            return response.send(newUser.username);  
			        });
					*/
		        } else {
		        	//console.log('Error in Saving user: '+ err);  
		            return response.send(err);
		        }

				//console.log(newUser.username + ' Registration succesful');    	
			});
		}
	});
});


router.post('/login', function(request, response) {       

    var username = request.body.username;
    var password = request.body.password;

    User.findOne({username: username}, function(err, user) {

    	if (err){
    		return response.status(500).send("Error al intentar iniciar sesion (login)");
			//return response.send(500, "Error in Login" + err);
		}

		// Username does not exist, log the error and redirect back
		if (!user){
			//console.log('User Not Found '+ username);
			return response.status(401).send("El usuario introducido no se encuentra en el sistema");
			//return response.send(401, "Username " + username + " not found");	
		}

	    //if (username == usr.username && bcrypt.compareSync(password,usr.password)) { 
	    //if (username == user.username && isValidPassword(user, password)) { 
		if (isValidPassword(user, password)) { 
            
			request.session.user = username;
			console.log('Sesion generada para el usuario ' + username);
			trackSession("LOGIN", request);
			return response.status(200).send(username);
            
			//Genera otra sesion de usuario 
			/*
	        request.session.regenerate(function() {  //cannot read property "regenerate" of undefined
	        	console.log('Entra en regenerate para la sesion');
	            request.session.user = username;
	            //request.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
				trackSession("LOGIN", request);
				return response.status(200).send(username);  //DA ERROR (Can't set headers after they are sent)
			});  
			*/
			//return response.status(200).send(username); //Fallaba por estar haciendo 2 returns en callback

	    } else {
	    	return response.status(401).send("La contraseña introducida no es válida");
	        //return response.send(401, "Invalid Password");
	    }
        
    });
});

router.get('/logout', function(request, response) {
    request.session.destroy(function(err) {
    	
        if (!err) {
        	console.log('Destruida la sesion del usuario');
            return response.status(200).send("Sesión cerrada correctamente");
            //return res.redirect('/success');
        } else {
        	return response.status(401).send("Problemas en el cierre de la sesión");
        }

    	//return response.status(401).send("El usuario ha cerrado la sesión");
        //return response.send(401, 'User logged out');
    });
});

router.post('/newpassword', function(request, response) {

	//console.log('Entra en ruta /newpassword');

    var username    = request.body.username;
    var oldpassword = request.body.oldpassword;
    var newpassword = request.body.newpassword;

    //console.log(request.body);

    if (username == undefined || oldpassword == undefined || newpassword == undefined) {
    	return response.status(500).send("No se ha enviado toda la informacion necesaria");
    }

    // find a user in mongo with provided username
	User.findOne({ 'username' :  username }, function(err, user) {
				
		if (err){
			return response.status(500).send("Error al intentar cambiar password" + err);
		}

		if (!user){
			return response.status(401).send("El usuario no se encuentra en el sistema");
		} 
		
		else {
			//Si la contraseña que quieres cambiar es la correcta
			if (isValidPassword(user, oldpassword)) { 

				//console.log('Backend, cambiar password, id del usuario es: ' + user._id);

				User.findById(user._id, function(err, user){
		            if(err)
		                response.send(err);

				    //user.username = request.body.username;  //No debería poder cambiarse.
			        user.password = createHash(request.body.newpassword);
     
		            user.save(function(err, user){
		                if(err)
		                   return response.send(err);

		                return response.json(user);
		            });
		        });

		    } else {
		    	return response.status(401).send("Su contraseña vieja no es esa. Asegurese de introducirla correctamente");
		    }
		} 
	});
});



//NO LO UTILIZO: sends successful login state back to angular
/*
router.get('/success', function(req, res){
	res.send({state: 'success', user: req.user ? req.user : null});
});

//NO LO UTILIZO: sends failure login state back to angular
router.get('/failure', function(req, res){
	res.send({state: 'failure', user: null, message: "Invalid username or password"});
}); */


//Listado de usuarios (solo deberia verlo el administrador)
router.get('/users', function(request, response) {
	trackSession("LISTADO de USUARIOS", request);
    return User.find({}, function(err, users) {  
        if (!err) {
            return response.send(users);
        } else {
        	return response.status(500).send(err);
            //return response.send(500, err);
        }
    });
});

//Detalle de un usuario
router.route('/users/:username')
	    //gets specified promoter
    .get(function(request, response){
		trackSession("USUARIO DETALLE", request);
        User.findOne({username:request.params.username}, function(err, user){
            if(err)
                response.send(err);
            response.json(user);
        });
    })

//Borrado y actualizacion del perfil de un usuario (solo debería poder llamarse cuando el usuario este logeado)
router.route('/users/:id')
	.delete(sessionCheck, function(request, response) {
    //.delete(function(request, response) {

		trackSession("USUARIO BORRAR", request);
        User.remove({
            _id: request.params.id
        }, function(err) {
            if (err)
                response.send(err);

            response.json("deleted :(");
        });
    })
    //updates specified
    .put(sessionCheck, function(request, response){
    //.put(function(request, response){
		trackSession("USUARIO ACTUALIZAR", request);
        User.findById(request.params.id, function(err, user){
            if(err)
                response.send(err);

		    /* user.username: request.body.username;  //No debería poder cambiarse.
	        /* user.password: createHash(request.body.password); */
	        user.firstname = request.body.firstname;
	        user.lastname =  request.body.lastname;
	        user.datebirth = request.body.datebirth;
			user.phone = request.body.phone;
			user.email = request.body.email;       

            user.save(function(err, user){
                if(err)
                    response.send(err);

                response.json(user);
            });
        });
    });

module.exports = router;