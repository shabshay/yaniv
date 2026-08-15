# Yaniv

Yaniv card game, instructions can be found [here](https://en.wikipedia.org/wiki/Yaniv_(card_game)).

Try to play the [live demo](https://shabshay.github.io/yaniv/).

## Firestore deployment

Online rooms expire one hour after their last state update. Presence and processed action
documents expire after five minutes. Deploy the rules, indexes, and TTL field policies with:

```sh
firebase deploy --only firestore
```

Firestore TTL deletion is asynchronous and can occur up to 24 hours after a document expires.

## Usage analytics

Firebase Analytics records visitors and privacy-safe game lifecycle events. View active users and
the `game_created`, `game_joined`, `game_resumed`, `game_started`, `game_completed`, and
`game_abandoned` events in Google Analytics for the `play-yaniv` Firebase project. Player names
and room codes are never included.
