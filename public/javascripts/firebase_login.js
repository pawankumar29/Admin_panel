// firebase login function parameters: Email and password for firebase
function firebase_login(email, password) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {// User is not signed in.
            // now signin the user
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/user-not-found') {
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            if (errorCode == 'auth/weak-password') {
                                alert('The password is too weak.');
                            } else {
                                alert(errorMessage);
                            }
                            console.log(error);
                        });
                } else {
                    console.error(error);
                }
            });
        }
    });
}


