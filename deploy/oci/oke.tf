resource "oci_containerengine_cluster" "ourhome" {
  compartment_id     = oci_identity_compartment.ourhome.id
  name               = "ourhome-oke"
  vcn_id             = oci_core_vcn.ourhome.id
  kubernetes_version = var.kubernetes_version
  type               = "BASIC_CLUSTER" # no hourly control-plane charge, sufficient here

  endpoint_config {
    is_public_ip_enabled = true
    subnet_id            = oci_core_subnet.api_endpoint.id
    nsg_ids              = [oci_core_network_security_group.api_endpoint.id]
  }

  options {
    service_lb_subnet_ids = [oci_core_subnet.lb.id]
    add_ons {
      is_kubernetes_dashboard_enabled = false
      is_tiller_enabled               = false
    }
    kubernetes_network_config {
      pods_cidr     = "10.244.0.0/16"
      services_cidr = "10.96.0.0/16"
    }
  }
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Scoped to this specific cluster (not "all") so the returned image options
# actually match its Kubernetes version/shape combination.
data "oci_containerengine_node_pool_option" "ourhome" {
  node_pool_option_id = oci_containerengine_cluster.ourhome.id
  compartment_id      = oci_identity_compartment.ourhome.id
}

locals {
  # Picks the standard Oracle Linux OKE node image out of the compatible set.
  # NOTE: the exact data-source shape here has shifted across oracle/oci
  # provider versions in the past — if `terraform plan` errors on this
  # block, check the provider's current docs for
  # oci_containerengine_node_pool_option before adjusting.
  node_image_id = [
    for s in data.oci_containerengine_node_pool_option.ourhome.sources :
    s.image_id if length(regexall("Oracle-Linux", s.source_name)) > 0
  ][0]
}

resource "oci_containerengine_node_pool" "ourhome" {
  compartment_id     = oci_identity_compartment.ourhome.id
  cluster_id         = oci_containerengine_cluster.ourhome.id
  name               = "ourhome-pool"
  kubernetes_version = var.kubernetes_version
  node_shape         = var.node_shape

  node_shape_config {
    ocpus         = var.node_ocpus
    memory_in_gbs = var.node_memory_gb
  }

  node_source_details {
    source_type = "IMAGE"
    image_id    = local.node_image_id
  }

  node_config_details {
    size = var.node_pool_size
    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = oci_core_subnet.nodes.id
    }
    nsg_ids = [oci_core_network_security_group.nodes.id]
  }

  initial_node_labels {
    key   = "app"
    value = "ourhome"
  }
}
