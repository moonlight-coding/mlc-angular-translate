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
  // groups to fetch, null means 'all groups'
  // If the groups are not specified, the cache will not be able to work..
  this.groups = null;
  // must the query load the history too ? to enable only if the toolbox is available
  this.queryHistory = false;
  
  // apiConnection must be an instance of MlcTranslateAbstractApiConnection
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
    
    // load the groups from the cache
    let groupTimestamps = null;
    
    // if the groups are specified
    if(this.groups != null) {
      groupTimestamps = [];
      
      for(let groupName of this.groups) {
        let group = cache.getGroup(this.project, groupName);
        
        if(group == null)
          groupTimestamps.push([groupName, null]);
        else {
          groupTimestamps.push([groupName, group.timestamp]);
          this.translations[groupName] = group.translations;
        }
      }
    }
    
    // query to the api, the cached groups which are not to update will not be sent.
    // the groups which have changed, are sent, even if empty
    return this.apiConnection.getLocale(locale, groupTimestamps, this.queryHistory).then((response) => {
      // store in the cache the updated groups
      for(let groupName in response.data.translations) {
        let group = response.data.translations[groupName];
        let timestamp = response.data.timestamps[groupName];
        
        cache.setGroup(this.project, groupName, {translations: group, timestamp: timestamp});
        this.translations[groupName] = group;
      }
      
      // history is not cached
      this.history = response.data.history;
      this.locale = locale;
    });
  };
  
  this.reload = () => {
    return this.setLocale(this.locale);
  };
  
});