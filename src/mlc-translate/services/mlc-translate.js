angular.module('MlcTranslate').service('mlcTranslate', function($http, $rootScope, $interpolate, $timeout) {
  
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
  
  // if autoDetectGroups is enabled, the groups field will be updated dynamically 
  // each time a translation directive is instancied, if the group isn't present
  this.autoDetectGroups = false;
  this.autoDetectGroupsToLoad = [];
  this.canLaunchAutodetectRequest = true;
  
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
    
    if(group == null || key == null)
      return key;
    
    this.declareUsedGroup(group);
    
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
    if(key == null)
      return null;
    
    return $interpolate(this.search(group, key))(parameters);
  };
  
  this.setLocale = (locale) => {
    
    // if autodetect is enabled, don't start to fetch the groups directly
    if(this.autoDetectGroups && this.groups.length == 0) {
      this.locale = locale;
      return;
    }
    
    this.canLaunchAutodetectRequest = false;
    
    // load the groups from the cache
    let groupTimestamps = null;
    
    // if the groups are specified
    if(this.groups != null) {
      groupTimestamps = [];
      
      for(let groupName of this.groups) {
        let group = cache.getGroup(this.project, locale, groupName);
        
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
        
        cache.setGroup(this.project, locale, groupName, {translations: group, timestamp: timestamp});
        this.translations[groupName] = group;
      }
      
      // history is not cached
      this.history = response.data.history;
      this.locale = locale;
      
      this.canLaunchAutodetectRequest = true;
      this.launchAutoDetectRequestIfRequired();
    }).catch((error) => {
      
      console.error(error);
      
      this.canLaunchAutodetectRequest = true;
      this.launchAutoDetectRequestIfRequired();
    });
  };
  
  this.reload = () => {
    return this.setLocale(this.locale);
  };
  
  // declare 
  this.declareUsedGroup = (group) => {
    
    if(!this.autoDetectGroups)
      return;
    
    if(this.groups.indexOf(group) != -1)
      return;
    
    if(this.autoDetectGroupsToLoad.indexOf(group) != -1)
      return;
    
    this.autoDetectGroupsToLoad.push(group);
    
    // launch a request
    this.launchAutoDetectRequestIfRequired();
  };
  
  this.launchAutoDetectRequestIfRequired = () => {
    if(!this.canLaunchAutodetectRequest || this.autoDetectGroupsToLoad.length == 0) {
      return;
    }
    
    this.canLaunchAutodetectRequest = false;
    
    // will launch a request in 20ms to get several groups at once if possible
    $timeout(() => {
      if(this.groups === null)
        this.groups = [];
      
      this.groups = this.groups.concat(this.autoDetectGroupsToLoad);
      this.autoDetectGroupsToLoad = [];
      
      // when setLocale finishes, canLaunchAutodetectRequest is set to true
      this.reload();
    }, 20);
  };
  
});