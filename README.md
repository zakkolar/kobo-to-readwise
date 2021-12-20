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
- For each book, highlights will be exported in the order they were created rather than the order they appear in the book. This is due to the format Kobo saves highlights, which makes it difficult to determine their relative order.
- All highlights will be exported every time, regardless of whether they've been exported before. Readwise will automatically detect duplicates and will not re-import them.

## Todo
- [ ] specify input and output via command line arguments
- [ ] skip CSV and send highlights directly to Readwise via API
