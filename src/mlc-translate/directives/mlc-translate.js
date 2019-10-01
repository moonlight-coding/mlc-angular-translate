angular.module('MlcTranslate').directive('mlcTranslate', function(mlcTranslate, $compile) {
  return {
    scope: {
      key: '=mlcTranslate',
      group: '=',
      params: '='
    },
    replace: true,
    controllerAs: '$ctrl',
    link: function($scope, element, attrs, controller, transcludeFn) {
      
      let childScope = null;
      let translation = null;
      let lastParams = null;
      
      // rebuild the translation
      $scope.refresh = () => {
        
        // we check that the translation and the params are still the same, if so, no need to use $compile
        let lastTranslation = translation;
        translation = mlcTranslate.search(controller.group, controller.key);
        
        // if the translation didn't change, no need to refresh it
        if(lastTranslation == translation && controller.params == lastParams)
          return;
        
        lastParams = controller.params;
        
        // we must refresh
        
        if(childScope)
          childScope.$destroy();
        
        // create a child scope, with the params in it
        childScope = $scope.$new();
        childScope.params = controller.params;
        childScope._ = controller.params;
        
        // search the expression, don't translate it directly
        element.html(translation);
        $compile(element.contents())(childScope);
      };
    },
    controller: function($scope, $rootScope) {
      this.key = null;
      this.group = null;
      this.params = null;
      this.translationService = mlcTranslate;
      
      let keyDescriptor = null;
      
      // if any of the directive's input change
      $scope.$watchGroup(['key', 'group', 'params'], () => {
        this.key = $scope.key;
        this.group = $scope.group || 'default';
        this.params = $scope.params || {};
        
        if(keyDescriptor) {
          $rootScope.$broadcast('translation.destroy', keyDescriptor);
        }
        
        keyDescriptor = {
          key: this.key,
          group: this.group,
          params: Object.keys(this.params)
        };
        
        $rootScope.$broadcast('translation.new', keyDescriptor);
        
        $scope.refresh();
      });
      
      // refresh when there is a translation modification
      $scope.$watch('$ctrl.translationService.translations[$ctrl.group][$ctrl.key]', function() {
        $scope.refresh();
      });
      
      $scope.$on('$destroy', function() {
        $rootScope.$broadcast('translation.destroy', keyDescriptor);
      });
      
    }
  };
});