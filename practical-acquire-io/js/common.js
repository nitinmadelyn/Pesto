const CHAT_URL = "http://localhost:8080";
const API_URL  = "http://localhost:3000";
var clickListener = false;
var socket;

function checkUser(){
    if(checkCookie('token') === false){
        $('#loginUser').modal('show');
    } else {
        connectChat(getCookie('token'));
    }
}

function authorizeUser(){
    var settings = {
        "url": API_URL+"/user/authorization",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({"nickName": $("#nickName").val()})
    };

    $.ajax(settings).done(function (response) {
    if(response.status == "success"){
        setCookie("token", response.token, 30);
        setCookie("userId", response.userId, 30);
        $('#loginUser').modal('hide');
        connectChat(response.token)
    } else {
        alert(response.message);
    }
    });
}

function connectChat(token){
    socket = io(CHAT_URL+'?Authorization='+token);
    allEmitReceiver();

    var settings = {
        "url": API_URL+"/user/get-all",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": token
        }
    };

    $.ajax(settings).done(function (response) {
    if(response.status == "success"){
        if(response.items.length > 0){
            let chatBoxes = '';
            response.items.forEach(function(item){
                let hide = '';
                if(item.isOnline == "Yes"){
                    hide = ' style="display: block;" ';
                }
                chatBoxes += '<a href="javascript:void(0);" onclick="getConversation('+item.id+');"><div class="chat_list" data-id="'+item.id+'">\
                                <div class="chat_people">\
                                <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> <span class="online" '+hide+'></span> </div>\
                                <div class="chat_ib">\
                                    <h5>'+item.nickName+' <span class="chat_date">'+formatDate(item.createdAt, 'list')+'</span></h5>\
                                </div>\
                                </div>\
                            </div></a>';
            });
            $(".inbox_chat").html(chatBoxes);
            
            //check userIds query params in url
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const paramUserIds = urlParams.get('userIds')
            if(paramUserIds != null && paramUserIds.trim() != ""){
                $('.chat_list[data-id="'+paramUserIds+'"]').addClass("active_chat")
                getConversation(paramUserIds);
            }
            
            //this is for active class of chat
            if(clickListener === false){
                clickListener = true;
                $('.chat_list').on('click',function(){
                    $(".msg_history").html('');
                    $('.chat_list').removeClass("active_chat")
                    $(this).addClass("active_chat")
                    //append userId to url
                    window.history.replaceState(null, null, "?userIds="+$(this).attr("data-id"));
                });
            }
        } else {
            $(".inbox_chat").html('<div class="chat_list">No user(s)</div>');
        }
    } else {
        alert(response.message);
    }
    });
}

//get all conversation
function getConversation(userId){
    //check if conversation exists
    var settings = {
        "url": API_URL+"/user/get-conversation",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": getCookie('token')
        },
        "data": JSON.stringify({"userIds": userId.toString()})
    };
    $.ajax(settings).done(function (response) {
        if(response.status == "success"){
            console.log("get conv...", response)
            $("#activeSession").val(response.session);
            
            if(typeof(response.items) === "undefined"){
                return;
            }
            //fill all messages
            if(response.items.length > 0){
                if(response.session == $("#activeSession").val()){
                    response.items.forEach(function(msg){
                        if(msg.messageType == 2){
                            if(msg.senderId == getCookie('userId')){
                                msg.messageContent = msg.messageContent.replace(response.userNickname, "You")
                            }
                            
                            let newMessage = '<div class="msgtype">\
                                                    <p>'+msg.messageContent.replace()+'</p>\
                                              ';
                            $(".msg_history").append(newMessage)
                        } else {
                            if(getCookie('userId') == msg.senderId){
                                let newMessage = '<div class="outgoing_msg">\
                                                        <div class="sent_msg">\
                                                        <p>'+msg.messageContent+'</p>\
                                                        <span class="time_date">'+formatDate(msg.createdAt)+'</span> </div>\
                                                    </div>';
                                $(".msg_history").append(newMessage)
                            } else {
                                let newMessage = '<div class="incoming_msg">\
                                                    <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>\
                                                    <div class="received_msg">\
                                                    <div class="received_withd_msg">\
                                                        <p>'+msg.messageContent+'</p>\
                                                        <span class="time_date">'+formatDate(msg.createdAt)+'</span></div>\
                                                    </div>\
                                                </div>';
                                $(".msg_history").append(newMessage)
                            }
                        }
                    })
                    $('.msg_history').animate({scrollTop: $('.msg_history').prop("scrollHeight")}, 500);
                }
            }
        } else {
            alert(response.message);
        }
    });

    //get all converation on click of chat list
    // if(usersLoaded === false){
    //     usersLoaded = true;
    //     $('.chat_list').on('click',function(){
    //         $(".write_msg").attr("disabled",false)
    //         $(".msg_send_btn").attr("disabled",false)

    //         $('.chat_list').removeClass("active_chat")
    //         $(this).addClass("active_chat")
    //         $(".write_msg").val('')
            
    //         //check if conversation exists
    //         var settings = {
    //             "url": API_URL+"/user/get-conversation",
    //             "method": "POST",
    //             "headers": {
    //                 "Content-Type": "application/json",
    //                 "Authorization": getCookie('token')
    //             },
    //             "data": JSON.stringify({"userIds": userId.toString()})
    //         };
    //         $.ajax(settings).done(function (response) {

    //         });
    //     });
    // }
}

