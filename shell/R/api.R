api <- local({

  base_url <- "http://web:3000/api"

  query <- function(ep, method = "GET", simplifyVector = TRUE, form = NULL) {
    req <- httr2::request(base_url) |>
      httr2::req_method(method) |>
      httr2::req_url_path_append(ep) |>
      httr2::req_headers(
        Authorization = paste("Bearer", Sys.getenv("RHUB2_TOKEN"))
      )

    if (method == "POST") {
      req <- do.call(httr2::req_body_form, c(list(req), form))
    }

    httr2::req_perform(req) |>
      httr2::resp_body_json(simplifyVector = simplifyVector)
  }

  user_list <- function() {
    query("/-/admin/users")
  }

  user_validate <- function(email) {
    query(method = "POST", "/-/user/validate", form = list(email = email))
  }

  job_create <- function(name, file) {

  }

  job_info <- function(id) {

  }

  repo_exists <- function(repo) {
    query(paste0("/-/admin/repo-exists/", repo))
  }

  repo_wait <- function(repo) {
    query(paste0("/-/admin/repo-wait/", repo))
  }

  repo_delete <- function(repo) {
    query(method = "DELETE", paste0("/-/admin/repo/", repo))
  }

  repo_list <- function() {
    query("/-/admin/repos")
  }

  list(
    # Internals
    .internal     = environment(),
    query         = query,

    # API
    job_create    = job_create,
    job_info      = job_info,

    user_list     = user_list,
    user_validate = user_validate,

    repo_delete   = repo_delete,
    repo_exists   = repo_exists,
    repo_list     = repo_list,
    repo_wait     = repo_wait
  )
})