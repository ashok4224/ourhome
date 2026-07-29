locals {
  services = [
    "auth-service", "properties-service", "appointments-service", "inquiries-service",
    "favorites-service", "support-service", "chat-service", "gateway",
  ]
}

resource "oci_artifacts_container_repository" "ourhome" {
  for_each       = toset(local.services)
  compartment_id = oci_identity_compartment.ourhome.id
  display_name   = "ourhome/${each.value}"
  is_public      = false
}

# Dynamic groups are always defined at the tenancy (root) level, even though
# the instances they match live in the ourhome compartment.
resource "oci_identity_dynamic_group" "oke_nodes" {
  compartment_id = var.tenancy_ocid
  name           = "ourhome-oke-node-dg"
  description    = "OKE worker nodes for the OurHome cluster"
  matching_rule  = "ALL {instance.compartment.id = '${oci_identity_compartment.ourhome.id}'}"
}

resource "oci_identity_policy" "oke_pull_images" {
  compartment_id = oci_identity_compartment.ourhome.id
  name           = "ourhome-oke-pull-images"
  description    = "Lets OKE worker nodes pull container images from this compartment's OCIR repos"
  statements = [
    "Allow dynamic-group ${oci_identity_dynamic_group.oke_nodes.name} to read repos in compartment ${var.compartment_name}",
  ]
}
