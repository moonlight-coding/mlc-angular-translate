angular.module('MlcTranslateToolbox').service('mlcTranslateToolbox', function($rootScope) {
  
  this.opened = false;
  
  // will contain the count of each key, per group
  this.groups = {};
  // 
  this.removeKeysIfDestroy = true;
  this.removableKeyDescriptors = [];
  
  $rootScope.$on('translation.new', (event, keyDescriptor) => {
    // if the group doesn't exist, create it
    if(this.groups[keyDescriptor.group] == null) {
      this.groups[keyDescriptor.group] = {
        translations: {}
      };
    }

    // add the translation in the group
    if(this.groups[keyDescriptor.group].translations[keyDescriptor.key] == null) {
      this.groups[keyDescriptor.group].translations[keyDescriptor.key] = [];
    }
    
    // 
    keyDescriptor.paramKeys = (keyDescriptor.params == null) ? [] : Object.keys(keyDescriptor.params);
    // store the keyDescriptor
    this.groups[keyDescriptor.group].translations[keyDescriptor.key].push(keyDescriptor);
  });
  
  // function to remove a keyDescriptor
  let removeKey = (keyDescriptor) => {
    let container = this.groups[keyDescriptor.group].translations[keyDescriptor.key];
    container.splice(container.indexOf(keyDescriptor), 1);
    
    // if there is no more translation with that key, remove the key
    if(container.length == 0) {
      delete this.groups[keyDescriptor.group].translations[keyDescriptor.key];
    }
    
    // if there is no translation anymore in the group, remove the group
    if(Object.keys(this.groups[keyDescriptor.group].translations).length == 0) {
      delete this.groups[keyDescriptor.group];
    }
  };
  
  $rootScope.$on('translation.destroy', (event, keyDescriptor) => {
    // either we remove the keys
    if(this.removeKeysIfDestroy) {
      removeKey(keyDescriptor);
    }
    // either we mark them as 'removable'
    else {
      this.removableKeyDescriptors.push(keyDescriptor);
    }
    
  });
  
  this.setRemoveKeysIfDestroy = (removeKeysIfDestroy) => {
    // if removeKeysIfDestroy, then remove all the keys that should have been removed
    if(removeKeysIfDestroy) {
      for(let keyDescriptor of this.removableKeyDescriptors) {
        removeKey(keyDescriptor, keyDescriptor.index);
      }
      this.removableKeyDescriptors = [];
    }
    
    this.removeKeysIfDestroy = removeKeysIfDestroy;
  };
  
});