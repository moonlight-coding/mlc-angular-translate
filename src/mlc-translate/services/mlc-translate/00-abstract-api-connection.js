class MlcTranslateAbstractApiConnection
{
  async getLocale(locale, groups = null, history = false) {
    throw new Error("getLocale() to implement");
  }
}
