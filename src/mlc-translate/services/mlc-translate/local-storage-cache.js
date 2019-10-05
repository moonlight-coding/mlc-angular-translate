/**
 * Access/Persist translations in localStorage
 */
class MlcTranslateLocalStorageCache
{
  constructor() {
  }
  
  buildKey(project, group) {
    return `mlc-translate[${project}][${group}]`;
  }
  
  getGroup(project, group) {
    let g = localStorage.getItem(this.buildKey(project, group));
    
    if(g) {
      return JSON.parse(g);
    }
    
    // not in cache
    return null;
  }
  
  setGroup(project, group, content) {
    localStorage.setItem(this.buildKey(project, group), JSON.stringify(content));
  }
}