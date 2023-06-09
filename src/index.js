import express from 'express'
const app = express();
app.use(express.json());

app.listen(8080, () => console.log('Servidor iniciado'))

app.get('/', (request, response) => {

    return response.status(200).send('<h1> Bem vindo ao trabalho final do módulo back-end I da Growdev! </h1>')
});

const listaUsuarios = []

app.post('/usuarios', (request, response) => {
    const dados = request.body
    
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
    
    const novoUsuario = {
            id: new Date().getTime(),
            nome: dados.nome,
            email: dados.email,
            senha: dados.senha,
            logado: false,
            recados: []
        }
    
    listaUsuarios.push(novoUsuario)

    return response.status(201).json({
        sucesso: true,
        dado: novoUsuario,
        mensagem: 'Uhuuulll, usuário cadastrado com sucesso!'
    })

});


app.post('/login', (request, response) =>{
    const dadosdoUsuario = request.body

    const usuarioEncontrado = listaUsuarios.find((user) => user.email === dadosdoUsuario.email && user.senha === dadosdoUsuario.senha)
    
    if(!usuarioEncontrado) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Não encontramos o seu cadastro ou e-mail e senha incorretos. Volte um casa!!' 
        })
    }

    if(!dadosdoUsuario.email || !dadosdoUsuario.senha) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Opss, e-mail ou senha incorretos!!' 
        })
    }

    listaUsuarios.forEach(usuario => {
        if(usuario.email !== usuarioEncontrado.email) {
            usuario.logado = false
        }  else {

        usuario.logado = true
        }
    })

    return response.status(200).json({
        sucesso: true,
        mensagem: 'Estamos dentro!!' 
        
    })
})

const listaRecados = []

app.post('/recados', (request, response) => {
    const dados = request.body
    
    const usuarioLogado = listaUsuarios.findIndex(user => user.logado === true)
    
    if (usuarioLogado === -1 || !listaUsuarios[usuarioLogado]) {
        return response.status(400).json ({
            sucesso: false,
            mensagem: 'Quer criar um post? Criar um conta ou faça login!!'
        })
    }

    if (!dados.titulo) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Parece que você esqueceu o título.'
        })
    }
    if (!dados.descricao) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Parece que você esqueceu a descrição.'
        })
    }
    
    const novoRecado = {
        id: new Date().getTime(),
        titulo: dados.titulo,
        descricao: dados.descricao,
    }
    
    listaUsuarios[usuarioLogado].recados.push(novoRecado)

    return response.status(201).json({
        sucesso: true,
        dado: novoRecado,
        mensagem: 'Feito! Recado criado com sucesso!' 
    })
}) 

app.get('/recados', (request, response) =>{
    const usuarioLogado = listaUsuarios.findIndex(user => user.logado === true)
    
    if (usuarioLogado === -1 || !listaUsuarios[usuarioLogado]) {
        return response.status(400).json ({
            sucesso: false,
            mensagem: 'Quer ver a lista de recados? Faça login!'
        })
    }
    const recados = listaUsuarios[usuarioLogado].recados
    
        return response.status(200).json({
            sucesso: true,
            dado: recados,
            mensagem: 'Esses foram os recados encontrados'
        })
    }

)

app.put('/recados/:id', (request, response) => {
    const usuarioLogado = listaUsuarios.findIndex(user => user.logado === true)
    
    if (usuarioLogado === -1 || !listaUsuarios[usuarioLogado]) {
        return response.status(400).json ({
            sucesso: false,
            mensagem: 'Quer editar um post? Faça login!'
        })
    }
    
    const recadoIndex = listaUsuarios[usuarioLogado].recados.findIndex(r => r.id == request.params.id)
    
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
    
    if (usuarioLogado === -1 || !listaUsuarios[usuarioLogado]) {
        return response.status(400).json ({
            sucesso: false,
            mensagem: 'Quer deletar um post? Faça login!'
        })
    }
    
    const recadoIndex = listaUsuarios[usuarioLogado].recados.findIndex(r => r.id == request.params.id)

    if(recadoIndex < 0) {
        return response.status(400).json('Não encontramos nenhum recado. :(')
    }

    listaUsuarios[usuarioLogado].recados.splice(recadoIndex, 1)
    
    return response.json('Recado excluído!')
})