Webshell
========

Webshell helps developers to integrate APIs in their apps in a simple way. You send us some javascript via HTTP and we send you back some JSON with all APIs responses you've requested.

webshell.js
===========

This SDK javascript is the easiest way to use the Webshell API client side

Create an app on [webshell](http://webshell.io)
------------------------------

To use Webshell, you have to signup and create an app in your Dashboard which will generate a valid API Key.

Hello world app
---------------

This is the simplest app using Webshell

`````html
<!DOCTYPE HTML>
<html lang="en-US">
  <head>
    <meta charset="UTF-8">
    <title>Hello World!</title>
    <script type="text/javascript" src="http://code.jquery.com/jquery-1.8.2.min.js"></script>
    <script type="text/javascript" src="/path/to/webshell.js"></script>
    <script type="text/javascript">
$(document).ready(function() {
  //initialize the SDK with your API Key
  wsh.initialize('YOUR_APIKEY');

  //Execute a request to display a Google Maps
  wsh.exec({
    code: function() {
      var m = apis.google.maps({height: '100%'});
      m.center('paris');
      m.zoom(18);
    },
    process: function(json, meta) {
      $('body').append(meta.view);
    }
  })
})
    </script>
  </head>
  <body>
  </body>
</html>
`````

Pretty simple hm ?! You can call any other APIs on the platform in the same way. The javascript given in the `code` attribute of `wsh.exec()` is processed on our server and we retrieve all kind of data for you.

wsh Object
==========

Once the SDK loaded, you can use the `wsh` variable in your code.

wsh.initialize(apikey)
----------------------

Before to use the Webshell API, be sure you have executed this function to initialize the SDK with your APIKey.


wsh.exec(obj)
-------------

This method make a call to Webshell to execute the javascript given in the `code` function.

`````javascript
wsh.exec({
  code: function() {
    //some code which have be executed by Webshell
  },
  args: {
    //data to escape in `code`
  },
  process: function(data, meta) {
    //this method is executed for each view in the results
  },
  success: function(json) {
    //call after process all view with the final json response
  },
  complete: function(json) {
    //call when all HTML views and javascript are loaded and ready to be used
  }
})
`````

*code* can be a string of the javascript or a function with the javascript which have to be executed by Webshell inside.

You can try online your Webshell code in the [API Editor](http://webshell.io/editor) and include your script using fs object inside your webshell code (see [builtins/fs()](http://webshell.io/docs/builtins/v/fs))

Read more information about Webshell in the [documentation](http://webshell.io/docs)
