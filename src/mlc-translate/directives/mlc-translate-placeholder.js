angular.module('MlcTranslate').directive('mlcTranslatePlaceholder', function(mlcTranslate, $compile) {
  return {
    scope: {
      key: '=mlcTranslatePlaceholder',
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
        translation = mlcTranslate.translate(controller.group, controller.key, {
          params: controller.params,
          _: controller.params
        });
        
        // if the translation didn't change, no need to refresh it
        if(lastTranslation == translation)
          return;
        
        // we must refresh
        element.attr('placeholder', translation);
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
      
      $scope.$watchCollection('$ctrl.params', function() {
        $scope.refresh();
      });
      
      $scope.$on('$destroy', function() {
        $rootScope.$broadcast('translation.destroy', keyDescriptor);
      });
      
    }
  };
});