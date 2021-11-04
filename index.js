/* jshint esversion: 6, strict: global, devel: true */
'use strict';

const roads = [
  `Alice's House-Bob's House`,
  `Alice's House-Cabin`,
  `Alice's House-Post Office`,
  `Bob's House-Town Hall`,
  `Daria's House-Ernie's House`,
  `Daria's House-Town Hall`,
  `Ernie's House-Grete's House`,
  `Grete's House-Farm`,
  `Grete's House-Shop`,
  `Marketplace-Farm`,
  `Marketplace-Post Office`,
  `Marketplace-Shop`,
  `Marketplace-Town Hall`,
  `Shop-Town Hall`,
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map((r) => r.split('-'))) {
    addEdge(from, to);
    addEdge(to, from);
  }

  return graph;
}

const roadGraph = buildGraph(roads);

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }
  move(destination) {
    /* Check if there is a road going from the current place * to the destination */
    if (!roadGraph[this.place].includes(destination)) {
      return this; // return the old state, because this is not a valid move
    } else {
      /* Create a new state with the destination as the robot's a new place. */
      let parcels = this.parcels
        .map((p) => {
          if (p.place != this.place) return p;
          return { place: destination, address: p.address };
        })
        .filter((p) => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

let first = new VillageState(`Post Office`, [
  { place: `Post Office`, address: `Alice's House` },
]);
let next = first.move(`Alice's House`);

//console.log(next);
//console.log(first);

function runRobot(state, robot, memory) {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = function (parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({ place, address });
  }
  return new VillageState(`Post Office`, parcels);
};

// runRobot(VillageState.random(), randomRobot);

/* One route starting from the post office */
const mailRoute = [
  `Alice's House`,
  `Cabin`,
  `Alice's House`,
  `Bob's House`,
  `Town Hall`,
  `Daria's House`,
  `Ernie's House`,
  `Grete's House`,
  `Shop`,
  `Grete's House`,
  `Farm`,
  `Marketplace`,
  `Post Office`,
];

/* The implementation of the route-following robot.
 *
 * It keeps the rest of its route in its memory and drops the first element
 * every turn. */
function routeRobot(state, memory) {
  if (memory.length === 0) {
    memory = mailRoute;
  }
  return {
    direction: memory[0],
    memory: memory.slice(1),
  };
}

runRobot(VillageState.random(), routeRobot, []);
