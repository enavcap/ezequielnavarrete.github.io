# Classical Repertoire - CSV Management Guide

## ✅ CSV-Based System for GitHub Pages

Your website now reads works from `works.csv` - a file you can edit in Excel!

---

## 📝 How to Update Your Works

### Step 1: Edit in Excel

1. Open `works.csv` in Microsoft Excel or Google Sheets
2. Edit, add, or remove rows as needed
3. **Important:** Keep the first row (headers) unchanged
4. Save the file as CSV format

### Step 2: Upload to GitHub

```bash
# After saving your CSV file:
git add works.csv
git commit -m "Updated repertoire works"
git push
```

That's it! Your website updates automatically on GitHub Pages.

---

## 📋 CSV Columns Explained

| Column | Required | Example | Notes |
|--------|----------|---------|-------|
| title | ✅ Yes | "Symphony No. 1" | Work title |
| instrumentation | ✅ Yes | "String Quartet" | Ensemble type |
| duration | ✅ Yes | 8'30" | Use X'XX" format |
| category | ✅ Yes | compositions | "compositions" or "arrangements" |
| instrumentationType | ✅ Yes | Quartet | Section header (Solo Instrument, Duo, Quartet, etc.) |
| programNotes | ✅ Yes | "This piece explores..." | Description of the work |
| audioFile | ✅ Yes | audio/work1.mp3 | Path to audio file |
| pdfPreview | ✅ Yes | images/scores/work1.jpg | Path to score preview image |
| storeLink | ✅ Yes | https://store.com or # | Purchase link (use # if none) |
| premiereDate | ❌ Optional | March 15, 2023 | First performance date |
| premiereLocation | ❌ Optional | Carnegie Hall, New York | Premiere venue |
| ensemble | ❌ Optional | Boston Symphony | Performer/ensemble name |
| commissioner | ❌ Optional | Commissioned by XYZ | Who commissioned it |
| dedication | ❌ Optional | Dedicated to John Doe | Dedication text |
| awards | ❌ Optional | Winner of ABC Competition | Awards/recognition |

---

## 💡 Tips for Excel Editing

### Duration Format
- Use format: `8'30"` (minutes'seconds")
- Examples: `5'45"`, `12'00"`, `23'15"`

### Long Text (Program Notes)
- Just type normally in the cell
- Excel handles line breaks automatically
- If text has commas, Excel will quote it automatically

### Empty Optional Fields
- Just leave the cell empty
- Don't delete columns, just leave cells blank

### Instrumentation with Parentheses
- Use normal text: `String Quartet (2 Violins, Viola, Cello)`
- Excel handles special characters fine

### Adding a New Work
1. Copy an existing row
2. Paste it as a new row
3. Edit all the fields
4. Save

### Removing a Work
1. Select the entire row
2. Right-click → Delete
3. Save

---

## 🎯 Instrumentation Type Categories

Use these consistently for proper grouping:

- **Solo Instrument** - For single performer works
- **Duo** - For two performers
- **Trio** - For three performers
- **Quartet** - For four performers
- **Quintet** - For five performers
- **Sextet** - For six performers
- **Chamber Ensemble** - For mixed small groups
- **Wind Band** - For concert band
- **Orchestra** - For full orchestra
- **Choir** - For choral works

You can create custom categories too - they'll appear as headers automatically!

---

## 🚀 Quick Workflow

1. **Edit locally:**
   - Open `works.csv` in Excel
   - Make your changes
   - Save (keep as CSV format)

2. **Test locally (optional):**
   - Double-click `classical-repertoire.html`
   - Won't work directly - need GitHub Pages or local server
   - Skip to step 3 if you're confident

3. **Push to GitHub:**
   ```bash
   git add works.csv
   git commit -m "Updated works"
   git push
   ```

4. **Check your live site:**
   - Visit your GitHub Pages URL
   - Changes appear in ~30 seconds

---

## ⚠️ Common Issues

### Works not appearing?
- Check CSV is saved in UTF-8 encoding
- Verify no extra empty rows at the end
- Make sure first row (headers) is intact
- Check browser console (F12) for errors

### Special characters look wrong?
- Save CSV with UTF-8 encoding in Excel:
  - File → Save As → CSV UTF-8 (Comma delimited)

### Commas in text causing issues?
- Excel automatically handles this by adding quotes
- Don't worry about it!

### Duration format not working?
- Don't use smart quotes: use regular `'` and `"`
- Correct: `8'30"`
- Wrong: `8'30"` (curly quotes)

---

## 📁 File Structure

```
Website/
├── works.csv                    ← Edit this in Excel
├── works-csv-loader.js          ← Reads the CSV (don't edit)
├── classical-repertoire.html    ← Main page
├── classical-repertoire.css     ← Styling
├── audio/                       ← Your audio files
│   ├── composition1.mp3
│   └── ...
└── images/scores/              ← Your PDF previews
    ├── composition1-preview.jpg
    └── ...
```

---

## 🎨 Example CSV Row

```csv
Symphony No. 1,Full Orchestra,28'00",compositions,Orchestra,"A powerful symphonic work exploring themes of nature and humanity, commissioned for the centennial celebration.",audio/symphony1.mp3,images/scores/symphony1.jpg,https://store.com/symphony1,October 12 2022,"Symphony Hall Boston",Boston Symphony Orchestra,Commissioned by the Fromm Foundation,Dedicated to Leonard Bernstein,First Prize International Composers Competition 2022
```

---

## 🔄 Switching Back to JavaScript

If you want to switch back to the `.js` file:

1. Edit `classical-repertoire.html`
2. Change `<script src="works-csv-loader.js"></script>`
3. To `<script src="works-data.js"></script>`
4. Push to GitHub

Both systems work - use whichever you prefer!

---

## ✨ Benefits of CSV System

- ✅ Edit in familiar Excel interface
- ✅ Easy bulk editing
- ✅ Copy/paste from spreadsheets
- ✅ Sort and filter before saving
- ✅ Works perfectly with GitHub Pages
- ✅ No coding knowledge needed

Happy editing! 🎵
