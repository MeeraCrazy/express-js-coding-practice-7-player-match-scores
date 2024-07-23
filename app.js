const express = require('express')
const app = express()
const {open} = require('sqlite')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const sqlite3 = require('sqlite3')

app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('success')
    })
  } catch (e) {
    console.log(`DB ERROR ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//API 1: GET PLAYERS

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT 
    player_id AS playerId,
    player_name AS playerName
  FROM
  player_details
  ORDER BY
  player_id;
  `

  const playerList = await db.all(getPlayersQuery)
  response.send(playerList)
})

//API GET PLAYER BASED ON ID
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT 
    player_id AS playerId,
    player_name AS playerName
  FROM
  player_details
  WHERE
  player_id = ${playerId};`

  const playerInformation = await db.get(getPlayerQuery)
  response.send(playerInformation)
})

//API UPDATE PLAYER DETAILS

app.put('/players/:playerId', (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails

  const updatePlayerQuery = `
  UPDATE 

  player_details

  SET

  player_name = '${playerName}'

  WHERE

  player_id = ${playerId};
  `

  db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 4: GET MATCH TABLE

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params

  const getMatchQuery = `
  SELECT 

    match_id AS matchId,
    match AS match,
    year AS year

  FROM

  match_details

  WHERE

  match_id = ${matchId};
  `

  const matchDetails = await db.get(getMatchQuery)
  response.send(matchDetails)
})

// API 5: GET PLAYER MATCH DETAILS

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params

  const getPlayerMatchQuery = `
  SELECT 
   
   match_id AS matchId,
   match,
   year

  FROM

    player_match_score NATURAL JOIN match_details

  WHERE 
  
  player_id = ${playerId};

  `

  const playerMatch = await db.all(getPlayerMatchQuery)
  response.send(playerMatch)
})

//API GET MATCH BASED ON PLAYER

app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params

  const getMatchPlayerQuery = `
  
  SELECT 

    player_id AS playerId,
    player_name AS playerName

  FROM 
    player_match_score NATURAL JOIN player_details

  WHERE 
    match_id = ${matchId};
  `
  const matchPlayer = await db.all(getMatchPlayerQuery)
  response.send(matchPlayer)
})

//API 7: GET PLAYER SCORE

app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerScoresQuery = `
  SELECT 

      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes

  FROM

      player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id

  WHERE
      
      player_details.player_id = ${playerId};
  `

  const playerScores = await db.get(getPlayerScoresQuery)
  response.send(playerScores)
})
module.exports = app
