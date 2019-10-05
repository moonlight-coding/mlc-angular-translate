class MlcTranslateApiConnection extends MlcTranslateAbstractApiConnection
{
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
  };
  
  buildPostParams(locale, group, key, value) {
    return {
      "project": this.mlcTranslate.project,
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
    let project = this.mlcTranslate.project;
    
    return $http.post(this.buildURL('/query'), {
      project, locale, groups, history
    });
  };
  
  createTranslation(locale, group, key, value) {
    let $http = this.$http;
    let project = this.mlcTranslate.project;
    
    return $http.post(this.buildURL('/translations'), {
      project, locale, group, key, value
    });
  }
  
  removeTranslation(id) {
    let $http = this.$http;
    let project = this.mlcTranslate.project;
    
    return $http.delete(this.buildURL('/translations/' + id));
  }
}
