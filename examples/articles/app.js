/**
*  articles is a sample app  that is powered by Usergrid
*  This app shows how to use the Usergrid SDK to connect
*  to Usergrid, how to add entities, and how to page through
*  a result set of entities
*
*  Learn more at http://Usergrid.com/docs
*
*   Copyright 2012 Apigee Corporation
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

/**
*  @file app.js
*  @author Rod Simpson (rod@apigee.com)
*
*  This file contains the main program logic for Articles.
*/
$(document).ready(function () {
   //first set the org / app path (must be orgname / appname or org id / app id - can't mix names and uuids!!)
   var client = new Usergrid.Client({
    orgName:'reallysimpleapps',
    appName:'readey',
    logging: true, //optional - turn on logging, off by default
    buildCurl: true //optional - turn on curl commands, off by default
  });

  //make a new "articles" Collection
  var options = {
    type:'articles',
    qs:{ql:'order by created DESC'}
  }

  var articles;

  client.createCollection(options, function (err, articles) {
    if (err) {
      $('#myarticlelist').html('could not load articles');
    } else {

      //bind the next button to the proper method in the collection object
      $('#next-button').bind('click', function() {
        $('#message').html('');
        articles.getNextPage(function(err, data){
          if (err) {
            alert('could not get next page of articles');
          } else {
            drawArticles();
          }
        });
      });

      //bind the previous button to the proper method in the collection object
      $('#previous-button').bind('click', function() {
        $('#message').html('');
        articles.getPreviousPage(function(err, data){
          if (err) {
            alert('could not get previous page of articles');
          } else {
            drawArticles();
          }
        });
      });

      //bind the new button to show the "create new article" form
      $('#new-article-button').bind('click', function() {
         $('#articles-list').hide();
         $('#new-article').show();
      });

      //bind the create new article button
      $('#create-article').bind('click', function() {
        newarticle();
      });

      //bind the create new article button
      $('#cancel-create-article').bind('click', function() {
        $('#new-article').hide();
        $('#articles-list').show();
        drawArticles();
      });

      function drawArticles() {
        articles.fetch(function(err, data) {
          if(err) {
            alert('there was an error getting the articles');
          } else {
            //first empty out all the current articles in the list
            $('#myarticlelist').empty();
            //then hide the next / previous buttons
            $('#next-button').hide();
            $('#previous-button').hide();
            //iterate through all the items in this "page" of data
            //make sure we reset the pointer so we start at the beginning
            articles.resetEntityPointer();
            while(articles.hasNextEntity()) {
               //get a reference to the article
               var article = articles.getNextEntity();
               //display the article in the list
               $('#myarticlelist').append('<li>'+ article.get('name') + '</li>');
            }
            //if there is more data, display a "next" button
            if (articles.hasNextPage()) {
               //show the button
               $('#next-button').show();
            }
            //if there are previous pages, show a "previous" button
            if (articles.hasPreviousPage()) {
               //show the button
               $('#previous-button').show();
            }
          }
        });
      }

      function newarticle() {
        $('#create-article').addClass("disabled");
        //get the values from the form
        var name = $("#name").val();

        //make turn off all hints and errors
        $("#name-help").hide();
        $("#name-control").removeClass('error');

        //make sure the input was valid
        if (Usergrid.validation.validateName(name, function (){
          $("#name").focus();
          $("#name-help").show();
          $("#name-control").addClass('error');
          $("#name-help").html(Usergrid.validation.getNameAllowedChars());
          $('#create-article').removeClass("disabled");})
        ) {

          //all is well, so make the new article
          //create a new article and add it to the collection
          var options = {
            name:name
          }
          //just pass the options to the addEntity method
          //to the collection and it is saved automatically
          articles.addEntity(options, function(err, article, data) {
            if (err) {
              //let the user know there was a problem
              alert('Oops! There was an error creating the article.');
              //enable the button so the form will be ready for next time
              $('#create-article').removeClass("disabled");
            } else {
              $('#message').html('New article created!');
              //the save worked, so hide the new article form
              $('#new-article').hide();
              //then show the articles list
              $('#articles-list').show();
              //then call the function to get the list again
              drawArticles();
              //finally enable the button so the form will be ready for next time
              $('#create-article').removeClass("disabled");
            }
          });
        }
      }
      drawArticles();

    }
  });

});