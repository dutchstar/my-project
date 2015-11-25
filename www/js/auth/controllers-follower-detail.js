angular.module('starter.controllers-follower-detail', [])

	.controller(
	'FollowerDetailCtrl', function (
		$scope, $timeout,
		$ionicLoading, $stateParams,
		Auth, Codes, Utils, Followers
	) {

		$scope.tempData = {noProfilePicture: "img/ionic.png"};

		$scope.FollowingList     = Followers.FollowingList;
		$scope.FollowingProfiles = Followers.FollowingProfiles;
		$scope.fid               = $stateParams.fid; // stateparam friend id

		$scope.$on(
			'$rootScope.refresh', function () {    // called when logged out for instance
				Followers.resetFollowing();
				$scope.doRefresh();
			}
		);

		//$scope.$on('$ionicView.enter', function(){
		// optional
		//});

		$scope.doRefresh = function () {
			doRefresh();
		};

		function doRefresh() {

			$scope.authData = Auth.authData;

			if ($scope.authData.hasOwnProperty('uid')) {
				Followers.refreshFollowing($scope.authData.uid).then(
					function (success) {
						refreshComplete();
					}, function (error) {
						refreshComplete();
						Codes.handleError(error)
					}
				)
			} else {
				refreshComplete();
			}

		}

		function refreshComplete() {
			$scope.FollowingList     = Followers.FollowingList;
			$scope.FollowingProfiles = Followers.FollowingProfiles;
			$scope.fid               = $stateParams.fid; // stateparam friend id

			$scope.$broadcast('scroll.refreshComplete');
		}

	}
);