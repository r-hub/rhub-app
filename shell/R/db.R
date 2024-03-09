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

  db_init_test_data <- function() {
    email <- "csardi.gabor@gmail.com"
    token <- Sys.getenv("RHUB2_TOKEN")
    db_transaction({
      db_execute(
        "INSERT INTO users VALUES (?email, ?name, ?prefix, ?admin)",
         email = email,
         name = "Gabor Csardi",
         prefix = "uncrystallised-groundhog-",
         admin = TRUE
       )
       db_execute(
        "INSERT INTO tokens VALUES (?email, ?token, ?status)",
        email = email,
        token = token,
        status = "validated"
       )
    })
  }

  db_list_users <- function() {
    db_query("SELECT * FROM users")
  }

  list(
    # internal API
    .internal      = environment(),
    append_table   = db_append_table,
    execute        = db_execute,
    query          = db_query,
    transaction    = db_transaction,

    # higher level API
    list_users     = db_list_users,

    # for testing
    init_test_data = db_init_test_data
  )
})
