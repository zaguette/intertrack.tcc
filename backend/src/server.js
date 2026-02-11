import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/',(req, res)=>{
    res.json({"mensagem": "Hello World"})
})

app.listen(PORT, () =>{
    console.log(`Servidor ouvindo no endereço: localhost:${PORT}`)
})