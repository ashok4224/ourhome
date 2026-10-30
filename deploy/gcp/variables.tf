variable "project_id" {
  description = "GCP project ID (found under the project selector in the GCP Console)."
  type        = string
}

variable "region" {
  description = "GCP region to deploy into."
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone for the zonal GKE cluster (must be inside `region`)."
  type        = string
  default     = "us-central1-a"
}

variable "cluster_name" {
  description = "Name for the GKE cluster."
  type        = string
  default     = "ourhome-gke"
}

variable "network_name" {
  description = "Name for the dedicated VPC network."
  type        = string
  default     = "ourhome-vpc"
}

variable "machine_type" {
  description = <<-EOT
    GKE node machine type.
    - e2-small (default): 2 vCPU / 2 GB, eligible for the GKE free tier
      (one zonal cluster per billing account in us-central1/us-east1/us-west1)
      and the Compute Engine free tier. Comfortable enough for the 8 services
      at their current resource requests, but tight — watch for evictions if
      traffic grows.
    - e2-medium: 2 vCPU / 4 GB — NOT free-tier eligible, but roomier.
    All OurHome images are x86_64 (see .github/workflows/build-and-push.yml),
    so use a standard x86_64 family (e2/n2), not the ARM Tau T2A family.
  EOT
  type        = string
  default     = "e2-small"
}

variable "node_count" {
  description = "Initial number of worker nodes."
  type        = number
  default     = 1
}

variable "min_nodes" {
  description = "Autoscaling minimum node count."
  type        = number
  default     = 1
}

variable "max_nodes" {
  description = "Autoscaling maximum node count."
  type        = number
  default     = 3
}
