angular.module('starter.services-messages', [])

	.factory(
	'Messages', function () {
		var self = this;

		self.addMessage = function (userId, messageFromInput) {
			var qAdd       = $q.defer();
			var ref        = new Firebase(FBURL);

			console.log(value);
			var onComplete = function (error) {
				if (error) {
					qAdd.reject(
						{error: error}
					);
				} else {
					qAdd.resolve(true);
				}
			};
			ref.child("messages").push(
				{
					userIdl:       userId,
					message_value: messageFromInput
				},
				onComplete
			);
			return qAdd.promise;
		};

		return self;
	}
);