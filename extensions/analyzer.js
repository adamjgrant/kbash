kbash.ls = function(args, flags, opts, props) {
  var msg 
  if (args.length == 0) { console.kbash = "Error: No arguments found."; }
  else {
    for (var i = 0; i < args.length; i++ ) {
      if (opts.have('oneline')) {
        for(var j = 0; j < $(args[i]).length; j++) {
          console.kbash('Instance ' + j + ': ' + $(args[i])[j])
        }
      }
      else {
        msg = flags.have('l') ? ($(args[i])).length + ' instances found' : $(args[i])
        console.kbash(msg) 
      }
    }
  }
}
