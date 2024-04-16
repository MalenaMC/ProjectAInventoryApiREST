import Router from 'express';
import { CrearUsuario, BuscarUsuarioPorDNI, LoginUsuario, RecuperarCuenta, RestablecerContrasena } from '../controller/usuario.controller';

export const UsuarioRuta = Router();

UsuarioRuta.post("/registrar_usuario", CrearUsuario);

UsuarioRuta.post("/login", LoginUsuario);

UsuarioRuta.post("/recuperar", RecuperarCuenta);
UsuarioRuta.post("/recover_password", RestablecerContrasena);

UsuarioRuta.get("/buscar/:dni", BuscarUsuarioPorDNI)