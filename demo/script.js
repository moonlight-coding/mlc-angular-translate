var app = angular.module('MyApp', ['MlcTranslate', 'MlcTranslateToolbox']);

app.run(function(mlcTranslate, $http) {
  /*mlcTranslate.translations = {
    'my-group': {
      'div': '<div style="border: 1px solid black">Test of div</div>'
    }
  };*/
  
  mlcTranslate.apiConnection = new MlcTranslateApiConnection($http, 'default', 'http://localhost:3000');
  mlcTranslate.availableLocals = ["en_GB", "fr_FR"];
  mlcTranslate.setLocale("fr_FR");
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
  
  this.mlcTranslate = mlcTranslate;
  this.toolboxGroups = mlcTranslateToolbox.groups;
  
});
