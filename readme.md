# IraniCard

## Run Locally

Install dependencies

```bash
  npm i
```

Start the server

```bash
  nodemon server.js
```

if you want create user please insert object with unique **proxy token** in users array if **config.json**
```json
  {
    "id":1,
    "name":"ali",
    "token":"Bearer xxx", //proxy token
    "service":"weatherstack", // user service access
    "prefix":"/panel/api/v1",
    "header":"authorization"
  },
```

if you want create service please insert object with unique **service name** in services array if **config.json**

service with query auth
```json
  {
            "id":1,
            "name":"weatherstack",//be unique
            "type":"query",
            "data":{},//always be empty
            "url":"http://api.weatherstack.com",
            "check":"http://api.weatherstack.com", // check api ok
            "notOk":"invalid_access_key", // string be found when api not ok
            "header":""//when type is query set empty
    },
```

service
```json
  {
            "id":1,
            "name":"neshan",
            "type":"header",
            "data":{},
            "url":"https://api.neshan.org/v1",
            "check":"https://api.neshan.org/v1/search?term=آهن&lat=32.545454&lng=52.654654",
            "notOk":"ERROR",
            "header":""
        }
```
