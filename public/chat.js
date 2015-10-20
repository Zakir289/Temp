var chat = chat || {};
var x;
jQuery.fn.reverse = [].reverse;


(function($, window, chat, undefined){
    var socket = io();
    var username = '';
    var connected = false;
    var isTyping = false;
    var typingTimer;
    var typingInterval = 4000;
    var usersTyping = {};

    var config = {
        chatPage: ".outerPanel",
        loginPage: ".page-login",
        loginError: ".login-error",
        messages: ".messages",
        userCount: ".page-chat .userCount",
        userTyping: ".page-chat .userTyping",
        loginForm: ".form-login",
        msgForm: ".form-msg",
        msgContainer: ".container-msg",
        connectedUsers: ".connectedUsers"
    };
    var $chatPage, $loginPage, $messages, $userCount, $loginForm, $msgForm, $userTyping,
        $msgContainer, $connectedUsers, $loginError;

    chat.init = function(cfg){
        $.extend(config, cfg);
        // Cache some of the elements
        $chatPage = $(config.chatPage);
        $loginPage = $(config.loginPage);
        $messages = $(config.messages);
        $userCount = $(config.userCount);
        $loginForm = $(config.loginForm);
        $msgForm = $(config.msgForm);
        $userTyping = $(config.userTyping);
        $msgContainer = $(config.msgContainer);
        $connectedUsers = $(config.connectedUsers);
        $loginError = $(config.loginError);
        setUpForms();
    };

    var setUpForms = function() {
        $loginForm.submit(function () {
            username = $(this).find('input.username').first().val().trim();
            $loginError.text('');
            if (username) {
                socket.emit('add user', {
                    "username": username
                });
            }
            return false;
        });


        $msgForm.submit(function () {
            var $msgInput = $(this).find('input.msg').first();
            var msg = $msgInput.val();
            var tokens = msg.split(' ');
            switch (tokens[0]) {
                case "@":
                    if (tokens[1] && tokens[2]) {
                        var message = msg.substring(tokens[0].length + tokens[1].length + 2);
                        showPrivateMessage("Me to " + tokens[1], message);
                        socket.emit('private message', {
                            "username": username,
                            "to": tokens[1],
                            "message": message
                        });
                    }
                    break;
                default:
                    if (msg != '') {
                        showMyMessage(msg);
                        socket.emit('chat message',
                            {
                                "message": msg
                            });
                    }
                    break;
            }

            $msgInput.val('');
            return false;
        });

    }
    socket.on('login', function(data){
        connected = true;
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        showSystemMessage("Oh hey, welcome to Just Chattin'");
        updateUserCount(data.userCount);
        updateConnectedUsers(data.usernames);
    });

    socket.on('user joined', function(data){
        showSystemMessage(data.username + ' has joined the chat');
        updateUserCount(data.userCount);
        updateConnectedUsers(data.usernames);
    });

    var showSystemMessage = function(message){
        $messages.append($('<li>')
            .addClass('text-muted')
            .text(message));
    };

    var updateUserCount = function(userCount){
        $userCount.text(userCount);
    };
    var updateConnectedUsers = function(usernames){
        //check the check list
        $('#check-list-box').empty();

        $.each(usernames, function(key, value){
        var checkBox = $('<span>').addClass('state-icon glyphicon glyphicon-unchecked');
            checkBox.text(key)
        var user = $('<li>').addClass('list-group-item').append(checkBox)
        $('#check-list-box').append(user)

        });
    };
    var showMyMessage = function(message){
        $messages.append($('<li>')
            .addClass('text-primary')
            .text("Me: " + message));
        $msgContainer.scrollTop($msgContainer.height());
    };

    socket.on('chat message', function(data){
        showMessage(data.username, data.message);
    });

    var showMessage = function(username, message){
        $messages.append($('<li>')
            .addClass('')
            .text(username + ": " + message));
        $msgContainer.scrollTop($msgContainer.height());
    };

    socket.on('private message', function(data){
        showPrivateMessage(data.username, data.message);
    });
    var showPrivateMessage = function(username, message){
        $messages.append($('<li>')
            .addClass('text-warning')
            .text(username + ": " + message));
        $msgContainer.scrollTop($msgContainer.height());
    };


})(jQuery, window, chat)