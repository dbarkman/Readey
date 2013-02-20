$(document).ready(function() {

	//first set the org / app path (must be orgname / appname or org id / app id - can't mix names and uuids!!)
	var client = new Usergrid.Client({
		orgName:'reallysimpleapps',
		appName:'readey',
		logging: true, //optional - turn on logging, off by default
		buildCurl: true //optional - turn on curl commands, off by default
	});

	var appUser;

	$('#loginButton').bind('click', function() {
	    login();
	});
	$('#articlesButton').bind('click', function() {
		showArticles(appUser);
	});
	$('#articleCreateButton').bind('click', function() {
		newArticle();
	});
	$('#ticketCreateButton').bind('click', function() {
		newTicket();
	});
	$('#accountButton').bind('click', function() {
		showAccount();
	});
	$('#accountUpdateButton').bind('click', function() {
		updateAccount();
	});
	$('.logoutButton').bind('click', function() {
	    logout();
	});

	//login on enter press in password field
	$('#password').keypress(function(e) {
		if (e.which == 13) {
			login();
		}
	});


	/*******************************************************************
	* default actions for page load
	********************************************************************/
	//when the page loads, try to get the current user.  If a token is
	//stored and it is valid, then don't make them log in again
	client.getLoggedInUser(function(err, data, user) {
		if(err) {
			$('#placeHolderPage').hide();
			$('#articleListPage').hide();
			$('#accountPage').hide();
			$('#loginPage').show();
		} else {
			if (client.isLoggedIn()){
				appUser = user;
				showArticles(user);
			}
		}
	});

	/*******************************************************************
	* main program functions
	********************************************************************/

	/**
	*  function to log in the app user.  The API returns a token,
	*  which is stored in the client and used for all future
	*  calls.  We pass a username, password, and a callback function
	*  which is called when the api call returns (asynchronously).
	*
	*  Once the call is sucessful, we transition the user to the page
	*  that displays the list of messages.
	*
	*  @method login
	*  @return none
	*/
	function login() {
		$('#loginSectionError').html('');
		var username = $("#username").val();
		var password = $("#password").val();

		client.login(username, password,
			function (err) {
				if (err) {
					$('#loginSectionError').html('There was an error logging you in.');
				} else {
					//login succeeded
					if (client.isLoggedIn()) {
						client.getLoggedInUser(function(err, data, user) {
							if(err) {
								//you should do something with this error point. todo
							} else {
								appUser = user;

								$("#username").val('');
								$("#password").val('');

								//default to the full feed view (all messages in the system)
								showArticles(user);
							}
						});
					}
				}
			}
		);
	}

	/**
	*  function to log out the app user.
	*
	*  Once the call is sucessful, we transition the user to the login page
	*
	*  @method logout
	*  @return none
	*/
	function logout() {
		client.logout();
		window.location.reload()
	}

	/**
	*  a simple function to verify if the user is logged in
	*
	*  @method isLoggedIn
	*  @return {bool}
	*/
	function isLoggedIn() {
		if (!client.isLoggedIn()) {
			$('#placeHolderPage').hide();
			$('#articleListPage').hide();
			$('#accountPage').hide();
			$('#loginPage').show();
			return false;
		}
		return true
	}

	function showAccount() {
		$('#loginPage').hide();
		$('#placeHolderPage').hide();
		$('#articleListPage').hide();
		$('#accountPage').show();

		var email = appUser.get('email');

		$('#email').val(email);
		$('#oldPassword').val('');
		$('#newPassword').val('');
	}

	function updateAccount() {
	    $("#email").removeClass('error');
	    $("#oldPassword").removeClass('error');
		$("#newPassword").removeClass('error');
		$("#accountMessage").css('color', 'black');

	    var email = $("#email").val();
	    var oldpassword = '';
	    var newpassword = '';
	    if ($("#oldPassword").val() != '' && $("#newPassword").val() != '') {
	    	var oldpassword = $("#oldPassword").val();
	    	var newpassword = $("#newPassword").val();
	    }

//	    if (
//			(Usergrid.validation.validateEmail(email, function (){
//	        $("#email").focus();
//	        $("#email").addClass('error');
//			$("#accountMessage").css('color', 'red');
//			$('#accountMessage').html('Please correct the below errors.<br /><br />');})
//			) && (
//			(oldpassword == '') || Usergrid.validation.validatePassword(oldpassword, function (){
//				$("#oldPassword").focus();
//				$("#oldPassword").addClass('error');
//				$("#accountMessage").css('color', 'red');
//				$('#accountMessage').html('Please correct the below errors.<br /><br />');})
//			)  && (
//			(newpassword == '') || Usergrid.validation.validatePassword(newpassword, function (){
//				$("#newPassword").focus();
//				$("#newPassword").addClass('error');
//				$("#accountMessage").css('color', 'red');
//				$('#accountMessage').html('Please correct the below errors.<br /><br />');})
//			)
//		) {
			appUser.set({"name":email,"username":email,"email":email,"oldpassword":oldpassword, "newpassword":newpassword});
			appUser.save(
				function () {
					$('#accountMessage').html('Your account was updated.<br /><br />');
				},
				function () {
//					window.location = "#login";
					$('#accountMessage').html('There was an error updating your account.<br /><br />');
				}
			);
//		}
	}

	function showArticles(user) {
		if (!isLoggedIn()) {
			return;
		}

		//make sure we are on the articles page
		$('#loginPage').hide();
		$('#placeHolderPage').hide();
		$('#accountPage').hide();
		$('#articleListPage').show();

		var uuid = user.get('uuid');

		var options = {
			type:'articles',
			qs:{ql:'select * where user = ' + uuid + ' order by created desc', limit:'999'}
		}

		var articles;

		client.createCollection(options, function (err, articles) {
			if (err) {
				$('#myArticleList').html('Could not load articles.');
			} else {
				//first empty out all the current articles in the list
				$('#myArticleList').empty();
				//then hide the next / previous buttons
				$('#nextButton').hide();
				$('#previousButton').hide();
				//iterate through all the items in this "page" of data
				//make sure we reset the pointer so we start at the beginning
				count = 0;
				articles.resetEntityPointer();
				while(articles.hasNextEntity()) {
					//get a reference to the article
					var article = articles.getNextEntity();
					//display the article in the list
					$('#myArticleList').append('<li>'+ article.get('articleName') + '</li>');
					count++;
				}
				if (count == 0) $('#myArticleList').html('No articles yet. You should create one.');
				//if there is more data, display a "next" button
				if (articles.hasNextPage()) {
					//show the button
					$('#nextButton').show();
				}
				//if there are previous pages, show a "previous" button
				if (articles.hasPreviousPage()) {
					//show the button
					$('#previousButton').show();
				}
			}
		});
	}

	function newArticle() {

		var options = {
			type:'articles'
		}

		var articles;

		client.createCollection(options, function (err, articles) {
			if (err) {
				$('#myarticlelist').html('could not load articles');
			} else {
				//get the values from the form
				var name = $("#articleName").val();
				var source = $("#articleSource").val();
				var content = $("#articleContent").val();
				var username = appUser.get('username');
				var uuid = appUser.get('uuid');
				var timestamp = new Date().getTime();

				//create a new article and add it to the collection
				var options = {
					name:uuid + '--' + timestamp,
					articleName:name,
					source:source,
					content:content,
					user:uuid
				}

				//just pass the options to the addEntity method
				//to the collection and it is saved automatically
				articles.addEntity(options, function(err, article, data) {
					if (err) {
						//let the user know there was a problem
						alert('There was an error creating the article.');
						//enable the button so the form will be ready for next time
					} else {
						$('#articleMessage').html('New article created!<br /><br />');
						$('#articleName').val('');
						$('#articleSource').val('');
						$('#articleContent').val('');
						//then call the function to get the list again
						showArticles(appUser);
					}
				});
			}
		});
	}

	function newTicket() {

		var options = {
			type:'supporttickets'
		}

		var supporttickets;

		client.createCollection(options, function (err, supporttickets) {
			if (err) {
				$('#ticketMessage').html('Could not create ticket, this can also be done in the app.<br /><br />');
			} else {
				//get the values from the form
				var name = $("#ticketName").val();
				var email = $("#ticketEmail").val();
				var comment = $("#ticketComment").val();
				var timestamp = new Date().getTime();
				var timestampMilli = new Date().getMilliseconds();

				//create a new ticket and add it to the collection
				var options = {
					name:timestamp + "." + timestampMilli,
					usersName:name,
					email:email,
					commnet:comment
				}

				//just pass the options to the addEntity method
				//to the collection and it is saved automatically
				supporttickets.addEntity(options, function(err, ticket, data) {
					if (err) {
						//let the user know there was a problem
						alert('There was an error creating the ticket.');
						//enable the button so the form will be ready for next time
					} else {
						$('#ticketMessage').html('Ticket created!<br /><br />');
						$('#ticketName').val('');
						$('#ticketEmail').val('');
						$('#ticketComment').val('');
					}
				});
			}
		});
	}
});