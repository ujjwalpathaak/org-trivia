#!/bin/bash

gnome-terminal --tab -- bash -c "cd client && npm run dev"
gnome-terminal --tab -- bash -c "npm start"
gnome-terminal --tab -- bash -c "mongosh"
gnome-terminal --tab -- bash -c "ngrok http http://localhost:8080"