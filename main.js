//const socket = io('http://localhost:3000');
//const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });
const socket = io('https://socketio-xksy.onrender.com', { transports: ['websocket', 'polling', 'flashsocket'] });
const str = openStream();

$('#div-chat').hide();

var peridlocal;

var peer = new Peer();

peer.on('open', function(id) {
	peridlocal = id;
	const username1 = $('#txtUsername').val();
	//them video local
	$('#div-chat').append(`<div class="col-md-6" style="border: 2px solid #333; padding: 10px; margin-bottom: 5px;" id="div${id}">
									<h2>Local</h2>
									<video id="${id}" playsinline autoplay muted></video>
									<div class="control-buttons">
									  <button id="muteButton${id}" class="btn btn-secondary active" onclick="toggleMute()"><i class="fas fa-microphone"></i> Mute</button>
									  <button id="muteSpeakerButton${id}" class="btn btn-secondary active" onclick="toggleMuteSpeaker()"><i class="fas fa-volume-up"></i> Speaker</button>
									</div>
								  </div>`);
	openStream()
	.then(stream => playStream(id, stream));
	
	$('#btnSignUp').click(() => {
		const username = $('#txtUsername').val();
		checkadmin = username;
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
    		
    		//them video nguoi den truoc
    		var id = peridlocal;
    		if(id != peerId){
				
				//neu la admin
				checkAdmin(ten,peerId);
    		}
    });
	
	socket.on('CO_NGUOI', user =>{
		console.log(user);
		const { ten, peerId } = user;
		//neu la admin
		checkAdmin(ten,peerId);
	
	});	
		
	socket.on('AI_DO_NGAT_KET_NOI', peerId => {
		
		const divElement = document.getElementById('div'+peerId);

		// Remove the div element
		divElement.remove();
		
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

function checkAdmin(ten, peerId){
	//neu la admin
	if (checkadmin === "admin"){
	//them video cho nguoi moi
		$('#div-chat').append(`<div class="col-md-6" style="border: 2px solid #333; padding: 10px; margin-bottom: 5px;" id="div${peerId}">
									<h2>${ten}</h2>
									<video id="${peerId}" playsinline autoplay></video>
									<div class="control-buttons">
									  <button id="muteButton${peerId}" class="btn btn-secondary active" onclick="toggleMute()"><i class="fas fa-microphone"></i> Mute</button>
									  <button id="muteSpeakerButton${peerId}" class="btn btn-secondary active" onclick="toggleMuteSpeaker()"><i class="fas fa-volume-up"></i> Speaker</button>
									</div>
								  </div>`);
	}else{
		$('#div-chat').append(`<div class="col-md-6" style="border: 2px solid #333; padding: 10px; margin-bottom: 5px;" id="div${peerId}">
									<h2>${ten}</h2>
									<video id="${peerId}" playsinline autoplay></video>
								  </div>`);
		
	}
	//play video
	//goi voi nguoi moi vao
	str
		.then(stream => {
			//playStream('localStream', stream);
			const call = peer.call(peerId, stream);
			call.on('stream', remoteStream => playStream(peerId, remoteStream));
		});
}


function openStream() {
    const config = { audio: true , video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
	//if(idVideoTag == 'localStream'){
	//	video.muted = true;
	//}
	if(video != undefined && video.srcObject == null){
	    video.srcObject = stream;
        //video.play();
		video.setAttribute("autoplay", true);
		video.setAttribute("playsinline", true);
	}
    
}

//openStream()
//.then(stream => playStream('localStream', stream));


  
  
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

var checkadmin;
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