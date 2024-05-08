import mongoose from 'mongoose';

const { Schema } = mongoose;

const conect = 'mongodb+srv://jaimmartinez13:David1311@cluster0.1wyhtwl.mongodb.net/Progamacion4';
mongoose.connect(conect, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', err => {
    console.error(`Error de conexión a la base de datos: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('La conexión a la base de datos ha sido cerrada');
});

const registroSchema = new Schema({
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
    }
});

const Registro = mongoose.model('Registro', registroSchema);

const agregarRegistro = (req, res) => {
    const registro = new Registro({
        nombre: req.body.nombre,
        apellidos: req.body.apellidos,
        cedula: req.body.cedula,
        telefono: req.body.telefono,
        provincia: req.body.provincia,
    });

    registro.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error al agregar el registro');
        });
};

export { agregarRegistro };
