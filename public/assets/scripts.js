const url = 'http://localhost:3030'
const socket = io.connect(url)
const chat = []

document.getElementById('sendImage').addEventListener('click', uploadImage)

function uploadImage(event) {
  event.preventDefault()
  if (document.getElementById("avatar").files[0].size < 300000) {
    var form = document.getElementById("uploadForm");
    var formData = new FormData(form);
    fetch(url + '/upload', {
      method: 'POST',
      body: formData
    });
    console.log(document.getElementById("avatar").files[0])
    socket.emit('upload image', {
      image: document.getElementById("avatar").files[0].name
    })
  } else {
    alert('The image is too big...')
  }
}

socket.on('send image', (image) => {

  var list = document.createElement('li');
  list.className = 'image';
  document.getElementById("container").appendChild(list);

  // Now create and append to list
  var imageElem = document.createElement('img')
  imageElem.src = 'data:image/jpeg;base64,' + image.buffer.toString('base64')
  imageElem.classList = 'lightbox'
  list.innerHTML += '<span>' + image.sender + ' > </span>'
  list.appendChild(imageElem);
  modals()
  scrollBottom()
})


document.getElementById('setUsername').addEventListener('click', () => {
  if (document.getElementById('username').value) {
    socket.emit('username', {
      username: document.getElementById('username').value
    })
    
    alert(document.getElementById('username').value + ' is your current username!')
  } else {
    alert('Set your username...')
  }
})

socket.on('chat response', (res) => {
  document.getElementById('container').innerHTML += '<li><span>' + res.sender + ' > </span>' + res.response + '</li>'
  modals()
  scrollBottom()
})

document.getElementById('sendMessage').addEventListener('click', (e) => {
  e.preventDefault()
  socket.emit('chat', {
    txt: document.getElementById('txt').value
  })
  socket.emit('stop typing');
  typing = false;
  document.getElementById('txt').value = ''
})

//typing functionallity (...idazten)
var typing = false

document.getElementById('txt').addEventListener('keyup', () => {
  let lastTypingTime = (new Date()).getTime()
  if (!typing) {
    typing = true;
    socket.emit('typing');
  }
  lastTypingTime = (new Date()).getTime();

  setTimeout(() => {
    var typingTimer = (new Date()).getTime();
    var timeDiff = typingTimer - lastTypingTime;
    if (timeDiff >= 1000 && typing) {
      socket.emit('stop typing');
      typing = false;
    }
  }, 2500);
})

socket.on('typing', data => {
  document.getElementById('typing').innerHTML = `<p><i><b>${data.username}</b> is writting...</i></p>`
})

socket.on('stop typing', data => {
  document.getElementById('typing').innerHTML = ''
})

// Get the modal
function modals() {
  var modal = document.getElementById("myModal");
  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var img = document.querySelectorAll('.lightbox');
  var modalImg = document.getElementById('img01')
  img.forEach(res => {
    res.addEventListener('click', (e) => {
      modal.style.display = "block";
      modalImg.src = e.target.src;
    })
  })
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
}

function scrollBottom() {
  var scrollingElement = (document.scrollingElement || document.body);
  scrollingElement.scrollTop = scrollingElement.scrollHeight;
}
