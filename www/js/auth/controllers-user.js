angular.module('starter.controllers-user', [])

	// see also: http://stackoverflow.com/questions/31629627/ordering-multiple-ionicmodals-on-top-of-each-other
	.controller(
	'UserCtrl', function (
		$scope, $timeout,
		$ionicModal, $ionicLoading, $ionicPopup, $ionicActionSheet,
		CordovaCamera,
		Auth, Codes, Utils, Profile
	) {

		$scope.tempData = {
			noProfilePicture: "img/ionic.png"
		};

		$scope.editProfilePicture = function () {

			// Show the action sheet
			var hideSheet = $ionicActionSheet.show(
				{
					buttons:       [
						{text: 'Take a new picture'},
						{text: 'Import from phone library'}
					],
					titleText:     'Change your profile picture',
					cancelText:    'Cancel',
					cancel:        function () {
						// add cancel code..
					},
					buttonClicked: function (index) {
						switch (index) {
							case 0:
								//
								proceedChangePicture("CAMERA");
								break;
							case 1:
								//
								proceedChangePicture("PHOTOLIBRARY");
								break
						}
						return true;
					}
				}
			);

			function proceedChangePicture(sourceType) {
				CordovaCamera.newImage(sourceType, 200).then(
					function (imageData) {

						if (imageData != undefined) {

							Utils.showMessage("Updating profile picture...");

							Profile.editProfile($scope.authData.uid, "profilePicture", imageData).then(
								function (success) {
									doRefresh();
									Utils.showMessage("Profile picture updated!", 1000);
								}, function (error) {
									Codes.handleError(error);
								}
							)
						}

					}, function (error) {
						//Codes.handleError(error);
					}
				)
			}

		};

		$scope.editUserName = function () {
			$scope.data = {userName: $scope.userData.userName};

			var myPopup;
			showPopup();
			function showPopup() {
				// An elaborate, custom popup
				myPopup = $ionicPopup.show(
					{
						template: '<input type="text" data-ng-model="data.userName">',
						title:    'Set a new username (min. 3 char.)',
						scope:    $scope,
						buttons:  [
							{text: 'Cancel'},
							{
								text:  'Save',
								type:  'button-energized',
								onTap: function (e) {
									if (!$scope.data.userName) {
										e.preventDefault();
									} else {
										return $scope.data.userName;
									}
								}
							}
						]
					}
				);
			}

			myPopup.then(
				function (newUserName) {
					if (newUserName != undefined) {
						proceedRegister(newUserName.replace(/ /g, ''))
					}
				}
			);
			function proceedRegister(newUserName, e) {
				Profile.registerUserName($scope.authData.uid, newUserName, $scope.userData.userName).then(
					function (success) {

						myPopup.close();
						doRefresh();

					}, function (error) {

						Codes.handleError(error);
						$scope.editUserName();

					}
				)
			}
		};

		$scope.editDisplayName = function () {
			$scope.data = {displayName: $scope.userData.displayName};

			var myPopup;
			showPopup();
			function showPopup() {
				// An elaborate, custom popup
				myPopup = $ionicPopup.show(
					{
						template: '<input type="text" ng-model="data.displayName">',
						title:    'Set your display name',
						scope:    $scope,
						buttons:  [
							{text: 'Cancel'},
							{
								text:  'Save',
								type:  'button-energized',
								onTap: function (e) {
									if (!$scope.data.displayName) {
										e.preventDefault();
									} else {
										return $scope.data.displayName;
									}
								}
							}
						]
					}
				);
			}

			myPopup.then(
				function (displayName) {
					if (displayName != undefined) {
						proceedRegister(displayName)
					}
				}
			);
			function proceedRegister(newDisplayName) {
				Profile.editProfile($scope.authData.uid, "displayName", newDisplayName).then(
					function (success) {
						myPopup.close();
						doRefresh();
					}, function (error) {
						Codes.handleError(error);
					}
				);
			}
		};

		/**
		 * Generic function to refresh the app after authentication state change
		 *
		 */
		function doRefresh() {

			//** rewrite to update profile

			console.log($scope.authData);
			if ($scope.authData.hasOwnProperty('uid')) { // when logged in
				Profile.getProfile($scope.authData.uid).then(
					function (userData) {
						$scope.userData = userData;
						console.log(userData)
					},
					function (error) {
						Codes.handleError(error);
					}
				)
			}

			$scope.$broadcast('$rootScope.refresh', {});

		}

		// With the new view caching in Ionic, Controllers are only called
		// when they are recreated or on app start, instead of every page change.
		// To listen for when this page is active (for example, to refresh data),
		// listen for the $ionicView.enter event:
		//$scope.$on('$ionicView.enter', function(e) {
		//});

		// ---------------------------------------------------------------------------
		//
		// Profile
		//
		// ---------------------------------------------------------------------------

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl(
			'templates/user/profile.html', {
				scope: $scope
			}
		).then(
			function (modal) {
				$scope.modalProfile = modal;
			}
		);
		$scope.closeProfile    = function () {
			$scope.modalProfile.hide();
			$scope.modalLogin.hide();
		};
		$scope.openProfile     = function () {
			// checks authentication state
			// opens profile when authenticated
			// and login otherwise
			$scope.authData = {};
			Auth.getAuthState().then(
				function (authData) {

					$scope.authData = authData;
					$scope.modalProfile.show();
					doRefresh();

				}, function (error) {
					if (error == "AUTH_LOGGED_OUT") {
						$scope.openLogin();
					} else {
						Utils.showMessage("Oops, something went wrong... Try again")
					}
				}
			)
		};

		// ---------------------------------------------------------------------------
		//
		// Login
		//
		// ---------------------------------------------------------------------------

		// Form data for the login modal
		$scope.loginData  = {};

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl(
			'templates/user/login.html', {
				scope: $scope
			}
		).then(
			function (modal) {
				$scope.modalLogin = modal;
			}
		);
		$scope.closeLogin = function () {
			$scope.modalLogin.hide();
		};
		$scope.openLogin  = function () {
			console.log('openLogin');
			$scope.modalLogin.show();
		};
		$scope.doLogin    = function (optNewUserBoolean) {
			console.log('Doing login', $scope.loginData);
			if ($scope.loginData.userEmail && $scope.loginData.userPassword) {

				Utils.showMessage("Logging in...");

				Auth.signInPassword($scope.loginData.userEmail, $scope.loginData.userPassword).then(
					function (authData) {

						if (optNewUserBoolean != undefined && optNewUserBoolean == true) {
							newUser(authData);
						} else {
							oldUser(authData);
						}

					}, function (error) {

						// open signup modal in case the user does not excist
						// motivate to signup
						if (error.hasOwnProperty('code')) {
							if (error.code == "INVALID_USER") {
								$scope.signUpData = $scope.loginData;
								$scope.openSignUp();

							}
						}
						Codes.handleError(error);
					}
				)
			} else {
				Codes.handleError({code: "INVALID_INPUT"})
			}
			;

			//
			function newUser(authData) {
				$scope.authData = authData;
				Profile.createProfile(authData.uid).then(
					function (success) {
						handleSuccess();
					}, function (error) {
						Codes.handleError(error)
					}
				)
			}

			//
			function oldUser(authData) {
				$scope.authData = authData;
				handleSuccess();
			}

			function handleSuccess() {
				$scope.modalLogin.hide();
				$scope.modalSignUp.hide();
				doRefresh();
				Utils.showMessage("Logged in!", 500)
			}

		};

		// ---------------------------------------------------------------------------
		//
		// Sign Up
		//
		// ---------------------------------------------------------------------------

		// Form data for the signUp modal
		$scope.signUpData  = {};

		// Create the signUp modal that we will use later
		$ionicModal.fromTemplateUrl(
			'templates/user/signup.html', {
				scope: $scope
			}
		).then(
			function (modal) {
				$scope.modalSignUp = modal;
			}
		);
		$scope.closeSignUp = function () {
			$scope.openProfile();
			$scope.modalSignUp.hide();
		};
		$scope.openSignUp  = function () {
			$scope.closeProfile();
			$scope.modalSignUp.show();
		};
		$scope.doSignUp    = function () {
			console.log('Doing signUp', $scope.signUpData);
			if ($scope.signUpData.userEmail && $scope.signUpData.userPassword) {

				Utils.showMessage("Creating user... ");

				Auth.signUpPassword($scope.signUpData.userEmail, $scope.signUpData.userPassword).then(
					function (authData) {

						Utils.showMessage("Logging in user... ");
						$scope.loginData = $scope.signUpData;
						$scope.doLogin(true);

					}, function (error) {
						Codes.handleError(error)
					}
				)
			} else {
				Codes.handleError({code: "INVALID_INPUT"})
			}
		};

		// ---------------------------------------------------------------------------
		//
		// Change password
		//
		// ---------------------------------------------------------------------------

		// Form data for the signUp modal
		$scope.changePasswordData  = {};

		// Create the signUp modal that we will use later
		$ionicModal.fromTemplateUrl(
			'templates/user/change-password.html', {
				scope: $scope
			}
		).then(
			function (modal) {
				$scope.modalChangePassword = modal;
			}
		);
		$scope.closeChangePassword = function () {

			$scope.openProfile();
			$scope.modalChangePassword.hide();
		};
		$scope.openChangePassword  = function () {
			console.log("openChangePassword");

			// when authenticated
			if ($scope.authData.hasOwnProperty('password')) {
				$scope.changePasswordData = {
					userEmail: $scope.authData.password.email
				}
			}

			$scope.closeProfile();
			$scope.modalChangePassword.show();
		};

		//
		// step 1: reset password
		//
		$scope.resetPassword = function () {
			if ($scope.changePasswordData.userEmail) {
				Utils.showMessage("Resetting password");
				Auth.resetPassword(
					$scope.changePasswordData.userEmail
				).then(
					function (success) {

						Utils.showMessage(
							"Password has been reset. Please check your email for the temporary password",
							2000
						);

					}, function (error) {
						Codes.handleError(error)
					}
				)

			} else {
				Codes.handleError({code: "INVALID_INPUT"})
			}
		};

		//
		// step 2: change password
		//
		$scope.doChangePassword = function () {
			console.log('Doing ChangePassword', $scope.changePasswordData);
			if ($scope.changePasswordData.userEmail &&
				$scope.changePasswordData.oldPassword &&
				$scope.changePasswordData.newPassword) {
				Utils.showMessage("Changing password... ");
				Auth.changePassword(
					$scope.changePasswordData.userEmail,
					$scope.changePasswordData.oldPassword,
					$scope.changePasswordData.newPassword
				).then(
					function (authData) {

						//
						Utils.showMessage("Changed!");
						$scope.closeChangePassword();
						//
						$scope.loginData = {
							userEmail:    $scope.changePasswordData.userEmail,
							userPassword: $scope.changePasswordData.newPassword
						};
						$scope.doLogin();

					}, function (error) {
						Codes.handleError(error)
					}
				)
			} else {
				Codes.handleError({code: "INVALID_INPUT"})
			}
		};

		// ---------------------------------------------------------------------------
		//
		// Change E-mail
		//
		// ---------------------------------------------------------------------------

		// Form data for the login modal
		$scope.changeEmailData  = {};

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl(
			'templates/user/change-email.html', {
				scope: $scope
			}
		).then(
			function (modal) {
				$scope.modalChangeEmail = modal;
			}
		);
		$scope.closeChangeEmail = function () {

			$scope.openProfile();
			$scope.modalChangeEmail.hide();
		};
		$scope.openChangeEmail  = function () {

			// when authenticated
			if ($scope.authData.hasOwnProperty('password')) {
				$scope.changeEmailData = {
					oldEmail: $scope.authData.password.email
				}
			}

			$scope.closeProfile();
			$scope.modalChangeEmail.show();
		};
		$scope.doChangeEmail    = function () {
			console.log('changeEmail', $scope.changeEmailData);
			if ($scope.changeEmailData.oldEmail &&
				$scope.changeEmailData.newEmail &&
				$scope.changeEmailData.userPassword) {

				Utils.showMessage("Changing e-mail", 500)

				Auth.changeEmail(
					$scope.changeEmailData.oldEmail,
					$scope.changeEmailData.newEmail,
					$scope.changeEmailData.userPassword
				).then(
					function (success) {

						//
						$scope.closeChangeEmail();
						Utils.showMessage("E-mail changed!", 500)

					}, function (error) {
						Codes.handleError(error)
					}
				)
			} else {
				Codes.handleError({code: "INVALID_INPUT"})
			}
		};

		// ---------------------------------------------------------------------------
		//
		// Other
		//
		// ---------------------------------------------------------------------------

		/**
		 *
		 */
		$scope.signOut = function () {
			Utils.showMessage("Signing out...");
			Auth.signOut();
			$timeout(
				function () {
					doRefresh();
					Utils.showMessage("Signed out!", 500);
					$scope.closeProfile();
				}, 1000
			)
		};

		$ionicModal.fromTemplateUrl(
			'templates/posts/new-message-modal.html', {
				scope: $scope
			}
		).then(
			function (modal) {
				$scope.modalMessageCreate = modal;
			}
		);
		$scope.closeMessageCreate = function () {
			$scope.modalMessageCreate.hide();
		};
		$scope.openMessageCreate  = function () {
			$scope.modalMessageCreate.show();
		};

	}
);