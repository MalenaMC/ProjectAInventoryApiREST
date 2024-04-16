import nodeMailer from 'nodemailer'
import  bcrypt  from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, request, response } from 'express';
import pool from '../../database.config';
import { usuario } from '../models/usuario.model';

//PARA ENCRIPTAR LA CONTRASEÑA QUE SE RECIBIO EN TEXTO PLANO (REGISTER)
const encryptPassword = async (textPlainPass) => {
    const passwordHash = await bcrypt.hash(textPlainPass, 10)
    return passwordHash
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
            message: 'Registro exitoso desde ApiRest. Porfavor, inicie sesión.',
        });
    } 
    catch (error) {
        console.error('Error al crear usuario:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const LoginUsuario = async (request: Request, response: Response) => {
    const {email, password} = request.body;

    //PARA COMPARAR EL HASH CON EL TEXTO PLANO (LOGIN)
    const comparePassword = async (textPlainPass, passwordHash) => {
        const isMatch = await bcrypt.compare(textPlainPass, passwordHash)
        return isMatch
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        const usuarioEncontrado = result.rows[0];
        console.log(usuarioEncontrado);
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
            message: 'Inicio de sesión exitoso'
        });
    } 
    catch (error) {
        console.error('Error al hacer login', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const RecuperarCuenta = async (request: Request, response: Response) => {
    const {email} = request.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({
                message: 'Email no encontrado' });
        }

        //GENERACION DEL TOKEN ASOCIADO AL CORREO DEL USUARIO:
        const token = jwt.sign({usuario: usuarioEncontrado.email}, 'hola_mundo', { expiresIn: '1h'})
        const query = 'UPDATE users SET token_recuperacion =$1 WHERE email = $2';
        
        await pool.query(query, [token, usuarioEncontrado.email]);
        
        console.log("Token guardado correctamente");

        //CREACION DEL ENLACE CON EL TOKEN:
        const resetLink = `http://localhost:4200/auth/recover_password?token=${token}`;

        //FUNCIONES Y CONFIGURACION PARA ENVIAR EL CORREO A LA CUENTA GMAIL DEL USUARIO INYECTADO POR EL TOKEN:

        const transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "pruebas.malena@gmail.com",
                pass: "usbx idkh kmup luyp"
            }
        })
        
        const mail = {
            from: "pruebas.malena@gmail.com",
            to: email,
            subject: "🔐 Restablece tu cuenta",
            text: `Hola, usuario ${usuarioEncontrado.name}`,
            html: `
            <div style="background-color: #d5cee2; padding: 20px; border-radius: 5px">
            <h2 style="color: #333;">Recuperación de cuenta</h2>
            <p style="color: #666;">Hola ${usuarioEncontrado.name},</p>
            <p style="color: #666;">Hemos recibido una solicitud para recuperar tu cuenta. Si no solicitaste esto, puedes ignorar este correo.</p>
            <p style="color: #666;">Si deseas recuperar tu cuenta, haz clic en el siguiente botón:</p>
            <div style="text-align: center;">
                <a href="${resetLink}" style="background-color: #554574; color: #ffffff; text-decoration: none; padding: 10px 20px; border:none; border-radius: 5px; display: inline-block;">Recuperar cuenta</a>
            </div>
            </div>
            `
        }
        
        transporter.sendMail(mail, (error, info) => {
            if(error) {
                console.log("Error al enviar email: ", error);
            }
            else {
                console.log("Email enviado.");
            }
        })

        return response.status(200).json({
            name : usuarioEncontrado.name,
            lastName: usuarioEncontrado.lastname,
            message: 'Email encontrado'
        });
    }
    catch (error) {
        console.error('Error al recuperar cuenta', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
    
}


//PARA RESTABLCER LA CONTRASEÑA Y ACTUALIZAR EN LA BASE DE DATOS
export const RestablecerContrasena = async (request: Request, response: Response) => {
    const { password } = request.body;
    const tokenURL = request.query.token;

    try {
        const decodificarCorreo = jwt.verify(tokenURL, 'hola_mundo');

        //"decodificarCorreo" ES UN ARREGLO, POR LO PASAMOS DE OTRA MANERA, COMO PARAMETRO EN LA CONSULTA SQL
        const correoUsuarioExtraido = decodificarCorreo.usuario;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [correoUsuarioExtraido]
        );

        const usuarioEncontrado = result.rows[0];
        const tokenEncontrado = usuarioEncontrado.token_recuperacion;

        if (tokenURL === tokenEncontrado) {
            //ENCRIPTAR CONTRASEÑA NUEVA
            const passwordHash = await encryptPassword(password);
            await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2',
                [passwordHash, usuarioEncontrado.email]
            );

            //ELIMINAR EL TOKEN DE LA BASE DE DATOS UNA VEZ USADO
            await pool.query(
                'UPDATE users SET token_recuperacion = null WHERE email = $1',
                [correoUsuarioExtraido]
            );
        }
        else {
            response.status(400).send('Tóken inválido o expirado')
        }
        return response.status(200).json({
            name : usuarioEncontrado.name,
            lastName: usuarioEncontrado.lastname,
            message: 'Contraseña actualizada, inicie sesión.'
        });
    }
    catch (error) {
        console.error('Error al conseguir las filas', error);
        response.status(200).send('Tóken inválido o expirado')
    }
}

export const BuscarUsuarioPorDNI = async (request: Request, response: Response) => {
    const dni = request.params.dni;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE dni = $1',
            [dni]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Error... Usuario no encontrado' });
        }

        return response.status(200).json(usuarioEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar usuario por DNI:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

