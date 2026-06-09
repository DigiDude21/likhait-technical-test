#!/bin/sh
rm -f /rails/tmp/pids/server.pid
exec ruby -rbundler/setup -e "load 'bin/rails'" server -b 0.0.0.0
