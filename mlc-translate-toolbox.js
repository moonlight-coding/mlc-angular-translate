angular.module('MlcTranslateToolbox', ['MlcTranslate']);
angular.module('MlcTranslateToolbox').directive('mlcTranslateToolbox', function (mlcTranslate, mlcTranslateToolbox, $compile) {
  return {
    templateUrl: 'http://mlc-translate.local/directives/toolbox.html',
    controllerAs: '$ctrl',
    scope: {},
    controller: function ($scope) {
      this.mlcTranslateToolbox = mlcTranslateToolbox;
      this.translateService = mlcTranslate;
      this.showTranslations = false;
      this.opened = true;
      this.group = null;
      this.key = null;
      this.version = null; // show / hide the mlc-translate directives

      let show_elt = angular.element("<style type='text/css'>[mlc-translate] { background-color: #dddddd; border:2px solid violet; }</style>");

      this.toggleShowTranslations = () => {
        if (!this.showTranslations) {
          angular.element(document.querySelector("head")).append(show_elt);
        } else {
          show_elt.remove();
        }

        this.showTranslations = !this.showTranslations;
      };

      this.groupChanged = () => {
        this.key = null;
        this.version = null;
      };

      this.keyChanged = () => {
        if (this.group == null || this.key == null) return;
        if (mlcTranslate.history[this.group] != null && mlcTranslate.history[this.group][this.key] != null) this.version = mlcTranslate.history[this.group][this.key].length - 1;else {
          this.version = "0";
          if (!mlcTranslate.translations[this.group]) mlcTranslate.translations[this.group] = {};
          mlcTranslate.translations[this.group][this.key] = this.key;
        }
      };

      this.versionChanged = () => {
        mlcTranslate.translations[this.group][this.key] = mlcTranslate.history[this.group][this.key][this.version].value;
      };

      this.saveKey = () => {
        let locale = mlcTranslate.locale;
        let group = this.group;
        let key = this.key;
        let value = mlcTranslate.translations[group][key];
        mlcTranslate.apiConnection.createTranslation(locale, group, key, value).then(() => {
          return mlcTranslate.reload();
        }).then(() => {
          this.version = mlcTranslate.history[this.group][this.key].length - 1;
        });
      };

      this.removeVersion = () => {
        var group = this.group;
        var key = this.key;
        var version = this.version;
        let versionId = mlcTranslate.history[this.group][this.key][this.version].id;
        mlcTranslate.apiConnection.removeTranslation(versionId).then(() => {
          return mlcTranslate.reload();
        }).then(() => {
          if (mlcTranslate.history[this.group] != null) {
            this.version = mlcTranslate.history[this.group][this.key].length - 1;
          } else {
            this.version = null;
          }
        });
      };

      this.closeToolbox = () => {
        this.opened = false;
      };

      this.openToolbox = () => {
        this.opened = true;
      };

      this.setLocale = function (locale) {
        mlcTranslate.setLocale(locale).then(() => {
          this.keyChanged();
        });
      };

      $scope.$watch('$ctrl.mlcTranslateToolbox.removeKeysIfDestroy', () => {
        this.removeKeysIfDestroy = this.mlcTranslateToolbox.removeKeysIfDestroy;
      });
    }
  };
});
angular.module('MlcTranslateToolbox').service('mlcTranslateToolbox', function ($rootScope) {
  // will contain the count of each key, per group
  this.groups = {}; // 

  this.removeKeysIfDestroy = true;
  this.removableKeyDescriptors = [];
  $rootScope.$on('translation.new', (event, keyDescriptor) => {
    // if the group doesn't exist, create it
    if (this.groups[keyDescriptor.group] == null) {
      this.groups[keyDescriptor.group] = {
        translations: {}
      };
    } // add the translation in the group


    if (this.groups[keyDescriptor.group].translations[keyDescriptor.key] == null) {
      this.groups[keyDescriptor.group].translations[keyDescriptor.key] = [];
    } // 


    keyDescriptor.paramKeys = keyDescriptor.params == null ? [] : Object.keys(keyDescriptor.params); // store the keyDescriptor

    this.groups[keyDescriptor.group].translations[keyDescriptor.key].push(keyDescriptor);
  }); // function to remove a keyDescriptor

  let removeKey = keyDescriptor => {
    let container = this.groups[keyDescriptor.group].translations[keyDescriptor.key];
    container.splice(container.indexOf(keyDescriptor), 1); // if there is no more translation with that key, remove the key

    if (container.length == 0) {
      delete this.groups[keyDescriptor.group].translations[keyDescriptor.key];
    } // if there is no translation anymore in the group, remove the group


    if (Object.keys(this.groups[keyDescriptor.group].translations).length == 0) {
      delete this.groups[keyDescriptor.group];
    }
  };

  $rootScope.$on('translation.destroy', (event, keyDescriptor) => {
    // either we remove the keys
    if (this.removeKeysIfDestroy) {
      removeKey(keyDescriptor);
    } // either we mark them as 'removable'
    else {
        this.removableKeyDescriptors.push(keyDescriptor);
      }
  });

  this.setRemoveKeysIfDestroy = removeKeysIfDestroy => {
    // if removeKeysIfDestroy, then remove all the keys that should have been removed
    if (removeKeysIfDestroy) {
      for (let keyDescriptor of this.removableKeyDescriptors) {
        removeKey(keyDescriptor, keyDescriptor.index);
      }

      this.removableKeyDescriptors = [];
    }

    this.removeKeysIfDestroy = removeKeysIfDestroy;
  };
});
angular.module('MlcTranslateToolbox').run(['$templateCache', function ($templateCache) {
  $templateCache.put('http://mlc-translate.local/directives/toolbox.html', '<div class="mlc-translate-toolbox" ng-if="$ctrl.opened == true">\n  <div class="mlc-translate-head">\n    <div class="row">\n      <div class="col-xs-4">\n        <h3 mlc-translate="\'Translation Toolbox\'" data-group="\'mlc-translate-toolbox\'"></h3>\n      </div>\n      <div class="col-xs-3">\n        <div style="height: 5px;"></div>\n        <select ng-model="$ctrl.removeKeysIfDestroy"  ng-change="$ctrl.mlcTranslateToolbox.setRemoveKeysIfDestroy($ctrl.removeKeysIfDestroy)" class="form-control">\n          <option ng-value="true" mlc-translate="\'all currently displayed keys\'" data-group="\'mlc-translate-toolbox\'"></option>\n          <option ng-value="false" mlc-translate="\'all keys\'" data-group="\'mlc-translate-toolbox\'"></option>\n        </select>\n      </div>\n      <div class="col-xs-3">\n        <div style="height: 5px;"></div>\n        <select ng-model="$ctrl.translateService.locale" ng-change="$ctrl.setLocale($ctrl.translateService.locale);" class="form-control">\n          <option ng-repeat="locale in $ctrl.translateService.availableLocals track by $index" ng-value="locale">{{ locale }}</option>\n        </select>\n      </div>\n      <div class="col-xs-2">\n        <h3 style="cursor: pointer;" ng-click="$ctrl.closeToolbox()"\n            mlc-translate="\'Close\'" data-group="\'mlc-translate-toolbox\'"></h3>        \n      </div>\n    </div>\n  </div>\n  <div style="clear:both;"></div>\n  <div class="mlc-translate-body">\n  \n    <button class="btn btn-primary"\n      style="display: block;width: 100%;"\n      ng-if="$ctrl.showTranslations == false"\n      ng-click="$ctrl.toggleShowTranslations()"\n      mlc-translate="\'Afficher les traductions\'" data-group="\'mlc-translate-toolbox\'"></button>\n    <button class="btn btn-default" \n      style="display: block;width: 100%;"\n      ng-if="$ctrl.showTranslations == true"\n      ng-click="$ctrl.toggleShowTranslations()"\n      mlc-translate="\'Cacher les traductions\'" data-group="\'mlc-translate-toolbox\'"></button>\n    <br />\n  \n    <div class="row" style="padding-bottom: 5px;">\n      <div class="col-xs-4">\n        <label mlc-translate="\'Group\'" data-group="\'mlc-translate-toolbox\'"></label>\n      </div>\n      <div class="col-xs-8">\n        <select class="form-control" ng-model="$ctrl.group" ng-change="$ctrl.groupChanged()">\n          <option ng-repeat="(group, _) in $ctrl.mlcTranslateToolbox.groups track by $index" value="{{ group }}">{{ group }}</option>\n        </select>\n      </div>\n    </div>\n    \n    <div ng-if="$ctrl.group != null">\n      <div class="row">\n        <div class="col-xs-4">\n          <label mlc-translate="\'Key\'" data-group="\'mlc-translate-toolbox\'"></label>\n        </div>\n        <div class="col-xs-8">\n          <select class="form-control" ng-model="$ctrl.key" ng-change="$ctrl.keyChanged()">\n            <option ng-repeat="(key, _) in $ctrl.mlcTranslateToolbox.groups[$ctrl.group].translations track by $index" value="{{ key }}">{{ key }}</option>\n          </select>\n        </div>\n      </div>\n    </div>\n    \n    <div ng-if="$ctrl.key != null">\n      \n      <div class="alert alert-info" ng-if="$ctrl.mlcTranslateToolbox.groups[$ctrl.group].translations[$ctrl.key][0].parameters.length > 0">\n        <span mlc-translate="\'The following keys are available:\'" data-group="\'mlc-translate-toolbox\'"></span>\n        <span ng-repeat="key in $ctrl.mlcTranslateToolbox.groups[$ctrl.group].translations[$ctrl.key][0].parameters track by $index" \n          ng-style="{ \'color\': [\'green\', \'blue\', \'purple\'][$index % 3] }"\n        >{{ key }} </span>\n      </div>\n      \n      <div class="row" ng-if="$ctrl.translateService.history[$ctrl.group][$ctrl.key] != null">\n        <div class="col-xs-4">\n          <label mlc-translate="\'Version\'" data-group="\'mlc-translate-toolbox\'"></label> \n          <a class="btn btn-danger" ng-click="$ctrl.removeVersion()" mlc-translate="\'remove\'" data-group="\'mlc-translate-toolbox\'"></a>\n        </div>\n        <div class="col-xs-8">\n          <select class="form-control" ng-model="$ctrl.version" ng-change="$ctrl.versionChanged()">\n            <option ng-repeat="version in $ctrl.translateService.history[$ctrl.group][$ctrl.key] track by $index" ng-value="$index">{{ $index }}</option>\n          </select>\n        </div>\n      </div>\n\n      <div class="row">\n        <div class="col-xs-4">\n          <label mlc-translate="\'Valeur\'" data-group="\'mlc-translate-toolbox\'"></label>\n        </div>\n        <div class="col-xs-8">\n          <textarea class="form-control" \n                    style="height: 145px;"\n                    ng-model="$ctrl.translateService.translations[$ctrl.group][$ctrl.key]"></textarea>\n        </div>\n      </div>\n      \n      <button class="btn btn-success"\n              ng-click="$ctrl.saveKey()"\n              mlc-translate="\'Sauvegarder\'" data-group="\'mlc-translate-toolbox\'"></button>\n    </div>\n    \n  </div>\n  \n</div>\n\n<div class="mlc-translate-toolbox-closed" ng-if="$ctrl.opened == false">\n  <a ng-click="$ctrl.openToolbox()">open</a>\n</div>\n');
}]);