'use strict';

angular.module('rateMyClass', ['ui.router', 'firebase', 'ngAnimate', 'ui.bootstrap', 'ngSanitize', 'leaflet-directive'])

//Provides functionality for ui-router and different states. 
.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "partials/home.html",
            controller: 'homeCtrl'
        })
        .state('search', {
            url: "/search",
            templateUrl: "partials/search.html",
            controller: 'searchCtrl'
        })
        .state('addClass', {
            url: "/addClass",
            templateUrl: "partials/addclass.html",
            controller: 'addclassCtrl'
        })
        
    $urlRouterProvider.otherwise("/");

})

//This is the overall controller for our website.  It primarly handles authentication across 
//every page on the website 
.controller('MASTERCTRL', ['$http', '$scope', '$uibModal', function($http, $scope, $uibModal) {

    $scope.authInit = function() {
        $scope.uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/auth.html',
            controller: 'authCtrl',
            scope: $scope
        });
    }

    $scope.changeVerification = function(verified, id) {
        $scope.userVerified = verified;
        $scope.userID = id;
        return $scope.userVerified;
    };

    $scope.isVerified = function() {
        return $scope.userVerified;
    }

    $scope.getUserID = function() {
        return $scope.userID;
    }
}])


//This is the add class controller.  It allows you to add a class for other users to see and review. 
.controller('addclassCtrl', ['$http', '$scope', '$firebaseArray', '$location', function($http, $scope, $firebaseArray, $location) {
    $scope.selected = undefined;

    $scope.isSelected = function(font) {
        return $scope.selected === font;
    }
    $scope.setMaster = function(font) {
        $scope.selected = font;
    }

    $http.get("../src/font-awesome.json").then(function(response) {
        $scope.fonts = response.data;
    });



    $http.get("../src/collegeData.json").then(function(response) {
        $scope.colleges = response.data;
    });

    var ref = new Firebase("https://ratemyclasstianai.firebaseio.com");
    var classes = ref.child('classes');
    $scope.classList = $firebaseArray(classes);


    $scope.addClass = function() {
        var className = $scope.addClassForm.className;
        console.log($scope.addClassForm.desc);
        $scope.classList.$add({
            icon: "fa " + $scope.selected,
            name: className,
            institution: $scope.selectedSchool,
            timestamp: Firebase.ServerValue.TIMESTAMP,
            desc: $scope.addClassForm.desc
        }).then(function() {
            $scope.addClassForm.className = "";
            $location.path('/');
        })
    }
}])

//This is the authentication controller.  It handles creating new user accounts, signing in existing users, as well as 
//resetting passwords.  
.controller('authCtrl', ['$scope', '$firebaseObject', '$firebaseAuth', '$location', '$uibModal', function($scope, $firebaseObject, $firebaseAuth, $location, $uibModal) {

    /* define reference to your firebase app */
    var ref = new Firebase("https://winfohackathon.firebaseio.com/");

    /* define reference to the "users" value in the app */
    var users = ref.child('users');

    /* create a $firebaseObject for the users reference and add to scope (as $scope.users) */
    $scope.users = $firebaseObject(users);
    var Auth = $firebaseAuth(ref);

    $scope.userObj = {};

    $scope.signUp = function() {

        //pass in an object with the new 'email' and 'password'
        Auth.$createUser({
                'email': $scope.newUser.email,
                'password': $scope.newUser.password
            })
            .then($scope.signIn)
            .then(function(authData) {

                var newUserInfo = {
                    'handle': $scope.newUser.handle
                };

                console.log(authData);

                $scope.users[authData.uid] = newUserInfo;

                $scope.users.$save();

                $scope.userID = authData.uid;

                $scope.changeVerification(true, authData.uid);

            })
            .catch(function(error) {
                //error handling (called on the promise)
                $scope.changeVerification(false, null);
                $scope.errorMessage = error;
                console.log(error);
            })
    };

    $scope.changePassword = function() {
        $scope.uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/changePassword.html',
            controller: 'changePasswordCtrl',
            scope: $scope
        });
    }

    $scope.resetPassword = function() {
        $scope.uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/resetPassword.html',
            controller: 'resetPasswordCtrl',
            scope: $scope
        });
    }

    //Make LogOut function available to views
    $scope.logOut = function() {
        Auth.$unauth(); //"unauthorize" to log out
        $scope.changeVerification(false, null);
        $location.path('/');
    };

    //Any time auth status updates, set the userId so we know
    Auth.$onAuth(function(authData) {
        if (authData) { //if we are authorized
            $scope.userId = authData.uid;
            $scope.changeVerification(true, authData.uid);
        } else {
            $scope.userId = undefined;
            $scope.changeVerification(false, null);
        }
    });

    //Test if already logged in (when page load)
    var authData = Auth.$getAuth(); //get if we're authorized
    if (authData) {
        $scope.userId = authData.uid;
        $scope.changeVerification(true, authData.uid);
    }

    //separate signIn function
    $scope.signIn = function() {
        var promise = Auth.$authWithPassword({
            'email': $scope.newUser.email,
            'password': $scope.newUser.password
        });
        $scope.uibModalInstance.dismiss();
        return promise; //return promise so we can *chain promises*
        //and call .then() on returned value
    }
}])

//This controller controls the modal that helps the user change his or her password. 
.controller('changePasswordCtrl', ['$scope', function($scope) {
    var ref = new Firebase("https://winfohackathon.firebaseio.com/");

    //default values
    $scope.showPasswordsDoNotMatch = false;


    $scope.checkPass = function() {

        var confirmNewPass = $scope.user.confirmNewPass;
        var newPass = $scope.user.newPass;
        //Compare the values in the password field
        if (newPass === confirmNewPass) {
            $scope.showPasswordsDoNotMatch = false;
        } else {
            $scope.showPasswordsDoNotMatch = true;
        }
    }

    $scope.changePass = function() {
        ref.changePassword({
            email: $scope.email,
            oldPassword: $scope.oldPass,
            newPassword: $scope.newPass
        }, function(error) {
            if (error) {
                switch (error.code) {
                    case "INVALID_PASSWORD":
                        console.log("The specified user account password is incorrect.");
                        break;
                    case "INVALID_USER":
                        console.log("The specified user account does not exist.");
                        break;
                    default:
                        console.log("Error changing password:", error);
                }
            } else {
                console.log("User password changed successfully!");
                $scope.uibModalInstance.dismiss();
            }
        });
    }
}])

//This controller controls the modal that helps the user reset his or her password.  
.controller('resetPasswordCtrl', ['$scope', function($scope) {
    var ref = new Firebase("https://winfohackathon.firebaseio.com/");

    $scope.resetPass = function() {
        ref.resetPassword({
            email: $scope.email
        }, function(error) {
            if (error) {
                switch (error.code) {
                    case "INVALID_USER":
                        console.log("The specified user account does not exist.");
                        break;
                    default:
                        console.log("Error resetting password:", error);
                }
            } else {
                console.log("Password reset email sent successfully!");
                $scope.uibModalInstance.dismiss();
            }
        });
    }
}])

//This is the controller that controls the home page.  It displays recently added classes. 
.controller('homeCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
    var ref = new Firebase("https://winfohackathon.firebaseio.com/classes/"); 
    $scope.classList = $firebaseArray(ref);
}])

//This is the controller that controls the search page.  It pulls data from our firebase
//database and allows filtering. 
.controller('searchCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
    var ref = new Firebase("https://winfohackathon.firebaseio.com/classes/");
    $scope.classList = $firebaseArray(ref);
}])




