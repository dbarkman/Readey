$(document).ready(function() {

	//first set the org / app path (must be orgname / appname or org id / app id - can't mix names and uuids!!)
	var client = new Usergrid.Client({
		orgName:'reallysimpleapps',
		appName:'useragents',
		logging: true, //optional - turn on logging, off by default
		buildCurl: true //optional - turn on curl commands, off by default
	});

	var appUser;

	$('#loginButton').bind('click', function() {
	    login();
	});
	$('#agentCreateButton').bind('click', function() {
		newAgent();
	});
	$('#logoutButton').bind('click', function() {
	    logout();
	});

	/*******************************************************************
	* default actions for page load
	********************************************************************/
	//when the page loads, try to get the current user.  If a token is
	//stored and it is valid, then don't make them log in again
	client.getLoggedInUser(function(err, data, user) {
		if(err) {
			$('#loginPage').show();
			$('#agentListPage').hide();
		} else {
			if (client.isLoggedIn()){
				appUser = user;
				showAgents();
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
							}
						});
					}

					$("#username").val('');
					$("#password").val('');

					//default to the full feed view (all messages in the system)
					showAgents();
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
			$('#loginPage').show();
			$('#agentListPage').hide();
			return false;
		}
		return true
	}

	function showAgents() {
		if (!isLoggedIn()) {
			console.log("not logged in, can't show agents")
			return;
		}

		//make sure we are on the agents page
		$('#loginPage').hide();
		$('#agentListPage').show();

		var options = {
			type:'agents',
			qs:{ql:'order by agent'}
		}

		var agents;

		client.createCollection(options, function (err, agents) {
			if (err) {
				$('#myAgentList').html('Could not load agents.');
			} else {
				//first empty out all the current agents in the list
				$('#myAgentList').empty();
				//then hide the next / previous buttons
				$('#nextButton').hide();
				$('#previousButton').hide();
				//iterate through all the items in this "page" of data
				//make sure we reset the pointer so we start at the beginning
				agents.resetEntityPointer();
				while(agents.hasNextEntity()) {
					//get a reference to the agent
					var agent = agents.getNextEntity();
					//display the agent in the list
					$('#myAgentList').append('<li>'+ agent.get('agent') + '</li>');
				}
				//if there is more data, display a "next" button
				if (agents.hasNextPage()) {
					//show the button
					$('#nextButton').show();
				}
				//if there are previous pages, show a "previous" button
				if (agents.hasPreviousPage()) {
					//show the button
					$('#previousButton').show();
				}
			}
		});
	}

	function newAgent() {

		var options = {
			type:'agents'
		}

		var agents;

		client.createCollection(options, function (err, agents) {
			if (err) {
				$('#myagentlist').html('could not load agents');
			} else {
				//get the values from the form
				var name = $("#name").val();
				var source = $("#source").val();
				var content = $("#content").val();

				//create a new agent and add it to the collection
				var options = {
					name:name,
					source:source,
					content:content,
					user:appUser.get('uuid')
				}

				//just pass the options to the addEntity method
				//to the collection and it is saved automatically
				agents.addEntity(options, function(err, agent, data) {
					if (err) {
						//let the user know there was a problem
						alert('Oops! There was an error creating the agent.');
						//enable the button so the form will be ready for next time
					} else {
						$('#message').html('New agent created!');
						//then call the function to get the list again
						showAgents();
					}
				});
			}
		});
	}
});