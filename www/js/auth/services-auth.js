angular.module('starter.services-auth', [])

/**
 * General Wrapper for Auth
 * This version: 25/07/2015
 * See also: https://www.firebase.com/docs/web/libraries/ionic/guide.html
 */
	.factory(
	'Auth', function ($q) {
		var self      = this;
		self.authData = {};

		/**
		 * unAuthenticate the user
		 * independent of method (password, twitter, etc.)
		 */
		self.signOut = function () {
			var ref       = new Firebase(FBURL);
			self.authData = {};
			return ref.unauth();
		};

		/**
		 * Check the current authentication state
		 * returns on success:  authData
		 * returns on fail:     AUTH_LOGGED_OUT
		 */
		self.getAuthState = function () {
			var qAuthState = $q.defer();

			function authDataCallback(authData) {
				if (authData) {
					console.log("User is logged in");
					self.authData = authData;//gv
					qAuthState.resolve(authData);

				} else {
					console.log("User is logged out");
					qAuthState.reject("AUTH_LOGGED_OUT")
				}
			};
			var ref = new Firebase(FBURL);
			ref.onAuth(authDataCallback);
			return qAuthState.promise;
		};

		/**
		 * Authenticate the user with password
		 * returns on success: authData
		 * returns on error: error
		 *
		 * common error.code:
		 * INVALID_USER (user does not excist)
		 * INVALID_EMAIL (email incorrect)
		 * INVALID_PASSWORD
		 */
		self.signInPassword = function (userEmail, userPassword) {
			var qSignIn = $q.defer();
			var ref     = new Firebase(FBURL);
			ref.authWithPassword(
				{
					email:    userEmail,
					password: userPassword
				}, function (error, authData) {
					if (error) {
						console.log("Login Failed!", error);
						qSignIn.reject(error);
					} else {
						console.log("Authenticated successfully with payload:", authData);
						self.authData = authData; //gv
						qSignIn.resolve(authData);
					}
				}
			);

			return qSignIn.promise;
		};

		/**
		 * Create a new user with password
		 * method: does not require confirmation of email
		 * returns on success: userData =/= authData (??)
		 * returns on error: error
		 *
		 */
		self.signUpPassword = function (userEmail, userPassword) {
			var qSignup = $q.defer();
			var ref     = new Firebase(FBURL);
			ref.createUser(
				{
					email:    userEmail,
					password: userPassword
				}, function (error, userData) {
					if (error) {
						qSignup.reject(error)
					} else {
						qSignup.resolve(userData)
					}
				}
			);

			// ** initiate profile settings here
			// ** or set new userBoolean to true and then handle it in onAuth
			// https://www.firebase.com/docs/web/guide/user-auth.html#section-configuring

			return qSignup.promise;
		};

		/**
		 * Change Password or Email / Reset Password
		 */
		self.changePassword = function (userEmail, oldPassword, newPassword) {
			var qChange = $q.defer();
			var ref     = new Firebase(FBURL);
			ref.changePassword(
				{
					email:       userEmail,
					oldPassword: oldPassword,
					newPassword: newPassword
				}, function (error) {
					if (error === null) {
						qChange.resolve("CHANGE_PASSWORD_SUCCESS");
					} else {
						qChange.reject(error);
					}
				}
			);
			return qChange.promise;
		};

		self.changeEmail = function (oldEmail, newEmail, userPassword) {
			var qChange = $q.defer();
			var ref     = new Firebase(FBURL);
			ref.changeEmail(
				{
					oldEmail: oldEmail,
					newEmail: newEmail,
					password: userPassword
				}, function (error) {
					if (error === null) {
						qChange.resolve("CHANGE_EMAIL_SUCCESS");
					} else {
						qChange.reject(error);
					}
				}
			);
			return qChange.promise;
		};

		self.resetPassword = function (userEmail) {
			var qConfirm = $q.defer();
			var ref      = new Firebase(FBURL);
			ref.resetPassword(
				{
					email: userEmail
				},
				function (error) {
					if (error) {
						qConfirm.reject(error);
					} else {
						qConfirm.resolve("RESET_PASSWORD_SUCCESS");
					}
				}
			);
			return qConfirm.promise;
		};

		/**
		 * global variables
		 *
		 * Auth.authData
		 */

		self.getAuthState().then(
			function (authData) {
				self.authData = authData;
			},
			function (error) {
				self.authData = {};
				console.log('init error');
			}
		);

		return self;
	}
)

// factory profile

