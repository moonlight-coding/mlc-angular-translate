angular.module('MlcTranslate', []);
angular.module('MlcTranslate').directive('mlcTranslate', function (mlcTranslate, $compile) {
  return {
    scope: {
      key: '=mlcTranslate',
      group: '=',
      params: '='
    },
    replace: true,
    controllerAs: '$ctrl',
    link: function ($scope, element, attrs, controller, transcludeFn) {
      let childScope = null;
      let translation = null;
      let lastParams = null; // rebuild the translation

      $scope.refresh = () => {
        // we check that the translation and the params are still the same, if so, no need to use $compile
        let lastTranslation = translation;
        translation = mlcTranslate.search(controller.group, controller.key); // if the translation didn't change, no need to refresh it

        if (lastTranslation == translation && controller.params == lastParams) return;
        lastParams = controller.params; // we must refresh

        if (childScope) childScope.$destroy(); // create a child scope, with the params in it

        childScope = $scope.$new();
        childScope.params = controller.params;
        childScope._ = controller.params; // search the expression, don't translate it directly

        element.html(translation);
        $compile(element.contents())(childScope);
      };
    },
    controller: function ($scope, $rootScope) {
      this.key = null;
      this.group = null;
      this.params = null;
      this.translationService = mlcTranslate;
      let keyDescriptor = null; // if any of the directive's input change

      $scope.$watchGroup(['key', 'group', 'params'], () => {
        this.key = $scope.key;
        this.group = $scope.group || 'default';
        this.params = $scope.params || {};

        if (keyDescriptor) {
          $rootScope.$broadcast('translation.destroy', keyDescriptor);
        }

        keyDescriptor = {
          key: this.key,
          group: this.group,
          params: Object.keys(this.params)
        };
        $rootScope.$broadcast('translation.new', keyDescriptor);
        $scope.refresh();
      }); // refresh when there is a translation modification

      $scope.$watch('$ctrl.translationService.translations[$ctrl.group][$ctrl.key]', function () {
        $scope.refresh();
      });
      $scope.$on('$destroy', function () {
        $rootScope.$broadcast('translation.destroy', keyDescriptor);
      });
    }
  };
});
angular.module('MlcTranslate').service('mlcTranslate', function ($http, $rootScope, $interpolate) {
  /**************************************************
   * Inputs and overridable variables of the service
   **************************************************/
  // the locale that is requested
  this.locale = "en_GB"; // the available locals

  this.availableLocals = ["en_GB"]; // the translations keys which are available

  this.translations = {}; // the history of the translation keys, to use with the translation-panel only, not in prod

  this.history = {}; // project makes possible to separate the translation keys from your public website and admin

  this.project = "project_1";
  this.groups = null; // groups to fetch
  // apiConnection must be an instance of MlcTranslateAbstractApiConnection

  this.apiConnection = null;
  /**************************
   * service implementation
   **************************/

  /**
   * Get the translation expression of the desired key
   * If the translation is not found, returns the key
   */

  this.search = (group, key) => {
    if (group in this.translations) {
      if (key in this.translations[group]) {
        return this.translations[group][key];
      }
    }

    return key;
  };
  /**
   * Translate the key with the specified parameters
   */


  this.translate = (group, key, parameters = {}) => {
    return $interpolate(service.search(group, key))(parameters);
  };

  this.setLocale = locale => {
    return this.apiConnection.getLocale(locale, this.groups, true).then(response => {
      this.translations = response.data.translations;
      this.history = response.data.history;
      this.locale = locale;
    });
  };

  this.reload = () => {
    return this.setLocale(this.locale);
  };
});

class MlcTranslateAbstractApiConnection {
  async getLocale(locale, groups = null, history = false) {
    throw new Error("getLocale() to implement");
  }

}

class MlcTranslateApiConnection extends MlcTranslateAbstractApiConnection {
  constructor($http, project = 'default', rootUrl = '.') {
    super();
    this.$http = $http;
    this.project = project;
    this.rootUrl = rootUrl;
  }

  buildURL(route) {
    return this.rootUrl + route;
  }

  buildRemoveVersionURL(version) {
    return "/translations/version/remove";
  }

  buildPostParams(locale, group, key, value) {
    return {
      "project": this.project,
      "locale": locale,
      "group": group,
      "key": key,
      "value": value
    };
  }

  /**
   * Get the required groups
   */
  getLocale(locale, groups = null, history = false) {
    let $http = this.$http;
    let project = this.project;
    return $http.post(this.buildURL('/query'), {
      project,
      locale,
      groups,
      history
    });
  }

  createTranslation(locale, group, key, value) {
    let $http = this.$http;
    let project = this.project;
    return $http.post(this.buildURL('/translations'), {
      project,
      locale,
      group,
      key,
      value
    });
  }

  removeTranslation(id) {
    let $http = this.$http;
    let project = this.project;
    return $http.delete(this.buildURL('/translations/' + id));
  }

}