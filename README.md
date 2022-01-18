# Kobo to Readwise

Extract highlights from Kobo devices and put them into a CSV for Readwise

## Installation

1. Clone or download this repo
2. Run `npm install`

## Usage
1. Connect your Kobo device
2. If necessary, change line 14 of `index.js` to the path of your device
3. Run `npm run extract`
4. Your highlights will be saved in `output.csv` in the same directory as the script

## Export notes
- For some books (seems to be non-DRM epubs, still experimenting with some formats), Kobo exports `.annot` files with annotations. These highlights will generally be exported in the order they appear in the book (highlights that are very close together may still be exported in the order they were created). These highlights also include a location number, which is calculated by multiplying the progress percentage they appear within the book (0-1) by 1000000000 (to account for many decimal places).   
- Highlights not in the `.annot` format (e.g. Kobo DRM ebooks) will be exported in the order they were created rather than the order they appear in the book. This is due to the format Kobo saves highlights, which makes it difficult to determine their relative order. These do not include a page/location number.
- All highlights will be exported every time, regardless of whether they've been exported before. Readwise will automatically detect duplicates and will not re-import them.

## Changelog
- 2021-01-17 - Import `.annot` files where possible to preserve order from book

## Todo
- [ ] specify input and output via command line arguments
- [ ] skip CSV and send highlights directly to Readwise via API
