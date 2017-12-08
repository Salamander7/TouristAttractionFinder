
//Black Screen
// document.addEventListener('deviceready', onDeviceReady.bind(this), false);

// function onDeviceReady() {
//     setTimeout(function () {
//         navigator.splashscreen.hide();
//     }, 50);
// }


var pictureSource;   // picture source
    var destinationType; // sets the format of returned value 

    // Wait for Cordova to connect with the device
    //
    document.addEventListener("deviceready",onDeviceReady,false);

function onDeviceReady() {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
}

//Removed tab bar border line
function remove_element(){
  $('.tabbar__border').remove();
}

// ***************************** Authentication Signin/ Signup ******************************//

// -------------------- Functions for Sign In --------------------------//
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

//------------------- Dialog Open -------------------// 
// Show Dialog for sign in, password recovery
function showDialog(id) {
  document.getElementById(id).show();
};

//------------------- Dialog Hide -------------------// 
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
    const sgup_username = document.getElementById('sgup_userid').value;

    email_validate(sgup_email);//Email Validation

    //Password Validation
    if((sgup_passwd == "") || (sgup_cnf_passwd == "")){
        alert("Passwords cannot be empty");
    }else {
      if((sgup_passwd.length > 6) && (sgup_cnf_passwd.length > 6)){
          if(sgup_passwd == sgup_cnf_passwd) {
              signup(sgup_email,sgup_passwd,sgup_username);
              document.getElementById(id1).hide();
              sgup_email = "";
              sgup_passwd = "";
              sgup_cnf_passwd ="";
              sgup_username ="";
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

//------------------ Sign Up Method ------------------//
function signup(email, password,userid){
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
        email_verification();//Email Verification
        var user = firebase.auth().currentUser;
        alert(user);
        success_signin(user);
        writeUserData(email,password,userid,user.uid);
    }).catch(function(error) {
        // Error Handling
          var errorCode = error.code;
          var errorMessage = error.message;
          if ((errorCode === 'auth/invalid-email') || (errorCode === 'auth/user-not-found')){
              alert('You have entered a wrong email');
          }else if(errorCode =='auth/email-already-in-use'){
              alert('Email already exists');
          }else{
            alert(errorCode);
          }
    });
}

//-------------Email Validation Function---------------//
function email_validate(email){
  var regMail = /^([_a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,3})$/;
  if(regMail.test(email) == false){
      alert("Email address is not valid yet.");
  }else{
      return true;  
  }
}

//--------------------Firebase Send Email Verification------------//
function email_verification(){
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    // alert("Redirect");
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


//-----------------------After Success Sign in--------------------//
//Add new tab bars and remove login
function success_signin(userid){
  firebase.auth().onAuthStateChanged(function(userid) {
    alert("success");
  if (userid) {
      var child = document.getElementById('tab3');
      child.parentNode.removeChild(child);
      var $tab = $("<ons-tab page='settings.html'  id='tab4'  ></ons-tab> <ons-tab page='logout.html'  id='tab5'  ></ons-tab>");
      $('.tabbar').append($tab);
      $('#tab4').attr('icon','ion-ios-cog');
      $('#tab5').attr('icon','ion-log-out');
      $('#tab5').attr('onclick','logout()');
      // $('#tab1').addClass('active');
      // document.getElementById('tab_bar').setActiveTab(0);
  }else{
    // No user is signed in.
  }
});
}


// ***************************** Save data to Firebase ******************************//
function writeUserData(email, password,userid,uid) {
  firebase.database().ref('users/'+ uid).set({
    username:userid,
    email: email,
    password: password
  });
}

function updatepassword(){
   
    const newpswd = document.getElementById('newpswd').value;
    const cnfpswd = document.getElementById('cnfpswd').value;

    //Password Validation
    if((newpswd == "") || (cnfpswd == "")){
        alert("Passwords cannot be empty");
    }else {
      if((newpswd.length>6)&&(cnfpswd.length>6)){
          if(newpswd == cnfpswd) {
            var user = firebase.auth().currentUser;
            user.updatePassword(cnfpswd).then(function() {
              firebase.database().ref('users/'+ user.uid).update({
                    password: cnfpswd
                });
            ons.notification.toast({message: 'Your Password is changed', timeout: 2000})
            }).catch(function(error) {
                // An error happened.
            });

          }else{
            alert("Password Mismatch");
          }
      }else{
          alert("Password should be more than 6 characters");
      }
    }
    
}



function updateemail(){
    const newemail = document.getElementById('updemail').value;

    if(email_validate(newemail)){
        var user = firebase.auth().currentUser;
        user.updateEmail(newemail).then(function() {
          firebase.database().ref('users/'+ user.uid).update({
                    email: newemail
                });
            ons.notification.toast({message: 'Your Email is updated', timeout: 2000})
        }).catch(function(error) {
          // An error happened.
        });
    }
}



function takepicture() { 
  alert("1")
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
        destinationType: destinationType.DATA_URL });
}

// Called when a photo is successfully retrieved
    //
    function onPhotoDataSuccess(imageData) {
      alert("2");
      // Uncomment to view the base64 encoded image data
      // console.log(imageData);

      // Get image handle
      //
      var smallImage = document.getElementById('profileimg');

      // Unhide image elements
      //
      smallImage.style.display = 'block';

      // Show the captured photo
      // The inline CSS rules are used to resize the image
      //
      smallImage.src = "data:image/jpeg;base64," + imageData;
    }

function onFail(message) {alert("3");
      alert('Failed because: ' + message);
    }

// ***************************** Authentication Logout ******************************//
function logout(){

  //After logging out, add login tab and remove added new tabs
  var child1 = document.getElementById('tab4');
  child1.parentNode.removeChild(child1);

  var child2 = document.getElementById('tab5');
  child2.parentNode.removeChild(child2);

  var $tab = $("<ons-tab page='login.html'  id='tab3'  ></ons-tab>");
  $('.tabbar').append($tab);
  $('#tab3').attr('icon','ion-log-in');
  $('#tab1').addClass('active');
  // $('#tab1').attr('active');

}

// ***************************** Navigation in MyAccount ******************************//
function changepasswd (event) {
   myNavigator.pushPage('updatepassword.html');
}

function changeemail (event) {
   myNavigator.pushPage('updateemail.html');
}

function changeprofile (event) {
   myNavigator.pushPage('updateprofile.html');
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

