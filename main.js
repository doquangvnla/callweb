//const socket = io('http://localhost:3000');
//const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });
const socket = io('https://socketio-xksy.onrender.com', { transports: ['websocket', 'polling', 'flashsocket'] });
const str = openStream();

$('#div-chat').hide();

var peer = new Peer();

peer.on('open', function(id) {
	$('#my-peer').append(id);
	
	
	$('#btnSignUp').click(() => {
		const username = $('#txtUsername').val();
		if(socket.connected == false){
			alert('Connect socket fail, wait for few second...');
			return;
		}
		
		
		str.then(stream => {
			
			socket.emit('NGUOI_DUNG',{ten : username, peerId : id});
			
			//playStream('localStream', stream);
		}).catch(err => {
			$('#div-chat').hide();
			$('#div-dang-ky').show();
			alert('permission denied!!')
		});;
	});
  });
  
socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));

socket.on('DANH_SACH', arrUser =>{
	$('#div-chat').show();
	$('#div-dang-ky').hide();
	console.log(arrUser);
	arrUser.forEach(user => {
	     const { ten, peerId } = user;
            $('#ulUser').append(`<div class="participant-item">
              <div class="participant-avatar"></div>
              <div class="participant-name">${ten}</div>
            </div>`);
    		
    		//them video nguoi den truoc
    		var id = $('#my-peer').html();
    		if(id != peerId){
    			$('#remote_video').append(`<audio class="video-frame" id="remoteStream${peerId}" controls></audio>`);
    		}
    });
	
	socket.on('CO_NGUOI', user =>{
		console.log(user);
		const { ten, peerId } = user;
		$('#ulUser').append(`<div class="participant-item" id="${peerId}">
          <div class="participant-avatar"></div>
          <div class="participant-name">${ten}</div>
        </div>`);
		
		//them video cho nguoi moi
        $('#remote_video').append(`<audio class="video-frame" id="remoteStream${peerId}" controls></audio>`);
		
		//goi voi nguoi moi vao
		
        str
    		.then(stream => {
    		    playStream('localStream', stream);
    			const call = peer.call(peerId, stream);
    			call.on('stream', remoteStream => playStream('remoteStream'+peerId, remoteStream));
    		});
	
	});	
		
	socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
		$(`#remoteStream${peerId}`).remove();
    });
	
});

//chat
socket.on('chat message', (msg) => {
	const form = document.getElementById('chat-form');
	const input = document.getElementById('chat-input');
	const messages = document.getElementById('messages');
	
	var strArr = msg.split(":");
	var li = document.createElement('li');
	var li_ten = document.createElement('span');
	var li_chu = document.createElement('span');
	
	var username = $('#txtUsername').val();
	if(username == strArr[0]){
		li_ten.style.color = "red";
	}
	
	li_ten.textContent = strArr[0] + ": ";
	li_chu.textContent = strArr[1];
	li.appendChild(li_ten);
	li.appendChild(li_chu);
	messages.appendChild(li);
});




function openStream() {
    const config = { audio: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
	if(idVideoTag == 'localStream'){
		video.muted = true;
	}
	if(video != undefined && video.srcObject == null){
	    video.srcObject = stream;
        video.play();
	}
    
}

openStream()
.then(stream => playStream('localStream', stream));


  
  
//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    str
    .then(stream => {
        call.answer(stream);
        //playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream'+call.peer, remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//chat
$('#send_msg').on('click', function(event) {
	event.preventDefault();
    const input = document.getElementById('chat-input');
	if (input.value) {
		var username = $('#txtUsername').val();
        socket.emit('chat message', username + ":" + input.value);
        input.value = '';
    }
});

function toggleChat() {
  var chatBox = document.getElementById("chatBox");
if (chatBox.style.display === "none" || chatBox.style.display == "") {
    chatBox.style.display = "flex";
  } else {
    chatBox.style.display = "none";
  }
}