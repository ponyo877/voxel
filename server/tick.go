package main

import (
	"log"
	"time"
)

const TPS = 20
const TickDuration = time.Second / TPS

func StartTickLoop(hub *Hub) {
	ticker := time.NewTicker(TickDuration)
	go func() {
		for range ticker.C {
			hub.Tick()
		}
	}()
	log.Printf("Tick loop started at %d TPS", TPS)
}
