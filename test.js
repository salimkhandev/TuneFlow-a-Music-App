const rows = [
  { song: { title: "Song A", artist: "X" } },
  { song: { title: "Song B", artist: "Y" } },
  { song: { title: "Song C", artist: "Z" } }
];

// pick only the nested "song" object
const items = rows.map(r => r.song);

console.log(items);
/*
[
  { title: "Song A", artist: "X" },
  { title: "Song B", artist: "Y" },
  { title: "Song C", artist: "Z" }
]
*/
