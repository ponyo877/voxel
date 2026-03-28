package main

// Client -> Server messages
type ClientMessage struct {
	Type string  `json:"type"`
	X    float64 `json:"x,omitempty"`
	Y    float64 `json:"y,omitempty"`
	Z    float64 `json:"z,omitempty"`
	RY   float64 `json:"ry,omitempty"`
}

// Server -> Client messages

type WelcomeMessage struct {
	Type    string        `json:"type"`
	ID      string        `json:"id"`
	Players []PlayerState `json:"players"`
}

type PlayerState struct {
	ID string  `json:"id"`
	X  float64 `json:"x"`
	Y  float64 `json:"y"`
	Z  float64 `json:"z"`
	RY float64 `json:"ry"`
}

type PlayerJoinMessage struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

type PlayerLeaveMessage struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

type PlayerMoveMessage struct {
	Type string  `json:"type"`
	ID   string  `json:"id"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	Z    float64 `json:"z"`
	RY   float64 `json:"ry"`
}
