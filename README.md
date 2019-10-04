# Mlc Angular Translate

A translation service which makes possible WYSIWYG edition of your translation.

There are 2 libraries:

- mlc-angular-translate.(min.)js : the translation service & the translation directive
- mlc-angular-translate-panel.(min.)js: adds support of the translation panel

## Demo

https://moonlight-coding.github.io/mlc-angularjs-translate/

## Installation

```
# install gulp globally
npm install -g gulp
# install the packages
npm install 
# build the library
gulp 
```

## How to Use

In your module definition, require `MlcTranslate` and `MlcTranslatePanel` if needed.

```
// if you wanna use the translations only
angular.module('MyApp', ['MlcTranslate']);

// if you wanna use the translation service
angular.module('MyApp', ['MlcTranslate', 'MlcTranslateToolbox']);
```

In the templates, use the `mlcTranslate` directive:

```
<span mlc-translate="keyExpression" data-group="groupExpression" data-params="paramsExpression"></span>
```

The attributes are:

- `mlcTranslate`: the key of the translation
- `group`: the group in which the key is stored
- `params`: the parameters which are available in the translation expression

Examples:

```
<span mlc-translate="'Hello'"></span>
<span mlc-translate="'Hello'" data-group="'login'"></span>
<span mlc-translate="'Hello {{ params.name }}'" data-group="'login'" data-params="{name: 'Ed'}"></span>
<span mlc-translate="'Hello {{ _.name }}'" data-group="'login'" data-params="{name: 'Ed'}"></span>
```

## Configure the service

You must define several abstract methods of the mlcTranslate service.

### Define raw translations

```
app.run(function(mlcTranslate) {
  
  mlcTranslate.translations = {
    'my-group': {
      'div': '<div style="border: 1px solid black">Test of div</div>'
    }
  };
});
```

### Connect to an instance of mlc-translate-server

You must have an instance of `mlc-translate-server` running (`http://localhost:3000` by default).

```
app.run(function(mlcTranslate, $http) {
  
  // define the apiConnection
  mlcTranslate.apiConnection = new MlcTranslateApiConnection($http, 'default', 'http://localhost:3000');
  
  // define the available locals
  mlcTranslate.availableLocals = ["en_GB", "fr_FR"];
  
  // set the default locale, translations will be fetched via the apiConnection
  mlcTranslate.setLocale("fr_FR");
});
```

