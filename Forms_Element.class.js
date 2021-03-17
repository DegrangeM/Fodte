class Form_Element {
    /**
     * Return the name of the input
     * @param {HTMLElement} e 
     * @returns {String}
     */
    static getName(e) {
        return e.getAttribute('form:name');
    }
    /**
     * Return the value of an input
     * @param {HTMLElement} e 
     * @returns {String}
     */
    static getValue(e) {
        return undefined;
    }
    static getId(e) {
        return e.getAttribute('form:id');
    }
    static ignore(e) {
        return false;
    }
}

Forms = {
    "form:text": class extends Form_Element {
        static getValue(e) {
            return e.getAttribute('form:current-value') || '';
        }
    },
    "form:checkbox": class extends Form_Element {
        static getName(e) {
            return e.getAttribute('form:label') || e.getAttribute('form:name');
        }
        static getValue(e) {
            return e.getAttribute('form:current-state') == 'checked' ? e.getAttribute('form:value') || '[x]' : e.getAttribute('form:current-state') == 'unknow' ? '[?]' : '[_]';
        }
    },
    "form:radio": class extends Form_Element {
        static getValue(e) {
            // Autre méthode : doc.querySelectorAll('radio[*|group-name="toto"][*|current-selected]');
            const attribute = e.getAttribute('formx:group-name') ? 'formx:group-name' : 'form:name';

            return Array.from(e.parentNode.getElementsByTagName('form:radio'))
                .filter(x => x.getAttribute(attribute) == e.getAttribute(attribute) && x.getAttribute('form:current-selected') == 'true')
                .map(x => x.getAttribute('form:value') || x.getAttribute('form:label'))
                .join(',');
        }
        static ignore(e) {
            const attribute = e.getAttribute('formx:group-name') ? 'formx:group-name' : 'form:name';

            return headers.ids.map(x => e.getRootNode().getElementById(x)).filter(x => x && e.parentNode.contains(x) && x.getAttribute(attribute) == e.getAttribute(attribute)).length > 0;
        }
    },
    "form:listbox": class extends Form_Element {
        static getValue(e) {
            // Autre méthode : Array.prototype.map.call(document.getElementsByTagName('div'), x=>x.innerHTML)
            return Array.from(e.getElementsByTagName('form:option'))
                .filter(x => x.getAttribute('form:current-selected') == 'true')
                .map(x => x.getAttribute('form:value') || x.getAttribute('form:label'))
                .join(';');
        }
    },

}