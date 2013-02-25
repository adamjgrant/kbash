// VARIABLES
// =========

var cursorSpot = 0,
  , commandArray = (typeof localStorage['commandArray'] == 'string') ? JSON.parse(localStorage['commandArray']) : ['help']
  , commandSpot = 0
  , mouseIn = false
  , kbash = new Object()

// LIBRARY FUNCTIONS
// =================

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// JQUERY DEPENDENT CODE
// =====================

      (function($)
      {
          jQuery.fn.putCursorAtEnd = function()
          {
          return this.each(function()
          {
              $(this).focus()

              // If this function exists...
              if (this.setSelectionRange)
              {
              // ... then use it
              // (Doesn't work in IE)

              // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
              var len = $(this).val().length * 2;
              this.setSelectionRange(len, len);
              }
              else
              {
              // ... otherwise replace the contents with itself
              // (Doesn't work in Google Chrome)
              $(this).val($(this).val());
              }

              // Scroll to the bottom, in case we're in a tall textarea
              // (Necessary for Firefox and Google Chrome)
              this.scrollTop = 999999;
          });
          };
      })(jQuery);

      // DOM CREATION
      // ============

      // Quick lookup of flags, args, and opts.
      Array.prototype.have = function (value) {
        return this.indexOf(value) > -1 ? true : false; 
      }

      $('body').append('<footer class="debug"></footer>');
      $('footer.debug')
        .append('<input>')
        .append('<nav class="console"></nav>')
        .append('<nav class="input"></nav>')
      $('nav.input')
        .append('&gt;&nbsp;<span class="input"></span>')
        .append('<span class="cursor"></span>')
      $('span.cursor').append('&#9617;')

      // VARIABLES (JQ DEPENDENT)
      // ========================

      var nav = $('footer.debug nav')
      , input = $('footer.debug input')
      , span = $('span.cursor')
      , mainConsole = $('nav.console')
      , fakeInput = $('span.input')

      // NAV -> INPUT CLICK DEFERMENT
      // ============================

      $(nav).click(function() {
        $(input).focus()
        $(span).html('&#9612;')
        $(mainConsole).fadeIn('fast')
      });
      $(input).on('blur', function() {
        $(span).html('&#9617;')
        if (!mouseIn) $(mainConsole).fadeOut('fast')
      })

      // Don't hide the console if we're trying to drag on it.
      $(mainConsole).hover(
        function() { mouseIn = true; },
        function() { mouseIn = false; }
      )

      // KEY-READING
      // ===========

      $(input).keyup(function(e) {
          setCursor(0)
          // Enter key
          if( e.keyCode == 13 ) {
            e.preventDefault();
            if ($(input).val().length > 0) {
              setCommandArray( $(input).val() )
              commandSpot = 0
            }
          }
      });
      $(input).keydown(function(e) {
        if (e.keyCode == 38) { // Up arrow
          // TODO: Set lower limit
          e.preventDefault();
          commandSpot--
          setInput()
        }
        if (e.keyCode == 40) { // Down arrow
          // TODO: Set upper limit
          e.preventDefault();
          commandSpot++
          setInput()
        }
        if (e.keyCode == 27) { // Escape
          e.preventDefault();
          $('a').focus();
        }
      });

      // GETTERS
      // =======

      function getCommandArray(index) {
        return commandArray[index] 
      }
      function getResponse(request) {

        var command = request.split(' ');

        // Determine if this is even valid before we do anything else.
        if (typeof kbash[(command[0])] == "function") {

          // Strip args and flags from main command as "params"
          var params = command.slice(1,command.length)

          // Create command tree.
          var commandTree = { 
            rootCommand: command[0]
            , args: []
            , flags: []
            , opts: []
            , props: { 
              empty: true 
            }
          }

          for ( var i = 0; i < params.length; i++ ) {
            if (params[i].substr(0,1) == "-") {
              // Remove opts ("--option") from params
              if (params[i].substr(0,2) == "--") { commandTree.opts.push(params[i].substring(2,params[i].length)) }
              // Remove flags ("-f") from params
              else { commandTree.flags = commandTree.flags.concat((params[i].substring(1,params[i].length)).split('')) }
              params.remove(i)
              i--
            }
          }

          // We assume everything left are arguments.
          commandTree.args = params;

          // Set some properties for quick access.
          if ( 
            commandTree.args.length > 0
            || commandTree.flags.length > 0
            || commandTree.opts.length > 0
          ) {
            commandTree.props.empty = false;
          }

          // Ready to send the flags and args to the root command
          kbash[commandTree.rootCommand](
            commandTree.args
            , commandTree.flags
            , commandTree.opts
            , commandTree.props
          ) 
        }

        // Invalid command
        else {
          console.kbash('-kbash: ' + request + ': command not found.') 
        }
      }

      // SETTERS
      // =======

      function setInput() {
        var newString = getCommandArray((commandArray.length + commandSpot))
        $(input).val(newString)
        setCursor()
        $('body').focus();
        $(input).putCursorAtEnd();
      }
      function setCommandArray(item) {
        commandArray = commandArray.concat(item)
        console.kbash('> ' + item)
        setRequest(item)
        $(input).val('')
        setCursor()
        localStorage.setItem('commandArray', JSON.stringify(commandArray))
      }
      console.kbash = function (string) {
         $(mainConsole).append('<p>' + string +'</p>').scrollTop($(mainConsole)[0].scrollHeight)
      }
      function setCursor(spot) {
        // Write in the nav
        spot = (spot || cursorSpot)  
        $(fakeInput).html($(input).val());
        // TODO: Allow the user to control cursor with arrow keys.
      }
      function setRequest(request) {
         // TODO: Parse for flags, commands, arguments and options.
         getResponse(request);
      }
      
      // COLORATION

      kbash.e = function(string) { return '<span class="red">' + string + '</span>' }
      kbash.s = function(string) { return '<span class="green">' + string + '</span>' }

      // USER HELP

      kbash.help = function(args, flags, opts, props) {
        var objs = Object.getOwnPropertyNames(kbash)
        console.kbash('<span class="white">AVAILABLE COMMANDS</span>')
        console.kbash('<span class="white">==================</span>')
        for (var i = 0; i < objs.length; i++ ) {
          console.kbash(objs[i])
        }
        console.kbash('&nbsp;')
        console.kbash('<span class="white">DEMO</span>')
        console.kbash('<span class="white">====</span>')
        msg = flags.have('v') ? 'try "say hello [-v] [--polite] [--rude]"' : 'Try "say hello" (or "help -v" for more options)'
        console.kbash(msg)
      }
      kbash.math = function(args, flags, opts, props) {
        for ( var i =0; i < args.length; i++ ) {
          try {
            if (args[i].match(/^[-*/+0-9]+$/)) { 
              console.kbash(args[i] + ' = <span class="white">' + parseFloat(eval(args[i])) + '</span>')
            }
            else { 
              console.kbash(kbash.e('ERROR') + ' Insecure string detected') 
              console.kbash('To prevent a script attack, this input will not be calculated.')
            }
          }
          catch(e) {
            console.kbash(kbash.e('ERROR') + ' Could not compute.')
            console.kbash('(' + e + ')');
          }
        }
      }

/*
When people see some things as beautiful,
other things become ugly.
When people see some things as good,
other things become bad.

Being and non-being create each other.
Difficult and easy support each other.
Long and short define each other.
High and low depend on each other.
Before and after follow each other.

Therefore the Master
acts without doing anything
and teaches without saying anything.
Things arise and she lets them come;
things disappear and she lets them go.
She has but doesn't possess,
acts but doesn't expect.
When her work is done, she forgets it.
That is why it lasts forever.
*/
