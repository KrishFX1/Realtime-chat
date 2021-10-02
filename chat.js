const firebaseConfig = {
    apiKey: "AIzaSyAsEEK1vGq3imxGGPopMFfcn5MDCq4UT8k",
    authDomain: "storyweb-e902d.firebaseapp.com",
    projectId: "storyweb-e902d",
    storageBucket: "storyweb-e902d.appspot.com",
    messagingSenderId: "124030460580",
    appId: "1:124030460580:web:7e232959f35eec7c8b7c31",
    measurementId: "G-VQQQMXEGD1"
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

    document.addEventListener('keypress', function (event) {

        if (event.key === 'Enter') {
            var timestamp = Date.now()
            var message = document.getElementById('elementWidth').value
            document.getElementById('elementWidth').value = ''
            if (message == '') {

            } else {
                myFunction(currentUserName, timestamp, message, 'right')
                document.getElementById("Hi").setAttribute('href', `#${timestamp}`)
                document.getElementById("Hi").click()
                db.collection("Messages").add({
                    userName: currentUserName,
                    userID: currentUserID,
                    type: 'chat',
                    timestamp: timestamp,
                    message: message
                })
                userDB.collection("UserData").doc("UserID").update({
                    timestamp: timestamp
                })
                firestore.collection("Messages").add({
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
            myFunction(currentUserName, timestamp, message, 'right')
            document.getElementById("Hi").setAttribute('href', `#${timestamp}`)
            document.getElementById("Hi").click()
            db.collection("Messages").add({
                userID: currentUserID,
                UserName: currentUserName,
                type: 'chat',
                timestamp: timestamp,
                message: message
            })
            userDB.collection("UserData").doc("UserID").update({
                timestamp: timestamp
            })
            firestore.collection("Messages").add({
                message: message,
                userName: currentUserName,
                userID: currentUserID,
                type: 'chat',
                timestamp: timestamp
            })
        }
    });
});


function myFunction(name, time, message, RorL) {
    var ISTtime = new Date(time).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
    var Time = ISTtime.split(', ')[1].split(':')
    var hour = Time[0]
    var minute = Time[1]
    var AmPm = Time[2].split(' ')[1]

    var element
    var Time = hour + ':' + minute + ' ' + AmPm
    if (RorL == 'left') {
        element = `<li>  
    <div class="left"> <section id="${time}"></section> <div style="font-size: 10px; color: #414141;">${name}</div> ${message} <div style="font-size: 8px;color:#4E4F51 ; font-style: italic; text-align: end;">${Time}</div> </div></li>`
    } else {
        element = `<li>  
        <div class="right"> <section id="${time}"></section> ${message} <div style="font-size: 8px;color:#4E4F51 ; font-style: italic; text-align: end;">${Time}</div> </div></li>
    </ul>`
    }

    var mylist = document.getElementById('myList');
    mylist.insertAdjacentHTML('beforeend', element);
}

var a = []
let db = new Localbase('Database')
let userDB = new Localbase("User")
var currentUserID
var currentUserName
var lastTimestamp



userDB.collection("UserData").doc("UserID").get().then((userData) => {
    console.log(userData)
    if (userData == null) {
        var userName;
        do {
            userName = prompt("Please enter your name , must be atleast 4 letters long.");
        } while (userName == null || userName.length < 4);


        firestore.collection("UserDB").doc("LastUserID").get().then((data) => {
            var lastID = Number(data.data().lastID)
            var timestamp = Date.now()
            currentUserID = lastID + 1
            console.log(currentUserID)
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


    } else {
        userDB.collection("UserData").doc("UserID").get().then((userData) => {
            currentUserID = userData.userID
            currentUserName = userData.userName
        })
    }

    db.collection('Messages').get().then((message) => {
        if (message == []) { }
        else {
            var message = message
            message.forEach(element => {
                if (element.userID == currentUserID) {
                    var message = element.message
                    myFunction(element.userName, element.timestamp, message, 'right')
                } else {
                    var message = element.message
                    myFunction(element.userName, element.timestamp, message, 'left')
                }
            });
        }
        userDB.collection("UserData").doc('UserID').get().then((data) => {
            lastTimestamp = data.timestamp

            firestore.collection("Messages").where('timestamp', '>', lastTimestamp).orderBy('timestamp').get().then((snapshot) => {

                snapshot.docs.forEach(element => {
                    element = element.data()

                    if (element.userID == currentUserID) {

                    } else {
                        myFunction(element.userName, element.timestamp, element.message, 'left')
                        document.getElementById("Hi").setAttribute('href', `#${element.timestamp}`)
                        document.getElementById("Hi").click()
                        db.collection("Messages").add({
                            userID: element.userID,
                            userName: element.userName,
                            type: element.type,
                            timestamp: element.timestamp,
                            message: element.message
                        })
                        userDB.collection("UserData").doc("UserID").update({
                            timestamp: element.timestamp
                        })
                    }
                });

                firestore.collection('Messages').where('timestamp', '>', lastTimestamp)
                    .onSnapshot(querySnapshot => {
                        querySnapshot.docChanges().forEach(change => {
                            if (change.type === 'added') {
                                var data = change.doc.data()
                                if (data.userID == currentUserID) {

                                } else {
                                    myFunction(data.userName, data.timestamp, data.message, 'left')
                                    document.getElementById("Hi").setAttribute('href', `#${data.timestamp}`)
                                    document.getElementById("Hi").click()
                                    db.collection("Messages").add({
                                        userName: data.userName,
                                        userID: data.userID,
                                        type: data.type,
                                        timestamp: data.timestamp,
                                        message: data.message
                                    })
                                    userDB.collection("UserData").doc("UserID").update({
                                        timestamp: data.timestamp
                                    })
                                }

                            }
                        });
                    });
            })
        })
    })
})