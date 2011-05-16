
.PHONY: all
all: jslint test

.PHONY: test
test:
	(cd test; ./runner.py single_run;)

.PHONY: run
run:
	(cd test; ./runner.py;)


.PHONY: jslint
jslint: jslint.js
	./jslint-check.js lib/flyingsquirrel-api.js lib/flyingsquirrel-client.js

jslint.js:
	wget --no-check-certificate https://github.com/douglascrockford/JSLint/raw/b38a8d9db9ead37fa812/jslint.js
