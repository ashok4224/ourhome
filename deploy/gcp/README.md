# Deploying OurHome to GCP (GKE) — production flow

Code on GitHub → GitHub Actions CI (build + push) → GKE (CD deploy). This
supersedes the earlier manual `deploy/gke/deploy.ps1` (imperative script with
hardcoded secrets) with infra-as-code + pipelines.

**Architecture:** a zonal GKE cluster on a dedicated VPC (VPC-native
networking), 8 services + an in-cluster Postgres, images on Google Artifact
Registry (`<location>-docker.pkg.dev/<project>/ourhome/<service>`), a Google
Cloud external Load Balancer in front of the gateway.

## What's already set up on the GCP project

- Billing linked (`My Billing Account`).
- APIs enabled: `container`, `compute`, `cloudresourcemanager`, `iam`.
- `gcloud auth application-default login` (ADC) — what Terraform reads.
- Workload Identity Federation (service account `github-actions@…`) — what
  GitHub Actions uses to authenticate to GCP without a stored key.

## One-time setup

### 1. Provision the cluster (Terraform)

```
cd deploy/gcp
cp terraform.tfvars.example terraform.tfvars   # set project_id
terraform init
terraform plan      # review before applying
terraform apply
terraform output -raw configure_kubectl_command   # note the command
```

Then point kubectl at the cluster (as your own user, for the next step):

```
gcloud container clusters get-credentials ourhome-gke --zone us-central1-a --project <project-id>
kubectl get nodes
```

### 2. Grant the GitHub Actions service account cluster-admin RBAC

The WIF service account has project-level `container.developer`, but in-cluster
kubectl access needs a ClusterRoleBinding. Run once (as yourself, who is the
project owner and therefore already cluster-admin):

```
kubectl create clusterrolebinding github-actions-admin \
  --clusterrole=cluster-admin \
  --user=github-actions@<project-id>.iam.gserviceaccount.com
```

### 3. Configure GitHub repository variables + secrets

Repo: `ashok4224/ourhome` → Settings → Secrets and variables → Actions.

**Variables:**
| Name | Value |
|---|---|
| `WIF_PROVIDER` | `projects/<project-number>/locations/global/workloadIdentityPools/github-actions-pool/providers/github` |
| `WIF_SERVICE_ACCOUNT` | `github-actions@<project-id>.iam.gserviceaccount.com` |
| `GKE_CLUSTER` | `ourhome-gke` |
| `GKE_LOCATION` | `us-central1-a` |
| `GAR_LOCATION` | `us-central1` |
| `GCP_PROJECT` | `project-3cfee066-7cd7-4c90-baa` |

**Secrets** (these become the k8s `ourhome-secrets` at deploy time — never
committed to git):
| Name | Notes |
|---|---|
| `DATABASE_URL` | `postgresql://ourhome:<password>@postgres:5432/ourhome` |
| `JWT_SECRET` | random 64+ char string |
| `INTERNAL_SERVICE_TOKEN` | random string |
| `POSTGRES_PASSWORD` | the Postgres password (must match `DATABASE_URL`) |

### 4. Push the code

The CI workflow builds and pushes on every push to `main`/`microservices`:

```
git add .
git commit -m "Add GKE CI/CD pipeline"
git push origin microservices
```

CI builds all 8 images (`linux/amd64`) → GHCR. CD then runs automatically and
deploys to GKE. You can also trigger either workflow manually from the Actions
tab.

## One-time DB schema + seed (first deploy only)

```
kubectl port-forward svc/postgres -n ourhome 5432:5432
# second terminal, from repo root:
$env:DATABASE_URL = "postgresql://ourhome:<password>@localhost:5432/ourhome"
npx prisma db push
npx tsx prisma/seed.ts
```

## Verify

```
kubectl get pods -n ourhome          # all Running
kubectl get svc gateway -n ourhome   # EXTERNAL-IP = your public IP
curl http://<EXTERNAL-IP>/api/health
```

Log in with seeded demo accounts (`customer@ourhome.com` / `builder@ourhome.com`
/ `admin@ourhome.com`, password `ourhome123`).

## Image registry (Artifact Registry)

Images are pushed to Google Artifact Registry
(`us-central1-docker.pkg.dev/<project>/ourhome/<service>`). GKE nodes in the
same project pull from it natively via the `cloud-platform` scope — no
imagePullSecret required. The CI pipeline authenticates to Artifact Registry
via Workload Identity Federation (no stored keys).

For the **first deploy**, build the images directly with Cloud Build (no GitHub
Actions dependency):

```
gcloud builds submit --config=deploy/gcp/cloudbuild.yaml --region=us-central1 .
```

## Cost note

The GKE free tier covers **one zonal cluster's management fee** in
`us-central1`/`us-east1`/`us-west1`; node VMs are billed separately (e2-small is
Compute Engine free-tier eligible). You also have the $300 free-trial credit for
the first 90 days. Review the [GKE pricing](https://cloud.google.com/kubernetes-engine/pricing)
page and the GCP cost estimator before leaving it running long-term.

## Tearing down

```
kubectl delete namespace ourhome
cd deploy/gcp && terraform destroy
```

## Known follow-ups (not done here)

- **No TLS** — same as OCI: plain HTTP on a bare IP. Point a domain at the LB
  and add cert-manager + an Ingress for TLS.
- **In-cluster Postgres** (bare pod + PVC) matches the existing k8s baseline;
  real production would use managed Cloud SQL (as the earlier `deploy.ps1`
  attempted).
- **chat-service stays `replicas: 1`** — see `k8s/README.md` and
  `ARCHITECTURE.md`.
