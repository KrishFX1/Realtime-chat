const firebaseConfig = {
   <Your firebaseConfig>
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {
    var blurEl = document.getElementById("elementWidth");
    blurEl.focus()

    document.getElementById('elementWidth').addEventListener('blur', function () {
        var blurEl = document.getElementById("elementWidth");
        blurEl.focus()
    })
    const fileSelector = document.getElementById('file-select');
    fileSelector.addEventListener('change', (event) => {
        const fileList = event.target.files;
        const filelist = fileList
        if (fileList.length == 1) {
            var timestamp = Date.now()
            var reader = new FileReader();
          
            reader.onload = function(event) {
                myFunction({
                    name: currentUserName, message: event.target.result, RorL: 'right', type: "image", time: timestamp
                })
            };
          
            reader.readAsDataURL(fileList[0]);
           
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Client-ID 2809817d5151af3");
            const formdata = new FormData()
            formdata.append("image", filelist[0])

          fetch("https://api.imgur.com/3/image", {
                method: "POST",
                headers: myHeaders,
                body: formdata,
                redirect: 'follow'
            }).then(data => data.json()).then(async function (data) {
                var img = data.data.link
               
               await firestore.collection("messages").add({
                    message: img,
                    userID: currentUserID,
                    userName: currentUserName,
                    type: 'image',
                    timestamp: timestamp
                })

                db.collection("messages").add({
                    userName: currentUserName,
                    userID: currentUserID,
                    type: 'image',
                    timestamp: timestamp,
                    message: img
                })
                userDB.collection("UserData").doc("UserID").update({
                    timestamp: timestamp
                })
            }).catch((err) => {
                alert("Image Upload Failed")
            })
        }
    });

    const imageSelect = document.getElementById("attachImage")
    imageSelect.addEventListener('click', () => {
        fileSelector.click()
    })
    document.addEventListener('keypress', function (event) {

        if (event.key === 'Enter') {
            var timestamp = Date.now()
            var message = document.getElementById('elementWidth').value
            document.getElementById('elementWidth').value = ''
            if (message == '') {

            } else {
                myFunction({
                    name: currentUserName, time: timestamp, message: message, type: "chat", RorL: "right"
                })
                db.collection("messages").add({
                    userName: currentUserName,
                    userID: currentUserID,
                    type: 'chat',
                    timestamp: timestamp,
                    message: message
                })
                userDB.collection("UserData").doc("UserID").update({
                    timestamp: timestamp
                })
                firestore.collection("messages").add({
                    message: message,
                    userID: currentUserID,
                    userName: currentUserName,
                    type: 'chat',
                    timestamp: timestamp
                })
            }
        }
    })



    document.getElementById("sendMessage").addEventListener('click', function () {
        var timestamp = Date.now()
        var message = document.getElementById("elementWidth").value
        document.getElementById('elementWidth').value = ''
        if (message == '') {

        } else {
            myFunction({
                name: currentUserName, time: timestamp, message: message, type: "chat", RorL: "right"
            })
            document.getElementById("Hi").setAttribute('href', `#${timestamp}`)
            document.getElementById("Hi").click()
            db.collection("messages").add({
                userID: currentUserID,
                UserName: currentUserName,
                type: 'chat',
                timestamp: timestamp,
                message: message
            })
            userDB.collection("UserData").doc("UserID").update({
                timestamp: timestamp
            })
            firestore.collection("messages").add({
                message: message,
                userName: currentUserName,
                userID: currentUserID,
                type: 'chat',
                timestamp: timestamp
            })
        }
    });
});

function myFunction({ name, time, message, RorL, type }) {
    var element
    if (type == "chat") {
        var ISTtime = new Date(time).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
        var Time = ISTtime.split(', ')[1].split(':')
        var hour = Time[0]
        var minute = Time[1]
        var AmPm = Time[2].split(' ')[1]

        var Time = hour + ':' + minute + ' ' + AmPm
        if (RorL == 'left') {
            element = `<li> <div class ="invisible-div"> 
    <div class="left"> <section id="${time}"></section> <div style="font-size: 10px; color: #414141;">${name}</div> ${message} <div style="font-size: 8px;color:#4E4F51 ; font-style: italic; text-align: end;">${Time}</div> </div> </div></li>`
        } else {
            element = `<li>  
        <div class="right"> <section id="${time}"></section> ${message} <div style="font-size: 8px;color:#4E4F51 ; font-style: italic; text-align: end;">${Time}</div> </div></li>
   `
        }
    } else if (type == "join") {
        element = `<li>  
        <div class="center">${name} joined the server <section id="${time}"></section>  </div></li>
    `
    } else if (type == "image") {
        if (RorL == "left") {
            element = `<li> <div class = "invisible-div"> <div id='leftImageDiv'><img id="image"  class = 'left-Image' src='${message}'><section id="${time}"> </section> </div> </div></li>`

        } else {
            element = `<li> <div id='rightImageDiv'><img id="image"  class = 'right-Image' src='${message}'><section id="${time}"> </section> </div></li>`
        }
    }

    var mylist = document.getElementById('myList');
    mylist.insertAdjacentHTML('beforeend', element);
    document.getElementById("Hi").setAttribute('href', `#${time}`)
    document.getElementById("Hi").click()
}

