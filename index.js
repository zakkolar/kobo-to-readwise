import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const db = await open({
    filename: '/Volumes/KOBOeReader/.kobo/KoboReader.sqlite',
    driver: sqlite3.Database
})

// const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
//
// console.log(tables);
//
// const content = await db.all("SELECT * FROM content WHERE Title LIKE '%Permanent%'");
// console.log(content);

// const bookmarks = await db.all("SELECT * FROM Bookmark");

const bookmarks = await db.all(`SELECT b.Text as highlight, b.startContainerPath, b.DateCreated as date, b.Annotation as note, book.Title as title, book.Attribution as author 
    FROM Bookmark b 
    INNER JOIN content book ON book.ContentID = b.VolumeID
    WHERE highlight IS NOT NULL
    ORDER BY title, date
    `);

const filename = path.join(__dirname, 'output.csv');
const output = [];

output.push(['Highlight','Title','Author','Note','Date'].join())

function formatCsv(string){
    if(typeof string === 'string'){
        string = `"${string.replace(/"/g,'""')}"`;
    }

    return string;
}

bookmarks.forEach(bookmark => {
    const row = [];
    row.push(formatCsv(bookmark.highlight));
    row.push(formatCsv(bookmark.title));
    row.push(formatCsv(bookmark.author));
    row.push(formatCsv(bookmark.note));
    row.push(formatCsv(bookmark.date));
    output.push(row.join());
});

fs.writeFileSync(filename, output.join(os.EOL));