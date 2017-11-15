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

//Method for Sign In
function signin_action(){
  //Get the values
  const sgin_email = document.getElementById('sgin_email').value;
  const sgin_psswd = document.getElementById('sgin_passwd').value;

  //Call the signInWithEmailAndPassword of Firebase
  firebase.auth().signInWithEmailAndPassword(sgin_email, sgin_psswd).then(function(user) {
      // user signed in
      alert("Sign in");
      success_signin(user);

  }).catch(function(error) {
    //Error Handling
      var errorCode = error.code;
      var errorMessage = error.message;
      if(sgin_email==''){
         alert('Your email is empty');
      }else if(sgin_psswd == ''){
          alert('Your password is empty');
      }else if (errorCode === 'auth/wrong-password') {
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

//After Success Sign in
//Add new tab bars and remove login
function success_signin(userid){
  firebase.auth().onAuthStateChanged(function(userid) {
  if (userid) {
      var child = document.getElementById('tab3');
      child.parentNode.removeChild(child);
      var $tab = $("<ons-tab page='settings.html'  id='tab4'  ></ons-tab> <ons-tab page='logout.html'  id='tab5'  ></ons-tab>");
      $('.tabbar').append($tab);
      $('#tab4').attr('icon','ion-settings');
      $('#tab5').attr('icon','ion-log-out');
      $('#tab5').attr('onclick','logout()');
      document.getElementById('tab_bar').setActiveTab(0);

  }else{
    // No user is signed in.
  }
});
}


function remove_element(){
  $('.tabbar__border').remove();
}

// Show Dialog for sign in, password recovery
function showDialog(id) {
  document.getElementById(id).show();
};

//Hide the dialogs opened
function hideDialog(id1 , id2) {

  //For Send button in Forgot Password
  if(id2 =="close_btn_fgt"){
    const forgot_email = document.getElementById('fgt_email').value; // Get values

    //Call the sendPasswordResetEmail of Firebase for password reset
    firebase.auth().sendPasswordResetEmail(forgot_email).then(function() {
        // Email sent hide the dialog
        document.getElementById(id1).hide();
    }).catch(function(error) {
        // Error Messages.
          var errorCode = error.code;
         var errorMessage = error.message;
         if (errorCode === 'auth/invalid-email'){
            alert('You have entered a wrong email');
         }else{
            alert(errorCode);
         }
    });
  }else if(id2 == 'signup_btn'){  //For sign up button in Sign up
    //Get the values
    const sgup_email = document.getElementById('sgup_email').value;
    const sgup_passwd = document.getElementById('sgup_passwd').value;
    const sgup_cnf_passwd = document.getElementById('sgup_cnf_passwd').value;

    email_validate(sgup_email);//Email Validation

    //Password Validation
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
  else{//Hide the dialog if nothing selected
    document.getElementById(id1).hide();
  }
}

//Sign Up Method
function signup(email, password){
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
        email_verification();//Email Verification
    }).catch(function(error) {
        // Error Handling
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/invalid-email'){
              alert('You have entered a wrong email');
          }else if(errorCode =='auth/email-already-in-use'){
              alert('Email already exists');
          }else{
            alert(errorCode);
          }
    });
}

//Email Validation Function
function email_validate(email){
  var regMail = /^([_a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,3})$/;
  if(regMail.test(email) == false){
      alert("Email address is not valid yet.");
  }else{
      return true;  
  }
}

//Firebase Email Verification
function email_verification(){
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    alert("Redirect");
    //redirect_app();
}).catch(function(error) {
        // Error Handling
         var errorCode = error.code;
         var errorMessage = error.message;
         if (errorCode === 'auth/invalid-email'){
            alert('You have entered a wrong email');
          }else if(errorCode =='auth/email-already-in-use'){
            alert('Email already exists');
          }else{
            alert(errorCode);
        }
  });  
}


//Logout Function
function logout(){

  //After logging out, add login tab and remove added new tabs
  var child1 = document.getElementById('tab4');
  child1.parentNode.removeChild(child1);

  var child2 = document.getElementById('tab5');
  child2.parentNode.removeChild(child2);

  var $tab = $("<ons-tab page='login.html'  id='tab3'  ></ons-tab>");
  $('.tabbar').append($tab);
  $('#tab3').attr('icon','ion-log-in');
  document.getElementById('tab_bar').setActiveTab(0);

}


// function redirect_app(){
//   var actionCodeSettings = {
//   url: 'https://www.example.com/?email=' + firebase.auth().currentUser.email,
//   android: {
//     packageName: 'com.example.nearme',
//     installApp: true,
//     minimumVersion: '12'
//   },
//   handleCodeInApp: true
// };
// firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
//   .then(function() {
//     // Verification email sent.
//   })
//   .catch(function(error) {
//     var errorCode = error.code;
//          var errorMessage = error.message;
//          if (errorCode === 'auth/invalid-email'){
//           alert('You have entered a wrong email');
//         }else if(errorCode =='auth/email-already-in-use'){
//             alert('Email already exists');
//         }

//         else{
//             alert(errorCode);
//         }
//     // Error occurred. Inspect error.code.
//   });
// }

