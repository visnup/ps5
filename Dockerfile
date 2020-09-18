FROM node:12-buster-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends apt-transport-https ca-certificates curl gnupg \
  && curl https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && apt-get purge --auto-remove -y apt-transport-https ca-certificates curl gnupg \
  && sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
  && apt-get update \
  && apt-get install -y --no-install-recommends google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app

# Add user so we don't need --no-sandbox.
# RUN groupadd -r puppeteer && useradd -r -g puppeteer -G audio,video puppeteer \
#   && mkdir -p /home/puppeteer/Downloads \
#   && chown -R puppeteer:puppeteer /home/puppeteer \
#   && chown -R puppeteer:puppeteer /app

# Run everything after as non-privileged user.
# USER puppeteer

COPY package.json package-lock.json /app/
RUN npm install --production

COPY . /app/
CMD node index.js
