#!/usr/bin/env python

import BaseHTTPServer
import mimetypes
import urlparse
import os
import sys
import json
import webbrowser
import uuid
import threading

PORT = 8999

MAP = {
    '': 'index.html',
    'flyingsquirrel-client.js': '../lib/flyingsquirrel-client.js',
    'flyingsquirrel-api.js': '../lib/flyingsquirrel-api.js',
}

uid = str(uuid.uuid4())

single_run = True

browser_timer = None
def start_browser():
    b = webbrowser.get()#'firefox')
    b.open("http://127.0.0.1:%s/?reload=true" % (PORT,), autoraise=False)


class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_POST(self):
        global browser_timer

        body = self.rfile.read(int(self.headers.get('Content-Length', '0')))
        self.send_response(201)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        result = json.loads(body)

        if got_result(result) and browser_timer:
            browser_timer.cancel()
            browser_timer = None

    def do_GET(self):
        path = self.path.strip('/').partition('?')[0]
        if path in MAP: path = MAP[path]
        if os.path.exists(path) and os.path.isfile(path):
            self.send_response(200)
            self.send_header("Content-type", 
                             (mimetypes.guess_type(path)[0] or 'text/plain') +
                             '; charset=utf-8')
            self.end_headers()
            self.wfile.write(open(path).read().replace("{{uid}}", uid))
        else:
            self.send_response(404)


def main_server():
    global browser_timer

    print "Running server on %s" % (PORT,)
    server = BaseHTTPServer.HTTPServer(('', PORT), MyHandler)

    browser_timer = threading.Timer(3.0, start_browser)
    browser_timer.start()

    try:
        server.serve_forever()
    except:
        pass

def got_result(result):
    if result['uid'] != uid:
        return
    if 'starting' in result and result['starting'] == True:
        return True

    print " [*] Agent: %s" % (result['agent'],)
    print " [*] Run %i tests in %.3f sec" % (
        result['total'], result['runtime'] / 1000.0, )
    print " [*] %i failed" % (result['failed'],)

    if single_run:
        os._exit(result['failed'])


if __name__ == '__main__':
    if len(sys.argv) == 1:
        print "Will not die automatically after first request."
        single_run = False
        main_server()
    else:
        single_run = True
        main_server()

