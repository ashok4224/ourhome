resource "oci_identity_compartment" "ourhome" {
  compartment_id = var.tenancy_ocid
  name           = var.compartment_name
  description    = var.compartment_description
  enable_delete  = true
}

resource "oci_core_vcn" "ourhome" {
  compartment_id = oci_identity_compartment.ourhome.id
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "ourhome-vcn"
  dns_label      = "ourhomevcn"
}

resource "oci_core_internet_gateway" "ourhome" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-igw"
}

resource "oci_core_nat_gateway" "ourhome" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-nat"
}

data "oci_core_services" "all_services" {}

resource "oci_core_service_gateway" "ourhome" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-sgw"
  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }
}

# ── Route tables ─────────────────────────────────────────────────────
# Public: only the load-balancer subnet uses this.
resource "oci_core_route_table" "public" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-public-rt"
  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.ourhome.id
  }
}

# Private: worker nodes + the Kubernetes API endpoint subnet use this —
# outbound internet via NAT (for pulling images, npm/OS updates), plus the
# service gateway route so OCI API calls (e.g. OCIR, the OKE control plane)
# don't need to leave OCI's backbone.
resource "oci_core_route_table" "private" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-private-rt"
  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_nat_gateway.ourhome.id
  }
  route_rules {
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.ourhome.id
  }
}

# ── Subnets ──────────────────────────────────────────────────────────
resource "oci_core_subnet" "lb" {
  compartment_id             = oci_identity_compartment.ourhome.id
  vcn_id                     = oci_core_vcn.ourhome.id
  cidr_block                 = "10.0.0.0/24"
  display_name               = "ourhome-lb-subnet"
  dns_label                  = "lbsubnet"
  route_table_id             = oci_core_route_table.public.id
  prohibit_public_ip_on_vnic = false
}

resource "oci_core_subnet" "nodes" {
  compartment_id             = oci_identity_compartment.ourhome.id
  vcn_id                     = oci_core_vcn.ourhome.id
  cidr_block                 = "10.0.1.0/24"
  display_name               = "ourhome-nodes-subnet"
  dns_label                  = "nodesubnet"
  route_table_id             = oci_core_route_table.private.id
  prohibit_public_ip_on_vnic = true
}

resource "oci_core_subnet" "api_endpoint" {
  compartment_id             = oci_identity_compartment.ourhome.id
  vcn_id                     = oci_core_vcn.ourhome.id
  cidr_block                 = "10.0.2.0/28"
  display_name               = "ourhome-api-endpoint-subnet"
  dns_label                  = "apisubnet"
  route_table_id             = oci_core_route_table.private.id
  prohibit_public_ip_on_vnic = true
}

# ── Network Security Groups ──────────────────────────────────────────
# NSGs scoped per-subnet rather than broad Security Lists — the
# OCI-recommended pattern for OKE. Kubernetes NetworkPolicies (not set up
# here, see ARCHITECTURE.md) are the finer-grained layer on top if needed.

resource "oci_core_network_security_group" "lb" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-lb-nsg"
}
resource "oci_core_network_security_group_security_rule" "lb_ingress_http" {
  network_security_group_id = oci_core_network_security_group.lb.id
  direction                 = "INGRESS"
  protocol                  = "6" # TCP
  source                    = "0.0.0.0/0"
  source_type               = "CIDR_BLOCK"
  tcp_options {
    destination_port_range {
      min = 80
      max = 80
    }
  }
}
resource "oci_core_network_security_group_security_rule" "lb_egress_all" {
  network_security_group_id = oci_core_network_security_group.lb.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"
}

resource "oci_core_network_security_group" "nodes" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-nodes-nsg"
}
resource "oci_core_network_security_group_security_rule" "nodes_ingress_from_lb" {
  network_security_group_id = oci_core_network_security_group.nodes.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.lb.id
  source_type               = "NETWORK_SECURITY_GROUP"
}
resource "oci_core_network_security_group_security_rule" "nodes_ingress_self" {
  network_security_group_id = oci_core_network_security_group.nodes.id
  direction                 = "INGRESS"
  protocol                  = "all"
  source                    = oci_core_network_security_group.nodes.id
  source_type               = "NETWORK_SECURITY_GROUP"
}
resource "oci_core_network_security_group_security_rule" "nodes_egress_all" {
  network_security_group_id = oci_core_network_security_group.nodes.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"
}

resource "oci_core_network_security_group" "api_endpoint" {
  compartment_id = oci_identity_compartment.ourhome.id
  vcn_id         = oci_core_vcn.ourhome.id
  display_name   = "ourhome-api-endpoint-nsg"
}
resource "oci_core_network_security_group_security_rule" "api_ingress_from_nodes" {
  network_security_group_id = oci_core_network_security_group.api_endpoint.id
  direction                 = "INGRESS"
  protocol                  = "6"
  source                    = oci_core_network_security_group.nodes.id
  source_type               = "NETWORK_SECURITY_GROUP"
}
resource "oci_core_network_security_group_security_rule" "api_egress_all" {
  network_security_group_id = oci_core_network_security_group.api_endpoint.id
  direction                 = "EGRESS"
  protocol                  = "all"
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"
}
