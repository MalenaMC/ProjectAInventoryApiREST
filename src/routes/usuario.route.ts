import Router from 'express';
import { CrearUsuario, BuscarUsuarioPorDNI, LoginUsuario } from '../controller/usuario.controller';

export const UsuarioRuta = Router();

UsuarioRuta.post("/registrar_usuario", CrearUsuario);
UsuarioRuta.get("/buscar/:dni", BuscarUsuarioPorDNI);
UsuarioRuta.post("/login", LoginUsuario);