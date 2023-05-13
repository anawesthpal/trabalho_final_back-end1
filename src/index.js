import express, { request, response } from 'express'
const app = express();
app.use(express.json());

app.listen(8080, () => console.log('Servidor iniciado'))

app.get('/', (request, response) => {

    return response.status(200).send('<h1> Bem vindo ao trabalho final do módulo back-end I da Growdev! </h1>')
});

const listaUsuarios = []

// TESTADO E OK
app.post('/usuarios', (request, response) => {
    const dados = request.body

const novoUsuario = {
        id: new Date().getTime(),
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        logado: false,
        recados: []
    }

    if (!dados.nome){
        return response.status(400).json('Hey, o nome é obrigatório!')
    }
    if (!dados.email){
        return response.status(400).json('Hey, o e-mail também é obrigatório!')
    }
   if (!dados.email || !dados.email.includes('@') || !dados.email.includes('.com')){
        return response.status(400).json({
            sucesso: false,
            dado: null,
            mensagem: 'É sério que está tentando cadastrar qualquer coisa? Coloca um e-mail válido logo para finalizar o cadastro!'
        })
    }
    if (!dados.senha){
        return response.status(400).json('Achou que ia poderia se cadastrar sem senha? Está engado. Cadastra logo sua senha!')
    }
    if (dados.senha.length < 10 ){
        return response.status(400).json('Hey, deixa de ser preguiçoso. Sua senha precisa ter no mínimo 10 caracteres.')
    }
    if (listaUsuarios.some((user) => user.email === dados.email)){
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Ops, usuário já cadastrado!'
        })
    }

    listaUsuarios.push(novoUsuario)

    return response.status(201).json({
        sucesso: true,
        dado: novoUsuario,
        mensagem: 'Uhuuulll, usuário cadastrado com sucesso!'
    })

});

// TESTADO E OK
app.post('/login', (request, response) =>{
    const dadosdoUsuario = request.body

    const emailCorreto = listaUsuarios.some((user) => user.email === dadosdoUsuario.email)
    const senhaCorreta = listaUsuarios.some((user) => user.senha === dadosdoUsuario.senha)

    if(!emailCorreto || !senhaCorreta) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Opss, e-mail ou senha incorretos!!' 
        })
    }

    listaUsuarios.forEach(usuario => usuario.logado = false)

    const user = listaUsuarios.find((user) => user.email === dadosdoUsuario.email)

    user.logado = true

    return response.status(200).json({
        sucesso: true,
        mensagem: 'Estamos dentro!!' 
        
    })
})

const listaRecados = []

// CRIAR RECADOS
app.post('/recados', (request, response) => {
    const recado = request.body
    
const posicao = listaUsuarios.findIndex(user => user.logado === true)
    
    if (posicao == -1) {
        return response(400).json ({
            sucesso: false,
            mensagem: 'Ops, não encontramos o usuário ou não está logado!'
        })
    }

    if (!recado.titulo) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Parece que você esqueceu o título.'
        })
    }
    if (!recado.descricao) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Parece que você esqueceu a descrição.'
        })
    }
    
    const novoRecado = {
        id: new Date().getTime(),
        titulo: recado.titulo,
        descricao: recado.descricao,
    }
    
    listaUsuarios[posicao].recados.push(novoRecado)

    console.log(novoRecado)
    
    return response.status(200).json({
        sucesso: true,
        dado: novoRecado,
        mensagem: 'Feito! Recado criado com sucesso!' 
    })
}) 



app.get('/recados', (request, response) =>{
    const usuarioLogado = listaUsuarios.findIndex(user => user.logado === true)
    const recados = listaUsuarios[usuarioLogado].recados
    
    console.log(recados)
    if (recados){
        return response.json(recados)
    } else {

        return response.status(400).json({
            sucesso: false,
            mensagem: 'ops! Nenhum recados encontrado!.'
        })
    }
})


app.put('/recados/:id', (request, response) => {
    console.log('put /recados')

    const usuarioLogado = listaUsuarios.findIndex(user => user.logado === true)
    console.log('usuarioLogado', usuarioLogado)

    const recadoIndex = listaUsuarios[usuarioLogado].recados.findIndex(r => r.id == request.params.id)
    console.log('recadoIndex', request.params.id, recadoIndex)
  
    if (recadoIndex == -1){
            return response.status(400).json('Ops, nenhum recado encontrado encontrado.')
    } else {
        listaUsuarios[usuarioLogado].recados[recadoIndex].titulo = request.body.titulo
        listaUsuarios[usuarioLogado].recados[recadoIndex].descricao = request.body.descricao
        
    }

    return response.json('Recado alterado com sucesso!')
})

app.delete('/recados/:id', (request, response) => {
    const usuarioLogado = listaUsuarios.findIndex(user => user.logado === true)
    const recadoIndex = listaUsuarios[usuarioLogado].recados.findIndex(r => r.id == request.params.id)

    if(recadoIndex < 0) {
        return response.status(400).json('Não encontramos nenhum recado. :(')
    }

    listaUsuarios[usuarioLogado].recados.splice(recadoIndex, 1)
    
    return response.json('Recado excluído!')
})
