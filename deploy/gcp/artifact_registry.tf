resource "google_artifact_registry_repository" "ourhome" {
  location      = var.region
  repository_id = "ourhome"
  description   = "OurHome service container images"
  format        = "DOCKER"
}
