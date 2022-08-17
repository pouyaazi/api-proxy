require('dotenv').config()
const PORT=process.env.PORT;
var express = require('express')
const sys = require('sys');
var bodyParser = require('body-parser')
var nodeFetch = require('node-fetch');
var cors = require('cors');
var app = express()
const fs = require('fs');
let config = fs.readFileSync('config.json');
config = JSON.parse(config);

function serialize(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}




app.use(cors())
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.text({ type: 'text/html' }))
app.use(bodyParser.json({ type: 'application/json' }))

function checkAuth(req,res,next) {
    for (let header in req.headers) {
        var token=config.users.find((x) => x.token == req.headers[header]);
        if(token){
            break;
        }
    }
    if(token){
        req.token=token;
        next();
    }else{
        res.status(403).send('Access Denied');
    }
}

app.get('/admin', function (req, res) {
    res.render('admin',{
        serviceList:config.services,
    });
});

app.post('/service/:serviceName', async (req, res, next) => {
    var service = config.services.find((x) => x.name == req.params.serviceName);
    let url = new URL(service.check)
    let options = {}
    let headers = {};
    if (service.type == 'query') {
        let search = req.query;
        search = {
            ...search,
            ...req.body
        }
        url.search = serialize(search);
    }

    if (service.type == 'header') {
        headers={
            ...req.body
        }
    }
    let payload = await nodeFetch(url,
        {
            method: 'GET',
            headers: headers,
            options: options,
        }
    );
    try {
        let data = await payload.text();
        if (data.search(service.notOk) == -1) {
            service.data = {
                ...req.body
            };
            res.send('Save OK')
        } else {
            res.status(404).send('Save Not Ok (Key Not Valid)')
        }

    } catch (e) {
        res.status(404).send('Save Not Ok (Internal Error)')
    }
})

app.all(/.*/,checkAuth, async (req, res, next) => {
    var service = config.services.find((x) => x.name == req.token.service);
    let url = new URL(service.url)
    var lengthPrefix=req.token.prefix.split('/').filter((x)=>x).length;
    url.pathname = url.pathname + '/' + req.path.split('/').filter((x) => x).splice(lengthPrefix).join('/')
    url.search='?'+serialize(req.query);
    let options = {}
    let headers = {};
    //let body = req.headers['content-type'] == 'application/json' ? JSON.stringify(req.body) : req.body;
    let body=req.body;
    if (service.type == 'query') {
        let search = req.query;
        search = {
            ...search,
            ...service.data
        }
        url.search = serialize(search);
    }
    if (service.type == 'header') {
        if(service.header){
            for (let x in service.data) {
                headers[service.header] = service.data[x];
                break;
            }
        }else{
            for (let x in service.data) {
                headers[x] = service.data[x];
                break;
            }
        }
    }
    let payload = await nodeFetch(url,
        {
            method: req.method,
            body: ['POST', 'PUT'].includes(req.method) ? body : undefined,
            headers: headers,
            options: options,
        }
    );
    try {
        let data = await payload.text();
        res.send(data)
    } catch (e) {
        res.status(404).send('Not found')
    }
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})