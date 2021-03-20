let parser = new DOMParser();
// doc = parser.parseFromString(odt, "application/xml");

let first = true;

// on cherche s'il y a un fichier teacher sinon on prend le premier comme base ?
// correction calcul score ?

let headers = {
    ids: [],
    names: []
}

let datas = [];

let ignores = {
    'radio': {
        'formx:group-name': [],
        'form:name': []
    }
};

/**
 * 
 * @param {string} odt content.xml
 * @param {string} filename 
 */
function handleOdt(odt, filename) {
    doc = parser.parseFromString(odt, "application/xml");

    if (first) {
        handleFirst();
    }

    first = false;

    let data = [filename];

    headers.ids.forEach(function (id) {
        let el = doc.querySelector('form>*[*|id="' + id + '"]'); // get the input in form part
        if (el && Forms[el.tagName]) {
            data.push(Forms[el.tagName].getValue(el));
        }
    });
    datas.push(data);
}

function handleFirst() {
    let inputs = doc.getElementsByTagName('draw:control'); // get inputs in the text part
    Array.from(inputs).forEach(function (e) {
        let id = e.getAttribute('draw:control');
        let el = id.indexOf('"') === -1 && doc.querySelector('form>*[*|id="' + id + '"]'); // get the input in form part
        if (el && Forms[el.tagName] && !Forms[el.tagName].ignore(el)) {
            headers.ids.push(id);
            headers.names.push(Forms[el.tagName].getName(el));
        }
    });
}

function exportToCsv() {
    let e = datas;
    let n = headers.names.slice(); // create a copy
    n.unshift('Filename') // add "Filename" add the start of headers
    e.unshift(n); // put headers at the start of data needing export
    // log(CSV.serialize(e));
    downloadText('export.csv', CSV.serialize(e))
}

function downloadText(filename, txt) {
    // Lance le téléchargement d'un fichier texte
    let el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
    el.setAttribute('download', filename);

    el.style.display = 'none';
    document.body.appendChild(el);

    el.click();

    document.body.removeChild(el);
}

async function handleFiles(files) {
    let teacherIndex = files.findIndex(x => x.name === '_teacher.odt');

    if (teacherIndex !== -1) {
        files.unshift(files.splice(teacherIndex, 1)[0]);
    }

    for (var i = 0; i < files.length; i++) {
        if (files[i].type === 'application/vnd.oasis.opendocument.text' || files[i].name.substr(-4) == '.odt') {
            let zip = await JSZip.loadAsync(files[i]);
            let odt = await zip.file('content.xml').async('string');
            handleOdt(odt, files[i].name);
        } else if (files[i].type === 'application/x-zip-compressed') {
            let zip = await JSZip.loadAsync(files[i]);
            for (let [name, file] of Object.entries(zip.files)) { // Loop throught each files of the zip
                let blobFile = await file.async('blob');
                files.push(new File([blobFile], name));
            }
        }
    }
}

function log(text) {
    let p = document.createElement('pre');
    p.textContent = text;
    document.body.appendChild(p);
}

document.addEventListener('drop', async function (e) {
    e.preventDefault();

    document.body.classList.remove('hover');

    let files = Array.from(e.dataTransfer.files); // required because it will be lost during async

    await handleFiles(files);

    let n = datas.length;

    if (n) {
        document.querySelector('.status button').classList.remove('disabled');
        document.querySelector('.status button .imported').textContent = n > 1 ? '(' + n + ' fichiers importés)' : '(' + n + ' fichier importé)';
    }

});

document.addEventListener('DOMContentLoaded', function (event) {
    document.querySelector('.status button').addEventListener('click', function (e) {
        if (datas.length) {
            exportToCsv();
        }
    });
});

document.addEventListener('dragover', function (e) {
    e.preventDefault();
});


document.addEventListener('dragenter', function (e) {
    document.body.classList.add('hover');
});

document.addEventListener('dragend', function (e) {
    document.body.classList.remove('hover');
});

document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('dragleave', function (e) {
        document.body.classList.remove('hover');
    });
});