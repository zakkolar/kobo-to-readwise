import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import convert from 'xml-js';
import moment from 'moment';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// if necessary, change this to the path to your Kobo device. Do not use a trailing slash.
const koboPath = '/Volumes/KOBOeReader';



// First, grab highlights from the sqlite DB
// This format is more annoying re: position in book, but more universal
const db = await open({
    filename: path.join(koboPath, '.kobo','KoboReader.sqlite'),
    driver: sqlite3.Database
})

const bookmarks = await db.all(`SELECT b.Text as highlight, b.startContainerPath, b.DateCreated as date, b.Annotation as note, book.Title as title, book.Attribution as author 
    FROM Bookmark b 
    INNER JOIN content book ON book.ContentID = b.VolumeID
    WHERE highlight IS NOT NULL
    ORDER BY title, date
    `);



function formatCsv(string){
    if(typeof string === 'string'){
        string = `"${string.replace(/"/g,'""')}"`;
    }

    return string;
}

function makeId(title, author){
    return `${title} ${author}`;
}

function formatDate(string){
    return moment(string).format('YYYY-MM-DD hh:MM:ss')
}

const dbEntries = [];

bookmarks.forEach(bookmark => {
    const row = [];
    row.push(formatCsv(bookmark.highlight));
    row.push(formatCsv(bookmark.title));
    row.push(formatCsv(bookmark.author));
    row.push(formatCsv(bookmark.note));
    row.push(formatCsv(formatDate(bookmark.date)));
    row.push('');
    dbEntries.push({
        bookId: makeId(bookmark.title, bookmark.author),
        row: row.join()
    })
    // output.push(row.join());
});

// now look for Digital Editions annotations
// not all books store annotations in this format,
// but those that do will be imported in the correct order

const getAllFiles = function(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, file))
        }
    })

    return arrayOfFiles
}

const annotationFiles = getAllFiles(path.join(koboPath, 'Digital Editions')).filter(file => path.extname(file) === '.annot');

const annotationFileBookIds = [];

const annotationFileEntries = [];

annotationFiles.forEach(annotationFile => {
    var xml = fs.readFileSync(path.resolve(annotationFile), 'utf8');

    var document = convert.xml2js(xml, {compact: true});

    const info = document.annotationSet.publication;



    const title = info['dc:title']._text;
    const author = info['dc:creator']._text;

    annotationFileBookIds.push(makeId(title, author));

    let annotations = document.annotationSet.annotation || [];

    if(!Array.isArray(annotations)){
        annotations = [annotations];
    }



    annotations.forEach(annotation => {
        const target = annotation.target.fragment;
        const content = annotation.content;
        const date = formatDate(annotation['dc:date']._text);
        const location = Math.round(parseFloat(target._attributes.progress) * 1000000000);
        const text = target.text ? target.text._text : "";
        const comment = content ? content.text._text: "";
        if(text){
            const row = [];
            row.push(formatCsv(text));
            row.push(formatCsv(title));
            row.push(formatCsv(author));
            row.push(formatCsv(comment));
            row.push(formatCsv(date));
            row.push(formatCsv(location));

            annotationFileEntries.push(row);
        }
    })
})




const filename = path.join(__dirname, 'output.csv');
const output = [];

output.push(['Highlight','Title','Author','Note','Date', 'Location'].join())

dbEntries.forEach(entry => {
    if(!annotationFileBookIds.includes(entry.bookId)){
        output.push(entry.row);
    }
})

annotationFileEntries.forEach(entry => {
    output.push(entry.join());
})



fs.writeFileSync(filename, output.join(os.EOL));