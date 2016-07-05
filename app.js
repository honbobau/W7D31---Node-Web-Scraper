// Create a program/module that runs inside terminal using node
// Module is designed to make HTTP GET requests to remote web pages and download their html
// Then use another module to parse the HTML and write the content we are interested in to a file on disk
// Should download into a CSV that has: File Permission | Absolute URL | File Type

'use strict';
// required modules
let request = require('request');
let cheerio = require('cheerio');
let csvWriter = require('csv-write-stream');
let fs = require('fs');

// setting url
let url = 'http://substack.net/images/';
let writer = csvWriter({headers: ['file_permission', 'absolute_url', 'file_type']});

// requesting the url using request
request(url, function(error, response, body) {
  // checking for errors
  if (error) {
    console.log(error);

  } else {
    // using cheerio to read and process the body 
    let $ = cheerio.load(body);
    let images = $('td a');
    let filePermission;
    let absoluteURL;
    let fileType;

    writer.pipe(fs.createWriteStream('images.csv'));
    // looping through each anchor tag
    images.each(function(i, element) {
      let anchorTag = $(this);
      // checks if the file permission ends with an image extension
      if (anchorTag.text().match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        filePermission = anchorTag.parent().parent().find('code').first().text();
        absoluteURL = 'substack.net' + anchorTag.attr('href');
        fileType = anchorTag.text().substr(anchorTag.length - 5);
        console.log(filePermission);

        writer.write([filePermission, absoluteURL, fileType]);
      }
    });
    writer.end();

  }
})