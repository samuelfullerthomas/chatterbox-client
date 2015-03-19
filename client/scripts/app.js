// YOUR CODE HERE:
var appConstructor = function(){
	this.myFriends = [];
	this.selectedRoom = 'all';
	this.allRooms = {};
	this.init = function(){
		var self = this;
		this.fetch();
		setInterval(function(){
			self.fetch();
		},5000);
	};
	this.server = 'https://api.parse.com/1/classes/chatterbox';
	this.send = function(message){
		if(message.text.length === 0){ alert('Your messsage is empty homie!'); return;}
		var self = this;
		$.ajax({
		  // This is the url you should use to communicate with the parse API server.
		  url: this.server,
		  type: 'POST',
		  data: JSON.stringify(message),
		  contentType: 'application/json',
		  success: function (data) {
		  	self.fetch();
		  	//$('#message').val('');
		  }
		});
	};
	this.fetch = function(){
		var self = this;
		$.ajax({
		  // This is the url you should use to communicate with the parse API server.
		  url: self.server,
		  data: {'order': '-createdAt'},
		  success: function (data) {
		  	self.clearMessages();
		  	$(".nRoom").remove();
		  	for (var i = 0; i < data.results.length; i++){
		  		self.allRooms[data.results[i].roomname] = true;
		  		if(data.results[i].roomname === self.selectedRoom || self.selectedRoom === 'all'){
		  			self.addMessage(data.results[i])
		  		}
		  	}
		  	console.log(self.allRooms);
		  	for (var key in self.allRooms){
		  		self.addRoom(key);
		  	}
		  	$("#roomSelect option[value=" + self.selectedRoom + "]").prop('selected','selected');
		  }
		});
	};
	this.clearMessages = function(){
		$('#chats').empty();
	};
	this.addMessage = function(message){
		var className = 'username';
		if (this.myFriends.indexOf(message.username) >= 0){
			className += ' bold';
		}
		$("#chats").append('<span class="chat"><span class="' + className + '">' + message.username + '</span>: ' + this.lightSanitize(message.text) + '</span>');

	};
	this.addRoom = function(key){
		$("#roomSelect").append('<option value="' + key + '" class="nRoom">' + key + "</option>");
	};
	this.addFriend = function(friendName){
		this.myFriends.push(friendName);
	}
	this.lightSanitize = function(input){
		if(typeof input === 'undefined') return '';
		return input.split("<").join("");
	};

}
var app = new appConstructor();

$(document).ready(function(){

	$('body').on('click','.username',function(){
		app.addFriend($(this).html())
	});

	$('#send').submit(function(event){
		event.preventDefault();
		app.send({ 'text' :$("#message").val(),'username':window.location.search.replace('?username=',''),'roomname':(app.selectedRoom === 'all' ? '' : app.selectedRoom)});
		app.fetch();
	});
	$('#refreshMessages').on('click', function(){
		app.fetch();
	})
	$("#roomSelect").change(function(){
		app.selectedRoom = $(this).val();
		app.fetch();
	});
	$("#addRoom").on('click', function(){
		var newRoom = prompt('Please enter your new room name');
		if (newRoom.length < 1) return;
		app.addRoom(newRoom);
		app.send({ 'text' : 'I just created this room!','username':window.location.search.replace('?username=',''),'roomname': newRoom})
	});
	$("#clear").on('click', function(){
		app.clearMessages();
	});

	app.init();
});