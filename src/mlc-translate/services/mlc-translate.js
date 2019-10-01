angular.module('MlcTranslate').service('mlcTranslate', function($http, $rootScope, $interpolate) {
  
  /**************************************************
   * Inputs and overridable variables of the service
   **************************************************/
   
  // the locale that is requested
  this.locale = "en_GB";
  // the available locals
  this.availableLocals = ["en_GB"];
  // the translations keys which are available
  this.translations = {};
  // the history of the translation keys, to use with the translation-panel only, not in prod
  this.history = {};
  // project makes possible to separate the translation keys from your public website and admin
  this.project = "project_1"; 
  
  this.getUrl = (locale) => {
    return "/api/translations?locale=" + locale + "&project=" + this.project + "&history=1";
  };
  this.postUrl = () => {
    return "/api/translation";
  };
  this.postRemoveUrl = () => {
    return "/api/translations/version/remove";
  };
  this.postUrlParams = (locale, group, key, value) => {
    return {
      "project": this.project,
      "locale": locale,
      "group": group,
      "key": key,
      "value": value
    };
  };
  
  /**
   * Fetch the translation for the specified locale
   */
  this.setLocale = (locale) => {
    return $http.get(this.getUrl(locale)).then(function(response) {
      service.translations = response.data.keys;
      service.history = response.data.history;
      service.locale = locale;
      return response.data;
    });
  };
  
  /**************************
   * service implementation
   **************************/
  
  /**
   * Get the translation expression of the desired key
   * If the translation is not found, returns the key
   */
  this.search = (group, key) => {

    if(group in this.translations) {
      if(key in this.translations[group]) {
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
  
});