let db = new Localbase('Database')
let userDB = new Localbase("User")
var currentUserID
var currentUserName
var lastTimestamp

userDB.collection("UserData").doc("UserID").get().then(async function (userData) {

    if (userData == null) {
        var timestamp = Date.now()
        var userName;
        do {
            userName = prompt("Please enter your name , must be atleast 4 letters long.");
        } while (userName == null || userName.length < 4);

        myFunction({
            type: 'join',
            message: '',
            time: timestamp, RorL: '',
            name: userName
        })
        currentUserName = userName

        
        await firestore.collection("UserDB").doc("LastUserID").get().then((data) => {
            var lastID = Number(data.data().lastID)
            currentUserID = lastID + 1
            firestore.collection("UserDB").doc("LastUserID").update({
                lastID: currentUserID
            })

            userDB.collection("UserData").doc('UserID').set({
                userID: currentUserID,
                userName: userName,
                timestamp: timestamp
            })
            lastTimestamp = timestamp
        })

        await firestore.collection("messages").add({
            message: `joined`,
            userName: userName,
            userID: currentUserID,
            type: 'join',
            timestamp: timestamp
        })

        await firestore.collection("UserDB").add({
            userID: currentUserID,
            userName: userName,
            timestamp: timestamp
        })
    } else {

        userDB.collection("UserData").doc("UserID").get().then((userData) => {
            currentUserID = userData.userID
            currentUserName = userData.userName
            var userNameForID
            firestore.collection("UserDB").where("userID", '==', currentUserID).get().then((data) => {
                if (data.empty == true) {
                    userDB.delete()
                    db.delete()
                    window.location.reload();
                } else {
                    data.docs.forEach((doc) => {
                        userNameForID = doc.userName
                        if (userNameForID != currentUserName) {
                        }
                    })
                }
            })
        })
    }

    db.collection('messages').get().then((message) => {
        if (message == []) { }
        else {
            var message = message
            message.forEach(element => {
                if (element.userID == currentUserID) {
                    myFunction({ name: element.userName, time: element.timestamp, message: element.message, type: element.type, RorL: 'right' })
                } else {
                    myFunction({ name: element.userName, time: element.timestamp, message: element.message, type: element.type, RorL: 'left' })
                }
            });
        }
        userDB.collection("UserData").doc('UserID').get().then((data) => {
            lastTimestamp = data.timestamp
            firestore.collection("messages").where('timestamp', '>', lastTimestamp).orderBy('timestamp').get().then((snapshot) => {

                snapshot.docs.forEach(element => {
                    element = element.data()

                    if (element.userID == currentUserID) {

                    } else {
                        myFunction({ name: element.userName, time: element.timestamp, message: element.message, type: element.type, RorL: 'left' })
                        db.collection("messages").add({
                            userID: element.userID,
                            userName: element.userName,
                            type: element.type,
                            timestamp: element.timestamp,
                            message: element.message
                        })
                        userDB.collection("UserData").doc("UserID").update({
                            timestamp: element.timestamp
                        })
                        lastTimestamp = element.timestamp
                    }

                });

         var element = ` <li>
               <div class = "invisible-div"> <div class="center"> New Messages <section id="${lastTimestamp}"></section>
                </div></div>
            </li>`

                var mylist = document.getElementById('myList');
                mylist.insertAdjacentHTML('beforeend', element);

                firestore.collection('messages').where('timestamp', '>', lastTimestamp)
                    .onSnapshot(querySnapshot => {
                        querySnapshot.docChanges().forEach(change => {
                            if (change.type === 'added') {
                                var data = change.doc.data()
                                if (data.userID == currentUserID) {

                                } else {
                                    myFunction({ name: data.userName, time: data.timestamp, message: data.message, type: data.type, RorL: 'left' })
                                    db.collection("messages").add({
                                        userName: data.userName,
                                        userID: data.userID,
                                        type: data.type,
                                        timestamp: data.timestamp,
                                        message: data.message
                                    })
                                    userDB.collection("UserData").doc("UserID").update({
                                        timestamp: data.timestamp
                                    })
                                    lastTimestamp = data.timestamp
                                }

                            }
                        });
                    });
            })
        })
    })
})