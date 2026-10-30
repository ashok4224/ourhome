# Auth is read from Application Default Credentials — the file written by
# `gcloud auth application-default login` (or GOOGLE_APPLICATION_CREDENTIALS).
# Never hardcode a key in any .tf file.
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference#authentication

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
