gnome-terminal --tab -- bash -c "cd client && npm run dev"
gnome-terminal --tab -- bash -c "code . && npm start"

# Start Redis
# sudo docker compose up -d

# Stop Redis
# sudo docker compose down -v