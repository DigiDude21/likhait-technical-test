# syntax = docker/dockerfile:1

# Use Ruby 3.3.7
ARG RUBY_VERSION=3.3.7
FROM ruby:$RUBY_VERSION-slim

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential ca-certificates default-mysql-client default-libmysqlclient-dev git libyaml-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy application gems first
COPY Gemfile Gemfile.lock ./

# Configure bundler and install gems
RUN bundle config set --local deployment 'true' && \
    bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Fix Windows line endings in ALL files
RUN for f in $(find . -type f ! -path "*/vendor/*" ! -path "*/.git/*" ! -path "*/node_modules/*"); do sed -i 's/\r$//' "$f"; done

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh

# Start the server by default
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
