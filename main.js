//const socket = io('http://localhost:3000');
//const socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });
const socket = io('https://socketio-xksy.onrender.com', { transports: ['websocket', 'polling', 'flashsocket'] });
const str = openStream();
var countSMS = 0;
var togger = false;

$('#div-chat').hide();

var peridlocal;

var peer = new Peer();

peer.on('open', function(id) {
	peridlocal = id;
	const username1 = $('#txtUsername').val();
	//them video local
	$('#div-chat').append(`<div class="col-md-6" style="border: 2px solid #333; padding: 10px; margin-bottom: 5px; height: 50%" id="div${id}">
									<h3 id="localname">Local</h3>
									<audio id="${id}" playsinline autoplay muted></audio>
									<div class="control-buttons">
									  <button id="muteButton${id}" class="btn btn-secondary active" onclick="toggleMute('${id}')"><i class="fas fa-microphone"></i> Mute</button>
									  <button id="muteSpeakerButton${id}" class="btn btn-secondary active" onclick="toggleMuteSpeaker('${id}')"><i class="fas fa-volume-up"></i> Speaker</button>
									</div>
								  </div>`);
	openStream()
	.then(stream => playStream(id, stream));
	
	$('#btnSignUp').click(() => {
		const username = $('#txtUsername').val();
		checkadmin = username;
		if(socket.connected == false){
			//alert('Connect socket fail, wait for few second...');
			var loadingOverlay = document.querySelector(".loading-overlay");
  
			// Hi?n th? ph?n loading khi dang d?i?t n?i
			loadingOverlay.style.display = "flex";
			
		}
		
		
		str.then(stream => {
			socket.emit('NGUOI_DUNG',{ten : username, peerId : id});
			//in Name
			document.getElementById("localname").innerHTML = username;
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
	var loadingOverlay = document.querySelector(".loading-overlay");
  
			// Hi?n th? ph?n loading khi dang d?i?t n?i
	loadingOverlay.style.display = "none";
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
	
	if(togger == false){
		countSMS=countSMS+1;
	}else{
		countSMS=0;
	}
	
	$('#count_chat').html(countSMS);
	if(countSMS == 0){
		$('#count_chat').hide();
	}else{
		$('#count_chat').show();
	}
});

function checkAdmin(ten, peerId){
	//neu la admin
	if (checkadmin === "admin"){
	//them video cho nguoi moi
		$('#div-chat').append(`<div class="col-md-6" style="border: 2px solid #333; padding: 10px; margin-bottom: 5px; height: 50%" id="div${peerId}">
									<h3>${ten}</h3>
									<audio id="${peerId}" playsinline autoplay></audio>
									<div class="control-buttons">
									  <button id="muteButton${peerId}" class="btn btn-secondary active" onclick="toggleMute('${peerId}')"><i class="fas fa-microphone"></i> Mute</button>
									  <button id="muteSpeakerButton${peerId}" class="btn btn-secondary active" onclick="toggleMuteSpeaker('${peerId}')"><i class="fas fa-volume-up"></i> Speaker</button>
									</div>
								  </div>`);
	}else{
		$('#div-chat').append(`<div class="col-md-6" style="border: 2px solid #333; padding: 10px; margin-bottom: 5px;" id="div${peerId}">
									<h3>${ten}</h3>
									<audio id="${peerId}" playsinline autoplay></audio>
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
    const config = { audio: true};
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
		togger = true;
		countSMS=0;
		
	} else {
		chatBox.style.display = "none";
		togger = false;
	}
	
	$('#count_chat').html(countSMS);
	if(countSMS == 0){
		$('#count_chat').hide();
	}
}

function toggleMute(peerid) {
      var muteButton = document.getElementById("muteButton"+peerid);
      muteButton.classList.toggle("active");

      if (muteButton.classList.contains("active")) {
        muteButton.innerHTML = '<i class="fas fa-microphone"></i> Mute';
		socket.emit('onvoice', peerid);
      } else {
        muteButton.innerHTML = '<i class="fas fa-microphone-slash"></i> Mute';
		socket.emit('offvoice', peerid);
	  }
	}
	function toggleMuteSpeaker(peerid) {
      var muteSpeakerButton = document.getElementById("muteSpeakerButton"+ peerid);
	  muteSpeakerButton.classList.toggle("active");

      if (muteSpeakerButton.classList.contains("active")) {
        muteSpeakerButton.innerHTML = '<i class="fas fa-volume-up"></i> Speaker';
		socket.emit('onaudio', peerid);
      } else {
        muteSpeakerButton.innerHTML = '<i class="fas fa-volume-mute"></i> Speaker';
		socket.emit('offaudio', peerid);
	  }
	}
	
function offmic(peerid){
	document.getElementById(peerid).pause();
}
function onmic(peerid){
	document.getElementById(peerid).play();
}

socket.on('offvoice', (peerid) => {
	offmic(peerid);
});
socket.on('onvoice', (peerid) => {
	onmic(peerid);
});

socket.on('offaudio', (peerid) => {
	if(peerid === peridlocal){
		var audioElements = document.getElementsByTagName("audio");
		for (var i = 0; i < audioElements.length; i++) {
			if (peerid !== audioElements[i].id){
				document.getElementById(audioElements[i].id).pause();
			}
		}
	}
});
socket.on('onaudio', (peerid) => {
	if(peerid === peridlocal){
		var audioElements = document.getElementsByTagName("audio");
		for (var i = 0; i < audioElements.length; i++) {
			if (peerid !== audioElements[i].id){
				document.getElementById(audioElements[i].id).play();
			}
		}
	}
});
