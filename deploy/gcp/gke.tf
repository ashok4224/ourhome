resource "google_container_cluster" "ourhome" {
  name     = var.cluster_name
  location = var.zone

  network    = google_compute_network.ourhome.self_link
  subnetwork = google_compute_subnetwork.ourhome.self_link

  # Zonal cluster (free-tier eligible) with a separately-managed node pool.
  initial_node_count       = 1
  remove_default_node_pool = true

  # Set false so `terraform destroy` can tear this dev cluster down. For a
  # real production cluster you'd flip this to true.
  deletion_protection = false

  # VPC-native networking: pods/services draw from the subnet's secondary
  # ranges defined in network.tf.
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }
}

resource "google_container_node_pool" "ourhome" {
  name       = "ourhome-pool"
  location   = var.zone
  cluster    = google_container_cluster.ourhome.id
  node_count = var.node_count

  autoscaling {
    min_node_count = var.min_nodes
    max_node_count = var.max_nodes
  }

  node_config {
    machine_type = var.machine_type
    disk_size_gb = 50
    disk_type    = "pd-standard"

    # cloud-platform scope lets the node pull images from Artifact Registry /
    # GCR in the same project if you ever switch registries from GHCR.
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]

    labels = { app = "ourhome" }
  }
}
