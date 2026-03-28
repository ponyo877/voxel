package main

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"sync/atomic"

	"github.com/coder/websocket"
)

var playerCounter atomic.Int64

type Player struct {
	id   string
	conn *websocket.Conn
	send chan []byte
	x, y, z, ry float64
}

type Hub struct {
	mu      sync.RWMutex
	players map[string]*Player
	voxels  map[[3]int]bool
}

func NewHub() *Hub {
	return &Hub{
		players: make(map[string]*Player),
		voxels:  make(map[[3]int]bool),
	}
}

func (h *Hub) AddPlayer(conn *websocket.Conn) *Player {
	id := fmt.Sprintf("p%d", playerCounter.Add(1))

	player := &Player{
		id:   id,
		conn: conn,
		send: make(chan []byte, 64),
	}

	// Send welcome with existing players and voxels
	h.mu.Lock()
	players := make([]PlayerState, 0, len(h.players))
	for _, p := range h.players {
		players = append(players, PlayerState{
			ID: p.id, X: p.x, Y: p.y, Z: p.z, RY: p.ry,
		})
	}
	voxels := make([][3]int, 0, len(h.voxels))
	for pos := range h.voxels {
		voxels = append(voxels, pos)
	}
	h.players[id] = player
	h.mu.Unlock()

	welcome := WelcomeMessage{
		Type:    "welcome",
		ID:      id,
		Players: players,
		Voxels:  voxels,
	}
	if data, err := json.Marshal(welcome); err == nil {
		player.send <- data
	}

	// Broadcast join to others
	h.broadcast(id, PlayerJoinMessage{Type: "player_join", ID: id})

	log.Printf("Player %s joined (%d total)", id, len(h.players))
	return player
}

func (h *Hub) RemovePlayer(id string) {
	h.mu.Lock()
	delete(h.players, id)
	h.mu.Unlock()

	h.broadcast(id, PlayerLeaveMessage{Type: "player_leave", ID: id})
	log.Printf("Player %s left (%d total)", id, len(h.players))
}

func (h *Hub) HandleMessage(player *Player, msg ClientMessage) {
	switch msg.Type {
	case "move":
		player.x = msg.X
		player.y = msg.Y
		player.z = msg.Z
		player.ry = msg.RY

		h.broadcast(player.id, PlayerMoveMessage{
			Type: "player_move",
			ID:   player.id,
			X:    msg.X, Y: msg.Y, Z: msg.Z, RY: msg.RY,
		})

	case "voxel_add":
		pos := [3]int{int(msg.X), int(msg.Y), int(msg.Z)}
		h.mu.Lock()
		h.voxels[pos] = true
		h.mu.Unlock()

		h.broadcast(player.id, VoxelAddMessage{
			Type: "voxel_add", X: pos[0], Y: pos[1], Z: pos[2],
		})

	case "voxel_remove":
		pos := [3]int{int(msg.X), int(msg.Y), int(msg.Z)}
		h.mu.Lock()
		delete(h.voxels, pos)
		h.mu.Unlock()

		h.broadcast(player.id, VoxelRemoveMessage{
			Type: "voxel_remove", X: pos[0], Y: pos[1], Z: pos[2],
		})
	}
}

// Tick flushes buffered state (Phase 1: no-op, broadcast is immediate)
func (h *Hub) Tick() {
	// Future: batch position updates here instead of immediate broadcast
}

func (h *Hub) broadcast(senderID string, msg any) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, p := range h.players {
		if p.id == senderID {
			continue
		}
		select {
		case p.send <- data:
		default:
			log.Printf("Player %s send buffer full, dropping message", p.id)
		}
	}
}
