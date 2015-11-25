angular.module('starter.services-followers', [])

/**
 * General Wrapper for Followers (Instagram like) Management
 * This version: 25/07/2015
 */
	.factory(
	'Followers', function ($q, Profile) {
		var self = this;

		self.FollowingList     = {};
		self.FollowingProfiles = {};

		self.resetFollowing = function () {
			self.FollowingList     = {};
			self.FollowingProfiles = {};
		};

		/**
		 * This function retrieves the list of followers first, and then iteratively
		 * fills the content of FollowingProfiles (with displayName, userName, profilePicture)
		 * You can change the promise to wait before all data has been retrieved instead
		 */
		self.refreshFollowing = function (uid) {
			var qRefresh = $q.defer();

			getList("following", uid).then(
				function (Following) {
					//
					self.FollowingList = Following;
					qRefresh.resolve(); // see *Note1*
					fillFollowingProfiles(Following);
				}, function (error) {
					//
					qRefresh.reject(error);
				}
			);

			//
			// *Note1*
			// Iteratively fill the profiles
			//
			// If you wish to wait for all profiles to be loaded, then
			// add qRefresh.resolve() in this part of the code.
			//
			// A great explanation on how to deal with an async forEach loop
			// can be found in this thread: http://stackoverflow.com/a/21315112/4262057
			//
			function fillFollowingProfiles(Following) {
				angular.forEach(
					Following, function (value, key) {
						console.log(value, key);
						Profile.getProfile(key).then(
							function (profileData) {
								self.FollowingProfiles[key] = profileData;
							}, function (error) {
								// skip
							}
						)
					}
				)
			}

			return qRefresh.promise;
		};

		/**
		 * Generic wrapper to retrieve list of followers and or followed by
		 * targetNode: following and followedBy
		 */
		function getList(targetNode, uid) {
			var qGet      = $q.defer();
			var targetRef = new Firebase(FBURL + "/" + targetNode + "/" + uid);
			targetRef.on(
				"value", function (snapshot) {

					self.FollowingList = snapshot.val(); //gv
					qGet.resolve(snapshot.val());

				}, function (error) {
					qGet.reject(error);
				}
			);
			return qGet.promise;
		}

		// following
		// followedBy
		self.addFollower = function (uid, followerUserName) {
			var qAdd = $q.defer();

			var followingRef  = new Firebase(FBURL + "/following/");
			var followedByRef = new Firebase(FBURL + "/followedBy/");

			// 1
			checkExistanceUserName(followerUserName).then(
				function (fid) {
					// 2
					updateFollowing(fid).then(
						function (success) {
							// 3
							updateFollowedBy(fid).then(
								function (success) {
									qAdd.resolve("ADD_FOLLOWER_SUCCESS");
								}, function (error) {
									// e3
									qAdd.reject(error);
								}
							)
						}, function (error) {
							// e2
							qAdd.reject(error);
						}
					)
				}, function (error) {
					// e1
					qAdd.reject(error);
				}
			);

			// fn 2
			function updateFollowing(fid) {
				var qUpdate1   = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qUpdate1.reject(error);
					} else {
						qUpdate1.resolve("UPDATE_FOLLOWING_SUCCESS")
					}
				}
				followingRef.child(uid).child(fid).set(true, onComplete);
				return qUpdate1.promise;
			};

			// fn 3
			function updateFollowedBy(fid) {
				var qUpdate2   = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qUpdate2.reject(error);
					} else {
						qUpdate2.resolve("UPDATE_FOLLOWEDBY_SUCCESS")
					}
				}
				followedByRef.child(fid).child(uid).set(true, onComplete);
				return qUpdate2.promise;
			};

			return qAdd.promise;
		};

		/**
		 * Checks whether username exists
		 * returns 'uid'
		 */
		function checkExistanceUserName(userName) {
			var qCheck      = $q.defer();
			var userNameRef = new Firebase(FBURL + "/usernames/" + userName);
			userNameRef.once(
				'value', function (snapshot) {
					var snapObj = snapshot.val();
					if (snapObj != null && snapObj != undefined) {
						qCheck.resolve(snapObj.uid); // return uid of username
					} else {
						qCheck.reject({code: "USERNAME_NONEXIST"});
					}
				}
			);
			return qCheck.promise;
		};

		/**
		 *
		 */
		self.stopFollowing = function (uid, fid) {
			var qDelete       = $q.defer();
			var followingRef  = new Firebase(FBURL + "/following/");
			var followedByRef = new Firebase(FBURL + "/followedBy/");

			// 1
			updateFollowing(fid).then(
				function (success) {
					// 2
					updateFollowedBy(fid).then(
						function (success) {
							qDelete.resolve("REMOVE_FOLLOWER_SUCCESS")
						}, function (error) {
							// e2
							qDelete.reject(error);
						}
					)
				}, function (error) {
					// e1
					qDelete.reject(error);
				}
			);

			// fn 2
			function updateFollowing(fid) {
				var qUpdate1   = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qUpdate1.reject(error);
					} else {
						qUpdate1.resolve("UPDATE_FOLLOWING_SUCCESS")
					}
				};
				followingRef.child(uid).child(fid).remove(onComplete);
				return qUpdate1.promise;
			}

			// fn 3
			function updateFollowedBy(fid) {
				var qUpdate2   = $q.defer();
				var onComplete = function (error) {
					if (error) {
						qUpdate2.reject(error);
					} else {
						qUpdate2.resolve("UPDATE_FOLLOWEDBY_SUCCESS")
					}
				};
				followedByRef.child(fid).child(uid).remove(onComplete);
				return qUpdate2.promise;
			}

			return qDelete.promise;
		};

		return self;
	}
);