#!/usr/bin/env bash
# Builds and pushes all 8 OurHome images to OCIR, for arm64 —
# matching the Always Free VM.Standard.A1.Flex node shape the Terraform
# defaults to (deploy/oci/variables.tf). Cross-compiles via `docker buildx`
# even when run from an x86_64 machine (Docker Desktop bundles the QEMU
# emulation this needs — no separate install).
#
# Usage:
#   ./build-and-push.sh <region> <ocir-namespace> [tag]
#
# Example:
#   ./build-and-push.sh ap-hyderabad-1 axabcdefghij latest
#
# Before running: `docker login <region>.ocir.io -u '<namespace>/<oci-username>' -p '<auth-token>'`
# (generate the auth token under Profile > Auth Tokens in the OCI Console —
# your regular OCI Console password will NOT work for docker login).
#
# If your node pool uses the paid x86_64 shape (VM.Standard.E4.Flex) instead,
# change PLATFORM below to linux/amd64.
#
# Run from the repo root, or this script cd's there itself.

set -euo pipefail

REGION="${1:?Usage: build-and-push.sh <region> <ocir-namespace> [tag]}"
NAMESPACE="${2:?Usage: build-and-push.sh <region> <ocir-namespace> [tag]}"
TAG="${3:-latest}"
REGISTRY="${REGION}.ocir.io/${NAMESPACE}/ourhome"
PLATFORM="linux/arm64"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

# Ensure a buildx builder that supports cross-platform emulation is active.
docker buildx inspect --bootstrap >/dev/null 2>&1 || docker buildx create --use --name ourhome-builder

SERVICES=(auth-service properties-service appointments-service inquiries-service favorites-service support-service chat-service gateway)

for svc in "${SERVICES[@]}"; do
  image="${REGISTRY}/${svc}:${TAG}"
  echo ""
  echo "== Building + pushing ${image} (${PLATFORM}) =="
  docker buildx build --platform "${PLATFORM}" -f "services/${svc}/Dockerfile" -t "${image}" --push .
done

echo ""
echo "All 8 images (${PLATFORM}) pushed to ${REGISTRY}/*:${TAG}"
echo "Now substitute this registry path into k8s/*.yaml — see deploy/oci/README.md."
