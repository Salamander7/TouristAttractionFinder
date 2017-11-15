/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// var app = {
    // Application Constructor
    // initialize: function() {
    //     document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    // },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    // onDeviceReady: function() {
    //     this.receivedEvent('deviceready');
    // },

    // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');

//         console.log('Received Event: ' + id);
//     }
// };

// app.initialize();

// (function(){
//   const config = {
//     apiKey:"AIzaSyCjXmF4Ft8K6NsEdy7aUTqZ2jiIkxAmTWU",
//     authDomain: "nearme-3f06a.firebaseapp.com",
//     databaseURL: "https://nearme-3f06a.firebaseio.com",
//     projectID: "nearme-3f06a",
//     storageBucket: "nearme-3f06a.appspot.com",
//     messagingSenderId: "446204670341"
//   }
//   firebase.initializeApp(config);
// }());

function signin_action(){
  const sgin_email = document.getElementById('sgin_email').value;
  const sgin_psswd = document.getElementById('sgin_passwd').value;


  firebase.auth().signInWithEmailAndPassword(sgin_email, sgin_psswd).then(function(user) {
      // user signed in
      alert("Sign in");
      success_signin(user);

  }).catch(function(error) {
    var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
          alert('You have entered a wrong password');
      } else if (errorCode === 'auth/invalid-email'){
          alert('You have entered a wrong email');
      }else if (errorCode === 'auth/user-disabled'){
          alert('User is disabled. Cannot login');
      }else if (errorCode === 'auth/user-not-foundl'){
          alert('No user found in this email');
      }
      else {
          alert(errorMessage);
      }
      console.log(error);
  });
}

function success_signin(userid){
  firebase.auth().onAuthStateChanged(function(userid) {
  if (userid) {
      var child = document.getElementById('tab3');
      child.parentNode.removeChild(child);
      var $tab = $("<ons-tab page='settings.html'  id='tab4'  ></ons-tab> <ons-tab page='logout.html'  id='tab5'  ></ons-tab>");
      $('.tabbar').append($tab);
      $('#tab4').attr('icon','ion-settings');
      $('#tab5').attr('icon','ion-log-out');
      document.getElementById('tab_bar').setActiveTab(0);

  } else {
    // No user is signed in.
  }
});

}

function remove_element(){
  $('.tabbar__border').remove();
}

function showDialog(id) {
  document.getElementById(id).show();
};


function hideDialog(id1 , id2) {
  if(id2 =="close_btn_fgt"){
    const forgot_email = document.getElementById('fgt_email').value;
    firebase.auth().sendPasswordResetEmail(forgot_email).then(function() {
        // Email sent.
        document.getElementById(id1).hide();
    }).catch(function(error) {
        // An error happened.
        var errorCode = error.code;
         var errorMessage = error.message;
         if (errorCode === 'auth/invalid-email'){
          alert('You have entered a wrong email');
        }else{
            alert(errorCode);
        }
    });
  }else if(id2 == 'signup_btn'){
    const sgup_email = document.getElementById('sgup_email').value;
    const sgup_passwd = document.getElementById('sgup_passwd').value;
    const sgup_cnf_passwd = document.getElementById('sgup_cnf_passwd').value;


    email_validate(sgup_email);
    if((sgup_passwd == "") || (sgup_cnf_passwd == "")){
      alert("Passwords cannot be empty");
  }else {
      if((sgup_passwd.length > 6) && (sgup_cnf_passwd.length > 6)){
        if(sgup_passwd == sgup_cnf_passwd) {
            signup(sgup_email,sgup_passwd);
            document.getElementById(id1).hide();
        }else{
            alert("Password Mismatch");
        }

    }else{
      alert("Password should be more than 6 characters");
    }
  }
    
  }

  else{
    document.getElementById(id1).hide();
  }
}


function signup(email, password){
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
        // Email sent.
        alert("success1")
        email_verification();
       // document.getElementById(id1).hide();
    }).catch(function(error) {
        // An error happened.
        var errorCode = error.code;
         var errorMessage = error.message;
         if (errorCode === 'auth/invalid-email'){
          alert('You have entered a wrong email');
        }else if(errorCode =='auth/email-already-in-use'){
            alert('Email already exists');
        }

        else{
            alert(errorCode);
        }
    });
}

function email_validate(email){

  var regMail = /^([_a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,3})$/;
  if(regMail.test(email) == false){
      alert("Email address is not valid yet.");
  }else{
      return true;  
  }
}

function email_verification(){
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    alert("Redirect");
    //redirect_app();
  // Email sent.
}).catch(function(error) {
  // An error happened.
  var errorCode = error.code;
         var errorMessage = error.message;
         if (errorCode === 'auth/invalid-email'){
          alert('You have entered a wrong email');
        }else if(errorCode =='auth/email-already-in-use'){
            alert('Email already exists');
        }

        else{
            alert(errorCode);
        }
});  
}


function redirect_app(){
  var actionCodeSettings = {
  url: 'https://www.example.com/?email=' + firebase.auth().currentUser.email,
  android: {
    packageName: 'com.example.nearme',
    installApp: true,
    minimumVersion: '12'
  },
  handleCodeInApp: true
};
firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
  .then(function() {
    // Verification email sent.
  })
  .catch(function(error) {
    var errorCode = error.code;
         var errorMessage = error.message;
         if (errorCode === 'auth/invalid-email'){
          alert('You have entered a wrong email');
        }else if(errorCode =='auth/email-already-in-use'){
            alert('Email already exists');
        }

        else{
            alert(errorCode);
        }
    // Error occurred. Inspect error.code.
  });
}


