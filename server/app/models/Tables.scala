package models
// AUTO-GENERATED Slick data model
/** Stand-alone Slick data model for immediate use */
object Tables extends {
  val profile = slick.jdbc.PostgresProfile
} with Tables

/** Slick data model trait for extension, choice of backend or usage in the cake pattern. (Make sure to initialize this late.) */
trait Tables {
  val profile: slick.jdbc.JdbcProfile
  import profile.api._
  import slick.model.ForeignKeyAction
  // NOTE: GetResult mappers for plain SQL are only generated for tables where Slick knows how to map the types of all columns.
  import slick.jdbc.{GetResult => GR}

  /** DDL for all tables. Call .create to execute. */
  lazy val schema: profile.SchemaDescription = Defaultquestions.schema ++ Games.schema ++ Userquestions.schema
  @deprecated("Use .schema instead of .ddl", "3.0")
  def ddl = schema

  /** Entity class storing rows of table Defaultquestions
   *  @param id Database column id SqlType(serial), AutoInc, PrimaryKey
   *  @param question Database column question SqlType(varchar), Length(255,true) */
  case class DefaultquestionsRow(id: Int, question: String)
  /** GetResult implicit for fetching DefaultquestionsRow objects using plain SQL queries */
  implicit def GetResultDefaultquestionsRow(implicit e0: GR[Int], e1: GR[String]): GR[DefaultquestionsRow] = GR{
    prs => import prs._
    DefaultquestionsRow.tupled((<<[Int], <<[String]))
  }
  /** Table description of table defaultquestions. Objects of this class serve as prototypes for rows in queries. */
  class Defaultquestions(_tableTag: Tag) extends profile.api.Table[DefaultquestionsRow](_tableTag, "defaultquestions") {
    def * = (id, question) <> (DefaultquestionsRow.tupled, DefaultquestionsRow.unapply)
    /** Maps whole row to an option. Useful for outer joins. */
    def ? = ((Rep.Some(id), Rep.Some(question))).shaped.<>({r=>import r._; _1.map(_=> DefaultquestionsRow.tupled((_1.get, _2.get)))}, (_:Any) =>  throw new Exception("Inserting into ? projection not supported."))

    /** Database column id SqlType(serial), AutoInc, PrimaryKey */
    val id: Rep[Int] = column[Int]("id", O.AutoInc, O.PrimaryKey)
    /** Database column question SqlType(varchar), Length(255,true) */
    val question: Rep[String] = column[String]("question", O.Length(255,varying=true))
  }
  /** Collection-like TableQuery object for table Defaultquestions */
  lazy val Defaultquestions = new TableQuery(tag => new Defaultquestions(tag))

  /** Entity class storing rows of table Games
   *  @param id Database column id SqlType(serial), AutoInc, PrimaryKey
   *  @param gameCode Database column game_code SqlType(varchar), Length(6,true)
   *  @param rounds Database column rounds SqlType(int4) */
  case class GamesRow(id: Int, gameCode: String, rounds: Int)
  /** GetResult implicit for fetching GamesRow objects using plain SQL queries */
  implicit def GetResultGamesRow(implicit e0: GR[Int], e1: GR[String]): GR[GamesRow] = GR{
    prs => import prs._
    GamesRow.tupled((<<[Int], <<[String], <<[Int]))
  }
  /** Table description of table games. Objects of this class serve as prototypes for rows in queries. */
  class Games(_tableTag: Tag) extends profile.api.Table[GamesRow](_tableTag, "games") {
    def * = (id, gameCode, rounds) <> (GamesRow.tupled, GamesRow.unapply)
    /** Maps whole row to an option. Useful for outer joins. */
    def ? = ((Rep.Some(id), Rep.Some(gameCode), Rep.Some(rounds))).shaped.<>({r=>import r._; _1.map(_=> GamesRow.tupled((_1.get, _2.get, _3.get)))}, (_:Any) =>  throw new Exception("Inserting into ? projection not supported."))

    /** Database column id SqlType(serial), AutoInc, PrimaryKey */
    val id: Rep[Int] = column[Int]("id", O.AutoInc, O.PrimaryKey)
    /** Database column game_code SqlType(varchar), Length(6,true) */
    val gameCode: Rep[String] = column[String]("game_code", O.Length(6,varying=true))
    /** Database column rounds SqlType(int4) */
    val rounds: Rep[Int] = column[Int]("rounds")
  }
  /** Collection-like TableQuery object for table Games */
  lazy val Games = new TableQuery(tag => new Games(tag))

  /** Entity class storing rows of table Userquestions
   *  @param id Database column id SqlType(serial), AutoInc, PrimaryKey
   *  @param question Database column question SqlType(varchar), Length(255,true)
   *  @param gameId Database column game_id SqlType(int4)
   *  @param upvote Database column upvote SqlType(int4), Default(Some(0))
   *  @param downvote Database column downvote SqlType(int4), Default(Some(0)) */
  case class UserquestionsRow(id: Int, question: String, gameId: Int, upvote: Option[Int] = Some(0), downvote: Option[Int] = Some(0))
  /** GetResult implicit for fetching UserquestionsRow objects using plain SQL queries */
  implicit def GetResultUserquestionsRow(implicit e0: GR[Int], e1: GR[String], e2: GR[Option[Int]]): GR[UserquestionsRow] = GR{
    prs => import prs._
    UserquestionsRow.tupled((<<[Int], <<[String], <<[Int], <<?[Int], <<?[Int]))
  }
  /** Table description of table userquestions. Objects of this class serve as prototypes for rows in queries. */
  class Userquestions(_tableTag: Tag) extends profile.api.Table[UserquestionsRow](_tableTag, "userquestions") {
    def * = (id, question, gameId, upvote, downvote) <> (UserquestionsRow.tupled, UserquestionsRow.unapply)
    /** Maps whole row to an option. Useful for outer joins. */
    def ? = ((Rep.Some(id), Rep.Some(question), Rep.Some(gameId), upvote, downvote)).shaped.<>({r=>import r._; _1.map(_=> UserquestionsRow.tupled((_1.get, _2.get, _3.get, _4, _5)))}, (_:Any) =>  throw new Exception("Inserting into ? projection not supported."))

    /** Database column id SqlType(serial), AutoInc, PrimaryKey */
    val id: Rep[Int] = column[Int]("id", O.AutoInc, O.PrimaryKey)
    /** Database column question SqlType(varchar), Length(255,true) */
    val question: Rep[String] = column[String]("question", O.Length(255,varying=true))
    /** Database column game_id SqlType(int4) */
    val gameId: Rep[Int] = column[Int]("game_id")
    /** Database column upvote SqlType(int4), Default(Some(0)) */
    val upvote: Rep[Option[Int]] = column[Option[Int]]("upvote", O.Default(Some(0)))
    /** Database column downvote SqlType(int4), Default(Some(0)) */
    val downvote: Rep[Option[Int]] = column[Option[Int]]("downvote", O.Default(Some(0)))

    /** Foreign key referencing Games (database name userquestions_game_id_fkey) */
    lazy val gamesFk = foreignKey("userquestions_game_id_fkey", gameId, Games)(r => r.id, onUpdate=ForeignKeyAction.NoAction, onDelete=ForeignKeyAction.Cascade)
  }
  /** Collection-like TableQuery object for table Userquestions */
  lazy val Userquestions = new TableQuery(tag => new Userquestions(tag))
}
