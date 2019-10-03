class MlcTranslateApiConnection extends MlcTranslateAbstractApiConnection
{
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
  };
  
  buildPostParams(locale, group, key, value) {
    return {
      "project": this.project,
      "locale": locale,
      "group": group,
      "key": key,
      "value": value
    };
  };
  
  /**
   * Get the required groups
   */
  getLocale(locale, groups = null, history = false) {
    let $http = this.$http;
    let project = this.project;
    
    return $http.post(this.buildURL('/query'), {
      project, locale, groups, history
    });
  };
  
  createTranslation(locale, group, key, value) {
    let $http = this.$http;
    let project = this.project;
    
    return $http.post(this.buildURL('/translations'), {
      project, locale, group, key, value
    });
  }
  
  removeTranslation(id) {
    let $http = this.$http;
    let project = this.project;
    
    return $http.delete(this.buildURL('/translations/' + id));
  }
}
