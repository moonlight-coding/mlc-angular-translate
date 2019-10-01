var app = angular.module('MyApp', ['MlcTranslate']);

app.run(function(mlcTranslate) {
  mlcTranslate.translations = {
    'my-group': {
      'div': '<div style="border: 1px solid black">Test of div</div>'
    }
  };
});

app.controller('MyCtrl', function($scope) {
  this.params = {
    timer: 0
  };
  
  let increaseTimer = () => {
    setTimeout(() => {
      this.params.timer ++;
      $scope.$apply();
      
      increaseTimer();
    }, 1000);
  };
  
  increaseTimer();
  
});
