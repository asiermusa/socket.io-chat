const express = require("express")
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')
const multer  = require('multer')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

server.listen(3030, () => {
  console.log('App is running on http://localhost:3030')
})

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.post('/upload', upload.single('avatar'), function (req, res, next) {
  //console.log(req.file)
})

io.on('connection', (socket) => {

  var clientid = socket.username
  socket.username = 'guest'


  socket.on('username', (res) => {
    socket.username = res.username
  })

  socket.on('chat', (res) => {
    console.log('Socket message received => ' + res.txt)
    io.emit('chat response', {
      response: res.txt,
      sender: socket.username
    })
  })

  socket.on('upload image', (res) => {
    var loop = setInterval(() => {
      if (fs.existsSync('uploads/' + res.image)) {
        fs.readFile('uploads/' + res.image, (err, data) => {
          io.emit('send image', { image: true, buffer: data.toString('base64'), sender: socket.username });
          fs.unlinkSync('uploads/' + res.image)
        })
        clearInterval(loop);
      }
    }, 100)
  })

  socket.on('typing', () => {
    socket.broadcast.emit('typing', { username: socket.username })
  })

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {})
  })
})
