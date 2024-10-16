const path=await import('path')

const {default:fm} = await import('./CORE/server.js')
const { server,settings} =fm()
settings.setRoute('/public', (req, res) => {
    res.send('hi',"message")
})
settings.setRoute('/',  (req, res) => {
    res.send('index.html','html')
})
server(3000)


