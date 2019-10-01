angular.module('MlcTranslate').directive('mlcTranslate', function(mlcTranslate, $compile) {
  return {
    scope: {
      key: '=mlcTranslate',
      group: '=',
      params: '='
    },
    replace: true,
    link: function($scope, element, attrs, controller, transcludeFn) {
      
      let childScope = null;
      
      // rebuild the expression
      $scope.refresh = () => {
        
        if(childScope)
          childScope.$destroy();
          
        // create a child scope, with the params in it
        childScope = $scope.$new();
        childScope.params = controller.params;
        childScope._ = controller.params;
        
        // search the expression, don't translate it directly
        element.html(mlcTranslate.search(controller.group, controller.key));
        $compile(element.contents())(childScope);
      };
    },
    controller: function($scope) {
      this.key = null;
      this.group = null;
      this.params = null;
      
      // if any of the directive's input change
      $scope.$watchGroup(['key', 'group', 'params'], () => {
        this.key = $scope.key;
        this.group = $scope.group || 'default';
        this.params = $scope.params || {};
        
        $scope.refresh();
      });
    }
  };
});