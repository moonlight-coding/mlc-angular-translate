var app = angular.module('MyApp', ['MlcTranslate', 'MlcTranslateToolbox']);

app.run(function(mlcTranslate) {
  mlcTranslate.translations = {
    'my-group': {
      'div': '<div style="border: 1px solid black">Test of div</div>'
    }
  };
});

app.controller('MyCtrl', function($scope, mlcTranslate, mlcTranslateToolbox) {
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
  
  this.translations = mlcTranslate.translations;
  this.toolboxGroups = mlcTranslateToolbox.groups;
  
});
