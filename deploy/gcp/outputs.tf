output "cluster_name" {
  value = google_container_cluster.ourhome.name
}

output "cluster_location" {
  value = google_container_cluster.ourhome.location
}

output "configure_kubectl_command" {
  description = "Run this once to write/merge kubeconfig for this cluster."
  value       = "gcloud container clusters get-credentials ${var.cluster_name} --zone ${var.zone} --project ${var.project_id}"
}
