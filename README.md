# Mlc Angular Translate

A translation service which makes possible WYSIWYG edition of your translation.

There are 2 libraries:

- mlc-angular-translate.(min.)js : the translation service & the translation directive
- mlc-angular-translate-panel.(min.)js: adds support of the translation panel

## Demo

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
angular.module('MyApp', ['MlcTranslate', 'MlcTranslatePanel']);
```

## Configure the service

You must define several abstract methods of the mlcTranslate service.