//send message
function sendMessage(){
    const session = $("#activeSession").val();
    if(session.trim() == ""){
        alert("No active session.");
        return;
    }
    const msg = $(".write_msg").val();
    if(msg.trim() != ""){
        socket.emit("sendMessage", {session: session, messageContent: msg, senderId: getCookie('userId')} );
        $(".write_msg").val('');
    }
}

//all emit receiver from chat server
function allEmitReceiver(){
    socket.on("connect", () => {
        console.log("socket connected...", socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on("disconnect", () => {
        console.log("socket disconnected...", socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on("online", (params) => {
        console.log("online emit...", params)
        $('.chat_list[data-id="'+params.userId+'"] .chat_img .online').css('display','block');
    });

    socket.on("offline", (params) => {
        console.log("offline emit...", params)
        $('.chat_list[data-id="'+params.userId+'"] .chat_img .online').css('display','none');
    });

    //receive Message
    socket.on("getMessage", (params) => {
        console.log("new message...", params);

        //append userid in url
        if(typeof(params.addedUser) !== "undefined"){
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const paramUserIds = urlParams.get('userIds')
            window.history.replaceState(null, null, "?userIds="+paramUserIds+","+params.addedUser);
        }

        //check if window open
        if(params.session == $("#activeSession").val()){
            if(params.messageType == 2){
                let newMessage = '<div class="msgtype">\
                                        <p>'+params.messageContent+'</p>\
                                  ';
                $(".msg_history").append(newMessage)
            } else {
                if(getCookie('userId') == params.senderId){
                    let newMessage = '<div class="outgoing_msg">\
                        <div class="sent_msg">\
                        <p>'+params.messageContent+'</p>\
                        <span class="time_date">'+formatDate(params.createdAt)+'</span> </div>\
                    </div>';
                    $(".msg_history").append(newMessage)
                } else {
                    let newMessage = '<div class="incoming_msg">\
                                        <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>\
                                        <div class="received_msg">\
                                        <div class="received_withd_msg">\
                                            <p>'+params.messageContent+'</p>\
                                            <span class="time_date">'+formatDate(params.createdAt)+'</span></div>\
                                        </div>\
                                    </div>';
                    $(".msg_history").append(newMessage)
                }
            }
            $('.msg_history').animate({scrollTop: $('.msg_history').prop("scrollHeight")}, 500);
        } else {
            console.log("window not open")
        }
    });
    console.log(socket);
}

//add user to conversation
function addUserToConversation(nickName){
    const session = $("#activeSession").val();
    if(session.trim() == ""){
        alert("no active session");
        return;
    } 

    var settings = {
        "url": API_URL+"/user/add-user-to-conversation",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": getCookie('token')
        },
        "data": JSON.stringify({"session": session, nickName: nickName})
    };
    $.ajax(settings).done(function (response) {
        console.log(response);
        if(response.status == "success"){
            let msg = response.nickName+" added "+nickName+" to this conversation";
            socket.emit("sendMessage", {session: session, messageContent: msg, messageType: 2, addedUser: response.addedUser, senderId: getCookie('userId')} );
            
            $(".search-bar").val('');
        } else {
            alert(response.message)
            $(".search-bar").val('');
        }
    });
}

//all cookies functions
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(cname) {
    var user = getCookie(cname);
    if (user != "") {
        return true;
    } else {
        return false;
    }
}

function formatDate(timestamp, format){
    let date = new Date(timestamp);
    if(format == 'list'){
        return date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
    } else {
        return date.getHours()+":"+date.getMinutes()+" | "+date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
    }
}