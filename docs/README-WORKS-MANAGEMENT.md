# Classical Repertoire - Works Management Guide

## Easy Method: Edit JavaScript File Directly

The simplest way to add, edit, or remove works is to edit the `works-data.js` file.

### How to Add a New Work:

1. Open `works-data.js` in any text editor
2. Find either the `compositions` or `arrangements` array
3. Add a new work entry following this format:

```javascript
{
    title: "Your Work Title",
    instrumentation: "Instrumentation details",
    duration: "X'XX\"",
    category: "compositions", // or "arrangements"
    instrumentationType: "Solo Instrument", // See options below
    programNotes: "Description of your work...",
    audioFile: "audio/yourfile.mp3",
    pdfPreview: "images/scores/yourfile-preview.jpg",
    storeLink: "https://your-store-link.com",
    // Optional fields (leave empty "" if not needed)
    premiereDate: "March 15, 2023",
    premiereLocation: "Carnegie Hall, New York",
    ensemble: "Performer or ensemble name",
    commissioner: "Commissioned by XYZ Foundation",
    dedication: "Dedicated to John Doe",
    awards: "Winner of ABC Competition"
}
```

### Instrumentation Type Options:
- Solo Instrument
- Duo
- Trio
- Quartet
- Quintet
- Wind Band
- Orchestra
- (Or create your own category)

### How to Edit a Work:

1. Open `works-data.js`
2. Find the work you want to edit
3. Change any field value
4. Save the file
5. Refresh your browser

### How to Remove a Work:

1. Open `works-data.js`
2. Find the work entry you want to remove
3. Delete the entire work object (including the comma if it's not the last item)
4. Save the file

---

## Advanced Method: Using CSV/Excel

If you prefer to manage your works in Excel:

### Step 1: Edit in Excel

1. Open `works-template.csv` in Excel or Google Sheets
2. Edit, add, or remove rows as needed
3. Save the file

### Step 2: Convert CSV to JavaScript

You can use an online tool or write a simple script to convert your CSV to the JavaScript format needed in `works-data.js`.

**CSV Columns:**
- Title
- Instrumentation
- Duration (format: X'XX")
- Category (compositions or arrangements)
- Instrumentation Type
- Program Notes
- Audio File (path relative to website root)
- PDF Preview (path relative to website root)
- Store Link (URL or # for placeholder)
- Premiere Date (optional)
- Premiere Location (optional)
- Ensemble (optional - performer/ensemble name)
- Commissioner (optional)
- Dedication (optional)
- Awards (optional)

### Step 3: Update works-data.js

Copy the converted data into the appropriate section of `works-data.js`.

---

## File Paths

When adding audio and PDF files:

**Audio Files:** Place in `audio/` folder
- Example: `audio/my-composition.mp3`

**PDF Preview Images:** Place in `images/scores/` folder
- Example: `images/scores/my-composition-preview.jpg`

---

## Tips

1. **Duration Format:** Use single quotes for minutes and double quotes for seconds (e.g., `8'30"`)
2. **Program Notes:** Can be multiple paragraphs - just use regular text
3. **Store Link:** Use `#` as placeholder if you don't have a store link yet
4. **Instrumentation Type:** This determines the section header - keep it consistent for grouping
5. **Order:** Works appear in the order they're listed in the JavaScript file
6. **Optional Fields:** Leave as empty string `""` if you don't need them - they won't display
7. **Premiere Info:** You can include just the date, just the location, or both
8. **Awards:** Will display with a trophy emoji 🏆 for visual emphasis

---

## Testing

After making changes:

1. Save `works-data.js`
2. Open `classical-repertoire.html` in your browser
3. Click on "Original Compositions" or "Arrangements"
4. Verify your works appear correctly
5. Test the accordion (click to expand/collapse)

---

## Troubleshooting

**Works not appearing?**
- Check browser console for errors (F12)
- Verify JavaScript syntax (commas, quotes, brackets)
- Make sure `works-data.js` is in the same folder as `classical-repertoire.html`

**Images not loading?**
- Check file paths are correct
- Verify files exist in specified folders
- Check file extensions match (.jpg, .png, etc.)

**Audio not playing?**
- Verify audio file format (MP3 recommended)
- Check file path is correct
- Test audio file in browser directly
