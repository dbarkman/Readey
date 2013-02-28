<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="refresh" content="300">
    <title>Readey Stats</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" href="../css/main.css" />
</head>
<body>

<div id="statsOuter" class="outerContainer">
    <div>
        <h1>Readey</h1>
    </div>
    <div>
        <h2>Stats</h2>
    </div>
    <div id="totalWordsRead">
		<?php
			require_once dirname(__FILE__) . '/../../ReadeyFramework/includes/includes.php';
			$readLog = new ReadLog;
			$totalWordsRead = $readLog->getTotalWordsRead();
			echo 'Total Words Read: ' . $totalWordsRead;
		?>
    </div>
</div>

</body>
</html>