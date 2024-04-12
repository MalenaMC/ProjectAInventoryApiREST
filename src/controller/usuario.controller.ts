import  bcrypt  from 'bcryptjs';
import { Request, Response, request, response } from 'express';
import pool from '../../database.config';

//PARA ENCRIPTAR LA CONTRASEÑA QUE SE RECIBIO EN TEXTO PLANO (REGISTER)
const encryptPassword = async (textPlainPass) => {
    const passwordHash = await bcrypt.hash(textPlainPass, 10)
    return passwordHash
}
//PARA COMPARAR EL HASH CON EL TEXTO PLANO (LOGIN)
const comparePassword = async (textPlainPass, passwordHash) => {
    const isMatch = await bcrypt.compare(textPlainPass, passwordHash)
    return isMatch
}

export const CrearUsuario = async (request: Request, response: Response) => {
    // Recepción de cliente al servidor
    const {
        name,
        lastName,
        dni,
        dateOfBirth,
        email,
        password,
    } = request.body ;

    try {
        //encriptado de contraseña
        const passwordHash = await encryptPassword(password);

        const dniString = dni.toString();
        if (dniString.length !== 8) {
            return response.status(400).json({ message: 'Error...   El DNI no cuenta con 8 dígitos' });
        }

        const result = await pool.query(
            'INSERT INTO users(name, lastName, dni, dateOfBirth, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, lastName, dni, dateOfBirth, email, passwordHash]
        );

        const usuarioCreado = result.rows[0];
        return response.status(201).json({
            name: usuarioCreado.name,
            lastName: usuarioCreado.lastname,
            message: 'Recibido desde ApiRest. Porfavor, inicie sesión.',
            data: usuarioCreado
        });
    } 
    catch (error) {
        console.error('Error al crear usuario:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const LoginUsuario = async (request: Request, response: Response) => {
    const {email, password} = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({
                message: 'Credenciales incorrectas.' });
        }
        const isMatch = await comparePassword(password, usuarioEncontrado.password)
        if (!isMatch) {
            return response.status(401).json({message: 'Credenciales incorrectas'})
        }

        return response.status(200).json({
            name : usuarioEncontrado.name,
            lastName: usuarioEncontrado.lastname,
            message: 'Inicio de sesión exitoso',
            data: usuarioEncontrado });
    } 
    catch (error) {
        console.error('Error al hacer login', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const BuscarUsuarioPorDNI = async (request: Request, response: Response) => {
    const dni = request.params.correo;

    try {
        const result = await pool.query(
            'SELECT * FROM usuario WHERE dni = $1',
            [dni]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Error... Usuario no encontrado' });
        }

        return response.status(200).json(usuarioEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar usuario por CORREO:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};
