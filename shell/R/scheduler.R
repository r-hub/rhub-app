scheduler <- local({

  base_url <- "http://scheduler:3001/api/"

  query <- function(ep, method = "GET", simplifyVector = TRUE) {
    httr2::request(base_url) |>
      httr2::req_method(method) |>
      httr2::req_url_path_append(ep) |>
      httr2::req_headers(
        Authorization = paste("Bearer", Sys.getenv("RHUB2_TOKEN"))
      ) |>
      httr2::req_perform() |>
      httr2::resp_body_json(simplifyVector = simplifyVector)
  }

  sch_repo_list <- function() {
    query("/-/admin/repos")
  }

  sch_repo_create <- function(name) {
    query(method = "POST", paste0("/-/admin/repo/", name))
  }

  sch_repo_delete <- function(name) {
    query(method = "DELETE", paste0("/-/admin/repo/", name))
  }

  sch_repo_get_workflow <- function(name) {
    query(paste0("/-/admin/repo/", name, "/workflow"))
  }

  sch_clone_create <- function(name) {
    query(paste0("/-/admin/clone/create/", name))
  }

  sch_clone_clean <- function(name) {
    query(paste0("/-/admin/clone/clean/", name))
  }

  sch_clone_check <- function(name) {
    query(paste0("/-/admin/clone/check/", name))
  }

  sch_clone_prune <- function(name) {
    query(paste0("/-/admin/clone/prune/", name))
  }

  sch_clone_ensure <- function(name) {
    query(paste0("/-/admin/clone/ensure/", name))
  }

  list(
    # low level API
    .internal         = environment(),
    query             = query,

    # higher level API
    clone_check       = sch_clone_check,
    clone_clean       = sch_clone_clean,
    clone_create      = sch_clone_create,
    clone_ensure      = sch_clone_ensure,
    clone_prune       = sch_clone_prune,

    repo_create       = sch_repo_create,
    repo_delete       = sch_repo_delete,
    repo_list         = sch_repo_list,
    repo_get_workflow = sch_repo_get_workflow

  )
})