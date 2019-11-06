/**
 * If the translations are available in local, you can integrate them in the application
 */
class MlcTranslateLocalConnection extends MlcTranslateAbstractApiConnection
{
  constructor(translationsPerLocale) {
    super();
    
    this.translationsPerLocale = translationsPerLocale;
  }
  
  /**
   * Get the required groups
   */
  getLocale(locale, groups = null, history = false) {
    return Promise.resolve(this.translationsPerLocale[locale]);
  };
  
  createTranslation(locale, group, key, value) {
    throw new Error("Cannot create translation with MlcTranslateLocalConnection");
  }
  
  removeTranslation(id) {
    throw new Error("Cannot remove translation with MlcTranslateLocalConnection");
  }
}
