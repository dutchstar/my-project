angular.module('starter.services-utils', [])


/**
 * All other complementary functions
 */
.factory('Utils', function($ionicLoading, $timeout) {
    var self = this;
    
    
    
    //
    // ionic loading notification
    self.showMessage = function(message, optHideTime) {
    
        if(optHideTime != undefined && optHideTime > 100) {
            // error message or notification (no spinner)
            $ionicLoading.show({
                template: message
            });
            
            $timeout(function(){
                $ionicLoading.hide();
            }, optHideTime)
            
        } else { 
            // loading (spinner)
            $ionicLoading.show({
                template: message + '<br><br>' + '<ion-spinner style="fill: #fff;"></ion-spinner>'
            });
            
            $timeout(function(){    // close if it takes longer than 10 seconds
                $ionicLoading.hide();
            }, 10000)
        }
    };
    
    
    return self;
})

