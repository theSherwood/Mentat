// Moves and renames demowiki.html

var fs = require('fs')

var oldPath = './editions/release/output/demowiki.html'
var newPath = './index.html'

fs.rename(oldPath, newPath, function (err) {
  if (err) throw err
  console.log('Successfully renamed - AKA moved!')
})