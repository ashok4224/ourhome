variable "tenancy_ocid" {
  description = "OCID of your OCI tenancy (root compartment). Find it under Profile > Tenancy in the OCI Console."
  type        = string
}

variable "region" {
  description = "OCI region to deploy into, e.g. us-ashburn-1."
  type        = string
}

variable "compartment_name" {
  description = "Name for the new compartment this app's resources live in. Created fresh — nothing is deployed into an existing compartment."
  type        = string
  default     = "ourhome"
}

variable "compartment_description" {
  type    = string
  default = "OurHome application resources (OKE cluster, network, registry)."
}

variable "kubernetes_version" {
  description = "OKE Kubernetes version. Check currently supported versions with: oci ce cluster-options get --cluster-option-id all"
  type        = string
  default     = "v1.30.1"
}

variable "node_shape" {
  description = <<-EOT
    Worker node compute shape.
    - VM.Standard.A1.Flex (default): ARM/Ampere, Always-Free-eligible (up to
      4 OCPUs / 24GB total across the whole tenancy — this default puts
      that entire allocation on one node, see node_pool_size). Requires
      multi-arch image builds (`docker buildx build --platform linux/arm64
      ...`, already how build-and-push.sh works) since these are ARM64, not
      x86_64.
    - VM.Standard.E4.Flex: x86_64, NOT free — billed per OCPU/GB-hour. A
      plain `docker build` produces a compatible image with no extra steps,
      but only use this if you've deliberately decided to pay for it.
  EOT
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "node_ocpus" {
  description = "OCPUs per worker node (flex shapes only). Default uses the entire Always Free A1.Flex allocation (4 OCPUs total) on a single node."
  type        = number
  default     = 4
}

variable "node_memory_gb" {
  description = "Memory (GB) per worker node (flex shapes only). Default uses the entire Always Free A1.Flex allocation (24GB total) on a single node."
  type        = number
  default     = 24
}

variable "node_pool_size" {
  description = "Number of worker nodes. Kept at 1 by default: the Always Free A1.Flex allocation (4 OCPUs / 24GB) is a TENANCY-WIDE total, not per-node — splitting it across multiple nodes just adds per-node overhead for no benefit at this scale. Only raise this if you're using a paid shape instead."
  type        = number
  default     = 1
}
