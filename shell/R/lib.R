db <- local({
  con <- NULL
  db_connect <- function() {
    host <- Sys.getenv("PG_HOST")
    user <- "postgres"
    pass <- readLines(Sys.getenv("PG_PASS_FILE"))
    if (is.null(con) || ! DBI::dbIsValid(con)) {
      con <<- DBI::dbConnect(
        RPostgres::Postgres(),
        host = host,
        user = user,
        pass = pass
      )
    }
  }

  db_query <- function(q, ...) {
    db_connect()
    sq <- DBI::sqlInterpolate(con, q, ...)
    DBI::dbGetQuery(con, sq)
  }

  db_execute <- function(q, ...) {
    db_connect()
    sq <- DBI::sqlInterpolate(con, q, ...)
    DBI::dbExecute(con, sq);
  }

  db_transaction <- function(...) {
    db_connect()
    DBI::dbWithTransaction(con, ...)
  }

  db_append_table <- function(name, value) {
    db_connect()
    DBI::dbAppendTable(con, name, value)
  }

  list(
    append_table = db_append_table,
    execute      = db_execute,
    query        = db_query,
    transaction  = db_transaction
  )
})
