angular.module('MlcTranslateToolbox').directive('mlcTranslateToolbox', function(mlcTranslate, mlcTranslateToolbox, $compile) {
  return {
    templateUrl: 'http://mlc-translate.local/directives/toolbox.html',
    controllerAs: '$ctrl',
    scope: {},
    controller: function($scope) {
      
      this.mlcTranslateToolbox = mlcTranslateToolbox;
      this.translateService = mlcTranslate;
      this.showTranslations = false;
      
      this.group = null;
      this.key = null;
      this.version = null;
      
      
      // show / hide the mlc-translate directives
      let show_elt = angular.element("<style type='text/css'>[mlc-translate] { background-color: #dddddd; border:2px solid violet; }</style>");
      
      this.toggleShowTranslations = () => {
        
        if(!this.showTranslations) {
          angular.element(document.querySelector("head")).append(show_elt);
        }
        else {
          show_elt.remove();
        }
        
        this.showTranslations = !this.showTranslations;  
      };
      
      this.groupChanged = () => {
        this.key = null;
        this.version = null;
      };
      
      this.keyChanged = () => {
        
        if(this.group == null || this.key == null)
          return;
        
        if(mlcTranslate.history[this.group] != null && 
           mlcTranslate.history[this.group][this.key] != null)
          this.version = mlcTranslate.history[this.group][this.key].length - 1;
        else {
          this.version = "0";
          if(!mlcTranslate.translations[this.group])
            mlcTranslate.translations[this.group] = {};
          mlcTranslate.translations[this.group][this.key] = this.key;
        }
      };
      
      this.versionChanged = () => {
        mlcTranslate.translations[this.group][this.key] = 
          mlcTranslate.history[this.group][this.key][this.version].value;
      };
      
      this.saveKey = () => {
        let locale = mlcTranslate.locale;
        let group = this.group;
        let key = this.key;
        let value = mlcTranslate.translations[group][key];
        
        mlcTranslate.apiConnection.createTranslation(locale, group, key, value)
          .then(() => {
            return mlcTranslate.reload();
          })
          .then(() => {
            this.version = mlcTranslate.history[this.group][this.key].length - 1;
          })
        ;
      };
      
      this.removeVersion = () => {
        var group = this.group;
        var key = this.key;
        var version = this.version;
        let versionId = mlcTranslate.history[this.group][this.key][this.version].id;
        
        mlcTranslate.apiConnection.removeTranslation(versionId)
          .then(() => {
            return mlcTranslate.reload();
          })
          .then(() => {
            if(mlcTranslate.history[this.group] != null) {
              this.version = mlcTranslate.history[this.group][this.key].length - 1;
            }
            else {
              this.version = null;
            }
          })
        ;
      };
      
      
      this.closeToolbox = () => {
        mlcTranslateToolbox.opened = false;
      };
      
      this.openToolbox = () => {
        mlcTranslateToolbox.opened = true;
      };
      
      this.setLocale = function(locale) {
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