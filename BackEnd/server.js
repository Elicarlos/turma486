
// Configurar o Setup da App:

//Chamadas dos pacotes:
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Produto = require('./app/models/produto');
var io = require ('socket.io');
var cors = require ('cors');
mongoose.Promise = global.Promise;

//URI: MLab
mongoose.connect('mongodb://gladio:gladio123@ds351107.mlab.com:51107/api', {
    useNewUrlParser: true 
    
});

//Maneira Local: MongoDb:
/*mongoose.connect('mongodb://localhost:27017/node-crud-api', {
    useNewUrlParser: true 
});*/

//Configuração da variável app para usar o 'bodyParser()':
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) =>{
    req.io = io;
    next()
})

app.use(cors())


//Definindo a porta onde será executada a nossa api:
var port = process.env.port || 8000;

//Rotas da nossa API:
//=============================================================================

//Criando uma instância das Rotas via Express:
var router = express.Router();

//Middleware para usar em todos os requests enviados para a nossa API- Mensagem Padrão:
router.use(function(req, res, next) {
    console.log('Algo está acontecendo aqui....');
    next(); //aqui é para sinalizar de que prosseguiremos para a próxima rota. E que não irá parar por aqui!!!
});

//Rota de Teste para sabermos se tudo está realmente funcionando (acessar através: GET: http://localhost:8000/api): 
router.get('/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    
    res.json({ message: 'Beleza! Esta tudo OK' })
});

//API's:
//==============================================================================

//Rotas que terminarem com '/produtos' (servir: GET ALL & POST)
router.route('/produtos')

    /* 1) Método: Criar Produto (acessar em: POST http://localhost:8000/api/produtos)  */
    .post(function(req, res, next) {
        var produto = new Produto();

        //Aqui vamos setar os campos do produto (via request):
        produto.descricao = req.body.descricao;
        produto.referencia = req.body.referencia
        produto.preco = req.body.preco;
        produto.estoque = req.body.estoque;

        produto.save(function(error) {
            if(error)
                res.send('Erro ao tentar salvar o Produto....: ' + error);

            res.json({ message: 'Produto Cadastrado com Sucesso!' });
        });
    })

    /* 2) Método: Selecionar Todos Produtos (acessar em: GET http://localhost:8000/api/produtos)  */
    .get(function(req, res) {
        Produto.find(function(error, produtos) {
            if(error) 
                res.send('Erro ao tentar Selecionar Todos os produtos...: ' + error);
                           
            res.json(produtos);
        }).sort('-createdAt');
    });

    //Rotas que irão terminar em '/produtos/:produto_id' (servir tanto para: GET, PUT & DELETE: id):
    router.route('/produtos/:produto_id')

    /* 3) Método: Selecionar por Id: (acessar em: GET http://localhost:8000/api/produtos/:produto_id) */
    .get(function (req, res) {
        
        //Função para poder Selecionar um determinado produto por ID - irá verificar se caso não encontrar um detemrinado
        //produto pelo id... retorna uma mensagem de error:
        Produto.findById(req.params.produto_id, function(error, produto) {
            if(error)
                res.send('Id do Produto não encontrado....: ' + error);

            res.json(produto);
        });
    })

    /* 4) Método: Atualizar por Id: (acessar em: PUT http://localhost:8000/api/produtos/:produto_id) */
    .put(function(req, res) {

        //Primeiro: para atualizarmos, precisamos primeiro achar 'Id' do 'Produto':
        Produto.findById(req.params.produto_id, function(error, produto) {
            if (error) 
                res.send("Id do Produto não encontrado....: " + error);

                //Segundo: 
                produto.descricao = req.body.descricao;
                produto.referencia = req.body.referencia;
                produto.preco = req.body.preco;
                produto.estoque = req.body.estoque;

                //Terceiro: Agora que já atualizamos os dados, vamos salvar as propriedades:
                produto.save(function(error) {
                    if(error)
                        res.send('Erro ao atualizar o produto....: ' + error);

                    res.json({ message: 'Produto atualizado com sucesso!' });
                });
            });
        })

        /* 5) Método: Excluir por Id (acessar: http://localhost:8000/api/produtos/:produto_id) */
        .delete(function(req, res) {
            
            Produto.remove({
                _id: req.params.produto_id
                }, function(error) {
                    if (error) 
                        res.send("Id do Produto não encontrado....: " + error);

                    res.json({ message: 'Produto Excluído com Sucesso!' });
                });
            });


//Definindo um padrão das rotas prefixadas: '/api':
app.use('/api', router);

//Iniciando a Aplicação (servidor):
app.listen(port);
console.log("Servidor ON  " + port);