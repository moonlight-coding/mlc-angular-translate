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

app.controller('MyCtrl', function($scope, mlcTranslate, mlcTranslateToolbox, Samples) {
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
  this.samples = Samples;
});

app.directive('codeSample', function($sce) {
  return {
    template: '<pre><code ng-transclude></code></pre>',
    transclude: true,
    scope: {}
  };
});

function escapeHtml(unsafe) {
  return unsafe
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
}

app.value('Samples', {
  '1': `<div mlc-translate="'Hello'"></div>`,
  '2': `<div mlc-translate="'Hello'" data-group="'my-group'"></div>`,
  '3': `<div mlc-translate="'Timer value is {{ params.timer }}'" data-group="'my-group'" data-params="{timer: $ctrl.params.timer}"></div>`,
  '4': `<div mlc-translate="'Timer value is {{ _.timer }}'" data-group="'my-group'" data-params="$ctrl.params"></div>`
});
