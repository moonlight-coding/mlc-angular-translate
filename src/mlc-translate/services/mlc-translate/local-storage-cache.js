/**
 * Access/Persist translations in localStorage
 */
class MlcTranslateLocalStorageCache
{
  constructor() {
  }
  
  buildKey(project, locale, group) {
    return `mlc-translate[${project}][${locale}][${group}]`;
  }
  
  getGroup(project, locale, group) {
    let g = localStorage.getItem(this.buildKey(project, locale, group));
    
    if(g) {
      return JSON.parse(g);
    }
    
    // not in cache
    return null;
  }
  
  setGroup(project, locale, group, content) {
    localStorage.setItem(this.buildKey(project, locale, group), JSON.stringify(content));
  }
}