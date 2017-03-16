//inject the twitterService into the controller

app.controller('TwitterController', function($scope,$q, $http,$window, twitterService, spinnerService) {

    $scope.tweets=[]; //array of tweets
	$scope.sentiResult = [];
    twitterService.initialize();
    $scope.showchart=false;
	var myLine;
	
	$scope.searchTwitter = function(hashtag) {
        this.showchart=false;
        $scope.loading = true;
        $scope.hashtag=hashtag;
        twitterService.getSearchResults(hashtag).then(function(data) {
			$scope.twitterSearchResult = data;
			data = data.statuses;
            //$scope.tweets = $scope.tweets.concat(data);
			$scope.tweets = data;
            console.log($scope.tweets);
			localStorage.setItem("counter", 0);
            $scope.twitterSentiment();
        },function(){
            $scope.rateLimitError = true;
        });
	}
	
	$scope.twitterSentiment = function() {

		var resultObject = {};
		resultObject.tweet = "";
		resultObject.senti = "";
		resultObject.userName = "";
		resultObject.userLocation ="";
		var config = {
            headers : {'X-Mashape-Authorization' : 'xA44CDJwt1mshfrJ1cRwBxU5AVYCp1T2oFojsnmd0sMU8AYhOg', 
					   'Content-Type': 'application/json'}	
		}
		
		//for (var i = 0; i < $scope.twitterSearchResult.search_metadata.count; i++)	{
			if (parseInt(localStorage.getItem("counter")) < $scope.tweets.length) {
						
				var data = $.param({
					text: $scope.tweets[parseInt(localStorage.getItem("counter"))].text
				});
				resultObject.tweet = $scope.tweets[parseInt(localStorage.getItem("counter"))].text;
				$http.post('https://japerk-text-processing.p.mashape.com/sentiment/',
							data, 
							config).then(
					function (data, status, headers, config) {							
						resultObject.senti = data.data.label;						
						//console.log((data));
						console.log(resultObject);
						if (parseInt(localStorage.getItem("counter")) < $scope.tweets.length) {
							$scope.sentiResult[parseInt(localStorage.getItem("counter"))] = resultObject;
							//$scope.getCountry($scope.tweets[parseInt(localStorage.getItem("counter"))].user.location);
							localStorage.setItem("counter", parseInt(localStorage.getItem("counter")) +1 );
							$scope.twitterSentiment();
						} 
					},function (data, status, header, config) {
							alert("something is gone terrible wrong");
					});	
			
			}else if (parseInt(localStorage.getItem("counter")) == $scope.tweets.length){
				$scope.chartDesign();
			}		
    }
	
	
	
	$scope.chartDesign = function () {
		var data = {};
		this.showchart=true;
		data.labels = [];
		data.datasets = [];
		data.datasets[0] = {}
		data.datasets[0].data = [];
				
		var counter = 0;
		for (var i = 0; i < $scope.tweets.length; i++)	{
			if (data.labels.indexOf($scope.sentiResult[i].senti)==-1) {
				data.labels.push($scope.sentiResult[i].senti);
				data.datasets[0].data.push(1);
			} else {
				data.datasets[0].data[data.labels.indexOf($scope.sentiResult[i].senti)] +=1;
			}		
		}
		
		console.log (data);	
		
		
		var data1 = {
			labels: data.labels,
			datasets: [
				{
					label: "Bar chart for senti analysis:   "+$scope.hashtag,
					fill: false,
					lineTension: 0.1,
					backgroundColor: "rgba(75,192,192,0.4)",
					borderColor: "rgba(75,192,192,1)",
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(75,192,192,1)",
					pointBackgroundColor: "#fff",
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(75,192,192,1)",
					pointHoverBorderColor: "rgba(220,220,220,1)",
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 10,
					data: data.datasets[0].data,
					spanGaps: false,
				}
			]
		};
		var options = {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
						}
					}],
					 xAxes: [{
            barPercentage: 0.4
        }]
			}
		};
		if(myLine != null)  {
			myLine.destroy();
		}
		myLine = new Chart(document.getElementById("canvas").getContext("2d"), {type:'bar', data:data1, options});
		$scope.loading = false;
	}

    //when the user clicks the connect twitter button, the popup authorization window opens
    $scope.connectButton = function() {
      
        twitterService.connectTwitter().then(function() {
            if (twitterService.isReady()) {
            	$scope.connectedTwitter = true;
            	if($scope.connectedTwitter == true)
            	{
            		 $window.location.href = 'search.html';
            	}
                //if the authorization is successful, hide the connect button and display the tweets
                
            } else {

			         }
        });
    }

    //sign out clears the OAuth cache, the user will have to reauthenticate when returning
    $scope.signOut = function() {
        twitterService.clearCache();
        $scope.tweets.length = 0;
        $('#getTimelineButton, #getSearchTwitterButton, #getTwitterSentimentButton, #signOut').fadeOut(function(){
            $('#connectButton').fadeIn();
			$scope.$apply(function(){$scope.connectedTwitter=false})
        });
        $scope.rateLimitError = false;    
    }

    //if the user is a returning user, hide the sign in button and display the tweets
    if (twitterService.isReady()) {
        $('#connectButton').hide();
        $('#getTimelineButton, #getSearchTwitterButton, #getTwitterSentimentButton, #signOut').show();
    	$scope.connectedTwitter = true;
    }

});
