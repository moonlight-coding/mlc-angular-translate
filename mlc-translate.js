angular.module('MlcTranslate', []);
angular.module('MlcTranslate').directive('mlcTranslatePlaceholder', function (mlcTranslate, $compile) {
  return {
    scope: {
      key: '=mlcTranslatePlaceholder',
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
        translation = mlcTranslate.translate(controller.group, controller.key, {
          params: controller.params,
          _: controller.params
        }); // if the translation didn't change, no need to refresh it

        if (lastTranslation == translation) return; // we must refresh

        element.attr('placeholder', translation);
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
      $scope.$watchCollection('$ctrl.params', function () {
        $scope.refresh();
      });
      $scope.$on('$destroy', function () {
        $rootScope.$broadcast('translation.destroy', keyDescriptor);
      });
    }
  };
});
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

  this.project = "project_1"; // groups to fetch, null means 'all groups'
  // If the groups are not specified, the cache will not be able to work..

  this.groups = null; // must the query load the history too ? to enable only if the toolbox is available

  this.queryHistory = false; // apiConnection must be an instance of MlcTranslateAbstractApiConnection

  this.apiConnection = null;
  let cache = new MlcTranslateLocalStorageCache();
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
    if (key == null) return null;
    return $interpolate(this.search(group, key))(parameters);
  };

  this.setLocale = locale => {
    // load the groups from the cache
    let groupTimestamps = null; // if the groups are specified

    if (this.groups != null) {
      groupTimestamps = [];

      for (let groupName of this.groups) {
        let group = cache.getGroup(this.project, groupName);
        if (group == null) groupTimestamps.push([groupName, null]);else {
          groupTimestamps.push([groupName, group.timestamp]);
          this.translations[groupName] = group.translations;
        }
      }
    } // query to the api, the cached groups which are not to update will not be sent.
    // the groups which have changed, are sent, even if empty


    return this.apiConnection.getLocale(locale, groupTimestamps, this.queryHistory).then(response => {
      // store in the cache the updated groups
      for (let groupName in response.data.translations) {
        let group = response.data.translations[groupName];
        let timestamp = response.data.timestamps[groupName];
        cache.setGroup(this.project, groupName, {
          translations: group,
          timestamp: timestamp
        });
        this.translations[groupName] = group;
      } // history is not cached


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
  constructor($http, mlcTranslate, rootUrl = '.') {
    super();
    this.$http = $http;
    this.mlcTranslate = mlcTranslate;
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
      "project": this.mlcTranslate.project,
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
    let project = this.mlcTranslate.project;
    return $http.post(this.buildURL('/query'), {
      project,
      locale,
      groups,
      history
    });
  }

  createTranslation(locale, group, key, value) {
    let $http = this.$http;
    let project = this.mlcTranslate.project;
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
    let project = this.mlcTranslate.project;
    return $http.delete(this.buildURL('/translations/' + id));
  }

}
/**
 * If the translations are available in local, you can integrate them in the application
 */


class MlcTranslateLocalConnection extends MlcTranslateAbstractApiConnection {
  constructor(translationsPerLocale) {
    super();
    this.translationsPerLocale = translationsPerLocale;
  }
  /**
   * Get the required groups
   */


  getLocale(locale, groups = null, history = false) {
    return Promise.resolve({
      data: this.translationsPerLocale[locale]
    });
  }

  createTranslation(locale, group, key, value) {
    throw new Error("Cannot create translation with MlcTranslateLocalConnection");
  }

  removeTranslation(id) {
    throw new Error("Cannot remove translation with MlcTranslateLocalConnection");
  }

}
/**
 * Access/Persist translations in localStorage
 */


class MlcTranslateLocalStorageCache {
  constructor() {}

  buildKey(project, group) {
    return `mlc-translate[${project}][${group}]`;
  }

  getGroup(project, group) {
    let g = localStorage.getItem(this.buildKey(project, group));

    if (g) {
      return JSON.parse(g);
    } // not in cache


    return null;
  }

  setGroup(project, group, content) {
    localStorage.setItem(this.buildKey(project, group), JSON.stringify(content));
  }

}