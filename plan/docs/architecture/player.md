# Player, camera and interactions

One unit is the spirit's standing height. Keep the movement root at floor level, use Y up and horizontal XZ movement. A cosmetic child floats above that root. createPlayer() exposes root, position, teleport(point), step(dt, actions, surfaces), setHeld(prop|null), setPose(name), and strikeWindow() → {swingId, active, forward}. The world supplies floorHeight(x,z), platform tops with extents, walk bounds and a safeSpawn. Share this narrow surface query across worlds. Detailed render meshes do not participate in physics.

| Action | Behaviour and tuning baseline |
|---|---|
| WASD | Normalize diagonals, rotate by camera yaw, ease toward 4 units/s. Clamp to walk bounds. |
| Space | Single grounded jump, velocity 5.6 units/s, gravity 14 units/s². Cross a platform top while descending and within its footprint to land. Test last and new feet height to support direct drops. Ignore overhead tops when moving upward. |
| Water | A local shoreline ramp blends to a coral-floor-following glide at 3 units/s. E targets and landmarks stay within reach on that floor. The bubble permits entry. No depth/oxygen controls. |
| E | Contextual interaction on press only. Dialogue mode advances the current line on a fresh press, click or focused Continue. |
| Primary click | Sword swing only after acquisition and during explore. Window 0.12–0.25 s within a 0.45 s swing. World filters candidates in a forward arc (reach 1.5 units, half-angle 55°). Each target records last swingId. |
| Q | Activate manually when Void exposes the 5% finisher prompt. |
| Primary pointer drag | Orbit follow camera in explore after 5 CSS pixels of movement. Releasing an orbit drag does not swing the sword. Puzzle mode uses primary press and drag for clay and pipes. Release pointer on blur or mode change. |

Fire must permit walking back after any fall. Use a continuous floor beneath the full lantern path. Elsewhere constrain the island/arena edge to a defined playable inset, and teleport to safeSpawn if an invalid y slips through. Keep movement state and temporary held meshes separate from inventory. Clear vertical speed and reset camera smoothing on teleport.

createCameraRig(camera) exposes follow(player), shot({eye, lookAt, seconds}), releaseShot() and update(dt). Start 4.8 units back, 2.5 up at 48° vertical FOV, aimed 0.65 units above the root. Dragging right reduces yaw at 0.003 rad per pixel. Dragging down raises pitch at 0.0022 rad per pixel. Damp the eye at 7/s and the look target at 12/s on active dt. Limit pitch and shorten follow distance when scenery lies between focus and camera. Story/puzzle supply eye and target. Restore previous yaw after their lock. Frame Metal by grid bounds and aspect; Earth by wheel centre. Do not rotate the world to aim the camera.

createInteractions() exposes register({id, point, radius, priority, enabled, label, run}) → unregister and select(playerPosition) → target|null. point/label/enabled can read local state. Within radius (default 1.6), choose highest priority then nearest then stable ID. Use the **same** selected target for label and E; recheck enabled and latch pending run until completion. Suppress prompts while locked. If a mandatory destination is farther away, world calls ui.objective(text, point) for a ground-path chevron or offscreen arrow. Quest guidance has no interaction radius of its own.

Worlds control their own behaviour. Void reads player.strikeWindow(), resolves enemy hits and applies a brief bounded displacement via player.knockback(direction, distance). The avatar owns the reusable swing, the Void owns enemy HP, telegraphs and defeat. A prop-only actor such as Bob never needs a combat component.
