import Const       from '../const'

export default {
    initLocalStrage: function(name, value) {
        if(localStorage.getItem(name) === null) {
            localStorage.setItem(name,value);
        }
    }
}

