#!/bin/sh

# Start multiple servers
yarn dev::main &  # Start the first server in the background
yarn dev::socket &  # Start the second server in the background
yarn dev::upload    # Start the third server (do not background the last command)
