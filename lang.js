"use strict"

/*!
 *  Lang.js from Laravel Localization
 *
 *  @version 1
 *  @author  Hermansyah <me@hermansyah.dev>
 */

class Lang {

    constructor() {
        if (localStorage.getItem("locale") == null) {
            localStorage.setItem("locale", "en")
        }

        this.locale = localStorage.getItem("locale")
        this.version = "v1"
        this.source = JSON.parse(localStorage.getItem("message." + this.locale))

        // only get localization data from current locale
        if (this.source == null) {
            const axios = require('axios')
            axios.get(`http://localhost:8000/api/v1/lang/${this.locale}`).then(response => {
                this.source = response.data.body.data
                localStorage.setItem("message." + this.locale, JSON.stringify(this.source))
            })
        } else {
            if (this.source.lang.version != this.version) {
                const axios = require('axios')
                axios.get(`http://localhost:8000/api/v1/lang/${this.locale}`).then(response => {
                    this.source = response.data.body.data
                    localStorage.setItem("message." + this.locale, this.source)
                })
            }
        }
    }

    numberKeys(key) {
        if (this.hasKey(key)) {
            return [...key].filter(l => l === '.').length
        }
        return -1
    }

    hasKey(key) {
        if (typeof this.source[key] === 'undefined') {
            if (!(typeof this.source[key.split('.')[0]] === 'undefined')) {
                return true
            }
            return false
        }

        return true
    }

    getMessage(key) {
        const numberKeys = this.numberKeys(key)
        if (numberKeys < 0) {
            return key
        } else if (numberKeys == 0) {
            let translation = this.source[key]
            return translation
        } else {
            let keys = key.split('.')
            let translation = ""
            for (let index = 0; index <= numberKeys; index++) {
                if (index == 0) {
                    translation = this.source[keys[index]]
                } else {
                    translation = translation[keys[index]]
                }
            }
            return translation
        }
    }

    replaceAttribute(translation, replace = {}) {
        if (translation != null) {
            for (var placeholder in replace) {
                translation = translation.replace(`:${placeholder}`, replace[placeholder])
            }
        }
        return translation
    }

    trans(key, replace = {}) {
        let translation = this.getMessage(key);
        return this.replaceAttribute(translation, replace);
    }

    getChoice(key, count) {
        let curlyBracket = /[^{\}]+(?=})/g;
        let bracket = /[^[\}]+(?=])/g;
        /**
         * Translation for curly bracket if for default value only. so there can't have plural count
         */
        if ((key.match(new RegExp("{*}", "g")) || []).length > 0) {
            extractParams = key.match(curlyBracket);
            if (extractParams[0] == count) {
                return key.split("} ")[1];
            }
        } else {
            extractParams = key.match(bracket);
            if ((extractParams[0].match(new RegExp(",", "g")) || []).length > 0) {
                //plural params
                let params = extractParams[0].split(",");
                //params could be number, string, or wildcard
                for (let index = 0; index < params.length; index++) {
                    let param = params[index]
                    if (param == "*") {
                        return key.split("] ")[1]
                    } else if (param == count) {
                        return key.split("] ")[1]
                    }
                }

            } else {
                if (extractParams[0] == count) {
                    return key.split("] ")[1]
                }
            }
        }
        return null;
    }

    choice(key, count, replace = {}) {
        let translation = this.getMessage(key);
        let message = translation.split('|');
        for (let index = 0; index < message.length; index++) {
            translation = this.getChoice(message[index], count)
            if (this.getChoice(message[index], count) != null) {
                break
            }
        }
        return this.replaceAttribute(translation, replace);
    }
}

export default Lang
