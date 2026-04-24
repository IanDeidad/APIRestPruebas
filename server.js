const express = require('express');
const bodyparser = require('body-parser');
const fs = require('fs');
const OAuth2Server = require('oauth2-server');
const cors = require('cors');
const path = require('path');

const ex = express();
ex.use(bodyparser.urlencoded({extended: true}));
ex.use(bodyparser.json());
ex.use(cors());
ex.oauth = new OAuth2Server ({ 
        model: require('./model'), 
        accessTokenLifetime: 3600, 
        allowBearerTokensInQueryString: true
    });

function autenticacion(request, response, next) 
    {   
        const req = new OAuth2Server.Request(request);
        const res = new OAuth2Server.Response(response); 
        ex.oauth.autenticate(req, res) 
            .then((token) => 
                { 
                    request.user = token.user; 
                    next(); 
                }
                )
            .catch((err) => { request.status(401).json({error: 'Acceso denegado'}); });
        }

ex.get('/datos-publicos', (req, res) => { 
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos-publicos.json'), 'utf8'));
    res.json(data);});

ex.get('/datos-privados', autenticacion, (req, res) => { 
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos-privados.json'), 'utf8'));
    res.json(data);}
);

ex.post('/datos-privados', autenticacion, (req, res) => { 
    try {
        const rutaArchivo = path.join(__dirname, 'datos-privados.json');
        const db = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));

        const nuevaCompra = req.body;
        db.push(nuevaCompra);

        fs.writeFileSync(rutaArchivo, JSON.stringify(db, null, 2));

        res.status(201).json({ mensaje: "Guardado con éxito", dato: nuevaCompra });
    } catch (err) {
        res.status(500).json({ error: "No se pudo escribir el archivo"});
    }
});

ex.post('/oauth/token', (req, res) => {
  const request = new OAuth2Server.Request(req);
  const response = new OAuth2Server.Response(res);

  ex.oauth.token(request, response)
    .then(token => {
        res.set(response.headers);
        res.json(response.body); 
    })
    .catch(err => {
        res.status(err.code || 500).json(err instanceof Error ? { error: err.message } : err);
    });
});


ex.listen(3050, '192.168.250.129', () => { 
    console.log('Servidor corriendo');});
