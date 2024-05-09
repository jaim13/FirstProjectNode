import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = 8024;


app.use(cors({
    origin: '*' 
}));

app.set('views', 'vistas');
app.set('view engine', 'ejs');

app.use(express.json());

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
// Ruta para renderizar la plantilla 'change' y pasar los registros como datos
app.get('/change', async (req, res) => {
    try {
        const registros = await Registro.find();
        res.render('change', { registros: registros });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor: ' + error.message);
    }
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

// Ruta para renderizar la página main.ejs con los registros
app.get('/main', async (req, res) => {
    try {
        const registros = await Registro.find();
        res.render('main', { registros }); // Pasar registros como un objeto a la vista main.ejs
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor: ' + error.message);
    }
});

// Ruta para obtener todos los registros en formato JSON
app.get('/todos', async (req, res) => {
    try {
        const registros = await Registro.find();
        res.json(registros);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor: ' + error.message);
    }
});

app.post('/eliminar', async (req, res) => {
    const { cedula } = req.body;

    try {
        const resultado = await Registro.deleteOne({ cedula });

        if (resultado.deletedCount > 0) {
            res.status(200).send({ message: 'Registro eliminado con éxito' });
        } else {
            res.status(404).send({ success: false, message: 'No se encontró el registro con la cédula proporcionada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error en el servidor: ' + error.message });
    }
});


app.post('/actualizar', async (req, res) => {
    const { cedula, nuevosDatos } = req.body;
    console.log('Datos recibidos:', req.body);

    try {
        // Buscar el registro por su cédula y actualizar los campos con los nuevos datos
        const resultado = await Registro.findOneAndUpdate({ cedula }, nuevosDatos, { new: true });

        if (resultado) {
            res.status(200).send({ success: true, message: 'Registro actualizado correctamente', registro: resultado });
            console.log('Registro actualizado');
        } else {
            res.status(404).send({ success: false, message: 'No se encontró el registro con la cédula proporcionada' });
            console.log('Error al actualizar');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error en el servidor: ' + error.message });
    }
});
