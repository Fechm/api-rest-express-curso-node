const express = require("express");
const config = require('config');
const morgan = require('morgan');
const Joi = require("@hapi/joi");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());//body
app.use(morgan('dev'));
console.log('Morgan is running...');

console.log('Aplicación ' + config.get('nombre'));
console.log('BD '+ config.get('configBD.host'));

const usuarios = [
  { id: 1, nombre: "grover" },
  { id: 2, nombre: "Luis" },
  { id: 3, nombre: "Ana" },
];

app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}`);
});

//Petición de datos (todos)
app.get("/api/usuarios", (req, res) => {
  res.send(usuarios);
});

//Petición de datos especificos
app.get("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("Usuario no encontrado");
    return;
  }
  res.send(usuario);
});

//Envio de datos
app.post('/api/usuarios', (req, res) => {

  const {error, value} = validarUsuario(req.body.nombre);

  if(!error){
    const usuario = {
      id: (usuarios.length + 1),
      nombre: value.nombre
    };
    usuarios.push(usuario);
    res.send(usuario);  
  }else{
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }
  
});

//Actualización de datos
app.put('/api/usuarios/:id',(req, res)=>{
  //Encontrar si existe el objeto usuario
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("Usuario no encontrado");
    return;
  }

  const {error, value} = validarUsuario(req.body.nombre);

  if(error){
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }
  usuario.nombre = value.nombre;
  res.send(usuario);
});

//Eliminacióin de datos
app.delete('/api/usuarios/:id', (req, res) => {
  let usuario = existeUsuario(req.params.id); 
  if(!usuario){
    res.status(404).send("Usuario no encontrado");
    return;
  }

  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);

  res.status(200).send(usuario);
});

//Funciones de validación
function existeUsuario(id){
  return (usuarios.find(u => u.id === parseInt(id)));
};

function validarUsuario(nom){
  const schema = Joi.object({
    nombre: Joi.string().min(3).required()
  });
  return schema.validate({ nombre: nom });
};

