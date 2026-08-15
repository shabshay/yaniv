# Yaniv

Yaniv card game, instructions can be found [here](https://en.wikipedia.org/wiki/Yaniv_(card_game)).

Try to play the [live demo](https://shabshay.github.io/yaniv/).

## Firestore deployment

The host deletes processed actions immediately and removes room data when a room is explicitly
closed or replaced by a new hosted room. Stale lobby presence is pruned by the active host.
Deploy the rules and indexes with:

```sh
firebase deploy --only firestore
```

The free Spark plan cannot automatically remove rooms whose host crashes and never returns;
managed TTL cleanup requires the Blaze billing plan.

## Usage analytics

Firebase Analytics records visitors and privacy-safe game lifecycle events. View active users and
the `game_created`, `game_joined`, `game_resumed`, `game_started`, `game_completed`, and
`game_abandoned` events in Google Analytics for the `play-yaniv` Firebase project. Player names
and room codes are never included.
