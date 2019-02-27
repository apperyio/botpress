FROM ubuntu:18.04

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

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Clone Git repository
RUN git clone https://github.com/apperyio/botpress.git

RUN mkdir -p /botpress/out/bp/data/bots \
  && cp -r /botpress/bots/emptychatbot /botpress/out/bp/data/bots/empty-bot

WORKDIR /botpress

CMD ["/bin/bash"]
