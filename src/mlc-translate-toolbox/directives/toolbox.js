angular.module('MlcTranslateToolbox').directive('mlcTranslateToolbox', function(mlcTranslate, mlcTranslateToolbox, $compile) {
  return {
    templateUrl: 'http://mlc-translate.local/directives/toolbox.html',
    controllerAs: '$ctrl',
    scope: {},
    controller: function($scope) {
      
      this.mlcTranslateToolbox = mlcTranslateToolbox;
      this.translateService = mlcTranslate;
      this.showTranslations = false;
      this.opened = true;
      
      this.group = null;
      this.key = null;
      this.version = null;
      
      
      // show / hide the mlc-translate directives
      let show_elt = angular.element("<style type='text/css'>[mlc-translate] { background-color: #dddddd; border:2px solid violet; }</style>");
      
      this.toggleShowTranslations = () => {
        
        if(!this.shown) {
          angular.element(document.querySelector("head")).append(show_elt);
        }
        else {
          show_elt.remove();
        }
        
        this.shown = !this.shown;  
      };
      
      this.groupChanged = () => {
        this.key = null;
        this.version = null;
      };
      
      this.keyChanged = () => {
        if(mlcTranslate.history[this.group] != null && 
           mlcTranslate.history[this.group][this.key] != null)
          this.version = (mlcTranslate.history[this.group][this.key].length - 1).toString();
        else {
          this.version = "0";
          if(!mlcTranslate.translations[this.group])
            mlcTranslate.translations[this.group] = {};
          mlcTranslate.translations[this.group][this.key] = this.key;
        }
      };
      
      this.versionChanged = () => {
        mlcTranslate.translations[this.group][this.key] = 
          mlcTranslate.history[this.group][this.key][this.version];
      };
      
      this.saveKey = () => {
        var group = this.group;
        var key = this.key;
        var value = mlcTranslate.translations[group][key];
        mlcTranslate.save_translation(group, key, value, () => {
          this.version = (mlcTranslate.history[this.group][this.key].length - 1).toString();
        });
      };
      
      this.removeVersion = () => {
        var group = this.group;
        var key = this.key;
        var version = this.version;
        
        mlcTranslate.removeVersion(group, key, version, () => {
          if(mlcTranslate.history[this.group] != null) {
            this.version = (mlcTranslate.history[this.group][this.key].length - 1).toString();
          }
          else {
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
      
      this.setLocale = function(locale) {
        mlcTranslate.setLocale(locale).then(() => {
          this.key_change();
        });
      };
      
      $scope.$watch('$ctrl.mlcTranslateToolbox.removeKeysIfDestroy', () => {
        this.removeKeysIfDestroy = this.mlcTranslateToolbox.removeKeysIfDestroy;
      });
    }
  };
});