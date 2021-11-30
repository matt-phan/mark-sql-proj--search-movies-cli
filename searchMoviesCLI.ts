import { question, keyInSelect } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
// interface Movie {
//   id: string;
//   name: string;
//   date:
// }

const client = new Client({ database: "omdb" });

async function runCli() {
  await client.connect();

  while (true) {
    const options = ["Search", "View favourites"];
    const index = keyInSelect(options, "Choose an action");
    if (index === -1) {
      await client.end();
      break;
    } else if (index === 0) {
      // search for a movie
      const searchTerm = question("Choose a search term: ");
      const text =
        "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE $1 LIMIT 10;";
      const values = [`%${searchTerm}%`];
      const { rows } = await client.query(text, values);
      console.table(rows);
      // add a favourite movie out of the searched movies
      const favMovieOptions = rows.map((movie) => movie.name);
      const movieIndex = keyInSelect(
        favMovieOptions,
        "Choose your favourite movie"
      );
      const textFav = "INSERT INTO favourites (movie_id) VALUES ($1)";
      const valuesFav = [parseInt(rows[movieIndex].id)];
      console.log(valuesFav);
      await client.query(textFav, valuesFav);
    } else if (index === 1) {
      // display favourites table
      const text =
        "SELECT movies.id, movies.name, movies.date, movies.runtime, budget, movies.revenue, movies.vote_average, movies.votes_count FROM movies, favourites WHERE movies.id = favourites.movie_id;";
      const { rows } = await client.query(text);
      console.table(rows);
    } else {
      throw new Error("Something here went wrong, sorry :(");
    }
  }
}

runCli();
