package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/coder/websocket"
)

func main() {
	hub := NewHub()
	StartTickLoop(hub)

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
			InsecureSkipVerify: true,
		})
		if err != nil {
			log.Printf("Accept error: %v", err)
			return
		}
		defer conn.CloseNow()

		player := hub.AddPlayer(conn)
		defer hub.RemovePlayer(player.id)

		ctx := r.Context()

		// Writer goroutine: reads from send channel, writes to WebSocket
		go func() {
			for data := range player.send {
				if err := conn.Write(ctx, websocket.MessageText, data); err != nil {
					return
				}
			}
		}()

		// Reader loop: reads from WebSocket, dispatches to hub
		for {
			_, data, err := conn.Read(ctx)
			if err != nil {
				break
			}
			var msg ClientMessage
			if err := json.Unmarshal(data, &msg); err != nil {
				continue
			}
			hub.HandleMessage(player, msg)
		}

		close(player.send)
	})

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
