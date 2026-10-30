resource "google_compute_network" "ourhome" {
  name                    = var.network_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "ourhome" {
  name          = "ourhome-subnet"
  network       = google_compute_network.ourhome.id
  region        = var.region
  ip_cidr_range = "10.0.0.0/16"

  # VPC-native GKE requires two secondary ranges: one for pod IPs, one for
  # Service IPs. Referenced from gke.tf's ip_allocation_policy.
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/20"
  }
}
