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
  
  this.setLocale = (locale) => {
    return this.apiConnection.getLocale(locale, this.groups, true).then((response) => {
      this.translations = response.data.translations;
      this.history = response.data.history;
      this.locale = locale;
    });
  };
  
  this.reload = () => {
    return this.setLocale(this.locale);
  };
  
});