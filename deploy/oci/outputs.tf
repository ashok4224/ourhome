output "compartment_id" {
  value = oci_identity_compartment.ourhome.id
}

output "cluster_id" {
  value = oci_containerengine_cluster.ourhome.id
}

output "ocir_registry_hostname" {
  description = "Prefix every image tag with this + your tenancy's OCIR namespace (`oci os ns get`), e.g. <this>/<namespace>/ourhome/gateway:latest"
  value       = "${var.region}.ocir.io"
}

output "configure_kubectl_command" {
  description = "Run this once to write/merge kubeconfig for this cluster."
  value       = "oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.ourhome.id} --file $HOME/.kube/config --region ${var.region} --token-version 2.0.0"
}
