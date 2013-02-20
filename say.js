kbash.say = function(args, flags, opts, props) {
  if (props.empty == true) { console.kbash('Please supply an argument') }
  else {
    var msg = ''
    if (args.have('hello')) {
      msg = (flags.have('v') ? 'Hello, it is very good to see you this fine day' : 'Hi')
      if (opts.have('polite')) msg = msg + ('...good sir/madaam')
      if (opts.have('rude')) msg = msg + ('...you big dumb jerk')
    }
    else { msg = ('I don\'t know how to say that. Ask me to say "hello"') }
    console.kbash(msg)
  }
}