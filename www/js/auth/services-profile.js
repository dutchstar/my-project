angular.module('starter.services-profile', [])

/**
 * General Wrapper for Profile
 * This version: 25/07/2015
 */
	.factory(
	'Profile', function ($q) {
		var self = this;

		// userid
		// replace all special characters with the number 0 + random number to avoid collision
		// userEmail = userEmail.replace(/[^\w\s]/gi, 'xyz'); console.log(userEmail)
		// authData.password.email.replace(/@.*/, '');

		function generateRandomUserName() {
			var xDate = new Date();
			xDate     = xDate.getTime();
			return "user" + Math.floor(xDate * Math.random());
		};

		/**
		 * Generic Edit Profile Function
		 */
		self.editProfile = function (uid, field, value) {
			var qEdit      = $q.defer();
			var ref        = new Firebase(FBURL + "/" + "users" + "/" + uid);
			var onComplete = function (error) {
				if (error) {
					qEdit.reject(error);
				} else {
					qEdit.resolve("PROFILE_UPDATED");
				}
			};
			ref.child(field).set(value, onComplete);
			return qEdit.promise;
		};

		/**
		 * Set profile of user
		 * Includes creating and editing
		 */
		self.createProfile = function (uid, optUserName, optDisplayName) {
			var qSet = $q.defer();
			var ref  = new Firebase(FBURL + "/" + "users" + "/" + uid);
			// create temporary userName upon creation
			if (optUserName == undefined) {
				optUserName    = generateRandomUserName();
				optDisplayName = "I have no name, yet";
			}
			var onComplete = function (error) {
				if (error) {
					qSet.reject(error);
				} else {
					// register username
					self.registerUserName(uid, optUserName, null).then(
						function (success) {
							qSet.resolve("PROFILE_SET_SUCCESS");
						}, function (error) {
							qSet.reject(error);
						}
					)
				}
			};
			ref.set(
				{
					userName:    optUserName,
					displayName: optDisplayName,
				}, onComplete
			);
			return qSet.promise;
		};

		self.getProfile = function (uid) {
			var qGet = $q.defer();
			var ref  = new Firebase(FBURL + "/" + "users" + "/" + uid);
			ref.on(
				"value", function (snapshot) {
					qGet.resolve(snapshot.val())
				}, function (errorObject) {
					qGet.reject(errorObject)
				}
			)
			return qGet.promise;
		};

		// -------------------------------------------------------------------------
		//
		// Username handling
		//
		// -------------------------------------------------------------------------

		// used to optimize search and to check whether userName is taken
		self.registerUserName = function (uid, newUserName, oldUserName) {

			var qRegister      = $q.defer();
			var newUserNameRef = new Firebase(FBURL + "/usernames/" + newUserName);
			var oldUserNameRef = new Firebase(FBURL + "/usernames/" + oldUserName);
			var profileRef     = new Firebase(FBURL + "/users/" + uid);

			// wrapper

			// 1
			checkIfNewUserNameTaken().then(
				function (available) {

					// 2
					writeNewUserName().then(
						function (success) {

							// 3
							updateProfile().then(
								function (updated) {

									// 4
									if (oldUserName != null && oldUserName != undefined) {
										deleteOldUserName();
									}
									qRegister.resolve(success);

								}, function (error) {

									// e3 - prpfile update
									qRegister.reject(error);
								}
							)

						}, function (error) {

							// e2 - write
							qRegister.reject(error);
						}
					)
				}, function (taken) {

					// e1 - taken
					qRegister.reject(taken);
				}
			);

			// 1
			function checkIfNewUserNameTaken() {
				var qCheck = $q.defer();
				newUserNameRef.once(
					'value', function (snapshot) {
						var snapObj = snapshot.val();
						if (snapObj != null && snapObj != undefined) {
							qCheck.reject({code: "USERNAME_TAKEN"});
						} else {
							qCheck.resolve("USERNAME_AVAILABLE");
						}
					}
				);
				return qCheck.promise;
			};

			// 2
			function writeNewUserName() {
				var qWrite     = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qWrite.reject(error);
					} else {
						qWrite.resolve("NEW_USERNAME_SET");
					}
				};
				newUserNameRef.set(
					{
						uid: uid    // used to link user and invite
					}, onComplete
				);
				return qWrite.promise;
			};

			// 3
			function updateProfile() {
				var qUpdate    = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qUpdate.reject(error);
					} else {
						qUpdate.resolve("PROFILE_UPDATED");
					}
				};
				profileRef.child("userName").set(newUserName, onComplete);
				return qUpdate.promise;
			}

			// 4a
			function deleteOldUserName(userName) {
				var qDelete    = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qDelete.reject(error);
					} else {
						qDelete.resolve("OLD_USERNAME_DELETED");
					}
				}
				oldUserNameRef.remove(onComplete);
				return qDelete.promise;
			};

			return qRegister.promise;
		};

		return self;
	}
)