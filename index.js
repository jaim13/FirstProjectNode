import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = 8024;

app.set('views', 'vistas');
app.set('view engine', 'ejs');

app.use(express.static('estilos'));
app.use(express.urlencoded({ extended: true }));

const conect = 'mongodb+srv://jaimmartinez13:David1311@cluster0.1wyhtwl.mongodb.net/Progamacion4';
mongoose.connect(conect, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', err => {
    console.error(`Error de conexión a la base de datos: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('La conexión a la base de datos ha sido cerrada');
});

const registroSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    cedula: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    provincia: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const Registro = mongoose.model('Registro', registroSchema);

app.listen(PORT, () => {
    console.log(`Aplicacion en http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/agregar', (req, res) => {
    const registro = new Registro({
        nombre: req.body.nombre,
        apellidos: req.body.apellidos,
        cedula: req.body.cedula,
        telefono: req.body.telefono,
        provincia: req.body.provincia,
        password: req.body.password
    });

    registro.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error al agregar el registro');
        });
});

app.post('/login', async (req, res) => {
    const { cedula_login, password } = req.body;

    console.log('Datos recibidos en /login:', req.body);

    try {
        const usuario = await Registro.findOne({ cedula: cedula_login });

        if (usuario) {
            console.log('Contraseña ingresada:', password);
            console.log('Contraseña almacenada:', usuario.password);

            if (password === usuario.password) {
                // Redirige a la ruta /main después de una autenticación exitosa
                return res.redirect('/main');
            } else {
                console.log('Contraseña incorrecta');
                return res.status(401).send('Credenciales incorrectas');
            }
        } else {
            console.log('Usuario no encontrado');
            return res.status(401).send('Credenciales incorrectas');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error en el servidor: ' + error.message);
    }
});

// Ruta única para renderizar la página main.ejs
app.get('/main', (req, res) => {
    res.render('main'); // Asegúrate de que 'main.ejs' esté en tu carpeta de vistas
});

app.post('/eliminar', async (req, res) => {
    const { cedula } = req.body;

    try {
        // Buscar el registro por cédula y eliminarlo
        const resultado = await Registro.deleteOne({ cedula });

        if (resultado.deletedCount > 0) {
            // Registro eliminado con éxito
            res.send('Registro eliminado con éxito');
        } else {
            // No se encontró el registro con la cédula proporcionada
            res.status(404).send('No se encontró el registro con la cédula proporcionada');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor: ' + error.message);
    }
});
