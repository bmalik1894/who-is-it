package models

import collection.mutable.Map
import java.time.format.DateTimeFormatter

object ApplicationModel {
    private var games = Map[String, Seq[String]]()
    
    def verifyUser(code:String, username:String): Boolean = {
        if (!games.contains(code)) {
            if (code.length != 0) { games += (code-> Seq(username)) }
            true
        } else {
        val currentGame = games(code)
        for (name <- currentGame) {
            if (username == name) {
                false
            }
        }
        games(code).:+(username)
        true
        }
        true
    }

    def enterGame(code:String, username:String): Boolean = {
        games += (code -> Seq(username))
        true
    }

}