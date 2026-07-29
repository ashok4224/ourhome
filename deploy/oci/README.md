# Deploying OurHome to OCI (OKE)

This provisions a fresh OKE cluster + OCIR registry from an empty tenancy and
deploys the 8-service app onto it, targeting OCI's **Always Free** tier —
$0 cost, permanently (not the 30/90-day trial credit). Run every command
below yourself — nothing here executes automatically.

**Always Free budget this uses**: the entire tenancy-wide Ampere allocation
(4 OCPUs / 24GB, `VM.Standard.A1.Flex`) as one worker node, a 10Mbps flexible
Load Balancer, and a few GB of the 200GB free block storage for Postgres's
PVC. The one thing I'm not fully certain is $0: OCIR registry storage for
the 8 pushed images isn't listed as an explicit Always Free line item the
way compute/storage/LB are — realistically a handful of small Alpine-based
Node images is trivially small, likely cents at most even if not literally
free, but don't take my word for guaranteed $0 there.

## Prerequisites

Install locally (or use OCI Cloud Shell, which already has all of these):
- [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm), then `oci setup config` (creates `~/.oci/config` with your tenancy/user OCID, region, and a generated API signing key — this is the credential Terraform and the CLI both read; never share it)
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- `kubectl`
- `docker` with `buildx` (bundled with Docker Desktop) — needed to cross-compile for the ARM64 free-tier nodes even from an x86_64 machine

## 1. Provision the infrastructure

```
cd deploy/oci
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: your real tenancy_ocid and region at minimum

terraform init
terraform plan    # review before applying — this is the point to catch mistakes for free
terraform apply
```

This creates: a new `ourhome` compartment, a VCN with public (load balancer) and private (nodes, API endpoint) subnets, an OKE cluster (BASIC_CLUSTER — no control-plane charge), a single-node ARM worker pool sized to the entire Always Free A1.Flex allocation, 8 private OCIR repositories, and the IAM policy letting the cluster's nodes pull from them.

`terraform apply` takes several minutes (cluster + node pool provisioning). When it finishes, note the outputs — you'll need `configure_kubectl_command` and `ocir_registry_hostname` next.

## 2. Point kubectl at the new cluster

```
terraform output -raw configure_kubectl_command | bash
kubectl get nodes    # should show 1 node (arm64), eventually Ready
```

## 3. Build and push images to OCIR

```
oci iam region list --query "data[?name=='<your-region>'].key" --raw-output    # region key, e.g. "iad" for us-ashburn-1
oci os ns get --query 'data' --raw-output                                       # your tenancy's OCIR namespace

docker login <region>.ocir.io -u '<namespace>/<your-oci-username>' -p '<auth-token>'
# generate the auth token under Profile > Auth Tokens in the OCI Console —
# your Console password will NOT work here.

cd ../..   # repo root
./deploy/oci/build-and-push.sh <region> <namespace>
# builds arm64 images via docker buildx (cross-compiles even from an x86_64
# machine) — matches the free-tier A1.Flex node shape. If you deliberately
# switched to the paid E4.Flex shape instead, edit PLATFORM in that script
# to linux/amd64 first.
```

## 4. Point the manifests at your registry

Every `k8s/*.yaml` currently has `image: <OCIR_REGION>.ocir.io/<OCIR_NAMESPACE>/ourhome/<service>:latest`. Substitute both placeholders once:

```
# macOS/Linux/Cloud Shell:
sed -i "s/<OCIR_REGION>/us-ashburn-1/g; s/<OCIR_NAMESPACE>/yournamespace/g" k8s/*.yaml

# Windows PowerShell:
Get-ChildItem k8s\*.yaml | ForEach-Object {
  (Get-Content $_.FullName) -replace '<OCIR_REGION>','us-ashburn-1' -replace '<OCIR_NAMESPACE>','yournamespace' | Set-Content $_.FullName
}
```

## 5. Create the real secret (never commit this)

`k8s/secret.yaml` is a template with placeholder values — don't apply it directly. Create the real one imperatively:

```
kubectl create namespace ourhome
kubectl create secret generic ourhome-secrets -n ourhome \
  --from-literal=DATABASE_URL="postgresql://ourhome:<pick-a-real-password>@postgres:5432/ourhome" \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)" \
  --from-literal=INTERNAL_SERVICE_TOKEN="$(openssl rand -hex 32)" \
  --from-literal=POSTGRES_PASSWORD="<same-password-as-above>"
```

## 6. Deploy

```
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n ourhome --timeout=120s

kubectl apply -f k8s/auth-service.yaml -f k8s/properties-service.yaml -f k8s/appointments-service.yaml \
              -f k8s/inquiries-service.yaml -f k8s/favorites-service.yaml -f k8s/support-service.yaml \
              -f k8s/chat-service.yaml
kubectl apply -f k8s/gateway.yaml
```

Watch until everything's up: `kubectl get pods -n ourhome` (all `Running`), then:

```
kubectl get svc gateway -n ourhome
```

The `EXTERNAL-IP` column is your public Load Balancer IP — it can take a couple of minutes to populate.

## 7. Set up the database schema and demo data

Port-forward to reach the cluster's Postgres from your machine:

```
kubectl port-forward svc/postgres -n ourhome 5432:5432
```

In a second terminal, from the repo root:

```
$env:DATABASE_URL = "postgresql://ourhome:<the-real-password-from-step-5>@localhost:5432/ourhome"   # PowerShell
# export DATABASE_URL="postgresql://ourhome:<...>@localhost:5432/ourhome"                              # bash

npx prisma db push
npx tsx prisma/seed.ts
```

## 8. Verify

```
curl http://<EXTERNAL-IP>/api/health
```

Should report `"status":"ok"` with all 7 services `"ok"`. Then open `http://<EXTERNAL-IP>` in a browser and log in with the seeded demo accounts (`customer@ourhome.com` / `builder@ourhome.com` / `admin@ourhome.com`, password `ourhome123`) — the same accounts and flows already verified in the local smoke/UAT pass (60/60).

## Known follow-ups, not done here

- **No TLS.** The Load Balancer serves plain HTTP on a bare IP. Once you have a real domain, point it at the Load Balancer IP and add [cert-manager](https://cert-manager.io/) + a `ClusterIssuer` for Let's Encrypt — that's the point to also reintroduce an `Ingress` resource if you want host-based TLS termination.
- **No CI/CD.** Rebuilding/redeploying is the same manual steps 3-4-6 above, repeated. Wire this into OCI DevOps or GitHub Actions once the manual flow feels routine.
- **Secrets are a plain k8s Secret**, not OCI Vault. Fine for getting started; revisit if this handles real user data at scale.
- **chat-service stays at `replicas: 1`** — see `k8s/README.md`.

## Tearing it down

```
kubectl delete -f k8s/   # or: kubectl delete namespace ourhome
cd deploy/oci
terraform destroy
```

`terraform destroy` removes the cluster, network, and compartment — the OCIR repos and their images go with it. With the default A1.Flex/single-node/10Mbps-LB settings this should stay within Always Free — but if you changed any defaults (bigger node, paid shape, wider LB band), check the OCI cost estimator before leaving it running.
