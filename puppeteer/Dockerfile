FROM node:20-slim

RUN apt-get update && apt-get install -y bash libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  fonts-liberation \
  libappindicator3-1 \
  libatk-bridge2.0-0 \
  xdg-utils \
  wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./files/package*.json /app/.

RUN npm install

CMD ["npm", "run", "dev", "--", "--host"]