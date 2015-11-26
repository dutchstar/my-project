angular.module('starter.controllers-messages', [])

	.controller(
	'MessageCtrl', function ($scope, $ionicModal, Messages) {

		$scope.addMessage = function (message) {
			Messages.addMessage(message.userIdl, message.message_value)
				.then(
				function (success) {
					alert('Success!');
				}
			)
				.catch(
				function (error) {
					alert('Error!');
				}
			);
		};

	}
);