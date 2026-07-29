# Auth is read from the standard OCI CLI config file (~/.oci/config, set up
# via `oci setup config`) or TF_VAR_*/OCI_CLI_* environment variables —
# never hardcode a private key or fingerprint in any .tf file.
# https://registry.terraform.io/providers/oracle/oci/latest/docs#authentication

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0"
    }
  }
}

provider "oci" {
  region = var.region
}
