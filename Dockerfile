FROM node:18-slim

WORKDIR /usr/app/rhythmchat

# ARG INSTALL_FFMPEG=false

# # # Conditional check
# # RUN if [ "$INSTALL_FFMPEG" = "true" ]; then \
# #     echo "Installing FFmpeg..."; \
# #     apt-get update && \
# #     apt-get install -y ffmpeg && \
# #     rm -rf /var/lib/apt/lists/*; \
# # fi

COPY package.json yarn.lock .

RUN yarn

COPY . .

EXPOSE 4050 4051 4052

CMD ["./start.sh"]

