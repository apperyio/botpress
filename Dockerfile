FROM ubuntu:18.04

ENV BRANCH develop

RUN apt-get update && apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8

# Install tools...
RUN apt-get update && apt-get install -y \
  git \
  curl \
  gnupg \
  mc

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
  && apt-get install -y nodejs

# Install Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends yarn

# To prevent caching git clone
ADD https://api.github.com/repos/apperyio/botpress/git/refs/heads/$BRANCH brach.json

# Clone Git repository
RUN git clone https://github.com/apperyio/botpress.git

WORKDIR /botpress

RUN git checkout $BRANCH

# Build botpress
RUN yarn
RUN yarn build

# Init botpress
RUN mkdir -p /botpress/out/bp/assets/ui-studio/public/ \
  && mkdir -p /botpress/out/bp/data/global/ \
  && cp -r /botpress/config/bots /botpress/out/bp/data/bots \
  && cp /botpress/config/style.css /botpress/out/bp/assets/ui-studio/public/style.css \
  && cp /botpress/config/chatbot.html /botpress/out/bp/assets/ui-studio/public/chatbot.html \
  && cp /botpress/config/workspaces.json /botpress/out/bp/data/global/workspaces.json \
  && cp /botpress/config/botpress.config.json /botpress/out/bp/data/global/botpress.config.json

VOLUME /botpress/out/bp/data

# Allow to execute start script
RUN chmod +x /botpress/start.sh

# Make port 3000 available to the world outside this container
EXPOSE 3000

ENTRYPOINT ["/botpress/start.sh"]
